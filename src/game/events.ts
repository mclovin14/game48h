// Ponte React ↔ Phaser. Um lado não importa o outro: os dois falam por aqui.
// O tipo GameEvents lista todos os eventos e os dados de cada um; nome ou dado errado não compila.

export type BulletType = 'lethal' | 'nonLethal';
/** Quem fala na cutscene (retrato e nome na caixa de fala). */
export type Speaker = 'adriana' | 'kael';

export interface GameEvents {
  /** lethal e nonLethal: reserva fora do pente. O pente (mag) tem sempre o tipo selecionado. reloadMs: quanto dura a recarga. */
  'hud:ammo': { lethal: number; nonLethal: number; selected: BulletType; mag: number; magSize: number; reloading: boolean; reloadMs: number };
  'hud:life': { current: number; max: number };
  'hud:morale': { current: number; max: number };
  'hud:weapon': { armed: boolean };
  'dialog:open': { text: string };
  /** Dica curta que aparece e some sozinha (o começo da fase lembra onde ficam os controles). */
  'toast:show': { text: string };
  /** Cutscene (Phaser → React): começa (faixas pretas, sem HUD), tela de texto, fala com retrato, termina. */
  /** `black`: começa com a tela preta (a cutscene abre com a tela de texto). */
  'cutscene:start': { black: boolean };
  /** `final`: a tela preta fica depois do Enter (o jogo acaba em seguida). */
  'cutscene:intro': { text: string; final?: boolean };
  'cutscene:line': { speaker: Speaker; text: string };
  /** Ilustração em tela cheia (o Phaser desenha): sem faixas pretas; espera o Enter. */
  'cutscene:art': undefined;
  'cutscene:end': undefined;
  /** Cutscene (React → Phaser): o jogador fechou o texto (Enter) ou pulou a cutscene (Esc). */
  'cutscene:next': undefined;
  'cutscene:skip': undefined;
  'game:pause': undefined;
  'game:resume': undefined;
  'game:restart': undefined;
  /** O Kael morreu (Phaser → React): a tela de game over escurece e espera o Enter, que manda `game:restart`. */
  'game:over': undefined;
  /** Fim da fase (depois do final): volta ao título. */
  'game:ended': undefined;
  /** Volumes das opções, de 0 a 1: multiplicam os volumes de cada som. */
  'settings:volume': { music: number; sfx: number };
}

type EventName = keyof GameEvents;
type Handler<K extends EventName> = (payload: GameEvents[K]) => void;
type Args<K extends EventName> = GameEvents[K] extends undefined ? [] : [GameEvents[K]];

class EventBus {
  private handlers: { [K in EventName]?: Set<Handler<K>> } = {};
  // Os eventos 'hud:*' e 'settings:*' guardam o último valor: quem se inscreve depois recebe na hora.
  private last: Partial<GameEvents> = {};

  emit<K extends EventName>(event: K, ...args: Args<K>): void {
    const payload = args[0] as GameEvents[K];
    if (event.startsWith('hud:') || event.startsWith('settings:')) this.last[event] = payload;
    this.handlers[event]?.forEach((h) => h(payload));
  }

  /** Inscreve e devolve a função que cancela a inscrição. */
  on<K extends EventName>(event: K, handler: Handler<K>): () => void {
    const set: Set<Handler<K>> = this.handlers[event] ?? new Set();
    this.handlers[event] = set as (typeof this.handlers)[K];
    set.add(handler);
    if (event in this.last) handler(this.last[event] as GameEvents[K]);
    return () => {
      set.delete(handler);
    };
  }
}

export const bus = new EventBus();
