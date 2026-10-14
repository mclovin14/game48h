"""Mercenários de fuzil: tons da farda (variações) e as animações, todas viradas para East.

Base aprovada: assets/enemies/mercenaries/master/mercenary_master_base_east.png (opção A, edit_image_pro_flash
sobre o police_master_base, seed 1911). Chão y=121, paleta tirada da base.

Tons: a farda e o colete são as cores verde-oliva da base (r >= g > b, um pouco saturadas). Cada tom troca o
matiz e a saturação dessas cores e mantém a luminosidade, como os tons de farda dos policiais. O jogo vai
trocar as cores por canvas (como em uniformTones.ts), sem sheet nova. Gera tones.json e a prévia.

Animações: keyframes em drafts/keys/ (edit_image_pro_flash sobre a base, seed 1911): aim, run, reload,
crouch_aim, jump, hurt, ko, hold. Brutos em drafts/raw/<nome>_N.png (animate_image; o quadro 0 é a entrada):
  idle      base -> base (6, seed 77)          walk    base -> base (8, seed 77)
  run       key_run -> key_run (8, seed 77)    aim     base -> key_aim (4, seed 77)
  reload    base -> key_reload (6, seed 77): tira o pente; a volta é a mesma ao contrário
  crouch    base -> key_crouch_aim (6, seed 77)
  jump_up   base -> key_jump (6, seed 77)      land    key_jump -> base (6, seed 77)
  hurt      base -> key_hurt (4, seed 1911)    recover key_hurt -> base (4, seed 1911)
  knockout  key_hurt -> key_ko (8, seed 77)    death   key_hurt -> key_ko (12, seed 2024)
  hold      key_hold -> key_hold (6, seed 77): segura a Adriana pelo braço (par do held_east dela)
O primeiro hurt (seed 77) saiu com uma nuvem de fumaça: está em drafts/rejected/.
Cada quadro: remapeia para a paleta da base, tira ilhas soltas e aterra no chão (y=121); a cena move o
personagem no pulo. O tiro (rajada de 3) e o tiro ajoelhado saem de tools/shoot_fx.py sobre a pose final
da mira e do agachar.

Uso: PYTHONPATH=tools python3 tools/build_mercenary.py
"""
import colorsys
import json

import numpy as np
from scipy import ndimage
from PIL import Image

from shoot_fx import shoot_frames, lit_map
from sprite_lib import load, palette_of, remap, ground, drop_islands, contact, save_anim, report

M = 'assets/enemies/mercenaries'
BASE = f'{M}/master/mercenary_master_base_east.png'
RAW = f'{M}/drafts/raw'
FLOOR = 121
JUMP_MS = [45, 45, 45, 90, 95, 100, 100, 95, 90, 70, 90]   # o mesmo do Kael (JUMP_PHASES em humanoid.ts)
BURST_MS = [45, 45, 50] * 3 + [80, 90, 90, 110, 160]
# nome: (lista de (bruto, índice), ms por quadro). Nos loops o último quadro da IA repete o primeiro.
SEQ = {
    'idle_rifle': ([('idle', i) for i in range(6)], 150),
    'walk_rifle': ([('walk', i) for i in range(8)], 110),
    'run_rifle': ([('run', i) for i in range(8)], 72),
    'aim_rifle': ([('aim', i) for i in range(5)], 90),
    'reload_rifle': ([('reload', i) for i in range(7)] + [('reload', i) for i in range(5, -1, -1)], 120),
    'crouch_rifle': ([('crouch', i) for i in range(7)], 60),
    'jump_rifle': ([('jump_up', i) for i in range(1, 7)] + [('land', i) for i in range(1, 6)], JUMP_MS),
    'hurt': ([('hurt', i) for i in range(1, 5)] + [('recover', i) for i in range(1, 4)], [60, 70, 90, 90, 80, 90, 100]),
    'knockout': ([('hurt', i) for i in range(1, 4)] + [('knockout', i) for i in range(9)],
                 [60, 70, 80, 90, 90, 90, 90, 100, 100, 110, 120, 1200]),
    'death': ([('hurt', i) for i in range(1, 4)] + [('death', i) for i in range(13)],
              [60, 70, 80] + [100] * 12 + [1200]),
    'hold': ([('hold', i) for i in range(6)], 120),
}
# tiro: pose final de onde sai, cano (x, y), arma/braços (coluna e linhas), caixa da cabeça (y0, y1, x0, x1)
SHOOT = {
    'shoot_rifle': ('aim_rifle', dict(muzzle=(118, 30), arm_x=58, arm_rows=(24, 42), head_box=(13, 26, 52, 70),
                                      collar_rows=(26, 28))),
    'crouch_shoot_rifle': ('crouch_rifle', dict(muzzle=(116, 50), arm_x=56, arm_rows=(44, 60),
                                                head_box=(34, 46, 48, 66), collar_rows=(46, 48))),
}
# [PROPOSTA] nome: (matiz em graus ou None = o do master, fator de saturação, fator de luminosidade)
TONES = {
    'olive': (None, 1.0, 1.0),
    'ranger': (95, 0.55, 0.85),    # verde-acinzentado escuro
    'coyote': (35, 1.15, 1.2),     # cáqui / marrom-claro
}


def cloth_ramp(pal):
    """Cores da farda: r >= g > b e saturadas, sem a pele (que é bem mais vermelha)."""
    out = []
    for r, g, b in (tuple(int(x) for x in c) for c in pal):
        if r >= g > b and g - b >= 8 and r - g < 20:
            out.append((r, g, b))
    return sorted(out, key=sum)


def tone(c, spec):
    hue, sat, lum = spec
    h, l, s = colorsys.rgb_to_hls(*(v / 255 for v in c))
    h = h if hue is None else hue / 360
    r, g, b = colorsys.hls_to_rgb(h, min(1, l * lum), min(1, s * sat))
    return [round(r * 255), round(g * 255), round(b * 255)]


def recolor(a, src, dst):
    o = a.copy()
    for s, d in zip(src, dst):
        o[(a[:, :, :3] == s).all(2) & (a[:, :, 3] > 0), :3] = d
    return o


def tones():
    base = load(BASE)
    ramp = cloth_ramp(palette_of(base))
    data = {'_doc': 'Rampas da farda dos mercenários (cores verde-oliva da base, da mais escura à mais clara). '
                    'olive é a do master. Gerado por tools/build_mercenary.py.'}
    for name, spec in TONES.items():
        data[name] = [list(c) for c in ramp] if name == 'olive' else [tone(c, spec) for c in ramp]
    json.dump(data, open(f'{M}/tones.json', 'w'), indent=1)
    s = 4
    prev = Image.new('RGBA', (128 * len(TONES) * s, 128 * s), (90, 90, 100, 255))
    for i, name in enumerate(TONES):
        im = Image.fromarray(recolor(base, ramp, data[name]))
        prev.alpha_composite(im.resize((128 * s, 128 * s), Image.NEAREST), (i * 128 * s, 0))
    prev.save(f'{M}/drafts/tones_preview.png')
    print('rampa da farda:', len(ramp), 'cores')


def ramps_of(pal):
    """Rampas para a luz do flash: farda, pele e metal (o contorno, mais escuro, fica de fora)."""
    cloth = cloth_ramp(pal)
    cols = [tuple(int(x) for x in c) for c in pal]
    skin = [c for c in cols if c[0] - c[2] > 60 and c[0] > 130]
    dark = min(cols, key=sum)
    metal = [c for c in cols if c not in cloth and c not in skin and c != dark]
    return {'cloth': cloth, 'skin': skin, 'metal': metal, 'outline': [dark]}


def burst(aim, lit, opts):
    """Rajada de 3: os 3 primeiros quadros do tiro (flash, recuo, bala) três vezes, depois a fumaça.
    O recuo sobe a faixa da arma e deixa vazias as linhas de baixo, que cortam o tronco: voltam da mira."""
    f = shoot_frames(aim, lit, **opts)
    y1 = opts['arm_rows'][1]
    for a in f:
        hole = (a[y1 - 3:y1 + 1, :, 3] == 0) & (aim[y1 - 3:y1 + 1, :, 3] > 0)
        a[y1 - 3:y1 + 1][hole] = aim[y1 - 3:y1 + 1][hole]
    return f[:3] * 3 + f[3:]


# corpo no chão: nos quadros em que ele já deitou, a IA deixou o fuzil por baixo e o corpo ficou 13 px acima
# do chão. Desce o quadro, corta o que passa do chão e põe por cima o fuzil solto do último quadro.
SETTLE = {'death': range(12, 16), 'knockout': range(10, 12)}


def settle(frames, idx):
    """Desce o corpo até o chão nos quadros idx; o fuzil (ilha solta do último quadro) fica no chão, na frente."""
    last = frames[-1]
    lab, k = ndimage.label(last[:, :, 3] > 0, structure=np.ones((3, 3)))
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, k + 1))
    rifle = lab == 1 + int(np.argsort(sizes)[-2])
    body_bottom = np.nonzero((last[:, :, 3] > 0) & ~rifle)[0].max()
    dy = FLOOR - body_bottom
    for i in idx:
        a = np.zeros_like(frames[i])
        a[dy:] = frames[i][:-dy]
        a[FLOOR + 1:] = 0
        a[rifle] = last[rifle]
        drop_islands(a, 30)  # restos do fuzil antigo no chão
        frames[i] = a
    return dy


def build():
    base = load(BASE)
    pal = palette_of(base)
    allowed = [tuple(c) for c in pal]
    out = {}
    for name, (seq, ms) in SEQ.items():
        frames = []
        for raw, i in seq:
            a = remap(load(f'{RAW}/{raw}_{i}.png'), pal)
            drop_islands(a)
            frames.append(ground(a, FLOOR))
        if name in SETTLE:
            print(f'{name}: corpo desce {settle(frames, SETTLE[name])} px')
        out[name] = (frames, ms)
    lit = lit_map(ramps_of(pal))
    for name, (src, opts) in SHOOT.items():
        out[name] = (burst(out[src][0][-1], lit, opts), BURST_MS)
    for name, (frames, ms) in out.items():
        n = f'{name}_east'
        save_anim(frames, f'{M}/master/{n}', n, f'{M}/master/mercenary_master_{n}_sheet.png',
                  f'{M}/master/mercenary_master_{n}.gif', ms)
        report(n, frames, FLOOR, None if name in SHOOT else allowed)
    contact([f for f, _ in out.values()], f'{M}/drafts/anim_check.png', scale=1)


if __name__ == '__main__':
    tones()
    build()
