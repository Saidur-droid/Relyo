import type { SupabaseProductionObservation } from "@relyo/adapter-supabase";
import type { DiscoveryResult } from "@relyo/discovery";
import {
  createPassport,
  evaluateContract,
  type AssuranceLevel,
  type Passport,
  type ProofContract,
} from "@relyo/kernel";
import { buildLaunchCheckReport } from "./index.js";
import { buildSupabaseR1Contracts } from "./supabase-r1.js";

export interface SupabaseAugmentedR1Report {
  targetAssurance: "R1";
  achievedAssurance: AssuranceLevel;
  contracts: ProofContract[];
  blockers: string[];
  passport: Passport;
}

/**
 * Adds read-only Supabase evidence to the provider-neutral launch contract pack.
 *
 * This intentionally does not pretend Supabase is a deployment provider. If no
 * supported deployment provider is connected, deployment configuration and
 * rollback remain explicit UNKNOWNs and R1 is not inflated.
 */
export function buildSupabaseAugmentedR1Report(input: {
  discovery: DiscoveryResult;
  provider: SupabaseProductionObservation;
}): SupabaseAugmentedR1Report {
  const base = buildLaunchCheckReport(input.discovery);
  const contracts = [
    ...base.contracts,
    ...buildSupabaseR1Contracts({ discovery: input.discovery, provider: input.provider }),
  ];
  const results = contracts.map(evaluateContract);
  const projectIdentity = input.discovery.url?.host
    ?? input.discovery.repo?.repository
    ?? "unknown";

  const passport = createPassport({
    subject: base.passport.subject,
    release: base.passport.release,
    environment: {
      provider: "public-web+supabase",
      projectId: `${projectIdentity}:${input.provider.project.ref}`,
      environment: "production",
      ...(input.discovery.url ? { url: input.discovery.url.finalUrl } : {}),
    },
    targetAssurance: "R1",
    contracts,
    evidence: [
      ...input.discovery.evidence,
      ...input.provider.evidence,
    ],
    exclusions: base.passport.exclusions,
    verifier: { name: "relyo-supabase-augmented-launch-verifier", version: "0.1.0" },
  });

  const blockers = results
    .filter((result) => result.status !== "PASS")
    .flatMap((result) =>
      result.assertions
        .filter((assertion) => assertion.status !== "PASS")
        .map((assertion) => assertion.message ?? assertion.description),
    );

  return {
    targetAssurance: "R1",
    achievedAssurance: passport.assurance,
    contracts,
    blockers,
    passport,
  };
}
