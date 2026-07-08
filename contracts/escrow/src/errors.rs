use soroban_sdk::contracterror;

#[contracterror]
#[repr(i32)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EscrowError {
    AlreadyInitialized = 1,
    NotAuthorized = 2,
    MilestoneNotFound = 3,
    InvalidState = 4,
    TransferFailed = 5,
    InvalidSplitBp = 6,
    NoDisputeRule = 7,
}
