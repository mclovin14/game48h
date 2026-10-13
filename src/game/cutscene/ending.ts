import type { Humanoid } from '../anims/humanoid';
import { t } from '../../i18n';
import type { Step } from './Cutscene';

// Finais da quadra 1 (fase 7 do plano jump_crouch_cutscene.md), pela índole. Tempos e distâncias [TESTE].
// Fase 8: a ilustração animada de cada final entra antes da tela de texto (o beijo; ela com o Kael no colo, na chuva).
const START_MS = 600; // respiro depois do último mercenário cair
const RUN_SPEED = 170; // a Adriana correndo até o Kael (px/s)
const HUG_DX = 40; // de frente para o Kael, os braços abertos
const KNEEL_DX = 62; // ajoelhada ao lado do Kael caído
const DEATH_MS = 2400; // o tiro chega e o Kael cai, antes da Adriana correr
const BEAT_MS = 500;
/** Música na ilustração do final feliz (fração do volume); no triste, silêncio. */
const HAPPY_MUSIC = 0.6;

export interface EndingCast {
  kael: Humanoid;
  adriana: Humanoid;
  /** Índole ≥ 50%: final feliz. */
  happy: boolean;
  /** Final triste: um mercenário caído atira uma última vez; a bala chega e o Kael cai. */
  lastShot: () => void;
}

/** Feliz: a Adriana levanta, corre até o Kael e o abraça. Triste: o último tiro, o Kael cai e ela se ajoelha ao lado dele. */
export function endingSteps({ kael, adriana, happy, lastShot }: EndingCast): Step[] {
  // a Adriana vem de onde está (à direita do Kael, perto da van)
  const side = adriana.x >= kael.x ? 1 : -1;
  const stand: Step = { do: 'act', actor: adriana, anim: 'kneel', reverse: true, wait: true };
  if (happy)
    return [
      { do: 'wait', ms: START_MS },
      stand,
      { do: 'move', actor: adriana, to: kael.x + side * HUG_DX, speed: RUN_SPEED, anim: 'freed' },
      { do: 'act', actor: adriana, anim: 'hug', wait: true },
      { do: 'line', who: 'adriana', text: t('ending.happy.adriana') },
      { do: 'line', who: 'kael', text: t('ending.happy.kael') },
      { do: 'wait', ms: BEAT_MS },
      { do: 'art', key: 'ending_happy', music: HAPPY_MUSIC },
      { do: 'intro', text: t('ending.happy.text'), final: true },
    ];
  return [
    { do: 'wait', ms: START_MS },
    { do: 'call', fn: lastShot },
    { do: 'wait', ms: DEATH_MS },
    stand,
    { do: 'move', actor: adriana, to: kael.x + side * KNEEL_DX, speed: RUN_SPEED, anim: 'freed' },
    { do: 'act', actor: adriana, anim: 'kneel', wait: true },
    { do: 'line', who: 'adriana', text: t('ending.sad.adriana') },
    { do: 'wait', ms: BEAT_MS },
    { do: 'art', key: 'ending_sad', music: 0 },
    { do: 'intro', text: t('ending.sad.text'), final: true },
  ];
}
