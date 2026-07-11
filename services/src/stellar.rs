use crate::auth::CustodyMode;
use crate::custody::{self, Kms};
use crate::state::AppState;
use axum::{routing::get, routing::post, Json, Router};
use ed25519_dalek::{Signature as EdSignature, Signer, SigningKey};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use stellar_xdr::curr::*;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

#[derive(Debug, thiserror::Error)]
pub enum StellarError {
    #[error("xdr encode/decode failed")]
    Xdr,
    #[error("invalid address")]
    Address,
    #[error("rpc request failed")]
    Rpc,
    #[error("signing failed")]
    Sign,
    #[error("invalid sequence number")]
    Seq,
}

// ---------------------------------------------------------------------------
// Strkey helpers (G... account, C... contract, S... seed) — manual base32+crc
// ---------------------------------------------------------------------------

const STRKEY_ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const ACCOUNT_VERSION: u8 = 6;
const CONTRACT_VERSION: u8 = 2;
const SEED_VERSION: u8 = 18;

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

fn decode_strkey(s: &str, expected_version: u8) -> Result<[u8; 32], StellarError> {
    let raw = b32_decode(s).ok_or(StellarError::Address)?;
    if raw.len() != 35 || raw[0] != expected_version {
        return Err(StellarError::Address);
    }
    let calc = crc16_xmodem(&raw[0..33]).to_be_bytes();
    if calc != [raw[33], raw[34]] {
        return Err(StellarError::Address);
    }
    let mut out = [0u8; 32];
    out.copy_from_slice(&raw[1..33]);
    Ok(out)
}

fn encode_strkey(version: u8, payload: &[u8; 32]) -> String {
    let mut body = Vec::with_capacity(35);
    body.push(version);
    body.extend_from_slice(payload);
    body.extend_from_slice(&crc16_xmodem(&body).to_be_bytes());
    b32_encode(&body)
}

/// Decode a `G...` Stellar account strkey into a 32-byte ed25519 public key.
pub fn decode_account(strkey: &str) -> Result<[u8; 32], StellarError> {
    decode_strkey(strkey, ACCOUNT_VERSION)
}

/// Decode a `C...` contract strkey into a 32-byte contract id.
pub fn decode_contract(strkey: &str) -> Result<[u8; 32], StellarError> {
    decode_strkey(strkey, CONTRACT_VERSION)
}

/// Decode a `S...` secret seed strkey into a 32-byte ed25519 seed.
pub fn decode_secret_seed(strkey: &str) -> Result<[u8; 32], StellarError> {
    decode_strkey(strkey, SEED_VERSION)
}

/// Encode a 32-byte ed25519 seed as a `S...` secret strkey (test helper).
pub fn encode_secret_seed(seed: &[u8; 32]) -> String {
    encode_strkey(SEED_VERSION, seed)
}

/// Encode a 32-byte ed25519 public key as a `G...` account strkey.
pub fn encode_account(pk: &[u8; 32]) -> String {
    encode_strkey(ACCOUNT_VERSION, pk)
}

// ---------------------------------------------------------------------------
// Network id (sha256 of passphrase)
// ---------------------------------------------------------------------------

fn network_id(passphrase: &str) -> Hash {
    let mut h = Sha256::new();
    h.update(passphrase.as_bytes());
    let out = h.finalize();
    let mut arr = [0u8; 32];
    arr.copy_from_slice(&out);
    Hash(arr)
}

// ---------------------------------------------------------------------------
// ScVal mappers for escrow function arguments
// ---------------------------------------------------------------------------

fn sc_account(addr: &str) -> ScVal {
    let pk = decode_account(addr).expect("valid account strkey");
    ScVal::Address(ScAddress::Account(AccountId(PublicKey::PublicKeyTypeEd25519(
        Uint256(pk),
    ))))
}

fn sc_contract(addr: &str) -> ScVal {
    let id = decode_contract(addr).expect("valid contract strkey");
    ScVal::Address(ScAddress::Contract(Hash(id)))
}

fn sc_bytes(bytes: &[u8]) -> ScVal {
    ScVal::Bytes(ScBytes(
        bytes.to_vec().try_into().map_err(|_| StellarError::Xdr).unwrap(),
    ))
}

fn sc_u64(v: u64) -> ScVal {
    ScVal::U64(v)
}

fn sc_vec_u64(values: &[u64]) -> ScVal {
    let items: Vec<ScVal> = values.iter().map(|v| sc_u64(*v)).collect();
    ScVal::Vec(Some(ScVec(
        items.try_into().map_err(|_| StellarError::Xdr).unwrap(),
    )))
}

fn symbol(s: &str) -> ScSymbol {
    ScSymbol::try_from(s).unwrap()
}

// ---------------------------------------------------------------------------
// Tx builder
// ---------------------------------------------------------------------------

/// Build an inner `Transaction` that invokes `fn_name` on `contract_id` with `args`.
pub fn build_contract_tx(
    source_account: &str,
    contract_id: &str,
    fn_name: &str,
    args: Vec<ScVal>,
    sequence: i64,
    fee: u32,
) -> Result<Transaction, StellarError> {
    let src_pk = decode_account(source_account)?;
    let contract_pk = decode_contract(contract_id)?;

    let op = Operation {
        source_account: None,
        body: OperationBody::InvokeHostFunction(InvokeHostFunctionOp {
            host_function: HostFunction::InvokeContract(InvokeContractArgs {
                contract_address: ScAddress::Contract(Hash(contract_pk)),
                function_name: symbol(fn_name),
                args: args.try_into().map_err(|_| StellarError::Xdr)?,
            }),
            auth: vec![].try_into().map_err(|_| StellarError::Xdr)?,
        }),
    };

    let tx = Transaction {
        source_account: MuxedAccount::Ed25519(Uint256(src_pk)),
        fee,
        seq_num: SequenceNumber(sequence),
        cond: Preconditions::None,
        memo: Memo::None,
        operations: vec![op].try_into().map_err(|_| StellarError::Xdr)?,
        ext: TransactionExt::V0,
    };
    Ok(tx)
}

// ---------------------------------------------------------------------------
// Signing helpers
// ---------------------------------------------------------------------------

/// Sign a `TransactionSignaturePayload` (sha256 of its XDR) with a raw ed25519 seed.
fn sign_payload(seed: &[u8; 32], payload: &TransactionSignaturePayload) -> DecoratedSignature {
    let xdr = payload.to_xdr(Limits::none()).unwrap();
    let mut h = Sha256::new();
    h.update(&xdr);
    let hash = h.finalize();
    let sk = SigningKey::from_bytes(seed);
    let pk = sk.verifying_key().to_bytes();
    let sig: EdSignature = sk.sign(&hash);
    let hint = SignatureHint([pk[28], pk[29], pk[30], pk[31]]);
    DecoratedSignature {
        hint,
        signature: Signature(sig.to_bytes().to_vec().try_into().unwrap()),
    }
}

// ---------------------------------------------------------------------------
// Fee-bump sponsorship + submit
// ---------------------------------------------------------------------------

/// Wrap an inner tx in an operator-sponsored fee_bump, sign with the operator
/// key, attach `user_signatures` to the inner tx, serialize to base64 XDR.
pub fn sponsor_and_submit(
    passphrase: &str,
    inner: Transaction,
    operator_seed: &[u8; 32],
    user_signatures: Vec<DecoratedSignature>,
    bump_fee: i64,
) -> Result<String, StellarError> {
    let net = network_id(passphrase);
    let op_pk = SigningKey::from_bytes(operator_seed).verifying_key().to_bytes();

    // Attach user signatures to the inner tx (v1 envelope).
    let v1 = TransactionV1Envelope {
        tx: inner,
        signatures: user_signatures
            .try_into()
            .map_err(|_| StellarError::Xdr)?,
    };

    let fee_bump = FeeBumpTransaction {
        fee_source: MuxedAccount::Ed25519(Uint256(op_pk)),
        fee: bump_fee,
        inner_tx: FeeBumpTransactionInnerTx::Tx(v1),
        ext: FeeBumpTransactionExt::V0,
    };

    // Sign the fee-bump hash with the operator key.
    let fb_payload = TransactionSignaturePayload {
        network_id: net,
        tagged_transaction: TransactionSignaturePayloadTaggedTransaction::TxFeeBump(
            fee_bump.clone(),
        ),
    };
    let op_sig = sign_payload(operator_seed, &fb_payload);

    let env = FeeBumpTransactionEnvelope {
        tx: fee_bump,
        signatures: vec![op_sig].try_into().map_err(|_| StellarError::Xdr)?,
    };

    TransactionEnvelope::TxFeeBump(env)
        .to_xdr_base64(Limits::none())
        .map_err(|_| StellarError::Xdr)
}

/// Build + submit a multi-sig `release_funds(milestone_id)` tx:
/// inner tx signed by BOTH the client key (via Kms) and the operator key.
pub async fn release_funds_sponsored(
    _state: &AppState,
    contract_id: &str,
    milestone_id: u64,
    client_address: &str,
    client_user_id: &str,
    kms: &dyn Kms,
    operator_seed: &[u8; 32],
    passphrase: &str,
    sequence: i64,
) -> Result<String, StellarError> {
    let net = network_id(passphrase);

    // Build inner tx, source = client (client.require_auth()).
    let inner = build_contract_tx(
        client_address,
        contract_id,
        "release_funds",
        vec![sc_u64(milestone_id)],
        sequence,
        100,
    )?;

    // Sign inner with client key (custody) and operator key (multi-sig).
    let inner_v1 = TransactionV1Envelope {
        tx: inner,
        signatures: vec![].try_into().map_err(|_| StellarError::Xdr)?,
    };
    let inner_payload = TransactionSignaturePayload {
        network_id: net,
        tagged_transaction: TransactionSignaturePayloadTaggedTransaction::Tx(inner_v1.tx.clone()),
    };

    let client_seed = custody::kms_decrypt_seed(kms, client_user_id)
        .map_err(|_| StellarError::Sign)?;
    let client_sig = sign_payload(&client_seed, &inner_payload);
    let operator_sig = sign_payload(operator_seed, &inner_payload);

    let sigs = vec![client_sig, operator_sig];
    sponsor_and_submit(passphrase, inner_v1.tx, operator_seed, sigs, 200)
}

// ---------------------------------------------------------------------------
// Mode B: return unsigned inner tx XDR for Freighter to sign
// ---------------------------------------------------------------------------

/// Build a fee-bump-wrapped tx with the operator as fee payer; the inner tx is
/// left WITHOUT the user signature (Freighter signs in-browser). Returns XDR.
pub fn build_tx_for_freighter(
    passphrase: &str,
    contract_id: &str,
    fn_name: &str,
    args: Vec<ScVal>,
    user_address: &str,
    operator_seed: &[u8; 32],
    sequence: i64,
    bump_fee: i64,
) -> Result<String, StellarError> {
    let inner = build_contract_tx(user_address, contract_id, fn_name, args, sequence, 100)?;
    // No user signatures — backend never signs the Freighter key.
    sponsor_and_submit(passphrase, inner, operator_seed, vec![], bump_fee)
}

// ---------------------------------------------------------------------------
// RPC helpers (best-effort; no live RPC required for tests)
// ---------------------------------------------------------------------------

#[derive(Serialize)]
struct RpcRequest<'a> {
    jsonrpc: &'a str,
    id: u32,
    method: &'a str,
    params: serde_json::Value,
}

/// Submit a fee-bump XDR to a Stellar RPC `sendTransaction` endpoint.
pub async fn submit_to_rpc(rpc_url: &str, xdr_base64: &str) -> Result<String, StellarError> {
    let body = RpcRequest {
        jsonrpc: "2.0",
        id: 1,
        method: "sendTransaction",
        params: serde_json::json!({ "transaction": xdr_base64 }),
    };
    let client = reqwest::Client::new();
    let resp = client
        .post(rpc_url)
        .json(&body)
        .send()
        .await
        .map_err(|_| StellarError::Rpc)?;
    let json: serde_json::Value = resp.json().await.map_err(|_| StellarError::Rpc)?;
    json.get("result")
        .and_then(|r| r.get("hash"))
        .and_then(|h| h.as_str())
        .map(|s| s.to_string())
        .ok_or(StellarError::Rpc)
}

// ---------------------------------------------------------------------------
// HTTP routes
// ---------------------------------------------------------------------------

#[derive(Deserialize)]
struct FundReq {
    contract_id: String,
    milestone_ids: Vec<u64>,
    mode: String,
    user_id: Option<String>,
    user_address: Option<String>,
}

#[derive(Deserialize)]
struct ReleaseReq {
    contract_id: String,
    milestone_id: u64,
    mode: String,
    user_id: Option<String>,
    user_address: Option<String>,
}

#[derive(Serialize)]
struct XdrResp {
    tx_xdr: String,
}

fn parse_mode(s: &str) -> Result<CustodyMode, StellarError> {
    match s {
        "orka" => Ok(CustodyMode::Orka),
        "freighter" => Ok(CustodyMode::Freighter),
        _ => Err(StellarError::Address),
    }
}

fn err_json(msg: &str) -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({ "error": msg }))
}

pub fn routes(state: &AppState) -> Router {
    Router::new()
        .route(
            "/escrow/fund",
            {
                let st = state.clone();
                post(move |Json(body): Json<FundReq>| {
                    let st = st.clone();
                    async move {
                        let mode = parse_mode(&body.mode).unwrap_or(CustodyMode::Orka);
                        let pass = st.config.network_passphrase();
                        match mode {
                            CustodyMode::Orka => {
                                let xdr = build_tx_for_freighter(
                                    &pass,
                                    &body.contract_id,
                                    "fund",
                                    vec![sc_vec_u64(&body.milestone_ids)],
                                    &st.config.operator_address,
                                    &st.config.operator_seed_bytes(),
                                    st.config.sequence,
                                    200,
                                );
                                match xdr {
                                    Ok(x) => axum::Json(serde_json::json!({ "tx_xdr": x })),
                                    Err(_) => err_json("build_failed"),
                                }
                            }
                            CustodyMode::Freighter => {
                                let addr = body.user_address.clone().unwrap_or_default();
                                let xdr = build_tx_for_freighter(
                                    &pass,
                                    &body.contract_id,
                                    "fund",
                                    vec![sc_vec_u64(&body.milestone_ids)],
                                    &addr,
                                    &st.config.operator_seed_bytes(),
                                    st.config.sequence,
                                    200,
                                );
                                match xdr {
                                    Ok(x) => axum::Json(serde_json::json!({ "tx_xdr": x })),
                                    Err(_) => err_json("build_failed"),
                                }
                            }
                        }
                    }
                })
            },
        )
        .route(
            "/escrow/release",
            {
                let st = state.clone();
                post(move |Json(body): Json<ReleaseReq>| {
                    let st = st.clone();
                    async move {
                        let mode = parse_mode(&body.mode).unwrap_or(CustodyMode::Orka);
                        let pass = st.config.network_passphrase();
                        match mode {
                            CustodyMode::Orka => {
                                // Multi-sig requires Kms; documented seam for 01-05 bridge.
                                axum::Json(serde_json::json!({ "note": "mode_a_multisig_requires_kms" }))
                            }
                            CustodyMode::Freighter => {
                                let addr = body.user_address.clone().unwrap_or_default();
                                let xdr = build_tx_for_freighter(
                                    &pass,
                                    &body.contract_id,
                                    "release_funds",
                                    vec![sc_u64(body.milestone_id)],
                                    &addr,
                                    &st.config.operator_seed_bytes(),
                                    st.config.sequence,
                                    200,
                                );
                                match xdr {
                                    Ok(x) => axum::Json(serde_json::json!({ "tx_xdr": x })),
                                    Err(_) => err_json("build_failed"),
                                }
                            }
                        }
                    }
                })
            },
        )
        .route(
            "/escrow/state",
            get(|| async {
                axum::Json(serde_json::json!({ "note": "fetch_via_rpc_getLedgerEntries" }))
            }),
        )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use crate::custody::InMemoryKms;

    const PASSPHRASE: &str = "Test SDF Network ; September 2015";

    fn operator_seed() -> [u8; 32] {
        [7u8; 32]
    }

    fn contract_strkey() -> String {
        encode_strkey(CONTRACT_VERSION, &[9u8; 32])
    }

    fn account_strkey() -> String {
        encode_strkey(ACCOUNT_VERSION, &[3u8; 32])
    }

    #[test]
    fn build_fund_tx() {
        let tx = build_contract_tx(
            &account_strkey(),
            &contract_strkey(),
            "fund",
            vec![sc_vec_u64(&[1, 2, 3])],
            42,
            100,
        )
        .unwrap();

        let env = TransactionEnvelope::Tx(TransactionV1Envelope {
            tx,
            signatures: vec![].try_into().unwrap(),
        });
        let xdr = env.to_xdr_base64(Limits::none()).unwrap();
        let parsed = TransactionEnvelope::from_xdr_base64(&xdr, Limits::none()).unwrap();
        match parsed {
            TransactionEnvelope::Tx(v1) => match &v1.tx.operations.as_slice()[0].body {
                OperationBody::InvokeHostFunction(op) => match &op.host_function {
                    HostFunction::InvokeContract(args) => {
                        assert_eq!(args.function_name.to_string(), "fund");
                        assert_eq!(args.args.as_slice().len(), 1);
                    }
                    _ => panic!("expected InvokeContract"),
                },
                _ => panic!("expected InvokeHostFunction"),
            },
            _ => panic!("expected Tx envelope"),
        }
    }

    #[test]
    fn feebump_has_operator_fee_source() {
        let inner = build_contract_tx(
            &account_strkey(),
            &contract_strkey(),
            "fund",
            vec![sc_vec_u64(&[1])],
            42,
            100,
        )
        .unwrap();

        let xdr = sponsor_and_submit(PASSPHRASE, inner, &operator_seed(), vec![], 200).unwrap();
        let env = TransactionEnvelope::from_xdr_base64(&xdr, Limits::none()).unwrap();
        match env {
            TransactionEnvelope::TxFeeBump(fb) => {
                match fb.tx.fee_source {
                    MuxedAccount::Ed25519(Uint256(op)) => {
                        let expected = SigningKey::from_bytes(&operator_seed()).verifying_key().to_bytes();
                        assert_eq!(op, expected);
                    }
                    _ => panic!("expected Ed25519 fee source"),
                }
                assert_eq!(fb.signatures.as_slice().len(), 1);
            }
            _ => panic!("expected FeeBump envelope"),
        }
    }

    #[test]
    fn release_funds_multisig_two_sigs() {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(async {
            let kms = InMemoryKms::new();
            let client_seed = [5u8; 32];
            kms.encrypt("client1", &client_seed).unwrap();

            let xdr = release_funds_sponsored(
                &crate::state::AppState::new(crate::config::Config::from_env().unwrap()),
                &contract_strkey(),
                7,
                &account_strkey(),
                "client1",
                &kms,
                &operator_seed(),
                PASSPHRASE,
                42,
            )
            .await
            .unwrap();

            let env = TransactionEnvelope::from_xdr_base64(&xdr, Limits::none()).unwrap();
            match env {
                TransactionEnvelope::TxFeeBump(fb) => match fb.tx.inner_tx {
                FeeBumpTransactionInnerTx::Tx(v1) => {
                    // Inner tx carries client + operator signatures (multi-sig).
                    assert_eq!(v1.signatures.as_slice().len(), 2);
                }
                },
                _ => panic!("expected FeeBump envelope"),
            }
        });
    }

    #[test]
    fn mode_b_returns_xdr_without_user_sig() {
        let xdr = build_tx_for_freighter(
            PASSPHRASE,
            &contract_strkey(),
            "fund",
            vec![sc_vec_u64(&[1])],
            &account_strkey(),
            &operator_seed(),
            42,
            200,
        )
        .unwrap();

        let env = TransactionEnvelope::from_xdr_base64(&xdr, Limits::none()).unwrap();
        match env {
            TransactionEnvelope::TxFeeBump(fb) => match fb.tx.inner_tx {
                FeeBumpTransactionInnerTx::Tx(v1) => {
                    // Mode B: inner tx has NO user signature.
                    assert_eq!(v1.signatures.as_slice().len(), 0);
                }
            },
            _ => panic!("expected FeeBump envelope"),
        }
    }
}
