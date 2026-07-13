use crate::bridge::{apply_chain_event, ChainEvent, EventType, MilestoneStatus, SupabaseSink};
use crate::state::AppState;
use crate::stellar::encode_contract;
use serde::{Deserialize, Serialize};
use stellar_xdr::curr::*;
use std::time::Duration;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

#[derive(Debug, thiserror::Error)]
pub enum IndexerError {
    #[error("rpc request failed")]
    Rpc,
    #[error("rpc decode failed")]
    Decode,
}

// ---------------------------------------------------------------------------
// RPC types
// ---------------------------------------------------------------------------

#[derive(Serialize)]
struct RpcRequest<'a> {
    jsonrpc: &'a str,
    id: u32,
    method: &'a str,
    params: serde_json::Value,
}

#[derive(Deserialize)]
struct RpcEvent {
    #[serde(default)]
    contract: String,
    #[serde(default)]
    topics: Vec<String>,
    #[serde(default)]
    value: String,
    #[serde(default, rename = "txHash")]
    tx_hash: String,
    #[serde(default)]
    ledger: u64,
}

// ---------------------------------------------------------------------------
// Status mapping — on-chain EventType -> contract MilestoneStatus
// ---------------------------------------------------------------------------

fn status_for(e: EventType) -> MilestoneStatus {
    match e {
        EventType::Fund => MilestoneStatus::Funded,
        EventType::Submit => MilestoneStatus::Submitted,
        EventType::Approve => MilestoneStatus::Approved,
        EventType::Release => MilestoneStatus::Released,
        EventType::Refund => MilestoneStatus::Refunded,
        EventType::Dispute => MilestoneStatus::Disputed,
        EventType::Resolve => MilestoneStatus::Approved,
        EventType::Initialize => MilestoneStatus::Draft,
    }
}

fn i128_from_parts(p: &Int128Parts) -> i128 {
    ((p.hi as i128) << 64) | (p.lo as i128)
}

/// The decoded, network-independent parts of one on-chain event.
struct DecodedEvent {
    event_type: EventType,
    milestone_index: u64,
    amount: f64,
    #[allow(dead_code)]
    new_contract: Option<String>,
}

/// Decode one RPC event's base64-XDR topics/value into a structured shape.
///
/// Returns `None` (and logs) for any event that is not an `orka` contract
/// event or whose type is unknown — the caller skips those without erroring.
fn decode_event_meta(ev: &RpcEvent) -> Option<DecodedEvent> {
    let t0 = ScVal::from_xdr_base64(ev.topics.get(0)?, Limits::none()).ok()?;
    match t0 {
        ScVal::Symbol(s) if s.to_string() == "orka" => {}
        _ => {
            eprintln!("[indexer] topic[0] is not 'orka'; skipping");
            return None;
        }
    }

    let t1 = ScVal::from_xdr_base64(ev.topics.get(1)?, Limits::none()).ok()?;
    let event_type = match t1 {
        ScVal::Symbol(s) => match s.to_string().as_str() {
            "fund" => EventType::Fund,
            "submit" => EventType::Submit,
            "approve" => EventType::Approve,
            "release" => EventType::Release,
            "refund" => EventType::Refund,
            "dispute" => EventType::Dispute,
            "resolve" => EventType::Resolve,
            "initialize" => EventType::Initialize,
            other => {
                eprintln!("[indexer] unknown event type '{other}'; skipping");
                return None;
            }
        },
        _ => {
            eprintln!("[indexer] topic[1] is not a symbol; skipping");
            return None;
        }
    };

    let value = ScVal::from_xdr_base64(&ev.value, Limits::none()).ok()?;
    match value {
        ScVal::Vec(Some(v)) => {
            let items = v.0.as_slice();
            let milestone_index = match items.get(0)? {
                ScVal::U64(x) => *x,
                _ => {
                    eprintln!("[indexer] value[0] not u64; skipping");
                    return None;
                }
            };
            let amount = match items.get(1)? {
                ScVal::I128(parts) => i128_from_parts(parts) as f64,
                _ => {
                    eprintln!("[indexer] value[1] not i128; skipping");
                    return None;
                }
            };
            Some(DecodedEvent {
                event_type,
                milestone_index,
                amount,
                new_contract: None,
            })
        }
        ScVal::Address(ScAddress::Contract(Hash(id))) => {
            let new_contract = encode_contract(&id);
            eprintln!("[indexer] initialize emitted new contract {new_contract}");
            Some(DecodedEvent {
                event_type,
                milestone_index: 0,
                amount: 0.0,
                new_contract: Some(new_contract),
            })
        }
        _ => {
            eprintln!("[indexer] value neither Vec nor Address; skipping");
            return None;
        }
    }
}

/// Pure, network-free event→ChainEvent mapper used by both `poll_once` and the
/// offline unit tests. `resolver` best-effort maps (contract, milestone_index)
/// → (org_id, project_id, milestone_id); returning `None` skips the event.
pub fn chain_event_from_rpc(
    raw_event_json: &str,
    resolver: &dyn Fn(&str, u64) -> Option<(String, String, String)>,
) -> Option<ChainEvent> {
    let ev: RpcEvent = serde_json::from_str(raw_event_json).ok()?;
    let meta = decode_event_meta(&ev)?;
    let (org_id, project_id, milestone_id) = resolver(&ev.contract, meta.milestone_index)?;
    Some(ChainEvent {
        org_id,
        project_id,
        milestone_id: Some(milestone_id),
        chain_tx: ev.tx_hash,
        event_type: meta.event_type,
        amount: Some(meta.amount),
        asset: None,
        onchain_status: status_for(meta.event_type),
    })
}

// ---------------------------------------------------------------------------
// Best-effort contract -> project -> milestone resolution
// ---------------------------------------------------------------------------

/// Query the Supabase `escrow_contracts` table for the (org_id, project_id,
/// milestone_id) triple tied to a (contract, milestone_index) pair.
///
/// Tolerant by design: any error, missing table, or missing row yields `None`
/// and the calling event is skipped. Insertion of these rows is Task 8.
pub async fn resolve_mapping(
    state: &AppState,
    contract_strkey: &str,
    milestone_index: u64,
) -> Option<(String, String, String)> {
    let url = format!(
        "{}/escrow_contracts?contract_address=eq.{}&select=org_id,project_id,mapping",
        state.supabase.base_url, contract_strkey
    );
    let resp = state
        .supabase
        .client
        .get(&url)
        .header("apikey", &state.supabase.key)
        .header("Authorization", format!("Bearer {}", state.supabase.key))
        .send()
        .await;
    let resp = match resp {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[indexer] resolve_mapping request failed: {e}");
            return None;
        }
    };
    let rows: serde_json::Value = match resp.json().await {
        Ok(j) => j,
        Err(e) => {
            eprintln!("[indexer] resolve_mapping decode failed: {e}");
            return None;
        }
    };
    let row = rows.as_array()?.first()?;
    let org_id = row.get("org_id")?.as_str()?.to_string();
    let project_id = row.get("project_id")?.as_str()?.to_string();
    let mapping = row.get("mapping")?;
    let milestone_id = mapping
        .get(milestone_index.to_string())?
        .as_str()?
        .to_string();
    Some((org_id, project_id, milestone_id))
}

// ---------------------------------------------------------------------------
// Polling
// ---------------------------------------------------------------------------

/// Poll Stellar RPC `getEvents` once (filtered to the escrow factory), decode
/// each `orka` event, resolve the contract→milestone mapping (best-effort),
/// and reconcile via `bridge::apply_chain_event`.
///
/// The loop never panics: per-event decode/resolution/reconcile errors are
/// logged and skipped. Only an RPC-level failure is returned.
pub async fn poll_once(state: &AppState, cursor: &mut u32) -> Result<(), IndexerError> {
    if state.config.escrow_factory_address.is_empty() {
        // Nothing to poll against; stay quiet.
        return Ok(());
    }

    let body = RpcRequest {
        jsonrpc: "2.0",
        id: 1,
        method: "getEvents",
        params: serde_json::json!({
            "startLedger": *cursor,
            "pagination": { "limit": 100 },
            "filters": [
                {
                    "type": "contract",
                    "contract": state.config.escrow_factory_address
                }
            ]
        }),
    };

    let resp = state
        .http
        .post(&state.config.stellar_rpc_url)
        .json(&body)
        .send()
        .await
        .map_err(|e| {
            eprintln!("[indexer] getEvents request failed: {e}");
            IndexerError::Rpc
        })?;

    let json: serde_json::Value = resp.json().await.map_err(|e| {
        eprintln!("[indexer] getEvents decode failed: {e}");
        IndexerError::Decode
    })?;

    let events: Vec<RpcEvent> = match json.pointer("/result/events") {
        Some(v) => serde_json::from_value(v.clone()).unwrap_or_default(),
        None => Vec::new(),
    };

    for ev in &events {
        let meta = match decode_event_meta(ev) {
            Some(m) => m,
            None => continue,
        };
        let resolved = match resolve_mapping(state, &ev.contract, meta.milestone_index).await {
            Some(r) => r,
            None => {
                eprintln!("[indexer] skipping unresolved contract {}", ev.contract);
                continue;
            }
        };
        let (org_id, project_id, milestone_id) = resolved;
        let chain_event = ChainEvent {
            org_id,
            project_id,
            milestone_id: Some(milestone_id),
            chain_tx: ev.tx_hash.clone(),
            event_type: meta.event_type,
            amount: Some(meta.amount),
            asset: None,
            onchain_status: status_for(meta.event_type),
        };
        if let Err(err) = apply_chain_event(
            &SupabaseSink {
                supabase: state.supabase.clone(),
            },
            &chain_event,
        )
        .await
        {
            eprintln!(
                "[indexer] apply_chain_event failed for tx {}: {err:?}",
                chain_event.chain_tx
            );
        }
    }

    // Advance the cursor from the RPC cursor, falling back to (max ledger + 1).
    if let Some(c) = json.pointer("/result/cursor").and_then(|c| c.as_str()) {
        if let Ok(next) = c.parse::<u32>() {
            *cursor = next;
        }
    } else if let Some(ledger) = events.iter().map(|e| e.ledger).max() {
        *cursor = (ledger + 1) as u32;
    }

    Ok(())
}

// ---------------------------------------------------------------------------
// Background loop
// ---------------------------------------------------------------------------

/// Spawn the polling loop (5s interval). Guarded by `INDEXER_ENABLED=truthy`
/// and `cfg!(not(test))` so `cargo test` never spawns it.
pub fn start_indexer(state: AppState) {
    if !cfg!(not(test)) {
        return;
    }
    let enabled = std::env::var("INDEXER_ENABLED")
        .map(|v| matches!(v.to_lowercase().as_str(), "1" | "true" | "yes" | "on"))
        .unwrap_or(false);
    if !enabled {
        tracing::info!("[indexer] disabled (set INDEXER_ENABLED=1 to enable)");
        return;
    }
    tokio::spawn(async move {
        let mut cursor: u32 = 0;
        loop {
            if let Err(e) = poll_once(&state, &mut cursor).await {
                eprintln!("[indexer] poll_once error: {e:?}");
            }
            tokio::time::sleep(Duration::from_secs(5)).await;
        }
    });
}

// ---------------------------------------------------------------------------
// Tests (offline — no network, no testnet)
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use crate::bridge::{apply_chain_event, MockSink};
    use crate::config::Config;

    fn b64(v: &ScVal) -> String {
        v.to_xdr_base64(Limits::none()).unwrap()
    }

    /// Build a `getEvents` event fixture (base64 XDR ScVals for topics/value).
    fn fixture(event_name: &str, milestone_index: u64, amount: i128) -> String {
        let topic0 = b64(&ScVal::Symbol(ScSymbol::try_from("orka").unwrap()));
        let topic1 = b64(&ScVal::Symbol(ScSymbol::try_from(event_name).unwrap()));
        let value = b64(&ScVal::Vec(Some(ScVec(
            vec![
                ScVal::U64(milestone_index),
                ScVal::I128(Int128Parts {
                    hi: (amount >> 64) as i64,
                    lo: amount as u64,
                }),
            ]
            .try_into()
            .unwrap(),
        ))));
        serde_json::json!({
            "contract": "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABOBBVV",
            "topics": [topic0, topic1],
            "value": value,
            "txHash": "tx_fixture",
            "ledger": 123
        })
        .to_string()
    }

    fn resolver_ok(_c: &str, _i: u64) -> Option<(String, String, String)> {
        Some(("org1".into(), "proj1".into(), "m1".into()))
    }

    #[test]
    fn fund_maps_to_funded() {
        let e = chain_event_from_rpc(&fixture("fund", 0, 100), &resolver_ok).unwrap();
        assert_eq!(e.event_type, EventType::Fund);
        assert_eq!(e.onchain_status, MilestoneStatus::Funded);
        assert_eq!(e.amount, Some(100.0));
        assert_eq!(e.milestone_id, Some("m1".into()));
    }

    #[test]
    fn release_maps_to_released() {
        let e = chain_event_from_rpc(&fixture("release", 2, 500), &resolver_ok).unwrap();
        assert_eq!(e.event_type, EventType::Release);
        assert_eq!(e.onchain_status, MilestoneStatus::Released);
        assert_eq!(e.amount, Some(500.0));
    }

    #[test]
    fn unknown_event_returns_none() {
        let e = chain_event_from_rpc(&fixture("frobnicate", 0, 1), &resolver_ok);
        assert!(e.is_none());
    }

    #[test]
    fn missing_resolver_returns_none() {
        let resolver_none = |_c: &str, _i: u64| -> Option<(String, String, String)> { None };
        let e = chain_event_from_rpc(&fixture("fund", 0, 100), &resolver_none);
        assert!(e.is_none());
    }

    #[tokio::test]
    async fn apply_chain_event_writes_expected_status() {
        let sink = MockSink::new();
        let e = chain_event_from_rpc(&fixture("release", 3, 250), &resolver_ok).unwrap();
        apply_chain_event(&sink, &e).await.unwrap();
        assert_eq!(sink.events.lock().unwrap().len(), 1);
        assert_eq!(
            sink.statuses.lock().unwrap().get("m1").map(String::as_str),
            Some("released")
        );
    }

    #[test]
    fn config_constructible() {
        // Smoke check that AppState can be built without a live backend.
        let _ = AppState::new(Config::from_env().expect("config"));
    }
}
