import { useEffect, useRef, useState } from 'react';

interface Handlers {
  count: number;
  onSelect: (i: number) => void;
  onBack?: () => void;
  /** ← e →: -1 ou +1 no item selecionado (sliders e escolhas das opções). */
  onAdjust?: (i: number, dir: -1 | 1) => void;
  /** Item selecionado ao abrir. */
  initial?: number;
}

/** Setas sobem e descem, Enter escolhe, Esc volta. Devolve o item selecionado e quem o muda (mouse). */
export function useMenuKeys({ count, onSelect, onBack, onAdjust, initial = 0 }: Handlers): [number, (i: number) => void] {
  const [index, setIndex] = useState(initial);
  // handlers mudam a cada render; a escuta do teclado fica uma só
  const h = useRef({ index, count, onSelect, onBack, onAdjust });
  h.current = { index, count, onSelect, onBack, onAdjust };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { index, count, onSelect, onBack, onAdjust } = h.current;
      const go = (d: number) => setIndex((index + d + count) % count);
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') go(1);
      else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') go(-1);
      else if (e.key === 'ArrowLeft') onAdjust?.(index, -1);
      else if (e.key === 'ArrowRight') onAdjust?.(index, 1);
      else if (e.key === 'Enter' || e.key === ' ') onSelect(index);
      else if (e.key === 'Escape') onBack?.();
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return [index, setIndex];
}
