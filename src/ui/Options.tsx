import { useState } from 'react';
import { LANGS, LANG_NAME, getLang, setLang, t, type TextKey } from '../i18n';
import { VOLUME_STEPS, loadVolumes, saveVolumes, useFullscreen, useLang, type Volumes } from './settings';
import { useMenuKeys } from './useMenuKeys';
import { Controls } from './Controls';

type Row = 'music' | 'sfx' | 'fullscreen' | 'language' | 'controls' | 'back';
const ROWS: Row[] = ['music', 'sfx', 'fullscreen', 'language', 'controls', 'back'];
const LABEL: Record<Row, TextKey> = {
  music: 'options.music',
  sfx: 'options.sfx',
  fullscreen: 'options.fullscreen',
  language: 'options.language',
  controls: 'options.controls',
  back: 'menu.back',
};

/** Volume em blocos: clicar num bloco põe o volume nele; clicar no primeiro aceso apaga tudo. */
function VolumeBar({ value, onSet }: { value: number; onSet: (v: number) => void }) {
  return (
    <span className="vol">
      {Array.from({ length: VOLUME_STEPS }, (_, i) => (
        <span
          key={i}
          className={i < value ? 'vol-block on' : 'vol-block'}
          onClick={(e) => {
            e.stopPropagation();
            onSet(i === 0 && value === 1 ? 0 : i + 1);
          }}
        />
      ))}
    </span>
  );
}

/** Opções: volume da música e dos efeitos, tela cheia, língua e a lista de controles. Tudo fica guardado no navegador. */
export function Options({ onBack }: { onBack: () => void }) {
  const [controls, setControls] = useState(false);
  const [came, setCame] = useState(false);
  // a lista sai da tela enquanto os controles estão abertos: só uma escuta de teclado por vez
  if (controls)
    return (
      <Controls
        onBack={() => {
          setControls(false);
          setCame(true);
        }}
      />
    );
  // voltando dos controles, a seleção fica neles
  return <OptionsList onBack={onBack} onControls={() => setControls(true)} initial={came ? ROWS.indexOf('controls') : 0} />;
}

interface ListProps {
  onBack: () => void;
  onControls: () => void;
  initial: number;
}

function OptionsList({ onBack, onControls, initial }: ListProps) {
  const lang = useLang();
  const [vol, setVol] = useState<Volumes>(loadVolumes);
  const [full, toggleFull] = useFullscreen();

  const setVolume = (k: keyof Volumes, v: number) => {
    const next = { ...vol, [k]: Math.max(0, Math.min(VOLUME_STEPS, v)) };
    setVol(next);
    saveVolumes(next);
  };
  const cycleLang = (dir: -1 | 1) => setLang(LANGS[(LANGS.indexOf(getLang()) + dir + LANGS.length) % LANGS.length]);

  const adjust = (i: number, dir: -1 | 1) => {
    const row = ROWS[i];
    if (row === 'music' || row === 'sfx') setVolume(row, vol[row] + dir);
    else if (row === 'fullscreen') toggleFull();
    else if (row === 'language') cycleLang(dir);
  };
  const select = (i: number) => {
    const row = ROWS[i];
    if (row === 'back') onBack();
    else if (row === 'controls') onControls();
    else if (row === 'fullscreen') toggleFull();
    else if (row === 'language') cycleLang(1);
  };
  const [sel, setSel] = useMenuKeys({ count: ROWS.length, onSelect: select, onBack, onAdjust: adjust, initial });

  const value = (row: Row) => {
    if (row === 'music' || row === 'sfx') return <VolumeBar value={vol[row]} onSet={(v) => setVolume(row, v)} />;
    if (row === 'fullscreen') return <span className="opt-value">{t(full ? 'options.on' : 'options.off')}</span>;
    if (row === 'language') return <span className="opt-value">‹ {LANG_NAME[lang]} ›</span>;
    return null;
  };

  return (
    <ul className="menu-list options">
      {ROWS.map((row, i) => (
        <li key={row}>
          <button className={i === sel ? 'menu-item sel' : 'menu-item'} onMouseEnter={() => setSel(i)} onClick={() => select(i)}>
            <span className="opt-label">{t(LABEL[row])}</span>
            {value(row)}
          </button>
        </li>
      ))}
    </ul>
  );
}
