# Nebius x NVIDIA Submission Readiness — 2026-10-06

## Current track

**Best Apps and Agents**

Relyo is a practical agentic production-proof workflow: Nemotron reasons about production evidence and remediation, while Relyo's deterministic Proof Contracts independently decide the final evidence-backed result.

## Verified technical requirements

- [x] Working software application exists.
- [x] Runtime call to Nebius Token Factory is real.
- [x] NVIDIA open source model is used: `nvidia/Nemotron-3_5-Lightning`.
- [x] Live GitHub Actions sponsor smoke passed: run `37445344928`.
- [x] API key is stored as a repository secret and is not committed.
- [x] README now names Nebius Token Factory, NVIDIA Nemotron, model ID, API base, trust boundary, and live test command.
- [x] Existing-project baseline is recorded at `869975795e0b4e6ad8461bdd0e481251a108317c`.
- [x] Competition changes are isolated on `competition/relyo-2026`.
- [x] Significant post-baseline work includes Nebius/Nemotron reasoning, live sponsor inference, competition profile, PayPal payment-integrity proof, and competition tests.

## Live evidence

- Runtime proof: `competition/NEBIUS_LIVE_RUNTIME_PROOF_2026-10-06.md`
- Successful run: https://github.com/Saidur-droid/Relyo/actions/runs/37445344928
- Adapter: `apps/web/lib/competition/nebius.ts`
- Live test: `apps/web/test/nebius-live.test.ts`

## Submission items still requiring founder/output work

- [x] **Open-source license file** at repository root: Apache-2.0.
- [ ] **Working judge demo URL / immutable competition deployment** that remains available through judging. Automated preview workflow is ready, but current `VERCEL_TOKEN` is blocked from project access with HTTP 403.
- [ ] **Public YouTube demo video under 3 minutes** showing the actual project functioning and clearly naming Nebius Token Factory and NVIDIA Nemotron.
- [ ] **Devpost project description**.
- [ ] **Nebius/NVIDIA feedback section** covering what was used, onboarding, what worked, what could improve, and whether we would use it again.
- [ ] **Written significant-update explanation** because Relyo existed before the hackathon submission period.
- [ ] **Final testing instructions** for judges, including any login/test credentials if the demo requires them.
- [ ] **Final competition snapshot/tag and immutable judge deployment** after the branch passes all release gates.

## Draft significant-update explanation

Relyo existed before the hackathon. During the submission period we significantly extended it with a competition-specific AI reasoning layer powered by NVIDIA Nemotron through Nebius Token Factory. The new integration analyzes production evidence, prioritizes deterministic Proof Contracts, produces structured diagnosis and remediation guidance, records model usage/latency evidence, and is exercised through a live Token Factory smoke test in CI. We also added competition profile surfaces and a deterministic trust boundary that prevents the model from declaring PASS or VERIFIED; final status remains controlled by Relyo's independent evidence-based verifier.

## Draft project description

**Relyo is the independent proof layer for machine-built software.** AI builders can create and deploy software quickly, but deployment success does not prove that identity, data, payments, configuration, and real customer journeys actually work. Relyo discovers the production system, gathers evidence, uses NVIDIA Nemotron through Nebius Token Factory to reason about what should be verified and why failures are happening, then executes deterministic Proof Contracts to independently verify the outcome. Nemotron can prioritize, diagnose, and propose remediation, but it cannot mark a release VERIFIED. Evidence decides. The result is an evidence-backed Production Passport for the exact release and environment.

## Suggested 3-minute video structure

1. **0:00-0:25 — Problem:** AI-built app says it is ready; production truth is still unknown.
2. **0:25-0:50 — Relyo:** show Production Graph / proof workflow and explain `AI reasons. Evidence decides.`
3. **0:50-1:25 — Nebius + NVIDIA:** explicitly show or state Nebius Token Factory and `nvidia/Nemotron-3_5-Lightning`; show reasoning/diagnosis.
4. **1:25-2:15 — Deterministic failure:** show a real blocker, evidence, and Proof Contract failure.
5. **2:15-2:40 — Fix & Verify:** safe remediation followed by independent re-verification.
6. **2:40-3:00 — Outcome:** Production Passport and one-line impact story.

## Release rule

Do not freeze or submit until the exact judge build has:

- green CI;
- green live Nebius sponsor smoke;
- a working demo URL;
- a chosen and visible open-source license;
- tested judge instructions;
- an immutable tag/deployment identity.

Do not claim any requirement is complete unless evidence exists.