use crate::state::AppState;
use axum::{routing::get, Router};
use tower_http::cors::CorsLayer;

/// Build the full application router.
///
/// Merges the public `/health` route with each feature module's routes, then
/// applies a permissive CORS layer (tighten before prod). Shared `AppState` is
/// threaded into each module's `routes(&state)` so future handlers can capture
/// it; once handlers use the `State<AppState>` extractor this will move to
/// `Router::with_state(...)`.
pub fn build_router(state: AppState) -> Router {
    Router::new()
        .route("/health", get(health))
        .merge(crate::auth::routes(&state))
        .merge(crate::custody::routes(&state))
        .merge(crate::stellar::routes(&state))
        .merge(crate::bridge::routes(&state))
        .layer(CorsLayer::permissive())
}

async fn health() -> &'static str {
    "ok"
}
