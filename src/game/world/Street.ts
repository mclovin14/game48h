import Phaser from 'phaser';
import { ambient, smoothstep } from './DayCycle';
import type { LevelDef } from '../levels/level_1';

// Fachadas e postes da rua, que mudam com o ciclo do tempo.
// Cada fachada tem três camadas iguais no recorte (tools/build_background.py):
//   dusk   entardecer, escurece pela luz ambiente
//   night  noite sem as luzes, aparece aos poucos por cima
//   lights só as janelas e placas acesas; liga de uma vez, piscando, quando passa a hora da loja

const LEVEL_DIR = 'levels/level_1';

/** Faixa do t em que a noite cobre o entardecer. */
const NIGHT_FADE: [number, number] = [0.25, 0.95];
/** Faixa em que as lojas acendem (cada uma sorteia a sua hora). */
const SHOP_ON: [number, number] = [0.5, 0.8];
/** Faixa em que os postes acendem. */
const LAMP_ON: [number, number] = [0.6, 0.72];
/** Piscada ao acender: alfa a cada passo. */
const FLICKER = [0.7, 0.1, 0.5, 0, 0.9, 0.4, 1];
const FLICKER_STEP_MS = 70;

const GLOW = 'lamp_glow';
const POOL = 'lamp_pool';
const WALL = 'back_wall';
/** Muro atrás das fachadas: tapa os vãos entre os prédios até esta altura. */
const WALL_H = 90;

export function facadeKey(name: string, layer: 'dusk' | 'night' | 'lights'): string {
  return `facade_${name}_${layer}`;
}

/** Carrega a arte da rua (chamar no preload do Boot). */
export function loadStreet(scene: Phaser.Scene, level: LevelDef): void {
  for (const name of new Set(level.facades.map((f) => f.name))) {
    for (const layer of ['dusk', 'night', 'lights'] as const)
      scene.load.image(facadeKey(name, layer), `${LEVEL_DIR}/facades/${name}_${layer}.png`);
  }
  scene.load.image('skyline_dusk', `${LEVEL_DIR}/skyline_dusk.png`);
  scene.load.image('skyline_lights', `${LEVEL_DIR}/skyline_lights.png`);
  scene.load.image('lamp_post', `${LEVEL_DIR}/props/lamp_post.png`);
}

/** Luz sumindo do centro para a borda, feita no canvas (o Graphics não leva degradê para a textura). */
function makeLightTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(GLOW)) return;
  const radial = (key: string, w: number, h: number, stops: [number, string][]) => {
    const tex = scene.textures.createCanvas(key, w, h)!;
    const ctx = tex.context;
    ctx.save();
    ctx.scale(1, h / w);
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    for (const [at, color] of stops) g.addColorStop(at, color);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, w);
    ctx.restore();
    tex.refresh();
  };
  radial(GLOW, 96, 96, [
    [0, 'rgba(255,236,180,0.95)'],
    [0.25, 'rgba(255,200,120,0.45)'],
    [1, 'rgba(255,170,90,0)'],
  ]);
  radial(POOL, 220, 40, [
    [0, 'rgba(255,214,150,0.55)'],
    [1, 'rgba(255,190,120,0)'],
  ]);
}

/** Muro de concreto contínuo (cores da calçada da IA), com placas, junta e manchas. */
function makeWallTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(WALL)) return;
  const w = 64;
  const g = scene.make.graphics({}, false);
  g.fillStyle(0x8e6f78).fillRect(0, 0, w, WALL_H);
  // capa do muro em cima
  g.fillStyle(0xb68a89).fillRect(0, 0, w, 3);
  g.fillStyle(0x715062).fillRect(0, 3, w, 2);
  // juntas das placas
  g.fillStyle(0x715062).fillRect(0, 5, 1, WALL_H).fillRect(32, 5, 1, WALL_H).fillRect(0, 46, w, 1);
  // manchas de umidade em posições fixas (repete sem emenda)
  g.fillStyle(0x7d6070);
  for (const [x, y, ww, hh] of [[6, 12, 6, 3], [40, 26, 4, 6], [18, 58, 8, 2], [50, 70, 5, 4], [9, 80, 3, 3]]) g.fillRect(x, y, ww, hh);
  // sombra no pé, junto da calçada
  g.fillStyle(0x57394c).fillRect(0, WALL_H - 3, w, 3);
  g.generateTexture(WALL, w, WALL_H);
  g.destroy();
}

/** Algo que acende numa hora e apaga se o relógio voltar. */
class Switch {
  on = false;
  private timer?: Phaser.Time.TimerEvent;

  constructor(
    private readonly scene: Phaser.Scene,
    readonly at: number,
    private readonly targets: Phaser.GameObjects.Components.Alpha[],
  ) {
    for (const t of targets) t.setAlpha(0);
  }

  update(t: number): void {
    if (t >= this.at && !this.on) this.turn(true);
    else if (t < this.at && this.on) this.turn(false);
  }

  private turn(on: boolean): void {
    this.on = on;
    this.timer?.remove();
    if (!on) {
      for (const t of this.targets) t.setAlpha(0);
      return;
    }
    let i = 0;
    this.timer = this.scene.time.addEvent({
      delay: FLICKER_STEP_MS,
      repeat: FLICKER.length - 1,
      callback: () => {
        for (const t of this.targets) t.setAlpha(FLICKER[i]);
        i++;
      },
    });
  }
}

export class Street {
  private readonly dusk: Phaser.GameObjects.Image[] = [];
  private readonly night: Phaser.GameObjects.Image[] = [];
  private readonly lamps: Phaser.GameObjects.Image[] = [];
  private readonly wall: Phaser.GameObjects.TileSprite;
  private readonly switches: Switch[] = [];

  /** `baseY`: linha da base das paredes (fundo da calçada). */
  constructor(scene: Phaser.Scene, level: LevelDef, baseY: number, groundY: number) {
    makeLightTextures(scene);
    makeWallTexture(scene);
    const rng = new Phaser.Math.RandomDataGenerator(['quadra1-luzes']);
    this.wall = scene.add.tileSprite(0, baseY, level.width, WALL_H, WALL).setOrigin(0, 1);

    let x = 0;
    const lampXs: number[] = [];
    for (const f of level.facades) {
      x += f.gap ?? 0;
      // poste no meio do vão antes da fachada
      lampXs.push(x - (f.gap ?? 0) / 2);
      const d = scene.add.image(x, baseY, facadeKey(f.name, 'dusk')).setOrigin(0, 1);
      const n = scene.add.image(x, baseY, facadeKey(f.name, 'night')).setOrigin(0, 1).setAlpha(0);
      const l = scene.add.image(x, baseY, facadeKey(f.name, 'lights')).setOrigin(0, 1);
      this.dusk.push(d);
      this.night.push(n);
      this.switches.push(new Switch(scene, rng.realInRange(...SHOP_ON), [l]));
      x += d.width;
    }

    for (const i of level.lamps) {
      const lx = lampXs[i];
      if (lx === undefined || lx > level.width) continue;
      const post = scene.add.image(lx, groundY + 2, 'lamp_post').setOrigin(0.5, 1);
      this.lamps.push(post);
      // cabeça da luminária: perto do canto de cima, do lado para onde o braço aponta
      const headX = post.x + post.width / 2 - 8;
      const headY = post.y - post.height + 22;
      const glow = scene.add.image(headX, headY, GLOW).setBlendMode(Phaser.BlendModes.ADD);
      const pool = scene.add.image(headX, groundY + 4, POOL).setBlendMode(Phaser.BlendModes.ADD);
      this.switches.push(new Switch(scene, rng.realInRange(...LAMP_ON), [glow, pool]));
    }
  }

  update(t: number): void {
    const tint = ambient(t);
    const nightA = smoothstep(...NIGHT_FADE, t);
    this.wall.setTint(tint);
    for (const d of this.dusk) d.setTint(tint);
    for (const n of this.night) n.setAlpha(nightA);
    for (const p of this.lamps) p.setTint(tint);
    for (const s of this.switches) s.update(t);
  }
}
