import Phaser from 'phaser';
import { FRAME, POLICE, textureKey } from '../anims/humanoid';
import { ALL_LOOKS, lookDef } from './Police';

// Troca de tom da farda no Boot: copia a sheet de cada cabeça num canvas e troca as 6 cores da farda.
// Rampas em assets/enemies/police/uniform_tones.json (tools/build_uniform_tones.py).

const TONES_KEY = 'uniform_tones';
export type Ramp = [number, number, number][];

export function loadUniformTones(scene: Phaser.Scene): void {
  scene.load.json(TONES_KEY, 'enemies/police/uniform_tones.json');
}

const pack = (r: number, g: number, b: number) => (r << 16) | (g << 8) | b;

/** Gera as texturas dos tons que não são o navy. Chamar no create do Boot, antes de registrar as animações. */
export function makeToneTextures(scene: Phaser.Scene): void {
  const tones = scene.cache.json.get(TONES_KEY) as Record<string, Ramp>;
  for (const look of ALL_LOOKS) {
    if (look.tone === 'navy') continue;
    const map = rampMap(tones.navy, tones[look.tone]);
    const src = POLICE[look.head];
    const dst = lookDef(look);
    for (const anim of src.anims) recolorSheet(scene, textureKey(src, anim), textureKey(dst, anim), map);
  }
}

/** Cor de origem (empacotada) -> cor nova, posição a posição nas duas rampas. */
export const rampMap = (from: Ramp, to: Ramp) => new Map<number, Ramp[number]>(from.map((c, i) => [pack(...c), to[i]]));

/** Copia uma spritesheet num canvas trocando as cores de `map`. Não faz nada se a textura já existe. */
export function recolorSheet(scene: Phaser.Scene, srcKey: string, dstKey: string, map: Map<number, Ramp[number]>): void {
  if (scene.textures.exists(dstKey)) return;
  const img = scene.textures.get(srcKey).getSourceImage() as HTMLImageElement;
  const tex = scene.textures.createCanvas(dstKey, img.width, img.height)!;
  const ctx = tex.context;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] === 0) continue;
    const to = map.get(pack(px[i], px[i + 1], px[i + 2]));
    if (to) [px[i], px[i + 1], px[i + 2]] = to;
  }
  ctx.putImageData(data, 0, 0);
  tex.refresh();
  // quadros numerados como os de uma spritesheet
  for (let f = 0; f < img.width / FRAME; f++) tex.add(f, 0, f * FRAME, 0, FRAME, FRAME);
}
