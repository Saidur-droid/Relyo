import { createEvidenceEnvelope, type EvidenceEnvelope, type ProofContract } from "@relyo/kernel";

export type ResilienceScenarioKind =
  | "deployment-rollback"
  | "database-restore"
  | "webhook-replay"
  | "provider-fallback"
  | "secret-expiry";

export interface ResilienceScenario {
  id: string;
  kind: ResilienceScenarioKind;
  title: string;
  environment: "isolated" | "staging" | "production";
  destructivePotential: boolean;
  timeoutMs: number;
}

export interface RecoveryStepResult {
  status: "PASS" | "FAIL" | "UNKNOWN";
  startedAt: string;
  completedAt: string;
  detail?: string;
}

export interface ResilienceDriver {
  createCheckpoint(scenario: ResilienceScenario): Promise<unknown>;
  injectFailure(scenario: ResilienceScenario): Promise<RecoveryStepResult>;
  recover(scenario: ResilienceScenario): Promise<RecoveryStepResult>;
  verifyRecoveredOutcome(scenario: ResilienceScenario): Promise<RecoveryStepResult>;
  restoreCheckpoint(scenario: ResilienceScenario, checkpoint: unknown): Promise<void>;
}

export interface ResilienceRun {
  scenario: ResilienceScenario;
  failureInjection: RecoveryStepResult;
  recovery: RecoveryStepResult;
  verification: RecoveryStepResult;
  checkpointRestored: boolean;
  evidence: EvidenceEnvelope[];
}

export function assertSafeResilienceScenario(scenario: ResilienceScenario): void {
  if (scenario.timeoutMs <= 0 || scenario.timeoutMs > 30 * 60_000) {
    throw new Error("Resilience scenario timeout is outside the allowed range.");
  }
  if (scenario.kind === "database-restore" && scenario.environment === "production") {
    throw new Error("Database restore proof must run in an isolated or staging environment.");
  }
  if (scenario.destructivePotential && scenario.environment === "production") {
    throw new Error("Destructive resilience testing is forbidden in production.");
  }
}

function evidenceMessage(step: RecoveryStepResult): Record<string, string | null> {
  return { status: step.status, detail: step.detail ?? null };
}

export async function runResilienceScenario(input: {
  scenario: ResilienceScenario;
  driver: ResilienceDriver;
  source: string;
  now?: () => Date;
}): Promise<ResilienceRun> {
  assertSafeResilienceScenario(input.scenario);
  const now = input.now ?? (() => new Date());
  const checkpoint = await input.driver.createCheckpoint(input.scenario);
  let checkpointRestored = false;
  let failureInjection: RecoveryStepResult;
  let recovery: RecoveryStepResult;
  let verification: RecoveryStepResult;

  try {
    failureInjection = await input.driver.injectFailure(input.scenario);
    if (failureInjection.status !== "PASS") {
      const at = now().toISOString();
      recovery = { status: "UNKNOWN", startedAt: at, completedAt: at, detail: "Recovery was not attempted because controlled failure injection was not proven." };
      verification = { status: "UNKNOWN", startedAt: at, completedAt: at, detail: "Recovered outcome was not verified." };
    } else {
      recovery = await input.driver.recover(input.scenario);
      verification = recovery.status === "PASS"
        ? await input.driver.verifyRecoveredOutcome(input.scenario)
        : {
            status: "UNKNOWN",
            startedAt: recovery.completedAt,
            completedAt: recovery.completedAt,
            detail: "Recovery did not pass, so recovered outcome cannot be verified.",
          };
    }
  } finally {
    await input.driver.restoreCheckpoint(input.scenario, checkpoint);
    checkpointRestored = true;
  }

  const evidence = [createEvidenceEnvelope({
    kind: "resilience-recovery-run",
    source: input.source,
    payload: {
      scenario: input.scenario,
      failureInjection: evidenceMessage(failureInjection!),
      recovery: evidenceMessage(recovery!),
      verification: evidenceMessage(verification!),
      checkpointRestored,
    },
    collectedAt: now().toISOString(),
    redacted: true,
    summary: {
      kind: input.scenario.kind,
      failureInjected: failureInjection!.status === "PASS",
      recoveryPassed: recovery!.status === "PASS",
      verified: verification!.status === "PASS",
      checkpointRestored,
    },
  })];

  return { scenario: input.scenario, failureInjection: failureInjection!, recovery: recovery!, verification: verification!, checkpointRestored, evidence };
}

export function buildR3ResilienceContract(run: ResilienceRun): ProofContract {
  const refs = run.evidence.map((item) => item.id);
  return {
    id: `resilience.${run.scenario.kind}`,
    version: "1",
    title: run.scenario.title,
    requiredFor: ["R3", "R4"],
    assertions: [
      {
        id: "resilience.failure-injected",
        description: "The controlled failure condition was reproduced",
        status: run.failureInjection.status,
        evidenceRefs: refs,
        ...(run.failureInjection.detail ? { message: run.failureInjection.detail } : {}),
      },
      {
        id: "resilience.recovery-executed",
        description: "The declared recovery mechanism completed",
        status: run.recovery.status,
        evidenceRefs: refs,
        ...(run.recovery.detail ? { message: run.recovery.detail } : {}),
      },
      {
        id: "resilience.outcome-reverified",
        description: "The recovered system independently reproduced the required outcome",
        status: run.verification.status,
        evidenceRefs: refs,
        ...(run.verification.detail ? { message: run.verification.detail } : {}),
      },
      {
        id: "resilience.checkpoint-restored",
        description: "The resilience test restored its pre-test checkpoint",
        status: run.checkpointRestored ? "PASS" : "FAIL",
        evidenceRefs: refs,
      },
    ],
  };
}
