/** Shape of src/data/snapshot.json, produced by scripts/sync-github.mjs. */

export interface Profile {
  login: string;
  kind: 'User' | 'Organization';
  name: string | null;
  bio: string | null;
  avatar: string;
  followers: number;
  following: number;
  publicRepos: number;
  publicGists: number;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter: string | null;
  hireable: boolean;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface Repo {
  owner: string;
  name: string;
  desc: string | null;
  lang: string | null;
  stars: number;
  forks: number;
  issues: number;
  size: number;
  pushed: string;
  created: string;
  url: string;
  home: string | null;
  topics: string[];
  archived: boolean;
  fork: boolean;
  license: string | null;
}

export type EventKind =
  | 'PushEvent'
  | 'CreateEvent'
  | 'ReleaseEvent'
  | 'PullRequestEvent'
  | 'IssuesEvent'
  | 'PublicEvent'
  | 'ForkEvent';

export interface LedgerEvent {
  account: string;
  type: EventKind;
  repo: string | null;
  at: string;
  ref: string | null;
  refType: string | null;
  action: string | null;
  commits: number;
  message: string | null;
  release: string | null;
}

export interface Stats {
  totalRepos: number;
  trackedRepos: number;
  originalRepos: number;
  forkedRepos: number;
  archivedRepos: number;
  totalStars: number;
  totalForks: number;
  totalIssues: number;
  followers: number;
  totalGists: number;
  languages: number;
  languagesAll: number;
  pushed7d: number;
  pushed30d: number;
  pushed90d: number;
  latestPush: string | null;
  firstRepo: string;
  newestRepo: string;
}

export interface Counted {
  name: string;
  count: number;
}

export interface Snapshot {
  generatedAt: string;
  generator: string;
  accounts: string[];
  profiles: Profile[];
  repos: Repo[];
  events: LedgerEvent[];
  topRepos: Repo[];
  languageBreakdown: Counted[];
  stats: Stats;
  activityByDay: { date: string; count: number }[];
}

/** Compact payload handed to the Remotion compositions (and the <Player>).
 *  Declared as a type alias (not an interface) so it stays assignable to the
 *  `Record<string, unknown>` prop bag Remotion's Composition/Player expect. */
export type LedgerReelProps = {
  wordmark: string;
  role: string;
  origin: string;
  generatedAt: string;
  accent: string;
  /** Numeric mirror of stats[0].value, used for the count-up in the reel. */
  repoTotal: number;
  stats: { label: string; value: string }[];
  /** Language mix of the original work, as literal colours (no CSS vars in Remotion). */
  languages: { name: string; share: number; color: string }[];
  /** Most starred original repositories, for the panel footer. */
  topRepos: { name: string; stars: number; lang: string | null }[];
  ticks: {
    index: string;
    kind: string;
    repo: string;
    meta: string;
    tone: 'accent' | 'phosphor' | 'cyan' | 'muted';
  }[];
  activity: number[];
}
