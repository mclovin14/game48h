import Phaser from 'phaser';

// Ilustrações animadas dos finais (fase 8 do plano jump_crouch_cutscene.md), feitas no PixelLab e
// montadas pelo tools/build_endings.py: sheet horizontal de quadros 160x90, ampliada até a altura da tela (6x).
export const ART_FRAME = { w: 160, h: 90 };
export type ArtKey = 'ending_happy' | 'ending_sad';
/** ms por quadro [TESTE] (igual ao GIF de prévia do build_endings.py). */
const FRAME_MS: Record<ArtKey, number> = { ending_happy: 160, ending_sad: 120 };

export function loadEndingArt(scene: Phaser.Scene): void {
  for (const key of Object.keys(FRAME_MS) as ArtKey[])
    scene.load.spritesheet(key, `cutscenes/${key}/${key}_sheet.png`, { frameWidth: ART_FRAME.w, frameHeight: ART_FRAME.h });
}

/** Animações em loop, com o nome da própria textura. */
export function registerEndingArt(scene: Phaser.Scene): void {
  for (const [key, ms] of Object.entries(FRAME_MS))
    scene.anims.create({ key, frames: scene.anims.generateFrameNumbers(key), frameRate: 1000 / ms, repeat: -1 });
}
