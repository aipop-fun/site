# codingsh — the build ledger

An auto-updating landing page for the work of **[developerfred](https://github.com/developerfred)**
and **[aipop-fun](https://github.com/aipop-fun)**. Nothing on it is written by hand: a scheduled
GitHub Action crawls the public API, folds every repository into one JSON snapshot, and rebuilds the
whole site — page, index, social card and video — from that single file.

- **Live:** <https://developerfred.github.io>
- **Studio edition:** <https://aipop-fun.github.io/site> (same engine, `SITE_VARIANT=aipop`)
- **Type:** [Iosevka](https://typeof.net/Iosevka/) — subsetted and self-hosted
- **Motion:** [Remotion](https://remotion.dev) 4 — one React component, two outputs (live
  `<Player>` in the hero, MP4 in the pipeline)

## What is on the page

| Band | What it is |
| --- | --- |
| `001` hero | Kinetic Remotion `BuildLog` reel playing the last 14 logged events, plus live read-outs |
| `002` signal | Instrument panel: repositories, original work, stars, language mix, 21-day activity |
| `003` index | A printed datasheet of every non-fork repository — filter by account, language, sort, search |
| `004` pipeline | How the page updates itself, the real transcript of the last sync, and the Iosevka specimen |
| `005` reel | The rendered MP4 next to the same composition running live in the browser, and both CLI commands |

## How it updates itself

```
cron 0 */6 * * *  →  pnpm sync  →  src/data/snapshot.json  →  tsc --noEmit && vite build  →  GitHub Pages
```

1. `.github/workflows/deploy.yml` runs on a six-hour schedule, on push, and on demand.
2. `scripts/sync-github.mjs` walks `/users/{login}/repos` for both accounts (18 API calls for 1,234
   repositories), reads the public event feed, and writes a ~73 KB snapshot.
3. `vite build` renders everything from that snapshot. `vite.config.ts` also injects the meta tags,
   JSON-LD, `sitemap.xml`, `robots.txt` and the styled `404.html`.
4. `actions/deploy-pages` publishes the static artifact. No server, no database, no CMS.
5. `.github/workflows/reel.yml` (weekly, or on demand) re-renders `public/media/build-log.mp4` and
   `public/media/og.png` with Remotion and commits them back.

If the GitHub API is ever unreachable, the sync step is `continue-on-error` and the build falls back
to the committed snapshot — the site can stale, it cannot break.

## Local development

```bash
pnpm install
pnpm sync          # refresh src/data/snapshot.json from the GitHub API
pnpm dev           # http://127.0.0.1:5173
pnpm typecheck
pnpm build         # tsc --noEmit && vite build
pnpm preview
pnpm verify        # screenshots dist/ into out/verify/ via local Chrome
```

`pnpm sync` picks up a token from `GITHUB_TOKEN` / `GH_TOKEN`, then falls back to the local
`~/.git-credentials` entry, then to anonymous (60 req/h — not enough for a full crawl).

### Remotion

```bash
pnpm remotion:studio     # edit BuildLog / OgCard with a timeline
pnpm remotion:still      # OgCard  → public/media/og.png
pnpm remotion:render     # BuildLog → public/media/build-log.mp4
```

`remotion/BuildLog.tsx` and `remotion/OgCard.tsx` are plain React components. The site mounts them
through `@remotion/player` (lazily, so the 430 KB player chunk never blocks first paint) and the CLI
renders the identical component to H.264.

### Fonts

Iosevka's latin cuts are ~1 MB each. `scripts/build-fonts.mjs` subsets three weights down to the
ASCII/Latin-1 + interface symbols this page can render using harfbuzz compiled to wasm, taking
2.8 MB → **261 KB**. The results are committed, so CI never needs a font toolchain:

```bash
pnpm fonts    # regenerates public/fonts/*.woff2 and src/styles/fonts.css
```

Iosevka is licensed under the SIL Open Font License 1.1; the full text ships at
`public/fonts/OFL.txt`.

## Publishing the second surface

Both surfaces are the same codebase, switched by one environment variable:

```bash
SITE_VARIANT=aipop pnpm build
```

| Variant | Repository | Canonical origin |
| --- | --- | --- |
| `developerfred` | `developerfred/developerfred.github.io` | `https://developerfred.github.io` |
| `aipop` | `aipop-fun/site` | `https://aipop-fun.github.io/site` |

`deploy.yml` derives the variant from `github.repository`, so the identical workflow publishes the
right brand in each repository — nothing to keep in sync by hand.

Two things worth knowing when wiring a new surface:

- **Pages must be set to "GitHub Actions"**, not the legacy branch build. For a repository literally
  named `<user>.github.io`, GitHub enables the legacy build automatically, and it will happily publish
  the raw sources. Check with
  `curl -H "Authorization: Bearer $TOKEN" https://api.github.com/repos/OWNER/REPO/pages` and switch
  with `-X PUT -d '{"build_type":"workflow"}'` if it says `"build_type": "legacy"`.
- **For a custom domain**, set it in **Settings → Pages → Custom domain**. To also write a `CNAME`
  file into the artifact, build with `SITE_CUSTOM_DOMAIN=aipop.fun`.
- **If a deployment ever reports `Deployment request failed … due to in progress deployment`**, the
  Pages queue is stuck behind a deployment that was superseded mid-flight. It cannot be cancelled
  through the REST API (the cancel endpoint wants an internal Pages id). Two ways out: cancel it by
  hand in the repository's Actions UI, or set the repository variable `PAGES_PUBLISH=branch` and
  switch Pages → Source to *Deploy from a branch: gh-pages*. `deploy.yml` then publishes through
  `peaceiris/actions-gh-pages` instead, which never touches the Pages deployments API. That is how
  `aipop-fun/site` is published.

```bash
# flip a repository to the branch publisher
curl -X POST -H "Authorization: Bearer $TOKEN" \
  https://api.github.com/repos/OWNER/REPO/actions/variables \
  -d '{"name":"PAGES_PUBLISH","value":"branch"}'
```

Remotion is free for individuals and small teams; companies above its threshold need a Remotion
license — see <https://remotion.dev/license>.

## Structure

```
site.config.ts            brand/variant switch (wordmark, copy, origin, accounts)
scripts/sync-github.mjs   GitHub API → src/data/snapshot.json
scripts/build-fonts.mjs   Iosevka → subsetted woff2 (wasm)
scripts/verify.mjs        dist/ → screenshots at desktop + mobile
src/lib/                  snapshot types, derivations, formatters, hooks
src/components/           Nav, Hero, Signal, Datasheet, Pipeline, Reel, Footer
src/styles/               tokens, base, generated @font-face
remotion/                 BuildLog (video), OgCard (still), Root, fonts.node
.github/workflows/        deploy.yml (cron + Pages), reel.yml (Remotion render)
```

## Accessibility & performance notes

- Every animation is gated behind `prefers-reduced-motion`; the reduced path renders the finished
  state immediately (count-ups jump to their value, the Marquees and the MP4 stop, reveals are
  static).
- The repository index is a real link list with `role="table"` semantics, labelled controls and a
  skip link; focus rings use the accent colour at 2 px.
- Initial payload: ~73 KB gzipped JS + 7 KB CSS + two preloaded font cuts (87 KB each). The Remotion
  player chunk (125 KB gzipped) is fetched after first paint.
- `pnpm verify` is the guard rail for layout regressions: it captures the hero, every band and both
  breakpoints, and fails loudly if Chrome is missing.
