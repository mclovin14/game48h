import Phaser from 'phaser';
import { MAX_WIDTH, HEIGHT } from '../screen';
import { lerpColors, smoothstep } from './DayCycle';

// Céu feito no código: degradê vertical que muda com o tempo, e estrelas que aparecem à noite.
// Cores tiradas dos conceitos A (entardecer) e B (anoitecer) da quadra 1.

/** Cores de cima para baixo em cada momento. Todas as linhas têm o mesmo número de pontos. */
const DUSK = [0xb06784, 0xde7570, 0xf58865, 0xf8a072, 0xfab973];
const TWILIGHT = [0x2d1654, 0x3d1768, 0x962c6a, 0xc8506a, 0xe17069];
const NIGHT = [0x07081a, 0x0e1030, 0x1a1c48, 0x272a5c, 0x3a3466];
const STOPS = [0, 0.3, 0.55, 0.78, 1];

const KEY = 'sky_gradient';
const STAR_COUNT = 90;

export class Sky {
  private readonly canvas: Phaser.Textures.CanvasTexture;
  private readonly stars: Phaser.GameObjects.Graphics;
  private lastT = -1;

  constructor(scene: Phaser.Scene) {
    // 1 px de largura esticado na tela: redesenhar a cada quadro custa pouco
    if (scene.textures.exists(KEY)) scene.textures.remove(KEY);
    this.canvas = scene.textures.createCanvas(KEY, 1, HEIGHT)!;
    scene.add.image(0, 0, KEY).setOrigin(0).setDisplaySize(MAX_WIDTH, HEIGHT).setScrollFactor(0);

    // estrelas fixas na tela (fator 0), só na metade de cima
    const rng = new Phaser.Math.RandomDataGenerator(['quadra1']);
    this.stars = scene.add.graphics().setScrollFactor(0);
    for (let i = 0; i < STAR_COUNT; i++) {
      const bright = rng.frac() < 0.2;
      this.stars.fillStyle(bright ? 0xfff4d8 : 0xb8bce0, bright ? 1 : 0.7);
      this.stars.fillRect(rng.between(0, MAX_WIDTH), rng.between(0, HEIGHT * 0.45), 1, 1);
    }
  }

  update(t: number): void {
    if (Math.abs(t - this.lastT) < 0.002) return;
    this.lastT = t;
    const ctx = this.canvas.context;
    const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    for (let i = 0; i < STOPS.length; i++) {
      const c = lerpColors([DUSK[i], TWILIGHT[i], NIGHT[i]], t);
      grad.addColorStop(STOPS[i], `#${c.toString(16).padStart(6, '0')}`);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1, HEIGHT);
    this.canvas.refresh();
    this.stars.setAlpha(smoothstep(0.55, 0.95, t));
  }
}
