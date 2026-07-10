use crate::state::AppState;
use axum::Router;

/// Stub routes — replaced by Plan 01-04 (Stellar SDK client + fee_bump).
pub fn routes(_state: &AppState) -> Router {
    Router::new()
}
