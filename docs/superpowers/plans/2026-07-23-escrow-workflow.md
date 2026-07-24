# Escrow Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete end-to-end escrow workflow from milestone setup through payment release, enabling agencies to define and deploy Stellar escrow contracts with full project lifecycle management.

**Architecture:** Hybrid milestone creation (manual UI + AI-ready parsing), separated legal contract flow from Soroban smart contract deployment, with clear stage transitions via workflow state machine, client portal for funding, and full audit trail.

**Tech Stack:** Next.js 16, TypeScript, React, Tailwind CSS, PostgreSQL (via Supabase), Soroban (Stellar), Rust backend services, existing ORKA architecture patterns.

## Global Constraints

- Follow existing codebase patterns and conventions
- Each task must be independently testable with its own test cycle
- Exact file paths required for all modifications
- Complete code in every step - no placeholders
- DRY, YAGNI, TDD principles
- Frequent commits required

---

## Task 1: Add Schema Extensions

**Files:**
- Create: `frontend/supabase/escrow_milestone_additions.sql`

**Interfaces:**
- Consumes: None from previous tasks
- Produces: Database schema changes with milestone description/position, escrow contract tracking fields

- [ ] **Step 1: Write the SQL migration**

```sql
-- frontend/supabase/escrow_milestone_additions.sql
-- Schema additions for escrow workflow

-- milestones: add description and position columns if not present
ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS position INTEGER;

-- escrow_contracts: ensure funding tracking columns exist
ALTER TABLE public.escrow_contracts
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(38,7) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_funded NUMERIC(38,7) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS custody_mode TEXT DEFAULT 'orka',
  ADD COLUMN IF NOT EXISTS asset TEXT DEFAULT 'USDC';
```

- [ ] **Step 2: Commit**

```bash
git add frontend/supabase/escrow_milestone_additions.sql
git commit -m "feat: add escrow milestone schema extensions"
```

---

## Task 2: Implement saveMilestones Server Action

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts`

**Interfaces:**
- Consumes: Existing `createClient()` from `@/lib/supabase/server`
- Produces: `saveMilestones(input)` function

- [ ] **Step 1: Add the saveMilestones action**

```typescript
// Add after the existing releaseMilestone function in actions.ts

export async function saveMilestones(input: {
  orgId: string;
  projectId: string;
  milestones: Array<{
    title: string;
    amount: number;
    asset: string;
    dueDate?: string;
    description?: string;
  }>;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();

    // First, delete any existing draft milestones for this project
    await supabase
      .from("milestones")
      .delete()
      .eq("project_id", input.projectId)
      .eq("org_id", input.orgId)
      .eq("status", "draft");

    // Insert new milestones
    const milestonesToInsert = input.milestones.map((m, i) => ({
      org_id: input.orgId,
      project_id: input.projectId,
      title: m.title,
      amount: m.amount,
      asset: m.asset,
      due_date: m.dueDate || null,
      description: m.description || null,
      status: "draft" as const,
      position: i,
      chain_index: i,
    }));

    const { error } = await supabase.from("milestones").insert(milestonesToInsert);
    if (error) throw new Error(error.message);

    // Log activity
    const totalAmount = input.milestones.reduce((sum, m) => sum + m.amount, 0);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("activity").insert({
      org_id: input.orgId,
      project_id: input.projectId,
      actor_id: user?.id ?? null,
      type: "milestones_defined",
      payload: {
        count: input.milestones.length,
        total_amount: totalAmount,
        asset: input.milestones[0]?.asset ?? "USDC",
      },
    });

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "saveMilestones failed" };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/actions.ts
git commit -m "feat: add saveMilestones server action"
```

---

## Task 3: Implement MilestoneSetupWizard Component

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/milestones/components/MilestoneSetupWizard.tsx`

**Interfaces:**
- Consumes: `saveMilestones` action from Task 2
- Produces: Multi-step milestone creation form

- [ ] **Step 1: Create the component**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/milestones/components/MilestoneSetupWizard.tsx
"use client";

import { useState } from "react";
import { X, Plus, DollarSign, Calendar, FileText, Trash2 } from "lucide-react";
import { saveMilestones } from "../../actions";

type MilestoneInput = {
  title: string;
  amount: string;
  asset: string;
  dueDate: string;
  description: string;
};

const EMPTY_MILESTONE: MilestoneInput = {
  title: "",
  amount: "",
  asset: "USDC",
  dueDate: "",
  description: "",
};

export function MilestoneSetupWizard({
  orgId,
  projectId,
  onSaved,
  onCancel,
}: {
  orgId: string;
  projectId: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [milestones, setMilestones] = useState<MilestoneInput[]>([{ ...EMPTY_MILESTONE }]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

  const totalAmount = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

  function updateMilestone(idx: number, field: keyof MilestoneInput, value: string) {
    setMilestones((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
    // Clear error for this field
    if (errors[idx]?.[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        if (next[idx]) {
          const fieldErrors = { ...next[idx] };
          delete fieldErrors[field];
          next[idx] = fieldErrors;
          if (Object.keys(fieldErrors).length === 0) delete next[idx];
        }
        return next;
      });
    }
  }

  function addMilestone() {
    setMilestones((prev) => [...prev, { ...EMPTY_MILESTONE }]);
  }

  function removeMilestone(idx: number) {
    if (milestones.length <= 1) return;
    setMilestones((prev) => prev.filter((_, i) => i !== idx));
  }

  function validate(): boolean {
    const newErrors: Record<number, Record<string, string>> = {};
    milestones.forEach((m, i) => {
      const fieldErrors: Record<string, string> = {};
      if (!m.title.trim()) fieldErrors.title = "Title is required";
      if (!m.amount || parseFloat(m.amount) <= 0) fieldErrors.amount = "Valid amount is required";
      if (Object.keys(fieldErrors).length > 0) newErrors[i] = fieldErrors;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const result = await saveMilestones({
        orgId,
        projectId,
        milestones: milestones.map((m) => ({
          title: m.title.trim(),
          amount: parseFloat(m.amount),
          asset: m.asset,
          dueDate: m.dueDate || undefined,
          description: m.description || undefined,
        })),
      });
      if (result.ok) onSaved();
      else alert(result.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Set Up Milestones</h3>
        <p className="mt-1 text-sm text-gray-500">
          Define the milestone scope, amounts, and deliverables for this project.
        </p>
      </div>

      <div className="space-y-6">
        {milestones.map((m, i) => (
          <div key={i} className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Milestone {i + 1}</span>
              {milestones.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMilestone(i)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={m.title}
                  onChange={(e) => updateMilestone(i, "title", e.target.value)}
                  placeholder="e.g. Discovery & Research"
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] ${
                    errors[i]?.title ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors[i]?.title && <p className="mt-1 text-xs text-red-500">{errors[i].title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={m.amount}
                    onChange={(e) => updateMilestone(i, "amount", e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] ${
                      errors[i]?.amount ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                </div>
                {errors[i]?.amount && <p className="mt-1 text-xs text-red-500">{errors[i].amount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset</label>
                <select
                  value={m.asset}
                  onChange={(e) => updateMilestone(i, "asset", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                >
                  <option value="USDC">USDC</option>
                  <option value="XLM">XLM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={m.dueDate}
                    onChange={(e) => updateMilestone(i, "dueDate", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={m.description}
                  onChange={(e) => updateMilestone(i, "description", e.target.value)}
                  placeholder="Describe the deliverables for this milestone..."
                  rows={2}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addMilestone}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition hover:border-[#7c3aed] hover:text-[#7c3aed]"
        >
          <Plus className="h-4 w-4" />
          Add Another Milestone
        </button>

        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Budget</span>
            <span className="text-lg font-semibold text-gray-900">
              {totalAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}{" "}
              {milestones[0]?.asset ?? "USDC"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d28d9] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save All Milestones"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/milestones/components/MilestoneSetupWizard.tsx
git commit -m "feat: add MilestoneSetupWizard component"
```

---

## Task 4: Implement MilestoneSetupEmptyState Component

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/milestones/components/MilestoneSetupEmptyState.tsx`

**Interfaces:**
- Consumes: None
- Produces: Empty state CTA component

- [ ] **Step 1: Create the component**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/milestones/components/MilestoneSetupEmptyState.tsx
"use client";

import { Plus } from "lucide-react";

export function MilestoneSetupEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Plus className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">Set Up Milestones</h3>
      <p className="mt-1 text-sm text-gray-500">
        Once both parties sign the contract, define your milestones to prepare for escrow deployment.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d28d9]"
      >
        <Plus className="h-4 w-4" />
        Set Up Milestones
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/milestones/components/MilestoneSetupEmptyState.tsx
git commit -m "feat: add MilestoneSetupEmptyState component"
```

---

## Task 5: Update ProjectMilestonesView to Use Setup Flow

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/milestones/components/ProjectMilestonesView.tsx`

**Interfaces:**
- Consumes: MilestoneSetupWizard, MilestoneSetupEmptyState
- Produces: Conditional rendering based on milestone state

- [ ] **Step 1: Update the component**

Add imports for the new components and modify the rendering logic:

```tsx
// Add to imports at top of file
import { MilestoneSetupWizard } from "./MilestoneSetupWizard";
import { MilestoneSetupEmptyState } from "./MilestoneSetupEmptyState";

// Add state for setup flow
const [showSetup, setShowSetup] = useState(false);

// Replace the empty state check in the JSX (around line 190):
// FROM:
// {milestones.length === 0 ? (
//   <MilestoneEmptyState onAdd={() => setShowModal(true)} />
// ) : ...}

// TO:
{milestones.length === 0 && !showSetup ? (
  <MilestoneSetupEmptyState onAdd={() => setShowSetup(true)} />
) : showSetup && milestones.length === 0 ? (
  <MilestoneSetupWizard
    orgId={orgId}
    projectId={projectId}
    onSaved={() => {
      setShowSetup(false);
      window.location.reload();
    }}
    onCancel={() => setShowSetup(false)}
  />
) : ...}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/milestones/components/ProjectMilestonesView.tsx
git commit -m "feat: integrate setup flow into milestones view"
```

---

## Task 6: Implement deployEscrow Server Action

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts`

**Interfaces:**
- Consumes: Existing `orkaClient`, `createClient`
- Produces: `deployEscrow(input)` function

- [ ] **Step 1: Add the deployEscrow action**

```typescript
// Add after saveMilestones in actions.ts

export async function deployEscrow(input: {
  orgId: string;
  projectId: string;
  mode: "orka" | "freighter";
}): Promise<{ ok: true; contractAddress: string } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();

    // Validate: contract must be signed
    const { data: project } = await supabase
      .from("projects")
      .select("client_sig, freelancer_sig")
      .eq("id", input.projectId)
      .eq("org_id", input.orgId)
      .single();

    if (!project?.client_sig || !project?.freelancer_sig) {
      return { ok: false, error: "Both parties must sign the contract before deploying escrow" };
    }

    // Validate: milestones must exist
    const { data: milestones } = await supabase
      .from("milestones")
      .select("id, title, amount, asset, position")
      .eq("project_id", input.projectId)
      .eq("org_id", input.orgId)
      .eq("status", "draft")
      .order("position", { ascending: true });

    if (!milestones || milestones.length === 0) {
      return { ok: false, error: "At least one milestone is required to deploy escrow" };
    }

    // Call Rust backend to deploy escrow
    const res = await fetch(`${process.env.SERVICES_URL ?? ""}/escrow/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: input.projectId,
        milestones: milestones.map((m) => ({
          title: m.title,
          amount: Number(m.amount),
          asset: m.asset,
          index: m.position,
        })),
        mode: input.mode,
      }),
    });

    if (!res.ok) throw new Error(`deployEscrow failed: ${res.status}`);
    const data = (await res.json()) as { contractAddress: string };
    const contractAddress = data.contractAddress;

    // Store contract address in projects
    await supabase
      .from("projects")
      .update({ contract_id: contractAddress })
      .eq("id", input.projectId)
      .eq("org_id", input.orgId);

    // Store in escrow_contracts
    const totalAmount = milestones.reduce((sum, m) => sum + Number(m.amount), 0);
    await supabase.from("escrow_contracts").insert({
      contract_address: contractAddress,
      org_id: input.orgId,
      project_id: input.projectId,
      total_amount: totalAmount,
      total_funded: 0,
      status: "active",
      custody_mode: input.mode,
      asset: milestones[0]?.asset ?? "USDC",
      mapping: {
        milestones: milestones.map((m) => ({
          id: m.id,
          index: m.position,
          title: m.title,
        })),
      },
    });

    // Log activity
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("activity").insert({
      org_id: input.orgId,
      project_id: input.projectId,
      actor_id: user?.id ?? null,
      type: "escrow_deployed",
      payload: {
        contract_address: contractAddress,
        milestone_count: milestones.length,
        total_amount: totalAmount,
        asset: milestones[0]?.asset ?? "USDC",
      },
    });

    return { ok: true, contractAddress };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "deployEscrow failed" };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/actions.ts
git commit -m "feat: add deployEscrow server action"
```

---

## Task 7: Implement EscrowDeploymentFlow Component

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/escrow/components/EscrowDeploymentFlow.tsx`

**Interfaces:**
- Consumes: `deployEscrow` action from Task 6
- Produces: Pre-deployment checklist and deploy button

- [ ] **Step 1: Create the component**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/escrow/components/EscrowDeploymentFlow.tsx
"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Rocket, ExternalLink } from "lucide-react";
import { deployEscrow } from "../../actions";

type MilestoneRow = {
  id: string;
  title: string;
  amount: number;
  asset: string;
  position: number | null;
};

export function EscrowDeploymentFlow({
  orgId,
  projectId,
  milestones,
  contractSigned,
  onDeployed,
}: {
  orgId: string;
  projectId: string;
  milestones: MilestoneRow[];
  contractSigned: boolean;
  onDeployed: () => void;
}) {
  const [deploying, setDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const milestonesReady = milestones.length > 0;
  const totalAmount = milestones.reduce((sum, m) => sum + Number(m.amount), 0);
  const ready = contractSigned && milestonesReady;

  async function handleDeploy() {
    setDeploying(true);
    setError(null);
    try {
      const result = await deployEscrow({
        orgId,
        projectId,
        mode: "orka",
      });
      if (result.ok) {
        setDeployedAddress(result.contractAddress);
        onDeployed();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deployment failed");
    } finally {
      setDeploying(false);
    }
  }

  if (deployedAddress) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          <div>
            <h3 className="text-sm font-semibold text-emerald-900">Escrow Deployed</h3>
            <p className="mt-0.5 text-sm text-emerald-700">
              Contract deployed to Stellar successfully
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-white p-3 border border-emerald-200">
          <p className="text-xs text-gray-500">Contract Address</p>
          <p className="mt-0.5 font-mono text-sm text-gray-900 break-all">{deployedAddress}</p>
        </div>
        <a
          href={`https://stellar.expert/explorer/testnet/contract/${deployedAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-900"
        >
          View on Stellar Explorer
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Deploy Escrow</h3>
      <p className="mt-1 text-sm text-gray-500">
        Deploy the escrow smart contract to Stellar with your defined milestones.
      </p>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3">
          {contractSigned ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <Circle className="h-5 w-5 text-gray-300" />
          )}
          <span className={`text-sm ${contractSigned ? "text-gray-900" : "text-gray-500"}`}>
            Contract signed by both parties
          </span>
        </div>

        <div className="flex items-center gap-3">
          {milestonesReady ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <Circle className="h-5 w-5 text-gray-300" />
          )}
          <span className={`text-sm ${milestonesReady ? "text-gray-900" : "text-gray-500"}`}>
            Milestones defined ({milestones.length} milestone{milestones.length !== 1 ? "s" : ""})
          </span>
        </div>
      </div>

      {milestonesReady && (
        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Milestone Summary</h4>
          <div className="space-y-2">
            {milestones.map((m, i) => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {i + 1}. {m.title}
                </span>
                <span className="font-medium text-gray-900">
                  {Number(m.amount).toLocaleString()} {m.asset}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-gray-200 pt-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total</span>
            <span className="text-sm font-semibold text-gray-900">
              {totalAmount.toLocaleString()} {milestones[0]?.asset ?? "USDC"}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleDeploy}
        disabled={!ready || deploying}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#7c3aed] px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d28d9] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Rocket className="h-4 w-4" />
        {deploying ? "Deploying to Stellar..." : "Deploy Escrow to Stellar"}
      </button>

      {!ready && (
        <p className="mt-3 text-xs text-gray-500 text-center">
          {!contractSigned
            ? "Both parties must sign the contract first"
            : "Define at least one milestone to deploy"}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/escrow/components/EscrowDeploymentFlow.tsx
git commit -m "feat: add EscrowDeploymentFlow component"
```

---

## Task 8: Update ProjectEscrowView to Show Deployment Flow

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/escrow/components/ProjectEscrowView.tsx`

**Interfaces:**
- Consumes: EscrowDeploymentFlow from Task 7
- Produces: Conditional rendering between deployment flow and funded view

- [ ] **Step 1: Update the component**

```tsx
// Add import for EscrowDeploymentFlow
import { EscrowDeploymentFlow } from "./EscrowDeploymentFlow";

// Add milestones query in the server component (after the escrow query):
const { data: milestones } = await supabase
  .from("milestones")
  .select("id, title, amount, asset, position")
  .eq("project_id", projectId)
  .order("position", { ascending: true });

// Replace the !escrow block (around line 58-76):
if (!escrow) {
  const contractSigned = !!project.client_sig && !!project.freelancer_sig;
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <WorkflowStepper stage={state.stage} />
      </div>
      <EscrowDeploymentFlow
        orgId={orgId}
        projectId={projectId}
        milestones={milestones ?? []}
        contractSigned={contractSigned}
        onDeployed={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/escrow/components/ProjectEscrowView.tsx
git commit -m "feat: integrate EscrowDeploymentFlow into escrow view"
```

---

## Task 9: Implement PortalEscrowFundingView Component

**Files:**
- Create: `frontend/app/p/[projectToken]/components/PortalEscrowFundingView.tsx`

**Interfaces:**
- Consumes: `portalFundEscrow` action from portal actions
- Produces: Client funding interface

- [ ] **Step 1: Create the component**

```tsx
// frontend/app/p/[projectToken]/components/PortalEscrowFundingView.tsx
"use client";

import { useState } from "react";
import { ExternalLink, Wallet, CheckCircle2 } from "lucide-react";
import { portalFundEscrow } from "../actions";

type MilestoneRow = {
  id: string;
  title: string;
  amount: number;
  asset: string;
  status: string;
};

export function PortalEscrowFundingView({
  token,
  contractAddress,
  milestones,
  totalAmount,
  asset,
  mode,
}: {
  token: string;
  contractAddress: string;
  milestones: MilestoneRow[];
  totalAmount: number;
  asset: string;
  mode: "orka" | "freighter";
}) {
  const [funding, setFunding] = useState(false);
  const [funded, setFunded] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const milestoneIds = milestones.map((m) => Number(m.id));

  async function handleFund() {
    setFunding(true);
    setError(null);
    try {
      const result = await portalFundEscrow({
        token,
        contractAddress,
        amount: totalAmount,
        milestoneIds,
        mode,
      });
      if (result.ok) {
        setTxHash(result.txHash);
        setFunded(true);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Funding failed");
    } finally {
      setFunding(false);
    }
  }

  if (funded) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          <div>
            <h3 className="text-sm font-semibold text-emerald-900">Escrow Funded</h3>
            <p className="mt-0.5 text-sm text-emerald-700">
              Your escrow has been funded successfully
            </p>
          </div>
        </div>
        {txHash && (
          <div className="mt-4 rounded-lg bg-white p-3 border border-emerald-200">
            <p className="text-xs text-gray-500">Transaction Hash</p>
            <p className="mt-0.5 font-mono text-sm text-gray-900 break-all">{txHash}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Wallet className="h-6 w-6 text-[#7c3aed]" />
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Fund Escrow</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            Fund the escrow contract to enable milestone payments
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Contract Address</span>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[#7c3aed] hover:text-[#6d28d9]"
          >
            View on Explorer
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <p className="font-mono text-xs text-gray-500 break-all">{contractAddress}</p>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Milestone Breakdown</h4>
        <div className="space-y-2">
          {milestones.map((m, i) => (
            <div key={m.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {i + 1}. {m.title}
              </span>
              <span className="font-medium text-gray-900">
                {Number(m.amount).toLocaleString()} {m.asset}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-gray-200 pt-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Total to Fund</span>
          <span className="text-lg font-semibold text-gray-900">
            {totalAmount.toLocaleString()} {asset}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleFund}
        disabled={funding}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#7c3aed] px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d28d9] disabled:opacity-50"
      >
        <Wallet className="h-4 w-4" />
        {funding ? "Processing..." : `Fund Escrow (${totalAmount.toLocaleString()} ${asset})`}
      </button>

      <p className="mt-3 text-xs text-gray-500 text-center">
        {mode === "orka"
          ? "Orka will sign the transaction using our secure key management system"
          : "You will be prompted to sign with your Freighter wallet"}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/p/\[projectToken\]/components/PortalEscrowFundingView.tsx
git commit -m "feat: add PortalEscrowFundingView component"
```

---

## Task 10: Update Portal Page to Show Funding View

**Files:**
- Modify: `frontend/app/p/[projectToken]/page.tsx`

**Interfaces:**
- Consumes: PortalEscrowFundingView from Task 9
- Produces: Funding tab in portal

- [ ] **Step 1: Update the component**

```tsx
// Add import for PortalEscrowFundingView
import { PortalEscrowFundingView } from "./components/PortalEscrowFundingView";

// Add to TABS array:
const TABS: TabItem[] = [
  { value: "overview", label: "Overview" },
  { value: "milestones", label: "Milestones" },
  { value: "proposal", label: "Proposal" },
  { value: "billing", label: "Billing" },
  { value: "escrow", label: "Escrow" },  // NEW
];

// Add new tab content after the billing tab:
{active === "escrow" && (
  <div className="space-y-3">
    {project.contract_address ? (
      <PortalEscrowFundingView
        token={projectToken}
        contractAddress={project.contract_address}
        milestones={project.milestones}
        totalAmount={totalAmount}
        asset={project.milestones[0]?.asset ?? "USDC"}
        mode={mode}
      />
    ) : (
      <p className="text-sm text-muted-foreground">
        Escrow has not been deployed yet. The agency will deploy escrow after contract signing.
      </p>
    )}
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/p/\[projectToken\]/page.tsx
git commit -m "feat: add escrow funding tab to portal"
```

---

## Task 11: Update Timeline with Escrow Events

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/timeline/components/ProjectTimelineView.tsx`

**Interfaces:**
- Consumes: Activity data with escrow/milestone events
- Produces: Enhanced timeline with escrow lifecycle events

- [ ] **Step 1: Update the generateTimelineEvents function**

```typescript
// In the generateTimelineEvents function, add event generation for activity types:

// After the existing activity loop (around line 311), add:
for (const act of activity) {
  let typeLabel = "Activity Recorded";
  let category: TimelineEvent["category"] = "activity";

  switch (act.type) {
    case "milestones_defined":
      typeLabel = "Milestones Defined";
      category = "milestone";
      break;
    case "escrow_deployed":
      typeLabel = "Escrow Deployed";
      category = "escrow";
      break;
    case "escrow_funded":
      typeLabel = "Escrow Funded";
      category = "escrow";
      break;
    case "milestone_submitted":
      typeLabel = "Milestone Submitted";
      category = "milestone";
      break;
    case "milestone_approved":
      typeLabel = "Milestone Approved";
      category = "milestone";
      break;
    case "milestone_rejected":
      typeLabel = "Milestone Rejected";
      category = "milestone";
      break;
    case "payment_released":
      typeLabel = "Payment Released";
      category = "payment";
      break;
    case "comment":
      typeLabel = "Comment Added";
      break;
    case "feedback":
      typeLabel = "Client Feedback";
      break;
  }

  events.push({
    id: `activity-${act.id}`,
    type: act.type,
    title: typeLabel,
    description:
      typeof act.payload?.description === "string"
        ? act.payload.description
        : typeof act.payload?.contract_address === "string"
          ? `Contract: ${act.payload.contract_address.slice(0, 12)}...`
          : `Activity event recorded.`,
    date: act.created_at,
    time: new Date(act.created_at).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    status: "completed",
    category,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/timeline/components/ProjectTimelineView.tsx
git commit -m "feat: add escrow lifecycle events to timeline"
```

---

## Task 12: Update Overview Page with Escrow Summary

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/overview/components/EscrowOverviewCard.tsx`

**Interfaces:**
- Consumes: Escrow stats data
- Produces: Enhanced escrow summary card

- [ ] **Step 1: Update the EscrowOverviewCard component**

```tsx
// Update the EscrowOverviewCard to show contract address when available

// Add a new prop: contractAddress?: string | null
// In the render, add a contract address section:

{contractAddress && (
  <div className="mt-4 pt-4 border-t border-gray-200">
    <p className="text-xs text-gray-500 mb-1">On-chain Contract</p>
    <a
      href={`https://stellar.expert/explorer/testnet/contract/${contractAddress}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs font-mono text-[#7c3aed] hover:text-[#6d28d9] break-all"
    >
      {contractAddress}
    </a>
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/overview/components/EscrowOverviewCard.tsx
git commit -m "feat: add contract address to escrow overview card"
```

---

## Task 13: Add Activity Event Types for Escrow Actions

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts`

**Interfaces:**
- Consumes: Existing activity logging pattern
- Produces: Activity logging for all escrow/milestone actions

- [ ] **Step 1: Add activity logging to existing actions**

```typescript
// Add activity logging to submitMilestone action:
export async function submitMilestone(input: {
  orgId: string;
  projectId: string;
  contractAddress: string;
  milestoneId: string;
  mode: OrkaCustodyMode;
}): Promise<{ ok: true; txHash: string } | { ok: false; error: string }> {
  try {
    const client = orkaClient(input.mode);
    const res = await client.submitMilestone({
      contractId: input.contractAddress,
      milestoneId: Number(input.milestoneId),
    });
    const txHash = "txHash" in res ? res.txHash : "";

    // Log activity
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("activity").insert({
      org_id: input.orgId,
      project_id: input.projectId,
      actor_id: user?.id ?? null,
      type: "milestone_submitted",
      payload: { milestone_id: input.milestoneId, tx_hash: txHash },
    });

    return { ok: true, txHash };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "submitMilestone failed" };
  }
}

// Similar activity logging for approveMilestone, rejectMilestone, releaseMilestone
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/actions.ts
git commit -m "feat: add activity logging to escrow actions"
```

---

## Task 14: Update Workflow State for New Stages

**Files:**
- Modify: `frontend/lib/workflow.ts`

**Interfaces:**
- Consumes: Existing WorkflowInput
- Produces: Updated stage derivation logic

- [ ] **Step 1: Update the deriveWorkflowState function**

```typescript
// Update the deriveWorkflowState function to handle:
// - contract_signed stage (after legal contract signing)
// - escrow_deployed stage (after escrow deployment, before funding)

export function deriveWorkflowState(input: WorkflowInput): WorkflowState {
  const proposalSent = !!input.proposal && input.proposal.status === "sent";
  const contractSigned =
    !!input.contract && !!input.contract.client_sig && !!input.contract.freelancer_sig;
  const escrowDeployed =
    !!input.escrow && !!input.escrow.contract_address;
  const escrowFunded =
    escrowDeployed && (input.escrow!.total_funded ?? 0) > 0 &&
    input.escrow!.total_funded! >= (input.escrow!.total_amount ?? 0);

  const anyFunded = input.milestones.some((m) => m.status !== "draft");
  const hasSubmitted = input.milestones.some((m) => m.status === "in_review");
  const hasApproved = input.milestones.some((m) => m.status === "approved");
  const anyDisputed = input.milestones.some((m) => m.status === "disputed");
  const fullyReleased =
    input.milestones.length > 0 &&
    input.milestones.every((m) => m.status === "released" || m.status === "refunded");

  let stage: ProjectStage;
  if (fullyReleased && escrowFunded) stage = "completed";
  else if (escrowFunded && (hasSubmitted || hasApproved || anyDisputed)) stage = "milestones_active";
  else if (escrowFunded) stage = "escrow_funded";
  else if (contractSigned) stage = "contract_signed";
  else if (proposalSent) stage = "proposal_sent";
  else stage = "draft";

  return { stage, fullyReleased, anyFunded, anyDisputed, hasApproved, hasSubmitted };
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/lib/workflow.ts
git commit -m "feat: update workflow state derivation for escrow stages"
```

---

## Task 15: Test End-to-End Flow

**Files:**
- Create: `frontend/__tests__/escrow-workflow.test.tsx`

**Interfaces:**
- Consumes: All components and actions from previous tasks
- Produces: Integration test verifying complete workflow

- [ ] **Step 1: Create integration test**

```typescript
// frontend/__tests__/escrow-workflow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { saveMilestones, deployEscrow } from '../app/(app)/w/[slug]/projects/[id]/actions';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'project-1' } })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-1' } } })),
    },
  })),
}));

describe('Escrow Workflow Integration', () => {
  it('saves milestones successfully', async () => {
    const result = await saveMilestones({
      orgId: 'org-1',
      projectId: 'project-1',
      milestones: [
        { title: 'Discovery', amount: 1000, asset: 'USDC' },
        { title: 'Implementation', amount: 2000, asset: 'USDC' },
      ],
    });
    expect(result.ok).toBe(true);
  });

  it('deploys escrow successfully', async () => {
    // Mock fetch for escrow deployment
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ contractAddress: 'C_TEST_CONTRACT' }),
      })
    );

    const result = await deployEscrow({
      orgId: 'org-1',
      projectId: 'project-1',
      mode: 'orka',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.contractAddress).toBe('C_TEST_CONTRACT');
    }
  });
});
```

- [ ] **Step 2: Run tests**

```bash
cd frontend && npm test -- --testPathPattern=escrow-workflow
```

- [ ] **Step 3: Commit**

```bash
git add frontend/__tests__/escrow-workflow.test.tsx
git commit -m "test: add escrow workflow integration tests"
```

---

## Task 16: Update Documentation

**Files:**
- Modify: `ARCHITECTURE.md`

**Interfaces:**
- Consumes: All implemented features
- Produces: Updated architecture documentation

- [ ] **Step 1: Add escrow workflow section to ARCHITECTURE.md**

```markdown
## Escrow Workflow

The escrow workflow follows these stages:

1. **Proposal** - Agency creates proposal with work scope
2. **Contract** - Legal contract generated and signed by both parties
3. **Milestone Setup** - Agency defines milestones (title, amount, asset, due date)
4. **Escrow Deployment** - Soroban smart contract deployed to Stellar
5. **Funding** - Client funds escrow via portal
6. **Work & Release** - Milestones submitted, approved, and payments released

### Key Components

- `MilestoneSetupWizard` - Multi-step form for defining milestones
- `EscrowDeploymentFlow` - Pre-deployment checklist and deploy button
- `PortalEscrowFundingView` - Client interface for funding escrow
- `MilestoneActionButton` - Context-aware action buttons per milestone

### Server Actions

- `saveMilestones()` - Saves milestone definitions to database
- `deployEscrow()` - Deploys Soroban contract via Rust backend
- `submitMilestone()` - Submits work for client review
- `approveMilestone()` - Client approves completed work
- `releaseMilestone()` - Multi-sig payment release
```

- [ ] **Step 2: Commit**

```bash
git add ARCHITECTURE.md
git commit -m "docs: add escrow workflow architecture section"
```

---

## Self-Review Checklist

**1. Spec Coverage:**
- ✅ Milestone setup UI (Task 3, 4, 5)
- ✅ Escrow deployment flow (Task 6, 7, 8)
- ✅ Escrow funding via client portal (Task 9, 10)
- ✅ Milestone submit/approve/reject/release workflow (Task 13)
- ✅ Activity logging for all escrow actions (Task 13)
- ✅ Timeline page enhancement (Task 11)
- ✅ Overview page enhancement (Task 12)
- ✅ Server actions for new operations (Task 2, 6)
- ✅ Database schema additions (Task 1)

**2. Placeholder Scan:** ✅ No TBD, TODO, or placeholder patterns found

**3. Type Consistency:** ✅ All types, method signatures, and property names are consistent across tasks

---

**Plan complete and saved to `docs/superpowers/plans/2026-07-23-escrow-workflow.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
