"""Recarga do Kael (reload_gun_east), parado, chão em y=121.

Brutos do PixelLab em assets/player/drafts/reload_keys/ (keyframes) e drafts/reload_raw/ (animações).
Mesma regra da corrida: a cabeça é a desenhada pela IA; só remapeia para a paleta, tira fragmentos e aterra.

Uso:
  PYTHONPATH=tools python3 tools/build_reload.py key <seed>     # limpa o keyframe escolhido -> drafts/reload_key_east.png
  PYTHONPATH=tools python3 tools/build_reload.py anim           # monta reload_gun_east a partir de reload_raw/
"""
import sys
from PIL import Image
from sprite_lib import load, remap, palette_of, ground, drop_islands, contact, save_anim, report

P = 'assets/player'
D = f'{P}/drafts'
BASE_GUN = load(f'{P}/player_base_gun_east.png')
IDLE = load(f'{P}/idle_gun_east/idle_gun_east_00.png')
FLOOR = 121
# 11 quadros x 190 ms = 2,09 s, a duração do colt_reload.wav. O pente entra no quadro 6 (1,14 s),
# junto do clique do som (1,16 a 1,20 s); o ferrolho (1,88 s) cai quando ele já está levantando a arma.
FRAME_MS = 190


def prep(a):
    a = remap(a, palette_of(BASE_GUN))
    drop_islands(a)
    return ground(a, FLOOR)


def key(seed):
    k = prep(load(f'{D}/reload_keys/key_s{seed}.png'))
    Image.fromarray(k).save(f'{D}/reload_key_east.png')
    contact([[IDLE, k]], f'{D}/reload_keys/reload_key_clean.png', scale=4)
    report('reload_key', [k], FLOOR, [tuple(c) for c in palette_of(BASE_GUN)])


def anim():
    """reload_raw/a_0..a_6: animate_image do idle_gun_00 ao keyframe; b_0..b_6: do keyframe ao idle_gun_00.
    O quadro 0 de cada trecho é a entrada e o 6 repete o fim, então ficam a_1..a_6 e b_1..b_5: começa e
    termina colado no idle_gun, sem quadro repetido.
    Em a_4 e a_5 o pente sumia da mão esquerda: no lugar entram tween_2 e tween_3, gerados com
    animate_image de a_3 a a_6 (tween_0..4.png)."""
    src = f'{D}/reload_raw'
    a = [prep(load(f'{src}/a_{i}.png')) for i in (1, 2, 3)]
    t = [prep(load(f'{src}/tween_{i}.png')) for i in (2, 3)]
    frames = a + t + [prep(load(f'{src}/a_6.png'))] + [prep(load(f'{src}/b_{i}.png')) for i in range(1, 6)]
    name = 'reload_gun_east'
    save_anim(frames, f'{P}/{name}', name, f'{P}/player_{name}_sheet.png', f'{P}/player_{name}.gif', FRAME_MS)
    contact([[IDLE] + frames + [IDLE]], f'{src}/reload_check.png', crop=(30, 8, 105, 72), scale=4)
    report(name, frames, FLOOR, [tuple(c) for c in palette_of(BASE_GUN)])


if __name__ == '__main__':
    if sys.argv[1] == 'key':
        key(sys.argv[2])
    elif sys.argv[1] == 'anim':
        anim()
