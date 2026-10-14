import Phaser from 'phaser';
import { VOLUME, setLoopVolume, startLoop } from '../audio/Sfx';

// Chuva aleatória à noite (plano playtest_fixes_1.md, fase 7). Riscos desenhados no Phaser, presos à câmera:
// uma camada atrás dos personagens (fraca e lenta) e outra na frente (forte e rápida), respingos no chão,
// um véu azul-escuro por cima da cena e o loop de chuva subindo junto. Números provisórios [TESTE].

/** Chance de chover na jogada e em que parte do ciclo (0 = entardecer, 1 = noite) ela começa. */
const CHANCE = 0.5; // [TESTE]
const START_T: [number, number] = [0.7, 0.85]; // [TESTE]
/** Da primeira gota até a chuva cheia; desligada pela tecla de teste, some neste tempo. */
const RAMP_MS = 15000; // [TESTE]
const STOP_MS = 3000;
/** Riscos: quantos no máximo, altura (px), velocidade de queda (px/s), alfa. A inclinação é a mesma nas duas. */
const LAYERS = {
  back: { count: 240, len: [5, 8], speed: [420, 520], alpha: 0.4 },
  front: { count: 110, len: [9, 13], speed: [700, 860], alpha: 0.7 },
} as const;
const SLANT = 0.18; // px para o lado por px de queda [TESTE]
const COLOR = 0xb4c4dc;
/** Respingos no chão: por segundo com a chuva cheia, quanto duram e a faixa da calçada e da rua onde caem. */
const SPLASH_PER_S = 60; // [TESTE]
const SPLASH_MS = 110;
/** Véu por cima da cena com a chuva cheia: escurece e puxa para o azul a luz ambiente. */
const VEIL = { color: 0x0c1430, alpha: 0.22 }; // [TESTE]

type LayerName = keyof typeof LAYERS;

interface Streak {
  x: number;
  y: number;
  len: number;
  speed: number;
}

interface Splash {
  x: number;
  y: number;
  age: number;
}

export class Rain {
  /** 0 a 1: quanto está chovendo agora. */
  intensity = 0;
  /** Parte do ciclo em que a chuva começa; null = não chove nesta jogada. */
  readonly startT: number | null;
  /** Tecla de teste: força ligada (true) ou desligada (false); undefined segue o sorteio. */
  private forced?: boolean;
  /** Se está chovendo ou entrando (o que a tecla de teste inverte). */
  private wanted = false;
  private readonly streaks: Record<LayerName, Streak[]> = { back: [], front: [] };
  private readonly splashes: Splash[] = [];
  private splashDebt = 0;
  private readonly back: Phaser.GameObjects.Graphics;
  private readonly front: Phaser.GameObjects.Graphics;
  private readonly veil: Phaser.GameObjects.Rectangle;
  private sound?: Phaser.Sound.BaseSound;
  /** Fração do volume do som (as cutscenes dos finais abaixam e calam a chuva); os riscos não mudam. */
  private readonly duck = { v: 1 };

  /**
   * `seed`: a mesma do EnemyDirector, para repetir a jogada. `backDepth` fica atrás dos personagens
   * (a cena cria a chuva antes deles); `frontDepth` na frente de tudo, menos da HUD.
   */
  constructor(
    private readonly scene: Phaser.Scene,
    seed: string,
    /** Faixa do chão (y do mundo) onde caem os respingos. */
    private readonly splashBand: [number, number],
    frontDepth: number,
  ) {
    const rng = new Phaser.Math.RandomDataGenerator([`rain:${seed}`]);
    this.startT = rng.frac() < CHANCE ? rng.realInRange(...START_T) : null;
    this.back = scene.add.graphics().setScrollFactor(0);
    this.veil = scene.add
      .rectangle(0, 0, 1, 1, VEIL.color)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(frontDepth - 0.5)
      .setAlpha(0);
    this.front = scene.add.graphics().setScrollFactor(0).setDepth(frontDepth);
    for (const name of Object.keys(LAYERS) as LayerName[]) {
      const l = LAYERS[name];
      for (let i = 0; i < l.count; i++) {
        this.streaks[name].push({
          x: Math.random(),
          y: Math.random(),
          len: Phaser.Math.Between(l.len[0], l.len[1]),
          speed: Phaser.Math.Between(l.speed[0], l.speed[1]),
        });
      }
    }
    const stop = () => this.sound?.stop();
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, stop);
    scene.events.once(Phaser.Scenes.Events.DESTROY, stop);
  }

  /** Tecla de teste: liga e desliga a chuva por cima do sorteio. */
  toggle(): void {
    this.forced = !this.wanted;
  }

  /** Leva o som da chuva a `factor` do volume normal em `ms` (0 = silêncio), sem mexer nos riscos. */
  quiet(factor: number, ms: number): void {
    this.scene.tweens.killTweensOf(this.duck);
    this.scene.tweens.add({ targets: this.duck, v: factor, duration: ms });
  }

  /** `t`: hora do ciclo (0 a 1). */
  update(delta: number, t: number): void {
    const want = this.forced ?? (this.startT !== null && t >= this.startT);
    this.wanted = want;
    this.intensity = Phaser.Math.Clamp(this.intensity + (want ? delta / RAMP_MS : -delta / STOP_MS), 0, 1);
    if (this.intensity > 0 && !this.sound) this.sound = startLoop(this.scene, 'rain_loop');
    if (this.sound) setLoopVolume(this.sound, VOLUME.rain * this.intensity * this.duck.v);
    this.draw(delta);
  }

  private draw(delta: number): void {
    const { width: w, height: h } = this.scene.scale;
    const cam = this.scene.cameras.main;
    this.back.clear();
    this.front.clear();
    this.veil.setSize(w, h).setAlpha(VEIL.alpha * this.intensity);
    if (this.intensity <= 0) {
      this.splashes.length = 0;
      return;
    }
    const dt = delta / 1000;
    for (const name of Object.keys(LAYERS) as LayerName[]) {
      const l = LAYERS[name];
      const g = name === 'back' ? this.back : this.front;
      g.fillStyle(COLOR, l.alpha);
      // a chuva engrossa ligando mais riscos do mesmo conjunto
      const n = Math.round(l.count * this.intensity);
      for (let i = 0; i < n; i++) {
        const s = this.streaks[name][i];
        s.y += (s.speed * dt) / h;
        s.x += (s.speed * SLANT * dt) / w;
        if (s.y > 1) {
          s.y -= 1 + s.len / h;
          s.x = Math.random();
        }
        if (s.x > 1) s.x -= 1;
        // risco inclinado de 1 px: um pixel por linha, deslocado conforme desce
        const x0 = Math.round(s.x * w);
        const y0 = Math.round(s.y * h);
        for (let k = 0; k < s.len; k++) g.fillRect(x0 + Math.round(k * SLANT), y0 + k, 1, 1);
      }
    }
    // respingos no chão: um "v" de 3 px que dura um instante
    this.splashDebt += SPLASH_PER_S * this.intensity * dt;
    for (; this.splashDebt >= 1; this.splashDebt--) {
      this.splashes.push({ x: Phaser.Math.Between(0, w), y: Phaser.Math.Between(...this.splashBand), age: 0 });
    }
    this.back.fillStyle(COLOR, 0.6);
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.age += delta;
      if (s.age >= SPLASH_MS) {
        this.splashes.splice(i, 1);
        continue;
      }
      const y = Math.round(s.y - cam.scrollY);
      if (s.age < SPLASH_MS / 2) this.back.fillRect(s.x, y, 1, 1);
      else this.back.fillRect(s.x - 1, y - 1, 1, 1).fillRect(s.x + 1, y - 1, 1, 1);
    }
  }
}
