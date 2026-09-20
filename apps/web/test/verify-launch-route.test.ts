import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  save: vi.fn(),
  decrypt: vi.fn(),
  list: vi.fn(),
  discover: vi.fn(),
  inspect: vi.fn(),
  executePublic: vi.fn(),
  executeVercel: vi.fn(),
  executeSupabase: vi.fn(),
  executeCombined: vi.fn(),
  signing: vi.fn(),
}));

vi.mock("@/lib/server-services", () => ({
  credentialServices: () => ({
    store: { get: mocks.get, save: mocks.save },
    cipher: { decrypt: mocks.decrypt },
  }),
  hasVercelProviderReadToken: () => true,
  vercelProviderReadToken: () => "server-only-sentinel",
  passportSigningPrivateKeyPem: mocks.signing,
  proofStore: () => ({}),
}));

vi.mock("@relyo/adapter-vercel/projects", () => ({ listVercelProjects: mocks.list }));
vi.mock("@relyo/adapter-vercel", () => ({
  VercelReadClient: class { inspectProduction = mocks.inspect; },
}));
vi.mock("@relyo/adapter-supabase", () => ({
  SupabaseReadClient: class { inspectProduction = mocks.inspect; },
}));
vi.mock("@relyo/discovery", () => ({ discoverApplication: mocks.discover }));
vi.mock("@relyo/proof-engine", () => ({
  executePublicR1Proof: mocks.executePublic,
  executeVercelR1Proof: mocks.executeVercel,
  executeSupabaseAugmentedR1Proof: mocks.executeSupabase,
  executeCombinedR1Proof: mocks.executeCombined,
}));

import { POST } from "../app/api/verify-launch/route";

function request(
  body: unknown,
  origin = "https://relyo.example",
  cookies = "",
) {
  return new NextRequest("https://relyo.example/api/verify-launch", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      origin,
      "content-type": "application/json",
      ...(cookies ? { cookie: cookies } : {}),
    },
  });
}

function executedProof() {
  return {
    run: { id: "run_1", state: "PARTIAL", targetAssurance: "R1" },
    blockers: ["Provider evidence is still required."],
    signedPassport: {
      passportSha256: "a".repeat(64),
      signature: { algorithm: "Ed25519", keyId: "test", valueBase64: "sig" },
      passport: { assurance: "R0" },
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
});

describe("launch proof request boundary", () => {
  it("rejects cross-origin calls before discovery or credential access", async () => {
    expect((await POST(request({ githubRepo: "owner/repo" }, "https://attacker.example"))).status).toBe(403);
    expect(mocks.discover).not.toHaveBeenCalled();
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it.each([null, [], "invalid", 42])("rejects a non-object JSON body: %j", async (body) => {
    expect((await POST(request(body))).status).toBe(400);
    expect(mocks.discover).not.toHaveBeenCalled();
  });

  it("runs a signed provider-neutral proof without requiring Vercel or Supabase", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    mocks.discover.mockResolvedValue({ evidence: [] });
    mocks.signing.mockReturnValue("test-key");
    mocks.executePublic.mockResolvedValue(executedProof());

    const response = await POST(request({ githubRepo: "owner/repo", url: "https://app.example.com" }));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.providerMode).toBe("public");
    expect(payload.project).toBeNull();
    expect(payload.supabaseProject).toBeNull();
    expect(mocks.executePublic).toHaveBeenCalledOnce();
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it("uses Vercel only when a Vercel connection is present", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    mocks.discover.mockResolvedValue({});
    mocks.signing.mockReturnValue("test-key");
    mocks.get.mockResolvedValue({
      provider: "vercel",
      boundProjectId: "prj_1",
      credential: "encrypted",
    });
    mocks.decrypt.mockReturnValue({ accessToken: "oauth-sensitive-sentinel" });
    mocks.list.mockResolvedValue([{ id: "prj_1" }]);
    mocks.inspect.mockResolvedValue({ projectId: "prj_1", projectName: "demo" });
    mocks.executeVercel.mockResolvedValue(executedProof());

    const response = await POST(request(
      { githubRepo: "owner/repo" },
      "https://relyo.example",
      "relyo_vercel_connection=test-connection",
    ));

    expect(response.status).toBe(200);
    expect((await response.json()).providerMode).toBe("vercel");
    expect(mocks.executeVercel).toHaveBeenCalledOnce();
    expect(mocks.executePublic).not.toHaveBeenCalled();
  });

  it.each(["vercel-connection", "proof-persistence"])("does not leak raw errors at %s", async (stage) => {
    const privateValue = "opaque-sensitive-sentinel-8f31";
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    mocks.discover.mockResolvedValue({});
    mocks.signing.mockReturnValue("test-key");

    if (stage === "vercel-connection") {
      mocks.get.mockRejectedValue(new Error(privateValue));
    } else {
      mocks.get.mockResolvedValue({
        provider: "vercel",
        boundProjectId: "prj_1",
        credential: "encrypted",
      });
      mocks.decrypt.mockReturnValue({ accessToken: "oauth-sensitive-sentinel" });
      mocks.list.mockResolvedValue([{ id: "prj_1" }]);
      mocks.inspect.mockResolvedValue({ projectId: "prj_1", projectName: "demo" });
      mocks.executeVercel.mockRejectedValue(new Error(privateValue));
    }

    const response = await POST(request(
      { githubRepo: "owner/repo" },
      "https://relyo.example",
      "relyo_vercel_connection=test-connection",
    ));
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ error: `Relyo could not complete R1 ${stage}.` });
    expect(log).toHaveBeenCalledWith(JSON.stringify({ type: "relyo_verify_launch_error", stage }));
    expect(JSON.stringify(log.mock.calls)).not.toContain(privateValue);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
