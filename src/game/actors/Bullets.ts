import Phaser from 'phaser';

/** Traço da bala: cabeça forte e rastro fraco atrás. */
const HEAD = { length: 12, width: 2, alpha: 1 };
const TRAIL = { length: 30, width: 1, alpha: 0.4 };
const COLOR = 0xfff0b0;

/** Caixa do corpo do alvo no mundo: x do centro, meia largura e as linhas de cima e de baixo. */
export interface BodyBox {
  x: number;
  halfW: number;
  top: number;
  bottom: number;
}

/** Onde a bala entrou no corpo e para que lado voava. */
export interface HitPoint {
  x: number;
  y: number;
  dir: 1 | -1;
}

export interface BulletStyle {
  /** px/s */
  speed: number;
  maxDist: number;
}

interface Bullet<P> {
  /** Ponto de saída e direção (1 ou -1); `slope` é quanto desce por px andado em x. */
  x0: number;
  y0: number;
  dir: 1 | -1;
  slope: number;
  dist: number;
  payload: P;
}

/**
 * Balas que voam em linha reta e acertam pela caixa do corpo do alvo, para o pulo e o
 * agachar desviarem de verdade. Uma instância por lado: a do Kael mira os policiais, a deles mira o Kael.
 * `P` é o que a bala leva até o alvo (dano, tipo de bala).
 */
export class Bullets<P> {
  private readonly list: Bullet<P>[] = [];
  private readonly gfx: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    depth: number,
    /** y do chão: bala que desce até ele some. */
    private readonly groundY: number,
    private readonly style: BulletStyle,
  ) {
    this.gfx = scene.add.graphics().setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
  }

  /** Sai de (x, y) e passa por (tx, ty). */
  fire(x: number, y: number, tx: number, ty: number, payload: P): void {
    const dir = tx >= x ? 1 : -1;
    const slope = (ty - y) / Math.max(1, Math.abs(tx - x));
    this.list.push({ x0: x, y0: y, dir, slope, dist: 0, payload });
  }

  /** Move as balas; cada uma acerta o primeiro alvo cujo corpo ela cruza neste quadro e chama `onHit(payload, índice do alvo, ponto)`. */
  update(delta: number, targets: BodyBox[], onHit: (payload: P, target: number, at: HitPoint) => void): void {
    const step = this.style.speed * (delta / 1000);
    for (let i = this.list.length - 1; i >= 0; i--) {
      const b = this.list[i];
      const x1 = b.x0 + b.dir * b.dist;
      b.dist += step;
      const x2 = b.x0 + b.dir * b.dist;
      const y2 = b.y0 + b.slope * b.dist;
      const lo = Math.min(x1, x2);
      const hi = Math.max(x1, x2);
      // o alvo mais perto do começo do trecho: a bala não atravessa um para acertar o de trás
      let hit = -1;
      let hitAt = Infinity;
      let point: HitPoint = { x: 0, y: 0, dir: b.dir };
      targets.forEach((t, j) => {
        if (lo > t.x + t.halfW || hi < t.x - t.halfW) return;
        const x = Phaser.Math.Clamp(t.x, lo, hi);
        const y = b.y0 + b.slope * Math.abs(x - b.x0);
        const along = Math.abs(x - x1);
        if (y >= t.top && y <= t.bottom && along < hitAt) {
          hit = j;
          hitAt = along;
          // entra pela borda do corpo do lado de onde a bala vem
          const ex = Phaser.Math.Clamp(t.x - b.dir * t.halfW, lo, hi);
          point = { x: ex, y: b.y0 + b.slope * Math.abs(ex - b.x0), dir: b.dir };
        }
      });
      if (hit >= 0) {
        this.list.splice(i, 1);
        onHit(b.payload, hit, point);
        continue;
      }
      if (b.dist > this.style.maxDist || y2 >= this.groundY) this.list.splice(i, 1);
    }
    this.draw();
  }

  /** O traço não passa do cano: no começo do voo ele é mais curto. */
  private draw(): void {
    this.gfx.clear();
    for (const b of this.list) {
      for (const s of [TRAIL, HEAD]) {
        const back = Math.max(0, b.dist - s.length);
        this.gfx.lineStyle(s.width, COLOR, s.alpha);
        this.gfx.lineBetween(b.x0 + b.dir * back, b.y0 + b.slope * back, b.x0 + b.dir * b.dist, b.y0 + b.slope * b.dist);
      }
    }
  }
}
