import { Fragment } from 'react';
import { t, type TextKey } from '../i18n';
import { useLang } from './settings';
import { useMenuKeys } from './useMenuKeys';

/** Grupos da lista: cada linha é `controls.<id>.key` (tecla) e `controls.<id>` (ação). */
const GROUPS: { title: TextKey; rows: string[] }[] = [
  { title: 'controls.group.move', rows: ['walk', 'run', 'jump', 'crouch'] },
  { title: 'controls.group.fight', rows: ['weapon', 'melee', 'aim', 'shoot', 'reload', 'bullet'] },
  { title: 'controls.group.game', rows: ['pause'] },
  { title: 'controls.group.test', rows: ['debug', 'die', 'camera', 'clock', 'rain'] },
];

/** Controles (dentro das Opções): lista de teclas em duas colunas de grupos. Esc, Enter ou "Voltar" volta. */
export function Controls({ onBack }: { onBack: () => void }) {
  useLang();
  useMenuKeys({ count: 1, onSelect: onBack, onBack });
  // cada coluna é uma grade só: as teclas de grupos diferentes ficam alinhadas
  const column = (groups: typeof GROUPS) => (
    <dl className="ctl-grid">
      {groups.map(({ title, rows }) => (
        <Fragment key={title}>
          <dt className="ctl-head">{t(title)}</dt>
          {rows.map((id) => (
            <Fragment key={id}>
              <dt>{t(`controls.${id}.key` as TextKey)}</dt>
              <dd>{t(`controls.${id}` as TextKey)}</dd>
            </Fragment>
          ))}
        </Fragment>
      ))}
    </dl>
  );
  return (
    <div className="controls">
      <h2 className="menu-heading">{t('options.controls')}</h2>
      <div className="ctl-cols">
        {column(GROUPS.slice(0, 2))}
        {column(GROUPS.slice(2))}
      </div>
      <button className="menu-item sel" onClick={onBack}>
        {t('menu.back')}
      </button>
      <p className="ctl-hint">{t('controls.hint')}</p>
    </div>
  );
}
