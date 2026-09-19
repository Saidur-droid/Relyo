import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  findByToken: vi.fn(),
  bindRun: vi.fn(),
  execute: vi.fn(),
  safeUrl: vi.fn(),
}));
vi.mock("@/lib/server-services", () => ({
  proofApiKeyStore: () => ({
    findByToken: mocks.findByToken,
    bindRun: mocks.bindRun,
  }),
}));
vi.mock("@/lib/execute-launch-proof", () => ({
  executeLaunchProof: mocks.execute,
  LaunchProofPublicError: class LaunchProofPublicError extends Error {
    constructor(public status: number, public stage: string, message: string) { super(message); }
  },
}));
vi.mock("@relyo/discovery", () => ({ assertSafePublicUrl: mocks.safeUrl }));

import { POST } from "../app/api/v1/proof-runs/route";

function request(body: unknown, token = "rly_live_abcdefghijklmnopqrstuvwxyz") {
  return new NextRequest("https://relyo.example/api/v1/proof-runs", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => { vi.restoreAllMocks(); vi.resetAllMocks(); });

describe("Proof API request boundary", () => {
  it("rejects missing API authentication before proof execution", async () => {
    const response = await POST(new NextRequest("https://relyo.example/api/v1/proof-runs", {
      method: "POST", headers: { "content-type": "application/json" }, body: "{}",
    }));
    expect(response.status).toBe(401);
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it("uses provider connections bound to the API key and binds run ownership", async () => {
    mocks.findByToken.mockResolvedValue({
      id: "key_1",
      keySha256: "a".repeat(64),
      label: "CI",
      scopes: ["proof:run", "proof:read"],
      vercelConnectionId: "conn_v",
      supabaseConnectionId: "conn_s",
      createdAt: "2026-09-19T00:00:00Z",
    });
    mocks.execute.mockResolvedValue({
      project: { id: "p", name: "p" },
      supabaseProject: { id: "s", name: "s" },
      proof: {
        run: { id: "run_1", state: "VERIFIED" },
        blockers: [],
        signedPassport: { passport: { assurance: "R1" }, passportSha256: "b".repeat(64) },
      },
    });
    const response = await POST(request({ githubRepo: "owner/repo" }));
    expect(response.status).toBe(201);
    expect(mocks.execute).toHaveBeenCalledWith(expect.objectContaining({
      vercelConnectionId: "conn_v",
      supabaseConnectionId: "conn_s",
      githubRepo: "owner/repo",
    }));
    expect(mocks.bindRun).toHaveBeenCalledWith("key_1", "run_1");
  });

  it("rejects weak webhook secrets before any outbound call", async () => {
    mocks.findByToken.mockResolvedValue({
      id: "key_1", scopes: ["proof:run"], vercelConnectionId: "conn_v", createdAt: "x",
    });
    const response = await POST(request({
      githubRepo: "owner/repo",
      webhook: { url: "https://hooks.example", secret: "short" },
    }));
    expect(response.status).toBe(400);
    expect(mocks.execute).not.toHaveBeenCalled();
  });
});
