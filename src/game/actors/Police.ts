import Phaser from 'phaser';
import { POLICE, POLICE_VARIANTS, type CharacterDef, type PoliceVariant } from '../anims/humanoid';
import { VOLUME } from '../audio/Sfx';
import { Gunner, type EnemyArchetype, type GunnerKit } from './Gunner';

/** Tons de farda (rampas em assets/enemies/police/uniform_tones.json). navy é a sheet original. */
export const UNIFORM_TONES = ['navy', 'slate', 'teal'] as const;
export type UniformTone = (typeof UNIFORM_TONES)[number];

/** Aparência: cabeça + tom da farda (3 x 3 = 9). Não muda o comportamento. */
export interface PoliceLook {
  head: PoliceVariant;
  tone: UniformTone;
}

export const lookId = (l: PoliceLook) => `${l.head}_${l.tone}`;

export const ALL_LOOKS: PoliceLook[] = POLICE_VARIANTS.flatMap((head) => UNIFORM_TONES.map((tone) => ({ head, tone })));

/** Sheets de uma aparência. Os tons fora o navy são texturas geradas no Boot (uniformTones.ts). */
export function lookDef(l: PoliceLook): CharacterDef {
  const base = POLICE[l.head];
  return l.tone === 'navy' ? base : { ...base, key: `${base.key}_${l.tone}` };
}

/** Carrega as sheets das três cabeças (Boot). */
export const POLICE_DEFS = POLICE_VARIANTS.map((v) => POLICE[v]);

/** Comportamento, separado da aparência. Por enquanto um só: a diferença entre policiais é só visual. */
export const ARCHETYPES = {
  // [TESTE]
  patrol: {
    hp: 2, fireMs: 800, range: 600, walkSpeed: 90, runSpeed: 190, walkLastPx: 70, mag: 8, aimHoldMs: 450, volley: [1, 4], volleyGapMs: 280, volleyPauseMs: 550,
    damage: 8, hitChance: 0.7,
    crouchReload: true, matchCrouchMs: 450, jumpOnEnter: 0.4, jumpWhenAimed: 0.15, jumpDist: 150, jumpHeight: 70, jumpKeepPx: 180,
    smart: {
      aimSpeed: 2, aimHoldMs: [150, 380], fireJitter: [0.4, 1.6], dodgeChance: 0.45, dodgeReactMs: [90, 180], dodgeCooldownMs: 1400,
      dodgeJumpH: 100, dodgeJumpSpeed: 2, closePx: 130,
    },
  },
} satisfies Record<string, EnemyArchetype>;

/** Pistola: um tiro por vez; agacha para recarregar. Cano a 91 px do chão (73 ajoelhado), 36 px à frente. */
const POLICE_KIT: GunnerKit = {
  idle: 'idle_gun',
  walk: 'walk_gun',
  run: 'run_gun',
  aim: 'aim_gun',
  shoot: 'shoot_gun',
  reload: 'reload_gun',
  crouch: 'crouch_gun',
  crouchAim: 'crouch_aim_gun',
  crouchShoot: 'crouch_shoot_gun',
  crouchReload: 'crouch_reload_gun',
  jump: 'jump_gun',
  shotSound: 'police_shot',
  shotVolume: VOLUME.copShot,
  reloadSound: 'colt_reload',
  reloadVolume: VOLUME.copReload,
  muzzle: { x: 36, h: 91 },
  muzzleCrouch: { x: 36, h: 73 },
  bodyH: 100,
};

/** Policial inimigo: aparência (cabeça + farda) e arquétipo (vida, tiro). A IA é a do Gunner. */
export class Police extends Gunner {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    readonly look: PoliceLook,
    archetype: EnemyArchetype = ARCHETYPES.patrol,
    stopAt = x,
  ) {
    super(scene, x, y, lookDef(look), POLICE_KIT, archetype, stopAt);
  }
}
