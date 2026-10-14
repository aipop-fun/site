/**
 * Single source of truth for the two published surfaces.
 *
 *   developerfred  -> https://developerfred.github.io   (personal build ledger)
 *   aipop          -> https://aipop-fun.github.io       (studio edition)
 *
 * The build reads SITE_VARIANT (default: developerfred) so both repositories can
 * ship the exact same engine with a different face.
 */

export type VariantId = 'developerfred' | 'aipop';

export interface BrandVariant {
  id: VariantId;
  /** Repo that hosts this variant, e.g. "developerfred/developerfred.github.io" */
  repository: string;
  /** Primary GitHub account whose activity leads the page. */
  owner: string;
  /** Every account aggregated into the ledger, in display order. */
  accounts: string[];
  /** Canonical origin, no trailing slash. */
  origin: string;
  /** Custom domain written to public/CNAME when set (aipop.fun). */
  customDomain?: string;
  title: string;
  shortName: string;
  wordmark: string;
  role: string;
  tagline: string;
  description: string;
  keywords: string[];
  themeColor: string;
  accent: 'vermilion' | 'phosphor';
}

export const VARIANTS: Record<VariantId, BrandVariant> = {
  developerfred: {
    id: 'developerfred',
    repository: 'developerfred/developerfred.github.io',
    owner: 'developerfred',
    accounts: ['developerfred', 'aipop-fun'],
    origin: 'https://developerfred.github.io',
    title: 'codingsh — the build ledger',
    shortName: 'codingsh',
    wordmark: 'codingsh',
    role: 'Blockchain engineer · white hat · bridge builder',
    tagline: 'Every repository I ship, printed the moment it happens.',
    description:
      'An auto-updating ledger of everything codingsh builds — 1,200+ public repositories across developerfred and aipop.fun, synced straight from the GitHub API and rebuilt every six hours.',
    keywords: [
      'codingsh',
      'developerfred',
      'aipop.fun',
      'blockchain developer',
      'solidity',
      'rust',
      'soroban',
      'stellar',
      'ethereum',
      'build ledger',
    ],
    themeColor: '#07080a',
    accent: 'vermilion',
  },
  aipop: {
    id: 'aipop',
    repository: 'aipop-fun/site',
    owner: 'aipop-fun',
    accounts: ['aipop-fun', 'developerfred'],
    origin: 'https://aipop-fun.github.io/site',
    customDomain: 'aipop.fun', // documented, not emitted — set SITE_CUSTOM_DOMAIN to write it
    title: 'aipop.fun — weaving code into magic',
    shortName: 'aipop.fun',
    wordmark: 'aipop.fun',
    role: 'Creative studio & tech lab',
    tagline: 'The lab ledger — what the studio shipped, as it ships.',
    description:
      'aipop.fun is a creative studio and tech lab. This is the auto-updating ledger of every repository the studio ships, synced from the GitHub API and rebuilt every six hours.',
    keywords: [
      'aipop.fun',
      'creative studio',
      'tech lab',
      'ai agents',
      'x402',
      'solana',
      'base',
      'onchain',
    ],
    themeColor: '#08070a',
    accent: 'phosphor',
  },
};

/**
 * Brand selection, resolved once per build.
 *
 * Vite replaces `__SITE_VARIANT__` with a string literal (see `define` in
 * vite.config.ts) — a plain identifier, so the substitution cannot be masked by
 * a `typeof process` guard the way an env lookup can.
 *
 * Everywhere else (the Remotion webpack bundle, node scripts) the identifier is
 * genuinely undefined, `typeof` is safe on it, and we fall back to the real
 * environment.
 */
declare const __SITE_VARIANT__: string | undefined;
declare const process: { env: Record<string, string | undefined> } | undefined;

function envVariant(): string | undefined {
  if (typeof __SITE_VARIANT__ !== 'undefined') return __SITE_VARIANT__;
  if (typeof process === 'undefined') return undefined;
  return process.env.SITE_VARIANT;
}

export function resolveVariant(raw = envVariant()): BrandVariant {
  const id = (raw ?? 'developerfred').trim().toLowerCase();
  if (id === 'aipop' || id === 'aipop-fun' || id === 'aipop.fun') return VARIANTS.aipop;
  return VARIANTS.developerfred;
}

export const variant: BrandVariant = resolveVariant();

/** Both accounts, always aggregated, whichever variant leads. */
export const ALL_ACCOUNTS = ['developerfred', 'aipop-fun'] as const;

export default variant;
