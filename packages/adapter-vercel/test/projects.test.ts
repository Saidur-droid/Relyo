import { describe, expect, it, vi } from "vitest";
import { listVercelProjects } from "../src/projects.js";

describe("listVercelProjects", () => {
  it("returns safe project selection metadata without provider credential data", async () => {
    const fakeFetch = vi.fn<typeof fetch>(async (_input, init) => {
      expect(init?.headers).toMatchObject({ authorization: "Bearer server-only-token" });
      return new Response(JSON.stringify({
        projects: [
          {
            id: "prj_1",
            name: "demo",
            accountId: "acct_1",
            framework: "nextjs",
            secret: "must-not-survive",
          },
        ],
      }), { status: 200, headers: { "content-type": "application/json" } });
    });

    const projects = await listVercelProjects({ token: "server-only-token", fetchImpl: fakeFetch });

    expect(projects).toEqual([
      { id: "prj_1", name: "demo", accountId: "acct_1", framework: "nextjs" },
    ]);
    expect(JSON.stringify(projects)).not.toContain("server-only-token");
    expect(JSON.stringify(projects)).not.toContain("must-not-survive");
  });
});
