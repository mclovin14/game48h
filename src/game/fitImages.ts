import Phaser from 'phaser';
import SIZES from 'virtual:image-sizes';

// O CDN da Hostinger entrega imagem reduzida ao celular (a sheet 1024x128 chega 800x100).
// Sem quadros de 128 px a recortar, as animações saem vazias e o jogo trava em 100%.
// Aqui cada imagem volta ao tamanho original antes de virar quadros.

const files = new Map<string, { path: string; sheet?: Phaser.Types.Textures.SpriteSheetConfig }>();

/** Anota o caminho (e a grade, se for spritesheet) de cada imagem pedida. Chame no preload, antes dos load. */
export function trackImages(scene: Phaser.Scene): void {
  scene.load.on(Phaser.Loader.Events.ADD, (key: string, type: string, _loader: unknown, file: Phaser.Loader.File) => {
    if ((type !== 'image' && type !== 'spritesheet') || typeof file.url !== 'string') return;
    const path = file.url.split('?')[0].replace(/^\.\//, '');
    files.set(key, { path, sheet: type === 'spritesheet' ? (file.config as Phaser.Types.Textures.SpriteSheetConfig) : undefined });
  });
}

/** Redesenha no tamanho original (sem suavizar) toda imagem que chegou com outro tamanho. Chame no início do create. */
export function fitImages(scene: Phaser.Scene): void {
  const textures = scene.textures;
  for (const [key, { path, sheet }] of files) {
    const size = SIZES[path];
    if (!size || !textures.exists(key)) continue;
    const img = textures.get(key).getSourceImage() as HTMLImageElement;
    const [w, h] = size;
    if (img.width === w && img.height === h) continue;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, w, h);
    textures.remove(key);
    if (sheet) textures.addSpriteSheet(key, canvas as unknown as HTMLImageElement, sheet);
    else textures.addCanvas(key, canvas);
  }
}
