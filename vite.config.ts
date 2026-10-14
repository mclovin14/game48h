import { globSync, rmSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** Tira do dist/ o que o jogo não carrega: rascunhos do PixelLab (drafts/) e gravações brutas (sounds/source/). */
function dropDrafts(): Plugin {
  return {
    name: 'drop-drafts',
    apply: 'build',
    closeBundle() {
      for (const dir of globSync('dist/**/{drafts,source}')) rmSync(dir, { recursive: true, force: true });
    },
  };
}

// assets/ é servida como está: o Phaser carrega 'player/...' e 'enemies/...' sem copiar nada.
// base './': o build funciona em qualquer pasta do servidor (itch.io, GitHub Pages, subpasta).
export default defineConfig({
  base: './',
  // muda a cada build: vai na URL dos arquivos do jogo para nenhum cache (navegador, CDN da hospedagem) servir a versão antiga
  define: { __BUILD_ID__: JSON.stringify(Date.now().toString(36)) },
  plugins: [react(), dropDrafts()],
  publicDir: 'assets',
});
