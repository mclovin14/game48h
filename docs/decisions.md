# Kael: decisões do jogo

Status: rascunho v0.1 (sessão de 11/10/2026)
Regra: cada item marcado como DECIDIDO, EM ABERTO ou AJUSTAR EM TESTE. Nada entra em "decidido" sem registro da data e da fonte.

---

## 1. DECIDIDO

### Premissa e personagens
- **Protagonista:** Kael, policial. Só tem pistola e distintivo no início, sem vantagem policial.
- **Noiva:** Adriana, filha do governador do estado de Florentins. Sequestrada por mercenários. Papel na história: objetivo do resgate, no estilo Peach do Super Mario World. Sem arco próprio.
- **Chefe imediato:** Geraldo, delegado. Proibiu o Kael de participar do caso por envolvimento emocional.
- **Geraldo:** corrupto. Foi ele quem contratou os mercenários, para extorquir e aplicar um golpe no governador. Velho ganancioso, quer controlar a cidade (nome ainda não definido). Não aparece no prédio da Capital para não se expor.
- **Corrupção:** o sogro do Kael também é corrupto. Boa parte do gabinete da polícia e da massa do exército também está comprometida.
- **Roberto:** tenente, braço direito do Geraldo. Corrupto. É o chefe da quadra 1.
- **Mercenários:** contratados pelo Geraldo. Há menção a uma organização terrorista envolvida (ver em aberto).

### Gênero, tom e estrutura
- **Gênero:** Metroidvania de ação, vista lateral, roda no navegador.
- **Tom:** ação pura.
- **Arte:** pixel art. Sprites principais com PixelLab. Arte de apoio com Gemini ou GPT, sempre pixelizada depois.
- **Estrutura:** cinco quadras até o prédio na Capital. Cada quadra tem barricadas de policiais, mais fortes que as anteriores.
- **Quadra 1 em duas partes:**
  - **Parte 1, tutorial.** O jogador aprende os controles.
  - **Parte 2, barricada.** Vários policiais, que chegam um de cada vez, no estilo Metal Slug. O jogador escolhe neutralizar cada um de forma letal ou não letal.
  - **Chefe da quadra 1: Roberto.** Ele reconhece o Kael atravessando a quadra, e os dois saem na bala. Cada um tem sua barra de vida, e perde quem esgotar a barra primeiro. O jogador escolhe matar ou não matar o Roberto, de acordo com a munição que tiver.
  - **Cutscene:** imagem estática com texto, no início. Ver em aberto a posição dela em relação ao chefe.
- **Objetivo final:** chegar ao prédio na Capital, onde estão a Adriana e figurões do alto escalão.

### Sistema de moral (Red Dead style)
- Existe uma **barra de índole**.
- Neutralizar sem matar: o Kael continua herói.
- Matar muitos policiais reduz a barra de índole.
- Índole baixa no final pode levar a um final triste (a definir o formato, ver em aberto).

### Arsenal inicial
- **Kael começa só com uma pistola**, que dispara dois tipos de bala: **letal** e **não letal**.
- A escolha da bala é o que alimenta a barra de índole.
- **Munição limitada.** Cada policial nocauteado deixa um loot de balas, que pode ser letal ou não letal. A chance de cada tipo é variável (valor inicial em AJUSTAR EM TESTE).

### Inimigos
- **Policiais comuns:** três tipos, um negro, um branco e um asiático. A diferença é **só visual**; comportamento por tipo fica para teste.
- **Visual:** farda própria (silhueta diferente da do Kael), mesmo conjunto de animações com arma do Kael, mais nocaute (bala não letal) e dano. Plano em `plan/police_variants.md`.
- **Cabeças aprovadas (11/10/2026, usuário):** `police_a` negro, `police_b` branco e loiro, `police_c` asiático de cabelo preto (`drafts/heads_options.png`). As rampas de pele e cabelo de cada uma ficam em `assets/enemies/police/variants.json`.
- **Olho azul na `police_b` (12/10/2026, usuário):** íris (72,128,208), cor fora da paleta do master (que só tem o azul-marinho da farda). Fica no campo `eye` do `variants.json`.
- **Rosto próprio no aim de 0 a 3 (12/10/2026, usuário):** as variantes recebem a cabeça colada também nesses quadros, com as mãos e a pistola do master por cima.

### Cenário da quadra 1 (11/10/2026, usuário)
- **Cara:** bairro de comércio no centro, com lojas, padaria e farmácia.
- **Hora:** a fase começa no entardecer e escurece até a noite durante o jogo (ciclo de tempo). Duração e detalhes técnicos em AJUSTAR EM TESTE e no plano `plan/world_camera_enemies.md`.
- **Nomes de lojas:** fictícios, em português, sem lembrar marca real. A IA pode propor, e o usuário veta. É uma exceção à regra de não inventar nomes, só para fachadas.
- **Voltar na fase:** livre, do início ao fim. Barricadas vencidas ficam abertas.
- **Visual (11/10/2026, usuário):** mistura dos conceitos A (sobrados coloridos) e B (prédios de tijolo com escada de incêndio), alternados para não repetir. O céu também mistura os dois: começa no laranja do A, passa pelo roxo do B e termina em noite com estrelas.
- **Ciclo do tempo (11/10/2026, usuário):** a fase começa clara e escurece aos poucos até a noite. À noite, os postes e as lojas (vitrine, placa, janelas) ficam acesos. Cada loja acende numa hora, piscando, e os postes acendem depois das lojas.
- **Lojas (propostas pela IA e aprovadas pelo usuário em 11/10/2026):** Padaria Pão de Ouro, Farmácia Vida Plena, Mercadinho Central, Sapataria Passo Certo, Ótica Visão Clara, Lanchonete Sabor da Esquina, Armarinho Linha Fina e Modas Aurora. Os nomes estão desenhados nas placas.
- **Fundo sem vão (11/10/2026, usuário):** nenhum prédio pode ficar transparente, e os prédios do fundo não podem flutuar. A silhueta desce até a calçada. Os prédios ficam colados um no outro, sobre uma calçada única e contínua (a calçada que a IA desenhava em cada fachada foi cortada), com um muro de concreto atrás para tapar qualquer fresta.
- ~~**Escala das fachadas (11/10/2026, usuário):** porta comum com cerca de 120 px; prédios colados, recortados pelo corpo (toldos cortados).~~ Revisto no mesmo dia: portas grandes demais e toldos cortados ficaram feios.
- **Escala das fachadas, revista (11/10/2026, usuário):** a referência é a porta da padaria original (o Kael passa nela tranquilamente). As outras portas ficam do mesmo tamanho (proporcionais, não iguais). Padaria, mercadinho e armarinho mantêm a arte original; farmácia, sapataria, ótica, lanchonete e roupas são ampliadas e redesenhadas. Nenhum prédio passa do topo da tela (os altos perdem andar), e a base aparece inteira. **Não recortar toldos:** cada fachada aparece completa. **Prédios separados por vãos**, com alguns pares colados (hoje: mercadinho + sapataria e armarinho + roupas). Os postes ficam no meio dos vãos.
- **Objetos em duas faixas (11/10/2026, usuário):** nada flutua nem fica colado nas lojas. A faixa do fundo pisa na linha dos postes, atrás do Kael, no tamanho normal; a da frente fica junto ao meio-fio, na frente do Kael, e é maior, por estar mais perto da câmera. Todo objeto tem sombra no pé. O carro ficou maior, na proporção do Kael, depois reduzido um pouco (1,15x do rascunho) e sempre inteiro, sem corte nos para-choques.
- **Escala:** a porta das lojas tem cerca de 100 px, um pouco mais que a altura do Kael (106 px com cabelo). As fachadas ficam no plano do jogador (fator 1,0), e a silhueta da cidade fica atrás, no fator 0,3.

### Variedade dos policiais (11/10/2026, usuário)
- Cada policial é sempre uma combinação de **cabeça + tom de farda** (3 × 3 = 9). Os tons **não mudam por quadra**. As cores exatas dos tons ainda vão para aprovação. Proposta de 12/10/2026, aguardando aprovação: azul-marinho (o do master), cinza-azulado e azul-petróleo, em `assets/enemies/police/uniform_tones.json` (prévia em `drafts/uniform_tones_preview.png`).
- Nunca aparecem dois policiais iguais seguidos ou na tela ao mesmo tempo.

### Ferramentas
- **Código e organização:** Claude.
- **Sprites:** PixelLab.
- **Arte de apoio:** Gemini e GPT.
- **Vídeos:** Remotion, para trailer, cutscenes e vídeos do canal.
- **Nomes de pastas e arquivos:** sempre em inglês, `snake_case`, sem acento. O conteúdo dos documentos continua em português.

### Tecnologia (11/10/2026, usuário)
- **Stack:** React (menus, HUD e diálogos), Phaser (o jogo) e Vite (build), rodando no navegador. Versões instaladas: Phaser 4.2, React 19.3, Vite 8.3, TypeScript 7.0 (travadas no `package-lock.json`).
- **Arquitetura:** React e Phaser não se importam; conversam só pelo barramento de eventos tipado (`src/game/events.ts`). Detalhes no `handoff.md`.
- **Fluxo de trabalho:** planos grandes vão para `docs/plan/` e só são implementados depois da aprovação do usuário.
- **Linguagem:** TypeScript, para pegar erros antes de rodar.
- **Resolução de referência:** 960x540, escalada para caber na janela sem borrar o pixel.
- **Tela sem faixa preta (11/10/2026, usuário):** a altura do jogo é fixa em 540 (é ela que dá a proporção do Kael, das portas e dos prédios); a largura visível acompanha a janela, de 960 (16:9) a 1280 (21:9), sempre na mesma escala nos dois eixos. Em tela 16:9 fica exatamente 960x540; janela mais larga mostra mais rua dos lados, nunca estica. Fora dessa faixa (janela em pé ou mais larga que 21:9) volta a sobrar borda.
- **Controles (11/10/2026, usuário):** botão esquerdo do mouse atira, botão direito mira, tecla 1 saca ou guarda a arma (o Kael começa sem arma). Andar com A/D ou setas é provisório.

---

## 2. EM ABERTO

Ordenados por impacto. Os primeiros bloqueiam o design de progressão e o final.

1. **Nome da cidade** governada pelo Geraldo. Ainda não definido.
2. **Organização terrorista:** qual é o papel dela? Ela contratou o Geraldo, usa os mercenários ou só aparece como pano de fundo?
3. **Quem sabe que o Geraldo é o mandante:** governador, exército, figurões presos, ninguém? Isso define se alguém denuncia e por que não denuncia.
4. **Descoberta da corrupção:** cedo (busca por provas) ou tarde (virada)? Ligado ao item 4.
5. **Soldados das barricadas:** cúmplices conscientes ou só cumprem ordens? Afeta a culpa do Kael ao neutralizá-los.
6. **Formato do final triste:** perder a Adriana, morrer, ou os dois? Ou índole baixa muda só o caminho até o final?
7. **Efeitos da índole baixa na prática:** polícia caça com mais força, aliados se afastam, lojas fecham, NPCs mudam de fala?
8. **Cena de resgate da Adriana:** ela aparece viva? Diz algo sobre o sequestro ou sobre o Geraldo? Se nada importa, a cena final perde força.
9. **Chefes:** quantos existem? O Geraldo tem confronto direto ou só aparece por diálogo? Já decidido: o chefe da quadra 1 é o Roberto.
10. **Progressão do Kael:** como ganha força (equipamento roubado, habilidades, favores, itens). Quais são as habilidades?
11. **Tipo de bloqueio por quadra:** combate, infiltração, item ou contato. Cada uma com uma regra.
12. **Texto da cutscene do fim da quadra 1:** o que a imagem mostra e o que o texto diz.
13. **Ordem do fim da quadra 1:** a cutscene vem antes do Roberto (ao cair o último policial) ou depois da luta com ele?
14. **Derrota do Kael:** se a barra de vida do Kael esgotar primeiro, o que acontece? Recomeça a luta, a quadra ou outra coisa?
15. **Roberto e a índole:** matar o Roberto conta na barra de índole como os outros policiais, pesa mais ou não conta?
16. **Loot de policial morto:** o loot vem só do policial nocauteado ou também do morto com bala letal?
17. **Tutorial da quadra 1:** o que a parte 1 ensina (atirar, pular, esconder, negociar, trocar de bala?). Já decidido: na parte 2 o jogador neutraliza policiais.
18. **Consequência de desistir:** se o jogador não atravessa uma barricada, o que acontece?
19. **Aliado dentro da polícia:** existe alguém que ajuda o Kael sem saber da corrupção? Se existir, quem é e o que cobra?
20. **Controles:** teclado e mouse decididos em 11/10/2026 (ver Tecnologia). Falta: gamepad, pulo, dash e troca de bala (hoje Q ou roda do mouse, provisório).
21. ~~**Resolução de referência**~~ → DECIDIDO em 11/10/2026: 960x540.
22. **Publicação:** localhost, GitHub Pages ou outro.
23. **Stack:** ~~confirmar React + Phaser (ou PixiJS)~~ → DECIDIDO em 11/10/2026: React + Phaser + Vite, em TypeScript. Falta confirmar Gemini ou GPT para arte de apoio.
24. **"Stack Cloud":** ainda não identificada. Se for o Claude, fica resolvido.

---

## 3. AJUSTAR EM TESTE

Números e curvas que só fazem sentido jogando. Não decidir antes de testar.

- Vida, dano e velocidade do Kael e dos inimigos.
- Quantidade de policiais por barricada e a curva de dificuldade entre as quadras.
- Pulo, dash e tempo de invencibilidade após dano.
- Tamanho das salas e distância entre plataformas.
- Quantas habilidades o Kael ganha por quadra.
- Duração das cutscenes e diálogos.
- Peso da barra de índole: quantos policiais mortos mudam de faixa.
- Chance do loot de munição: valor inicial **70% bala letal / 30% bala não letal** (provisório).
- Quantidade de balas por loot e munição inicial do Kael.
- Vida e dano do Roberto na luta de chefe.
- **Combate do policial (12/10/2026, provisório):** atira a cada 1,8 s (±20%), alcance 600 px; segura a mira 0,45 s antes do tiro; acerta 70% das vezes, com dano 8 (vida do Kael 100). Kael atingido pisca em vermelho por 0,22 s. Loot do nocaute: 3 balas por caixa (70% letal / 30% não letal), pega a 28 px. Valores no arquétipo `patrol` (`src/game/actors/Police.ts`), no topo de `Loot.ts` e de `Test.ts`.
- Duração do ciclo do entardecer para a noite: valor inicial 8 minutos (provisório). O relógio na tela vai de 17:30 a 19:30, e as teclas `[` e `]` mudam a hora na cena de teste.
- **Faixas do ciclo (11/10/2026, provisórias):** a noite cobre o entardecer de 25% a 95% do ciclo; as lojas acendem entre 50% e 80%; os postes, entre 60% e 72%; as estrelas aparecem de 55% a 95%. Ficam no topo de `src/game/world/Street.ts` e `Sky.ts`.
- **Ondas das barricadas (12/10/2026, provisórias):** a arena dispara 320 px antes da barricada, que fica a 200 px da borda direita da tela travada; um policial a cada 1,1 s, 1,5 s entre ondas; corpos somem depois de 2,5 s. Barricada 1 com 2 ondas (2 e 3 policiais), barricada 2 com 3 ondas (2, 3 e 3). Constantes no topo de `src/game/actors/Waves.ts`; ondas em `level_1.ts`.
- Câmera: zona morta de 1/4 da tela, olhar à frente de 120 px (troca de lado em 0,9 s), suavização 0,12 por quadro. Fase de teste com 3840 px. Ficam no topo de `src/game/world/CameraRig.ts`.
- **Valores iniciais da cena de teste (11/10/2026, provisórios):** andar a 120 px/s (era 90; a animação de andar acelera junto); munição inicial 12 letais e 6 não letais; policial cai com 2 tiros (o primeiro toca o dano); índole máxima 10, com cada policial morto tirando 1; vida do Kael 100; alcance do tiro 900 px. Ficam no topo de `src/game/scenes/Test.ts`.

---

## 4. Histórico de decisões

| Data | Decisão | Fonte |
|---|---|---|
| 11/10/2026 | Protagonista é Kael (não Kyle, não Caio) | Usuário |
| 11/10/2026 | Geraldo contratou os mercenários | Usuário |
| 11/10/2026 | Adriana sem arco próprio, papel tipo Peach | Usuário |
| 11/10/2026 | Barra de índole estilo Red Dead | Usuário |
| 11/10/2026 | Quadra 1 é tutorial | Usuário |
| 11/10/2026 | "Catal" era erro de grafia: o nome correto é Capital | Usuário |
| 11/10/2026 | Quadra 1 dividida em tutorial (parte 1) e barricada com policiais um de cada vez, estilo Metal Slug (parte 2) | Usuário |
| 11/10/2026 | Arsenal inicial: pistola com bala letal e bala não letal | Usuário |
| 11/10/2026 | Fim da quadra 1: cutscene com imagem estática e texto | Usuário |
| 11/10/2026 | Munição limitada, reposta por loot de policial nocauteado (70% letal / 30% não letal, provisório) | Usuário |
| 11/10/2026 | Chefe da quadra 1 é o Roberto, tenente corrupto e braço direito do Geraldo; luta com barra de vida dos dois, e o jogador escolhe matar ou não | Usuário |
| 11/10/2026 | Nomes de pastas e arquivos sempre em inglês (`referências` virou `references`, `cenários` virou `environments`, `história.md` virou `story.md`) | Usuário |
| 11/10/2026 | Três policiais inimigos (negro, branco, asiático), diferença só visual, farda própria; corpo compartilhado e cabeça por variante | Usuário |
| 11/10/2026 | Documentos (`decisions.md`, `GDD.md`, `story.md`, `handoff.md`) e a pasta `plan/` movidos para `docs/`; só o `CLAUDE.md` fica na raiz | Usuário |
| 11/10/2026 | Stack React + Phaser + Vite em TypeScript; resolução de referência 960x540 | Usuário |
| 11/10/2026 | Controles: esquerdo atira, direito mira, 1 saca/guarda a arma | Usuário |
| 11/10/2026 | Estrutura do código e cena de teste implementadas (plano `web_stack_setup.md`); Phaser 4 por ser a versão estável atual | Usuário aprovou o plano |
| 11/10/2026 | Quadra 1: bairro de comércio no centro, do entardecer para a noite; lojas com nomes fictícios em PT-BR; voltar livre na fase | Usuário |
| 11/10/2026 | Policiais: sempre cabeça + tom de farda (9 combinações), tons iguais em todas as quadras, sem repetição na tela | Usuário |
| 11/10/2026 | Plano `world_camera_enemies.md` com 6 fases; combate do policial é a última | Usuário |
| 11/10/2026 | Quadra 1 mistura os conceitos A e B (prédios e céu); ciclo do entardecer à noite com luzes de lojas e postes acendendo | Usuário |
| 11/10/2026 | Postes adiantados da fase 3 para a fase 2, por fazerem parte da luz da noite | IA, no pedido do usuário |
| 11/10/2026 | Nomes das lojas aprovados; prédios sem transparência e silhueta do fundo descendo até a calçada | Usuário |
| 11/10/2026 | Calçada única e contínua por baixo dos prédios; prédios colados, com muro atrás | Usuário |
| 11/10/2026 | Fase 2 do plano `world_camera_enemies.md` (cenário e ciclo de tempo) aprovada; início da fase 3 | Usuário |
| 11/10/2026 | Fase 3: chão do PixelLab repetível; carro estacionado no asfalto, na frente do Kael; lixeira e hidrante junto ao muro; barricada na linha dos pés com giroflex de brilho (posições AJUSTAR EM TESTE) | IA, fase 3 do plano |
| 11/10/2026 | Tela sem faixa preta: altura fixa em 540 e largura que acompanha a janela, de 16:9 a 21:9; prédios não podem passar do topo da tela | Usuário |
| 11/10/2026 | Fachadas refeitas na escala do Kael: portas proporcionais (~120 px), base inteira, prédio de no máximo 430 px, recorte pelo corpo do prédio | Usuário |
| 11/10/2026 | Revisão: portas na escala da padaria original (menores), toldos sempre inteiros, prédios separados por vãos com alguns pares colados | Usuário |
| 11/10/2026 | Carro um pouco menor (1,15x do rascunho, era 1,3x) e inteiro: o redesenho anterior cortava para-choques; rodas inteiras no asfalto | Usuário |
| 11/10/2026 | Cabeças dos policiais A (negro), B (branco, loiro) e C (asiático) aprovadas; início da fase 4 (variantes), começando pela `police_a` | Usuário |
| 11/10/2026 | Variantes: a pele segue o tom do rosto colado em todos os quadros (mãos com sombra, sem quadro mais claro); nada do cabelo do master atrás da cabeça nova | Usuário |
| 12/10/2026 | `police_a` aprovada; `police_b` e `police_c` feitas com o mesmo método (proporções do master, pele no tom do rosto colado) | Usuário |
| 12/10/2026 | Quepe do master nas três variantes; rosto da variante no aim de 0 a 3; olho azul na `police_b` | Usuário |
| 12/10/2026 | Cabelo da cabeça caída (death, knockout) com cor fixa da variante em todos os quadros | Usuário |
| 12/10/2026 | `police_b` e `police_c` aprovadas (fase 4 finalizada); no jogo, a variante do policial é sorteada no spawn (fase 5) | Usuário |
| 12/10/2026 | Fase 6 (combate) implementada: policial mira com aviso e atira, Kael perde vida e morre, nocaute solta caixa de munição | Usuário pediu; valores da IA, provisórios |
| 11/10/2026 | Objetos em duas faixas (fundo na linha dos postes; frente junto ao meio-fio, maior), com sombra; carro maior | Usuário |
