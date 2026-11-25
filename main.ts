import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputRoot = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(from: string, to: string): void {
  if (!existsSync(from)) return;
  cpSync(from, to, { recursive: true });
}

mkdirSync(outputRoot, { recursive: true });
copyTree(join(repoRoot, 'game'), join(outputRoot, 'game'));
mkdirSync(join(outputRoot, 'screenshots'), { recursive: true });
copyTree(join(repoRoot, 'screenshots'), join(outputRoot, 'screenshots'));

const dossierOptions = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

const dossier = buildDossier(outputRoot, dossierOptions);

writeFileSync(join(outputRoot, 'dossier.json'), dossier);
