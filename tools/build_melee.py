"""Combo corpo a corpo do Kael, sem arma (punch_1 = jab, punch_2 = direto, kick = chute giratório).

Plano docs/plan/melee_combo.md. Keyframes em assets/player/drafts/melee_keys/ (edit_image_pro_flash):
  key_jab_s1911       jab: braço do fundo esticado, mão da frente no queixo (sobre a base)
  key_cross2_s77      direto: a mão do lado de quem olha estica, calcanhar de trás levantado (sobre o jab)
  key_kick4_chamber_s1911  joelho sobe antes do chute (referência: references/kael/kick_reference_streets_of_rage.png)
  key_kick6_a         chute: perna de apoio vertical, braço da frente recolhido embaixo, o outro em 90 graus
Brutos em drafts/melee_raw/ (animate_image, seed 77; o quadro 0 é a entrada):
  jab_in    base -> jab (4)        jab_out   jab -> base (4)
  cross_in  base -> direto (4)     cross_out direto -> base (4)
  kick_up   base -> joelho (4)     kick_out  joelho -> chute (4)    kick_back chute -> base (6)
Cada golpe sai da guarda e volta para ela: o combo emenda o próximo, e parar de clicar termina no idle.
Cada quadro: remapeia para a paleta da base, tira ilhas soltas e aterra no chão (y=120).
O GIF combo_preview.gif mostra o combo inteiro; combo_stop_preview.gif, o jab sozinho voltando ao idle.

Uso: PYTHONPATH=tools python3 tools/build_melee.py
"""
from PIL import Image

from sprite_lib import load, remap, palette_of, ground, drop_islands, contact, save_anim, report

P = 'assets/player'
RAW = f'{P}/drafts/melee_raw'
FLOOR = 120
# nome: (quadros brutos, ms por quadro). O último quadro da volta é a própria base e fica de fora.
SEQ = {
    # a volta é a ida ao contrário: os pés voltam exatamente à guarda, sem pulo no idle
    'punch_1': ([('jab_in', i) for i in (1, 2, 3, 4, 3, 2, 1)],
                [45, 45, 50, 110, 60, 60, 70]),
    # o direto só vem depois do jab: sai do jab esticado (one_two_a = animate_image jab -> direto, seed 77),
    # recolhe o jab ao queixo com as duas mãos altas, gira e estica o direto; a volta é o cross_in ao contrário
    'punch_2': ([('one_two_a', i) for i in (2, 3, 4, 5)] + [('cross_in', i) for i in (4, 3, 2, 1)],
                [55, 60, 45, 45, 130, 70, 70, 80]),
    # chute v2: tudo sai do quadro esticado aprovado (key_kick_ext_approved), sem trocar de perna.
    # Sobe o joelho (kick2_up), estica (kick2_out) e recolhe o joelho antes de pisar (a volta é a subida ao contrário).
    'kick': ([('kick2_up', i) for i in (2, 3, 4, 6)] + [('kick2_out', 3), ('kick2_out', 4)]
             + [('kick2_up', 6), ('kick2_up', 4), ('kick2_up', 3), ('kick2_up', 2)],
             [50, 50, 60, 70, 40, 220, 70, 70, 70, 80]),
}
# Emenda do combo: o golpe seguinte entra depois do quadro CHAIN_OUT do atual (jab esticado; direto recolhendo)
# e começa no seu CHAIN_IN (o chute pula o quadro de mão baixa). Sem clique, o golpe vai até o fim e volta ao idle.
CHAIN_OUT = {'punch_1': 3, 'punch_2': 5}
CHAIN_IN = {'punch_1': 0, 'punch_2': 0, 'kick': 1}


def build():
    base = load(f'{P}/player_base_east.png')
    pal = palette_of(base)
    out = {}
    for name, (seq, ms) in SEQ.items():
        frames = []
        for raw, i in seq:
            a = remap(load(f'{RAW}/{raw}_{i}.png'), pal)
            drop_islands(a, min_size=40)  # a IA solta gotas perto do pé
            g = ground(a, FLOOR)
            frames.append(g)
        out[name] = (frames, ms)
        n = f'{name}_east'
        save_anim(frames, f'{P}/{n}', n, f'{P}/player_{n}_sheet.png', f'{P}/player_{n}.gif', ms)
        report(n, frames, FLOOR, [tuple(c) for c in pal])
    contact([f for f, _ in out.values()], f'{P}/drafts/melee_check.png', scale=2)
    previews(out)


def gif(frames, ms, path, scale=3):
    bg = (88, 92, 104, 255)
    ims = []
    for a in frames:
        im = Image.new('RGBA', (128, 128), bg)
        im.alpha_composite(Image.fromarray(a))
        ims.append(im.resize((128 * scale, 128 * scale), Image.NEAREST).convert('P', palette=Image.ADAPTIVE))
    ims[0].save(path, save_all=True, append_images=ims[1:], duration=ms, loop=0, disposal=2)


def previews(out):
    """Combo inteiro (cliques seguidos) e o jab sozinho (parou de clicar), com o idle antes e depois."""
    idle = [load(f'{P}/idle_east/idle_east_{i:02d}.png') for i in range(6)]
    idle_ms = [150] * 6
    frames, ms = list(idle), list(idle_ms)
    for name in ('punch_1', 'punch_2', 'kick'):
        a, b = CHAIN_IN[name], CHAIN_OUT.get(name, 99) + 1
        frames += out[name][0][a:b]
        ms += out[name][1][a:b]
    frames += idle + idle
    ms += idle_ms * 2
    gif(frames, ms, f'{P}/drafts/combo_preview.gif')
    f1, m1 = out['punch_1']
    gif(idle + f1 + idle + idle, idle_ms + m1 + idle_ms * 2, f'{P}/drafts/combo_stop_preview.gif')


if __name__ == '__main__':
    build()
