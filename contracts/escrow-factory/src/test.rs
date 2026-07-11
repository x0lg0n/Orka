#![cfg(test)]
extern crate std;

use soroban_sdk::{
    testutils::Address as _,
    Address, Bytes, Env, Vec,
};

use escrow::EscrowClient;
use crate::{EscrowFactory, EscrowFactoryClient};

#[test]
fn create_escrow_returns_instance() {
    let env = Env::default();
    env.mock_all_auths();

    let wasm = include_bytes!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../target/wasm32v1-none/release/orka_escrow.wasm"
    ));
    let wasm_bytes = Bytes::from_slice(&env, wasm);
    let wasm_hash = env.deployer().upload_contract_wasm(wasm_bytes);

    let operator = Address::generate(&env);
    let factory = env.register(EscrowFactory, ());
    EscrowFactoryClient::new(&env, &factory).initialize(&operator, &wasm_hash);

    let org = Bytes::from_array(&env, b"orka-org");
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let asset = Address::generate(&env);
    let milestones: Vec<escrow::MilestoneInit> = Vec::new(&env);

    let inst = EscrowFactoryClient::new(&env, &factory).create_escrow(
        &org,
        &client,
        &freelancer,
        &asset,
        &operator,
        &milestones,
        &None,
    );

    assert!(inst != factory);

    // Prove the deployed instance is initialized: calling initialize again on it
    // must fail with AlreadyInitialized (returned as Err from the escrow client).
    let again = EscrowClient::new(&env, &inst)
        .try_initialize(&org, &client, &freelancer, &asset, &operator, &milestones, &None);
    assert!(again.is_err());
}
