import type { VercelProductionObservation } from "@relyo/adapter-vercel";
import type { DiscoveryResult } from "@relyo/discovery";
import {
  createPassport,
  evaluateContract,
  type Assertion,
  type AssuranceLevel,
  type Passport,
  type ProofContract,
  type Subject,
} from "@relyo/kernel";
import { buildR1LaunchContracts } from "./index.js";

export interface VercelR1Report {
  targetAssurance: "R1";
  achievedAssurance: AssuranceLevel;
  contracts: ProofContract[];
  blockers: string[];
  passport: Passport;
}

function providerEvidenceRefs(provider: VercelProductionObservation): string[] {
  return provider.evidence.map((item) => item.id);
}

function releaseBindingContract(
  discovery: DiscoveryResult,
  provider: VercelProductionObservation,
): ProofContract {
  const repoSha = discovery.repo?.commitSha;
  const deployedSha = provider.productionDeployment?.gitCommitSha;
  let status: Assertion["status"] = "UNKNOWN";
  let message = "GitHub release identity and provider deployment commit are both required.";

  if (repoSha && deployedSha) {
    status = repoSha.toLowerCase() === deployedSha.toLowerCase() ? "PASS" : "FAIL";
    message = status === "PASS"
      ? `Vercel production deployment is bound to ${repoSha.slice(0, 12)}.`
      : `GitHub release ${repoSha.slice(0, 12)} does not match deployed commit ${deployedSha.slice(0, 12)}.`;
  }

  return {
    id: "launch.release-identity",
    version: "2",
    title: "Provider-bound release identity",
    requiredFor: ["R1", "R2", "R3", "R4"],
    assertions: [
      {
        id: "release.provider-commit-match",
        description: "The exact repository release matches the Vercel production deployment",
        status,
        evidenceRefs: [
          ...(discovery.repo?.evidence.map((item) => item.id) ?? []),
          ...providerEvidenceRefs(provider),
        ],
        message,
      },
    ],
  };
}

function providerProductionContract(
  discovery: DiscoveryResult,
  provider: VercelProductionObservation,
): ProofContract {
  const deployment = provider.productionDeployment;
  const expectedHost = discovery.url?.host;
  const verifiedDomain = expectedHost
    ? provider.domains.some((domain) => domain.verified && domain.name.toLowerCase() === expectedHost.toLowerCase())
    : provider.domains.some((domain) => domain.verified);

  return {
    id: "launch.provider-production",
    version: "1",
    title: "Vercel production state",
    requiredFor: ["R1", "R2", "R3", "R4"],
    assertions: [
      {
        id: "vercel.production-ready",
        description: "Vercel reports a READY production deployment",
        status: deployment ? (deployment.state === "READY" ? "PASS" : "FAIL") : "UNKNOWN",
        evidenceRefs: providerEvidenceRefs(provider),
        message: deployment
          ? `Observed production deployment ${deployment.id} in state ${deployment.state}.`
          : "No production deployment was observed.",
      },
      {
        id: "vercel.production-domain",
        description: "A verified production domain matches the checked public application",
        status: provider.domains.length === 0 ? "UNKNOWN" : verifiedDomain ? "PASS" : "FAIL",
        evidenceRefs: providerEvidenceRefs(provider),
        message: expectedHost
          ? verifiedDomain
            ? `Verified Vercel domain ${expectedHost}.`
            : `No verified Vercel domain matched ${expectedHost}.`
          : "No public URL was supplied to bind the provider domain.",
      },
    ],
  };
}

function environmentContract(
  discovery: DiscoveryResult,
  provider: VercelProductionObservation,
  requiredEnvironmentKeys?: string[],
): ProofContract {
  const required = Array.from(new Set(
    (requiredEnvironmentKeys?.length ? requiredEnvironmentKeys : discovery.repo?.envTemplateVariables ?? [])
      .map((key) => key.trim())
      .filter(Boolean),
  )).sort();
  const observed = new Set(provider.environmentKeys.map((item) => item.key));

  const assertions: Assertion[] = required.length === 0
    ? [
        {
          id: "environment.requirements-declared",
          description: "Required production environment keys are explicitly declared",
          status: "UNKNOWN",
          evidenceRefs: providerEvidenceRefs(provider),
          message: "No expected environment-key contract is declared. Relyo will not treat an arbitrary set of provider variables as complete.",
        },
      ]
    : required.map((key) => ({
        id: `environment.key.${key}`,
        description: `Production environment contains required key ${key}`,
        status: observed.has(key) ? "PASS" : "FAIL",
        evidenceRefs: providerEvidenceRefs(provider),
        message: observed.has(key)
          ? `${key} is present for the Vercel production target; its value was not read into proof evidence.`
          : `${key} was not observed in Vercel production environment metadata.`,
      }));

  return {
    id: "launch.production-environment",
    version: "2",
    title: "Production configuration presence",
    requiredFor: ["R1", "R2", "R3", "R4"],
    assertions,
  };
}

function rollbackContract(provider: VercelProductionObservation): ProofContract {
  return {
    id: "launch.rollback-readiness",
    version: "2",
    title: "Rollback readiness",
    requiredFor: ["R1", "R2", "R3", "R4"],
    assertions: [
      {
        id: "vercel.rollback-candidate",
        description: "A provider-observed previous READY production deployment can be promoted if rollback is required",
        status: provider.rollback.ready ? "PASS" : "FAIL",
        evidenceRefs: providerEvidenceRefs(provider),
        message: provider.rollback.ready
          ? `${provider.rollback.eligiblePreviousDeploymentCount} previous READY production deployment(s) observed and Vercel promote capability is supported.`
          : "No eligible previous READY production deployment was observed, so rollback readiness is not proven.",
      },
    ],
  };
}

export function buildVercelR1Contracts(input: {
  discovery: DiscoveryResult;
  provider: VercelProductionObservation;
  requiredEnvironmentKeys?: string[];
}): ProofContract[] {
  const baseline = buildR1LaunchContracts(input.discovery).filter(
    (contract) => ![
      "launch.release-identity",
      "launch.production-environment",
      "launch.rollback-readiness",
    ].includes(contract.id),
  );

  return [
    releaseBindingContract(input.discovery, input.provider),
    ...baseline,
    providerProductionContract(input.discovery, input.provider),
    environmentContract(input.discovery, input.provider, input.requiredEnvironmentKeys),
    rollbackContract(input.provider),
  ];
}

export function buildVercelR1Report(input: {
  discovery: DiscoveryResult;
  provider: VercelProductionObservation;
  requiredEnvironmentKeys?: string[];
}): VercelR1Report {
  const contracts = buildVercelR1Contracts(input);
  const results = contracts.map(evaluateContract);
  const subject: Subject = {
    id: input.discovery.repo
      ? `app_${input.discovery.repo.repository.replace(/[^A-Za-z0-9]/g, "_")}`
      : `vercel_${input.provider.projectId}`,
    displayName: input.discovery.repo?.repository ?? input.provider.projectName,
    kind: "application",
  };

  const deploymentId = input.provider.productionDeployment?.id;
  const release = input.discovery.repo
    ? {
        kind: "git" as const,
        repository: input.discovery.repo.repository,
        commitSha: input.discovery.repo.commitSha,
        ...(deploymentId ? { buildId: deploymentId } : {}),
      }
    : {
        kind: "url-observation" as const,
        url: input.discovery.url?.finalUrl ?? input.provider.productionDeployment?.url ?? "unknown",
        observedAt: new Date().toISOString(),
      };

  const passport = createPassport({
    subject,
    release,
    environment: {
      provider: "vercel",
      projectId: input.provider.projectId,
      environment: "production",
      ...(input.discovery.url ? { url: input.discovery.url.finalUrl } : {}),
    },
    targetAssurance: "R1",
    contracts,
    evidence: [...input.discovery.evidence, ...input.provider.evidence],
    exclusions: input.discovery.graph.unknowns.filter(
      (item) => !/environment variable presence|rollback readiness/i.test(item),
    ),
    verifier: { name: "relyo-vercel-launch-verifier", version: "0.1.0" },
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
