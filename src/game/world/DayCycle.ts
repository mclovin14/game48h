import Phaser from 'phaser';

// Ciclo do entardecer para a noite (plano world_camera_enemies.md, fase 2).
// `t` vai de 0 (entardecer, conceito A) a 1 (noite fechada) e para lá. Passa pelo anoitecer roxo do conceito B.

/** Hora mostrada na tela: de 17:30 a 19:30 [TESTE]. */
const CLOCK_START_MIN = 17 * 60 + 30;
const CLOCK_SPAN_MIN = 120;

export class DayCycle {
  /** 0 = entardecer, 1 = noite. */
  t: number;

  constructor(
    private readonly durationMs: number,
    start = 0,
  ) {
    this.t = start;
  }

  update(delta: number): void {
    this.t = Math.min(1, this.t + delta / this.durationMs);
  }

  /** Avança ou volta o relógio (teclas [ e ]). */
  shift(dt: number): void {
    this.t = Phaser.Math.Clamp(this.t + dt, 0, 1);
  }

  clock(): string {
    const m = Math.round(CLOCK_START_MIN + this.t * CLOCK_SPAN_MIN);
    return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  }
}

/** Interpola entre cores-chave igualmente espaçadas em t (0..1). */
export function lerpColors(keys: number[], t: number): number {
  const s = Phaser.Math.Clamp(t, 0, 1) * (keys.length - 1);
  const i = Math.min(Math.floor(s), keys.length - 2);
  const a = Phaser.Display.Color.IntegerToColor(keys[i]);
  const b = Phaser.Display.Color.IntegerToColor(keys[i + 1]);
  const c = Phaser.Display.Color.Interpolate.ColorWithColor(a, b, 100, Math.round((s - i) * 100));
  return Phaser.Display.Color.GetColor(c.r, c.g, c.b);
}

/** 0 antes de `a`, 1 depois de `b`, curva suave no meio. */
export function smoothstep(a: number, b: number, t: number): number {
  const x = Phaser.Math.Clamp((t - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
}

/** Luz ambiente que multiplica personagens, chão e fachadas: branco no entardecer, rosado no anoitecer, azul à noite. */
export const AMBIENT = [0xffffff, 0xf2d6d0, 0xc0a6c4, 0x8a8cc4, 0x6c7cc0];

export function ambient(t: number): number {
  return lerpColors(AMBIENT, t);
}
