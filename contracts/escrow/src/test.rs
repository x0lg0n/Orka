#![cfg(test)]
extern crate std;

use soroban_sdk::testutils::{Events, MockAuth, MockAuthInvoke};
use soroban_sdk::{
    testutils::Address as _,
    token::{StellarAssetClient, TokenClient},
    xdr, Address, Bytes, Env, IntoVal, Map, Symbol, TryIntoVal, Val, Vec,
};

/// Returns the `(milestone_index, amount)` data of the first `orka` event
/// whose second topic symbol equals `event`, searching all published events.
fn find_orka_event(
    env: &Env,
    event: &str,
) -> Option<(u64, i128)> {
    for e in env.events().all().events() {
        let v0 = match &e.body {
            xdr::ContractEventBody::V0(v0) => v0,
            _ => continue,
        };
        let s0: Option<Symbol> = v0
            .topics
            .get(0)
            .cloned()
            .and_then(|t| t.try_into_val(env).ok());
        let s1: Option<Symbol> = v0
            .topics
            .get(1)
            .cloned()
            .and_then(|t| t.try_into_val(env).ok());
        if s0 == Some(Symbol::new(env, "orka")) && s1 == Some(Symbol::new(env, event)) {
            let data_val: Val = match v0.data.clone().try_into_val(env) {
                Ok(v) => v,
                Err(_) => continue,
            };
            let data_vec: Vec<Val> = match data_val.try_into_val(env) {
                Ok(v) => v,
                Err(_) => continue,
            };
            let idx: u64 = match data_vec.get(0).and_then(|v| v.try_into_val(env).ok()) {
                Some(v) => v,
                None => continue,
            };
            let amount: i128 = match data_vec.get(1).and_then(|v| v.try_into_val(env).ok()) {
                Some(v) => v,
                None => continue,
            };
            return Some((idx, amount));
        }
    }
    None
}

use crate::{
    errors::EscrowError,
    types::{DisputeRules, Milestone, MilestoneInit, MilestoneStatus},
    DataKey, EscrowContract, EscrowContractClient,
};

fn setup<'a>() -> (
    Env,
    Address,
    EscrowContractClient<'a>,
    Address,
    Address,
    Address,
    Address,
) {
    let env = Env::default();
    let admin = Address::generate(&env);
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let operator = Address::generate(&env);
    let usdc = env
        .register_stellar_asset_contract_v2(admin.clone())
        .address();
    let addr = env.register(EscrowContract, ());
    let contract = EscrowContractClient::new(&env, &addr);
    (env, usdc, contract, client, freelancer, operator, admin)
}

#[test]
fn initialize_stores_config_and_returns_address() {
    let (env, _usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    let returned = contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &_usdc,
        &operator,
        &ms,
        &None,
    );
    assert_eq!(returned, contract.address);
}

#[test]
fn initialize_rejects_double_init() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    let res = contract.try_initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    assert_eq!(res, Err(Ok(EscrowError::AlreadyInitialized)));
}

#[test]
fn fund_locks_usdc_in_contract() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    let contract_addr = contract.address.clone();
    let client_before = TokenClient::new(&env, &usdc).balance(&client);
    contract.fund(&Vec::from_array(&env, [0u64]));
    let client_after = TokenClient::new(&env, &usdc).balance(&client);
    let contract_bal = TokenClient::new(&env, &usdc).balance(&contract_addr);
    assert_eq!(client_before - client_after, 1000);
    assert_eq!(contract_bal, 1000);
}

#[test]
fn submit_marks_funded_as_submitted() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    contract.submit(&0);
    let ms_map: Map<u64, Milestone> = env.as_contract(&contract.address, || {
        env.storage().instance().get(&DataKey::Milestones).unwrap()
    });
    assert_eq!(ms_map.get(0).unwrap().status, MilestoneStatus::Submitted);
}

#[test]
fn reject_then_resubmit() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    contract.submit(&0);
    contract.reject(&0);
    contract.submit(&0);
    let ms_map: Map<u64, Milestone> = env.as_contract(&contract.address, || {
        env.storage().instance().get(&DataKey::Milestones).unwrap()
    });
    assert_eq!(ms_map.get(0).unwrap().status, MilestoneStatus::Submitted);
}

#[test]
fn approve_is_intent_only_no_transfer() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    contract.submit(&0);
    let freelancer_before = TokenClient::new(&env, &usdc).balance(&freelancer);
    contract.approve(&0);
    let freelancer_after = TokenClient::new(&env, &usdc).balance(&freelancer);
    assert_eq!(freelancer_before, freelancer_after);
    let ms_map: Map<u64, Milestone> = env.as_contract(&contract.address, || {
        env.storage().instance().get(&DataKey::Milestones).unwrap()
    });
    assert_eq!(ms_map.get(0).unwrap().status, MilestoneStatus::Approved);
}

#[test]
fn refund_returns_full_amount_to_client() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    let client_before = TokenClient::new(&env, &usdc).balance(&client);
    contract.refund(&0);
    let client_after = TokenClient::new(&env, &usdc).balance(&client);
    assert_eq!(client_after - client_before, 1000);
    let ms_map: Map<u64, Milestone> = env.as_contract(&contract.address, || {
        env.storage().instance().get(&DataKey::Milestones).unwrap()
    });
    assert_eq!(ms_map.get(0).unwrap().status, MilestoneStatus::Refunded);
}

#[test]
fn open_dispute_by_client_freezes_milestone() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    contract.submit(&0);
    contract.open_dispute(&client, &0);
    let ms_map: Map<u64, Milestone> = env.as_contract(&contract.address, || {
        env.storage().instance().get(&DataKey::Milestones).unwrap()
    });
    assert_eq!(ms_map.get(0).unwrap().status, MilestoneStatus::Disputed);
}

#[test]
fn open_dispute_rejects_unauthorized_party() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    let stranger = Address::generate(&env);
    let res = contract.try_open_dispute(&stranger, &0);
    assert_eq!(res, Err(Ok(EscrowError::NotAuthorized)));
}

#[test]
#[should_panic]
fn release_funds_fails_without_operator() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    contract.submit(&0);
    contract.approve(&0);
    env.mock_auths(&[MockAuth {
        address: &client,
        invoke: &MockAuthInvoke {
            contract: &contract.address,
            fn_name: "release_funds",
            args: Vec::from_array(&env, [0u64.into_val(&env)]),
            sub_invokes: &[],
        },
    }]);
    contract.release_funds(&0);
}

#[test]
fn release_funds_multi_sig_pays_freelancer() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    contract.submit(&0);
    contract.approve(&0);
    let freelancer_before = TokenClient::new(&env, &usdc).balance(&freelancer);
    env.mock_auths(&[
        MockAuth {
            address: &client,
            invoke: &MockAuthInvoke {
                contract: &contract.address,
                fn_name: "release_funds",
                args: Vec::from_array(&env, [0u64.into_val(&env)]),
                sub_invokes: &[],
            },
        },
        MockAuth {
            address: &operator,
            invoke: &MockAuthInvoke {
                contract: &contract.address,
                fn_name: "release_funds",
                args: Vec::from_array(&env, [0u64.into_val(&env)]),
                sub_invokes: &[],
            },
        },
    ]);
    contract.release_funds(&0);
    let freelancer_after = TokenClient::new(&env, &usdc).balance(&freelancer);
    assert_eq!(freelancer_after - freelancer_before, 1000);
    let ms_map: Map<u64, Milestone> = env.as_contract(&contract.address, || {
        env.storage().instance().get(&DataKey::Milestones).unwrap()
    });
    assert_eq!(ms_map.get(0).unwrap().status, MilestoneStatus::Released);
}

#[test]
fn resolve_dispute_arbiter_override_split() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    contract.submit(&0);
    contract.open_dispute(&client, &0);
    let fl_before = TokenClient::new(&env, &usdc).balance(&freelancer);
    let cl_before = TokenClient::new(&env, &usdc).balance(&client);
    contract.resolve_dispute(&0, &Some(7000));
    let fl_after = TokenClient::new(&env, &usdc).balance(&freelancer);
    let cl_after = TokenClient::new(&env, &usdc).balance(&client);
    assert_eq!(fl_after - fl_before, 700);
    assert_eq!(cl_after - cl_before, 300);
}

#[test]
fn resolve_dispute_uses_pre_agreed_default() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    let rules: Option<DisputeRules> = Some(5000);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &rules,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    contract.submit(&0);
    contract.open_dispute(&client, &0);
    let fl_before = TokenClient::new(&env, &usdc).balance(&freelancer);
    let cl_before = TokenClient::new(&env, &usdc).balance(&client);
    contract.resolve_dispute(&0, &None);
    let fl_after = TokenClient::new(&env, &usdc).balance(&freelancer);
    let cl_after = TokenClient::new(&env, &usdc).balance(&client);
    assert_eq!(fl_after - fl_before, 500);
    assert_eq!(cl_after - cl_before, 500);
}

#[test]
fn resolve_dispute_none_without_rules_errors() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    contract.submit(&0);
    contract.open_dispute(&client, &0);
    let res = contract.try_resolve_dispute(&0, &None);
    assert_eq!(res, Err(Ok(EscrowError::NoDisputeRule)));
}

#[test]
fn released_milestone_rejects_further_actions() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    contract.submit(&0);
    contract.approve(&0);
    env.mock_auths(&[
        MockAuth {
            address: &client,
            invoke: &MockAuthInvoke {
                contract: &contract.address,
                fn_name: "release_funds",
                args: Vec::from_array(&env, [0u64.into_val(&env)]),
                sub_invokes: &[],
            },
        },
        MockAuth {
            address: &operator,
            invoke: &MockAuthInvoke {
                contract: &contract.address,
                fn_name: "release_funds",
                args: Vec::from_array(&env, [0u64.into_val(&env)]),
                sub_invokes: &[],
            },
        },
    ]);
    contract.release_funds(&0);
    env.mock_all_auths();
    assert_eq!(contract.try_submit(&0), Err(Ok(EscrowError::InvalidState)));
    assert_eq!(contract.try_approve(&0), Err(Ok(EscrowError::InvalidState)));
    assert_eq!(contract.try_refund(&0), Err(Ok(EscrowError::InvalidState)));
    assert_eq!(
        contract.try_release_funds(&0),
        Err(Ok(EscrowError::InvalidState))
    );
}

#[test]
fn initialize_emits_orka_event() {
    let (env, _usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &_usdc,
        &operator,
        &ms,
        &None,
    );
    let data = find_orka_event(&env, "initialize");
    assert_eq!(data, Some((0, 1000)));
}

#[test]
fn fund_emits_orka_event() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    let data = find_orka_event(&env, "fund");
    assert_eq!(data, Some((0, 1000)));
}

#[test]
fn submit_emits_orka_event() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    contract.submit(&0);
    let data = find_orka_event(&env, "submit");
    assert_eq!(data, Some((0, 1000)));
}

#[test]
fn reject_emits_orka_event() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    contract.submit(&0);
    contract.reject(&0);
    let data = find_orka_event(&env, "reject");
    assert_eq!(data, Some((0, 1000)));
}

#[test]
fn approve_emits_orka_event() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    contract.submit(&0);
    contract.approve(&0);
    let data = find_orka_event(&env, "approve");
    assert_eq!(data, Some((0, 1000)));
}

#[test]
fn refund_emits_orka_event() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    contract.refund(&0);
    let data = find_orka_event(&env, "refund");
    assert_eq!(data, Some((0, 1000)));
}

#[test]
fn open_dispute_emits_orka_event() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    contract.submit(&0);
    contract.open_dispute(&client, &0);
    let data = find_orka_event(&env, "dispute");
    assert_eq!(data, Some((0, 1000)));
}

#[test]
fn release_funds_emits_orka_event() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    contract.submit(&0);
    contract.approve(&0);
    env.mock_auths(&[
        MockAuth {
            address: &client,
            invoke: &MockAuthInvoke {
                contract: &contract.address,
                fn_name: "release_funds",
                args: Vec::from_array(&env, [0u64.into_val(&env)]),
                sub_invokes: &[],
            },
        },
        MockAuth {
            address: &operator,
            invoke: &MockAuthInvoke {
                contract: &contract.address,
                fn_name: "release_funds",
                args: Vec::from_array(&env, [0u64.into_val(&env)]),
                sub_invokes: &[],
            },
        },
    ]);
    contract.release_funds(&0);
    let data = find_orka_event(&env, "release");
    assert_eq!(data, Some((0, 1000)));
}

#[test]
fn resolve_dispute_emits_orka_event() {
    let (env, usdc, contract, client, freelancer, operator, _admin) = setup();
    env.mock_all_auths();
    let ms = Vec::from_array(&env, [MilestoneInit { amount: 1000 }]);
    contract.initialize(
        &Bytes::new(&env),
        &client,
        &freelancer,
        &usdc,
        &operator,
        &ms,
        &None,
    );
    StellarAssetClient::new(&env, &usdc).mint(&client, &1000);
    contract.fund(&Vec::from_array(&env, [0u64]));
    contract.submit(&0);
    contract.open_dispute(&client, &0);
    contract.resolve_dispute(&0, &Some(7000));
    let data = find_orka_event(&env, "resolve");
    assert_eq!(data, Some((0, 1000)));
}
