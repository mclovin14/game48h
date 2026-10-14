import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { bus } from '../game/events';
import type { TouchHold, TouchTap } from '../game/touch';
import { t, type TextKey } from '../i18n';
import { useLang } from './settings';

// Controle touch (só no celular): direcional à esquerda, botões de ação à direita e a pausa no alto.
// Cada dedo vale por si (pointer events): dá para andar, mirar e atirar ao mesmo tempo.

/** Direcional, em px a partir de onde o dedo encostou [TESTE]. */
const STICK = {
  /** Folga no meio: abaixo disso o Kael fica parado. */
  dead: 14,
  /** Arrastou até aqui para o lado: corre. */
  run: 56,
  /** Arrastou até aqui para baixo: agacha. */
  crouch: 30,
  /** Arrastou até aqui para cima: pula. */
  jump: 44,
  /** Raio do desenho (a bolinha não passa daqui). */
  radius: 60,
};

type StickState = Record<'left' | 'right' | 'run' | 'crouch' | 'jump', boolean>;
const STICK_OFF: StickState = { left: false, right: false, run: false, crouch: false, jump: false };

/** Manda ao Phaser só o que mudou. */
function emitChanges(prev: StickState, next: StickState): void {
  for (const k of Object.keys(next) as (keyof StickState)[]) if (prev[k] !== next[k]) bus.emit('touch:hold', { button: k, down: next[k] });
}

/** Direcional que nasce onde o dedo encosta (metade esquerda da tela). Sem dedo, fica desenhado no canto. */
function Stick() {
  const [knob, setKnob] = useState<{ x: number; y: number; dx: number; dy: number } | null>(null);
  const finger = useRef<number | null>(null);
  const state = useRef<StickState>(STICK_OFF);

  const set = (next: StickState) => {
    emitChanges(state.current, next);
    state.current = next;
  };
  // sai da tela (pausa, cutscene) com o dedo em cima: solta tudo
  useEffect(() => () => emitChanges(state.current, STICK_OFF), []);

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (finger.current !== null) return;
    e.preventDefault();
    finger.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = e.currentTarget.getBoundingClientRect();
    setKnob({ x: e.clientX - r.left, y: e.clientY - r.top, dx: 0, dy: 0 });
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== finger.current || !knob) return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - r.left - knob.x;
    const dy = e.clientY - r.top - knob.y;
    const len = Math.hypot(dx, dy);
    const k = len > STICK.radius ? STICK.radius / len : 1;
    setKnob({ ...knob, dx: dx * k, dy: dy * k });
    set({
      left: dx < -STICK.dead,
      right: dx > STICK.dead,
      run: Math.abs(dx) > STICK.run,
      // para baixo ou para cima só conta quando o arrasto é mais vertical que horizontal
      crouch: dy > STICK.crouch && dy > Math.abs(dx) * 0.6,
      jump: -dy > STICK.jump && -dy > Math.abs(dx) * 0.6,
    });
  };
  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== finger.current) return;
    finger.current = null;
    setKnob(null);
    set(STICK_OFF);
  };

  return (
    <div className="touch-stick-zone" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      <div className={knob ? 'touch-stick on' : 'touch-stick'} style={knob ? { left: knob.x, top: knob.y } : undefined}>
        <div className="touch-knob" style={knob ? { transform: `translate(${knob.dx}px, ${knob.dy}px)` } : undefined} />
      </div>
    </div>
  );
}

interface ButtonProps {
  label: TextKey;
  className: string;
  /** Botão de segurar (manda apertado e solto) ou de toque (manda uma vez). */
  hold?: TouchHold;
  tap?: TouchTap;
  onTap?: () => void;
}

/** Botão redondo: responde no encostar do dedo, sem esperar soltar. */
function Button({ label, className, hold, tap, onTap }: ButtonProps) {
  const [down, setDown] = useState(false);
  const held = useRef(false);
  useEffect(
    () => () => {
      if (hold && held.current) bus.emit('touch:hold', { button: hold, down: false });
    },
    [hold],
  );

  const press = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDown(true);
    if (hold) {
      held.current = true;
      bus.emit('touch:hold', { button: hold, down: true });
    }
    if (tap) bus.emit('touch:tap', { button: tap });
    onTap?.();
  };
  const release = () => {
    setDown(false);
    if (hold && held.current) {
      held.current = false;
      bus.emit('touch:hold', { button: hold, down: false });
    }
  };

  return (
    <button
      type="button"
      className={`touch-btn ${className}${down ? ' down' : ''}`}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={(e) => e.preventDefault()}
    >
      {t(label)}
    </button>
  );
}

/** Controles touch por cima do jogo. Montado só no celular, com o jogo rodando (sem pausa, diálogo ou cutscene). */
export function TouchControls({ onPause }: { onPause: () => void }) {
  useLang();
  // sem arma, o botão de mira vira o soco do combo (como o botão direito do mouse)
  const [armed, setArmed] = useState(false);
  useEffect(() => bus.on('hud:weapon', ({ armed }) => setArmed(armed)), []);

  return (
    <div className="touch" onContextMenu={(e) => e.preventDefault()}>
      <Stick />
      <div className="touch-actions">
        <Button label="touch.weapon" className="small weapon" tap="weapon" />
        <Button label="touch.reload" className="small reload" tap="reload" />
        <Button label="touch.bullet" className="small bullet" tap="bullet" />
        <Button label={armed ? 'touch.aim' : 'touch.melee'} className="aim" hold="aim" />
        <Button label="touch.jump" className="jump" hold="jump" />
        <Button label="touch.fire" className={armed ? 'fire' : 'fire off'} tap="fire" />
      </div>
      <Button label="touch.pause" className="small pause" onTap={onPause} />
    </div>
  );
}
