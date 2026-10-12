# Kael: história

Status: rascunho v0.1 (sessão de 11/10/2026)
Fonte das decisões: `decisions.md`. Se este arquivo e o `decisions.md` divergirem, vale o `decisions.md`.

---

## 1. Proposta curta

**Quem é o Kael**
Um policial do estado de Florentins. Começa só com uma pistola e o distintivo, e o distintivo não lhe dá nenhuma vantagem.

**Onde ele está**
Em Florentins, numa cidade que o delegado Geraldo quer controlar (nome ainda não definido). Entre o Kael e o prédio na Capital há cinco quadras, e cada uma é fechada por uma barricada policial mais forte que a anterior.

**O que ele precisa conseguir**
Atravessar as cinco quadras e chegar ao prédio na Capital para resgatar a Adriana, sua noiva e filha do governador. E fazer isso sem perder a índole: pode neutralizar sem matar, mas cada policial morto derruba a barra de índole.

**O que o jogador deve sentir**
Ação frenética, do começo ao fim. É um homem só contra uma polícia inteira, com uma pistola, sem parar.

---

## 2. História inicial

A Adriana é sequestrada por mercenários. O delegado Geraldo, chefe do Kael, tira o Kael do caso, alegando envolvimento emocional. O Kael desobedece e vai sozinho.

Por trás disso, e sem o jogador saber ainda: foi o Geraldo quem contratou os mercenários, para extorquir o governador e aplicar um golpe nele. O governador também é corrupto, e boa parte da polícia e do exército está comprometida.

---

## 3. Quadra 1

**Parte 1: tutorial.** O jogador aprende os controles.

**Parte 2: barricada.** Vários policiais, que chegam um de cada vez, no estilo Metal Slug. O jogador escolhe neutralizar cada um de forma letal ou não letal.

**Arsenal.** Uma pistola com dois tipos de bala, letal e não letal. A munição é limitada. Cada policial nocauteado deixa um loot de balas, que pode ser letal ou não letal (valor inicial provisório: 70% letal / 30% não letal).

**Chefe: Roberto.** Tenente, braço direito do Geraldo e corrupto. Ele reconhece o Kael atravessando a quadra, e os dois saem na bala. Cada um tem a sua barra de vida, e perde quem esgotar a barra primeiro. O jogador escolhe matar ou não matar o Roberto, de acordo com a munição que tiver.

**Cutscene.** Uma imagem estática com texto, no início. A posição dela em relação ao chefe ainda está em aberto.

---

## 4. O que o texto conta e o que o jogo mostra

**Regra:** no máximo uma mensagem de texto no início da quadra 1. O texto conta só o que o jogo não consegue mostrar sozinho: quem foi levada, por que o Kael está por conta própria e para onde ele vai.

### Vai no texto do início
- A Adriana foi sequestrada por mercenários.
- O Geraldo tirou o Kael do caso.
- O Kael vai mesmo assim, sozinho.
- O destino é o prédio na Capital, atrás de cinco quadras de barricadas.

### O jogo mostra sozinho

| O quê | Como aparece |
|---|---|
| Kael só tem uma pistola | HUD e sprite |
| Existem dois tipos de bala | Parte 1, o tutorial |
| A polícia está contra ele | Os policiais atiram nele assim que ele chega na barricada |
| Matar tem custo | A barra de índole cai na hora |
| A munição é limitada | O contador diminui e os policiais deixam loot |
| Roberto é diferente dos outros | Luta de chefe, com barra de vida própria |

### Fica escondido por enquanto
- O Geraldo é o mandante.
- O governador é corrupto.
- A corrupção dentro da polícia e do exército.

### Por que funciona
O texto já explica por que as barricadas existem: o Geraldo tirou o Kael do caso, então parece que a polícia está só cumprindo ordem. Quando a verdade aparecer, o jogador vai entender que essas barricadas sempre foram o Geraldo protegendo o próprio golpe. A mensagem não precisa mentir nem entregar nada.

---

## 5. Mensagem de abertura (rascunho, não aprovado)

> A Adriana foi sequestrada por mercenários.
> O delegado Geraldo me tirou do caso.
> Vou mesmo assim.
> Ela está num prédio na Capital. São cinco quadras de barricadas até lá.
> Tenho uma pistola. E um distintivo que aqui não vale nada.

Escrita em primeira pessoa, por ser mais curta e direta, combinando com o tom de ação. Pode trocar para terceira pessoa.

---

## 6. Em aberto (deste arquivo)

1. Aprovar ou ajustar a divisão entre texto e jogo, e o rascunho da mensagem.
2. **Roberto reconhecendo o Kael:** como aparece sem texto? Uma opção é só uma animação dele parando e apontando antes da luta. A outra é uma fala curta, mas isso seria um segundo texto na quadra 1.
3. **Ordem do fim da quadra 1:** a cutscene vem antes do Roberto ou depois da luta?
4. **Texto da cutscene do fim da quadra 1:** o que a imagem mostra e o que o texto diz.
5. **Nome da cidade** que o Geraldo quer controlar.
