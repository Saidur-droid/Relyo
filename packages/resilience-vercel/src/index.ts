import type {
  RecoveryStepResult,
  ResilienceDriver,
  ResilienceScenario,
} from "@relyo/resilience";

export interface VercelResilienceOptions {
  token: string;
  projectId: string;
  candidateDeploymentId: string;
  stableDeploymentId: string;
  teamId?: string;
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
  verifyDeployment: (deploymentId: string) => Promise<"PASS" | "FAIL" | "UNKNOWN">;
  now?: () => Date;
}

type Checkpoint = {
  stableDeploymentId: string;
};

function q(teamId?: string): string {
  return teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
}

async function requireOk(response: Response, action: string): Promise<void> {
  if (response.ok) return;
  const body = await response.text();
  throw new Error(`Vercel resilience ${action} failed with HTTP ${response.status}: ${body.slice(0, 500)}`);
}

function step(status: RecoveryStepResult["status"], now: () => Date, detail: string): RecoveryStepResult {
  const at = now().toISOString();
  return { status, startedAt: at, completedAt: at, detail };
}

export class VercelRollbackResilienceDriver implements ResilienceDriver {
  private readonly fetchImpl: typeof fetch;
  private readonly baseUrl: string;
  private readonly now: () => Date;

  constructor(private readonly options: VercelResilienceOptions) {
    if (!options.token.trim()) throw new Error("Vercel resilience token is required.");
    if (!/^prj_[A-Za-z0-9]+$/.test(options.projectId)) throw new Error("Invalid Vercel project id.");
    if (!/^dpl_[A-Za-z0-9]+$/.test(options.candidateDeploymentId)) throw new Error("Invalid candidate deployment id.");
    if (!/^dpl_[A-Za-z0-9]+$/.test(options.stableDeploymentId)) throw new Error("Invalid stable deployment id.");
    if (options.candidateDeploymentId === options.stableDeploymentId) throw new Error("Candidate and stable deployments must differ.");
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.baseUrl = (options.apiBaseUrl ?? "https://api.vercel.com").replace(/\/$/, "");
    this.now = options.now ?? (() => new Date());
  }

  async createCheckpoint(scenario: ResilienceScenario): Promise<Checkpoint> {
    if (scenario.kind !== "deployment-rollback") throw new Error("Vercel driver only supports deployment-rollback.");
    if (scenario.environment === "production" || scenario.destructivePotential) {
      throw new Error("Vercel resilience driver refuses production or destructive scenarios.");
    }
    return { stableDeploymentId: this.options.stableDeploymentId };
  }

  async injectFailure(scenario: ResilienceScenario): Promise<RecoveryStepResult> {
    const response = await this.fetchImpl(
      `${this.baseUrl}/v10/projects/${encodeURIComponent(this.options.projectId)}/promote/${encodeURIComponent(this.options.candidateDeploymentId)}${q(this.options.teamId)}`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.options.token}`,
          "content-type": "application/json",
        },
      },
    );
    await requireOk(response, "inject candidate");
    const observed = await this.options.verifyDeployment(this.options.candidateDeploymentId);
    return step(
      observed === "PASS" ? "PASS" : observed === "FAIL" ? "FAIL" : "UNKNOWN",
      this.now,
      `Candidate deployment observation: ${observed}.`,
    );
  }

  async recover(_scenario: ResilienceScenario): Promise<RecoveryStepResult> {
    const response = await this.fetchImpl(
      `${this.baseUrl}/v1/projects/${encodeURIComponent(this.options.projectId)}/rollback/${encodeURIComponent(this.options.stableDeploymentId)}${q(this.options.teamId)}`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.options.token}`,
          "content-type": "application/json",
        },
      },
    );
    await requireOk(response, "rollback");
    return step("PASS", this.now, "Rollback request completed.");
  }

  async verifyRecoveredOutcome(_scenario: ResilienceScenario): Promise<RecoveryStepResult> {
    const observed = await this.options.verifyDeployment(this.options.stableDeploymentId);
    return step(
      observed === "PASS" ? "PASS" : observed === "FAIL" ? "FAIL" : "UNKNOWN",
      this.now,
      `Stable deployment observation after rollback: ${observed}.`,
    );
  }

  async restoreCheckpoint(_scenario: ResilienceScenario, checkpoint: unknown): Promise<void> {
    const value = checkpoint as Partial<Checkpoint>;
    if (value.stableDeploymentId !== this.options.stableDeploymentId) {
      throw new Error("Resilience checkpoint does not match the declared stable deployment.");
    }
    const observed = await this.options.verifyDeployment(this.options.stableDeploymentId);
    if (observed === "PASS") return;
    const response = await this.fetchImpl(
      `${this.baseUrl}/v1/projects/${encodeURIComponent(this.options.projectId)}/rollback/${encodeURIComponent(this.options.stableDeploymentId)}${q(this.options.teamId)}`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.options.token}`,
          "content-type": "application/json",
        },
      },
    );
    await requireOk(response, "restore checkpoint");
  }
}
