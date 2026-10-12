# Plano: cenário da quadra 1, câmera e estrutura dos inimigos

Status em 12/10/2026:
- Fase 1: **feita e aprovada pelo usuário** (11/10/2026). Velocidade do Kael subiu para 120 px/s.
- Fase 2: **feita e aprovada pelo usuário** (11/10/2026). O usuário pediu a mistura dos conceitos A e B (prédios e céu). Mudanças em relação ao plano:
  - as fachadas ficam no plano do jogador (fator 1,0), com porta na escala do Kael; com fator 0,6 elas deslizavam sob os pés;
  - cada fachada tem três camadas (entardecer, noite sem luz e só as luzes), montadas por `tools/build_background.py`;
  - os postes vieram da fase 3 para cá, porque fazem parte da luz da noite;
  - são 8 fachadas, e algumas repetem ao longo dos 3840 px.
- Fase 3: **feita, aguardando teste do usuário** (11/10/2026). O chão saiu de uma faixa do PixelLab remontada em bloco de 128 px. Os objetos são carro, hidrante, lixeira e barricada; o giroflex é um brilho do código, sem versão noturna desenhada. A camada da frente, que era opcional, ficou de fora.
  - Correções do primeiro teste (11/10/2026): tela sem faixa preta (largura de 960 a 1280, conforme a janela); objetos em duas faixas com sombra e carro maior; fachadas refeitas na escala da porta da padaria original (`tools/build_facade_fit.py` + redesenho do PixelLab, depois `build_background.py`), com portas proporcionais, base e toldos inteiros, prédios separados por vãos e dois pares colados. Aguardando novo teste do usuário.
- Fase 3: **aprovada pelo usuário** (11/10/2026).
- Fase 4: **`police_a` montada, aguardando revisão do usuário** (11/10/2026). Cabeças aprovadas.
- Fase 4: **feita e aprovada pelo usuário** (12/10/2026): as três variantes, e no jogo pela classe `Police` (fase 5 do `police_variants.md`).
- Fase 5: **feita** (12/10/2026), aguardando o teste do usuário e a aprovação dos 3 tons de farda. Como ficou:
  - `src/game/actors/Police.ts`: `PoliceLook` (cabeça + tom), `EnemyArchetype` (um só, `patrol`: vida 2; tiro e alcance ficam para a fase 6) e a classe `Police` (entra andando até o ponto de parada e depois fica virada para o Kael).
  - Tons de farda [PROPOSTA]: azul-marinho, cinza-azulado e azul-petróleo, em `assets/enemies/police/uniform_tones.json`, gerados por `tools/build_uniform_tones.py` (mesma luminosidade da rampa do master, outro matiz). Prévia das 9 combinações em `drafts/uniform_tones_preview.png`. O Boot troca as 6 cores da farda por canvas (`actors/uniformTones.ts`), sem sheet nova. O quepe troca junto; a íris não usa cor da farda.
  - `src/game/actors/EnemyDirector.ts`: saco embaralhado das 9 aparências, com seed. Além das garantias, prefere a aparência que não repete cabeça nem tom de quem já está na tela (no teste, três de azul-petróleo apareceram juntos). A seed fica no registro da cena (`enemySeed`) e no F1; `?seed=...` na URL repete a sequência.
  - `src/game/actors/Waves.ts`: ondas por barricada (`barricades` em `level_1.ts`, com o lado de entrada de cada policial). A câmera trava (`CameraRig.lock`, seguindo um ponto que vira o centro da arena, sem pulo), o Kael fica preso na arena, e a câmera solta quando a última onda cai. Barricada vencida não dispara de novo.
  - O policial único de teste (`copX`) saiu; o tiro do Kael acerta o policial em pé mais perto na direção em que ele olha.
  - `window.__game` só no modo dev, para o teste automático ler o estado.
- Fase 6: **feita** (12/10/2026), aguardando o teste do usuário (dificuldade e leitura do tiro). Como ficou:
  - O policial parado conta o intervalo (`fireMs` ±20%), levanta a arma (`aim_gun`), segura a mira por `aimHoldMs` (o aviso para o jogador) e atira (`shoot_gun`); depois abaixa e recomeça. Levar tiro interrompe e atrasa o próximo. Fora do alcance ou com o Kael morto, ele abaixa sem atirar.
  - Tiro instantâneo com chance de acerto (`hitChance`) e dano fixo (`damage`), no arquétipo `patrol`.
  - Kael atingido: pisca em vermelho e a tela treme de leve (ainda não tem animação de dano). Vida zerada: `death` e o aviso "R reinicia" (o que acontece na derrota segue EM ABERTO, item 14).
  - Nocaute solta uma caixa de munição (`src/game/actors/Loot.ts`): 70% letal / 30% não letal, 3 balas, pega passando por cima. A caixa é desenhada pelo código, com cores da paleta do policial.
  - Os policiais não atiram enquanto ainda estão entrando.
  - No teste automático (seed `kael1`), o Kael parado na barricada 1 caiu em cerca de 36 s; lutando com bala não letal, 5 nocautes soltaram 5 caixas (4 letais, 1 não letal), todas pegas.

Pedido do usuário (11/10/2026):
- Trocar o retângulo cinza por um cenário de verdade: cidade, prédios e lojas ao fundo e chão, gerados com o PixelLab.
- Fazer a câmera seguir o Kael para frente e para trás.
- Estruturar os inimigos sem dois policiais iguais.
- Dividir tudo em fases. Ao fim de cada fase, avisar e esperar o usuário testar antes de seguir.

Depende de: `web_stack_setup.md` (feito) e `police_variants.md` (fase 3 aguardando aprovação das cabeças).

---

## 1. O que a pesquisa diz

### Câmera em jogos de rolagem lateral

Fonte principal: a palestra "Scroll Back", de Itay Keren (GDC 2015).

- **Janela ou zona morta (deadzone).** O personagem anda livre numa faixa no meio da tela, e a câmera só se move quando ele chega na borda dessa faixa. Assim, a tela não treme a cada passinho para trás. A regra é rolar o mínimo necessário.
- **Olhar à frente (lookahead).** O ponto da câmera vai um pouco para o lado em que o personagem olha. Isso corrige o defeito da janela, que mostra pouco do que vem pela frente. O deslocamento tem que ser suave e não pode virar de uma vez quando o personagem dá meia-volta.
- **Suavização (damping ou lerp).** A câmera alcança o alvo aos poucos, nunca de uma vez.
- **Limites (bounds).** A câmera nunca mostra fora do cenário.
- **Trava de arena.** É o "screen lock" do Metal Slug: a câmera para enquanto houver inimigos de uma onda vivos, e a tela fica fechada nas duas pontas. Combina com as barricadas da quadra 1.

### Fundo em camadas (parallax)

- Três a quatro camadas bastam. A profundidade vem da velocidade diferente de cada camada, e não de desenho em perspectiva:
  - longe: céu e silhueta da cidade, quase parada;
  - meio: prédios e lojas;
  - perto: a rua, que anda junto com a câmera.
- A camada de longe deve ter pouco contraste e cor mais apagada, para não competir com os personagens.
- Uma camada que se repete precisa que a borda esquerda continue na borda direita. Só essa emenda importa, porque o fundo não se repete na vertical.
- Escala de pixel sempre inteira. Uma escala quebrada borra o pixel. A tela de 960x540 vira exatamente 1920x1080 em 2x.

### Metroidvania que anda para a frente

- A quadra é uma sequência de "salas" largas lado a lado. Hoje, o jogo anda da esquerda para a direita, com volta permitida.
- **Portões (gates):** o caminho fecha até cumprir algo. Pode ser um portão duro (habilidade, chave) ou um portão leve (vencer a barricada). Para a quadra 1, o portão leve basta: a trava de arena da barricada.
- Marcos visuais (uma loja, um letreiro) ajudam o jogador a se localizar sem mapa.
- O que foi coletado continua coletado ao voltar para uma sala.
- O "vania" de verdade (habilidade que abre caminho antigo) depende da progressão do Kael, que está **EM ABERTO** (`decisions.md`, item 10). Este plano deixa a estrutura pronta para isso, sem decidir nada.

### Variedade de inimigos

- Os três policiais usam o mesmo corpo. Para não repetir com só 3 cabeças, juntamos dimensões baratas de combinar:
  - **cabeça:** a, b, c, e mais cabeças no futuro, a uma chamada do PixelLab cada;
  - **tom da farda**, por troca de rampa da `palette_master.json`, sem chamada nova;
  - **acessório** opcional colado por script (óculos escuros, bigode), feito uma vez.
- São 3 cabeças × 3 tons = 9 policiais diferentes antes de qualquer acessório.
- **Sorteio sem repetição ("saco embaralhado").** Sorteia todas as combinações antes de repetir alguma. Nunca saem dois iguais seguidos, nem dois iguais na tela ao mesmo tempo.

---

## 2. Integração com o PixelLab para o cenário

| Peça | Ferramenta | Tamanho |
|---|---|---|
| Teste de estilo (uma tela inteira) | `create_image_pro`, com `no_background: false` | 688x384, conceito |
| Céu e silhueta distante | `create_image_pro` ou `create_image_pixflux` | faixa larga, repetível |
| Prédios e lojas (camada do meio) | `create_map_object`, com `view: "side"` e uma fachada por chamada | até 400x400 |
| Chão (calçada, meio-fio, asfalto) | `create_sidescroller_tileset` | blocos de 32 px |
| Objetos (poste, carro, hidrante, barricada, lixeira) | `create_map_object`, com `view: "side"` | 32 a 400 px |
| Emenda das faixas repetíveis | `inpaint_image` sobre a emenda | — |

**Fachadas soltas em vez de uma imagem gigante.** Cada prédio ou loja é uma peça própria, e o arquivo da fase diz onde fica cada uma. Vantagens:
- não há emenda para consertar;
- dá para reaproveitar e misturar peças nas outras quadras;
- uma loja marcante vira um ponto de referência.

**Consistência de estilo:**
1. Primeiro sai uma tela de conceito, que precisa da sua aprovação.
2. Ela vira a imagem de estilo das outras chamadas (`style_image` ou `background_image`).
3. Cada camada passa por um script que reduz para uma paleta fixa do cenário. É a mesma ideia da paleta do Kael.

**Escala:**
- O Kael tem cerca de 100 px de altura, mais ou menos 1,80 m. Então um andar de prédio tem uns 170 px na camada do meio.
- O chão de hoje fica em `GROUND_Y = 470`, o que deixa 70 px de calçada e rua abaixo dos pés.

**Custo:**
- `create_image_pro` gasta de 10 a 25 gerações por chamada.
- `create_sidescroller_tileset` gasta de 2 a 3.
- Estimativa da fase 2: 2 conceitos, 1 a 2 faixas de céu, 6 a 8 fachadas, 1 tileset e cerca de 8 objetos.

**Pastas novas (em inglês, `snake_case`):**
```
assets/levels/level_1/
  concept/                 telas de conceito (rascunho)
  sky.png, skyline.png     faixas repetíveis
  facades/<nome>.png       prédios e lojas
  props/<nome>.png         poste, carro, barricada...
  ground_tileset.png       tileset do chão
  palette_level_1.json     paleta do cenário
  drafts/                  brutos do PixelLab
tools/build_background.py  paleta, emenda das faixas, recorte e conferência
src/game/levels/level_1.ts dados da fase (largura, peças, ondas)
src/game/world/            Parallax, CameraRig, Level
src/game/enemies/          Police, EnemyDirector
```

---

## 3. Fases

Ao fim de cada fase, eu aviso o que mudou e **o que você deve testar**, e paro. Só sigo depois do seu ok.

### Fase 1: mundo largo e câmera (só código, sem arte nova)

- Fase de teste com 4 telas de largura (3840 px). O chão continua em placeholder e o fundo ganha 3 faixas coloridas de placeholder, para dar para sentir o parallax.
- Câmera:
  - `startFollow` no Kael com suavização;
  - zona morta de cerca de 1/4 da tela;
  - olhar à frente para o lado em que ele olha, com transição suave;
  - limites no tamanho da fase;
  - `roundPixels` ligado, para não borrar o pixel.
- O Kael anda para frente e para trás pela fase inteira. A mira continua seguindo o mouse, agora em coordenada de mundo.
- O policial fica num ponto fixo da fase.
- O Kael pode voltar até o início da fase, sem limite.
- **Você testa:** andar de ponta a ponta, voltar, dar meia-volta, mirar com a câmera parada e em movimento. Veja se a câmera treme, atrasa demais ou se o olhar à frente incomoda.

### Fase 2: arte do fundo e ciclo de tempo (PixelLab). Para no conceito e nos nomes das lojas

1. **Conceito.** Gero de 2 a 3 telas de conceito da rua da quadra 1 e **paro para você escolher uma**.
2. Com o conceito aprovado, proponho os nomes das lojas (fictícios, em português) e espero o seu ok.
3. Gero:
   - a silhueta distante, repetível;
   - de 6 a 8 fachadas de lojas (padaria, farmácia e outras do comércio do centro), cada uma em versão de entardecer e de noite;
   - a paleta do cenário.

   O céu é feito pelo código.
4. Monto as camadas no jogo e o **ciclo do entardecer para a noite** (seção 4), com a velocidade de cada camada:
   - céu 0,1;
   - silhueta 0,3;
   - fachadas 0,6;
   - rua 1,0.

   As velocidades são [TESTE].
5. **Você testa:** se a cidade lê bem atrás do Kael e do policial, se alguma camada rouba a atenção, se aparece emenda ou pixel borrado, e se a passagem para a noite fica bonita (dá para acelerar com `[` e `]`).

### Fase 3: chão e objetos

- Tileset do chão (calçada, meio-fio, asfalto) no lugar do retângulo cinza, com a linha de pisada batendo em `GROUND_Y`.
- Objetos de cena (o poste já entrou na fase 2): carro estacionado, hidrante, lixeira e a barricada policial. Os postes e a barricada (com giroflex) ganham versão acesa para a noite.
- `level_1.ts` passa a descrever a fase: largura, fachadas, objetos e os pontos onde ficam as barricadas.
- Uma camada da frente, opcional, com poste e placa passando na frente do jogador a 1,2 da velocidade, para dar profundidade.
- **Você testa:** se os pés pisam certo no chão, se os objetos estão na escala certa ao lado do Kael, e se a barricada é reconhecível.

### Fase 4: variantes do policial (plano `police_variants.md`, fase 4)

Cabeças aprovadas em 11/10/2026.
- Monto a `police_a` com as 7 animações e **paro para revisão**.
- Com a revisão aprovada, monto a `police_b` e a `police_c`.
- **Você testa:** as três lado a lado, em render ampliado e no jogo.

### Fase 5: estrutura dos inimigos e variedade

Código:
- **Aparência separada do comportamento.**
  - `PoliceLook` = cabeça + tom da farda (+ acessório).
  - `EnemyArchetype` = vida, cadência e alcance.

  Hoje existe um arquétipo só, porque a diferença por tipo é **só visual** (DECIDIDO).
- **`EnemyDirector`** faz o "saco embaralhado" das aparências. As garantias:
  - nunca dois iguais seguidos;
  - nunca dois iguais na tela;
  - a seed fica no registro da cena, para reproduzir um bug.
- **Tons de farda:**
  - a troca de rampa acontece no Boot, por canvas, a partir do `palette_master.json`, e gera as texturas de cada combinação sem arquivo novo;
  - cada policial é sempre cabeça + tom (9 combinações). Os tons são os mesmos em todas as quadras (DECIDIDO);
  - **[PROPOSTA]** os 3 tons: azul-marinho (o atual), cinza-azulado e azul-petróleo. Mostro uma prévia das 9 combinações e paro para você aprovar as cores.
- **Ondas.** Cada barricada do `level_1.ts` lista as ondas (quantos policiais e de que lado entram). Ao chegar na barricada:
  - a câmera trava (arena);
  - os policiais entram um de cada vez, no estilo Metal Slug;
  - a câmera solta quando a onda acaba.
- Mostrador de depuração (tecla F1) com a aparência de cada policial na tela, para conferir que não há repetição.
- **Você testa:** passar por 2 barricadas, conferir que não aparecem dois policiais iguais, e que a câmera trava e solta na hora certa.

### Fase 6: combate básico do policial (última fase)

Sem isso, a barricada não oferece perigo.
- O policial entra, para a uma distância, mira (`aim_gun`) e atira (`shoot_gun`) com intervalo [TESTE].
- O Kael perde vida e morre (`death`) quando a vida zera.
- O loot de munição aparece no nocaute: 70% letal e 30% não letal (provisório).
- **Você testa:** se a dificuldade e a leitura do tiro inimigo estão boas.

---

## 4. Respostas do usuário (11/10/2026)

1. **Cara da quadra 1:** bairro de comércio no centro, com lojas, padaria e farmácia.
2. **Hora do dia:** começa no entardecer e vai escurecendo até a noite. Ver "Ciclo do entardecer para a noite" abaixo.
3. **Nomes nas fachadas:** nomes fictícios em português, sem lembrar nenhuma marca real. Eu proponho os nomes, e o usuário pode vetar.
4. **Variedade dos policiais:** cada policial é sempre uma combinação de cabeça e tom de farda (3 × 3 = 9). Os tons **não mudam por quadra**: são os mesmos no jogo inteiro.
5. **Voltar:** o Kael pode voltar sem limite, do início ao fim da fase. As barricadas já vencidas ficam abertas.
6. **Fase 6 (combate):** entra neste plano e é a última fase.

Ainda falta aprovar, quando chegar a hora: as cores exatas dos 3 tons de farda (fase 5) e a lista de nomes das lojas (fase 2).

### Ciclo do entardecer para a noite

Como funciona [PROPOSTA]:
- **Relógio.** Um relógio da fase vai de 0 (entardecer) a 1 (noite) com o tempo jogado e nunca volta. A duração inicial é de 8 minutos [TESTE]. Voltar pela fase não volta o tempo.
- **Céu.** É desenhado pelo código, com um degradê que vai de laranja e rosa até azul-escuro. Assim não precisa de imagem nova para cada momento. O sol e as primeiras estrelas aparecem conforme o relógio.
- **Prédios e lojas.** Cada fachada tem duas versões geradas com a mesma composição: entardecer e noite (janelas e letreiros acesos). A troca é uma transição suave pela transparência, guiada pelo relógio. A versão noturna sai de `edit_image_pro_flash` sobre a versão do entardecer, para manter o desenho idêntico.
- **Personagens.** Recebem um leve tom de cor (`tint`) que acompanha o relógio. O sprite não muda, só a cor multiplicada. O sangue e o flash do tiro continuam legíveis.
- **Postes e letreiros.** Acendem quando o relógio passa de um limite [TESTE], com um brilho em volta (cor de efeito fora da paleta, avisada).
- **Teste rápido.** As teclas `[` e `]` adiantam e atrasam o relógio, só para teste.

O custo dobra só nas fachadas e nos objetos que têm luz, e não em tudo.

## 5. Conferência de cada fase

- `npm run typecheck` e `npm run build` passando.
- Teste no navegador com capturas, e nenhum erro no console.
- Para arte:
  - contagem de cores contra a paleta;
  - escala ao lado do Kael;
  - render ampliado para caçar quebra de pixel;
  - faixas repetidas lado a lado para caçar emenda.
- Ao fim de cada fase:
  - atualizar `handoff.md` (estado e pendências);
  - atualizar `decisions.md`, se algo foi decidido;
  - atualizar o status no topo deste plano.

## Fontes da pesquisa

- [Scroll Back: The Theory and Practice of Cameras in Side-Scrollers (Itay Keren, Game Developer)](https://www.gamedeveloper.com/design/scroll-back-the-theory-and-practice-of-cameras-in-side-scrollers)
- [Camera design in 2D side scrollers (Game Design Skills)](https://gamedesignskills.com/game-design/camera-design-2d-side-scroller-games/)
- [Background parallax (exemplo da biblioteca Arcade)](https://arcade-library.readthedocs.io/en/development/example_code/how_to_examples/background_parallax.html)
- [City scrollable background pixel art (OpenGameArt)](https://opengameart.org/content/city-scrollable-background-pixel-art)
- [Sprawl: How to Make a Metroidvania (Map + Ability Gates)](https://sorceress.games/blog/sprawl-how-to-make-a-metroidvania-map-ability-gates)
- [Designing Multi-Mode Player Abilities to Enhance Backtracking in Metroidvania Levels (Chalmers)](https://odr.chalmers.se/items/d79d64a8-8f42-4b85-a4f8-5b1b259962b0/full)
- [Metal Slug X (Bitvint)](https://bitvint.com/pages/metal-slug-x)
- Ajuda do PixelLab (`search_help`): não existe gerador de parallax pronto. As camadas saem uma por vez, e a emenda se conserta com `inpaint_image`.
