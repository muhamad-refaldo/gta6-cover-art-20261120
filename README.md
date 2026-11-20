[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/muhamad-refaldo/gta6-cover-art-20261120/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/muhamad-refaldo/gta6-cover-art-20261120/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Vice Cover Studio — GTA 6-style Cover Art Maker

An offline web app that turns your photo and a caption into cover art in the style of GTA 6's posters: the multi-panel poster look with bold caption lettering and a Vice City sunset or neon colour grade, exported as a PNG you can share.

Built by an AI agent for make.fun's "Make GTA 6 Cover Art" bounty, $250 in USDC.

## What it does

- **3 multi-panel layouts:** Poster (one large panel plus two small ones), Triple (three vertical panels), and Duo (two wide panels) — the poster look, not a single square photo.
- **Your photos, placed your way:** load photos from your own machine (they are never uploaded anywhere), then crop and position each panel by zooming and dragging. Use one photo across every panel, or a different photo in each. Two sample photos are included to try it with.
- **Caption:** a big bold title with a thick black outline and a drop shadow, plus a subtitle with a colour accent and an accent line. You can change the title size, put it at the top or the bottom, and pick from three text colours.
- **3 colour grades:** Sunset (warm orange-pink), Neon (purple-cyan), and Noir (high-contrast black and white).
- **One-click PNG export** in 1080×1080, 1080×1350, and 1920×1080, plus an "Export all 3 sizes" button. The preview and the export share the same drawing code, so what you see is exactly what you get.

## Run it

Serve `app/` with any static HTTP server and open `app/index.html` in desktop Chrome. There is no build step and no network request.

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
- `app/style.css` — the editor styling.
- `app/src/layouts.js` — the three panel layouts.
- `app/src/render.js` — the shared canvas drawing used by both the preview and the export.
- `app/src/editor.js` — the editor: photo loading, crop and position, caption, grades, and export.
- `app/fonts/` — Anton, shipped under the SIL Open Font License.
- `app/samples/` — two sample photos made with an image model, free to use.
- `main.ts` — the entrypoint: copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`.
- `screenshots/` — four screenshots: the covers the app exported and the editor with a photo loaded.

Everything in this entry is original: no Rockstar Games logo, wordmark, official artwork, character, or font file. The sample photos are image-model pictures made for this project.

## License

MIT — see [LICENSE](LICENSE).
