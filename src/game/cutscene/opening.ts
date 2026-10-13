import type { Humanoid } from '../anims/humanoid';
import { t } from '../../i18n';
import type { Step } from './Cutscene';

// Cutscene de abertura da quadra 1 (fase 6 do plano jump_crouch_cutscene.md). Tempos [TESTE].
const FADE_MS = 700; // a tela preta do texto some (igual ao CSS .cutscene-intro)
const HOLD_KAEL_MS = 700; // o Kael parado no começo da rua antes da câmera sair
const PAN_OUT_MS = 3400; // até o fim da rua
const PAN_BACK_MS = 2200; // de volta ao Kael
const BEAT_MS = 400; // respiro entre a câmera chegar e alguém falar

/** Tela de texto, câmera até a Adriana presa, as falas dela, câmera de volta e a resposta do Kael. */
export function openingSteps(arenaX: number, adriana: Humanoid): Step[] {
  return [
    { do: 'intro', text: t('cutscene.intro') },
    { do: 'wait', ms: FADE_MS + HOLD_KAEL_MS },
    { do: 'pan', to: arenaX, ms: PAN_OUT_MS },
    { do: 'wait', ms: BEAT_MS },
    { do: 'act', actor: adriana, anim: 'cry', wait: true },
    { do: 'line', who: 'adriana', text: t('cutscene.adriana1') },
    { do: 'line', who: 'adriana', text: t('cutscene.adriana2') },
    { do: 'act', actor: adriana, anim: 'cry', reverse: true, wait: true },
    { do: 'act', actor: adriana, anim: 'held' },
    { do: 'pan', to: 'home', ms: PAN_BACK_MS },
    { do: 'wait', ms: BEAT_MS },
    { do: 'line', who: 'kael', text: t('cutscene.kael1') },
  ];
}
