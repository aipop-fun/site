import { variant } from '../../site.config';
import { buildReelProps } from './data';
import type { LedgerReelProps } from './types';

/** Signal colour as a literal — Remotion compositions cannot read CSS variables. */
export const REEL_ACCENT = variant.id === 'aipop' ? '#c6ff3d' : '#ff3b14';

/**
 * The single payload shared by the site's <Player> and the CLI renderer, built
 * from the freshly synced snapshot.
 */
export const reelProps: LedgerReelProps = buildReelProps({
  wordmark: variant.wordmark,
  role: variant.role,
  origin: variant.origin,
  accent: REEL_ACCENT,
});
