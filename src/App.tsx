import { useCallback, useEffect, useState } from 'react';
import { PhaserGame } from './game/PhaserGame';
import { bus } from './game/events';
import { Hud } from './ui/Hud';
import { TitleMenu, PauseMenu } from './ui/Menu';
import { Dialog } from './ui/Dialog';
import { Cutscene } from './ui/Cutscene';
import { Toast } from './ui/Toast';
import { GameOver } from './ui/GameOver';
import { emitVolumes, loadVolumes } from './ui/settings';

type Screen = 'title' | 'playing';

/** Tela: o jogo embaixo, HUD, diálogos e menus por cima. */
export function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [paused, setPaused] = useState(false);
  const [dialog, setDialog] = useState<string | null>(null);
  // cutscene em curso: sem HUD, e o Esc pula a cutscene em vez de pausar
  const [cutscene, setCutscene] = useState(false);

  useEffect(() => bus.on('dialog:open', ({ text }) => setDialog(text)), []);
  // fim da fase (depois do final): volta ao título
  useEffect(() => bus.on('game:ended', () => quit()), []);
  // volumes guardados chegam ao Phaser antes da fase abrir (o bus guarda o último valor)
  useEffect(() => emitVolumes(loadVolumes()), []);

  // O jogo para enquanto houver menu de pausa ou diálogo aberto.
  const halted = paused || dialog !== null;
  useEffect(() => {
    if (screen === 'playing') bus.emit(halted ? 'game:pause' : 'game:resume');
  }, [halted, screen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // com a pausa aberta, quem trata o Esc é o próprio menu (volta das opções ou continua)
      if (e.key === 'Escape' && screen === 'playing' && dialog === null && !paused && !cutscene) setPaused(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, dialog, paused, cutscene]);

  const closeDialog = useCallback(() => setDialog(null), []);

  const quit = () => {
    setPaused(false);
    setDialog(null);
    setCutscene(false);
    setScreen('title');
  };

  return (
    <div className="app">
      {screen === 'playing' && (
        <>
          <PhaserGame />
          {!paused && !cutscene && <Hud />}
          <Cutscene onActive={setCutscene} />
          <Toast />
          <GameOver paused={paused} />
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
