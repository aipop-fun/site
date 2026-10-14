import raw from '../data/snapshot.json';
import { variant } from '../../site.config';
import type { Counted, LedgerReelProps, Repo, Snapshot } from './types';
import { EVENT_LABEL, compact, grouped, index, languageColor, shortRef } from './format';

export const snapshot = raw as unknown as Snapshot;
export const { stats, profiles, events, topRepos, languageBreakdown, activityByDay, generatedAt } =
  snapshot;

/**
 * The account that leads the page: the variant's own owner, whatever order the
 * sync happened to write the profiles in. Both accounts are always aggregated.
 */
export const leadProfile = profiles.find((p) => p.login === variant.owner) ?? profiles[0];
export const allProfiles = profiles;

export const repos: Repo[] = [...snapshot.repos].sort((a, b) => Date.parse(b.pushed) - Date.parse(a.pushed));

export const accounts = snapshot.accounts;

export const languages: Counted[] = languageBreakdown;

/** Top languages as shares of the original (non-fork) work, with an "other" tail. */
export function languageShares(limit = 6): { name: string; count: number; share: number; color: string }[] {
  const slice = languages.slice(0, limit);
  const total = stats.originalRepos || 1;
  const shown = slice.reduce((sum, l) => sum + l.count, 0);
  const shares = slice.map((l) => ({
    name: l.name,
    count: l.count,
    share: l.count / total,
    color: languageColor(l.name),
  }));
  const rest = stats.originalRepos - shown;
  if (rest > 0) {
    shares.push({ name: 'other', count: rest, share: rest / total, color: 'var(--faint)' });
  }
  return shares;
}

export const activityValues = activityByDay.map((d) => d.count);
export const activityPeak = Math.max(1, ...activityValues);

/** Repository counts per account, for the index filters. */
export const repoCountByOwner: Record<string, number> = repos.reduce<Record<string, number>>(
  (acc, repo) => {
    acc[repo.owner] = (acc[repo.owner] ?? 0) + 1;
    return acc;
  },
  {},
);

export function buildReelProps(meta: {
  wordmark: string;
  role: string;
  origin: string;
  accent: string;
}): LedgerReelProps {
  const ticks: LedgerReelProps['ticks'] = [];
  const tone: Record<string, LedgerReelProps['ticks'][number]['tone']> = {
    PushEvent: 'accent',
    CreateEvent: 'phosphor',
    ReleaseEvent: 'phosphor',
    PullRequestEvent: 'cyan',
    IssuesEvent: 'cyan',
  };

  for (const event of events) {
    if (ticks.length >= 14) break;
    const kind = EVENT_LABEL[event.type] ?? event.type.replace('Event', '').toUpperCase();
    let detail = '';
    if (event.type === 'PushEvent') {
      const ref = shortRef(event.ref);
      detail = [ref, event.commits ? `${event.commits} commit${event.commits === 1 ? '' : 's'}` : null]
        .filter(Boolean)
        .join(' · ');
    } else if (event.type === 'CreateEvent') {
      detail = `${event.refType ?? 'ref'} created`;
    } else if (event.type === 'ReleaseEvent') {
      detail = `tag ${event.release ?? '—'}`;
    } else if (event.type === 'PullRequestEvent') {
      detail = `pull request ${event.action ?? ''}`.trim();
    } else if (event.type === 'IssuesEvent') {
      detail = `issue ${event.action ?? ''}`.trim();
    }
    ticks.push({
      index: index(ticks.length + 1),
      kind,
      repo: event.repo ?? '—',
      meta: detail || (event.message ?? ''),
      tone: tone[event.type] ?? 'muted',
    });
  }

  for (const repo of repos) {
    if (ticks.length >= 14) break;
    ticks.push({
      index: index(ticks.length + 1),
      kind: 'REPO',
      repo: `${repo.owner}/${repo.name}`,
      meta: [repo.lang, repo.desc].filter(Boolean).join(' · ').slice(0, 72),
      tone: 'muted',
    });
  }

  return {
    wordmark: meta.wordmark,
    role: meta.role,
    origin: meta.origin,
    generatedAt,
    accent: meta.accent,
    repoTotal: stats.totalRepos,
    languages: (() => {
      const top = languages.slice(0, 6);
      const shown = top.reduce((sum, language) => sum + language.count, 0);
      const other = Math.max(0, stats.originalRepos - shown);
      const total = stats.originalRepos || 1;
      return [
        ...top.map((language) => ({
          name: language.name,
          share: language.count / total,
          color: languageColor(language.name),
        })),
        ...(other > 0 ? [{ name: 'other', share: other / total, color: '#3a3f47' }] : []),
      ];
    })(),
    topRepos: topRepos.slice(0, 5).map((repo) => ({
      name: `${repo.owner}/${repo.name}`,
      stars: repo.stars,
      lang: repo.lang,
    })),
    stats: [
      { label: 'repositories', value: grouped(stats.totalRepos) },
      { label: 'original work', value: grouped(stats.originalRepos) },
      { label: 'stars', value: compact(stats.totalStars) },
      { label: 'languages', value: String(stats.languagesAll) },
      { label: 'pushed 30d', value: String(stats.pushed30d) },
    ],
    ticks,
    activity: activityValues.slice(-21),
  };
}
