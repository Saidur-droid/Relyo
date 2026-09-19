import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const port = Number(process.env.PORT || 3000);
const usersByEmail = new Map();
const sessions = new Map();
const resilience = new Map();

function html(body, status = 200, headers = {}) {
  return {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
    body: `<!doctype html><html><head><meta charset="utf-8"><title>Relyo Qualification Fixture</title></head><body>${body}</body></html>`,
  };
}

function json(value, status = 200, headers = {}) {
  return {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
    body: JSON.stringify(value),
  };
}

function redirect(location, headers = {}) {
  return { status: 303, headers: { location, "cache-control": "no-store", ...headers }, body: "" };
}

function cookies(req) {
  const raw = req.headers.cookie || "";
  const out = {};
  for (const item of raw.split(";")) {
    const index = item.indexOf("=");
    if (index <= 0) continue;
    out[item.slice(0, index).trim()] = decodeURIComponent(item.slice(index + 1).trim());
  }
  return out;
}

function sessionUser(req) {
  const sid = cookies(req).sid;
  if (!sid) return null;
  const email = sessions.get(sid);
  if (!email) return null;
  return usersByEmail.get(email) || null;
}

async function readForm(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString("utf8");
  return new URLSearchParams(body);
}

function setSession(email) {
  const sid = randomUUID();
  sessions.set(sid, email);
  return `sid=${encodeURIComponent(sid)}; Path=/; HttpOnly; SameSite=Lax`;
}

function clearSession(req) {
  const sid = cookies(req).sid;
  if (sid) sessions.delete(sid);
  return "sid=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
}

function dashboard(user) {
  return html(`
    <main>
      <h1>Qualification Dashboard</h1>
      <p id="auth-state">authenticated</p>
      <p id="identity-state">${user.verified ? "verified" : "unverified"}</p>
      <p id="resource-state">${user.resourceCreated ? "resource-created" : "resource-missing"}</p>
      <p id="core-state">${user.coreCompleted ? "core-completed" : "core-pending"}</p>
      <form method="post" action="/resource"><button id="create-resource" type="submit">Create primary resource</button></form>
      <form method="post" action="/core"><button id="run-core" type="submit">Run core action</button></form>
      <form method="post" action="/logout"><button id="logout" type="submit">Logout</button></form>
      <form method="post" action="/cleanup"><button id="cleanup" type="submit">Cleanup synthetic user</button></form>
    </main>
  `);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const method = req.method || "GET";

    let response;

    if (method === "GET" && url.pathname === "/health") {
      response = json({
        ok: true,
        service: "relyo-qualification-fixture",
        release: process.env.RENDER_GIT_COMMIT || process.env.GITHUB_SHA || "unknown",
        now: new Date().toISOString(),
      });
    } else if (method === "GET" && url.pathname === "/") {
      response = html(`<main><h1>Relyo Qualification Fixture</h1><a id="start" href="/signup">Start synthetic journey</a></main>`);
    } else if (method === "GET" && url.pathname === "/signup") {
      response = html(`
        <main>
          <h1>Sign up</h1>
          <form method="post" action="/signup">
            <label>Email <input id="email" name="email" type="email" required></label>
            <button id="signup-submit" type="submit">Create account</button>
          </form>
        </main>
      `);
    } else if (method === "POST" && url.pathname === "/signup") {
      const form = await readForm(req);
      const email = String(form.get("email") || "").trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        response = html("<main><h1>Invalid email</h1></main>", 400);
      } else if (usersByEmail.has(email)) {
        response = html("<main><h1>Account already exists</h1></main>", 409);
      } else {
        usersByEmail.set(email, {
          email,
          verified: false,
          resourceCreated: false,
          coreCompleted: false,
        });
        response = redirect("/verify", { "set-cookie": setSession(email) });
      }
    } else if (method === "GET" && url.pathname === "/verify") {
      const user = sessionUser(req);
      response = user
        ? html(`
            <main>
              <h1>Verify identity</h1>
              <p id="verify-state">${user.verified ? "verified" : "verification-required"}</p>
              <form method="post" action="/verify"><button id="verify-submit" type="submit">Verify synthetic identity</button></form>
            </main>
          `)
        : redirect("/login");
    } else if (method === "POST" && url.pathname === "/verify") {
      const user = sessionUser(req);
      if (!user) response = redirect("/login");
      else {
        user.verified = true;
        response = redirect("/dashboard");
      }
    } else if (method === "GET" && url.pathname === "/dashboard") {
      const user = sessionUser(req);
      response = user?.verified ? dashboard(user) : redirect("/login");
    } else if (method === "POST" && url.pathname === "/resource") {
      const user = sessionUser(req);
      if (!user?.verified) response = redirect("/login");
      else {
        user.resourceCreated = true;
        response = redirect("/dashboard");
      }
    } else if (method === "POST" && url.pathname === "/core") {
      const user = sessionUser(req);
      if (!user?.verified) response = redirect("/login");
      else if (!user.resourceCreated) response = html("<main><h1>Primary resource required</h1></main>", 409);
      else {
        user.coreCompleted = true;
        response = redirect("/dashboard");
      }
    } else if (method === "POST" && url.pathname === "/logout") {
      response = redirect("/login", { "set-cookie": clearSession(req) });
    } else if (method === "GET" && url.pathname === "/login") {
      response = html(`
        <main>
          <h1>Login</h1>
          <form method="post" action="/login">
            <label>Email <input id="login-email" name="email" type="email" required></label>
            <button id="login-submit" type="submit">Login</button>
          </form>
        </main>
      `);
    } else if (method === "POST" && url.pathname === "/login") {
      const form = await readForm(req);
      const email = String(form.get("email") || "").trim().toLowerCase();
      const user = usersByEmail.get(email);
      response = user?.verified
        ? redirect("/dashboard", { "set-cookie": setSession(email) })
        : html("<main><h1>Unknown or unverified account</h1></main>", 401);
    } else if (method === "POST" && url.pathname === "/cleanup") {
      const user = sessionUser(req);
      if (user) usersByEmail.delete(user.email);
      response = redirect("/signup", { "set-cookie": clearSession(req) });
    } else if (method === "POST" && url.pathname === "/api/resilience/start") {
      const id = `r3_${randomUUID()}`;
      resilience.set(id, { failed: false, recoveryCount: 0 });
      response = json({ id, healthy: true }, 201);
    } else if (method === "POST" && /^\/api\/resilience\/[^/]+\/inject$/.test(url.pathname)) {
      const id = url.pathname.split("/")[3];
      const item = resilience.get(id);
      if (!item) response = json({ error: "not found" }, 404);
      else {
        item.failed = true;
        response = json({ id, healthy: false, injected: true });
      }
    } else if (method === "POST" && /^\/api\/resilience\/[^/]+\/recover$/.test(url.pathname)) {
      const id = url.pathname.split("/")[3];
      const item = resilience.get(id);
      if (!item) response = json({ error: "not found" }, 404);
      else {
        item.failed = false;
        item.recoveryCount += 1;
        response = json({ id, healthy: true, recovered: true, recoveryCount: item.recoveryCount });
      }
    } else if (method === "GET" && /^\/api\/resilience\/[^/]+\/verify$/.test(url.pathname)) {
      const id = url.pathname.split("/")[3];
      const item = resilience.get(id);
      response = item
        ? json({ id, healthy: !item.failed, recoveryCount: item.recoveryCount })
        : json({ error: "not found" }, 404);
    } else if (method === "DELETE" && /^\/api\/resilience\/[^/]+$/.test(url.pathname)) {
      const id = url.pathname.split("/")[3];
      const deleted = resilience.delete(id);
      response = json({ id, deleted });
    } else {
      response = html("<main><h1>Not found</h1></main>", 404);
    }

    res.writeHead(response.status, response.headers);
    res.end(response.body);
  } catch (error) {
    res.writeHead(500, { "content-type": "application/json", "cache-control": "no-store" });
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : "internal error" }));
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(JSON.stringify({ type: "fixture_started", port }));
});
