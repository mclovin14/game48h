"""Funções compartilhadas para montar sprites 128x128 (Kael e inimigos).

Tudo trabalha com arrays RGBA uint8 (H, W, 4). Nada aqui tem caminho fixo.
"""
import os
import json
import numpy as np
from PIL import Image

LUMA = np.array([0.3, 0.59, 0.11])
RED, DRED = (176, 32, 36), (110, 16, 24)


# ---------- arquivo ----------

def load(path):
    return np.array(Image.open(path).convert('RGBA'))


def load_frames(folder, name):
    files = sorted(f for f in os.listdir(folder) if f.startswith(name) and f.endswith('.png'))
    return [load(os.path.join(folder, f)) for f in files]


def save_anim(frames, folder, name, sheet_path=None, gif_path=None, durations=90):
    """Salva <folder>/<name>_NN.png, a sheet horizontal e um GIF de prévia (fundo branco, 3x)."""
    os.makedirs(folder, exist_ok=True)
    imgs = [Image.fromarray(f, 'RGBA') for f in frames]
    for k, im in enumerate(imgs):
        im.save(os.path.join(folder, f'{name}_{k:02d}.png'))
    if sheet_path:
        sheet = Image.new('RGBA', (128 * len(imgs), 128))
        for k, im in enumerate(imgs):
            sheet.paste(im, (128 * k, 0))
        sheet.save(sheet_path)
    if gif_path:
        gl = []
        for im in imgs:
            b = Image.new('RGBA', im.size, (255, 255, 255, 255))
            b.alpha_composite(im)
            gl.append(b.convert('RGB').resize((384, 384), Image.NEAREST))
        gl[0].save(gif_path, save_all=True, append_images=gl[1:], duration=durations, loop=0)


def contact(rows, path, crop=None, scale=2):
    """rows: lista de listas de quadros. Gera uma folha ampliada com fundo branco para conferência."""
    x0, y0, x1, y1 = crop or (0, 0, 128, 128)
    w, h = x1 - x0, y1 - y0
    n = max(len(r) for r in rows)
    c = Image.new('RGBA', (w * n, h * len(rows)), (255, 255, 255, 255))
    for j, r in enumerate(rows):
        for i, f in enumerate(r):
            c.alpha_composite(Image.fromarray(f).crop((x0, y0, x1, y1)), (w * i, h * j))
    c.resize((c.width * scale, c.height * scale), Image.NEAREST).save(path)


# ---------- paleta ----------

def palette_of(a):
    return np.unique(a[a[:, :, 3] > 0][:, :3], axis=0)


def load_palette(path):
    """palette_master.json: {"material": [[r,g,b], ...], ...} -> (array Nx3, dict material->lista)."""
    ramps = json.load(open(path))
    cols = [tuple(c) for k in ramps for c in ramps[k]]
    return np.array(cols, float), ramps


def remap(a, pal, keep_blood=False):
    """Snap para a cor mais próxima da paleta (distância com peso de luminância). Alfa vira 0/255."""
    pal = np.asarray(pal, float)
    if keep_blood:
        pal = np.vstack([pal, [RED, DRED]])
    m = a[:, :, 3] > 127
    f = a[:, :, :3].astype(float)
    idx = (((f[:, :, None] - pal[None, None]) ** 2) * LUMA).sum(3).argmin(2)
    if keep_blood:   # vermelho saturado da IA vira sempre sangue, nunca cabelo/pele
        red = (f[:, :, 0] > 165) & (f[:, :, 1] < 70) & (f[:, :, 2] < 70) & (f[:, :, 0] > f[:, :, 1] * 3)
        idx[red] = len(pal) - 2
    o = np.zeros_like(a)
    o[:, :, :3] = pal[idx].astype(np.uint8)
    o[:, :, 3] = m * 255
    o[~m] = 0
    return o


def cm(a, cols):
    """Máscara dos pixels opacos com cor exatamente em cols."""
    m = np.zeros(a.shape[:2], bool)
    for c in cols:
        m |= (a[:, :, :3] == tuple(c)).all(2)
    return m & (a[:, :, 3] > 0)


def swap_colors(a, mapping):
    """mapping: {(r,g,b): (r,g,b)}. Troca exata, sem afetar outras cores."""
    o = a.copy()
    for src, dst in mapping.items():
        o[cm(a, [src]), :3] = dst
    return o


# ---------- geometria ----------

def ground(a, floor):
    """Desloca o quadro na vertical para o pixel mais baixo ficar em y=floor."""
    g = floor - np.where(a[:, :, 3] > 0)[0].max()
    return np.roll(a, g, axis=0) if g else a


def locate(a, ref, box, rows=10, search=5):
    """Acha (dy, dx) em que o topo da cabeça de ref (box = y0,y1,x0,x1) mais bate em a."""
    y0, y1, x0, x1 = box
    best = None
    tgt = ref[y0:y0 + rows, x0:x1].astype(int)
    for dy in range(-search, search + 1):
        for dx in range(-search, search + 1):
            win = a[y0 + dy:y0 + dy + rows, x0 + dx:x1 + dx].astype(int)
            if win.shape != tgt.shape:
                continue
            d = (np.abs(win - tgt).sum(2) > 0).sum()
            if best is None or d < best[0]:
                best = (d, dy, dx)
    return best[1], best[2]


def smooth_path(offs, start=None, end=None):
    """Limita a 1 px por quadro a variação dos offsets (dy, dx), indo e voltando, com âncoras opcionais."""
    p = [tuple(o) for o in offs]
    if start is not None:
        p[0] = tuple(start)
    if end is not None:
        p[-1] = tuple(end)
    for j in range(1, len(p)):
        p[j] = tuple(int(np.clip(p[j][t], p[j - 1][t] - 1, p[j - 1][t] + 1)) for t in (0, 1))
    for j in range(len(p) - 2, -1, -1):
        p[j] = tuple(int(np.clip(p[j][t], p[j + 1][t] - 1, p[j + 1][t] + 1)) for t in (0, 1))
    return p


def fill_holes(a, region, passes=3):
    """Fecha buracos (vazio com 3+ vizinhos) e tira pixel solto (opaco com <=1 vizinho) em region=(y0,y1,x0,x1)."""
    y0, y1, x0, x1 = region
    for _ in range(passes):
        op = a[:, :, 3] > 0
        b = a.copy()
        for y in range(max(y0, 1), min(y1, a.shape[0] - 1)):
            for x in range(max(x0, 1), min(x1, a.shape[1] - 1)):
                n = [p for p in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)) if op[p]]
                if not op[y, x] and len(n) >= 3:
                    cols = [tuple(a[p][:3]) for p in n]
                    b[y, x, :3] = max(set(cols), key=cols.count)
                    b[y, x, 3] = 255
                elif op[y, x] and len(n) <= 1:
                    b[y, x] = 0
        a[:] = b


def drop_islands(a, min_size=4):
    """Remove fragmentos soltos (componentes conexos com menos de min_size pixels)."""
    op = a[:, :, 3] > 0
    seen = np.zeros_like(op)
    H, W = op.shape
    for sy, sx in zip(*np.nonzero(op)):
        if seen[sy, sx]:
            continue
        comp, stack = [], [(sy, sx)]
        seen[sy, sx] = True
        while stack:
            y, x = stack.pop()
            comp.append((y, x))
            for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if 0 <= ny < H and 0 <= nx < W and op[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    stack.append((ny, nx))
        if len(comp) < min_size:
            for y, x in comp:
                a[y, x] = 0


def paste_head(a, head, hm, box, dy, dx, clear_cols, chin_row, keep_cols=()):
    """Cola a cabeça (head recortada de box, máscara hm) em a, deslocada (dy, dx).

    Apaga antes, só acima de chin_row (relativo), as cores clear_cols da cabeça gerada pela IA.
    keep_cols: cores do corpo da IA (gola, ombro) que voltam por cima abaixo do queixo.
    """
    y0, y1, x0, x1 = box
    reg = a[y0 + dy:y1 + dy, x0 + dx:x1 + dx]
    keep = reg.copy()
    clr = cm(reg, clear_cols) & ~hm
    clr[chin_row:] = False
    reg[clr] = 0
    reg[hm] = head[hm]
    if keep_cols:
        sh = cm(keep, keep_cols)
        sh[:chin_row] = False
        reg[sh] = keep[sh]
    fill_holes(a, (y0 + dy - 2, y1 + dy + 4, x0 + dx - 4, x1 + dx + 6))


# ---------- efeitos ----------

def copy_blood(dst, src):
    """Reaplica em dst o sangue (RED/DRED) de src, só onde dst é opaco. Mesma pose nos dois."""
    m = cm(src, [RED, DRED]) & (dst[:, :, 3] > 0)
    o = dst.copy()
    o[m] = src[m]
    return o


# ---------- conferência ----------

def report(name, frames, floor, allowed=None):
    """Imprime linha do chão e contagem de cores; avisa sobre cores fora de allowed."""
    floors = {int(np.where(f[:, :, 3] > 0)[0].max()) for f in frames}
    cols = {tuple(c) for f in frames for c in palette_of(f)}
    extra = sorted(cols - {tuple(c) for c in allowed}) if allowed is not None else []
    ok = floors == {floor} and not extra
    print(f'{"OK " if ok else "!! "}{name}: {len(frames)} quadros, chão {sorted(floors)}, {len(cols)} cores'
          + (f', fora da paleta: {extra}' if extra else ''))
    return ok
