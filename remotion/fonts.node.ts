/**
 * Loads the self-hosted Iosevka cuts into the headless browser used by
 * `remotion render`. Imported for side effects by remotion/index.ts only — the
 * site itself lets the page's own @font-face rules do this job.
 */
import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

void Promise.all([
  loadFont({ family: 'Iosevka Ledger', url: staticFile('fonts/iosevka-400.woff2'), weight: '400' }),
  loadFont({ family: 'Iosevka Ledger', url: staticFile('fonts/iosevka-500.woff2'), weight: '500' }),
  loadFont({ family: 'Iosevka Ledger', url: staticFile('fonts/iosevka-700.woff2'), weight: '700' }),
]);
