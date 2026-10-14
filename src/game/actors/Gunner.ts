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
  /** Sequência: depois do aviso, dá de [mín, máx] tiros seguidos, um a cada `volleyGapMs` (como o Kael). Sem valor, um tiro. */
  volley?: [number, number];
  volleyGapMs?: number;
  /** Entre as sequências, segura a arma apontada e espera só isto (±20%), sem novo aviso. Sem valor, abaixa a arma. */
  volleyPauseMs?: number;
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
  /** IA esperta (policiais): lê o Kael, desvia da bala dele e aproveita as aberturas. Sem valor, a IA simples. */
  smart?: SmartTraits;
}

/** Números da IA esperta (plano enemy_ai_difficulty.md). */
export interface SmartTraits {
  /** Velocidade da mira e do agachar (2 = metade do tempo). */
  aimSpeed: number;
  /** Aviso da mira, sorteado entre [mín, máx] ms (no lugar do `aimHoldMs`). */
  aimHoldMs: [number, number];
  /** Espera entre os ciclos, em fração do `fireMs` (mais larga que os ±20% da IA simples). */
  fireJitter: [number, number];
  /** Chance de desviar de cada tiro do Kael, tempo de reação e espera até poder desviar de novo. */
  dodgeChance: number;
  dodgeReactMs: [number, number];
  dodgeCooldownMs: number;
  /** Altura e velocidade (1 = a do pulo normal) do pulo no lugar que deixa a bala baixa passar por baixo. */
  dodgeJumpH: number;
  dodgeJumpSpeed: number;
  /** Kael sem arma a menos disto (vindo para o combo): atira sem o aviso. */
  closePx: number;
}

/** Tiro do Kael, avisado aos inimigos: de onde sai, altura acima do chão, para que lado e a que velocidade (px/s). */
export interface KaelShot {
  x: number;
  h: number;
  dir: 1 | -1;
  speed: number;
}

/** Topo do corpo ajoelhado (mesmo valor do BODY_H_CROUCH da cena): bala mais alta que isso passa por cima. */
const CROUCH_TOP = 86;
/** Meia largura do corpo para as balas (BODY_HALF_W da cena). */
const BODY_HALF = 12;
/** IA esperta: troca de postura depois deste tempo parado (a simples usa `matchCrouchMs`). */
const SMART_POSTURE_MS = 150; // [TESTE]
/** Palpite sem histórico: chance de agachar quando o Kael ainda não pulou nem agachou (35%). */
const LOW_PRIOR = 0.35; // [TESTE]
/** Folga (px) entre a bala baixa e os pés no pulo de desvio. */
const DODGE_JUMP_MARGIN = 4;

/** O que o Kael costuma fazer para fugir do tiro: pulos e agachadas recentes (somem aos poucos). Os policiais leem isso. */
export class KaelHabits {
  jump = 0;
  crouch = 0;
  /** Meia-vida da lembrança, em ms. */
  constructor(private readonly halfLifeMs = 10000) {}
  update(delta: number): void {
    const k = Math.pow(0.5, delta / this.halfLifeMs);
    this.jump *= k;
    this.crouch *= k;
  }
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
  /** No ar (pulando), recarregando e com a arma na mão. */
  airborne: boolean;
  reloading: boolean;
  armed: boolean;
  /** Pulos e agachadas recentes do Kael (KaelHabits). */
  habit: { jump: number; crouch: number };
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
  /** Tiros que faltam na sequência e tempo até o próximo. */
  private volleyLeft = 0;
  private volleyTimer = 0;
  private reloadSound?: Phaser.Sound.BaseSound;
  private readonly groundY: number;
  /** Tempo parado com a postura diferente da do Kael. */
  private postureTimer = 0;
  /** O que fazer quando terminar de agachar ou levantar. */
  private afterPosture?: () => void;
  private jump?: { x0: number; x1: number; t: number; h: number; speed: number };
  /** IA esperta: agachar ou não neste ciclo de tiro (o palpite sobre o Kael), quando pode desviar de novo, e Kael perto sem arma. */
  private plannedLow?: boolean;
  private dodgeReady = 0;
  private close = false;
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

  private resetFire(ms?: number): void {
    const [lo, hi] = this.archetype?.smart?.fireJitter ?? [0.8, 1.2];
    this.fireTimer = ms ?? this.archetype.fireMs * Phaser.Math.FloatBetween(lo, hi);
  }

  /** IA esperta: mira e agachar mais rápidos. O Humanoid chama isto antes do arquétipo existir. */
  act(anim: AnimName, opts: { reverse?: boolean; restart?: boolean; startFrame?: number } = {}): void {
    const s = this.archetype?.smart;
    const fast = s && (anim === this.kit.aim || anim === this.kit.crouchAim || anim === this.kit.crouch);
    this.anims.timeScale = fast ? s.aimSpeed : 1;
    super.act(anim, opts);
  }

  /** Aviso da mira: sorteado na IA esperta, zero com o Kael perto sem arma. */
  private holdMs(): number {
    const s = this.archetype.smart;
    if (!s) return this.archetype.aimHoldMs;
    return this.close ? 0 : Phaser.Math.Between(...s.aimHoldMs);
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
        this.fireTimer = this.holdMs();
        break;
      case 'shooting': {
        // arma em pé entre as sequências (como o Kael); abaixa para recarregar
        const pause = this.archetype.volleyPauseMs;
        if (pause === undefined || this.shots >= this.archetype.mag) return this.lower();
        this.state = 'aimed';
        const aim = this.crouched ? this.kit.crouchAim : this.kit.aim;
        if (aim) this.hold(aim, this.frameCount(aim) - 1);
        this.fireTimer = pause * Phaser.Math.FloatBetween(0.8, 1.2);
        break;
      }
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
    if (refire) {
      this.resetFire();
      // novo ciclo: novo palpite sobre o Kael
      this.plannedLow = undefined;
    }
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
      this.fireTimer = this.holdMs();
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

  /** Pulo até `toX` (no lugar, se for o próprio x): sai do chão no quadro `air` e volta no `land`, como o Kael. */
  private startJump(toX: number, h = this.archetype.jumpHeight, speed = 1): void {
    this.state = 'jumping';
    this.crouched = false;
    this.volleyLeft = 0;
    this.jump = { x0: this.x, x1: toX, t: 0, h, speed };
    if (toX !== this.x) this.face(toX < this.x ? -1 : 1);
    this.act(this.kit.jump, { restart: true });
    this.anims.timeScale = speed;
  }

  private updateJump(delta: number): void {
    const j = this.jump!;
    j.t += delta * j.speed;
    const t0 = jumpMs(0, JUMP_PHASES.air);
    const t1 = jumpMs(0, JUMP_PHASES.land);
    const k = Phaser.Math.Clamp((j.t - t0) / (t1 - t0), 0, 1);
    this.x = Phaser.Math.Linear(j.x0, j.x1, k);
    this.y = this.groundY - j.h * Math.sin(Math.PI * k);
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
    const smart = this.archetype.smart;
    this.close = !!smart && canShoot && !target.armed && Math.abs(targetX - this.x) < smart.closePx;
    // parado com a postura errada para acertar o Kael: agacha ou levanta depois de um instante
    const low = canShoot ? this.wantLow(target) : this.crouched;
    if (this.state === 'idle' && this.archetype.matchCrouchMs > 0 && low !== this.crouched) {
      this.postureTimer += delta;
      if (this.postureTimer >= (smart ? SMART_POSTURE_MS : this.archetype.matchCrouchMs)) {
        this.postureTimer = 0;
        return this.setPosture(low);
      }
    } else this.postureTimer = 0;
    // aberturas do Kael: recarregando ou chegando sem arma, o tiro vem logo
    const opening = !!smart && (target.reloading || this.close);
    // atirando baixo, espera o Kael pousar (no ar a bala baixa passa por baixo dele)
    const waitLanding = !!smart && this.crouched && target.airborne;
    if (this.state === 'idle' && inRange) {
      if (opening) this.fireTimer = Math.min(this.fireTimer, 120);
      this.fireTimer -= delta;
      if (this.fireTimer > 0) return;
      // vez de outro: tenta de novo daqui a pouco
      if (this.canAim?.() === false) this.fireTimer = Phaser.Math.Between(200, 600);
      else this.aim();
    } else if (this.state === 'aimed') {
      // Kael morreu ou saiu do alcance durante o aviso: abaixa sem atirar
      if (!inRange) return this.lower();
      // o tiro em pé passa por cima do Kael agachado: abaixa a arma para agachar (regra do idle)
      if (smart ? target.crouched && !this.crouched : this.archetype.matchCrouchMs > 0 && target.crouched !== this.crouched) return this.lower();
      if (waitLanding) return;
      if (opening) this.fireTimer = Math.min(this.fireTimer, 60);
      this.fireTimer -= delta;
      if (this.fireTimer <= 0) {
        const [lo, hi] = this.archetype.volley ?? [1, 1];
        this.volleyLeft = Phaser.Math.Between(lo, hi);
        this.shoot();
      }
    } else if (this.state === 'shooting' && this.volleyLeft > 0) {
      // sequência: o próximo tiro recomeça o recuo, se o Kael continua em alcance e ainda tem bala no pente
      if (waitLanding) return;
      this.volleyTimer -= delta;
      if (this.volleyTimer > 0) return;
      if (!inRange || this.shots >= this.archetype.mag) this.volleyLeft = 0;
      else this.shoot();
    }
  }

  /** Agachar para atirar baixo? A IA simples copia o Kael. A esperta adivinha: o tiro baixo pega o Kael em pé e agachado,
   *  mas o pulo desvia dele; então agacha conforme o Kael costuma agachar ou pular (um palpite por ciclo). */
  private wantLow(target: CopTarget): boolean {
    if (!this.archetype.smart || target.crouched) return target.crouched;
    if (this.plannedLow === undefined) {
      const { jump, crouch } = target.habit;
      this.plannedLow = Math.random() < (crouch + LOW_PRIOR) / (jump + crouch + 1);
    }
    return this.plannedLow;
  }

  /** O Kael atirou: se a bala vem nele, às vezes desvia, no tempo certo. Da bala alta agacha (ela passa por cima);
   *  da baixa pula no lugar, com o alto do pulo na hora em que ela chega. De perto não dá tempo. */
  dodge(shot: KaelShot): void {
    const s = this.archetype.smart;
    const free = () => ['idle', 'aiming', 'aimed', 'shooting', 'lowering'].includes(this.state);
    if (!s || !free() || this.scene.time.now < this.dodgeReady) return;
    const gap = (this.x - shot.x) * shot.dir - BODY_HALF;
    if (gap <= 0) return;
    const high = shot.h > CROUCH_TOP;
    if (high && this.crouched) return;
    if (Math.random() >= s.dodgeChance) return;
    const arrive = (gap / shot.speed) * 1000;
    const react = Phaser.Math.Between(...s.dodgeReactMs);
    let delay = react;
    if (!high) {
      // no ar, os pés ficam acima da bala entre `early` e `late` depois do começo do pulo
      const lift = shot.h + DODGE_JUMP_MARGIN;
      if (lift >= s.dodgeJumpH) return;
      const t0 = jumpMs(0, JUMP_PHASES.air) / s.dodgeJumpSpeed;
      const t1 = jumpMs(0, JUMP_PHASES.land) / s.dodgeJumpSpeed;
      const k0 = Math.asin(lift / s.dodgeJumpH) / Math.PI;
      const early = t0 + k0 * (t1 - t0);
      delay = Math.max(react, arrive - (t0 + t1) / 2);
      if (arrive - delay < early) return;
    } else if (react >= arrive) return;
    this.dodgeReady = this.scene.time.now + s.dodgeCooldownMs;
    this.scene.time.delayedCall(delay, () => {
      if (!this.active || !free()) return;
      this.volleyLeft = 0;
      if (!high) return this.startJump(this.x, s.dodgeJumpH, s.dodgeJumpSpeed);
      // agachado já fica com o tiro baixo pronto: responde logo
      this.plannedLow = true;
      this.setPosture(true, () => {
        this.toIdle(false);
        this.fireTimer = Math.min(this.fireTimer, 250);
      });
    });
  }

  /** Um tiro (ou uma rajada): toca o recuo do começo. */
  private shoot(): void {
    this.state = 'shooting';
    this.volleyLeft--;
    this.volleyTimer = this.archetype.volleyGapMs ?? 0;
    this.act(this.crouched ? this.kit.crouchShoot : this.kit.shoot, { restart: true });
    this.shots++;
    if (!this.kit.burst) this.fire();
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
    this.volleyLeft = 0;
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
