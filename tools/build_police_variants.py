"""Monta as variantes do policial (police_a/b/c) a partir do master, sem chamar o PixelLab.

Por quadro:
  1. troca a pele (1:1 pela ordem de luz) e o cabelo do master pelos da variante (mãos, pescoço, nuca);
  2. se o rosto do quadro é o perfil da base (idle, walk, hurt, fim do aim, shoot, início do death),
     cola o rosto da variante no lugar achado por locate() no quepe;
  3. senão (cabeça inclinada ou caída), fica só a troca de cor.

Uso: PYTHONPATH=tools python3 tools/build_police_variants.py [police_a ...]   (sem argumento: todas)
Saída: assets/enemies/police/<id>/<anim>_east/ + sheets e GIFs; heads/<id>_head.png.
"""
import json
import os
import sys

from sprite_lib import (load, load_frames, load_palette, remap, drop_islands, cm, swap_colors, fill_holes,
                        locate, save_anim, report, contact, RED, DRED, np)
from build_police_master import DEATH_DUR, HURT_DUR, KO_DUR, GIF_DUR, GUN_FLOOR, DEATH_FLOOR
from shoot_fx import shoot_frames, lit_map, DURATIONS as SHOOT_DUR

POLICE = os.path.join(os.path.dirname(__file__), '..', 'assets', 'enemies', 'police')
MASTER = os.path.join(POLICE, 'master')

# cabeça na base, em faixas (y0, y1, x0, x1): do topo do quepe ao queixo. Começa depois da
# pistola (atrás da nuca) e, embaixo, depois da mão, para não colar arma nem dedo da IA
HEAD = [(6, 29, 51, 84), (29, 41, 55, 70)]   # embaixo para em x=70: queixo vai até 66, a mão estendida vem depois
# faixa do quepe e da testa usada para achar a cabeça no quadro (pelo contorno, sem o metal)
FIND = (6, 30, 48, 82)
SEARCH = 7
# encaixe mínimo do contorno (IoU) para considerar a cabeça em pé e colar o rosto
FIT_MIN = 0.70
# quedas: só os primeiros quadros têm a cabeça em pé (depois ela inclina e o encaixe engana)
STANDING = {'death_east': 4, 'knockout_east': 1}
# quepe na base do master: copa e faixa (linhas y0..y1) e aba (linhas y0..y1, de x0 para a frente)
CAP_ROWS = (13, 22)
# íris do master (azul-marinho da farda); a variante com 'eye' no variants.json troca por essa cor
IRIS = (34, 50, 95)
CAP_BRIM = (22, 25, 59)
# aim 0-3: a mão e a pistola passam na frente do rosto; cola a cabeça e põe as mãos de volta por cima
HANDS_FRONT = {'aim_gun_east': {0, 1, 2, 3}}
ANIMS = {
    'idle_gun_east': (GUN_FLOOR, GIF_DUR['idle_gun_east']),
    'walk_gun_east': (GUN_FLOOR, GIF_DUR['walk_gun_east']),
    'aim_gun_east': (GUN_FLOOR, GIF_DUR['aim_gun_east']),
    'shoot_gun_east': (GUN_FLOOR, SHOOT_DUR),
    'hurt_east': (GUN_FLOOR, HURT_DUR),
    'death_east': (DEATH_FLOOR, DEATH_DUR),
    'knockout_east': (None, KO_DUR),
}

pal, ramps = load_palette(os.path.join(POLICE, 'palette_master.json'))
FIXED = [c for k in ramps if k not in ('skin', 'hair') for c in ramps[k]]


def variant_palette(v):
    return FIXED + v['skin'] + v['hair'] + v.get('eye', [])


def usage(a, cols, region):
    """Fração de cada tom de cols dentro da região (ordem de cols)."""
    n = np.array([(cm(a, [c]) & region).sum() for c in cols], float)
    return n / max(n.sum(), 1)


def skin_index(f, skin, region=None):
    """Tom médio da pele (0 = mais claro); None se não há pele."""
    u = usage(f, skin, np.ones(f.shape[:2], bool) if region is None else region)
    return float((u * np.arange(len(skin))).sum()) if u.sum() else None


def head_zone(a, standing, base):
    """Onde o cabelo pode estar. O master usa a cor do cabelo também nos sapatos e no coldre:
    fora desta zona ela fica como está (marrom do master)."""
    if standing:
        _, dy, dx = find_head(a, base)
        return grow(np.logical_or(*head_region(dy, dx)), 4)
    from scipy.ndimage import label
    lab, n = label(cm(a, ramps['skin']))
    if not n:
        return np.zeros(a.shape[:2], bool)
    big = 1 + int(np.argmax([(lab == k).sum() for k in range(1, n + 1)]))   # o rosto: maior mancha de pele
    return grow(lab == big, 8)


def hair_shadow(f, a, v, zone):
    """Quadro sem colagem (cabeça caída): o master desenha o cabelo com cinco tons, dois deles da pele
    (brilho castanho). Acha o cabelo pela forma (manchas ligadas ao cabelo, longe da aba e da pele clara)
    e põe tons fixos da variante: brilho, principal e sombra."""
    H, dk, br = ramps['hair'], ramps['dark'], ramps['skin'][2:]   # br: (139,68,29) e (102,60,33)
    gray = ramps['metal'][:1]   # o master caído também pinta mechas com o cinza mais escuro
    light = cm(a, ramps['skin'][:2])
    # o cabelo é a maior mancha (ligada pelos lados) de tons de cabelo: o contorno a separa da aba, que
    # no master caído também usa esses tons, e de mãos e golas soltas
    from scipy.ndimage import label
    cand = zone & (cm(a, H + dk + gray + br[1:]) | (cm(a, br[:1]) & ~grow(light)))
    lab, n = label(cand)
    if not n:
        return
    hair = lab == np.argmax(np.bincount(lab.ravel())[1:]) + 1
    stray = zone & cm(a, H) & ~hair   # castanho do cabelo fora da mancha: sombra da aba
    f[stray] = (*dk[1], 255)
    # tons da variante pela luz: o principal, o vizinho mais claro (brilho) e o mais escuro (sombra)
    lit = sorted(v['hair'], key=sum, reverse=True)
    k = lit.index(v['hair'][v['hair_swap']])
    main, hi = lit[k], lit[max(k - 1, 0)] if k > 0 else (lit[k + 1] if k + 1 < len(lit) else lit[k])
    lo = lit[k + 1] if k + 1 < len(lit) and k > 0 else None
    for cols, t in ((br, hi), (H + dk[1:] + gray, main), (dk[:1], lo)):
        m = hair & cm(a, cols)
        if t is None:
            f[m] = a[m]   # cabelo preto: a sombra fica a do master
        else:
            f[m] = (*t, 255)


def face_match(f, face, target, skin):
    """Rosto sem colagem com as cores do rosto colado (o do fim do aim): os pixels do rosto, do mais claro
    ao mais escuro no master (o tom, mais o contorno encostado), recebem os tons da variante na mesma
    proporção do rosto colado."""
    g = f.copy()
    ys, xs = np.nonzero(face)
    tone = np.zeros(face.shape)
    for i, c in enumerate(ramps['skin']):
        tone[cm(f, [c])] = i
    dark = cm(f, ramps['outline'] + ramps['dark'] + ramps['hair']).astype(float)
    nb = np.zeros(face.shape)
    nb[1:] += dark[:-1]; nb[:-1] += dark[1:]; nb[:, 1:] += dark[:, :-1]; nb[:, :-1] += dark[:, 1:]
    order = np.argsort(tone[ys, xs] + nb[ys, xs] / 8, kind='stable')
    bounds = np.round(np.cumsum(target) * len(order)).astype(int)
    k = 0
    for j, b in enumerate(bounds):
        sel = order[k:b]
        g[ys[sel], xs[sel], :3] = skin[j]
        k = b
    return g


def face_mapping(v, head, a, region=None, target=None):
    """Pele do master sem colagem: o mapa em ordem (3+ tons) com o tom médio mais perto do alvo
    (padrão: o rosto colado, na faixa do rosto)."""
    from itertools import combinations_with_replacement
    face = head_region(0, 0)[0]
    n = len(v['skin'])
    if region is None:
        region, target = face, skin_index(head, v['skin'], face)
    mu = usage(a, ramps['skin'], region)
    best = min((js for js in combinations_with_replacement(range(n), len(mu)) if len(set(js)) >= 3),
               key=lambda js: abs((mu * np.array(js)).sum() - target))
    m = {tuple(c): tuple(v['skin'][j]) for c, j in zip(ramps['skin'], best)}
    m[tuple(ramps['hair'][0])] = tuple(v['hair'][v['hair_swap']])
    return m


def mapping(v, head, base):
    """Pele por proporção de uso: cada tom do master vai para o tom da variante que ocupa a mesma
    fatia no rosto (o master usa mais os claros; a cabeça aprovada pode usar mais os escuros)."""
    face = head_region(0, 0)[0]
    mu = np.cumsum(usage(base, ramps['skin'], face))
    vu = np.cumsum(usage(head, v['skin'], face))
    m, last = {}, -1
    for i, c in enumerate(ramps['skin']):
        mid = mu[i] - (mu[i] - (mu[i - 1] if i else 0)) / 2
        # tons diferentes no master continuam diferentes (senão a sombra some), até acabar a rampa
        j = min(max(int(np.searchsorted(vu, mid)), last + 1), len(v['skin']) - 1)
        m[tuple(c)] = tuple(v['skin'][j])
        last = j
    m[tuple(ramps['hair'][0])] = tuple(v['hair'][v['hair_swap']])
    return m


def shade_skin(f, region, skin):
    """Sombra embaixo da pele trocada (mão, pescoço): o pixel com contorno ou farda logo abaixo
    desce um tom. O rosto colado não entra (já vem sombreado)."""
    tone = {tuple(c): i for i, c in enumerate(skin)}
    is_skin = cm(f, skin)
    below = np.zeros_like(is_skin)
    below[:-1] = ~is_skin[1:] & (f[1:, :, 3] > 0)
    for y, x in zip(*np.nonzero(region & is_skin & below)):
        i = tone[tuple(f[y, x, :3])]
        f[y, x, :3] = skin[min(i + 1, len(skin) - 1)]


def build_head(v):
    """Cabeça da variante (quepe e rosto) na paleta da variante, e a máscara do que é colado."""
    head = remap(load(os.path.join(POLICE, v['head'])), variant_palette(v))
    drop_islands(head, 3)
    base = load(os.path.join(MASTER, 'police_master_base_east.png'))
    top, low = head_region(0, 0)
    mask = top & (head[:, :, 3] > 0) & ~cm(head, ramps['metal'])
    mask |= low & face_pixels(head, v['skin'] + v['hair'], eyes=False)
    hidden = top & cm(head, ramps['metal'])   # nuca escondida pela pistola na cabeça da IA
    # quepe igual nas três: a IA tirou a aba (e na c, metade da copa) e pôs cabelo e testa no lugar
    cap = cap_mask(base) & top
    head[cap] = base[cap]
    mask |= cap
    hidden &= ~cap
    if 'eye' in v:
        # íris: o azul-marinho encostado no branco do olho, abaixo da aba
        iris = cm(head, [IRIS]) & grow(cm(head, ramps['white'])) & mask
        iris[:CAP_BRIM[1]] = False
        head[iris] = (*v['eye'][0], 255)
    # só a mancha da cabeça: tira pixels soltos (a ponta do distintivo na b)
    from scipy.ndimage import label
    lab, n = label(mask, structure=np.ones((3, 3)))
    if n > 1:
        mask &= lab == np.argmax(np.bincount(lab.ravel())[1:]) + 1
    return head, base, mask, hidden


def cap_mask(base):
    """Copa e faixa do quepe (linhas CAP_ROWS) e a aba preta logo abaixo, na frente (CAP_BRIM)."""
    m = np.zeros(base.shape[:2], bool)
    m[CAP_ROWS[0]:CAP_ROWS[1]] = base[CAP_ROWS[0]:CAP_ROWS[1], :, 3] > 0
    y0, y1, x0 = CAP_BRIM
    m[y0:y1, x0:] = cm(base, ramps['outline'] + ramps['dark'] + ramps['metal'])[y0:y1, x0:]
    return m


def grow(m, n=1):
    for _ in range(n):
        g = m.copy()
        g[1:] |= m[:-1]; g[:-1] |= m[1:]; g[:, 1:] |= m[:, :-1]; g[:, :-1] |= m[:, 1:]
        m = g
    return m


def face_pixels(a, cols, eyes=True):
    """Pele, cabelo (e olho), mais o contorno encostado neles (queixo, nariz)."""
    face = cm(a, cols + (ramps['white'] if eyes else []))
    return face | (grow(face) & cm(a, ramps['outline'] + ramps['dark']))


def head_region(dy, dx):
    """(quepe e testa, onde tudo é trocado; queixo, onde só o rosto é trocado e a farda fica)."""
    rs = []
    for y0, y1, x0, x1 in HEAD:
        r = np.zeros((128, 128), bool)
        r[max(y0 + dy, 0):y1 + dy, max(x0 + dx, 0):x1 + dx] = True
        rs.append(r)
    return rs


def silhouette(a):
    """Contorno sem o metal (a pistola muda de lugar), com borda para o deslocamento não sair do quadro."""
    return np.pad((a[:, :, 3] > 0) & ~cm(a, ramps['metal']), SEARCH)


def find_head(a, base):
    """(encaixe, dy, dx) em que o quepe e a testa do quadro mais cobrem os da base."""
    y0, y1, x0, x1 = (c + SEARCH for c in FIND)
    ref = silhouette(base)[y0:y1, x0:x1]
    s = silhouette(a)
    best = (0.0, 0, 0)
    for dy in range(-SEARCH, SEARCH + 1):
        for dx in range(-SEARCH, SEARCH + 1):
            w = s[y0 + dy:y1 + dy, x0 + dx:x1 + dx]
            fit = (w & ref).sum() / max((w | ref).sum(), 1)
            if fit > best[0]:
                best = (fit, dy, dx)
    return best


def paste_face(a, head, mask, hidden, base):
    """Cola a cabeça se ela está em pé. Devolve (quadro, offset ou None, encaixe)."""
    fit, dy, dx = find_head(a, base)
    if fit < FIT_MIN:
        return a, None, fit
    o = a.copy()
    top, low = head_region(dy, dx)
    # apaga a cabeça da IA (em cima, tudo menos a pistola; embaixo, só o rosto) e põe a da variante
    keep = np.zeros_like(top)
    hy, hx = np.nonzero(hidden)
    ok = (hy + dy >= 0) & (hy + dy < 128) & (hx + dx >= 0) & (hx + dx < 128)
    keep[hy[ok] + dy, hx[ok] + dx] = True   # sem cabeça para pôr ali: fica o pixel do quadro
    ys, xs = np.nonzero(mask)
    near = np.zeros_like(top)
    near[ys + dy, xs + dx] = True
    # só perto da cabeça nova: o cano da pistola e a beira do quepe do quadro ficam
    o[top & grow(near, 2) & ~keep & ~cm(a, ramps['metal'])] = 0
    o[low & cm(a, ramps['skin'] + ramps['hair'])] = 0   # o contorno da gola fica
    o[ys + dy, xs + dx] = head[ys, xs]
    y0, y1 = HEAD[0][0] + dy, HEAD[-1][1] + dy
    fill_holes(o, (y0, y1 + 1, HEAD[0][2] + dx - 1, HEAD[0][3] + dx + 1), passes=1)
    trim_nape(o, a, near)
    close_holes(o, a)
    o[ys + dy, xs + dx] = head[ys, xs]   # o rosto fica idêntico ao da cabeça aprovada
    return o, (dy, dx), fit


def hands_front(a, base, off):
    """Mãos e pistola do quadro na frente do rosto: manchas de pele que não são o rosto da base
    (deslocado pelo encaixe), com o contorno encostado nelas, mais o metal perto delas."""
    from scipy.ndimage import label
    dy, dx = off
    face = np.zeros((128, 128), bool)
    fy, fx = np.nonzero(cm(base, ramps['skin']))
    ok = (fy + dy >= 0) & (fy + dy < 128) & (fx + dx >= 0) & (fx + dx < 128)
    face[fy[ok] + dy, fx[ok] + dx] = True
    skin = cm(a, ramps['skin'])
    lab, n = label(skin)
    hands = np.zeros_like(skin)
    below = np.zeros_like(skin)
    below[max(CAP_BRIM[1] + dy, 0):] = True   # a insígnia do quepe usa as cores da pele: não é mão
    lab[~below] = 0
    for k in range(1, n + 1):
        part = lab == k
        if (part & face).sum() < part.sum() / 2:
            hands |= part
    near = grow(hands, 2)
    return hands | (grow(hands) & cm(a, ramps['outline'] + ramps['dark'])) | (near & cm(a, ramps['metal']))


def trim_nape(o, a, near):
    """Apaga o cabelo do master que sobra atrás da cabeça nova (mais curta na nuca)."""
    behind = np.zeros_like(near)
    for y in np.nonzero(near.any(1))[0]:
        behind[y, :np.nonzero(near[y])[0][0]] = True
    # as mechas do master usam a cor de cabelo e a rampa escura; longe da pistola
    hair = cm(a, ramps['hair'] + ramps['dark']) & behind & ~grow(cm(a, ramps['metal']), 2)
    if not hair.any():
        return
    cut = (hair | (grow(hair) & cm(a, ramps['outline'] + ramps['dark']))) & behind
    o[cut] = 0
    # onde o apagado encosta na farda ou na pele, fica 1 px de contorno
    body = (o[:, :, 3] > 0) & ~cm(o, ramps['outline'])
    o[cut & grow(body)] = (*ramps['outline'][0], 255)
    # ponta de contorno solta (1 vizinho só) atrás da nuca
    op = o[:, :, 3] > 0
    n = np.zeros(op.shape, int)
    n[1:] += op[:-1]; n[:-1] += op[1:]; n[:, 1:] += op[:, :-1]; n[:, :-1] += op[:, 1:]
    o[grow(cut) & behind & cm(o, ramps['outline']) & (n <= 1)] = 0


def close_holes(f, src, passes=3):
    """Fecha os furos (opaco no master, vazio cercado aqui) com a cor mais comum dos vizinhos."""
    for _ in range(passes):
        op = f[:, :, 3] > 0
        for y, x in zip(*np.nonzero((src[:, :, 3] > 0) & ~op)):
            nb = [(y + j, x + i) for j, i in ((-1, 0), (1, 0), (0, -1), (0, 1))
                  if 0 <= y + j < 128 and 0 <= x + i < 128 and op[y + j, x + i]]
            if len(nb) >= 3:
                cols = [tuple(f[p]) for p in nb]
                f[y, x] = max(set(cols), key=cols.count)


def inner_holes(src, f):
    """Pixels que eram opacos no master e viraram vazio cercado (3+ vizinhos opacos): furo, não contorno."""
    op = f[:, :, 3] > 0
    n = np.zeros(op.shape, int)
    n[1:] += op[:-1]; n[:-1] += op[1:]; n[:, 1:] += op[:, :-1]; n[:, :-1] += op[:, 1:]
    return int(((src[:, :, 3] > 0) & ~op & (n >= 3)).sum())


def build(vid, v):
    out = os.path.join(POLICE, vid)
    head, base, mask, hidden = build_head(v)
    os.makedirs(os.path.join(POLICE, 'heads'), exist_ok=True)
    hm = np.zeros_like(head)
    hm[mask] = head[mask]
    from PIL import Image
    Image.fromarray(hm).save(os.path.join(POLICE, 'heads', f'{vid}_head.png'))

    sw = mapping(v, head, base)
    print('   pele:', {k: sw[k] for k in map(tuple, ramps['skin'])})
    allowed = [list(c) for c in variant_palette(v) + ramps['hair']]   # marrom do master: sapatos e coldre
    face_ref = head[mask]
    old = ramps['skin'] + ramps['hair']
    previews = []
    for name, (floor, dur) in ANIMS.items():
        if name == 'shoot_gun_east':
            vr = dict(ramps, skin=v['skin'], hair=v['hair'])
            frames = shoot_frames(aim_last, lit_map(vr))
            save_anim(frames, os.path.join(out, name), name,
                      sheet_path=os.path.join(out, f'{vid}_{name}_sheet.png'),
                      gif_path=os.path.join(out, f'{vid}_{name}.gif'), durations=dur)
            report(f'{vid} {name}', frames, floor)
            print(f'   rosto: do aim 7 | pele do master sobrando: {sum(int(cm(f, ramps["skin"]).sum()) for f in frames)}')
            previews.append(frames)
            continue
        src = load_frames(os.path.join(MASTER, name), name)
        frames, log, left = [], [], 0
        for i, a in enumerate(src):
            zone = head_zone(a, i < STANDING.get(name, len(src)), base)
            boot = cm(a, ramps['hair']) & ~zone
            if i < STANDING.get(name, len(src)):
                f, off, match = paste_face(a, head, mask, hidden, base)
                if off is not None and i in HANDS_FRONT.get(name, ()):
                    fg = hands_front(a, base, off)
                    f[fg] = a[fg]
                    # dedos encostados no queixo (mesma mancha de pele do rosto): o que a colagem apagou e
                    # não cobriu volta do quadro
                    gap = (a[:, :, 3] > 0) & (f[:, :, 3] == 0)
                    gap[:max(CAP_BRIM[1] + off[0], 0)] = False   # o quepe do master que sobra atrás fica vazio
                    f[gap] = a[gap]
            else:
                f, off, match = a, None, 0.0
            swapped = cm(f, ramps['skin'])   # pele que não é o rosto colado
            face = np.zeros_like(swapped)
            if off is None and i < STANDING.get(name, len(src)):
                # rosto do master (sem colagem): tons na mesma proporção do rosto colado
                _, dy, dx = find_head(a, base)
                face = np.logical_or(*head_region(dy, dx)) & swapped
                g = face_match(f, face, usage(head, v['skin'], mask), v['skin'])
            f = swap_colors(f, sw)
            f[boot & cm(a, ramps['hair'])] = a[boot & cm(a, ramps['hair'])]
            shade_skin(f, swapped & ~face, v['skin'])
            if face.any():
                f[face] = g[face]
            if 'eye' in v and off is None:
                # rosto do master (queda): a íris encostada no branco do olho também troca
                iris = cm(f, [IRIS]) & grow(cm(f, ramps['white'])) & zone
                f[iris] = (*v['eye'][0], 255)
            if off is None and i >= STANDING.get(name, len(src)) and frames and swapped.any():
                # caído: a pele toda no tom médio do último quadro em pé, sem salto nem deriva
                t = skin_index(frames[STANDING[name] - 1], v['skin'])
                if t is not None:
                    g = swap_colors(a.copy(), face_mapping(v, head, a, np.ones_like(swapped), t))
                    f[swapped] = g[swapped]
            if off is None:
                hair_shadow(f, a, v, zone)   # depois da pele: o brilho do cabelo usa tons da pele
            if off is not None:
                ys, xs = np.nonzero(mask)
                ok = (f[ys + off[0], xs + off[1]] == face_ref).all(1).all()
                log.append(f'{off[0]:+d}{off[1]:+d}' + ('' if ok else '!'))
            else:
                log.append(f'-{match:.2f}')
            left += int((cm(f, old) & ~boot).sum())
            frames.append(f)
        save_anim(frames, os.path.join(out, name), name,
                  sheet_path=os.path.join(out, f'{vid}_{name}_sheet.png'),
                  gif_path=os.path.join(out, f'{vid}_{name}.gif'), durations=dur)
        extra = allowed + [list(RED), list(DRED)] if name == 'death_east' else allowed
        if name == 'shoot_gun_east':
            extra = None   # flash do tiro: cores de efeito
        if floor is None:
            report(f'{vid} {name}', frames[-1:], DEATH_FLOOR, extra)
        else:
            report(f'{vid} {name}', frames, floor, extra)
        holes = sum(inner_holes(m, f) for m, f in zip(src, frames))
        same = len(src) == len(frames)
        print(f'   rosto: {" ".join(log)}  | pele/cabelo do master sobrando: {left} | furos: {holes}'
              + ('' if same else '  !! número de quadros'))
        if name == 'aim_gun_east':
            aim_last = frames[-1]
        previews.append(frames)
    return previews


def preview(path, rows):
    """Folha ampliada: uma linha por animação, só a parte de cima do corpo."""
    contact(rows, path, crop=(24, 0, 104, 72), scale=3)


def main():
    variants = json.load(open(os.path.join(POLICE, 'variants.json')))
    ids = sys.argv[1:] or [k for k in variants if not k.startswith('_')]
    for vid in ids:
        rows = build(vid, variants[vid])
        preview(os.path.join(POLICE, 'drafts', f'{vid}_preview.png'), rows)


if __name__ == '__main__':
    main()
