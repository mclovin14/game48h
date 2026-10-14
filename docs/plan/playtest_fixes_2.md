# Plano: correções da segunda jogada (controles, chuva, sombras)

**Status em 13/10/2026:** plano aprovado com as respostas abaixo. **Fase 1 feita** (Opções → Controles em `src/ui/Controls.tsx`, dica em `src/ui/Toast.tsx`), typecheck ok e conferida no navegador em 1280x720 e 960x540; aprovada. **Fase 2 feita** (chuva em 0,15; nos finais baixa para 40% e some na ilustração; `Rain.quiet()`, passos `call` em `ending.ts`), typecheck ok e volume medido no navegador nos dois finais. **Fase 3 feita** (`src/game/world/Shadows.ts`: elipse desenhada num Graphics, sem textura no Boot; largura lida do quadro), typecheck ok e conferida com render ampliado (parado, pulando, agachado, policiais, deitado). **Fases 2 e 3 aprovadas pelo usuário** (13/10/2026), testadas juntas: nada pendente. **Plano completo.** Cenários e resultados em `docs/tests.md`, seção 8. Regra do usuário: uma fase por vez, parar ao fim de cada uma e esperar o aval.

## Pedido do usuário (13/10/2026)

1. **(O mais importante)** A caixa com os controles que aparece ao começar o jogo (print do usuário: "Cena de teste. A/D ou ←/→: andar...") não deve mais aparecer. Os controles vão para o menu de **Opções**, num item **Controles**, como uma **lista de teclas**.
2. O som da chuva fica alto demais em certo momento, principalmente no fim do jogo (na cutscene dos dois finais), a ponto de ficar ensurdecedor.
3. Uma sombra redonda nos pés do Kael, dos policiais e dos mercenários.

## O que a investigação achou

- **Controles:** a caixa vem de `begin()` em `src/game/scenes/Test.ts:319`, que emite `dialog:open` com o texto `game.controls` (`src/i18n/pt_br.ts:58` e `en.ts`) na primeira vez da sessão (`registry.controlsShown`). O texto ainda diz "do entardecer à noite em **8 minutos**", mas o ciclo agora é de 3 min. O menu de Opções (`src/ui/Options.tsx`) é o mesmo no título e na pausa, com as linhas música, efeitos, tela cheia, língua e voltar.
- **Chuva alta:** medi o volume dos arquivos.
  - A chuva (`rain_loop.ogg`) tem -17,6 LUFS e toca com ganho de 0,5, o que dá cerca de **-23,6 LUFS**.
  - A música (`ost_level_1.mp3`) tem -11,4 LUFS e toca com ganho de 0,15, o que dá cerca de **-27,9 LUFS**.
  - Ou seja, a chuva cheia já fica uns **4 dB acima da música** durante o jogo.
  - Nos finais, o `Cutscene` abaixa a música: no feliz para 60% (`HAPPY_MUSIC`), e no triste para **zero** (`ending.ts:51`). A chuva continua cheia, porque o final é sempre de noite, e sobra sozinha. É por isso que ela fica ensurdecedora no fim.
- **Sombras:** não existem hoje. O Kael, os policiais, os mercenários e a Adriana são `Humanoid` (`src/game/anims/humanoid.ts:223`), com os pés na linha do chão. No pulo, a cena move o sprite para cima.

## Fase 1: controles no menu de Opções

- Tira a caixa de controles do começo da fase: sai o `dialog:open` de `begin()`. No lugar, uma **dica curta** (pop-up pequeno no alto da tela, ~4 s [TESTE], entra e some em fade, sem pausar o jogo): "Esc → Opções → Controles". Uma vez por sessão (`controlsShown`).
- Nas Opções (título e pausa), entra a linha **Controles** antes de "Voltar". Enter ou clique abre a tela de controles, e Esc ou "Voltar" retorna às Opções.
- A tela de controles é uma lista em duas colunas, **tecla | ação**, separada em grupos:

```
MOVIMENTO
  A / D  ou  ← / →     andar
  Shift (segure)       correr
  Espaço, W ou ↑       pular
  S, ↓ ou Ctrl         agachar
COMBATE
  1                    sacar / guardar a arma
  Botão direito        sem arma: combo (jab, direto, chute)
                       com arma: mirar (segure)
  Botão esquerdo       atirar
  R                    recarregar
  Q ou roda do mouse   bala letal / não letal
JOGO
  Esc                  pausa e opções
TESTE (só na cena de teste)
  F1   aparência dos policiais e seed
  K    testa a morte do Kael
  C    zona morta da câmera
  [ ]  volta / avança o relógio
  N    liga / desliga a chuva
```

- As dicas de jogo do texto antigo saem da lista, porque ela fica só com teclas. São elas: "o ! vermelho avisa quem vai atirar", "o nocauteado solta munição" e "matar mercenário não tira índole".
- Textos novos em `pt_br.ts` e `en.ts`. A chave `game.controls` sai.
- Arquivos: `src/ui/Options.tsx`, um `src/ui/Controls.tsx` novo, `src/i18n/*`, `src/game/scenes/Test.ts` e o CSS dos menus.
- Teste: abrir os controles pelo título e pela pausa, navegando por teclado e mouse, e confirmar que nada aparece ao começar a fase.

## Fase 2: volume da chuva

- **Volume base:** `VOLUME.rain` cai de 0,5 para **0,15** [TESTE]. Com isso a chuva cheia fica em cerca de -34 LUFS, uns 6 dB abaixo da música: vira fundo, sem cobrir a trilha.
- **Nas cutscenes dos finais:** a chuva baixa junto com a música, até **40%** do volume [TESTE], em fade, quando a cutscene começa; quando entra a ilustração do final, **some de vez** (fade até zero).
  - O passo de ilustração do `Cutscene` já tem o campo `music`. Entra um campo `rain` no mesmo passo, ou um evento que a `Rain` escuta.
  - No final triste, que tira a música, a chuva fica baixa e constante, como ambiente.
- **Ao voltar para o título:** a chuva já está muda (calou na ilustração), e o jogo é destruído ao voltar, então nada fica tocando no menu. Pulando o final com Esc, ela está em 40% e para quando o jogo fecha.
- O som continua seguindo o volume de **efeitos** das Opções.
- Teste: forçar a chuva com N, jogar até os dois finais e medir no navegador o volume aplicado ao loop.

## Fase 3: sombras nos pés

- Cada `Humanoid` com sombra ganha uma **elipse de pixel duro** (sem borda borrada), preta com alfa de ~0,35 [TESTE]. Fica embaixo dos pés, na linha do chão, e atrás do personagem.
- O formato vem de uma textura gerada uma vez no `Boot`, por exemplo 30x6 px [TESTE], sem arte do PixelLab.
- A sombra segue o x do personagem e fica sempre no chão:
  - **No pulo**, encolhe e clareia conforme a altura.
  - **Deitado** (morte e nocaute), fica mais larga, do tamanho do corpo no chão.
  - **Some** junto com o personagem quando ele sai de cena.
- Quem recebe sombra: Kael, Adriana, policiais e mercenários.
- A sombra fica no chão à noite também. Ela é preta com alfa, então não precisa de tinta da luz ambiente.
- Arquivos: `src/game/anims/humanoid.ts` (ou um `src/game/world/Shadow.ts` novo), `src/game/scenes/Boot.ts` e as chamadas em `Test.ts`, `Waves.ts` e `BossFight.ts`.
- Teste: render ampliado do Kael parado, pulando e agachado, e de um policial e um mercenário caídos. Conferir que a sombra não passa na frente dos pés.

## Ordem proposta

**1 → 2 → 3.** Os controles vêm primeiro porque o usuário disse que são o mais importante. A chuva é uma correção pequena. As sombras pedem mais ajuste visual.

## Respostas do usuário (13/10/2026)

1. A **Adriana** também ganha sombra.
2. As teclas de teste entram na lista, num grupo **Teste**.
3. Sem a caixa inicial, mas com uma **dica curta** no começo: um pop-up que aparece rapidinho e some (ex.: "Esc → Opções → Controles").
4. Nos finais, a chuva **baixa** quando a cutscene começa e **some de vez** quando aparece a ilustração.
