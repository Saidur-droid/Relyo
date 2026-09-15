import { ScanWorkspace } from "./scan-workspace";
import { VerifyLaunchPanel } from "./verify-launch-panel";

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
          Check the public surface for free, then connect Vercel securely to run provider-backed launch proof for the exact release.
          Relyo keeps unknowns explicit and signs the evidence-backed Production Passport.
        </p>
        <div className="heroActions">
          <a className="primaryLink" href="#verify-launch">Verify My Launch</a>
          <a className="textLink" href="#check-free">Check My App Free</a>
        </div>
        <div className="momentRail" aria-label="Launch moments">
          {moments.map((moment) => (
            <span key={moment}>{moment}</span>
          ))}
        </div>
      </section>

      <section id="check-free" className="shell productStage">
        <ScanWorkspace />
      </section>

      <section className="shell verifyStage">
        <VerifyLaunchPanel />
      </section>

      <section className="shell proofPrinciples">
        <div>
          <span className="sectionKicker">Trust boundary</span>
          <h2>Useful proof without pretending to know what Relyo cannot see.</h2>
        </div>
        <div className="principleGrid">
          <article>
            <strong>Observe</strong>
            <p>Public runtime, repository release identity, and read-only Vercel deployment, domain and configuration metadata.</p>
          </article>
          <article>
            <strong>Verify</strong>
            <p>Deterministic contracts bind the Git SHA to production evidence. An LLM never decides the final R1 state.</p>
          </article>
          <article>
            <strong>Do not overclaim</strong>
            <p>Auth, payments, business journeys and exercised recovery remain later proof levels until independent evidence exists.</p>
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
