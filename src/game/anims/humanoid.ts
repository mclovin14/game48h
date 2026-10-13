import Phaser from 'phaser';

// Personagens humanos de 128x128 virados para East (Kael, policiais e mercenários).
// Uma sheet horizontal por animação; o jogo espelha para West.

export const FRAME = 128;
/** Coluna do centro do corpo no quadro. É o eixo do espelhamento, para o boneco não pular ao virar. */
export const BODY_X = 61;

export type AnimName =
  | 'idle'
  | 'walk'
  | 'run'
  | 'idle_gun'
  | 'walk_gun'
  | 'run_gun'
  | 'run_gun_stop'
  | 'reload_gun'
  | 'aim_gun'
  | 'shoot_gun'
  | 'jump'
  | 'jump_gun'
  | 'crouch'
  | 'crouch_gun'
  | 'crouch_aim_gun'
  | 'crouch_shoot_gun'
  | 'crouch_reload_gun'
  | 'death'
  | 'hurt'
  | 'knockout'
  // combo sem arma, só o Kael (jab, direto, chute)
  | 'punch_1'
  | 'punch_2'
  | 'kick'
  // mercenários (fuzil)
  | 'idle_rifle'
  | 'walk_rifle'
  | 'run_rifle'
  | 'aim_rifle'
  | 'shoot_rifle'
  | 'reload_rifle'
  | 'crouch_rifle'
  | 'crouch_shoot_rifle'
  | 'jump_rifle'
  | 'hold'
  // Adriana (cutscenes): presa, grita, solta e correndo, ajoelhada, abraço
  | 'held'
  | 'cry'
  | 'freed'
  | 'kneel'
  | 'hug';

export interface AnimDef {
  /** ms por quadro: um valor para todos ou um por quadro. */
  ms: number | number[];
  loop: boolean;
  /** Linha do chão no quadro (pixel mais baixo dos pés). */
  floor: number;
  /** Quadros em que o pé da frente pisa (os dois pés no chão): toca o passo. */
  steps?: number[];
}

const JUMP_MS = [45, 45, 45, 90, 95, 100, 100, 95, 90, 70, 90];
/** Quadros do pulo: o Kael sai do chão no `air` e volta no `land`. */
export const JUMP_PHASES = { air: 3, land: 9 };
/** Soma dos ms dos quadros [from, to) do pulo. */
export const jumpMs = (from: number, to: number) => JUMP_MS.slice(from, to).reduce((a, b) => a + b, 0);

/** Rajada de 3 do fuzil: flash, recuo e bala três vezes, depois a fumaça (tools/build_mercenary.py). */
const BURST_MS = [45, 45, 50, 45, 45, 50, 45, 45, 50, 80, 90, 90, 110, 160];

const DEATH_MS = [70, 80, 90, ...Array(13).fill(100), 90, 90, 80, 80, 70, 90, 120, 160, ...Array(5).fill(140), 1200];

export const ANIMS: Record<AnimName, AnimDef> = {
  idle: { ms: 150, loop: true, floor: 120 },
  walk: { ms: 110, loop: true, floor: 120, steps: [0, 4] },
  run: { ms: 72, loop: true, floor: 120, steps: [1, 6] },
  idle_gun: { ms: 150, loop: true, floor: 121 },
  walk_gun: { ms: 110, loop: true, floor: 121, steps: [0, 4] },
  run_gun: { ms: 72, loop: true, floor: 121, steps: [2, 6] },
  // parando a corrida armado: junta a segunda mão na pistola até o idle_gun
  run_gun_stop: { ms: 80, loop: false, floor: 121 },
  // 11 quadros x 190 ms = duração do colt_reload; o pente entra no quadro 6, junto do clique
  reload_gun: { ms: 190, loop: false, floor: 121 },
  aim_gun: { ms: 90, loop: false, floor: 121 },
  shoot_gun: { ms: [60, 60, 70, 80, 90, 90, 110, 160], loop: false, floor: 121 },
  // pulo para a frente: 0-2 impulso no chão, 3-8 no ar, 9-10 aterrissagem (JUMP_PHASES)
  jump: { ms: JUMP_MS, loop: false, floor: 120 },
  jump_gun: { ms: JUMP_MS, loop: false, floor: 121 },
  // agachar (ajoelhado): abaixa do idle até um joelho no chão; levantar é a mesma ao contrário. A pose parada é o último quadro.
  // A mira e o tiro ajoelhados são os de pé com o tronco 18 px mais baixo: mesmos tempos.
  crouch: { ms: 50, loop: false, floor: 120 },
  crouch_gun: { ms: 50, loop: false, floor: 121 },
  crouch_aim_gun: { ms: 90, loop: false, floor: 121 },
  crouch_shoot_gun: { ms: [60, 60, 70, 80, 90, 90, 110, 160], loop: false, floor: 121 },
  // só nos policiais: a recarga em pé com o tronco descido, mesmos tempos
  crouch_reload_gun: { ms: 190, loop: false, floor: 121 },
  death: { ms: DEATH_MS, loop: false, floor: 120 },
  hurt: { ms: [60, 70, 90, 90, 80, 100], loop: false, floor: 121 },
  knockout: { ms: [60, 70, 80, 90, 90, 100, 120, 1200], loop: false, floor: 121 },
  // combo (tools/build_melee.py): cada golpe sai da guarda e volta ao idle; o seguinte emenda em MELEE (Test.ts)
  punch_1: { ms: [45, 45, 50, 110, 60, 60, 70], loop: false, floor: 120 },
  punch_2: { ms: [55, 60, 45, 45, 130, 70, 70, 80], loop: false, floor: 120 },
  kick: { ms: [50, 50, 60, 70, 40, 220, 70, 70, 70, 80], loop: false, floor: 120 },
  idle_rifle: { ms: 150, loop: true, floor: 121 },
  walk_rifle: { ms: 110, loop: true, floor: 121, steps: [0, 4] },
  run_rifle: { ms: 72, loop: true, floor: 121, steps: [2, 6] },
  aim_rifle: { ms: 90, loop: false, floor: 121 },
  shoot_rifle: { ms: BURST_MS, loop: false, floor: 121 },
  // tira o pente e põe de volta (a mesma sequência ao contrário)
  reload_rifle: { ms: 120, loop: false, floor: 121 },
  // agacha já mirando: a pose parada é o último quadro
  crouch_rifle: { ms: 60, loop: false, floor: 121 },
  crouch_shoot_rifle: { ms: BURST_MS, loop: false, floor: 121 },
  // mesmas fases e tempos do pulo do Kael (JUMP_PHASES)
  jump_rifle: { ms: JUMP_MS, loop: false, floor: 121 },
  // segura a Adriana pelo braço (cutscene); casa com o held_east dela
  hold: { ms: 120, loop: true, floor: 121 },
  // Adriana (tools/build_adriana.py): o cry sai do held e para no último quadro (braço estendido)
  held: { ms: 110, loop: true, floor: 120 },
  cry: { ms: 90, loop: false, floor: 120 },
  freed: { ms: 80, loop: true, floor: 120 },
  kneel: { ms: 110, loop: false, floor: 120 },
  hug: { ms: 90, loop: false, floor: 120 },
};

export interface CharacterDef {
  key: string;
  anims: AnimName[];
  /** Caminho da sheet de uma animação, relativo a assets/. */
  sheet: (anim: AnimName) => string;
  /** Troca tempos ou chão de uma animação só neste personagem (ex.: o hurt do mercenário tem 7 quadros). */
  overrides?: Partial<Record<AnimName, Partial<AnimDef>>>;
}

/** Definição da animação para o personagem, com os overrides dele. */
export const animDef = (ch: CharacterDef, a: AnimName): AnimDef => ({ ...ANIMS[a], ...ch.overrides?.[a] });

export const KAEL: CharacterDef = {
  key: 'kael',
  anims: ['idle', 'walk', 'run', 'idle_gun', 'walk_gun', 'run_gun', 'run_gun_stop', 'reload_gun', 'aim_gun', 'shoot_gun', 'jump', 'jump_gun', 'crouch', 'crouch_gun', 'crouch_aim_gun', 'crouch_shoot_gun', 'death', 'punch_1', 'punch_2', 'kick'],
  sheet: (a) => `player/player_${a}_east_sheet.png`,
};

export const POLICE_MASTER: CharacterDef = {
  key: 'police_master',
  anims: [
    'idle_gun', 'walk_gun', 'run_gun', 'reload_gun', 'aim_gun', 'shoot_gun', 'jump_gun',
    'crouch_gun', 'crouch_aim_gun', 'crouch_shoot_gun', 'crouch_reload_gun', 'death', 'hurt', 'knockout',
  ],
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

export const MERCENARY_MASTER: CharacterDef = {
  key: 'mercenary_master',
  anims: [
    'idle_rifle', 'walk_rifle', 'run_rifle', 'aim_rifle', 'shoot_rifle', 'reload_rifle', 'crouch_rifle',
    'crouch_shoot_rifle', 'jump_rifle', 'hurt', 'knockout', 'death', 'hold',
  ],
  sheet: (a) => `enemies/mercenaries/master/mercenary_master_${a}_east_sheet.png`,
  overrides: {
    hurt: { ms: [60, 70, 90, 90, 80, 90, 100] },
    knockout: { ms: [60, 70, 80, 90, 90, 90, 90, 100, 100, 110, 120, 1200] },
    death: { ms: [60, 70, 80, ...Array(12).fill(100), 1200], floor: 121 },
  },
};

export const ADRIANA: CharacterDef = {
  key: 'adriana',
  anims: ['held', 'cry', 'freed', 'kneel', 'hug'],
  sheet: (a) => `characters/adriana/adriana_${a}_east_sheet.png`,
};

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
    const { ms, loop } = animDef(ch, a);
    const frames = scene.anims.generateFrameNumbers(textureKey(ch, a)).map((f, i) => ({
      ...f,
      duration: Array.isArray(ms) ? (ms[i] ?? ms[ms.length - 1]) : ms,
    }));
    scene.anims.create({ key, frames, repeat: loop ? -1 : 0 });
  }
}

/** Evento do sprite quando o pé pisa (quadros `steps` da animação). */
export const HUMANOID_STEP = 'humanoid-step';

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
    // o primeiro quadro só vem no START; os seguintes (e a volta ao 0 no loop) vêm no UPDATE
    const onFrame = (_a: Phaser.Animations.Animation, f: Phaser.Animations.AnimationFrame) => {
      if (animDef(this.ch, this.current).steps?.includes(f.index - 1)) this.emit(HUMANOID_STEP, this);
    };
    this.on(Phaser.Animations.Events.ANIMATION_START, onFrame);
    this.on(Phaser.Animations.Events.ANIMATION_UPDATE, onFrame);
    this.act(first);
  }

  act(anim: AnimName, opts: { reverse?: boolean; restart?: boolean; startFrame?: number } = {}): void {
    if (anim === this.current && !opts.restart && !opts.reverse && this.anims.isPlaying) return;
    this.current = anim;
    this.setOrigin(BODY_X / FRAME, (animDef(this.ch, anim).floor + 1) / FRAME);
    if (opts.reverse) this.playReverse(animKey(this.ch, anim));
    else this.play({ key: animKey(this.ch, anim), startFrame: opts.startFrame ?? 0 });
  }

  /** Para a animação e segura um quadro (ex.: último quadro da mira). */
  hold(anim: AnimName, frame: number): void {
    this.anims.stop();
    this.current = anim;
    this.setOrigin(BODY_X / FRAME, (animDef(this.ch, anim).floor + 1) / FRAME);
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
