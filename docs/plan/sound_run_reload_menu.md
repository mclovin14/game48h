# Plano: sons, tiro contínuo, corrida, recarga e menu principal

Status em 12/10/2026: **as seis fases estão feitas**; fases 4, 5 e 6 aguardam o teste do usuário.
- Perguntas respondidas pelo usuário. "Enter reinicia" depois da morte aprovado.
- Fase 1: **feita** (12/10/2026), aguardando o teste do usuário. Como ficou:
  - Sons em `assets/sounds/`: `kael_shot.wav`, `police_shot.wav`, `colt_reload.wav` (ainda sem uso), `ost_level_1.mp3`. As gravações de passos ficam em `source/` e são cortadas por `tools/build_sfx.py` em `steps_walk/` (4 passos) e `steps_run/` (8, para a fase 3).
  - `src/game/audio/Sfx.ts`: `loadSounds` (no `Boot`), `playAt` (volume pela distância e pan pelo lado da tela, tom ±4%), `playStep` (corte sorteado, sem repetir o anterior) e `startMusic` (loop com fade de 2,5 s; no restart a música continua de onde estava).
  - Passos nos quadros 0 e 4 do `walk` e do `walk_gun` (os dois pés no chão, medido nos sprites), por `steps` em `ANIMS` e o evento `HUMANOID_STEP` do `Humanoid`. Valem para o Kael e para os policiais.
  - O tiro do Kael sai no `shoot()`; o do policial, no `onCopFire` (começo do `shoot_gun`, junto com o clarão).
  - Esc e diálogos pausam a música e os sons em curso (`pauseAll`/`resumeAll`). **M** liga e desliga o som.
  - Teste automático (Chrome, seed `kael1`): passos a cada 333 ms andando, sem erros; tiros do policial puxados para o lado dele; fade da música de 0 a 0,45 (depois baixado para 0,15 a pedido do usuário).
- Fase 1 aprovada pelo usuário ("ficou muito bom").
- Fase 2: **feita** (12/10/2026), aguardando o teste do usuário. Como ficou:
  - Pente de 8 com o tipo selecionado; `reserve` guarda as balas de cada tipo fora do pente. No começo, o pente sai cheio com 8 das 12 letais (reserva: letal 4, não letal 6).
  - Depois do tiro, o Kael segura a mira e só o recuo se repete. Clique durante o recuo fica guardado e sai depois de `FIRE_MIN_MS` 270 ms [TESTE]. Sem atirar e sem o botão direito por `AIM_IDLE_MS` 1,2 s [TESTE], ele abaixa a arma; andar nesse meio-tempo abaixa na hora. Soltar o botão direito abaixa como antes.
  - Recarga (modo `reloading`): R, pente vazio depois do tiro ou loot do tipo certo com o pente vazio. Parado em `idle_gun` por `RELOAD_MS` 2,08 s [TESTE] com o som `colt_reload`; ao fim, volta a mirar se o botão direito estiver segurado. A morte corta o som.
  - Sem bala no pente nem na reserva: clique seco (`dry_fire.wav`, cortado do `colt_reload` por `tools/build_sfx.py`).
  - Q ou roda: devolve o pente à reserva e recarrega com o outro tipo (arma guardada: troca sem recarga).
  - HUD: "Pente N/8" (vermelho quando vazio) ou "Recarregando...", e a reserva de cada tipo.
  - R não reinicia mais; depois da morte, Enter reinicia.
  - Teste automático (Chrome): tiros, recarga automática, troca de tipo, clique seco e Enter sem erros.
- Fase 2 aprovada pelo usuário.
- Fase 3: **em andamento.** Código pronto: Shift corre a `RUN_SPEED` 200 px/s [TESTE] (só livre), passos de `steps_run`, olhar à frente da câmera 170 px correndo [TESTE] (`LOOKAHEAD_RUN` em `CameraRig.ts`). Até os sprites ficarem prontos, a corrida usa o `walk` acelerado. Keyframes (12/10/2026), três tentativas:
  1. `edit_image_pro_flash` sobre a base, mostrado cru: **recusado** (rosto, mãos e traços do Kael perdidos).
  2. `inpaint` só de pernas e braços sobre o `walk`: **recusado** (corte feio, corrida dura, arma com as duas mãos).
  3. Atual: `edit_image_pro_flash` pedindo **sprint** (corpo inclinado, joelho alto, braços bombeando; com arma, **pistola numa mão só**) e limpeza por `tools/build_run.py keys` (cabeça da base colada, paleta da base, chão 120/121). O usuário escolheu a semente B (77) dos dois e pediu para consertar o ombro e a junção da mão com a pistola. A limpeza agora apaga só o cabelo e a pele da cabeça da IA (inundação a partir do topo), em vez de um retângulo, e fecha com jaqueta o vazio cercado entre queixo e punho. Em `assets/player/drafts/`: `run_key_raw.png` e `run_gun_key_raw.png` (saída crua), `run_key_east.png` e `run_gun_key_east.png` (limpos), `run_keys_compare.png`.
  Regra nova do usuário: correndo, a pistola fica numa mão; ao parar, ele junta as duas mãos de novo no `idle_gun` (vai precisar de uma transição curta). Keyframes B aprovados pelo usuário (12/10/2026). Animações feitas com `animate_image` (key como primeiro e último quadro, seed 77) e montadas por `tools/build_run.py anim` a partir de `drafts/run_raw/` e `drafts/run_gun_raw/`: `run_east/` e `run_gun_east/` (9 quadros, 72 ms, chão 120/121, paleta da base). A cabeça é sempre a desenhada pela IA: colar a da base deixava a cabeça rígida e com recorte no pescoço (usuário, 12/10/2026). Por isso os quadros 0 e 1 (o key colado e a cópia dele) saíram e entraram três intermediários gerados do quadro 7 ao 2 (`tween_1..3.png`). No `run_gun` a IA escondeu a pistola nos quadros 4 e 5; a pistola do key é colada no punho erguido (`GUN_FIX`). Animações **aprovadas pelo usuário** (12/10/2026) e **ligadas no jogo**: `run` e `run_gun` em `ANIMS`/`KAEL` (`humanoid.ts`, 72 ms, passos nos quadros 1/6 e 2/6), no lugar do `walk` acelerado. Ao parar de correr armado toca `run_gun_stop` (3 quadros, 80 ms, gerado de `run_gun` quadro 7 até `idle_gun_00`, `build_run.py stop`) e depois o `idle_gun`. Testado no navegador sem erro. **Aguardando o usuário testar a sensação da corrida** (velocidade `RUN_SPEED` [TESTE]).

Pedido do usuário (12/10/2026):
- Sons: a Colt 1911 (`colt_1911_shot.wav`) é o tiro do Kael; o "single shot" é o tiro dos policiais. A OST é a música da fase. O "sneaker footsteps asphalt" vale para os passos de andar do Kael e dos policiais. O "running sneakers" só entra junto com a corrida.
- Kael: animações de correr sem arma, correr com arma e recarregar, todas pelo PixelLab e fiéis ao Kael.
- Tiro: depois de atirar, o braço não abaixa nem sobe. Cada clique toca só o recuo, e ele continua mirando.
- Pente de 8 balas. Recarrega sozinho quando acaba e com a tecla **R** a qualquer momento (com 4 balas, por exemplo). Sem atirar por um tempo, volta para o `idle_gun`.
- Policiais: recebem as animações novas, como nas demais.
- Menu principal minimalista e cartunesco, no estilo do The Last of Us: itens alinhados à esquerda (New Game, Opções). **Nome do jogo: Saves Her.**
- Plano faseado, com parada para teste ao fim de cada fase.

Depende de: `world_camera_enemies.md` (fases 1 a 6 feitas) e `police_variants.md` (concluído).

---

## Respostas do usuário (12/10/2026)

1. **Pente e os dois tipos de bala:** o pente carrega o tipo selecionado. Trocar de tipo (Q ou roda) devolve as balas do pente para a reserva e recarrega com o outro tipo, com a animação de recarga. O HUD mostra `pente / reserva` do tipo selecionado.
2. **Tecla R:** só recarrega, nunca reinicia. Reiniciar fica no menu de pausa (Esc). Depois da morte, o aviso "R reinicia" vira **Enter reinicia** [PROPOSTA da IA; o que acontece na derrota segue EM ABERTO, item 14].
3. **Correr:** segurar **Shift**.
4. **Atirar correndo:** não dá. O Kael para para atirar (mirar ou atirar para a corrida).
5. **Recarregar andando:** não dá. O Kael para para recarregar. Animações de recarregar andando e atirar correndo ficam de fora por enquanto.
6. **Língua do menu:** português por padrão, com **internacionalização** (português e inglês) e a troca de língua nas Opções.
7. **OST:** toca só quando a fase abre. O menu fica sem música.
8. **Policiais:** entram na arena correndo e recarregam depois de 8 tiros.

---

## Fase 1: sons (tiro, OST e passos de andar)

**Arquivos.** O Vite serve só `assets/` (`publicDir`), então os sons saem de `src/game/sounds/` e vão para `assets/sounds/`, com nomes em `snake_case` e sem espaço:

| Hoje | Vai para | Uso |
|---|---|---|
| `colt_1911_shot.wav` | `sounds/kael_shot.wav` | tiro do Kael |
| `colt_1911_single_shot (1).wav` | `sounds/police_shot.wav` | tiro do policial |
| `colt_1911_reload.wav` | `sounds/colt_reload.wav` | recarga (fase 2) |
| `ost.mp3` | `sounds/ost_level_1.mp3` | música da quadra 1 |
| `sneaker_footsteps_asphalt.wav` | `sounds/steps_walk/step_00.wav ...` | passos de andar |
| `running_sneakers_on_asphalt.wav` | `sounds/steps_run/step_00.wav ...` | passos de correr (fase 3) |

Os dois arquivos de passos são gravações de vários passos seguidos. Um script novo, `tools/build_sfx.py`, acha o início de cada passo (pico de volume), corta cada um com uma folga e salva os passos soltos. Assim, cada passo sai no quadro em que o pé toca o chão, e não como um loop que escorrega do andar.

**Código.**
- `src/game/audio/Sfx.ts` (novo): carrega os sons no `Boot` e tem uma função `play(key, { x })` que ajusta o volume pela distância até a câmera e o lado (pan estéreo) pela posição na tela. Cada tiro e passo varia um pouco o tom (±4%) para não soar repetido.
- **Tiro:** o Kael toca `kael_shot` no início do `shoot_gun`; o policial toca `police_shot` no quadro do clarão.
- **Passos:** cada animação de andar ganha a lista dos quadros em que o pé pisa (medida nos sprites pela linha do chão), em `ANIMS` (`steps: [..]`). O `Humanoid` emite o passo nesses quadros. Vale para o `walk` e o `walk_gun` do Kael e para o `walk_gun` dos policiais. O passo do policial sai mais baixo que o do Kael.
- **OST:** toca em loop na cena, com fade de entrada. Pausa junto com o jogo (Esc e diálogos) e para ao voltar ao título.
- O navegador só libera o som depois do primeiro clique do jogador. O clique em "Jogar" já cumpre isso.
- Volumes da música, do tiro e dos passos como constantes `[TESTE]` no topo do `Sfx.ts`. A tecla **M** liga e desliga o som até o menu de opções existir (fase 6).

**Conferência.** Typecheck, teste no navegador: passos batendo com o pé no andar lento e no andar com arma, tiro do policial mais baixo quando está longe e à esquerda ou à direita conforme o lado.

**Para e espera o teste do usuário.**

---

## Fase 2: tiro contínuo e pente de 8 (código, sem arte nova)

**Mira presa no tiro.** Hoje, se o botão direito não está apertado, depois de cada tiro o Kael roda o `aim_gun` ao contrário e abaixa a arma. Isso some:
- Depois do `shoot_gun`, o Kael fica mirando (último quadro do `aim_gun`), com ou sem o botão direito apertado.
- Cada clique esquerdo toca só o recuo (`shoot_gun`). Um clique durante o recuo fica guardado e sai assim que o recuo deixa, para o tiro rápido não se perder. A cadência mínima fica numa constante `[TESTE]`.
- Se o `shoot_gun` de 8 quadros (660 ms) ficar lento para tiro seguido, o tiro corta no fim do recuo (quadros 0 a 3) quando já houver outro clique esperando. A arte não muda.
- **Volta para o `idle_gun`:** sem atirar e sem o botão direito por `AIM_IDLE_MS` (1,2 s, `[TESTE]`), o Kael abaixa a arma (o `aim_gun` ao contrário, como hoje).

**Pente.**
- Pente de 8, com a reserva atual por tipo (resposta 1: o pente carrega o tipo selecionado; trocar de tipo recarrega com o outro).
- Pente vazio: recarrega sozinho. **R:** recarrega a qualquer momento, se o pente não estiver cheio e houver reserva.
- Sem reserva e pente vazio: o clique faz um "clique seco" (som curto tirado do início do `colt_reload.wav`, se der; se não, fica mudo) e não atira.
- Enquanto a animação de recarga não existe (fase 4), a recarga é provisória: o Kael fica no `idle_gun` pelo tempo do som `colt_reload` (cerca de 2 s), sem andar.
- HUD: mostra `pente / reserva`, e um aviso "Recarregando".
- R deixa de reiniciar a cena; reiniciar fica no menu de pausa e, depois da morte, no Enter (resposta 2).

**Para e espera o teste do usuário.**

---

## Fase 3: corrida do Kael (PixelLab)

Duas animações novas, 8 quadros cada, viradas para East: `run_east` (chão em y=120) e `run_gun_east` (chão em y=121, arma baixa, sem mirar).

Pipeline do `CLAUDE.md`:
1. **Keyframe** com `edit_image_pro_flash` sobre `player_base_east.png` e `player_base_gun_east.png`: pose de corrida de perfil (corpo inclinado para a frente, passada longa, braços acompanhando), "strict side view profile", olhando para a frente.
   **Para e mostra os keyframes ao usuário antes de gastar créditos na animação.**
2. **Animação** com `animate_image` (primeiro e último quadro; número par de quadros; o quadro 0 da saída é a imagem de entrada). Se o ciclo não fechar, gerar meia passada e espelhar as pernas para a outra metade.
3. **Limpeza** por script novo, `tools/build_run.py`, com as funções do `sprite_lib.py`: cola a cabeça da base (`locate`, `smooth_path`, `paste_head`, no máximo 1 px por quadro), `remap` para a paleta de 14 cores, `ground`, `drop_islands`, `fill_holes`.
4. **Conferência:** linha do chão, contagem de cores, diferença do rosto contra a base igual a 0 e render ampliado ao lado do `walk` para conferir passada e quebra de pixel.

**No jogo:**
- `run` e `run_gun` em `ANIMS` e no `KAEL`, com os quadros dos passos (`steps`).
- Correr segurando Shift, velocidade `RUN_SPEED` 200 px/s `[TESTE]` (andar é 120). Mirar, atirar ou recarregar para a corrida: o Kael para (respostas 4 e 5).
- Passos de corrida com os cortes do `running_sneakers_on_asphalt` (fase 1).
- A câmera já segue com olhar à frente. Se a corrida deixar o Kael perto demais da borda, o olhar à frente cresce um pouco correndo (`[TESTE]` no `CameraRig.ts`).

**Para e espera a aprovação do usuário** (sprites e sensação de corrida).

---

## Fase 4: recarga do Kael (PixelLab)

Animação `reload_gun_east`, parado, chão em y=121, a partir do `idle_gun`:
1. Keyframes com `edit_image_pro_flash`: tirar o pente (mão na base da pistola) e bater o pente novo. O pente cai para fora do quadro (ou some), sem objeto solto no chão.
   **Para e mostra ao usuário.**
   Status (12/10/2026): 3 opções geradas a partir do `idle_gun_east_00` (seeds 11, 77 e 23) em `assets/player/drafts/reload_keys/`, comparação em `reload_keys_compare.png` e `reload_keys_zoom.png`. Usuário mandou iniciar a fase 4; seguiu a seed 11 (recomendação da IA), limpa em `drafts/reload_key_east.png`.
   Status (12/10/2026): **animação pronta e ligada no jogo.** Dois trechos de `animate_image` (6 quadros, seed 77): `idle_gun` → key e key → `idle_gun`, em `drafts/reload_raw/a_*` e `b_*`. Nos quadros a_4 e a_5 o pente sumia da mão; foram trocados por intermediários de a_3 a a_6 (`tween_*`). `tools/build_reload.py anim` monta `reload_gun_east/`: 11 quadros × 190 ms = 2,09 s, chão 121, 14 cores. O pente entra no quadro 6 (1,14 s), junto do clique do som (1,16 s). No `Test.ts`, `reload()` toca o `reload_gun`. Testado no navegador sem erro. **Aguardando aprovação do usuário.**
2. `animate_image` do `idle_gun` ao keyframe e do keyframe de volta ao `idle_gun`, para começar e terminar na mesma pose (sem salto ao voltar para o `idle_gun` ou para a mira).
3. Mesma limpeza da fase 3 (cabeça da base, paleta, chão), no `tools/build_reload.py`.
4. **Sincronia com o som:** o `colt_reload.wav` tem 2,08 s. A duração de cada quadro em `ANIMS` é ajustada para o clique do pente cair no quadro em que o pente entra. Se a animação ficar mais curta que o som, o som é cortado no script de passos (`build_sfx.py` vira `build_sfx.py`) e não a animação esticada.

**No jogo:** a recarga provisória da fase 2 passa a tocar o `reload_gun`. Se o jogador estava mirando, a arma volta para a mira no fim. Se não, volta para o `idle_gun`.

**Para e espera a aprovação do usuário.**

---

## Fase 5: corrida e recarga dos policiais

Mesmo método do `police_variants.md`, sem nenhuma cabeça nova:
1. `transfer_outfit` sobre os quadros do `run_gun` e do `reload_gun` do Kael, com o keyframe do master como referência e o mesmo seed (3 quadros por chamada em 128 px: cerca de 3 chamadas por animação de 8 quadros). O `run` sem arma fica de fora, porque o policial está sempre armado.
2. `tools/build_police_master.py` ganha as duas animações (snap para a paleta master, chão em y=121, furos e pixels soltos).
3. `tools/build_police_variants.py` monta `police_a`, `police_b` e `police_c` (pele por proporção, cabeça colada pelo contorno do quepe, quepe do master por cima, olho azul na B). Na recarga, as mãos passam na frente do corpo, e não do rosto. Se passarem pelo rosto, vale a mesma regra do aim de 0 a 3 (mãos e pistola do master por cima da cabeça colada).
4. Conferência igual à do `police_variants.md`: quadros iguais aos do Kael, cores, chão, rosto e as três variantes lado a lado.
   **Para e mostra a `police_a` ao usuário antes das outras duas.**
   Status (12/10/2026): **master e `police_a` prontos; `police_b` e `police_c` esperando a aprovação da `police_a`.** `transfer_outfit` (3 quadros por chamada, mesma referência e seed) gerou `drafts/raw_transfer/run_gun_east_00..08` e `reload_gun_east_00..10`; jobs em `transfer_jobs.txt`. Master: 9 e 11 quadros, chão 121, 24 cores. `police_a`: 26 cores, sem pele do master sobrando, sem furos. Na corrida, a cabeça fica a desenhada pela IA com a pele trocada (o encaixe pelo quepe não achou posição boa, e a regra da corrida do Kael é a mesma). Na recarga, o rosto da variante foi colado em todos os quadros. Prévia em `drafts/police_a_preview.png`.
   Correção (12/10/2026, usuário viu a mão sumindo na recarga): nos quadros 1, 2, 8 e 9 a colagem do rosto apagava a mão que passa na frente do rosto e do peito. A regra das mãos por cima (`HANDS_FRONT`, a mesma do aim de 0 a 3) agora vale para a recarga inteira; `police_a` refeita, sem furos.
   Correção 2 (12/10/2026, usuário viu o pente e parte da mão esquerda sumindo): o `transfer_outfit` tratou o pente branco do Kael como fundo nos quadros 2 a 4 e furou a mão. `build_police_master.py` (`patch_reload_hand`) devolve os pixels do Kael (mesma pose, alinhada) remapeados para a paleta do master, só onde o quadro está vazio na caixa da mão esquerda. Vale para as três variantes.
   Status (12/10/2026): **`police_b` e `police_c` geradas** (usuário pediu para terminar a fase 5). As três variantes: corrida 9 quadros e recarga 11, chão 121, sem furos e sem pele do master sobrando. O quadrado verde que aparecia quando o policial entrava era a textura da corrida faltando nessas duas; testado no Chrome com as seeds `abc123` e `kael1`, sem erros e sem o quadrado.

**No jogo** (resposta 8):
- O policial entra na arena correndo (`run_gun`) e anda só nos últimos passos até o ponto de parada.
- Pente de 8 para o policial: depois de 8 tiros, toca `reload_gun` com o som da recarga, sem atirar nesse tempo.
- Passos de corrida do policial, mais baixos que os do Kael.

Status (12/10/2026): **ligado no jogo.** No arquétipo `patrol` (`Police.ts`, [TESTE]): `runSpeed` 190 px/s, anda só nos últimos `walkLastPx` 70 px, pente `mag` 8. Novo estado `reloading`: depois do 8º tiro, quando ele abaixa a arma (ou volta do `hurt`), toca `reload_gun` com o `colt_reload` na posição dele (volume `copReload` 0,4) e não atira até acabar; tomar tiro corta o som. Passos de corrida com volume `copRunStep` 0,22. Teste no Chrome (seed `abc123`, b e c trocados pela `police_a` só no teste): entram correndo, andam no fim, recarregam ~1,5 s depois do 8º tiro e voltam ao `idle_gun`, sem erros. Com o ritmo atual de tiro (~4,3 s entre tiros de cada policial), a recarga só acontece depois de ~35 s na arena. **Fase 5 completa (12/10/2026), aguardando o teste do usuário.**

**Para e espera o teste do usuário.**

---

## Fase 6: menu principal "Saves Her"

Pode vir antes, se o usuário preferir: não depende de nenhuma fase de arte.

- **Visual:** minimalista no estilo do menu do The Last of Us, com traço cartunesco. Fundo com a rua da quadra 1 no entardecer (uma captura do cenário já pronto, escurecida e desfocada, ou a própria cena rodando atrás do menu, devagar). Título **Saves Her** grande, à esquerda. Itens empilhados embaixo dele, também à esquerda, com destaque ao passar o mouse ou com as setas.
- **Fonte:** uma fonte de exibição cartunesca para o título e uma simples e legível para os itens, salvas no projeto (`assets/fonts/`) para funcionar sem internet. Duas ou três opções para o usuário escolher.
- **Itens:** Novo Jogo e Opções. Opções: volume da música, volume dos efeitos, tela cheia e língua.
- **Internacionalização (resposta 6):** português por padrão e inglês. Os textos da interface (menus, HUD, diálogo dos controles e avisos) saem do código para `src/i18n/pt_br.ts` e `src/i18n/en.ts`, com uma função `t(chave)`. O inglês tem as mesmas chaves, e o TypeScript cobra se faltar alguma. A língua escolhida fica no `localStorage`. O título "Saves Her" é o mesmo nas duas línguas. Os volumes são guardados no navegador (`localStorage`) e chegam ao Phaser pelo `bus` (eventos novos em `GameEvents`, por exemplo `settings:volume`).
- **Navegação:** mouse, setas e Enter. Esc volta.
- O **menu de pausa** ganha o mesmo visual (Continuar, Opções, Reiniciar, Voltar ao título).
- O menu fica sem música; a OST começa quando a fase abre (resposta 7).
- O texto "Jogar cena de teste" sai do título. A cena de teste continua sendo o que o New Game abre, até a quadra 1 de verdade existir.

**Arquivos:** `src/ui/Menu.tsx` (título e pausa), `src/ui/Options.tsx` (novo), `src/i18n/` (novo), CSS do menu e `events.ts`.

Status (12/10/2026): **fase 6 completa, aguardando o teste do usuário.** Como ficou:
- **Logo** pelo PixelLab (`create_image_pro`, 160x64): 8 candidatos, todos com "SAVES HER" escrito certo, guardados em `assets/ui/drafts/title_logo/` (`sunset_0..3`: letras cheias em degradê de pôr do sol; `cream_0..3`: creme com sombra vinho). Escolhido pela IA o `sunset_1` (o mais limpo e cheio, nas cores do entardecer da quadra), recortado em `assets/ui/title_logo.png` (154x50) e mostrado em 4x sem suavizar (2x na pausa). O usuário pode trocar por outro dos drafts.
- **Fundo:** captura da rua da quadra 1 no entardecer (960x540, sem HUD, relógio de debug apagado) em `assets/ui/title_bg.png`. O CSS escurece, desfoca e anda devagar (40 s), com sombra da esquerda para o texto ficar legível.
- **Fonte dos itens:** Pixelify Sans (licença OFL, `assets/fonts/pixelify_sans.ttf` e `pixelify_sans_ofl.txt`), carregada pelo `@font-face`, sem internet. O título é a imagem do logo, então não precisou de fonte de exibição.
- **Itens:** Novo Jogo (abre a cena de teste) e Opções. Opções: Música e Efeitos (10 blocos cada, ← → ou clique), Tela cheia, Língua (Português/English) e Voltar. Selecionado em amarelo do logo, com marcador de triângulo.
- **Navegação:** setas (e W/S), Enter, mouse; Esc volta (`src/ui/useMenuKeys.ts`).
- **Pausa:** mesmo visual por cima do jogo parado (logo menor, "Pausado", Continuar, Opções, Reiniciar, Voltar ao título). Esc continua. O HUD some enquanto a pausa está aberta.
- **i18n:** `src/i18n/pt_br.ts` (padrão), `src/i18n/en.ts` (`Record<TextKey, string>`, o TypeScript cobra chave faltando) e `t(chave)` em `src/i18n/index.ts`, que não depende de React nem de Phaser (os dois leem). Menus, HUD, diálogo, ajuda da cena, aviso de morte, popup do loot e "Carregando..." traduzidos. Textos de debug (F1, relógio, "tela N", C) seguem em português. Língua no `localStorage` (`savesher.lang`).
- **Volumes:** `localStorage` (`savesher.volume`, 0 a 10) e o evento novo `settings:volume` (0 a 1), que o `bus` guarda como os `hud:*`. O `Sfx.ts` multiplica: efeitos no `playAt` e música no `startMusic` (e muda a música tocando na hora). A tecla **M** saiu (agora o volume fica nas opções).
- Título da aba: "Saves Her".
- Teste no Chrome (1280x720): título, seleção, opções (música 7, língua inglês), volta, recarga da página mantendo as escolhas, Novo Jogo com a ajuda em inglês, música da fase com o volume reduzido, pausa, opções na pausa, Esc Esc volta ao jogo, Voltar ao título. Sem erros no console.

**Para e espera a aprovação do usuário.**

---

## Ao fim de cada fase

- `npm run typecheck` e teste no navegador.
- `docs/decisions.md`: decisões novas com data e fonte, valores novos em AJUSTAR EM TESTE.
- `docs/handoff.md`: estado atual, pendências e arquitetura (pastas `assets/sounds/` e `src/game/audio/`).
- `CLAUDE.md`: estrutura (sons, scripts novos em `tools/`) e o nome do jogo.
- Status desta fase no topo deste plano.

## Custo estimado no PixelLab

| Fase | Chamadas |
|---|---|
| 3: keyframes de corrida (2) + animações (2, mais refazer se o rosto virar) | cerca de 4 a 8 |
| 4: keyframe da recarga + 2 trechos de animação | cerca de 3 a 5 |
| 5: `transfer_outfit` do `run_gun` e do `reload_gun` | cerca de 6 |
