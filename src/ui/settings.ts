import { useEffect, useState } from 'react';
import { bus } from '../game/events';
import { getLang, onLangChange, type Lang } from '../i18n';

// Opções guardadas no navegador. Os volumes vão de 0 a VOLUME_STEPS e chegam ao Phaser pelo bus.
export const VOLUME_STEPS = 10;
export type Volumes = { music: number; sfx: number };
const STORAGE_KEY = 'savesher.volume';

export function loadVolumes(): Volumes {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    const ok = (n: unknown) => typeof n === 'number' && n >= 0 && n <= VOLUME_STEPS;
    if (v && ok(v.music) && ok(v.sfx)) return v;
  } catch {
    // sem localStorage ou valor quebrado: volta ao padrão
  }
  return { music: VOLUME_STEPS, sfx: VOLUME_STEPS };
}

export function saveVolumes(v: Volumes): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {
    // sem localStorage: vale só nesta sessão
  }
  emitVolumes(v);
}

export function emitVolumes(v: Volumes): void {
  bus.emit('settings:volume', { music: v.music / VOLUME_STEPS, sfx: v.sfx / VOLUME_STEPS });
}

/** Re-renderiza o componente quando a língua muda. */
export function useLang(): Lang {
  const [lang, set] = useState(getLang);
  useEffect(() => onLangChange(set), []);
  return lang;
}

/** Tela cheia ligada? Acompanha também o F11 e o Esc do navegador. */
export function useFullscreen(): [boolean, () => void] {
  const [on, set] = useState(() => document.fullscreenElement !== null);
  useEffect(() => {
    const f = () => set(document.fullscreenElement !== null);
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);
  const toggle = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => undefined);
  };
  return [on, toggle];
}
