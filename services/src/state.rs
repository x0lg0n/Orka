use crate::config::Config;
use reqwest::Client;

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
}

impl AppState {
    pub fn new(config: Config) -> Self {
        let http = Client::new();
        let supabase = Supabase::from_config(&config);
        Self {
            config,
            http,
            supabase,
        }
    }
}
