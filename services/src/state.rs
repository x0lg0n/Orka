use crate::config::Config;
use reqwest::Client;
use std::sync::Arc;

/// Thin Supabase REST client handle (base URL + service-role key).
///
/// Actual row upserts/query building live in `bridge.rs`; this struct only
/// carries the configured `reqwest::Client` and the auth headers so multiple
/// modules can share one HTTP client.
#[derive(Clone)]
pub struct Supabase {
    pub client: Client,
    pub base_url: String,
    pub key: String,
}

impl Supabase {
    pub fn from_config(c: &Config) -> Self {
        let base = c.supabase_url.trim_end_matches('/').to_string();
        Self {
            client: Client::new(),
            base_url: format!("{base}/rest/v1"),
            key: c.supabase_service_role_key.clone(),
        }
    }
}

/// Shared application state, passed to every handler via Axum's `State`.
#[derive(Clone)]
pub struct AppState {
    pub config: Config,
    pub http: Client,
    pub supabase: Supabase,
    pub kms: Arc<dyn crate::custody::Kms + Send + Sync>,
}

impl AppState {
    pub fn new(config: Config) -> Self {
        let http = Client::new();
        let supabase = Supabase::from_config(&config);
        let kms: Arc<dyn crate::custody::Kms + Send + Sync> =
            Arc::new(crate::custody::InMemoryKms::new());
        Self {
            config,
            http,
            supabase,
            kms,
        }
    }
}
