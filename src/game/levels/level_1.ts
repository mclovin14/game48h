// Dados da quadra 1. A arte fica em assets/levels/level_1/ (montada por tools/build_background.py).

export interface FacadePlacement {
  /** Nome do arquivo em facades/, sem _dusk/_night/_lights. */
  name: string;
  /** Espaço vazio antes da fachada, em px (beco, vão entre prédios). */
  gap?: number;
}

export type PropName = 'car' | 'hydrant' | 'trash_bin';

export interface PropPlacement {
  name: PropName;
  /** Centro do objeto em x. */
  x: number;
  /** Espelha (o carro da IA olha para a esquerda). */
  flip?: boolean;
  /**
   * Faixa da calçada: 'back' pisa na linha dos postes, atrás do Kael, no tamanho normal;
   * 'front' fica junto ao meio-fio, na frente do Kael e 1,25x maior (mais perto da câmera).
   * O carro ignora: fica sempre no asfalto, na frente.
   */
  lane?: 'back' | 'front';
}

/** Lado de onde um policial entra (fora da tela). */
export type Side = 'left' | 'right';

export interface BarricadeDef {
  /** Centro da barricada em x. */
  x: number;
  /** Ondas em ordem; cada onda lista o lado de entrada de cada policial, um de cada vez. */
  waves: Side[][];
}

export interface LevelDef {
  /** Largura do mundo em px (a altura é a da tela). */
  width: number;
  kaelX: number;
  /** Fachadas da esquerda para a direita, coladas uma na outra (mais o `gap`). */
  facades: FacadePlacement[];
  /** Postes: índice da fachada antes da qual o poste fica (no meio do vão, ou na divisa se não houver vão). */
  lamps: number[];
  /** Objetos de cena: lixeira e hidrante na calçada (em duas faixas), carro no asfalto (na frente do Kael). */
  props: PropPlacement[];
  /** Barricadas policiais: ao chegar perto, a câmera trava e as ondas entram. */
  barricades: BarricadeDef[];
  /** Fim da rua: a van dos mercenários e onde cada um deles fica (olive, ranger, coyote). */
  boss: BossDef;
}

export interface BossDef {
  /** Centro da van em x; ela fica na linha dos pés, atrás dos personagens. */
  vanX: number;
  /** A arte da van olha para a esquerda; true espelha. */
  vanFlip?: boolean;
  /** Mercenários em x, na ordem dos tons. */
  mercenaries: number[];
  /** Índice do mercenário que segura a Adriana pelo braço (ela fica à frente dele, do lado do Kael). */
  holder: number;
}

// Sobrados (conceito A) alternando com prédios de tijolo (conceito B), colados um no outro, com um muro
// contínuo atrás para nenhum vão mostrar o fundo. Só 8 fachadas por enquanto, então algumas repetem;
// a mesma nunca aparece duas vezes na mesma tela.
export const LEVEL_1: LevelDef = {
  width: 4800, // 5 telas: a quinta é a arena dos mercenários [TESTE]
  kaelX: 220,
  facades: [
    { name: 'bakery', gap: 40 }, // x 40
    { name: 'pharmacy', gap: 64 }, // 332
    { name: 'grocery', gap: 72 }, // 732
    { name: 'shoe_store' }, // 995, colada no mercadinho
    { name: 'optician', gap: 80 }, // 1338
    { name: 'snack_bar', gap: 56 }, // 1684
    { name: 'haberdashery', gap: 72 }, // 2138
    { name: 'clothing' }, // 2357, colada no armarinho
    { name: 'bakery', gap: 64 }, // 2748
    { name: 'pharmacy', gap: 56 }, // 3032
    { name: 'grocery', gap: 72 }, // 3432
    { name: 'shoe_store' }, // 3695
    { name: 'optician', gap: 80 }, // 4038
    { name: 'snack_bar', gap: 56 }, // 4384
    { name: 'haberdashery', gap: 72 }, // 4838 (passa do fim)
  ],
  lamps: [2, 4, 6, 8, 10, 12, 14],
  // lixeira e hidrante do fundo nos vãos entre prédios; os da frente longe dos postes (x 696, 1298, 2102, 2716, 3396) [TESTE]
  props: [
    { name: 'trash_bin', x: 300, lane: 'back' },
    { name: 'car', x: 900 },
    { name: 'hydrant', x: 1150, lane: 'front' },
    { name: 'hydrant', x: 1656, lane: 'back' },
    { name: 'trash_bin', x: 1900, lane: 'front' },
    { name: 'trash_bin', x: 3004, lane: 'back' },
    { name: 'car', x: 3150, flip: true },
    { name: 'hydrant', x: 3560, lane: 'front' },
  ],
  // ondas [TESTE]
  barricades: [
    { x: 2440, waves: [['right', 'right'], ['right', 'left', 'right']] },
    { x: 3700, waves: [['right', 'left'], ['right', 'right', 'left'], ['left', 'right', 'right']] },
  ],
  // parados no fim da rua até a cutscene (fase 6) e a luta (fase 7) [TESTE]
  boss: { vanX: 4560, mercenaries: [4330, 4420, 4700], holder: 2 },
};
