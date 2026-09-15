# Relyo V2 — Pricing Experiment System

> **STATUS: ACTIVE PRICING EXPERIMENT PLAN**

## Principle

Pricing is a hypothesis until users repeatedly pay and retention/gross margin validate it.

Do not optimize for the highest sticker price. Optimize for:

- clear value at launch moment;
- low friction from free → paid;
- healthy proof gross margin;
- expansion path to recurring and platform revenue.

## Initial packaging

### Free — Check My App

- public URL check;
- one repo readiness scan;
- Production Graph Lite;
- limited deterministic checks;
- launch checklist;
- no expensive full browser proof;
- no high-risk remediation.

### Launch Proof — one-time

Test price points:

- Variant A: $29
- Variant B: $49
- Variant C: $79 if proof depth/cost supports it

Includes:

- R1 Launch Verification;
- limited critical journey;
- evidence package;
- Passport valid for a defined window;
- limited re-run after supported fix.

### Continuous Proof — subscription

Initial tests:

- $29/mo basic;
- $49/mo standard;
- $79/mo pro.

Possible usage gates:

- number of apps;
- proof runs/month;
- browser journeys;
- evidence retention;
- continuous triggers;
- private/public Passport;
- remediation credits.

### Agency

Hypothesis:

- $199/mo starter fleet;
- $499/mo growth fleet;
- usage overage or negotiated volume.

### Proof API

Hypothesis:

- free developer sandbox;
- usage-based production proofs;
- volume commitments for builders;
- white-label premium.

### Enterprise

Annual contract based on:

- number of apps/releases;
- private runner;
- SSO/RBAC;
- policy engine;
- evidence retention;
- support/SLA;
- data residency.

## Experiment sequence

### Experiment 1 — one-time Launch Proof

Question:

> Will a founder pay immediately before a high-intent launch moment?

Run $29 vs $49 on similar cohorts.

Primary metric:

- purchase conversion from users who received a meaningful free finding.

Guardrails:

- proof gross margin;
- refund rate;
- support minutes/order;
- completion rate.

### Experiment 2 — recurring conversion

Question:

> After launch, will the user pay to keep proof fresh?

Offer monthly Continuous Proof after successful Launch Proof.

Primary metrics:

- 7-day upgrade rate;
- 30/90-day retention;
- proof runs/app/month.

### Experiment 3 — value framing

Test:

A. “Verify My Launch”
B. “Protect My First Customers”
C. “Keep My App Verified”

Do not change price and message simultaneously on the same cohort.

### Experiment 4 — agency bundle

Test number-of-app tiers versus usage-based billing.

### Experiment 5 — builder API

Measure willingness to pay per proof run versus monthly minimum commitment.

## Unit economics model

For every proof type track:

```text
compute
+ browser execution
+ storage/evidence
+ provider API cost
+ model cost
+ support allocation
= variable proof cost
```

Then calculate:

```text
contribution margin = revenue - variable proof cost
```

Target:

- cheap deterministic checks should subsidize top funnel;
- expensive browser proof must be constrained/paid;
- continuous proof should reuse fresh evidence instead of rerunning everything.

## Pricing decision rules

Increase price when:

- conversion remains healthy;
- customers cite high launch value;
- support burden is high;
- proof scope expands;
- gross margin needs protection.

Decrease/friction-reduce when:

- qualified users repeatedly abandon checkout;
- free findings create value but payment feels disproportionate;
- agencies need a lower entry tier to standardize across portfolios.

## Never do

- unlimited expensive browser proof on free tier;
- fake crossed-out prices;
- “lifetime verified” claims;
- charge for a meaningless badge;
- make assurance level depend on amount paid.

## Pricing review cadence

Weekly during beta, monthly after product-market signal.

Keep a pricing experiment log with:

- cohort;
- price;
- message;
- traffic source;
- conversion;
- support burden;
- refund rate;
- gross margin;
- retention.
