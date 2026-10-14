import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { variant } from './site.config';

const root = fileURLToPath(new URL('.', import.meta.url));

interface SnapshotLite {
  generatedAt: string;
  stats: { totalRepos: number; totalStars: number };
}

function readSnapshot(): SnapshotLite {
  try {
    return JSON.parse(readFileSync(`${root}src/data/snapshot.json`, 'utf8')) as SnapshotLite;
  } catch {
    return { generatedAt: new Date().toISOString(), stats: { totalRepos: 0, totalStars: 0 } };
  }
}

/** Injects config-driven meta/SEO and emits the static files GitHub Pages needs. */
function sitePlugin(): Plugin {
  const snapshot = readSnapshot();
  const generated = snapshot.generatedAt.slice(0, 10);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://github.com/developerfred',
        name: 'codingsh',
        alternateName: 'developerfred',
        url: 'https://github.com/developerfred',
        jobTitle: 'Blockchain engineer',
        knowsAbout: ['Solidity', 'Rust', 'Soroban', 'Ethereum', 'Stellar', 'TypeScript'],
        sameAs: [
          'https://github.com/developerfred',
          'https://github.com/aipop-fun',
          'https://twitter.com/Codingsh',
        ],
      },
      {
        '@type': 'WebSite',
        name: variant.title,
        url: variant.origin,
        description: variant.description,
        inLanguage: 'en',
        dateModified: snapshot.generatedAt,
      },
    ],
  };

  const head = `
    <title>${variant.title}</title>
    <meta name="description" content="${variant.description}" />
    <meta name="keywords" content="${variant.keywords.join(', ')}" />
    <meta name="author" content="codingsh" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="theme-color" content="${variant.themeColor}" />
    <meta name="color-scheme" content="dark" />
    <link rel="canonical" href="${variant.origin}/" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${variant.shortName}" />
    <meta property="og:title" content="${variant.title}" />
    <meta property="og:description" content="${variant.description}" />
    <meta property="og:url" content="${variant.origin}/" />
    <meta property="og:image" content="${variant.origin}/media/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${variant.title}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:creator" content="@Codingsh" />
    <meta name="twitter:title" content="${variant.title}" />
    <meta name="twitter:description" content="${variant.description}" />
    <meta name="twitter:image" content="${variant.origin}/media/og.png" />

    <meta name="generator" content="vite + remotion + iosevka" />
    <meta name="ledger:synced" content="${snapshot.generatedAt}" />
    <meta name="ledger:repos" content="${String(snapshot.stats.totalRepos)}" />
    <meta name="ledger:stars" content="${String(snapshot.stats.totalStars)}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  `;

  const robots = `User-agent: *
Allow: /

Sitemap: ${variant.origin}/sitemap.xml
`;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.w3.org/1999/sitemap-image/1.1 http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${variant.origin}/</loc>
    <lastmod>${generated}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

  const notFound = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>404 — signal lost · ${variant.shortName}</title>
    <link rel="icon" href="./favicon.svg" type="image/svg+xml" />
    <style>
      @font-face { font-family: Iosevka; src: url("./fonts/iosevka-400.woff2") format("woff2"); font-weight: 400; font-display: swap; }
      html, body { height: 100%; }
      body {
        margin: 0; display: grid; place-items: center; background: #07080a; color: #e8e6df;
        font-family: Iosevka, ui-monospace, monospace; letter-spacing: .01em;
      }
      .box { text-align: center; padding: 8vh 6vw; }
      .code { font-size: clamp(64px, 18vw, 220px); font-weight: 700; line-height: .82; letter-spacing: -.04em; }
      .code span { color: #ff3b14; }
      p { color: #6f7681; font-size: 14px; letter-spacing: .16em; text-transform: uppercase; }
      a { color: #e8e6df; text-decoration: none; border-bottom: 1px solid #ff3b14; padding-bottom: 2px; }
      a:hover { background: #ff3b14; color: #07080a; }
    </style>
  </head>
  <body>
    <div class="box">
      <div class="code">4<span>0</span>4</div>
      <p>off the ledger — no entry at this address</p>
      <p><a href="./">return to the ledger</a></p>
    </div>
  </body>
</html>
`;

  return {
    name: 'ledger-site',
    transformIndexHtml(html) {
      return html.replace('<!--site-head-->', head);
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
      this.emitFile({ type: 'asset', fileName: '404.html', source: notFound });
      // A custom domain is configured in GitHub Pages settings; only write the
      // CNAME into the artifact when a deploy explicitly opts in.
      if (process.env.SITE_CUSTOM_DOMAIN) {
        this.emitFile({
          type: 'asset',
          fileName: 'CNAME',
          source: `${process.env.SITE_CUSTOM_DOMAIN}\n`,
        });
      }
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), sitePlugin()],
  // site.config.ts resolves the brand from this identifier; inlining it keeps
  // the browser bundle free of any `process` lookup.
  define: {
    __SITE_VARIANT__: JSON.stringify(variant.id),
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsInlineLimit: 2048,
    cssCodeSplit: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          remotion: ['remotion', '@remotion/player'],
        },
      },
    },
  },
  server: { port: 5173, host: '127.0.0.1' },
  preview: { port: 4173, host: '127.0.0.1' },
});
