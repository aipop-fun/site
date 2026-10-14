import { useMemo, useState } from 'react';
import { ago, grouped, index, languageColor } from '../lib/format';
import { generatedAt, languages, repoCountByOwner, repos, stats } from '../lib/data';
import './Datasheet.css';

type SortKey = 'recent' | 'stars' | 'name';

const PAGE = 18;

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'last pushed' },
  { key: 'stars', label: 'most starred' },
  { key: 'name', label: 'a → z' },
];

export function Datasheet() {
  const [owner, setOwner] = useState('all');
  const [lang, setLang] = useState('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let list = repos;
    if (owner !== 'all') list = list.filter((repo) => repo.owner === owner);
    if (lang !== 'all') list = list.filter((repo) => repo.lang === lang);
    if (needle) {
      list = list.filter((repo) =>
        `${repo.owner}/${repo.name} ${repo.desc ?? ''} ${repo.topics.join(' ')} ${repo.lang ?? ''}`
          .toLowerCase()
          .includes(needle),
      );
    }
    const sorted = [...list];
    if (sort === 'recent') sorted.sort((a, b) => Date.parse(b.pushed) - Date.parse(a.pushed));
    if (sort === 'stars') {
      sorted.sort((a, b) => b.stars - a.stars || Date.parse(b.pushed) - Date.parse(a.pushed));
    }
    if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [owner, lang, sort, query]);

  const shown = filtered.slice(0, visible);
  const reset = (fn: () => void) => () => {
    fn();
    setVisible(PAGE);
  };

  const ownerOptions = [
    { key: 'all', label: 'all accounts', count: stats.originalRepos },
    ...Object.entries(repoCountByOwner).map(([name, count]) => ({ key: name, label: name, count })),
  ];

  return (
    <section className="sheet band" id="index">
      <div className="wrap">
        <header className="band__head sheet__head">
          <span className="band__index">003</span>
          <div>
            <span className="band__kicker">index / {stats.originalRepos} original repositories</span>
            <h2 className="band__title">
              Everything that is not a fork, printed from the API and searchable in place.
            </h2>
          </div>
        </header>

        <div className="sheet__controls">
          <div className="chips" role="group" aria-label="Filter by account">
            {ownerOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                className="chip"
                aria-pressed={owner === option.key}
                onClick={reset(() => setOwner(option.key))}
              >
                {option.label}
                <span className="chip__count">{option.count}</span>
              </button>
            ))}
          </div>

          <div className="sheet__fields">
            <label className="field">
              <span className="field__label">language</span>
              <select value={lang} onChange={(event) => reset(() => setLang(event.target.value))()}>
                <option value="all">all ({stats.languagesAll})</option>
                {languages.map((language) => (
                  <option key={language.name} value={language.name}>
                    {language.name} ({language.count})
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field__label">sort</span>
              <select
                value={sort}
                onChange={(event) => reset(() => setSort(event.target.value as SortKey))()}
              >
                {SORTS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field--search">
              <span className="field__label">search</span>
              <input
                type="search"
                value={query}
                placeholder="name, topic or description"
                onChange={(event) => reset(() => setQuery(event.target.value))()}
              />
            </label>
          </div>
        </div>

        <div className="sheet__count">
          <span>
            {filtered.length} of {stats.originalRepos} entries
            {query ? ` matching “${query}”` : ''}
          </span>
          <span>
            showing {shown.length} · {SORTS.find((s) => s.key === sort)?.label}
          </span>
        </div>

        <div className="sheet__table" role="table" aria-label="Repository index">
          <div className="sheet__legend" role="row">
            <span role="columnheader">#</span>
            <span role="columnheader">repository</span>
            <span role="columnheader">description</span>
            <span role="columnheader">language · stars · updated</span>
          </div>

          <div className="sheet__rows" key={`${owner}-${lang}-${sort}-${query}`}>
            {shown.map((repo, i) => (
              <a
                className="row"
                key={repo.url}
                href={repo.url}
                target="_blank"
                rel="noreferrer noopener"
                style={{ '--i': i } as React.CSSProperties}
                role="row"
              >
                <span className="row__index" role="cell">
                  {index(i + 1)}
                </span>
                <span className="row__name" role="cell">
                  <span className="row__owner">{repo.owner}/</span>
                  {repo.name}
                  <i className="row__arrow" aria-hidden="true">
                    ↗
                  </i>
                </span>
                <span className="row__desc" role="cell">
                  {repo.desc ?? (
                    <em className="row__none" title="No description on GitHub">
                      —
                    </em>
                  )}
                  {repo.home ? <i className="row__home">{repo.home.replace(/^https?:\/\//, '')}</i> : null}
                </span>
                <span className="row__meta" role="cell">
                  <span className="row__lang">
                    <i style={{ background: languageColor(repo.lang) }} aria-hidden="true" />
                    {repo.lang ?? '—'}
                  </span>
                  <span className="row__stars">
                    {repo.stars > 0 ? `★ ${repo.stars}` : '·'}
                  </span>
                  <span className="row__age">{ago(repo.pushed)}</span>
                </span>
              </a>
            ))}

            {shown.length === 0 ? (
              <p className="sheet__empty">
                No entry matches that filter. The ledger only indexes non-fork repositories.
              </p>
            ) : null}
          </div>
        </div>

        {filtered.length > shown.length ? (
          <button className="more" type="button" onClick={() => setVisible((value) => value + PAGE)}>
            print {Math.min(PAGE, filtered.length - shown.length)} more entries
            <span aria-hidden="true">↓</span>
          </button>
        ) : null}

        <footer className="sheet__foot">
          <span>form L-003 · build ledger</span>
          <span>printed {generatedAt.replace('T', ' ').slice(0, 16)}Z</span>
          <span>
            forks excluded · {grouped(stats.forkedRepos)} upstream copies not listed
          </span>
        </footer>
      </div>
    </section>
  );
}
