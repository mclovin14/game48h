import Phaser from 'phaser';
import { KAEL, loadSheets, registerAnims } from '../anims/humanoid';
import { ALL_LOOKS, POLICE_DEFS, lookDef } from '../actors/Police';
import { loadUniformTones, makeToneTextures } from '../actors/uniformTones';
import { HEIGHT } from '../screen';
import { LEVEL_1 } from '../levels/level_1';
import { loadStreet } from '../world/Street';
import { loadProps } from '../world/Props';

/** Carrega as spritesheets e registra as animações; depois abre a cena de teste. */
export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    const label = this.add
      .text(this.scale.width / 2, HEIGHT / 2, 'Carregando...', { fontFamily: 'monospace', fontSize: '16px', color: '#cfd6e4' })
      .setOrigin(0.5);
    this.load.on(Phaser.Loader.Events.PROGRESS, (p: number) => label.setText(`Carregando... ${Math.round(p * 100)}%`));
    loadSheets(this, KAEL);
    for (const ch of POLICE_DEFS) loadSheets(this, ch);
    loadUniformTones(this);
    loadStreet(this, LEVEL_1);
    loadProps(this);
  }

  create(): void {
    registerAnims(this, KAEL);
    // tons de farda gerados por canvas a partir das sheets das cabeças
    makeToneTextures(this);
    for (const look of ALL_LOOKS) registerAnims(this, lookDef(look));
    this.scene.start('Test');
  }
}
