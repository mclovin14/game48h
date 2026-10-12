interface TitleProps {
  onPlay: () => void;
}

export function TitleMenu({ onPlay }: TitleProps) {
  return (
    <div className="overlay">
      <div className="panel">
        <h1>Kael</h1>
        <button onClick={onPlay}>Jogar cena de teste</button>
      </div>
    </div>
  );
}

interface PauseProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export function PauseMenu({ onResume, onRestart, onQuit }: PauseProps) {
  return (
    <div className="overlay">
      <div className="panel">
        <h2>Pausado</h2>
        <button onClick={onResume}>Continuar</button>
        <button onClick={onRestart}>Reiniciar cena</button>
        <button onClick={onQuit}>Voltar ao título</button>
      </div>
    </div>
  );
}
