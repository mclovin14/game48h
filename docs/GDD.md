# Kael: Game Design Document

Versão 0.3, 11/10/2026 (código: estrutura e cena de teste).
Fontes: `decisions.md`, `story.md` e os sprites em `assets/player/`. Se este documento divergir do `decisions.md`, vale o `decisions.md`.

Como ler as marcações:
- **[DECIDIDO]** é fixo.
- **[EM ABERTO]** depende de resposta do usuário.
- **[TESTE]** é um número provisório, que só se fecha jogando.
- **[PROPOSTA]** é uma sugestão desta análise, ainda não aprovada.

---

## 1. Visão geral

| Item | Definição |
|---|---|
| Título provisório | Kael |
| Gênero | Metroidvania de ação, vista lateral **[DECIDIDO]** |
| Plataforma | Navegador **[DECIDIDO]** |
| Arte | Pixel art, sprites feitos no PixelLab **[DECIDIDO]** |
| Tom | Ação pura, frenética **[DECIDIDO]** |
| Referências | Metal Slug (inimigos chegando um de cada vez), Red Dead (sistema de moral), Super Mario World (a Adriana como objetivo, no estilo Peach) |

**Proposta em uma frase.** Um policial sozinho, com uma pistola, atravessa cinco quadras de barricadas da própria polícia para resgatar a noiva. A cada tiro ele escolhe entre matar ou só derrubar.

**O que o jogador deve sentir.** Um homem só contra uma polícia inteira, sem parar.

### Pilares

1. **Ação frenética:** combate constante e curto, sem pausa longa de texto.
2. **Escolha moral em cada tiro:** bala letal ou não letal, com custo visível na barra de índole.
3. **Escassez:** munição limitada, que é reposta pelos inimigos derrotados.
4. **História contada pelo jogo:** no máximo uma mensagem de texto por quadra. O resto aparece em jogo.

---

## 2. História

### Premissa [DECIDIDO]

A Adriana é sequestrada por mercenários. Ela é noiva do Kael e filha do governador de Florentins. O delegado Geraldo, chefe do Kael, tira o Kael do caso por envolvimento emocional. O Kael desobedece e vai sozinho até o prédio na Capital, atravessando cinco quadras.

### O que o jogador ainda não sabe [DECIDIDO]

- Foi o Geraldo quem contratou os mercenários, para extorquir o governador e aplicar um golpe nele.
- O governador também é corrupto.
- Boa parte da polícia e do exército está comprometida.

### Personagens

| Nome | Papel | Situação |
|---|---|---|
| **Kael** | Protagonista, policial. Começa só com pistola e distintivo, sem nenhuma vantagem policial. | Sprites em produção |
| **Adriana** | Noiva do Kael e objetivo do resgate. Não tem arco próprio. | Sem arte |
| **Geraldo** | Delegado e mandante do sequestro. Não aparece no prédio da Capital. | Sem arte |
| **Roberto** | Tenente, braço direito do Geraldo, corrupto. Chefe da quadra 1. | Sem arte |
| **Governador** | Pai da Adriana. Corrupto. | Sem nome, sem arte |
| **Policiais** | Inimigos comuns das barricadas. Três tipos: negro, branco e asiático. | Policial master pronto, cabeças aguardando aprovação (ver 6.5) |
| **Mercenários** | Contratados pelo Geraldo. | Sem arte |

**[EM ABERTO]**
- O nome da cidade.
- O papel da organização terrorista.
- Quem sabe que o Geraldo é o mandante, e quando a corrupção é revelada.
- Se os policiais das barricadas são cúmplices ou só cumprem ordens.
- Se existe um aliado dentro da polícia.

Os detalhes da narrativa estão em `story.md`.

---

## 3. Gameplay

### 3.1 Loop principal

Entrar na quadra, enfrentar a barricada, escolher letal ou não letal, recolher a munição deixada pelos inimigos, enfrentar o chefe e avançar para a próxima quadra.

### 3.2 Controles do Kael

| Ação | Situação | Animação |
|---|---|---|
| Ficar parado (com ou sem arma) | [DECIDIDO] | `idle_east`, `idle_gun_east` |
| Andar (com ou sem arma) | [DECIDIDO] | `walk_east`, `walk_gun_east` |
| Mirar | [DECIDIDO] | `aim_gun_east` |
| Atirar | [DECIDIDO] | `shoot_gun_east` |
| Morrer | [DECIDIDO] | `death_east` |
| Pular, dash, agachar, trocar de bala, recarregar | [EM ABERTO] | ainda não feitas |

**Teclado e mouse [DECIDIDO]:** botão esquerdo atira, botão direito mira (segurar), tecla 1 saca ou guarda a arma. O Kael começa sem arma. Clicar para atirar sem mirar levanta a arma e atira em seguida.

Também está **[EM ABERTO]** se haverá gamepad. Andar com A/D ou setas e trocar de bala com Q ou a roda do mouse são **[TESTE]**.

### 3.3 Combate e arsenal [DECIDIDO]

**Arma.** No começo, só uma pistola. Ela dispara dois tipos de bala:
- **Letal:** mata. Cada policial morto derruba a barra de índole.
- **Não letal:** neutraliza sem matar, e o Kael continua herói.

**Munição.**
- A munição é limitada.
- Cada policial nocauteado deixa um loot de balas, que pode ser letal ou não letal. A chance inicial é **70% letal / 30% não letal [TESTE]**.
- A quantidade de balas por loot e a munição inicial também são **[TESTE]**.
- **[EM ABERTO]** Se o policial morto com bala letal também deixa loot.

**Tensão de design.** Como o loot dá mais bala letal, o jogador é empurrado a matar. Ser herói exige economizar a bala não letal. Essa tensão é o centro do jogo.

### 3.4 Barra de índole [DECIDIDO]

- É um medidor moral no estilo Red Dead.
- Cai quando o Kael mata policiais.
- Índole baixa no final pode levar a um final triste.

**[EM ABERTO]**
- O formato do final triste.
- Os efeitos da índole baixa durante o jogo.
- O peso de matar o Roberto na barra.

**[TESTE]** Quantas mortes fazem a barra mudar de faixa.

### 3.5 Inimigos

**Policiais comuns [DECIDIDO]**
- São três tipos: um negro, um branco e um asiático.
- A diferença entre eles é **só visual**. Os três usam as mesmas animações e o mesmo comportamento.
- Usam farda própria, com silhueta diferente da do Kael, para o jogador distinguir herói e inimigo de relance.
- Chegam um de cada vez nas barricadas, no estilo Metal Slug.
- Reagem aos dois tipos de bala:
  - **letal:** animação `death_east`, com sangue;
  - **não letal:** animação `knockout_east`, sem sangue. É o policial nocauteado que deixa o loot de munição (seção 3.3).
- Levam dano sem cair com a animação `hurt_east`.

**Na cena de teste [TESTE]:** o policial leva 2 tiros. O primeiro toca `hurt_east`; o segundo toca `death_east` (letal, tira 1 ponto da índole) ou `knockout_east` (não letal). Ele ainda não atira de volta.

**[EM ABERTO]**
- Vida de cada policial, ou seja, quantos tiros até cair.
- Se algum tipo vai ganhar comportamento próprio (atira mais rápido, tem mais vida). Hoje a decisão é que não, e isso pode mudar no teste.
- Se as cabeças podem ser misturadas em mais variações no futuro (cada variante nova custa só uma cabeça).

**[TESTE]** Cadência de tiro, distância de ataque e tempo entre a chegada de um policial e o próximo.

### 3.6 Vida e derrota

- Tanto o Kael quanto o chefe têm barra de vida **[DECIDIDO]**.
- O que acontece quando a vida do Kael acaba **[EM ABERTO]**: recomeça a luta, recomeça a quadra ou outra coisa.
- A animação de morte já está pronta.

### 3.7 Progressão

Fica **[EM ABERTO]** como o Kael ganha força: equipamento, habilidades, itens ou favores. Isso define o "vania" do metroidvania, porque é o que trava e destrava caminhos.

---

## 4. Estrutura do jogo

Cinco quadras até o prédio na Capital **[DECIDIDO]**. Cada quadra tem barricadas mais fortes que as da anterior.

### Quadra 1 [DECIDIDO]

1. **Mensagem de abertura:** imagem estática com texto. O rascunho está em `story.md`, seção 5, e ainda não foi aprovado.
2. **Parte 1, tutorial:** o jogador aprende os controles. O que exatamente o tutorial ensina está **[EM ABERTO]**.
3. **Parte 2, barricada:** policiais chegam um de cada vez, no estilo Metal Slug.
4. **Chefe, Roberto:** ele reconhece o Kael e os dois trocam tiros. Vence quem esvaziar a barra de vida do outro, e o jogador escolhe matar ou não o Roberto.
5. **Cutscene do fim:** a posição em relação ao chefe e o texto estão **[EM ABERTO]**.

### Quadras 2 a 5 [EM ABERTO]

- O tipo de bloqueio de cada quadra: combate, infiltração, item ou contato.
- Os chefes.
- A consequência de desistir de uma barricada.

### Final

- Chegar ao prédio na Capital, onde estão a Adriana e figurões do alto escalão **[DECIDIDO]**.
- A cena do resgate e o final triste **[EM ABERTO]**.

---

## 5. Interface e HUD

O HUD é feito em React, por cima do jogo. Os elementos mínimos, que já decorrem das decisões, são:
- barra de vida do Kael;
- barra de índole;
- contador de munição, separado por tipo (letal e não letal), com o tipo selecionado destacado;
- barra de vida do chefe, só durante a luta.

**Já implementado na cena de teste:** vida, índole, arma na mão ("Pistola" ou "Sem arma") e munição letal e não letal, com o tipo selecionado em destaque. O HUD não captura o mouse, então os cliques vão para o jogo.

**Menus:** título e pausa (Continuar, Reiniciar cena, Voltar ao título) já existem. Caixa de diálogo também, fechando com clique, Enter ou Espaço; o jogo pausa enquanto ela está aberta.

**[PROPOSTA]** Falta o menu de fim de jogo.

---

## 6. Arte

### 6.1 Direção

- Pixel art em vista lateral.
- Os sprites principais vêm do PixelLab.
- A arte de apoio vem do Gemini ou do GPT, sempre pixelizada antes de usar.
- As referências ficam em `references/kael/` e `references/environments/`.

### 6.2 Padrão de sprite do Kael

| Item | Valor |
|---|---|
| Tamanho do quadro | 128x128, fundo transparente |
| Direção | East (o jogo espelha para West) |
| Linha do chão | y=120 sem arma, y=121 com arma |
| Paleta | 14 cores fixas, tiradas de `player_base_east.png` |
| Cores de efeito | Flash do tiro, luz quente e sangue `(176,32,36)` e `(110,16,24)`, fora da paleta e de propósito |
| Visual | Jaqueta preta, camiseta branca, jeans, tênis branco, cabelo castanho |

### 6.3 Animações prontas

| Animação | Quadros | O que mostra |
|---|---|---|
| `idle_east` | 8 | Parado, sem arma |
| `idle_gun_east` | 8 | Parado, com a pistola |
| `walk_east` | 8 | Andando, sem arma |
| `walk_gun_east` | 8 | Andando, com a pistola |
| `aim_gun_east` | 8 | Sai do idle com arma e levanta a pistola para mirar |
| `shoot_gun_east` | 8 | Recuo, flash no rosto e na roupa, bala e fumaça |
| `death_east` | 30 | Toma o tiro, leva a mão ao peito, olha a mão, cai de joelhos, cai de bruços e fica no chão, com uma poça de sangue crescendo |

### 6.4 Animações que faltam

**Kael [PROPOSTA]**, em ordem de prioridade para a quadra 1:
1. Tiro não letal (variação de cor do projétil e do flash).
2. Dano levado.
3. Pulo.
4. Recarregar ou trocar de bala.
5. Andar enquanto mira.

**Outros:**
- variantes do policial a, b e c (ver 6.5);
- Roberto;
- loot de munição;
- cenário da quadra 1, em tileset e parallax.

### 6.5 Policial inimigo

**Como é feito.** Para não gerar cada animação três vezes, o policial tem um **master** (corpo e farda) e três **cabeças**.
- O master é gerado uma vez a partir das animações do Kael, trocando a roupa (`transfer_outfit`). Os movimentos ficam iguais aos do Kael, quadro a quadro.
- Cada variante troca a pele e o cabelo do master e cola a cabeça própria nos quadros em pé. Nenhuma chamada nova ao PixelLab por variante.
- O plano completo está em `plan/police_variants.md`. Os scripts são `tools/build_police_master.py` e, na próxima fase, `tools/build_police_variants.py`.

**Padrão.** O mesmo do Kael: 128x128, virado para East, chão em y=121 com arma e y=120 caído. A paleta é própria, com 24 cores, e fica em `assets/enemies/police/palette_master.json`. Visual: farda azul-marinho, quepe, distintivo dourado, cinto preto e sapato preto.

**Animações do master (prontas, em `assets/enemies/police/master/`):**

| Animação | Quadros | O que mostra |
|---|---|---|
| `idle_gun_east` | 8 | Parado, com a pistola |
| `walk_gun_east` | 8 | Andando, com a pistola |
| `aim_gun_east` | 8 | Levanta a pistola para mirar |
| `shoot_gun_east` | 8 | Recuo, flash, bala e fumaça (mesmo efeito do Kael) |
| `death_east` | 30 | Morte com sangue e poça, mesmo movimento do Kael |
| `hurt_east` | 6 | Tranco e passo para trás ao levar tiro sem cair |
| `knockout_east` | 8 | Bala não letal: é jogado para trás, larga a arma e cai de costas, sem sangue |

Não há idle nem walk sem arma: o policial está sempre armado.

**Variantes:**

| Variante | Visual | Situação |
|---|---|---|
| `police_a` | Negro, pele marrom-escura, cabelo preto | Cabeça gerada, aguardando aprovação |
| `police_b` | Branco, pele clara, cabelo loiro | Cabeça gerada, aguardando aprovação |
| `police_c` | Asiático, pele clara e quente, cabelo preto liso | Cabeça gerada, aguardando aprovação |

A prévia das cabeças está em `assets/enemies/police/drafts/heads_options.png`.

**No Phaser:** `src/game/anims/humanoid.ts` já registra as animações para qualquer personagem, e o master é usado na cena de teste. Espelha para West com `scaleX` = -1. **[PROPOSTA]** Quando as variantes existirem, uma fábrica `Police` escolhe a variante (a, b ou c) no spawn.

---

## 7. Áudio

Tudo **[EM ABERTO]**.

**[PROPOSTA]** Os efeitos mínimos para a quadra 1:
- tiro letal e tiro não letal;
- impacto;
- pegar munição;
- passos;
- morte.

Também falta uma faixa de ação por quadra.

---

## 8. Tecnologia

| Camada | Escolha | Situação |
|---|---|---|
| Jogo | Phaser 4, física Arcade | [DECIDIDO] |
| Interface | React 19 (menus, HUD e diálogos) | [DECIDIDO] |
| Build | Vite | [DECIDIDO] |
| Linguagem | TypeScript | [DECIDIDO] |
| Resolução de referência | 960x540, escalada para caber na janela | [DECIDIDO] |
| Sprites | PixelLab, exportando spritesheet PNG | [DECIDIDO] |
| Vídeos | Remotion, para trailer, cutscenes e canal | [DECIDIDO] |

Também está **[EM ABERTO]** onde o jogo vai ser publicado. Para rodar: `npm install` uma vez e depois `npm run dev`.

### 8.1 Arquitetura do código

- O React desenha menus, HUD e diálogos por cima do canvas do Phaser.
- Os dois lados só conversam por um barramento de eventos tipado (`src/game/events.ts`). Se alguém emitir um evento com nome ou dados errados, o TypeScript acusa antes de rodar.
- Todas as animações de humanoides (Kael e policiais) ficam numa tabela única (`src/game/anims/humanoid.ts`), com duração por quadro e linha do chão.
- O detalhe das regras de código está no `handoff.md`, seção "Arquitetura do código".

---

## 9. Análise do estado atual

**O que está pronto.**
- Premissa, elenco principal, sistema moral e arsenal estão bem definidos.
- O Kael tem o conjunto de animações para andar, mirar, atirar e morrer.
- O policial master tem 7 animações, inclusive dano e nocaute.
- Existe código: React + Phaser + Vite em TypeScript, com uma cena de teste jogável (andar, sacar, mirar, atirar, trocar de bala, policial que leva dano, morre ou é nocauteado, HUD e pausa).

**Riscos.**
1. **A cena de teste ainda não tem combate de verdade.** O policial não atira de volta e não há loot, então os números de [TESTE] (vida, munição, loot) ainda não podem ser validados.
2. **A progressão está em aberto.** Sem habilidades que travam caminhos, o jogo é um run and gun linear, não um metroidvania. Essa é a decisão de design que mais trava o resto.
3. **O escopo é grande:** cinco quadras, vários chefes e um final com variação moral. Vale fechar a quadra 1 inteira, jogável, antes de desenhar as outras.
4. **Inimigos quase prontos.** O policial master tem as 7 animações; faltam aprovar as cabeças e montar as três variantes. Roberto e mercenários ainda não têm arte.

**Próximos passos [PROPOSTA].**
1. ~~Criar o projeto e a cena de teste~~ (feito em 11/10/2026).
2. Aprovar as cabeças e montar as variantes do policial.
3. Fazer o policial atacar, implementar o loot de munição e testar os valores de [TESTE].
4. Decidir a progressão do Kael, que é o item 10 do `decisions.md`.
5. Montar a quadra 1 completa, do tutorial ao Roberto.

---

## 10. Pendências

A lista completa e ordenada por impacto está em `decisions.md`, seção 2, com 24 itens. Os que mais travam a produção agora são:
- **Progressão**, item 10.
- **Tutorial**, item 17.
- **Controles que faltam** (pulo, dash, gamepad), item 20.

Resolução e stack foram decididas em 11/10/2026 (itens 21 e 23).
