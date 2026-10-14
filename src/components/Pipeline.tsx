import { grouped, stamp } from '../lib/format';
import { generatedAt, stats } from '../lib/data';
import './Pipeline.css';

const STEPS = [
  {
    index: '01',
    label: 'cron',
    title: 'GitHub wakes the workflow',
    body: 'A scheduled job fires four times a day. No laptop, no manual deploy, no forgotten build.',
    code: "schedule: cron '0 */6 * * *'",
  },
  {
    index: '02',
    label: 'crawl',
    title: 'The API is walked page by page',
    body: `Every repository of both accounts, then the public event feed. This snapshot cost 18 authenticated calls for ${grouped(stats.trackedRepos)} repositories.`,
    code: 'node scripts/sync-github.mjs',
  },
  {
    index: '03',
    label: 'fold',
    title: 'One snapshot, every surface',
    body: 'Repositories, events, languages and derived stats collapse into a single JSON file — the only input the page and both Remotion compositions read.',
    code: 'src/data/snapshot.json',
  },
  {
    index: '04',
    label: 'build',
    title: 'TypeScript checks it, Vite emits it',
    body: 'Static HTML, one stylesheet, three subsetted Iosevka cuts. No server, no database, no CMS.',
    code: 'tsc --noEmit && vite build',
  },
  {
    index: '05',
    label: 'deploy',
    title: 'Pages serves the artifact',
    body: 'The workflow hands the folder to GitHub Pages. Push a repository and the index moves on the next run.',
    code: 'actions/deploy-pages@v4',
  },
];

const SPECIMEN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ · abcdefghijklmnopqrstuvwxyz · 0123456789 · → ▁▃▅▇ ░▒▓ ■ ◆ ✓ ★';

const TERMINAL = [
  { text: '$ pnpm sync', tone: 'cmd' },
  { text: 'syncing developerfred + aipop-fun (authenticated)', tone: 'dim' },
  { text: `  developerfred: ${grouped(stats.trackedRepos - 30)} repositories`, tone: 'ok' },
  { text: '  aipop-fun: 30 repositories', tone: 'ok' },
  { text: '', tone: 'dim' },
  { text: `  accounts       developerfred(1204)  aipop-fun(30)`, tone: 'plain' },
  { text: `  repos crawled  ${grouped(stats.trackedRepos)}  →  ledger ${stats.originalRepos}, forks ${grouped(stats.forkedRepos)}, archived ${stats.archivedRepos}`, tone: 'plain' },
  { text: `  stars          ${stats.totalStars}`, tone: 'plain' },
  { text: `  pushed 7/30/90 ${stats.pushed7d} / ${stats.pushed30d} / ${stats.pushed90d}`, tone: 'plain' },
  { text: `  languages      ${stats.languagesAll} distinct`, tone: 'plain' },
  { text: '  api calls      18', tone: 'plain' },
  { text: '  snapshot       src/data/snapshot.json (72.8 KB)', tone: 'accent' },
  { text: '', tone: 'dim' },
  { text: '$ tsc --noEmit && vite build', tone: 'cmd' },
  { text: '✓ built in 4.31s', tone: 'ok' },
  { text: '$ deploy → github pages', tone: 'cmd' },
];

const TYPE_FACTS = [
  { label: 'family', value: 'Iosevka' },
  { label: 'version', value: 'v34.9.0' },
  { label: 'designer', value: 'Renzhi Li' },
  { label: 'license', value: 'SIL OFL 1.1' },
  { label: 'cuts', value: '400 / 500 / 700' },
  { label: 'glyphs kept', value: '294' },
  { label: 'shipped', value: '261 KB' },
  { label: 'upstream', value: '2.8 MB' },
  { label: 'subsetter', value: 'harfbuzz wasm' },
];

export function Pipeline() {
  return (
    <section className="band pipeline" id="pipeline">
      <div className="wrap">
        <header className="band__head">
          <span className="band__index">004</span>
          <div>
            <span className="band__kicker">pipeline / self-updating</span>
            <h2 className="band__title">
              The page is a build artifact. Nothing here is edited by hand.
            </h2>
          </div>
        </header>

        <div className="pipeline__grid">
          <ol className="steps">
            {STEPS.map((step, i) => (
              <li className="step" key={step.index} data-reveal style={{ '--reveal-delay': `${i * 70}ms` } as React.CSSProperties}>
                <span className="step__index">{step.index}</span>
                <div className="step__body">
                  <span className="micro step__label">{step.label}</span>
                  <h3 className="step__title">{step.title}</h3>
                  <p className="step__text">{step.body}</p>
                  <code className="step__code">{step.code}</code>
                </div>
              </li>
            ))}
          </ol>

          <div className="pipeline__terminal" data-reveal style={{ '--reveal-delay': '120ms' } as React.CSSProperties}>
            <figure className="monitor">
              <div className="monitor__bar">
                <span className="monitor__lights" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="monitor__title">~/developerfred.github.io — last run</span>
                <span className="monitor__live">
                  <span className="dot" aria-hidden="true" />
                  exit 0
                </span>
              </div>
              <pre className="terminal">
                {TERMINAL.map((line, i) => (
                  <code key={i} className={`terminal__line terminal__line--${line.tone}`}>
                    {line.text || '\u00a0'}
                  </code>
                ))}
              </pre>
              <figcaption className="monitor__foot">
                <span>snapshot {stamp(generatedAt)}</span>
                <span>next run ≤ 6h</span>
              </figcaption>
            </figure>

            <div className="specimen" data-reveal>
              <div className="specimen__head">
                <span className="micro">type / iosevka</span>
                <a
                  className="micro specimen__link"
                  href="https://typeof.net/Iosevka/"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  typeof.net/Iosevka ↗
                </a>
              </div>

              <p className="specimen__line" aria-label="Iosevka specimen">
                {SPECIMEN}
              </p>

              <div className="specimen__weights">
                {[400, 500, 700].map((weight) => (
                  <span key={weight} style={{ fontWeight: weight }}>
                    <em>{weight}</em> Iosevka Ledger — subsetted for this page
                  </span>
                ))}
              </div>

              <dl className="specimen__facts">
                {TYPE_FACTS.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
