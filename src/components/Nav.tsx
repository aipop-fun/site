import { useEffect, useState } from 'react';
import { variant } from '../../site.config';
import { ago } from '../lib/format';
import { useScrolledPast } from '../lib/hooks';
import { generatedAt, leadProfile, stats } from '../lib/data';
import './Nav.css';

const SECTIONS = [
  { id: 'signal', index: '002', label: 'signal' },
  { id: 'index', index: '003', label: 'index' },
  { id: 'pipeline', index: '004', label: 'pipeline' },
  { id: 'reel', index: '005', label: 'reel' },
];

export function Nav() {
  const scrolled = useScrolledPast(28);
  const [active, setActive] = useState('');
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const targets = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (!targets.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.2, 0.6] },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="nav" data-scrolled={scrolled}>
      <div className="wrap nav__inner">
        <a className="nav__brand" href="#top">
          <span className="nav__mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="nav__wordmark">{variant.wordmark}</span>
          <span className="nav__sub">/ the build ledger</span>
        </a>

        <nav className="nav__links" aria-label="Ledger sections">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              data-active={active === section.id}
              aria-current={active === section.id ? 'true' : undefined}
            >
              <span className="nav__index">{section.index}</span>
              {section.label}
            </a>
          ))}
        </nav>

        <div className="nav__status">
          <span className="dot" aria-hidden="true" />
          <span className="nav__synced" title={`snapshot ${generatedAt}`}>
            <span className="nav__clock">
              {clock.toISOString().slice(11, 16)} UTC
            </span>
            <span className="nav__sep">·</span>
            synced {ago(generatedAt, clock.getTime())}
          </span>
          <a
            className="nav__gh"
            href={leadProfile.url}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`github.com/${leadProfile.login} — ${stats.totalRepos} repositories`}
          >
            github ↗
          </a>
        </div>
      </div>
    </header>
  );
}
