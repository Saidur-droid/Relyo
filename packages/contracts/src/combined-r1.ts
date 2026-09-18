import type { SupabaseProductionObservation } from "@relyo/adapter-supabase";
import type { VercelProductionObservation } from "@relyo/adapter-vercel";
import type { DiscoveryResult } from "@relyo/discovery";
import {
  createPassport,
  evaluateContract,
  type AssuranceLevel,
  type Passport,
  type ProofContract,
  type Subject,
} from "@relyo/kernel";
import { buildSupabaseR1Contracts } from "@relyo/contracts/supabase-r1";
import { buildVercelR1Contracts } from "@relyo/contracts/vercel-r1";

export interface CombinedR1Report {
  targetAssurance: "R1";
  achievedAssurance: AssuranceLevel;
  contracts: ProofContract[];
  blockers: string[];
  passport: Passport;
}

export function buildCombinedR1Report(input: {
  discovery: DiscoveryResult;
  vercel: VercelProductionObservation;
  supabase: SupabaseProductionObservation;
  requiredEnvironmentKeys?: string[];
}): CombinedR1Report {
  const contracts = [
    ...buildVercelR1Contracts({
      discovery: input.discovery,
      provider: input.vercel,
      ...(input.requiredEnvironmentKeys ? { requiredEnvironmentKeys: input.requiredEnvironmentKeys } : {}),
    }),
    ...buildSupabaseR1Contracts({ discovery: input.discovery, provider: input.supabase }),
  ];
  const results = contracts.map(evaluateContract);
  const subject: Subject = {
    id: input.discovery.repo
      ? `app_${input.discovery.repo.repository.replace(/[^A-Za-z0-9]/g, "_")}`
      : `vercel_${input.vercel.projectId}`,
    displayName: input.discovery.repo?.repository ?? input.vercel.projectName,
    kind: "application",
  };

  const deploymentId = input.vercel.productionDeployment?.id;
  const release = input.discovery.repo
    ? {
        kind: "git" as const,
        repository: input.discovery.repo.repository,
        commitSha: input.discovery.repo.commitSha,
        ...(deploymentId ? { buildId: deploymentId } : {}),
      }
    : {
        kind: "url-observation" as const,
        url: input.discovery.url?.finalUrl ?? input.vercel.productionDeployment?.url ?? "unknown",
        observedAt: new Date().toISOString(),
      };

  const passport = createPassport({
    subject,
    release,
    environment: {
      provider: "vercel+supabase",
      projectId: `${input.vercel.projectId}:${input.supabase.project.ref}`,
      environment: "production",
      ...(input.discovery.url ? { url: input.discovery.url.finalUrl } : {}),
    },
    targetAssurance: "R1",
    contracts,
    evidence: [
      ...input.discovery.evidence,
      ...input.vercel.evidence,
      ...input.supabase.evidence,
    ],
    exclusions: input.discovery.graph.unknowns.filter(
      (item) => !/environment variable presence|rollback readiness/i.test(item),
    ),
    verifier: { name: "relyo-combined-launch-verifier", version: "0.1.0" },
  });

  const blockers = results
    .filter((result) => result.status !== "PASS")
    .flatMap((result) => result.assertions
      .filter((assertion) => assertion.status !== "PASS")
      .map((assertion) => assertion.message ?? assertion.description));

  return {
    targetAssurance: "R1",
    achievedAssurance: passport.assurance,
    contracts,
    blockers,
    passport,
  };
}
