import type { RemediationAction, RemediationAdapter } from "@relyo/remediation";

type DeploymentState = {
  currentDeploymentId: string;
};

export interface VercelRemediationOptions {
  token: string;
  projectId: string;
  teamId?: string;
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
  verifyProduction: (action: RemediationAction) => Promise<"PASS" | "FAIL" | "UNKNOWN">;
}

function query(teamId?: string): string {
  return teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
}

async function requireOk(response: Response, operation: string): Promise<void> {
  if (response.ok) return;
  const body = await response.text();
  throw new Error(`Vercel remediation ${operation} failed with HTTP ${response.status}: ${body.slice(0, 500)}`);
}

export class VercelRemediationAdapter implements RemediationAdapter {
  private readonly fetchImpl: typeof fetch;
  private readonly baseUrl: string;

  constructor(private readonly options: VercelRemediationOptions) {
    if (!options.token.trim()) throw new Error("Vercel remediation token is required.");
    if (!options.projectId.trim()) throw new Error("Vercel remediation projectId is required.");
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.baseUrl = (options.apiBaseUrl ?? "https://api.vercel.com").replace(/\/$/, "");
  }

  async capture(action: RemediationAction): Promise<DeploymentState> {
    if (action.kind !== "vercel.redeploy") {
      throw new Error(`Unsupported Vercel remediation action: ${action.kind}`);
    }
    const current = String(action.desiredState.currentDeploymentId ?? "").trim();
    if (!/^dpl_[A-Za-z0-9]+$/.test(current)) {
      throw new Error("Vercel redeploy remediation requires currentDeploymentId for rollback.");
    }
    return { currentDeploymentId: current };
  }

  async apply(action: RemediationAction): Promise<void> {
    if (action.kind !== "vercel.redeploy") throw new Error("Unsupported Vercel remediation action.");
    const target = String(action.desiredState.targetDeploymentId ?? "").trim();
    if (!/^dpl_[A-Za-z0-9]+$/.test(target)) throw new Error("targetDeploymentId is required.");
    const response = await this.fetchImpl(
      `${this.baseUrl}/v10/projects/${encodeURIComponent(this.options.projectId)}/promote/${encodeURIComponent(target)}${query(this.options.teamId)}`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.options.token}`,
          "content-type": "application/json",
        },
      },
    );
    await requireOk(response, "promote");
  }

  async verify(action: RemediationAction): Promise<"PASS" | "FAIL" | "UNKNOWN"> {
    return await this.options.verifyProduction(action);
  }

  async rollback(action: RemediationAction, checkpoint: unknown): Promise<void> {
    if (action.kind !== "vercel.redeploy") throw new Error("Unsupported Vercel remediation action.");
    const state = checkpoint as Partial<DeploymentState>;
    const deploymentId = state.currentDeploymentId;
    if (!deploymentId || !/^dpl_[A-Za-z0-9]+$/.test(deploymentId)) {
      throw new Error("Rollback checkpoint is missing the previous production deployment.");
    }
    const response = await this.fetchImpl(
      `${this.baseUrl}/v1/projects/${encodeURIComponent(this.options.projectId)}/rollback/${encodeURIComponent(deploymentId)}${query(this.options.teamId)}`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.options.token}`,
          "content-type": "application/json",
        },
      },
    );
    await requireOk(response, "rollback");
  }
}
