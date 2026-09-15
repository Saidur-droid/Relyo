export interface VercelProjectSummary {
  id: string;
  name: string;
  accountId: string | null;
  framework: string | null;
}

export interface ListVercelProjectsOptions {
  token: string;
  teamId?: string;
  limit?: number;
  fetchImpl?: typeof fetch;
  apiBaseUrl?: string;
}

type VercelProjectApi = {
  id?: string;
  name?: string;
  accountId?: string;
  framework?: string | null;
};

type VercelProjectsResponse = {
  projects?: VercelProjectApi[];
};

export async function listVercelProjects(options: ListVercelProjectsOptions): Promise<VercelProjectSummary[]> {
  if (!options.token.trim()) throw new Error("A Vercel credential is required.");
  const fetchImpl = options.fetchImpl ?? fetch;
  const apiBaseUrl = options.apiBaseUrl ?? "https://api.vercel.com";
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const query = new URLSearchParams({ limit: String(limit) });
  if (options.teamId) query.set("teamId", options.teamId);

  const response = await fetchImpl(`${apiBaseUrl}/v9/projects?${query.toString()}`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${options.token}`,
      accept: "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Vercel credential is invalid or lacks project read access.");
  }
  if (!response.ok) throw new Error(`Vercel API returned HTTP ${response.status}.`);

  const data = await response.json() as VercelProjectsResponse;
  return (data.projects ?? [])
    .filter((project): project is Required<Pick<VercelProjectApi, "id" | "name">> & VercelProjectApi =>
      Boolean(project.id && project.name),
    )
    .map((project) => ({
      id: project.id,
      name: project.name,
      accountId: project.accountId ?? null,
      framework: project.framework ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
