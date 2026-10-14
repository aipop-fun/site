import { variant } from '../../site.config';
import { ago, grouped, languageColor, stamp } from '../lib/format';
import { generatedAt, leadProfile, profiles, repos, stats } from '../lib/data';
import { LazyReelPlayer } from './LazyReelPlayer';
import './Hero.css';

const READOUTS = [
  { label: 'repositories', value: grouped(stats.totalRepos), sub: 'both accounts' },
  { label: 'original work', value: grouped(stats.originalRepos), sub: 'non-fork' },
  { label: 'stars tracked', value: grouped(stats.totalStars), sub: 'all repos' },
  { label: 'languages', value: String(stats.languagesAll), sub: 'distinct' },
  { label: 'followers', value: grouped(stats.followers), sub: 'developerfred + aipop-fun' },
];

const MARQUEE = repos.slice(0, 16);

export function Hero() {
  const letters = variant.wordmark.toUpperCase().split('');

  return (
    <section className="hero" id="top">
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__glow" aria-hidden="true" />

      <div className="wrap hero__inner">
        <div className="hero__meta">
          <span className="hero__tag">
            <span className="dot" aria-hidden="true" />
            ledger 001 — live
          </span>
          <span className="hero__tag">
            sync · <b>every 6h</b>
          </span>
          <span className="hero__tag hero__tag--dim">snapshot {stamp(generatedAt)}</span>
        </div>

        <h1 className="hero__title" aria-label={`${variant.wordmark} — ${variant.role}`}>
          {letters.map((letter, i) => (
            <span key={`${letter}-${i}`} style={{ '--i': i } as React.CSSProperties}>
              {letter === ' ' ? '\u00a0' : letter}
            </span>
          ))}
        </h1>

        <div className="hero__body">
          <div className="hero__copy">
            <p className="hero__tagline" data-reveal>
              {variant.tagline}
            </p>
            <p className="hero__para" data-reveal style={{ '--reveal-delay': '80ms' } as React.CSSProperties}>
              Nothing on this page is hand-written. A scheduled job walks the GitHub API across{' '}
              {profiles.map((profile, i) => (
                <span key={profile.login}>
                  {i > 0 ? ' and ' : ''}
                  <b>{profile.login}</b>
                </span>
              ))}
              , folds every repository into a single ledger, and rebuilds these pages. Push a commit
              and the index moves.
            </p>

            <div className="hero__cta" data-reveal style={{ '--reveal-delay': '160ms' } as React.CSSProperties}>
              <a
                className="btn btn--primary"
                href={leadProfile.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                github / {leadProfile.login} <span aria-hidden="true">↗</span>
              </a>
              <a className="btn" href="https://aipop.fun" target="_blank" rel="noreferrer noopener">
                aipop.fun <span aria-hidden="true">↗</span>
              </a>
              <a className="btn btn--ghost" href="#index">
                read the index <span aria-hidden="true">↓</span>
              </a>
            </div>

            <p className="hero__note">
              last push {ago(stats.latestPush)} · {stats.pushed30d} repositories touched in 30 days ·{' '}
              {stats.pushed7d} this week
            </p>
          </div>

          <div
            className="hero__monitor"
            data-reveal
            style={{ '--reveal-delay': '120ms' } as React.CSSProperties}
          >
            <figure className="monitor">
              <div className="monitor__bar">
                <span className="monitor__lights" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="monitor__title">ledger.ticker — BuildLog</span>
                <span className="monitor__live">
                  <span className="dot" aria-hidden="true" />
                  live render
                </span>
              </div>
              <div className="monitor__screen">
                <LazyReelPlayer />
              </div>
              <figcaption className="monitor__foot">
                <span>composition BuildLog</span>
                <span>1920×1080 · 30fps · 12.4s</span>
                <span>@remotion/player</span>
              </figcaption>
            </figure>
          </div>
        </div>

        <dl className="hero__stats" data-reveal>
          {READOUTS.map((readout) => (
            <div key={readout.label} className="readout">
              <dt className="micro">{readout.label}</dt>
              <dd>
                <span className="readout__value">{readout.value}</span>
                <span className="readout__sub">{readout.sub}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[0, 1].map((pass) => (
            <div className="marquee__set" key={pass}>
              {MARQUEE.map((repo) => (
                <span className="marquee__item" key={`${pass}-${repo.url}`}>
                  <i style={{ background: languageColor(repo.lang) }} />
                  {repo.owner}/{repo.name}
                  <em>{repo.lang ?? 'misc'}</em>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
