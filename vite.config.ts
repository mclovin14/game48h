import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// assets/ é servida como está: o Phaser carrega 'player/...' e 'enemies/...' sem copiar nada.
export default defineConfig({
  plugins: [react()],
  publicDir: 'assets',
});
