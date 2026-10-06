# Nebius x NVIDIA Live Runtime Proof — 2026-10-06

**Status:** PASS — real live inference verified

## Evidence

- Repository: `Saidur-droid/Relyo`
- Branch: `competition/relyo-2026`
- Fix commit: `6e7e0fc71a30a39dacce6d59cc2806e75c157527`
- GitHub Actions workflow: `Competition Live Sponsor Smoke`
- Successful run: `37445344928`
- Successful job: `nebius-nemotron-live`
- Live test: `apps/web/test/nebius-live.test.ts`
- Runtime adapter: `apps/web/lib/competition/nebius.ts`
- Provider: Nebius Token Factory
- NVIDIA model: `nvidia/Nemotron-3_5-Lightning`
- API base: `https://api.tokenfactory.nebius.com/v1`

Run URL:

https://github.com/Saidur-droid/Relyo/actions/runs/37445344928

## What the successful run proves

The workflow checked out the competition branch, installed the locked pnpm workspace, detected the configured `NEBIUS_API_KEY` repository secret, and executed the live Nemotron smoke test.

The live test completed successfully against Nebius Token Factory using the NVIDIA Nemotron model. This is a real runtime inference path, not a mocked sponsor call.

The tested Relyo path is:

```text
Relyo production evidence
→ Nebius Token Factory
→ NVIDIA Nemotron-3.5-Lightning
→ structured contract prioritization / diagnosis / remediation guidance
→ Relyo deterministic Proof Contracts
→ evidence-backed result
```

## Trust boundary

Nemotron is a reasoning layer only.

The model may:

- prioritize supplied Proof Contracts;
- diagnose likely failure boundaries;
- propose remediation steps;
- return risk notes.

The model may **not** decide PASS or VERIFIED.

Relyo's deterministic Proof Contracts and independent evidence remain authoritative.

> **AI reasons. Evidence decides.**

## Secret handling

The Nebius API key is stored only as a GitHub Actions repository secret for this workflow. GitHub masked the value in workflow logs. No key value is committed to the repository or included in this evidence document.

## Failure and fix history

The first live attempt reached Token Factory but returned HTTP 404 because the adapter default base URL omitted the required `/v1` API path.

The adapter was corrected from:

```text
https://api.tokenfactory.nebius.com
```

to:

```text
https://api.tokenfactory.nebius.com/v1
```

The immediately following live workflow run passed, providing an evidence-backed regression checkpoint for the integration.
