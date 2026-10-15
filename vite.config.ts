import { globSync, readFileSync, rmSync } from 'node:fs';
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

/** Tamanho original de cada PNG de assets/ (lido do cabeçalho), para o jogo desfazer a redução que o CDN faz no celular. */
function imageSizes(): Plugin {
  const id = 'virtual:image-sizes';
  return {
    name: 'image-sizes',
    resolveId: (source) => (source === id ? `\0${id}` : undefined),
    load(source) {
      if (source !== `\0${id}`) return;
      const sizes: Record<string, [number, number]> = {};
      for (const f of globSync('assets/**/*.png')) {
        if (f.includes('/drafts/')) continue;
        const b = readFileSync(f);
        sizes[f.slice('assets/'.length)] = [b.readUInt32BE(16), b.readUInt32BE(20)];
      }
      return `export default ${JSON.stringify(sizes)};`;
    },
  };
}

// assets/ é servida como está: o Phaser carrega 'player/...' e 'enemies/...' sem copiar nada.
// base './': o build funciona em qualquer pasta do servidor (itch.io, GitHub Pages, subpasta).
export default defineConfig({
  base: './',
  // muda a cada build: vai na URL dos arquivos do jogo para nenhum cache (navegador, CDN da hospedagem) servir a versão antiga
  define: { __BUILD_ID__: JSON.stringify(Date.now().toString(36)) },
  plugins: [react(), imageSizes(), dropDrafts()],
  publicDir: 'assets',
});
