import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  get: vi.fn(), decrypt: vi.fn(), list: vi.fn(), discover: vi.fn(),
  inspect: vi.fn(), execute: vi.fn(), signing: vi.fn(),
}));
vi.mock("@/lib/server-services", () => ({
  credentialServices: () => ({ store: { get: mocks.get }, cipher: { decrypt: mocks.decrypt } }),
  hasVercelProviderReadToken: () => true,
  vercelProviderReadToken: () => "server-only-sentinel",
  passportSigningPrivateKeyPem: mocks.signing,
  proofStore: () => ({}),
}));
vi.mock("@relyo/adapter-vercel/projects", () => ({ listVercelProjects: mocks.list }));
vi.mock("@relyo/adapter-vercel", () => ({
  VercelReadClient: class { inspectProduction = mocks.inspect; },
}));
vi.mock("@relyo/discovery", () => ({ discoverApplication: mocks.discover }));
vi.mock("@relyo/proof-engine", () => ({ executeVercelR1Proof: mocks.execute }));

import { POST } from "../app/api/verify-launch/route";

function request(body: unknown, origin = "https://relyo.example", connected = true) {
  return new NextRequest("https://relyo.example/api/verify-launch", {
    method: "POST", body: JSON.stringify(body),
    headers: {
      origin, "content-type": "application/json",
      ...(connected ? { cookie: "relyo_vercel_connection=test-connection" } : {}),
    },
  });
}

afterEach(() => { vi.restoreAllMocks(); vi.resetAllMocks(); });

describe("launch proof request boundary", () => {
  it("rejects cross-origin and unauthenticated calls before accessing credentials", async () => {
    expect((await POST(request({}, "https://attacker.example"))).status).toBe(403);
    expect((await POST(request({}, "https://relyo.example", false))).status).toBe(401);
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it.each([null, [], "invalid", 42])("rejects a non-object JSON body: %j", async (body) => {
    expect((await POST(request(body))).status).toBe(400);
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it.each(["connection", "proof-persistence"])("does not leak raw errors at %s", async (stage) => {
    const privateValue = "opaque-sensitive-sentinel-8f31";
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    if (stage === "connection") {
      mocks.get.mockRejectedValue(new Error(privateValue));
    } else {
      mocks.get.mockResolvedValue({ provider: "vercel", boundProjectId: "prj_1" });
      mocks.decrypt.mockReturnValue({ accessToken: "oauth-sensitive-sentinel" });
      mocks.list.mockResolvedValue([{ id: "prj_1" }]);
      mocks.discover.mockResolvedValue({});
      mocks.inspect.mockResolvedValue({ projectId: "prj_1" });
      mocks.execute.mockRejectedValue(new Error(privateValue));
    }
    const response = await POST(request({ githubRepo: "owner/repo" }));
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ error: `Relyo could not complete R1 ${stage}.` });
    expect(log).toHaveBeenCalledWith(JSON.stringify({ type: "relyo_verify_launch_error", stage }));
    expect(JSON.stringify(log.mock.calls)).not.toContain(privateValue);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
