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
  ADD COLUMN IF NOT EXISTS asset TEXT DEFAULT 'USDC',
  ADD COLUMN IF NOT EXISTS deployed_at TIMESTAMPTZ;
