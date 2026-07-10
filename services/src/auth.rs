use crate::state::AppState;
use axum::{routing::post, Json, Router};
use base64::engine::general_purpose::STANDARD as B64;
use base64::Engine as _;
use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::sync::{Mutex, OnceLock};
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CustodyMode {
    Orka,
    Freighter,
}

impl CustodyMode {
    /// Map a Postgres `custody_mode` value to the enum.
    pub fn from_db(s: Option<&str>) -> Option<Self> {
        match s {
            Some("orka") => Some(Self::Orka),
            Some("freighter") => Some(Self::Freighter),
            _ => None,
        }
    }
}

impl std::fmt::Display for CustodyMode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CustodyMode::Orka => write!(f, "orka"),
            CustodyMode::Freighter => write!(f, "freighter"),
        }
    }
}

#[derive(Debug, thiserror::Error)]
pub enum AuthError {
    #[error("invalid token")]
    InvalidToken,
    #[error("expired token")]
    ExpiredToken,
    #[error("jwks fetch failed")]
    JwksFetch,
    #[error("wrong custody mode")]
    WrongMode,
    #[error("profile missing")]
    ProfileMissing,
    #[error("supabase error")]
    Supabase,
}

/// Identity established after a successful auth check.
#[derive(Clone, Debug, Serialize)]
pub struct AuthenticatedUser {
    pub user_id: String,
    pub stellar_address: Option<String>,
    pub custody_mode: CustodyMode,
}

// ---------------------------------------------------------------------------
// Mode A — Supabase/Google JWT verification
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize, Serialize)]
struct Claims {
    sub: String,
    exp: usize,
}

#[derive(Debug, Deserialize)]
struct ProfileRow {
    id: String,
    custody_mode: Option<String>,
    stellar_address: Option<String>,
}

/// Verify a Supabase-issued JWT and enforce `custody_mode = 'orka'`.
pub async fn verify_supabase_jwt(
    state: &AppState,
    token: &str,
) -> Result<AuthenticatedUser, AuthError> {
    let jwks_url = format!("{}/auth/v1/jwks", state.config.supabase_url.trim_end_matches('/'));
    let jwks: Value = state
        .http
        .get(&jwks_url)
        .send()
        .await
        .map_err(|_| AuthError::JwksFetch)?
        .json()
        .await
        .map_err(|_| AuthError::JwksFetch)?;

    let mut user = verify_jwt_with_jwks(token, &jwks, &state.config.supabase_url)
        .map_err(|e| match e {
            // keep custody lookup errors distinct
            AuthError::WrongMode => AuthError::WrongMode,
            other => other,
        })?;

    // Enforce Mode A: only 'orka' users may authenticate this way.
    let row = lookup_profile(state, "id", &user.user_id).await?;
    match CustodyMode::from_db(row.custody_mode.as_deref()) {
        Some(CustodyMode::Orka) => {
            user.stellar_address = row.stellar_address;
            Ok(user)
        }
        _ => Err(AuthError::WrongMode),
    }
}

/// Pure RS256 verification against an in-memory JWKS document (no network).
pub fn verify_jwt_with_jwks(
    token: &str,
    jwks: &Value,
    _iss: &str,
) -> Result<AuthenticatedUser, AuthError> {
    use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};

    let header =
        jsonwebtoken::decode_header(token).map_err(|_| AuthError::InvalidToken)?;
    let kid = header.kid.ok_or(AuthError::InvalidToken)?;
    let keys = jwks.get("keys").and_then(|k| k.as_array()).ok_or(AuthError::JwksFetch)?;
    let jwk = keys
        .iter()
        .find(|k| k.get("kid").and_then(|v| v.as_str()) == Some(kid.as_str()))
        .ok_or(AuthError::JwksFetch)?;
    let n = jwk.get("n").and_then(|v| v.as_str()).ok_or(AuthError::JwksFetch)?;
    let e = jwk.get("e").and_then(|v| v.as_str()).ok_or(AuthError::JwksFetch)?;
    let key = DecodingKey::from_rsa_components(n, e).map_err(|_| AuthError::JwksFetch)?;

    let mut validation = Validation::new(Algorithm::RS256);
    validation.validate_exp = true;
    validation.required_spec_claims.clear();

    let data = decode::<Claims>(token, &key, &validation).map_err(|e| match e.kind() {
        jsonwebtoken::errors::ErrorKind::ExpiredSignature => AuthError::ExpiredToken,
        _ => AuthError::InvalidToken,
    })?;

    Ok(AuthenticatedUser {
        user_id: data.claims.sub,
        stellar_address: None,
        custody_mode: CustodyMode::Orka,
    })
}

async fn lookup_profile(
    state: &AppState,
    _by: &str,
    value: &str,
) -> Result<ProfileRow, AuthError> {
    let url = format!("{}/profiles?id=eq.{}", state.supabase.base_url, value);
    let resp = state
        .supabase
        .client
        .get(&url)
        .header("apikey", &state.supabase.key)
        .header("Authorization", format!("Bearer {}", state.supabase.key))
        .send()
        .await
        .map_err(|_| AuthError::Supabase)?;
    if !resp.status().is_success() {
        return Err(AuthError::Supabase);
    }
    let rows: Vec<ProfileRow> = resp.json().await.map_err(|_| AuthError::Supabase)?;
    rows.into_iter().next().ok_or(AuthError::ProfileMissing)
}

// ---------------------------------------------------------------------------
// Mode B — Freighter session proof (ed25519 over a server challenge)
// ---------------------------------------------------------------------------

static CHALLENGES: OnceLock<Mutex<HashMap<String, (String, Instant)>>> = OnceLock::new();

fn challenges() -> &'static Mutex<HashMap<String, (String, Instant)>> {
    CHALLENGES.get_or_init(|| Mutex::new(HashMap::new()))
}

const CHALLENGE_TTL: Duration = Duration::from_secs(300);

/// Issue a time-limited challenge string for a Stellar address.
pub async fn issue_challenge(_state: &AppState, stellar_address: &str) -> Result<String, AuthError> {
    let challenge = hex_random(32);
    challenges()
        .lock()
        .unwrap()
        .insert(stellar_address.to_string(), (challenge.clone(), Instant::now()));
    Ok(challenge)
}

/// Verify a Freighter session proof and enforce `custody_mode = 'freighter'`.
pub async fn verify_freighter_session(
    state: &AppState,
    stellar_address: &str,
    signature_b64: &str,
    challenge: &str,
) -> Result<AuthenticatedUser, AuthError> {
    // Consume the stored challenge (one-time) and enforce TTL.
    let stored = challenges().lock().unwrap().remove(stellar_address);
    let (expected, issued) = stored.ok_or(AuthError::InvalidToken)?;
    if issued.elapsed() > CHALLENGE_TTL || expected != challenge {
        return Err(AuthError::InvalidToken);
    }

    let pk = decode_stellar_account(stellar_address)?;
    let vk = VerifyingKey::from_bytes(&pk).map_err(|_| AuthError::InvalidToken)?;
    let sig_bytes = B64.decode(signature_b64).map_err(|_| AuthError::InvalidToken)?;
    let sig = Signature::from_slice(&sig_bytes).map_err(|_| AuthError::InvalidToken)?;
    vk.verify(challenge.as_bytes(), &sig)
        .map_err(|_| AuthError::InvalidToken)?;

    // Enforce Mode B: only 'freighter' users may authenticate this way.
    let row = lookup_profile_by_address(state, stellar_address).await?;
    match CustodyMode::from_db(row.custody_mode.as_deref()) {
        Some(CustodyMode::Freighter) => Ok(AuthenticatedUser {
            user_id: row.id,
            stellar_address: Some(stellar_address.to_string()),
            custody_mode: CustodyMode::Freighter,
        }),
        _ => Err(AuthError::WrongMode),
    }
}

async fn lookup_profile_by_address(
    state: &AppState,
    stellar_address: &str,
) -> Result<ProfileRow, AuthError> {
    let url = format!(
        "{}/profiles?stellar_address=eq.{}",
        state.supabase.base_url, stellar_address
    );
    let resp = state
        .supabase
        .client
        .get(&url)
        .header("apikey", &state.supabase.key)
        .header("Authorization", format!("Bearer {}", state.supabase.key))
        .send()
        .await
        .map_err(|_| AuthError::Supabase)?;
    if !resp.status().is_success() {
        return Err(AuthError::Supabase);
    }
    let rows: Vec<ProfileRow> = resp.json().await.map_err(|_| AuthError::Supabase)?;
    rows.into_iter().next().ok_or(AuthError::ProfileMissing)
}

// ---------------------------------------------------------------------------
// Mode-enforcement guard — the single chokepoint
// ---------------------------------------------------------------------------

/// THE rule: backend refuses to sign for the wrong `custody_mode`.
pub fn assert_signing_allowed(user_mode: &CustodyMode, requested: &CustodyMode) -> Result<(), AuthError> {
    if user_mode == requested {
        Ok(())
    } else {
        Err(AuthError::WrongMode)
    }
}

// ---------------------------------------------------------------------------
// Stellar strkey (G… account) encode/decode — dependency-free
// ---------------------------------------------------------------------------

const STRKEY_ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const ACCOUNT_VERSION: u8 = 6;

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

fn decode_stellar_account(s: &str) -> Result<[u8; 32], AuthError> {
    let raw = b32_decode(s).ok_or(AuthError::InvalidToken)?;
    if raw.len() != 35 || raw[0] != ACCOUNT_VERSION {
        return Err(AuthError::InvalidToken);
    }
    let calc = crc16_xmodem(&raw[0..33]).to_be_bytes();
    if calc != [raw[33], raw[34]] {
        return Err(AuthError::InvalidToken);
    }
    let mut pk = [0u8; 32];
    pk.copy_from_slice(&raw[1..33]);
    Ok(pk)
}

#[allow(dead_code)]
fn encode_stellar_account(pk: &[u8; 32]) -> String {
    let mut body = Vec::with_capacity(35);
    body.push(ACCOUNT_VERSION);
    body.extend_from_slice(pk);
    body.extend_from_slice(&crc16_xmodem(&body).to_be_bytes());
    b32_encode(&body)
}

fn hex_random(n: usize) -> String {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    (0..n).map(|_| format!("{:02x}", rng.gen::<u8>())).collect()
}

// ---------------------------------------------------------------------------
// HTTP routes
// ---------------------------------------------------------------------------

#[derive(Deserialize)]
struct VerifyReq { token: String }
#[derive(Deserialize)]
struct ChallengeReq { stellar_address: String }
#[derive(Deserialize)]
struct SessionReq { stellar_address: String, signature: String, challenge: String }
#[derive(Serialize)]
struct AuthResp { user_id: String, stellar_address: Option<String>, custody_mode: String }

pub fn routes(state: &AppState) -> Router {
    Router::new()
        .route("/auth/verify", post({
            let st = state.clone();
            move |Json(body): Json<VerifyReq>| {
                let st = st.clone();
                async move {
                    match verify_supabase_jwt(&st, &body.token).await {
                        Ok(u) => (axum::http::StatusCode::OK, Json(AuthResp { user_id: u.user_id, stellar_address: u.stellar_address, custody_mode: u.custody_mode.to_string() })),
                        Err(_) => (axum::http::StatusCode::UNAUTHORIZED, Json(AuthResp { user_id: String::new(), stellar_address: None, custody_mode: String::new() })),
                    }
                }
            }
        }))
        .route("/auth/freighter/challenge", post({
            let st = state.clone();
            move |Json(body): Json<ChallengeReq>| {
                let st = st.clone();
                async move {
                    match issue_challenge(&st, &body.stellar_address).await {
                        Ok(c) => (axum::http::StatusCode::OK, Json(serde_json::json!({ "challenge": c }))),
                        Err(_) => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "challenge_failed" }))),
                    }
                }
            }
        }))
        .route("/auth/freighter/session", post({
            let st = state.clone();
            move |Json(body): Json<SessionReq>| {
                let st = st.clone();
                async move {
                    match verify_freighter_session(&st, &body.stellar_address, &body.signature, &body.challenge).await {
                        Ok(u) => (axum::http::StatusCode::OK, Json(AuthResp { user_id: u.user_id, stellar_address: u.stellar_address, custody_mode: u.custody_mode.to_string() })),
                        Err(_) => (axum::http::StatusCode::UNAUTHORIZED, Json(AuthResp { user_id: String::new(), stellar_address: None, custody_mode: String::new() })),
                    }
                }
            }
        }))
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::{Signer, SigningKey};

    #[test]
    fn assert_signing_allowed_rejects_mismatch() {
        assert!(assert_signing_allowed(&CustodyMode::Orka, &CustodyMode::Orka).is_ok());
        assert!(assert_signing_allowed(&CustodyMode::Orka, &CustodyMode::Freighter).is_err());
        assert!(assert_signing_allowed(&CustodyMode::Freighter, &CustodyMode::Orka).is_err());
    }

    #[test]
    fn mode_b_round_trip() {
        let sk = SigningKey::generate(&mut rand::rngs::OsRng);
        let vk = sk.verifying_key();
        let pk = vk.to_bytes();
        let address = encode_stellar_account(&pk);
        let decoded = decode_stellar_account(&address).unwrap();
        assert_eq!(decoded, pk);

        let challenge = "server-challenge-123";
        let sig: Signature = sk.sign(challenge.as_bytes());
        let sig_b64 = B64.encode(sig.to_bytes());
        let vk2 = VerifyingKey::from_bytes(&decoded).unwrap();
        let sig2 = Signature::from_slice(&B64.decode(&sig_b64).unwrap()).unwrap();
        assert!(vk2.verify(challenge.as_bytes(), &sig2).is_ok());
    }

    #[test]
    fn strkey_rejects_garbage() {
        assert!(decode_stellar_account("not-a-real-address!!").is_err());
    }

    #[test]
    fn mode_a_jwt_round_trip() {
        use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
        let priv_pem = rsa_test_pem();
        let jwks = rsa_test_jwks_from_pem(&priv_pem);
        let mut header = Header::new(Algorithm::RS256);
        header.kid = Some("test-key-1".into());
        let token = encode(&header, &Claims { sub: "user_abc".into(), exp: usize::MAX }, &EncodingKey::from_rsa_pem(priv_pem.as_bytes()).unwrap()).unwrap();
        let user = verify_jwt_with_jwks(&token, &jwks, "iss").unwrap();
        assert_eq!(user.user_id, "user_abc");
    }

    #[test]
    fn mode_a_rejects_tampered() {
        let priv_pem = rsa_test_pem();
        let jwks = rsa_test_jwks_from_pem(&priv_pem);
        let mut hdr = jsonwebtoken::Header::new(jsonwebtoken::Algorithm::RS256);
        hdr.kid = Some("test-key-1".into());
        let token = jsonwebtoken::encode(
            &hdr,
            &Claims { sub: "user_abc".into(), exp: usize::MAX },
            &jsonwebtoken::EncodingKey::from_rsa_pem(priv_pem.as_bytes()).unwrap(),
        ).unwrap();
        let mut bad = token.clone();
        bad.push('x');
        assert!(verify_jwt_with_jwks(&bad, &jwks, "iss").is_err());
    }

    fn rsa_test_pem() -> String {
        use rsa::pkcs8::EncodePrivateKey;
        let priv_key = rsa::RsaPrivateKey::new(&mut rand::rngs::OsRng, 2048).unwrap();
        priv_key.to_pkcs8_pem(rsa::pkcs8::LineEnding::LF).unwrap().to_string()
    }

    fn rsa_test_jwks_from_pem(priv_pem: &str) -> Value {
        use rsa::pkcs8::DecodePrivateKey;
        use rsa::traits::PublicKeyParts;
        use base64::engine::general_purpose::URL_SAFE_NO_PAD as B64URL;
        let priv_key = rsa::RsaPrivateKey::from_pkcs8_pem(priv_pem).unwrap();
        let pub_key = priv_key.to_public_key();
        let n = B64URL.encode(pub_key.n().to_bytes_be());
        let e = B64URL.encode(pub_key.e().to_bytes_be());
        serde_json::json!({
            "keys": [{
                "kty": "RSA",
                "alg": "RS256",
                "use": "sig",
                "kid": "test-key-1",
                "n": n,
                "e": e
            }]
        })
    }
}
