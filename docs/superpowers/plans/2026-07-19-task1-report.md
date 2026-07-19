# Task 1 — Migration SQL: DONE

- **Status:** DONE
- **Commit:** `feat: add project_proposals migration SQL` (4c3393d)
- **Files created:** `frontend/supabase/project_proposals.sql`

**Tables:** `project_proposals`, `proposal_sections`, `proposal_pricing`, `proposal_notes`, `proposal_activity`

**Concerns:** None. All tables have RLS enabled, org-scoped policies via `auth_is_org_member()`, and child tables resolve `org_id` through the parent proposal row. Run the SQL in Supabase SQL Editor to apply.
