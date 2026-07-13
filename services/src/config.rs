use crate::stellar::decode_secret_seed;
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
    pub operator_address: String,
    pub kms_config: String,
    pub supabase_url: String,
    pub supabase_service_role_key: String,
    pub port: u16,
    pub sequence: i64,
    pub escrow_factory_address: String,
    pub escrow_wasm_hash: String,
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
            operator_address: env_or(
                "ORKA_OPERATOR_ADDRESS",
                "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABOBBVV",
            ),
            kms_config: env_or("KMS_CONFIG", "{}"),
            supabase_url: env_or("SUPABASE_URL", "http://localhost:54321"),
            supabase_service_role_key: env_or("SUPABASE_SERVICE_ROLE_KEY", "test-service-role"),
            port: std::env::var("PORT")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(3000),
            sequence: 0,
            escrow_factory_address: env_or("ORKA_ESCROW_FACTORY_ADDRESS", ""),
            escrow_wasm_hash: env_or("ORKA_ESCROW_WASM_HASH", ""),
        })
    }
}

impl Config {
    /// Network passphrase for XDR transaction hashing.
    pub fn network_passphrase(&self) -> String {
        match self.stellar_network.as_str() {
            "mainnet" => "Public Global Stellar Network ; September 2015".to_string(),
            "testnet" => "Test SDF Network ; September 2015".to_string(),
            other => other.to_string(),
        }
    }

    /// Decode the operator secret seed (`S...` strkey or 32-byte hex) to raw bytes.
    pub fn operator_seed_bytes(&self) -> [u8; 32] {
        // strkey S... seed (manual decode — no stellar-strkey dependency).
        if !self.orka_operator_secret.is_empty() {
            if let Ok(seed) = decode_secret_seed(&self.orka_operator_secret) {
                return seed;
            }
        }
        // 32-byte hex fallback
        if self.orka_operator_secret.len() == 64 {
            if let Ok(bytes) = hex_decode(&self.orka_operator_secret) {
                if bytes.len() == 32 {
                    let mut arr = [0u8; 32];
                    arr.copy_from_slice(&bytes);
                    return arr;
                }
            }
        }
        [0u8; 32]
    }
}

/// Minimal hex decoder (no external dep).
fn hex_decode(s: &str) -> Result<Vec<u8>, ()> {
    let bytes = s.as_bytes();
    if bytes.len() % 2 != 0 {
        return Err(());
    }
    let mut out = Vec::with_capacity(bytes.len() / 2);
    let mut i = 0;
    while i < bytes.len() {
        let hi = (bytes[i] as char).to_digit(16).ok_or(())?;
        let lo = (bytes[i + 1] as char).to_digit(16).ok_or(())?;
        out.push((hi * 16 + lo) as u8);
        i += 2;
    }
    Ok(out)
}
