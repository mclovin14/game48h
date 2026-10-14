# Handoff do projeto Kael

Use este arquivo para continuar o projeto em outra IA (Gemini, GPT ou outra sessão do Claude).

**O que passar para a nova IA, nesta ordem:**
1. `CLAUDE.md` (raiz): regras de trabalho, estrutura de pastas, como rodar, padrão de sprites e pipeline. Vale para qualquer IA, não só o Claude.
2. Este `docs/handoff.md`.
3. `docs/decisions.md` (fonte da verdade) e `docs/GDD.md`.
   Para saber o que já foi testado e o que ficou sem verificação: `docs/tests.md`. O que ficou fora da versão 0.1: `docs/later_ideas.md`.
4. Se a tarefa for de história: `docs/story.md`. Se for continuar um plano: o arquivo em `docs/plan/`.

Atualizado em 14/10/2026: **versão 0.1 do jogo fechada** (tag `v0.1` na `main`). Nesta sessão entraram a IA esperta dos policiais, a tela de game over e o `README.md`; o GDD foi para a versão 0.5.

---

## Como a IA deve trabalhar com este projeto

- Leia `docs/decisions.md` antes de responder. Tudo que estiver em **DECIDIDO** é fixo. Não mude sem perguntar.
- Itens em **EM ABERTO** devem ser perguntados ao usuário, nunca preenchidos por conta própria.
- Itens em **AJUSTAR EM TESTE** podem ser sugeridos com um valor inicial, mas sempre marcados como provisórios.
- Use o **modo Grill Me**: faça perguntas que aprofundem o design antes de propor soluções. Uma ou duas perguntas por vez, no máximo cinco.
- Responda em **português do Brasil**.
- Não invente nomes de personagens, locais ou organizações. Se faltar um nome, pergunte. Exceção: nomes de lojas nas fachadas (fictícios, PT-BR, sem marca real), que o usuário pode vetar.
- **Planeje antes de implementar.** Para tarefa grande, escreva o plano em `docs/plan/<nome>.md` e só implemente depois que o usuário aprovar. Quando o usuário disser "não implemente ainda", não crie nem instale nada.
- Pare para o usuário revisar nos pontos marcados nos planos (por exemplo, depois da primeira variante do policial).
- Toda decisão nova vai para o `docs/decisions.md` com data e fonte, e para o histórico. Não apague decisões antigas.

## Glossário (nomes fixos)

| Termo | Significado |
|---|---|
| Kael | Protagonista, policial. Nunca "Kyle" ou "Caio". |
| Adriana | Noiva do Kael, filha do governador de Florentins. |
| Geraldo | Delegado, chefe do Kael, mandante do sequestro. |
| Roberto | Tenente, braço direito do Geraldo, corrupto. Chefe da quadra 1. |
| Florentins | Estado do jogo. |
| Brasilins | País (contexto, não aparece no jogo). |
| Capital | Onde fica o prédio em que a Adriana está presa. (Antes registrado por engano como "Catal".) |
| Quadra | Uma das cinco fases até a Capital. |
| Barra de índole | Medidor moral. Cai ao matar policiais. |

## Stack técnica

| Camada | Escolha |
|---|---|
| Jogo | Phaser 4.2 (física Arcade configurada, ainda não usada) |
| Interface | React 19.3: menus, HUD e diálogos, por cima do canvas |
| Build | Vite 8.3 (`publicDir: 'assets'`) |
| Linguagem | TypeScript 7.0, modo estrito |
| Resolução | 960x540, `Scale.FIT`, `pixelArt: true` |
| Sprites | PixelLab + scripts Python em `tools/` (numpy e Pillow) |
| Arte de apoio | Gemini ou GPT, sempre pixelizada antes de usar |
| Vídeos | Remotion (React) |

As versões ficam travadas no `package-lock.json`. Não atualize pacote sem pedir.

---

## Estado atual do projeto

**Build web (14/10/2026):** `npm run build` gera `dist/` (~23 MB) com caminhos relativos (`base: './'` no `vite.config.ts`) e sem `drafts/` nem `sounds/source/` (plugin `dropDrafts`). Testado servido numa subpasta: título, jogo e game over sem erro nem arquivo faltando.

**Versão 0.1 (14/10/2026, tag `v0.1`):** a quadra 1 jogável do começo ao fim. O resumo para quem chega fica no `README.md`; o que ficou fora, no `docs/later_ideas.md`.

### Design
- Premissa, elenco, barra de índole, arsenal (pistola com bala letal e não letal) e quadra 1 decididos.
- Muita coisa em aberto: ver `docs/decisions.md`, seção 2. A que mais trava é a progressão do Kael (item 10).

### Arte
- **Kael** (`assets/player/`): `idle`, `walk`, `run`, `idle_gun`, `walk_gun`, `run_gun`, `run_gun_stop`, `reload_gun`, `aim_gun`, `shoot_gun`, `death`, todos virados para East, 128x128. A corrida é montada por `tools/build_run.py` a partir dos brutos em `assets/player/drafts/` (cabeça da IA, sem colar a da base).
- **Policial master** (`assets/enemies/police/master/`): `idle_gun`, `walk_gun`, `run_gun`, `reload_gun`, `aim_gun`, `shoot_gun`, `jump_gun`, `crouch_gun`, `crouch_aim_gun`, `crouch_shoot_gun`, `crouch_reload_gun`, `death`, `hurt`, `knockout`. Paleta própria de 24 cores em `palette_master.json`. Rosto provisório.
- **Cabeças das variantes** (`police_a` negro, `police_b` branco e loiro, `police_c` asiático): **aprovadas** (11/10/2026). Prévia em `assets/enemies/police/drafts/heads_options.png`, brutos em `drafts/head_<id>_raw.png`, rampas em `variants.json`.
- **Variantes `police_a`, `police_b`, `police_c`** (`assets/enemies/police/<id>/`): as 7 animações de cada, **aprovadas** (12/10/2026). Comparações em `drafts/<id>_vs_master.png` e `drafts/variants_side_by_side.png`. No jogo, pela classe `Police` (`src/game/actors/Police.ts`), com a variante sorteada no spawn. O master não é mais carregado.
- **Cenário da quadra 1** (`assets/levels/level_1/`): mistura dos conceitos A e B. São 8 fachadas (`facades/<nome>_{dusk,night,lights}.png`): bakery, pharmacy, grocery, shoe_store, optician, snack_bar, haberdashery e clothing. Também tem a silhueta repetível (`skyline_dusk.png` + `skyline_lights.png`) o poste (`props/lamp_post.png`), o chão (`ground.png`, bloco de 128x104 montado por `tools/build_ground.py` a partir da faixa da IA) e os objetos (`props/car.png`, `hydrant.png`, `trash_bin.png`, `barricade.png`, recortados por `tools/build_props.py`, que também gera `drafts/props_on_green.png` para conferir buracos). Os brutos do PixelLab ficam em `drafts/` (`<nome>_dusk_x.png` e `<nome>_night_x.png` são os finais ampliados), e `tools/build_background.py` monta tudo a partir deles. As luzes têm cores fora da paleta do Kael. A remoção de fundo do PixelLab apagou o tijolo da farmácia, da sapataria e da lanchonete; o script redesenha a parede (`fill_walls`, tijolo 7x3 nas cores que sobraram) e tapa qualquer furo dentro da parede. **Ao gerar fachada nova, confira sobre fundo verde se a parede saiu inteira.**
- Rascunhos e brutos do PixelLab ficam em `assets/enemies/police/drafts/`. Os IDs dos jobs estão em `assets/enemies/police/transfer_jobs.txt`.

### Código (cena de teste)

Plano implementado: `docs/plan/web_stack_setup.md`. Rodar com `npm install` e `npm run dev`, depois abrir http://localhost:5173.

O que a cena `Test` faz:
- Tela de título (React) → cutscene de abertura → cena de teste. A caixa de controles saiu: no começo, uma dica curta (`Toast`) avisa "Controles: Esc → Opções → Controles", uma vez por sessão. A lista de teclas fica em Opções → Controles.
- O Kael começa **sem arma**. A tecla **1** saca ou guarda, só com ele livre (sem estar mirando nem atirando).
- **Arma (fase 2 do `sound_run_reload_menu.md`):** pente de 8 do tipo selecionado e reserva por tipo (`mag` e `reserve` em `Test.ts`). Depois do tiro ele segura a mira (só o recuo repete); abaixa depois de 1,2 s sem tiro. **R** recarrega parado (modo `reloading`); o pente vazio recarrega sozinho; sem bala nenhuma, clique seco. Q troca o tipo e recarrega.
- **A/D ou setas** andam, com ou sem arma, por uma fase de 5 telas (4800 px).
- **Cenário e ciclo de tempo** (fase 2): céu em degradê feito no código, silhueta da cidade no fator 0,3 e fachadas das lojas no plano do jogador, com postes nas divisas entre os prédios. Em 3 minutos (era 8) a cena vai do entardecer (17:30) à noite (19:30) e para ali. Lojas e postes acendem piscando, cada um na sua hora, e a luz ambiente tinge o Kael, o policial e o chão. O relógio fica no canto superior direito, e **[** e **]** voltam ou avançam 12 minutos.
- **Câmera** (fase 1 do plano `world_camera_enemies.md`): segue o Kael com zona morta de 1/4 da tela, olhar à frente de 120 px para o lado em que ele olha, suavização e limites da fase. A tecla **C** mostra a zona morta (azul) e o ponto seguido (amarelo).
- **Botão direito** (segurar) mira: toca `aim_gun` e congela no último quadro. Ao soltar, toca `aim_gun` ao contrário.
- **Botão esquerdo** atira com a mira levantada. Sem mira, levanta a arma e atira sozinho (`pendingShot`).
- O Kael atira para o lado em que olha. A/D viram, inclusive mirando ou agachado; o mouse não vira (pedido do usuário, 12/10/2026).
- **Q ou roda do mouse** troca entre bala letal e não letal.
- A bala do Kael voa (`kaelBullets`, 1400 px/s, até 900 px) e acerta o primeiro policial em pé que cruzar. Em pé sai alta (91 px); ajoelhado, mais baixa (73 px).
- O **policial** leva 2 tiros:
  - o primeiro toca `hurt` e ele volta para `idle_gun`;
  - no segundo, a bala letal toca `death` e tira 1 ponto da índole, e a não letal toca `knockout`.
- Ele fica virado para o Kael enquanto está em pé e atira de volta (ver Combate, abaixo).
- **Ondas (fase 5 do `world_camera_enemies.md`):** perto de cada barricada (x 2440 e 3700) a câmera trava, o Kael fica preso na tela e os policiais entram um de cada vez pelos lados definidos em `level_1.ts`. Cada um tem uma aparência (cabeça + tom de farda) do `EnemyDirector`, sem repetir na tela nem em seguida e, quando dá, sem repetir cabeça ou tom de quem está na tela. Quando a última onda cai, a câmera solta. **F1** mostra a seed, a onda e a aparência de cada policial; `?seed=...` na URL repete o sorteio.
- **Combate (fase 6 do `world_camera_enemies.md`):** o policial parado mira, segura a mira um instante (aviso) e atira; o tiro acerta com chance e tira vida do Kael, que pisca em vermelho. Vida zerada: o Kael morre, a tela de game over (`ui/GameOver.tsx`, evento `game:over`) escurece com "GAME OVER", "Você perdeu" e uma frase triste, e Enter reinicia. O nocaute solta uma caixa de munição (`actors/Loot.ts`) que o Kael pega passando por cima.
- **Pulo (fase 1 do `jump_crouch_cutscene.md`):** Espaço, W ou ↑ pula para a frente (`jump` / `jump_gun`), 180 px parado ou 240 px correndo, 85 px de altura. A cena move o Kael numa parábola (`startJump`, `updateJump`, `endJump`; modo `jumping`). Os tiros do policial agora são balas que voam (`actors/Bullets.ts`) e acertam pela caixa do corpo (`bodyBox`), então o pulo desvia de verdade.
- **Agachar (fase 2 do `jump_crouch_cutscene.md`):** segurar S, ↓ ou Ctrl (`crouch` / `crouch_gun`; levantar toca ao contrário; modo `crouching` na troca e `crouched` na pose). Agachado não anda, mira e atira com `crouch_aim_gun` e `crouch_shoot_gun`, e a caixa do corpo cai para 86 px: o tiro do policial em pé (93 ± 3 px) passa por cima. A pose é **ajoelhada** (um joelho no chão, refeita a pedido do usuário); a mira e o tiro ajoelhados são os de pé com o tronco 18 px mais baixo (`tools/build_crouch.py`). Recarga agachada sem animação própria.
- **Pulo e agachar dos policiais (fase 3 do `jump_crouch_cutscene.md`, aguardando teste):** master e variantes com `jump_gun`, `crouch_gun` e mira, tiro e recarga ajoelhados (tronco em pé descido 18 px, como no Kael). IA do `patrol` em `Police.ts` (estados `posture` e `jumping`, `CopTarget` com o que ele sabe do Kael): agacha para recarregar, copia a postura do Kael parado, ajoelhado atira baixo (64 px, o pulo desvia) e tem 86 px de caixa, pula para a frente ao chegar (40%) ou quando o Kael mira nele (15%). Valores [TESTE] no `decisions.md`.
- **Luta com os mercenários e finais (fase 7 do `jump_crouch_cutscene.md`, aguardando teste):** na última tela (`actors/BossFight.ts`) a câmera trava e os três cercam o Kael (um corre por trás). Antes da luta, eles só levam tiro com o Kael já na última tela (corrige a câmera travando na arena com o Kael na barricada). Barra de vida e "!" de mira em vermelho em cada um; um mira por vez. Vida 5, o chute do combo tira 3; matar não tira índole. Quando os três caem, toca o final (`cutscene/ending.ts`): índole ≥ 50% feliz (abraço), < 50% triste (último tiro de um mercenário caído, o Kael morre); a tela de texto "FIM" leva ao título (`game:ended`).
- **Ilustrações animadas dos finais (fase 8, aguardando teste):** depois das falas, antes da tela de texto "FIM", o passo `art` do `Cutscene` mostra a ilustração do final em tela cheia (6x, centrada sobre preto) e o React esconde as faixas (`cutscene:art`). Feliz: o beijo (opção 3, placas "ÓTICA" e "MODAS"), música a 60%. Triste: ela com o Kael no colo na chuva (opção 1), sem música. Sheets de 8 quadros 160x90 em `assets/cutscenes/ending_*/` (`tools/build_endings.py`; brutos do PixelLab em `drafts/raw/`), carregadas por `cutscene/endingArt.ts`.
- **Seta de siga em frente:** quando a última onda de uma barricada cai (`Waves.onCleared`), `world/GoArrow.ts` mostra a seta `assets/ui/go_arrow.png` (desenhada em `tools/build_go_arrow.py`) piscando à direita, até o Kael andar 360 px ou outra arena travar. Aguardando o teste.
- **K** testa a morte do Kael. **R** recarrega (não reinicia mais; depois da morte, Enter reinicia). **Esc** pausa (menu React: Continuar, Opções, Reiniciar cena, Voltar ao título).
- **HUD nova (plano `playtest_fixes_1.md`, fases 8 e 9):** peças do PixelLab em `assets/ui/hud/` (`tools/build_hud.py`). À esquerda, o rosto do Kael, o nome, a barra de vida e a de índole com uma balança (cor e balança pendendo mudam com o valor). À direita, o seletor de arma (punho ou pistola; trocar mostra os dois por ~1 s), as balas do pente, que enchem uma a uma na recarga, e os pentes de reserva (vermelho letal, azul não letal). Escala inteira por `--px` em `src/ui/Hud.tsx`.
- **Sangue (fase 4, `actors/Blood.ts`):** respingo na direção da bala (tiro letal e todo tiro no Kael; a não letal só dá um respingo pequeno), gotas que caem e viram mancha no chão, e quem fica em pé pinga por um tempo. O ponto do acerto vem do `Bullets` (`HitPoint`).
- **Chuva (fase 7, `world/Rain.ts`):** 50% por jogada (seed dos policiais), começa entre 70% e 85% do ciclo, com dois planos de riscos, respingos no chão, véu azul e o loop `rain_loop` (CC0). A tecla **N** liga e desliga na cena de teste.
- **Sombras (`world/Shadows.ts`):** um Graphics só, criado em `buildWorld` antes dos personagens (todas as sombras atrás de todos). Cada `Humanoid` se inscreve no construtor (`shadowsOf(scene)?.add(this)`); a cena atualiza no POST_UPDATE. A largura vem do alfa das 4 linhas de baixo do quadro atual (sheet lido uma vez num canvas), espelhada pelo `facing`.
- **Corpos no chão (fase 3):** o mercenário morto ou nocauteado e o policial nocauteado deitam no chão, com a arma solta na frente (`settle` em `build_mercenary.py`; o mesmo em `build_police_master.py`).
- O jogo pausa enquanto houver diálogo ou menu aberto, e a música e os sons pausam junto.
- **Sons (fase 1 do `sound_run_reload_menu.md`):** OST da quadra 1 em loop com fade; tiro da Colt 1911 no Kael e "single shot" nos policiais; passos no `walk` e no `walk_gun` do Kael e dos policiais (quadros 0 e 4). O som dos policiais cai com a distância e vai para o lado em que estão. Volume da música e dos efeitos nas Opções (a tecla M saiu na fase 6).

Valores provisórios da cena, todos [TESTE] e no topo de `src/game/scenes/Test.ts`:

| Valor | Hoje |
|---|---|
| Velocidade de andar | 120 px/s (a animação de andar acelera junto) |
| Munição inicial | 12 letais, 6 não letais |
| Tiros até o policial cair | 2 |
| Índole máxima | 10 (cada policial morto tira 1) |
| Vida do Kael | 100 |
| Alcance do tiro | 900 px |

Limitações conhecidas:
- Não existe animação de andar mirando, então o Kael para de andar enquanto mira.
- `Scale.FIT` escala por um fator quebrado, e em algumas janelas o pixel pode ficar desigual. Dá para trocar por escala inteira se incomodar.
- O build avisa que o pacote do Phaser é grande (mais de 500 kB). Não atrapalha agora.
- O build copia `assets/` inteiro, inclusive os `drafts/`. Antes de publicar, separar o que vai junto.

---

## Arquitetura do código (padrões a seguir)

```
src/main.tsx               liga o React
src/App.tsx                estado da tela (title | playing), pausa e diálogo
src/ui/                    Hud.tsx, Menu.tsx (título e pausa), Options.tsx, Controls.tsx (lista de teclas, aberta pelas Opções), Toast.tsx (dica curta: `toast:show`), GameOver.tsx (derrota: `game:over`), Dialog.tsx, settings.ts (volumes, tela cheia, useLang), useMenuKeys.ts (setas, Enter, Esc) — só React, sem Phaser
src/i18n/                  pt_br.ts (padrão), en.ts (mesmas chaves, cobrado pelo TS), index.ts (t, getLang, setLang); sem React nem Phaser, os dois leem
src/game/PhaserGame.tsx    cria o Phaser.Game no useEffect e destrói no cleanup
src/game/screen.ts         WIDTH 960, HEIGHT 540, GROUND_Y 470
src/game/config.ts         makeConfig() (importa as cenas; por isso as medidas ficam no screen.ts)
src/game/levels/level_1.ts dados da fase: largura (3840), Kael, ordem das fachadas e postes, objetos, barricadas com as ondas
src/game/world/CameraRig.ts câmera: zona morta, olhar à frente, suavização, limites
src/game/world/Parallax.ts fundo em camadas que se repetem (TileSprite + fator)
src/game/world/Props.ts    chão (addGround), lixeira e hidrante na calçada, carro no asfalto na frente do Kael (depth 5), barricada com giroflex
src/game/world/DayCycle.ts relógio do ciclo (t de 0 a 1), luz ambiente, lerpColors, smoothstep
src/game/world/GoArrow.ts  seta de "siga em frente" presa na tela depois de cada barricada vencida
src/game/world/Sky.ts      céu em degradê (canvas 1 px esticado) e estrelas
src/game/world/Street.ts   fachadas em 3 camadas, postes com brilho e poça de luz, acender piscando
src/game/events.ts         barramento de eventos tipado (bus)
src/game/cutscene/         Cutscene (roteiro em passos: intro, line, art, pan, act, move, call, wait; fala pelo bus `cutscene:*`), opening (abertura), ending (finais) e endingArt (sheets das ilustrações dos finais)
src/game/audio/Sfx.ts      sons: loadSounds, playAt (distância e pan), playStep, startMusic; volumes [TESTE] vezes os volumes das opções
src/game/anims/humanoid.ts ANIMS, KAEL, POLICE_MASTER, POLICE (variantes), loadSheets, registerAnims, Humanoid
src/game/actors/Gunner.ts  IA comum de quem atira: EnemyArchetype, GunnerKit (animações, som, cano, altura, rajada), CopTarget, Gunner (entra, mira, atira, recarrega, agacha, pula, leva tiro e golpe); evento GUNNER_FIRE por bala
src/game/actors/Police.ts  PoliceLook (cabeça + tom), lookDef, ARCHETYPES, POLICE_KIT, Police extends Gunner
src/game/actors/Mercenary.ts mercenários de fuzil: tons (tones.json) por canvas, MERCENARY_KIT (rajada nos quadros 0, 3, 6), MERCENARY_ARCHETYPE, Mercenary extends Gunner
src/game/actors/BossFight.ts arena final: gatilho, trava da câmera, cerco, revezamento (canAim), barras de vida e aviso de mira
src/game/actors/uniformTones.ts tons de farda gerados no Boot por canvas (uniform_tones.json)
src/game/actors/EnemyDirector.ts saco embaralhado das 9 aparências, com seed
src/game/actors/Waves.ts   ondas das barricadas, trava da câmera (CameraRig.lock/unlock), F1, onFire
src/game/actors/Loot.ts    caixa de munição do nocaute (desenhada por canvas), coleta
src/game/actors/Bullets.ts balas que voam em linha reta e acertam pela caixa do corpo (BodyBox); genérico no que a bala leva, uma instância por lado (copBullets, kaelBullets)
src/game/scenes/Boot.ts    carrega as sheets, registra as animações, inicia a Test
src/game/scenes/Test.ts    cena de teste
```

**Regras:**
- **Textos da interface** ficam em `src/i18n/` (nunca escritos direto no componente ou na cena): chave nova no `pt_br.ts` e no `en.ts`, e use `t('chave')`.
- **React e Phaser não se importam.** Os dois só se falam pelo `bus` de `events.ts`. Para criar um evento, acrescente o nome e o tipo dos dados em `GameEvents`, e o TypeScript passa a cobrar o uso certo.
  - Phaser → React: `hud:ammo`, `hud:life`, `hud:morale`, `hud:weapon`, `dialog:open`, `toast:show` (o começo da fase avisa onde ficam os controles; a caixa de controles não abre mais).
  - React → Phaser: `game:pause`, `game:resume`, `game:restart`, `settings:volume` (música e efeitos, 0 a 1).
  - Os eventos `hud:*` e `settings:*` guardam o último valor e o entregam a quem se inscreve depois, para o HUD montar já preenchido.
  - `bus.on` devolve a função que cancela a inscrição. A cena cancela tudo no `SHUTDOWN` **e no `DESTROY`** (voltar ao título destrói o jogo sem `SHUTDOWN`; ouvinte esquecido trava o próximo jogo).
- **Animações:**
  - Toda animação está em `ANIMS` (`humanoid.ts`), com a duração de cada quadro em ms (um número só, ou uma lista por quadro), se repete ou não, a linha do chão (`floor`) e os quadros em que o pé pisa (`steps`, que disparam o evento `HUMANOID_STEP` e o som do passo).
  - Cada personagem é um objeto (`KAEL`, `POLICE_MASTER`) com a chave, a lista de animações que tem e o caminho da sheet.
  - Para acrescentar uma animação: gerar a sheet, acrescentar em `ANIMS` e na lista do personagem.
- **Chaves:** a animação é `<personagem>:<anim>` (ex.: `kael:walk_gun`) e a textura é `<personagem>_<anim>`.
- **Sprite `Humanoid`:**
  - `act(anim, { reverse, restart })` toca uma animação. `hold(anim, frame)` congela num quadro. `face(-1 | 1)` vira.
  - Para espelhar, usa `scaleX` = ±1 com a origem no centro do corpo (`BODY_X = 61` de 128). A origem vertical fica na linha do chão de cada animação, então o personagem pisa em `GROUND_Y` qualquer que seja a animação.
- **Estado da cena:** máquina de estados simples em string (`KaelMode`: `free | raising | aimed | shooting | lowering | reloading | jumping | crouching | dead`; a pose agachada fica em `crouched`). O fim de cada animação (`ANIMATION_COMPLETE`) decide o próximo estado.
- **Números provisórios** viram constantes no topo do arquivo, com o comentário `[TESTE]`.
- **Medidas da tela** vêm de `screen.ts`. Importar do `config.ts` cria import circular (o config importa as cenas) e quebra a página com "Cannot access before initialization".
- **Câmera e fundo:** o `CameraRig.update` roda no `update` da cena. O fundo (`Parallax.update`) roda no evento `FOLLOW_UPDATE` da câmera, depois que ela calcula a posição, para não ficar um quadro atrasado. Durante a cutscene (`CameraRig.pan`, `detached`) a câmera não segue e o `Test.update` chama o `Parallax.update` direto. Posição do mouse no mundo: `cameras.main.getWorldPoint(p.x, p.y)` a cada quadro, porque a câmera anda com o mouse parado.
- **Ciclo de tempo:** `t` (0 = entardecer, 1 = noite) vem do `DayCycle`, e o `updateTime` da cena repassa para `Sky`, `Street`, silhueta e personagens. Tudo que precisa escurecer recebe `setTint(ambient(t))`. O que acende usa a camada `lights`, ou textura com blend ADD, sem tint.
- **Fachada nova:** gere `<nome>_dusk_x.png` e, com `edit_image` sobre ela, `<nome>_night_x.png` alinhada pixel a pixel. Ponha o nome em `FACADES` de `tools/build_background.py`, rode o script e acrescente em `level_1.ts`.
- Os comentários no código são em português, curtos, e explicam o porquê. Os nomes de variáveis, funções e arquivos ficam em inglês.
- O `create()` reinicia todo o estado, porque o Phaser reaproveita a mesma instância da cena no `restart`.

**Antes de entregar uma mudança de código:**
1. Rode `npm run typecheck` (e `npm run build` se mexeu em configuração).
2. Abra no navegador e teste o que mudou. Nas sessões anteriores, o teste foi um script Playwright apontando para o Google Chrome local, salvando capturas. O script ficou no scratchpad e não foi guardado no projeto.

---

## Pipeline de sprites

O padrão está no `CLAUDE.md` (128x128, East, chão em y=120 sem arma e y=121 com arma, paleta fixa, rosto da base, nunca olhando para a câmera).

- **Scripts:** em `tools/`. Rodar com `PYTHONPATH=tools python3 tools/<script>.py`.
  - `sprite_lib.py` é a base, com funções que recebem parâmetros, sem caminho fixo:
    - `load`, `load_frames`, `save_anim` (quadros, sheet e GIF);
    - `remap` (para a paleta), `ground` (aterra no chão), `drop_islands` (tira pixels soltos), `fill_holes`;
    - `locate` e `smooth_path` (acham a cabeça e suavizam o caminho em no máximo 1 px por quadro), `paste_head`;
    - `copy_blood`, e `report` para conferir.
  - `build_sfx.py` corta as gravações de passos de `assets/sounds/source/` em passos soltos (`steps_walk/`, `steps_run/`).
  - `shoot_fx.py` gera o tiro procedural (recuo, flash, bala e fumaça) a partir do último quadro do aim.
  - `build_police_master.py` monta as 7 animações do policial master a partir dos brutos em `drafts/`.
  - `build_police_variants.py [police_a ...]` monta as variantes a partir do master, sem PixelLab: troca a pele por proporção de uso (com sombra nas mãos e tom igual entre quadros) e o cabelo, cola a cabeça da variante nos quadros em pé (achada pelo contorno do quepe) e refaz o shoot. Imprime, por animação, chão, cores, deslocamento da cabeça, pele do master sobrando e furos (tudo tem de dar 0).
- **PixelLab:**
  - `transfer_outfit` troca a roupa mantendo o movimento (3 quadros por chamada em 128 px, mesma referência e mesmo seed).
  - `edit_image_pro_flash` faz keyframes e cabeças.
  - `animate_image` anima entre o primeiro e o último quadro. O número de quadros precisa ser par, e o índice 0 da saída é a imagem de entrada.
  - Quando o personagem virar para a câmera, refaça com "strict side view profile" e outro seed.
- **Conferir sempre:**
  - a linha do chão;
  - a contagem de cores contra a paleta;
  - a diferença de pixels do rosto;
  - um render ampliado. O usuário é exigente com quebra de pixel.
- **Cores fora da paleta** só para efeito (flash, luz, sangue `(176,32,36)` e `(110,16,24)`), e sempre avisando o usuário.

---

## Pendências imediatas (ordem sugerida)

- **Tela de game over (14/10/2026, sem plano):** `src/ui/GameOver.tsx` ouve `game:over` (emitido no `Test.killKael`), escurece em ~1,8 s, mostra "GAME OVER", "Você perdeu" e uma frase triste sorteada (`gameover.message.0..2` no i18n) e aceita Enter depois de ~3,6 s (`DELAY_MS`, `PROMPT_MS` [TESTE]); o Enter emite `game:restart`. Testada no navegador, aguardando o teste do usuário (visual e frases).
- **Plano `docs/plan/enemy_ai_difficulty.md` (13/10/2026):** IA mais difícil. **Fases 1 a 3 feitas nos policiais** (IA esperta: `smart` no arquétipo `patrol`, `KaelHabits` e `dodge()` em `Gunner.ts`, aviso do tiro em `Test.shoot()`), aguardando o teste do usuário. Sequência de tiros com a arma apontada entre elas (`volley`, `volleyGapMs`, `volleyPauseMs` no `EnemyArchetype`). Falta: os mercenários (seguem com a IA simples; fase 1 propõe 2 rajadas e dois mirando juntos). Perguntas abertas na seção "Perguntas" do plano.

- **Plano `docs/plan/playtest_fixes_2.md` (13/10/2026) completo e aprovado pelo usuário:** controles em Opções → Controles com dica curta, chuva mais baixa (calada na ilustração dos finais) e sombras nos pés do Kael, da Adriana, dos policiais e dos mercenários (`world/Shadows.ts`). Nada pendente. Próximo passo: escolher com o usuário o que vem depois (ver `GDD.md`, seção 9).
- **Todos os planos anteriores estão aprovados** na jogada do usuário de 13/10/2026; o resultado de cada fase está em `docs/tests.md`. As linhas abaixo guardam o histórico de cada plano.
- **Plano `docs/plan/playtest_fixes_1.md` (13/10/2026) completo, testado e aprovado pelo usuário** ("gostei muito do resultado"): texto da abertura, ciclo de 3 min, recarga de 1,21 s, recarga ajoelhada, HUD nova, seletor de arma, corpos no chão, sangue e chuva. Aprovar o som da chuva ("Rain (loopable)" de Ylmir, CC0) e ajustar os [TESTE] do sangue e da chuva.

- **Pendente da cutscene:** a mão do mercenário fica ~9 px acima do pulso da Adriana (`HOLD_DX` [TESTE]); o texto de abertura fala em "prédio na Capital" e "cinco quadras", mas nesta fase de teste ela está no fim da rua. Perguntar ao usuário se ajusta o texto.

- **Plano `docs/plan/melee_combo.md` (13/10/2026), antes da fase 6 do `jump_crouch_cutscene.md`.** Fases 1 a 3 feitas: drop de 50% no morto; animações `punch_1`, `punch_2`, `kick` aprovadas (`tools/build_melee.py`); combo no botão direito sem arma no jogo (`COMBO` em `Test.ts`, `Police.strike`). Aguardando o teste do usuário. Sons do combo no jogo (`swing`, `punch_hit`, `kick_hit`, CC0), aguardando aprovação. Nos mercenários (fase 7): socos dão o tranco e o chute tira 3 de 5 de vida [TESTE].

- **Plano `docs/plan/jump_crouch_cutscene.md` (12/10/2026), aprovado. Fases 1 (pulo + bala do policial) e 2 (agachar ajoelhado + bala visível do Kael) feitas; a 2 aprovada. Fase 3 (pulo e agachar nos policiais) aprovada em 13/10/2026. Fase 4 (Adriana): base aprovada (olhos verdes); animações `held`, `cry`, `freed`, `kneel` e `hug` (`tools/build_adriana.py`) e retratos da Adriana e do Kael feitos e **aprovados** (13/10/2026). Fase 5 (mercenários e van) em andamento: base A e van (`assets/levels/level_1/props/van.png`, escala [TESTE]) aprovadas; tons olive/ranger/coyote [PROPOSTA] em `assets/enemies/mercenaries/tones.json` e as 13 animações de fuzil em `assets/enemies/mercenaries/master/` (`tools/build_mercenary.py`; tiro em rajada de 3 pelo `shoot_fx`; o `hold` encaixa no `held` da Adriana com ela 52 px à frente e 1 px abaixo), **aprovadas** (13/10/2026). `src/game/actors/Mercenary.ts`: tons por canvas, sprite `Mercenary` que toca o `rifle_shot` (AK-47 CC0 da Free Firearm Sound Library, aguardando aprovação) e emite `mercenary-shot` nos quadros 0, 3 e 6 da rajada. Fase com 4800 px; arena na quinta tela com os três mercenários parados e a van (`level_1.ts` → `boss`, `VAN_SCALE` em `Props.ts`). **Fase 5 aguardando o teste do usuário.** **Fase 6 (cutscene de abertura) feita em 13/10/2026, aguardando o teste:** tela de texto do `story.md` seção 5, câmera até a Adriana presa (`cry` e falas), volta ao Kael, fala dele; `src/game/cutscene/` (roteiro em passos) e `src/ui/Cutscene.tsx` (faixas, retrato, texto letra por letra com bipe); Esc pula; toca uma vez por jogo. **Aprovada pelo usuário.** **Fase 7 (luta com os mercenários e finais) feita em 13/10/2026, aguardando o teste e a aprovação dos textos dos finais** (`ending.*` no i18n). **Fase 8 (ilustrações animadas dos finais) feita em 13/10/2026, aguardando o teste.** O plano está completo.** Pulo e agachar (Kael e policiais), Adriana e os três captores pelo PixelLab, cutscene de abertura estilo anos 90, fim da fase, finais pela índole e cutscenes finais animadas em pixel art (fase 8: beijo no feliz; o Kael morrendo nos braços da Adriana no triste).

- **Plano novo `docs/plan/sound_run_reload_menu.md` (12/10/2026), perguntas respondidas. Fase 1 (sons) aprovada. Fase 2 (tiro contínuo, pente de 8, R recarrega, Enter reinicia depois da morte) aprovada. Fase 3 (corrida) com sprites aprovados e ligados no jogo (`run`, `run_gun`, transição `run_gun_stop` ao parar armado); falta o usuário testar a sensação (`RUN_SPEED` [TESTE]). Fase 4 (recarga): `reload_gun` pronta (`tools/build_reload.py`, brutos em `assets/player/drafts/reload_raw/`) e ligada no `reload()`; aguardando aprovação. Fase 5 (policiais): `run_gun` e `reload_gun` no master e na `police_a`, e no jogo (entra correndo, pente de 8, recarga com som); nas três variantes (`build_police_master.py` devolve o pente e a mão esquerda do Kael na recarga); **completa, aguardando o teste do usuário**. Fase 6 (menu principal "Saves Her"): logo do PixelLab, fundo da rua, opções (volumes, tela cheia, língua), pausa no mesmo visual e i18n em `src/i18n/`; **completa, aguardando o teste do usuário** (e a escolha final do logo, opções em `assets/ui/drafts/title_logo/`).** Seis fases: sons, tiro contínuo com pente de 8, corrida do Kael, recarga do Kael, corrida e recarga dos policiais, menu principal "Saves Her". Sons em `assets/sounds/`. 

0. **Plano `docs/plan/world_camera_enemies.md`:** fases 1 e 2 feitas. A fase 2 (cenário e ciclo do entardecer à noite) teve o ciclo de luz e os nomes das lojas aprovados. Corrigidos depois do primeiro teste: paredes de tijolo transparentes, prédios afundando no chão (corte da base pegava a lixeira) e silhueta flutuando, calçadas da IA que não emendavam (cortadas; a calçada é contínua e há um muro atrás, em `Street.ts`). Os prédios ficam colados, e os postes ficam nas divisas (`lamps` em `level_1.ts` é o índice da fachada). **Fase 2 aprovada pelo usuário.** **Fase 3 feita, aguardando o teste do usuário:** chão do PixelLab repetível (calçada, meio-fio e asfalto), lixeira e hidrante na calçada, carro estacionado no asfalto passando na frente do Kael e barricada policial com giroflex vermelho e azul, mais forte à noite. Posições em `props` e `barricades` de `level_1.ts` [TESTE]. A camada da frente a 1,2 (opcional) ficou de fora. **Correções do primeiro teste da fase 3 (11/10/2026), aguardando novo teste:** a tela não tem mais faixa preta (`screen.ts`: altura 540 e largura de 960 a 1280 por `viewWidth`, com `setGameSize` no resize em `PhaserGame.tsx`); os objetos ficam em duas faixas (`lane` em `level_1.ts`: fundo na linha dos postes, frente junto ao meio-fio e maior, versões `_front` em `props/`), com sombra; o carro está maior (1,15x do rascunho, `drafts/car_x115_raw.png`, redesenhado com margem para não cortar os para-choques). As fachadas foram refeitas duas vezes. Na versão atual, a referência é a porta da padaria original: `tools/build_facade_fit.py` (`DOOR = 93`) mantém a arte original quando o fator fica perto de 1 (padaria, mercadinho e armarinho) e, nos outros, corta andares dos prédios altos e amplia (`drafts/<nome>_fit_nn.png`). O PixelLab redesenha (`edit_image`, seed 11) em `<nome>_dusk_fit.png` e faz a noite (seed 7) em `<nome>_night_fit.png`. `build_background.py` lê os `_fit`, usa a última linha opaca como base e recorta pela caixa inteira, com os toldos completos. A rua tem 12 fachadas com vãos (`gap`) e dois pares colados; os postes ficam no meio do vão (sequência e x de cada fachada comentados em `level_1.ts`). O usuário rejeitou portas grandes (~120 px), prédios todos colados e toldos cortados. **Fase 3 aprovada pelo usuário.**
   O plano tem 6 fases (câmera, fundo com PixelLab, chão e objetos, variantes, estrutura dos inimigos, combate), com parada para teste ao fim de cada uma. As perguntas da seção 4 já foram respondidas. **Fase 4 aprovada; fases 5 e 6 feitas em 12/10/2026, aguardando o teste do usuário: todas as 6 fases estão implementadas.**
1. **Testar as fases 5 e 6 do plano `world_camera_enemies.md`** (feitas em 12/10/2026): ondas, dificuldade e leitura do tiro inimigo, loot; e **aprovar os 3 tons de farda** (`assets/enemies/police/drafts/uniform_tones_preview.png`; para mudar, editar `TONES` em `tools/build_uniform_tones.py` e rodar o script). O plano `police_variants.md` está concluído (só a troca de paleta por quadra ficou de fora, e os tons já usam a mesma técnica).
2. Combate ainda em aberto: o que acontece na derrota (item 14), se o policial morto também solta loot (item 16) e uma animação de dano do Kael (hoje ele só pisca em vermelho).
3. Perguntas de design ao usuário: nome da cidade do Geraldo, quem sabe da corrupção, o que a parte 1 da quadra 1 ensina, pulo e dash, e a progressão do Kael.
4. Animações que faltam no Kael: dano, andar mirando e tiro não letal (ver `GDD.md` 6.4).

## Como atualizar este handoff

Ao fim de cada sessão:
1. Mova itens de EM ABERTO para DECIDIDO, com data e fonte.
2. Acrescente a linha no histórico de decisões.
3. Atualize "Estado atual do projeto", "Pendências imediatas" e, se o código mudou de forma, "Arquitetura do código".
4. Atualize a estrutura e o "Como rodar" do `CLAUDE.md` se surgirem pastas ou comandos novos.
5. Não apague decisões antigas. Se algo mudar, registre a mudança com a data.
