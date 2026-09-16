# Relyo — Current Execution State

> This file is the durable handoff for the next AI agent/session. Read it immediately after `AGENTS.md` and before changing code. The GitHub repository remains the permanent source of truth; do not rely on prior chat history.

Last updated: 2026-09-16 (Bangladesh time)

## Continuation verification — 2026-09-16 session

The deployment remains **blocked and unverified**. No application or build configuration was changed in this continuation because the latest Vercel build log could not be accessed.

### Evidence checked

- Main at the start of this continuation: `db983d48f746818b5bdbab57bf166f85251e7b1f` (the handoff documentation commit).
- GitHub's Vercel commit status for that main revision is **failure**, pointing to [deployment ADKof18Fhtrx2GjkNDm1D6ZNXLiG](https://vercel.com/saidur-droids-projects/relyo/ADKof18Fhtrx2GjkNDm1D6ZNXLiG). This is newer than the historical `e978ec8` deployment below.
- [GitHub Actions verify job](https://github.com/Saidur-droid/Relyo/actions/runs/35029316389/job/104583810711) completed successfully for `db983d48`. Its logs confirm pnpm 10.15.1 dependency installation, typechecking, **34 passing tests across 11 test files**, and a successful Next.js 16.2.9 production build.
- These CI results are **not** proof of a successful Vercel deployment or production OAuth/database behavior.
- Connected Vercel lists the expected team: `saidur-droids-projects`, ID `team_BsJXXtOBNmww7MhlgiE7JzzO`.
- Its project list returns only `ai-experience-network`, not `relyo`. Getting `relyo` by name returns **404** with both the team slug and team ID. Latest deployment lookup/build-log retrieval also returns **404**.
- Plugin discovery confirms Vercel is already installed and enabled. The available plugin-management actions do not provide a reconnect operation. The exact cause of the missing project visibility is unknown.

### Next executable action

Reconnect/re-authorize the Vercel connection for the account/team containing `relyo`, ensuring that this project is visible. Do not ask the founder to repeat database setup or supply secrets.

Once visibility is restored, resolve the current main SHA/status again (this documentation update may trigger another deployment), inspect that exact deployment's build log and effective project settings, and make the smallest evidence-backed fix. Then complete the production E2E checklist below. **Issue #5 remains deferred.**

Risk classification for this continuation: provider/GitHub inspection `OBSERVE`; this documentation-only continuity update `SAFE_REVERSIBLE`. No production settings, credentials, database schema, or application code were mutated.

## Immediate priority

**Do not start a new product issue yet. Finish production deployment and end-to-end verification of the Vercel `Verify My Launch` flow first.**

Issue #3 / PR #4 implementation is merged, but production deployment is still failing. After production is healthy and E2E is verified, the next open product issue is Issue #5 (`P0: Add Supabase read-only provider proof to Launch Verification R1`).

## Repository / branch state

Repository: `Saidur-droid/Relyo`

Default branch: `main`

Important merged delivery:

- PR #4 completed the secure Vercel `Verify My Launch` flow.
- Squash merge on main: `095768c3544e5a85b39d9af26bd2c91bb4e372be`.

Deployment troubleshooting commits made afterward:

- `718f06ed39cb39bbf7de9e15d63b63a0375ad0` — no-code deploy trigger after environment setup.
- `fa4f6629...` — pnpm pin attempt.
- `57213fb7...` — Node 22 pin attempt.
- `6115c71a378d5362f52a4034bcb979f326739530` — explicit npm workspaces added at repo root.
- `4b436dfa338601ba6855e78fcf466b99bf0b6520` — root Vercel install switched to Bun to bypass pnpm registry metadata failure.
- `e978ec81b39d1d5fd07c20d89e4ccc02686cc9ff` — added `apps/web/vercel.json` so the install/build override is visible if the Vercel project root is `apps/web`.

At the original handoff, `e978ec81b39d1d5fd07c20d89e4ccc02686cc9ff` was the latest inspected application/configuration commit and its Vercel deployment was **failing**. See the continuation verification above for the subsequently verified main revision and newer failed deployment.

Latest known Vercel deployment target for that commit:

`https://vercel.com/saidur-droids-projects/relyo/Ag6x5GJZLRAZ6JGk4SKR5yc625mR`

## Production infrastructure already configured

### Supabase

Production database project was created manually in Supabase:

- Project name: `relyo-prod`
- Region: Singapore / Southeast Asia
- Plan: Free
- Database was healthy when configured.

The required SQL schema/migrations were run manually in the Supabase SQL Editor and verified from the UI. Expected production tables include:

- `evidence_envelopes`
- `proof_runs`
- `provider_connections`

`provider_connections` includes the project binding columns:

- `bound_project_id`
- `bound_project_name`

Relevant migration files in repo:

- `packages/store/sql/001_proof_runs.sql`
- `packages/credentials/sql/001_provider_connections.sql`
- `packages/credentials/sql/002_provider_project_binding.sql`

### Vercel environment variables

The user manually added these variables to the Vercel `relyo` project for **Production**:

- `DATABASE_URL` — secret/sensitive
- `RELYO_CREDENTIAL_ENCRYPTION_KEY` — secret/sensitive
- `RELYO_CREDENTIAL_ENCRYPTION_KEY_ID` — config/non-secret
- `RELYO_PASSPORT_SIGNING_PRIVATE_KEY_B64` — secret/sensitive
- `VERCEL_APP_CLIENT_ID` — config/non-secret
- `VERCEL_APP_CLIENT_SECRET` — secret/sensitive
- `VERCEL_OAUTH_SCOPE` — config/non-secret

Do **not** put any real secret values into GitHub or this file.

Earlier the Vercel Environment Variables UI showed `Needs Attention` next to `RELYO_CREDENTIAL_ENCRYPTION_KEY`. Treat that as a verification item after build/deployment is unblocked. Do not rotate the credential encryption key casually, because existing encrypted provider credentials may depend on it.

### Vercel OAuth App

A Vercel App named `Relyo` was created manually at team/account level.

Configured callback:

- associated Vercel project: `relyo`
- callback path: `/api/vercel/callback`

Configured scopes:

- `openid`
- `profile`
- `offline_access`
- `email` intentionally off

Configured client authentication:

- `client_secret_post` ON
- `client_secret_basic` OFF
- `client_secret_jwt` OFF
- `private_key_jwt` OFF
- public/no-secret mode OFF

The Client ID and Client Secret were added to the Vercel production environment variables. Never expose the Client Secret in logs/chat/repo.

## Secure Vercel flow already implemented in code

Key server behavior already merged:

- `apps/web/app/api/vercel/connect/route.ts` starts OAuth with PKCE/state/nonce.
- callback URL is derived dynamically from the request origin as `/api/vercel/callback`.
- provider credentials are encrypted server-side before persistence.
- `apps/web/app/api/vercel/project/route.ts` validates and binds a selected Vercel project.
- `apps/web/app/api/verify-launch/route.ts` decrypts the token server-side, inspects the bound Vercel project, executes R1 verification, persists proof/evidence, and returns a signed Production Passport.
- provider tokens must never be returned to the browser or logged.

## Current deployment blocker

The original/old production deployment failed before build because Vercel ran:

```text
pnpm install --frozen-lockfile=false
```

and package metadata fetches failed with:

```text
ERR_INVALID_THIS
ERR_PNPM_META_FETCH_FAIL
Value of "this" must be of type URLSearchParams
```

That failure was observed on commit `718f06e`.

Several repo-level fixes were attempted afterward. Current configuration includes both:

Root `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "bun install --no-save",
  "buildCommand": "pnpm -r build"
}
```

`apps/web/vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "cd ../.. && bun install --no-save",
  "buildCommand": "cd ../.. && pnpm -r build"
}
```

However, the latest deployment for commit `e978ec8` still reports failure. **Do not assume it is the same old pnpm error. Inspect the exact latest deployment log before making another code change.**

## First actions for the next session

1. Read `AGENTS.md`, this file, then the required V2 docs before material product changes.
2. Resolve the current main commit and its Vercel status target, then inspect that exact deployment's build log. Historical targets are recorded above; do not assume they are still the latest.
3. Confirm what Vercel actually uses for:
   - project Root Directory;
   - Install Command;
   - Build Command;
   - Node.js version.
4. If the deployment is still running `pnpm install --frozen-lockfile=false`, fix the **Vercel project setting / root directory override** rather than adding more speculative package-manager commits. Vercel docs state `installCommand` in `vercel.json` overrides the default command, but dashboard/project settings and the effective project root must be verified.
5. Re-deploy production and require a green build.
6. Verify runtime production configuration without exposing secret values.
7. Run an end-to-end smoke test:
   - open the production app;
   - start `Connect Vercel`;
   - complete OAuth callback;
   - confirm project list loads;
   - bind a project;
   - run `Verify My Launch`;
   - confirm proof/evidence rows are persisted;
   - confirm signed Production Passport is produced;
   - verify no provider token appears in browser responses/logs.
8. Only after the above is evidence-backed complete, continue to Issue #5.

## Tool / access caveats observed

- GitHub connector can read/write this private repo and was used successfully.
- Direct Vercel connector access was inconsistent: the connected Vercel tool previously listed a different project and sometimes could not resolve the `relyo` deployment, while GitHub commit status correctly linked to Vercel deployments.
- If Vercel app access is still stale in a future chat, reconnect/authorize the Vercel plugin/account before asking the user to manually copy build logs.
- `npx vercel inspect <deployment> --logs` timed out once on the user's Windows machine (`Worker timed out after 10 seconds`). Prefer connected Vercel deployment/log tools when they can see the project.

## Security rules for continuation

- Never request or print the production DB password, OAuth client secret, credential encryption key, or Passport private signing key.
- Never commit secrets to GitHub.
- Do not rotate `RELYO_CREDENTIAL_ENCRYPTION_KEY` or signing keys as a troubleshooting shortcut.
- Keep Vercel provider access read-only/least-privilege for verification.
- Preserve same-origin checks, PKCE/state/nonce, HttpOnly cookies, encrypted credential storage, and token redaction.

## Definition of done for this deployment task

This task is **not done** merely because a Vercel deployment says Ready. It is done when:

- production build succeeds;
- app responds on the production domain;
- Vercel OAuth works end to end;
- user can select/bind an accessible Vercel project;
- `Verify My Launch` executes successfully against the bound project;
- proof/evidence persist in production Postgres;
- signed Production Passport is returned;
- no secret/token leakage is observed;
- failure paths are handled safely;
- evidence of the above is recorded in the repo/issue as appropriate.
