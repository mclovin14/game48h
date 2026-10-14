# Kael: decisões do jogo

Status: rascunho v0.1 (sessão de 11/10/2026), atualizado em 14/10/2026. O jogo está na **versão 0.1** (tag `v0.1` no git, 14/10/2026).
Regra: cada item marcado como DECIDIDO, EM ABERTO ou AJUSTAR EM TESTE. Nada entra em "decidido" sem registro da data e da fonte.

---

## 1. DECIDIDO

### Premissa e personagens
- **Protagonista:** Kael, policial. Só tem pistola e distintivo no início, sem vantagem policial.
- **Noiva:** Adriana, filha do governador do estado de Florentins. Sequestrada por mercenários. Papel na história: objetivo do resgate, no estilo Peach do Super Mario World. Sem arco próprio. **Aparência (13/10/2026, usuário):** ruiva de cabelo longo e ondulado, **olhos verdes**, vestido vermelho de alças com saia rodada até o joelho, salto preto.
- **Chefe imediato:** Geraldo, delegado. Proibiu o Kael de participar do caso por envolvimento emocional.
- **Geraldo:** corrupto. Foi ele quem contratou os mercenários, para extorquir e aplicar um golpe no governador. Velho ganancioso, quer controlar a cidade (nome ainda não definido). Não aparece no prédio da Capital para não se expor.
- **Corrupção:** o sogro do Kael também é corrupto. Boa parte do gabinete da polícia e da massa do exército também está comprometida.
- **Roberto:** tenente, braço direito do Geraldo. Corrupto. É o chefe da quadra 1.
- **Mercenários:** contratados pelo Geraldo. Há menção a uma organização terrorista envolvida (ver em aberto).

### Gênero, tom e estrutura
- **Gênero:** Metroidvania de ação, vista lateral, roda no navegador.
- **Tom:** ação pura.
- **Arte:** pixel art. Sprites principais com PixelLab. Arte de apoio com Gemini ou GPT, sempre pixelizada depois.
- **Estrutura:** cinco quadras até o prédio na Capital. Cada quadra tem barricadas de policiais, mais fortes que as anteriores. *(Jogo completo. O escopo desta versão é só a fase atual, ver **Escopo** abaixo; a abertura não cita mais a Capital nem as cinco quadras, 13/10/2026.)*
- **Quadra 1 em duas partes:**
  - **Parte 1, tutorial.** O jogador aprende os controles.
  - **Parte 2, barricada.** Vários policiais, que chegam um de cada vez, no estilo Metal Slug. O jogador escolhe neutralizar cada um de forma letal ou não letal.
  - **Chefe da quadra 1: Roberto.** Ele reconhece o Kael atravessando a quadra, e os dois saem na bala. Cada um tem sua barra de vida, e perde quem esgotar a barra primeiro. O jogador escolhe matar ou não matar o Roberto, de acordo com a munição que tiver.
  - **Cutscene:** imagem estática com texto, no início. Ver em aberto a posição dela em relação ao chefe.
- **Objetivo final:** chegar ao prédio na Capital, onde estão a Adriana e figurões do alto escalão.

### Sistema de moral (Red Dead style)
- Existe uma **barra de índole**.
- **Finais pela índole (12/10/2026, usuário):** com a índole **abaixo de 50%**, final triste: o Kael pode até salvar a Adriana, mas morre no fim. Com **50% ou mais**, final feliz: ele salva a Adriana e sobrevive.

### Pulo, agachar e cutscene de abertura (12/10/2026, usuário)
- **Pulo** sempre para a frente, para desviar das balas. **Agachar.** As duas com arma e sem arma, no Kael e depois nos policiais.
- **Cutscene de abertura no estilo dos jogos dos anos 90:** no fim da rua aparece a Adriana segura por três captores (o usuário chamou de terroristas; ver em aberto, item 2), e ela pede socorro ao Kael. O jogador atravessa as barricadas até o fim da fase para socorrê-la. Referência: `references/adriana/Gemini_Generated_Image_gawtdngawtdngawt.jpeg` (Adriana ruiva, vestido vermelho; captores de balaclava e farda tática verde-oliva com fuzil; van escura).
- Isso amplia a cutscene "imagem estática com texto, no início" (11/10/2026). Se a mensagem estática continua junto, está em aberto no plano.
- **Cutscene de abertura (13/10/2026, usuário):** a **mensagem de abertura em texto entra antes**, numa tela preta, letra por letra (por enquanto com o rascunho do `story.md`, seção 5). Falas: **Adriana:** "KAEL! Socorro!" e "Eles vão me levar! Me ajuda!" (sem revelar que o Geraldo é o mandante); **Kael:** "Aguenta firme. Eu tô indo."
- **Escopo:** só a fase atual, usada de exemplo (não as cinco quadras). A Adriana fica no fim da rua, como na referência, e o Kael a resgata nesta fase. **Os três captores são mercenários do Geraldo**; o Geraldo não aparece. **Os chefes desta fase são os três mercenários**, de **fuzil**, feitos do zero com todas as animações novas (o usuário primeiro sugeriu reaproveitar o corpo do policial, depois mudou). Os três vêm **de uma vez** e cercam o Kael, que só tem a pistola e precisa ser mais rápido. **Matar mercenário não tira índole.** (O Roberto segue como chefe da quadra 1 no jogo completo.)
- **Finais entram agora**, no fim da cena de teste: índole abaixo de 50%, o Kael morre no fim; 50% ou mais, final feliz.
- **Seta de "siga em frente" (13/10/2026, usuário):** quando a última onda de uma barricada cai, aparece uma seta em pixel art piscando do lado direito da tela, como nos beat 'em ups antigos. Os tiros que chegam aos mercenários de longe, antes da luta, não contam.
- **Final triste (13/10/2026, usuário):** depois que os três caem, um mercenário caído dá um último tiro e o Kael morre; a Adriana corre até ele.
- **Cutscenes finais em pixel art pelo PixelLab:** no feliz, o Kael beija a Adriana; no triste, o Kael morre nos braços dela. O usuário prefere animado, como GIF (a IA escolhe o formato: spritesheet animado no jogo, com GIF de prévia).
- **Ilustrações dos finais escolhidas (13/10/2026, usuário):** feliz = **opção 3**, close no beijo, à noite, com o poste; triste = **opção 1**, ela ajoelhada com o Kael no colo, na chuva, com o poste e a viatura. As placas em inglês da opção 3 foram trocadas pelos nomes das lojas da quadra 1: **"ÓTICA"** (Ótica Visão Clara) e **"MODAS"** (Modas Aurora).
- **Pulo sem invencibilidade:** bala que bate acerta; o pulo tem de passar por cima. O Kael é atlético e pula por volta de 1,5 m. Por isso o tiro do policial vira bala de verdade, com altura.
- **Agachar:** não anda, leva menos tiros e atira agachado (animações de mirar e atirar agachado). Pode ficar agachado a fase inteira, então **o policial reconhece o Kael agachado, agacha também e atira na mesma linha**.
- Plano em `plan/jump_crouch_cutscene.md` (aguardando aprovação).
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

### Nome do jogo, sons, tiro e menu (12/10/2026, usuário)
- **Nome do jogo: Saves Her** ("salvando ela"). Kael continua sendo o protagonista.
- **Sons:** o tiro da Colt 1911 (`colt_1911_shot`) é do Kael; o "single shot" é dos policiais. **Fuzil dos mercenários (13/10/2026, IA, aguardando o usuário):** AK-47 da Free Firearm Sound Library (CC0, de Ben Jaszczak, Brian Nelson, Kevin Heras e Matthew Nanney; https://opengameart.org/content/the-free-firearm-sound-library), gravações C_28P (um tiro, `rifle_shot.wav`, tocado 3 vezes na rajada) e C_34P (rajada natural de 3, `rifle_burst.wav`, guardada como alternativa). **Combo do Kael (13/10/2026, IA, aguardando o usuário):** todos CC0 do OpenGameArt. Golpe no ar (`swing.wav`, toca em todo golpe) = swish-1 do "Swishes Sound Pack" de artisticdude (https://opengameart.org/content/swishes-sound-pack). Soco acertando (`punch_hit.wav`) = qubodupPunch04 de Iwan 'qubodup' Gabovitch (https://opengameart.org/content/punch). Chute acertando (`kick_hit.wav`) = hit33 dos "37 hits/punches" de Independent.nu, enviado por qubodup (https://opengameart.org/content/37-hitspunches). Cortados e normalizados com ffmpeg. A OST é a música da quadra 1. Os passos de andar do Kael e dos policiais usam o "sneaker footsteps asphalt"; o "running sneakers" fica para a corrida.
- **Tiro contínuo:** depois do tiro, o Kael continua mirando; cada clique toca só o recuo, sem abaixar nem levantar o braço. Sem atirar por um tempo, volta para o `idle_gun`.
- **Pente da pistola: 8 balas.** Recarrega sozinho quando o pente acaba e com a tecla **R** a qualquer momento (com o pente pela metade, por exemplo).
- **Animações novas do Kael:** correr sem arma, correr com arma e recarregar, pelo PixelLab. Depois, correr com arma e recarregar também nos policiais.
- **Menu principal:** minimalista e cartunesco, no estilo do The Last of Us, com os itens alinhados à esquerda (New Game, Opções).
  - Título "Saves Her" em letras grandes e cheias, feito pelo PixelLab (pedido do usuário). Escolha da IA, aguardando o usuário: `assets/ui/title_logo.png` (degradê de pôr do sol); as outras 7 opções ficam em `assets/ui/drafts/title_logo/`.
  - Fonte dos itens: Pixelify Sans (OFL), salva em `assets/fonts/`. Fundo: a rua da quadra 1 no entardecer, escurecida e desfocada.
  - Opções: música, efeitos, tela cheia e língua (português padrão, inglês). Escolhas guardadas no navegador.
- Plano em `plan/sound_run_reload_menu.md`.
- **Pente e tipos de bala:** o pente carrega o tipo selecionado. Trocar de tipo devolve as balas do pente para a reserva e recarrega com o outro tipo.
- **Tecla R:** só recarrega (não reinicia mais a cena). Reiniciar fica no menu de pausa. Depois da morte, **Enter** reinicia (proposta da IA aprovada pelo usuário em 12/10/2026; o que acontece na derrota segue em aberto, item 14).
- **Tela de game over** (14/10/2026, pedido do usuário): quando o Kael cai, a tela escurece devagar e aparecem "GAME OVER", "Você perdeu" e uma frase triste sorteada (Adriana esperando, Kael caído). O "Pressione Enter para tentar de novo" pisca quando o Enter passa a valer (~3,6 s depois da queda) [TESTE]. Vale para a cena de teste; o que a derrota faz no jogo completo segue no item 14. Frases escritas pela IA, o usuário pode trocar (`src/i18n/`).
- **Controle touch e jogo no celular** (14/10/2026, pedido do usuário): os controles touch aparecem só no celular ou tablet (ponteiro principal é o dedo). Direcional à esquerda (anda, corre na ponta, agacha para baixo, pula para cima) e, à direita, Atirar, Pular, Mirar/Soco, Arma, Recarga e Bala; Pausa no alto. O jogo pede para virar o celular na horizontal e para enquanto estiver em pé. Tamanhos e distâncias [TESTE]. Plano: `docs/plan/touch_controls.md`.
- **Correr:** segurar Shift. O Kael **para** para atirar e para recarregar. Atirar correndo e recarregar andando ficam de fora por enquanto.
- **Menu em português**, com internacionalização (português e inglês).
- **OST** só quando a fase abre; o menu fica sem música.
- **Policiais** entram na arena correndo e recarregam depois de 8 tiros.
- **Corrida do Kael é sprint** (corpo inclinado, joelho alto, braços bombeando), com movimento orgânico. **Correndo com arma, a pistola fica numa mão só**; ao parar, ele junta as duas mãos de novo no `idle_gun` (12/10/2026, usuário).
- **Cabeça nas animações de corrida:** fica a desenhada pela IA em cada quadro, sem colar a cabeça da base (colar deixava recorte visível no pescoço). Ciclo de 9 quadros a 72 ms. Ao parar de correr armado, transição curta `run_gun_stop` (pistola numa mão → duas mãos no `idle_gun`). Animações aprovadas (12/10/2026, usuário).

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
- **Lista de controles nas Opções (13/10/2026, usuário):** sem caixa de controles ao começar a fase. As teclas ficam em **Opções → Controles** (no título e na pausa), numa lista tecla | ação em grupos: Movimento, Combate, Jogo e **Teste** (F1, K, C, [ ], N). No começo da fase, uma dica curta que aparece e some: "Controles: Esc → Opções → Controles", uma vez por sessão.

---

## 2. EM ABERTO

Ordenados por impacto. Os primeiros bloqueiam o design de progressão e o final.

1. **Nome da cidade** governada pelo Geraldo. Ainda não definido.
2. **Organização terrorista:** qual é o papel dela? Ela contratou o Geraldo, usa os mercenários ou só aparece como pano de fundo?
3. **Quem sabe que o Geraldo é o mandante:** governador, exército, figurões presos, ninguém? Isso define se alguém denuncia e por que não denuncia.
4. **Descoberta da corrupção:** cedo (busca por provas) ou tarde (virada)? Ligado ao item 4.
5. **Soldados das barricadas:** cúmplices conscientes ou só cumprem ordens? Afeta a culpa do Kael ao neutralizá-los.
6. ~~**Formato do final triste:** perder a Adriana, morrer, ou os dois? Ou índole baixa muda só o caminho até o final?~~ → DECIDIDO em 12/10/2026: índole abaixo de 50%, o Kael salva a Adriana (ou pode salvar) e morre; 50% ou mais, salva e sobrevive. Falta: como ele morre e onde fica o fim (ver `plan/jump_crouch_cutscene.md`).
7. **Efeitos da índole baixa na prática:** polícia caça com mais força, aliados se afastam, lojas fecham, NPCs mudam de fala?
8. **Cena de resgate da Adriana:** ela aparece viva? Diz algo sobre o sequestro ou sobre o Geraldo? Se nada importa, a cena final perde força.
9. **Chefes:** quantos existem? O Geraldo tem confronto direto ou só aparece por diálogo? Já decidido: o chefe da quadra 1 é o Roberto.
10. **Progressão do Kael:** como ganha força (equipamento roubado, habilidades, favores, itens). Quais são as habilidades?
11. **Tipo de bloqueio por quadra:** combate, infiltração, item ou contato. Cada uma com uma regra.
12. **Texto da cutscene do fim da quadra 1:** o que a imagem mostra e o que o texto diz.
13. **Ordem do fim da quadra 1:** a cutscene vem antes do Roberto (ao cair o último policial) ou depois da luta com ele?
14. **Derrota do Kael:** se a barra de vida do Kael esgotar primeiro, o que acontece? Recomeça a luta, a quadra ou outra coisa?
15. **Roberto e a índole:** matar o Roberto conta na barra de índole como os outros policiais, pesa mais ou não conta?
16. ~~**Loot de policial morto:** o loot vem só do policial nocauteado ou também do morto com bala letal?~~ **Respondido em 13/10/2026 (usuário):** o morto com bala letal solta munição em 50% das vezes; o nocauteado sempre solta.
17. **Tutorial da quadra 1:** o que a parte 1 ensina (atirar, pular, esconder, negociar, trocar de bala?). Já decidido: na parte 2 o jogador neutraliza policiais.
18. **Consequência de desistir:** se o jogador não atravessa uma barricada, o que acontece?
19. **Aliado dentro da polícia:** existe alguém que ajuda o Kael sem saber da corrupção? Se existir, quem é e o que cobra?
20. **Controles:** teclado e mouse decididos em 11/10/2026 (ver Tecnologia); R recarrega e Shift corre (12/10/2026). Falta: gamepad, pulo, dash e troca de bala (hoje Q ou roda do mouse, provisório).
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
- Chance do loot de munição: valor inicial **70% bala letal / 30% bala não letal** (provisório). Policial morto com bala letal solta a caixa em **50%** das vezes (13/10/2026, usuário; `DEATH_DROP_CHANCE` em `Loot.ts`).
- Cutscene de abertura (13/10/2026, IA): texto a 38 ms por letra com bipe a cada 2 letras (Adriana 880 Hz, Kael 440 Hz); câmera 3,4 s até o fim da rua e 2,2 s de volta; a Adriana fica 55 px à frente do mercenário que a segura (`HOLD_DX`); caixa de fala em cima, no céu (embaixo ficam os personagens).
- Combo sem arma (13/10/2026, IA): alcance `MELEE_REACH` 48 px à frente até a borda do corpo do policial; estrelinha `IMPACT_MS` 200 ms; emenda nos quadros de `COMBO` (`Test.ts`), iguais a `CHAIN_OUT`/`CHAIN_IN` do `build_melee.py`.
- **Luta com os mercenários e finais (13/10/2026, IA, fase 7):** a luta dispara aos 30% da última tela (`TRIGGER_AT`); cerco com um a 230 px atrás do Kael e dois a 260 e 400 px à frente, a no mínimo 60 px da borda; revezamento com 450 ms entre quem mira (`TURN_GAP_MS`); finais 1,2 s depois do último cair (no topo de `BossFight.ts`). Mercenário (`MERCENARY_ARCHETYPE` em `Mercenary.ts`): vida 5, chute do combo tira 3, mira 320 ms, rajada a cada 1,6 s, dano 6 por bala, 60% de acerto, pente de 4 rajadas, alcance 1000 px, agacha junto com o Kael em 650 ms, pula 20% das vezes quando o Kael mira nele. Último tiro do final triste: cano a 14 px do chão, chega a 60 px (`LAST_SHOT` em `Test.ts`). Finais (`ending.ts`): Adriana correndo a 170 px/s, abraço a 40 px do Kael, ajoelha a 62 px dele, o Kael cai 2,4 s antes de ela correr.
- **Seta de siga em frente (13/10/2026, IA):** 23x20 px ampliada 3x, amarela com contorno escuro (cores de interface, fora da paleta); 70 px da borda direita, a 40% da altura; acesa 380 ms e apagada 220 ms, com empurrão de 8 px; some depois que o Kael anda 360 px ou quando outra arena trava. No topo de `src/game/world/GoArrow.ts`; desenho em `tools/build_go_arrow.py`.
- **Ilustrações dos finais (13/10/2026, IA, fase 8):** 160x90 por quadro, 8 quadros em loop, ampliadas até a altura da tela (6x), centradas sobre fundo preto; feliz a 160 ms por quadro (só o casal mexe; as placas e o poste ficam fixos), triste a 120 ms (chuva); entram em 900 ms. Música: 60% do volume no feliz, silêncio no triste. A ilustração entra antes da tela de texto final; Enter avança. Valores em `src/game/cutscene/endingArt.ts`, `Cutscene.ts` e `ending.ts`; montagem em `tools/build_endings.py`.
- Quantidade de balas por loot e munição inicial do Kael.
- Vida e dano do Roberto na luta de chefe.
- **Combate do policial (12/10/2026, provisório):** atira a cada 1,8 s (±20%), alcance 600 px; segura a mira 0,45 s antes do tiro; acerta 70% das vezes, com dano 8 (vida do Kael 100). Kael atingido pisca em vermelho por 0,22 s. Loot do nocaute: 3 balas por caixa (70% letal / 30% não letal), pega a 28 px. Valores no arquétipo `patrol` (`src/game/actors/Police.ts`), no topo de `Loot.ts` e de `Test.ts`.
- **Tiro contínuo do policial (13/10/2026, usuário, provisório):** em vez de um tiro por vez, dá uma sequência de 2 a 3 tiros (300 ms entre eles); entre as sequências segura a arma apontada e espera 0,8 s (±20%), sem novo aviso; abaixa para recarregar, quando o Kael sai do alcance ou muda de postura. A espera com a arma abaixada caiu de 1,8 s para 1,3 s. Plano `docs/plan/enemy_ai_difficulty.md`, fase 1.
- **Policial esperto (13/10/2026, usuário, provisório):** mira 2x mais rápida, aviso sorteado de 150 a 380 ms, sequência de 1 a 4 tiros, espera de 0,8 s variando de 40% a 160%. Lê os pulos e as agachadas recentes do Kael e escolhe atirar alto ou baixo; desvia da bala do Kael (45%: agacha da alta, pula da baixa, de perto não dá tempo); atira logo quando o Kael recarrega ou chega sem arma. Valores em `smart` do arquétipo `patrol` (`Police.ts`) e no topo de `Gunner.ts`. Os mercenários continuam com a IA simples.
- **Tiro e pente (12/10/2026, provisórios):** pente de 8; começo com 8 letais no pente e reserva letal 4, não letal 6; intervalo mínimo entre tiros 270 ms (o recuo); abaixa a arma depois de 1,2 s sem tiro nem botão direito; recarga de 2,08 s (o som `colt_reload`), parado (**13/10/2026: 1,21 s, o som `colt_reload_fast`**, plano `playtest_fixes_1.md` fase 6); volume da recarga 0,55 e do clique seco 0,5. No topo de `src/game/scenes/Test.ts` e de `Sfx.ts`.
- **Sons (12/10/2026, provisórios):** volumes da música 0,15 (era 0,45; o usuário achou alta demais, 12/10/2026), tiro do Kael 0,6, tiro do policial 0,5, passo do Kael 0,35, passo do policial 0,18; o som cai com a distância da câmera (cheio até meia tela, mínimo 0,12) e vai para o lado em que está (pan até 0,7); tom varia ±4%; fade de entrada da música 2,5 s. No topo de `src/game/audio/Sfx.ts`.
- Duração do ciclo do entardecer para a noite: valor inicial 8 minutos (provisório); **3 minutos desde 13/10/2026** (playtest). O relógio na tela vai de 17:30 a 19:30, e as teclas `[` e `]` mudam a hora na cena de teste.
- **Faixas do ciclo (11/10/2026, provisórias):** a noite cobre o entardecer de 25% a 95% do ciclo; as lojas acendem entre 50% e 80%; os postes, entre 60% e 72%; as estrelas aparecem de 55% a 95%. Ficam no topo de `src/game/world/Street.ts` e `Sky.ts`.
- **Sangue (13/10/2026, provisório):** respingo de 6 a 10 gotas (1 a 2 px) no tiro letal e em todo tiro no Kael; 2 a 3 gotas, sem poça, na bala não letal; quem fica em pé pinga uma gota a cada 0,6 s por 2,4 s; manchas no chão ficam 6 s e somem em 2,5 s, no máximo 80; com chuva somem até 3 vezes mais rápido. No topo de `src/game/actors/Blood.ts`.
- **Chuva (13/10/2026, provisória):** 50% por jogada, começa entre 70% e 85% do ciclo, chega ao máximo em 15 s e segue até o fim; 240 riscos atrás e 110 na frente, inclinação 0,18; véu azul-escuro de até 22%; volume do loop 0,15 (era 0,5, que ficava ~4 dB acima da música; agora ~6 dB abaixo, em 13/10/2026); nos finais o som baixa para 40% em 1,5 s quando a cutscene começa e vai a zero em 0,9 s quando entra a ilustração (`RAIN_LOW` em `ending.ts`). Tecla N liga e desliga na cena de teste. No topo de `src/game/world/Rain.ts`.
- **Dica dos controles (13/10/2026, IA):** fica 4 s na tela, no alto, entrando e saindo em fade, sem pausar o jogo (`TOAST_MS` em `src/ui/Toast.tsx`).
- **Sombras nos pés (13/10/2026, provisória):** elipse de pixel duro, preta com alfa 0,45 e 6 px de altura, na linha do chão e atrás de todos os personagens. A largura segue os pixels das 4 linhas de baixo do quadro, mais 3 px de folga de cada lado (mínimo 18, máximo 110): em pé cobre os pés, deitado cobre o corpo. No pulo encolhe e clareia até 45% a 90 px de altura. Kael, Adriana, policiais e mercenários. No topo de `src/game/world/Shadows.ts`.
- **Ondas das barricadas (12/10/2026, provisórias):** a arena dispara 320 px antes da barricada, que fica a 200 px da borda direita da tela travada; um policial a cada 1,1 s, 1,5 s entre ondas; corpos somem depois de 2,5 s. Barricada 1 com 2 ondas (2 e 3 policiais), barricada 2 com 3 ondas (2, 3 e 3). Constantes no topo de `src/game/actors/Waves.ts`; ondas em `level_1.ts`.
- **Pulo do Kael (12/10/2026, provisório):** Espaço, W ou ↑; 180 px parado e 240 px correndo, 85 px de altura (~1,5 m), cerca de 0,8 s no total. No topo de `src/game/scenes/Test.ts` e em `JUMP_MS` (`humanoid.ts`).
- **Bala do policial (12/10/2026, provisória):** 650 px/s, alcance 1100 px; `hitChance` decide se mira o peito (55 ± 8 px do chão; **subiu para 85 ± 3 na fase 2**, ver abaixo) ou passa por cima (112 a 126 px); caixa do corpo do Kael com 100 px em pé e 80 px no ar, meia largura 12 px. No topo de `src/game/actors/Bullets.ts` e `Test.ts`.
- **Agachar e bala do Kael (12/10/2026, provisórios):** S, ↓ ou Ctrl agacha (Ctrl acrescentado a pedido do usuário; Command fica de fora); caixa agachada de 78 px (medida no sprite; **86 px com a pose ajoelhada**, ver abaixo); bala do Kael a 1400 px/s, saindo a 91 px do chão em pé e 64 px agachado (**73 px ajoelhado**); o tiro do policial em pé vai a 85 ± 3 px (**93 ± 3 px com a pose ajoelhada**; passa por cima do agachado); troca de pose mirando com as animações a 2x. No topo de `src/game/scenes/Test.ts`.
- **Pulo e agachar dos policiais (12/10/2026, provisórios, fase 3):** arquétipo `patrol` em `src/game/actors/Police.ts`: agacha para recarregar (`crouchReload`); parado, copia a postura do Kael depois de 450 ms (`matchCrouchMs`); ajoelhado atira baixo, saindo a 73 px e chegando a 64 ± 3 px do chão (`COP_LOW_H` em `Test.ts`), o que acerta o Kael em pé e ajoelhado e passa por baixo dele no pulo; o policial ajoelhado tem 86 px (o tiro do Kael em pé passa por cima). Pulo para a frente (150 px, 70 px de altura): 40% de chance ao chegar no ponto de parada e 15% quando o Kael começa a mirar nele, sem chegar a menos de 180 px do Kael. Levando tiro, levanta (o tranco é em pé).
- **Mercenários e van (13/10/2026, provisórios, fase 5):** a fase cresceu para 4800 px (5 telas); a quinta é a arena dos mercenários, com três fachadas novas (ótica, lanchonete e armarinho). Mercenários em x = 4330, 4420 e 4700, virados para West; van em x = 4560, escala 1,5 (`VAN_SCALE` em `Props.ts`). Rajada de 3 tiros (14 quadros, ~0,9 s) com o som `rifle_shot` a 0,5. Posições em `level_1.ts` (`boss`).
- Câmera: zona morta de 1/4 da tela, olhar à frente de 120 px (troca de lado em 0,9 s), suavização 0,12 por quadro. Fase de teste com 3840 px (**4800 px desde a fase 5**). Ficam no topo de `src/game/world/CameraRig.ts`.
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
| 12/10/2026 | Nome do jogo: Saves Her. Sons (Colt 1911 no Kael, single shot nos policiais, OST na quadra 1, passos de andar e de correr); tiro contínuo sem abaixar o braço; pente de 8 com recarga automática e na tecla R; corrida e recarga do Kael e dos policiais; menu principal estilo The Last of Us. Plano `sound_run_reload_menu.md` | Usuário |
| 12/10/2026 | Respostas do plano `sound_run_reload_menu.md`: pente carrega o tipo selecionado (trocar recarrega); R só recarrega; Shift corre; parar para atirar e recarregar; menu em português com i18n (pt e en); OST só na fase; policiais entram correndo e recarregam a cada 8 tiros | Usuário |
| 12/10/2026 | Depois da morte, Enter reinicia; fase 1 (sons) implementada | Usuário aprovou a proposta da IA |
| 12/10/2026 | Fase 1 aprovada; fase 2 (tiro contínuo, pente de 8, recarga provisória, clique seco) implementada com valores provisórios | Usuário pediu; valores da IA |
| 12/10/2026 | Corrida em sprint; correndo com arma, pistola numa mão só, duas mãos ao parar | Usuário |
| 12/10/2026 | Corrida do Kael (`run`, `run_gun`, `run_gun_stop`) aprovada e ligada no jogo; cabeça desenhada pela IA, sem colagem | Usuário |
| 12/10/2026 | Recarga do Kael (`reload_gun`): keyframe seed 11, 11 quadros de 190 ms sincronizados com o `colt_reload`; cabeça desenhada pela IA | Usuário mandou iniciar a fase 4; keyframe recomendado pela IA |
| 12/10/2026 | Corrida e recarga dos policiais (fase 5): master e `police_a` gerados; policial entra correndo e anda os últimos 70 px; pente de 8 e recarga com som; passos de corrida mais baixos. Valores [TESTE] | Usuário mandou implementar a fase 5; valores da IA |
| 12/10/2026 | Recarga do policial: mãos por cima do rosto colado na recarga inteira e pente/mão esquerda devolvidos do Kael; `police_b` e `police_c` geradas, fase 5 completa | Usuário apontou a mão e o pente sumindo e pediu para terminar a fase 5 |
| 12/10/2026 | Fase 6 (menu principal): logo "Saves Her" do PixelLab (escolha da IA, `sunset_1`), fundo da rua da quadra 1, fonte Pixelify Sans, opções (música, efeitos, tela cheia, língua), pausa no mesmo visual, textos em `src/i18n/` (pt e en); tecla M saiu | Usuário pediu o menu e o título pelo PixelLab; escolhas visuais da IA |
| 12/10/2026 | Pulo para a frente (esquiva de bala) e agachar, com e sem arma, no Kael e nos policiais; cutscene de abertura animada estilo anos 90 com a Adriana e três captores no fim da rua; finais pela índole (abaixo de 50% triste: salva e morre; 50% ou mais feliz). Plano `jump_crouch_cutscene.md` | Usuário |
| 12/10/2026 | Respostas do plano `jump_crouch_cutscene.md`: três mercenários do Geraldo (ele não aparece) seguram a Adriana no fim da rua; só a fase atual, como exemplo; resgate nesta fase; mercenários são os chefes, com corpo de policial; finais no fim da cena de teste; pulo sem invencibilidade (~1,5 m); agachado não anda, leva menos tiro e atira; policial agacha e atira baixo quando o Kael agacha | Usuário |
| 12/10/2026 | Mercenários de fuzil, feitos do zero (base e todas as animações); os três atacam juntos e cercam o Kael; matar mercenário não tira índole | Usuário |
| 12/10/2026 | Cutscenes finais em pixel art (PixelLab), animadas: feliz com o beijo do Kael e da Adriana; triste com o Kael morrendo nos braços dela | Usuário |
| 12/10/2026 | Plano `jump_crouch_cutscene.md` aprovado. Fase 1: pulo do Kael (Espaço/W/↑, para a frente, mais longe correndo) e bala do policial de verdade, que voa e acerta pela caixa do corpo (o pulo desvia) | Usuário aprovou o plano; valores [TESTE] da IA |
| 12/10/2026 | Fase 2: agachar do Kael (S/↓, não anda, mira e atira agachado); a bala do Kael também voa e é desenhada no Phaser até os policiais; o Kael atira para o lado em que olha (A/D viram, o mouse não vira mais) | Usuário |
| 12/10/2026 | Policial em pé atira alto (o agachar desvia); a bala baixa do policial agachado (fase 3) é a que o pulo desvia. Medida: o Kael agachado tem 78 px | IA, pelas medidas do sprite; [TESTE] |
| 12/10/2026 | Agachar do Kael refeito: em vez de cócoras, **ajoelhado** (joelho esquerdo no chão, perna direita dobrada, arma apontada para a frente), com o rosto da base em todos os quadros. Kael ajoelhado com 86 px; o tiro do policial em pé subiu para 93 ± 3 px para continuar passando por cima | Usuário (pose); IA (medidas, [TESTE]) |
| 12/10/2026 | Correção do ajoelhado: a calça mantém as sombras (4 tons do jeans) e o tênis o branco em todos os quadros, e o joelho da frente não sai mais cortado | Usuário |
| 12/10/2026 | Fase 3: pulo e ajoelhado nos policiais (master e as três variantes; mira, tiro e recarga ajoelhados). IA do `patrol`: agacha para recarregar, agacha junto com o Kael e atira baixo (o pulo desvia), pula para a frente ao chegar ou quando o Kael mira nele | Usuário (comportamento, no plano); IA (valores [TESTE]) |
| 13/10/2026 | Fase 3 (pulo e ajoelhado nos policiais) aprovada; começa a fase 4 (Adriana) | Usuário |
| 13/10/2026 | Base da Adriana aprovada: opção A (vestido vermelho de alças com saia rodada até o joelho, cabelo ruivo longo e ondulado, salto preto), com o rosto refeito (nariz pequeno e delicado, **olhos verdes**). 103 px de altura, chão y=120, paleta de 33 cores tirada da base. `assets/characters/adriana/adriana_base_east.png` | Usuário |
| 13/10/2026 | Animações da Adriana (held, cry, freed, kneel, hug) e retratos de frente, 64x64, da Adriana e do Kael para a caixa de fala, aguardando aprovação | IA (arte, a aprovar) |
| 13/10/2026 | Fase 4 aprovada: animações da Adriana e retratos da Adriana e do Kael; começa a fase 5 (mercenários e van) | Usuário |
| 13/10/2026 | Base do mercenário aprovada: opção A (balaclava preta, farda e colete verde-oliva, fuzil baixo nas duas mãos), 109 px, chão y=121, paleta de 28 cores tirada da base (`assets/enemies/mercenaries/master/mercenary_master_base_east.png`). Van escura com a porta lateral aberta aprovada (`assets/levels/level_1/props/van.png`; a escala na cena fica [TESTE]) | Usuário |
| 13/10/2026 | Animações do mercenário aprovadas (idle, andar, correr, mirar, rajada de 3, recarga, ajoelhar e tiro ajoelhado, pulo, dano, nocaute, morte e segurar a Adriana); tons da farda olive, ranger e coyote por canvas | Usuário ("pode implementar"); tons [PROPOSTA] da IA |
| 13/10/2026 | Mercenários e van na cena de teste: fase com 4800 px, arena dos mercenários na quinta tela, van com escala 1,5 | IA, [TESTE] |
| 13/10/2026 | Som do fuzil: AK-47 da Free Firearm Sound Library (CC0), um tiro por clarão da rajada | IA, aguardando aprovação do usuário |
| 13/10/2026 | Policial morto com bala letal solta munição em 50% das vezes (item 16 respondido) | Usuário |
| 13/10/2026 | Combo corpo a corpo do Kael sem arma (socos e chute), que só nocauteia e é só do Kael. Plano `melee_combo.md`, aguardando aprovação | Usuário (pedido); IA (proposta do plano) |
| 13/10/2026 | Plano `melee_combo.md` aprovado: combo no botão direito sem arma, jab → direto → chute giratório, um combo sempre nocauteia o policial, estrelinha de impacto desenhada no Phaser; a cutscene de abertura espera o combo | Usuário |
| 13/10/2026 | Animações do combo aprovadas ("10/10"): jab, direto com quadros próprios de transição (sai do jab esticado, mãos altas) e chute refeito a partir do quadro esticado aprovado (mesma perna, volta recolhendo o joelho); no combo, o golpe seguinte pula os quadros de mão baixa | Usuário |
| 13/10/2026 | Combo no jogo (fase 3): socos dão o tranco sem tirar vida, o chute nocauteia e solta a caixa; alcance 48 px; estrelinha de impacto branca e amarela (cores de efeito); sem sons por enquanto | IA, [TESTE] |
| 13/10/2026 | Sons do combo (CC0, OpenGameArt): golpe no ar em todo golpe, soco e chute ao acertar | IA, aguardando aprovação do usuário |
| 13/10/2026 | Cutscene de abertura: tela de texto antes (rascunho do `story.md`, seção 5) e segunda fala da Adriana sem revelar o Geraldo ("Eles vão me levar! Me ajuda!") | Usuário |
| 13/10/2026 | Cutscene de abertura no jogo (fase 6): faixas pretas, câmera até a Adriana presa e de volta, falas com retrato e bipe; Esc pula; toca uma vez por jogo; depois a OST e a ajuda dos controles | IA, [TESTE] |
| 13/10/2026 | Cutscene de abertura aprovada ("ficou muito bom") | Usuário |
| 13/10/2026 | Final triste: um mercenário caído dá o último tiro e o Kael morre | Usuário |
| 13/10/2026 | Fase 7: mercenários levam dano (vida 5; o chute do combo tira 3, socos só o tranco), barra de vida e "!" de mira em vermelho (cores de efeito), revezamento no tiro, finais pela índole com tela de texto e volta ao título; textos dos finais propostos | IA, [TESTE] e textos aguardando aprovação |
| 13/10/2026 | Correção: antes da luta, a bala do Kael só acerta os mercenários com ele já na última tela (de longe passa por eles). Um tiro da barricada começava a luta e travava a câmera na arena sem o Kael | Usuário (bug); IA (correção) |
| 13/10/2026 | Seta de "siga em frente" em pixel art, piscando, depois de cada barricada vencida; tiros de longe nos mercenários não contam | Usuário (pedido); IA (desenho e tempos [TESTE]) |
| 13/10/2026 | Final feliz com os dois se beijando | Usuário |
| 13/10/2026 | Ilustrações dos finais: feliz = opção 3 (close no beijo), triste = opção 1 (ela com o Kael no colo, na chuva) | Usuário |
| 13/10/2026 | Placas da ilustração do final feliz com os nomes das lojas da fase: "ÓTICA" e "MODAS" | Usuário (pedido); IA (letras) |
| 13/10/2026 | Fase 8: ilustrações animadas no jogo (passo `art` da cutscene, antes da tela de texto final), música mais baixa no feliz e silêncio no triste | IA, [TESTE] |
| 13/10/2026 | Abertura: a 4ª linha passa a ser "Levaram ela para o fim desta rua. Tem barricada da polícia o caminho todo." (sai o prédio na Capital e as cinco quadras) | IA (texto); usuário (aprovou) |
| 13/10/2026 | Recarga agachada do Kael ganha animação nova (`crouch_reload_gun`) | Usuário |
| 13/10/2026 | Ciclo do entardecer à noite de 3 minutos (era 8), [TESTE] | Usuário |
| 13/10/2026 | Sangue no Phaser a cada tiro que o Kael leva ou acerta; bala não letal solta só um respingo pequeno | Usuário |
| 13/10/2026 | Recarga do Kael de ~1,2 s (era 2,08 s); policiais seguem como estão | Usuário |
| 13/10/2026 | Chuva aleatória à noite, no fim da fase: em umas jogadas chove, em outras não (detalhes no plano `playtest_fixes_1.md`, aguardando aprovação) | Usuário |
| 13/10/2026 | HUD nova feita no PixelLab, no estilo de X-Men: Mutant Apocalypse: rosto do Kael, nome, barra de vida e, embaixo, a de índole com uma balança (a cor muda com o valor; a balança pende quando ela está baixa) | Usuário |
| 13/10/2026 | Seletor de arma como no GTA: punho sem arma, pistola com arma; a tecla 1 troca e os dois espaços aparecem por ~1 s. Pente vermelho = bala letal, azul = não letal | Usuário |
| 13/10/2026 | Ordem do plano `playtest_fixes_1.md`: a HUD (fases 8 e 9) vem antes dos corpos, do sangue e da chuva; uma fase por vez, com o aval do usuário | Usuário |
| 13/10/2026 | Peças da HUD escolhidas: rosto D (dentes cerrados), balança D, moldura do rosto C (cantos chanfrados), moldura da barra C (fina). A balança pendendo foi editada no PixelLab; a índole pende abaixo de 35% [TESTE] | Usuário |
| 13/10/2026 | Seletor de arma e pentes: punho B (de lado), pistola D pintada nos cinzas da arma do Kael (pedido do usuário: "precisa ser cinza"), pente B em vermelho (letal) e azul (não letal). As balas do pente foram desenhadas à mão (5x10 px) | Usuário |
| 13/10/2026 | Corpos no chão (fase 3): nos quadros em que o mercenário ou o policial nocauteado já deitou, o corpo desce até o chão e a arma solta do último quadro fica no chão, na frente dele | Playtest do usuário |
| 13/10/2026 | Sangue no Phaser, sem arte nova: respingo na direção da bala, gotas que caem e viram mancha no chão, pinga por um tempo; tons da paleta de sangue escurecidos pela luz ambiente. Bala não letal só dá um respingo pequeno; o combo não sangra | Plano `playtest_fixes_1.md`, aprovado pelo usuário |
| 13/10/2026 | Chuva aleatória à noite: 50% por jogada (mesma seed dos policiais, `?seed=`), começa entre 70% e 85% do ciclo e vai até o fim da fase. Som: "Rain (loopable)" de Ylmir, faixa 1 (CC0, https://opengameart.org/content/rain-loopable), em `assets/sounds/rain_loop.ogg` e `.mp3` | Plano aprovado; som escolhido pela IA, aguardando o usuário |
| 13/10/2026 | Plano `playtest_fixes_1.md` aprovado na jogada ("gostei muito do resultado"); ajustes seguintes no plano `playtest_fixes_2.md` | Usuário |
| 13/10/2026 | Sem a caixa de controles no começo da fase: os controles vão para Opções → Controles, numa lista de teclas com grupo "Teste"; no começo, só uma dica curta que aparece e some | Usuário |
| 13/10/2026 | Chuva mais baixa (fica acima da música hoje); nos finais ela baixa e, quando entra a ilustração da cutscene, some de vez | Usuário |
| 13/10/2026 | Sombra redonda nos pés do Kael, da Adriana, dos policiais e dos mercenários | Usuário |
| 13/10/2026 | GDD reescrito na versão 0.4 com o estado atual do jogo; `docs/tests.md` criado com os cenários e resultados de todos os planos (planos anteriores contam como aprovados na jogada do usuário) | Usuário |
| 13/10/2026 | Volume da chuva (0,15; 40% nos finais e zero na ilustração) e sombras nos pés aprovados na jogada: nada pendente no plano `playtest_fixes_2.md` | Usuário |
| 13/10/2026 | Versão 0.1 = a quadra 1 jogável registrada em `tests.md`; o que ficou fora (quadras 2 a 5, itens em aberto e propostas) está em `docs/later_ideas.md` | Usuário |
| 13/10/2026 | Policiais atiram em sequência (2 a 3 tiros seguidos) e seguram a mira entre as sequências; plano `enemy_ai_difficulty.md` criado (mais tiros, desviar da bala do Kael, aproveitar as aberturas dele) | Usuário |
| 13/10/2026 | Policiais mais espertos: mais rápidos, menos previsíveis, adivinham se o Kael vai pular ou agachar, desviam da bala dele e aproveitam a recarga | Usuário |
| 14/10/2026 | Tela de game over: escurece, "GAME OVER", "Você perdeu", frase triste e Enter reinicia | Usuário |
| 14/10/2026 | Versão 0.1 do jogo fechada: README criado, documentos atualizados, commit e tag `v0.1` publicados na `main` | Usuário ("fechamos então a primeira versão do game") |
| 14/10/2026 | Spritesheets em grade de até 8 quadros por linha: as tiras largas travavam o jogo publicado | Erro relatado pelo usuário no build da web |
| 14/10/2026 | Versão 0.1.1 (tag `v0.1.1`): a 0.1 com o build da web corrigido (caminhos relativos, sem rascunhos, sheets em grade) | Usuário |
| 14/10/2026 | Controles touch só no celular (direcional + botões), jogo responsivo para Android e iOS e aviso para virar na horizontal | Usuário |
| 14/10/2026 | Versão 0.1.2 (tag `v0.1.2`): controle touch e celular, mais o `?v=<build>` contra o cache da hospedagem | Usuário |
