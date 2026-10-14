# Ideias para depois (pós-versão 0.1)

O que ficou fora da versão 0.1 do Kael (Saves Her). A versão 0.1 é a quadra 1 jogável, do começo ao fim, como está registrada em `tests.md`.

Fontes: `decisions.md` (seção 2, EM ABERTO, e seção 3, AJUSTAR EM TESTE), `GDD.md` (seções 6.4, 7 e 9), `story.md` (seção 6) e `handoff.md` (limitações conhecidas). Nada aqui está decidido. Quando um item for decidido, ele vai para o `decisions.md`, com data e fonte, e sai desta lista.

Criado em 13/10/2026.

---

## 1. Quadras 2 a 5

O jogo completo tem cinco quadras até o prédio na Capital, cada uma com barricadas mais fortes que as da anterior (`decisions.md`, DECIDIDO). A versão 0.1 só tem a quadra 1. Falta decidir e fazer:

- **Tipo de bloqueio de cada quadra:** combate, infiltração, item ou contato, cada um com uma regra (EM ABERTO, item 11).
- **Chefes:** quantos existem e se o Geraldo tem confronto direto ou só aparece por diálogo (item 9).
- **Consequência de desistir** de uma barricada (item 18).
- **Curva de dificuldade** entre as quadras e quantidade de policiais por barricada (AJUSTAR EM TESTE).
- **Cenário** de cada quadra (`GDD.md`, 6.4).
- **Final no prédio da Capital:** a Adriana e figurões do alto escalão (DECIDIDO). A cena de resgate ainda está em aberto: ela aparece viva, diz algo sobre o sequestro ou sobre o Geraldo? (item 8).

## 2. Quadra 1 no jogo completo

Na versão 0.1, os chefes da quadra 1 são os três mercenários. No jogo completo, o chefe da quadra 1 é o **Roberto** (DECIDIDO). Falta:

- **Arte e luta do Roberto:** vida e dano na luta (AJUSTAR EM TESTE).
- **Roberto reconhecendo o Kael:** só com animação (ele para e aponta) ou com uma fala curta, que seria um segundo texto na quadra (`story.md`, item 2).
- **Roberto e a índole:** matar o Roberto conta como os outros policiais, pesa mais ou não conta? (item 15).
- **Ordem do fim da quadra 1:** a cutscene vem antes do Roberto ou depois da luta? (item 13).
- **Texto da cutscene do fim da quadra 1:** o que a imagem mostra e o que o texto diz (item 12).
- **Tutorial (parte 1):** o que ele ensina: atirar, pular, esconder, negociar, trocar de bala? (item 17).

## 3. Design em aberto

- **Progressão do Kael:** como ele ganha força (equipamento roubado, habilidades, favores, itens) e quais são as habilidades. É o que faz o jogo ser metroidvania e não um run and gun linear. É o item que mais trava o resto (item 10).
- **Quantas habilidades** o Kael ganha por quadra (AJUSTAR EM TESTE).
- **Efeitos da índole baixa durante o jogo:** polícia caça com mais força, aliados se afastam, lojas fecham, NPCs mudam de fala? (item 7).
- **Derrota do Kael no jogo completo:** recomeça a luta, a quadra ou outra coisa? Na versão 0.1, a tela de game over escurece com uma frase triste e Enter reinicia a cena (item 14).
- **Peso da barra de índole:** quantos policiais mortos mudam de faixa (AJUSTAR EM TESTE).
- **Controles que faltam:** gamepad e dash (item 20).
- **Tamanho das salas e distância entre plataformas** (AJUSTAR EM TESTE).

## 4. História em aberto

- **Nome da cidade** que o Geraldo quer controlar (item 1).
- **Organização terrorista:** qual é o papel dela? Contratou o Geraldo, usa os mercenários ou só aparece como pano de fundo? (item 2).
- **Quem sabe que o Geraldo é o mandante:** governador, exército, figurões presos, ninguém? (item 3).
- **Descoberta da corrupção:** cedo (busca por provas) ou tarde (virada)? (item 4).
- **Policiais das barricadas:** cúmplices conscientes ou só cumprem ordens? (item 5).
- **Aliado dentro da polícia:** existe alguém que ajuda o Kael sem saber da corrupção? Quem é e o que cobra? (item 19).
- **Governador:** sem nome e sem arte.
- **Geraldo:** sem arte.

## 5. Arte e animação

Propostas do `GDD.md` (6.4), ainda não aprovadas:

- Animação de **dano do Kael** (hoje ele só pisca em vermelho).
- **Andar mirando** (hoje o Kael para de andar enquanto mira).
- **Tiro não letal** com cor própria no projétil e no flash.
- **Menu de fim de jogo** (`GDD.md`, seção 5).
- **Comportamento próprio por tipo de policial** (atira mais rápido, tem mais vida). Hoje a diferença é só visual (`GDD.md`, 3.5).

## 6. Áudio

Do `GDD.md`, seção 7:

- Som de **pegar munição**.
- **Vozes.**
- Uma **faixa de música por quadra**.

## 7. Técnica e publicação

- **Publicação:** localhost, GitHub Pages ou outro (item 22).
- **Arte de apoio:** confirmar Gemini ou GPT (item 23).
- **"Stack Cloud":** ainda não identificada (item 24).
- **Antes de publicar** (`handoff.md`, limitações conhecidas):
  - o build copia `assets/` inteiro, inclusive os `drafts/`, então é preciso separar o que vai junto;
  - o pacote do Phaser passa de 500 kB (o build avisa; não atrapalha agora);
  - o `Scale.FIT` escala por um fator quebrado, e em algumas janelas o pixel pode ficar desigual. Dá para trocar por escala inteira se incomodar.

## 8. Números para afinar jogando

Todos os valores marcados [TESTE] no `decisions.md` (seção 3) continuam provisórios, mesmo aprovados na jogada: vida, dano e velocidade do Kael e dos inimigos, munição inicial e por caixa, chance de loot, ondas das barricadas, pulo, câmera, ciclo do dia, chuva, sangue e sombras.

Também segue provisória a posição da mão do mercenário sobre o pulso da Adriana na abertura (`HOLD_DX`, fica ~9 px acima).
