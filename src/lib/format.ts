/** Formatting helpers — the ledger reads like an instrument, so numbers are compact. */

const LOCALE = 'en-US';

export function compact(value: number): string {
  if (value < 1000) return String(value);
  return new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function grouped(value: number): string {
  return new Intl.NumberFormat(LOCALE).format(value);
}

/** Zero-padded ledger index: 7 -> "007". */
export function index(value: number, width = 3): string {
  return String(value).padStart(width, '0');
}

const UNITS: [limit: number, seconds: number, label: string][] = [
  [60, 1, 's'],
  [3600, 60, 'min'],
  [86_400, 3600, 'h'],
  [2_592_000, 86_400, 'd'],
  [31_536_000, 2_592_000, 'mo'],
];

export function ago(iso: string | null, now = Date.now()): string {
  if (!iso) return 'never';
  const delta = Math.max(0, (now - Date.parse(iso)) / 1000);
  if (delta < 45) return 'just now';
  for (const [limit, divisor, label] of UNITS) {
    if (delta < limit) return `${Math.floor(delta / divisor)}${label} ago`;
  }
  return `${Math.floor(delta / 31_536_000)}y ago`;
}

export function stamp(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}Z`;
}

/** 2026-10-14T11:59:31Z -> "14 OCT 2026" */
export function dayLabel(iso: string): string {
  const d = new Date(iso);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${String(d.getUTCDate()).padStart(2, '0')} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function shortDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function duration(iso: string): string {
  const years = (Date.now() - Date.parse(iso)) / 31_536_000_000;
  return `${years.toFixed(1)}y`;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Rust: '#dea584',
  Python: '#3572a5',
  Solidity: '#aa6746',
  Go: '#00add8',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Elixir: '#6e4a7e',
  Erlang: '#b83998',
  PHP: '#4f5d95',
  Ruby: '#701516',
  Zig: '#ec915c',
  'C#': '#178600',
  'C++': '#f34b7d',
  C: '#555555',
  Clarity: '#5546ff',
  'Jupyter Notebook': '#da5b0b',
  Shell: '#89e051',
  Vue: '#41b883',
  Dart: '#00b4ab',
  Swift: '#f05138',
  Kotlin: '#a97bff',
  Java: '#b07219',
  Move: '#4a137a',
  Cairo: '#ff4a3d',
  Svelte: '#ff3e00',
  Astro: '#ff5a03',
  MDX: '#fcb32c',
  Makefile: '#427819',
  Dockerfile: '#384d54',
  Nix: '#7e7eff',
  Haskell: '#5e5086',
  Lua: '#000080',
  Perl: '#0298c3',
  R: '#198ce7',
  Scala: '#c22d40',
  Assembly: '#6e4c13',
  TeX: '#3d6117',
  PowerShell: '#012456',
  Clojure: '#db5855',
  'F#': '#b845fc',
  Elm: '#60b5cc',
  Julia: '#a270ba',
  Nim: '#ffc200',
  Odin: '#60affe',
  Gleam: '#ffaff3',
  V: '#4f87c4',
  Batchfile: '#c1f12e',
  SCSS2: '#c6538c',
  Godot: '#478cbf',
  GDScript: '#355570',
  Handlebars: '#f7931e',
  EJS: '#a91e50',
  Blade: '#f7523f',
  Pug: '#a86454',
};

export function languageColor(name: string | null): string {
  if (!name) return '#3a3f47';
  return LANGUAGE_COLORS[name] ?? '#6e7580';
}

export const EVENT_LABEL: Record<string, string> = {
  PushEvent: 'PUSH',
  CreateEvent: 'CREATE',
  ReleaseEvent: 'RELEASE',
  PullRequestEvent: 'PULL REQ',
  IssuesEvent: 'ISSUE',
  PublicEvent: 'PUBLIC',
  ForkEvent: 'FORK',
};

/** "refs/heads/feat/x" -> "feat/x", "refs/tags/v1" -> "v1" */
export function shortRef(ref: string | null): string | null {
  if (!ref) return null;
  return ref.replace(/^refs\/(heads|tags)\//, '');
}

export function hostOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] ?? null;
  }
}
