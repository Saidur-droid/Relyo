# Relyo V2 — Category Creation & Hypergrowth Operating Plan

> **STATUS: ACTIVE V2 STRATEGY — EXECUTE WITH `V2_MASTER_PLAN.md`**
>
> Purpose: turn an invisible problem into an obvious category, make the product itself distribute Relyo, and create the strongest plausible 6–12 month growth path without depending on a famous marketer or a large early team.
>
> **Important:** a $1B–$2B valuation cannot be guaranteed or scheduled. Investors set valuation from traction, growth, defensibility, market, team, and capital conditions. This plan therefore targets **valuation-forcing evidence**, not vanity valuation targets.

---

# 1. The Strategic Problem We Must Solve First

Most target users do **not know the problem has a name**.

They know symptoms:

- “My AI says it is done, but I am scared to launch.”
- “It works locally but not in production.”
- “Google login randomly fails.”
- “Stripe says payment succeeded but the user is still free.”
- “I do not know whether another user can see private data.”
- “The deployment is green, but I do not trust it.”
- “The AI fixed one thing and broke another.”
- “I have backups, but I do not know whether they restore.”
- “I do not know how much one customer actually costs me.”

They usually do **not** wake up searching for:

> independent software proof infrastructure

Therefore Relyo cannot initially market the category name. It must market the pain and then teach the category.

### The education ladder

```text
Symptom
→ hidden risk
→ name the enemy
→ show proof
→ create a new habit
→ create a standard
```

Relyo's job is to make users feel:

> **“A green build is not proof.”**

Then:

> **“AI said done” is not the same as “verified.”**

Then:

> **“Every serious release should have proof.”**

That is category creation.

---

# 2. The Enemy We Name: FALSE DONE

Categories spread faster when users can recognize a problem in one phrase.

Relyo should name the enemy:

# **False Done**

Definition:

> A release appears finished because the builder, CI system, or agent reports success, but the real production business outcome has not been independently proven.

Examples:

```text
Build passed                 ≠ customer can sign up
Deploy ready                 ≠ OAuth works
Stripe connected             ≠ subscription lifecycle works
Backup exists                ≠ restore works
Agent says fixed             ≠ regression absent
Security scan clean          ≠ authorization correct
```

### Category language

Founder language:

> **Your app looks done. Is it actually live?**

Developer language:

> **Stop shipping False Done.**

Builder/platform language:

> **Your agent builds it. Relyo proves it.**

Enterprise language:

> **One independent proof gate for every coding agent.**

Long-term category language:

> **Independent Software Proof Infrastructure**

---

# 3. Why This Is a Category-Creation Opportunity

The user not knowing the problem is not automatically a weakness.

It becomes an opportunity when three conditions exist:

1. The symptoms already happen frequently.
2. Existing tools only solve fragments.
3. The product can demonstrate the missing layer instantly.

Relyo should avoid spending millions on abstract education.

The product itself must teach the problem.

User enters repo/app → Relyo finds hidden dependency/failure → user understands the category because they experienced it.

The best education event is not a blog post.

It is:

```text
“You thought this was production-ready.
We found 7 real blockers.”
```

---

# 4. Lessons We Borrow — Without Copying the Companies

## 4.1 Uber lesson: density before breadth

Uber did not win by launching everywhere at once. Its early model proved one city, learned launch operations, then repeated city by city. Uber reported 34%+ month-over-month growth in 2011 while expanding roughly one city per month, then increasing the pace.

### Relyo adaptation

Our “city” is not geography.

Our city is a **stack/ecosystem**.

First density target:

```text
Next.js
+ GitHub
+ Vercel
+ Supabase
+ Google/GitHub OAuth
+ Stripe
+ Resend
```

We should know this stack better than anyone in the world:

- common failures;
- repair playbooks;
- proof contracts;
- average time to proof;
- regressions;
- economics;
- recovery paths.

Only after density do we launch the next “city”:

```text
Firebase stack
Railway stack
AWS stack
Shopify stack
mobile stack
etc.
```

**Rule:** contract density > integration count.

---

## 4.2 American Express lesson: build a closed trust loop

American Express benefits from direct relationships across its network and from an end-to-end view of transactions. Its 2026 strategy explicitly emphasizes trust, security, partnerships, and the value of its closed-loop network in agentic commerce.

### Relyo adaptation

Relyo should create its own software trust loop:

```text
SOFTWARE PRODUCER
Lovable / Replit / Cursor / Codex / Claude / Human
        ↓
RELYO PROOF NETWORK
contracts + runner + evidence + passport
        ↓
PROOF CONSUMER
founder / enterprise / buyer / marketplace / cloud / insurer
        ↓
real outcome & incident data
        ↓
Verified Failure Graph
        ↓
better proof for next release
```

The producer gets lower failure/support burden.

The consumer gets independent evidence.

Relyo gets verified outcome intelligence.

The loop improves with every release.

---

## 4.3 Lovable lesson: immediate magic and an enormous emotional promise

Lovable's early promise was simple: people who cannot code can build software by talking to AI. That promise is emotionally obvious and immediately demonstrable.

Relyo needs an equally obvious activation moment.

Not:

> Configure software assurance policies.

But:

> **Connect your app. We will show you what is actually broken.**

Within the first session the user must see something surprising and useful.

---

## 4.4 Wiz lesson: remove installation friction and reveal unknown risk

Wiz grew rapidly by making cloud risk visible across environments with low deployment friction. The core emotional insight was that customers could not manage what they could not see.

### Relyo adaptation

The first experience should require as little setup as possible:

```text
GitHub connect
+ optional cloud OAuth
→ immediate Production Graph
→ immediate hidden-risk discovery
```

Do not require users to model every dependency manually before receiving value.

---

# 5. The Growth Product — Not Just the Core Product

Relyo must contain a **free distribution surface** that is useful before users understand the category.

## Product 1 — Free Production Proof Scan

CTA:

> **Is your AI-built app actually production-ready? Prove it free.**

Input:

```text
GitHub repository
or deployed URL
```

Output:

```text
R0 — DISCOVERED

We found:
19 dependencies
4 identity flows
2 payment flows
7 webhooks
12 critical journeys

Critical unknowns: 6
Launch blockers: 4
```

The scan does not make an absolute “safe” claim.

It creates awareness and leads to deeper proof.

---

# 6. The Viral Artifact: Production Passport

Reports die in dashboards.

Passports travel.

Every verified release should create a public/private shareable artifact.

Example:

```text
Relyo Production Passport
R2 — Business Verified
Release: 7ab124
Updated: 4 minutes ago

Authentication       VERIFIED
Payment lifecycle    VERIFIED
Data isolation        VERIFIED
Critical journeys     VERIFIED

[Inspect Evidence]
```

Distribution surfaces:

- GitHub README badge;
- GitHub Check;
- deployment page;
- public app footer;
- launch page;
- investor/data room;
- agency report;
- marketplace listing;
- vendor review;
- builder UI.

### Viral loop

```text
App gets verified
→ Passport is shared
→ Another founder clicks Passport
→ “Prove my app”
→ another app verified
→ another Passport
```

The artifact must make the product visible without becoming spam.

---

# 7. The Six Growth Loops

## Loop A — Free Scan Loop

```text
repo/url
→ free discovery
→ surprising hidden risk
→ deeper verification CTA
→ user shares result
→ new scan
```

## Loop B — Passport Loop

```text
verified release
→ passport/badge
→ customer/investor/dev sees it
→ asks how their app scores
→ new customer
```

## Loop C — Builder Loop

```text
builder generates apps
→ Relyo API verifies
→ builder shows “independently verified”
→ more builder users experience Relyo
→ more proof runs
```

This is the highest-leverage long-term loop.

## Loop D — Agency Loop

```text
agency verifies client app
→ client receives passport
→ agency looks more trustworthy
→ agency standardizes Relyo across all clients
→ dozens of apps per customer
```

## Loop E — Research / Media Loop

```text
anonymized aggregate proof data
→ State of AI-Built Software report
→ media/developer discussion
→ free scans
→ more proof data
→ better report
```

## Loop F — Enterprise Policy Loop

```text
enterprise requires R3
→ internal teams/vendors adopt Relyo
→ more passports
→ more vendors become familiar with Relyo
→ other enterprises can require the same standard
```

---

# 8. Category-Creation Content Engine

We should not primarily publish generic SEO content.

We publish proprietary evidence no one else has.

## Monthly flagship

# **State of AI-Built Software**

Possible findings:

```text
% of AI-built apps with broken auth
% with unverified restore
% with exposed production secrets
% where payment lifecycle failed
% with negative variable economics
average time from “deploy ready” to “business verified”
most common failure combination by stack
```

Only publish privacy-safe aggregate data with strong methodology and minimum sample thresholds.

Never publish platform-shaming rankings based on weak samples.

### Weekly content

- “False Done of the Week” — anonymized failure pattern.
- “Proof Friday” — one real proof contract explained.
- “What green CI missed.”
- “AI said done; Relyo found X.”
- short videos of repair → fresh verification.
- technical contract writeups for developers.
- founder-friendly launch reliability stories.

### Category campaign

**AI Said Done. Prove It.**

This can become the memorable marketing line.

---

# 9. The Public Reliability Index

Create a neutral, evidence-based **Relyo AI Software Reliability Index**.

Do not score companies as “good/bad” from weak data.

Score measurable conditions:

- proof coverage;
- percentage of critical contracts passing;
- recovery readiness;
- evidence freshness;
- common classes of failure;
- stack-level trends.

The index can become recurring industry data used by:

- journalists;
- VCs;
- developers;
- builders;
- enterprise teams;
- researchers.

If Relyo becomes the source quoted whenever people discuss AI-built software reliability, category awareness grows without buying attention.

---

# 10. No Famous Marketer Required — Early Team Doctrine

Do **not** hire a high-cost CMO in the first six months.

The founder, product, and data should perform most marketing.

Suggested first six-month team shape:

```text
Founder / CEO — product, category story, partnerships, fundraising
2–4 exceptional product/infra engineers
1 security/reliability engineer
1 design/product generalist
1 developer relations/content engineer (later, after product signal)
```

Approximately 5–8 core people can be enough for the first breakout attempt if execution quality is very high.

### What replaces the celebrity marketer

- magical free diagnostic;
- shareable Passport;
- public data/research;
- GitHub distribution;
- MCP/CLI/API distribution;
- founder-led videos/demos;
- design-partner stories;
- builder integrations;
- agency network;
- technical community credibility.

Hire growth leadership only after a repeatable loop is already visible.

A marketer cannot manufacture product-market fit.

---

# 11. The Six-Month Moonshot Plan

This is deliberately aggressive.

The objective is not to force a valuation. The objective is to create enough product, usage, revenue, and strategic evidence that a very large valuation becomes defensible.

## Month 0–1 — Invent the category through the product

Ship:

- Trust Kernel;
- Proof Contract v0;
- GitHub integration;
- Vercel + Supabase discovery;
- Production Graph;
- Free Proof Scan;
- evidence model;
- basic Passport;
- one end-to-end auth/business proof;
- public waitlist and launch site.

Founder activity:

- personally onboard first 30–50 apps;
- record every hidden failure;
- create terminology from repeated pain;
- publish first 10 anonymized failure stories;
- run live demo weekly.

Success target — aggressive, not guaranteed:

```text
1,000 apps scanned
100 apps deeply verified
30 design partners
10 users willing to pay
```

Most important metric:

> % of seemingly “done” apps where Relyo discovers a material unknown or failure.

---

## Month 2 — Make proof shareable

Ship:

- public/private Production Passport;
- GitHub badge/check;
- R1/R2 assurance;
- Stripe lifecycle proof;
- email proof;
- safe remediation for top recurring failures;
- referral/share loop;
- agency workspace beta.

Launch campaign:

# **AI Said Done. Prove It.**

Publish:

- first mini Relyo Reliability Report;
- 20 short failure/fix demos;
- public methodology.

Aggressive targets:

```text
5,000–10,000 apps scanned
1,000 active verified apps
100 paying accounts
10 agencies
20%+ weekly organic growth during launch weeks
```

---

## Month 3 — Turn product into infrastructure

Ship earlier than originally planned:

- Proof API v1;
- MCP server;
- TypeScript SDK;
- webhooks;
- white-label Passport component;
- builder partner sandbox;
- contract pack versioning;
- usage metering.

Goal:

Get the first **external product** to initiate a Relyo proof run without a human visiting Relyo first.

Aggressive targets:

```text
25,000+ cumulative apps scanned
5,000 continuously verified apps
1M proof-contract executions cumulative
1–3 small builder/platform integrations
25 agencies/design partners
```

This milestone matters more than raw user count because it proves Relyo can become infrastructure.

---

## Month 4 — Own one ecosystem

Do not add 50 shallow integrations.

Dominate the initial stack.

Launch:

- “Relyo Verified for Next.js + Vercel + Supabase” contract pack;
- recovery/rollback verification;
- cost guardrails;
- fleet dashboard;
- production drift detection;
- monthly Reliability Index.

Partnership targets:

- AI builder communities;
- Vercel/Supabase ecosystem agencies;
- startup studios;
- smaller vibe-coding platforms;
- accelerator portfolios.

Aggressive targets:

```text
50,000+ apps scanned
10,000 active proof apps
50 agencies
3 embedded builder integrations
5 enterprise pilots
```

---

## Month 5 — Create industry evidence

Ship:

- Verified Failure Graph intelligence v1;
- automatic contract recommendation;
- privacy-safe benchmark data;
- builder analytics;
- remediation success-rate intelligence;
- enterprise policy preview.

Publish flagship:

# **The State of AI-Built Software — Relyo Report**

The report should be based on real proof data and transparent methodology.

Goal:

Relyo becomes a source journalists/investors/builders reference when discussing reliability of AI-built software.

Aggressive targets:

```text
100,000+ cumulative apps scanned
20,000+ active proof apps
2–5M proof runs/month
5–10 builder integrations/pilots
10+ enterprise pilots
```

---

## Month 6 — Unicorn-readiness checkpoint

By month six, do not ask:

> Are we worth $1B?

Ask:

> Do we have evidence that a credible investor could believe this becomes a global software trust network?

### Base breakout case

```text
100k–250k cumulative apps discovered
20k–50k active verified apps
2M–5M proof runs/month
strong 20%+ monthly active growth
meaningful paid conversion
3+ embedded builder relationships
10+ enterprise/agency fleet customers
```

### Extreme unicorn-case evidence

A $1B–$2B case this early would likely require exceptional evidence such as a combination of:

```text
500k–1M+ apps scanned/discovered
100k+ active verified apps
10M+ proof runs/month
$10M+ ARR run-rate or extremely rapid credible path to it
20%–30%+ monthly revenue growth
3–5 meaningful builder/platform integrations
major enterprise design partners
very high organic/product-led acquisition
clear network effect in Passport consumption
strong retention and low false-pass rate
```

These are **moonshot operating targets, not forecasts or promises**.

Lovable's 2025 unicorn benchmark was extraordinary: approximately eight months after launch it reported 2.3M active users, 180k paying subscribers and roughly $75M–$100M ARR when it reached a $1.8B valuation. Relyo should respect that level of evidence rather than assuming a category story alone creates a unicorn.

---

# 12. Twelve-Month Category-Leadership Plan

## Months 7–9

- private Relyo Runner;
- enterprise policy engine;
- SSO/RBAC;
- release authorization API;
- GitLab support;
- second high-density stack;
- formal builder partner program;
- R3 resilience packs;
- 24/7 continuous proof for selected contracts.

Growth goal:

```text
Founder product → agency fleets → builder embeds → enterprise policy
```

## Months 10–12

- R4 Continuous Proof;
- public/private Passport registry;
- provider-certified adapters;
- marketplace/procurement proof pilot;
- insurer/auditor conversations;
- annual State of Machine-Built Software report;
- third-party Passport consumption APIs.

End-of-year strategic test:

> Are organizations consuming Relyo proof even when they did not create the software?

If yes, the trust network is starting.

---

# 13. Fundraising Must Follow Growth Milestones

Do not raise because we wrote a big vision.

### Pre-seed trigger

Raise when we have:

- magical demo;
- 10–30 design partners;
- real failure data;
- Proof Contract + Passport working;
- initial organic adoption.

Target can remain roughly $1M–$2M, with larger outcome only if traction justifies it.

### Seed trigger

Raise when:

- thousands of active apps;
- repeatable paid conversion;
- Proof API usage;
- builder integrations;
- strong retention;
- credible Verified Failure Graph.

### Breakout / large round trigger

Raise aggressively only when the capital accelerates an already-working loop:

- platform integrations;
- enterprise sales;
- global trust infrastructure;
- certified adapters;
- security/compliance maturity.

Never use funding to hide weak activation.

---

# 14. The Lean Distribution Stack

First six months, every channel should be product-adjacent.

Priority order:

1. GitHub App + Checks
2. Production Passport badge
3. Free Proof Scan
4. founder-led demos
5. MCP / CLI / SDK
6. agency fleet adoption
7. builder partnerships
8. reliability research/PR
9. accelerator/portfolio partnerships
10. technical SEO from proof/failure documentation

Avoid early dependence on:

- expensive paid ads;
- generic influencer sponsorships;
- giant sales teams;
- enterprise conferences before enterprise product exists;
- brand campaigns without product proof.

---

# 15. SEO as a Product Output

Every recurring failure class can become a high-intent technical page:

```text
Vercel Supabase OAuth callback failed
Stripe webhook successful but subscription not activated
Supabase RLS AI generated app
Lovable app production verification
AI app restore test
Cursor generated app deployment regression
```

The page should contain:

- symptom;
- why it happens;
- how Relyo detects it;
- how the Proof Contract verifies the fix;
- CTA: “Prove my app.”

This creates search demand around symptoms before users know the category name.

---

# 16. Founder-Led Category Marketing

The founder should repeatedly communicate three messages.

### Message 1 — The uncomfortable truth

> **AI saying “done” is not proof.**

### Message 2 — The new behavior

> **Every important release should be independently proven.**

### Message 3 — The artifact

> **That proof should travel with the release as a Production Passport.**

Do not explain 20 features in public messaging.

Teach one mental model until the market repeats it.

---

# 17. Partnership Strategy — Do Not Attack Builders

Never market Relyo as:

> “Lovable/Replit/Cursor builds bad apps.”

That destroys partnership potential.

Correct framing:

> **AI builders are making software creation abundant. Relyo gives their customers independent proof that the output is ready for the real world.**

Partner value proposition:

- fewer support tickets;
- fewer failed launches;
- stronger enterprise trust;
- independent evidence;
- lower internal verification engineering cost;
- better feedback data for the builder's own agent;
- white-label proof.

Builders growing faster should make Relyo grow faster.

---

# 18. The Builder Partnership Ladder

Do not start by asking the largest platform for a strategic deal.

Sequence:

```text
individual founders
→ agencies
→ small AI builders
→ startup studios
→ mid-size builders
→ enterprise internal agents
→ major builders/model labs
```

For every step, show measurable economic benefit:

```text
failed launches ↓
support tickets ↓
time-to-production ↓
escaped incidents ↓
enterprise confidence ↑
```

A partner integration must improve the partner's business, not merely Relyo's distribution.

---

# 19. The “Relyo Verified” Trust Brand

The badge must never become a meaningless paid seal.

Rules:

- only issued from actual contracts;
- always tied to exact release/environment;
- evidence inspectable;
- validity expires;
- proof degrades when contracts fail;
- unknowns/exclusions visible;
- no absolute “100% secure” claim.

The badge becomes valuable only if users trust that it cannot be bought.

---

# 20. Growth Metrics — The Only Dashboard That Matters

## Awareness

- free scans/week;
- % organic;
- branded search growth;
- Reliability Index citations/mentions;
- “False Done” phrase adoption.

## Activation

- connect → Production Graph time;
- % scans discovering material unknown/failure;
- % users starting deeper proof;
- time to first verified outcome.

## Product value

- verified releases;
- critical journeys verified;
- failures caught before customer impact;
- remediation success rate;
- escaped incident rate after proof;
- false-pass rate.

## Virality

- passports shared;
- visitors per public Passport;
- scan signups originating from Passport;
- GitHub badge installs;
- referral coefficient.

## Platform transition

- external API/MCP initiated proof runs;
- builder integrations;
- percentage of proof runs not initiated from Relyo dashboard;
- third-party Passport consumers.

## Economics

- cost per proof run;
- gross margin;
- founder/team paid conversion;
- agency ARPA;
- platform revenue;
- enterprise ACV;
- CAC payback.

## Retention

- apps continuously verified after 30/90 days;
- Passport refresh frequency;
- proof runs per active app;
- platform net retention.

---

# 21. Weekly Hypergrowth Operating Cadence

Every week the team answers:

1. What hidden failure did we discover most often?
2. Can it become a deterministic Proof Contract?
3. Can it be safely remediated?
4. Can that contract create shareable proof?
5. Which acquisition loop generated the most activated apps?
6. What stopped a user from reaching R1/R2?
7. Which proof generated a partner conversation?
8. Which expensive feature did not create verified outcomes?
9. What lowered false-pass probability?
10. What did we learn that a competitor cannot learn without our proof volume?

### Weekly release rule

Every week should improve at least one of:

```text
proof depth
activation speed
shareability
partner distribution
failure intelligence
trust/security
```

If a feature improves none of these, question why it exists.

---

# 22. Product Changes Required by This Hypergrowth Plan

The previous V2 strategy remains correct, but execution priority changes:

### Move earlier

- Free Production Proof Scan;
- shareable Production Passport;
- GitHub Check/badge;
- Proof API;
- MCP;
- usage telemetry for Verified Failure Graph;
- partner/white-label mode;
- agency fleet workspace;
- public research methodology.

### Keep narrow

- provider integrations;
- remediation scope;
- enterprise feature set;
- compliance breadth.

### Delay

- hundreds of providers;
- large custom enterprise features;
- generic observability replacement;
- generic security platform;
- our own IDE;
- our own frontier model;
- expensive broad marketing.

---

# 23. The AI/Data Flywheel Is Central

Every proof run should create privacy-safe structured intelligence:

```text
producer family
stack fingerprint
contract attempted
failure class
root-cause class
repair class
verification result
regression result
latency
cost
```

The flywheel:

```text
more apps
→ more proof
→ more verified failure patterns
→ better contract selection
→ faster diagnosis
→ safer remediation
→ higher proof accuracy
→ more partner trust
→ more apps
```

This is how Relyo gets smarter without betting the company on one model provider.

**AI reasons. Evidence decides.**

---

# 24. What We Must Never Do for Growth

Do not:

- fabricate security incidents;
- shame builders using weak or biased samples;
- publish private customer data;
- claim an app is “100% safe”;
- pay for meaningless “Relyo Verified” status;
- create fake users or fake traction;
- optimize only for scans while proof adoption is weak;
- sacrifice verification quality for viral growth;
- allow the same agent to make consequential changes and self-certify success without independent evidence;
- call Relyo competitor-free.

There are adjacent competitors in testing, AppSec, observability, DevOps, and builder-native verification. Our opportunity is that **the independent cross-builder proof category is not yet clearly owned**.

---

# 25. The Correct 6-Month Goal

The wrong goal:

> Be worth $2B in six months.

The correct goal:

> **By six months, make the market believe Relyo can become the universal proof layer for machine-built software.**

Evidence required:

```text
users discover a pain they did not know they had
product proves the pain instantly
proof artifacts spread organically
builders begin calling Relyo programmatically
verified failure data compounds
customers repeatedly refresh proof
third parties consume the Passport
revenue grows rapidly
```

If that happens at extraordinary scale, a $1B–$2B valuation can become an outcome.

It is never the product requirement itself.

---

# 26. Twelve-Month North Star

By 12 months, Relyo should try to move from:

```text
“a tool founders use”
```

to:

```text
“a proof network software producers and software consumers both depend on.”
```

The decisive milestone is not user count.

It is:

> **A meaningful percentage of proof runs are initiated by external products, and a meaningful percentage of Production Passports are consumed by third parties.**

That is the beginning of infrastructure-level network effects.

---

# 27. Current Hypergrowth Positioning

### User-facing

> **Your AI says the app is done. Prove it.**

### Founder-facing

> **Connect your app. Relyo proves the real business works.**

### Developer-facing

> **Stop shipping False Done.**

### Builder-facing

> **Your agent builds it. Relyo proves it.**

### Enterprise-facing

> **One independent production trust gate for every coding agent.**

### Long-term

> **Relyo is the independent proof layer for machine-built software.**

---

# 28. Evidence Behind This Plan

Current external signals used in forming this plan include:

- Lovable announced a $200M Series A at a $1.8B valuation eight months after launch in July 2025; public reporting at the time cited 2.3M active users, 180k paying subscribers, and approximately $75M–$100M ARR. https://lovable.dev/blog/200m-series-a-fundraise and https://techcrunch.com/2025/07/23/eight-months-in-swedish-unicorn-lovable-crosses-the-100m-arr-milestone/
- Lovable announced a $400M Series C at a $13.3B valuation in August 2026 and reported more than 60M projects and 900M+ monthly visits to Lovable-built apps. https://lovable.dev/blog/series-c
- Replit announced a $400M round at a $9B valuation in March 2026 and said its valuation had tripled in six months. https://replit.com/blog/replit-raises-400-million-dollars
- Uber described 34%+ month-over-month growth in 2011 while rapidly expanding its proven city model. https://www.uber.com/fr/en/blog/were-going-global-with-big-funding/
- American Express describes its differentiated closed-loop network, direct ecosystem relationships, trust/security posture, and agentic-commerce strategy. https://www.americanexpress.com/en-us/newsroom/articles/financial-news/2026-chairman-s-letter-to-shareholders.html and https://www.americanexpress.com/en-us/company/agentic-commerce/
- Wiz described reaching a $6B valuation in 18 months and signing its first multi-million-dollar customer six months after the first line of code. https://www.wiz.io/blog/celebrating-our-series-c-zero-to-6-billion-in-18-months

These comparables are evidence of what exceptional execution can look like, not promises that Relyo will reproduce their outcomes.

---

# 29. Execution Instruction for Future Agents

When working on growth or product execution:

1. Read `V2_MASTER_PLAN.md`.
2. Read `docs/V2_HYPERGROWTH_CATEGORY_PLAN.md`.
3. Read `docs/AI_MOAT.md`.
4. Read `V2_EXECUTION_PLAN.md`.
5. Prefer product-led growth surfaces over paid marketing.
6. Preserve builder neutrality.
7. Optimize for proof density on the initial stack.
8. Build shareable proof and headless distribution early.
9. Track false-pass rate as a sacred trust metric.
10. Update this plan when real data contradicts assumptions.

Relyo should learn faster than the market because every verified outcome improves both product and distribution.
