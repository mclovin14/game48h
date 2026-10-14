# Plano: correções da primeira jogada completa

**Status em 13/10/2026:** fases 8 e 9 (HUD) aprovadas. **Fase 8 feita** (peças escolhidas pelo usuário: rosto 33, balança 38, moldura do rosto 21, barra 3; `tools/build_hud.py`, prévia em `assets/ui/hud/drafts/hud_preview.png`), aprovada. **Fase 9 feita** (punho B = fist_raw/02, pistola D = pistol_raw/40 pintada nos cinzas da arma do Kael, pente B = mag_raw/13 em vermelho e azul; prévia em `assets/ui/hud/drafts/arms_preview.png`), aprovada. **Fase 3 feita** (o corpo deitado desce até o chão e o fuzil/pistola solto do último quadro fica no chão, na frente: mercenário `death` 12-15 e `knockout` 10-11, 13 px; policial `knockout` 6-7, 8 px, nas 3 variantes), aprovada. **Fases 4 (sangue, `Blood.ts`) e 7 (chuva, `Rain.ts`, tecla N no teste) feitas** em 13/10/2026, typecheck ok e conferidas no navegador; **aguardando o teste do usuário**. O plano está completo e o usuário aprovou o resultado na jogada (13/10/2026); os ajustes que ele pediu depois estão em `playtest_fixes_2.md`. Resto do plano aprovado (chuva: 50% por jogada, som em loop CC0). **Fases 1, 5, 6 e 2 feitas**, typecheck ok, **aguardando o teste e o aval do usuário**. O usuário pediu: **não avançar de fase sem o aval dele**.

## Pedido do usuário (13/10/2026)

1. O texto da abertura diz que a Adriana está "num prédio na Capital" e fala de "cinco quadras". O escopo mudou: o jogo é só esta fase, e a Adriana está no fim da rua.
2. Recarregar agachado não funciona (não há animação para isso).
3. Mercenários mortos ficam flutuando (no print, um deles fica acima do pneu da van).
4. Feature: sangue a cada tiro que o Kael leva ou acerta, pingando e caindo no chão, feito no próprio Phaser.
5. Encurtar o tempo do entardecer até a noite.
6. Recarga da arma mais rápida, porque hoje demora muito (pedido depois da 1ª versão do plano).
7. Feature: chuva no fim da fase, quando já está de noite, **aleatória**: em umas jogadas chove, em outras não (pedido depois da 2ª versão do plano).
8. HUD nova de vida e índole, desenhada no PixelLab, no estilo da do X-Men: Mutant Apocalypse (Super Nintendo), que o usuário mandou de exemplo: o rosto do Kael num quadro, o nome "KAEL", a barra de vida e, embaixo, a barra de índole com uma **balança** (justiça) como ícone (pedido depois do aval das fases 1, 5, 6 e 2).
9. Seletor de arma, como no GTA: sem arma, aparece um **punho**; com a arma, aparece a **pistola**. Pente **vermelho** para a bala letal e **azul** para a não letal. Tudo desenhado no PixelLab (mesmo pedido).

## Respostas do usuário (13/10/2026)

- Frase nova da abertura: **aprovada**.
- Recarga agachada: **fazer uma animação nova** (opção C).
- Ciclo de **3 minutos**, a confirmar em teste.
- Bala não letal: **só um respingo pequeno** de sangue.
- Recarga de **~1,2 s** para o Kael; **policiais como estão**.
- Chuva: **50% por jogada**, começando de noite; som em **loop com licença livre** (CC0).
- HUD: pente **vermelho = letal**, **azul = não letal**; troca de arma pela tecla 1, com os dois espaços aparecendo por ~1 s; barra de índole muda de cor com o valor e a balança pende quando ela está baixa; **a HUD vem antes das fases 3, 4 e 7**.

## O que a investigação achou

- **Texto:** `cutscene.intro` em `src/i18n/pt_br.ts:37` e `src/i18n/en.ts:38`. O `decisions.md` (linha 40) já diz que o escopo é só esta fase, com a Adriana no fim da rua.
- **Recarga agachada:** `reload()` em `src/game/scenes/Test.ts:695`. Agachado, o Kael só segura a pose (`rest()`) enquanto o som toca. A recarga funciona, mas nada se mexe, e por isso parece quebrada. Os policiais têm `crouch_reload_gun` (a recarga em pé com o tronco descido), mas o Kael não.
- **Mercenário flutuando:** os sprites estão aterrados certo (pixel mais baixo em y=121), mas **quem toca o chão é o fuzil**. No último quadro de `death` e de `knockout`, o fuzil fica na linha do chão e o corpo deitado fica de 5 a 20 px acima dele (render ampliado conferido). O mesmo acontece, mais fraco, no `knockout` do policial (a pistola no chão e o corpo uns 10 px acima). O `death` do policial está certo.
- **Ciclo:** `DAY_CYCLE_MS = 8 * 60 * 1000` em `Test.ts:44` (provisório no `decisions.md`, linha 174).
- **Acertos:** o tiro no Kael passa por `hurtKael()` (`Test.ts:830`); o tiro no inimigo, por `Gunner.hit()` (`Gunner.ts:355`), chamado pela cena.
- **Chuva:** não há som de chuva em `assets/sounds/`. A ilustração do final triste já é na chuva (`decisions.md`, linha 45).

## Fase 1: texto da abertura (aprovada)

Troca a 4ª linha da tela de texto:

- PT: `Levaram ela para o fim desta rua. Tem barricada da polícia o caminho todo.`
- EN: `They took her to the end of this street. Police barricades all the way there.`

Também corrijo a linha 23 do `decisions.md` ("cinco quadras até o prédio na Capital"). Ela não é apagada: ganha a nota de que o escopo desta versão é o da linha 40. O mesmo vale para o `story.md` e o `GDD.md`, se repetirem a frase.

## Fase 2: recarga agachada com animação nova (opção C)

- Faço a `crouch_reload_gun` do Kael no `tools/build_crouch.py`, do mesmo jeito que o `crouch_aim_gun` já é feito: cada quadro da `reload_gun` em pé, com o tronco descido 18 px sobre as pernas ajoelhadas da pose parada do `crouch_gun`.
- Uso a `reload_gun` já acelerada da fase 6, para os dois tempos ficarem iguais.
- Confiro a costura entre o tronco e as pernas, o rosto da base, o chão em y=121 e a paleta com render ampliado. Se a costura quebrar pixel, faço um keyframe no PixelLab e sigo o pipeline normal.
- No código: `crouch_reload_gun` entra na lista `KAEL` em `humanoid.ts`, e o `reload()` toca essa animação quando o Kael está agachado, em vez do `rest()`. Durante a recarga, a caixa do corpo continua a da pose agachada.

## Fase 3: corpos no chão (mercenários e knockout do policial)

Em `tools/build_mercenary.py` (e no script do policial, para o `knockout`):

- Nos quadros da queda, separo o fuzil (ou a pistola) do corpo pela máscara das cores da arma e **desço o corpo** até ele encostar em y=121, no máximo 1 px por quadro, para não dar tranco.
- A arma fica no chão, um pouco à frente do corpo, de modo que a ponta ainda apareça.
- Regero os sheets, as variantes de tom e os GIFs de prévia. Confiro com render ampliado a linha do chão, a contagem de cores e o rosto.
- Não mexo em código: o `floor: 121` continua valendo.

## Fase 4: sangue (novo `src/game/actors/Blood.ts`)

Feito no Phaser, sem arte nova. Uso um sistema leve próprio, no estilo do `Bullets.ts`, e não o `ParticleEmitter`, porque a gota precisa parar no chão e virar mancha.

- **Respingo no acerto:** de 6 a 10 gotas de 1 a 2 px saem do ponto do impacto, na direção da bala, com espalhamento e gravidade.
- **Gota cai e vira mancha:** ao chegar a `GROUND_Y`, a gota vira uma poça achatada (de 2 a 4 px de largura, 1 px de altura) que fica uns segundos e some aos poucos. O número de manchas tem um teto (umas 80); passando dele, as mais velhas saem primeiro.
- **Pingando:** quem foi atingido (o Kael ou um inimigo) solta uma gota a cada ~0,6 s, por um tempo curto depois do acerto.
- **Cores:** só os dois tons de sangue da paleta, `(176,32,36)` e `(110,16,24)`, multiplicados pela luz ambiente do `DayCycle` para escurecer à noite.
- **Quando sai sangue:** em tiro letal no inimigo e em todo tiro no Kael, do policial ou do mercenário. **Bala não letal:** só um respingo pequeno (de 2 a 3 gotas, sem poça e sem pingar). O combo corpo a corpo não sangra.
- Todos os números ficam no topo, com `[TESTE]`.

Pontos de ligação: `hurtKael()` e o lugar da cena onde ela chama `Gunner.hit()`. O ponto de impacto vem da bala.

## Fase 5: ciclo mais curto (aprovada, a testar)

`DAY_CYCLE_MS` passa de 8 min para **3 min** [TESTE]. As faixas do ciclo são proporcionais (`Street.ts`, `Sky.ts`), então nada mais muda. Atualizo a linha 174 do `decisions.md`.

## Fase 6: recarga mais rápida (aprovada)

Hoje a recarga dura 2,08 s: `RELOAD_MS = 2080` (`Test.ts:40`) é casado com o som `colt_reload` e com a `reload_gun` (11 quadros × 190 ms, `humanoid.ts:84`).

- Passa para **~1,2 s** [TESTE]: a `reload_gun` do Kael cai de 190 para cerca de 110 ms por quadro (11 × 110 = 1210 ms), e o `RELOAD_MS` vai para 1210.
- Os quadros têm tempos diferentes: mais rápido na troca do pente, com uma pausa curta no fim para o encaixe ainda aparecer.
- **Som:** um script novo em `tools/` corta os silêncios entre os estalos do `colt_reload.wav` e gera `colt_reload_fast.wav` com ~1,2 s, sem mudar o tom. O original fica guardado. Se o corte soar estranho, a reserva é tocar o som com `rate` maior, o que deixa o tom mais agudo.
- **Policiais:** continuam como estão. Eles usam o mesmo nome de animação (`reload_gun`) e o mesmo som, então o tempo novo entra só no `KAEL`, por `overrides`, e o som curto só no Kael.
- Atualizo o comentário do `RELOAD_MS` e o valor em AJUSTAR EM TESTE no `decisions.md`.

## Fase 7: chuva aleatória à noite (novo `src/game/world/Rain.ts`)

- **Sorteio:** no começo de cada jogada, sai se vai chover: **50%** [TESTE]. O sorteio usa a mesma semente do `EnemyDirector`, para dar para repetir uma jogada. Se chover, a hora em que começa também é sorteada, entre **70% e 85% do ciclo** [TESTE], já de noite.
- **Entrada aos poucos:** começa com poucas gotas e chega ao máximo em ~15 s [TESTE]. Uma vez começada, segue até o fim da fase, a luta com os mercenários inclusive. Isso combina com o final triste, que já é na chuva.
- **Desenho, sem arte nova:** riscos de 1 px de largura e 4 a 7 px de altura, em azul-acinzentado claro, com leve inclinação. São duas camadas: uma atrás dos personagens, mais fraca e lenta, e outra na frente, mais forte e rápida. Os riscos ficam presos à câmera, sem rolar com o cenário.
- **No chão:** respingos de 2 a 3 px na linha da calçada, onde a gota bate.
- **Clima:** a luz ambiente fica um pouco mais escura e azul enquanto chove, somada ao `DayCycle`.
- **Com o sangue:** debaixo de chuva, as manchas de sangue somem mais rápido.
- **Som:** não temos som de chuva. Proposta: um loop de chuva CC0 (como o fuzil), com o volume subindo junto com a chuva. Se não houver um bom, gero ruído filtrado por script.
- **Teste:** uma tecla de teste liga e desliga a chuva na cena, como `[` e `]` fazem com a hora.
- Os números ficam no topo, com `[TESTE]`. A decisão da chuva aleatória entra no `decisions.md`.

## Fase 8: HUD de vida e índole (PixelLab)

Hoje a HUD (`src/ui/Hud.tsx`, estilos em `src/styles.css`) é texto e duas barras CSS lisas: "Vida" vermelha e "Índole" amarela, mais a linha de munição.

**Referência:** a HUD do X-Men: Mutant Apocalypse (o Gambit). Um ícone redondo à esquerda, um quadro de metal com a barra comprida, o nome em letras vermelhas com contorno embaixo.

**Composição proposta** (no canto de cima, à esquerda; ~200 x 48 px de arte, ampliada 2x ou 3x com `image-rendering: pixelated`):

```
 ┌────┐ ╔════════════════════════╗
 │rosto│ ║██████████████░░░░░░░░░░║  vida (vermelha)
 │Kael │ ╚════════════════════════╝
 └────┘  ⚖ ╔══════════════════════╗
  KAEL      ║████████████░░░░░░░░░░║  índole (cor da faixa: ver abaixo)
            ╚══════════════════════╝
```

- **Rosto:** um ícone de ~24 x 24 px do Kael, tirado do `player_portrait.png` (o retrato das falas) com o PixelLab, olhando para o lado e não para a câmera, como manda o padrão de sprites.
- **Nome "KAEL":** letras de pixel vermelhas com contorno escuro, como o "GAMBIT" da referência. Uso a `pixelify_sans.ttf` que já temos ou desenho as 4 letras no PixelLab.
- **Molduras das barras:** metal azul-acinzentado com rebites, como na referência, desenhadas no PixelLab (`create_ui_asset`). O miolo da barra (a parte que enche e esvazia) fica em CSS ou canvas, não no PNG, para encher pixel a pixel sem esticar a arte.
- **Barra de vida:** vermelha com um brilho de 1 px em cima. Ao levar dano, a parte perdida fica branca um instante e depois esvazia, como nos jogos de luta.
- **Barra de índole:** o ícone da **balança** (justiça) fica à esquerda, também do PixelLab. Proposta: a cor da barra muda com o valor, dourada no alto e vermelha escura no fim, e a balança pende para um lado quando a índole está baixa (dois quadros do ícone).
- **Paleta:** a HUD pode ter cores fora da paleta do Kael (é interface), mas fica com poucas cores, no estilo de 16 bits.

**Processo no PixelLab:** gero 2 ou 3 opções de cada peça (moldura, rosto, balança), mostro lado a lado e você escolhe. Depois limpo as peças (contorno, cores, alinhamento ao pixel) e guardo em `assets/ui/hud/`, com os brutos em `assets/ui/hud/drafts/`.

## Fase 9: seletor de arma e pentes coloridos (PixelLab)

Fica no canto de cima, à direita, no lugar da linha de texto de munição de hoje.

```
 ┌──────────┐
 │  [punho] │   sem arma: só o punho
 └──────────┘

 ┌──────────┐  ▮▮▮▮▮▮▯▯   pente: 8 balas, vermelhas (letal) ou azuis (não letal)
 │ [pistola]│  ▮ 4  ▮ 6   reserva: pente vermelho 4, pente azul 6 (o tipo em uso fica destacado)
 └──────────┘
```

- **Ícones:** o punho e a pistola (a Colt do Kael, de lado), ~32 x 20 px, no PixelLab. Moldura no mesmo metal da HUD de vida.
- **Troca (tecla 1):** o ícone gira para o outro, numa animação curta (de 150 a 200 ms) que lembra a do GTA. Proposta: os dois espaços aparecem lado a lado por ~1 s, com o atual destacado, e depois só o atual fica.
- **Pentes:** um ícone de pente **vermelho** (letal) e um **azul** (não letal), do PixelLab. O pente na arma aparece como balas uma ao lado da outra, da cor do tipo em uso. A reserva de cada tipo mostra o ícone do pente com o número.
- **Troca de bala (Q):** o pente em uso pisca e troca de cor. Durante a recarga, as balas voltam uma por uma, acompanhando o tempo da recarga.
- **Sem munição:** o pente vazio fica cinza, piscando, como o "mag empty" de hoje.

**Código:** a HUD continua só lendo os eventos `hud:*` (`hud:life`, `hud:morale`, `hud:ammo`, `hud:weapon`). Não precisa de evento novo, só, talvez, um `hud:hit` para o branco da vida. Os textos "Vida", "Índole", "Pistola" e "Desarmado" saem da tela, mas ficam no i18n para acessibilidade (`aria-label`).

## Ordem e entrega

A ordem é 1, 5, 6, 2, 8, 9, 3, 4 e 7 (a HUD passou para antes, a pedido do usuário). **Uma fase por vez: só passo para a seguinte com o aval do usuário.** Primeiro vêm as trocas pequenas (a 6 antes da 2, porque a recarga agachada usa o tempo novo), depois a arte, e por fim as features novas. Em cada fase rodo `npm run typecheck` e testo no navegador. No fim, atualizo o `decisions.md` (decisões novas com data e fonte, e o histórico) e o `handoff.md`.

## Perguntas para o usuário

Nenhuma em aberto. As peças da HUD saem do PixelLab em opções, para o usuário escolher.
