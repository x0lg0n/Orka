use crate::state::AppState;
use axum::Router;

/// Stub routes — replaced by Plan 01-02 (auth + custody-mode enforcement).
pub fn routes(_state: &AppState) -> Router {
    Router::new()
}
