# Plano: combo corpo a corpo do Kael e loot do policial morto

**Status em 13/10/2026:** fases 1, 2 e 3 feitas. Animações aprovadas pelo usuário ("10/10"); combo no jogo testado no navegador, **aguardando o teste do usuário**. Sons CC0 no jogo, aguardando aprovação. Falta a resposta da pergunta 4 (mercenários). Depois segue a fase 6 do `jump_crouch_cutscene.md`.

## Pedido do usuário (13/10/2026)

- Sem a arma na mão, o Kael faz um **combo**: soca e chuta o policial.
- O combo **não mata, só nocauteia**.
- **Só o Kael** tem essas animações.
- Policial morto com bala letal tem **50% de chance** de soltar munição (hoje não solta nada).

## Fase 1: loot do policial morto (feita)

- `DEATH_DROP_CHANCE = 0.5` [TESTE] no topo de `src/game/actors/Loot.ts`.
- `onCopHit` em `Test.ts`: o nocauteado sempre solta a caixa; o morto solta em 50% das vezes.
- A caixa segue a mesma regra de hoje: 70% bala letal, 30% não letal, 3 balas.
- Testado no navegador: 3 caixas em 5 mortes, sem erro no console.

## Fase 2: animações do combo (feita, aprovada)

Três golpes encadeados, sem arma, chão y=120, virados para East:

| Animação | O que é | Quadros (estimativa) |
|---|---|---|
| `punch_1_east` | jab: soco rápido com a mão da frente | 5 a 6 |
| `punch_2_east` | direto: soco forte com a mão de trás, gira o quadril | 6 a 7 |
| `kick_east` | **chute giratório** (o usuário escolheu), o golpe que derruba | 8 a 10 |

- Pipeline do Kael:
  - keyframe da pose do golpe com `edit_image_pro_flash` sobre o `player_base_east.png`;
  - `animate_image` do idle até o golpe, e a volta;
  - cabeça da base colada, no máximo 1 px por quadro, paleta de 14 cores, chão y=120.
- Script novo `tools/build_melee.py`.
- Para em dois pontos: primeiro os 3 keyframes, depois as animações.
- **Emenda** (pedido do usuário, 13/10/2026): no combo, o golpe seguinte entra sem os quadros de mão baixa.
  - O direto tem quadros próprios de transição (`one_two_a`): sai do jab esticado e recolhe o jab ao queixo com as duas mãos altas, gira e estica.
  - O jab sai no quadro 3 (esticado), e o direto no quadro 5 (recolhendo).
  - O direto entra no quadro 0, e o chute no quadro 1.
  - Sem clique, o golpe vai até o fim e volta ao idle.
  - Os valores ficam em `CHAIN_OUT`/`CHAIN_IN` do `build_melee.py`; a fase 3 usa os mesmos.
- **Estrelinha de impacto** (aprovada): 2 ou 3 quadros no ponto do acerto, desenhada no Phaser. Cores fora da paleta, só de efeito.

## Fase 3: combo no jogo (feita, espera o teste do usuário)

Feito em 13/10/2026:
- `humanoid.ts`: `punch_1`, `punch_2` e `kick` no `KAEL`; `act` aceita `startFrame`.
- `Police.strike(finisher)`: soco dá o tranco sem tirar vida; chute nocauteia (nunca mata).
- `Test.ts`: modo `melee`, tabela `COMBO` (acerto, emenda e entrada), `landBlow` acerta todo policial à frente, `impact` desenha a estrelinha.
- Clique durante o golpe fica guardado e emenda no ponto de emenda; clique depois disso (voltando à guarda) emenda na hora. Parar de clicar termina no idle.
- Texto de ajuda em `pt_br.ts` e `en.ts`.
- Sons (CC0, aguardando aprovação): `swing` em todo golpe; `punch_hit` no jab e no direto que acertam; `kick_hit` no chute que acerta. Fontes no `decisions.md`.

### Como funciona [PROPOSTA]

- **Botão:** clique **direito** sem arma (decidido; com arma ele continua mirando). Cada clique é um golpe.
- **Encadear:** clicar de novo até 0,35 s [TESTE] depois do golpe emenda o seguinte:
  - jab → direto → chute;
  - parar de clicar zera o combo.
- O Kael **para de andar** enquanto golpeia, como no tiro.
- Sem combo no ar nem agachado (por enquanto).
- **Alcance:** 48 px [TESTE] à frente do Kael, pela caixa do corpo do policial (como a bala).

### Efeito no policial [PROPOSTA]

- **Jab e direto:** o policial toma o tranco (`hurt`), o que interrompe a mira e o tiro dele.
- **Chute:** nocauteia (`knockout`).
- Por isso o combo inteiro derruba qualquer policial. O chute sozinho, sem os socos antes, só dá o tranco.
- Policial ajoelhado: leva o golpe igual e levanta no tranco, como acontece com a bala.
- **Não tira índole.** O nocauteado solta a caixa de munição, como o nocaute por bala.

### Sons

- Três sons: soco acertando, chute acertando e golpe no vazio.
- O usuário manda os arquivos, ou a IA procura de licença livre (CC0) e o usuário aprova, como no fuzil.

### Arquivos

- `src/game/anims/humanoid.ts`: três animações novas, só na lista do `KAEL`.
- `src/game/scenes/Test.ts`: estado `melee`, fila do combo e acerto.
- `src/game/actors/Police.ts`: método para o golpe, ao lado do `hit(type)`.
- `src/game/audio/Sfx.ts`: os sons novos.
- Controles na ajuda da tela, em `src/i18n/` (pt e en).

## Respostas do usuário (13/10/2026)

- **Botão direito** sem arma; clicando seguido sai o combo.
- Jab → direto → **chute giratório**.
- **Um combo sempre nocauteia** o policial.
- **Estrelinha de impacto, sim**, desenhada no Phaser.
- A cutscene de abertura (fase 6 do `jump_crouch_cutscene.md`) espera o combo.
- Ainda sem resposta: se o combo vale nos mercenários (pergunta 4).

## Perguntas ao usuário (13/10/2026)

1. **Botão do combo:** pode ser o clique esquerdo sem arma? Ou prefere uma tecla própria (F, por exemplo)?
2. **Golpes:** jab → direto → chute está bom? Ou prefere outro chute (giratório, rasteira) ou mais golpes?
3. **Força:** o combo inteiro sempre nocauteia? Ou o policial aguenta mais de um combo?
4. **Mercenários:** o combo funciona neles também (fase 7 do outro plano)? Ou só nos policiais?
5. **Estrelinha de impacto:** quer?
