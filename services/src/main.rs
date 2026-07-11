pub mod auth;
pub mod bridge;
pub mod config;
pub mod custody;
pub mod indexer;
pub mod router;
pub mod state;
pub mod stellar;

use crate::config::Config;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info".into()),
        )
        .init();

    let config = Config::from_env()?;
    let state = state::AppState::new(config);
    indexer::start_indexer(state.clone());
    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], state.config.port));
    let listener = tokio::net::TcpListener::bind(addr).await?;
    tracing::info!("orka-services listening on http://{addr}");
    axum::serve(listener, router::build_router(state)).await?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn config_parses_with_defaults() {
        let c = Config::from_env().expect("config must parse with defaults");
        assert!(!c.stellar_network.is_empty());
        assert!(c.port > 0);
    }
}
