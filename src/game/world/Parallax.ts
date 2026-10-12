import Phaser from 'phaser';
import { MAX_WIDTH } from '../screen';

interface Layer {
  sprite: Phaser.GameObjects.TileSprite;
  factor: number;
}

/**
 * Fundo em camadas: cada faixa se repete na horizontal e anda a uma fração
 * da câmera (0 = parada, 1 = junto com o chão).
 */
export class Parallax {
  private readonly layers: Layer[] = [];

  constructor(private readonly scene: Phaser.Scene) {}

  /** `y` é o topo da faixa na tela; a altura vem da textura. Devolve a faixa (para tint e alfa). */
  add(texture: string, y: number, factor: number): Phaser.GameObjects.TileSprite {
    const h = this.scene.textures.get(texture).getSourceImage().height;
    const sprite = this.scene.add.tileSprite(0, y, MAX_WIDTH, h, texture).setOrigin(0).setScrollFactor(0);
    this.layers.push({ sprite, factor });
    return sprite;
  }

  update(cam: Phaser.Cameras.Scene2D.Camera): void {
    // arredonda para o pixel não tremer entre quadros
    for (const l of this.layers) l.sprite.tilePositionX = Math.round(cam.scrollX * l.factor);
  }
}
