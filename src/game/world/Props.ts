import Phaser from 'phaser';
import { ambient, smoothstep } from './DayCycle';
import type { LevelDef, PropName } from '../levels/level_1';

// Chão e objetos de cena da rua (fase 3 do plano world_camera_enemies.md).
// Arte em assets/levels/level_1/: ground.png (tools/build_ground.py) e props/ (tools/build_props.py).

const LEVEL_DIR = 'levels/level_1';
export const GROUND = 'ground';
const BARRICADE = 'barricade';
const BEACON = 'beacon_glow';
const VAN = 'van';

/** Profundidade do que fica na frente do Kael e dos policiais (carro e faixa da frente). */
const FRONT_DEPTH = 5;
/** Faixa do fundo: pisa na linha dos postes (px abaixo da linha dos pés). */
const BACK_LANE_Y = 2;
/** Faixa da frente: pisa logo antes do meio-fio (px abaixo da base das paredes; o meio-fio começa em 61). */
const FRONT_LANE_Y = 59; // [TESTE]
/** Sombra no pé dos objetos, para não parecerem soltos. */
const SHADOW = 'prop_shadow';
const SHADOW_ALPHA = 0.35; // [TESTE]
/** O carro estaciona no asfalto: pneu a esta distância do fim da tela. */
const ROAD_BOTTOM = 8; // [TESTE]
/** Giroflex: centro da luz no sprite da barricada e troca de cor. */
const BEACON_AT = { x: 31, y: 5 };
const BEACON_STEP_MS = 260; // [TESTE]
const BEACON_SCALE = 1.6; // [TESTE]
const BEACON_COLORS = [0xff3030, 0x3060ff];
/** Alfa do brilho do giroflex: fraco no entardecer, forte à noite. */
const BEACON_ALPHA: [number, number] = [0.35, 1];
/** A van do PixelLab saiu pequena (91 px de altura): ampliada para ficar mais alta que o Kael. */
const VAN_SCALE = 1.5; // [TESTE]

export function loadProps(scene: Phaser.Scene): void {
  scene.load.image(GROUND, `${LEVEL_DIR}/ground.png`);
  for (const name of ['car', 'hydrant', 'trash_bin', 'hydrant_front', 'trash_bin_front', BARRICADE, VAN])
    scene.load.image(`prop_${name}`, `${LEVEL_DIR}/props/${name}.png`);
}

/** Brilho branco que some na borda; o giroflex tinge de vermelho ou azul. */
function makeBeaconTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(BEACON)) return;
  const s = 64;
  const tex = scene.textures.createCanvas(BEACON, s, s)!;
  const g = tex.context.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.3, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  tex.context.fillStyle = g;
  tex.context.fillRect(0, 0, s, s);
  tex.refresh();
}

/** Elipse escura para o pé dos objetos; estica na largura de cada um. */
function makeShadowTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(SHADOW)) return;
  const g = scene.make.graphics({}, false);
  g.fillStyle(0x1a1020).fillEllipse(32, 4, 64, 8);
  g.generateTexture(SHADOW, 64, 8);
  g.destroy();
}

/** Chão contínuo da base das paredes até o fim da tela. Criar antes das fachadas, que pisam nele. */
export function addGround(scene: Phaser.Scene, level: LevelDef, baseY: number): Phaser.GameObjects.TileSprite {
  return scene.add.tileSprite(0, baseY, level.width, scene.scale.height - baseY, GROUND).setOrigin(0);
}

/** Objetos de cena. Criar depois das fachadas e antes dos personagens. */
export class Props {
  private readonly sprites: Phaser.GameObjects.Image[] = [];
  private readonly beacons: Phaser.GameObjects.Image[] = [];
  private beaconT = 0;

  /** `baseY`: base das paredes (topo da calçada). `groundY`: linha onde os pés pisam. */
  constructor(scene: Phaser.Scene, level: LevelDef, baseY: number, groundY: number) {
    makeBeaconTexture(scene);
    makeShadowTexture(scene);

    for (const p of level.props) {
      if (p.name === 'car') {
        this.add(scene, 'car', p.x, scene.scale.height - ROAD_BOTTOM).setFlipX(!!p.flip).setDepth(FRONT_DEPTH);
        continue;
      }
      const front = p.lane === 'front';
      const y = front ? baseY + FRONT_LANE_Y : groundY + BACK_LANE_Y;
      const depth = front ? FRONT_DEPTH : 0;
      // sombra criada antes: fica por baixo do objeto
      const shadow = scene.add.image(p.x, y, SHADOW).setAlpha(SHADOW_ALPHA).setDepth(depth);
      const img = this.add(scene, front ? `${p.name}_front` : p.name, p.x, y).setFlipX(!!p.flip).setDepth(depth);
      shadow.setDisplaySize(img.width * 1.1, 8);
    }

    // van dos mercenários no fim da rua, na linha dos pés, atrás dos personagens (a arte tem 13 px de vazio embaixo)
    const van = this.add(scene, VAN, level.boss.vanX, groundY + 2 + 12 * VAN_SCALE);
    van.setScale(VAN_SCALE).setFlipX(!!level.boss.vanFlip);

    // barricada na linha dos pés, atrás dos personagens
    for (const { x } of level.barricades) {
      const b = this.add(scene, BARRICADE, x, groundY + 2);
      const bx = b.x - b.width / 2 + BEACON_AT.x;
      const by = b.y - b.height + BEACON_AT.y;
      this.beacons.push(scene.add.image(bx, by, BEACON).setScale(BEACON_SCALE).setBlendMode(Phaser.BlendModes.ADD));
    }
  }

  private add(scene: Phaser.Scene, name: PropName | `${PropName}_front` | typeof BARRICADE | typeof VAN, x: number, y: number): Phaser.GameObjects.Image {
    const img = scene.add.image(x, y, `prop_${name}`).setOrigin(0.5, 1);
    this.sprites.push(img);
    return img;
  }

  update(t: number, delta: number): void {
    const tint = ambient(t);
    for (const s of this.sprites) s.setTint(tint);
    this.beaconT += delta;
    const color = BEACON_COLORS[Math.floor(this.beaconT / BEACON_STEP_MS) % BEACON_COLORS.length];
    const alpha = Phaser.Math.Linear(...BEACON_ALPHA, smoothstep(0.3, 0.8, t));
    for (const b of this.beacons) b.setTint(color).setAlpha(alpha);
  }
}
