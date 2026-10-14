import { useEffect, useState } from 'react';
import { bus } from '../game/events';

/** Quanto a dica fica na tela, contando a entrada e a saída. [TESTE] */
const TOAST_MS = 4000;

/** Dica curta no alto da tela (`toast:show`): aparece, fica uns segundos e some sozinha, sem pausar o jogo. */
export function Toast() {
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);
  useEffect(() => bus.on('toast:show', ({ text }) => setToast({ text, id: Date.now() })), []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);
  if (!toast) return null;
  return (
    <div key={toast.id} className="toast" style={{ ['--toast-ms' as string]: `${TOAST_MS}ms` }}>
      {toast.text}
    </div>
  );
}
