import { randomUUID, type KeyObject } from "node:crypto";
import type { SupabaseProductionObservation } from "@relyo/adapter-supabase";
import type { VercelProductionObservation } from "@relyo/adapter-vercel";
import { buildLaunchCheckReport } from "@relyo/contracts";
import { buildCombinedR1Report } from "@relyo/contracts/combined-r1";
import { buildSupabaseAugmentedR1Report } from "@relyo/contracts/supabase-augmented-r1";
import { buildVercelR1Report } from "@relyo/contracts/vercel-r1";
import type { DiscoveryResult } from "@relyo/discovery";
import type { ProofRun, ProofRunState } from "@relyo/kernel";
import { signPassport, type SignedPassport } from "@relyo/kernel/signing";
import type { ProofStore, StoredProofRecord } from "@relyo/store";

export interface ExecutePublicR1ProofInput {
  discovery: DiscoveryResult;
  store: ProofStore;
  signingPrivateKey: KeyObject | string | Buffer;
  signingKeyId?: string;
  runId?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ExecuteSupabaseAugmentedR1ProofInput {
  discovery: DiscoveryResult;
  supabase: SupabaseProductionObservation;
  store: ProofStore;
  signingPrivateKey: KeyObject | string | Buffer;
  signingKeyId?: string;
  runId?: string;
  startedAt?: string;
  completedAt?: string;
}

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

export interface ExecuteCombinedR1ProofInput {
  discovery: DiscoveryResult;
  vercel: VercelProductionObservation;
  supabase: SupabaseProductionObservation;
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

async function persistReport(input: {
  report: { passport: StoredProofRecord["passport"]; blockers: string[]; achievedAssurance: string };
  store: ProofStore;
  signingPrivateKey: KeyObject | string | Buffer;
  signingKeyId?: string;
  runId?: string;
  startedAt?: string;
  completedAt?: string;
}): Promise<ExecutedProof> {
  const startedAt = input.startedAt ?? new Date().toISOString();
  const completedAt = input.completedAt ?? new Date().toISOString();
  const state = proofState(input.report.passport.results, input.report.achievedAssurance);
  const run: ProofRun = {
    id: input.runId ?? `run_${randomUUID()}`,
    subject: input.report.passport.subject,
    state,
    targetAssurance: "R1",
    startedAt,
    completedAt,
  };
  const signedPassport = signPassport({
    passport: input.report.passport,
    privateKey: input.signingPrivateKey,
    ...(input.signingKeyId ? { keyId: input.signingKeyId } : {}),
  });
  const record: StoredProofRecord = {
    run,
    passport: input.report.passport,
    signedPassport,
    evidence: input.report.passport.evidence,
    createdAt: completedAt,
  };
  await input.store.save(record);
  return { run, signedPassport, blockers: input.report.blockers };
}

export async function executePublicR1Proof(input: ExecutePublicR1ProofInput): Promise<ExecutedProof> {
  const report = buildLaunchCheckReport(input.discovery);
  return await persistReport({
    report,
    store: input.store,
    signingPrivateKey: input.signingPrivateKey,
    ...(input.signingKeyId ? { signingKeyId: input.signingKeyId } : {}),
    ...(input.runId ? { runId: input.runId } : {}),
    ...(input.startedAt ? { startedAt: input.startedAt } : {}),
    ...(input.completedAt ? { completedAt: input.completedAt } : {}),
  });
}

export async function executeSupabaseAugmentedR1Proof(input: ExecuteSupabaseAugmentedR1ProofInput): Promise<ExecutedProof> {
  const report = buildSupabaseAugmentedR1Report({
    discovery: input.discovery,
    provider: input.supabase,
  });
  return await persistReport({
    report,
    store: input.store,
    signingPrivateKey: input.signingPrivateKey,
    ...(input.signingKeyId ? { signingKeyId: input.signingKeyId } : {}),
    ...(input.runId ? { runId: input.runId } : {}),
    ...(input.startedAt ? { startedAt: input.startedAt } : {}),
    ...(input.completedAt ? { completedAt: input.completedAt } : {}),
  });
}

export async function executeVercelR1Proof(input: ExecuteVercelR1ProofInput): Promise<ExecutedProof> {
  const report = buildVercelR1Report({
    discovery: input.discovery,
    provider: input.provider,
    ...(input.requiredEnvironmentKeys ? { requiredEnvironmentKeys: input.requiredEnvironmentKeys } : {}),
  });
  return await persistReport({
    report,
    store: input.store,
    signingPrivateKey: input.signingPrivateKey,
    ...(input.signingKeyId ? { signingKeyId: input.signingKeyId } : {}),
    ...(input.runId ? { runId: input.runId } : {}),
    ...(input.startedAt ? { startedAt: input.startedAt } : {}),
    ...(input.completedAt ? { completedAt: input.completedAt } : {}),
  });
}

export async function executeCombinedR1Proof(input: ExecuteCombinedR1ProofInput): Promise<ExecutedProof> {
  const report = buildCombinedR1Report({
    discovery: input.discovery,
    vercel: input.vercel,
    supabase: input.supabase,
    ...(input.requiredEnvironmentKeys ? { requiredEnvironmentKeys: input.requiredEnvironmentKeys } : {}),
  });
  return await persistReport({
    report,
    store: input.store,
    signingPrivateKey: input.signingPrivateKey,
    ...(input.signingKeyId ? { signingKeyId: input.signingKeyId } : {}),
    ...(input.runId ? { runId: input.runId } : {}),
    ...(input.startedAt ? { startedAt: input.startedAt } : {}),
    ...(input.completedAt ? { completedAt: input.completedAt } : {}),
  });
}
