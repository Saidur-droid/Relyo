# FINAL CONTINUATION CHECKPOINT — 2026-09-19

This section supersedes older continuation instructions below.

## One-line state

Relyo technical work is approximately **99% complete**. The only remaining technical gate is a fresh zero-paid Vercel production deployment after the Hobby daily deployment quota resets, followed by exact-release combined Vercel + Supabase R1 evidence verification and Issue #5 closure. **Issue #39 is intentionally deferred** because it requires 5–20 real independent design partners and is external/non-coding work.

## Exact current repository state

- Current main before this documentation checkpoint: `d8a7bc2203484e190c9e038387926a2c84aaf3e6`.
- PR #45 merged explicit Vercel project-link validation/linking.
- Founder replaced the GitHub Actions `VERCEL_TOKEN` with a team-scoped token. Never request or expose its value.
- PR #46 merged the Vercel install fix: `bun install --no-save` -> `pnpm install --frozen-lockfile`.
- PR #47 merged the intentional free-prebuilt deployment retry trigger.

## Latest production deploy attempt — definitive blocker

GitHub Actions run `35435808696` proved all of the following on current main:

- GitHub-hosted runner setup PASS
- locked pnpm workspace install PASS
- team-scoped Vercel token can read the configured Relyo project PASS
- explicit local Vercel project link PASS
- `vercel pull --environment=production` PASS
- `vercel build --prod` on the free GitHub runner PASS
- upload step reached `vercel deploy --prebuilt --prod`
- upload failed only because Vercel Hobby returned:
  - `Resource is limited - try again in 24 hours`
  - code `api-deployments-free-per-day`

Do **not** spend money, upgrade Vercel, start a trial, or create paid compute to bypass this. This is an external free-tier quota gate, not a code/config/token failure.

## Already-verified production/provider facts

- Vercel project: `relyo` / `prj_GdpW8gbUqsjZx84AtoHq2twAl7gi`
- Vercel team: `team_BsJXXtOBNmww7MhlgiE7JzzO`
- production URL: `https://relyo-two.vercel.app`
- Supabase project: `relyo-prod` / `rlzkqgpouwdmwvltumob`
- stored Vercel provider connection is bound to `relyo`
- stored Supabase provider connection is bound to `relyo-prod`
- Supabase Auth site URL has been corrected to the production origin
- observed public/storage RLS baseline passes
- current code correctly makes Supabase backup observability an R3/R4 requirement only, not an R1 blocker

Historical combined runs are **not** current-release completion. The latest exact final proof must be generated only after the fresh production deployment.

## Exact remaining 1% sequence

When the free Vercel daily deployment quota is available again:

1. Use the existing documented free prebuilt path; do not change architecture or buy capacity.
2. Trigger one fresh production deployment through the normal branch -> PR -> CI -> merge path using `.vercel-prebuilt-deploy-trigger`.
3. Require the prebuilt workflow to finish upload + stable URL verification successfully.
4. Verify `https://relyo-two.vercel.app` is bound to the exact then-current main SHA.
5. Run the combined Vercel + Supabase R1 for:
   - URL `https://relyo-two.vercel.app`
   - repo `Saidur-droid/Relyo`
   - Vercel project `relyo`
   - Supabase project `relyo-prod`
6. Independently query production `proof_runs` and `evidence_envelopes` and require:
   - state `VERIFIED`
   - target `R1`
   - achieved `R1`
   - release SHA exactly equals deployed main
   - environment/provider binding is Vercel + Supabase with the correct project IDs
   - every referenced evidence ID exists and stored SHA-256 matches
7. Do not inspect provider credential ciphertext/plaintext or secret values.
8. Update the canonical docs + Issue #5 with the final run/release/evidence IDs.
9. Close Issue #5 only after that exact-release combined proof is real.
10. Keep Issue #39 open; its design-partner work will be done later.

## Automation continuity

A condition-watch named **Relyo Final Deploy Gate** is enabled to resume this free deployment/evidence sequence after the quota window. Its planned start is 2026-09-20 around 15:55 Asia/Dhaka, then hourly if necessary. A future session should still re-check current repository/provider state before acting and must not create wasteful probe deployments.

## New-chat instruction

If the founder deletes the current chat and later provides only this repository link, immediately read `AGENTS.md`, this file, `WORK_PROGRESS.md`, `CURRENT_STATE.md`, `NEXT_WORKFLOW.md`, Issue #5 and Issue #39. Do **not** ask them to restate completed work. Treat the repository as the durable project memory and continue only the remaining 1% sequence above.

---

# Relyo V2 — Chat Handoff — 2026-09-19

This file is the durable handoff for a new ChatGPT session if the current chat is deleted.

## Read first

1. `AGENTS.md`
2. this file
3. `WORK_PROGRESS.md`
4. `CURRENT_STATE.md`
5. `NEXT_WORKFLOW.md`
6. Issue #5
7. Issue #39
8. `V2_EXECUTION_PLAN.md`

Do not ask the founder to restate the project before reading those sources.

## Founder constraints

- Use only free / included infrastructure. Do not upgrade Vercel, start a paid trial, or create paid compute.
- Prefer doing work automatically through connected GitHub, Supabase, Vercel, and Render tools.
- Ask for manual work only when a provider intentionally hides a secret or requires interactive account action.
- Never ask the founder to paste secrets into chat.
- Never read or expose provider credential envelopes.
- Normal branch -> PR -> CI -> merge workflow; do not push feature work directly to main.
- Only claim a milestone complete when code + tests + real required evidence satisfy its exit criteria.

## Current repository state

Current `main` when this handoff was finalized:

`4ce1224ee09676014fd239f3aa2c34bf6605b5f5`

PR #42 is merged. It removed stale inline `--scope="$VERCEL_SCOPE"` arguments that had caused `VERCEL_SCOPE: unbound variable`.

After #42, the automatic free-prebuilt main workflow ran again:

- workflow run: `35432619820`
- result: FAILED
- token secret was present (masked as `***`)
- dependency install succeeded
- Vercel CLI reached `vercel pull`
- exact current blocker: `Error: Could not retrieve Project Settings. To link your Project, remove the .vercel directory and deploy again.`

This is the current technical continuation point. The likely next area to fix is explicit CI project/repository linking for this monorepo (for example an explicit `.vercel/project.json`/repo link or running the CLI from the correct linked project directory), while keeping the same project-scoped secret and zero-paid policy. Do not ask the founder to recreate the token unless logs later prove it invalid/revoked.

## Secret/account setup already completed by the founder

The founder created a Vercel project-scoped access token and stored it as the GitHub repository Actions secret:

`VERCEL_TOKEN`

Do not ask them to recreate or paste it unless a later provider error proves the token itself is invalid/revoked.

The secret value is intentionally unavailable to ChatGPT and must stay that way.

## Free Vercel deployment fallback

Files:
- `.github/workflows/vercel-free-prebuilt-deploy.yml`
- `docs/VERCEL_FREE_PREBUILT_DEPLOY.md`
- `.vercel-prebuilt-deploy-trigger`

Goal:
- build with GitHub standard hosted runner;
- use `vercel build --prod`;
- upload with `vercel deploy --prebuilt --prod`;
- avoid the Git-triggered Vercel remote-build rate-limit path;
- remain zero-paid.

PR #40 added the workflow.
PR #41 attempted project-scoped-token support.
PR #42 removes stale `VERCEL_SCOPE` flags that still caused the main workflow to fail before a real Vercel CLI request.

Exact failed main workflow after #41:
- run: `35432259329`
- source main: `e909492c2746e669f80bedf35e126db278e699b3`
- failure: `VERCEL_SCOPE: unbound variable`

After #42 merges, the push modifies the deployment workflow path and should automatically run the free prebuilt deployment again.

## Production providers

Vercel:
- project ID: `prj_GdpW8gbUqsjZx84AtoHq2twAl7gi`
- team ID: `team_BsJXXtOBNmww7MhlgiE7JzzO`
- production URL: `https://relyo-two.vercel.app`

Supabase:
- production project: `relyo-prod`
- ref: `rlzkqgpouwdmwvltumob`
- free plan
- production Auth Site URL was manually corrected to `https://relyo-two.vercel.app`
- RLS observation previously passed
- provider-managed backup count on Free is 0; this is intentionally R3/R4 only after PR #12, not an R1 blocker

The Proof API DB migration has been applied in production and verified:
- `proof_api_keys`
- `proof_api_run_access`
- RLS enabled on both

## Major V2 implementation already merged

The following core/integration work has been implemented, tested, and merged through PR/CI paths:

- Trust Kernel / signed Production Passport foundation
- Vercel Launch R1
- Supabase combined read-only R1 support
- backup assurance boundary correction (#12)
- signed Runner v0
- Auth Proof core
- Safe Remediation core
- Synthetic Customer / R2 journey engine
- GitHub Check
- Continuous Proof freshness / targeted rerun engine
- R3 resilience core
- Cost Intelligence
- Agency/Fleet
- Enterprise Governance
- Trust Network core
- Proof API
- TypeScript SDK
- Python SDK
- CLI
- MCP endpoint
- GitHub Action
- Vercel Sandbox managed-runner adapter
- Vercel/Supabase remediation adapters
- safe Vercel R3 rollback driver
- Playwright-compatible browser journey driver
- zero-paid execution path / Vercel build-conservation guard
- zero-paid public live qualification fixture
- live zero-paid Continuous Proof qualification

## Real zero-paid live evidence already completed

Free Render qualification target:

`https://relyo-qualification-free.onrender.com`

Render:
- service id: `srv-dan3c3jm8hqs739t6cd0`
- initial live deploy: `dep-dan3c43m8hqs739t6dqg`
- initial deployed commit: `8b5f90352e975a0e3820e1dbea4ba33d9aaac532`
- plan: free

R2 + isolated R3 live qualification:
- GitHub Actions run: `35428835006`
- main commit: `9f982216960f5aa3290b7dd52321edfda6c06aee`
- public HTTPS validation PASS
- real Playwright Chromium PASS
- signup -> identity verification -> auth -> primary resource -> core action -> logout -> unauthorized rejection -> repeat login -> cleanup PASS
- isolated failure -> failed-state observation -> recovery -> recovered-state observation -> cleanup PASS
- no paid provider compute intentionally requested

Continuous Proof live qualification:
- GitHub Actions run: `35428993526`
- main commit: `20ab0cfba82d47ee4ce8badbff3f6082c4b4945b`
- initial live evidence current
- controlled isolated runtime break observed
- actual Continuous Proof planner selected only impacted `qualification.health`
- recovery independently re-observed
- refreshed evidence returned CURRENT
- PASS

Free execution substrate:
- run `35427451756`
- signed Runner PASS on fresh GitHub VM
- Vercel Sandbox adapter safety suite PASS without remote allocation
- browser driver PASS
- real headless Chrome smoke PASS
- R3 safety tests PASS

## R1 production evidence state

Do not close Issue #5 yet.

Historical Vercel-only R1 was independently verified.

The latest known combined Vercel+Supabase production row is still pre-fix FAILED/R0 and must not be treated as current completion:

`run_8296bbcf-0e10-4f15-8ba8-9a86c30d666e`

A fresh exact-release combined `VERIFIED/R1` must be generated after the current main is successfully deployed to Vercel.

Required final technical sequence:

1. Start from merged main `4ce1224ee09676014fd239f3aa2c34bf6605b5f5`.
2. Inspect failed workflow `35432619820`; current failure is Vercel project linking / Project Settings retrieval, not missing GitHub secret.
3. Fix the CI linking path via normal branch/PR/CI while staying free and preserving the existing `VERCEL_TOKEN`.
4. Require a successful production deploy from the then-current main.
5. Verify the exact deployed release SHA.
6. Open/use production Relyo provider session and run combined Vercel + Supabase R1 with:
   - URL: `https://relyo-two.vercel.app`
   - repo: `Saidur-droid/Relyo`
   - Vercel project: `relyo`
   - Supabase project: `relyo-prod`
7. Independently query production `proof_runs` and `evidence_envelopes`; verify:
   - state VERIFIED
   - target R1
   - achieved R1
   - exact deployed SHA
   - Vercel + Supabase environment binding
   - referenced evidence IDs/hashes match
8. Never inspect provider credential ciphertext/plaintext.
9. Update Issue #5 and canonical docs with exact final run/evidence identifiers.
10. Close Issue #5 only after the combined current-release evidence is real.

## External non-coding exit gate

Issue #39 tracks Founder Go-Live beta:

`Founder Go-Live beta: 5–20 real design-partner proofs`

Current real independent design partners recorded: 0/5 minimum.

This cannot be truthfully fabricated or satisfied with the founder's own app, synthetic fixtures, repeated internal runs, or fake users. It requires actual third parties using Relyo on independent AI-built apps.

A new ChatGPT session should distinguish:
- technical implementation/evidence completion; versus
- external adoption validation.

Do not claim full V2 market/go-live completion until Issue #39's real-user exit criterion is satisfied.

## Progress framing

At this handoff, the engineering implementation is approximately 93–95% complete.

The technical evidence path is close to completion, with the current primary blocker being the free prebuilt Vercel production deployment workflow and subsequent exact-SHA combined R1.

Full V2 including real founder beta/design-partner validation is not 100% yet.

## Connected systems known to be usable

- GitHub: repository reads/writes, branches, PRs, CI/workflow inspection
- Supabase: project inspection, migrations, SQL verification
- Render: free service deployment/logs
- Vercel: docs/project integration available, but historical connector visibility/permissions have sometimes been inconsistent; GitHub Actions token path is the current deployment fallback

## Security reminders

Never expose:
- `VERCEL_TOKEN`
- Supabase OAuth client secret
- Vercel OAuth client secret
- database password / `DATABASE_URL`
- `RELYO_CREDENTIAL_ENCRYPTION_KEY`
- Passport signing private key
- encrypted provider credential payloads

Do not rotate production encryption/signing keys as a troubleshooting shortcut.

## New-chat starter instruction

Paste this to the new ChatGPT if needed:

> Continue Relyo V2 from GitHub repo `Saidur-droid/Relyo`. Read `AGENTS.md`, `CHAT_HANDOFF_2026-09-19.md`, `WORK_PROGRESS.md`, `CURRENT_STATE.md`, `NEXT_WORKFLOW.md`, Issue #5 and Issue #39 before acting. Do not make me restate prior work. Use only free/included infrastructure. First re-check PR #42 and the latest Vercel Free Prebuilt Production Deploy workflow, then continue the exact-SHA combined Vercel+Supabase R1 evidence path. Do not expose secrets or claim Issue #39 complete without real third-party design partners.
