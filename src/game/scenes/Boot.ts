import Phaser from 'phaser';
import { ADRIANA, KAEL, loadSheets, registerAnims } from '../anims/humanoid';
import { ALL_LOOKS, POLICE_DEFS, lookDef } from '../actors/Police';
import { loadUniformTones, makeToneTextures } from '../actors/uniformTones';
import { loadMercenaries, setupMercenaries } from '../actors/Mercenary';
import { HEIGHT } from '../screen';
import { LEVEL_1 } from '../levels/level_1';
import { loadStreet } from '../world/Street';
import { loadProps } from '../world/Props';
import { loadGoArrow } from '../world/GoArrow';
import { loadSounds } from '../audio/Sfx';
import { loadEndingArt, registerEndingArt } from '../cutscene/endingArt';
import { t } from '../../i18n';
import { fitImages, trackImages } from '../fitImages';

/** Carrega as spritesheets e os sons, registra as animações; depois abre a cena de teste. */
export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    const label = this.add
      .text(this.scale.width / 2, HEIGHT / 2, t('game.loading'), { fontFamily: 'monospace', fontSize: '16px', color: '#cfd6e4' })
      .setOrigin(0.5);
    // ?v=<build> em todo arquivo: um build novo não usa imagem ou som antigo do cache
    this.load.on(Phaser.Loader.Events.ADD, (_key: string, _type: string, _loader: unknown, file: Phaser.Loader.File) => {
      if (typeof file.url === 'string' && !file.url.includes('?')) file.url += `?v=${__BUILD_ID__}`;
    });
    trackImages(this);
    this.load.on(Phaser.Loader.Events.PROGRESS, (p: number) => label.setText(`Carregando... ${Math.round(p * 100)}%`));
    loadSheets(this, KAEL);
    loadSheets(this, ADRIANA);
    for (const ch of POLICE_DEFS) loadSheets(this, ch);
    loadUniformTones(this);
    loadMercenaries(this);
    loadStreet(this, LEVEL_1);
    loadProps(this);
    loadGoArrow(this);
    loadEndingArt(this);
    loadSounds(this);
  }

  create(): void {
    // imagem que a hospedagem reduziu volta ao tamanho original
    fitImages(this);
    registerAnims(this, KAEL);
    registerAnims(this, ADRIANA);
    // tons de farda gerados por canvas a partir das sheets das cabeças
    makeToneTextures(this);
    for (const look of ALL_LOOKS) registerAnims(this, lookDef(look));
    setupMercenaries(this);
    registerEndingArt(this);
    this.scene.start('Test');
  }
}
