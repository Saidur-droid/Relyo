# Relyo — Hostile Red Team

> Purpose: try to kill the company before competitors, customers, regulators, or economics do.

## Verdict

The baseline Relyo thesis is valuable but **not defensible enough if Relyo remains a founder-facing autonomous production fixer**.

That version can be attacked from every side:

- Replit can bundle security, deployment, governance, and production repair into Replit Agent.
- Cursor can extend Cloud Agents from code/test proof into production proof.
- Vercel can extend Vercel Agent from deployment/log investigation into application remediation.
- Lovable can own more of the app lifecycle inside Lovable Cloud.
- security vendors can add AI remediation;
- observability vendors can add autonomous root-cause and rollback;
- testing vendors can add agent-generated journey tests;
- cloud providers can add cross-service launch checks.

If Relyo is merely “AI DevOps for vibe coders,” it can become a feature.

The company survives only if it moves to a deeper, neutral layer:

> **Relyo becomes independent software proof infrastructure — a verification, policy, evidence, and trust layer that builders, coding agents, clouds, enterprises, and founders can all call.**

This changes the strategic relationship with Lovable, Replit, Cursor, Codex, Claude Code and future builders. They should not be the enemy. They should be upstream producers and potential Relyo customers/distribution partners.

---

# 1. Kill Shot: Builders Bundle the Product

## Attack

Replit already offers autonomous building, pre-deploy security review, deployment, enterprise governance, audit logs and continuous vulnerability protection. Cursor Cloud Agents already run in isolated environments, test work and return artifacts as proof. Vercel Agent already investigates production and can take approved actions.

A Relyo product that says “connect your app and I will fix deployment/security/production” overlaps directly with their roadmap.

## Why this can kill Relyo

Bundled features can be cheaper, have zero-install distribution, and possess privileged first-party context.

## Survival design

Relyo must provide something a builder benefits from consuming instead of recreating:

1. **independent verification** — the builder should not grade its own output;
2. **cross-builder neutrality** — one proof layer for apps created by any agent;
3. **cross-provider verification** — outside the builder’s own hosting/database boundary;
4. **cryptographically attributable evidence** — portable proof, not screenshots in a chat;
5. **enterprise policy enforcement** — independent gates that can apply to every coding agent;
6. **production passports** — reusable evidence attached to a release/version;
7. **shared contract ecosystem** — deterministic verification contracts maintained across providers;
8. **white-label Proof API** — builders embed Relyo rather than sending users to another IDE.

Strategic requirement:

> Relyo must make Lovable/Replit/Cursor better products when they integrate it.

---

# 2. Kill Shot: “Verification” Is Just Testing

## Attack

BrowserStack, Playwright, Checkly, Datadog, Sentry, LaunchDarkly and many testing/observability vendors already verify software behavior.

## Why this can kill Relyo

If Relyo is described as “automated end-to-end testing,” the category is crowded and incumbents have distribution.

## Survival design

Relyo verifies **outcomes and production contracts**, not only UI assertions.

A Relyo proof can combine:

- code/version identity;
- runtime behavior;
- provider configuration;
- OAuth state;
- database authorization boundaries;
- payment/webhook outcomes;
- email delivery;
- DNS/TLS state;
- recovery/rollback;
- API cost behavior;
- critical user journeys;
- change provenance;
- policy approvals;
- signed evidence.

Testing is one evidence source inside Relyo. It is not the product category.

---

# 3. Kill Shot: “Security” Vendors Expand Downward

## Attack

Snyk, Wiz, Semgrep, Aikido, cloud security platforms and code scanners can add autonomous remediation and AI-app checks.

## Survival design

Relyo does not claim to replace specialist security tools. It consumes their findings as evidence and verifies the final business outcome.

Security vendors can become signal providers and partners.

Relyo’s question is broader:

> After every relevant system and policy is considered, can this release safely perform the business outcome it claims to perform?

---

# 4. Kill Shot: Production Access Is Too Dangerous

## Attack

A small startup asking for GitHub write access, cloud admin rights, production database credentials, payment permissions and DNS control creates a catastrophic trust barrier.

One compromise could destroy customers.

## Survival design

Relyo must be designed so the cloud control plane does **not need universal possession of customer secrets**.

Required architecture:

- customer-hosted or isolated **Relyo Runner**;
- outbound-only connection from the runner where possible;
- short-lived, scoped, delegated credentials;
- provider-native OAuth/app installations over raw keys;
- secret references, not secret values, in model context;
- hardware/HSM-backed keys for Relyo signing infrastructure;
- explicit capability tokens per action;
- immutable audit events;
- risk-based approvals;
- destructive-operation deny rules;
- automatic rollback checkpoint before high-risk changes;
- enterprise private runner/data-residency options.

The safest action is often to generate a provider-native change request and verify it rather than holding permanent administrator credentials.

---

# 5. Kill Shot: Auto-Remediation Breaks Production

## Attack

An agent diagnoses incorrectly, changes a database policy, rotates the wrong secret, breaks checkout, or corrupts production data.

## Survival design

Relyo cannot be “YOLO autonomy.”

Every action receives a risk class:

- `OBSERVE`
- `SAFE_REVERSIBLE`
- `APPROVAL_REQUIRED`
- `HUMAN_ONLY`
- `FORBIDDEN`

High-risk remediation should follow:

```text
observe
→ model blast radius
→ create restore/rollback point
→ stage/shadow test where possible
→ request approval when required
→ apply smallest change
→ independently verify
→ auto-revert on failed proof
```

Remediation is subordinate to proof.

---

# 6. Kill Shot: Verification Lies

## Attack

A “98% Production Confidence” score can become meaningless marketing. False positives are dangerous; false negatives make the product annoying.

## Survival design

Do not make an opaque score the primary promise.

Use explicit **Assurance Levels** and inspectable coverage:

- **R0 — Discovered:** system mapped, not verified.
- **R1 — Launch Verified:** critical launch contracts pass.
- **R2 — Business Verified:** critical customer journeys pass.
- **R3 — Resilience Verified:** rollback/restore/failure paths proven.
- **R4 — Continuous Proof:** release continuously monitored against contracts.

Each status must contain:

- what was tested;
- where;
- against which version/configuration;
- evidence hashes;
- time of verification;
- validity window;
- exclusions/unknowns;
- verifier version.

Relyo must never imply that verification proves the absence of all defects.

---

# 7. Kill Shot: Long-Tail Integrations Destroy the Company

## Attack

Thousands of providers × changing dashboards × changing APIs × regional differences create infinite connector maintenance.

## Survival design

API first; browser automation last.

Build a contract/adaptor ecosystem:

- open Provider Adapter SDK;
- typed capability interface;
- versioned contracts;
- conformance tests;
- certified adapters;
- community/partner adapters;
- provider-maintained adapters where possible;
- generic OpenAPI/MCP/webhook primitives;
- browser fallback only for unsupported control-plane actions.

Relyo’s moat is not manually clicking every dashboard. It is the contract/evidence semantics above providers.

---

# 8. Kill Shot: CAPTCHA, MFA and Legal Consent Stop Autonomy

## Attack

Some flows cannot or should not be automated.

## Survival design

Treat human checkpoints as a first-class protocol.

Relyo should ask for the smallest possible human action:

```text
Google requires an account-owner consent screen.
Open it → approve → Relyo resumes automatically.
```

Never pretend human-only steps do not exist.

---

# 9. Kill Shot: Unit Economics Collapse

## Attack

Continuous browsers, LLM agents, synthetic payment journeys and cloud sandboxes can cost more than customers pay.

## Survival design

Use event-driven proof, not constant full simulation.

- cheap deterministic checks continuously;
- targeted journey proof on material changes;
- cached dependency evidence with expiry;
- small/cheap models for classification;
- frontier models only for ambiguous planning;
- provider webhooks before polling;
- sampling policies for high-volume apps;
- customer-hosted runners for heavy enterprise workloads;
- verification budgets per environment.

A core product metric must be **cost per verified release / contract**.

---

# 10. Kill Shot: Founder Market Has Low Willingness to Pay

## Attack

Vibe coders may be price sensitive and churn when projects die.

## Survival design

Use founders as the wedge, not the terminal market.

Revenue expansion path:

```text
individual app
→ agency / studio portfolio
→ AI builder embedded verification
→ startup engineering team
→ enterprise AI software governance
→ software marketplace / procurement proof
→ insurer / compliance / audit evidence
```

The strategic revenue should increasingly come from platforms and organizations managing many releases/apps.

---

# 11. Kill Shot: Enterprise Says “Run It In Our Network”

## Attack

Sensitive enterprises cannot send production data, internal code or credentials to a third-party SaaS runner.

## Survival design

Relyo Runner must support:

- self-hosted Kubernetes/VM mode;
- outbound-only control channel;
- private networking;
- customer KMS;
- regional data residency;
- zero-retention mode for sensitive evidence;
- customer-owned evidence storage;
- deterministic verifier packages that can run offline for selected contracts.

---

# 12. Kill Shot: Open Source Copies the Product

## Attack

The contract language and runner can be copied.

## Survival design

Open the right layer and own the network layer.

Open source / open standard:

- Relyo Contract Spec;
- SDKs;
- local verifier;
- adapter interface;
- CI integration.

Commercial moat:

- global evidence graph;
- verified failure/repair corpus;
- hosted control plane;
- signed production passport infrastructure;
- cross-provider orchestration;
- enterprise policy/governance;
- fleet analytics;
- partner certification;
- trusted verifier identity;
- distribution inside builder platforms.

OpenTelemetry is the strategic analogy: vendor-neutral instrumentation can be open while commercial platforms build enormous businesses on top.

---

# 13. Kill Shot: Regulators / Liability Attack “Proof” Language

## Attack

If Relyo says an app is safe and a breach happens, the company faces reputational and legal risk.

## Survival design

Relyo issues scoped, evidence-backed attestations, not absolute guarantees.

A Production Passport must state:

- exact contracts passed;
- exact evidence;
- version/environment;
- exclusions;
- expiration;
- assurance level.

Long-term, higher-assurance tiers can partner with insurers, auditors and compliance providers rather than impersonating them.

---

# 14. Kill Shot: No One Trusts a New “Trust Company”

## Attack

Trust is circular: customers want an established verifier; a new verifier has no reputation.

## Survival design

Bootstrap with transparency:

1. open contract specification;
2. reproducible local verifier;
3. public methodology;
4. signed/tamper-evident evidence;
5. third-party security audits;
6. bug bounty;
7. minimal privileges;
8. high-quality public reliability benchmark;
9. partnerships with builders/providers;
10. never hide uncertainty.

Relyo should make its own production passport public and dogfood every assurance level.

---

# 15. Kill Shot: Builder Platforms Refuse to Integrate a Potential Competitor

## Attack

Lovable, Replit and Cursor will not embed Relyo if Relyo tries to own their app-building customer relationship.

## Survival design

This is a constitutional product constraint:

> **Relyo does not compete to be the primary coding IDE/app builder.**

Offer builders:

- headless Proof API;
- white-label verification;
- SDK;
- GitHub Check;
- MCP server;
- webhooks;
- signed Production Passport;
- machine-readable remediation findings;
- optional private runner;
- fleet quality analytics;
- benchmarking of their own agent releases;
- “Verified by Relyo” badge they can surface to customers.

Relyo makes their promise stronger:

> “Our agent built it — independently verified by Relyo.”

That is strategically better than asking users to leave their platform.

---

# 16. Kill Shot: Model Providers Build Verification Agents

## Attack

OpenAI, Anthropic, Google or future frontier labs can build very capable verifiers.

## Survival design

Models are interchangeable reasoning suppliers. Relyo’s durable asset must be the system around them:

- contracts;
- evidence;
- policy;
- customer-owned runners;
- provider graph;
- release identity;
- independent verifier separation;
- historical failure corpus;
- trust/attestation network.

Relyo should support multiple model providers and let customers choose or bring models where appropriate.

Model labs can eventually be Relyo customers for evaluating and proving software created by their agents.

---

# 17. Kill Shot: Incumbent Standards Already Exist

## Attack

Sigstore, SLSA, in-toto, OpenTelemetry and OPA already cover provenance, signatures, telemetry and policy.

## Survival design

Do not reinvent them.

Relyo should interoperate:

- use Sigstore-compatible signing/identity patterns for evidence where appropriate;
- emit/consume in-toto/SLSA-compatible provenance where useful;
- ingest OpenTelemetry signals;
- integrate policy-as-code patterns such as OPA;
- add what these standards do not provide: **verified runtime/business outcomes and cross-provider continuous proof**.

---

# Final Red-Team Decision

## Baseline plan

**Does not survive unchanged.** Too easy to bundle and too broad operationally.

## Revised company

**Survives the red team if the company becomes neutral proof infrastructure rather than another AI builder/DevOps assistant.**

The strongest category statement is:

> **Relyo is the independent proof layer for machine-built software.**

The strongest platform relationship is:

```text
Lovable ─┐
Replit ──┤
Cursor ──┤
Codex ───┤
Claude ──┤
Other agents ─┤
             ▼
        Relyo Proof API
             ▼
     Production Passport
             ▼
       trusted release
```

The goal is not to defeat every builder.

The goal is to become infrastructure every builder is better off using.

---

# Research signals used in this red team

- Replit Enterprise and Security Agent show builders are expanding into security, governance and production: https://replit.com/enterprise and https://replit.com/blog/meet-replit-security-agent
- Cursor Cloud Agents provide full development environments, computer use, proof artifacts, MCP and hooks: https://cursor.com/docs/cloud-agent
- Vercel Agent investigates production and takes approved actions: https://vercel.com/blog/vercel-agent
- Lovable supports APIs and MCP integrations, making embedded third-party infrastructure practical: https://docs.lovable.dev/integrations/introduction
- Cursor supports external MCP servers and enterprise MCP management: https://cursor.com/docs/mcp
- OpenTelemetry demonstrates the power of a vendor-neutral open standard adopted across vendors: https://opentelemetry.io/docs/
- Sigstore demonstrates identity-bound signing and transparency-log-backed evidence: https://docs.sigstore.dev/
- in-toto demonstrates an open metadata framework for provable software supply-chain steps: https://in-toto.io/
- OPA demonstrates policy decision-making separated from enforcement: https://www.openpolicyagent.org/docs
