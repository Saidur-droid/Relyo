# Competition Execution Baseline — Nebius x NVIDIA + PayPal AI

**Recorded:** 2026-10-05  
**Baseline main SHA:** `869975795e0b4e6ad8461bdd0e481251a108317c`  
**Execution branch:** `competition/relyo-2026`

## Scope now

Build only the two currently approved competition capabilities:

1. **Nebius x NVIDIA** — Nemotron through Nebius Token Factory for reasoning, contract prioritization, diagnosis and remediation planning. Deterministic Relyo evidence remains authoritative.
2. **PayPal AI** — PayPal sandbox payment-to-business-outcome verification with a deterministic Payment Integrity Proof Contract.

## Explicitly deferred

**Life After Code / GitLab is not being implemented yet.** Re-check the final official rules first.

## Baseline boundary

The competition branch starts from the exact SHA above. Existing Relyo product primitives remain unchanged:

- Production Graph;
- Proof Contracts;
- Independent Verifier;
- Shadow Mode;
- Safe Remediation;
- Production Passport;
- existing Vercel/Supabase/GitHub proof paths.

Competition work must add capability without weakening the rule:

> **AI reasons. Evidence decides.**

## Live-credential boundary

No Nebius or PayPal secret is committed to Git.

Live execution requires server-side environment configuration after code/tests are ready:

- `NEBIUS_API_KEY`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- competition fixture URL/control token

Until those credentials are configured, CI can prove deterministic parsing, proof semantics, secret redaction and provider request construction, but not live sponsor API success.
