# Relyo V2 — Landing Page & Message System

> **STATUS: ACTIVE PRODUCT MARKETING SYSTEM**

## Core rule

Lead with the moment the user understands, not the infrastructure category.

Primary homepage message:

> **About to launch? Verify the critical flows before customers depend on them.**

Primary CTA:

> **Verify My Launch**

Secondary CTA:

> **Check My App Free**

Supporting line:

> Build with Lovable, Replit, Cursor, Claude, Codex, or your own team. Relyo independently checks the production outcomes that matter.

## Homepage structure

### Hero

Headline:

> **Build fast. Verify before customers depend on it.**

Subhead:

> Connect your app. Relyo checks launch-critical flows across auth, payments, data access, email, configuration, recovery, and real customer journeys — then gives you evidence for what passed, failed, or remains unknown.

CTAs:

- Verify My Launch
- Check My App Free

### Trust strip

Use categories instead of logos until partnerships/permissions exist:

> Works with modern AI-built and developer-built SaaS stacks.

### Problem section

Headline:

> A successful deploy is only one part of a successful launch.

Explain:

- login can work locally and fail in production;
- payment can succeed while entitlement state is wrong;
- data access can be broader than intended;
- a backup can exist without a proven restore path;
- a release can pass CI while a real user journey fails.

Do not imply all AI-built apps fail.

### How it works

```text
1. Connect app
2. Relyo maps production dependencies
3. Relyo runs launch-critical proof
4. Fix supported issues
5. Re-verify
6. Get Production Passport
```

### Proof examples

- Authentication verified
- Authorization/data isolation verified
- Payment lifecycle verified
- Critical journey verified
- Recovery unknown → needs action

### Passport section

Headline:

> Proof that travels with the release.

Explain public/private Passport, release/environment binding, evidence, freshness, exclusions.

### Builder-neutral section

Headline:

> Build with any tool. Verify with one proof layer.

Copy:

> Relyo is designed to complement AI builders and engineering teams, not replace them.

### Pricing CTA

Free check → Launch Proof → Continuous Proof.

---

# Five high-intent landing pages

## 1. `/verify-before-launch`

Headline:

> **Before you launch, prove the flows customers will depend on.**

Primary checks:

- signup/login;
- core action;
- email;
- data isolation;
- payment if applicable;
- rollback/recovery readiness.

CTA: Verify My Launch.

## 2. `/verify-before-charging`

Headline:

> **Before you take the first payment, verify the whole customer lifecycle.**

Flow:

```text
checkout
→ payment success
→ webhook
→ entitlement
→ failure handling
→ cancellation
→ access revocation
```

CTA: Verify Payments.

## 3. `/verify-before-investor-demo`

Headline:

> **Your investor demo has one job: work when it matters.**

Checks:

- signup/auth;
- core demo journey;
- fresh environment;
- seeded/demo data;
- email;
- payment/demo dependency if needed;
- fallback/recovery instructions.

CTA: Verify My Demo.

## 4. `/verify-client-delivery`

Headline:

> **Deliver the client a verified launch, not just a deployed URL.**

For agencies/studios.

Outputs:

- client Passport;
- launch evidence;
- exclusions/unknowns;
- handoff checklist;
- optional recurring monitoring.

CTA: Verify Client Delivery.

## 5. `/verify-latest-release`

Headline:

> **Changed production? Re-prove what the change could break.**

CTA: Verify Latest Release.

---

# Evidence-led education pages

Create content around user questions:

- SaaS launch checklist;
- production readiness checklist;
- Google OAuth production checklist;
- Supabase RLS launch checklist;
- Stripe subscription lifecycle checklist;
- backup vs restore testing;
- investor demo reliability checklist;
- agency SaaS handoff checklist.

Every page structure:

```text
problem
→ credible evidence/statistic where relevant
→ practical checklist
→ what can be checked externally
→ what requires repo/provider access
→ Check My App CTA
```

## Messaging guardrails

Never say:

- all AI apps fail;
- Lovable/Replit/Cursor are unsafe;
- Relyo guarantees no bugs;
- Relyo proves total security;
- Relyo is a certification authority unless legally/contractually true.

Prefer:

> independently verified critical outcomes

> evidence-backed launch checks

> exact scope, freshness, and unknowns

## Onboarding copy

Step 1:

> What are you preparing for?

Options:

- Launch
- First paying customers
- Investor demo
- Client delivery
- Latest release

Step 2:

> Where is the app?

- Public URL
- GitHub repository
- Connect both

Step 3:

> What does your app depend on?

Auto-discover where possible; ask only for missing provider connections.

Step 4:

> We found the areas worth verifying.

Show plain-language cards.

Step 5:

> Choose the proof level you need.

Do not lead with R0/R1/R2 jargon; show it as secondary technical detail.
