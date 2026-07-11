#![no_std]

#[cfg(test)]
mod test;

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Bytes, BytesN, Env, Symbol, Vec,
};
use escrow::{DisputeRules, EscrowClient, MilestoneInit};

#[contracttype]
pub enum DataKey {
    Operator,
    Wasm,
}

#[contract]
pub struct EscrowFactory;

#[contractimpl]
impl EscrowFactory {
    pub fn initialize(env: Env, operator: Address, wasm_hash: BytesN<32>) {
        env.storage()
            .instance()
            .set(&DataKey::Operator, &operator);
        env.storage().instance().set(&DataKey::Wasm, &wasm_hash);
    }

    pub fn create_escrow(
        env: Env,
        org: Bytes,
        client: Address,
        freelancer: Address,
        asset: Address,
        operator: Address,
        milestones: Vec<MilestoneInit>,
        dispute_rules: Option<DisputeRules>,
    ) -> Address {
        let wasm_hash: BytesN<32> = env
            .storage()
            .instance()
            .get(&DataKey::Wasm)
            .unwrap();
        let salt = env.prng().gen::<BytesN<32>>();
        let addr: Address = env
            .deployer()
            .with_current_contract(salt)
            .deploy(wasm_hash);
        let escrow_client = EscrowClient::new(&env, &addr);
        escrow_client.initialize(
            &org,
            &client,
            &freelancer,
            &asset,
            &operator,
            &milestones,
            &dispute_rules,
        );
        env.events().publish(
            (Symbol::new(&env, "orka"), Symbol::new(&env, "initialize")),
            addr.clone(),
        );
        addr
    }
}
