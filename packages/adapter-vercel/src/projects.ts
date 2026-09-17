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

type VercelTeamApi = {
  id?: string;
};

type VercelTeamsResponse = {
  teams?: VercelTeamApi[];
};

function normalizeProjects(projects: VercelProjectApi[]): VercelProjectSummary[] {
  return projects
    .filter((project): project is Required<Pick<VercelProjectApi, "id" | "name">> & VercelProjectApi =>
      Boolean(project.id && project.name),
    )
    .map((project) => ({
      id: project.id,
      name: project.name,
      accountId: project.accountId ?? null,
      framework: project.framework ?? null,
    }));
}

export async function listVercelProjects(options: ListVercelProjectsOptions): Promise<VercelProjectSummary[]> {
  if (!options.token.trim()) throw new Error("A Vercel credential is required.");
  const fetchImpl = options.fetchImpl ?? fetch;
  const apiBaseUrl = options.apiBaseUrl ?? "https://api.vercel.com";
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const headers = {
    authorization: `Bearer ${options.token}`,
    accept: "application/json",
  };

  async function fetchProjects(teamId?: string): Promise<VercelProjectSummary[]> {
    const query = new URLSearchParams({ limit: String(limit) });
    if (teamId) query.set("teamId", teamId);
    const response = await fetchImpl(`${apiBaseUrl}/v9/projects?${query.toString()}`, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return [];
    const data = await response.json() as VercelProjectsResponse;
    return normalizeProjects(data.projects ?? []);
  }

  const collected = new Map<string, VercelProjectSummary>();
  const add = (items: VercelProjectSummary[]) => {
    for (const item of items) collected.set(item.id, item);
  };

  // First try the stored team context, then the user context.
  if (options.teamId) add(await fetchProjects(options.teamId));
  add(await fetchProjects());

  // OAuth connections may authenticate the user while projects live under a team.
  // Discover every accessible team and enumerate its projects instead of assuming one team id.
  const teamsResponse = await fetchImpl(`${apiBaseUrl}/v2/teams?limit=100`, {
    method: "GET",
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  }).catch(() => null);

  if (teamsResponse?.ok) {
    const teams = await teamsResponse.json() as VercelTeamsResponse;
    for (const team of teams.teams ?? []) {
      if (team.id) add(await fetchProjects(team.id));
    }
  }

  return [...collected.values()].sort((a, b) => a.name.localeCompare(b.name));
}
