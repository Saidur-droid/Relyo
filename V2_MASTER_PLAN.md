# Relyo V2 — Canonical Master Plan

> **STATUS: ACTIVE — EXECUTE THIS VERSION ONLY**
>
> **AI builds it. Relyo proves it.**
>
> This document is the canonical company, product, architecture, go-to-market, moat, fundraising, and execution source of truth for Relyo V2. If any older document conflicts with this file, this file wins. V1 is archived and must not be implemented.

---

# 0. Executive Decision

Relyo is **not** another AI app builder, coding agent, DevOps assistant, scanner, cloud, monitoring tool, or generic desktop agent.

Relyo is:

> **Independent software proof infrastructure for machine-built software.**

The product exists because software creation is becoming abundant while trust remains scarce.

Lovable, Replit, Cursor, Codex, Claude Code, Gemini-based builders, future coding agents, internal enterprise agents, and human development teams are not the strategic enemy. They are upstream software producers and potential customers, partners, and distribution channels.

Relyo wins when software-producing systems call Relyo before or after releases to answer:

> **What can be independently proven about this exact release, in this exact environment, at this exact time?**

Long-term, Relyo should become the neutral trust layer that sits between machine-generated software and the real world.

---

# 1. Why This Company Must Exist

AI reduces the cost of writing and shipping code. That creates more software, more releases, more producers, and more automated changes.

The hard downstream questions do not disappear:

- Did authentication actually work in production?
- Are authorization boundaries correct?
- Can one customer read another customer's data?
- Did the payment webhook actually update the right state?
- Does email arrive?
- Can the database restore?
- Can a broken deployment roll back?
- Is an API key exposed?
- Does the software still work after a provider change?
- Does one customer cost more to serve than they pay?
- Did the coding agent actually finish what it claimed?
- Can a third party trust the evidence?

The core user pain is:

> **"I don't know what I don't know, and I cannot independently prove that the whole business works."**

Relyo converts unknown production reality into explicit, inspectable proof.

---

# 2. The Strategic Position

## 2.1 The category

Primary category:

**Independent Software Proof Infrastructure**

Useful alternate language:

- Production Proof Layer
- Autonomous Software Trust Layer
- Machine-Built Software Assurance
- Software Assurance Infrastructure

## 2.2 What Relyo sells

Relyo sells **verified confidence with evidence**, not AI-generated reassurance.

Relyo does not sell:

- "the model thinks this is fine";
- "tests are green";
- "deployment succeeded";
- a vague confidence score;
- a one-time scan.

Relyo sells reproducible evidence that defined outcomes passed under defined conditions.

## 2.3 Constitutional rule

> **Do not build a company that must beat every AI builder. Build infrastructure every AI builder is better off using.**

---

# 3. Strategic Constitution

Unless the founder intentionally changes strategy in a documented decision, all developers and agents must preserve these rules:

1. Do not become a primary IDE or app builder.
2. Do not compete with frontier model labs on base models.
3. Do not build a general cloud/hosting platform.
4. Do not replace specialist security, observability, payment, identity, or infrastructure vendors when integration is sufficient.
5. Remain provider-neutral.
6. Own proof semantics, verification contracts, evidence, policy, assurance, remediation safety, and release trust.
7. Creator and verifier must be logically independent.
8. Models may reason; deterministic contracts determine pass/fail.
9. Sensitive actions are least-privilege and approval-gated.
10. Every major product surface must eventually work headlessly through API/SDK/MCP/CI.
11. Open interoperability at the edges; proprietary intelligence and trust network in the control plane.
12. Optimize for verified outcomes, not connector count.
13. Relyo must make builders stronger, not steal their core user relationship.

---

# 4. The Platform Map

```text
                SOFTWARE PRODUCERS

Lovable      Replit       Cursor
Codex        Claude Code  Gemini-based agents
Internal enterprise agents
Human teams
        \        |        /
         \       |       /
          ▼      ▼      ▼

             RELYO V2

Discovery / Production Graph
Proof Contracts
Policy
Relyo Runner
Verification
Evidence
Production Passport
Safe Remediation
Recovery
Continuous Proof
Verified Failure Graph

                 ▼

               REAL WORLD

GitHub / GitLab
Vercel / AWS / GCP / Azure
Supabase / Firebase / Neon
Stripe / Paddle / payment systems
Auth0 / Clerk / WorkOS / OAuth
Cloudflare / DNS
Email / SMS
AI APIs / external APIs
Databases / queues / storage
Browsers / mobile / users
```

Relyo creates value to both sides:

- builders: fewer failed launches, fewer support tickets, stronger trust;
- founders: simpler go-live and less hidden operational risk;
- enterprises: one release trust layer across every coding agent;
- infrastructure providers: better cross-system evidence;
- procurement/marketplaces: portable proof;
- future auditors/insurers: scoped technical evidence.

---

# 5. The Five Core Primitives

## 5.1 Production Graph

A living normalized map of the system behind an application.

It captures:

- repositories and release identities;
- environments and deployments;
- databases, schemas, roles, and policies;
- environment variables and secret references;
- OAuth and identity providers;
- payments and webhooks;
- email/SMS;
- DNS/TLS;
- queues, cron, storage;
- AI/model dependencies;
- external APIs;
- cost-producing calls;
- critical business journeys;
- rollback/restore paths;
- verification evidence and freshness.

The graph is not the product by itself. It is the model Relyo uses to decide what needs proof.

## 5.2 Proof Contract

A versioned, machine-readable definition of what must be true.

Example:

```yaml
contract: oauth.login.github
version: 1
environment: production
expect:
  - authorization_redirect_valid
  - callback_valid
  - session_created
  - protected_route_accessible
  - logout_invalidates_session
  - repeat_login_succeeds
proof:
  require:
    - provider_state
    - browser_journey
    - session_observation
    - timestamp
valid_for: 24h
```

Contracts define expected outcome, environment, roles, evidence, validity, failure conditions, allowed remediation, rollback expectation, and assurance requirement.

## 5.3 Relyo Runner

Execution should happen near the customer environment with minimal privilege.

Supported trajectory:

- Relyo-managed isolated runner;
- customer cloud runner;
- CI runner;
- local developer runner;
- self-hosted Kubernetes/VM runner;
- restricted offline verifier for selected contracts.

Core security properties:

- short-lived scoped credentials;
- outbound-only control channel where possible;
- signed tasks;
- signed evidence;
- isolated workspaces;
- customer KMS support later;
- secrets excluded from model context where possible;
- tamper-evident audit;
- zero-retention/private modes for enterprise.

## 5.4 Production Passport

A portable, signed statement describing exactly what was proven for a release.

It contains:

- app/release/environment identity;
- contracts executed;
- assurance level;
- evidence references/hashes;
- verifier version;
- approvals;
- unknowns/exclusions;
- validity window;
- remediation/rollback history.

Possible consumption surfaces:

- GitHub Checks;
- builder UI;
- deployment UI;
- public trust page;
- enterprise release gate;
- procurement portal;
- software marketplace;
- compliance evidence package.

## 5.5 Proof API

The headless platform surface.

Conceptually:

```text
POST /proof-runs
```

Relyo returns states such as:

```text
DISCOVERING
→ VERIFYING
→ REMEDIATION_AVAILABLE
→ APPROVAL_REQUIRED
→ REVERIFYING
→ VERIFIED / FAILED / PARTIAL
```

The Proof API, SDKs, MCP server, webhooks, CLI, CI actions, and GitHub integration are how builders and agents become customers instead of competitors.

---

# 6. Assurance Model

Do not lead with a vague percentage as the primary trust claim.

Use explicit assurance levels:

## R0 — Discovered

System mapped. No trust claim.

## R1 — Launch Verified

Critical launch configuration and core smoke contracts passed.

## R2 — Business Verified

Critical customer journeys independently reproduced.

## R3 — Resilience Verified

Selected rollback, restore, recovery, and failure-path contracts proven.

## R4 — Continuous Proof

Material changes and proof expiry continuously re-evaluated.

Every assurance claim must expose:

- exact contracts;
- release/environment;
- evidence;
- verifier version;
- timestamp;
- expiry/freshness;
- unknowns/exclusions.

Never claim "100% safe" or absence of all defects.

---

# 7. The User's Hard Problems

Relyo exists to solve invisible production problems that code generation alone does not solve.

## 7.1 Unknown dependency problem

The founder may not know which services, callbacks, secrets, roles, webhooks, scheduled jobs, domains, models, or external APIs the app depends on.

Relyo discovers them.

## 7.2 Configuration gap

A codebase may be correct while production environment values, OAuth callbacks, DNS, database policies, webhooks, or provider settings are wrong.

Relyo compares expected and observed state.

## 7.3 Self-grading problem

The same agent that wrote/fixed code cannot be the final authority on success.

Relyo independently verifies outcomes.

## 7.4 Business-flow gap

Build success does not prove signup, login, checkout, webhooks, entitlements, cancellation, deletion, or user isolation.

Relyo runs real/synthetic journeys.

## 7.5 Recovery illusion

A backup existing does not prove restore works.

Relyo should test restoration and rollback where safe.

## 7.6 Economics gap

AI-generated apps can be technically correct and financially impossible.

Relyo can trace metered API/LLM/cloud costs and expose negative contribution paths.

## 7.7 Drift problem

Today’s verified release can break tomorrow due to dependency, secret, DNS, schema, provider, policy, quota, certificate, or deployment changes.

Relyo continuously re-proves material contracts.

## 7.8 Enterprise agent sprawl

Companies increasingly use multiple coding agents. Security/platform teams cannot maintain a separate trust model per agent.

Relyo becomes one neutral release gate across all producers.

---

# 8. The WOW Moments

## WOW 1 — "We discovered your business"

```text
We discovered the system behind your product.

Repositories                 2
Production environments      1
External dependencies       19
Identity flows               3
Payment flows                2
Database roles               6
Webhooks                     7
Scheduled jobs               4
Critical journeys           12
Unknown ownership items      3

Assurance: R0 — DISCOVERED
```

The emotional reaction should be: "Relyo sees systems I didn't even know I had."

## WOW 2 — Repair, not report

```text
13 launch blockers found.

8 safely repairable now.

✓ OAuth callback corrected
✓ Production env mismatch fixed
✓ Missing data policy enabled
✓ Webhook endpoint corrected
✓ Email domain configured
✓ Rollback point created
✓ Backup policy enabled
✓ Exposed credential rotated

3 approvals needed
2 account-owner actions needed
```

A scanner creates work. Relyo removes work.

## WOW 3 — Independent customer simulation

From a fresh environment:

```text
Create account          PASS
Verify email            PASS
Google OAuth            PASS
Create workspace        PASS
Invite teammate         PASS
Checkout                PASS
Payment webhook         PASS
Subscription active     PASS
Paid feature            PASS
Cancellation            PASS
Access revoked          PASS
Delete account          PASS
```

Then:

```text
R2 — BUSINESS VERIFIED
```

## WOW 4 — Production Passport

```text
RELYO PRODUCTION PASSPORT

Product: Acme
Release: 81ac9f2
Environment: production
Assurance: R3 — RESILIENCE VERIFIED

Identity           VERIFIED
Authorization      VERIFIED
Payments           VERIFIED
Data isolation     VERIFIED
Business journeys  VERIFIED
Email              VERIFIED
Rollback           VERIFIED
Restore            VERIFIED
Cost guardrails    VERIFIED

Evidence package: SIGNED
```

## WOW 5 — Trust break and recovery

Intentionally break a controlled dependency:

```text
PRODUCTION PROOF DEGRADED
R3 → R1

Payment lifecycle contract failed.
Root cause isolated.
Safe recovery available.
```

Repair/rollback, then:

```text
Re-verifying...
R3 RESTORED ✓
```

This demonstrates the long-term mental model: **software immune system**.

## WOW 6 — Builder-native proof

```text
Lovable/Replit/Cursor/Codex/Claude finishes release
        ↓
Relyo Proof API/MCP
        ↓
Independent verification
        ↓
Production Passport
        ↓
"Built by X — independently verified by Relyo"
```

This is the strategic WOW because Relyo becomes infrastructure, not merely a dashboard.

---

# 9. Product Modes

## Mode A — Founder Go-Live

Wedge product:

```text
Connect app
→ discover
→ identify blockers
→ safely remediate
→ ask minimum approvals
→ verify real journeys
→ issue passport
```

## Mode B — Builder Embedded Proof

For AI builders/coding agents:

```text
agent creates release
→ Relyo API/MCP
→ evidence + pass/fail + remediation
→ builder surfaces verified state
```

## Mode C — Enterprise Agent Governance

```text
Cursor / Codex / Claude / internal agents / humans
                  ↓
          Relyo policy + proof gate
                  ↓
         production authorization
```

## Mode D — Fleet Assurance

For agencies/platforms managing many apps:

- expired proof;
- degraded proof;
- unverified releases;
- risky changes;
- policy violations;
- provider incidents;
- cost anomalies;
- dependency exposure.

## Mode E — Procurement / Marketplace Trust

Portable proof can later be consumed by buyers, marketplaces, vendor review, insurers, or auditors.

---

# 10. Safety and Remediation Policy

Relyo must never become reckless autonomy.

All actions use a risk class:

- `OBSERVE`
- `SAFE_REVERSIBLE`
- `APPROVAL_REQUIRED`
- `HUMAN_ONLY`
- `FORBIDDEN`

High-risk mutation flow:

```text
observe
→ calculate blast radius
→ create rollback/restore point
→ stage/shadow test when possible
→ obtain required approval
→ apply smallest change
→ independently verify
→ auto-revert if proof fails
```

Sensitive examples requiring approval/human action include payment activation, destructive DB operations, primary domain changes, production data migration, credential rotation with broad impact, ownership changes, payouts/transfers, identity verification, MFA, CAPTCHA, legal consent, hardware wallet signing.

---

# 11. Security Is the Product

Because Relyo may influence production, trust architecture is core product functionality.

Required trajectory:

- least privilege by default;
- provider-native OAuth/app installations over raw long-lived keys;
- short-lived delegated credentials;
- isolated runners;
- signed task envelopes;
- signed/tamper-evident evidence;
- strict tenant isolation;
- secrets kept out of prompts/model context;
- HSM/KMS-backed signing later;
- immutable audit events;
- deny-by-default action policy;
- blast-radius controls;
- dry-run support;
- automatic rollback checkpoints;
- external pentests;
- public security model;
- bug bounty;
- private runner/data residency/zero-retention for enterprise.

Never trade trust for a flashy demo.

---

# 12. Standards Strategy

Do not reinvent mature standards.

Integrate with or learn from:

- SLSA provenance concepts;
- in-toto attestations;
- Sigstore signing/identity/transparency patterns;
- OpenTelemetry signals;
- OPA/policy-as-code;
- SBOM formats;
- CI/CD provenance;
- cloud identity standards.

Relyo adds the higher-level missing layer:

> **cross-provider runtime + business-outcome proof.**

Potentially open-source/open-standard:

- Proof Contract spec;
- Production Passport schema;
- evidence envelope;
- adapter SDK;
- local verifier;
- conformance test kit.

Commercial moat remains in hosted control plane, trust registry, global evidence graph, advanced continuous proof, enterprise governance, certified packs, remediation intelligence, fleet analytics, and distribution.

---

# 13. The Moat Stack

No single moat is enough. Build seven together.

## 13.1 Standard moat

Proof Contract and Passport adoption across tools.

## 13.2 Data moat

**Verified Failure Graph** containing privacy-safe patterns:

```text
producer type
stack fingerprint
provider combination
release change
failure signature
root cause
repair class
contracts affected
remediation
verification result
rollback result
cost
latency
```

## 13.3 Network moat

Passports gain value as more builders, enterprises, marketplaces, and buyers accept them.

## 13.4 Integration moat

Certified provider adapters and contract packs.

## 13.5 Trust moat

Independent verifier reputation, security posture, methodology, and reliable evidence.

## 13.6 Policy moat

Enterprise production rules become encoded around Relyo.

## 13.7 Workflow moat

Relyo becomes embedded in agent/build/deploy pipelines.

Avoid fake moats:

- prompts;
- one LLM;
- dashboard count;
- generic browser scripts;
- one confidence score;
- shallow connectors.

---

# 14. The Verified Failure Graph

This becomes one of the strongest proprietary assets.

Future example:

```text
Vercel + Supabase + Google OAuth + Next.js
→ 1,200,000 verified releases
→ 4,309 recurring failure signatures
→ repair success probabilities
→ contracts most predictive of escaped incidents
```

or:

```text
Builder X + Stripe + Resend
→ recurring webhook edge case detected
→ known remediation
→ independent verification success rate 97.2%
```

The network value must come from normalized failure/evidence fingerprints rather than sharing customer secrets or raw private code.

---

# 15. Growth Engine

## 15.1 Founder wedge

First message:

> **Your AI app is built. Is it actually ready?**

Free GitHub app / low-friction connect:

- Production Graph;
- R0 discovery;
- top critical unknowns/blockers.

Paid activation:

> **Prove My App**

## 15.2 Viral trust artifact

Optional public badge/passport:

```text
Relyo Verified ✓
```

Click-through shows scope, freshness, assurance level, and evidence summary.

## 15.3 Developer adoption

Open-source CLI/spec/action:

```text
relyo prove
```

CI/GitHub checks create organic distribution.

## 15.4 Agency wedge

Agencies have many client apps and high pain from invisible production failures. Fleet assurance validates multi-app value early.

## 15.5 Builder partnership

Pitch builders:

> **Your agent builds faster. Relyo gives customers independent proof that what it built is ready for the real world.**

Benefits:

- fewer failed launches;
- fewer support tickets;
- stronger enterprise trust;
- independent assurance;
- lower internal verification burden;
- better feedback data for the builder's own agent.

## 15.6 Enterprise pull

One organization may use many coding agents. Relyo becomes one production policy/proof gate across all of them.

## 15.7 Buyer-driven network

Long-term:

```text
Enterprise requires Relyo proof
        ↓
Vendor adopts Relyo
        ↓
More passports
        ↓
More buyers accept/require Relyo
        ↓
Relyo becomes a trust standard
```

---

# 16. Customer Ladder

1. AI-built app founder
2. startup team
3. agency/studio portfolio
4. smaller AI builder/design partner
5. established AI builder/platform
6. engineering/platform team
7. enterprise AI software governance
8. software marketplace/procurement
9. future insurer/auditor ecosystem

The founder market is the wedge, not the terminal market.

---

# 17. Business Model and Pricing Hypotheses

Pricing must reflect avoided production risk and proof value, not tokens.

Early hypotheses:

- Free: discovery/local/basic R0
- Founder: roughly $29–$79/month
- Pro/team: roughly $149–$299/month
- Agency/fleet: roughly $499–$1,500+/month depending on apps/usage
- Proof API: usage-based + platform commitments
- Enterprise: annual contract; potentially $50k–$500k+ depending on scale/features
- Large builder/platform: annual platform contract + proof volume; potentially materially larger

These are hypotheses, not promises. Validate willingness-to-pay before locking pricing.

Potential later revenue:

- managed/private runners;
- continuous proof volume;
- premium contract packs;
- certification/adapter ecosystem;
- procurement APIs;
- advanced governance;
- evidence retention;
- SLA tiers.

---

# 18. Fundraising Strategy

Idea alone should not drive fundraising. Capital should follow evidence.

## Bootstrap / angel

Goal: trust-kernel prototype and magical demo.

Possible range: $0–$250k if needed.

## Pre-seed

Evidence:

- working founder wedge;
- 5–20 credible design partners;
- repeated critical failures caught;
- early retention;
- strong live demo.

Target hypothesis: **$1M–$3M**.

## Exceptional pre-seed

If there is rapid usage, strong founder retention, and a builder LOI/design partnership:

Target hypothesis: **$3M–$5M**.

## Seed

Evidence:

- growing verified releases;
- meaningful revenue;
- high proof reliability;
- one or more platform/builder customers;
- clear cost/proof economics;
- early network effects.

Target hypothesis: **$6M–$15M**.

## Series A

Evidence:

- several million dollars ARR or equivalent high-quality platform usage;
- enterprise repeatability;
- strong retention;
- external proof consumption;
- clear data/standard/network moat.

Target hypothesis: **$20M–$50M+**.

## Growth

If Relyo becomes category infrastructure, later rounds can be much larger. Never treat adjacent companies' funding as a promise of Relyo's valuation.

---

# 19. Investor Story

Five-slide essence:

## Slide 1

> **AI made software creation abundant. Trust did not scale with it.**

## Slide 2

More builders + more autonomous releases = verification workload explosion.

## Slide 3

> **Relyo is the independent proof layer for machine-built software.**

## Slide 4

```text
Every Builder / Coding Agent
          ↓
        Relyo
          ↓
Every Production Environment
```

## Slide 5

> **We do not compete with the companies creating software. We become infrastructure they depend on.**

The live demo should matter more than slides.

---

# 20. Investor Demo

Use an intentionally broken AI-generated SaaS.

### Act 1 — Discovery

```text
18 dependencies discovered.
12 launch blockers.
```

### Act 2 — Safe remediation

Relyo fixes reversible issues, asks for minimal approvals, and identifies human-only checkpoints.

### Act 3 — Real synthetic customer

Signup → email → OAuth → checkout → webhook → paid feature → cancellation → deletion.

### Act 4 — Passport

Issue R2/R3 signed Production Passport.

### Act 5 — Controlled break

Break one production contract.

### Act 6 — Detection/recovery

Relyo degrades proof, isolates cause, repairs/rolls back, re-verifies, and restores assurance.

### Act 7 — Platform proof

Show external coding agent calling Relyo through MCP/API and receiving an independent release decision.

This proves both magical founder UX and infrastructure depth.

---

# 21. North-Star Metrics

Primary north star:

> **Verified Production Outcomes**

Platform maturity north star:

> **Proof Runs Successfully Consumed by Third Parties**

Track:

- verified releases;
- verified critical journeys;
- time to first Production Graph;
- time to first verified fix;
- time connect → R1/R2;
- critical failures caught before user impact;
- auto-remediation success rate;
- rollback success rate;
- escaped incident rate after verified release;
- false-pass rate;
- false-positive/false-negative contract rate;
- cost per verified contract/release;
- evidence freshness;
- apps under continuous proof;
- external builder/API initiated proof percentage;
- Production Passport consumers;
- percentage of releases gated by Relyo policy.

Sacred metric:

> **False VERIFIED rate must be driven toward zero.**

---

# 22. MVP — Build This, Not the Whole Vision

The first magical vertical slice:

```text
AI-generated SaaS
→ connect GitHub
→ discover stack
→ identify hidden production failures
→ safely fix a small supported set
→ run a real synthetic customer journey
→ issue signed Production Passport
```

Initial stack:

- GitHub
- Vercel
- Supabase
- Google OAuth
- GitHub OAuth
- Stripe test mode
- Resend
- Cloudflare

Initial proof domains:

- release/build/deploy identity;
- environment configuration;
- authentication;
- authorization/data isolation;
- one payment lifecycle;
- one email path;
- DNS/HTTPS;
- critical browser journey;
- rollback check;
- selected backup/restore check;
- basic variable-cost tracing.

Do not expand connector count until this flow is genuinely magical.

---

# 23. Execution Phases

## Phase 0 — Trust Kernel

Implement:

1. release identity
2. Proof Contract schema
3. deterministic contract result
4. evidence envelope
5. signing
6. runner protocol
7. risk/action classification
8. approval event
9. verifier separation
10. Production Passport output

## Phase 1 — Founder Wedge

GitHub + Vercel + Supabase + auth + Stripe test + Resend + Cloudflare; discovery, R1/R2 proof, small safe remediation set, GitHub Check, hosted dashboard.

## Phase 2 — Proof API

API, SDK, MCP, webhooks, CI, white-label components, contract packs, first builder design partners.

## Phase 3 — Enterprise Governance

Private runner, SSO/SCIM, RBAC, policy engine, approval routing, fleet view, data residency, evidence retention, release authorization API.

## Phase 4 — Trust Network

Portable passports, verifier registry, certified contracts/adapters, provider certification, marketplace/procurement interfaces.

## Phase 5 — Autonomous Software Control Plane

```text
Agent proposes change
→ Relyo determines required proof
→ stage/shadow verification
→ policy decision
→ production authorization
→ deploy
→ continuous proof
→ rollback/repair if trust breaks
```

---

# 24. Architecture Boundaries

Logical services/modules should remain separated even if deployed together initially:

- Discovery Engine
- Production Graph
- Contract Registry
- Policy Engine
- Relyo Runner protocol
- Remediation Orchestrator
- Independent Verification Engine
- Evidence Store/Ledger
- Passport Signer
- Recovery Engine
- Cost/Economics Engine
- Provider Adapter layer
- Proof API
- UI/dashboard

Core rule:

> business truth lives in typed contracts, policies, adapters, and evidence — not in free-form prompts.

Models can assist discovery, reasoning, planning, explanation, and remediation generation. They do not directly define final VERIFIED status.

---

# 25. Provider Adapter Strategy

Avoid infinite dashboard automation maintenance.

Priority:

1. provider API/app integration;
2. CLI/standard protocol;
3. OpenAPI/MCP/webhook primitives;
4. browser automation only as last resort.

Build:

- typed adapter interface;
- versioned capabilities;
- adapter conformance tests;
- certified adapters;
- community/provider-maintained adapters later.

The durable moat is contract/evidence semantics above providers, not manually clicking dashboards.

---

# 26. Unit Economics of Relyo Itself

Continuous browser sessions and frontier-model calls can destroy margins.

Use:

- event-driven verification;
- deterministic cheap checks continuously;
- full journey proof only on material change/expiry;
- cached evidence with defined freshness;
- cheap models for classification;
- frontier models only for ambiguous reasoning;
- provider webhooks over polling;
- sampling for high-volume fleets;
- customer-hosted runners for heavy enterprise usage.

Track **cost per verified contract** and **cost per verified release** from day one.

---

# 27. Competitive Relationship

Relyo should be complementary to:

- Lovable / Replit / other AI builders;
- Cursor / Codex / Claude Code / coding agents;
- Vercel / cloud providers;
- Supabase / databases;
- Snyk/Wiz/Semgrep/security tools;
- Datadog/Sentry/observability;
- BrowserStack/Playwright/testing;
- identity/payment/email providers.

Relyo consumes signals and/or verifies outcomes across them.

Builder partnership line:

> **Your agent builds it. Relyo proves it.**

Enterprise line:

> **One production trust layer for every coding agent your company uses.**

---

# 28. Red-Team Lessons That Must Never Be Forgotten

The baseline V1 failed because:

- builders can bundle production/security features;
- testing/observability vendors can claim verification;
- security vendors can expand into remediation;
- broad production access creates trust risk;
- auto-remediation can damage production;
- confidence scores can become meaningless;
- long-tail connectors can destroy engineering economics;
- MFA/CAPTCHA/legal consent prevent full autonomy;
- continuous proof can be expensive;
- founders alone may have low retention/willingness-to-pay;
- enterprises need private execution;
- open-source copies are possible;
- liability makes absolute "proof" claims dangerous;
- a new trust company must earn trust;
- builder platforms will resist a product that tries to steal their customer relationship;
- model providers can build strong agents;
- mature standards already solve pieces of provenance/policy/telemetry.

V2 survives by being neutral, standards-friendly, evidence-based, least-privilege, headless, portable, independently verifying, and valuable to builders themselves.

Read `RED_TEAM.md` before major strategy changes.

---

# 29. What Not to Build First

Do not burn the company building:

- our own IDE;
- our own general-purpose coding model;
- our own cloud;
- generic desktop automation;
- generic browser agent;
- hundreds of shallow integrations;
- a static report-only scanner;
- a chat interface without proof infrastructure;
- full compliance suite before the trust kernel;
- opaque confidence-score theater.

---

# 30. 20-Year Thesis

"Vibe coding" may disappear as a term. Individual tools may disappear. The producer may evolve:

```text
human
→ AI assistant
→ coding agent
→ autonomous engineering system
→ autonomous organization
```

The durable question remains:

> **Who independently verifies what machines changed before those changes affect customers, money, data, and infrastructure?**

As machine autonomy increases, the need for neutral proof should increase.

Relyo therefore anchors itself to a durable primitive: **proof**.

End-state vision:

```text
AI/agent creates software
        ↓
Relyo determines required proof
        ↓
Relyo verifies independently
        ↓
policy authorizes production
        ↓
software runs
        ↓
Relyo continuously re-proves critical contracts
        ↓
trust break → contain / repair / rollback / re-prove
```

The strongest future state:

> **A machine-built software release without portable proof feels incomplete.**

---

# 31. Final Company Test

Every major initiative should be rejected unless it improves one or more of:

- independent proof quality;
- evidence portability;
- safety/least privilege;
- verified outcome coverage;
- builder/platform distribution;
- contract standard adoption;
- Verified Failure Graph intelligence;
- Production Passport acceptance;
- enterprise policy/governance value;
- cost/proof economics;
- trust reputation.

If a feature only makes Relyo look like another coding agent or another dashboard, do not build it.

---

# 32. Final Definition

> **Relyo is the independent proof layer for machine-built software.**
>
> **AI builds it. Relyo proves it.**

The winning end state is not:

> "Relyo built this app."

It is:

> **"This software can be trusted because Relyo independently proved the claims that matter."**
