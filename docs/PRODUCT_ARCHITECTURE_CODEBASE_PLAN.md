# Relyo V2 — Product Architecture & Codebase Plan

> **STATUS: ACTIVE EXECUTION PLAN**
>
> Goal: convert Relyo V2 from strategy into a buildable, secure, product-led software system.

## Product architecture principle

Relyo must separate **claim generation** from **proof generation**.

Models can help discover, explain, prioritize, and suggest repairs. Final VERIFIED status must come from typed contracts, deterministic checks, evidence envelopes, and verifier identity.

## Initial product modules

### 1. Web application

Purpose:

- public URL check;
- free repo readiness scan;
- Verify My Launch flow;
- passport display;
- onboarding and billing;
- agency/fleet dashboard later.

Recommended initial stack:

- TypeScript;
- Next.js App Router;
- PostgreSQL/Supabase or managed Postgres;
- queue/workflow runner;
- Playwright for browser journeys;
- GitHub App integration;
- Stripe for Relyo billing when paid launch proof starts.

### 2. Trust Kernel

Core domain package.

Entities:

- `Subject`
- `ReleaseIdentity`
- `EnvironmentIdentity`
- `ProductionGraph`
- `ProofContract`
- `ProofRun`
- `Assertion`
- `EvidenceEnvelope`
- `ContractResult`
- `AssuranceLevel`
- `ApprovalRequest`
- `ActionRiskClass`
- `RemediationPlan`
- `Passport`
- `VerifierIdentity`

Rules:

- no LLM required for final pass/fail;
- unknowns must be explicit;
- evidence must be inspectable;
- every result is bound to release + environment + verifier version;
- passports expire or degrade.

### 3. Provider adapters

Initial adapters:

- GitHub;
- Vercel;
- Supabase;
- Google OAuth/GitHub OAuth proof helpers;
- Stripe test mode;
- Resend;
- Cloudflare metadata/DNS checks.

Adapter contract:

```text
observe
→ normalize
→ expose capabilities
→ declare risk class for mutations
→ collect evidence
→ never leak secrets into model context
```

### 4. Relyo Runner v0

Purpose:

- isolated proof execution;
- browser journeys;
- HTTP checks;
- evidence collection;
- screenshot/log artifacts;
- safe timeout/cancellation;
- redaction;
- signed result metadata.

Initial mode:

- Relyo-managed ephemeral runner.

Future modes:

- GitHub Action runner;
- local runner;
- enterprise private runner.

### 5. Proof Contract engine

Responsibilities:

- contract schema validation;
- versioning;
- dependency handling;
- deterministic assertion evaluation;
- assurance computation;
- evidence linking;
- expiry/freshness policy.

Initial contract packs:

- Public URL Launch Check;
- GitHub Repo Readiness;
- R1 Launch Verification;
- OAuth Proof;
- Stripe Lifecycle Proof;
- R2 Synthetic Customer Journey.

### 6. Production Passport service

Responsibilities:

- generate human-readable passport;
- generate machine-readable JSON;
- sign/hash evidence references;
- provide public/private modes;
- provide badge/check/embed;
- provide expiry/degradation state.

### 7. Growth surfaces

These are product features, not marketing afterthoughts:

- Public URL Check;
- Free Repo Readiness Scan;
- Verify My Launch mode;
- Passport share page;
- GitHub Check/badge;
- Launch checklist pages;
- Proof API/MCP.

## Monorepo recommendation

Suggested structure:

```text
/apps/web                 # dashboard, public pages, passport pages
/apps/runner              # isolated proof runner service
/apps/api                 # API/control plane if separated from web
/packages/kernel          # trust domain models/contracts/evidence
/packages/contracts       # contract packs
/packages/adapters        # provider adapters
/packages/passport        # passport generation/signing
/packages/sdk-js          # TypeScript SDK
/packages/cli             # Relyo CLI
/packages/mcp             # MCP server
/packages/test-fixtures   # sample apps and fake provider states
/docs                     # strategy and execution docs
```

If starting smaller, web + API can be one Next.js app, but Trust Kernel must still be logically isolated.

## Database primitives

Initial tables/collections:

- organizations;
- users;
- apps;
- repositories;
- environments;
- releases;
- production_graph_nodes;
- production_graph_edges;
- provider_connections;
- proof_contracts;
- proof_runs;
- assertions;
- evidence_envelopes;
- passports;
- approval_requests;
- remediation_plans;
- billing_accounts;
- growth_events;
- partner_sources.

## Security rules

- least privilege from day one;
- provider-native OAuth/App installations preferred;
- no raw production secrets in logs;
- no secrets in prompts;
- action risk classification required;
- high-risk mutation requires approval;
- every proof artifact redacted by default;
- customer-visible evidence must show scope and exclusions.

## First build slice

The first usable product should ship in this order:

1. landing page + URL check waitlist/flow;
2. Trust Kernel fake local proof demo;
3. public URL check contract pack;
4. GitHub repo scan;
5. basic Production Graph;
6. R1 Passport;
7. Verify My Launch paid/manual beta;
8. GitHub Check/badge;
9. Stripe/OAuth proof;
10. R2 synthetic customer journey.

## Definition of architecture done

Architecture is ready when:

- a fake app can produce a signed passport locally;
- a real public URL can produce R0/R1-style findings;
- a GitHub repo can produce a Production Graph;
- results are evidence-backed;
- no LLM decides VERIFIED state;
- future adapters can be added without rewriting the kernel.
