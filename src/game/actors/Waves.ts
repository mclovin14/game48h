import Phaser from 'phaser';
import type { BarricadeDef, LevelDef, Side } from '../levels/level_1';
import type { CameraRig } from '../world/CameraRig';
import { EnemyDirector } from './EnemyDirector';
import { GUNNER_FIRE, type CopTarget } from './Gunner';
import { Police, lookId } from './Police';

// Valores provisórios [TESTE] das ondas.
/** O Kael dispara a arena a esta distância antes da barricada. */
const TRIGGER_BEFORE = 320;
/** A barricada fica a esta distância da borda direita da arena. */
const ARENA_AHEAD = 200;
/** O Kael não passa desta distância das bordas da arena. */
const ARENA_MARGIN = 30;
/** Espera antes do primeiro policial de cada onda, entre um policial e outro, e entre ondas. */
const FIRST_SPAWN_MS = 700;
const SPAWN_GAP_MS = 1100;
const WAVE_GAP_MS = 1500;
/** O policial nasce fora da tela e para entre estas distâncias da borda por onde entrou. */
const SPAWN_OUTSIDE = 70;
const STOP_RANGE: [number, number] = [90, 300];
/** Distância mínima entre os pontos de parada. */
const STOP_SPACING = 56;
/** Corpo no chão: some depois deste tempo, em FADE_MS. */
const BODY_MS = 2500;
const FADE_MS = 600;

interface Arena {
  barricade: BarricadeDef;
  left: number;
  right: number;
  wave: number;
  queue: Side[];
  /** Policiais da onda atual. */
  members: Police[];
  timer: number;
}

/**
 * Ondas das barricadas: perto de uma barricada, a câmera trava (arena) e os policiais entram
 * um de cada vez. Quando a última onda cai, a câmera solta e a barricada fica vencida.
 */
export class Waves {
  readonly cops: Police[] = [];
  /** Chamado quando um policial dispara (a cena resolve o acerto no Kael). */
  onFire?: (cop: Police) => void;
  /** Chamado quando a última onda de uma barricada cai (a câmera solta). */
  onCleared?: () => void;
  private arena?: Arena;
  private readonly cleared = new Set<BarricadeDef>();
  private debug?: { text: Phaser.GameObjects.Text; labels: Map<Police, Phaser.GameObjects.Text> };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly level: LevelDef,
    private readonly groundY: number,
    private readonly camRig: CameraRig,
    private readonly director: EnemyDirector,
  ) {}

  /** Limites do Kael enquanto a arena está ativa. */
  get bounds(): [number, number] | undefined {
    return this.arena && [this.arena.left + ARENA_MARGIN, this.arena.right - ARENA_MARGIN];
  }

  update(delta: number, kael: CopTarget): void {
    if (!this.arena && kael.alive) this.tryStart(kael.x);
    if (this.arena) this.updateArena(delta);
    for (const c of this.cops) c.update(delta, kael);
    this.removeBodies();
    if (this.debug) this.drawDebug();
  }

  private tryStart(kaelX: number): void {
    const b = this.level.barricades.find((b) => !this.cleared.has(b) && kaelX >= b.x - TRIGGER_BEFORE && kaelX < b.x);
    if (!b) return;
    const w = this.scene.cameras.main.width;
    const left = Phaser.Math.Clamp(b.x + ARENA_AHEAD - w, 0, this.level.width - w);
    this.arena = { barricade: b, left, right: left + w, wave: -1, queue: [], members: [], timer: 0 };
    this.camRig.lock(left + w / 2);
    this.nextWave();
  }

  private nextWave(): void {
    const a = this.arena!;
    a.wave += 1;
    a.queue = [...a.barricade.waves[a.wave]];
    a.members = [];
    a.timer = FIRST_SPAWN_MS;
  }

  private updateArena(delta: number): void {
    const a = this.arena!;
    a.timer -= delta;
    if (a.queue.length > 0) {
      if (a.timer <= 0) {
        this.spawn(a, a.queue.shift()!);
        a.timer = SPAWN_GAP_MS;
      }
      return;
    }
    if (a.members.some((c) => c.alive)) {
      a.timer = WAVE_GAP_MS;
      return;
    }
    if (a.timer > 0) return;
    if (a.wave + 1 < a.barricade.waves.length) return this.nextWave();
    this.cleared.add(a.barricade);
    this.arena = undefined;
    this.camRig.unlock();
    this.onCleared?.();
  }

  private spawn(a: Arena, side: Side): void {
    const look = this.director.next(this.cops.map((c) => c.look));
    const edge = side === 'right' ? a.right : a.left;
    const dir = side === 'right' ? -1 : 1;
    const taken = this.cops.filter((c) => c.alive).map((c) => c.stopX);
    let stop = edge + dir * Phaser.Math.Between(...STOP_RANGE);
    for (let i = 0; i < 8 && taken.some((t) => Math.abs(t - stop) < STOP_SPACING); i++) {
      stop = edge + dir * Phaser.Math.Between(...STOP_RANGE);
    }
    const cop = new Police(this.scene, edge - dir * SPAWN_OUTSIDE, this.groundY, look, undefined, stop);
    cop.on(GUNNER_FIRE, (c: Police) => this.onFire?.(c));
    this.cops.push(cop);
    a.members.push(cop);
  }

  /** Corpos somem depois de um tempo (com o fade), para não acumular. */
  private removeBodies(): void {
    const now = this.scene.time.now;
    for (let i = this.cops.length - 1; i >= 0; i--) {
      const c = this.cops[i];
      if (c.alive) continue;
      const t = now - c.downAt - BODY_MS;
      if (t < 0) continue;
      c.setAlpha(1 - t / FADE_MS);
      if (t >= FADE_MS) {
        this.debug?.labels.get(c)?.destroy();
        this.debug?.labels.delete(c);
        c.destroy();
        this.cops.splice(i, 1);
      }
    }
  }

  setTint(tint: number): void {
    for (const c of this.cops) c.setTint(tint);
  }

  /** F1: aparência e vida de cada policial, a seed e a onda atual. */
  toggleDebug(): void {
    if (this.debug) {
      this.debug.text.destroy();
      this.debug.labels.forEach((l) => l.destroy());
      this.debug = undefined;
      return;
    }
    const text = this.scene.add
      .text(this.scene.scale.width / 2, 10, '', { fontFamily: 'monospace', fontSize: '12px', color: '#ffe08a', backgroundColor: '#000a' })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(1000);
    this.debug = { text, labels: new Map() };
  }

  private drawDebug(): void {
    const { text, labels } = this.debug!;
    const a = this.arena;
    const arena = a ? `barricada ${a.barricade.x}: onda ${a.wave + 1}/${a.barricade.waves.length}, faltam ${a.queue.length}` : 'sem arena';
    text.setX(this.scene.scale.width / 2).setText(`seed ${this.director.seed} · ${arena} · na tela: ${this.cops.map((c) => lookId(c.look)).join(' ') || '-'}`);
    for (const c of this.cops) {
      let l = labels.get(c);
      if (!l) {
        l = this.scene.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: '11px', color: '#ffe08a', backgroundColor: '#000a' }).setOrigin(0.5, 1).setDepth(1000);
        labels.set(c, l);
      }
      l.setPosition(c.x, c.y - 112).setText(`${lookId(c.look)} ${c.state} ${c.hp}`);
    }
  }
}
