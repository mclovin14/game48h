import { useEffect, useRef, useState } from 'react';
import { bus, type Speaker } from '../game/events';
import { t } from '../i18n';
import { VOLUME_STEPS, loadVolumes } from './settings';
import { useTouch } from './useTouch';

// Cutscene por cima do jogo: faixas pretas, tela de texto e caixa de fala com retrato.
// O texto entra letra por letra com um bipe; Enter (ou clique) completa a frase e, completa, avança. Esc pula.

/** Valores provisórios [TESTE]. */
const CHAR_MS = 38; // ms por letra
const BEEP_EVERY = 2; // um bipe a cada tantas letras
const BEEP_VOLUME = 0.05;
/** Faixas pretas entrando e saindo (igual ao CSS .cutscene-bar). */
const BARS_MS = 500;
/** Tom do bipe de cada um (Hz); a tela de texto é a voz do Kael. */
const BEEP_HZ: Record<Speaker, number> = { adriana: 880, kael: 440 };
const PORTRAIT: Record<Speaker, string> = {
  adriana: 'characters/adriana/adriana_portrait.png',
  kael: 'player/player_portrait.png',
};

let audio: AudioContext | undefined;
/** Bipe curto de onda quadrada, como nos jogos dos anos 90 (sem arquivo de som). */
function beep(hz: number, volume: number): void {
  if (volume <= 0) return;
  try {
    audio ??= new AudioContext();
    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'square';
    osc.frequency.value = hz;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    osc.connect(gain).connect(audio.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // sem Web Audio: o texto entra em silêncio
  }
}

/** Texto letra por letra. `visible` cresce até o fim; `finish` mostra tudo de uma vez. */
function useTypewriter(text: string, hz: number) {
  // o contador vale para um texto: trocar de fala começa do zero, sem mostrar a nova inteira por um quadro
  const [typed, setTyped] = useState({ text, n: 0 });
  useEffect(() => {
    setTyped({ text, n: 0 });
    const volume = BEEP_VOLUME * (loadVolumes().sfx / VOLUME_STEPS);
    let n = 0;
    const id = window.setInterval(() => {
      if (n >= text.length) return window.clearInterval(id);
      n += 1;
      setTyped((cur) => (cur.text === text && cur.n < n ? { text, n } : cur));
      if (n % BEEP_EVERY === 0 && text[n - 1].trim()) beep(hz, volume);
    }, CHAR_MS);
    return () => window.clearInterval(id);
  }, [text, hz]);
  const n = typed.text === text ? typed.n : 0;
  return {
    visible: text.slice(0, n),
    done: n >= text.length,
    finish: () => setTyped({ text, n: text.length }),
  };
}

type Shown =
  | { kind: 'intro'; text: string; final?: boolean }
  | { kind: 'line'; speaker: Speaker; text: string }
  /** Ilustração do Phaser em tela cheia: sem texto, sem faixas pretas. */
  | { kind: 'art'; text: '' }
  | null;

/** Fica montado durante o jogo e acende no `cutscene:start` do Phaser. Enter avança (ou completa a frase);
 *  Esc pula. Avisa o App (`onActive`) para esconder o HUD e não abrir a pausa no Esc. */
export function Cutscene({ onActive }: { onActive: (active: boolean) => void }) {
  const [active, setActive] = useState(false);
  const [shown, setShown] = useState<Shown>(null);
  // a tela preta cobre tudo até o texto de abertura fechar; depois some devagar (CSS)
  const [black, setBlack] = useState(false);
  const [bars, setBars] = useState(false);
  // no celular: dica de toque e um botão para pular (no lugar do Esc)
  const touch = useTouch();

  useEffect(() => {
    let raf = 0;
    let timer = 0;
    const off = [
      bus.on('cutscene:start', ({ black }) => {
        window.clearTimeout(timer);
        setActive(true);
        setBlack(black);
        onActive(true);
        // as faixas entram depois do primeiro quadro, para a transição do CSS acontecer
        raf = window.requestAnimationFrame(() => setBars(true));
      }),
      bus.on('cutscene:intro', ({ text, final }) => {
        // no meio da cutscene a tela escurece devagar (CSS)
        setBlack(true);
        setShown({ kind: 'intro', text, final });
      }),
      bus.on('cutscene:line', ({ speaker, text }) => setShown({ kind: 'line', speaker, text })),
      bus.on('cutscene:art', () => setShown({ kind: 'art', text: '' })),
      bus.on('cutscene:end', () => {
        setShown(null);
        setBlack(false);
        setBars(false);
        onActive(false);
        timer = window.setTimeout(() => setActive(false), BARS_MS);
      }),
    ];
    return () => {
      off.forEach((f) => f());
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [onActive]);

  const text = shown?.text ?? '';
  const hz = shown?.kind === 'line' ? BEEP_HZ[shown.speaker] : BEEP_HZ.kael;
  const type = useTypewriter(text, hz);

  const skip = () => {
    setShown(null);
    bus.emit('cutscene:skip');
  };

  const advance = () => {
    if (!shown) return;
    if (!type.done) return type.finish();
    if (shown.kind === 'intro' && !shown.final) setBlack(false);
    setShown(null);
    bus.emit('cutscene:next');
  };
  const advanceRef = useRef(advance);
  advanceRef.current = advance;
  const skipRef = useRef(skip);
  skipRef.current = skip;

  useEffect(() => {
    if (!active || !bars) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        skipRef.current();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        advanceRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, bars]);

  if (!active) return null;
  // na ilustração as faixas saem, para não cortar o quadro
  const barsOn = bars && shown?.kind !== 'art';
  return (
    <div className="cutscene" onClick={() => advance()}>
      <div className={barsOn ? 'cutscene-bar top on' : 'cutscene-bar top'} />
      <div className={barsOn ? 'cutscene-bar bottom on' : 'cutscene-bar bottom'} />
      <div className={black ? 'cutscene-intro on' : 'cutscene-intro'}>
        {shown?.kind === 'intro' && <p>{type.visible}</p>}
      </div>
      {shown?.kind === 'line' && (
        <div className="cutscene-line">
          <img src={PORTRAIT[shown.speaker]} alt="" draggable={false} />
          <div>
            <strong>{t(`cutscene.name.${shown.speaker}`)}</strong>
            <p>{type.visible}</p>
          </div>
        </div>
      )}
      {bars && <small className="cutscene-hint">{t(touch ? 'touch.cutscene' : 'cutscene.hint')}</small>}
      {bars && touch && (
        <button
          type="button"
          className="cutscene-skip"
          onClick={(e) => {
            e.stopPropagation();
            skip();
          }}
        >
          {t('touch.skip')}
        </button>
      )}
    </div>
  );
}
