# ADR 0002 — Relyo Runner v0 isolation boundary

Status: Accepted for v0

## Context

Relyo cannot call inline Next.js proof execution an isolated runner. The V2 execution plan requires a signed task envelope, scoped capabilities, disposable workspace, timeout/cancellation, network policy hook, redaction, structured logs, evidence attribution and tamper-evident result metadata.

## Decision

Introduce `@relyo/runner` as a provider-neutral runner protocol plus an executable process-isolation implementation.

The v0 trust boundary is:

- control plane signs immutable Ed25519 task envelopes;
- runner verifies task hash/signature and expiry before execution;
- each task gets a new OS temporary workspace;
- commands are executed without a shell and with bounded environment;
- cwd cannot escape the task workspace;
- timeout and AbortSignal cancellation terminate the child process;
- secret values supplied to the runner are redacted before logs are retained;
- logs are size-bounded;
- a network-policy hook must approve tasks before execution; tasks declare explicit outbound capability and allowed hosts;
- result metadata and evidence are hashed and Ed25519-signed by the runner;
- the disposable workspace is removed after execution.

This is genuine process/workspace isolation, but it is not yet VM/container isolation. The protocol deliberately separates the trust boundary so a Firecracker/container/customer-hosted driver can replace the process driver without changing proof semantics.

## Production requirement

R1 verification may continue in the existing web control plane while the runner is integrated. R2+ browser/business journeys must not be claimed as independently isolated until a managed runner deployment invokes this protocol out of process.

Enterprise/private runner work later strengthens this boundary with VM/container isolation, outbound-only control channels, customer KMS and regional/zero-retention options.

## Rejected

- Treating a function wrapper inside the Next.js request as the Runner: rejected because it does not create an independent execution boundary.
- Granting unrestricted shell/network access: rejected by capability and policy rules.
- Logging full environment variables: rejected because secrets are part of the threat model.
