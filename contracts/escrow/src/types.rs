use soroban_sdk::{contracttype, Address, Bytes, Map};

#[contracttype]
#[derive(Clone, PartialEq, Eq, Debug)]
pub struct Config {
    pub org: Bytes,
    pub client: Address,
    pub freelancer: Address,
    pub asset: Address,
    pub operator: Address,
    pub dispute_rules: Option<u32>,
}

pub type DisputeRules = u32;

#[contracttype]
#[derive(Clone, PartialEq, Eq, Debug)]
pub struct Milestone {
    pub amount: i128,
    pub status: MilestoneStatus,
}

#[contracttype]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct MilestoneInit {
    pub amount: i128,
}

#[contracttype]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum MilestoneStatus {
    Draft,
    Funded,
    Submitted,
    Approved,
    Rejected,
    Refunded,
    Disputed,
    Released,
}

pub type Milestones = Map<u64, Milestone>;
