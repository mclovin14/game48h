import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Test } from './scenes/Test';
import { HEIGHT, viewWidth } from './screen';

export function makeConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: viewWidth(parent.clientWidth || window.innerWidth, parent.clientHeight || window.innerHeight),
    height: HEIGHT,
    backgroundColor: '#1b1f2a',
    pixelArt: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 900 } } },
    scene: [Boot, Test],
  };
}
