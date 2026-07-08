# ORKA — local dev shortcuts. App lives in frontend/.

.PHONY: dev lint build setup waitlist supabase-note stellar-note

dev:
	cd frontend && pnpm install && pnpm dev

lint:
	cd frontend && pnpm lint

build:
	cd frontend && pnpm build

# One-time local setup of the waitlist backend:
#   1. Create the Supabase `waitlist` table + RLS policies:
#        run frontend/supabase/waitlist.sql in the Supabase SQL editor
#   2. Configure env:
#        cp frontend/.env.example frontend/.env.local
#        then fill in the Supabase + Resend values
setup:
	cp frontend/.env.example frontend/.env.local
	@echo "Edit frontend/.env.local, then run 'make dev'"

# Local Supabase (optional, for a real DB instead of Supabase cloud):
#   Install the Supabase CLI, then:  supabase start
#   Apply schema:                    supabase db reset   (runs frontend/supabase/waitlist.sql if linked)
supabase-note:
	@echo "Supabase CLI quickstart: https://supabase.com/docs/guides/local-development"

# Stellar (Phase 1+): ORKA targets testnet first.
#   Testnet RPC + friendbot faucet: https://soroban.stellar.org/docs/learn/quickstart
stellar-note:
	@echo "Stellar testnet quickstart: https://soroban.stellar.org/docs/learn/quickstart"
