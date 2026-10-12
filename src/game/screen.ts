// Medidas da tela. Ficam fora do config.ts para não criar import circular (o config importa as cenas).

// Resolução de referência (decisions.md, Tecnologia): 960x540, escalada para caber na janela.
// A altura é fixa; a largura visível acompanha a janela, de 16:9 (WIDTH) até 21:9 (MAX_WIDTH),
// para não sobrar faixa preta nas laterais. Tudo continua na mesma escala nos dois eixos.
export const WIDTH = 960;
export const HEIGHT = 540;
/** Largura máxima visível (21:9). Fundos fixos na tela (céu, silhueta) cobrem até aqui. */
export const MAX_WIDTH = 1280;
/** Linha do chão na tela: onde ficam os pés dos personagens. */
export const GROUND_Y = 470;
/** Profundidade da calçada atrás dos pés: a base das fachadas fica em GROUND_Y - SIDEWALK_DEPTH. */
export const SIDEWALK_DEPTH = 34;

/** Largura do jogo para a janela atual: mesma proporção da janela, presa entre 16:9 e 21:9. */
export function viewWidth(winW: number, winH: number): number {
  const w = Math.round((HEIGHT * winW) / Math.max(1, winH));
  return Math.min(MAX_WIDTH, Math.max(WIDTH, w));
}
