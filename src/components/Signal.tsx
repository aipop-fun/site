import { ago, grouped, shortDay } from '../lib/format';
import { useCountUp, useInView } from '../lib/hooks';
import {
  activityByDay,
  activityPeak,
  languageShares,
  stats,
} from '../lib/data';
import './Signal.css';

function Stat({
  label,
  value,
  sub,
  format = grouped,
}: {
  label: string;
  value: number;
  sub: string;
  format?: (n: number) => string;
}) {
  const [ref, seen] = useInView<HTMLDivElement>(0.35);
  const animated = useCountUp(value, seen);

  return (
    <div className="stat" ref={ref}>
      <span className="micro stat__label">{label}</span>
      <span className="stat__value">{format(animated)}</span>
      <span className="stat__sub">{sub}</span>
    </div>
  );
}

const shares = languageShares(6);
const activityTotal = activityByDay.reduce((sum, day) => sum + day.count, 0);
const busiest = activityByDay.reduce(
  (max, day) => (day.count > max.count ? day : max),
  activityByDay[0] ?? { date: '', count: 0 },
);

export function Signal() {
  const [ref, seen] = useInView<HTMLDivElement>(0.3);

  return (
    <section className="band signal" id="signal">
      <div className="wrap">
        <header className="band__head">
          <span className="band__index">002</span>
          <div>
            <span className="band__kicker">signal / read-out</span>
            <h2 className="band__title">
              The panel reads what the API returned, {stats.trackedRepos.toLocaleString('en-US')} repositories
              deep.
            </h2>
          </div>
        </header>

        <div className="signal__stats">
          <Stat
            label="repositories"
            value={stats.totalRepos}
            sub={`across ${stats.trackedRepos.toLocaleString('en-US')} indexed`}
          />
          <Stat label="original work" value={stats.originalRepos} sub="forks excluded" />
          <Stat label="stars tracked" value={stats.totalStars} sub="every repo, both accounts" />
          <Stat label="distinct languages" value={stats.languagesAll} sub="all indexed repos" />
          <Stat label="pushed / 30d" value={stats.pushed30d} sub={`${stats.pushed7d} in the last week`} />
          <Stat label="forks seeded" value={stats.forkedRepos} sub="upstream copies carried" />
          <Stat label="followers" value={stats.followers} sub="combined" />
          <Stat
            label="ledger age"
            value={Math.floor((Date.now() - Date.parse(stats.firstRepo)) / 31_536_000_000)}
            sub={`since ${stats.firstRepo.slice(0, 7)}`}
            format={(n) => `${n}y`}
          />
        </div>

        <div className="signal__panels" ref={ref} data-inview={seen}>
          <div className="panel">
            <div className="panel__head">
              <span className="micro">language distribution</span>
              <span className="micro panel__meta">{stats.originalRepos} original repos</span>
            </div>

            <div className="stack" role="img" aria-label="language distribution">
              {shares.map((language, i) => (
                <span
                  key={language.name}
                  className="stack__seg"
                  style={{
                    '--w': `${Math.max(language.share * 100, 1.5)}%`,
                    '--i': i,
                    background: language.color,
                  } as React.CSSProperties}
                  title={`${language.name}: ${language.count}`}
                />
              ))}
            </div>

            <ul className="legend">
              {shares.map((language) => (
                <li key={language.name}>
                  <i style={{ background: language.color }} />
                  <span className="legend__name">{language.name}</span>
                  <span className="legend__count">{language.count}</span>
                  <span className="legend__pct">{Math.round(language.share * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <div className="panel__head">
              <span className="micro">public events · 21 days</span>
              <span className="micro panel__meta">{activityTotal} logged</span>
            </div>

            <div className="spark" role="img" aria-label="public events per day, last 21 days">
              {activityByDay.map((day, i) => (
                <span
                  key={day.date}
                  className="spark__bar"
                  data-empty={day.count === 0}
                  style={{
                    '--h': `${Math.max((day.count / activityPeak) * 100, 2)}%`,
                    '--i': i,
                  } as React.CSSProperties}
                  title={`${day.date}: ${day.count} events`}
                />
              ))}
            </div>

            <div className="spark__axis">
              <span>{activityByDay[0]?.date ? shortDay(activityByDay[0].date) : ''}</span>
              <span className="spark__peak">
                peak {busiest.count} · {busiest.date ? shortDay(busiest.date) : ''}
              </span>
              <span>today</span>
            </div>

            <dl className="signal__facts">
              <div>
                <dt>latest push</dt>
                <dd>{ago(stats.latestPush)}</dd>
              </div>
              <div>
                <dt>newest repo</dt>
                <dd>{stats.newestRepo.slice(0, 10)}</dd>
              </div>
              <div>
                <dt>open issues</dt>
                <dd>{grouped(stats.totalIssues)}</dd>
              </div>
              <div>
                <dt>gists</dt>
                <dd>{stats.totalGists}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
