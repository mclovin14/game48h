// Controle touch: o que os botões da tela mandam ao Phaser (pelo bus) e quem vê os botões.
// Sem Phaser e sem React aqui: os dois lados importam.

/** Botões de segurar: valem enquanto o dedo está em cima (o direcional manda left, right, run e crouch). */
export type TouchHold = 'left' | 'right' | 'run' | 'crouch' | 'jump' | 'aim';
/** Botões de toque: uma ação por toque. */
export type TouchTap = 'fire' | 'weapon' | 'reload' | 'bullet';

/** Celular ou tablet: o ponteiro principal é o dedo. Computador com tela touch continua com teclado e mouse. */
export function isTouchDevice(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
}
