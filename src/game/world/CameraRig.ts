import Phaser from 'phaser';
import { HEIGHT } from '../screen';
import type { Humanoid } from '../anims/humanoid';

// Valores provisórios [TESTE] da câmera.
const DEADZONE_FRAC = 1 / 4; // fração da largura em que o Kael anda sem a câmera mexer
const LERP_X = 0.12; // quanto a câmera alcança o alvo por quadro (1 = na hora)
const LOOKAHEAD = 120; // px à frente do lado em que o Kael olha
const LOOKAHEAD_MS = 900; // tempo para o olhar à frente trocar de lado

/**
 * Câmera de rolagem lateral: zona morta no meio da tela, olhar à frente suave,
 * suavização e limites no tamanho da fase. Só segue no eixo X (ainda não há pulo).
 */
export class CameraRig {
  private readonly cam: Phaser.Cameras.Scene2D.Camera;
  private look = 0;
  private debug?: Phaser.GameObjects.Graphics;
  /** Centro da arena enquanto a câmera está travada. */
  private lockX?: number;
  /** A câmera segue este ponto: o Kael, ou o centro da arena quando travada (trocar de alvo pularia a câmera). */
  private readonly point: { readonly x: number; y: number };

  constructor(
    scene: Phaser.Scene,
    private readonly target: Humanoid,
    worldWidth: number,
  ) {
    this.cam = scene.cameras.main;
    const rig = this;
    this.point = {
      get x() {
        return rig.lockX ?? target.x;
      },
      y: HEIGHT / 2,
    };
    this.cam.setBounds(0, 0, worldWidth, HEIGHT);
    this.cam.startFollow(this.point, true, LERP_X, 0);
    this.cam.setDeadzone(this.cam.width * DEADZONE_FRAC, HEIGHT);
    // a largura da tela acompanha a janela: a zona morta também
    const onResize = () => {
      if (this.lockX === undefined) this.cam.setDeadzone(this.cam.width * DEADZONE_FRAC, HEIGHT);
    };
    scene.scale.on(Phaser.Scale.Events.RESIZE, onResize);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.scale.off(Phaser.Scale.Events.RESIZE, onResize));
    this.look = target.facing * LOOKAHEAD;
    this.cam.setFollowOffset(-this.look, 0);
    this.cam.centerOn(target.x + this.look, HEIGHT / 2);
  }

  get locked(): boolean {
    return this.lockX !== undefined;
  }

  /** Trava a câmera com o centro em `centerX` (arena). Desliza até lá com a mesma suavização. */
  lock(centerX: number): void {
    this.lockX = centerX;
    this.cam.setDeadzone();
    this.cam.setFollowOffset(0, 0);
  }

  /** Volta a seguir o Kael. */
  unlock(): void {
    this.lockX = undefined;
    this.cam.setDeadzone(this.cam.width * DEADZONE_FRAC, HEIGHT);
    this.cam.setFollowOffset(-this.look, 0);
  }

  update(delta: number): void {
    if (this.locked) {
      if (this.debug) this.drawDebug();
      return;
    }
    // O ponto seguido desliza para o lado em que o Kael olha, sem virar de uma vez.
    const goal = this.target.facing * LOOKAHEAD;
    const step = ((2 * LOOKAHEAD) / LOOKAHEAD_MS) * delta;
    this.look += Phaser.Math.Clamp(goal - this.look, -step, step);
    this.cam.setFollowOffset(-this.look, 0);
    if (this.debug) this.drawDebug();
  }

  /** Mostra a zona morta e o ponto seguido (tecla C na cena de teste). */
  toggleDebug(scene: Phaser.Scene): void {
    if (this.debug) {
      this.debug.destroy();
      this.debug = undefined;
      return;
    }
    this.debug = scene.add.graphics().setScrollFactor(0).setDepth(1000);
  }

  private drawDebug(): void {
    const g = this.debug!;
    const dz = this.cam.deadzone;
    g.clear();
    if (dz) g.lineStyle(1, 0x5ad1ff, 0.8).strokeRect(dz.x - this.cam.scrollX, 0, dz.width, HEIGHT);
    const fx = this.target.x + this.look - this.cam.scrollX;
    g.lineStyle(1, 0xffc857, 1).lineBetween(fx, HEIGHT / 2 - 12, fx, HEIGHT / 2 + 12);
  }
}
