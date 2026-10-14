"""Monta o policial master a partir das saídas do transfer_outfit (drafts/raw_transfer).

Uso: python3 tools/build_police_master.py
Saída: assets/enemies/police/master/<anim>_east/ + sheets e GIFs de prévia.
"""
import os
import sys

from scipy import ndimage
sys.path.insert(0, os.path.dirname(__file__))
from sprite_lib import (load, load_frames, load_palette, remap, drop_islands, ground, copy_blood,
                        cm, save_anim, report, RED, DRED, np)
from shoot_fx import shoot_frames, lit_map, DURATIONS as SHOOT_DUR

ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets')
POLICE = os.path.join(ROOT, 'enemies', 'police')
RAW = os.path.join(POLICE, 'drafts', 'raw_transfer')
ANIM = os.path.join(POLICE, 'drafts', 'raw_animate')
KAEL = os.path.join(ROOT, 'player')
OUT = os.path.join(POLICE, 'master')

GUN_FLOOR, DEATH_FLOOR = 121, 120
DEATH_DUR = [70, 80, 90, 100] + [100] * 12 + [90, 90, 80, 80, 70, 90, 120, 160] + [140] * 5 + [1200]
HURT_RECOIL = [-1, -3, -3, -2, -1, 0]
HURT_DUR = [60, 70, 90, 90, 80, 100]
KO_DUR = [60, 70, 80, 90, 90, 100, 120, 1200]
# run_gun e reload_gun: mesmos quadros e tempos do Kael (fase 5 do sound_run_reload_menu.md)
GIF_DUR = {'idle_gun_east': 150, 'walk_gun_east': 110, 'run_gun_east': 72, 'reload_gun_east': 190, 'aim_gun_east': 90}
# pulo e ajoelhar (fase 3 do jump_crouch_cutscene.md): mesmos quadros e tempos do Kael
JUMP_DUR = [45, 45, 45, 90, 95, 100, 100, 95, 90, 70, 90]
CROUCH_DUR = 50
# ajoelhado: o tronco em pé desce DROP px sobre as pernas do último quadro do crouch_gun (como no Kael).
# Do cinto para cima (até KNEE_CUT) é o tronco; abaixo, as pernas. Acima do corte, da coluna KNEE_X
# para a frente, a coxa da frente aparece onde o tronco não cobre.
DROP, KNEE_CUT, KNEE_UP, KNEE_X = 18, 84, 8, 64

pal, ramps = load_palette(os.path.join(POLICE, 'palette_master.json'))


def clean(path, floor, blood=False):
    a = remap(load(path), pal, keep_blood=blood)
    drop_islands(a, 3)
    return ground(a, floor)


# recarga: o transfer_outfit apagou o pente branco e furou a mão esquerda; volta do Kael (mesma pose,
# alinhado em 0,0), só onde o quadro está vazio, dentro da caixa da mão esquerda (y, x)
RELOAD_HAND = (slice(42, 70), slice(64, 92))


def patch_reload_hand(frames):
    kael = load_frames(os.path.join(KAEL, 'reload_gun_east'), 'reload_gun_east')
    for f, k in zip(frames, kael):
        k = remap(k, pal)
        box = np.zeros(f.shape[:2], bool)
        box[RELOAD_HAND] = True
        gap = box & (f[:, :, 3] == 0) & (k[:, :, 3] > 0)
        f[gap] = k[gap]
    return frames


def kneel_legs(src):
    """Pernas do policial ajoelhado: do corte para baixo, mais a coxa da frente logo acima."""
    a = src.copy()
    a[:KNEE_CUT - KNEE_UP] = 0
    a[KNEE_CUT - KNEE_UP:KNEE_CUT, :KNEE_X] = 0
    return a


def on_legs(legs, up):
    """Quadro em pé com o tronco descido DROP px sobre as pernas ajoelhadas. Mãos, pistola e pente que
    passam do corte (recarga) ficam por cima das pernas."""
    out = legs.copy()
    s = np.zeros_like(up)
    s[DROP:] = up[:-DROP]
    m = s[:, :, 3] > 0
    m[KNEE_CUT:] = False
    front = cm(s, ramps['skin'] + ramps['metal'] + ramps['white'])
    front = front | (grow(front) & cm(s, ramps['outline']))
    front[:KNEE_CUT] = False
    front[KNEE_CUT + 8:] = False
    m |= front
    out[m] = s[m]
    drop_islands(out, 3)
    return out


def grow(m):
    g = m.copy()
    g[1:] |= m[:-1]; g[:-1] |= m[1:]; g[:, 1:] |= m[:, :-1]; g[:, :-1] |= m[:, 1:]
    return g


def emit(name, frames, durations):
    save_anim(frames, os.path.join(OUT, name), name,
              sheet_path=os.path.join(OUT, f'police_master_{name}_sheet.png'),
              gif_path=os.path.join(OUT, f'police_master_{name}.gif'), durations=durations)


def main():
    allowed = pal.astype(int).tolist()
    std = {}
    for name in ('idle_gun_east', 'walk_gun_east', 'run_gun_east', 'reload_gun_east', 'aim_gun_east'):
        n = len([f for f in os.listdir(RAW) if f.startswith(name)])
        frames = [clean(os.path.join(RAW, f'{name}_{i:02d}.png'), GUN_FLOOR) for i in range(n)]
        if name == 'reload_gun_east':
            frames = patch_reload_hand(frames)
        emit(name, frames, GIF_DUR[name])
        report(name, frames, GUN_FLOOR, allowed)
        if name == 'aim_gun_east':
            aim_last = frames[-1]
        std[name] = frames

    shoot = shoot_frames(aim_last, lit_map(ramps))
    emit('shoot_gun_east', shoot, SHOOT_DUR)
    report('shoot_gun_east', shoot, GUN_FLOOR)

    # pulo: os 11 quadros da IA, só limpos
    jump = [clean(os.path.join(RAW, f'jump_gun_east_{i:02d}.png'), GUN_FLOOR) for i in range(11)]
    emit('jump_gun_east', jump, JUMP_DUR)
    report('jump_gun_east', jump, GUN_FLOOR, allowed)

    # ajoelhar: quadros 0-4 da IA; a pose parada (5) e a mira, o tiro e a recarga ajoelhados são os de pé
    # descidos sobre as pernas, então o tronco não pula ao trocar de animação
    raw = [clean(os.path.join(RAW, f'crouch_gun_east_{i:02d}.png'), GUN_FLOOR) for i in range(6)]
    legs = kneel_legs(raw[5])
    crouch = raw[:5] + [on_legs(legs, std['idle_gun_east'][0])]
    emit('crouch_gun_east', crouch, CROUCH_DUR)
    report('crouch_gun_east', crouch, GUN_FLOOR, allowed)
    for name, src, dur in (('crouch_aim_gun_east', std['aim_gun_east'], GIF_DUR['aim_gun_east']),
                           ('crouch_reload_gun_east', std['reload_gun_east'], GIF_DUR['reload_gun_east']),
                           ('crouch_shoot_gun_east', shoot, SHOOT_DUR)):
        frames = [on_legs(legs, f) for f in src]
        emit(name, frames, dur)
        report(name, frames, GUN_FLOOR, None if 'shoot' in name else allowed)

    # morte: 24 quadros da IA + sangue do Kael na mesma posição; 24-29 = último quadro + poça crescendo
    kael = load_frames(os.path.join(KAEL, 'death_east'), 'death_east')
    death = []
    for i in range(24):
        a = clean(os.path.join(RAW, f'death_east_{i:02d}.png'), DEATH_FLOOR, blood=True)
        death.append(copy_blood(a, kael[i]))
    for i in range(24, len(kael)):
        a = death[23].copy()
        pool = cm(kael[i], [RED, DRED]) & (a[:, :, 3] == 0)
        pool[:DEATH_FLOOR - 3] = False
        a[pool] = kael[i][pool]
        death.append(a)
    emit('death_east', death, DEATH_DUR)
    report('death_east', death, DEATH_FLOOR, allowed + [list(RED), list(DRED)])

    # hurt: a IA só dá um tranco leve e solta faíscas douradas; tira as faíscas e soma um recuo procedural
    hurt = []
    for i, dx in enumerate(HURT_RECOIL):
        a = remap(load(os.path.join(ANIM, f'hurt_east_{i:02d}.png')), pal)
        drop_islands(a, 60)   # o hurt não tem peça solta legítima; as faíscas passam de 15 px
        hurt.append(np.roll(ground(a, GUN_FLOOR), dx, axis=1))
    emit('hurt_east', hurt, HURT_DUR)
    report('hurt_east', hurt, GUN_FLOOR, allowed)

    # knockout: mantém a altura da IA (ele sai do chão no tranco); só o último quadro define o deslocamento
    ko = []
    for i in range(8):
        a = remap(load(os.path.join(ANIM, f'knockout_east_{i:02d}.png')), pal)
        drop_islands(a, 15)
        ko.append(a)
    shift = DEATH_FLOOR - int(np.where(ko[-1][:, :, 3] > 0)[0].max())
    ko = [ground(a, GUN_FLOOR) if i < 3 else np.roll(a, shift, axis=0) for i, a in enumerate(ko)]
    # deitado (6 e 7): a pistola solta tocava o chão e o corpo ficava acima; desce o corpo e põe a pistola na frente
    last = ko[-1]
    lab, k = ndimage.label(last[:, :, 3] > 0, structure=np.ones((3, 3)))
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, k + 1))
    gun = lab == 1 + int(np.argsort(sizes)[-2])
    dy = DEATH_FLOOR - int(np.nonzero((last[:, :, 3] > 0) & ~gun)[0].max())
    for i in (6, 7):
        a = np.zeros_like(ko[i])
        a[dy:] = ko[i][:-dy]
        a[DEATH_FLOOR + 1:] = 0
        a[gun] = last[gun]
        drop_islands(a, 30)  # restos da pistola antiga
        ko[i] = a
    print(f'knockout: corpo desce {dy} px')
    emit('knockout_east', ko, KO_DUR)
    report('knockout_east', ko[-1:], DEATH_FLOOR, allowed)


if __name__ == '__main__':
    main()
