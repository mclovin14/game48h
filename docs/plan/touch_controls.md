# Plano: controle touch e jogo no celular (versão 0.1.2)

Pedido do usuário em 14/10/2026: "adicione controles touch... um módulo de controle touch... deixar esse app responsível para rodar em qualquer navegador... Android, iOS... Os controles touch só aparecem em celulares. Feito isso, realize um novo build... e publique a versão 0.1.2." O pedido já incluía implementar e publicar, então o plano foi registrado e executado na mesma sessão.

**Status: concluído (14/10/2026).** Testes em `docs/tests.md`, seção 12.

## Quem vê

- Os controles aparecem só quando o ponteiro principal é o dedo: `matchMedia('(pointer: coarse)')` (`src/game/touch.ts`). Celulares e tablets mostram os botões; computador, mesmo com tela touch, continua com teclado e mouse.

## Botões (`src/ui/TouchControls.tsx`)

| Botão | Faz | Equivale a |
|---|---|---|
| Direcional (metade esquerda, nasce onde o dedo encosta) | Arrastar para o lado anda; até a ponta corre; para baixo agacha; para cima pula | A/D, Shift, S, Espaço |
| Pular | Pula | Espaço |
| Mirar / Soco | Com arma, segura a mira; sem arma, o combo | Botão direito |
| Atirar | Atira (apagado sem arma) | Botão esquerdo |
| Arma, Recarga, Bala | Saca ou guarda, recarrega, troca o tipo de bala | 1, R, Q |
| Pausa (no alto, no meio) | Abre a pausa | Esc |

- Distâncias do direcional são `[TESTE]` (constante `STICK`).
- Cada dedo vale por si (pointer events): dá para andar, mirar e atirar juntos.

## Como fala com o Phaser

- Eventos novos no `bus`: `touch:hold` (botão de segurar apertado ou solto) e `touch:tap` (botão de toque).
- A cena `Test` junta o estado touch ao do teclado (`moveInput`, correr, agachar, pular) e chama as mesmas funções do mouse e das teclas. Na cutscene (controle desligado) o estado é guardado, mas nada acontece.
- O toque direto na tela do jogo não atira (`pointer.wasTouch`): no celular, quem atira é o botão.

## Celular

- `index.html`: sem zoom (`user-scalable=no`), `viewport-fit=cover`, metas para abrir em tela cheia quando salvo na tela inicial (iPhone e Android).
- CSS: altura `100dvh`, sem seleção de texto, sem lupa nem menu de toque longo, botões afastados do entalhe (`safe-area`).
- "Novo Jogo" no celular pede tela cheia e trava na horizontal onde o navegador deixa (Android; o iPhone não tem tela cheia de página).
- Celular em pé: o jogo para e aparece "Vire o celular para jogar na horizontal".
- Menus, diálogos, cutscene e game over aceitam toque; as dicas trocam "Enter" por "Toque". Na cutscene aparece o botão "Pular cena" no lugar do Esc.
