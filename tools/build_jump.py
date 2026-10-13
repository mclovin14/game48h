"""Pulo do Kael (jump_east e jump_gun_east): limpa a saída do PixelLab.

Keyframes (pico do pulo, joelhos encolhidos) em assets/player/drafts/jump_keys/:
  key_nogun_s77.png e key_gun_s1911.png, de edit_image_pro_flash sobre o idle_00 / idle_gun_00.
Animações em drafts/jump_raw/ (animate_image, 6 quadros, seed 77; o quadro 0 é a entrada):
  up_*:   idle_00 -> keyframe (agacha, impulsiona, encolhe)
  down_*: keyframe -> idle_00 (estica as pernas, aterrissa, levanta)
  gun_up_* e gun_down_*: o mesmo a partir do idle_gun_00.
Mesma regra da corrida e da recarga: a cabeça é a desenhada pela IA; só remapeia, tira fragmentos e aterra.
Os quadros não saem do lugar: a cena move o Kael em x e y (parábola).

Uso: PYTHONPATH=tools python3 tools/build_jump.py
"""
from sprite_lib import load, remap, palette_of, ground, drop_islands, contact, save_anim, report

P = 'assets/player'
RAW = f'{P}/drafts/jump_raw'
# up_1..6 + down_1..5: o up_0 e o down_6 são o próprio idle, que vem antes e depois no jogo.
# 0-2 no chão (impulso), 3-8 no ar, 9-10 aterrissagem. A cena usa as mesmas fases (ANIMS.jump em humanoid.ts).
SEQ = [('up', i) for i in range(1, 7)] + [('down', i) for i in range(1, 6)]
FRAME_MS = [45, 45, 45, 90, 95, 100, 100, 95, 90, 70, 90]


def build(kind):
    gun = kind == 'jump_gun'
    base = load(f'{P}/player_base_gun_east.png' if gun else f'{P}/player_base_east.png')
    idle = load(f'{P}/idle_gun_east/idle_gun_east_00.png' if gun else f'{P}/idle_east/idle_east_00.png')
    pal, floor = palette_of(base), (121 if gun else 120)
    pre = 'gun_' if gun else ''
    frames = []
    for part, i in SEQ:
        a = remap(load(f'{RAW}/{pre}{part}_{i}.png'), pal)
        drop_islands(a)
        frames.append(ground(a, floor))
    name = f'{kind}_east'
    save_anim(frames, f'{P}/{name}', name, f'{P}/player_{name}_sheet.png', f'{P}/player_{name}.gif', FRAME_MS)
    contact([[idle] + frames + [idle]], f'{RAW}/{kind}_check.png', scale=2)
    contact([frames], f'{RAW}/{kind}_heads.png', crop=(36, 4, 100, 60), scale=4)
    report(name, frames, floor, [tuple(c) for c in pal])


if __name__ == '__main__':
    build('jump')
    build('jump_gun')
