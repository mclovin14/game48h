# Saves Her: Game Design Document

Versão 0.5, 14/10/2026. Corresponde à **versão 0.1 do jogo** (tag `v0.1` no git): a quadra 1 jogável do começo ao fim, do entardecer à noite, com barricadas, mercenários, os dois finais e a tela de game over. Desde a 0.1.2 do jogo, roda também no celular (Android e iOS, deitado), com controle touch.
Fontes: `decisions.md`, `story.md`, `handoff.md` e os sprites em `assets/`. Se este documento divergir do `decisions.md`, vale o `decisions.md`. Os números provisórios ficam no `decisions.md`, seção 3, e os testes feitos em `tests.md`.

Como ler as marcações:
- **[DECIDIDO]** é fixo.
- **[EM ABERTO]** depende de resposta do usuário.
- **[TESTE]** é um número provisório, que só se fecha jogando.
- **[PROPOSTA]** é uma sugestão desta análise, ainda não aprovada.

---

## 1. Visão geral

| Item | Definição |
|---|---|
| Nome | **Saves Her** **[DECIDIDO]** (12/10/2026). Protagonista: Kael |
| Gênero | Metroidvania de ação, vista lateral **[DECIDIDO]** |
| Plataforma | Navegador **[DECIDIDO]** |
| Arte | Pixel art, sprites feitos no PixelLab **[DECIDIDO]** |
| Tom | Ação pura, frenética **[DECIDIDO]** |
| Referências | Metal Slug (inimigos chegando um de cada vez), Red Dead (sistema de moral), Super Mario World (a Adriana como objetivo, no estilo Peach), beat 'em ups antigos (seta de siga em frente), cutscenes dos jogos dos anos 90 |

**Proposta em uma frase.** Um policial sozinho, com uma pistola, atravessa as barricadas da própria polícia para resgatar a noiva. A cada tiro ele escolhe entre matar ou só derrubar.

**O que o jogador deve sentir.** Um homem só contra uma polícia inteira, sem parar.

**Escopo desta versão [DECIDIDO]** (13/10/2026): só a fase atual, a quadra 1, usada de exemplo. A Adriana está no fim da rua, e o Kael a resgata nesta fase. O jogo completo (cinco quadras até a Capital) continua sendo o objetivo.

### Pilares

1. **Ação frenética:** combate constante e curto, sem pausa longa de texto.
2. **Escolha moral em cada tiro:** bala letal ou não letal, com custo visível na barra de índole.
3. **Escassez:** munição limitada, reposta pelos inimigos derrotados.
4. **História contada pelo jogo:** no máximo uma mensagem de texto por quadra. O resto aparece em jogo.

---

## 2. História

### Premissa [DECIDIDO]

A Adriana é sequestrada por mercenários. Ela é noiva do Kael e filha do governador de Florentins. O delegado Geraldo, chefe do Kael, tira o Kael do caso por envolvimento emocional. O Kael desobedece e vai sozinho atrás dela.

### O que o jogador ainda não sabe [DECIDIDO]

- Foi o Geraldo quem contratou os mercenários, para extorquir o governador e aplicar um golpe nele.
- O governador também é corrupto.
- Boa parte da polícia e do exército está comprometida.

### Personagens

| Nome | Papel | Situação |
|---|---|---|
| **Kael** | Protagonista, policial. Começa só com pistola e distintivo, sem nenhuma vantagem policial. | 21 animações prontas (seção 6.3) e retrato |
| **Adriana** | Noiva do Kael e objetivo do resgate. Sem arco próprio. Ruiva de cabelo longo e ondulado, olhos verdes, vestido vermelho e salto preto. | Base, 5 animações e retrato aprovados |
| **Geraldo** | Delegado e mandante do sequestro. Não aparece nesta fase. | Sem arte |
| **Roberto** | Tenente, braço direito do Geraldo, corrupto. Chefe da quadra 1 no jogo completo. | Sem arte |
| **Governador** | Pai da Adriana. Corrupto. | Sem nome, sem arte |
| **Policiais** | Inimigos comuns das barricadas. Três cabeças (negro, branco e loiro, asiático) × três tons de farda. | Prontos, no jogo |
| **Mercenários** | Contratados pelo Geraldo. São os captores da Adriana e os chefes desta fase: três, de fuzil. | Prontos, no jogo |

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

Entrar na quadra, enfrentar as barricadas, escolher letal ou não letal, recolher a munição deixada pelos inimigos, enfrentar os chefes e resgatar a Adriana. A índole no fim decide o final.

### 3.2 Controles [DECIDIDO]

A lista completa fica no jogo, em **Opções → Controles** (título e pausa). Ao começar a fase, só aparece uma dica curta, que some sozinha: "Controles: Esc → Opções → Controles" (13/10/2026).

| Grupo | Tecla | Ação |
|---|---|---|
| Movimento | A / D ou ← / → | andar (vira o Kael, inclusive mirando ou agachado) |
| | Shift (segure) | correr (sprint; para para atirar e recarregar) |
| | Espaço, W ou ↑ | pular para a frente (sem invencibilidade) |
| | S, ↓ ou Ctrl (segure) | agachar (ajoelhado; não anda) |
| Combate | 1 | sacar ou guardar a arma (o Kael começa sem arma) |
| | Botão direito | sem arma: combo (jab, direto, chute); com arma: mirar (segure) |
| | Botão esquerdo | atirar (sem mira, levanta a arma e atira) |
| | R | recarregar |
| | Q ou roda do mouse | trocar entre bala letal e não letal |
| Jogo | Esc | pausa e opções |
| Teste | F1, K, C, [ ], N | aparência dos policiais e seed, morte do Kael, zona morta da câmera, relógio, chuva |

Depois da morte, **Enter** reinicia. **[EM ABERTO]** gamepad e dash.

### 3.3 Combate e arsenal [DECIDIDO]

**Arma.** No começo, só uma pistola (Colt 1911). Ela dispara dois tipos de bala:
- **Letal:** mata. Cada policial morto derruba a barra de índole.
- **Não letal:** nocauteia sem matar, e o Kael continua herói.

**Pente e munição.**
- Pente de **8**, carregado com o tipo selecionado. Trocar de tipo devolve o pente à reserva e recarrega com o outro.
- Tiro contínuo: depois do tiro, o Kael continua mirando e cada clique toca só o recuo.
- O pente vazio recarrega sozinho; **R** recarrega a qualquer momento. Sem bala nenhuma, clique seco.
- A munição é limitada. O policial **nocauteado sempre** solta uma caixa de munição; o **morto** com bala letal solta em **50%** das vezes (13/10/2026). A caixa é 70% letal / 30% não letal **[TESTE]**.

**Corpo a corpo.** Sem arma, o botão direito faz o combo jab, direto e chute. Nos mercenários, o chute tira mais vida **[TESTE]**.

**Pulo e agachar.** O pulo vai sempre para a frente e serve para passar por cima das balas, que voam de verdade e acertam pela caixa do corpo. Agachado (ajoelhado), o Kael fica mais baixo, e o tiro do policial em pé passa por cima. O policial reconhece o Kael agachado, agacha também e atira baixo.

**Tensão de design.** Como a caixa dá mais bala letal, o jogador é empurrado a matar. Ser herói exige economizar a bala não letal. Essa tensão é o centro do jogo.

### 3.4 Barra de índole [DECIDIDO]

- É um medidor moral no estilo Red Dead.
- Cai quando o Kael mata policiais. **Matar mercenário não tira índole.**
- **Finais (12/10/2026):** índole **abaixo de 50%**, final triste (o Kael salva a Adriana, mas morre); **50% ou mais**, final feliz (salva e sobrevive).
- Na HUD, a cor da barra e a balança pendendo mudam com o valor.

**[EM ABERTO]** Os efeitos da índole baixa durante o jogo e o peso de matar o Roberto.
**[TESTE]** Índole máxima e quanto cada morte tira.

### 3.5 Inimigos

**Policiais comuns [DECIDIDO]**
- Cada um é uma combinação de **cabeça + tom de farda** (3 × 3 = 9). A diferença é só visual.
- Nunca aparecem dois iguais seguidos nem na tela ao mesmo tempo (sorteio pela seed; `?seed=` repete a jogada).
- Entram correndo nas barricadas, um de cada vez, em ondas, no estilo Metal Slug.
- Miram rápido, seguram a mira um instante (sorteado) e dão uma sequência de 1 a 4 tiros. Entre as sequências ficam com a arma apontada (~0,5 s). Recarregam depois de 8 tiros, agachados.
- **IA esperta:** leem se o Kael costuma pular ou agachar e escolhem atirar alto ou baixo; desviam da bala do Kael (agacham da alta, pulam da baixa; de perto não dá tempo); atiram logo quando o Kael recarrega ou chega sem arma.
- Copiam a postura do Kael (agacham junto) e às vezes pulam para a frente.
- Reagem aos dois tipos de bala: letal toca `death` (com sangue); não letal toca `knockout`. Levam dano sem cair com `hurt`. Caídos, ficam deitados com a arma solta.

**Mercenários, chefes desta fase [DECIDIDO]**
- Três, de fuzil (rajada de 3), farda tática com balaclava. Guardam a Adriana no fim da rua, com a van.
- Quando o Kael chega à última tela, os três vêm **de uma vez** e cercam o Kael (um por trás). Um mira por vez.
- Cada um tem barra de vida. Também agacham e pulam.

**[EM ABERTO]** Se algum tipo de policial ganha comportamento próprio. **[TESTE]** Vida, dano, cadência, alcance e as ondas de cada barricada.

### 3.6 Vida e derrota

- O Kael e cada mercenário têm barra de vida **[DECIDIDO]**.
- Hoje, com a vida zerada, o Kael morre, a tela escurece com "GAME OVER", "Você perdeu" e uma frase triste, e **Enter** reinicia a cena. O que acontece na derrota no jogo completo segue **[EM ABERTO]**.

### 3.7 Progressão

Fica **[EM ABERTO]** como o Kael ganha força: equipamento, habilidades, itens ou favores. Isso define o "vania" do metroidvania, porque é o que trava e destrava caminhos.

---

## 4. Estrutura do jogo

Cinco quadras até o prédio na Capital **[DECIDIDO]**, cada uma com barricadas mais fortes. Nesta versão, só a quadra 1.

### Quadra 1, como está no jogo

A rua tem 5 telas (4800 px) e vai do entardecer (17:30) à noite (19:30) num ciclo de 3 minutos **[TESTE]**. Lojas e postes acendem piscando, cada um na sua hora. Em metade das jogadas chove no fim da noite.

1. **Abertura:** a mensagem em texto, numa tela preta, letra por letra. Depois a câmera vai até o fim da rua, onde a Adriana está presa por um mercenário. Ela pede socorro ("KAEL! Socorro!", "Eles vão me levar! Me ajuda!"), e o Kael responde ("Aguenta firme. Eu tô indo."). Esc pula.
2. **Barricadas:** duas. Perto de cada uma a câmera trava e os policiais entram em ondas. Quando a última onda cai, a câmera solta e a seta de siga em frente pisca à direita.
3. **Mercenários:** na última tela, a luta com os três.
4. **Final:** pela índole. No feliz, a Adriana corre e abraça o Kael, e entra a ilustração do beijo. No triste, um mercenário caído dá um último tiro, o Kael cai e a Adriana corre até ele; entra a ilustração dela com o Kael no colo, na chuva. Depois, a tela de texto "FIM" leva ao título.

**[EM ABERTO]** O que a parte de tutorial ensina, e o Roberto como chefe da quadra 1 no jogo completo.

### Quadras 2 a 5 [EM ABERTO]

- O tipo de bloqueio de cada quadra: combate, infiltração, item ou contato.
- Os chefes.
- A consequência de desistir de uma barricada.

---

## 5. Interface e HUD

A HUD é feita em React, por cima do jogo, com peças do PixelLab (`assets/ui/hud/`):
- à esquerda, o rosto do Kael, o nome, a barra de vida e a de índole com a balança;
- à direita, o seletor de arma (punho ou pistola), as balas do pente (enchem uma a uma na recarga) e os pentes de reserva (vermelho letal, azul não letal);
- nos mercenários, barra de vida e "!" de mira em cada um.

A HUD não captura o mouse, então os cliques vão para o jogo.

**Menus [DECIDIDO]:** título "Saves Her" minimalista, com itens à esquerda (New Game, Opções) sobre a rua da quadra 1 desfocada. Pausa com Continuar, Opções, Reiniciar cena e Voltar ao título. **Opções:** música, efeitos, tela cheia, língua (português e inglês) e **Controles**. As escolhas ficam guardadas no navegador.

**Cutscenes:** faixas pretas em cima e embaixo, tela de texto letra por letra, falas com retrato e caixa no céu. Enter avança, Esc pula.

---

## 6. Arte

### 6.1 Direção

- Pixel art em vista lateral.
- Os sprites principais vêm do PixelLab.
- A arte de apoio vem do Gemini ou do GPT, sempre pixelizada antes de usar.
- As referências ficam em `references/`.
- Todos os personagens têm uma sombra oval no chão, embaixo dos pés, desenhada pelo jogo (13/10/2026).

### 6.2 Padrão de sprite

| Item | Valor |
|---|---|
| Tamanho do quadro | 128x128, fundo transparente |
| Direção | East (o jogo espelha para West) |
| Linha do chão | y=120 sem arma, y=121 com arma |
| Paleta do Kael | 14 cores fixas, tiradas de `player_base_east.png` |
| Cores de efeito | Flash do tiro, luz e sangue `(176,32,36)` e `(110,16,24)`, fora da paleta e de propósito |
| Visual do Kael | Jaqueta preta, camiseta branca, jeans, tênis branco, cabelo castanho |

### 6.3 Animações prontas

**Kael** (`assets/player/`): `idle`, `walk`, `run`, `jump`, `crouch`, `punch_1`, `punch_2`, `kick`, `death`, e com arma `idle_gun`, `walk_gun`, `run_gun`, `run_gun_stop`, `jump_gun`, `aim_gun`, `shoot_gun`, `reload_gun`, `crouch_gun`, `crouch_aim_gun`, `crouch_shoot_gun`, `crouch_reload_gun`.

**Policial** (master e variantes `police_a/b/c`): `idle_gun`, `walk_gun`, `run_gun`, `jump_gun`, `aim_gun`, `shoot_gun`, `reload_gun`, `crouch_gun`, `crouch_aim_gun`, `crouch_shoot_gun`, `crouch_reload_gun`, `hurt`, `death`, `knockout`. Paleta própria de 24 cores; tons de farda gerados por canvas.

**Mercenário** (`assets/enemies/mercenaries/master/`, tons em `tones.json`): `idle_rifle`, `walk_rifle`, `run_rifle`, `jump_rifle`, `aim_rifle`, `shoot_rifle`, `reload_rifle`, `crouch_rifle`, `crouch_shoot_rifle`, `hold` (segura a Adriana), `hurt`, `death`, `knockout`.

**Adriana** (`assets/characters/adriana/`): `held`, `cry`, `freed`, `kneel`, `hug`, mais o retrato.

**Ilustrações dos finais** (`assets/cutscenes/`): 8 quadros de 160x90 em loop, ampliadas na tela.

### 6.4 O que falta [PROPOSTA]

- Kael: dano levado (hoje ele pisca em vermelho), andar mirando e tiro não letal com cor própria.
- Roberto e Geraldo.
- Cenário das quadras 2 a 5.

---

## 7. Áudio

**Pronto:** OST da quadra 1 (só quando a fase abre; o menu fica sem música), tiro da Colt 1911 do Kael, "single shot" dos policiais, fuzil AK-47 dos mercenários, recarga, clique seco, passos de andar e correr, golpes do combo e o loop da chuva. Todos os efeitos de terceiros são CC0 (fontes no `decisions.md`). O som dos inimigos cai com a distância e vai para o lado em que estão. Volume da música e dos efeitos nas Opções. A chuva fica abaixo da música e, nos finais, baixa e some na ilustração (13/10/2026).

**[EM ABERTO]** Som de pegar munição, vozes e uma faixa por quadra.

---

## 8. Tecnologia

| Camada | Escolha | Situação |
|---|---|---|
| Jogo | Phaser 4, física Arcade | [DECIDIDO] |
| Interface | React 19 (menus, HUD, diálogos e cutscenes) | [DECIDIDO] |
| Build | Vite | [DECIDIDO] |
| Linguagem | TypeScript | [DECIDIDO] |
| Tela | altura fixa de 540; largura de 960 (16:9) a 1280 (21:9), sem faixa preta | [DECIDIDO] |
| Língua | português (padrão) e inglês, em `src/i18n/` | [DECIDIDO] |
| Sprites | PixelLab, exportando spritesheet PNG | [DECIDIDO] |
| Vídeos | Remotion, para trailer, cutscenes e canal | [DECIDIDO] |

Também está **[EM ABERTO]** onde o jogo vai ser publicado. Para rodar: `npm install` uma vez e depois `npm run dev`.

### 8.1 Arquitetura do código

- O React desenha menus, HUD, diálogos e cutscenes por cima do canvas do Phaser.
- Os dois lados só conversam por um barramento de eventos tipado (`src/game/events.ts`).
- Todas as animações de humanoides (Kael, Adriana, policiais e mercenários) ficam numa tabela única (`src/game/anims/humanoid.ts`), com duração por quadro e linha do chão.
- O detalhe das regras de código está no `handoff.md`, seção "Arquitetura do código".

---

## 9. Análise do estado atual

**O que está pronto (versão 0.1 do jogo, 14/10/2026, tag `v0.1`).**
- A quadra 1 jogável do começo ao fim: abertura, duas barricadas com ondas, luta com os mercenários e os dois finais com ilustração animada.
- Combate completo: pistola com dois tipos de bala, pente e recarga, combo corpo a corpo, pulo e agachar, balas que voam, inimigos que atiram, agacham e pulam, loot, sangue e corpos no chão.
- Ambiente: ciclo do entardecer à noite, luzes das lojas e postes, chuva aleatória e sombras nos pés.
- Menus em português e inglês, com volumes, tela cheia e a lista de controles.
- Policiais com IA esperta (tiros em sequência, desvio da bala do Kael, palpite de pulo ou agachar) e tela de game over (escurece, frase triste, Enter tenta de novo).

**Riscos.**
1. **A progressão está em aberto.** Sem habilidades que travam caminhos, o jogo é um run and gun linear, não um metroidvania. É a decisão de design que mais trava o resto.
2. **O escopo é grande:** cinco quadras, vários chefes e um final com variação moral. A quadra 1 serve de molde para as outras.
3. **Muitos números [TESTE]** (vida, dano, munição, ondas) só se fecham com mais jogadas.

**Próximos passos [PROPOSTA].**
1. Fechar os [TESTE] da quadra 1 jogando (`decisions.md`, seção 3).
2. Decidir a progressão do Kael (`decisions.md`, item 10) e o tutorial (item 17).
3. Animação de dano do Kael.
4. Desenhar a quadra 2.

---

## 10. Pendências

A lista completa e ordenada por impacto está em `decisions.md`, seção 2. As que mais travam a produção agora são:
- **Progressão**, item 10.
- **Tutorial**, item 17.
- **Derrota do Kael** no jogo completo, item 14.
- **Controles que faltam** (gamepad e dash), item 20.

O estado das tarefas em andamento fica no `handoff.md`, seção "Pendências imediatas", e os resultados dos testes em `tests.md`.
