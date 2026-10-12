// Ponte React ↔ Phaser. Um lado não importa o outro: os dois falam por aqui.
// O tipo GameEvents lista todos os eventos e os dados de cada um; nome ou dado errado não compila.

export type BulletType = 'lethal' | 'nonLethal';

export interface GameEvents {
  'hud:ammo': { lethal: number; nonLethal: number; selected: BulletType };
  'hud:life': { current: number; max: number };
  'hud:morale': { current: number; max: number };
  'hud:weapon': { armed: boolean };
  'dialog:open': { text: string };
  'game:pause': undefined;
  'game:resume': undefined;
  'game:restart': undefined;
}

type EventName = keyof GameEvents;
type Handler<K extends EventName> = (payload: GameEvents[K]) => void;
type Args<K extends EventName> = GameEvents[K] extends undefined ? [] : [GameEvents[K]];

class EventBus {
  private handlers: { [K in EventName]?: Set<Handler<K>> } = {};
  // Os eventos 'hud:*' guardam o último valor: quem se inscreve depois recebe na hora.
  private last: Partial<GameEvents> = {};

  emit<K extends EventName>(event: K, ...args: Args<K>): void {
    const payload = args[0] as GameEvents[K];
    if (event.startsWith('hud:')) this.last[event] = payload;
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
