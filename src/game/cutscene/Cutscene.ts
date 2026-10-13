import Phaser from 'phaser';
import type { AnimName, Humanoid } from '../anims/humanoid';
import type { CameraRig } from '../world/CameraRig';
import { bus, type Speaker } from '../events';
import { fadeMusic } from '../audio/Sfx';
import { ART_FRAME, type ArtKey } from './endingArt';

// Roteiro de cutscene em passos, tocado no Phaser com os sprites do jogo.
// O texto aparece no React (faixas pretas, tela de texto, caixa de fala com retrato) pelo bus.

export type Step =
  /** Tela preta com texto; espera o Enter. `final`: a tela fica preta depois (fim do jogo). */
  | { do: 'intro'; text: string; final?: boolean }
  /** Fala com retrato; espera o Enter. */
  | { do: 'line'; who: Speaker; text: string }
  /** Ilustração animada em tela cheia, por cima de tudo; espera o Enter. `music`: fração do volume da música (0 = silêncio). */
  | { do: 'art'; key: ArtKey; music?: number }
  /** Desliza o centro da tela até `to` ('home' = de volta à posição de seguir o Kael). */
  | { do: 'pan'; to: number | 'home'; ms: number }
  /** Toca uma animação; com `wait`, espera ela acabar. */
  | { do: 'act'; actor: Humanoid; anim: AnimName; reverse?: boolean; wait?: boolean }
  /** Anda até `to` a `speed` px/s com a animação `anim` (virado para onde vai). */
  | { do: 'move'; actor: Humanoid; to: number; speed: number; anim: AnimName }
  /** Roda uma função da cena (tiro, queda) e segue. */
  | { do: 'call'; fn: () => void }
  | { do: 'wait'; ms: number };

/** Fade de entrada da ilustração e da música [TESTE]. */
const ART_FADE_MS = 900;

export class Cutscene {
  private skipped = false;
  /** Acorda o passo em curso (Enter no texto, ou Esc pulando tudo). */
  private wake?: () => void;
  private waitingText = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly rig: CameraRig,
  ) {}

  /** Toca os passos em ordem. Esc pula o resto; `end` deixa a cena no estado final, tocada ou pulada. */
  async play(steps: Step[], end: () => void): Promise<void> {
    const off = [
      bus.on('cutscene:next', () => this.waitingText && this.wake?.()),
      bus.on('cutscene:skip', () => {
        this.skipped = true;
        this.wake?.();
      }),
    ];
    // cena reiniciada ou jogo destruído no meio: para sem mexer em nada
    let gone = false;
    const onShutdown = () => {
      gone = true;
      this.skipped = true;
      this.wake?.();
    };
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, onShutdown);
    this.scene.events.once(Phaser.Scenes.Events.DESTROY, onShutdown);
    bus.emit('cutscene:start', { black: steps[0]?.do === 'intro' });
    for (const step of steps) {
      if (this.skipped) break;
      await this.run(step);
    }
    off.forEach((f) => f());
    bus.emit('cutscene:end');
    if (gone) return;
    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, onShutdown);
    this.scene.events.off(Phaser.Scenes.Events.DESTROY, onShutdown);
    this.rig.follow();
    end();
  }

  /** Fundo preto (telas mais largas que 16:9) e a ilustração centrada, ampliada até a altura da tela.
   *  Fica até a cena acabar: a tela de texto final escurece por cima. */
  private showArt(key: ArtKey): void {
    const cam = this.scene.cameras.main;
    const scale = cam.height / ART_FRAME.h;
    const back = this.scene.add.rectangle(0, 0, cam.width, cam.height, 0x000000).setOrigin(0);
    const art = this.scene.add.sprite(cam.width / 2, cam.height / 2, key).setScale(scale).play(key);
    for (const o of [back, art]) o.setScrollFactor(0).setDepth(2000).setAlpha(0);
    this.scene.tweens.add({ targets: [back, art], alpha: 1, duration: ART_FADE_MS });
  }

  private run(step: Step): Promise<void> {
    return new Promise<void>((done) => {
      this.wake = done;
      this.waitingText = false;
      switch (step.do) {
        case 'intro':
          this.waitingText = true;
          bus.emit('cutscene:intro', { text: step.text, final: step.final });
          break;
        case 'line':
          this.waitingText = true;
          bus.emit('cutscene:line', { speaker: step.who, text: step.text });
          break;
        case 'art':
          this.waitingText = true;
          this.showArt(step.key);
          if (step.music !== undefined) fadeMusic(this.scene, step.music, ART_FADE_MS);
          bus.emit('cutscene:art');
          break;
        case 'pan':
          this.rig.pan(step.to === 'home' ? this.rig.homeX : step.to, step.ms).then(done);
          break;
        case 'act':
          step.actor.act(step.anim, { reverse: step.reverse, restart: true });
          if (step.wait) step.actor.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => done());
          else done();
          break;
        case 'move': {
          const { actor, to, speed, anim } = step;
          actor.face(to < actor.x ? -1 : 1);
          actor.act(anim);
          const ms = (Math.abs(to - actor.x) / speed) * 1000;
          this.scene.tweens.add({ targets: actor, x: to, duration: ms, onComplete: () => done() });
          break;
        }
        case 'call':
          step.fn();
          done();
          break;
        case 'wait':
          this.scene.time.delayedCall(step.ms, done);
          break;
      }
    });
  }
}
