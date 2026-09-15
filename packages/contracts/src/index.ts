import {
  createPassport,
  evaluateContract,
  type Assertion,
  type AssuranceLevel,
  type Passport,
  type ProofContract,
  type Subject,
} from "@relyo/kernel";
import type { DiscoveryResult, RepoObservation, UrlObservation } from "@relyo/discovery";

export const R1_LAUNCH_CONTRACT_IDS = [
  "launch.release-identity",
  "launch.public-https",
  "launch.public-health",
  "launch.repo-readiness",
  "launch.production-environment",
  "launch.rollback-readiness",
] as const;

export interface LaunchCheckReport {
  targetAssurance: "R1";
  achievedAssurance: AssuranceLevel;
  contracts: ProofContract[];
  blockers: string[];
  passport: Passport;
}

function assertion(input: Assertion): Assertion {
  return input;
}

function releaseIdentityContract(repo?: RepoObservation): ProofContract {
  return {
    id: "launch.release-identity",
    version: "1",
    title: "Release identity",
    requiredFor: ["R1", "R2", "R3", "R4"],
    assertions: [
      assertion({
        id: "release.commit-bound",
        description: "The checked release is bound to an exact Git commit",
        status: repo?.commitSha ? "PASS" : "UNKNOWN",
        evidenceRefs: repo?.evidence.map((item) => item.id) ?? [],
        message: repo?.commitSha
          ? `Observed ${repo.repository}@${repo.commitSha.slice(0, 12)}.`
          : "Connect or provide a GitHub repository to bind proof to an exact release.",
      }),
    ],
  };
}

function httpsContract(url?: UrlObservation): ProofContract {
  return {
    id: "launch.public-https",
    version: "1",
    title: "Production HTTPS",
    requiredFor: ["R1", "R2", "R3", "R4"],
    assertions: [
      assertion({
        id: "public.https",
        description: "The observed production entry point uses HTTPS",
        status: url ? (url.https ? "PASS" : "FAIL") : "UNKNOWN",
        evidenceRefs: url?.evidence.map((item) => item.id) ?? [],
        message: url
          ? url.https
            ? `Observed HTTPS at ${url.finalUrl}.`
            : `Observed non-HTTPS entry point at ${url.finalUrl}.`
          : "Provide a production URL to verify HTTPS.",
      }),
    ],
  };
}

function healthContract(url?: UrlObservation): ProofContract {
  let status: Assertion["status"] = "UNKNOWN";
  if (url) {
    if (url.status >= 200 && url.status < 400) status = "PASS";
    else if (url.status >= 400 && url.status < 500) status = "PARTIAL";
    else status = "FAIL";
  }

  return {
    id: "launch.public-health",
    version: "1",
    title: "Public runtime health",
    requiredFor: ["R1", "R2", "R3", "R4"],
    assertions: [
      assertion({
        id: "public.http-response",
        description: "The production entry point returns a launch-usable HTTP response",
        status,
        evidenceRefs: url?.evidence.map((item) => item.id) ?? [],
        message: url ? `Observed HTTP ${url.status} in ${url.latencyMs} ms.` : "Provide a production URL to verify runtime health.",
      }),
    ],
  };
}

function repoReadinessContract(repo?: RepoObservation): ProofContract {
  const buildStatus: Assertion["status"] = !repo
    ? "UNKNOWN"
    : repo.scripts.includes("build")
      ? "PASS"
      : "FAIL";
  const lockStatus: Assertion["status"] = !repo
    ? "UNKNOWN"
    : repo.packageManager === "unknown"
      ? "PARTIAL"
      : "PASS";

  return {
    id: "launch.repo-readiness",
    version: "1",
    title: "Repository readiness",
    requiredFor: ["R1", "R2", "R3", "R4"],
    assertions: [
      assertion({
        id: "repo.build-script",
        description: "A reproducible build command is exposed",
        status: buildStatus,
        evidenceRefs: repo?.evidence.map((item) => item.id) ?? [],
        message: repo
          ? repo.scripts.includes("build")
            ? "A build script is present."
            : "No root build script was observed."
          : "Repository evidence is not available.",
      }),
      assertion({
        id: "repo.lockfile",
        description: "A supported dependency lockfile is present",
        status: lockStatus,
        evidenceRefs: repo?.evidence.map((item) => item.id) ?? [],
        message: repo
          ? repo.packageManager === "unknown"
            ? "No supported lockfile was observed."
            : `${repo.packageManager} lockfile detected.`
          : "Repository evidence is not available.",
      }),
    ],
  };
}

function productionEnvironmentContract(): ProofContract {
  return {
    id: "launch.production-environment",
    version: "1",
    title: "Production configuration",
    requiredFor: ["R1", "R2", "R3", "R4"],
    assertions: [
      assertion({
        id: "environment.required-values",
        description: "Required production configuration is present in the deployment provider",
        status: "UNKNOWN",
        evidenceRefs: [],
        message: "Free discovery never infers production secret/config presence from source code. Connect the deployment provider for this proof.",
      }),
    ],
  };
}

function rollbackContract(): ProofContract {
  return {
    id: "launch.rollback-readiness",
    version: "1",
    title: "Rollback readiness",
    requiredFor: ["R1", "R2", "R3", "R4"],
    assertions: [
      assertion({
        id: "deployment.rollback",
        description: "A tested or provider-observed rollback path exists",
        status: "UNKNOWN",
        evidenceRefs: [],
        message: "Rollback readiness requires deployment-provider evidence and is not claimed by the free public scan.",
      }),
    ],
  };
}

export function buildR1LaunchContracts(discovery: DiscoveryResult): ProofContract[] {
  return [
    releaseIdentityContract(discovery.repo),
    httpsContract(discovery.url),
    healthContract(discovery.url),
    repoReadinessContract(discovery.repo),
    productionEnvironmentContract(),
    rollbackContract(),
  ];
}

export function buildLaunchCheckReport(discovery: DiscoveryResult): LaunchCheckReport {
  const contracts = buildR1LaunchContracts(discovery);
  const results = contracts.map(evaluateContract);
  const subject: Subject = {
    id: discovery.repo ? `app_${discovery.repo.repository.replace(/[^A-Za-z0-9]/g, "_")}` : `url_${discovery.url?.host ?? "unknown"}`,
    displayName: discovery.repo?.repository ?? discovery.url?.host ?? "Unknown application",
    kind: "application",
  };

  const release = discovery.repo
    ? {
        kind: "git" as const,
        repository: discovery.repo.repository,
        commitSha: discovery.repo.commitSha,
      }
    : {
        kind: "url-observation" as const,
        url: discovery.url?.finalUrl ?? "unknown",
        observedAt: new Date().toISOString(),
      };

  const environment = {
    provider: "public-web",
    projectId: discovery.url?.host ?? discovery.repo?.repository ?? "unknown",
    environment: "production",
    ...(discovery.url ? { url: discovery.url.finalUrl } : {}),
  };

  const exclusions = [...discovery.graph.unknowns];
  const passport = createPassport({
    subject,
    release,
    environment,
    targetAssurance: "R1",
    contracts,
    evidence: discovery.evidence,
    exclusions,
    verifier: { name: "relyo-free-launch-verifier", version: "0.1.0" },
  });

  const blockers = results
    .filter((result) => result.status !== "PASS")
    .flatMap((result) =>
      result.assertions
        .filter((item) => item.status !== "PASS")
        .map((item) => item.message ?? item.description),
    );

  return {
    targetAssurance: "R1",
    achievedAssurance: passport.assurance,
    contracts,
    blockers,
    passport,
  };
}
