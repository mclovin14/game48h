import Phaser from 'phaser';
import { ALL_LOOKS, lookId, type PoliceLook } from './Police';

/**
 * Sorteia as aparências dos policiais num "saco embaralhado" das 9 combinações:
 * nunca dois iguais seguidos e nunca dois iguais na tela; de preferência, sem repetir cabeça nem tom
 * de quem já está na tela. Mesma seed, mesma sequência.
 */
export class EnemyDirector {
  private readonly rng: Phaser.Math.RandomDataGenerator;
  private bag: PoliceLook[] = [];
  private last?: string;

  constructor(readonly seed: string) {
    this.rng = new Phaser.Math.RandomDataGenerator([seed]);
  }

  /** Próxima aparência, evitando as que estão na tela (`onScreen`) e a última sorteada. */
  next(onScreen: PoliceLook[]): PoliceLook {
    const busy = new Set(onScreen.map(lookId));
    if (this.last) busy.add(this.last);
    for (let tries = 0; tries < 2; tries++) {
      if (tries > 0 || this.bag.length === 0) this.bag.push(...this.rng.shuffle([...ALL_LOOKS]));
      // entre as permitidas, a primeira do saco que menos repete cabeça ou tom de quem está na tela
      let best = -1;
      let bestScore = Infinity;
      this.bag.forEach((l, i) => {
        if (busy.has(lookId(l))) return;
        const score = onScreen.filter((o) => o.head === l.head).length + onScreen.filter((o) => o.tone === l.tone).length;
        if (score < bestScore) [best, bestScore] = [i, score];
      });
      if (best >= 0) return this.take(best);
    }
    // só acontece com as 9 na tela
    return this.take(0);
  }

  private take(i: number): PoliceLook {
    const [look] = this.bag.splice(i, 1);
    this.last = lookId(look);
    return look;
  }
}
