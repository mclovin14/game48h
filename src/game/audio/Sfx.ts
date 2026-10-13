import Phaser from 'phaser';
import { bus } from '../events';

// Volumes provisórios [TESTE] (0 a 1).
export const VOLUME = {
  music: 0.15,
  kaelShot: 0.6,
  copShot: 0.5,
  rifleShot: 0.5,
  kaelStep: 0.35,
  copStep: 0.18,
  copRunStep: 0.22,
  reload: 0.55,
  copReload: 0.4,
  dryFire: 0.5,
  punchHit: 0.6,
  kickHit: 0.7,
  swing: 0.35,
};
const MUSIC_FADE_MS = 2500;

/** Volumes das opções (0 a 1), por cima dos VOLUME: música e efeitos. */
const mix = { music: 1, sfx: 1 };
let music: Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound | undefined;
bus.on('settings:volume', (v) => {
  Object.assign(mix, v);
  if (music?.isPlaying) music.setVolume(VOLUME.music * mix.music);
});
/** Variação de tom em cada tiro e passo, para não soar repetido (±4%). */
const PITCH_JITTER = 0.04;
/** Até meia tela de distância o som fica cheio; cai até MIN_VOLUME a esta distância (em larguras de tela). */
const FAR_SCREENS = 1.1;
const MIN_VOLUME = 0.12;
/** Pan máximo na borda da tela: nunca 100% num lado só. */
const PAN_MAX = 0.7;

/** Sons em assets/sounds/. Os passos e o clique seco são cortados por tools/build_sfx.py. */
const FILES = {
  kael_shot: 'sounds/kael_shot.wav',
  police_shot: 'sounds/police_shot.wav',
  // AK-47 da Free Firearm Sound Library (CC0), um tiro: a rajada toca três
  rifle_shot: 'sounds/rifle_shot.wav',
  colt_reload: 'sounds/colt_reload.wav',
  dry_fire: 'sounds/dry_fire.wav',
  // combo do Kael (CC0, OpenGameArt): soco de qubodup, chute do pacote Independent.nu, golpe no ar de artisticdude
  punch_hit: 'sounds/punch_hit.wav',
  kick_hit: 'sounds/kick_hit.wav',
  swing: 'sounds/swing.wav',
  ost_level_1: 'sounds/ost_level_1.mp3',
};
export type SoundKey = keyof typeof FILES;

/** Quantos cortes cada tipo de passo tem (saída do build_sfx.py). */
const STEPS = { walk: 4, run: 8 };
export type StepKind = keyof typeof STEPS;
const stepKey = (kind: StepKind, i: number) => `step_${kind}_${i}`;
const lastStep: Partial<Record<StepKind, number>> = {};

export function loadSounds(scene: Phaser.Scene): void {
  for (const [key, path] of Object.entries(FILES)) scene.load.audio(key, path);
  for (const kind of Object.keys(STEPS) as StepKind[]) {
    for (let i = 0; i < STEPS[kind]; i++) {
      scene.load.audio(stepKey(kind, i), `sounds/steps_${kind}/step_${String(i).padStart(2, '0')}.wav`);
    }
  }
}

/**
 * Toca um som no ponto `x` do mundo: mais baixo longe da câmera e puxado para o lado em que está.
 * Devolve o som, para poder pará-lo antes do fim (ex.: recarga cortada pela morte).
 */
export function playAt(scene: Phaser.Scene, key: string, x: number, volume: number): Phaser.Sound.BaseSound {
  const cam = scene.cameras.main;
  const half = cam.width / 2;
  const dx = x - (cam.scrollX + half);
  const far = Math.max(0, Math.abs(dx) - half / 2) / (cam.width * FAR_SCREENS);
  const sound = scene.sound.add(key);
  sound.once(Phaser.Sound.Events.COMPLETE, () => sound.destroy());
  sound.once(Phaser.Sound.Events.STOP, () => sound.destroy());
  sound.play({
    volume: volume * mix.sfx * Phaser.Math.Clamp(1 - far, MIN_VOLUME, 1),
    pan: Phaser.Math.Clamp(dx / half, -1, 1) * PAN_MAX,
    rate: 1 + Phaser.Math.FloatBetween(-PITCH_JITTER, PITCH_JITTER),
  });
  return sound;
}

/** Um passo sorteado, nunca o mesmo corte duas vezes seguidas. */
export function playStep(scene: Phaser.Scene, kind: StepKind, x: number, volume: number): void {
  let i = Phaser.Math.Between(0, STEPS[kind] - 2);
  if (i >= (lastStep[kind] ?? -1)) i += 1;
  lastStep[kind] = i;
  playAt(scene, stepKey(kind, i), x, volume);
}

/** Música em loop com fade de entrada. Se já estiver tocando (cena reiniciada), continua de onde estava. */
export function startMusic(scene: Phaser.Scene, key: SoundKey): void {
  const playing = scene.sound.get(key) as typeof music | null;
  if (playing?.isPlaying) {
    // o restart mata o tween do fade: garante o volume cheio
    playing.setVolume(VOLUME.music * mix.music);
    music = playing;
    return;
  }
  music = scene.sound.add(key, { loop: true, volume: 0 }) as typeof music;
  music!.play();
  // `from` explícito: o volume lido do Web Audio ainda vale 1 logo depois do play
  scene.tweens.add({ targets: music, volume: { from: 0, to: VOLUME.music * mix.music }, duration: MUSIC_FADE_MS });
}

/** Leva a música a `factor` do volume normal em `ms` (0 = silêncio). A próxima startMusic volta ao volume cheio. */
export function fadeMusic(scene: Phaser.Scene, factor: number, ms: number): void {
  if (!music?.isPlaying) return;
  scene.tweens.add({ targets: music, volume: VOLUME.music * mix.music * factor, duration: ms });
}
