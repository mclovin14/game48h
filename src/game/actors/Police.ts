import Phaser from 'phaser';
import { Humanoid, POLICE, POLICE_VARIANTS, type CharacterDef, type PoliceVariant } from '../anims/humanoid';
import type { BulletType } from '../events';

/** Tons de farda (rampas em assets/enemies/police/uniform_tones.json). navy é a sheet original. */
export const UNIFORM_TONES = ['navy', 'slate', 'teal'] as const;
export type UniformTone = (typeof UNIFORM_TONES)[number];

/** Aparência: cabeça + tom da farda (3 x 3 = 9). Não muda o comportamento. */
export interface PoliceLook {
  head: PoliceVariant;
  tone: UniformTone;
}

export const lookId = (l: PoliceLook) => `${l.head}_${l.tone}`;

export const ALL_LOOKS: PoliceLook[] = POLICE_VARIANTS.flatMap((head) => UNIFORM_TONES.map((tone) => ({ head, tone })));

/** Sheets de uma aparência. Os tons fora o navy são texturas geradas no Boot (uniformTones.ts). */
export function lookDef(l: PoliceLook): CharacterDef {
  const base = POLICE[l.head];
  return l.tone === 'navy' ? base : { ...base, key: `${base.key}_${l.tone}` };
}

/** Carrega as sheets das três cabeças (Boot). */
export const POLICE_DEFS = POLICE_VARIANTS.map((v) => POLICE[v]);

/** Comportamento, separado da aparência. Por enquanto um só: a diferença entre policiais é só visual. */
export interface EnemyArchetype {
  hp: number;
  /** Intervalo entre tiros (varia ±20%) e alcance em px. */
  fireMs: number;
  range: number;
  walkSpeed: number;
  /** Quanto tempo segura a mira antes do tiro: é o aviso para o jogador. */
  aimHoldMs: number;
  /** Dano na vida do Kael e chance de acertar. */
  damage: number;
  hitChance: number;
}

export const ARCHETYPES = {
  patrol: { hp: 2, fireMs: 1800, range: 600, walkSpeed: 90, aimHoldMs: 450, damage: 8, hitChance: 0.7 }, // [TESTE]
} satisfies Record<string, EnemyArchetype>;

/**
 * entering: andando até o ponto de parada; idle: parado, virado para o Kael;
 * aiming/aimed/shooting/lowering: ciclo do tiro; down: morto ou nocauteado.
 */
export type PoliceState = 'entering' | 'idle' | 'aiming' | 'aimed' | 'shooting' | 'lowering' | 'hurt' | 'down';

/** Evento do sprite quando o policial dispara (o tiro sai no começo do shoot_gun). */
export const POLICE_FIRE = 'police-fire';

/** Policial inimigo: aparência (cabeça + farda) e arquétipo (vida, tiro). */
export class Police extends Humanoid {
  state: PoliceState = 'idle';
  hp: number;
  /** Momento (ms da cena) em que caiu, para sumir com o corpo depois. */
  downAt = 0;
  readonly stopX: number;
  /** Tempo até o próximo tiro (parado) ou até soltar o tiro (mirando). */
  private fireTimer = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    readonly look: PoliceLook,
    readonly archetype: EnemyArchetype = ARCHETYPES.patrol,
    stopAt = x,
  ) {
    super(scene, x, y, lookDef(look), stopAt === x ? 'idle_gun' : 'walk_gun');
    this.hp = archetype.hp;
    this.stopX = stopAt;
    this.state = stopAt === x ? 'idle' : 'entering';
    this.resetFire(Phaser.Math.Between(500, archetype.fireMs));
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this.onAnimDone());
  }

  private resetFire(ms = this.archetype.fireMs * Phaser.Math.FloatBetween(0.8, 1.2)): void {
    this.fireTimer = ms;
  }

  private onAnimDone(): void {
    switch (this.state) {
      case 'hurt':
        this.state = Math.abs(this.stopX - this.x) < 1 ? 'idle' : 'entering';
        this.act(this.state === 'idle' ? 'idle_gun' : 'walk_gun');
        // levou tiro: demora um pouco mais para atirar de novo
        this.resetFire(this.archetype.fireMs * 0.7);
        break;
      case 'aiming':
        // fica no último quadro da mira (arma apontada) durante o aviso
        this.state = 'aimed';
        this.fireTimer = this.archetype.aimHoldMs;
        break;
      case 'shooting':
        this.lower();
        break;
      case 'lowering':
        this.state = 'idle';
        this.act('idle_gun');
        this.resetFire();
        break;
    }
  }

  private lower(): void {
    this.state = 'lowering';
    this.act('aim_gun', { reverse: true });
  }

  get alive(): boolean {
    return this.state !== 'down';
  }

  /** `targetX` é o x do Kael; `canShoot` é falso com o Kael morto. */
  update(delta: number, targetX: number, canShoot = true): void {
    if (this.state === 'entering') {
      const dx = this.stopX - this.x;
      const step = this.archetype.walkSpeed * (delta / 1000);
      this.face(dx < 0 ? -1 : 1);
      if (Math.abs(dx) <= step) {
        this.x = this.stopX;
        this.state = 'idle';
        this.act('idle_gun');
      } else {
        this.x += Math.sign(dx) * step;
        this.act('walk_gun');
      }
    }
    if (this.state === 'idle' || this.state === 'aiming' || this.state === 'aimed') this.face(targetX < this.x ? -1 : 1);
    const inRange = canShoot && Math.abs(targetX - this.x) <= this.archetype.range;
    if (this.state === 'idle' && inRange) {
      this.fireTimer -= delta;
      if (this.fireTimer <= 0) {
        this.state = 'aiming';
        this.act('aim_gun', { restart: true });
      }
    } else if (this.state === 'aimed') {
      // Kael morreu ou saiu do alcance durante o aviso: abaixa sem atirar
      if (!inRange) return this.lower();
      this.fireTimer -= delta;
      if (this.fireTimer <= 0) {
        this.state = 'shooting';
        this.act('shoot_gun', { restart: true });
        this.emit(POLICE_FIRE, this);
      }
    }
  }

  /** Leva um tiro. Devolve o que aconteceu (ou null se já estava no chão). */
  hit(type: BulletType): 'hurt' | 'death' | 'knockout' | null {
    if (!this.alive) return null;
    this.hp -= 1;
    if (this.hp > 0) {
      this.state = 'hurt';
      this.act('hurt', { restart: true });
      return 'hurt';
    }
    this.state = 'down';
    this.downAt = this.scene.time.now;
    const anim = type === 'lethal' ? 'death' : 'knockout';
    this.act(anim);
    return anim;
  }
}
