#!/usr/bin/env node
/**
 * Visual verification: serves dist/ and screenshots it with the local Chrome
 * through puppeteer-core (the same CDP path Remotion uses).
 *
 *   node scripts/verify.mjs
 *   node scripts/verify.mjs --only=desktop
 *
 * Output: out/verify/{desktop,mobile}-{hero,full}.png
 */
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, 'out/verify');
const PORT = Number(process.env.PORT ?? 4178);

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1000, scale: 2 },
  { name: 'mobile', width: 390, height: 844, scale: 3 },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.mp4': 'video/mp4',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

const only = process.argv.find((arg) => arg.startsWith('--only='))?.split('=')[1];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!existsSync(DIST)) {
  process.stderr.write('dist/ is missing — run `pnpm build` first.\n');
  process.exit(1);
}

const chrome = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
if (!chrome) {
  process.stderr.write(`no Chrome found. Tried:\n  ${CHROME_CANDIDATES.join('\n  ')}\n`);
  process.exit(1);
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let filePath = join(DIST, normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, ''));
  if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, 'index.html');
  if (!existsSync(filePath)) filePath = join(DIST, '404.html');
  if (!existsSync(filePath)) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[extname(filePath)] ?? 'application/octet-stream' });
  createReadStream(filePath).pipe(res);
});

await new Promise((ready) => server.listen(PORT, '127.0.0.1', ready));
const origin = `http://127.0.0.1:${PORT}/`;
process.stdout.write(`serving dist/ on ${origin}\n`);

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  userDataDir: join(OUT, '.chrome-profile'),
  protocolTimeout: 120_000,
  args: [
    // Chrome refuses to start under a sandboxed/hardened runner without these
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-breakpad',
    '--disable-crash-reporter',
    '--no-crash-upload',
    '--disable-features=Translate,BackForwardCache',
    '--disable-gpu',
    '--mute-audio',
    '--hide-scrollbars',
    '--font-render-hinting=none',
  ],
});

const report = [];

for (const viewport of VIEWPORTS) {
  if (only && viewport.name !== only) continue;

  const page = await browser.newPage();
  await page.setViewport({
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.scale,
  });
  // Review the finished state, not a frame of the entrance animation: the
  // reduced-motion path renders every value and reveal at rest.
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(origin, { waitUntil: 'networkidle2', timeout: 90_000 });

  // Walk the document so every [data-reveal] fires, then come back to the top.
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });
  await sleep(2200);

  const hero = join(OUT, `${viewport.name}-hero.png`);
  await page.screenshot({ path: hero });
  report.push([`${viewport.name}-hero`, statSync(hero).size]);

  const full = join(OUT, `${viewport.name}-full.png`);
  await page.screenshot({ path: full, fullPage: true });
  report.push([`${viewport.name}-full`, statSync(full).size]);

  const metrics = await page.evaluate(() => ({
    height: document.body.scrollHeight,
    fontLoaded: document.fonts.check('700 96px "Iosevka Ledger"'),
    sections: [...document.querySelectorAll('section[id], footer')].map((el) => el.id || 'footer'),
    consoleErrors: 0,
  }));
  process.stdout.write(
    `  ${viewport.name}: page ${metrics.height}px · iosevka ${metrics.fontLoaded ? 'loaded' : 'MISSING'} · ${metrics.sections.join(' → ')}\n`,
  );

  // Section-by-section clips at 1x, so each band can be reviewed full size.
  if (!only || only === viewport.name) {
    await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 1 });
    await sleep(400);
    const sections = await page.$$('section[id], footer');
    for (const handle of sections) {
      const id = await handle.evaluate((el) => el.id || 'footer');
      const target = join(OUT, `${viewport.name}-${id}.png`);
      try {
        await handle.screenshot({ path: target });
        report.push([`${viewport.name}-${id}`, statSync(target).size]);
      } catch (error) {
        process.stderr.write(`  clip ${id} failed: ${error.message}\n`);
      }
    }
  }

  await page.close();
}

for (const [name, size] of report) {
  process.stdout.write(`  ${name.padEnd(16)} ${(size / 1024).toFixed(0)} KB\n`);
}

await browser.close();
server.close();
