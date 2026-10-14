import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { bus, type GameEvents } from '../game/events';
import { t } from '../i18n';
import { useLang } from './settings';

type Ammo = GameEvents['hud:ammo'];
type Bar = { current: number; max: number };

/** Tamanho do pixel da arte da HUD em px de tela [TESTE] */
const hudPx = () => Math.max(1, Math.round(window.innerHeight / 450));
/** Índole abaixo disso: a balança pende [TESTE] */
const MORALE_TILT = 0.35;
/** Quanto a parte perdida da vida fica branca antes de escorrer (ms) [TESTE] */
const LOSS_HOLD_MS = 300;
/** Tecla 1: os dois espaços de arma ficam à mostra por esse tempo (ms) [TESTE] */
const SWAP_SHOW_MS = 1000;
/** Tecla Q: o pente pisca por esse tempo (ms) */
const MAG_FLASH_MS = 450;

const pctOf = (b: Bar) => (b.max > 0 ? Math.max(0, Math.min(1, b.current / b.max)) : 0);

/** Índole: dourado cheio, vermelho escuro vazio. */
function moraleColor(p: number) {
  const mix = (a: number, b: number) => Math.round(b + (a - b) * p);
  return `rgb(${mix(0xe0, 0x7a)}, ${mix(0xb8, 0x1c)}, ${mix(0x4a, 0x1c)})`;
}

/** Barra com moldura de metal; o preenchimento é CSS, por trás da moldura. A perda fica branca e depois escorre. */
function Meter({ label, value, color, className }: { label: string; value: Bar; color: string; className?: string }) {
  const pct = pctOf(value);
  const [trail, setTrail] = useState(pct);
  useEffect(() => {
    if (pct >= trail) return setTrail(pct);
    const id = window.setTimeout(() => setTrail(pct), LOSS_HOLD_MS);
    return () => window.clearTimeout(id);
  }, [pct, trail]);
  return (
    <div className={`bar ${className ?? ''}`} role="meter" aria-label={label} aria-valuenow={value.current} aria-valuemax={value.max}>
      <div className="bar-slot">
        <div className="bar-trail" style={{ width: `${trail * 100}%` }} />
        <div className="bar-fill" style={{ width: `${pct * 100}%`, background: color }} />
      </div>
    </div>
  );
}

/** Seletor de arma: punho ou pistola. Na troca (tecla 1) os dois espaços aparecem por SWAP_SHOW_MS, com o atual destacado. */
function Loadout({ armed }: { armed: boolean }) {
  const [both, setBoth] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) return void (first.current = false);
    setBoth(true);
    const id = window.setTimeout(() => setBoth(false), SWAP_SHOW_MS);
    return () => window.clearTimeout(id);
  }, [armed]);
  const slot = (gun: boolean) => (
    <div key={gun ? 'gun' : 'fist'} className={`slot ${gun ? 'pistol' : 'fist'} ${gun === armed ? 'on' : 'off'}`} />
  );
  return (
    <div className={both ? 'loadout both' : 'loadout'} aria-label={t(armed ? 'hud.pistol' : 'hud.unarmed')}>
      {both ? [slot(false), slot(true)] : slot(armed)}
    </div>
  );
}

/** Balas no pente, da cor do tipo em uso. Na recarga voltam uma por uma; vazio fica cinza e pisca; o Q faz piscar. */
function Magazine({ ammo }: { ammo: Ammo }) {
  const [shown, setShown] = useState(ammo.mag);
  const [flash, setFlash] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (!ammo.reloading) return setShown(ammo.mag);
    const target = Math.min(ammo.magSize, ammo.mag + ammo[ammo.selected]);
    const steps = target - ammo.mag;
    if (steps <= 0) return setShown(ammo.mag);
    let n = ammo.mag;
    setShown(n);
    const id = window.setInterval(() => setShown(Math.min(target, ++n)), ammo.reloadMs / steps);
    return () => window.clearInterval(id);
  }, [ammo]);
  useEffect(() => {
    if (first.current) return void (first.current = false);
    setFlash(true);
    const id = window.setTimeout(() => setFlash(false), MAG_FLASH_MS);
    return () => window.clearTimeout(id);
  }, [ammo.selected]);
  const empty = shown === 0 && !ammo.reloading;
  return (
    <div className={`mag-row ${ammo.selected} ${empty ? 'empty' : ''} ${flash ? 'flash' : ''}`} aria-label={`${t('hud.mag')} ${ammo.mag}/${ammo.magSize}`}>
      {Array.from({ length: ammo.magSize }, (_, i) => (
        <span key={i} className={i < shown ? 'bullet full' : 'bullet'} />
      ))}
    </div>
  );
}

/** HUD por cima do jogo: vida, índole, arma, pente e reserva de cada tipo. Só lê eventos, nunca mexe no jogo. */
export function Hud() {
  const [life, setLife] = useState<Bar>({ current: 0, max: 1 });
  const [morale, setMorale] = useState<Bar>({ current: 0, max: 1 });
  const [ammo, setAmmo] = useState<Ammo>({ lethal: 0, nonLethal: 0, selected: 'lethal', mag: 0, magSize: 8, reloading: false, reloadMs: 1000 });
  const [armed, setArmed] = useState(false);
  const [px, setPx] = useState(hudPx);

  useEffect(() => {
    const off = [
      bus.on('hud:life', setLife),
      bus.on('hud:morale', setMorale),
      bus.on('hud:ammo', setAmmo),
      bus.on('hud:weapon', ({ armed }) => setArmed(armed)),
    ];
    const resize = () => setPx(hudPx());
    window.addEventListener('resize', resize);
    return () => {
      off.forEach((f) => f());
      window.removeEventListener('resize', resize);
    };
  }, []);
  useLang();

  return (
    <div className="hud" style={{ '--px': `${px}px` } as CSSProperties}>
      <div className="vitals">
        <img className="portrait" src="ui/hud/hud_portrait.png" alt="" />
        <div className="vitals-bars">
          <span className="name">KAEL</span>
          <Meter label={t('hud.life')} value={life} color="#d94b4b" />
          <div className="morale">
            <span className={pctOf(morale) < MORALE_TILT ? 'scale tilt' : 'scale'} />
            <Meter label={t('hud.morale')} value={morale} color={moraleColor(pctOf(morale))} />
          </div>
        </div>
      </div>
      <div className="arms">
        <Loadout armed={armed} />
        {armed && (
          <div className="ammo">
            <Magazine ammo={ammo} />
            <div className="reserve">
              {(['lethal', 'nonLethal'] as const).map((k) => (
                <span key={k} className={`clip ${k} ${ammo.selected === k ? 'sel' : ''}`} aria-label={`${t(k === 'lethal' ? 'hud.lethal' : 'hud.nonLethal')} ${ammo[k]}`}>
                  <span className="clip-icon" />
                  {ammo[k]}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
