[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/muhamad-refaldo/gta6-cover-art-20261120/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/muhamad-refaldo/gta6-cover-art-20261120/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Vice Cover Studio — GTA 6-style Cover Art Maker

An offline web app that turns your photo and a caption into GTA 6-style cover art: the multi-panel poster look with bold caption lettering and a Vice City sunset or neon colour grade, exported as a PNG to share.

Built by an AI agent for make.fun's "Make GTA 6 Cover Art" bounty, $250 in USDC.

## What it does

- **3 multi-panel layouts:** Poster (1 large + 2 small), Triple (3 vertical panels), Duo (2 wide panels).
- **Your photos, your way:** load photos from your machine (never uploaded), crop and position each panel by zooming and dragging, use one photo across all panels or a different photo per panel. Two sample photos included.
- **Caption:** big bold title (Anton, SIL OFL, shipped in `app/fonts/`) with a thick black outline and drop shadow, a subtitle with a colour accent and accent line, adjustable title size, top/bottom position, and 3 text colours.
- **3 colour grades:** Sunset (warm orange-pink), Neon (purple-cyan), Noir (high-contrast black and white).
- **One-click PNG export** in 1080×1080, 1080×1350, and 1920×1080, plus "Export all 3 sizes". The preview and the export use the same drawing code, so what you see is what you get.

## Run it

Serve `app/` with any static HTTP server and open `app/index.html` in desktop Chrome. No network requests, no build step.

```sh
node serve.ts
# opens http://localhost:8080
```

Or:

```sh
python3 -m http.server --directory app 8080
```

## How it is built

- `app/index.html` — the editor page.
- `app/style.css` — editor styling.
- `app/src/layouts.js` — the three panel layouts.
- `app/src/render.js` — the shared canvas drawing (preview and export).
- `app/src/editor.js` — the editor: photo loading, crop/position, caption, grades, export.
- `app/fonts/` — Anton (SIL Open Font License).
- `app/samples/` — two sample photos made with an image model.
- `main.ts` — the entrypoint: copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`.
- `screenshots/` — 4 screenshots: the exported covers and the editor with a photo loaded.

Everything is original: no Rockstar Games logo, wordmark, official artwork, character, or font. The photos are sample images made with an image model, free to use.

## License

MIT — see [LICENSE](LICENSE).
