import { useEffect } from 'react';
import { t } from '../i18n';
import { useTouch } from './useTouch';

interface Props {
  text: string;
  onClose: () => void;
}

/** Caixa de texto (mensagem da quadra, avisos). Fecha com clique, Enter ou Espaço. */
export function Dialog({ text, onClose }: Props) {
  const touch = useTouch();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="panel dialog">
        <p>{text}</p>
        <small>{t(touch ? 'touch.dialog' : 'dialog.continue')}</small>
      </div>
    </div>
  );
}
