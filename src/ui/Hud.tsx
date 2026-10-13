import { useEffect, useState } from 'react';
import { bus, type GameEvents } from '../game/events';
import { t } from '../i18n';
import { useLang } from './settings';

type Ammo = GameEvents['hud:ammo'];
type Bar = { current: number; max: number };

function Meter({ label, value, color }: { label: string; value: Bar; color: string }) {
  const pct = value.max > 0 ? (value.current / value.max) * 100 : 0;
  return (
    <div className="meter">
      <span>{label}</span>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/** HUD por cima do jogo: vida, índole, arma, pente e reserva de cada tipo. Só lê eventos, nunca mexe no jogo. */
export function Hud() {
  const [life, setLife] = useState<Bar>({ current: 0, max: 1 });
  const [morale, setMorale] = useState<Bar>({ current: 0, max: 1 });
  const [ammo, setAmmo] = useState<Ammo>({ lethal: 0, nonLethal: 0, selected: 'lethal', mag: 0, magSize: 8, reloading: false });
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const off = [
      bus.on('hud:life', setLife),
      bus.on('hud:morale', setMorale),
      bus.on('hud:ammo', setAmmo),
      bus.on('hud:weapon', ({ armed }) => setArmed(armed)),
    ];
    return () => off.forEach((f) => f());
  }, []);
  useLang();

  return (
    <div className="hud">
      <Meter label={t('hud.life')} value={life} color="#d94b4b" />
      <Meter label={t('hud.morale')} value={morale} color="#e0b84a" />
      <div className="ammo">
        <span className="weapon">{t(armed ? 'hud.pistol' : 'hud.unarmed')}</span>
        <span className={ammo.mag === 0 ? 'mag empty' : 'mag'}>
          {ammo.reloading ? t('hud.reloading') : `${t('hud.mag')} ${ammo.mag}/${ammo.magSize}`}
        </span>
        <span className={ammo.selected === 'lethal' ? 'sel' : ''}>{t('hud.lethal')} {ammo.lethal}</span>
        <span className={ammo.selected === 'nonLethal' ? 'sel' : ''}>{t('hud.nonLethal')} {ammo.nonLethal}</span>
      </div>
    </div>
  );
}
