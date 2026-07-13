# Repository Setup (Maintainers)

One-time GitHub configuration to enforce the [branching strategy](../CONTRIBUTING.md#branching-strategy).
These rules live in GitHub settings, **not** in the repo, so a maintainer must
apply them once. Two options: the web UI or the `gh` CLI.

Model:

- **`master`** — protected production branch. No direct pushes. Merges via
  reviewed PRs (from `dev` for releases, `hotfix/*` for emergencies).
- **`dev`** — integration branch. No direct pushes. Topic branches (`feat/*`,
  `fix/*`, …) merge here via reviewed PRs.

---

## 1. Create the `dev` branch (if not already present)

`dev` already exists on `origin`. If you ever need to recreate it:

```bash
git checkout master
git pull origin master
git checkout -b dev
git push -u origin dev
```

Keep `master` as the **default** branch in GitHub → Settings → General →
Default branch (contributors still open PRs into `dev` for normal work).

---

## 2. Protect branches — GitHub web UI

Go to **Settings → Branches → Add branch ruleset** (or "Add classic branch
protection rule") and create a rule for **`master`**, then repeat for **`dev`**.

Recommended settings for **`master`** (strictest):

- ✅ Require a pull request before merging
  - ✅ Require approvals: **1** (or more)
  - ✅ Dismiss stale approvals when new commits are pushed
  - ✅ Require review from Code Owners (uses [`.github/CODEOWNERS`](../.github/CODEOWNERS))
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
  - Required checks: **`Frontend lint & build`** and **`Contracts cargo test`**
    (the job names from `.github/workflows/ci.yml`)
- ✅ Require conversation resolution before merging
- ✅ Require linear history (pairs well with squash-merge)
- ✅ Do not allow bypassing the above settings
- ✅ Restrict who can push (leave empty = nobody pushes directly)
- ✅ Block force pushes and deletions

Recommended settings for **`dev`** (slightly lighter):

- ✅ Require a pull request before merging (approvals: 1)
- ✅ Require status checks: **`Frontend lint & build`**, **`Contracts cargo test`**
- ✅ Block force pushes and deletions

> The status-check names must match the CI job `name:` fields exactly. They only
> appear in the "required checks" picker **after** CI has run at least once, so
> open a throwaway PR first if the list is empty.

---

## 3. Protect branches — `gh` CLI (alternative)

Requires the [GitHub CLI](https://cli.github.com/) authenticated with admin
rights on the repo.

```bash
# Protect master
gh api -X PUT repos/x0lg0n/Orka/branches/master/protection \
  -H "Accept: application/vnd.github+json" \
  -f "required_status_checks[strict]=true" \
  -f "required_status_checks[contexts][]=Frontend lint & build" \
  -f "required_status_checks[contexts][]=Contracts cargo test" \
  -F "enforce_admins=true" \
  -F "required_pull_request_reviews[required_approving_review_count]=1" \
  -F "required_pull_request_reviews[require_code_owner_reviews]=true" \
  -F "required_pull_request_reviews[dismiss_stale_reviews]=true" \
  -F "required_linear_history=true" \
  -F "allow_force_pushes=false" \
  -F "allow_deletions=false" \
  -F "restrictions=null"

# Protect dev (lighter — no code-owner requirement)
gh api -X PUT repos/x0lg0n/Orka/branches/dev/protection \
  -H "Accept: application/vnd.github+json" \
  -f "required_status_checks[strict]=true" \
  -f "required_status_checks[contexts][]=Frontend lint & build" \
  -f "required_status_checks[contexts][]=Contracts cargo test" \
  -F "enforce_admins=false" \
  -F "required_pull_request_reviews[required_approving_review_count]=1" \
  -F "allow_force_pushes=false" \
  -F "allow_deletions=false" \
  -F "restrictions=null"
```

---

## 4. Recommended repo settings

**Settings → General → Pull Requests:**

- ✅ Allow **squash merging** (keeps `dev`/`master` history linear)
- ⬜ Disable merge commits and rebase merging (optional, for consistency)
- ✅ Automatically delete head branches after merge

**Settings → General → Default branch:** `master`.

---

## 5. Everyday flow (contributors)

```bash
git checkout dev && git pull origin dev
git checkout -b feat/short-description
# ...work, commit...
git push -u origin feat/short-description
# open PR into dev
```

Release: open a PR from `dev → master`, get review + green CI, squash-merge, then
tag the release on `master`:

```bash
git checkout master && git pull
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin v0.2.0
```

See [CONTRIBUTING.md](../CONTRIBUTING.md#branching-strategy) for the full
developer-facing workflow.
