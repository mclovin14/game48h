import Phaser from 'phaser';
import { HUMANOID_STEP, Humanoid, JUMP_PHASES, jumpMs, type AnimName, type CharacterDef } from '../anims/humanoid';
import type { BulletType } from '../events';
import { VOLUME, playAt, playStep, type SoundKey } from '../audio/Sfx';

// Inimigo com arma de fogo: a IA comum dos policiais (pistola) e dos mercenários (fuzil).
// O que muda entre eles fica no kit (animações, sons, cano) e no arquétipo (vida, tiro, pulo).

/** Comportamento (números da luta). */
export interface EnemyArchetype {
  hp: number;
  /** Intervalo entre tiros (varia ±20%) e alcance em px. */
  fireMs: number;
  range: number;
  walkSpeed: number;
  /** Entra correndo; a esta distância do ponto de parada passa a andar. */
  runSpeed: number;
  walkLastPx: number;
  /** Tiros (ou rajadas) por pente: depois deles recarrega, sem atirar. */
  mag: number;
  /** Quanto tempo segura a mira antes do tiro: é o aviso para o jogador. */
  aimHoldMs: number;
  /** Dano de cada bala na vida do Kael e chance de ir no corpo (o resto passa por cima da cabeça). A bala voa: pulo e agachar desviam. */
  damage: number;
  hitChance: number;
  /** Agacha para recarregar. */
  crouchReload: boolean;
  /** Copia a postura do Kael (agachado ou em pé) depois deste tempo parado; agachado, atira baixo. 0 = não copia. */
  matchCrouchMs: number;
  /** Chance de pular para a frente ao chegar (a esta distância do ponto de parada) e quando o Kael mira nele. */
  jumpOnEnter: number;
  jumpWhenAimed: number;
  jumpDist: number;
  jumpHeight: number;
  /** Pulando na direção do Kael, não chega mais perto que isto. */
  jumpKeepPx: number;
  /** Chute do combo: sem valor, nocauteia; com valor, tira essa vida (e nocauteia se zerar). */
  kickDamage?: number;
}

/** Animações e sons de quem atira. Sem `crouchAim`, o agachar já termina mirando; sem `crouchReload`, levanta para recarregar. */
export interface GunnerKit {
  idle: AnimName;
  walk: AnimName;
  run: AnimName;
  aim: AnimName;
  shoot: AnimName;
  reload: AnimName;
  crouch: AnimName;
  crouchAim?: AnimName;
  crouchShoot: AnimName;
  crouchReload?: AnimName;
  jump: AnimName;
  /** Quadros do tiro em que sai cada bala (rajada). Sem valor, uma bala no começo do tiro. */
  burst?: number[];
  shotSound: SoundKey;
  shotVolume: number;
  reloadSound?: SoundKey;
  reloadVolume?: number;
  /** Cano em pé e ajoelhado: px à frente do corpo e altura acima do chão. */
  muzzle: { x: number; h: number };
  muzzleCrouch: { x: number; h: number };
  /** Altura do corpo para as balas, em pé (topo da cabeça). */
  bodyH: number;
}

/** O que o inimigo sabe do Kael a cada quadro. */
export interface CopTarget {
  x: number;
  alive: boolean;
  crouched: boolean;
  /** Arma apontada (mirando ou atirando) e para que lado. */
  aiming: boolean;
  facing: 1 | -1;
}

/**
 * entering: andando até o ponto de parada; idle: parado, virado para o Kael;
 * aiming/aimed/shooting/lowering: ciclo do tiro; reloading: parado, recarregando; posture: agachando ou
 * levantando; jumping: pulo para a frente; down: morto ou nocauteado. Em pé ou agachado conforme `crouched`.
 */
export type GunnerState =
  | 'entering'
  | 'idle'
  | 'aiming'
  | 'aimed'
  | 'shooting'
  | 'lowering'
  | 'reloading'
  | 'posture'
  | 'jumping'
  | 'hurt'
  | 'down';

/** Evento do sprite a cada bala que sai (no começo do tiro, ou nos quadros da rajada). */
export const GUNNER_FIRE = 'gunner-fire';

export class Gunner extends Humanoid {
  state: GunnerState = 'idle';
  hp: number;
  /** Momento (ms da cena) em que caiu, para sumir com o corpo depois. */
  downAt = 0;
  stopX: number;
  /** Ajoelhado (ou abaixando): o tiro sai baixo e a caixa do corpo encolhe. */
  crouched = false;
  /** Pode começar a mirar agora? (os mercenários se revezam). Sem valor, sempre pode. */
  canAim?: () => boolean;
  /** Tempo até o próximo tiro (parado) ou até soltar o tiro (mirando). */
  private fireTimer = 0;
  /** Tiros dados desde a última recarga. */
  private shots = 0;
  private reloadSound?: Phaser.Sound.BaseSound;
  private readonly groundY: number;
  /** Tempo parado com a postura diferente da do Kael. */
  private postureTimer = 0;
  /** O que fazer quando terminar de agachar ou levantar. */
  private afterPosture?: () => void;
  private jump?: { x0: number; x1: number; t: number };
  private enterJumpChecked = false;
  private wasAimedAt = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    def: CharacterDef,
    readonly kit: GunnerKit,
    readonly archetype: EnemyArchetype,
    stopAt = x,
  ) {
    super(scene, x, y, def, stopAt === x ? kit.idle : kit.run);
    this.hp = archetype.hp;
    this.groundY = y;
    this.stopX = stopAt;
    this.state = stopAt === x ? 'idle' : 'entering';
    this.resetFire(Phaser.Math.Between(500, archetype.fireMs));
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this.onAnimDone());
    this.on(HUMANOID_STEP, () =>
      this.current === kit.run
        ? playStep(scene, 'run', this.x, VOLUME.copRunStep)
        : playStep(scene, 'walk', this.x, VOLUME.copStep),
    );
    // rajada: uma bala em cada quadro do `burst` (o primeiro vem no START, os outros no UPDATE)
    if (kit.burst) {
      const onFrame = (_a: Phaser.Animations.Animation, f: Phaser.Animations.AnimationFrame) => {
        if (this.state === 'shooting' && kit.burst!.includes(f.index - 1)) this.fire();
      };
      this.on(Phaser.Animations.Events.ANIMATION_START, onFrame);
      this.on(Phaser.Animations.Events.ANIMATION_UPDATE, onFrame);
    }
  }

  private fire(): void {
    playAt(this.scene, this.kit.shotSound, this.x, this.kit.shotVolume);
    this.emit(GUNNER_FIRE, this);
  }

  private resetFire(ms = this.archetype.fireMs * Phaser.Math.FloatBetween(0.8, 1.2)): void {
    this.fireTimer = ms;
  }

  /** Sai andando (ou correndo) até `x`, depois fica parado lutando. */
  moveTo(x: number): void {
    if (!this.alive) return;
    this.stopX = x;
    this.enterJumpChecked = true;
    if (this.state === 'idle') this.state = 'entering';
  }

  private onAnimDone(): void {
    switch (this.state) {
      case 'hurt':
        this.state = Math.abs(this.stopX - this.x) < 1 ? 'idle' : 'entering';
        if (this.state === 'idle' && this.shots >= this.archetype.mag) return this.reload();
        if (this.state === 'idle') this.rest();
        else this.act(this.kit.walk);
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
        if (this.shots >= this.archetype.mag) return this.reload();
        this.toIdle();
        break;
      case 'reloading':
        this.shots = 0;
        this.reloadSound = undefined;
        this.toIdle();
        break;
      case 'posture': {
        const then = this.afterPosture;
        this.afterPosture = undefined;
        if (then) then();
        else this.toIdle(false);
        break;
      }
      case 'jumping':
        this.x = this.jump!.x1;
        this.y = this.groundY;
        this.stopX = this.x;
        this.jump = undefined;
        this.toIdle(false);
        break;
    }
  }

  /** Parado: idle em pé; agachado, segura o último quadro do agachar. */
  private rest(): void {
    if (this.crouched) this.hold(this.kit.crouch, this.frameCount(this.kit.crouch) - 1);
    else this.act(this.kit.idle);
  }

  /** Volta a ficar parado; `refire` recomeça a espera do próximo tiro. */
  private toIdle(refire = true): void {
    this.state = 'idle';
    this.rest();
    if (refire) this.resetFire();
  }

  /** Agacha (down) ou levanta, e depois `then` (padrão: fica parado). */
  private setPosture(down: boolean, then?: () => void): void {
    this.state = 'posture';
    this.crouched = down;
    this.afterPosture = then;
    this.act(this.kit.crouch, { restart: true, reverse: !down });
  }

  /** Pente vazio: parado, toca a recarga com o som. Agacha antes (crouchReload), ou levanta se não recarrega ajoelhado. */
  private reload(): void {
    if (this.archetype.crouchReload && !this.crouched) return this.setPosture(true, () => this.reload());
    if (this.crouched && !this.kit.crouchReload) return this.setPosture(false, () => this.reload());
    this.state = 'reloading';
    this.act(this.crouched ? this.kit.crouchReload! : this.kit.reload, { restart: true });
    if (this.kit.reloadSound) this.reloadSound = playAt(this.scene, this.kit.reloadSound, this.x, this.kit.reloadVolume ?? 1);
  }

  private aim(): void {
    // agachar já termina mirando: o aviso é a pose parada
    if (this.crouched && !this.kit.crouchAim) {
      this.state = 'aimed';
      this.fireTimer = this.archetype.aimHoldMs;
      return;
    }
    this.state = 'aiming';
    this.act(this.crouched ? this.kit.crouchAim! : this.kit.aim, { restart: true });
  }

  private lower(): void {
    if (this.crouched && !this.kit.crouchAim) return this.toIdle();
    this.state = 'lowering';
    this.act(this.crouched ? this.kit.crouchAim! : this.kit.aim, { reverse: true });
  }

  /** Pulo para a frente até `toX`: sai do chão no quadro `air` e volta no `land`, como o Kael. */
  private startJump(toX: number): void {
    this.state = 'jumping';
    this.crouched = false;
    this.jump = { x0: this.x, x1: toX, t: 0 };
    this.face(toX < this.x ? -1 : 1);
    this.act(this.kit.jump, { restart: true });
  }

  private updateJump(delta: number): void {
    const j = this.jump!;
    j.t += delta;
    const t0 = jumpMs(0, JUMP_PHASES.air);
    const t1 = jumpMs(0, JUMP_PHASES.land);
    const k = Phaser.Math.Clamp((j.t - t0) / (t1 - t0), 0, 1);
    this.x = Phaser.Math.Linear(j.x0, j.x1, k);
    this.y = this.groundY - this.archetype.jumpHeight * Math.sin(Math.PI * k);
  }

  /** Pula na direção do Kael, sem chegar perto demais. */
  private jumpToward(targetX: number): boolean {
    const gap = Math.abs(targetX - this.x);
    const dist = Math.min(this.archetype.jumpDist, gap - this.archetype.jumpKeepPx);
    if (dist < this.archetype.jumpDist / 2) return false;
    this.startJump(this.x + Math.sign(targetX - this.x) * dist);
    return true;
  }

  get alive(): boolean {
    return this.state !== 'down';
  }

  /** Mirando ou atirando (o aviso de mira na tela, e o revezamento dos mercenários). */
  get busy(): boolean {
    return this.state === 'aiming' || this.state === 'aimed' || this.state === 'shooting';
  }

  update(delta: number, target: CopTarget): void {
    const targetX = target.x;
    const canShoot = target.alive;
    if (this.state === 'jumping') return this.updateJump(delta);
    if (this.state === 'entering') {
      const dx = this.stopX - this.x;
      // perto do ponto de parada: às vezes chega pulando
      if (!this.enterJumpChecked && Math.abs(dx) <= this.archetype.jumpDist) {
        this.enterJumpChecked = true;
        if (Math.random() < this.archetype.jumpOnEnter) return this.startJump(this.stopX);
      }
      // corre até perto do ponto de parada e anda os últimos passos
      const running = Math.abs(dx) > this.archetype.walkLastPx;
      const step = (running ? this.archetype.runSpeed : this.archetype.walkSpeed) * (delta / 1000);
      this.face(dx < 0 ? -1 : 1);
      if (Math.abs(dx) <= step) {
        this.x = this.stopX;
        this.toIdle(false);
      } else {
        this.x += Math.sign(dx) * step;
        this.act(running ? this.kit.run : this.kit.walk);
      }
    }
    if (this.state === 'idle' || this.state === 'aiming' || this.state === 'aimed') this.face(targetX < this.x ? -1 : 1);
    const inRange = canShoot && Math.abs(targetX - this.x) <= this.archetype.range;
    // o Kael começou a mirar nele: às vezes pula para a frente (em pé e parado)
    const aimedAt = canShoot && target.aiming && Math.sign(this.x - targetX) === target.facing;
    const startedAim = aimedAt && !this.wasAimedAt;
    this.wasAimedAt = aimedAt;
    if (startedAim && this.state === 'idle' && !this.crouched && Math.random() < this.archetype.jumpWhenAimed && this.jumpToward(targetX)) return;
    // parado com a postura diferente da do Kael: agacha ou levanta depois de um instante
    if (this.state === 'idle' && canShoot && this.archetype.matchCrouchMs > 0 && target.crouched !== this.crouched) {
      this.postureTimer += delta;
      if (this.postureTimer >= this.archetype.matchCrouchMs) {
        this.postureTimer = 0;
        return this.setPosture(target.crouched);
      }
    } else this.postureTimer = 0;
    if (this.state === 'idle' && inRange) {
      this.fireTimer -= delta;
      if (this.fireTimer > 0) return;
      // vez de outro: tenta de novo daqui a pouco
      if (this.canAim?.() === false) this.fireTimer = Phaser.Math.Between(200, 600);
      else this.aim();
    } else if (this.state === 'aimed') {
      // Kael morreu ou saiu do alcance durante o aviso: abaixa sem atirar
      if (!inRange) return this.lower();
      this.fireTimer -= delta;
      if (this.fireTimer <= 0) {
        this.state = 'shooting';
        this.act(this.crouched ? this.kit.crouchShoot : this.kit.shoot, { restart: true });
        this.shots++;
        if (!this.kit.burst) this.fire();
      }
    }
  }

  /** Leva um tiro. Devolve o que aconteceu (ou null se já estava no chão). */
  hit(type: BulletType): 'hurt' | 'death' | 'knockout' | null {
    if (!this.alive) return null;
    this.hp -= 1;
    this.stagger();
    if (this.hp > 0) return this.hurt();
    return this.fall(type === 'lethal' ? 'death' : 'knockout');
  }

  /** Golpe do combo do Kael: soco só dá o tranco (não tira vida); o chute nocauteia ou tira `kickDamage`. Nunca mata. */
  strike(finisher: boolean): 'hurt' | 'knockout' | null {
    if (!this.alive) return null;
    this.stagger();
    if (!finisher) return this.hurt();
    const kick = this.archetype.kickDamage;
    if (kick !== undefined) this.hp = Math.max(0, this.hp - kick);
    return kick === undefined || this.hp === 0 ? this.fall('knockout') : this.hurt();
  }

  /** Interrompe o que fazia: recarga, agachado ou pulo. */
  private stagger(): void {
    // apanhou no meio da recarga: o som para e a recarga recomeça depois do tranco
    this.reloadSound?.stop();
    this.reloadSound = undefined;
    // o tranco e a queda são em pé; no ar, cai direto no chão
    this.crouched = false;
    this.afterPosture = undefined;
    if (this.jump) {
      this.x = Phaser.Math.Linear(this.jump.x0, this.jump.x1, 0.5);
      this.stopX = this.x;
      this.y = this.groundY;
      this.jump = undefined;
    }
  }

  private hurt(): 'hurt' {
    this.state = 'hurt';
    this.act('hurt', { restart: true });
    return 'hurt';
  }

  private fall<A extends 'death' | 'knockout'>(anim: A): A {
    this.state = 'down';
    this.downAt = this.scene.time.now;
    this.act(anim);
    return anim;
  }
}
