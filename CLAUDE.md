# CLAUDE.md

Jogo **Kael**: metroidvania de ação em vista lateral, pixel art, roda no navegador.
Código em React + Phaser 4 + Vite, em TypeScript. Hoje tem uma cena de teste com o Kael, o policial master e a rua da quadra 1, que vai do entardecer à noite.

## Leia antes de qualquer tarefa

Os documentos ficam em `docs/`. Só o `CLAUDE.md` fica na raiz, porque o Claude Code só o lê de lá.

1. `docs/decisions.md`: fonte da verdade. **DECIDIDO** é fixo; **EM ABERTO** se pergunta ao usuário; **AJUSTAR EM TESTE** aceita valor inicial marcado como provisório.
2. `docs/GDD.md`: visão consolidada do jogo. Se divergir do `decisions.md`, vale o `decisions.md`.
3. `docs/story.md`: história e o que o texto conta.
4. `docs/handoff.md`: glossário, **estado atual, pendências, arquitetura do código** e como passar o projeto para outra IA.
5. `docs/plan/`: planos aprovados, com o status de cada fase.

## Regras de trabalho

- Responda em **português do Brasil**.
- Não invente nomes de personagens, locais ou organizações. Se faltar, pergunte. Exceção: nomes de lojas nas fachadas podem ser propostos (fictícios, em PT-BR, sem marca real), e o usuário veta.
- Toda decisão nova vai para o `docs/decisions.md`, com data e fonte, e para o histórico. Não apague decisões antigas.
- Glossário fixo: Kael (nunca Kyle/Caio), Adriana, Geraldo, Roberto, Florentins, Capital, quadra, barra de índole.
- Planeje antes de implementar: tarefa grande vira `docs/plan/<nome>.md` e espera aprovação. Se o usuário disser "não implemente ainda", não crie nem instale nada.
- Ao fim de cada sessão, atualize o `docs/handoff.md` (estado atual e pendências).

## Nomes de arquivos e pastas

- **Pastas e arquivos sempre em inglês**, `snake_case`, sem acento nem espaço. Ex.: `references/environments/`, `story.md`.
- O conteúdo dos documentos continua em português.
- Exceções: `CLAUDE.md`, `GDD.md` e `README.md` (convenção).

## Estrutura

```
assets/player/           sprites do Kael
  <anim>_<dir>/          quadros soltos: <anim>_<dir>_00.png ...
  player_<anim>_<dir>.gif         prévia
  player_<anim>_<dir>_sheet.png   spritesheet horizontal
  player_base_east.png / player_base_gun_east.png   bases de referência
assets/enemies/police/   policiais inimigos (master + variantes police_a/b/c, rampas em variants.json)
references/              imagens de referência (kael/, environments/)
docs/                    documentos (decisions, GDD, story, handoff)
  plan/                  planos de implementação aprovados
tools/                   scripts Python: sprite_lib.py (base), shoot_fx.py (tiro), build_police_master.py, build_police_variants.py (variantes do policial), build_uniform_tones.py (tons de farda), build_facade_fit.py (escala das fachadas), build_background.py (fachadas), build_ground.py (chão), build_props.py (objetos)
assets/levels/level_1/   cenário da quadra 1: facades/ (dusk, night, lights), skyline, props/, drafts/
src/                     código do jogo (TypeScript)
  main.tsx, App.tsx      React: tela, menus, HUD e diálogos por cima do jogo
  ui/                    Hud, Menu, Dialog
  game/screen.ts         WIDTH 960, MAX_WIDTH 1280, HEIGHT 540, GROUND_Y, viewWidth (importe daqui, nunca do config.ts)
  game/config.ts         configuração do Phaser (importa as cenas)
  game/levels/           dados de cada fase (largura, posições)
  game/world/            CameraRig (câmera), Parallax, DayCycle (relógio e luz ambiente), Sky, Street (fachadas, postes e muro), Props (chão, objetos e barricada)
  game/events.ts         ponte tipada React ↔ Phaser (um lado não importa o outro)
  game/anims/humanoid.ts sheets, animações e o sprite Humanoid (Kael e policiais)
  game/actors/           Police (aparência + arquétipo), uniformTones (farda por canvas), EnemyDirector (sorteio), Waves (ondas das barricadas), Loot (caixa de munição)
  game/scenes/           Boot (carrega) e Test (cena de teste)
```

## Como rodar

```bash
npm install          # uma vez
npm run dev          # http://localhost:5173
npm run typecheck    # confere os tipos
npm run build        # confere os tipos e gera dist/
```

- O Vite serve `assets/` direto (`publicDir`): carregue `player/...` e `enemies/...`, sem copiar arquivo.
- Animação nova: acrescente em `ANIMS` (ms por quadro e linha do chão) e na lista do personagem em `humanoid.ts`.
- Rode `npm run typecheck` antes de entregar qualquer mudança de código, e teste no navegador o que mudou.
- React e Phaser não se importam: só conversam pelo `bus` de `events.ts`. Evento novo entra no tipo `GameEvents`.
- Números provisórios ficam como constantes no topo da cena, com o comentário `[TESTE]`.
- Comentários em português e curtos; nomes de código em inglês.
- Scripts Python: `PYTHONPATH=tools python3 tools/<script>.py`.

Nome da animação: `<ação>[_gun]_<direção>`, ex.: `walk_gun_east`, `death_east`.

## Padrão de sprites

- Quadro **128x128**, fundo transparente, virado para **East** (o jogo espelha para West).
- Chão: sprites sem arma pisam em **y=120**; com arma em **y=121**.
- Paleta fixa de 14 cores tirada de `player_base_east.png`. Cores fora da paleta só para efeito (flash do tiro, luz, sangue `(176,32,36)` e `(110,16,24)`), e sempre avisando o usuário.
- O rosto precisa ser o da base: nunca olhando para a câmera.
- O usuário é exigente com **quebra de pixel** e movimento orgânico. Confira com render ampliado antes de entregar.

## Pipeline de animação (PixelLab)

- Keyframe com `edit_image_pro_flash`, depois `animate_image` com primeiro e último quadro.
- A IA acerta o corpo e erra o rosto: cole a cabeça da base por cima, suavize os deslocamentos (no máximo 1 px por quadro), remapeie para a paleta e aterre no chão.
- Funções reutilizáveis ficam em `tools/sprite_lib.py`. Scripts no scratchpad somem; o que vale guardar vai para `tools/`.
- Valide medindo: diferença de pixels do rosto, linha do chão e contagem de cores.
