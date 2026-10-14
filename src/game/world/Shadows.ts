import Phaser from 'phaser';
import type { Humanoid } from '../anims/humanoid';

// Sombra redonda nos pés (plano playtest_fixes_2.md, fase 3): uma elipse de pixel duro, preta e translúcida,
// presa ao chão. Um só Graphics criado antes dos personagens, então todas as sombras ficam atrás de todos eles.
// A largura vem dos pixels do quadro perto do chão: em pé cobre os pés, deitado cobre o corpo. Números [TESTE].

/** Alfa da sombra no chão e altura da elipse (px). */
const ALPHA = 0.45; // [TESTE]
const HEIGHT = 6; // [TESTE]
/** Linhas do quadro, a partir do chão, que contam para a largura; folga de cada lado; mínimo e máximo. */
const ROWS = 4;
const PAD = 3; // [TESTE]
const MIN_W = 18; // [TESTE]
const MAX_W = 110;
/** A largura e o centro seguem o quadro sem pular (fração por segundo). */
const EASE = 14;
/** No pulo: nesta altura (px) a sombra chega ao menor tamanho e ao alfa mais fraco. */
const AIR_H = 90; // [TESTE]
const AIR_MIN = 0.45;

interface Track {
  /** Largura e centro (em relação ao x do corpo), suavizados. */
  w: number;
  cx: number;
}

/** Sombras de cada cena: o Humanoid se inscreve ao nascer. */
const byScene = new WeakMap<Phaser.Scene, Shadows>();

export function shadowsOf(scene: Phaser.Scene): Shadows | undefined {
  return byScene.get(scene);
}

export class Shadows {
  private readonly gfx: Phaser.GameObjects.Graphics;
  private readonly tracked = new Map<Humanoid, Track>();
  /** Alfa de cada sheet (lido uma vez) e a faixa de pixels perto do chão de cada quadro. */
  private readonly alpha = new Map<string, { data: Uint8ClampedArray; w: number }>();
  private readonly spans = new Map<string, [number, number] | null>();

  constructor(
    scene: Phaser.Scene,
    private readonly groundY: number,
  ) {
    this.gfx = scene.add.graphics();
    byScene.set(scene, this);
    // depois do update da cena e dos tweens: a sombra segue a posição final do quadro
    const tick = (_t: number, delta: number) => this.update(delta);
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, tick);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.events.off(Phaser.Scenes.Events.POST_UPDATE, tick);
      byScene.delete(scene);
    });
  }

  add(h: Humanoid): void {
    this.tracked.set(h, { w: MIN_W, cx: 0 });
  }

  private update(delta: number): void {
    const g = this.gfx.clear();
    const k = Math.min(1, (EASE * delta) / 1000);
    for (const [h, tr] of this.tracked) {
      if (!h.scene) {
        this.tracked.delete(h);
        continue;
      }
      if (!h.visible || h.alpha <= 0) continue;
      const span = this.span(h);
      if (span) {
        // o quadro está virado para East; espelhado, a faixa troca de lado
        const [a, b] = h.facing === 1 ? span : [-span[1], -span[0]];
        tr.w += (Phaser.Math.Clamp(b - a + 1 + PAD * 2, MIN_W, MAX_W) - tr.w) * k;
        tr.cx += ((a + b) / 2 - tr.cx) * k;
      }
      const air = Phaser.Math.Clamp((this.groundY - h.y) / AIR_H, 0, 1);
      const size = 1 - (1 - AIR_MIN) * air;
      this.ellipse(g, h.x + tr.cx, tr.w * size, ALPHA * h.alpha * size);
    }
  }

  /** Elipse de pixel duro, linha por linha, centrada na linha do pé. */
  private ellipse(g: Phaser.GameObjects.Graphics, cx: number, w: number, alpha: number): void {
    g.fillStyle(0x000000, alpha);
    const top = this.groundY - 1 - (HEIGHT >> 1);
    for (let r = 0; r < HEIGHT; r++) {
      const dy = (r + 0.5) / HEIGHT - 0.5;
      const half = Math.round((w / 2) * Math.sqrt(1 - 4 * dy * dy));
      if (half > 0) g.fillRect(Math.round(cx) - half, top + r, half * 2, 1);
    }
  }

  /** Primeira e última coluna com pixel nas ROWS linhas de baixo do quadro, em relação ao x do corpo; null = nada perto do chão (no ar). */
  private span(h: Humanoid): [number, number] | null {
    const f = h.frame;
    const key = `${f.texture.key}:${f.name}`;
    if (this.spans.has(key)) return this.spans.get(key)!;
    const img = this.sheetAlpha(f.texture);
    let lo = Infinity;
    let hi = -Infinity;
    if (img) {
      const floor = Math.round(h.displayOriginY) - 1;
      for (let y = Math.max(0, floor - ROWS + 1); y <= floor && y < f.cutHeight; y++) {
        for (let x = 0; x < f.cutWidth; x++) {
          if (img.data[(f.cutY + y) * img.w + f.cutX + x] > 0) {
            lo = Math.min(lo, x);
            hi = Math.max(hi, x);
          }
        }
      }
    }
    const out: [number, number] | null = lo <= hi ? [lo - h.displayOriginX, hi - h.displayOriginX] : null;
    this.spans.set(key, out);
    return out;
  }

  private sheetAlpha(tex: Phaser.Textures.Texture): { data: Uint8ClampedArray; w: number } | undefined {
    const cached = this.alpha.get(tex.key);
    if (cached) return cached;
    const src = tex.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const canvas = document.createElement('canvas');
    canvas.width = src.width;
    canvas.height = src.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return undefined;
    ctx.drawImage(src, 0, 0);
    const rgba = ctx.getImageData(0, 0, src.width, src.height).data;
    const data = new Uint8ClampedArray(src.width * src.height);
    for (let i = 0; i < data.length; i++) data[i] = rgba[i * 4 + 3];
    const out = { data, w: src.width };
    this.alpha.set(tex.key, out);
    return out;
  }
}
