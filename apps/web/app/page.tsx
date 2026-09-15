import { ScanWorkspace } from "./scan-workspace";

const moments = [
  "Verify before launch",
  "Verify before charging customers",
  "Verify before investor demo",
  "Verify client delivery",
  "Verify latest release",
];

export default function Home() {
  return (
    <main>
      <header className="shell nav">
        <a className="brand" href="#top" aria-label="Relyo home">
          <span className="brandMark">R</span>
          <span>Relyo</span>
        </a>
        <div className="navMeta">Independent software proof</div>
      </header>

      <section id="top" className="shell hero">
        <div className="eyebrow">AI builds it. Relyo proves it.</div>
        <h1>Build fast. Verify before customers depend on it.</h1>
        <p className="heroCopy">
          Connect a public URL and, optionally, a public GitHub repository. Relyo maps what it can observe,
          runs deterministic launch checks, keeps unknowns explicit, and produces an evidence-backed Passport.
        </p>
        <div className="momentRail" aria-label="Launch moments">
          {moments.map((moment) => (
            <span key={moment}>{moment}</span>
          ))}
        </div>
      </section>

      <section className="shell productStage">
        <ScanWorkspace />
      </section>

      <section className="shell proofPrinciples">
        <div>
          <span className="sectionKicker">What the free check does</span>
          <h2>Useful proof without pretending to know what we cannot see.</h2>
        </div>
        <div className="principleGrid">
          <article>
            <strong>Observe</strong>
            <p>HTTPS, runtime response, selected headers, public repository structure, dependencies and release SHA.</p>
          </article>
          <article>
            <strong>Explain</strong>
            <p>Show deterministic findings, a lightweight Production Graph, and why a deeper proof needs provider access.</p>
          </article>
          <article>
            <strong>Do not overclaim</strong>
            <p>Production configuration, rollback, auth, payments and recovery remain UNKNOWN until Relyo has evidence.</p>
          </article>
        </div>
      </section>

      <footer className="shell footer">
        <span>Relyo V2 alpha</span>
        <span>AI reasons. Evidence decides.</span>
      </footer>
    </main>
  );
}
