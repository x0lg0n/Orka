use crate::state::{AppState, Supabase};
use async_trait::async_trait;
use axum::http::{HeaderMap, StatusCode};
use axum::{routing::post, Json, Router};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

#[derive(Debug, thiserror::Error)]
pub enum BridgeError {
    #[error("supabase error")]
    Supabase,
    #[error("milestone not found")]
    MissingMilestone,
    #[error("invalid milestone status")]
    InvalidStatus,
    #[error("serialization error")]
    Serialize,
}

// ---------------------------------------------------------------------------
// Event model
// ---------------------------------------------------------------------------

/// On-chain event types that flow from the Soroban escrow contract.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum EventType {
    Fund,
    Submit,
    Approve,
    Release,
    Refund,
    Dispute,
    Resolve,
    Initialize,
}

impl EventType {
    pub fn as_str(self) -> &'static str {
        match self {
            EventType::Fund => "fund",
            EventType::Submit => "submit",
            EventType::Approve => "approve",
            EventType::Release => "release",
            EventType::Refund => "refund",
            EventType::Dispute => "dispute",
            EventType::Resolve => "resolve",
            EventType::Initialize => "initialize",
        }
    }
}

/// Milestone status as reported by the Soroban contract
/// (`contracts/escrow/src/types.rs`). Mirrors that enum 1:1.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MilestoneStatus {
    Draft,
    Funded,
    Submitted,
    Approved,
    Rejected,
    Refunded,
    Disputed,
    Released,
}

/// A single on-chain event to be reconciled into Postgres.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChainEvent {
    pub org_id: String,
    pub project_id: String,
    pub milestone_id: Option<String>,
    pub chain_tx: String,
    pub event_type: EventType,
    pub amount: Option<f64>,
    pub asset: Option<String>,
    pub onchain_status: MilestoneStatus,
}

// ---------------------------------------------------------------------------
// LedgerSink — the only writer of ledger_events + milestone status
// ---------------------------------------------------------------------------

/// `apply_chain_event` is the SINGLE reconciler in `services/`. No other module
/// writes `milestones.status` directly — every status change flows through here.
#[allow(dead_code)]
#[async_trait]
pub trait LedgerSink: Send + Sync {
    async fn upsert_event(&self, e: &ChainEvent) -> Result<(), BridgeError>;
    async fn update_milestone_status(
        &self,
        milestone_id: &str,
        status: &str,
    ) -> Result<(), BridgeError>;
    /// Returns `true` iff the project's escrow is fully funded
    /// (`total_funded >= total_amount`). Used as a defense-in-depth guard so a
    /// milestone `released` event can never be written before the escrow pool
    /// is funded. A missing/unreadable escrow row is treated as not funded.
    async fn is_escrow_funded(&self, project_id: &str) -> bool;
}

/// Supabase-backed sink. Uses the service-role key (bypasses RLS) and performs
/// an idempotent upsert keyed by `chain_tx`. DB errors are logged server-side
/// only and never leaked to the caller.
pub struct SupabaseSink {
    pub supabase: Supabase,
}

impl SupabaseSink {
    fn auth_headers(&self) -> (String, String) {
        let key = &self.supabase.key;
        (format!("Bearer {key}"), key.clone())
    }
}

#[async_trait]
impl LedgerSink for SupabaseSink {
    async fn upsert_event(&self, e: &ChainEvent) -> Result<(), BridgeError> {
        let (bearer, apikey) = self.auth_headers();
        let payload = serde_json::json!({
            "org_id": e.org_id,
            "project_id": e.project_id,
            "milestone_id": e.milestone_id,
            "chain_tx": e.chain_tx,
            "event_type": e.event_type.as_str(),
            "amount": e.amount,
            "asset": e.asset,
            "status": map_status(e.onchain_status),
        });
        let url = format!("{}/ledger_events", self.supabase.base_url);
        let resp = self
            .supabase
            .client
            .post(&url)
            .header("apikey", apikey)
            .header("Authorization", bearer)
            .header("Prefer", "resolution=merge-duplicates")
            .json(&payload)
            .send()
            .await
            .map_err(|err| {
                eprintln!("[bridge] upsert_event request failed: {err}");
                BridgeError::Supabase
            })?;
        if !resp.status().is_success() {
            // Do not leak DB errors to the client; log server-side only.
            eprintln!("[bridge] upsert_event failed: status {}", resp.status());
            return Err(BridgeError::Supabase);
        }
        Ok(())
    }

    async fn update_milestone_status(
        &self,
        milestone_id: &str,
        status: &str,
    ) -> Result<(), BridgeError> {
        let (bearer, apikey) = self.auth_headers();
        let url = format!("{}/milestones?id=eq.{}", self.supabase.base_url, milestone_id);
        let resp = self
            .supabase
            .client
            .patch(&url)
            .header("apikey", apikey)
            .header("Authorization", bearer)
            .header("Prefer", "return=representation")
            .json(&serde_json::json!({ "status": status }))
            .send()
            .await
            .map_err(|err| {
                eprintln!("[bridge] update_milestone_status request failed: {err}");
                BridgeError::Supabase
            })?;
        if !resp.status().is_success() {
            eprintln!(
                "[bridge] update_milestone_status failed: status {}",
                resp.status()
            );
            return Err(BridgeError::Supabase);
        }
        // Supabase returns the updated rows; an empty array means the milestone
        // id does not exist.
        let rows: serde_json::Value = resp
            .json()
            .await
            .map_err(|err| {
                eprintln!("[bridge] update_milestone_status decode failed: {err}");
                BridgeError::Supabase
            })?;
        if rows.as_array().map(|a| a.is_empty()).unwrap_or(true) {
            return Err(BridgeError::MissingMilestone);
        }
        Ok(())
    }

    async fn is_escrow_funded(&self, project_id: &str) -> bool {
        let (bearer, apikey) = self.auth_headers();
        let url = format!(
            "{}/escrow_contracts?project_id=eq.{}&select=total_funded,total_amount",
            self.supabase.base_url, project_id
        );
        let resp = self
            .supabase
            .client
            .get(&url)
            .header("apikey", apikey)
            .header("Authorization", bearer)
            .send()
            .await;
        let resp = match resp {
            Ok(r) => r,
            Err(err) => {
                eprintln!("[bridge] is_escrow_funded request failed: {err}");
                return false;
            }
        };
        let rows: serde_json::Value = match resp.json().await {
            Ok(j) => j,
            Err(err) => {
                eprintln!("[bridge] is_escrow_funded decode failed: {err}");
                return false;
            }
        };
        let row = match rows.as_array().and_then(|a| a.first().cloned()) {
            Some(r) => r,
            None => return false,
        };
        let total_funded = row.get("total_funded").and_then(|v| v.as_f64()).unwrap_or(0.0);
        let total_amount = row.get("total_amount").and_then(|v| v.as_f64()).unwrap_or(0.0);
        total_amount > 0.0 && total_funded >= total_amount
    }
}

/// In-memory sink for tests — records calls and enforces idempotency.
pub struct MockSink {
    pub events: Mutex<Vec<ChainEvent>>,
    pub statuses: Mutex<HashMap<String, String>>,
    /// When `false`, `is_escrow_funded` returns false (simulates an unfunded
    /// escrow so the release guard can be exercised).
    pub escrow_funded: Mutex<bool>,
}

impl MockSink {
    pub fn new() -> Self {
        Self {
            events: Mutex::new(Vec::new()),
            statuses: Mutex::new(HashMap::new()),
            escrow_funded: Mutex::new(true),
        }
    }
}

#[async_trait]
impl LedgerSink for MockSink {
    async fn upsert_event(&self, e: &ChainEvent) -> Result<(), BridgeError> {
        let mut events = self.events.lock().unwrap();
        if let Some(pos) = events.iter().position(|x| x.chain_tx == e.chain_tx) {
            events[pos] = e.clone();
        } else {
            events.push(e.clone());
        }
        Ok(())
    }

    async fn update_milestone_status(
        &self,
        milestone_id: &str,
        status: &str,
    ) -> Result<(), BridgeError> {
        self.statuses
            .lock()
            .unwrap()
            .insert(milestone_id.to_string(), status.to_string());
        Ok(())
    }

    async fn is_escrow_funded(&self, _project_id: &str) -> bool {
        *self.escrow_funded.lock().unwrap()
    }
}

// ---------------------------------------------------------------------------
// Status mapping — on-chain -> Postgres milestone_status enum
// ---------------------------------------------------------------------------

/// Map an on-chain `MilestoneStatus` to the Postgres `milestone_status` string.
///
/// The Postgres enum (`frontend/supabase/phase1_schema.sql`) is intentionally
/// coarser than the contract enum:
///   draft | funded | in_review | released | disputed | refunded
/// Client approval (`Approved`) and re-review (`Rejected`) are reflected by
/// staying in `in_review` until release; if the product later needs distinct
/// `'submitted'` / `'approved'` states, extend the Postgres enum — DO NOT
/// invent a status here that is not in the enum.
pub fn map_status(s: MilestoneStatus) -> &'static str {
    match s {
        MilestoneStatus::Draft => "draft",
        MilestoneStatus::Funded => "funded",
        MilestoneStatus::Submitted => "in_review",
        MilestoneStatus::Approved => "in_review",
        MilestoneStatus::Rejected => "in_review",
        MilestoneStatus::Refunded => "refunded",
        MilestoneStatus::Disputed => "disputed",
        MilestoneStatus::Released => "released",
    }
}

// ---------------------------------------------------------------------------
// Reconciler
// ---------------------------------------------------------------------------

/// THE single reconciler: upserts the ledger_events row and updates the
/// milestone status. This is the only code path in `services/` that writes
/// `milestones.status`.
///
/// Defense-in-depth guard: a milestone `released` event is only written when the
/// project's escrow pool is fully funded. If `escrow_contracts.total_funded <
/// total_amount`, the release is skipped (the ledger event is still recorded for
/// audit) and a warning is logged — no milestone status is flipped without money
/// backing it. This mirrors the UI gate in `nextActionsForRole` and the contract
/// requirement that release_funds needs the funded pool.
pub async fn apply_chain_event(
    sink: &dyn LedgerSink,
    e: &ChainEvent,
) -> Result<(), BridgeError> {
    sink.upsert_event(e).await?;
    if let Some(id) = &e.milestone_id {
        if e.onchain_status == MilestoneStatus::Released
            && !sink.is_escrow_funded(&e.project_id).await
        {
            eprintln!(
                "[bridge] skipping milestone release for {}: escrow not fully funded (project {})",
                id, e.project_id
            );
            return Ok(());
        }
        sink.update_milestone_status(id, map_status(e.onchain_status))
            .await?;
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// HTTP routes
// ---------------------------------------------------------------------------

/// `POST /bridge/event` — reconcile a `ChainEvent` into Postgres.
///
/// Phase 1 access control: the caller must present the service-role bearer
/// token (internal-only). This is a temporary gate documented in the threat
/// model (T-01-05-02); production should additionally restrict by network/VPC
/// and verify an `AuthenticatedUser` authorized for `org_id`.
pub fn routes(state: &AppState) -> Router {
    Router::new().route(
        "/bridge/event",
        {
            let st = state.clone();
            post(move |headers: HeaderMap, Json(body): Json<ChainEvent>| {
                let st = st.clone();
                async move {
                    let expected = format!("Bearer {}", st.supabase.key);
                    let authorized = headers
                        .get(axum::http::header::AUTHORIZATION)
                        .and_then(|v| v.to_str().ok())
                        .map(|v| v == expected)
                        .unwrap_or(false);
                    if !authorized {
                        return (
                            StatusCode::UNAUTHORIZED,
                            Json(serde_json::json!({ "error": "unauthorized" })),
                        );
                    }
                    let sink = SupabaseSink {
                        supabase: st.supabase.clone(),
                    };
                    match apply_chain_event(&sink, &body).await {
                        Ok(()) => (
                            StatusCode::OK,
                            Json(serde_json::json!({ "ok": true })),
                        ),
                        Err(_) => (
                            StatusCode::INTERNAL_SERVER_ERROR,
                            Json(serde_json::json!({ "error": "reconcile_failed" })),
                        ),
                    }
                }
            })
        },
    )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::Request;
    use tower::ServiceExt;

    fn sample_event() -> ChainEvent {
        ChainEvent {
            org_id: "org_1".into(),
            project_id: "proj_1".into(),
            milestone_id: Some("m_1".into()),
            chain_tx: "tx_abc".into(),
            event_type: EventType::Release,
            amount: Some(100.0),
            asset: Some("USDC".into()),
            onchain_status: MilestoneStatus::Released,
        }
    }

    #[test]
    fn errors_construct() {
        // Ensure every BridgeError variant is constructed (silences dead_code).
        let _ = BridgeError::Supabase;
        let _ = BridgeError::MissingMilestone;
        let _ = BridgeError::InvalidStatus;
        let _ = BridgeError::Serialize;
    }

    #[test]
    fn map_status_covers_all() {
        for s in [
            MilestoneStatus::Draft,
            MilestoneStatus::Funded,
            MilestoneStatus::Submitted,
            MilestoneStatus::Approved,
            MilestoneStatus::Rejected,
            MilestoneStatus::Refunded,
            MilestoneStatus::Disputed,
            MilestoneStatus::Released,
        ] {
            assert!(!map_status(s).is_empty(), "status for {s:?} must be non-empty");
        }
    }

    #[tokio::test]
    async fn sink_records_event_and_status() {
        let sink = MockSink::new();
        let e = sample_event();
        apply_chain_event(&sink, &e).await.unwrap();
        assert_eq!(sink.events.lock().unwrap().len(), 1);
        assert_eq!(
            sink.statuses.lock().unwrap().get("m_1").map(String::as_str),
            Some("released")
        );
    }

    #[tokio::test]
    async fn apply_is_idempotent_on_chain_tx() {
        let sink = MockSink::new();
        let e = sample_event();
        apply_chain_event(&sink, &e).await.unwrap();
        apply_chain_event(&sink, &e).await.unwrap();
        // Same chain_tx must not create a duplicate ledger row.
        assert_eq!(sink.events.lock().unwrap().len(), 1);
    }

    #[tokio::test]
    async fn apply_without_milestone_skips_status() {
        let sink = MockSink::new();
        let mut e = sample_event();
        e.milestone_id = None;
        apply_chain_event(&sink, &e).await.unwrap();
        assert_eq!(sink.events.lock().unwrap().len(), 1);
        assert!(sink.statuses.lock().unwrap().is_empty());
    }

    #[tokio::test]
    async fn release_skipped_when_escrow_unfunded() {
        let sink = MockSink::new();
        // Simulate an escrow that is NOT fully funded.
        *sink.escrow_funded.lock().unwrap() = false;
        let mut e = sample_event();
        e.onchain_status = MilestoneStatus::Released;
        apply_chain_event(&sink, &e).await.unwrap();
        // Ledger event recorded for audit…
        assert_eq!(sink.events.lock().unwrap().len(), 1);
        // …but the milestone status must NOT be flipped to "released".
        assert!(
            sink.statuses.lock().unwrap().get("m_1").is_none(),
            "release must be skipped before escrow is funded"
        );
    }

    #[tokio::test]
    async fn release_written_when_escrow_funded() {
        let sink = MockSink::new();
        *sink.escrow_funded.lock().unwrap() = true;
        let mut e = sample_event();
        e.onchain_status = MilestoneStatus::Released;
        apply_chain_event(&sink, &e).await.unwrap();
        assert_eq!(
            sink.statuses.lock().unwrap().get("m_1").map(String::as_str),
            Some("released")
        );
    }

    // Test-only router that injects a MockSink so the route can be exercised
    // without a live Supabase.
    fn routes_with_sink(sink: Arc<dyn LedgerSink>) -> Router {
        Router::new().route(
            "/bridge/event",
            post(move |Json(body): Json<ChainEvent>| {
                let sink = sink.clone();
                async move {
                    match apply_chain_event(&*sink, &body).await {
                        Ok(()) => (
                            StatusCode::OK,
                            Json(serde_json::json!({ "ok": true })),
                        ),
                        Err(_) => (
                            StatusCode::INTERNAL_SERVER_ERROR,
                            Json(serde_json::json!({ "error": "reconcile_failed" })),
                        ),
                    }
                }
            }),
        )
    }

    #[tokio::test]
    async fn route_returns_200_and_records_event() {
        let sink = Arc::new(MockSink::new());
        let router = routes_with_sink(sink.clone());
        let body = serde_json::to_string(&sample_event()).unwrap();
        let req = Request::builder()
            .method("POST")
            .uri("/bridge/event")
            .header("content-type", "application/json")
            .body(Body::from(body))
            .unwrap();
        let res = router.oneshot(req).await.unwrap();
        assert_eq!(res.status(), StatusCode::OK);
        assert_eq!(sink.events.lock().unwrap().len(), 1);
    }
}
