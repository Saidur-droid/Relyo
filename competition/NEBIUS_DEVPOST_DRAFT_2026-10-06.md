# Nebius x NVIDIA Devpost Draft — Relyo

## Project name

Relyo

## Suggested tagline

AI builds it. Relyo proves it.

## Track

Best Apps and Agents

## What we built

Relyo is the independent proof layer for machine-built software. It discovers the production system, gathers evidence, asks NVIDIA Nemotron through Nebius Token Factory to reason about what should be verified and why a failure is likely happening, then executes deterministic Proof Contracts to independently verify the outcome.

The AI layer can prioritize contracts, diagnose likely failure boundaries, and propose remediation plans. It cannot mark a release PASS or VERIFIED. Final status comes from deterministic evidence and independent re-verification.

## Why it matters

AI builders have made software creation dramatically faster, but deployment success does not prove that identity, data access, payments, configuration, recovery, or real customer journeys actually work. Founders and teams need a fast way to answer a higher-stakes question: is this exact release actually ready for customers?

Relyo turns that question into an evidence-backed workflow and produces a Production Passport for the exact release and environment.

## How Nebius Token Factory and NVIDIA Nemotron are used

- Nebius Token Factory provides the live inference runtime.
- NVIDIA `nvidia/Nemotron-3_5-Lightning` is the reasoning model.
- Relyo sends bounded production-evidence summaries, candidate Proof Contract IDs, release context, and a specific reasoning question.
- Nemotron returns structured contract selection, diagnosis, remediation steps, risk notes, and confidence.
- Relyo validates the structured response and records model, latency, and token usage as evidence.
- Relyo's deterministic Proof Contracts remain the only authority for PASS / VERIFIED.

Verified live runtime evidence:

https://github.com/Saidur-droid/Relyo/actions/runs/37445344928

## What was significantly updated during the hackathon

Relyo existed before the hackathon submission period. During the submission period we significantly extended it with a competition-specific NVIDIA Nemotron reasoning layer through Nebius Token Factory, structured reasoning validation, model-usage evidence, a live sponsor smoke workflow, competition-specific judge surfaces, and additional deterministic payment-integrity proof work.

The Nebius integration is not a logo-level API ping. A real Token Factory request is exercised in CI, and a real integration defect was found during live testing: the initial API base omitted `/v1`, producing HTTP 404. We corrected the adapter and the immediately following live run passed.

## Technical architecture

```text
Production Graph / evidence
        |
        v
Nebius Token Factory
        |
        v
NVIDIA Nemotron-3.5-Lightning
        |
        v
structured reasoning
contract prioritization / diagnosis / remediation
        |
        v
Relyo deterministic Proof Contracts
        |
        v
independent evidence-backed result
        |
        v
Production Passport
```

## Trust and safety boundary

Relyo follows one constitutional rule:

> **AI reasons. Evidence decides.**

Nemotron cannot directly promote a release to VERIFIED. Unknown evidence cannot become PASS. Final proof is deterministic and tied to a specific release/environment.

## Nebius / NVIDIA feedback draft

### What we used it for

We used Nebius Token Factory as the hosted inference runtime for NVIDIA Nemotron-3.5-Lightning. The model is used for bounded production reasoning: selecting relevant Proof Contracts, diagnosing likely failure boundaries, proposing safe remediation steps, and summarizing risk.

### What worked well

- The OpenAI-compatible API made the integration straightforward.
- Public inference let us validate the real sponsor path without provisioning dedicated GPU infrastructure.
- Nemotron-3.5-Lightning fit our agentic reasoning use case well because Relyo needs structured diagnosis and remediation rather than generic chat.
- Tooling exposed model identity and runtime behavior clearly enough to capture reproducible CI evidence.

### What could improve

- The difference between the marketing/model page base URL and the exact OpenAI-compatible `/v1` base path should be impossible to miss in every generated code sample and integration surface.
- A copyable canonical environment block showing model ID + base URL + API key variable in one place would reduce onboarding mistakes.
- A dedicated hackathon integration checklist that maps runtime proof, model ID, required feedback, and submission evidence would make zero-to-working-demo faster.

### Would we use it again?

Yes. The OpenAI-compatible interface and hosted NVIDIA model access fit Relyo's provider-neutral architecture well. For production use we would keep the same boundary we use now: the model reasons, while deterministic evidence decides final trust state.

## Testing instructions draft

1. Open the judge demo URL supplied in the final submission.
2. Choose the Nebius competition profile if it is not already the default.
3. Run the prepared broken production scenario.
4. Observe the Nemotron diagnosis / remediation guidance.
5. Observe the deterministic Proof Contract result and attached evidence.
6. Apply the supported safe fix.
7. Re-run verification and inspect the resulting Production Passport.

GitHub runtime proof is also available at:

https://github.com/Saidur-droid/Relyo/actions/runs/37445344928

## Built with

- Nebius Token Factory
- NVIDIA Nemotron-3.5-Lightning
- TypeScript
- Next.js
- pnpm
- GitHub Actions
- Relyo Proof Contracts / Trust Kernel

## Final fields still to fill

- Working public judge URL
- Public YouTube video URL
- Chosen open-source license
- Final screenshot/image assets
- Final test credentials if any are required