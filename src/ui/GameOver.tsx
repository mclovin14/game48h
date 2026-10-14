import { useEffect, useState } from 'react';
import { bus } from '../game/events';
import { t } from '../i18n';
import { useTouch } from './useTouch';

/** Tempos da tela de game over [TESTE]: espera a queda do Kael, escurece, mostra o título e só depois aceita o Enter. */
const DELAY_MS = 900;
const PROMPT_MS = 3600;
/** Frases tristes sorteadas (gameover.message.N no i18n). */
const MESSAGES = ['gameover.message.0', 'gameover.message.1', 'gameover.message.2'] as const;

interface Props {
  /** Com a pausa aberta, o Enter é do menu. */
  paused: boolean;
}

/** Game over (`game:over`): a tela escurece devagar, entram o título, "Você perdeu" e uma frase triste; Enter reinicia. */
export function GameOver({ paused }: Props) {
  const [over, setOver] = useState<{ msg: (typeof MESSAGES)[number]; id: number } | null>(null);
  const [shown, setShown] = useState(false);
  const [ready, setReady] = useState(false);
  const touch = useTouch();

  useEffect(() => {
    const offOver = bus.on('game:over', () =>
      setOver({ msg: MESSAGES[Math.floor(Math.random() * MESSAGES.length)], id: Date.now() }),
    );
    // reiniciou (Enter aqui ou "Reiniciar" na pausa): some
    const offRestart = bus.on('game:restart', () => setOver(null));
    return () => {
      offOver();
      offRestart();
    };
  }, []);

  useEffect(() => {
    setShown(false);
    setReady(false);
    if (!over) return;
    const show = setTimeout(() => setShown(true), DELAY_MS);
    const prompt = setTimeout(() => setReady(true), PROMPT_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(prompt);
    };
  }, [over]);

  useEffect(() => {
    if (!ready || paused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') bus.emit('game:restart');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ready, paused]);

  if (!over) return null;
  return (
    // no celular, tocar na tela faz o papel do Enter
    <div key={over.id} className={`gameover${shown ? ' on' : ''}`} onClick={() => ready && !paused && bus.emit('game:restart')}>
      <h1>{t('gameover.title')}</h1>
      <h2>{t('gameover.subtitle')}</h2>
      <p>{t(over.msg)}</p>
      <small className={ready ? 'on' : ''}>{t(touch ? 'touch.gameover' : 'gameover.restart')}</small>
    </div>
  );
}
