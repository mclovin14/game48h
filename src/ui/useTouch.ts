import { useEffect, useState } from 'react';
import { isTouchDevice } from '../game/touch';

/** Acompanha uma media query do CSS. */
function useMedia(query: string): boolean {
  const [on, set] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const f = () => set(m.matches);
    f();
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, [query]);
  return on;
}

/** Celular ou tablet (o dedo é o ponteiro principal): mostra os controles touch e troca as dicas de tecla. */
export function useTouch(): boolean {
  return useMedia('(pointer: coarse)');
}

/** Celular em pé: o jogo para e pede para virar. */
export function usePortrait(): boolean {
  return useMedia('(orientation: portrait)') && isTouchDevice();
}

/** No celular, entrar no jogo pede tela cheia e trava na horizontal (onde o navegador deixa; o iPhone não deixa). */
export function enterMobileFullscreen(): void {
  if (!isTouchDevice()) return;
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
  const doc = document as Document & { webkitFullscreenElement?: Element | null };
  if (document.fullscreenElement || doc.webkitFullscreenElement) return;
  try {
    const req = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : el.webkitRequestFullscreen?.();
    void Promise.resolve(req)
      .then(() => (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape'))
      .catch(() => undefined);
  } catch {
    // sem tela cheia: joga com a barra do navegador
  }
}
