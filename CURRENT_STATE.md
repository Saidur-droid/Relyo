# FINAL CURRENT STATE — 2026-09-20

**Deployment blocker cleared.** PR #49 is merged as main `d4f14f77d7b10f56a0cf27b9b6383cbe97fa07c7`, GitHub reports Vercel `success` for the exact commit, and `https://relyo-two.vercel.app` is publicly reachable.

The remaining technical gate is now only authenticated evidence generation: run the existing combined Vercel + Supabase R1 flow in a browser session carrying the Relyo provider-connection cookies, require `VERIFIED/R1` for exact main, independently match all evidence IDs/SHA-256 values in production Postgres, then close Issue #5.

The production database has not yet produced that new combined VERIFIED/R1 row, so a truthful 100% evidence-complete claim cannot be made until that authenticated run exists. No paid infrastructure is needed or permitted.

Issue #39 remains a later external design-partner validation phase and does not block technical implementation completion.

---

# FINAL CURRENT STATE — 2026-09-19

**Technical completion: ~99%.** Current main before this documentation checkpoint: `d8a7bc2203484e190c9e038387926a2c84aaf3e6`.

The remaining technical work is not a coding blocker. GitHub Actions run `35435808696` proved the team-scoped Vercel token, explicit project link, production settings pull and GitHub-hosted prebuilt production build all work. The final `vercel deploy --prebuilt --prod` upload is blocked only by Vercel Hobby's daily free deployment quota: `api-deployments-free-per-day` / `try again in 24 hours`.

After the free quota resets, perform exactly one fresh production deployment, verify the stable production URL is bound to the exact current main SHA, then run and independently verify a combined Vercel + Supabase `VERIFIED/R1` proof in `proof_runs` + `evidence_envelopes`, and close Issue #5 only after the evidence IDs/hashes and provider bindings match.

Issue #39 is intentionally **not** part of this last technical 1%; it remains open for later real third-party design-partner validation (5–20 partners, minimum 5).

Do not upgrade Vercel, use paid resources, expose secrets, inspect credential envelopes, or fabricate proof. Read `CHAT_HANDOFF_2026-09-19.md` first in any new session.

---

# Current checkpoint — 2026-09-19 late handoff

Current main: `4ce1224ee09676014fd239f3aa2c34bf6605b5f5`.

The founder completed the one-time Vercel access-token setup and stored it as GitHub Actions secret `VERCEL_TOKEN`; the value is intentionally unavailable and must never be requested in chat.

The zero-paid prebuilt Vercel production path exists. PR #42 is merged. The next automatic run, `35432619820`, passed secret detection/install and reached Vercel CLI `pull`, then failed with `Could not retrieve Project Settings`. Continue by fixing explicit CI project/repo linking for the monorepo. Do not recreate the existing token unless later evidence proves it invalid.

Live zero-paid system qualification is already real:
- R2 + isolated R3: run `35428835006`, PASS.
- Continuous Proof live qualification: run `35428993526`, PASS.
- Free Render target: `https://relyo-qualification-free.onrender.com`.

Do not claim Issue #5 complete until a fresh exact-release combined Vercel+Supabase `VERIFIED/R1` is persisted and hashes independently match. Do not claim Founder Go-Live complete until Issue #39 records at least 5 real independent design partners.

Read `CHAT_HANDOFF_2026-09-19.md` before continuing in a new session.

---

# Current checkpoint — 2026-09-19

Current main: `57964864481f07db45deb52b68bda9b0769a68ba`.

Zero-paid policy is now encoded in-repo. PR #34 added a Vercel Hobby build-conservation guard and a free GitHub-hosted ephemeral execution evidence workflow. Main CI and the free execution workflow are green. The latter proves a real fresh VM and real headless Chrome runtime without paid provider compute.

The current production deployment gate is external: GitHub's Vercel status for current main still points to `upgradeToPro=build-rate-limit`. Do not upgrade, start a paid trial, or create paid resources. An hourly condition-watch is allowed to act only when the free gate is clearly open.

Production assurance is not yet complete. A fresh exact-SHA combined Vercel+Supabase R1 must be generated after the next production deployment; then live R2 and safe isolated R3 evidence can proceed on a free/included path where credentials/capabilities permit. Until then, do not claim 100% production completion.

Engineering estimate: ~90% code implementation, ~65% live evidence, ~75% full V2 roadmap overall.

---

# Relyo — Current Execution State

> Durable handoff for the next session. Read after AGENTS.md. The repository is the project memory.

Last updated: 2026-09-18

## Fresh live verification — 2026-09-18

See `WORK_PROGRESS.md` checkpoint 7. Baseline main `478fdf7bc2bfc92ca08796d7d82b7d0c4d5b9fa7` has successful CI run `35304846452` and Vercel deployment status `2Nyeh8EEzeTBHrfEZS5Dx4qgR1Rc`. The production UI is reachable. Vercel connection requires interactive sign-in in the current browser; Supabase connect still returns HTTP 503 (not configured). Read-only database inspection still finds only the historical PARTIAL/R0 run with 3 matching evidence records. No current-release R1 is proven. Application code and production configuration were not changed during this verification.

## Latest checkpoint — 2026-09-18 (supersedes the earlier checkpoint below)

- Current merged implementation: `a10b297b1858dafc51939bd7153a4e7dcc29ff4d` (`feat: add Supabase read-only R1 proof`).
- PR #9 reconciled the old Issue #5 branch onto current main, preserved the Vercel server-read-token fallback, Ed25519 signing-key normalization, proof error redaction and frozen lockfile, and fixed the previous Turbopack package-resolution failure.
- PR #9 CI and post-merge main CI passed install/typecheck/tests/build; Vercel preview and production status are green.
- Production homepage now includes Vercel + Supabase OAuth/binding UI and combined deterministic R1 proof support.
- Production database migration now allows provider connections for both `vercel` and `supabase`.
- Production Supabase OAuth is still unconfigured; the connect endpoint returns 503 until the founder supplies/configures the real Supabase OAuth application credentials in Vercel Production.
- A current-release authenticated Vercel R1 proof has not yet been generated. Production Postgres still contains only the historical signed R0 proof for release `8ed6309739f0c31f24e115658eb087170f79e08b`.
- Therefore code/build/deployment/database-schema work available without human authentication is complete; the remaining work is account-authenticated production proof and real OAuth credential setup. Do not claim R1 or Issue #5 production completion until those evidence-backed runs exist.
- No production secret values were read or committed.

## Earlier checkpoint — 2026-09-18

This section supersedes the historical September 17 execution notes below. Resume from `WORK_PROGRESS.md` and `NEXT_WORKFLOW.md`.

- R1 repository blockers are repaired on `fix/r1-launch-readiness`, PR #8: generated pnpm lockfile and six-key root environment declaration. CI uses frozen installs; production checks reject preview-only variables.
- Original code checkpoint: `05f91f8518207b4f71d12c338124aca860495554`. Its PR CI run `35300720285` succeeded and Vercel preview status is success.
- Additional hardening removes temporary public diagnostic handlers and raw proof-error logging; malformed non-object proof requests return 400.
- Local Node 22.23.2 / pnpm 10.15.1 frozen install, typecheck, 46 tests across 13 files, and Next.js 16.2.9 production build passed.
- Production homepage is reachable. This session's browser has no authenticated Relyo Vercel connection. Connector lookup for `relyo` still returns 404 under the recorded team; this does not prove an outage.
- Complete implementation commit `4e0b5e9068e0685b5b1e0a63521ba0416a175678` passed CI run `35300986829` and Vercel preview `CRtMT6Y8BsfRyXcgxwp531n6ybVw`. PR #8 is ready, not merged.
- Automatic approval review rejected the requested merge into `main` because it requires explicit user authorization for this exact merge. Obtain authorization to merge PR #8 and deploy; do not bypass the rejection. Production code remains unchanged.
- Independently confirmed the historical signed R0 run `run_89fc0874-af07-4809-bf16-915a07f4c66c` in Postgres, with all three evidence IDs/hashes matching stored evidence. This does not prove new R1.
- After merge/deployment, authenticated R1 proof and matching new database evidence remain. The browser reaches Vercel login and requires user authentication. Do not call R1 complete yet. Issue #5 remains deferred until that gate is met.
- No production secret values were requested/read, no keys rotated, no database schema changed.

## Historical September 17 notes



## Immediate priority

The Vercel packaging/deployment blocker is fixed and the current main deployment is green. Finish production runtime/end-to-end verification of the Vercel `Verify My Launch` flow. **Issue #5 remains deferred until production E2E is evidence-backed complete.**

PR #4 / Issue #3 implementation is merged (`095768c3544e5a85b39d9af26bd2c91bb4e372be`).

## Production deployment after fix

Current main fix commit: `f2fc6cd8f70b5165918db547a272ed7494431ff4` (`fix: package the monorepo web app as a native Next.js deployment`).

Verified after push:

- GitHub combined status reports Vercel `success` for this commit, target deployment `4pdRTg7VqDGce9hV3VkL3nQ9dkoR`.
- GitHub Actions CI run `35165720919` completed successfully for the same commit.
- Therefore the previous `No Output Directory named "public"` production build blocker is resolved on current main.
- This proves deployment/build success, but it does **not** by itself prove production OAuth, project binding, database persistence, signed Passport, or token-redaction behavior.

The connected Vercel integration still does not list the `relyo` project even though GitHub receives a successful Vercel deployment status. Do not ask for reconnect as a default fix; the project-visibility discrepancy is separate from the now-resolved build blocker.

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

These are local deployment-packaging and failure-path checks, **not production OAuth/database/passport proof**.

### Next executable actions

1. Confirm the production homepage and API routes respond on the actual production alias/domain.
2. Complete OAuth, project list/binding, Verify My Launch, database evidence persistence, signed Passport, and secret-redaction checks.
3. Record production evidence.
4. Only then start Issue #5 implementation.

### Access limitations

The connected Vercel tool sees team `saidur-droids-projects` (`team_BsJXXtOBNmww7MhlgiE7JzzO`) but returns only `ai-experience-network` in its project list. Looking up `relyo` still returns 404. GitHub can read/write Relyo and exposes deployment status links.

The Vercel account is connected. The cause of this connector visibility discrepancy is unconfirmed; **do not state that reconnecting is a proven fix**. The founder-supplied log was sufficient to diagnose and locally verify the deployment configuration repair, and GitHub now confirms the resulting Vercel deployment is successful.

### Risk and rollback

Inspection: `OBSERVE`. Repository configuration repair: `SAFE_REVERSIBLE`, with the founder having requested the deployment fix. No credential values, database schema, OAuth privilege model, or application route logic changed.

Rollback: revert configuration-fix commit `f2fc6cd8f70b5165918db547a272ed7494431ff4` to restore the previous repository configuration. That previous configuration is known to fail deployment; retain the healthy production deployment instead.

## Historical references

- `718f06ed39cb39bbf7de9e15d63b63a0375ad0`: old pnpm metadata-fetch failure.
- `4b436dfa338601ba6855e78fcf466b99bf0b6520`: switched install to Bun.
- `e978ec81b39d1d5fd07c20d89e4ccc02686cc9ff`: added app-level Vercel configuration.
- `db983d48f746818b5bdbab57bf166f85251e7b1f`: original continuity handoff.
- `af2e9183864abcfcdbb78d30e3ec3e969234c58e`: pre-fix baseline; CI passed, Vercel failed as documented above.
- `f2fc6cd8f70b5165918db547a272ed7494431ff4`: packaging/output fix; CI and Vercel deployment successful.

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
