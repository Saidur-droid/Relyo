import { randomUUID, type KeyObject } from "node:crypto";
import type { VercelProductionObservation } from "@relyo/adapter-vercel";
import { buildVercelR1Report } from "@relyo/contracts/vercel-r1";
import type { DiscoveryResult } from "@relyo/discovery";
import type { ProofRun, ProofRunState } from "@relyo/kernel";
import { signPassport, type SignedPassport } from "@relyo/kernel/signing";
import type { ProofStore, StoredProofRecord } from "@relyo/store";

export interface ExecuteVercelR1ProofInput {
  discovery: DiscoveryResult;
  provider: VercelProductionObservation;
  store: ProofStore;
  signingPrivateKey: KeyObject | string | Buffer;
  signingKeyId?: string;
  requiredEnvironmentKeys?: string[];
  runId?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ExecutedProof {
  run: ProofRun;
  signedPassport: SignedPassport;
  blockers: string[];
}

function proofState(results: Array<{ status: string }>, achievedAssurance: string): ProofRunState {
  if (achievedAssurance === "R1") return "VERIFIED";
  if (results.some((result) => result.status === "FAIL")) return "FAILED";
  return "PARTIAL";
}

export async function executeVercelR1Proof(input: ExecuteVercelR1ProofInput): Promise<ExecutedProof> {
  const startedAt = input.startedAt ?? new Date().toISOString();
  const report = buildVercelR1Report({
    discovery: input.discovery,
    provider: input.provider,
    ...(input.requiredEnvironmentKeys ? { requiredEnvironmentKeys: input.requiredEnvironmentKeys } : {}),
  });
  const completedAt = input.completedAt ?? new Date().toISOString();
  const state = proofState(report.passport.results, report.achievedAssurance);

  const run: ProofRun = {
    id: input.runId ?? `run_${randomUUID()}`,
    subject: report.passport.subject,
    state,
    targetAssurance: "R1",
    startedAt,
    completedAt,
  };

  const signedPassport = signPassport({
    passport: report.passport,
    privateKey: input.signingPrivateKey,
    ...(input.signingKeyId ? { keyId: input.signingKeyId } : {}),
  });

  const record: StoredProofRecord = {
    run,
    passport: report.passport,
    signedPassport,
    evidence: report.passport.evidence,
    createdAt: completedAt,
  };

  await input.store.save(record);

  return {
    run,
    signedPassport,
    blockers: report.blockers,
  };
}
