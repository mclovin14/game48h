import { useState } from 'react';
import { t, type TextKey } from '../i18n';
import { Options } from './Options';
import { useLang } from './settings';
import { useMenuKeys } from './useMenuKeys';

/** Logo "Saves Her" (PixelLab, assets/ui/title_logo.png), ampliado sem suavizar. */
export function Logo({ small = false }: { small?: boolean }) {
  return <img className={small ? 'logo small' : 'logo'} src="ui/title_logo.png" alt="Saves Her" draggable={false} />;
}

interface Item {
  label: TextKey;
  action: () => void;
}

/** Itens empilhados à esquerda: setas, Enter e mouse. */
function MenuList({ items, onBack }: { items: Item[]; onBack?: () => void }) {
  useLang();
  const [sel, setSel] = useMenuKeys({ count: items.length, onSelect: (i) => items[i].action(), onBack });
  return (
    <ul className="menu-list">
      {items.map((it, i) => (
        <li key={it.label}>
          <button className={i === sel ? 'menu-item sel' : 'menu-item'} onMouseEnter={() => setSel(i)} onClick={it.action}>
            {t(it.label)}
          </button>
        </li>
      ))}
    </ul>
  );
}

interface TitleProps {
  onPlay: () => void;
}

/** Tela de título: rua da quadra 1 no entardecer ao fundo, logo e itens à esquerda. Sem música. */
export function TitleMenu({ onPlay }: TitleProps) {
  const [options, setOptions] = useState(false);
  return (
    <div className="menu-screen title">
      <div className="menu-bg" />
      <div className="menu-column">
        <Logo />
        {options ? (
          <Options onBack={() => setOptions(false)} />
        ) : (
          <MenuList
            items={[
              { label: 'menu.newGame', action: onPlay },
              { label: 'menu.options', action: () => setOptions(true) },
            ]}
          />
        )}
      </div>
      <Hint options={options} />
    </div>
  );
}

interface PauseProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

/** Pausa: o mesmo visual por cima do jogo parado. Esc volta ao jogo. */
export function PauseMenu({ onResume, onRestart, onQuit }: PauseProps) {
  const [options, setOptions] = useState(false);
  useLang();
  return (
    <div className="menu-screen pause">
      <div className="menu-column">
        <Logo small />
        <h2 className="menu-heading">{options ? t('options.title') : t('menu.paused')}</h2>
        {options ? (
          <Options onBack={() => setOptions(false)} />
        ) : (
          <MenuList
            onBack={onResume}
            items={[
              { label: 'menu.resume', action: onResume },
              { label: 'menu.options', action: () => setOptions(true) },
              { label: 'menu.restart', action: onRestart },
              { label: 'menu.quit', action: onQuit },
            ]}
          />
        )}
      </div>
      <Hint options={options} />
    </div>
  );
}

function Hint({ options }: { options: boolean }) {
  useLang();
  return <p className="menu-hint">{t(options ? 'options.hint' : 'menu.hint')}</p>;
}
