#!/usr/bin/env node
/**
 * Syncs the public GitHub activity of every account in site.config.ts into a
 * single normalised snapshot that the landing page (and the Remotion
 * compositions) render from.
 *
 *   node scripts/sync-github.mjs
 *
 * Auth: GITHUB_TOKEN / GH_TOKEN (falls back to the local ~/.git-credentials
 * entry so `pnpm sync` works on a workstation too). Without a token the public
 * rate limit of 60 req/h is not enough for a full 1.2k-repo crawl.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ACCOUNTS = ['developerfred', 'aipop-fun'];
const API = 'https://api.github.com';
const OFFLINE = process.argv.includes('--offline');

/* ------------------------------------------------------------------ auth -- */

function resolveToken() {
  const fromEnv = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (fromEnv) return fromEnv.trim();
  const creds = resolve(homedir(), '.git-credentials');
  if (existsSync(creds)) {
    const match = readFileSync(creds, 'utf8').match(/https:\/\/[^:]+:([^@\s]+)@github\.com/);
    if (match) return match[1];
  }
  return null;
}

const TOKEN = resolveToken();
const HEADERS = {
  accept: 'application/vnd.github+json',
  'x-github-api-version': '2022-11-28',
  'user-agent': 'codingsh-ledger-sync',
  ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}),
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let calls = 0;
async function gh(path, { allow404 = false } = {}) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${API}${path}`, { headers: HEADERS });
    calls++;
    if (res.status === 404 && allow404) return null;
    if (res.status === 403 || res.status === 429) {
      const reset = Number(res.headers.get('x-ratelimit-reset') ?? 0) * 1000;
      const wait = reset > Date.now() ? reset - Date.now() + 1000 : 4000 * (attempt + 1);
      if (wait > 90_000) throw new Error(`rate limited for ${Math.round(wait / 1000)}s on ${path}`);
      process.stderr.write(`  … throttled, waiting ${Math.round(wait / 1000)}s\n`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) {
      if (attempt === 3) throw new Error(`GitHub ${res.status} on ${path}`);
      await sleep(800 * (attempt + 1));
      continue;
    }
    return res.json();
  }
  throw new Error(`gave up on ${path}`);
}

/* ------------------------------------------------------------------ fetch -- */

async function fetchProfile(login) {
  const raw = await gh(`/users/${login}`);
  return {
    login: raw.login,
    kind: raw.type,
    name: raw.name ?? null,
    bio: (raw.bio ?? '').replace(/\r/g, '').trim() || null,
    avatar: raw.avatar_url,
    followers: raw.followers,
    following: raw.following,
    publicRepos: raw.public_repos,
    publicGists: raw.public_gists,
    location: raw.location ?? null,
    company: raw.company ?? null,
    blog: raw.blog ? (raw.blog.startsWith('http') ? raw.blog : `https://${raw.blog}`) : null,
    twitter: raw.twitter_username ?? null,
    hireable: Boolean(raw.hireable),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    url: raw.html_url,
  };
}

async function fetchAllRepos(login) {
  const perPage = 100;
  const query = `per_page=${perPage}&sort=pushed&direction=desc`;

  // Page 1 doubles as the pagination probe: GitHub advertises rel="last" in the
  // Link header, so a full crawl costs 1 + (lastPage - 1) requests.
  const first = await fetch(`${API}/users/${login}/repos?${query}&page=1`, { headers: HEADERS });
  calls++;
  if (!first.ok) throw new Error(`GitHub ${first.status} listing repos for ${login}`);
  const all = await first.json();

  const lastPage = Number(
    (first.headers.get('link') ?? '').match(/[?&]page=(\d+)>;\s*rel="last"/)?.[1] ?? 1,
  );
  if (lastPage > 1) {
    const pages = Array.from({ length: lastPage - 1 }, (_, i) => i + 2);
    const concurrency = 5;
    for (let i = 0; i < pages.length; i += concurrency) {
      const batch = await Promise.all(
        pages.slice(i, i + concurrency).map((page) => gh(`/users/${login}/repos?${query}&page=${page}`)),
      );
      batch.forEach((chunk) => all.push(...chunk));
      process.stderr.write(`  ${login}: ${all.length} repos\r`);
    }
    process.stderr.write('\n');
  }
  return all;
}

async function fetchEvents(login) {
  const raw = (await gh(`/users/${login}/events/public?per_page=100`, { allow404: true })) ?? [];
  return raw.map((e) => ({
    account: login,
    type: e.type,
    repo: e.repo?.name ?? null,
    at: e.created_at,
    ref: e.payload?.ref ?? null,
    refType: e.payload?.ref_type ?? null,
    action: e.payload?.action ?? null,
    commits: Array.isArray(e.payload?.commits) ? e.payload.commits.length : 0,
    message: e.payload?.commits?.[0]?.message?.split('\n')[0]?.slice(0, 120) ?? null,
    release: e.payload?.release?.tag_name ?? null,
  }));
}

/* ---------------------------------------------------------------- shaping -- */

const trim = (value, max) => {
  if (!value) return null;
  const flat = String(value).replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
};

function shapeRepo(raw) {
  return {
    owner: raw.owner?.login ?? 'unknown',
    name: raw.name,
    desc: trim(raw.description, 180),
    lang: raw.language ?? null,
    stars: raw.stargazers_count ?? 0,
    forks: raw.forks_count ?? 0,
    issues: raw.open_issues_count ?? 0,
    size: raw.size ?? 0,
    pushed: raw.pushed_at,
    created: raw.created_at,
    url: raw.html_url,
    home: raw.homepage ? raw.homepage.replace(/\/$/, '') : null,
    topics: (raw.topics ?? []).slice(0, 6),
    archived: Boolean(raw.archived),
    fork: Boolean(raw.fork),
    license: raw.license?.spdx_id && raw.license.spdx_id !== 'NOASSERTION' ? raw.license.spdx_id : null,
  };
}

function tally(items, key) {
  const map = new Map();
  for (const item of items) {
    const value = key(item);
    if (!value) continue;
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function dayKey(iso) {
  return iso.slice(0, 10);
}

/* ------------------------------------------------------------------- main -- */

async function main() {
  const outFile = resolve(ROOT, 'src/data/snapshot.json');
  if (OFFLINE) {
    if (!existsSync(outFile)) throw new Error('--offline used but no snapshot.json exists yet');
    process.stdout.write('offline mode: keeping the committed snapshot\n');
    return;
  }

  process.stdout.write(`syncing ${ACCOUNTS.join(' + ')}${TOKEN ? ' (authenticated)' : ' (anonymous)'}\n`);

  const profiles = [];
  for (const login of ACCOUNTS) profiles.push(await fetchProfile(login));

  const repos = [];
  for (const login of ACCOUNTS) {
    const raw = await fetchAllRepos(login);
    process.stderr.write(`  ${login}: ${raw.length} repositories\n`);
    repos.push(...raw.map(shapeRepo));
  }
  repos.sort((a, b) => Date.parse(b.pushed) - Date.parse(a.pushed));

  const events = [];
  for (const login of ACCOUNTS) events.push(...(await fetchEvents(login)));
  events.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  const originals = repos.filter((r) => !r.fork);
  const now = Date.now();
  const daysAgo = (n) => now - n * 86_400_000;

  const languages = tally(originals, (r) => r.lang).slice(0, 14);
  const allLanguages = tally(repos, (r) => r.lang);

  const activityByDay = (() => {
    const buckets = new Map();
    for (let i = 20; i >= 0; i--) buckets.set(dayKey(new Date(daysAgo(i)).toISOString()), 0);
    for (const event of events) {
      const key = dayKey(event.at);
      if (buckets.has(key)) buckets.set(key, buckets.get(key) + 1);
    }
    return [...buckets.entries()].map(([date, count]) => ({ date, count }));
  })();

  const meaningful = events.filter((e) =>
    ['PushEvent', 'CreateEvent', 'ReleaseEvent', 'PullRequestEvent', 'IssuesEvent', 'PublicEvent', 'ForkEvent'].includes(e.type),
  );

  const ledger = originals.slice(0, 260);

  const stats = {
    totalRepos: profiles.reduce((sum, p) => sum + p.publicRepos, 0),
    trackedRepos: repos.length,
    originalRepos: originals.length,
    forkedRepos: repos.length - originals.length,
    archivedRepos: repos.filter((r) => r.archived).length,
    totalStars: repos.reduce((sum, r) => sum + r.stars, 0),
    totalForks: repos.reduce((sum, r) => sum + r.forks, 0),
    totalIssues: repos.reduce((sum, r) => sum + r.issues, 0),
    followers: profiles.reduce((sum, p) => sum + p.followers, 0),
    totalGists: profiles.reduce((sum, p) => sum + p.publicGists, 0),
    languages: languages.length,
    languagesAll: allLanguages.length,
    pushed7d: repos.filter((r) => Date.parse(r.pushed) > daysAgo(7)).length,
    pushed30d: repos.filter((r) => Date.parse(r.pushed) > daysAgo(30)).length,
    pushed90d: repos.filter((r) => Date.parse(r.pushed) > daysAgo(90)).length,
    latestPush: repos[0]?.pushed ?? null,
    firstRepo: repos.reduce((min, r) => (Date.parse(r.created) < Date.parse(min) ? r.created : min), repos[0]?.created ?? new Date().toISOString()),
    newestRepo: repos.reduce((max, r) => (Date.parse(r.created) > Date.parse(max) ? r.created : max), repos[0]?.created ?? new Date().toISOString()),
  };

  const snapshot = {
    generatedAt: new Date().toISOString(),
    generator: 'scripts/sync-github.mjs',
    accounts: ACCOUNTS,
    profiles,
    repos: ledger,
    events: meaningful.slice(0, 40),
    topRepos: [...originals]
      .filter((r) => r.stars > 0)
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 9),
    languageBreakdown: allLanguages.slice(0, 16),
    stats,
    activityByDay,
  };

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, `${JSON.stringify(snapshot, null, 2)}\n`);
  mkdirSync(resolve(ROOT, 'public/data'), { recursive: true });
  writeFileSync(resolve(ROOT, 'public/data/snapshot.json'), `${JSON.stringify(snapshot)}\n`);

  const kb = (JSON.stringify(snapshot).length / 1024).toFixed(1);
  process.stdout.write(
    [
      '',
      `  accounts       ${profiles.map((p) => `${p.login}(${p.publicRepos})`).join('  ')}`,
      `  repos crawled  ${repos.length}  →  ledger ${ledger.length}, forks ${stats.forkedRepos}, archived ${stats.archivedRepos}`,
      `  stars          ${stats.totalStars}`,
      `  pushed 7/30/90 ${stats.pushed7d} / ${stats.pushed30d} / ${stats.pushed90d}`,
      `  events         ${events.length} (${meaningful.length} logged)`,
      `  languages      ${stats.languagesAll} distinct`,
      `  api calls      ${calls}`,
      `  snapshot       src/data/snapshot.json (${kb} KB)`,
      '',
    ].join('\n'),
  );
}

main().catch((error) => {
  process.stderr.write(`\nsync failed: ${error.message}\n`);
  process.exit(1);
});
