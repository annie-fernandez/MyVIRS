# Add CI so a bad merge can't take production down

**Type:** Developer infrastructure · **Size:** S (half a day) · **Priority:** High — do this first, it protects every other card this sprint.

## Problem

There is **no CI**. No `.github/workflows` directory exists, so nothing runs on a push or a pull request.

Meanwhile **Vercel deploys `main` to `https://www.myvirs.com` automatically.** Put those two facts together: the moment three people are committing in parallel, one type error merged to `main` takes the live site down, and nobody finds out until the professor or product owner opens it.

This is not hypothetical. The repo is a Turborepo with four workspaces (`apps/virs`, `packages/core`, `packages/db`, plus the untouched legacy apps), and a change in `@repo/core` can break `apps/virs` without the author ever opening that file.

## Why it's cheap

Every check already exists and passes locally — this card is wiring, not authoring. `turbo.json` defines `build`, `test`, `lint`, `check-types`, and one command runs them all across the graph:

```sh
pnpm turbo run check-types lint test build
```

Turborepo caches per-package, so CI stays fast as the repo grows.

## Scope

**1. A pull-request workflow** — `.github/workflows/ci.yml`, triggered on `pull_request` and on `push` to `main`:

- Check out, set up **Node 24** (`engines.node` is `>=24`) and **pnpm 11.25.0** (`packageManager` — use `corepack enable` rather than pinning a second time, so the two can't drift)
- `pnpm install --frozen-lockfile` — this also catches a lockfile someone forgot to commit
- `pnpm turbo run check-types lint test build`
- Cache the pnpm store and the Turborepo cache so repeat runs are quick

**2. Make it mean something.** A green check nobody enforces is decoration. In GitHub → Settings → Branches, protect `main`: require the CI check to pass before merging, and require a pull request rather than direct pushes. **This is the half of the card that actually prevents the outage** — without it the workflow is advisory.

**3. Don't let the build lie.** `apps/virs/tsconfig.json` has `"incremental"` removed deliberately — a stale `.tsbuildinfo` previously let Next reuse out-of-date route types and a type error slipped through locally. Make sure CI runs on a clean checkout with no reused build artifacts, so it cannot reproduce that.

## Done when

- Opening a PR runs the checks automatically and shows pass/fail on the PR
- A deliberate type error in a branch **fails** CI and is blocked from merging — test this once, on purpose, before calling the card done
- `main` cannot be pushed to directly
- A green run takes under ~3 minutes on a warm cache

## Nice to have, if it's quick

- **Run the checks against Vercel preview deployments** so each PR gets a URL the PO can click, rather than everyone testing on production.
- Note that `apps/api` (Java) is **intentionally excluded** from this CI. The live site is `apps/virs`.

## Blocked on / needs from Annie

- GitHub repository admin access, to add the workflow and configure branch protection on `main`

## Why this one first

The other three cards this sprint (email delivery, image OCR, translation API) all involve environment variables, external services, and deploys. Every one is easier to land safely once a broken merge is caught before it reaches `myvirs.com` rather than after.
