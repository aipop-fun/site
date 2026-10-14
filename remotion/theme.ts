/** Shared visual constants for the Remotion compositions.
 *  Values mirror src/styles/tokens.css — Remotion renders without the site CSS,
 *  so they are duplicated here on purpose.
 */
export const COLORS = {
  ink: '#07080a',
  inkRaised: '#0b0d11',
  inkSoft: '#101319',
  paper: '#e9e7e0',
  dim: '#b9b7ae',
  muted: '#6e7580',
  faint: '#4a5058',
  line: 'rgba(233,231,224,0.10)',
  lineSoft: 'rgba(233,231,224,0.05)',
  accent: '#ff3b14',
  phosphor: '#b4f52e',
  cyan: '#5fd8f5',
} as const;

export const FONT = "'Iosevka Ledger', 'Iosevka', ui-monospace, monospace";

export type Tone = 'accent' | 'phosphor' | 'cyan' | 'muted';

export function toneColor(tone: Tone, accent: string): string {
  switch (tone) {
    case 'accent':
      return accent;
    case 'phosphor':
      return COLORS.phosphor;
    case 'cyan':
      return COLORS.cyan;
    default:
      return COLORS.muted;
  }
}

/** Truncates to a character budget — monospace means width is predictable. */
export function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
