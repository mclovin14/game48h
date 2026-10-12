# Plano: três policiais inimigos a partir das animações do Kael

Status em 12/10/2026:
- Fases 0, 1 e 2: **feitas**. As 7 animações do master estão em `assets/enemies/police/master/`. O script é `tools/build_police_master.py`.
- Fase 3: **feita e aprovada pelo usuário** (11/10/2026): A negro, B branco e loiro, C asiático.
- Fase 4: **feita e aprovada pelo usuário** (12/10/2026): `police_a`, `police_b` e `police_c`. Lado a lado em `drafts/variants_side_by_side.png`.
- Fase 5: **feita** (12/10/2026), aguardando o teste do usuário. `POLICE` em `humanoid.ts` (uma `CharacterDef` por variante, com as animações do master) e a classe `Police` em `src/game/actors/Police.ts` (variante sorteada no spawn). O `Boot` carrega as três; a cena de teste usa a `Police` no lugar do master, e **V** troca a variante. A troca de paleta em tempo real continua para depois.

Diferenças em relação ao texto abaixo:
- Fase 4: o rosto do master muda a cada quadro (a IA redesenhou cada um), então a cabeça é achada pelo contorno do quepe e da testa (encaixe mínimo de 0,70), e não por cor exata com `locate()`. Não há caminho suavizado: a cabeça segue o corpo do quadro.
- Fase 4: a cabeça colada vai do quepe ao queixo, começando depois da pistola e da mão. No aim de 0 a 3, a mão e a pistola passam na frente do rosto e a cabeça gira, então ali só a cor é trocada. No death, só os quadros 0 a 3; no knockout, só o 0.
- Fase 4: o shoot é refeito a partir do último quadro do aim da variante (`shoot_fx.py` com as rampas da variante), para a luz do tiro acender a pele certa.
- Fase 4 (11/10/2026, revisão do usuário: pele sem padrão, mão clara e chapada, nuca crescendo no aim): a pele não é mais trocada 1:1. Cada tom do master vai para o tom da variante que ocupa a mesma fatia no rosto colado (proporção de uso), e a pele com farda logo abaixo desce um tom (sombra nas mãos). Rosto sem colagem (aim de 0 a 3), a pedido do usuário (12/10/2026): mesmas cores do rosto do último quadro do aim. Os pixels do rosto, do mais claro ao mais escuro no master, recebem os tons da variante na mesma proporção do rosto colado. Quadros caídos (death de 4 em diante, knockout de 1 em diante): a pele toda no tom médio do último quadro em pé. O cabelo do master que passa atrás da cabeça nova (mais curta na nuca) é apagado e o contorno refeito. O master usa a cor do cabelo também nos sapatos e no coldre: o cabelo só é trocado na zona da cabeça (faixa achada pelo quepe; caído, a maior mancha de pele), e fora dela o marrom do master fica. Nos quadros sem colagem, o cabelo que o master desenha com a rampa escura vira os tons escuros do cabelo da variante (importa na `police_b`, loira). Meta: tom médio da pele entre ~1,6 e ~2,1 (0 = mais claro, 3 = mais escuro) em todos os quadros.
- Fase 4 (12/10/2026, revisão do usuário: quepe da B pintado de loiro e testa da C aparecendo): a IA não desenhou a aba do quepe nas cabeças da B e da C (e, na C, metade da copa), e pôs cabelo e testa no lugar. O `build_head` agora copia o quepe da base do master (copa e faixa nas linhas 13 a 21; aba preta nas linhas 22 a 24, de x=59 para a frente) por cima das três cabeças, e tira da cabeça os pixels soltos (a ponta do distintivo que sobrava na B). Na A só muda a aba, que fica igual à do master.
- Fase 4 (12/10/2026, revisão do usuário: aim de 0 a 3 com o rosto do master; olho azul na B): o aim de 0 a 3 agora também recebe a cabeça colada. Depois da colagem, voltam por cima as mãos e a pistola do quadro (manchas de pele separadas do rosto, abaixo da aba, com o contorno e o metal encostados) e os dedos que o queixo da variante deixou descobertos. A íris da B troca o azul-marinho por (72,128,208), campo `eye` do `variants.json`, inclusive no rosto do master dos quadros caídos.
- Fase 4 (12/10/2026, revisão do usuário: cabelo da B e da C mudando de cor no death): no master caído o cabelo usa cinco tons, inclusive dois da pele (139,68,29 e 102,60,33) e o cinza mais escuro, e às vezes a aba usa o castanho do cabelo. O `hair_shadow` agora pega a maior mancha contínua desses tons na zona da cabeça (o contorno separa a aba) e põe tons fixos da variante: brilho (o tom vizinho mais claro), principal e sombra. O castanho que sobra fora da mancha vira sombra da aba. Roda depois da pele dos quadros caídos.
- O tiro procedural ficou em `tools/shoot_fx.py`, e não dentro do `sprite_lib.py`.
- No Phaser, o espelhamento usa `scaleX` = -1 com a origem no centro do corpo, e não `flipX`.
- Fase 5: o master não é mais carregado no jogo (fica só como base da arte). A `Police` estende o `Humanoid`, então não há uma segunda definição de animações.

## Contexto

O jogo precisa de três policiais inimigos (um negro, um branco e um asiático), com as mesmas animações que o Kael já tem. Fazer tudo do zero, três vezes, no PixelLab sairia caro e daria rostos inconsistentes.

**Decidido com o usuário em 11/10/2026:**
- Os policiais usam uma **farda nova**, para a silhueta ser diferente da do Kael.
- Os três mudam **só na aparência**. O comportamento por tipo fica para teste.

**Ideia central.** Os três compartilham o corpo e só a cabeça muda. Fazemos **um policial master** uma única vez, e cada variante é esse master com outra cabeça e outras cores de pele e cabelo, aplicadas por script. O PixelLab trabalha uma vez no corpo e três vezes só na cabeça.

**Por que não dá para só trocar a paleta do Kael.** Na paleta dele, uma mesma cor serve para coisas diferentes:
- `(35,23,18)` é o cabelo e também a sombra da jaqueta, das linhas 16 a 119;
- `(133,67,19)` é a sombra da pele e também o brilho do cabelo;
- os brancos e cinzas servem para a camiseta, o tênis e a arma.

Por isso o master precisa de uma **paleta "swap-safe"**, em que pele e cabelo têm cores exclusivas que não aparecem em mais nada.

## Estrutura de pastas (em inglês)

```
assets/enemies/police/
  palette_master.json        rampas por material (skin, hair, uniform, ...)
  variants.json              police_a / police_b / police_c: cabeça + rampas de pele e cabelo
  master/<anim>_east/...     corpo master (rosto provisório)
  heads/police_<id>_head.png
  police_<id>/<anim>_east/<anim>_east_00.png ...
  police_<id>_<anim>_east_sheet.png / .gif
tools/
  sprite_lib.py              paleta, aterrar, locate/swap de cabeça, preencher buracos, conferências
  build_police_variants.py   master + variants.json → sheets das três variantes
```

Os ids `police_a`, `police_b` e `police_c` são neutros. O mapa de cada um para a etnia fica no `variants.json`.

**Os scripts atuais estão no scratchpad em /private/tmp e podem sumir.** Por isso a fase 0 leva para o `tools/` o que vale reaproveitar:
- de `aim/build_anim.py`: `locate()`, `swap()`, o caminho suavizado das cabeças e `shoes()`;
- de `shoot/build_shoot.py`: todo o tiro procedural;
- de `death/blood.py` e `death/assemble.py`: o sangue e o remap para a paleta.

## Animações do policial

| Animação | Como sai | Custo PixelLab |
|---|---|---|
| `idle_gun_east` (8) | transfer_outfit sobre os quadros do Kael | 3 chamadas |
| `walk_gun_east` (8) | transfer_outfit | 3 |
| `aim_gun_east` (8) | transfer_outfit | 3 |
| `shoot_gun_east` (8) | **procedural**: `build_shoot` rodando sobre o último quadro do aim do policial | 0 |
| `death_east` (30) | transfer_outfit, e o sangue é reaplicado pela máscara do Kael (a pose é a mesma) | 10 |
| `knockout_east` (nova, para a bala não letal) | keyframe + animate_image a partir do idle, sem sangue, caído e imóvel | cerca de 3 |
| `hurt_east` (nova, quando leva um tiro e não cai) | keyframe + animate_image | cerca de 2 |

Ficam de fora idle e walk sem arma, porque o policial está sempre armado.

O transfer_outfit em 128px aceita **3 quadros por chamada**. Uso sempre a mesma referência e o mesmo seed em todas as chamadas.

## Fases

**Fase 0, ferramentas.**
- Criar `tools/sprite_lib.py` com as funções acima. Elas recebem parâmetros, nada de caminhos fixos.
- Registrar no `decisions.md` as decisões de hoje: três policiais, diferença só visual, farda nova.

**Fase 1, keyframe do master. Para e mostra ao usuário.**
1. `edit_image_pro_flash` sobre `player_base_gun_east.png`: mesma pose, farda azul-marinho, quepe, cinto preto, distintivo e sapato preto.
2. Remapear para a paleta swap-safe, com rampas exclusivas para:
   - pele (3 tons);
   - cabelo (2);
   - camisa (3);
   - calça (3);
   - quepe e cinto;
   - distintivo (2);
   - metal da arma.
3. Salvar `palette_master.json`.
4. **Aprovação do usuário antes de gastar créditos nas animações.**

**Fase 2, animações do master.**
1. Rodar o transfer_outfit com o keyframe como referência.
2. Em cada quadro:
   - snap para a paleta master;
   - aterrar em y=121;
   - preencher buracos e tirar pixels soltos.
3. Gerar o shoot procedural, a morte com sangue, o knockout e o hurt.
4. Montar uma folha de comparação, Kael e policial lado a lado, para conferir o movimento.

**Fase 3, as três cabeças. Para e mostra ao usuário.**
1. Três `edit_image_pro_flash` sobre o keyframe master, um para cada: homem negro, homem branco, homem asiático. Mesmo quepe, mesma pose, olhando para a frente e nunca para a câmera.
2. Recortar só a cabeça.
3. Definir as rampas de pele e cabelo de cada um em `variants.json`.
4. **Aprovação do usuário.**

**Fase 4, build das variantes.**

`tools/build_police_variants.py` faz, para cada variante e cada quadro:
1. Troca as rampas exclusivas de pele e cabelo, inclusive nas mãos e no pescoço.
2. Nos quadros com a cabeça em pé (idle, walk, aim, shoot e o início do death), cola a cabeça da variante. Usa `locate()` e um caminho suavizado de no máximo 1 px por quadro, igual ao que funcionou no aim.
3. Nos quadros com a cabeça inclinada ou no chão (fim do death e knockout), só recolore a pele e o cabelo do rosto gerado.
4. Exporta os quadros, a sheet e o GIF.

O resultado são 3 variantes × 7 animações, sem nenhuma chamada nova ao PixelLab. Uma quarta variante no futuro vai custar só uma cabeça.

**Fase 5, Phaser. Quando o projeto de código existir.**
- **`src/game/anims/humanoid.ts`:** uma definição única de animações (`key`, quadros, `frameRate`, `repeat`), usada pelo Kael e pelos policiais. A função `registerAnims(scene, textureKey)` cria as animações para qualquer sheet.
- **Classe `Police`:** recebe `variant` (`a`, `b` ou `c`) e escolhe a textura, com a variante sorteada no spawn. Usa `flipX` para olhar para West.
- **Troca de paleta em tempo real**, por canvas no boot, é **opcional e fica para depois**. Ela permitiria cores de farda por quadra (por exemplo, tropa de choque mais escura nas quadras finais) sem novos arquivos. O `palette_master.json` já deixa isso pronto.
- As cabeças ficam assadas nas sheets, e não como camada separada em tempo real. Isso evita tremor de pixel entre corpo e cabeça e simplifica o código.

## Conferência

Para cada animação de cada variante:
- **Mesmo número de quadros** que a do Kael, o que permite a definição única do Phaser.
- **Contagem de cores:** paleta master mais as cores de efeito (sangue e flash), e nada além disso.
- **Linha do chão** em y=121 em todos os quadros.
- **Rosto:** diferença de pixels do rosto contra a cabeça da variante igual a 0 nos quadros em pé.
- **Nenhum pixel de pele ou cabelo do master sobrando** nas variantes.
- **Render ampliado**, com as três variantes lado a lado, para caçar quebra de pixel.

Paradas para aprovação do usuário: depois do keyframe master, depois das cabeças e depois da primeira variante completa.
