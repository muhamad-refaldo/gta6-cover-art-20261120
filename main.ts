// main.ts — the entrypoint the grader runs (Node 22, standard library only).
// It hands the app in: copies app/ and screenshots/ from this repository into
// the output directory and writes dossier.json there with buildDossier from
// vendor/makefun-app.ts. It runs twice; both runs must write the same bytes,
// so it writes nothing with a timestamp and removes only the paths it owns
// inside the output directory (never the output directory itself).

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 256 * 1024 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function copyIntoOutput() {
  mkdirSync(outDir, { recursive: true });
  // Clear only the paths this program owns, so a second run writes exactly
  // the same bytes. The output directory itself is never removed: in the
  // grader it is a mount point.
  for (const name of ['app', 'screenshots', 'dossier.json']) {
    const target = join(outDir, name);
    if (existsSync(target)) rmSync(target, { recursive: true, force: true });
  }
  cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

function main() {
  copyIntoOutput();
  const dossier = buildDossier(outDir, dossierCaps);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

main();
