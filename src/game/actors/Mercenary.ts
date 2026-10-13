import Phaser from 'phaser';
import { MERCENARY_MASTER, loadSheets, registerAnims, textureKey, type AnimName, type CharacterDef } from '../anims/humanoid';
import { rampMap, recolorSheet, type Ramp } from './uniformTones';
import { VOLUME } from '../audio/Sfx';
import { Gunner, type EnemyArchetype, type GunnerKit } from './Gunner';

// Mercenários de fuzil, os chefes do fim da quadra 1 (fase 5 do plano jump_crouch_cutscene.md).
// Sheets em assets/enemies/mercenaries/master/ (tools/build_mercenary.py). A IA é a do Gunner; a luta fica em BossFight.

/** Tons da farda (rampas em assets/enemies/mercenaries/tones.json). olive é a sheet original. */
export const MERCENARY_TONES = ['olive', 'ranger', 'coyote'] as const;
export type MercenaryTone = (typeof MERCENARY_TONES)[number];

const TONES_KEY = 'mercenary_tones';

export const mercenaryDef = (tone: MercenaryTone): CharacterDef =>
  tone === 'olive' ? MERCENARY_MASTER : { ...MERCENARY_MASTER, key: `${MERCENARY_MASTER.key}_${tone}` };

/** Boot, no preload. */
export function loadMercenaries(scene: Phaser.Scene): void {
  loadSheets(scene, MERCENARY_MASTER);
  scene.load.json(TONES_KEY, 'enemies/mercenaries/tones.json');
}

/** Boot, no create: gera os tons por canvas e registra as animações dos três. */
export function setupMercenaries(scene: Phaser.Scene): void {
  const tones = scene.cache.json.get(TONES_KEY) as Record<MercenaryTone, Ramp>;
  for (const tone of MERCENARY_TONES) {
    const def = mercenaryDef(tone);
    if (tone !== 'olive') {
      const map = rampMap(tones.olive, tones[tone]);
      for (const a of MERCENARY_MASTER.anims) recolorSheet(scene, textureKey(MERCENARY_MASTER, a), textureKey(def, a), map);
    }
    registerAnims(scene, def);
  }
}

/** Fuzil: rajada de 3 (o flash grande do shoot_fx nos quadros 0, 3 e 6); o agachar já termina mirando e
 *  ele levanta para recarregar. Cano medido no flash: 39 px à frente, 90 px do chão em pé e 74 ajoelhado. */
const MERCENARY_KIT: GunnerKit = {
  idle: 'idle_rifle',
  walk: 'walk_rifle',
  run: 'run_rifle',
  aim: 'aim_rifle',
  shoot: 'shoot_rifle',
  reload: 'reload_rifle',
  crouch: 'crouch_rifle',
  crouchShoot: 'crouch_shoot_rifle',
  jump: 'jump_rifle',
  burst: [0, 3, 6],
  shotSound: 'rifle_shot',
  shotVolume: VOLUME.rifleShot,
  muzzle: { x: 40, h: 90 },
  muzzleCrouch: { x: 36, h: 74 },
  // topo da balaclava no quadro (y 14, chão 121): mais alto que o Kael
  bodyH: 106,
};

/** Mais fortes que os policiais [TESTE]: mais vida, mira mais curta (o aviso aparece na tela), rajada e alcance da tela toda.
 *  O pente conta rajadas. O chute do combo tira 3 de vida: dois combos derrubam um mercenário. */
export const MERCENARY_ARCHETYPE: EnemyArchetype = {
  hp: 5, fireMs: 1600, range: 1000, walkSpeed: 90, runSpeed: 230, walkLastPx: 60, mag: 4, aimHoldMs: 320, damage: 6, hitChance: 0.6,
  crouchReload: false, matchCrouchMs: 650, jumpOnEnter: 0, jumpWhenAimed: 0.2, jumpDist: 140, jumpHeight: 70, jumpKeepPx: 160,
  kickDamage: 3,
};

export class Mercenary extends Gunner {
  constructor(scene: Phaser.Scene, x: number, y: number, readonly tone: MercenaryTone, first: AnimName = 'idle_rifle') {
    super(scene, x, y, mercenaryDef(tone), MERCENARY_KIT, MERCENARY_ARCHETYPE);
    if (first !== this.current) this.act(first);
  }
}
