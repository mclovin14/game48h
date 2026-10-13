# Plano: pulo, agachar, mercenários, cutscene de abertura e finais

**Status em 12/10/2026:** plano aprovado pelo usuário. Fase 1 (pulo do Kael + bala de verdade do policial) feita. Fase 2 (agachar do Kael, refeito ajoelhado) **aprovada pelo usuário**. Fase 3 (pulo e agachar nos policiais) **aprovada pelo usuário** em 13/10/2026. Fase 4 (Adriana) **aprovada pelo usuário** em 13/10/2026. **Fase 5 (mercenários e van) feita em 13/10/2026: base, van e animações aprovadas; `Mercenary.ts` com os 3 tons por canvas; fase com 4800 px e a arena dos mercenários na quinta tela, com a van; som do fuzil CC0 (AK-47) a cada tiro da rajada. Aguardando o teste do usuário e a aprovação do som.** Os mercenários ainda ficam parados (a luta é da fase 7). Fase 6 (cutscene de abertura) **aprovada pelo usuário** em 13/10/2026. **Fase 7 (luta com os mercenários e finais) feita em 13/10/2026, aguardando o teste do usuário e a aprovação dos textos dos finais.** **Fase 8 (ilustrações animadas dos finais) feita em 13/10/2026, aguardando o teste do usuário.**

## Pedido do usuário (12/10/2026)

- **Pulo e agachar do Kael.** O pulo vai sempre para a frente, para desviar das balas. Os dois movimentos existem com arma e sem arma. Depois vão para os policiais.
- **Cutscene de abertura no estilo dos anos 90.** No fim da rua aparece a Adriana, segura por **três mercenários do Geraldo**, e pede socorro ao Kael. O Geraldo não aparece. Referência: `docs/references/adriana/Gemini_Generated_Image_gawtdngawtdngawt.jpeg`.
- **Só esta fase.** A fase atual é o exemplo do jogo, e não as cinco quadras. A Adriana fica no fim da rua, como na imagem, e o Kael a resgata nesta primeira fase.
- **Os chefes desta fase são os três mercenários, de fuzil.** Personagem e animações feitos do zero (não reaproveitam o policial). Os três vêm de uma vez e cercam o Kael, que só tem a pistola: ele precisa ser mais rápido. Matar mercenário não tira índole.
- **Finais no fim desta cena de teste**, pela índole:
  - abaixo de 50%: o Kael morre no fim ("não mereço o final feliz");
  - 50% ou mais: final feliz.

### Respostas

| Pergunta | Resposta do usuário |
|---|---|
| Quem segura a Adriana | Três mercenários do Geraldo. O Geraldo não aparece nesta cena. |
| Onde ela está | No fim da rua, como na referência. O Kael a resgata nesta fase. |
| Escopo | Só a fase atual, usada de exemplo. |
| Chefes | Os três mercenários, **de fuzil**, feitos do zero, com todas as animações novas. Os três vêm **de uma vez** e cercam o Kael (primeiro o usuário sugeriu reaproveitar o corpo do policial; depois mudou para fazer do zero). |
| Índole | Matar mercenário **não tira índole**. |
| Finais | Agora, no fim da cena de teste. |
| Pulo | Não é invencível: bala que bate nele acerta. O pulo tem de passar por cima da bala. O Kael é atlético e sobe por volta de 1,5 m. |
| Agachar | Não anda e leva menos tiros. Atira agachado, então entram as animações de mirar e atirar agachado. |
| Agachado a fase inteira | Pode. Por isso os policiais precisam de IA para reconhecer quando ele está agachado. |

---

## Respostas que fecharam os pontos em aberto

1. **IA contra o agachado (confirmada pelo usuário em 12/10/2026).** O policial percebe que o Kael está agachado e, depois de um tempo de reação, agacha também e atira baixo, na mesma linha.
   - Bala alta passa por cima do Kael agachado.
   - Bala baixa se desvia pulando.
2. **Arma dos mercenários: fuzil.** O mercenário é feito do zero, com todas as animações novas.
3. **Matar mercenário não tira índole.**

**Proposta da IA:** se os três atacam juntos, ninguém segura a Adriana. Ela fica presa ao lado da van, gritando, até a luta acabar. O usuário pode mudar.

---

## Mudança de sistema: o tiro do policial vira bala de verdade

Hoje o tiro do policial é um sorteio de acerto (70%) na hora do disparo. Para o pulo desviar e o agachar proteger, a bala precisa existir no mundo:

- **Projétil visível** (traço curto e brilhante), voando reto a cerca de 650 px/s [TESTE]. Dá tempo de reagir ao aviso da mira (0,45 s), mais o voo.
- **Altura da bala:**
  - **alta** (peito, cerca de 70 px acima do chão) contra o Kael em pé;
  - **baixa** (cerca de 30 px) quando o policial agacha para atirar.
- **Acerto pela caixa do corpo do Kael**, que muda com a pose:
  - em pé: 0 a 100 px;
  - agachado: 0 a 60 px;
  - no pulo: a caixa sobe junto.

  A pontaria imperfeita vira uma pequena variação na altura da bala [TESTE], no lugar do sorteio de 70%.
- **Escala:** o Kael tem cerca de 100 px de altura (1,80 m), então 1,5 m de pulo dá cerca de 85 px. A parte de baixo do corpo passa por cima da bala alta (70 px) e com sobra da baixa.
- **Pulo para a frente** [TESTE]: cerca de 180 px de distância, 0,7 s, sem mudar de direção no ar.
- **Tiro do Kael:** continua instantâneo, mas respeita a altura.
  - Em pé, a bala sai na altura do peito e passa por cima do policial agachado.
  - Agachado, a bala sai baixa e acerta os dois.

---

## Parte A: pulo e agachar

**Pipeline** (o das fases 3 e 4 do plano anterior):
1. Keyframe com `edit_image_pro_flash`.
2. `animate_image` do `idle`/`idle_gun` até o keyframe e de volta.
3. Limpeza: paleta da base, chão 120/121, sem fragmentos. A cabeça é a que a IA desenhou.
4. Conferência ampliada antes de mostrar.

Os quadros não saem do lugar: a cena move o Kael em x e y (parábola).

### Fase 1: pulo do Kael
- **Sprites:** `jump_east` (sem arma) e `jump_gun_east` (pistola junto ao corpo), com cerca de 8 a 10 quadros: impulso, subida encolhida, queda e aterrissagem. Script novo: `tools/build_jump.py`.
- **Jogo:**
  - Espaço ou W pula para o lado em que ele olha [TESTE das teclas].
  - Correndo, vai mais longe [TESTE].
  - Não pula durante a recarga. O pulo cancela a mira.
  - Som de passo de corrida no impulso e na aterrissagem.
- **Balas:** entra aqui a bala de verdade do policial (seção acima), para testar o desvio já nesta fase.
- **Para e espera o teste.**
- **Status (12/10/2026): feita, aguardando o teste.**
  - Sprites: `jump_east` e `jump_gun_east`, 11 quadros cada (0-2 impulso, 3-8 no ar, 9-10 aterrissagem), por `tools/build_jump.py`. Keyframes do pico em `assets/player/drafts/jump_keys/` (sem arma seed 77, com arma seed 1911, escolhidos pelo rosto de perfil); brutos em `drafts/jump_raw/`.
  - Jogo: Espaço, W ou ↑ pula para o lado do movimento (ou para onde olha); 180 px parado, 240 px correndo, 85 px de altura, cerca de 0,8 s. Cancela a mira e o tiro pendente; não recarrega, não troca bala nem atira no ar.
  - Bala do policial (`src/game/actors/Bullets.ts`): 650 px/s, sai do cano (36 px à frente, 91 px de altura) 60 ms depois do tiro; com a chance `hitChance` mira o peito (55 ± 8 px), senão passa por cima (112 a 126 px). Acerta pela caixa do corpo: 100 px em pé, 80 px no ar. Medido: pulando até ~0,25 s depois do tiro (a 400 px), a bala passa por baixo.
: agachar do Kael
- **Sprites:**
  - `crouch_east` e `crouch_gun_east`: abaixar; levantar é o mesmo ao contrário.
  - `crouch_aim_gun_east`: sobe a arma agachado.
  - `crouch_shoot_gun_east`: o clarão vem do `tools/shoot_fx.py`, a partir do último quadro da mira.
- **Jogo:**
  - Segurar S ou Ctrl agacha; soltar levanta [TESTE das teclas]. Agachado ele não anda.
  - Mira e tiro agachado com o mouse, como em pé.
  - Recarga agachado permitida [TESTE].
  - Caixa do corpo menor. Tiro baixo.
- **Para e espera o teste.**
- **Pedidos do usuário que entraram nesta fase (12/10/2026):** a bala do Kael também voa e é desenhada no Phaser (como a dos policiais) até chegar neles; o Kael atira para o lado em que olha (A/D viram; o mouse não vira mais).
- **Status (12/10/2026): feita, aguardando o teste.**
  - Sprites (`tools/build_crouch.py`), **refeitos ajoelhados** a pedido do usuário (a primeira versão, de cócoras, foi descartada: pose fraca e rosto bugando). Pose de cavaleiro: joelho esquerdo no chão, perna direita dobrada. O tronco ajoelhado é o de pé 18 px mais baixo, então `crouch_aim_gun_east` e `crouch_shoot_gun_east` (8 quadros cada, mesmos tempos de pé) são os quadros do `aim_gun` e do `shoot_gun` descidos sobre as pernas ajoelhadas. `crouch_east` (5 quadros) e `crouch_gun_east` (6 quadros), a 50 ms, vêm do `animate_image`, com a cabeça (e a pele do pescoço) do idle colada em cada quadro. As pernas ajoelhadas são as do último quadro da IA em cada transição, que têm os 4 tons do jeans e o branco do tênis. O keyframe da IA pintava o jeans de um azul só, e a calça mudava de cor ao agachar (correção pedida pelo usuário, junto com o joelho da frente, que saía cortado na cintura). Keyframes em `assets/player/drafts/kneel_keys/` (guia das pernas: `key_aim_s1911`; alvo sem arma: `key_nogun_s1911`; com arma: `kneel_gun`, montado); brutos em `drafts/kneel_raw/`.
  - Jogo: segurar S, ↓ ou Ctrl agacha (Ctrl acrescentado depois, a pedido do usuário; Command fica de fora porque Command + Espaço abre o Spotlight e Command + W fecha a aba). Agachado não anda; A/D viram. Mira e tiro agachado. Mirando, trocar de pose abaixa a arma, troca e sobe de novo, com as animações em dobro (cerca de 0,8 s). Agachado também pula. A recarga agachada não tem animação própria: ele fica parado na pose enquanto o som toca.
  - Bala do Kael: `Bullets` virou genérico (uma instância por lado). A do Kael voa a 1400 px/s, reta, até 900 px, e acerta o primeiro policial em pé que cruzar (caixa de 100 px). Em pé sai a 91 px do chão; ajoelhado, a 73 px.
  - **Alturas medidas no sprite:** o Kael agachado tinha 78 px (de cócoras); ajoelhado tem 86 px, não 60 como o plano supunha. O tiro do policial em pé subiu para a altura do pescoço (93 ± 3 px), que passa por cima do Kael ajoelhado; o pulo (85 px) não passa mais por baixo dela. Fica a regra "policial em pé atira alto (agacha para desviar); policial agachado atira baixo (pula para desviar)", com a bala baixa entrando na fase 3.

### Fase 3: pulo e agachar nos policiais
- `transfer_outfit` das animações novas para o master (`tools/build_police_master.py`). Depois as variantes `police_a/b/c` (`tools/build_police_variants.py`), com a cabeça colada quadro a quadro e as mãos por cima onde precisar.
- **Risco:** na pose agachada a cabeça fica mais baixa. A colagem precisa achar a cabeça por quadro, como já faz no `death`.
- **IA** [TESTE], no arquétipo `patrol`:
  - agacha para recarregar;
  - reconhece o Kael agachado, agacha também e atira baixo, na mesma linha (confirmado pelo usuário);
  - pula para a frente ao entrar na arena, ou com uma chance pequena quando o Kael mira nele.
- **Para e espera o teste.**
- **Feito (12/10/2026):** `transfer_outfit` (ref. `police_master_base_east`, seed 1911) do `jump_gun` (11 quadros) e do `crouch_gun` (6) do Kael; jobs em `drafts/transfer_jobs.txt`. A pose ajoelhada parada, `crouch_aim_gun`, `crouch_shoot_gun` e `crouch_reload_gun` são os quadros em pé descidos 18 px sobre as pernas do último quadro do crouch (`kneel_legs` e `on_legs` em `build_police_master.py`); nas variantes, os quadros em pé da própria variante, então o rosto é o mesmo. No pulo e na transição do ajoelhar, a cabeça da variante é achada mais embaixo (`DEEP` em `build_police_variants.py`). IA no `patrol` com os valores [TESTE] no `decisions.md`.
- **Status (12/10/2026): feita, aguardando o teste.**

---

## Parte B: Adriana, mercenários, cutscene e finais

### Fase 4: Adriana
- **Base** pelo PixelLab, fiel à referência: ruiva de cabelo longo, vestido vermelho, salto preto.
  - Quadro 128x128, chão y=120, mesma escala do Kael.
  - Paleta fixa da base.
  - Duas ou três opções para o usuário escolher.
- **Animações:**
  - `held_east`: presa pelo braço, se debatendo, em loop.
  - `cry_east`: estende o braço e grita.
  - `freed_east`: solta, corre até o Kael.
  - `kneel_east`: ajoelha, para o final triste.
  - pose final do abraço/encontro, para o final feliz.
- **Retratos** para a caixa de fala (`create_portrait_character`): Adriana e Kael.
- **Arquivos:** `assets/characters/adriana/` e `tools/build_adriana.py`.
- **Para e espera a aprovação da arte.**
- **Feito (13/10/2026):** base aprovada (opção A, nariz refeito, olhos verdes) em `assets/characters/adriana/adriana_base_east.png`. Keyframes em `drafts/keys/`, brutos em `drafts/raw/` e `tools/build_adriana.py` geram `held`, `cry`, `freed` (corrida em loop), `kneel` e `hug` (braços abertos), com sheets e GIFs em `assets/characters/adriana/`. No `held` o rosto do quadro 0 é colado nos outros. Retratos 64x64 de frente: `adriana_portrait.png` e `assets/player/player_portrait.png`. Ainda não ligados no jogo (fase 6, cutscene).

### Fase 5: os três mercenários (de fuzil, do zero) e a van
- **Base** pelo PixelLab, fiel à referência:
  - balaclava, farda tática verde-oliva, colete, fuzil;
  - quadro 128x128, chão y=121 (com arma), mesma escala do Kael e do policial.
- Paleta fixa tirada da base. Duas ou três opções para o usuário escolher.
- **Três variações** (tom da farda e detalhe do colete ou da balaclava), por rampas de paleta, como as fardas dos policiais.
- **Animações**, todas novas e com o fuzil nas duas mãos. Pipeline do Kael: keyframe com `edit_image_pro_flash`, `animate_image`, limpeza.

  | Animação | O que é |
  |---|---|
  | `idle_rifle_east` | parado, fuzil baixo |
  | `walk_rifle_east` | anda |
  | `run_rifle_east` | entra correndo para cercar |
  | `aim_rifle_east` | sobe o fuzil |
  | `shoot_rifle_east` | rajada de 3 tiros; clarão pelo `tools/shoot_fx.py` |
  | `reload_rifle_east` | troca o pente |
  | `crouch_rifle_east` | agacha |
  | `crouch_shoot_rifle_east` | atira agachado |
  | `jump_rifle_east` | pulo para a frente |
  | `hurt_east` | leva tiro |
  | `knockout_east` | nocaute (bala não letal) |
  | `death_east` | morte (bala letal) |
  | `hold_east` | segura a Adriana pelo braço, na cutscene; casa com o `held_east` dela |

- **Som:** um tiro de fuzil novo. O usuário manda o arquivo, ou a IA procura um de licença livre e o usuário aprova.
- **Van escura** de lado, com a porta aberta, pelo PixelLab. Fica parada no fim da rua.
- **Arquivos:** `assets/enemies/mercenaries/`, `tools/build_mercenary.py` e `src/game/actors/Mercenary.ts`.
- **Para e espera a aprovação da arte** (base primeiro, depois as animações).
- **Status (13/10/2026): feita, aguardando o teste e a aprovação do som.** Arte aprovada; no jogo os três ficam parados na arena (x 4330, 4420, 4700) com a van (x 4560, escala 1,5). `Mercenary` emite `mercenary-shot` em cada tiro da rajada, para a fase 7 criar a bala.

### Fase 6: cutscene de abertura (no Phaser, com os sprites do jogo)
1. Faixas pretas em cima e embaixo; HUD escondido.
2. Abre no Kael parado no começo da rua, no entardecer.
3. A câmera desliza até o fim da rua: a Adriana presa, os três mercenários e a van.
4. Caixa de fala com retrato. O texto aparece letra por letra, com um bipe curto, e Enter avança.
5. A câmera volta ao Kael, as faixas saem, a OST começa e aparece a ajuda dos controles.

- Esc pula a cutscene. Ela não toca de novo ao reiniciar.
- **Rascunho das falas** (não aprovado), em `src/i18n/` (pt e en):
  > **Adriana:** KAEL! Socorro!
  > **Adriana:** São homens do Geraldo! Me tira daqui!
  > **Kael:** Aguenta firme. Eu tô indo.

  A segunda fala revela que o Geraldo é o mandante, e o `story.md` guarda isso como segredo. Alternativa sem revelar: "Eles vão me levar! Me ajuda!" A escolha é do usuário.
- A mensagem estática de abertura (`story.md`, seção 5) pode virar a primeira tela, antes da câmera. A escolha é do usuário.
- **Código:** `src/game/cutscene/`, um roteiro em passos (mover câmera, fala, animação, esperar), e o evento `cutscene:line` no `bus` para a caixa de fala no React.
- **Para e espera o teste.**

**Feita em 13/10/2026 (aguardando o teste do usuário):**
- Respostas do usuário: a tela de texto do `story.md` (seção 5) entra antes da câmera; a segunda fala é a que não revela o Geraldo ("Eles vão me levar! Me ajuda!").
- `src/game/cutscene/Cutscene.ts` (roteiro em passos: `intro`, `line`, `pan`, `act`, `wait`) e `opening.ts` (o roteiro e os tempos [TESTE]).
- `src/ui/Cutscene.tsx`: faixas pretas, tela de texto, caixa de fala no alto com retrato, texto letra por letra com bipe de onda quadrada (Adriana 880 Hz, Kael 440 Hz). Enter, espaço ou clique avança; Esc pula.
- `CameraRig.pan`/`follow`; a Adriana (`held`) fica 55 px [TESTE] à frente do mercenário que a segura (`boss.holder` em `level_1.ts`).
- Toca uma vez por jogo (registro `openingPlayed`); reiniciar a fase não repete, e voltar ao título e começar de novo repete. A OST e a ajuda dos controles entram no fim.
- Correção junto: os ouvintes do `bus` agora saem também no `DESTROY` (voltar ao título e começar de novo travava o React).

### Fase 7: chefes no fim da rua e finais
- **Arena final** depois da última barricada. A câmera trava, como nas barricadas.
- **Luta:**
  - Os três mercenários vêm **de uma vez** e **cercam o Kael**: dois pela direita e um entra correndo pela esquerda, por trás dele [TESTE].
  - A câmera trava com o Kael no meio.
  - A Adriana fica presa ao lado da van (proposta da IA).
- **Os mercenários são mais fortes que os policiais** [TESTE]:
  - vida maior, com uma barra para cada um na tela;
  - rajada de fuzil de 3 balas (cada uma desviável pulando ou agachando);
  - mira mais curta;
  - também agacham e pulam, com a mesma IA do agachado.
- **Equilíbrio:** o Kael só tem a pistola, então precisa ser mais rápido. O aviso de mira de cada mercenário aparece na tela, e eles se revezam para não atirarem os três juntos [TESTE].
- Letal ou não letal, como os policiais. **Matar mercenário não tira índole.**
- **Fim:** quando os três caem, a Adriana é solta e corre até o Kael.
  - **Índole ≥ 50%:** o final feliz vai para a cutscene final feliz (fase 8).
  - **Índole < 50%:** um dos mercenários caídos atira uma última vez (proposta da IA). O Kael cai (`death_east`) e vai para a cutscene final triste (fase 8).
- Os textos dos finais ficam em `src/i18n/` e são aprovados pelo usuário.
- **Para e espera o teste.**
- **Respostas do usuário (13/10/2026):** no final triste, o último tiro vem de um mercenário caído. Às perguntas sobre combo e vida, o usuário respondeu que hoje "nada funciona neles nem combos nem balas" (era o estado antes desta fase); a IA seguiu com os valores recomendados, [TESTE].
- **Feita em 13/10/2026 (aguardando o teste):**
  - `src/game/actors/Gunner.ts`: a IA do policial virou genérica (quem atira), com um kit por personagem (animações, som, cano, altura) e rajada (`burst`). `Police` e `Mercenary` estendem o `Gunner`; a IA do policial não mudou.
  - `src/game/actors/BossFight.ts`: a luta dispara quando o Kael passa 30% da última tela (ou quando acerta um mercenário antes). A câmera trava na última tela; o mercenário mais à esquerda corre por trás do Kael (230 px) e os outros dois param à frente (260 e 400 px). Revezamento: só um mira por vez, com 450 ms entre um e outro. Barra de vida vermelha em cima de cada um e "!" vermelho piscando em quem mira (cores de efeito).
  - Mercenário: vida 5 (5 tiros), o chute do combo tira 3 (dois combos derrubam), socos só dão o tranco; mira 320 ms; rajada de 3 balas com dano 6 e 60% de acerto; pente de 4 rajadas; agacha junto com o Kael; pula 20% das vezes quando o Kael mira nele. Matar não tira índole; derrubado, solta a caixa de munição como o policial.
  - `src/game/cutscene/ending.ts`: os dois finais. Feliz (índole ≥ 50%): a Adriana levanta, corre até o Kael, abraça, falas, tela de texto "FIM". Triste: o mercenário caído mais perto dá o último tiro, o Kael cai (`death`), a Adriana corre e se ajoelha ao lado dele, fala, tela de texto "FIM". Depois volta ao título. A tela de texto é provisória até a fase 8.
  - Textos dos finais em `src/i18n/` (pt_br e en), propostos pela IA.

### Fase 8: cutscenes finais (pixel art pelo PixelLab)
- **Duas ilustrações animadas** em pixel art, maiores que os sprites do jogo, em tela cheia com faixas pretas:
  - **Final feliz:** o Kael e a Adriana se beijando na rua da quadra 1, à noite, com a luz do poste.
  - **Final triste:** o Kael morrendo nos braços da Adriana, ajoelhada na rua, à noite.
- **Formato** (recomendação da IA, a pedido do usuário): animação curta em loop, no espírito de um GIF, mas guardada como **spritesheet** e tocada pelo Phaser.
  - O PNG mantém os pixels nítidos na ampliação e não perde cores, como o GIF perderia.
  - O jogo controla o tempo: o texto entra depois e Enter fecha.
  - Um GIF de prévia é salvo junto, como nos sprites.
  - Movimento sutil, para não deformar os rostos:
    - feliz: cabelo e vestido ao vento, luz do poste piscando;
    - triste: a Adriana tremendo, chuva fina ou as luzes da viatura ao longe.
- **Pipeline:**
  1. `create_image_pro` com a referência da Adriana e a base do Kael, para manter os dois fiéis. Cerca de 256x144 [TESTE], ampliado em múltiplo inteiro.
  2. Duas a quatro opções de cada final, para o usuário escolher.
  3. `animate_image` para o loop.
  4. Limpeza: paleta, sem fragmentos, rosto conferido ampliado.
- **Sequência:** ilustração → texto final aparecendo letra por letra → tela "Fim" → volta ao título.
  - O texto de cada final fica em `src/i18n/` e é aprovado pelo usuário.
  - Sons [TESTE]: no feliz, a OST mais baixa; no triste, só o ambiente ou silêncio.
- **Arquivos:**
  - `assets/cutscenes/ending_happy/` e `assets/cutscenes/ending_sad/` (quadros, sheet e GIF de prévia);
  - `tools/build_endings.py`;
  - `src/game/scenes/Ending.ts`.
- **Para e espera o teste.**
- **Feita em 13/10/2026:**
  - O usuário escolheu a opção 3 do feliz (close no beijo) e a opção 1 do triste (ela com o Kael no colo, na chuva).
  - **Tamanho:** 160x90 em vez de 256x144, porque amplia 6x direto para 960x540 e o `create_image_pro` devolve 4 opções por chamada.
  - **Placas do feliz:** trocadas por "ÓTICA" e "MODAS" (lojas da fase) no `tools/build_endings.py`.
  - **Animação:** `animate_image`, 8 quadros com o primeiro igual ao último. No feliz só o casal mexe: as placas tremiam e o halo do poste piscava em blocos, então o resto vem da base. No triste, a moldura de interface do rodapé virou uma tarja preta.
  - **Sem a paleta de 14 cores:** são ilustrações, com as cores do PixelLab.
  - **Desvio:** em vez de `src/game/scenes/Ending.ts`, a ilustração é um passo `art` do roteiro de cutscene (`Cutscene.ts`), que também conta com as falas e a tela de texto.
    - `src/game/cutscene/endingArt.ts` carrega as sheets.
    - O evento `cutscene:art` esconde as faixas pretas no React.

---

## Ao fim de cada fase

- `npm run typecheck` e teste no navegador (Playwright no Chrome).
- `docs/decisions.md`: decisões novas com data e fonte; valores novos em AJUSTAR EM TESTE.
- `docs/handoff.md`: estado atual e pendências.
- `CLAUDE.md`: estrutura (pastas e scripts novos).
- Status da fase no topo deste plano.

## Custo estimado no PixelLab

| Fase | Chamadas |
|---|---|
| 1: keyframes do pulo (2) + animações (4, mais refazer se o rosto virar) | cerca de 6 a 10 |
| 2: keyframes do agachar e da mira agachada (3) + animações (4 a 6) | cerca de 8 a 12 |
| 3: `transfer_outfit` das animações novas para o policial | cerca de 6 a 10 |
| 4: base da Adriana (2 a 3 opções) + 5 animações + 2 retratos | cerca de 12 a 18 |
| 5: base do mercenário (2 a 3 opções) + 13 animações do zero (keyframe e animação; refazer as que errarem) + van | cerca de 35 a 50 |
| 6 e 7: só código | 0 |
| 8: ilustrações dos dois finais (2 a 4 opções cada) + animação do loop (refazer se o rosto deformar) | cerca de 8 a 14 |
