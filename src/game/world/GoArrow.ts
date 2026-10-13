import Phaser from 'phaser';
import { HEIGHT } from '../screen';

// Seta de "siga em frente" dos beat 'em ups: aparece quando uma barricada é vencida. Valores [TESTE].
const KEY = 'go_arrow';
const SCALE = 3;
/** Distância da borda direita da tela e altura (fração da tela). */
const EDGE_PX = 70;
const Y_FRAC = 0.4;
/** Pisca: acesa e apagada (ms). */
const ON_MS = 380;
const OFF_MS = 220;
/** Empurrão para a frente enquanto acesa (px na tela). */
const NUDGE_PX = 8;
/** Some depois que o Kael anda isto para a frente. */
const HIDE_AFTER_PX = 360;

export function loadGoArrow(scene: Phaser.Scene): void {
  scene.load.image(KEY, 'ui/go_arrow.png');
}

/** Presa na tela, do lado direito; `show` acende a partir da posição do Kael, `update` apaga quando ele avança. */
export class GoArrow {
  private readonly img: Phaser.GameObjects.Image;
  private fromX?: number;
  private shownAt = 0;

  constructor(private readonly scene: Phaser.Scene) {
    this.img = scene.add.image(0, Math.round(HEIGHT * Y_FRAC), KEY).setScale(SCALE).setScrollFactor(0).setDepth(950).setVisible(false);
  }

  show(kaelX: number): void {
    this.fromX = kaelX;
    this.shownAt = this.scene.time.now;
  }

  hide(): void {
    this.fromX = undefined;
    this.img.setVisible(false);
  }

  update(kaelX: number): void {
    if (this.fromX === undefined) return;
    if (kaelX - this.fromX >= HIDE_AFTER_PX) return this.hide();
    const t = (this.scene.time.now - this.shownAt) % (ON_MS + OFF_MS);
    const on = t < ON_MS;
    const nudge = on ? Math.round(NUDGE_PX * Math.sin((Math.PI * t) / ON_MS)) : 0;
    const right = this.scene.cameras.main.width - EDGE_PX;
    this.img.setVisible(on).setPosition(right - (this.img.displayWidth / 2) + nudge, this.img.y);
  }
}
