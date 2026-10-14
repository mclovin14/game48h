import Phaser from 'phaser';
import type { HitPoint } from './Bullets';

// Sangue (plano playtest_fixes_1.md, fase 4): gotas que saem do acerto, caem e viram mancha no chão.
// Desenhado no Phaser, sem arte nova. Números provisórios [TESTE].

/** Os dois tons de sangue da paleta (cores de efeito), escurecidos pela luz ambiente. */
const COLORS = [0xb02024, 0x6e1018];
/** Respingo do tiro letal e do tiro no Kael; o da bala não letal é pequeno, sem poça e sem pingar. */
const SPLASH_DROPS: [number, number] = [6, 10]; // [TESTE]
const SMALL_DROPS: [number, number] = [2, 3]; // [TESTE]
/** Gotas: tamanho em px, velocidade (px/s) na direção da bala, abertura do leque (rad) e gravidade (px/s²). */
const DROP_SIZE: [number, number] = [1, 2];
const DROP_SPEED: [number, number] = [50, 170]; // [TESTE]
const SPREAD = 0.7; // [TESTE]
const LIFT = 70; // px/s para cima no começo, para o respingo subir um pouco antes de cair
const GRAVITY = 700; // [TESTE]
/** A gota para numa linha entre o chão e alguns px abaixo, para as manchas não ficarem todas na mesma linha. */
const LAND_BAND = 3;
/** Mancha: largura, quanto tempo fica inteira e quanto leva para sumir; teto de manchas (as mais velhas saem). */
const STAIN_W: [number, number] = [2, 4];
const STAIN_HOLD_MS = 6000; // [TESTE]
const STAIN_FADE_MS = 2500; // [TESTE]
const MAX_STAINS = 80;
/** Pingando depois do acerto: uma gota a cada DRIP_EVERY_MS, por DRIP_MS. */
const DRIP_EVERY_MS = 600; // [TESTE]
const DRIP_MS = 2400; // [TESTE]
/** Chuva: as manchas envelhecem até (1 + RAIN_FADE) vezes mais rápido com a chuva no máximo. */
const RAIN_FADE = 2; // [TESTE]

interface Drop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: number;
  landY: number;
  /** Ao chegar no chão: vira mancha ou some (respingo da bala não letal). */
  stain: boolean;
}

interface Stain {
  x: number;
  y: number;
  w: number;
  color: number;
  age: number;
}

/** De onde a gota pinga agora (quem foi atingido); null para de pingar (caiu, morreu, sumiu). */
export type DripSource = () => { x: number; y: number } | null;

interface Dripper {
  src: DripSource;
  left: number;
  next: number;
}

export class Blood {
  private readonly drops: Drop[] = [];
  private readonly stains: Stain[] = [];
  private readonly drippers: Dripper[] = [];
  /** Manchas no chão, atrás dos personagens: a cena cria o Blood antes deles. */
  private readonly floor: Phaser.GameObjects.Graphics;
  /** Gotas no ar, na frente dos personagens. */
  private readonly air: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    private readonly groundY: number,
    airDepth: number,
  ) {
    this.floor = scene.add.graphics();
    this.air = scene.add.graphics().setDepth(airDepth);
  }

  /** Respingo no ponto do acerto, para o lado em que a bala voava. `small`: bala não letal. */
  splash(at: HitPoint, small = false): void {
    const [lo, hi] = small ? SMALL_DROPS : SPLASH_DROPS;
    for (let i = Phaser.Math.Between(lo, hi); i > 0; i--) {
      const a = Phaser.Math.FloatBetween(-SPREAD, SPREAD);
      const v = Phaser.Math.FloatBetween(...DROP_SPEED) * (small ? 0.6 : 1);
      this.drop(at.x, at.y, at.dir * Math.cos(a) * v, Math.sin(a) * v - LIFT, !small);
    }
  }

  /** Quem foi atingido pinga por um tempo curto. */
  bleed(src: DripSource): void {
    this.drippers.push({ src, left: DRIP_MS, next: Phaser.Math.Between(100, DRIP_EVERY_MS) });
  }

  /** `tint`: luz ambiente (multiplica as cores); `rain`: 0 a 1, faz as manchas sumirem mais rápido. */
  update(delta: number, tint: number, rain = 0): void {
    const dt = delta / 1000;
    for (let i = this.drippers.length - 1; i >= 0; i--) {
      const d = this.drippers[i];
      const p = d.src();
      d.left -= delta;
      d.next -= delta;
      if (!p || d.left <= 0) {
        this.drippers.splice(i, 1);
        continue;
      }
      if (d.next <= 0) {
        d.next += DRIP_EVERY_MS;
        this.drop(p.x + Phaser.Math.Between(-2, 2), p.y, Phaser.Math.FloatBetween(-8, 8), 0, true);
      }
    }
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      d.vy += GRAVITY * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.y < d.landY) continue;
      this.drops.splice(i, 1);
      if (d.stain) this.addStain(d);
    }
    const age = delta * (1 + RAIN_FADE * rain);
    for (let i = this.stains.length - 1; i >= 0; i--) {
      this.stains[i].age += age;
      if (this.stains[i].age >= STAIN_HOLD_MS + STAIN_FADE_MS) this.stains.splice(i, 1);
    }
    this.draw(tint);
  }

  private drop(x: number, y: number, vx: number, vy: number, stain: boolean): void {
    this.drops.push({
      x,
      y,
      vx,
      vy,
      size: Phaser.Math.Between(...DROP_SIZE),
      color: Phaser.Utils.Array.GetRandom(COLORS),
      landY: this.groundY + Phaser.Math.Between(0, LAND_BAND),
      stain,
    });
  }

  private addStain(d: Drop): void {
    if (this.stains.length >= MAX_STAINS) this.stains.shift();
    const w = Phaser.Math.Between(...STAIN_W);
    this.stains.push({ x: Math.round(d.x - w / 2), y: Math.round(d.landY), w, color: d.color, age: 0 });
  }

  private draw(tint: number): void {
    const lit = (c: number) => {
      const r = (((c >> 16) & 0xff) * ((tint >> 16) & 0xff)) / 255;
      const g = (((c >> 8) & 0xff) * ((tint >> 8) & 0xff)) / 255;
      const b = ((c & 0xff) * (tint & 0xff)) / 255;
      return (r << 16) | (g << 8) | b;
    };
    this.floor.clear();
    for (const s of this.stains) {
      const fade = 1 - Math.max(0, s.age - STAIN_HOLD_MS) / STAIN_FADE_MS;
      this.floor.fillStyle(lit(s.color), fade).fillRect(s.x, s.y, s.w, 1);
    }
    this.air.clear();
    for (const d of this.drops) this.air.fillStyle(lit(d.color), 1).fillRect(Math.round(d.x), Math.round(d.y), d.size, d.size);
  }
}
