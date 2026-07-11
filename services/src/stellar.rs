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

/// Encode a 32-byte contract id as a `C...` contract strkey.
pub fn encode_contract(id: &[u8; 32]) -> String {
    encode_strkey(CONTRACT_VERSION, id)
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

fn sc_i128(v: i128) -> ScVal {
    ScVal::I128(Int128Parts {
        hi: (v >> 64) as i64,
        lo: v as u64,
    })
}

/// Build the `Vec<MilestoneInit>` argument. The on-chain `MilestoneInit`
/// contracttype is `{ amount: i128 }` (a single-field struct), so each
/// milestone maps to a 1-element `ScVal::Vec` of the i128 amount.
fn sc_milestones(ms: &[MilestoneInitReq]) -> ScVal {
    let items: Vec<ScVal> = ms
        .iter()
        .map(|m| {
            ScVal::Vec(Some(ScVec(
                vec![sc_i128(m.amount)].try_into().unwrap(),
            )))
        })
        .collect();
    ScVal::Vec(Some(ScVec(items.try_into().unwrap())))
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

/// Unified sponsored-tx builder that replaces the ad-hoc
/// `build_tx_for_freighter` usage. Builds the inner contract invocation tx from
/// `user_source`, optionally attaches a pre-built client signature
/// (`inner_user_sig`) and/or an operator signature (`operator_inner_sig`), then
/// wraps it in an operator-sponsored fee-bump and returns base64 XDR.
pub fn build_sponsored(
    passphrase: &str,
    contract_id: &str,
    fn_name: &str,
    args: Vec<ScVal>,
    user_source: &str,
    operator_seed: &[u8; 32],
    sequence: i64,
    bump_fee: i64,
    inner_user_sig: Option<DecoratedSignature>,
    operator_inner_sig: bool,
) -> Result<String, StellarError> {
    let inner = build_contract_tx(user_source, contract_id, fn_name, args, sequence, 100)?;
    let mut sigs: Vec<DecoratedSignature> = Vec::new();
    if let Some(s) = inner_user_sig {
        sigs.push(s);
    }
    if operator_inner_sig {
        let payload = TransactionSignaturePayload {
            network_id: network_id(passphrase),
            tagged_transaction: TransactionSignaturePayloadTaggedTransaction::Tx(inner.clone()),
        };
        sigs.push(sign_payload(operator_seed, &payload));
    }
    sponsor_and_submit(passphrase, inner, operator_seed, sigs, bump_fee)
}

/// Derive a `G...` Stellar address from a raw ed25519 seed. Used in Orka mode so
/// the inner tx source account matches the key that will sign it.
fn address_from_seed(seed: &[u8; 32]) -> String {
    let pk = SigningKey::from_bytes(seed).verifying_key().to_bytes();
    encode_account(&pk)
}

/// Build an inner client signature for a sponsored contract invocation, mirroring
/// the pattern in `release_funds_sponsored`. The signature is over the exact same
/// inner tx that `build_sponsored` will reconstruct (same source/contract/fn/args/
/// sequence/fee=100), so it verifies on-chain.
fn build_inner_client_sig(
    passphrase: &str,
    user_source: &str,
    contract_id: &str,
    fn_name: &str,
    args: Vec<ScVal>,
    sequence: i64,
    client_seed: &[u8; 32],
) -> Result<DecoratedSignature, StellarError> {
    let inner = build_contract_tx(user_source, contract_id, fn_name, args, sequence, 100)?;
    let inner_v1 = TransactionV1Envelope {
        tx: inner,
        signatures: vec![].try_into().map_err(|_| StellarError::Xdr)?,
    };
    let payload = TransactionSignaturePayload {
        network_id: network_id(passphrase),
        tagged_transaction: TransactionSignaturePayloadTaggedTransaction::Tx(inner_v1.tx.clone()),
    };
    Ok(sign_payload(client_seed, &payload))
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

/// Fetch a transaction's result meta via RPC `getTransaction` and return the
/// contract-call return value re-encoded as a base64 XDR string.
pub async fn get_tx_result(rpc_url: &str, tx_hash: &str) -> Result<String, StellarError> {
    let body = RpcRequest {
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: serde_json::json!({ "hash": tx_hash }),
    };
    let client = reqwest::Client::new();
    let resp = client
        .post(rpc_url)
        .json(&body)
        .send()
        .await
        .map_err(|_| StellarError::Rpc)?;
    let json: serde_json::Value = resp.json().await.map_err(|_| StellarError::Rpc)?;
    let meta = json
        .get("result")
        .and_then(|r| r.get("resultMetaXdr"))
        .and_then(|m| m.as_str())
        .ok_or(StellarError::Rpc)?;
    extract_return_value(meta)
}

/// Decode a `resultMetaXdr` base64 string and extract the Soroban contract-call
/// return value as a base64 XDR string. Kept private + standalone so the decode
/// path is unit-testable without any network access.
fn extract_return_value(meta_base64: &str) -> Result<String, StellarError> {
    let meta = TransactionMeta::from_xdr_base64(meta_base64, Limits::none())
        .map_err(|_| StellarError::Xdr)?;
    let v3 = match meta {
        TransactionMeta::V3(v3) => v3,
        _ => return Err(StellarError::Rpc),
    };
    let soroban = v3.soroban_meta.ok_or(StellarError::Rpc)?;
    soroban
        .return_value
        .to_xdr_base64(Limits::none())
        .map_err(|_| StellarError::Xdr)
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

#[derive(Deserialize)]
struct SubmitReq {
    contract_id: String,
    milestone_id: u64,
    mode: String,
    user_id: Option<String>,
    user_address: Option<String>,
}

#[derive(Deserialize)]
struct ApproveReq {
    contract_id: String,
    milestone_id: u64,
    mode: String,
    user_id: Option<String>,
    user_address: Option<String>,
}

/// One milestone in a `create_escrow` proposal.
///
/// NOTE: the on-chain `MilestoneInit` contracttype is `{ amount: i128 }`
/// (no `description` field). The `description` is kept here for API
/// ergonomics/forward-compat but is NOT serialized into the Soroban call.
#[derive(Deserialize)]
struct MilestoneInitReq {
    amount: i128,
    #[allow(dead_code)]
    description: String,
}

/// `POST /escrow/create` body.
///
/// `dispute_rules` maps to the on-chain `Option<DisputeRules>` argument,
/// where the contract defines `type DisputeRules = u32` (a basis-points
/// split value, not a struct). So it is a plain `Option<u32>`.
#[derive(Deserialize)]
struct CreateReq {
    org_id: String,
    client: String,
    freelancer: String,
    asset: String,
    operator: Option<String>,
    milestones: Vec<MilestoneInitReq>,
    dispute_rules: Option<u32>,
    mode: String,
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
                                // Backend signs with the user's KMS seed, then broadcasts.
                                let user_id = match &body.user_id {
                                    Some(u) => u.clone(),
                                    None => return err_json("user_id_required"),
                                };
                                let client_seed = match custody::kms_decrypt_seed(&*st.kms, &user_id) {
                                    Ok(s) => s,
                                    Err(_) => return err_json("seed_decrypt_failed"),
                                };
                                let client_addr = address_from_seed(&client_seed);
                                let args = vec![sc_vec_u64(&body.milestone_ids)];
                                let client_sig = match build_inner_client_sig(
                                    &pass,
                                    &client_addr,
                                    &body.contract_id,
                                    "fund",
                                    args.clone(),
                                    st.config.sequence,
                                    &client_seed,
                                ) {
                                    Ok(s) => s,
                                    Err(_) => return err_json("sign_failed"),
                                };
                                let xdr = build_sponsored(
                                    &pass,
                                    &body.contract_id,
                                    "fund",
                                    args,
                                    &client_addr,
                                    &st.config.operator_seed_bytes(),
                                    st.config.sequence,
                                    200,
                                    Some(client_sig),
                                    false,
                                );
                                match xdr {
                                    Ok(x) => match submit_to_rpc(&st.config.stellar_rpc_url, &x).await {
                                        Ok(hash) => axum::Json(serde_json::json!({ "tx_hash": hash })),
                                        Err(_) => err_json("rpc_submit_failed"),
                                    },
                                    Err(_) => err_json("build_failed"),
                                }
                            }
                            CustodyMode::Freighter => {
                                // Wallet signs in-browser; backend returns unsigned XDR.
                                let addr = body.user_address.clone().unwrap_or_default();
                                let xdr = build_sponsored(
                                    &pass,
                                    &body.contract_id,
                                    "fund",
                                    vec![sc_vec_u64(&body.milestone_ids)],
                                    &addr,
                                    &st.config.operator_seed_bytes(),
                                    st.config.sequence,
                                    200,
                                    None,
                                    false,
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
            "/escrow/submit",
            {
                let st = state.clone();
                post(move |Json(body): Json<SubmitReq>| {
                    let st = st.clone();
                    async move {
                        let mode = parse_mode(&body.mode).unwrap_or(CustodyMode::Orka);
                        let pass = st.config.network_passphrase();
                        match mode {
                            CustodyMode::Orka => {
                                let user_id = match &body.user_id {
                                    Some(u) => u.clone(),
                                    None => return err_json("user_id_required"),
                                };
                                let client_seed = match custody::kms_decrypt_seed(&*st.kms, &user_id) {
                                    Ok(s) => s,
                                    Err(_) => return err_json("seed_decrypt_failed"),
                                };
                                let client_addr = address_from_seed(&client_seed);
                                let args = vec![sc_u64(body.milestone_id)];
                                let client_sig = match build_inner_client_sig(
                                    &pass,
                                    &client_addr,
                                    &body.contract_id,
                                    "submit",
                                    args.clone(),
                                    st.config.sequence,
                                    &client_seed,
                                ) {
                                    Ok(s) => s,
                                    Err(_) => return err_json("sign_failed"),
                                };
                                let xdr = build_sponsored(
                                    &pass,
                                    &body.contract_id,
                                    "submit",
                                    args,
                                    &client_addr,
                                    &st.config.operator_seed_bytes(),
                                    st.config.sequence,
                                    200,
                                    Some(client_sig),
                                    false,
                                );
                                match xdr {
                                    Ok(x) => match submit_to_rpc(&st.config.stellar_rpc_url, &x).await {
                                        Ok(hash) => axum::Json(serde_json::json!({ "tx_hash": hash })),
                                        Err(_) => err_json("rpc_submit_failed"),
                                    },
                                    Err(_) => err_json("build_failed"),
                                }
                            }
                            CustodyMode::Freighter => {
                                let addr = body.user_address.clone().unwrap_or_default();
                                let xdr = build_sponsored(
                                    &pass,
                                    &body.contract_id,
                                    "submit",
                                    vec![sc_u64(body.milestone_id)],
                                    &addr,
                                    &st.config.operator_seed_bytes(),
                                    st.config.sequence,
                                    200,
                                    None,
                                    false,
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
            "/escrow/approve",
            {
                let st = state.clone();
                post(move |Json(body): Json<ApproveReq>| {
                    let st = st.clone();
                    async move {
                        let mode = parse_mode(&body.mode).unwrap_or(CustodyMode::Orka);
                        let pass = st.config.network_passphrase();
                        match mode {
                            CustodyMode::Orka => {
                                let user_id = match &body.user_id {
                                    Some(u) => u.clone(),
                                    None => return err_json("user_id_required"),
                                };
                                let client_seed = match custody::kms_decrypt_seed(&*st.kms, &user_id) {
                                    Ok(s) => s,
                                    Err(_) => return err_json("seed_decrypt_failed"),
                                };
                                let client_addr = address_from_seed(&client_seed);
                                let args = vec![sc_u64(body.milestone_id)];
                                let client_sig = match build_inner_client_sig(
                                    &pass,
                                    &client_addr,
                                    &body.contract_id,
                                    "approve",
                                    args.clone(),
                                    st.config.sequence,
                                    &client_seed,
                                ) {
                                    Ok(s) => s,
                                    Err(_) => return err_json("sign_failed"),
                                };
                                let xdr = build_sponsored(
                                    &pass,
                                    &body.contract_id,
                                    "approve",
                                    args,
                                    &client_addr,
                                    &st.config.operator_seed_bytes(),
                                    st.config.sequence,
                                    200,
                                    Some(client_sig),
                                    false,
                                );
                                match xdr {
                                    Ok(x) => match submit_to_rpc(&st.config.stellar_rpc_url, &x).await {
                                        Ok(hash) => axum::Json(serde_json::json!({ "tx_hash": hash })),
                                        Err(_) => err_json("rpc_submit_failed"),
                                    },
                                    Err(_) => err_json("build_failed"),
                                }
                            }
                            CustodyMode::Freighter => {
                                let addr = body.user_address.clone().unwrap_or_default();
                                let xdr = build_sponsored(
                                    &pass,
                                    &body.contract_id,
                                    "approve",
                                    vec![sc_u64(body.milestone_id)],
                                    &addr,
                                    &st.config.operator_seed_bytes(),
                                    st.config.sequence,
                                    200,
                                    None,
                                    false,
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
                                // Client KMS sig + operator inner sig (release_funds requires both).
                                let user_id = match &body.user_id {
                                    Some(u) => u.clone(),
                                    None => return err_json("user_id_required"),
                                };
                                let client_seed = match custody::kms_decrypt_seed(&*st.kms, &user_id) {
                                    Ok(s) => s,
                                    Err(_) => return err_json("seed_decrypt_failed"),
                                };
                                let client_addr = address_from_seed(&client_seed);
                                let args = vec![sc_u64(body.milestone_id)];
                                let client_sig = match build_inner_client_sig(
                                    &pass,
                                    &client_addr,
                                    &body.contract_id,
                                    "release_funds",
                                    args.clone(),
                                    st.config.sequence,
                                    &client_seed,
                                ) {
                                    Ok(s) => s,
                                    Err(_) => return err_json("sign_failed"),
                                };
                                let xdr = build_sponsored(
                                    &pass,
                                    &body.contract_id,
                                    "release_funds",
                                    args,
                                    &client_addr,
                                    &st.config.operator_seed_bytes(),
                                    st.config.sequence,
                                    200,
                                    Some(client_sig),
                                    true,
                                );
                                match xdr {
                                    Ok(x) => match submit_to_rpc(&st.config.stellar_rpc_url, &x).await {
                                        Ok(hash) => axum::Json(serde_json::json!({ "tx_hash": hash })),
                                        Err(_) => err_json("rpc_submit_failed"),
                                    },
                                    Err(_) => err_json("build_failed"),
                                }
                            }
                            CustodyMode::Freighter => {
                                // Backend adds operator inner sig; wallet adds client sig in-browser.
                                let addr = body.user_address.clone().unwrap_or_default();
                                let xdr = build_sponsored(
                                    &pass,
                                    &body.contract_id,
                                    "release_funds",
                                    vec![sc_u64(body.milestone_id)],
                                    &addr,
                                    &st.config.operator_seed_bytes(),
                                    st.config.sequence,
                                    200,
                                    None,
                                    true,
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
            "/escrow/create",
            {
                let st = state.clone();
                post(move |Json(body): Json<CreateReq>| {
                    let st = st.clone();
                    async move {
                        let mode = parse_mode(&body.mode).unwrap_or(CustodyMode::Orka);
                        let pass = st.config.network_passphrase();

                        // Operator defaults to the configured Orka operator account.
                        let op_addr = body
                            .operator
                            .clone()
                            .unwrap_or_else(|| st.config.operator_address.clone());

                        // Build `factory.create_escrow` args in declaration order:
                        // org: Bytes, client: Address, freelancer: Address,
                        // asset: Address, operator: Address, milestones: Vec<MilestoneInit>,
                        // dispute_rules: Option<u32>.
                        let org_arg = sc_bytes(body.org_id.as_bytes());
                        let client_arg = sc_account(&body.client);
                        let freelancer_arg = sc_account(&body.freelancer);
                        let asset_arg = sc_contract(&body.asset);
                        let operator_arg = sc_account(&op_addr);
                        let milestones_arg = sc_milestones(&body.milestones);
                        let dispute_arg = match body.dispute_rules {
                            Some(bp) => ScVal::U32(bp),
                            None => ScVal::Void,
                        };
                        let args = vec![
                            org_arg,
                            client_arg,
                            freelancer_arg,
                            asset_arg,
                            operator_arg,
                            milestones_arg,
                            dispute_arg,
                        ];

                        // Operator signs the inner tx (escrow.initialize requires
                        // operator auth), so operator_inner_sig = true and the
                        // inner tx source account is the operator account.
                        let xdr = build_sponsored(
                            &pass,
                            &st.config.escrow_factory_address,
                            "create_escrow",
                            args,
                            &op_addr,
                            &st.config.operator_seed_bytes(),
                            st.config.sequence,
                            200,
                            None,
                            true,
                        );
                        let xdr = match xdr {
                            Ok(x) => x,
                            Err(_) => return err_json("build_failed"),
                        };

                        match mode {
                            CustodyMode::Orka => {
                                let hash = match submit_to_rpc(
                                    &st.config.stellar_rpc_url,
                                    &xdr,
                                )
                                .await
                                {
                                    Ok(h) => h,
                                    Err(_) => return err_json("rpc_submit_failed"),
                                };
                                let ret = match get_tx_result(
                                    &st.config.stellar_rpc_url,
                                    &hash,
                                )
                                .await
                                {
                                    Ok(r) => r,
                                    Err(_) => return err_json("rpc_result_failed"),
                                };
                                let id = match ScVal::from_xdr_base64(&ret, Limits::none()) {
                                    Ok(ScVal::Address(ScAddress::Contract(Hash(h)))) => h,
                                    _ => return err_json("unexpected_return"),
                                };
                                let contract_id = encode_contract(&id);
                                axum::Json(serde_json::json!({ "contract_id": contract_id }))
                            }
                            CustodyMode::Freighter => {
                                // Wallet signs in-browser as the operator; backend
                                // returns the unsigned XDR. (Operator-as-Freighter is
                                // not fully wired for MVP — documented deviation.)
                                axum::Json(serde_json::json!({ "tx_xdr": xdr }))
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

    #[test]
    fn sponsored_release_has_operator_inner_sig() {
        let inner = build_contract_tx(
            &account_strkey(),
            &contract_strkey(),
            "release_funds",
            vec![sc_u64(1)],
            42,
            100,
        )
        .unwrap();
        let inner_v1 = TransactionV1Envelope {
            tx: inner.clone(),
            signatures: vec![].try_into().unwrap(),
        };
        let inner_payload = TransactionSignaturePayload {
            network_id: network_id(PASSPHRASE),
            tagged_transaction: TransactionSignaturePayloadTaggedTransaction::Tx(
                inner_v1.tx.clone(),
            ),
        };
        let inner_user_sig = sign_payload(&[5u8; 32], &inner_payload);

        let xdr = build_sponsored(
            PASSPHRASE,
            &contract_strkey(),
            "release_funds",
            vec![sc_u64(1)],
            &account_strkey(),
            &operator_seed(),
            42,
            200,
            Some(inner_user_sig),
            true,
        )
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
    }

    #[test]
    fn create_escrow_builds_correct_invocation() {
        let factory = contract_strkey(); // C... [9u8; 32]
        let operator = account_strkey(); // G... [3u8; 32]
        let milestones = vec![MilestoneInitReq {
            amount: 1_000_000,
            description: String::new(),
        }];
        let args = vec![
            sc_bytes(b"org-123"),
            sc_account(&account_strkey()),
            sc_account(&account_strkey()),
            sc_contract(&contract_strkey()),
            sc_account(&operator),
            sc_milestones(&milestones),
            ScVal::U32(5000),
        ];
        let xdr = build_sponsored(
            PASSPHRASE,
            &factory,
            "create_escrow",
            args,
            &operator,
            &operator_seed(),
            42,
            200,
            None,
            true,
        )
        .unwrap();

        let env = TransactionEnvelope::from_xdr_base64(&xdr, Limits::none()).unwrap();
        match env {
            TransactionEnvelope::TxFeeBump(fb) => match fb.tx.inner_tx {
                FeeBumpTransactionInnerTx::Tx(v1) => {
                    // operator_inner_sig = true → exactly 1 inner signature.
                    assert_eq!(v1.signatures.as_slice().len(), 1);
                    match &v1.tx.operations.as_slice()[0].body {
                        OperationBody::InvokeHostFunction(op) => match &op.host_function {
                            HostFunction::InvokeContract(a) => {
                                assert_eq!(a.function_name.to_string(), "create_escrow");
                                match &a.contract_address {
                                    ScAddress::Contract(Hash(h)) => assert_eq!(*h, [9u8; 32]),
                                    _ => panic!("expected contract address"),
                                }
                                // 7 args: org, client, freelancer, asset,
                                // operator, milestones, dispute_rules.
                                assert_eq!(a.args.as_slice().len(), 7);
                            }
                            _ => panic!("expected InvokeContract"),
                        },
                        _ => panic!("expected InvokeHostFunction"),
                    }
                }
            },
            _ => panic!("expected FeeBump envelope"),
        }
    }

    fn sample_tx_meta() -> TransactionMeta {
        TransactionMeta::V3(TransactionMetaV3 {
            ext: ExtensionPoint::V0,
            tx_changes_before: LedgerEntryChanges(Vec::new().try_into().unwrap()),
            operations: Vec::new().try_into().unwrap(),
            tx_changes_after: LedgerEntryChanges(Vec::new().try_into().unwrap()),
            soroban_meta: Some(SorobanTransactionMeta {
                ext: SorobanTransactionMetaExt::V0,
                events: Vec::new().try_into().unwrap(),
                return_value: ScVal::Address(ScAddress::Contract(Hash([7u8; 32]))),
                diagnostic_events: Vec::new().try_into().unwrap(),
            }),
        })
    }

    #[test]
    fn sponsored_inner_fn_name_matches_both_modes() {
        fn check(fn_name: &str, args: Vec<ScVal>) {
            // Orka mode: inner user sig present, no operator inner sig.
            let inner = build_contract_tx(
                &account_strkey(),
                &contract_strkey(),
                fn_name,
                args.clone(),
                42,
                100,
            )
            .unwrap();
            let inner_v1 = TransactionV1Envelope {
                tx: inner.clone(),
                signatures: vec![].try_into().unwrap(),
            };
            let inner_payload = TransactionSignaturePayload {
                network_id: network_id(PASSPHRASE),
                tagged_transaction: TransactionSignaturePayloadTaggedTransaction::Tx(
                    inner_v1.tx.clone(),
                ),
            };
            let client_sig = sign_payload(&[5u8; 32], &inner_payload);

            let xdr_orka = build_sponsored(
                PASSPHRASE,
                &contract_strkey(),
                fn_name,
                args.clone(),
                &account_strkey(),
                &operator_seed(),
                42,
                200,
                Some(client_sig),
                false,
            )
            .unwrap();

            // Freighter mode: no inner user sig.
            let xdr_freighter = build_sponsored(
                PASSPHRASE,
                &contract_strkey(),
                fn_name,
                args.clone(),
                &account_strkey(),
                &operator_seed(),
                42,
                200,
                None,
                false,
            )
            .unwrap();

            for xdr in [xdr_orka, xdr_freighter] {
                let env = TransactionEnvelope::from_xdr_base64(&xdr, Limits::none()).unwrap();
                match env {
                    TransactionEnvelope::TxFeeBump(fb) => match fb.tx.inner_tx {
                        FeeBumpTransactionInnerTx::Tx(v1) => {
                            match &v1.tx.operations.as_slice()[0].body {
                                OperationBody::InvokeHostFunction(op) => {
                                    match &op.host_function {
                                        HostFunction::InvokeContract(a) => {
                                            assert_eq!(a.function_name.to_string(), fn_name);
                                        }
                                        _ => panic!("expected InvokeContract"),
                                    }
                                }
                                _ => panic!("expected InvokeHostFunction"),
                            }
                        }
                    },
                    _ => panic!("expected FeeBump envelope"),
                }
            }
        }

        check("fund", vec![sc_vec_u64(&[1, 2, 3])]);
        check("release_funds", vec![sc_u64(1)]);
    }

    #[test]
    fn extract_return_value_roundtrip() {
        let meta = sample_tx_meta();
        let meta_b64 = meta.to_xdr_base64(Limits::none()).unwrap();

        let rv_b64 = extract_return_value(&meta_b64).unwrap();
        assert!(!rv_b64.is_empty());

        let rv = ScVal::from_xdr_base64(&rv_b64, Limits::none()).unwrap();
        match rv {
            ScVal::Address(ScAddress::Contract(Hash(h))) => assert_eq!(h, [7u8; 32]),
            _ => panic!("expected contract address return value"),
        }
    }
}
