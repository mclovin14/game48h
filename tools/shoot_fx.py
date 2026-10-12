"""Tiro procedural a partir da pose final de mira (128x128, virado para East).

Recuo (braço e arma sobem e voltam, cabeça recua 1 px), flash no cano, luz quente do flash
no rosto e na roupa, traçante da bala e fumaça. Gera 8 quadros.
"""
import numpy as np

C, Y, O = (255, 250, 220), (255, 214, 90), (240, 130, 40)
FLASH_BIG = ["....O......",
             "...OY..O...",
             ".OYYCYOYO..",
             "OYCCCCCYYYO",
             ".OYYCYOYO..",
             "...OY..O...",
             "....O......"]
FLASH_SMALL = [".OY.O",
               "YCCYO",
               ".OY.O"]
SMOKE = [["wg.", "gwg", ".g."],
         [".gw.", "gwwg", ".gg."],
         [".g.g", "g.w.", ".g.."],
         ["g..", "..g"]]
SMOKE_G, SMOKE_W = (187, 192, 197), (242, 245, 247)
#        lift kick head flash    luz          bala  fumaça
SCHED = [(1, 1, 0, 'big', (44, 3, 9), None, None),
         (3, 2, -1, 'small', (30, 1, 0), 0, None),
         (3, 1, -1, None, 0, 1, 0),
         (2, 1, -1, None, 0, None, 1),
         (1, 0, 0, None, 0, None, 2),
         (1, 0, 0, None, 0, None, 3),
         (0, 0, 0, None, 0, None, None),
         (0, 0, 0, None, 0, None, None)]
DURATIONS = [60, 60, 70, 80, 90, 90, 110, 160]


def lit_map(ramps, skip=('outline',)):
    """Cada cor sobe um degrau na própria rampa (ordenada por luminância) e ganha um tom quente.
    A cor mais clara de cada rampa vai para um realce quente."""
    out = {}
    for name, cols in ramps.items():
        if name in skip:
            continue
        cols = sorted((tuple(c) for c in cols), key=lambda c: 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2])
        for i, c in enumerate(cols):
            up = cols[i + 1] if i + 1 < len(cols) else tuple(min(255, v + 40) for v in c)
            out[c] = (min(255, up[0] + 24), min(255, up[1] + 14), max(0, up[2] - 8))
    return out


def shoot_frames(aim, lit, muzzle=(98, 31), arm_x=68, arm_rows=(26, 52), head_box=(13, 33, 46, 72),
                 collar_rows=(34, 36)):
    """aim: pose final da mira (RGBA). lit: {cor: cor iluminada}. Devolve 8 quadros."""
    A = aim
    H, W = A.shape[:2]
    MX, MY = muzzle
    hy0, hy1, hx0, hx1 = head_box
    yy, xx = np.mgrid[0:H, 0:W]
    op = A[:, :, 3] > 0
    arm = op & (yy >= arm_rows[0]) & (yy <= arm_rows[1]) & (xx >= arm_x) & ~((yy <= hy1) & (xx <= hx1))
    head = op & (yy >= hy0) & (yy <= hy1) & (xx >= hx0) & (xx <= hx1)

    def put(a, x, y, c):
        if 0 <= x < W and 0 <= y < H:
            a[y, x] = (*c, 255)

    def stamp(a, pat, x0, y0, cmap):
        for j, row in enumerate(pat):
            for i, ch in enumerate(row):
                if ch in cmap:
                    put(a, x0 + i, y0 + j, cmap[ch])

    def frame(L, kb, hd, flash, light, bullet, smoke):
        out = A.copy()
        lift = np.round(L * np.clip((xx - arm_x) / 12, 0, 1)).astype(int)
        kick = np.where(xx >= arm_x + 8, kb, 0)
        out[arm] = 0
        ys, xs = np.where(arm)
        for y, x in sorted(zip(ys, xs), key=lambda p: p[1]):
            out[y - lift[y, x], x - kick[y, x]] = A[y, x]
        if hd:
            hy, hx = np.where(head)
            for y, x in zip(hy, hx):
                if not arm[y, x]:
                    out[y, x] = 0
            for y, x in sorted(zip(hy, hx), key=lambda p: p[1]):
                out[y, x + hd] = A[y, x]
            c0, c1 = collar_rows
            out[c0:c1, :arm_x] = np.where(out[c0:c1, :arm_x, 3:] > 0, out[c0:c1, :arm_x], A[c0:c1, :arm_x])
        mx, my = MX - kb, MY - L
        if light:
            d = np.hypot(xx - mx, yy - my)
            r, rim, glow = light
            o = out[:, :, 3] > 0
            face = np.zeros_like(o)
            for i in range(1, rim + 1):
                face |= o & ~np.roll(o, -i, axis=1)
            m0 = face & (d < r) | (d < glow) & o
            src = out.copy()
            for c, dst in lit.items():
                m = (src[:, :, :3] == c).all(2) & m0
                out[m, :3] = dst
        if flash == 'big':
            stamp(out, FLASH_BIG, mx, my - 3, {'C': C, 'Y': Y, 'O': O})
        if flash == 'small':
            stamp(out, FLASH_SMALL, mx, my - 1, {'C': C, 'Y': Y, 'O': O})
        if bullet is not None:
            x0 = MX + 8 + bullet * 13
            for i, c in enumerate([O, Y, Y, C, C, C]):
                put(out, x0 + i, MY, c)
        if smoke is not None:
            stamp(out, SMOKE[smoke], mx + 1 + smoke, my - 2 - 2 * smoke, {'g': SMOKE_G, 'w': SMOKE_W})
        return out

    return [frame(*s) for s in SCHED]
