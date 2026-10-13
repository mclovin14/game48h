// Textos da interface em português (língua padrão). O en.ts tem as mesmas chaves.
export const ptBr = {
  'menu.newGame': 'Novo Jogo',
  'menu.options': 'Opções',
  'menu.paused': 'Pausado',
  'menu.resume': 'Continuar',
  'menu.restart': 'Reiniciar',
  'menu.quit': 'Voltar ao título',
  'menu.back': 'Voltar',
  'menu.hint': 'Setas e Enter escolhem · Esc volta',

  'options.title': 'Opções',
  'options.music': 'Música',
  'options.sfx': 'Efeitos',
  'options.fullscreen': 'Tela cheia',
  'options.language': 'Língua',
  'options.on': 'Ligada',
  'options.off': 'Desligada',
  'options.hint': '← → ajustam · Esc volta',

  'hud.life': 'Vida',
  'hud.morale': 'Índole',
  'hud.pistol': 'Pistola',
  'hud.unarmed': 'Sem arma (1 saca)',
  'hud.reloading': 'Recarregando...',
  'hud.mag': 'Pente',
  'hud.lethal': 'Letal',
  'hud.nonLethal': 'Não letal',

  'dialog.continue': 'Clique ou Enter para continuar',

  // cutscene de abertura (falas aprovadas em 13/10/2026; a tela de texto é o rascunho do story.md, seção 5)
  'cutscene.intro': [
    'A Adriana foi sequestrada por mercenários.',
    'O delegado Geraldo me tirou do caso.',
    'Vou mesmo assim.',
    'Ela está num prédio na Capital. São cinco quadras de barricadas até lá.',
    'Tenho uma pistola. E um distintivo que aqui não vale nada.',
  ].join('\n'),
  'cutscene.adriana1': 'KAEL! Socorro!',
  'cutscene.adriana2': 'Eles vão me levar! Me ajuda!',
  'cutscene.kael1': 'Aguenta firme. Eu tô indo.',
  'cutscene.name.adriana': 'Adriana',
  'cutscene.name.kael': 'Kael',
  'cutscene.hint': 'Enter avança · Esc pula',

  // finais da quadra 1 [PROPOSTA da IA, aguardando o usuário]; a fase 8 põe a ilustração animada antes do texto
  'ending.happy.adriana': 'Kael! Eu sabia que você vinha.',
  'ending.happy.kael': 'Acabou. Vamos pra casa.',
  'ending.happy.text': ['O Kael tirou a Adriana das mãos dos mercenários.', 'E não precisou virar um deles para isso.', '', 'FIM'].join('\n'),
  'ending.sad.adriana': 'Kael! Não... fica comigo!',
  'ending.sad.text': ['O Kael chegou até a Adriana.', 'Mas, no caminho, matou demais para merecer voltar com ela.', '', 'FIM'].join('\n'),

  'game.loading': 'Carregando...',
  'game.dead': 'O Kael caiu. Enter reinicia.',
  'game.lootLethal': 'letal',
  'game.lootNonLethal': 'não letal',
  'game.controls': [
    'Cena de teste.',
    'A/D ou ←/→: andar; segure Shift para correr. A fase tem 5 telas; a câmera segue o Kael.',
    'Espaço, W ou ↑: pula para a frente (correndo vai mais longe). Use para passar por cima das balas.',
    'S, ↓ ou Ctrl (segure): agacha. Agachado não anda, A/D só viram, e as balas altas passam por cima.',
    '1: sacar ou guardar a arma (começa sem arma).',
    'Sem a arma: botão direito dá o combo (jab, direto e chute); clique seguido emenda os golpes. O chute nocauteia o policial.',
    'Com a arma: botão direito do mouse mira (segure), botão esquerdo atira para o lado em que o Kael olha; A/D viram para o outro lado. Depois do tiro ele continua mirando.',
    'Pente de 8. R recarrega (parado); pente vazio recarrega sozinho.',
    'No fim da rua, os três mercenários cercam o Kael. Um atira por vez, e o ! vermelho em cima da cabeça avisa quem vai atirar. Matar mercenário não tira índole.',
    'Q ou roda do mouse: troca entre bala letal e não letal (recarrega com o outro tipo).',
    'Perto de cada barricada a câmera trava e os policiais entram em ondas.',
    'O policial mira (aviso) e atira. Nocauteado (bala não letal), solta uma caixa de munição: passe por cima.',
    'F1: mostra a aparência de cada policial e a seed (?seed=... na URL repete o sorteio).',
    'K: testa a morte do Kael (Enter reinicia). Esc: pausa, opções (volume, língua) e reiniciar. C: mostra a zona morta da câmera.',
    '[ e ]: volta ou avança o relógio (do entardecer à noite em 8 minutos).',
  ].join('\n'),
};

export type TextKey = keyof typeof ptBr;
