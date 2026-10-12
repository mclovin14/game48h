import Phaser from 'phaser';
import type { BulletType } from '../events';

// Valores provisórios [TESTE] do loot de munição.
/** Chance de o loot ser de bala letal (o resto é não letal). */
const LETHAL_CHANCE = 0.7;
/** Balas por caixa. */
const LOOT_AMOUNT = 3;
/** Distância do Kael para pegar a caixa. */
const PICKUP_RANGE = 28;

// Caixinha de munição desenhada aqui, com cores da paleta do policial (metal, contorno, distintivo, farda e branco).
const BOX_W = 18;
const BOX_H = 13;
/** A caixa no chão sobe e desce 1 px, para chamar a atenção. */
const BOB_MS = 450;
const OUTLINE = '#040404';
const METAL_DARK = '#3d3f45';
const METAL = '#5b5f65';
const METAL_LIGHT = '#70757f';
/** Ponta das balas: dourada na letal; branca com faixa azul na não letal. */
const TIPS: Record<BulletType, [string, string]> = {
  lethal: ['#e79a16', '#f2bc48'],
  nonLethal: ['#22325f', '#f4ebe8'],
};

const texKey = (t: BulletType) => `loot_ammo_${t}`;

function makeTexture(scene: Phaser.Scene, type: BulletType): void {
  if (scene.textures.exists(texKey(type))) return;
  const tex = scene.textures.createCanvas(texKey(type), BOX_W, BOX_H)!;
  const ctx = tex.context;
  const px = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  };
  // cinco balas saindo da caixa aberta
  const [band, tip] = TIPS[type];
  for (let i = 0; i < 5; i++) {
    const x = 2 + i * 3;
    px(x, 0, 3, 6, OUTLINE);
    px(x + 1, 1, 1, 2, tip);
    px(x + 1, 3, 1, 2, band);
  }
  // caixa
  px(0, 5, BOX_W, BOX_H - 5, OUTLINE);
  px(1, 6, BOX_W - 2, BOX_H - 7, METAL);
  px(1, 6, BOX_W - 2, 1, METAL_LIGHT);
  px(1, BOX_H - 2, BOX_W - 2, 1, METAL_DARK);
  // etiqueta da cor do tipo
  px(5, 8, 8, 2, tip);
  tex.refresh();
}

interface Drop {
  sprite: Phaser.GameObjects.Image;
  type: BulletType;
}

/** Loot de munição: o policial nocauteado solta uma caixa; o Kael pega passando por cima. */
export class Loot {
  private readonly drops: Drop[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly groundY: number,
  ) {
    makeTexture(scene, 'lethal');
    makeTexture(scene, 'nonLethal');
  }

  /** Solta uma caixa em `x`: pula um pouco e cai no chão. */
  drop(x: number): void {
    const type: BulletType = Math.random() < LETHAL_CHANCE ? 'lethal' : 'nonLethal';
    const sprite = this.scene.add.image(x, this.groundY - 40, texKey(type)).setOrigin(0.5, 1).setDepth(1);
    this.scene.tweens.add({
      targets: sprite,
      y: this.groundY,
      duration: 420,
      ease: 'Bounce.easeOut',
      onComplete: () => this.scene.tweens.add({ targets: sprite, y: this.groundY - 1, duration: BOB_MS, yoyo: true, repeat: -1, ease: 'Stepped' }),
    });
    this.drops.push({ sprite, type });
  }

  /** Confere se o Kael pegou alguma caixa. Devolve as balas pegas. */
  update(kaelX: number, kaelAlive: boolean): { type: BulletType; amount: number }[] {
    const got: { type: BulletType; amount: number }[] = [];
    if (!kaelAlive) return got;
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      if (Math.abs(d.sprite.x - kaelX) > PICKUP_RANGE || d.sprite.y < this.groundY - 1) continue;
      got.push({ type: d.type, amount: LOOT_AMOUNT });
      this.popup(d);
      this.drops.splice(i, 1);
    }
    return got;
  }

  /** "+3 letal" subindo e sumindo. */
  private popup(d: Drop): void {
    const label = d.type === 'lethal' ? 'letal' : 'não letal';
    const text = this.scene.add
      .text(d.sprite.x, d.sprite.y - 14, `+${LOOT_AMOUNT} ${label}`, { fontFamily: 'monospace', fontSize: '12px', color: '#f2bc48' })
      .setOrigin(0.5, 1)
      .setDepth(1000);
    this.scene.tweens.add({ targets: text, y: text.y - 24, alpha: 0, duration: 700, onComplete: () => text.destroy() });
    this.scene.tweens.killTweensOf(d.sprite);
    d.sprite.destroy();
  }
}
