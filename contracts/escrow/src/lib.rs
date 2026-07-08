#![no_std]

mod errors;
#[cfg(test)]
mod test;
mod types;

use soroban_sdk::token::TokenClient;
use soroban_sdk::{contract, contractimpl, contracttype, Address, Bytes, Env, Map, Vec};

use errors::EscrowError;
use types::{Config, DisputeRules, Milestone, MilestoneInit, MilestoneStatus, Milestones};

#[contracttype]
pub enum DataKey {
    Config,
    Milestones,
}

#[contract]
pub struct EscrowContract;

fn get_config(env: &Env) -> Config {
    env.storage().instance().get(&DataKey::Config).unwrap()
}

fn get_milestones(env: &Env) -> Milestones {
    env.storage().instance().get(&DataKey::Milestones).unwrap()
}

fn set_milestones(env: &Env, ms: &Milestones) {
    env.storage().instance().set(&DataKey::Milestones, ms);
}

fn transfer(env: &Env, from: &Address, to: &Address, amount: &i128) {
    TokenClient::new(env, &get_config(env).asset).transfer(from, to, amount);
}

#[contractimpl]
impl EscrowContract {
    pub fn initialize(
        env: Env,
        org: Bytes,
        client: Address,
        freelancer: Address,
        asset: Address,
        operator: Address,
        milestones: Vec<MilestoneInit>,
        dispute_rules: Option<DisputeRules>,
    ) -> Result<Address, EscrowError> {
        if env.storage().instance().has(&DataKey::Config) {
            return Err(EscrowError::AlreadyInitialized);
        }
        let mut ms: Milestones = Map::new(&env);
        let mut id: u64 = 0;
        for m in milestones.iter() {
            ms.set(
                id,
                Milestone {
                    amount: m.amount,
                    status: MilestoneStatus::Draft,
                },
            );
            id += 1;
        }
        let config = Config {
            org,
            client,
            freelancer,
            asset,
            operator,
            dispute_rules,
        };
        env.storage().instance().set(&DataKey::Config, &config);
        env.storage().instance().set(&DataKey::Milestones, &ms);
        Ok(env.current_contract_address())
    }

    pub fn fund(env: Env, milestone_ids: Vec<u64>) -> Result<(), EscrowError> {
        let config = get_config(&env);
        config.client.require_auth();
        let mut ms = get_milestones(&env);
        let mut total: i128 = 0;
        for id in milestone_ids.iter() {
            let mut m = ms.get(id).ok_or(EscrowError::MilestoneNotFound)?;
            if m.status != MilestoneStatus::Draft {
                return Err(EscrowError::InvalidState);
            }
            total += m.amount;
            m.status = MilestoneStatus::Funded;
            ms.set(id, m);
        }
        transfer(
            &env,
            &config.client,
            &env.current_contract_address(),
            &total,
        );
        set_milestones(&env, &ms);
        Ok(())
    }

    pub fn submit(env: Env, milestone_id: u64) -> Result<(), EscrowError> {
        let config = get_config(&env);
        config.freelancer.require_auth();
        let mut ms = get_milestones(&env);
        let mut m = ms.get(milestone_id).ok_or(EscrowError::MilestoneNotFound)?;
        if m.status != MilestoneStatus::Funded && m.status != MilestoneStatus::Rejected {
            return Err(EscrowError::InvalidState);
        }
        m.status = MilestoneStatus::Submitted;
        ms.set(milestone_id, m);
        set_milestones(&env, &ms);
        Ok(())
    }

    pub fn reject(env: Env, milestone_id: u64) -> Result<(), EscrowError> {
        let config = get_config(&env);
        config.client.require_auth();
        let mut ms = get_milestones(&env);
        let mut m = ms.get(milestone_id).ok_or(EscrowError::MilestoneNotFound)?;
        if m.status != MilestoneStatus::Submitted {
            return Err(EscrowError::InvalidState);
        }
        m.status = MilestoneStatus::Rejected;
        ms.set(milestone_id, m);
        set_milestones(&env, &ms);
        Ok(())
    }

    pub fn approve(env: Env, milestone_id: u64) -> Result<(), EscrowError> {
        let config = get_config(&env);
        config.client.require_auth();
        let mut ms = get_milestones(&env);
        let mut m = ms.get(milestone_id).ok_or(EscrowError::MilestoneNotFound)?;
        if m.status != MilestoneStatus::Submitted {
            return Err(EscrowError::InvalidState);
        }
        m.status = MilestoneStatus::Approved;
        ms.set(milestone_id, m);
        set_milestones(&env, &ms);
        Ok(())
    }

    pub fn refund(env: Env, milestone_id: u64) -> Result<(), EscrowError> {
        let config = get_config(&env);
        config.client.require_auth();
        let mut ms = get_milestones(&env);
        let mut m = ms.get(milestone_id).ok_or(EscrowError::MilestoneNotFound)?;
        match m.status {
            MilestoneStatus::Funded
            | MilestoneStatus::Submitted
            | MilestoneStatus::Rejected
            | MilestoneStatus::Approved => {}
            _ => return Err(EscrowError::InvalidState),
        }
        transfer(
            &env,
            &env.current_contract_address(),
            &config.client,
            &m.amount,
        );
        m.status = MilestoneStatus::Refunded;
        ms.set(milestone_id, m);
        set_milestones(&env, &ms);
        Ok(())
    }

    pub fn open_dispute(env: Env, caller: Address, milestone_id: u64) -> Result<(), EscrowError> {
        let config = get_config(&env);
        caller.require_auth();
        if caller != config.client && caller != config.freelancer {
            return Err(EscrowError::NotAuthorized);
        }
        let mut ms = get_milestones(&env);
        let mut m = ms.get(milestone_id).ok_or(EscrowError::MilestoneNotFound)?;
        match m.status {
            MilestoneStatus::Submitted | MilestoneStatus::Approved | MilestoneStatus::Rejected => {}
            _ => return Err(EscrowError::InvalidState),
        }
        m.status = MilestoneStatus::Disputed;
        ms.set(milestone_id, m);
        set_milestones(&env, &ms);
        Ok(())
    }

    pub fn release_funds(env: Env, milestone_id: u64) -> Result<(), EscrowError> {
        let config = get_config(&env);
        config.client.require_auth();
        config.operator.require_auth();
        let mut ms = get_milestones(&env);
        let mut m = ms.get(milestone_id).ok_or(EscrowError::MilestoneNotFound)?;
        if m.status != MilestoneStatus::Approved {
            return Err(EscrowError::InvalidState);
        }
        transfer(
            &env,
            &env.current_contract_address(),
            &config.freelancer,
            &m.amount,
        );
        m.status = MilestoneStatus::Released;
        ms.set(milestone_id, m);
        set_milestones(&env, &ms);
        Ok(())
    }

    pub fn resolve_dispute(
        env: Env,
        milestone_id: u64,
        split_bp: Option<u32>,
    ) -> Result<(), EscrowError> {
        let config = get_config(&env);
        config.operator.require_auth();
        let mut ms = get_milestones(&env);
        let mut m = ms.get(milestone_id).ok_or(EscrowError::MilestoneNotFound)?;
        if m.status != MilestoneStatus::Disputed {
            return Err(EscrowError::InvalidState);
        }
        let bp = match split_bp {
            Some(bp) => {
                if bp > 10000 {
                    return Err(EscrowError::InvalidSplitBp);
                }
                bp
            }
            None => config.dispute_rules.ok_or(EscrowError::NoDisputeRule)?,
        };
        let to_freelancer = m.amount * (bp as i128) / 10000;
        let to_client = m.amount - to_freelancer;
        let contract_addr = env.current_contract_address();
        if to_freelancer > 0 {
            transfer(&env, &contract_addr, &config.freelancer, &to_freelancer);
        }
        if to_client > 0 {
            transfer(&env, &contract_addr, &config.client, &to_client);
        }
        m.status = MilestoneStatus::Released;
        ms.set(milestone_id, m);
        set_milestones(&env, &ms);
        Ok(())
    }
}
