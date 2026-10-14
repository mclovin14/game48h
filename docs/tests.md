# Testes

Registro dos cenários testados em cada plano de `docs/plan/`, com o resultado. Os planos estão em ordem de implementação.

**Como se testa:**
- **IA:** `npm run typecheck` ao fim de cada fase. No navegador, Chrome headless com Puppeteer (`?seed=` fixa o sorteio), capturas de tela e leitura do estado pelo `window.__game` (só no modo dev). Arte conferida com render ampliado e medida: linha do chão, contagem de cores, diferença de pixels do rosto.
- **Usuário:** joga e aprova cada fase. Em 13/10/2026 jogou o jogo inteiro e aprovou o resultado ("gostei muito do resultado"). Por isso, as fases que tinham ficado "aguardando o teste do usuário" contam como aprovadas nessa jogada, a não ser que a linha diga outra coisa.

**Legenda:** **passou** · **falhou** (com a correção) · **não verificado** (com o motivo) · **pendente** (falta o teste do usuário). Quando a IA não conferiu um cenário, mas o usuário aprovou a fase jogando, a linha diz "passou no teste do usuário".

**Versão 0.1 (14/10/2026, tag `v0.1`):** fechada pelo usuário com os planos 1 a 10 do resumo. Os itens 9 e 10 entram na versão com a medição da IA e ficam abertos ao ajuste dos [TESTE] na próxima jogada.

Ao terminar uma fase, acrescente os cenários dela aqui. O status do plano fica no próprio `docs/plan/<nome>.md`.

## Resumo

| # | Plano | Fases | Situação |
|---|---|---|---|
| 1 | `web_stack_setup.md` | 5 etapas | passou, aprovado |
| 2 | `police_variants.md` | 0 a 5 | passou, aprovado |
| 3 | `world_camera_enemies.md` | 1 a 6 | passou, aprovado |
| 4 | `sound_run_reload_menu.md` | 1 a 6 | passou, aprovado |
| 5 | `jump_crouch_cutscene.md` | 1 a 8 | passou, aprovado |
| 6 | `melee_combo.md` | 1 a 3 | passou, aprovado |
| 7 | `playtest_fixes_1.md` | 1 a 9 | passou, aprovado ("gostei muito do resultado") |
| 8 | `playtest_fixes_2.md` | 1 a 3 | passou, aprovado (fases 2 e 3 testadas juntas pelo usuário, nada pendente) |
| 9 | `enemy_ai_difficulty.md` | 1 a 3 (policiais) | passou na medição da IA; aguardando o teste do usuário |
| 10 | (sem plano) tela de game over | 1 | passou no navegador; aguardando o teste do usuário |

**Itens que seguem em aberto mesmo com os planos aprovados** (não são falha de teste, são escolhas ou números para afinar):
- Números [TESTE] de vida, dano, munição, ondas, chuva, sangue e sombra (`decisions.md`, seção 3).
- Sons de terceiros escolhidos pela IA (chuva, fuzil, combo) e o logo do título: entraram na aprovação geral da jogada, sem uma aprovação item a item.
- A mão do mercenário fica ~9 px acima do pulso da Adriana na abertura (`HOLD_DX` [TESTE]).

---

## 1. `web_stack_setup.md`: projeto React + Phaser + Vite (11/10/2026)

| # | Cenário | Resultado |
|---|---|---|
| 1.1 | `npm install`, `npm run typecheck` e `npm run dev` sobem o projeto | passou |
| 1.2 | Tela React com o Phaser montado dentro (fundo e chão) | passou |
| 1.3 | Kael na cena de teste: parado, andando, mirando, atirando e morrendo (`humanoid.ts`) | passou |
| 1.4 | HUD mostrando a munição pelo `bus` de `events.ts` | passou |
| 1.5 | Policial master leva tiro e morre | passou |
| — | Usuário | aprovado (o Kael começa sem arma e a tecla 1 saca, mudança pedida durante a implementação) |

## 2. `police_variants.md`: policial master e três variantes (11 e 12/10/2026)

| # | Cenário | Resultado |
|---|---|---|
| 2.1 | Fases 0 a 2: master com 7 animações a partir das do Kael (`transfer_outfit`), paleta de 24 cores, chão em 121/120 | passou |
| 2.2 | Fase 3: cabeças A (negro), B (branco e loiro), C (asiático) | passou, aprovada pelo usuário |
| 2.3 | Fase 4: variantes montadas sem PixelLab; o script mede chão, cores, deslocamento da cabeça, pele do master sobrando e furos (tudo 0) | passou depois de quatro revisões do usuário: pele chapada e mão clara (troca por proporção de uso); quepe da B loiro e testa da C (quepe copiado do master); rosto do master no aim de 0 a 3 (cabeça colada também ali, com olho azul na B); cabelo mudando de cor no death (`hair_shadow`) |
| 2.4 | Fase 5: classe `Police` sorteia a variante no spawn; o master não é mais carregado | passou, aprovado |

## 3. `world_camera_enemies.md`: cenário, câmera e inimigos (11 e 12/10/2026)

| # | Cenário | Resultado |
|---|---|---|
| 3.1 | Fase 1: mundo largo e câmera com zona morta, olhar à frente e limites (tecla C mostra a zona) | passou, aprovada; o usuário pediu andar mais rápido (90 → 120 px/s) |
| 3.2 | Fase 2: fachadas das lojas, silhueta da cidade, céu e ciclo do entardecer à noite, com lojas e postes acendendo | passou, aprovada; corrigidos paredes de tijolo transparentes, prédios afundando, silhueta flutuando e calçadas que não emendavam |
| 3.3 | Fase 3: chão, lixeira, hidrante, carro e barricada com giroflex | passou, aprovada; corrigidos faixa preta na tela, objetos flutuando, carro pequeno e com para-choque cortado, portas grandes e toldos cortados (fachadas refeitas na escala da porta da padaria) |
| 3.4 | Fase 4: as três variantes no jogo | passou, aprovada |
| 3.5 | Fase 5: ondas nas barricadas, câmera travando, nove aparências sem repetir na tela nem em seguida, `?seed=` repetindo a sequência, F1 | passou (no 1º teste apareceram três de azul-petróleo juntos; o sorteio passou a evitar repetir cabeça e tom de quem está na tela) |
| 3.6 | Fase 6: policial mira, avisa e atira; Kael pisca, perde vida e morre; nocaute solta caixa de munição | passou (teste automático com seed `kael1`: Kael parado caiu em ~36 s; 5 nocautes soltaram 5 caixas, todas pegas) |
| 3.7 | Tons de farda (azul-marinho, cinza-azulado, azul-petróleo) | entraram na aprovação geral da jogada |

## 4. `sound_run_reload_menu.md`: sons, tiro, corrida, recarga e menu (12/10/2026)

| # | Cenário | Resultado |
|---|---|---|
| 4.1 | Fase 1: tiros, OST com fade, passos nos quadros 0 e 4, som dos policiais pela distância e pelo lado | passou, aprovada ("ficou muito bom"); a música baixou de 0,45 para 0,15 a pedido do usuário |
| 4.2 | Fase 2: tiro contínuo, pente de 8, recarga com R e automática, troca de tipo, clique seco, Enter reinicia depois da morte | passou, aprovada (teste automático sem erros) |
| 4.3 | Fase 3: corrida do Kael com e sem arma, `run_gun_stop` ao parar | passou, aprovada; dois keyframes recusados antes (rosto perdido; corrida dura com as duas mãos) e a cabeça colada da base saiu (recorte no pescoço) |
| 4.4 | Fase 4: recarga do Kael (`reload_gun`) | passou (o pente sumia da mão nos quadros a_4 e a_5; trocados por intermediários) |
| 4.5 | Fase 5: policiais entram correndo e recarregam depois de 8 tiros | passou |
| 4.6 | Fase 6: menu "Saves Her", opções (volumes, tela cheia, língua), pausa no mesmo visual, escolhas guardadas | passou (Chrome 1280x720: opções, inglês, recarga da página mantendo as escolhas, pausa, Esc Esc, voltar ao título) |

## 5. `jump_crouch_cutscene.md`: pulo, agachar, Adriana, mercenários, cutscenes e finais (12 e 13/10/2026)

| # | Cenário | Resultado |
|---|---|---|
| 5.1 | Fase 1: pulo do Kael para a frente; tiro do policial vira bala que voa e acerta pela caixa do corpo | passou |
| 5.2 | Fase 2: agachar (S, ↓ ou Ctrl), mira e tiro ajoelhados, bala do Kael visível | passou, aprovada; a primeira pose foi refeita ajoelhada a pedido do usuário |
| 5.3 | Fase 3: policiais pulam, agacham, copiam a postura do Kael e atiram baixo | passou, aprovada |
| 5.4 | Fase 4: Adriana (base com olhos verdes, `held`, `cry`, `freed`, `kneel`, `hug`) e retratos | passou, aprovada (nariz refeito) |
| 5.5 | Fase 5: três mercenários de fuzil em três tons, van, fase com 4800 px | passou |
| 5.6 | Fase 6: cutscene de abertura (texto letra por letra, câmera até a Adriana, falas com retrato, Esc pula) | passou, aprovada |
| 5.7 | Fase 7: luta com os três mercenários e os dois finais pela índole | passou |
| 5.8 | Fase 8: ilustrações animadas dos finais (beijo; Kael no colo na chuva) | passou |

## 6. `melee_combo.md`: combo sem arma e loot do morto (13/10/2026)

| # | Cenário | Resultado |
|---|---|---|
| 6.1 | Fase 1: policial morto com bala letal solta munição em 50% das vezes | passou |
| 6.2 | Fase 2: animações `punch_1`, `punch_2`, `kick` | passou, aprovadas ("10/10") |
| 6.3 | Fase 3: combo no botão direito sem arma, estrelinha de impacto, sons de golpe; nos mercenários o chute tira 3 de 5 | passou (testado no navegador) |

## 7. `playtest_fixes_1.md`: correções da primeira jogada (13/10/2026)

| # | Cenário | Resultado |
|---|---|---|
| 7.1 | Fase 1: texto novo da abertura | passou, aprovada |
| 7.2 | Fase 2: recarga ajoelhada com animação própria | passou |
| 7.3 | Fase 3: corpos deitam no chão com a arma solta na frente (mercenário e policial, nas 3 variantes) | passou, aprovada |
| 7.4 | Fase 4: sangue (respingo na direção da bala, gotas, manchas que somem, mais rápido na chuva) | passou |
| 7.5 | Fase 5: ciclo de 3 min (era 8) | passou |
| 7.6 | Fase 6: recarga de 1,21 s com o som rápido | passou |
| 7.7 | Fase 7: chuva aleatória à noite (50% por jogada, tecla N) | passou; o volume alto nos finais foi corrigido no plano 8 |
| 7.8 | Fase 8: HUD de vida e índole com rosto e balança | passou, aprovada |
| 7.9 | Fase 9: seletor de arma e pentes coloridos | passou, aprovada |

## 8. `playtest_fixes_2.md`: controles nas Opções, chuva e sombras (13/10/2026)

`npm run typecheck` passou ao fim de cada fase. Nenhum erro de página (`pageerror`) apareceu nas rodadas finais.

### Fase 1: controles nas Opções e dica curta

| # | Cenário | Resultado |
|---|---|---|
| 1.1 | Começar a fase não abre mais a caixa de controles | passou |
| 1.2 | A dica "Controles: Esc → Opções → Controles" aparece no alto da tela, sem pausar o jogo, e some sozinha em ~4 s | passou |
| 1.3 | A dica aparece uma vez por sessão (`controlsShown`) | passou |
| 1.4 | Título → Opções → Controles abre a lista de teclas | passou |
| 1.5 | Pausa (Esc) → Opções → Controles abre a mesma lista | passou |
| 1.6 | Esc, Enter ou "Voltar" na lista volta às Opções, com "Controles" ainda selecionado | passou |
| 1.7 | Lista em 1280x720: dois blocos de grupos, teclas alinhadas entre os grupos, nada quebra de linha | passou (falhou na 1ª versão, que quebrava linha; corrigido com uma grade por coluna) |
| 1.8 | Lista em 960x540: cabe sem rolar e sem quebrar | passou (falhou na 1ª versão, que transbordava; corrigido com uma media query e `nowrap`) |
| 1.9 | Grupo **Teste** (F1, K, C, [ ], N) aparece na lista | passou |
| 1.10 | Logo, título de fora e dica do menu somem com a lista aberta | passou |
| 1.11 | Abrir a lista com clique do mouse | passou no teste do usuário (a IA testou só pelo teclado) |
| 1.12 | Textos em inglês (`en.ts`) | não verificado na tela (as chaves existem nas duas línguas e o typecheck confere; o usuário jogou em português) |
| — | Teste do usuário | **aprovado** |

### Fase 2: volume da chuva

Medido o ganho aplicado ao loop `rain_loop` no navegador, com a chuva forçada pela tecla N.

| # | Cenário | Resultado |
|---|---|---|
| 2.1 | Chuva cheia durante o jogo: volume 0,15 (era 0,5) | passou (0,15) |
| 2.2 | Começo de cada final: a chuva baixa para 40% em 1,5 s | passou (0,06 = 0,15 × 0,4) |
| 2.3 | Ilustração do final triste: chuva some e música em zero | passou (chuva 0, música 0) |
| 2.4 | Ilustração do final feliz: chuva some e música baixa | passou (chuva 0, música 0,09) |
| 2.5 | Voltar ao título não deixa a chuva tocando no menu | passou (o jogo é destruído ao voltar; o erro "sounds null" no fim do script veio do próprio script, que tentou ler o som do jogo já destruído) |
| 2.6 | A chuva segue o volume de **efeitos** das Opções | passou no teste do usuário (usa o mesmo `setLoopVolume` dos outros loops) |
| 2.7 | Pular o final com Esc enquanto a chuva está em 40% | passou no teste do usuário |
| 2.8 | Percepção do volume (alto ou baixo demais) | passou: o usuário achou o volume certo, no jogo e nos finais |
| — | Teste do usuário | **aprovado** (13/10/2026, junto com a fase 3) |

### Fase 3: sombras nos pés

Conferido com capturas ampliadas 3x (`node shadow.mjs` no scratchpad).

| # | Cenário | Resultado |
|---|---|---|
| 3.1 | Kael parado: sombra oval de pixel duro, sem borrão, embaixo dos pés | passou |
| 3.2 | Sombra atrás dos pés, nunca na frente | passou |
| 3.3 | Contraste parecido com a sombra desenhada da lixeira | falhou com alfa 0,35 e 5 px (fraca e fina); passou depois do ajuste para alfa 0,45 e 6 px |
| 3.4 | Kael andando: a sombra acompanha sem pular | passou |
| 3.5 | Kael pulando: a sombra fica no chão, menor e mais clara | passou (falhou na 1ª captura porque o script soltava o Espaço rápido demais e o pulo não acontecia; o script agora segura a tecla) |
| 3.6 | Kael agachado: a sombra cobre do joelho ao pé | passou |
| 3.7 | Policiais na barricada (com arma): sombra nos pés | passou |
| 3.8 | Kael deitado no final triste: sombra do tamanho do corpo | passou |
| 3.9 | Mercenários e Adriana | passou no teste do usuário (as capturas da IA não chegaram até eles) |
| 3.10 | Policial ou mercenário nocauteado e morto, deitado | passou no teste do usuário |
| 3.11 | Sombra some junto com o personagem que sai de cena | passou no teste do usuário |
| 3.12 | Sombra à noite e com chuva | passou no teste do usuário |
| — | Teste do usuário | **aprovado** (13/10/2026: "a sombra não tem nada pendente") |

---

## 9. `enemy_ai_difficulty.md`: IA mais difícil (13/10/2026)

`npm run typecheck` passou. Medição no navegador (Puppeteer, `?seed=abc123`, Kael parado na primeira barricada sem atirar, vida travada), sem erro de página.

### Fase 1 (policiais): tiro contínuo

| # | Cenário | Resultado |
|---|---|---|
| 1.1 | Depois do aviso de mira, o policial dá 2 a 3 tiros seguidos, ~300 ms entre eles | passou (medido: 300 a 317 ms) |
| 1.2 | Entre as sequências ele segura a arma apontada e volta a atirar em ~1,5 s (antes: um tiro a cada ~3,4 s) | passou (medido: 1366 a 1683 ms; print com os dois policiais mirando) |
| 1.3 | Com o pente de 8 vazio, abaixa a arma e recarrega agachado | não verificado (o código abaixa no fim do pente) |
| 1.4 | Kael agacha: o policial abaixa a arma e agacha junto para atirar baixo | não verificado |
| 1.5 | Dificuldade na jogada ("não está mais fácil demais") | aguardando o teste do usuário |

### Fases 2 e 3 (policiais): IA esperta

Medição com Puppeteer: o Kael atira 10 vezes na primeira barricada, em pé e agachado; e um teste controlado com chance de desvio em 100% e uma bala real disparada de distâncias fixas.

| # | Cenário | Resultado |
|---|---|---|
| 2.1 | Bala alta (Kael em pé) a 150 a 350 px: o policial em pé agacha e ela passa por cima | passou (a 150 px às vezes não dá tempo e acerta, como planejado) |
| 2.2 | Bala baixa (Kael agachado) a 350 e 500 px: pula no lugar e ela passa por baixo | passou (print com a bala passando sob o policial no ar, virado para o Kael) |
| 2.3 | Bala baixa a 150 e 250 px: perto demais, acerta | passou |
| 2.4 | Jogada com o Kael em pé atirando: 3 acertos em 10 tiros (os policiais agacham por palpite ou por desvio) | passou |
| 2.5 | Jogada com o Kael agachado atirando: 8 acertos em 10 (de perto o tiro baixo pega) | passou |
| 2.6 | Sequências de 1 a 4 tiros, ~1,2 a 1,4 s entre elas, sem erro de página | passou |
| 3.1 | Kael recarregando: tiro logo; Kael sem arma perto: tiro sem aviso; atirando baixo, espera o Kael pousar | não verificado (só no código) |
| 3.2 | Dificuldade e "não está previsível" na jogada | aguardando o teste do usuário |

## 10. Tela de game over (14/10/2026)

Pedido direto do usuário, sem plano. Medição com Puppeteer (tecla K mata o Kael).

| # | Cenário | Resultado |
|---|---|---|
| 10.1 | O Kael cai e, ~0,9 s depois, a tela começa a escurecer; "GAME OVER" (vermelho), "Você perdeu" e a frase triste entram em sequência | passou (print com a tela meio escura e depois toda) |
| 10.2 | Enter apertado antes do aviso não reinicia | passou |
| 10.3 | ~3,6 s depois, "Pressione Enter para tentar de novo" pisca; Enter reinicia a cena uma vez só, a vida volta a 100 e a tela some | passou |
| 10.4 | Enter de novo depois de reiniciar não reinicia outra vez | passou |
| 10.5 | Com a pausa aberta sobre o game over, o Enter fica com o menu | não verificado (só no código) |
| 10.6 | Visual e frases agradam | aguardando o teste do usuário |
