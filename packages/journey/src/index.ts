import { randomUUID } from "node:crypto";
import { createEvidenceEnvelope, type EvidenceEnvelope, type ProofContract } from "@relyo/kernel";

export type JourneyStepStatus = "PASS" | "FAIL" | "UNKNOWN";

export interface JourneyStepResult {
  id: string;
  title: string;
  status: JourneyStepStatus;
  startedAt: string;
  completedAt: string;
  detail?: string;
  artifactRefs?: string[];
}

export interface JourneyDriver {
  signup(): Promise<JourneyStepResult>;
  verifyIdentity(): Promise<JourneyStepResult>;
  assertAuthenticated(): Promise<JourneyStepResult>;
  createPrimaryResource(): Promise<JourneyStepResult>;
  executeCoreAction(): Promise<JourneyStepResult>;
  logout(): Promise<JourneyStepResult>;
  loginAgain(): Promise<JourneyStepResult>;
  cleanup(): Promise<JourneyStepResult>;
  checkout?(): Promise<JourneyStepResult>;
  awaitWebhook?(): Promise<JourneyStepResult>;
  assertEntitlementActive?(): Promise<JourneyStepResult>;
  cancelSubscription?(): Promise<JourneyStepResult>;
  assertEntitlementRevoked?(): Promise<JourneyStepResult>;
  dispose(): Promise<void>;
}

export interface JourneyDefinition {
  id: string;
  version: string;
  title: string;
  includePaymentLifecycle?: boolean;
}

export interface JourneyRun {
  id: string;
  definition: JourneyDefinition;
  startedAt: string;
  completedAt: string;
  steps: JourneyStepResult[];
  evidence: EvidenceEnvelope[];
  cleanupAttempted: boolean;
}

const CORE_STEP_IDS = [
  "journey.signup",
  "journey.identity-verification",
  "journey.authenticated-session",
  "journey.create-primary-resource",
  "journey.core-action",
  "journey.logout",
  "journey.repeat-login",
  "journey.cleanup",
] as const;

const PAYMENT_STEP_IDS = [
  "journey.checkout",
  "journey.webhook",
  "journey.entitlement-active",
  "journey.cancel",
  "journey.entitlement-revoked",
] as const;

function normalizeStep(expectedId: string, step: JourneyStepResult): JourneyStepResult {
  return {
    ...step,
    id: expectedId,
    artifactRefs: step.artifactRefs ? [...new Set(step.artifactRefs)] : [],
  };
}

async function callStep(
  id: string,
  fn: (() => Promise<JourneyStepResult>) | undefined,
  now: () => Date,
): Promise<JourneyStepResult> {
  if (!fn) {
    const at = now().toISOString();
    return { id, title: id, status: "UNKNOWN", startedAt: at, completedAt: at, detail: "Journey driver does not implement this step." };
  }
  try {
    return normalizeStep(id, await fn());
  } catch (error) {
    const at = now().toISOString();
    return {
      id,
      title: id,
      status: "FAIL",
      startedAt: at,
      completedAt: at,
      detail: error instanceof Error ? error.message : "Journey step failed.",
    };
  }
}

export async function executeJourney(input: {
  definition: JourneyDefinition;
  driver: JourneyDriver;
  source: string;
  now?: () => Date;
}): Promise<JourneyRun> {
  const now = input.now ?? (() => new Date());
  const startedAt = now().toISOString();
  const steps: JourneyStepResult[] = [];
  let cleanupAttempted = false;

  const core: Array<[string, () => Promise<JourneyStepResult>]> = [
    [CORE_STEP_IDS[0], () => input.driver.signup()],
    [CORE_STEP_IDS[1], () => input.driver.verifyIdentity()],
    [CORE_STEP_IDS[2], () => input.driver.assertAuthenticated()],
    [CORE_STEP_IDS[3], () => input.driver.createPrimaryResource()],
    [CORE_STEP_IDS[4], () => input.driver.executeCoreAction()],
    [CORE_STEP_IDS[5], () => input.driver.logout()],
    [CORE_STEP_IDS[6], () => input.driver.loginAgain()],
  ];

  try {
    for (const [id, fn] of core) steps.push(await callStep(id, fn, now));

    if (input.definition.includePaymentLifecycle) {
      const payment: Array<[string, (() => Promise<JourneyStepResult>) | undefined]> = [
        [PAYMENT_STEP_IDS[0], input.driver.checkout ? () => input.driver.checkout!() : undefined],
        [PAYMENT_STEP_IDS[1], input.driver.awaitWebhook ? () => input.driver.awaitWebhook!() : undefined],
        [PAYMENT_STEP_IDS[2], input.driver.assertEntitlementActive ? () => input.driver.assertEntitlementActive!() : undefined],
        [PAYMENT_STEP_IDS[3], input.driver.cancelSubscription ? () => input.driver.cancelSubscription!() : undefined],
        [PAYMENT_STEP_IDS[4], input.driver.assertEntitlementRevoked ? () => input.driver.assertEntitlementRevoked!() : undefined],
      ];
      for (const [id, fn] of payment) steps.push(await callStep(id, fn, now));
    }
  } finally {
    cleanupAttempted = true;
    steps.push(await callStep(CORE_STEP_IDS[7], () => input.driver.cleanup(), now));
    await input.driver.dispose();
  }

  const completedAt = now().toISOString();
  const evidence = [createEvidenceEnvelope({
    kind: "synthetic-customer-journey",
    source: input.source,
    payload: {
      journeyId: input.definition.id,
      journeyVersion: input.definition.version,
      steps: steps.map(({ id, status, startedAt, completedAt, detail, artifactRefs }) => ({
        id, status, startedAt, completedAt, detail, artifactRefs,
      })),
      cleanupAttempted,
    },
    collectedAt: completedAt,
    redacted: true,
    summary: {
      stepCount: steps.length,
      passCount: steps.filter((step) => step.status === "PASS").length,
      failCount: steps.filter((step) => step.status === "FAIL").length,
      unknownCount: steps.filter((step) => step.status === "UNKNOWN").length,
      cleanupAttempted,
    },
  })];

  return {
    id: `journey_${randomUUID()}`,
    definition: input.definition,
    startedAt,
    completedAt,
    steps,
    evidence,
    cleanupAttempted,
  };
}

export function buildR2JourneyContract(run: JourneyRun): ProofContract {
  const refs = run.evidence.map((item) => item.id);
  return {
    id: `business.${run.definition.id}`,
    version: run.definition.version,
    title: run.definition.title,
    requiredFor: ["R2", "R3", "R4"],
    assertions: run.steps.map((step) => ({
      id: step.id,
      description: step.title,
      status: step.status,
      evidenceRefs: refs,
      message: step.detail,
    })),
  };
}
