import { useState } from 'react';
import { variant } from '../../site.config';
import { grouped, stamp } from '../lib/format';
import { generatedAt, profiles, stats } from '../lib/data';
import './Footer.css';

const ENS = 'codingsh.eth';

function EnsCopy() {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="ens"
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(ENS);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          setCopied(false);
        }
      }}
      aria-live="polite"
    >
      <span className="micro">ens</span>
      <span className="ens__value">{ENS}</span>
      <span className="ens__state">{copied ? 'copied ✓' : 'copy'}</span>
    </button>
  );
}

const LINKS = [
  { label: 'github / developerfred', href: 'https://github.com/developerfred' },
  { label: 'github / aipop-fun', href: 'https://github.com/aipop-fun' },
  { label: 'x / @Codingsh', href: 'https://twitter.com/Codingsh' },
  { label: 'aipop.fun', href: 'https://aipop.fun' },
];

const COLOPHON = [
  { label: 'type', value: 'Iosevka v34.9.0 · OFL-1.1' },
  { label: 'video', value: 'Remotion 4.0.535' },
  { label: 'build', value: 'Vite · React 19 · TypeScript 5.9' },
  { label: 'hosting', value: 'GitHub Pages · static artifact' },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__cta">
          <h2 className="footer__title" data-reveal>
            Push something.
            <br />
            The ledger follows.
          </h2>
          <div className="footer__links" data-reveal>
            {LINKS.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer noopener">
                {link.label}
                <span aria-hidden="true">↗</span>
              </a>
            ))}
            <EnsCopy />
          </div>
        </div>

        <div className="footer__accounts">
          {profiles.map((profile) => (
            <a
              className="account"
              key={profile.login}
              href={profile.url}
              target="_blank"
              rel="noreferrer noopener"
              data-reveal
            >
              <img
                src={profile.avatar}
                alt=""
                width={44}
                height={44}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <div className="account__body">
                <span className="account__login">{profile.login}</span>
                <span className="account__bio">{profile.bio ?? profile.name ?? ''}</span>
                <span className="account__meta">
                  {grouped(profile.publicRepos)} repos · {grouped(profile.followers)} followers ·{' '}
                  {profile.kind === 'Organization' ? 'organization' : 'user'}
                </span>
              </div>
              <span className="account__arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          ))}
        </div>

        <div className="footer__base">
          <dl className="colophon">
            {COLOPHON.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
            <div>
              <dt>snapshot</dt>
              <dd>{stamp(generatedAt)}</dd>
            </div>
            <div>
              <dt>cadence</dt>
              <dd>cron 0 */6 * * *</dd>
            </div>
          </dl>

          <div className="footer__sign">
            <p className="footer__note">
              Generated, never hand-edited. {grouped(stats.trackedRepos)} repositories inspected on the
              last run — this page, the index, the social card and the reel all come from that single
              snapshot.
            </p>
            <div className="footer__actions">
              <a
                className="footer__source"
                href={`https://github.com/${variant.repository}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                source: {variant.repository}
              </a>
              <a className="footer__top" href="#top">
                back to top <span aria-hidden="true">↑</span>
              </a>
            </div>
            <p className="footer__legal">
              Iosevka is licensed under the SIL Open Font License 1.1 and subsetted here for the web.
              Built by codingsh — {new Date().getUTCFullYear()}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
