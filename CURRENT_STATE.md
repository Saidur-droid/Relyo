# Relyo — Current Execution State

> Durable handoff for the next session. Read after AGENTS.md. The repository is the project memory.

Last updated: 2026-09-17

## Immediate priority

Finish production deployment and end-to-end verification of the Vercel `Verify My Launch` flow. **Issue #5 remains deferred until production E2E is evidence-backed complete.**

PR #4 / Issue #3 implementation is merged (`095768c3544e5a85b39d9af26bd2c91bb4e372be`).

## Confirmed deployment failure and fix

The founder supplied the full Vercel build log for commit `af2e9183864abcfcdbb78d30e3ec3e969234c58e`, deployment [Wd6EzPKK9siWTy5WhzApkWFJ1jmC](https://vercel.com/saidur-droids-projects/relyo/Wd6EzPKK9siWTy5WhzApkWFJ1jmC).

The log proves:

- Vercel CLI 59.16.0 uses Node 22 (the repository engine overrides the dashboard's Node 24).
- `bun install --no-save` succeeds with Bun 1.3.14.
- TypeScript and Next.js 16.2.9 production compilation succeed, including all six API routes.
- Recursive workspace build selects the root package and executes the application build twice.
- Deployment then fails with `No Output Directory named "public" found after the Build completed.`

This supersedes the historical pnpm metadata-fetch diagnosis. The current failure is deployment framework/output configuration, after successful compilation. The effective install command matches the repository-root configuration. The dashboard's exact framework setting was not directly readable.

### Changes in this delivery

- Root `vercel.json` explicitly selects `framework: "nextjs"` and `outputDirectory: "apps/web/.next"`, overriding the incorrect static output setting.
- `apps/web/vercel.json` explicitly selects Next.js and app-relative `.next`, preserving support if the Vercel Root Directory is later set to `apps/web`.
- Both build commands select only `@relyo/web` and its workspace dependency closure using `pnpm --filter @relyo/web... run build`.
- The root package build script uses the same selection, avoiding root-package re-entry even when recursive workspace-root inclusion is enabled.
- Root devDependencies explicitly declare `next: "16.2.9"`, matching the web app. The Vercel Next.js builder resolves the framework from the configured project root. A local packaging test without this root dependency failed with `No Next.js version detected`; adding it fixes detection without moving application source.
- The successful Bun install and Node 22 engine are preserved.

Do not create an empty `public` directory or deploy `.next` as generic static files. OAuth and proof APIs require native Next.js server functions.

### Verification completed before push

Using an isolated source snapshot with no production credentials:

- Node 22.23.2, Bun 1.3.14, pnpm 10.15.1, Vercel CLI 59.16.0, Next.js 16.2.9.
- `pnpm typecheck`: passed.
- `pnpm test`: 34 tests passed across 11 files.
- `vercel build --prod` and `vercel build --prod --standalone`: passed.
- Local-only project settings deliberately modeled the failing state: repository root, no framework preset, and outputDirectory `public`. The committed overrides produce native Next.js Build Output API artifacts.
- Workspace build selects 8 of 9 projects; Next.js compiles once per build.
- All six API paths resolve to packaged `nodejs22.x` functions with valid handlers.
- Invoked actual standalone function handlers in isolated local HTTP servers:
  - homepage: HTTP 200 with Relyo and Verify My Launch UI;
  - GET /api/vercel/projects without a connection: 401;
  - GET /api/vercel/callback without a valid transaction: 307 safe failure redirect;
  - POST /api/vercel/project without a connection: 401;
  - POST /api/verify-launch without a connection: 401;
  - cross-origin POST /api/verify-launch: 403;
  - empty POST /api/check: 400;
  - GET /api/vercel/connect with local OAuth configuration intentionally absent: 503.
- Function groups must be tested in separate processes, matching production isolation; loading multiple bundled Next.js servers in one process causes shared-runtime conflicts in the test harness.

These are local deployment-packaging and failure-path checks, **not production OAuth/database/passport proof**. Production status must be checked for the resulting fix commit.

### Next executable actions

1. Resolve the current main commit and inspect its GitHub Vercel status target; do not keep inspecting the historical failed deployment.
2. Confirm production deployment succeeds and the production homepage/API routes respond.
3. Complete OAuth, project list/binding, Verify My Launch, database evidence persistence, signed Passport, and secret-redaction checks.
4. Record production evidence before starting Issue #5.

### Access limitations

The connected Vercel tool sees team `saidur-droids-projects` (`team_BsJXXtOBNmww7MhlgiE7JzzO`) but returns only `ai-experience-network` in its project list. Looking up `relyo` still returns 404. GitHub can read/write Relyo and exposes deployment status links.

The Vercel account is connected. The cause of this connector visibility discrepancy is unconfirmed; **do not state that reconnecting is a proven fix**. The founder-supplied log was sufficient to diagnose and locally verify the deployment configuration repair.

### Risk and rollback

Inspection: `OBSERVE`. Repository configuration repair: `SAFE_REVERSIBLE`, with the founder having requested the deployment fix. No credential values, database schema, OAuth privilege model, or application route logic changed.

Rollback: revert this configuration-fix commit to restore the previous repository configuration. That previous configuration is known to fail deployment; retain the last healthy production deployment if one exists.

## Historical references

- `718f06ed39cb39bbf7de9e15d63b63a0375ad0`: old pnpm metadata-fetch failure.
- `4b436dfa338601ba6855e78fcf466b99bf0b6520`: switched install to Bun.
- `e978ec81b39d1d5fd07c20d89e4ccc02686cc9ff`: added app-level Vercel configuration.
- `db983d48f746818b5bdbab57bf166f85251e7b1f`: original continuity handoff.
- `af2e9183864abcfcdbb78d30e3ec3e969234c58e`: pre-fix baseline; CI passed, Vercel failed as documented above.

Official configuration reference: https://vercel.com/docs/project-configuration/vercel-json

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
