import { describe, expect, it } from "vitest";
import { POST } from "../app/api/check/route";

function request(body: string) {
  return new Request("http://localhost/api/check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

describe("POST /api/check", () => {
  it("rejects malformed JSON", async () => {
    const response = await POST(request("{"));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Request body must be valid JSON.",
    });
  });

  it("requires at least one scan target", async () => {
    const response = await POST(request(JSON.stringify({})));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/public URL/i),
    });
  });

  it("rejects oversized input before any outbound request", async () => {
    const response = await POST(
      request(JSON.stringify({ url: `https://example.com/${"x".repeat(2100)}` })),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Input is too long.",
    });
  });
});
