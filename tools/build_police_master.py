"""Monta o policial master a partir das saídas do transfer_outfit (drafts/raw_transfer).

Uso: python3 tools/build_police_master.py
Saída: assets/enemies/police/master/<anim>_east/ + sheets e GIFs de prévia.
"""
import os
import sys
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
GIF_DUR = {'idle_gun_east': 150, 'walk_gun_east': 110, 'aim_gun_east': 90}

pal, ramps = load_palette(os.path.join(POLICE, 'palette_master.json'))


def clean(path, floor, blood=False):
    a = remap(load(path), pal, keep_blood=blood)
    drop_islands(a, 3)
    return ground(a, floor)


def emit(name, frames, durations):
    save_anim(frames, os.path.join(OUT, name), name,
              sheet_path=os.path.join(OUT, f'police_master_{name}_sheet.png'),
              gif_path=os.path.join(OUT, f'police_master_{name}.gif'), durations=durations)


def main():
    allowed = pal.astype(int).tolist()
    for name in ('idle_gun_east', 'walk_gun_east', 'aim_gun_east'):
        frames = [clean(os.path.join(RAW, f'{name}_{i:02d}.png'), GUN_FLOOR) for i in range(8)]
        emit(name, frames, GIF_DUR[name])
        report(name, frames, GUN_FLOOR, allowed)
        if name == 'aim_gun_east':
            aim_last = frames[-1]

    shoot = shoot_frames(aim_last, lit_map(ramps))
    emit('shoot_gun_east', shoot, SHOOT_DUR)
    report('shoot_gun_east', shoot, GUN_FLOOR)

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
    emit('knockout_east', ko, KO_DUR)
    report('knockout_east', ko[-1:], DEATH_FLOOR, allowed)


if __name__ == '__main__':
    main()
