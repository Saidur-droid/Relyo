# Relyo Competition Workspace

This directory contains competition-specific execution documents for Relyo.

## Active 2026 multi-hackathon plan

- [Relyo 2026 Multi-Hackathon Execution Plan](./RELYO_2026_MULTI_HACKATHON_EXECUTION_PLAN.md)

Selected competitions:

1. Life After Code — GitLab
2. Nebius x NVIDIA Global AI Hackathon
3. PayPal AI Hackathon

Operating model:

> **One Relyo product + one competition development line + immutable competition snapshots.**

Do not create separate product forks for the three competitions.

## Execution status

**Implemented on `competition/relyo-2026`:**

- Nebius Token Factory / NVIDIA Nemotron reasoning client.
- Real live Nemotron inference through Nebius Token Factory.
- Structured reasoning output with deterministic trust boundary.
- GitHub Actions live sponsor smoke workflow.
- PayPal sandbox order + webhook verification client.
- Deterministic `paypal.payment_integrity` Proof Contract.
- Competition profile layer.
- Focused tests for sponsor clients and payment outcome semantics.

**Nebius live proof:** [NEBIUS_LIVE_RUNTIME_PROOF_2026-10-06.md](./NEBIUS_LIVE_RUNTIME_PROOF_2026-10-06.md)

**Nebius access status:** [NEBIUS_ACCESS_DECISION_BANGLADESH.md](./NEBIUS_ACCESS_DECISION_BANGLADESH.md)

**Deferred:** Life After Code / GitLab implementation until the official rules are published and re-checked.

Baseline: [EXECUTION_BASELINE_NEBIUS_PAYPAL_2026-10-05.md](./EXECUTION_BASELINE_NEBIUS_PAYPAL_2026-10-05.md)

Submission readiness: [NEBIUS_SUBMISSION_READINESS_2026-10-06.md](./NEBIUS_SUBMISSION_READINESS_2026-10-06.md)
