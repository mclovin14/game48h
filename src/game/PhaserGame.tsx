import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { makeConfig } from './config';
import { HEIGHT, viewWidth } from './screen';

/** Cria o Phaser quando o componente entra na tela e destrói quando sai. */
export function PhaserGame() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const game = new Phaser.Game(makeConfig(el));
    // só no dev: deixa o teste automático do navegador ler o estado do jogo
    if (import.meta.env.DEV) (window as unknown as { __game?: Phaser.Game }).__game = game;
    // janela mudou de formato: a largura do jogo acompanha, sem faixa preta
    const onResize = () => {
      const w = viewWidth(el.clientWidth, el.clientHeight);
      if (w !== game.scale.gameSize.width) game.scale.setGameSize(w, HEIGHT);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      game.destroy(true);
    };
  }, []);

  return <div ref={ref} className="game" />;
}
