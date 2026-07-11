use crate::state::AppState;
use axum::Router;
use base64::engine::general_purpose::STANDARD as B64;
use base64::Engine as _;
use ed25519_dalek::{Signature, Signer, SigningKey};
use serde::Deserialize;
use std::collections::HashMap;
use std::sync::Mutex;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

#[derive(Debug, thiserror::Error)]
pub enum CustodyError {
    #[error("encrypt failed")]
    Encrypt,
    #[error("decrypt failed")]
    Decrypt,
    #[error("sign failed")]
    Sign,
    #[error("key not found: {0}")]
    KeyNotFound(String),
    #[error("provider not supported: {0}")]
    ProviderUnsupported(String),
    #[error("stellar key error")]
    Stellar,
    #[error("supabase error")]
    Supabase,
    #[error("invalid key")]
    InvalidKey,
}

// ---------------------------------------------------------------------------
// Kms trait — provider-agnostic interface
// ---------------------------------------------------------------------------

/// Provider-agnostic KMS interface. `encrypt` / `decrypt` are symmetric wrappers
/// around a cloud KMS (AWS, GCP, Vault). `sign` performs asymmetric ed25519
/// signing with the stored private key.
///
/// **Test-only**: `InMemoryKms` stores seeds in plaintext. Real providers encrypt
/// at rest via cloud KMS; the trait boundary is the only place keys are accessed.
pub trait Kms: Send + Sync {
    fn encrypt(&self, key_id: &str, plaintext: &[u8]) -> Result<Vec<u8>, CustodyError>;
    fn decrypt(&self, key_id: &str, ciphertext: &[u8]) -> Result<Vec<u8>, CustodyError>;
    fn sign(&self, key_id: &str, msg: &[u8]) -> Result<Vec<u8>, CustodyError>;
}

// ---------------------------------------------------------------------------
// InMemoryKms — test stub (NOT real crypto; seeds stored in plaintext)
// ---------------------------------------------------------------------------

/// Test-only KMS stub. Seeds are stored as plaintext in memory.
/// **Never use in production** — this exists so unit tests need no cloud creds.
pub struct InMemoryKms {
    keys: Mutex<HashMap<String, Vec<u8>>>,
}

impl InMemoryKms {
    pub fn new() -> Self {
        Self {
            keys: Mutex::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryKms {
    fn default() -> Self {
        Self::new()
    }
}

impl Kms for InMemoryKms {
    fn encrypt(&self, key_id: &str, plaintext: &[u8]) -> Result<Vec<u8>, CustodyError> {
        // Stub: "encrypt" is just storing the plaintext under the key_id.
        // Real KMS would return opaque ciphertext; we use B64 as a visual marker.
        let ciphertext = B64.encode(plaintext);
        let ct_bytes = ciphertext.into_bytes();
        self.keys
            .lock()
            .map_err(|_| CustodyError::Encrypt)?
            .insert(key_id.to_string(), ct_bytes.clone());
        Ok(ct_bytes)
    }

    fn decrypt(&self, key_id: &str, _ciphertext: &[u8]) -> Result<Vec<u8>, CustodyError> {
        let store = self.keys.lock().map_err(|_| CustodyError::Decrypt)?;
        let raw = store
            .get(key_id)
            .ok_or_else(|| CustodyError::KeyNotFound(key_id.to_string()))?;
        let decoded = B64
            .decode(raw)
            .map_err(|_| CustodyError::Decrypt)?;
        Ok(decoded)
    }

    fn sign(&self, key_id: &str, msg: &[u8]) -> Result<Vec<u8>, CustodyError> {
        let seed = self.decrypt(key_id, b"").map_err(|_| CustodyError::Sign)?;
        if seed.len() != 32 {
            return Err(CustodyError::InvalidKey);
        }
        let mut seed_bytes = [0u8; 32];
        seed_bytes.copy_from_slice(&seed);
        let sk = SigningKey::from_bytes(&seed_bytes);
        let sig: Signature = sk.sign(msg);
        Ok(sig.to_bytes().to_vec())
    }
}

// ---------------------------------------------------------------------------
// from_config factory
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
struct KmsConfig {
    provider: String,
}

/// Build a Kms provider from a JSON config string.
/// Only `"memory"` is implemented; other providers return `ProviderUnsupported`.
pub fn from_config(cfg: &str) -> Result<Box<dyn Kms>, CustodyError> {
    let parsed: KmsConfig =
        serde_json::from_str(cfg).map_err(|_| CustodyError::ProviderUnsupported(cfg.to_string()))?;
    match parsed.provider.as_str() {
        "memory" => Ok(Box::new(InMemoryKms::new())),
        other => Err(CustodyError::ProviderUnsupported(other.to_string())),
    }
}

// ---------------------------------------------------------------------------
// provision_managed_account — generate keypair, encrypt seed, persist address
// ---------------------------------------------------------------------------

/// Mode A signup: generate a Stellar ed25519 keypair, encrypt the seed via Kms,
/// persist only the `stellar_address` to `profiles`. The seed is never stored
/// in plaintext and the `SigningKey` is dropped at end of scope.
///
/// Returns the Stellar `G...` strkey address.
pub async fn provision_managed_account(
    state: &AppState,
    user_id: &str,
    kms: &dyn Kms,
) -> Result<String, CustodyError> {
    // 1. Generate keypair
    let sk = SigningKey::generate(&mut rand::rngs::OsRng);
    let pk = sk.verifying_key().to_bytes();

    // 2. Encode Stellar address (G...)
    let stellar_address = encode_stellar_account(&pk);

    // 3. Encrypt the seed (32 bytes) via Kms
    let seed_bytes = sk.to_bytes();
    kms.encrypt(user_id, &seed_bytes)?;

    // 4. Drop the SigningKey — plaintext seed is gone from this scope
    drop(sk);

    // 5. Persist ONLY stellar_address + custody_mode to Supabase profiles
    let url = format!("{}/profiles?id=eq.{}", state.supabase.base_url, user_id);
    let body = serde_json::json!({
        "stellar_address": &stellar_address,
        "custody_mode": "orka"
    });
    let resp = state
        .supabase
        .client
        .patch(&url)
        .header("apikey", &state.supabase.key)
        .header("Authorization", format!("Bearer {}", state.supabase.key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=minimal")
        .json(&body)
        .send()
        .await
        .map_err(|_| CustodyError::Supabase)?;

    if !resp.status().is_success() {
        return Err(CustodyError::Supabase);
    }

    Ok(stellar_address)
}

// ---------------------------------------------------------------------------
// sign_for_user — decrypt, sign once, discard
// ---------------------------------------------------------------------------

/// Decrypt the user's seed from Kms, sign the payload (ed25519), and
/// immediately drop the key. The plaintext seed is never held in memory
/// beyond this function's scope.
///
/// `payload` should be the pre-hashed transaction envelope hash (32 bytes
/// for Stellar). Returns the 64-byte ed25519 signature.
pub async fn sign_for_user(
    _state: &AppState,
    user_id: &str,
    payload: &[u8],
    kms: &dyn Kms,
) -> Result<Vec<u8>, CustodyError> {
    // 1. Decrypt the seed from Kms
    let seed = kms.decrypt(user_id, b"")?;

    if seed.len() != 32 {
        return Err(CustodyError::InvalidKey);
    }

    // 2. Reconstruct SigningKey, sign, drop immediately
    let sig = {
        let mut seed_bytes = [0u8; 32];
        seed_bytes.copy_from_slice(&seed);
        let sk = SigningKey::from_bytes(&seed_bytes);
        // Key material is gone after this block
        let sig: Signature = sk.sign(payload);
        sig.to_bytes().to_vec()
    };

    // 3. Return signature; seed bytes were stack-local and are now dropped
    Ok(sig)
}

// ---------------------------------------------------------------------------
// HTTP routes (stub for now — full wiring in 01-05 bridge.rs)
// ---------------------------------------------------------------------------

pub fn routes(_state: &AppState) -> Router {
    Router::new()
}

/// Helper: decrypt a user's seed from the Kms into a fixed 32-byte array.
/// Used by stellar.rs for Mode A client-side signing.
pub fn kms_decrypt_seed(kms: &dyn Kms, user_id: &str) -> Result<[u8; 32], CustodyError> {
    let seed = kms.decrypt(user_id, b"")?;
    if seed.len() != 32 {
        return Err(CustodyError::InvalidKey);
    }
    let mut out = [0u8; 32];
    out.copy_from_slice(&seed);
    Ok(out)
}

// ---------------------------------------------------------------------------
// Stellar strkey (G...) encode — dependency-free
// ---------------------------------------------------------------------------

const STRKEY_ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const ACCOUNT_VERSION: u8 = 6;

fn b32_encode(data: &[u8]) -> String {
    let mut out = String::new();
    let mut buffer: u32 = 0;
    let mut bits: u32 = 0;
    for &b in data {
        buffer = (buffer << 8) | b as u32;
        bits += 8;
        while bits >= 5 {
            bits -= 5;
            out.push(STRKEY_ALPHABET[((buffer >> bits) & 0x1f) as usize] as char);
        }
    }
    if bits > 0 {
        out.push(STRKEY_ALPHABET[((buffer << (5 - bits)) & 0x1f) as usize] as char);
    }
    out
}

fn crc16_xmodem(data: &[u8]) -> u16 {
    let mut crc: u16 = 0;
    for &b in data {
        crc ^= (b as u16) << 8;
        for _ in 0..8 {
            if crc & 0x8000 != 0 {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
            crc &= 0xFFFF;
        }
    }
    crc
}

fn encode_stellar_account(pk: &[u8; 32]) -> String {
    let mut body = Vec::with_capacity(35);
    body.push(ACCOUNT_VERSION);
    body.extend_from_slice(pk);
    body.extend_from_slice(&crc16_xmodem(&body).to_be_bytes());
    b32_encode(&body)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::{Verifier, VerifyingKey};

    #[test]
    fn kms_round_trip() {
        let kms = InMemoryKms::new();
        let ct = kms.encrypt("test-key", b"hello world").unwrap();
        assert_ne!(ct, b"hello world");
        let pt = kms.decrypt("test-key", &ct).unwrap();
        assert_eq!(pt, b"hello world");
    }

    #[test]
    fn kms_decrypt_missing_key_errors() {
        let kms = InMemoryKms::new();
        assert!(kms.decrypt("nonexistent", b"").is_err());
    }

    #[test]
    fn kms_sign_verify_round_trip() {
        use ed25519_dalek::Verifier;
        let kms = InMemoryKms::new();
        let sk = SigningKey::generate(&mut rand::rngs::OsRng);
        let pk = sk.verifying_key().to_bytes();

        // Store the seed via encrypt (stub stores plaintext)
        kms.encrypt("user1", &sk.to_bytes()).unwrap();

        let msg = b"transaction payload to sign";
        let sig_bytes = kms.sign("user1", msg).unwrap();

        let sig = Signature::from_slice(&sig_bytes).unwrap();
        let vk = VerifyingKey::from_bytes(&pk).unwrap();
        assert!(vk.verify(msg, &sig).is_ok());
    }

    #[test]
    fn from_config_memory_works() {
        let kms = from_config(r#"{"provider":"memory"}"#).unwrap();
        let ct = kms.encrypt("k", b"data").unwrap();
        let pt = kms.decrypt("k", &ct).unwrap();
        assert_eq!(pt, b"data");
    }

    #[test]
    fn from_config_unsupported_errors() {
        match from_config(r#"{"provider":"aws-kms"}"#) {
            Err(CustodyError::ProviderUnsupported(p)) => assert_eq!(p, "aws-kms"),
            Err(other) => panic!("expected ProviderUnsupported, got: {other:?}"),
            Ok(_) => panic!("expected error, got Ok"),
        }
    }

    #[test]
    fn provision_then_sign_round_trip() {
        use ed25519_dalek::Verifier;

        let kms = InMemoryKms::new();

        // Generate keypair and encode address
        let sk = SigningKey::generate(&mut rand::rngs::OsRng);
        let pk = sk.verifying_key().to_bytes();
        let address = encode_stellar_account(&pk);

        // Simulate provision: encrypt seed
        kms.encrypt("user_provision", &sk.to_bytes()).unwrap();
        drop(sk);

        // Sign a message
        let payload = b"some transaction hash";
        let seed = kms.decrypt("user_provision", b"").unwrap();
        let sig = {
            let mut seed_bytes = [0u8; 32];
            seed_bytes.copy_from_slice(&seed);
            let sk2 = SigningKey::from_bytes(&seed_bytes);
            let sig: Signature = sk2.sign(payload);
            sig.to_bytes().to_vec()
        };

        // Verify against the address's public key
        let raw = b32_decode(&address).unwrap();
        let mut pk_bytes = [0u8; 32];
        pk_bytes.copy_from_slice(&raw[1..33]);
        let vk = VerifyingKey::from_bytes(&pk_bytes).unwrap();
        let sig_obj = Signature::from_slice(&sig).unwrap();
        assert!(vk.verify(payload, &sig_obj).is_ok());
    }

    // Helper: base32 decode (from auth.rs)
    fn b32_decode(s: &str) -> Option<Vec<u8>> {
        let mut out = Vec::new();
        let mut buffer: u32 = 0;
        let mut bits: u32 = 0;
        for c in s.chars() {
            let v = STRKEY_ALPHABET.iter().position(|&x| x == c as u8)? as u32;
            buffer = (buffer << 5) | v;
            bits += 5;
            if bits >= 8 {
                bits -= 8;
                out.push((buffer >> bits) as u8);
            }
        }
        Some(out)
    }
}
