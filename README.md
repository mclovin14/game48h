# Saves Her

**Versão 0.1** (14/10/2026)

Metroidvania de ação em vista lateral, em pixel art, que roda no navegador. Kael, um policial sozinho com uma pistola, atravessa as barricadas da própria polícia para resgatar a noiva, Adriana. A cada tiro ele escolhe entre matar ou só derrubar, e essa escolha enche a barra de índole e decide o final.

## O que tem na versão 0.1

A quadra 1 jogável do começo ao fim:

- **Abertura em cutscene:** os mercenários levam a Adriana.
- **A rua da quadra 1:** vai do entardecer à noite, com chuva aleatória à noite.
- **Barricadas:** policiais entram em ondas, atiram em sequência, desviam das balas do Kael e tentam adivinhar se ele vai pular ou agachar.
- **O Kael:**
  - anda, corre, pula, agacha e recarrega, de pé ou ajoelhado;
  - atira com bala letal ou não letal;
  - luta sem arma com um combo de jab, direto e chute.
- **Munição:** cai dos policiais nocauteados.
- **Luta final:** três mercenários de fuzil guardam a Adriana.
- **Dois finais**, conforme a barra de índole.
- **Interface:** HUD, menu principal, pausa, opções (volumes, tela cheia e língua em português ou inglês), lista de controles e tela de game over.

O que ficou para depois (quadras 2 a 5, o Roberto como chefe e os itens em aberto) está em [docs/later_ideas.md](docs/later_ideas.md).

## Como rodar

Precisa do Node.js.

```bash
npm install          # uma vez
npm run dev          # http://localhost:5173
npm run typecheck    # confere os tipos
npm run build        # confere os tipos e gera dist/
npm run preview      # serve o dist/ para conferir
```

**Publicar na web:** rode `npm run build` e suba o **conteúdo** da pasta `dist/` (o `index.html` na raiz) para qualquer hospedagem estática: itch.io (zip do conteúdo, tipo HTML), GitHub Pages, Netlify ou outra. Os caminhos são relativos, então funciona também numa subpasta. O `dist/` não vai para o git.

## Controles

| Tecla | Ação |
|---|---|
| A / D ou ← / → | Andar |
| Shift (segure) | Correr |
| Espaço, W ou ↑ | Pular (por cima das balas) |
| S, ↓ ou Ctrl (segure) | Agachar (as balas altas passam) |
| 1 | Sacar ou guardar a arma |
| Botão direito | Sem arma: combo. Com arma (segure): mirar |
| Botão esquerdo | Atirar |
| R | Recarregar |
| Q ou roda do mouse | Bala letal ou não letal |
| Esc | Pausa e opções |
| Enter | Depois do game over, tenta de novo |

A lista completa, com as teclas de teste, fica no jogo, em **Opções → Controles**.

## Tecnologia

- React, Phaser 4 e Vite, em TypeScript.
- Sprites feitos no PixelLab e acabados com os scripts Python em `tools/`.

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Regras de trabalho, estrutura de pastas e padrão de sprites |
| [docs/decisions.md](docs/decisions.md) | Fonte da verdade das decisões |
| [docs/GDD.md](docs/GDD.md) | Visão consolidada do jogo |
| [docs/story.md](docs/story.md) | História |
| [docs/handoff.md](docs/handoff.md) | Estado atual, pendências e arquitetura do código |
| [docs/tests.md](docs/tests.md) | O que foi testado em cada plano |
| [docs/plan/](docs/plan/) | Planos de implementação |
| [docs/later_ideas.md](docs/later_ideas.md) | O que ficou fora da versão 0.1 |
