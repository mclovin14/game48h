import { useCallback, useEffect, useState } from 'react';
import { PhaserGame } from './game/PhaserGame';
import { bus } from './game/events';
import { Hud } from './ui/Hud';
import { TitleMenu, PauseMenu } from './ui/Menu';
import { Dialog } from './ui/Dialog';

type Screen = 'title' | 'playing';

/** Tela: o jogo embaixo, HUD, diálogos e menus por cima. */
export function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [paused, setPaused] = useState(false);
  const [dialog, setDialog] = useState<string | null>(null);

  useEffect(() => bus.on('dialog:open', ({ text }) => setDialog(text)), []);

  // O jogo para enquanto houver menu de pausa ou diálogo aberto.
  const halted = paused || dialog !== null;
  useEffect(() => {
    if (screen === 'playing') bus.emit(halted ? 'game:pause' : 'game:resume');
  }, [halted, screen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && screen === 'playing' && dialog === null) setPaused((p) => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, dialog]);

  const closeDialog = useCallback(() => setDialog(null), []);

  const quit = () => {
    setPaused(false);
    setDialog(null);
    setScreen('title');
  };

  return (
    <div className="app">
      {screen === 'playing' && (
        <>
          <PhaserGame />
          <Hud />
        </>
      )}
      {screen === 'title' && <TitleMenu onPlay={() => setScreen('playing')} />}
      {paused && (
        <PauseMenu
          onResume={() => setPaused(false)}
          onRestart={() => {
            setPaused(false);
            bus.emit('game:restart');
          }}
          onQuit={quit}
        />
      )}
      {dialog !== null && !paused && <Dialog text={dialog} onClose={closeDialog} />}
    </div>
  );
}
