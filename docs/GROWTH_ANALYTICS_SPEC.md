# Relyo V2 — Growth Analytics Specification

> **STATUS: ACTIVE ANALYTICS SPEC**

## Goal

Measure the full path from first awareness to recurring proof and external distribution.

Core funnel:

```text
visit
→ free check
→ meaningful finding
→ repo connect
→ proof start
→ proof complete
→ paid
→ Passport viewed/shared
→ repeat proof
→ referral/partner acquisition
```

## Event taxonomy

### Acquisition

- `landing_viewed`
- `launch_mode_viewed`
- `content_page_viewed`
- `partner_referral_landed`
- `passport_referral_landed`
- `campaign_landed`

Required properties:

- source;
- medium;
- campaign;
- referrer;
- landing_page;
- launch_mode;
- country (coarse only);
- anonymous_session_id.

### Free check

- `url_check_started`
- `url_check_completed`
- `url_check_failed`
- `repo_connect_started`
- `repo_connected`
- `repo_scan_started`
- `repo_scan_completed`
- `meaningful_finding_shown`

Finding properties:

- finding_class;
- severity;
- provider_family;
- contract_candidate;
- confidence source (deterministic/inferred);
- whether user expanded detail.

### Proof

- `proof_run_started`
- `proof_contract_started`
- `proof_contract_passed`
- `proof_contract_failed`
- `proof_contract_unknown`
- `proof_run_completed`
- `proof_run_abandoned`
- `approval_requested`
- `approval_granted`
- `remediation_started`
- `remediation_completed`
- `reverification_completed`

Required properties:

- app_id;
- release_id;
- environment_id;
- proof_pack;
- assurance_target;
- duration_ms;
- estimated_cost;
- initiating_surface.

### Revenue

- `pricing_viewed`
- `checkout_started`
- `launch_proof_purchased`
- `subscription_started`
- `subscription_upgraded`
- `subscription_cancelled`
- `refund_requested`
- `agency_plan_started`
- `api_usage_billed`

### Passport

- `passport_issued`
- `passport_viewed`
- `passport_shared`
- `passport_badge_installed`
- `passport_embed_loaded`
- `passport_expired`
- `passport_degraded`
- `passport_restored`

### Referral/partner

- `referral_invite_sent`
- `referral_signup`
- `agency_client_added`
- `partner_proof_initiated`
- `api_partner_proof_initiated`
- `third_party_passport_consumed`

## Funnel dashboards

### Dashboard 1 — Acquisition & activation

- unique qualified visitors;
- URL checks started/completed;
- repo connections;
- meaningful finding rate;
- median time to first finding;
- free → proof start conversion.

### Dashboard 2 — Proof value

- proof runs/day;
- completion rate;
- contract pass/fail/unknown mix;
- time to R1/R2;
- top failure classes;
- remediation success;
- false-positive review flags;
- false VERIFIED incidents.

### Dashboard 3 — Revenue

- free → Launch Proof conversion;
- launch proof → subscription conversion;
- MRR/ARR;
- ARPA;
- refund rate;
- gross margin per proof type;
- revenue by acquisition source.

### Dashboard 4 — Retention

Cohorts by first proof week:

- active at D7/D30/D90;
- repeat proof rate;
- passport refresh rate;
- apps under continuous proof;
- proof runs per retained app.

### Dashboard 5 — Virality/network

- Passport views/share rate;
- passport → new scan conversion;
- referral coefficient;
- GitHub badge installs;
- external API/MCP proof share;
- third-party Passport consumption.

## North-star metrics

Primary product value:

> **Verified Production Outcomes**

Primary platform maturity:

> **Proof Runs Successfully Consumed by Third Parties**

Sacred quality metric:

> **False VERIFIED Rate**

## Daily KPI board

- qualified visitors;
- checks completed;
- meaningful findings;
- repo connects;
- proof starts;
- proof completions;
- paid conversions;
- Passports issued;
- Passport shares;
- repeat proofs;
- proof cost;
- system errors.

## Weekly KPI board

- activation rate;
- paid conversion rate;
- weekly active verified apps;
- week-over-week growth;
- 4-week retention;
- gross margin;
- organic share;
- partner-initiated proof %;
- top three failure classes;
- top three funnel drop-offs.

## Data governance

- never store secrets in analytics;
- never send raw source code to growth analytics;
- use internal IDs, not customer payloads;
- separate product analytics from evidence storage;
- support deletion where required;
- document retention.

## Decision thresholds

Investigate immediately if:

- meaningful finding rate collapses;
- proof completion falls below 80% because of product faults;
- checkout conversion changes >30% week over week without known cause;
- false VERIFIED incident occurs;
- variable proof cost exceeds pricing envelope;
- Passport sharing produces no downstream acquisition after sufficient sample.
