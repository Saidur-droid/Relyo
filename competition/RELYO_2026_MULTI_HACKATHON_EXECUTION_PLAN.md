# Relyo 2026 Multi-Hackathon Execution Plan

> **Status: LOCKED PLAN — execution not yet started**
>
> Relyo remains one product. We will not rebuild Relyo for each competition. We will add small competition-specific capabilities to the existing product, then create immutable competition snapshots so judges always see the exact submitted version.

## Selected competitions

1. **Life After Code — GitLab**
2. **Nebius x NVIDIA Global AI Hackathon**
3. **PayPal AI Hackathon**

The product identity never changes:

> **AI builds it. Relyo proves it.**

The constitutional technical rule also remains unchanged:

> **AI reasons. Evidence decides.**

---

## 1. Execution model

Relyo already exists as the core product.

Competition work is an extension layer around the existing architecture:

```text
                    Relyo existing core
        Production Graph / Proof Engine / Passport
                         |
        -----------------------------------------
        |                  |                    |
   Nebius/NVIDIA        GitLab               PayPal
     adapter            adapter              adapter
        |                  |                    |
 Nebius judge URL    Life After Code URL    PayPal judge URL
```

The competition work must strengthen the real Relyo product. It must not turn Relyo into three unrelated hackathon projects.

### What stays the same

- product name: Relyo;
- core Relyo architecture;
- Production Graph;
- Proof Contracts;
- Independent Verifier;
- Shadow Mode;
- Safe Remediation;
- Fix & Verify;
- Production Passport;
- evidence-first trust model;
- provider-neutral product direction.

### What can change by competition

- hero text;
- default demo route;
- sponsor integration explanation;
- first-screen emphasis;
- screenshots;
- video;
- Devpost description;
- architecture-diagram emphasis;
- judge instructions;
- competition-specific environment profile.

---

## 2. Development isolation

Do not perform hackathon experimentation directly on the production startup line.

Competition implementation branch:

```text
competition/relyo-2026
```

Normal Relyo development can continue independently.

Before meaningful competition implementation starts, record:

- baseline commit SHA;
- baseline timestamp;
- current test status;
- current deployment state;
- current feature inventory.

The baseline proves which capabilities existed before the new competition work.

---

## 3. Competition profile layer

The web application should support a small configuration layer instead of three separate UIs.

Example:

```text
COMPETITION_PROFILE=nebius
COMPETITION_PROFILE=gitlab
COMPETITION_PROFILE=paypal
```

### Nebius profile

Primary judge-facing message:

> **NVIDIA Nemotron + Nebius → Relyo Production Proof**

### GitLab / Life After Code profile

Primary judge-facing message:

> **Code is done. Now prove the release.**

### PayPal profile

Primary judge-facing message:

> **Payment succeeded. Did the business outcome actually succeed?**

The underlying product and proof engine remain the same.

---

## 4. Competition-specific capabilities

### A. Nebius + NVIDIA

Add a real reasoning adapter using an NVIDIA open-source model through Nebius Token Factory or another competition-compliant Nebius runtime.

Responsibilities:

- analyze discovered production context;
- prioritize relevant Proof Contracts;
- form failure hypotheses;
- summarize evidence;
- produce structured diagnosis;
- propose remediation plans.

Hard boundary:

**Nemotron must never decide VERIFIED/PASS by itself.**

Relyo's deterministic proof engine remains authoritative.

Target flow:

```text
Production Graph
→ Nemotron via Nebius
→ contract selection / diagnosis / remediation plan
→ Relyo deterministic verification
→ evidence-backed result
```

---

### B. GitLab / Life After Code

Add a GitLab adapter for post-code lifecycle proof.

The GitLab integration should be structural, not a repository mirror only.

Target capabilities:

- GitLab project discovery;
- commit/release identity;
- pipeline state;
- jobs/stages;
- test evidence;
- security/quality evidence where available;
- deployment/environment evidence;
- artifacts;
- Relyo verification result;
- release/pass-fail gate.

Target lifecycle:

```text
commit
→ build
→ test
→ security / quality
→ deploy
→ Relyo post-code verification
→ evidence
→ PASS / FAIL
→ release gate
```

Relyo should remain the higher-level trust layer after the code pipeline says "done."

---

### C. PayPal

Add a first-class deterministic Proof Contract:

```text
paypal.payment_integrity.v1
```

Target verification chain:

```text
PayPal order created
→ approval / capture
→ expected webhook received
→ webhook authenticity / processing verified
→ application state persisted
→ entitlement / order outcome granted
→ duplicate / replay behavior checked where supported
→ customer-visible business outcome correct
```

The key product story:

> **A payment API returning success does not prove the customer received the intended business outcome. Relyo proves the full payment-to-product result.**

This is a natural extension of Relyo's **Verify Before Charging Customers** launch moment.

---

## 5. Shared competition demo fixture

Reuse and extend:

```text
apps/qualification-fixture
```

Do not build three demo applications.

The fixture should become deterministic and resettable.

Example starting state:

```text
AI says: READY

GitLab pipeline       PASS
Deployment            PASS
PayPal payment        PASS

BUT

Webhook/app state     FAIL
or
Auth/config           FAIL

Relyo Shadow Mode:
3 launch blockers found
```

Then:

```text
Fix & Verify
→ approved safe fix
→ same Proof Contract re-run
→ FAIL → VERIFIED
→ Production Passport
```

### Required fixture states

- `BROKEN`
- `FIX_APPLIED`
- `VERIFIED`

### Desired reset commands

Exact implementation may vary, but the fixture should support an equivalent of:

```text
pnpm demo:reset
pnpm demo:seed-broken
pnpm demo:verify
```

The failure must be real and reproducible, not a fake UI toggle.

---

## 6. Immutable competition snapshots

This is the most important judging-safety rule.

We will **not** keep one mutable live judge URL.

Instead:

> **One Relyo product + one competition development line + immutable competition snapshots.**

### Preferred case

If all three sponsor integrations are complete before the earliest freeze, use the same final SHA for all three competitions.

### Safe fallback

If a later competition needs additional work, create a new later snapshot without changing earlier judged versions.

Example:

### Life After Code

Tag:

```text
relyo-life-after-code-2026-v1
```

Deploy an immutable Life After Code judge environment.

After submission, do not modify that deployment.

### Nebius x NVIDIA

Later, if extra Nebius polish is required:

```text
relyo-nebius-2026-v1
```

Deploy a separate immutable Nebius judge environment.

The Life After Code environment stays unchanged.

### PayPal AI

If later PayPal work is required:

```text
relyo-paypal-ai-2026-v1
```

Deploy a separate immutable PayPal judge environment.

The earlier judge environments stay unchanged.

---

## 7. Judge URLs

Desired isolation model:

```text
Life After Code judge URL  → frozen snapshot A
Nebius judge URL           → frozen snapshot B
PayPal judge URL           → frozen snapshot C
```

Exact domains/projects will depend on available infrastructure.

Rules:

- never point judges at a mutable `main` deployment;
- disable automatic updates to frozen judge deployments;
- preserve exact build/version identity;
- keep judge environments online throughout judging;
- if an outage occurs, restore the same artifact/configuration rather than adding features.

---

## 8. Actual implementation order

Execute in this order:

1. **Current-state audit + baseline SHA**
2. **Create competition branch**
3. **Competition profile/config layer**
4. **Nebius/NVIDIA adapter**
5. **GitLab adapter**
6. **PayPal adapter**
7. **Payment Integrity Proof Contract**
8. **Connect new evidence into existing Shadow Mode**
9. **One killer Fix & Verify demo case**
10. **Turn qualification fixture into deterministic competition fixture**
11. **Unit tests**
12. **Integration tests**
13. **E2E tests**
14. **Benchmark/evaluation**
15. **README/compliance cleanup**
16. **License gate**
17. **First frozen release**
18. **Competition-specific immutable deployments**
19. **Three separate demo videos**
20. **Three Devpost submissions**

Do not introduce a new framework when the existing pnpm/TypeScript/Next.js architecture already supports the work.

---

## 9. Testing standard

The competition build is not "done" because the UI looks good.

Required gates:

### Core

- `pnpm test`;
- `pnpm typecheck`;
- production build;
- secret scan;
- deterministic Proof Contract replay;
- demo reset works;
- demo scenario works repeatedly;
- evidence manifest matches the exact release.

### Nebius

- live model inference works;
- structured schema validation;
- timeout/error handling;
- model cannot promote a result to VERIFIED;
- telemetry captured.

### GitLab

- pipeline starts cleanly;
- expected jobs run;
- Relyo verification job runs;
- evidence is available;
- bad state produces the intended fail/block signal;
- verified state produces the intended pass signal.

### PayPal

- sandbox transaction flow works;
- webhook/event flow works;
- deterministic app-state verification works;
- broken fixture fails reliably;
- fixed fixture verifies reliably;
- no real-money payment is required.

---

## 10. Benchmark plan

Use real controlled scenarios.

Possible categories:

- pipeline/test failure;
- deployment mismatch;
- OAuth callback mismatch;
- tenant/RLS problem;
- storage exposure;
- environment mismatch;
- PayPal webhook failure;
- payment-state mismatch;
- entitlement mismatch;
- duplicate/replay case.

For each scenario record:

- expected outcome;
- actual outcome;
- evidence;
- AI diagnosis;
- deterministic verifier outcome;
- remediation attempted;
- re-verification result;
- latency;
- token/cost data where relevant.

Never invent benchmark numbers.

---

## 11. Three judge stories

The product is the same. The story changes.

| Competition | Judge focus |
|---|---|
| **Life After Code** | GitLab → post-code lifecycle → Relyo proof |
| **Nebius x NVIDIA** | Nemotron/Nebius → reasoning → deterministic independent proof |
| **PayPal AI** | PayPal success → complete payment/business outcome verification |

### Life After Code story

```text
Code is done
→ GitLab pipeline runs
→ deployment exists
→ Relyo checks production reality
→ hidden failure found
→ evidence
→ fix / reverify
→ release decision + Production Passport
```

### Nebius x NVIDIA story

```text
AI-built app claims ready
→ Relyo discovers production system
→ Nemotron via Nebius reasons about what to verify and why failure happened
→ deterministic Proof Contract finds blocker
→ safe fix
→ independent re-verification
→ Production Passport
```

### PayPal story

```text
PayPal action succeeds
→ customer/business outcome still wrong
→ Relyo Payment Integrity Proof follows the chain
→ hidden failure found
→ diagnosis
→ safe fix
→ deterministic re-verification
→ payment-to-entitlement outcome VERIFIED
```

---

## 12. What we will not do

- do not rebuild Relyo from zero;
- do not create three copy-paste repositories;
- do not create three unrelated products;
- do not push random hackathon code straight into production main;
- do not overwrite an earlier judge deployment with a later competition build;
- do not use fake sponsor API calls;
- do not use Nemotron confidence as proof;
- do not make PayPal a logo/API-ping integration;
- do not make GitLab a mirror-only integration;
- do not point Devpost judges at a mutable `main` deployment;
- do not claim a test or benchmark passed without evidence;
- do not expose secrets.

---

## 13. Public repository / license gate

Before any competition requiring an open-source/public repository is submitted:

- verify the exact public repository requirement;
- ensure the required source is public;
- ensure README/setup instructions are complete;
- ensure no secret is committed;
- ensure the chosen open-source license is visible if required.

**License choice requires founder approval.**

Do not silently choose MIT, Apache-2.0, or another license because that decision changes code reuse rights.

---

## 14. Life After Code rule caveat

The execution plan is locked, but competition eligibility must still follow the final published rules.

If Life After Code's official rules change or add a requirement that conflicts with this plan:

- preserve Relyo's core product;
- adapt only the competition layer;
- do not redesign the company;
- record the rule change and exact response.

---

## 15. Definition of done

The plan is successfully executed when:

- Relyo remains the same core company/product;
- all three sponsor integrations are real and meaningful;
- the demo fixture is deterministic;
- at least one real hidden failure is found;
- at least one safe supported remediation is demonstrated;
- independent re-verification changes a real failure to VERIFIED;
- Production Passport records the exact release/environment/evidence;
- tests and benchmarks are reproducible;
- each competition has an immutable judge deployment;
- earlier judge deployments never change after submission;
- each competition has a tailored video/write-up without a diverging product.

---

## Final execution rule

> **Relyo already exists. Keep 80–90% of the existing product, add the 10–20% competition-relevant capabilities, then freeze each submitted live version as an immutable snapshot.**

This gives us both:

- **development flexibility** for later competitions; and
- **judging safety** for earlier submissions.

The strategy is now locked. The next step is implementation, starting with the current-state audit, baseline SHA, branch creation, and competition profile foundation.
