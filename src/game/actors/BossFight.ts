import Phaser from 'phaser';
import type { Humanoid } from '../anims/humanoid';
import type { LevelDef } from '../levels/level_1';
import type { CameraRig } from '../world/CameraRig';
import { GUNNER_FIRE, type CopTarget } from './Gunner';
import type { Mercenary } from './Mercenary';

// Luta com os três mercenários no fim da rua (fase 7 do plano jump_crouch_cutscene.md). Valores [TESTE].
/** A luta começa quando o Kael passa desta fração da última tela (ou quando ele acerta um mercenário antes). */
const TRIGGER_AT = 0.3;
/** O Kael não passa desta distância das bordas da arena. */
const ARENA_MARGIN = 30;
/** Cerco: um corre por trás do Kael e para a esta distância dele; os outros param à frente, a estas distâncias. */
const BEHIND_PX = 230;
const AHEAD_PX = [260, 400];
/** Os mercenários não chegam mais perto que isto das bordas da arena. */
const EDGE_PX = 60;
/** Revezamento: um mira por vez, e o próximo espera este tempo depois da rajada do outro. */
const TURN_GAP_MS = 450;
/** Fim: espera depois do último cair, antes da cutscene final. */
const WON_DELAY_MS = 1200;
/** Barra de vida em cima de cada um e o aviso de mira (cores de efeito, fora da paleta). */
const BAR = { w: 36, h: 4, fill: 0xd83a3a, back: 0x000000, edge: 0xf4ebe8 };
const WARN = { color: '#ff4a3a', blinkMs: 120 };

type FightState = 'waiting' | 'fighting' | 'won';

/** Arena final: a câmera trava na última tela, os três vêm de uma vez e cercam o Kael. A Adriana fica ajoelhada perto da van. */
export class BossFight {
  state: FightState = 'waiting';
  /** Chamado a cada bala de um mercenário (a cena resolve o acerto no Kael). */
  onFire?: (m: Mercenary) => void;
  /** Chamado quando os três caem, depois de WON_DELAY_MS. */
  onWon?: () => void;
  private left = 0;
  private right = 0;
  /** Último momento em que algum mercenário estava mirando ou atirando (revezamento). */
  private lastBusy = -Infinity;
  /** Posição do Kael no último quadro (antes da luta, só dá para acertar os mercenários de dentro da arena). */
  private kaelX = 0;
  private readonly gfx: Phaser.GameObjects.Graphics;
  private readonly warns: Phaser.GameObjects.Text[];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly level: LevelDef,
    private readonly camRig: CameraRig,
    readonly mercenaries: Mercenary[],
    private readonly adriana: Humanoid,
  ) {
    this.gfx = scene.add.graphics().setDepth(900);
    this.warns = mercenaries.map(() =>
      scene.add
        .text(0, 0, '!', { fontFamily: 'monospace', fontSize: '22px', fontStyle: 'bold', color: WARN.color, stroke: '#000000', strokeThickness: 4 })
        .setOrigin(0.5, 1)
        .setDepth(900)
        .setVisible(false),
    );
    for (const m of mercenaries) {
      m.on(GUNNER_FIRE, (g: Mercenary) => this.onFire?.(g));
      m.canAim = () => this.canAim();
    }
  }

  /** Limites do Kael enquanto a luta está ativa. */
  get bounds(): [number, number] | undefined {
    return this.state === 'fighting' ? [this.left + ARENA_MARGIN, this.right - ARENA_MARGIN] : undefined;
  }

  /** Alvos das balas e golpes do Kael: os de pé. Antes da luta, só com o Kael já na última tela (acertar um começa a luta);
   *  de longe, a bala passa por eles, para a luta não travar a câmera com o Kael numa barricada. */
  get targets(): Mercenary[] {
    if (this.state === 'won') return [];
    if (this.state === 'waiting' && this.kaelX < this.level.width - this.scene.cameras.main.width) return [];
    return this.mercenaries.filter((m) => m.alive);
  }

  private canAim(): boolean {
    return !this.mercenaries.some((m) => m.busy) && this.scene.time.now - this.lastBusy >= TURN_GAP_MS;
  }

  update(delta: number, kael: CopTarget): void {
    this.kaelX = kael.x;
    if (this.state === 'waiting') {
      const w = this.scene.cameras.main.width;
      if (kael.alive && kael.x >= this.level.width - w + w * TRIGGER_AT) this.start(kael.x);
    }
    if (this.state === 'fighting') {
      for (const m of this.mercenaries) m.update(delta, kael);
      if (this.mercenaries.some((m) => m.busy)) this.lastBusy = this.scene.time.now;
      if (this.mercenaries.every((m) => !m.alive)) this.win();
    }
    this.draw();
  }

  /** Arena na última tela; o da esquerda corre por trás do Kael e os outros dois param à frente dele. */
  start(kaelX: number): void {
    if (this.state !== 'waiting' || kaelX < this.level.width - this.scene.cameras.main.width) return;
    this.state = 'fighting';
    const w = this.scene.cameras.main.width;
    this.right = this.level.width;
    this.left = this.right - w;
    this.camRig.lock(this.left + w / 2);
    const clamp = (x: number) => Phaser.Math.Clamp(x, this.left + EDGE_PX, this.right - EDGE_PX);
    const [first, ...rest] = [...this.mercenaries].sort((a, b) => a.x - b.x);
    first.moveTo(clamp(kaelX - BEHIND_PX));
    rest.forEach((m, i) => m.moveTo(clamp(kaelX + AHEAD_PX[i % AHEAD_PX.length])));
    // ninguém segura mais a Adriana: ela se ajoelha onde está, perto da van
    this.adriana.act('kneel', { restart: true });
  }

  private win(): void {
    this.state = 'won';
    this.scene.time.delayedCall(WON_DELAY_MS, () => this.onWon?.());
  }

  /** Barras de vida e o "!" piscando em quem está mirando. */
  private draw(): void {
    this.gfx.clear();
    const fighting = this.state === 'fighting';
    const blink = Math.floor(this.scene.time.now / WARN.blinkMs) % 2 === 0;
    this.mercenaries.forEach((m, i) => {
      const warn = this.warns[i];
      warn.setVisible(fighting && m.alive && m.busy && m.state !== 'shooting' && blink);
      const top = m.y - (m.crouched ? m.kit.bodyH - 20 : m.kit.bodyH);
      warn.setPosition(m.x, top - 14);
      if (!fighting || !m.alive) return;
      const x = Math.round(m.x - BAR.w / 2);
      const y = Math.round(top - 10);
      this.gfx.fillStyle(BAR.edge, 1).fillRect(x - 1, y - 1, BAR.w + 2, BAR.h + 2);
      this.gfx.fillStyle(BAR.back, 1).fillRect(x, y, BAR.w, BAR.h);
      this.gfx.fillStyle(BAR.fill, 1).fillRect(x, y, Math.round((BAR.w * m.hp) / m.archetype.hp), BAR.h);
    });
  }
}
