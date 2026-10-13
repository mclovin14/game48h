import { ptBr, type TextKey } from './pt_br';
import { en } from './en';

// Língua da interface. Não depende de React nem de Phaser: os dois lados leem daqui.
export type Lang = 'pt_br' | 'en';
export const LANGS: Lang[] = ['pt_br', 'en'];
/** Nome de cada língua na própria língua (aparece nas opções). */
export const LANG_NAME: Record<Lang, string> = { pt_br: 'Português', en: 'English' };

const TEXTS: Record<Lang, Record<TextKey, string>> = { pt_br: ptBr, en };
const STORAGE_KEY = 'savesher.lang';

function stored(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && (LANGS as string[]).includes(v)) return v as Lang;
  } catch {
    // navegador sem localStorage: fica no padrão
  }
  return 'pt_br';
}

let lang: Lang = stored();
const listeners = new Set<(l: Lang) => void>();

export const getLang = (): Lang => lang;

export function setLang(l: Lang): void {
  lang = l;
  try {
    localStorage.setItem(STORAGE_KEY, l);
  } catch {
    // sem localStorage: vale só nesta sessão
  }
  document.documentElement.lang = l === 'pt_br' ? 'pt-BR' : 'en';
  listeners.forEach((f) => f(l));
}

/** Avisa quando a língua muda; devolve a função que cancela. */
export function onLangChange(f: (l: Lang) => void): () => void {
  listeners.add(f);
  return () => {
    listeners.delete(f);
  };
}

export const t = (key: TextKey): string => TEXTS[lang][key];
export type { TextKey };
