# Relyo Strategy V2 — The Independent Proof Layer for Machine-Built Software

> **AI builds it. Relyo proves it.**

This document supersedes the narrow interpretation of Relyo as a founder-facing production fixer. The product remains useful to founders, but the company is designed as infrastructure for the entire AI software ecosystem.

---

# 0. The 70x Thesis

Software creation is becoming abundant.

The durable bottleneck is no longer primarily code generation. It is **trust**:

- Did the software actually do what the agent claimed?
- Is the release safe enough for its intended use?
- Did the infrastructure, identity, payments, data, recovery and business journeys work together?
- Can the result be independently reproduced?
- Can another organization trust the evidence?
- Can the proof travel with the release?
- Can a builder platform prove quality without grading its own homework?

Relyo becomes the neutral answer.

> **Relyo is independent proof infrastructure for machine-built software.**

The long-term ambition is not to become a better Replit, Cursor, Lovable, Codex or Claude Code.

The ambition is to become infrastructure those products call whenever software needs to be trusted.

---

# 1. Strategic Constitution

These rules are constitutional unless explicitly revisited by the founder:

1. **Do not become a primary IDE or app builder.**
2. **Do not compete with model labs on frontier models.**
3. **Do not compete with cloud providers on hosting.**
4. **Do not try to replace specialist security/observability vendors.**
5. **Integrate with upstream builders and downstream infrastructure.**
6. **Own the semantics of proof, policy, evidence, verification and release trust.**
7. **Remain provider-neutral.**
8. **Make independent verification stronger than self-reported agent success.**
9. **Prefer open standards at the edges and proprietary intelligence/network effects in the control plane.**
10. **Design every major capability so platforms can consume it headlessly.**

The product test for every major roadmap item is:

> Does this make Relyo more valuable to builders, enterprises and platforms without forcing them to surrender their primary user relationship?

---

# 2. Category Design

## 2.1 Category name

**Independent Software Proof Infrastructure**

Alternative enterprise language:

- Software Assurance Infrastructure
- Production Proof Layer
- Autonomous Software Trust Layer
- Machine-Built Software Assurance

## 2.2 What Relyo sells

Relyo sells **verified confidence with inspectable evidence**.

Not “AI says it works.”

Not “tests are green.”

Not “deployment succeeded.”

Relyo answers:

> **What can be independently proven about this exact software release, in this exact environment, at this exact time?**

---

# 3. The Platform Map

Relyo sits between software creation and real-world operation.

```text
             SOFTWARE PRODUCERS

Lovable       Replit        Cursor
Codex         Claude Code   Gemini/others
Internal agents             Human teams
        \       |       /
         \      |      /
          \     |     /
           ▼    ▼    ▼

        RELYO PROOF LAYER

Discovery
Production Graph
Contracts
Policy
Verification
Evidence
Attestation
Remediation
Recovery
Continuous Proof

           ▼    ▼    ▼

           REAL WORLD

GitHub / GitLab
Vercel / AWS / GCP / Azure
Supabase / Firebase / Neon
Stripe / Paddle / Adyen
Auth0 / Clerk / WorkOS
Cloudflare / DNS
Email / SMS
APIs / models
Databases / queues / storage
Browsers / mobile / users
```

Relyo should create value on both sides:

- builders get stronger quality claims and lower support burden;
- enterprises get independent governance;
- founders get easier launch and operations;
- infrastructure providers get clearer failure evidence;
- auditors/insurers/procurement teams get machine-readable proof.

---

# 4. The Core Primitive: Proof Contract

Everything should converge on a versioned **Proof Contract**.

A Proof Contract defines:

- expected outcome;
- environment;
- identities/roles;
- allowed actions;
- required evidence;
- failure conditions;
- validity window;
- verifier requirements;
- remediation permissions;
- rollback expectations;
- assurance level.

Example:

```yaml
contract: oauth.login.github
version: 1
release: sha256:...
environment: production
subject:
  app: example.com
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

This contract layer is far more defensible than a collection of prompts.

---

# 5. The Second Primitive: Production Passport

Every verified release can receive a **Production Passport**.

A Production Passport is a portable, signed statement of what was proven.

It includes:

- release identity;
- commit/build/deployment identity;
- environment;
- Proof Contracts executed;
- assurance level;
- evidence references/hashes;
- verifier identity/version;
- policy approvals;
- unknowns/exclusions;
- expiry/validity;
- remediation history;
- rollback/restore proof where relevant.

Example:

```text
Production Passport

App: Acme
Release: 8f91c2a
Environment: production
Assurance: R3 — Resilience Verified

Authentication       VERIFIED
Authorization        VERIFIED
Payments             VERIFIED
Data policies         VERIFIED
Critical journeys     VERIFIED
Rollback              VERIFIED
Restore               VERIFIED
Cost guardrails       VERIFIED

Evidence package: signed
Valid until: 2026-09-16 14:00 UTC
```

The passport can appear in:

- GitHub Checks;
- builder UI;
- deployment UI;
- procurement portal;
- enterprise release gate;
- software marketplace;
- compliance evidence package;
- public trust page.

---

# 6. The Third Primitive: Relyo Runner

To become trusted enterprise infrastructure, Relyo should separate control plane from execution.

**Relyo Runner** executes sensitive verification/remediation near the customer environment.

Modes:

1. Relyo-managed isolated runner
2. customer cloud runner
3. self-hosted Kubernetes runner
4. CI runner
5. local developer runner
6. restricted offline verifier for selected contracts

Security properties:

- outbound-only control channel where possible;
- short-lived credentials;
- customer KMS support;
- scoped capabilities;
- no secrets in model context;
- signed tasks;
- signed evidence;
- isolated workspaces;
- tamper-evident logs;
- zero-retention mode;
- regional execution.

This architecture reduces the objection: “Why should I give a startup admin access to production?”

---

# 7. The Fourth Primitive: Proof API

The most important platform product is a headless API.

A builder should be able to call:

```text
POST /proof-runs
```

with:

- release identity;
- target environment;
- requested contract pack;
- policy profile;
- callback/webhook.

Relyo returns:

```text
DISCOVERING
→ VERIFYING
→ REMEDIATION_AVAILABLE
→ APPROVAL_REQUIRED
→ REVERIFYING
→ VERIFIED / FAILED / PARTIAL
```

This is how Lovable, Replit, Cursor, Codex, Claude Code and internal enterprise agents become customers instead of competitors.

---

# 8. The Fifth Primitive: Proof SDK + MCP

Distribution surfaces:

- REST/GraphQL API
- TypeScript SDK
- Python SDK
- CLI
- GitHub App
- GitLab integration
- MCP server
- webhook API
- CI actions
- Terraform/OpenTofu provider later
- policy package integration

Builder workflow example:

```text
agent finishes feature
→ calls Relyo
→ Relyo issues release proof
→ builder displays VERIFIED
→ customer deploys with evidence
```

White-label mode:

> “Verified independently by Relyo”

or fully embedded branded UX for enterprise/platform contracts.

---

# 9. Assurance Levels

Replace vague percentages with explicit guarantees about coverage.

## R0 — Discovered

System/dependency graph mapped. No trust claim.

## R1 — Launch Verified

Critical launch configuration and core smoke contracts passed.

## R2 — Business Verified

Critical customer journeys independently reproduced.

## R3 — Resilience Verified

Recovery, rollback, selected failure paths and restore contracts proven.

## R4 — Continuous Proof

The release is continuously evaluated against material change and contract expiry.

## Future regulated tiers

Higher assurance packages can incorporate specialist controls, auditors, regulated evidence, or insurer partnerships without pretending Relyo alone certifies every legal/compliance requirement.

---

# 10. Product Modes

## Mode A — Founder Go-Live

Wedge product.

```text
Connect app
→ discover
→ fix blockers
→ ask minimal approvals
→ verify journeys
→ issue Production Passport
```

Goal: fast adoption and real-world data.

## Mode B — Builder Embedded Proof

For Lovable/Replit/Cursor/etc.

```text
agent creates release
→ Relyo Proof API
→ pass/fail + evidence + remediation
→ builder UI displays proof
```

Goal: platform distribution.

## Mode C — Enterprise Agent Governance

Every coding agent and human release must satisfy organization policies.

```text
Codex
Claude Code
Cursor
internal agents
humans
    ↓
Relyo policy + proof gate
    ↓
production authorization
```

Goal: high-ACV enterprise revenue.

## Mode D — Fleet Assurance

Agencies, studios, enterprises and platforms manage hundreds/thousands of apps.

Dashboard focuses on:

- expired proof;
- degraded proof;
- risky changes;
- unverified releases;
- policy violations;
- provider-wide incidents;
- cost anomalies;
- exposure by dependency.

## Mode E — Procurement / Marketplace Trust

Software seller provides a machine-readable Production Passport to buyer/procurement system.

Long-term possible distribution into:

- software marketplaces;
- enterprise procurement;
- vendor security review;
- cyber insurance;
- managed service providers.

---

# 11. The WOW Experience — Founder

User provides one thing:

> “This is my app.”

Relyo responds:

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

Current Assurance: R0 — Discovered
```

Then:

```text
11 launch blockers detected.

7 safely repaired automatically.
2 require your approval.
2 require account-owner action.
```

After approval:

```text
Re-verifying from a fresh environment...

Signup                  PASS
Email verification      PASS
Google login             PASS
Checkout                 PASS
Webhook                  PASS
Paid feature             PASS
Cancellation             PASS
Deletion                 PASS
Rollback                 PASS

Production Passport issued.
Assurance: R3
```

The emotional outcome is not “I got a report.”

It is:

> **“I no longer need to understand every invisible system required to launch safely.”**

---

# 12. The WOW Experience — Builder Platform

Imagine Lovable integration:

```text
Lovable Agent built your app.

Relyo independent verification:

Authentication          VERIFIED
Database permissions     VERIFIED
Critical journeys        VERIFIED
Payment lifecycle        VERIFIED
Rollback                 VERIFIED

[View Production Passport]
```

Lovable gains:

- fewer failed launches;
- fewer support tickets;
- stronger enterprise story;
- independent trust signal;
- lower liability from self-certification;
- benchmark data on agent-produced software.

Relyo gains distribution.

Same logic applies to Replit, Cursor, Codex, Claude Code and future AI builders.

---

# 13. The WOW Experience — Enterprise

Enterprise has five coding agents producing software.

Instead of replacing them, Relyo sits underneath all of them:

```text
Policy: Customer-data services require R3 before production.
```

Cursor submits release.

Relyo:

```text
R2 achieved.
R3 blocked:
- restore has not been tested
- payment replay contract failed

Production authorization denied by policy.
```

Agent fixes issues.

Relyo re-runs proof.

```text
R3 achieved.
Production authorization issued.
```

The enterprise buys **one trust layer for every builder**.

That is a much stronger strategic position than selling another coding agent seat.

---

# 14. Neutrality as a Moat

Relyo must preserve credibility by separating:

- creator;
- fixer;
- verifier;
- policy authority.

Where practical:

- creator can be any external agent;
- remediation planner can be Relyo or external;
- verifier uses independent execution/state;
- policy is customer-owned;
- evidence is tamper-evident;
- final status is deterministic from contract results.

Relyo should never rely on one model saying “looks good.”

---

# 15. Open Standard Strategy

Relyo should intentionally make part of the system open.

Potential open components:

- Proof Contract specification;
- Production Passport schema;
- local verifier runtime;
- adapter SDK;
- contract test kit;
- evidence envelope format.

Why open it?

Because the strongest version of Relyo becomes a standard other products adopt.

If every builder can emit/consume Relyo-compatible proofs, Relyo wins even when it did not create the software.

Commercial products remain:

- hosted control plane;
- trust registry;
- signed verifier infrastructure;
- enterprise governance;
- fleet management;
- premium contract packs;
- managed runners;
- cross-provider remediation;
- historical intelligence;
- benchmarks;
- partner certification;
- advanced continuous proof.

Strategic analogies include OpenTelemetry: open interoperability can increase, not destroy, the commercial market around the standard.

---

# 16. Standards Interoperability

Do not reinvent existing infrastructure standards.

Relyo should integrate with:

- SLSA provenance concepts;
- in-toto attestations;
- Sigstore identity/signing/transparency patterns;
- OpenTelemetry signals;
- policy-as-code systems such as OPA;
- SBOM formats;
- CI/CD provenance;
- cloud-native identity standards.

Relyo adds the missing higher-level layer:

> **runtime + cross-provider + business-outcome proof.**

---

# 17. The Data Moat

The strongest proprietary asset becomes the **Verified Failure Graph**.

For each privacy-safe event:

```text
producer type
stack fingerprint
provider combination
release change
failure signature
root cause
repair class
proof contracts affected
remediation chosen
verification result
rollback result
cost
latency
```

Never require raw private code to create network value.

Over time Relyo can know:

```text
Vercel + Supabase + Google OAuth
→ common failure patterns
→ repair success probability
→ verification contracts most predictive of incidents
```

and:

```text
AI-generated Stripe integration from builder X
→ recurring webhook edge cases
→ contracts that catch them before production
```

This dataset becomes hard to reproduce because it comes from independently verified production outcomes across many builders/providers.

---

# 18. The Trust Network Moat

If Relyo passports are accepted by:

- builders;
- enterprises;
- marketplaces;
- procurement systems;
- insurers;
- auditors;
- agencies;
- cloud platforms;

then the value of issuing and consuming a passport increases with network adoption.

This is stronger than traditional SaaS lock-in.

The endgame is:

> **A software release without portable proof feels incomplete.**

---

# 19. The Partner Flywheel

```text
More builders integrate Relyo
        ↓
More releases are verified
        ↓
Better failure intelligence
        ↓
Better contracts/remediation
        ↓
Lower builder support burden
        ↓
More builders integrate Relyo
```

Second flywheel:

```text
More enterprises require Relyo proof
        ↓
More vendors/builders issue passports
        ↓
Relyo becomes a procurement standard
        ↓
More enterprises accept/require Relyo proof
```

---

# 20. Business Model

## Developer / founder

- Free discovery/local proof
- Pro continuous proof
- usage-based verified journeys

## Teams

- per-app/fleet pricing
- higher proof volume
- shared policy
- incident remediation

## Platforms/builders

- Proof API usage
- annual platform commitments
- white-label verification
- fleet analytics
- SLAs

## Enterprise

- annual contract
- private runner
- SSO/RBAC
- policy enforcement
- data residency
- audit/evidence retention
- bring-your-own-model options

## Ecosystem later

- certified adapter marketplace
- specialist verification packs
- procurement APIs
- insurer/auditor integrations
- premium trust registry services

---

# 21. Distribution Strategy

## Wedge 1 — GitHub

Relyo GitHub App produces a check:

```text
Relyo Production Proof
R2 VERIFIED
```

Developers can adopt without changing IDE.

## Wedge 2 — MCP

Coding agents call Relyo through MCP after work completes.

## Wedge 3 — Builder API

Offer platform partnerships where Relyo becomes embedded post-build verification.

## Wedge 4 — Open-source contract packs

Useful public contracts create organic adoption.

## Wedge 5 — Public benchmarks

Publish recurring data such as:

- failure rates by stack;
- most common AI-generated production regressions;
- time-to-proof;
- restore readiness;
- OAuth/payment failure patterns.

Never turn benchmarks into pay-to-win rankings.

## Wedge 6 — Enterprise policy

Once organizations use multiple coding agents, position Relyo as the neutral release gate across all of them.

---

# 22. Builder Partnership Pitch

Do not pitch:

> “We fix what your AI gets wrong.”

Pitch:

> **“Your agent builds faster. Relyo gives customers independent proof that what it built is ready for the real world.”**

Benefits:

- fewer failed launches;
- fewer support tickets;
- stronger enterprise trust;
- independent assurance;
- lower verification engineering burden;
- cross-provider proof outside the builder’s infrastructure;
- differentiated quality badge;
- feedback data for improving their agent.

---

# 23. Model-Lab Partnership Pitch

Relyo should support OpenAI, Anthropic, Google and others equally.

Possible customer use cases:

- evaluate coding-agent releases against real production contracts;
- benchmark agent-generated applications;
- create proof artifacts for enterprise customers;
- detect recurring failure modes by model/tool version;
- enforce customer policies before autonomous deployment.

Relyo does not need to own the model to own the trust layer.

---

# 24. Infrastructure Partner Pitch

For providers such as Vercel, Supabase, Cloudflare, Stripe and others:

Relyo can provide:

- precise cross-system incident evidence;
- integration health confirmation;
- lower customer support burden;
- certified adapter contracts;
- shared failure fingerprints;
- better diagnostics across provider boundaries.

The best outcome is providers eventually maintain or certify their own Relyo adapters/contracts.

---

# 25. Moat Stack

Relyo should intentionally build seven moats:

1. **Standard moat** — Proof Contract / Passport adoption.
2. **Data moat** — verified failure/repair corpus.
3. **Network moat** — passports accepted across producers/consumers.
4. **Integration moat** — certified provider adapters and contract packs.
5. **Trust moat** — independent verifier reputation/security.
6. **Policy moat** — enterprise release rules accumulated around Relyo.
7. **Workflow moat** — embedded into agent/build/deploy pipelines.

No single moat is sufficient. Together they are difficult to displace.

---

# 26. Anti-Moat Traps

Avoid mistaking these for durable moats:

- prompt engineering;
- using a specific LLM;
- number of dashboard integrations;
- browser automation scripts;
- generic chat UX;
- one proprietary confidence score;
- one-click deployment;
- a scanner ruleset competitors can copy.

---

# 27. Roadmap — Phase 0: Trust Kernel

Before broad product work, implement the minimum proof kernel:

1. release identity
2. contract schema
3. deterministic pass/fail
4. evidence envelope
5. signed proof result
6. runner protocol
7. risk/action classification
8. approval event
9. verification separation
10. passport output

A single stack is enough initially.

---

# 28. Roadmap — Phase 1: Founder Wedge

Supported stack:

- GitHub
- Vercel
- Supabase
- Google/GitHub OAuth
- Stripe
- Resend
- Cloudflare

Required capabilities:

- discover production graph;
- identify required contracts;
- launch proof;
- safe remediation for a small set of failures;
- business journey verification;
- R1/R2 passport;
- GitHub Check;
- simple hosted dashboard.

Success metric:

> founders can go from an AI-built repo to an independently verified production release with minimal technical intervention.

---

# 29. Roadmap — Phase 2: Relyo Proof API

Build platform surfaces:

- API;
- SDKs;
- MCP server;
- webhooks;
- white-label UI components;
- organization policy;
- evidence export;
- versioned contract packs.

Sign first builder/design partners.

Success metric:

> meaningful percentage of proof runs originate from third-party products, not the Relyo dashboard.

---

# 30. Roadmap — Phase 3: Enterprise Governance

Add:

- private runners;
- SSO/SCIM;
- RBAC;
- policy engine;
- approval routing;
- fleet view;
- data residency;
- audit/evidence retention;
- multiple coding-agent identities;
- release authorization API.

Success metric:

> Relyo becomes the mandatory production gate for organizations using multiple coding agents.

---

# 31. Roadmap — Phase 4: Trust Network

Add:

- portable public/private passports;
- verifier registry;
- certified contract packs;
- provider certification;
- procurement API;
- marketplace integrations;
- external auditor/insurer interfaces.

Success metric:

> organizations consume Relyo proof even when they are not the organization that created the software.

---

# 32. Roadmap — Phase 5: Autonomous Software Control Plane

As software agents become continuously autonomous, Relyo evolves into the authorization layer for machine changes.

```text
Agent proposes change
→ Relyo determines required contracts
→ shadow/stage verification
→ policy evaluation
→ production authorization
→ deployment
→ continuous proof
→ rollback/repair if trust breaks
```

At this stage the company is not primarily about vibe coding.

It is about governing autonomous software production.

---

# 33. Key Metrics

Do not optimize for scans.

North-star metrics:

- verified releases;
- verified critical journeys;
- percentage of proof runs triggered by external builders;
- proof acceptance by third parties;
- mean time from change → proof;
- escaped incident rate after verified release;
- auto-remediation success rate;
- rollback success rate;
- cost per verified contract;
- evidence freshness;
- contract false-positive/false-negative rate;
- number of apps under continuous proof;
- percentage of releases gated by Relyo policy.

---

# 34. Security Is the Product

Because Relyo may influence production, security must exceed normal SaaS posture.

Required trajectory:

- least privilege by default;
- isolated runners;
- signed task envelopes;
- HSM/KMS signing;
- short-lived credentials;
- customer-managed keys for enterprise;
- external pentests;
- public security model;
- bug bounty;
- tamper-evident audit;
- dependency/supply-chain security;
- reproducible verifier components where practical;
- strict separation of model reasoning and secret access;
- deny-by-default action policy.

Never trade trust for demo autonomy.

---

# 35. The Investor Demo

A great demo should prove both founder UX and platform depth.

## Demo A — broken AI-built app

```text
Relyo discovers 23 dependencies.
12 blockers.
8 safe repairs.
2 approvals.
2 human checkpoints.
```

Then independently verifies:

```text
signup
email
OAuth
checkout
webhook
paid feature
cancel
restore
rollback
```

Issues signed Production Passport.

## Demo B — external agent calls Relyo

Cursor/Claude/Codex finishes a change.

Instead of a human reviewing manually:

```text
agent → Relyo MCP/API
```

Relyo rejects first attempt with concrete evidence.

Agent fixes it.

Relyo verifies it.

Production authorization issued.

This demonstrates that Relyo is not merely a founder dashboard — it is infrastructure for agents.

## Demo C — trust break

After launch, intentionally break a production dependency.

Relyo:

```text
Passport degraded.
Contract X no longer valid.
Root cause isolated.
Safe rollback available.
```

Apply repair/rollback, re-run proof, passport returns to valid.

---

# 36. The Pitch

## One sentence

> **Relyo is the independent proof layer for software built by AI.**

## Builder pitch

> **Your agent builds it. Relyo proves it.**

## Founder pitch

> **Connect your app. Relyo makes sure the real business works.**

## Enterprise pitch

> **One production trust layer for every coding agent your company uses.**

## Long-term category pitch

> **Machine-generated software needs machine-verifiable trust. Relyo is that trust infrastructure.**

---

# 37. Why 20 Years From Now This Still Matters

The phrase “vibe coding” may disappear.

The creator may change:

```text
human
→ AI assistant
→ coding agent
→ autonomous organization
```

The trust problem remains:

> Who independently verifies what machines changed before those changes affect customers, money, data and infrastructure?

As autonomy increases, the value of independent proof should increase rather than decrease.

Relyo is therefore designed around a durable primitive — **proof** — not a temporary interface trend.

---

# 38. Final Strategic Position

Do not build a company that must beat every AI builder.

Build infrastructure every AI builder can use.

Do not make Relyo the smartest coder.

Make it the trusted independent party that decides whether software claims match reality.

Do not optimize for the number of fixes Relyo makes.

Optimize for the amount of software the world is willing to trust because Relyo proved it.

> **The winning end state is not “Relyo built this app.”**
>
> **It is “This software can be trusted because Relyo independently proved it.”**
