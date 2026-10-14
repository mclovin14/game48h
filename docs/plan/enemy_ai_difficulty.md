# Plano: IA mais difícil (policiais e mercenários)

**Status em 13/10/2026:** o usuário pediu a parte dos **policiais** da fase 1 ("os guardas estão demorando muito para atirar... dar mais de um ou dois tiros contínuos"). **Fase 1 (policiais) feita**, aguardando o teste do usuário:
- sequência de 2 a 3 tiros, um a cada 300 ms (`volley`, `volleyGapMs`), como o tiro contínuo do Kael;
- entre as sequências, o policial segura a arma apontada e espera só 0,8 s (`volleyPauseMs`), sem novo aviso;
- ele abaixa a arma para recarregar (pente de 8), quando o Kael sai do alcance ou quando o Kael muda de postura (para agachar ou levantar junto);
- `fireMs` (espera depois de abaixar a arma) caiu de 1800 para 1300 ms.

Medido no navegador: antes, 1 tiro a cada ~3,4 s; agora, 2 a 3 tiros seguidos a cada ~1,5 s, até o pente acabar. **Segunda rodada (13/10/2026, pedido do usuário: "policiais ainda mais espertas... adivinharem o que o player vai fazer... demorando muito para apontar a arma... muito previsíveis"):** fases 2 e 3 feitas **só nos policiais** (IA esperta, `smart` no arquétipo `patrol`), aguardando o teste do usuário:
- **Mais rápidos:** mira e agachar 2x mais rápidos; aviso da mira sorteado entre 150 e 380 ms (era 450 fixo); espera com a arma abaixada de 800 ms; sequência de 1 a 4 tiros (280 ms entre eles); pausa de 550 ms com a arma apontada.
- **Menos previsíveis:** a espera entre ciclos varia de 40% a 160% (era ±20%), e o tamanho da sequência e o aviso também são sorteados.
- **Adivinham o Kael:** `KaelHabits` (`Gunner.ts`) lembra os pulos e as agachadas recentes do Kael (meia-vida de 10 s). A cada ciclo, o policial dá um palpite: se o Kael costuma agachar, ele agacha e atira baixo (pega em pé e agachado); se costuma pular, fica em pé e atira alto (o tiro alto acompanha o Kael no ar). Sem histórico, agacha 35% das vezes.
- **Desviam da bala do Kael** (45% de chance, reação de 90 a 180 ms, espera de 1,4 s entre desvios): da bala alta (Kael em pé) agacha; da baixa (Kael agachado) pula no lugar, 2x mais rápido e 100 px de altura, calculando a hora para estar no alto quando ela chegar. Agachado depois do desvio, responde o tiro em até 250 ms.
- **Aproveitam as aberturas:** Kael recarregando, atiram logo; Kael sem arma chegando para o combo (a menos de 130 px), atiram sem aviso; atirando baixo, esperam o Kael pousar do pulo.

A parte dos mercenários (fase 1) segue sem fazer: eles continuam com a IA simples. Regra do usuário: uma fase por vez, parar ao fim de cada uma e esperar o aval.

## Pedido do usuário (13/10/2026)

> "melhore a inteligência artificial dos guardas. E dos mercenários porque está muito fácil de chegar ao final do jogo então eu acho que ele os guardas poderiam dar mais tiros contínuos a, ali alguns tiros contínuos saber desviar algo de bala por exemplo se eu dar um tiro eles já entender que eles podem abaixar e por aí vai uh, e vice-versa né"

Três pedidos:

1. Mais tiros seguidos.
2. Desviar das balas do Kael, por exemplo abaixando quando ele atira.
3. "E vice-versa" (interpretação na seção "Perguntas").

## Como a IA funciona hoje

A IA é uma só para os dois inimigos: `Gunner` (`src/game/actors/Gunner.ts`). O que muda entre policiais e mercenários são o arquétipo e o kit.

- **Ciclo do tiro:**
  - O inimigo espera `fireMs`, com variação de ±20%.
  - Depois mira e segura a mira por `aimHoldMs`. Esse é o aviso para o jogador.
  - Então atira **uma vez**, abaixa a arma e volta a esperar.
  - O policial (`Police.ts`, arquétipo `patrol`) dá 1 tiro de pistola a cada ~1,8 s, mais 0,45 s de mira.
  - O mercenário (`Mercenary.ts`) dá uma rajada de 3 balas a cada ~1,6 s, mais 0,32 s de mira.
- **Revezamento dos mercenários** (`BossFight.ts`): só um mira por vez, e o próximo espera 450 ms (`TURN_GAP_MS`) depois da rajada do outro. Com três mercenários, quase sempre só um ameaça o Kael.
- **Reações que já existem:**
  - Ao chegar, às vezes o inimigo pula para a frente.
  - Quando o Kael começa a mirar nele, às vezes pula para a frente (15% no policial, 20% no mercenário).
  - Parado, copia a postura do Kael (agacha se ele agachar) para acertar o tiro.
- **O que falta:** o inimigo **não sabe que o Kael atirou**. A bala do Kael (`Bullets.ts`, 1400 px/s) voa reta na altura do cano:
  - **Tiro alto** (Kael em pé): cano a 91 px do chão.
  - **Tiro baixo** (Kael agachado): cano a 73 px.
- **Por que agachar e pular desviam:** a caixa do corpo do inimigo agachado vai até 86 px, então o tiro alto do Kael passa por cima dela. É o mesmo truque que o Kael usa contra eles. O tiro baixo acerta quem está agachado ou em pé, e só o pulo desvia dele.
- **Por que está fácil:** os inimigos atiram pouco, não desviam e, entre um tiro e outro, ficam parados como alvo.

## Fase 1: mais tiros (pressão)

**Policial: sequência de tiros.**
- Depois do aviso de mira, ele dá de **2 a 3 tiros seguidos**, sem abaixar a arma, com ~220 ms entre eles. Só então abaixa.
- O aviso continua só antes do primeiro tiro, então o jogador ainda tem como reagir.
- Campos novos no arquétipo: `volley: [2, 3]` e `volleyGapMs: 220` [TESTE].
- O pente (8) passa a contar balas, e a sequência para quando o pente acaba.

**Policial: menos espera entre as sequências.** `fireMs` cai de 1800 para 1400 ms [TESTE].

**Mercenários:**
- **2 rajadas seguidas** por vez (`volley: [2, 2]`) [TESTE]. Hoje é uma.
- O revezamento fica mais apertado:
  - **dois podem mirar ao mesmo tempo** (hoje é um);
  - a espera depois de uma rajada cai de 450 para 250 ms [TESTE].
- O pente sobe de 4 para 6 rajadas [TESTE], para eles não recarregarem o tempo todo.

**Dano e precisão:** não mudam nesta fase. Medimos primeiro só o efeito do volume de tiro.

**Arquivos:** `Gunner.ts` (o estado `shooting` emenda o próximo tiro), `Police.ts`, `Mercenary.ts` e `BossFight.ts` (`canAim` passa a aceitar dois de cada vez).

## Fase 2: desviar da bala do Kael

**Aviso do tiro.** A cena (`Test.ts`, em `shoot()`) passa a avisar os inimigos sempre que o Kael atira, informando se o tiro é alto (em pé) ou baixo (agachado), de onde sai e para que lado vai.

**Quem pode desviar.** Cada inimigo que está na frente da bala decide se desvia, com chance e tempo de reação:
- a chance é `dodgeChance`: policial 35%, mercenário 50% [TESTE];
- o tempo de reação é `dodgeReactMs`: 120 a 200 ms [TESTE];
- a bala anda 1400 px/s, então a 200 px ela chega em ~140 ms. **De perto não dá tempo de desviar**, e de longe dá. Isso premia chegar perto ou usar o combo.

**Contra o tiro alto (Kael em pé): agacha.**
- A caixa encolhe para 86 px, e a bala passa por cima.
- Agachado, o inimigo já fica com o tiro baixo pronto.
- Depois de um tempo ele levanta, pela regra que já existe de copiar a postura do Kael.

**Contra o tiro baixo (Kael agachado): pula no lugar.**
- É um pulo vertical, mais alto que o pulo para a frente: 95 px [TESTE].
- A bala passa por baixo do corpo.
- Só funciona se a bala ainda estiver longe quando ele sai do chão. De perto, o tiro baixo acerta.

**Quando não desvia:**
- No meio da recarga em pé, levando tranco, já pulando ou caído.
- Durante uma espera depois de desviar (`dodgeCooldownMs`, 1,5 s [TESTE]), para não ficar impossível de acertar. Dois tiros seguidos do Kael acertam o segundo.

**Desviar cancela o tiro.** Se ele estava mirando, o desvio cancela o tiro e o ciclo recomeça.

**Arquivos:** `Gunner.ts` (`dodge(shot)`, estado `dodging` ou reuso de `posture` e `jumping`), `Test.ts` e `Waves.ts`/`BossFight.ts` (repassam o aviso).

## Fase 3: "e vice-versa" (lendo o Kael)

Esta fase é a minha proposta para o "vice-versa" (ver "Perguntas"). Os inimigos aproveitam as aberturas do Kael:

- **Kael recarregando:** quem está parado e em alcance corta a espera e atira logo (com o aviso de mira). Recarregar no meio da luta passa a ser arriscado.
- **Kael agachado parado por muito tempo:** o inimigo agacha para atirar baixo, como já faz hoje. Além disso, às vezes **avança pulando** para mudar o ângulo e tirar o Kael da posição.
- **Kael chegando para o combo** (a menos de ~90 px):
  - o policial às vezes **recua** uns passos ou dá um pulo para trás;
  - o mercenário às vezes atira de perto, sem o aviso longo de mira (só 150 ms) [TESTE].
- **Mercenários se reposicionam:** depois de 2 vezes atirando, às vezes andam para outro ponto da arena. Eles não ficam parados como alvo fixo.

**Arquivos:** `Gunner.ts` (o `CopTarget` ganha `reloading` e `near`) e `Test.ts` (`copTarget`).

## Como testar (cada fase)

- `npm run typecheck`.
- No navegador, script de Puppeteer, para medir:
  - quantas balas saem por minuto de um policial e de um mercenário;
  - quantas vezes o desvio acontece e quantas balas do Kael erram por causa dele.
- Jogada do usuário, com o critério "não está mais fácil demais", e o ajuste dos números [TESTE].
- Os cenários entram em `docs/tests.md`, seção 9.
- A decisão vai para `docs/decisions.md` (AJUSTAR EM TESTE), com o histórico.

## Perguntas

1. **"E vice-versa":** entendi como "os inimigos também aproveitam o que o Kael faz", que é a fase 3. Outra leitura possível: o Kael desvia do tiro deles do mesmo jeito que eles desviam do dele. Isso **já existe**: em pé, ele agacha e a bala alta passa; agachado, pula e a bala baixa passa. Qual das duas você quis dizer, ou as duas?
2. **Dificuldade alvo:** subir tudo de uma vez ou fase por fase, jogando entre elas? Minha sugestão: fase por fase, porque as três somadas podem ficar difíceis demais.
3. **Vida do Kael e loot:** ficam como estão (só a IA muda)? Minha sugestão: sim. Se ficar difícil demais, ajustamos os números depois.
