"""Agachar do Kael, ajoelhado (crouch, crouch_gun, crouch_aim_gun, crouch_shoot_gun, crouch_reload_gun).

Pose: joelho esquerdo no chão, perna direita dobrada com o pé no chão (cavaleiro), pedido do usuário.
O tronco ajoelhado é o tronco em pé 18 px mais baixo, então:
  - pernas: as do último quadro da IA em cada transição (gun_down_5 / down_5), que já vêm com os 4 tons
    do jeans e o branco do tênis. O keyframe key_aim_s1911.png (edit_image_pro_flash sobre o aim_gun_07)
    pinta o jeans de um azul só, e a cor pulava na pose parada; por isso ele só serviu de guia;
  - crouch_aim_gun, crouch_shoot_gun e crouch_reload_gun: cada quadro do aim_gun / shoot_gun / reload_gun em pé,
    tronco descido 18 px sobre as pernas armadas (rosto, braço e clarão idênticos aos de pé);
    a recarga usa os tempos da de pé (RELOAD_FAST_MS em humanoid.ts, plano playtest_fixes_1.md);
  - kneel_gun.png (pose parada armada) = idle_gun_00 descido sobre as pernas armadas;
  - pose parada sem arma: o próprio down_5 (mãos no joelho e na coxa), com a cabeça da base. O
    key_nogun_s1911.png (idle_00 descido, mãos pela IA) só serviu de último quadro para o animate_image.
Transições em drafts/kneel_raw/ (animate_image, 6 quadros, seed 77; o quadro 0 é a entrada):
  down_*:     idle_00 -> key_nogun_s1911
  gun_down_*: idle_gun_00 -> kneel_gun
Nelas a IA erra o rosto: cola a cabeça do idle por cima, com o deslocamento achado em cada quadro
(o y acompanha a descida; o x treme no máximo 1 px por quadro). O último quadro é a pose parada:
5 quadros no crouch e 6 no crouch_gun.
Levantar é o crouch ao contrário (na cena).

Uso: PYTHONPATH=tools python3 tools/build_crouch.py
"""
import numpy as np
from PIL import Image

from sprite_lib import load, remap, palette_of, ground, drop_islands, contact, save_anim, report, smooth_path, cm, fill_holes
from shoot_fx import DURATIONS

P = 'assets/player'
KEYS = f'{P}/drafts/kneel_keys'
RAW = f'{P}/drafts/kneel_raw'
FRAME_MS = {'crouch': 50, 'crouch_gun': 50, 'crouch_aim_gun': 90}
# recarga do Kael (igual a RELOAD_FAST_MS em src/game/anims/humanoid.ts)
RELOAD_FAST_MS = [110, 90, 90, 110, 110, 100, 130, 100, 100, 110, 160]
DROP = 18          # quanto o tronco desce do em pé para o ajoelhado
WAIST = 81         # linha do quadro ajoelhado (chão 121) onde começa o jeans
KNEE_UP = 6        # acima da cintura, a coxa da frente e o contorno do joelho sobem até 6 linhas,
KNEE_X = 64        # da coluna 64 para a frente (atrás disso é o tronco da IA)
OUTLINE = [(0, 0, 0), (3, 3, 4)]
JACKET = [(50, 51, 56)]
# cores da cabeça gerada pela IA, apagadas antes de colar a da base
HEAD_COLS = [(133, 67, 19), (35, 23, 18), (186, 107, 78), (236, 159, 122), (0, 0, 0), (3, 3, 4)]
# caixa da cabeça (y0, y1, x0, x1) no idle e no idle_gun; no idle_gun as mãos com a pistola ficam à esquerda
# até a linha 40 entra o pescoço: abaixo do queixo (CHIN) só a pele, para cobrir a gola que a IA desenha por cima
HEAD_BOX = {'idle': (16, 40, 51, 74), 'idle_gun': (17, 40, 54, 74)}
CHIN = 34
SKIN = [(186, 107, 78), (236, 159, 122)]
HANDS_X = 55       # no idle_gun, da linha 26 para baixo a cabeça começa aqui (antes são as mãos)


def blue(a):
    return (a[:, :, 2].astype(int) - a[:, :, 0] > 60) & (a[:, :, 3] > 0)


def lower(a, dy):
    s = np.zeros_like(a)
    s[dy:] = a[:-dy]
    return s


def near(m, r=1, down=0):
    """Pixels a até r px de m (4 direções); down: até quantas linhas abaixo também contam."""
    o = m.copy()
    for d in range(1, r + 1):
        o[:, d:] |= m[:, :-d]
        o[:, :-d] |= m[:, d:]
        o[d:] |= m[:-d]
        o[:-d] |= m[d:]
    for d in range(1, down + 1):
        o[:-d] |= m[d:]
    return o


def legs_of(prefix, pal, floor):
    """Pernas do último quadro da IA na transição: jeans e tênis com as sombras de verdade."""
    a = remap(load(f'{RAW}/{prefix}_5.png'), pal)
    drop_islands(a)
    a = ground(a, floor)
    # da cintura para cima só fica o jeans da coxa da frente e o contorno colado nele (o resto é tronco da IA)
    b = blue(a)
    keep = np.ones(a.shape[:2], bool)
    keep[:WAIST - KNEE_UP] = False
    top = slice(WAIST - KNEE_UP, WAIST)
    keep[top] = b[top] | (cm(a, OUTLINE) & near(b, 1, down=2))[top]
    keep[top, :KNEE_X] = False
    a[~keep] = 0
    # logo abaixo da cintura a IA deixa camisa, fivela e barra da jaqueta: vira o jeans de baixo
    b = blue(a)
    for y in range(WAIST, WAIST + 6):
        for x in np.nonzero((a[y, :, 3] > 0) & ~b[y] & ~cm(a[y:y + 1], OUTLINE)[0])[0]:
            below = np.nonzero(b[y + 1:y + 5, x])[0]
            a[y, x] = a[y + 1 + below[0], x] if len(below) else 0
    return a


def on_legs(legs, up):
    """Tronco em pé (tudo menos o jeans) descido DROP px sobre as pernas ajoelhadas."""
    out = legs.copy()
    s = lower(up, DROP)
    m = (s[:, :, 3] > 0) & ~blue(s)
    m[WAIST + 6:] = False
    out[m] = s[m]
    drop_islands(out)
    return out


def head_of(idle, kind):
    y0, y1, x0, x1 = HEAD_BOX[kind]
    head = idle[y0:y1, x0:x1].copy()
    hm = (head[:, :, 3] > 0) & ~cm(head, JACKET)
    if kind == 'idle_gun':
        hm[26 - y0:, :HANDS_X - x0] = False
    hm[CHIN - y0:] &= cm(head, SKIN)[CHIN - y0:]
    return head, hm


def find_head(a, head, hm, box, dys, dxs):
    """Deslocamento em que a cabeça da base mais bate com a da IA (só os pixels da máscara)."""
    y0, y1, x0, x1 = box
    best = None
    for dy in dys:
        for dx in dxs:
            win = a[y0 + dy:y1 + dy, x0 + dx:x1 + dx]
            if win.shape != head.shape:
                continue
            d = ((np.abs(win.astype(int) - head.astype(int)).sum(2) > 0) & hm).sum()
            if best is None or d < best[0]:
                best = (d, dy, dx)
    return best[1], best[2]


def put_head(a, head, hm, box, dy, dx):
    """Apaga a cabeça da IA (cores de cabeça acima do queixo, numa margem em volta) e cola a da base."""
    y0, y1, x0, x1 = box
    ry0, ry1, rx0, rx1 = y0 + dy - 3, CHIN + dy - 2, x0 + dx - 3, x1 + dx + 3
    reg = a[ry0:ry1, rx0:rx1]
    reg[cm(reg, HEAD_COLS)] = 0
    sub = a[y0 + dy:y1 + dy, x0 + dx:x1 + dx]
    sub[hm] = head[hm]
    fill_holes(a, (ry0, y1 + dy, rx0, rx1))
    drop_islands(a)


def transition(prefix, pal, floor, idle, kind, last=None):
    """Quadros 1..5 da IA com a cabeça da base; o 6 é a pose parada `last`. Sem `last`, o 5 já é a pose parada."""
    head, hm = head_of(idle, kind)
    box = HEAD_BOX[kind]
    frames = []
    for i in range(1, 6):
        a = remap(load(f'{RAW}/{prefix}_{i}.png'), pal)
        drop_islands(a)
        frames.append(ground(a, floor))
    ref = frames[-1] if last is None else last
    end = find_head(ref, head, hm, box, range(DROP - 4, DROP + 3), range(-4, 5))
    offs = [find_head(f, head, hm, box, range(-2, DROP + 4), range(-8, 9)) for f in frames]
    # y acompanha a descida do corpo (só desce, sem passar da pose final); x treme no máximo 1 px por quadro
    dys, top = [], 0
    for dy, _ in offs:
        top = min(max(top, dy), end[0])
        dys.append(top)
    if last is None:
        dxs = [dx for _, dx in smooth_path([(0, 0)] + offs[:-1] + [end], start=(0, 0), end=end)[1:]]
    else:
        dxs = [dx for _, dx in smooth_path([(0, 0)] + offs + [end], start=(0, 0), end=end)[1:-1]]
    path = list(zip(dys, dxs))
    for f, (dy, dx) in zip(frames, path):
        put_head(f, head, hm, box, dy, dx)
    print(prefix, 'cabeça (dy, dx):', path, '->', end)
    return frames if last is None else frames + [last]


def save(name, frames, floor, pal, ms):
    save_anim(frames, f'{P}/{name}_east', f'{name}_east', f'{P}/player_{name}_east_sheet.png', f'{P}/player_{name}_east.gif', ms)
    report(f'{name}_east', frames, floor, None if pal is None else [tuple(c) for c in pal])


def build():
    pal = palette_of(load(f'{P}/player_base_east.png'))
    pal_gun = palette_of(load(f'{P}/player_base_gun_east.png'))
    idle = load(f'{P}/idle_east/idle_east_00.png')
    idle_gun = load(f'{P}/idle_gun_east/idle_gun_east_00.png')
    legs = legs_of('gun_down', pal_gun, 121)

    kneel_gun = on_legs(legs, idle_gun)
    Image.fromarray(kneel_gun).save(f'{KEYS}/kneel_gun.png')
    crouch = transition('down', pal, 120, idle, 'idle')
    crouch_gun = transition('gun_down', pal_gun, 121, idle_gun, 'idle_gun', kneel_gun)
    aim = [on_legs(legs, load(f'{P}/aim_gun_east/aim_gun_east_{i:02d}.png')) for i in range(8)]
    shoot = [on_legs(legs, load(f'{P}/shoot_gun_east/shoot_gun_east_{i:02d}.png')) for i in range(8)]
    reload = [on_legs(legs, load(f'{P}/reload_gun_east/reload_gun_east_{i:02d}.png')) for i in range(11)]

    save('crouch', crouch, 120, pal, FRAME_MS['crouch'])
    save('crouch_gun', crouch_gun, 121, pal_gun, FRAME_MS['crouch_gun'])
    save('crouch_aim_gun', aim, 121, pal_gun, FRAME_MS['crouch_aim_gun'])
    # clarão e luz quente ficam fora da paleta (efeito), como no shoot_gun em pé
    save('crouch_shoot_gun', shoot, 121, None, DURATIONS)
    save('crouch_reload_gun', reload, 121, pal_gun, RELOAD_FAST_MS)

    contact([[idle] + crouch, [idle_gun] + crouch_gun, aim, shoot, reload], f'{RAW}/crouch_check.png', scale=2)
    contact([crouch, crouch_gun], f'{RAW}/crouch_heads.png', crop=(40, 10, 84, 60), scale=5)


if __name__ == '__main__':
    build()
