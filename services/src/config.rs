use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("missing environment variable: {0}")]
    MissingEnv(String),
    #[error("config error: {0}")]
    Other(String),
}

/// Runtime configuration for the ORKA services backend.
///
/// All values are sourced from the environment (with `.env` auto-loaded via
/// `dotenvy`). Every field has a safe default so the process never panics at
/// startup when running locally or under test; production deployments are
/// expected to supply real values.
#[derive(Clone, Debug)]
pub struct Config {
    pub stellar_rpc_url: String,
    pub stellar_network: String,
    pub orka_operator_secret: String,
    pub kms_config: String,
    pub supabase_url: String,
    pub supabase_service_role_key: String,
    pub port: u16,
}

impl Config {
    /// Load configuration from the process environment.
    ///
    /// Never fails: any missing variable falls back to a sensible default so
    /// `cargo test` and local boots work without a populated `.env`.
    pub fn from_env() -> Result<Config, Error> {
        dotenvy::dotenv().ok();
        let env_or = |k: &str, d: &str| std::env::var(k).unwrap_or_else(|_| d.to_string());
        Ok(Config {
            stellar_rpc_url: env_or(
                "STELLAR_RPC_URL",
                "https://soroban-testnet.stellar.org",
            ),
            stellar_network: env_or("STELLAR_NETWORK", "testnet"),
            orka_operator_secret: env_or("ORKA_OPERATOR_SECRET", ""),
            kms_config: env_or("KMS_CONFIG", "{}"),
            supabase_url: env_or("SUPABASE_URL", "http://localhost:54321"),
            supabase_service_role_key: env_or("SUPABASE_SERVICE_ROLE_KEY", "test-service-role"),
            port: std::env::var("PORT")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(3000),
        })
    }
}
