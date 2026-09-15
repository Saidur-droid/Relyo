import { describe, expect, it, vi } from "vitest";
import { VercelReadClient } from "../src/index.js";

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("VercelReadClient", () => {
  it("normalizes production evidence without retaining env values", async () => {
    const fakeFetch = vi.fn<typeof fetch>(async (input) => {
      const url = String(input);
      if (url.includes("/v9/projects/demo?") || url.endsWith("/v9/projects/demo")) {
        return jsonResponse({ id: "prj_1", name: "demo" });
      }
      if (url.includes("/v13/deployments")) {
        return jsonResponse({
          deployments: [
            {
              uid: "dpl_new",
              url: "demo-new.vercel.app",
              readyState: "READY",
              target: "production",
              createdAt: 20,
              meta: { githubCommitSha: "0123456789abcdef0123456789abcdef01234567" },
            },
            {
              uid: "dpl_old",
              url: "demo-old.vercel.app",
              readyState: "READY",
              target: "production",
              createdAt: 10,
              meta: { githubCommitSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
            },
          ],
        });
      }
      if (url.includes("/domains")) {
        return jsonResponse({ domains: [{ name: "demo.com", verified: true }] });
      }
      if (url.includes("/env")) {
        return jsonResponse({
          envs: [
            { key: "DATABASE_URL", value: "must-not-survive", type: "encrypted", target: ["production"] },
            { key: "PREVIEW_ONLY", value: "ignore", type: "plain", target: ["preview"] },
          ],
        });
      }
      return new Response("not found", { status: 404 });
    });

    const client = new VercelReadClient({ token: "test-token", fetchImpl: fakeFetch });
    const observation = await client.inspectProduction({ projectIdOrName: "demo" });

    expect(observation.productionDeployment?.id).toBe("dpl_new");
    expect(observation.productionDeployment?.gitCommitSha).toBe(
      "0123456789abcdef0123456789abcdef01234567",
    );
    expect(observation.rollback.ready).toBe(true);
    expect(observation.environmentKeys).toEqual([
      { key: "DATABASE_URL", targets: ["production"], type: "encrypted" },
    ]);
    expect(JSON.stringify(observation)).not.toContain("must-not-survive");
    expect(observation.domains[0]).toEqual({ name: "demo.com", verified: true });
  });

  it("does not call rollback ready without a prior READY production deployment", async () => {
    const fakeFetch = vi.fn<typeof fetch>(async (input) => {
      const url = String(input);
      if (url.includes("/v9/projects/demo?") || url.endsWith("/v9/projects/demo")) {
        return jsonResponse({ id: "prj_1", name: "demo" });
      }
      if (url.includes("/v13/deployments")) {
        return jsonResponse({
          deployments: [
            {
              uid: "dpl_only",
              url: "demo.vercel.app",
              readyState: "READY",
              target: "production",
              createdAt: 20,
              meta: { githubCommitSha: "0123456789abcdef0123456789abcdef01234567" },
            },
          ],
        });
      }
      if (url.includes("/domains")) return jsonResponse({ domains: [] });
      if (url.includes("/env")) return jsonResponse({ envs: [] });
      return new Response("not found", { status: 404 });
    });

    const client = new VercelReadClient({ token: "test-token", fetchImpl: fakeFetch });
    const observation = await client.inspectProduction({ projectIdOrName: "demo" });
    expect(observation.rollback.ready).toBe(false);
  });
});
