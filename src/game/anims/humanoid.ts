import Phaser from 'phaser';

// Personagens humanos de 128x128 virados para East (Kael e policiais).
// Uma sheet horizontal por animação; o jogo espelha para West.

export const FRAME = 128;
/** Coluna do centro do corpo no quadro. É o eixo do espelhamento, para o boneco não pular ao virar. */
export const BODY_X = 61;

export type AnimName =
  | 'idle'
  | 'walk'
  | 'idle_gun'
  | 'walk_gun'
  | 'aim_gun'
  | 'shoot_gun'
  | 'death'
  | 'hurt'
  | 'knockout';

interface AnimDef {
  /** ms por quadro: um valor para todos ou um por quadro. */
  ms: number | number[];
  loop: boolean;
  /** Linha do chão no quadro (pixel mais baixo dos pés). */
  floor: number;
}

const DEATH_MS = [70, 80, 90, ...Array(13).fill(100), 90, 90, 80, 80, 70, 90, 120, 160, ...Array(5).fill(140), 1200];

export const ANIMS: Record<AnimName, AnimDef> = {
  idle: { ms: 150, loop: true, floor: 120 },
  walk: { ms: 110, loop: true, floor: 120 },
  idle_gun: { ms: 150, loop: true, floor: 121 },
  walk_gun: { ms: 110, loop: true, floor: 121 },
  aim_gun: { ms: 90, loop: false, floor: 121 },
  shoot_gun: { ms: [60, 60, 70, 80, 90, 90, 110, 160], loop: false, floor: 121 },
  death: { ms: DEATH_MS, loop: false, floor: 120 },
  hurt: { ms: [60, 70, 90, 90, 80, 100], loop: false, floor: 121 },
  knockout: { ms: [60, 70, 80, 90, 90, 100, 120, 1200], loop: false, floor: 121 },
};

export interface CharacterDef {
  key: string;
  anims: AnimName[];
  /** Caminho da sheet de uma animação, relativo a assets/. */
  sheet: (anim: AnimName) => string;
}

export const KAEL: CharacterDef = {
  key: 'kael',
  anims: ['idle', 'walk', 'idle_gun', 'walk_gun', 'aim_gun', 'shoot_gun', 'death'],
  sheet: (a) => `player/player_${a}_east_sheet.png`,
};

export const POLICE_MASTER: CharacterDef = {
  key: 'police_master',
  anims: ['idle_gun', 'walk_gun', 'aim_gun', 'shoot_gun', 'death', 'hurt', 'knockout'],
  sheet: (a) => `enemies/police/master/police_master_${a}_east_sheet.png`,
};

/** Variantes do policial (A negro, B branco e loiro, C asiático): mesmas animações e quadros do master. */
export const POLICE_VARIANTS = ['a', 'b', 'c'] as const;
export type PoliceVariant = (typeof POLICE_VARIANTS)[number];

export const POLICE: Record<PoliceVariant, CharacterDef> = Object.fromEntries(
  POLICE_VARIANTS.map((v) => [
    v,
    {
      key: `police_${v}`,
      anims: POLICE_MASTER.anims,
      sheet: (a: AnimName) => `enemies/police/police_${v}/police_${v}_${a}_east_sheet.png`,
    },
  ]),
) as Record<PoliceVariant, CharacterDef>;

export const textureKey = (ch: CharacterDef, a: AnimName) => `${ch.key}_${a}`;
const animKey = (ch: CharacterDef, a: AnimName) => `${ch.key}:${a}`;

export function loadSheets(scene: Phaser.Scene, ch: CharacterDef): void {
  for (const a of ch.anims) {
    scene.load.spritesheet(textureKey(ch, a), ch.sheet(a), { frameWidth: FRAME, frameHeight: FRAME });
  }
}

/** Cria as animações do personagem. Serve para qualquer textura com o mesmo padrão de sheets. */
export function registerAnims(scene: Phaser.Scene, ch: CharacterDef): void {
  for (const a of ch.anims) {
    const key = animKey(ch, a);
    if (scene.anims.exists(key)) continue;
    const { ms, loop } = ANIMS[a];
    const frames = scene.anims.generateFrameNumbers(textureKey(ch, a)).map((f, i) => ({
      ...f,
      duration: Array.isArray(ms) ? (ms[i] ?? ms[ms.length - 1]) : ms,
    }));
    scene.anims.create({ key, frames, repeat: loop ? -1 : 0 });
  }
}

/** Sprite de personagem: troca a altura da origem conforme o chão de cada animação e espelha pelo centro do corpo. */
export class Humanoid extends Phaser.GameObjects.Sprite {
  facing: 1 | -1 = 1;
  current: AnimName;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    readonly ch: CharacterDef,
    first: AnimName,
  ) {
    super(scene, x, y, textureKey(ch, first));
    this.current = first;
    scene.add.existing(this);
    this.act(first);
  }

  act(anim: AnimName, opts: { reverse?: boolean; restart?: boolean } = {}): void {
    if (anim === this.current && !opts.restart && !opts.reverse && this.anims.isPlaying) return;
    this.current = anim;
    this.setOrigin(BODY_X / FRAME, (ANIMS[anim].floor + 1) / FRAME);
    if (opts.reverse) this.playReverse(animKey(this.ch, anim));
    else this.play(animKey(this.ch, anim));
  }

  /** Para a animação e segura um quadro (ex.: último quadro da mira). */
  hold(anim: AnimName, frame: number): void {
    this.anims.stop();
    this.current = anim;
    this.setOrigin(BODY_X / FRAME, (ANIMS[anim].floor + 1) / FRAME);
    this.setTexture(textureKey(this.ch, anim), frame);
  }

  face(dir: 1 | -1): void {
    this.facing = dir;
    this.setScale(dir, 1);
  }

  frameCount(anim: AnimName): number {
    return this.scene.textures.get(textureKey(this.ch, anim)).frameTotal - 1;
  }
}
