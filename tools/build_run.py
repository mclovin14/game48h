"""Corrida do Kael (run_east e run_gun_east): limpa a saída do PixelLab.

Keyframes: cola a cabeça da base (a IA erra o rosto). Animação: só quadros com a cabeça desenhada pela IA. Remapeia para a paleta da base e aterra no chão.
Uso: PYTHONPATH=tools python3 tools/build_run.py keys <pasta_entrada> <pasta_saida>
  keys: entrada com run_key_raw.png e run_gun_key_raw.png (saída crua do PixelLab); saída com os keyframes limpos e a comparação.
     PYTHONPATH=tools python3 tools/build_run.py anim assets/player/drafts/run_raw run
     PYTHONPATH=tools python3 tools/build_run.py anim assets/player/drafts/run_gun_raw run_gun
     PYTHONPATH=tools python3 tools/build_run.py stop assets/player/drafts/run_gun_stop_raw
  anim: monta os 9 quadros (3 intermediários + f_2..f_7, pistola nos quadros de GUN_FIX) e grava assets/player/<kind>_east/, a sheet e o GIF.
"""
import os
import sys
import numpy as np
from sprite_lib import load, remap, palette_of, ground, fill_holes, drop_islands, contact, cm, save_anim, report

P = 'assets/player'
BASE = load(f'{P}/player_base_east.png')
BASE_GUN = load(f'{P}/player_base_gun_east.png')
JACKET = (50, 51, 56)
HEAD_TOP, HEAD_CHIN = 15, 37     # linhas da cabeça na base (topo do cabelo e queixo)
HEAD_X = (50, 72)                # colunas da cabeça na base
NECK_ROW = 32                    # daqui para baixo só entra o que não é gola da jaqueta
NECK_X0 = 55
THROAT_X1 = 65                   # frente do pescoço abaixo do queixo
FACE_X1 = 70                     # frente do queixo na base
SKIN_HAIR = [(35, 23, 18), (133, 67, 19), (186, 107, 78), (236, 159, 122)]
OUTLINE = [(3, 3, 4), (0, 0, 0)]
GUN_GRAY = [(122, 129, 141), (187, 192, 197), (242, 245, 247)]
PISTOL_BOX = (46, 52, 81, 100)   # ferrolho e cano no keyframe do run_gun (y0, y1, x0, x1)
# quadros do run_gun (animação seed 77) em que a IA escondeu a pistola atrás do peito:
# (dy, dx) da pistola do key até o punho erguido
GUN_FIX = {4: (-6, 4), 5: (-6, 4)}
FRAME_MS = 72                    # 9 quadros: ciclo de cerca de 650 ms


def head_mask():
    """Máscara da cabeça na base: cabelo, rosto e pescoço, sem a gola."""
    m = BASE[:, :, 3] > 0
    hm = np.zeros(m.shape, bool)
    x0, x1 = HEAD_X
    hm[HEAD_TOP:NECK_ROW, x0:x1] = m[HEAD_TOP:NECK_ROW, x0:x1]
    neck = m[NECK_ROW:HEAD_CHIN + 1, NECK_X0:x1] & ~(BASE[NECK_ROW:HEAD_CHIN + 1, NECK_X0:x1, :3] == JACKET).all(2)
    hm[NECK_ROW:HEAD_CHIN + 1, NECK_X0:x1] = neck
    hm[NECK_ROW + 1:HEAD_CHIN + 1, THROAT_X1:] = False   # gola à frente do pescoço fica de fora
    return hm


def top_of_head(a):
    """(linha do topo, centro x do topo) do primeiro trecho opaco da figura."""
    op = a[:, :, 3] > 0
    y = np.where(op.any(1))[0].min()
    xs = np.where(op[y])[0]
    return y, (xs.min() + xs.max()) / 2


def head_offset(a, hm, search=3):
    """(dy, dx) que leva a cabeça da base ao topo do cabelo da IA, refinado pelo melhor encaixe da cabeça inteira."""
    by, bx = top_of_head(np.where(hm[:, :, None], BASE, 0))
    ay, ax = top_of_head(a)
    gy, gx = int(ay - by), int(round(ax - bx))
    ys, xs = np.nonzero(hm)
    ref = BASE[ys, xs, :3].astype(int)
    best = None
    for dy in range(gy - search, gy + search + 1):
        for dx in range(gx - search, gx + search + 1):
            win = a[ys + dy, xs + dx]
            d = ((np.abs(win[:, :3].astype(int) - ref).sum(1) > 0) | (win[:, 3] == 0)).sum()
            if best is None or d < best[0]:
                best = (d, dy, dx)
    return best[1], best[2]


def put_head(a, hm, off=None):
    """Apaga a cabeça da IA e cola a da base, alinhando o topo do cabelo (ou em off)."""
    ay, ax = top_of_head(a)
    dy, dx = off or head_offset(a, hm)
    o = a.copy()
    x0, x1 = HEAD_X[0] + dx - 4, FACE_X1 + dx + 2
    y1 = HEAD_CHIN + dy + 2
    gone = ai_head(o, (int(ay), int(ax)), (x0, x1, y1))
    o[gone] = 0
    ys, xs = np.nonzero(hm)
    o[ys + dy, xs + dx] = BASE[ys, xs]
    pasted = np.zeros(gone.shape, bool)
    pasted[ys + dy, xs + dx] = True
    # contorno da cabeça da IA que ficou solto (encostado no que saiu, longe da jaqueta)
    op = o[:, :, 3] > 0
    jk = cm(o, [JACKET])
    for y, x in zip(*np.nonzero(op & ~pasted)):
        if not (x0 <= x < x1 and y < y1) or tuple(o[y, x, :3]) not in OUTLINE:
            continue
        nb = [(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)]
        if sum(gone[p] and not pasted[p] for p in nb) >= 2 and not any(jk[p] for p in nb):
            o[y, x] = 0
    fill_holes(o, (HEAD_TOP + dy, y1 + 2, x0, x1))
    close_gaps(o, (HEAD_TOP + dy, y1 + 4, x0, x1 + 6))
    return o, (dy, dx)


def close_gaps(a, region):
    """Vazio cercado pela figura (sem saída para a borda) dentro de region vira jaqueta."""
    y0, y1, x0, x1 = region
    empty = a[:, :, 3] == 0
    out = np.zeros(empty.shape, bool)
    H, W = empty.shape
    stack = [(y, x) for y in range(H) for x in (0, W - 1) if empty[y, x]]
    stack += [(y, x) for x in range(W) for y in (0, H - 1) if empty[y, x]]
    for p in stack:
        out[p] = True
    while stack:
        y, x = stack.pop()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < H and 0 <= nx < W and empty[ny, nx] and not out[ny, nx]:
                out[ny, nx] = True
                stack.append((ny, nx))
    hole = empty & ~out
    hole[:y0] = False
    hole[y1:] = False
    hole[:, :x0] = False
    hole[:, x1:] = False
    a[hole, :3] = JACKET
    a[hole, 3] = 255


def ai_head(a, seed, box):
    """Cabelo e pele ligados ao topo da cabeça da IA (inundação), dentro de box = (x0, x1, y1)."""
    x0, x1, y1 = box
    ok = cm(a, SKIN_HAIR)
    out = np.zeros(ok.shape, bool)
    sy, sx = seed
    starts = [(y, x) for y in range(sy, sy + 4) for x in range(sx - 4, sx + 5) if ok[y, x]]
    stack = list(starts)
    for p in starts:
        out[p] = True
    while stack:
        y, x = stack.pop()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if x0 <= nx < x1 and 0 <= ny < y1 and ok[ny, nx] and not out[ny, nx]:
                out[ny, nx] = True
                stack.append((ny, nx))
    return out


def add_pistol(a, key, off):
    """Cola a pistola do key no punho erguido, por trás dos dedos, e apaga o caco cinza que a IA deixou na gola."""
    dy, dx = off
    o = a.copy()
    ghost = np.zeros(a.shape[:2], bool)
    ghost[43:51, 77:85] = True
    o[ghost & cm(o, GUN_GRAY), :3] = JACKET
    fist = cm(o, SKIN_HAIR)
    fist[:42] = False
    fist[:, :80] = False
    near = fist.copy()   # punho e o contorno dele ficam por cima da arma
    near[1:] |= fist[:-1]
    near[:-1] |= fist[1:]
    near[:, 1:] |= fist[:, :-1]
    near[:, :-1] |= fist[:, 1:]
    y0, y1, x0, x1 = PISTOL_BOX
    pm = np.zeros(a.shape[:2], bool)
    pm[y0:y1, x0:x1] = True
    pm &= (key[:, :, 3] > 0) & ~cm(key, SKIN_HAIR)
    ys, xs = np.nonzero(pm)
    ok = ~near[ys + dy, xs + dx]
    o[ys[ok] + dy, xs[ok] + dx] = key[ys[ok], xs[ok]]
    return o


def prep(a, pal):
    a = remap(a, pal)
    drop_islands(a)
    return a


def clean(a, pal, floor, hm, off=None):
    a, off = put_head(prep(a, pal), hm, off)
    return ground(a, floor), off


def anim(src, kind):
    """src: quadros crus f_0.png ... f_8.png do animate_image (0 = keyframe, 8 = volta ao 0) e tween_1..3.png.

    Os quadros 0 e 1 saíam com a cabeça da base colada (o key e a cópia dele) e ficavam com recorte
    visível no pescoço (usuário, 12/10/2026). Eles foram trocados por três intermediários gerados com
    animate_image do quadro 7 ao 2 (tween_1..3.png): ciclo de 9 quadros, cabeça sempre desenhada pela IA.
    Só remapeia para a paleta, cola a pistola onde ela sumiu (GUN_FIX) e aterra.
    """
    pal, floor = (palette_of(BASE), 120) if kind == 'run' else (palette_of(BASE_GUN), 121)
    key = load(f'{P}/drafts/{kind}_key_east.png')
    raw = {i: prep(load(f'{src}/f_{i}.png'), pal) for i in range(2, 8)}
    if kind == 'run_gun':
        raw = {i: add_pistol(f, key, GUN_FIX[i]) if i in GUN_FIX else f for i, f in raw.items()}
    tween = [prep(load(f'{src}/tween_{i}.png'), pal) for i in range(1, 4)]
    frames = [ground(f, floor) for f in tween + [raw[i] for i in range(2, 8)]]
    name = f'{kind}_east'
    save_anim(frames, f'{P}/{name}', name, f'{P}/player_{name}_sheet.png', f'{P}/player_{name}.gif', FRAME_MS)
    report(name, frames, floor, [tuple(c) for c in pal])
    return frames


def stop(src):
    """Parada da corrida armada (run_gun_stop_east): animate_image do quadro 7 do run_gun ao idle_gun_00,
    4 quadros (src/f_0..f_4.png). Usa os intermediários 1 a 3; o 4 é o próprio idle_gun, que vem depois no jogo.
    A versão de 6 quadros trocava a pistola de mão no meio e foi descartada."""
    pal = palette_of(BASE_GUN)
    frames = [ground(prep(load(f'{src}/f_{i}.png'), pal), 121) for i in range(1, 4)]
    name = 'run_gun_stop_east'
    save_anim(frames, f'{P}/{name}', name, f'{P}/player_{name}_sheet.png', f'{P}/player_{name}.gif', 80)
    report(name, frames, 121, [tuple(c) for c in pal])


def keys(src, out):
    """Só para gerar keyframes novos: os aprovados (drafts/*_key_east.png) não são refeitos."""
    os.makedirs(out, exist_ok=True)
    if os.path.exists(f'{out}/run_key_east.png'):
        sys.exit(f'{out} já tem keyframes aprovados; use outra pasta de saída')
    hm = head_mask()
    run, o1 = clean(load(f'{src}/run_key_raw.png'), palette_of(BASE), 120, hm)
    gun, o2 = clean(load(f'{src}/run_gun_key_raw.png'), palette_of(BASE_GUN), 121, hm)
    from PIL import Image
    Image.fromarray(run).save(f'{out}/run_key_east.png')
    Image.fromarray(gun).save(f'{out}/run_gun_key_east.png')
    contact([[BASE, run, BASE_GUN, gun]], f'{out}/run_keys_compare.png', scale=4)
    for n, f, o in (('run', run, o1), ('run_gun', gun, o2)):
        op = f[:, :, 3] > 0
        print(n, 'cabeça em', o, 'chão', np.where(op.any(1))[0].max(), 'cores', len(palette_of(f)))


if __name__ == '__main__':
    if sys.argv[1] == 'keys':
        keys(sys.argv[2], sys.argv[3])
    elif sys.argv[1] == 'anim':
        anim(sys.argv[2], sys.argv[3])
    elif sys.argv[1] == 'stop':
        stop(sys.argv[2])
