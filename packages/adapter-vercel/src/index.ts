import { createEvidenceEnvelope, type EvidenceEnvelope } from "@relyo/kernel";

export interface VercelDeploymentEvidence {
  id: string;
  url: string;
  state: string;
  target: string | null;
  createdAt: number | null;
  readyAt: number | null;
  gitCommitSha: string | null;
}

export interface VercelDomainEvidence {
  name: string;
  verified: boolean;
}

export interface VercelEnvironmentKeyEvidence {
  key: string;
  targets: string[];
  type: string | null;
}

export interface VercelProductionObservation {
  provider: "vercel";
  projectId: string;
  projectName: string;
  productionDeployment: VercelDeploymentEvidence | null;
  previousReadyProductionDeployments: VercelDeploymentEvidence[];
  domains: VercelDomainEvidence[];
  environmentKeys: VercelEnvironmentKeyEvidence[];
  rollback: {
    promoteApiSupported: true;
    eligiblePreviousDeploymentCount: number;
    ready: boolean;
  };
  evidence: EvidenceEnvelope[];
}

export interface VercelReadClientOptions {
  token: string;
  teamId?: string;
  fetchImpl?: typeof fetch;
  apiBaseUrl?: string;
}

type VercelProjectResponse = {
  id: string;
  name: string;
};

type VercelDeploymentResponse = {
  uid?: string;
  id?: string;
  url?: string;
  state?: string;
  readyState?: string;
  target?: string | null;
  created?: number;
  createdAt?: number;
  ready?: number;
  readyAt?: number;
  meta?: Record<string, unknown>;
};

type VercelDeploymentsResponse = {
  deployments?: VercelDeploymentResponse[];
};

type VercelDomainResponse = {
  name?: string;
  verified?: boolean;
};

type VercelDomainsResponse = {
  domains?: VercelDomainResponse[];
};

type VercelEnvResponse = {
  key?: string;
  target?: string[] | string;
  type?: string;
};

type VercelEnvsResponse = {
  envs?: VercelEnvResponse[];
};

function gitCommitSha(meta: Record<string, unknown> | undefined): string | null {
  if (!meta) return null;
  for (const key of ["githubCommitSha", "gitlabCommitSha", "bitbucketCommitSha"]) {
    const value = meta[key];
    if (typeof value === "string" && /^[0-9a-f]{7,64}$/i.test(value)) return value;
  }
  return null;
}

function deploymentFromApi(input: VercelDeploymentResponse): VercelDeploymentEvidence | null {
  const id = input.uid ?? input.id;
  const url = input.url;
  if (!id || !url) return null;

  return {
    id,
    url,
    state: input.readyState ?? input.state ?? "UNKNOWN",
    target: input.target ?? null,
    createdAt: input.createdAt ?? input.created ?? null,
    readyAt: input.readyAt ?? input.ready ?? null,
    gitCommitSha: gitCommitSha(input.meta),
  };
}

function normalizeTarget(target: VercelEnvResponse["target"]): string[] {
  if (!target) return [];
  return Array.isArray(target) ? [...target].sort() : [target];
}

export class VercelReadClient {
  private readonly fetchImpl: typeof fetch;
  private readonly apiBaseUrl: string;

  constructor(private readonly options: VercelReadClientOptions) {
    if (!options.token.trim()) throw new Error("A Vercel credential is required.");
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.apiBaseUrl = options.apiBaseUrl ?? "https://api.vercel.com";
  }

  async inspectProduction(input: { projectIdOrName: string }): Promise<VercelProductionObservation> {
    const project = await this.getJson<VercelProjectResponse>(
      `/v9/projects/${encodeURIComponent(input.projectIdOrName)}`,
    );

    const [deploymentsResponse, domainsResponse, envsResponse] = await Promise.all([
      this.getJson<VercelDeploymentsResponse>(
        `/v6/deployments?projectId=${encodeURIComponent(project.id)}&target=production&limit=10`,
      ),
      this.getJson<VercelDomainsResponse>(
        `/v9/projects/${encodeURIComponent(project.id)}/domains`,
      ),
      this.getJson<VercelEnvsResponse>(
        `/v10/projects/${encodeURIComponent(project.id)}/env`,
      ),
    ]);

    const deployments = (deploymentsResponse.deployments ?? [])
      .map(deploymentFromApi)
      .filter((item): item is VercelDeploymentEvidence => Boolean(item))
      .filter((item) => item.target === "production" || item.target === null)
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

    const readyDeployments = deployments.filter((item) => item.state === "READY");
    const productionDeployment = readyDeployments[0] ?? deployments[0] ?? null;
    const previousReadyProductionDeployments = productionDeployment
      ? readyDeployments.filter((item) => item.id !== productionDeployment.id)
      : [];

    const domains = (domainsResponse.domains ?? [])
      .filter((item): item is Required<Pick<VercelDomainResponse, "name">> & VercelDomainResponse => Boolean(item.name))
      .map((item) => ({ name: item.name, verified: item.verified === true }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const environmentKeys = (envsResponse.envs ?? [])
      .filter((item): item is Required<Pick<VercelEnvResponse, "key">> & VercelEnvResponse => Boolean(item.key))
      .map((item) => ({
        key: item.key,
        targets: normalizeTarget(item.target),
        type: item.type ?? null,
      }))
      .filter((item) => item.targets.includes("production"))
      .sort((a, b) => a.key.localeCompare(b.key));

    const rollback = {
      promoteApiSupported: true as const,
      eligiblePreviousDeploymentCount: previousReadyProductionDeployments.length,
      ready: Boolean(productionDeployment && previousReadyProductionDeployments.length > 0),
    };

    const providerPayload = {
      projectId: project.id,
      projectName: project.name,
      productionDeployment,
      previousReadyProductionDeployments,
      domains,
      environmentKeys,
      rollback,
    };

    const evidence = [
      createEvidenceEnvelope({
        kind: "vercel-production-observation",
        source: `vercel:project:${project.id}`,
        payload: providerPayload,
        redacted: true,
        summary: {
          projectId: project.id,
          productionDeploymentReady: productionDeployment?.state === "READY",
          releaseCommitObserved: Boolean(productionDeployment?.gitCommitSha),
          domainCount: domains.length,
          productionEnvironmentKeyCount: environmentKeys.length,
          rollbackReady: rollback.ready,
        },
      }),
    ];

    return {
      provider: "vercel",
      projectId: project.id,
      projectName: project.name,
      productionDeployment,
      previousReadyProductionDeployments,
      domains,
      environmentKeys,
      rollback,
      evidence,
    };
  }

  private async getJson<T>(path: string): Promise<T> {
    const separator = path.includes("?") ? "&" : "?";
    const teamQuery = this.options.teamId
      ? `${separator}teamId=${encodeURIComponent(this.options.teamId)}`
      : "";
    const response = await this.fetchImpl(`${this.apiBaseUrl}${path}${teamQuery}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${this.options.token}`,
        accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("Vercel credential is invalid or lacks read access to this project.");
    }
    if (response.status === 404) throw new Error("Vercel project was not found.");
    if (!response.ok) throw new Error(`Vercel API returned HTTP ${response.status}.`);
    return await response.json() as T;
  }
}
