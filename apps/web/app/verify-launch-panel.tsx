"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type VercelProject = { id: string; name: string; framework: string | null };
type SupabaseProject = { id: string; name: string; region: string | null; status: string | null };
type ProjectsResponse<T> = {
  projects?: T[];
  boundProject?: { id: string; name: string } | null;
  error?: string;
};

type ProofResponse = {
  project?: { id: string; name: string };
  supabaseProject?: { id: string; name: string } | null;
  run?: { id: string; state: string; targetAssurance: string; completedAt?: string };
  blockers?: string[];
  signedPassport?: {
    passportSha256: string;
    signature: { algorithm: string; keyId: string; valueBase64: string };
    passport: {
      id: string;
      assurance: string;
      targetAssurance: string;
      issuedAt: string;
      results: Array<{
        contractId: string;
        status: "PASS" | "FAIL" | "PARTIAL" | "UNKNOWN";
        assertions: Array<{ description: string; status: string; message?: string }>;
      }>;
      exclusions: string[];
    };
  };
  error?: string;
};

function ResultPill({ status }: { status: string }) {
  return <span className={`status status-${status.toLowerCase()}`}>{status}</span>;
}

export function VerifyLaunchPanel() {
  const [projects, setProjects] = useState<VercelProject[]>([]);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [boundProject, setBoundProject] = useState<{ id: string; name: string } | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [binding, setBinding] = useState(false);

  const [supabaseProjects, setSupabaseProjects] = useState<SupabaseProject[]>([]);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  const [selectedSupabaseProjectId, setSelectedSupabaseProjectId] = useState("");
  const [boundSupabaseProject, setBoundSupabaseProject] = useState<{ id: string; name: string } | null>(null);
  const [loadingSupabaseProjects, setLoadingSupabaseProjects] = useState(false);
  const [bindingSupabase, setBindingSupabase] = useState(false);

  const [url, setUrl] = useState("");
  const [repo, setRepo] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [proof, setProof] = useState<ProofResponse | null>(null);

  async function loadProjects() {
    setLoadingProjects(true);
    try {
      const response = await fetch("/api/vercel/projects", { cache: "no-store" });
      const payload = (await response.json()) as ProjectsResponse<VercelProject>;
      if (response.status === 401) {
        setConnected(false);
        setProjects([]);
        setBoundProject(null);
        return;
      }
      if (!response.ok) {
        setConnected(false);
        setMessage(payload.error ?? "Relyo could not load Vercel projects.");
        return;
      }
      setConnected(true);
      setProjects(payload.projects ?? []);
      setBoundProject(payload.boundProject ?? null);
      setSelectedProjectId(payload.boundProject?.id ?? payload.projects?.[0]?.id ?? "");
    } catch {
      setConnected(false);
      setMessage("Relyo could not read the current Vercel connection.");
    } finally {
      setLoadingProjects(false);
    }
  }

  async function loadSupabaseProjects() {
    setLoadingSupabaseProjects(true);
    try {
      const response = await fetch("/api/supabase/projects", { cache: "no-store" });
      const payload = (await response.json()) as ProjectsResponse<SupabaseProject>;
      if (response.status === 401) {
        setSupabaseConnected(false);
        setSupabaseProjects([]);
        setBoundSupabaseProject(null);
        return;
      }
      if (!response.ok) {
        setSupabaseConnected(false);
        setMessage(payload.error ?? "Relyo could not load Supabase projects.");
        return;
      }
      setSupabaseConnected(true);
      setSupabaseProjects(payload.projects ?? []);
      setBoundSupabaseProject(payload.boundProject ?? null);
      setSelectedSupabaseProjectId(payload.boundProject?.id ?? payload.projects?.[0]?.id ?? "");
    } catch {
      setSupabaseConnected(false);
      setMessage("Relyo could not read the current Supabase connection.");
    } finally {
      setLoadingSupabaseProjects(false);
    }
  }

  useEffect(() => {
    void Promise.all([loadProjects(), loadSupabaseProjects()]);
  }, []);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId),
    [projects, selectedProjectId],
  );
  const selectedSupabaseProject = useMemo(
    () => supabaseProjects.find((project) => project.id === selectedSupabaseProjectId),
    [supabaseProjects, selectedSupabaseProjectId],
  );

  async function bindProject() {
    if (!selectedProjectId) return;
    setBinding(true);
    setMessage("");
    setProof(null);
    try {
      const response = await fetch("/api/vercel/project", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId }),
      });
      const payload = (await response.json()) as { project?: VercelProject; error?: string };
      if (!response.ok || !payload.project) {
        setMessage(payload.error ?? "Relyo could not bind that Vercel project.");
        return;
      }
      setBoundProject({ id: payload.project.id, name: payload.project.name });
      setMessage(`${payload.project.name} is bound for read-only launch verification.`);
    } catch {
      setMessage("Relyo could not bind that Vercel project.");
    } finally {
      setBinding(false);
    }
  }

  async function bindSupabaseProject() {
    if (!selectedSupabaseProjectId) return;
    setBindingSupabase(true);
    setMessage("");
    setProof(null);
    try {
      const response = await fetch("/api/supabase/project", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId: selectedSupabaseProjectId }),
      });
      const payload = (await response.json()) as { project?: SupabaseProject; error?: string };
      if (!response.ok || !payload.project) {
        setMessage(payload.error ?? "Relyo could not bind that Supabase project.");
        return;
      }
      setBoundSupabaseProject({ id: payload.project.id, name: payload.project.name });
      setMessage(`${payload.project.name} is bound for read-only Supabase verification.`);
    } catch {
      setMessage("Relyo could not bind that Supabase project.");
    } finally {
      setBindingSupabase(false);
    }
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!boundProject) return;
    setVerifying(true);
    setProof(null);
    setMessage("");
    try {
      const response = await fetch("/api/verify-launch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url: url.trim() || undefined,
          githubRepo: repo.trim() || undefined,
        }),
      });
      const payload = (await response.json()) as ProofResponse;
      if (!response.ok) {
        setMessage(payload.error ?? "Launch proof could not complete.");
        return;
      }
      setProof(payload);
    } catch {
      setMessage("Launch proof could not complete. No provider credential was exposed to the browser.");
    } finally {
      setVerifying(false);
    }
  }

  const passport = proof?.signedPassport?.passport;

  return (
    <section className="verifyShell" id="verify-launch">
      <div className="verifyIntro">
        <span className="sectionKicker">Verify My Launch</span>
        <h2>Turn public discovery into provider-backed proof.</h2>
        <p>
          Relyo connects to Vercel and Supabase through OAuth, stores provider credentials encrypted on the server,
          binds explicit production projects, and signs one evidence-backed Production Passport.
        </p>
        <div className="securityStrip">
          <span>Read-only</span><span>PKCE + state</span><span>Encrypted credentials</span><span>Signed Passport</span>
        </div>
      </div>

      <div className="verifyFlow">
        <article className="verifyStep">
          <div className="stepTop"><span>01</span><strong>Connect Vercel</strong></div>
          {connected ? (
            <div className="stepReady">Connected server-side. Provider tokens stay out of browser-readable storage.</div>
          ) : (
            <a className="primaryLink" href="/api/vercel/connect">Connect Vercel securely</a>
          )}
          {loadingProjects && <small>Checking Vercel connection…</small>}
        </article>

        <article className="verifyStep">
          <div className="stepTop"><span>02</span><strong>Bind Vercel project</strong></div>
          {connected && projects.length > 0 ? (
            <>
              <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)}>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}{project.framework ? ` — ${project.framework}` : ""}
                  </option>
                ))}
              </select>
              <button className="secondaryButton" type="button" onClick={bindProject} disabled={binding || !selectedProjectId}>
                {binding ? "Binding…" : boundProject?.id === selectedProjectId ? "Re-bind selected project" : "Use this project"}
              </button>
              {boundProject && <small>Bound: {boundProject.name}</small>}
            </>
          ) : connected && !loadingProjects ? (
            <small>No accessible Vercel projects were returned for this connection.</small>
          ) : (
            <small>Connect Vercel first. Project access is read-only.</small>
          )}
        </article>

        <article className="verifyStep">
          <div className="stepTop"><span>03</span><strong>Connect + bind Supabase</strong></div>
          {supabaseConnected ? (
            <div className="stepReady">Supabase connected server-side with encrypted credentials.</div>
          ) : (
            <a className="primaryLink" href="/api/supabase/connect">Connect Supabase securely</a>
          )}
          {loadingSupabaseProjects && <small>Checking Supabase connection…</small>}
          {supabaseConnected && supabaseProjects.length > 0 && (
            <>
              <select value={selectedSupabaseProjectId} onChange={(event) => setSelectedSupabaseProjectId(event.target.value)}>
                {supabaseProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}{project.region ? ` — ${project.region}` : ""}{project.status ? ` — ${project.status}` : ""}
                  </option>
                ))}
              </select>
              <button className="secondaryButton" type="button" onClick={bindSupabaseProject} disabled={bindingSupabase || !selectedSupabaseProjectId}>
                {bindingSupabase ? "Binding…" : boundSupabaseProject?.id === selectedSupabaseProjectId ? "Re-bind selected project" : "Use this Supabase project"}
              </button>
              {boundSupabaseProject && <small>Bound: {boundSupabaseProject.name}</small>}
            </>
          )}
          {supabaseConnected && !loadingSupabaseProjects && supabaseProjects.length === 0 && (
            <small>No accessible Supabase projects were returned for this connection.</small>
          )}
        </article>

        <article className="verifyStep verifyRunStep">
          <div className="stepTop"><span>04</span><strong>Run deterministic R1 proof</strong></div>
          <form onSubmit={verify} className="verifyForm">
            <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Production URL — yourapp.com" inputMode="url" />
            <input value={repo} onChange={(event) => setRepo(event.target.value)} placeholder="Public GitHub repo — owner/repo" autoComplete="off" />
            <button type="submit" disabled={!boundProject || verifying || (!url.trim() && !repo.trim())}>
              {verifying ? "Verifying release evidence…" : "Verify my launch"}
            </button>
          </form>
          <small>
            Vercel is required. If Supabase is connected and bound, Relyo adds Auth, backup, read-only RLS, and browser-secret checks to the same signed Passport.
          </small>
        </article>
      </div>

      {message && <div className="verifyMessage">{message}</div>}

      {passport && proof?.run && proof.signedPassport && (
        <div className="launchProofResult">
          <div className="launchProofHead">
            <div>
              <span className="sectionKicker">Signed Production Passport</span>
              <h3>{passport.assurance === "R1" ? "R1 — Launch Verified" : `${passport.assurance} — Launch proof blocked`}</h3>
              <p>
                Run {proof.run.id} is bound to the selected Vercel project
                {proof.supabaseProject ? ` and Supabase project ${proof.supabaseProject.name}` : ""} and persisted through the ProofStore.
              </p>
            </div>
            <div className="assuranceBadge">{passport.assurance}</div>
          </div>

          <div className="contractList">
            {passport.results.map((result) => (
              <article key={result.contractId}>
                <div className="contractTop">
                  <code>{result.contractId}</code>
                  <ResultPill status={result.status} />
                </div>
                {result.assertions.map((assertion) => (
                  <div className="assertion" key={`${result.contractId}-${assertion.description}`}>
                    <span>{assertion.description}</span>
                    <small>{assertion.message}</small>
                  </div>
                ))}
              </article>
            ))}
          </div>

          {(proof.blockers?.length ?? 0) > 0 && (
            <div className="unknownBox">
              <strong>Blockers before R1</strong>
              <ul>{proof.blockers?.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul>
            </div>
          )}

          <div className="signatureRow">
            <span>SHA-256 <code>{proof.signedPassport.passportSha256.slice(0, 20)}…</code></span>
            <span>{proof.signedPassport.signature.algorithm} · {proof.signedPassport.signature.keyId}</span>
          </div>
        </div>
      )}
    </section>
  );
}
