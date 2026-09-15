# Relyo V2 — Execution Plan

> **ACTIVE EXECUTION DOCUMENT — V2 ONLY**
>
> This file converts `V2_MASTER_PLAN.md` into an implementation sequence. Do not implement V1.

## Read before work

1. `README.md`
2. `AGENTS.md`
3. `V2_MASTER_PLAN.md`
4. `RED_TEAM.md`
5. this file

---

# Operating principle

Build the smallest production-grade vertical slice that proves the V2 thesis:

```text
AI-built SaaS
→ connect repo
→ discover system
→ evaluate Proof Contracts
→ safely repair a small supported set
→ independently execute a real customer journey
→ issue signed Production Passport
```

Do not optimize for breadth before this flow is magical and trustworthy.

---

# Milestone 0 — Repository and engineering foundation

Deliverables:

- monorepo/project structure decision;
- typed language/runtime choice;
- ADR process;
- test strategy;
- threat model;
- local development setup;
- CI;
- secrets policy;
- dependency policy;
- release/versioning policy;
- observability baseline.

Exit criteria:

- clean CI on `main`;
- documented local setup;
- no production secrets committed;
- architecture decisions written down;
- future agent can reproduce development environment.

---

# Milestone 1 — Trust Kernel

Implement core domain types first.

Required entities:

- `Subject`
- `ReleaseIdentity`
- `EnvironmentIdentity`
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

Required behavior:

- versioned contract schema;
- deterministic pass/fail/partial/unknown;
- evidence references + hashing;
- signed proof result;
- explicit unknown/exclusion handling;
- assurance computation based on required contracts;
- passport serialization.

Exit criteria:

- a local deterministic demo can execute a fake contract pack and issue a signed passport;
- no LLM is required to decide the final result.

---

# Milestone 2 — Relyo Runner v0

Build isolated execution substrate.

Required:

- signed task envelope;
- task identity;
- scoped capability grants;
- isolated workspace;
- process timeout;
- network policy hook;
- artifact/evidence upload;
- redaction of obvious secrets;
- structured logs;
- cancellation;
- runner health;
- tamper-evident result metadata.

Initial mode:

- Relyo-managed ephemeral runner.

Later modes:

- CI runner;
- local runner;
- customer cloud/self-hosted.

Exit criteria:

- control plane can request a proof task;
- runner executes it in isolation;
- evidence returns signed and attributable to release/environment.

---

# Milestone 3 — GitHub discovery

Build first upstream connector.

Discover:

- repository metadata;
- default/production branches;
- framework/runtime;
- manifests/lockfiles;
- environment variable references;
- integration clues;
- deployment config;
- routes/endpoints;
- auth/payment/email/provider SDK usage;
- migration files;
- test/build commands;
- release SHA.

Output:

- initial Production Graph nodes/edges;
- inferred required contracts;
- unknowns requiring provider connection.

Exit criteria:

- common Next.js/React AI-built repo produces a useful Production Graph without manual mapping.

---

# Milestone 4 — Vercel + Supabase provider state

Add typed adapters.

Vercel capabilities:

- project/repo mapping;
- production branch;
- deployments;
- deployment status;
- environment variable names/presence without unnecessary secret disclosure;
- domains;
- deployment logs/evidence;
- redeploy/rollback capability with risk classification.

Supabase capabilities:

- project mapping;
- schema/migrations state;
- auth configuration;
- RLS/policy state;
- role exposure checks;
- redirect URLs where accessible;
- backup capability metadata;
- safe read-only authorization test support.

Exit criteria:

- graph can reconcile code expectations with provider-observed state.

---

# Milestone 5 — First contract pack: Launch Verification R1

Implement deterministic contracts for:

- release identity;
- build/deployment readiness;
- expected production environment values present;
- domain/HTTPS reachability;
- app health endpoint or equivalent HTTP check;
- Supabase policy baseline;
- service-role/browser exposure check;
- core unauthenticated route behavior.

Exit criteria:

- R1 can be issued or denied with inspectable evidence.

---

# Milestone 6 — Auth proof

Support Google OAuth and GitHub OAuth initially.

Proof should cover:

- authorization initiation;
- callback correctness;
- session creation;
- protected route;
- logout invalidation;
- repeat login;
- unauthorized access rejection.

Use fresh browser/session state for verification.

Exit criteria:

- Relyo can reject an apparently successful deployment with broken production OAuth and explain why.

---

# Milestone 7 — Safe remediation v0

Support only a small reversible set.

Candidate actions:

- Vercel environment configuration update;
- supported callback/redirect configuration;
- safe redeploy;
- selected non-destructive Supabase policy configuration where deterministic;
- Resend/Cloudflare DNS guidance or API-based configuration where available;
- create rollback checkpoint before mutation.

Every action must declare:

- risk class;
- required capabilities;
- blast radius;
- rollback method;
- verification contracts to rerun.

Exit criteria:

- failed contract → remediation → independent re-verification → pass or rollback.

---

# Milestone 8 — Synthetic Customer / Business Verification R2

Build journey engine.

Initial SaaS journey:

```text
sign up
→ email verification or OAuth
→ authenticated session
→ create primary app resource
→ execute one core business action
→ logout/login
→ delete/cleanup test data
```

Optional Stripe test-mode extension:

```text
checkout
→ webhook
→ entitlement active
→ cancel
→ entitlement revoked
```

Journey output must store evidence without leaking sensitive content.

Exit criteria:

- R2 passport demonstrates a real reproducible business journey, not only infrastructure checks.

---

# Milestone 9 — Production Passport UI + GitHub Check

Deliver:

- release summary;
- assurance level;
- contract results;
- unknowns/exclusions;
- evidence links;
- freshness/expiry;
- remediation history;
- verifier identity/version;
- signed machine-readable passport;
- GitHub status/check integration.

Exit criteria:

- a developer can see `Relyo R2 VERIFIED` on a release and inspect exactly why.

---

# Milestone 10 — Founder Go-Live beta

UX:

```text
Connect GitHub
→ connect providers
→ "We discovered your business"
→ blockers
→ fix automatically / approve / human checkpoint
→ fresh verification
→ passport
```

Plain language is mandatory. Technical evidence stays available.

Exit criteria:

- 5–20 design partners successfully use it on real AI-built apps;
- collect failure patterns, time-to-proof, approval count, support burden, false positives/negatives.

---

# Milestone 11 — Proof API + SDK + MCP

Add:

- `/proof-runs` API;
- webhook callbacks;
- TypeScript SDK;
- Python SDK;
- CLI;
- MCP server;
- CI action;
- white-label result component.

Exit criteria:

- external agent can submit release for proof without opening Relyo dashboard;
- first third-party builder/design partner proof runs occur.

---

# Milestone 12 — Continuous Proof R4 foundation

Trigger proof on:

- deployment;
- material provider config change;
- contract expiry;
- scheduled freshness policy;
- relevant dependency/security event where integrated.

Avoid full browser reruns when cheap deterministic evidence remains valid.

Exit criteria:

- a controlled production break degrades passport and targeted re-verification restores it after repair.

---

# Milestone 13 — Resilience Verification R3

Add selected safe contracts:

- deployment rollback;
- database restore in isolated/safe environment;
- webhook replay;
- provider fallback where applicable;
- secret-expiry simulation where possible;
- recovery evidence.

Exit criteria:

- R3 represents tested recovery, not presence of backup configuration.

---

# Milestone 14 — Cost Intelligence

Build metered dependency graph.

Track where possible:

- LLM/model calls;
- database operations;
- image generation;
- external API calls;
- serverless invocations;
- bandwidth/storage;
- per-critical-journey variable cost.

Expose:

- expensive call chains;
- budget guardrails;
- negative unit-economics warnings.

Exit criteria:

- Relyo can estimate cost of a verified journey and explain dominant contributors.

---

# Milestone 15 — Agency/Fleet

Add:

- multi-app organization;
- portfolio assurance view;
- degraded/expired passport queue;
- shared policy;
- provider incident blast-radius view;
- app/client isolation;
- bulk proof scheduling.

Exit criteria:

- agency can manage 20+ apps with less operational overhead than individual dashboards.

---

# Milestone 16 — Enterprise Governance

Add:

- SSO/SCIM;
- RBAC;
- approval routing;
- policy engine;
- private runners;
- data residency;
- evidence retention;
- customer-managed keys where required;
- release authorization API;
- agent identity attribution.

Example policy:

```text
customer-data apps require R3 before production
```

Exit criteria:

- Relyo can gate releases from multiple coding agents using one customer-owned policy layer.

---

# Milestone 17 — Trust Network

Add carefully after core trust is earned:

- public/private passport registry;
- verifier registry;
- certified contract packs;
- certified adapters;
- provider partnership workflow;
- procurement API;
- marketplace integration;
- third-party passport consumption analytics.

Exit criteria:

- organizations consume Relyo proof for software they did not build.

---

# Do-not-do list

Do not start these before the proof kernel works:

- proprietary IDE;
- general-purpose code generation;
- own cloud hosting;
- generic computer-use agent;
- hundreds of integrations;
- broad compliance suite;
- opaque AI score;
- agent chat product without deterministic proof;
- aggressive auto-remediation without rollback and independent verification.

---

# Definition of done for every production capability

A feature is not done because code was merged.

Where applicable, done requires:

1. implementation;
2. tests;
3. documented threat/failure cases;
4. risk classification;
5. evidence schema;
6. independent verification;
7. rollback/recovery behavior;
8. metrics/observability;
9. docs;
10. continuity update for the next developer/agent.

---

# Priority rule when resources are constrained

Choose work in this order:

1. trust correctness;
2. security/least privilege;
3. deterministic proof quality;
4. magical founder vertical slice;
5. headless API distribution;
6. cost efficiency;
7. enterprise controls;
8. integration breadth.

Never reverse this order just to make the product look bigger.
