use crate::state::AppState;
use axum::Router;

/// Stub routes — replaced by Plan 01-05 (applyChainEvent reconciler).
pub fn routes(_state: &AppState) -> Router {
    Router::new()
}
