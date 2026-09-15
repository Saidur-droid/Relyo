"use client";

import { FormEvent, useState } from "react";

type ScanResponse = {
  report?: {
    achievedAssurance: string;
    blockers: string[];
    passport: {
      id: string;
      assurance: string;
      targetAssurance: string;
      issuedAt: string;
      release:
        | { kind: "git"; repository: string; commitSha: string }
        | { kind: "url-observation"; url: string; observedAt: string };
      results: Array<{
        contractId: string;
        status: "PASS" | "FAIL" | "PARTIAL" | "UNKNOWN";
        assertions: Array<{ description: string; status: string; message?: string }>;
      }>;
      exclusions: string[];
      evidence: Array<{ id: string; kind: string; sha256: string; source: string; collectedAt: string }>;
    };
  };
  discovery?: {
    findings: Array<{
      id: string;
      title: string;
      detail: string;
      severity: string;
      source: string;
    }>;
    graph: {
      nodes: Array<{ id: string; type: string; label: string; provider?: string }>;
      edges: Array<{ from: string; to: string; relation: string }>;
      unknowns: string[];
    };
    url?: { finalUrl: string; status: number; latencyMs: number; redirectCount: number };
    repo?: {
      repository: string;
      commitSha: string;
      packageManager: string;
      technologies: Array<{ key: string; label: string; category: string }>;
    };
  };
  error?: string;
};

function StatusPill({ status }: { status: string }) {
  return <span className={`status status-${status.toLowerCase()}`}>{status}</span>;
}

export function ScanWorkspace() {
  const [url, setUrl] = useState("");
  const [repo, setRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ScanResponse | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setData(null);
    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.trim() || undefined, githubRepo: repo.trim() || undefined }),
      });
      const payload = (await response.json()) as ScanResponse;
      setData(payload);
    } catch {
      setData({ error: "Relyo could not complete the check. Try again with a public URL or repository." });
    } finally {
      setLoading(false);
    }
  }

  const report = data?.report;
  const discovery = data?.discovery;
  const passport = report?.passport;

  return (
    <div className="workspace">
      <div className="scanPanel">
        <div className="panelHeading">
          <div>
            <span className="sectionKicker">Check My App Free</span>
            <h2>What are you about to trust?</h2>
          </div>
          <span className="freeBadge">Free discovery</span>
        </div>

        <form onSubmit={submit} className="scanForm">
          <label>
            <span>Production URL</span>
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="yourapp.com"
              inputMode="url"
              autoComplete="url"
            />
          </label>
          <label>
            <span>Public GitHub repository <em>optional</em></span>
            <input
              value={repo}
              onChange={(event) => setRepo(event.target.value)}
              placeholder="owner/repo"
              autoComplete="off"
            />
          </label>
          <button disabled={loading || (!url.trim() && !repo.trim())} type="submit">
            {loading ? "Checking evidence…" : "Check my app"}
          </button>
          <p className="formNote">
            Public observation only. Relyo does not ask for production secrets in this alpha.
          </p>
        </form>
      </div>

      <div className="resultPanel" aria-live="polite">
        {!data && !loading && (
          <div className="emptyState">
            <span className="pulseDot" />
            <h3>Your first proof starts with observation.</h3>
            <p>Relyo will separate what it can prove now from what still requires provider or journey evidence.</p>
          </div>
        )}

        {loading && (
          <div className="emptyState">
            <div className="scannerLine" />
            <h3>Collecting public evidence…</h3>
            <p>Resolving the public surface, release identity and deterministic launch signals.</p>
          </div>
        )}

        {data?.error && (
          <div className="errorBox">
            <strong>Check could not complete</strong>
            <p>{data.error}</p>
          </div>
        )}

        {report && discovery && passport && (
          <div className="results">
            <div className="assuranceCard">
              <div>
                <span className="sectionKicker">Production Passport preview</span>
                <h3>{passport.assurance} — {passport.assurance === "R0" ? "Discovered, not launch-verified" : "Launch verified"}</h3>
                <p>Target: {passport.targetAssurance}. Scope is limited to evidence collected in this run.</p>
              </div>
              <div className="assuranceBadge">{passport.assurance}</div>
            </div>

            <div className="summaryGrid">
              <div><span>Contracts</span><strong>{passport.results.length}</strong></div>
              <div><span>Findings</span><strong>{discovery.findings.length}</strong></div>
              <div><span>Evidence</span><strong>{passport.evidence.length}</strong></div>
              <div><span>Unknowns</span><strong>{passport.exclusions.length}</strong></div>
            </div>

            {discovery.url && (
              <div className="observationBar">
                <span>Runtime</span>
                <strong>HTTP {discovery.url.status}</strong>
                <span>{discovery.url.latencyMs} ms</span>
                <span>{discovery.url.redirectCount} redirects</span>
              </div>
            )}

            {discovery.repo && (
              <div className="repoSummary">
                <div>
                  <span>Release identity</span>
                  <strong>{discovery.repo.repository}@{discovery.repo.commitSha.slice(0, 12)}</strong>
                </div>
                <div className="techList">
                  {discovery.repo.technologies.length > 0
                    ? discovery.repo.technologies.map((tech) => <span key={tech.key}>{tech.label}</span>)
                    : <span>No supported stack markers detected</span>}
                </div>
              </div>
            )}

            <div className="resultSection">
              <div className="resultSectionTitle">
                <h4>Launch contracts</h4>
                <span>Evidence decides</span>
              </div>
              <div className="contractList">
                {passport.results.map((result) => (
                  <article key={result.contractId}>
                    <div className="contractTop">
                      <code>{result.contractId}</code>
                      <StatusPill status={result.status} />
                    </div>
                    {result.assertions.map((item) => (
                      <div key={item.description} className="assertion">
                        <span>{item.description}</span>
                        <small>{item.message}</small>
                      </div>
                    ))}
                  </article>
                ))}
              </div>
            </div>

            {discovery.findings.length > 0 && (
              <div className="resultSection">
                <div className="resultSectionTitle">
                  <h4>App-specific findings</h4>
                  <span>{discovery.findings.length} observed</span>
                </div>
                <div className="findingList">
                  {discovery.findings.map((finding) => (
                    <article key={finding.id}>
                      <span className={`severity severity-${finding.severity}`}>{finding.severity}</span>
                      <div><strong>{finding.title}</strong><p>{finding.detail}</p></div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            <div className="resultSection">
              <div className="resultSectionTitle">
                <h4>Production Graph Lite</h4>
                <span>{discovery.graph.nodes.length} nodes</span>
              </div>
              <div className="graphList">
                {discovery.graph.nodes.map((node) => (
                  <span key={node.id}><small>{node.type}</small>{node.label}</span>
                ))}
              </div>
            </div>

            <div className="unknownBox">
              <strong>What Relyo refuses to guess</strong>
              <ul>{passport.exclusions.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>

            <details className="machineProof">
              <summary>Inspect machine-readable Passport</summary>
              <pre>{JSON.stringify(passport, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
