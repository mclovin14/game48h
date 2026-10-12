# Plano: estrutura do jogo com React + Phaser + Vite (TypeScript)

Status: **implementado** (11/10/2026). Mudanças durante a implementação: Phaser 4 (a versão estável atual); o Kael começa sem arma e a tecla 1 saca ou guarda; o mouse só mira e atira com a arma na mão.
Decisões de base em `docs/decisions.md`, seção "Tecnologia": React para menus, HUD e diálogos; Phaser para o jogo; Vite para o build; TypeScript; resolução de referência 960x540.

Critério: a opção mais simples que funcione. Um único projeto Vite na raiz, com o Phaser rodando dentro de um componente React.

---

## 1. Pacotes

| Pacote | Para quê | Tipo |
|---|---|---|
| `react`, `react-dom` | Menus, HUD e diálogos | dependência |
| `phaser` | O jogo: cenas, física Arcade e animações | dependência |
| `vite` | Servidor de desenvolvimento e build | dev |
| `@vitejs/plugin-react` | Faz o Vite entender JSX/TSX | dev |
| `typescript` | Checagem de tipos antes de rodar | dev |
| `@types/react`, `@types/react-dom` | Tipos do React (o Phaser já traz os dele) | dev |

São 8 pacotes. As versões estáveis em 11/10/2026 são Phaser 4.2, React 19.3, Vite 8.3 e TypeScript 7.0. Elas ficam travadas no `package-lock.json`.

Os pacotes abaixo ficam de fora de propósito, porque uma tela com o jogo e o HUD por cima não precisa deles:
- ESLint
- Redux
- Router
- o template pronto do Phaser

O `package.json` é escrito à mão em vez de vir do `npm create vite`. Assim evitamos apagar o exemplo e as configurações que o template traz.

Ambiente da máquina: Node 26 e npm 11, já instalados.

---

## 2. Pastas

Entra só o que tem ★. As pastas que já existem não mudam.

```
game48h/
  CLAUDE.md, docs/, references/, tools/     (já existem)
  assets/                                   (já existe; o Vite serve direto daqui)
★ package.json
★ tsconfig.json         modo estrito, sem emitir arquivos (o Vite compila)
★ vite.config.ts        plugin React + publicDir: 'assets'
★ index.html
★ .gitignore            node_modules/ e dist/
★ src/
    main.tsx            liga o React
    App.tsx             tela: jogo embaixo, HUD e menus por cima
    ui/
      Hud.tsx           vida, índole, munição letal e não letal
      Menu.tsx          título e pausa
      Dialog.tsx        caixa de texto (mensagem da quadra)
    game/
      PhaserGame.tsx    componente que cria e destrói o Phaser
      config.ts         960x540, pixelArt: true, Scale.FIT, física Arcade
      events.ts         ponte React ↔ Phaser, com os eventos tipados
      anims/humanoid.ts registra as animações 128x128 para qualquer textura
      scenes/
        Boot.ts         carrega as spritesheets
        Test.ts         cena de teste
```

### Como React e Phaser conversam

O `events.ts` é um canal de eventos com um tipo que lista todos os eventos e os dados de cada um. Se alguém emitir um evento com o nome ou os dados errados, o TypeScript acusa antes de rodar.

- Do Phaser para o React: `hud:ammo`, `hud:life`, `hud:morale`, `dialog:open`.
- Do React para o Phaser: `game:pause`, `game:resume`.

Um lado não importa o outro. Dá para mudar o HUD sem mexer no jogo.

### Sprites

- O Vite serve `assets/` como está. O Phaser carrega, por exemplo, `player/player_walk_gun_east_sheet.png` como spritesheet de quadros 128x128, sem copiar nenhum arquivo.
- O `humanoid.ts` cria as animações (idle, walk, aim, shoot, death etc.) a partir de uma chave de textura. Ele serve tanto para o Kael quanto para as variantes do policial (plano `police_variants.md`, fase 5).
- Espelhar para West: `flipX`.

**Efeito colateral:** o build também leva os `drafts/`. Por enquanto não importa. Antes de publicar, separamos o que vai junto.

---

## 3. Primeira cena de teste

- Chão simples.
- Kael controlado pelo teclado:
  - ← e → para andar;
  - uma tecla para mirar;
  - outra para atirar.
- Um policial master parado, que morre com o tiro (`death_east`).
- O HUD mostra a munição baixando.

As teclas exatas são provisórias. Pulo e dash ficam de fora, porque os controles ainda estão em aberto (`decisions.md`, item 20).

---

## 4. Como rodar

```bash
npm install          # uma vez, baixa os pacotes
npm run dev          # abre em http://localhost:5173 e recarrega ao salvar
npm run typecheck    # só confere os tipos (tsc --noEmit)
npm run build        # confere os tipos e gera a versão final em dist/
npm run preview      # testa a versão final localmente
```

O `build` roda o `typecheck` antes. Se houver erro de tipo, o build para.

O `dev` não para por erro de tipo, para não atrapalhar enquanto se edita. Para ver os erros, rode `npm run typecheck` ou olhe o editor.

---

## 5. Etapas de implementação

1. Criar `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html` e `.gitignore`, e rodar `npm install`.
2. Criar o `src/` com a tela React vazia e o Phaser montado nela (fundo e chão). Conferir com `npm run typecheck` e `npm run dev`.
3. Criar o `humanoid.ts` e a cena de teste com o Kael.
4. Criar o `events.ts` e o HUD mostrando a munição.
5. Adicionar o policial master e a morte por tiro.
6. Atualizar o `CLAUDE.md` (estrutura e como rodar) e o `handoff.md` (estado atual).

Pare e mostre ao usuário depois da etapa 2. Depois, pare de novo ao fim da etapa 5.
