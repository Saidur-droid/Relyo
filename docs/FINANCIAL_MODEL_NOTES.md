# Relyo V2 — Financial Model Notes

> **STATUS: ACTIVE PLANNING MODEL NOTES**

The working spreadsheet artifact is `Relyo_Financial_Model_V1.xlsx` in the execution package delivered from ChatGPT. This document preserves its logic so future agents can recreate/update the workbook even if the binary is not present in Git.

## Model horizon

18 months, beginning with Month 1 around the initial build/launch period.

## Initial funding assumptions

- Pre-seed target: **$1.5M base model** within the broader $1M–$2M planning range.
- Starting pre-raise cash placeholder: $50K.
- These are planning assumptions, not committed financing.

## Revenue streams modeled

1. Launch Proof — one-time.
2. Continuous Proof — monthly recurring.
3. Agency accounts — monthly recurring.
4. Proof API customers — monthly/usage-equivalent revenue.
5. Enterprise pilots — monthly-equivalent contract revenue.

## Base pricing assumptions

- Launch Proof: $49.
- Continuous Proof: $49/month.
- Agency: $399/month.
- API customer average: $250/month initial blended assumption.
- Enterprise pilot: $5,000/month equivalent.

All pricing must be replaced by actual experiment data once available.

## Variable cost assumptions

- Launch Proof: $8.
- Continuous Proof: $10/account/month.
- Agency: $80/account/month.
- API customer: $75/month.
- Enterprise pilot: $500/month.

Variable proof cost includes a planning allowance for compute, browser runs, evidence storage, provider APIs, model calls, and support allocation.

## Payroll assumptions

Initial loaded monthly planning costs:

- Founder cash comp: $3K.
- Product/infra engineer: $7K each.
- Security/reliability engineer: $8K.
- Design/product generalist: $5.5K.
- Growth/DevRel engineer: $6K.

These are not compensation commitments. Update by geography, hiring structure and actual offers.

## Hiring timing modeled

- Founder: Month 1.
- Engineer 1: Month 1.
- Engineer 2: Month 2.
- Security/reliability: Month 3.
- Design/product: Month 3.
- Growth/DevRel: Month 6.
- Additional engineer: Month 10.

## Fixed-cost assumptions

- Software/cloud fixed Month 1: $2.5K.
- Other G&A/legal Month 1: $3K.
- Fixed-cost growth: 8% month-over-month planning assumption during early scale.

## Spreadsheet sheets

### Assumptions

Editable blue/yellow input cells for pricing, costs, hiring timing, and growth inputs.

### 18M_Model

Monthly:

- revenue by stream;
- COGS by stream;
- gross profit / gross margin;
- payroll;
- software/cloud;
- G&A;
- operating profit/loss;
- ending cash;
- ARR run-rate.

### Unit_Economics

Price, variable cost, contribution and contribution margin by product.

### Fundraise

Raise assumption, ending cash checkpoints, ARR run-rate checkpoints.

### KPI_Targets

6-month moonshot targets for scans, active verified apps, paid accounts, proof runs and builder/API pilots.

## Model integrity rules

- Inputs are hypotheses until real data exists.
- Do not present modeled ARR as actual ARR.
- Replace proof variable cost with measured cost as soon as product runs exist.
- Update hiring assumptions only after milestones justify hiring.
- Keep downside/base/upside scenarios once first 30–60 days of conversion data exists.

## Next model upgrades

After first paid users, add:

- free → paid conversion cohorts;
- churn/retention;
- CAC by channel;
- referral coefficient;
- gross margin by proof type;
- browser-run cost distribution;
- enterprise sales cycle;
- agency net revenue retention;
- downside/base/upside scenarios;
- funding dilution/cap-table planning with counsel/investor terms.
