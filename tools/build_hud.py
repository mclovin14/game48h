"""HUD de vida e índole (plano playtest_fixes_1.md, fase 8).

Peças do PixelLab escolhidas pelo usuário (drafts em assets/ui/hud/drafts/):
  rosto face_raw/33, moldura do rosto portrait_frame_raw/21, barra bar_frame_raw_3, balança scale_raw/38 (pendendo: scale_tilt_raw, editada no PixelLab).
Saídas em assets/ui/hud/:
  hud_portrait.png   moldura esticada (o miolo cabe o rosto) com o rosto do Kael recortado dentro
  hud_bar_frame.png  moldura da barra, miolo transparente (o preenchimento é CSS)
  hud_bar_frame_short.png  a mesma com 120 px, para a índole
  hud_bullet_sheet.png 4 quadros de 5x10: bala letal, não letal, espaço vazio, cinza
  hud_slot_fist.png / hud_slot_pistol.png  espaço de arma: moldura do rosto com o punho (fist_raw/02) ou a pistola (pistol_raw/40, nos cinzas do Kael)
  hud_clip_sheet.png 2 quadros: pente vermelho (letal) e azul (não letal), de mag_raw/13
  hud_scale_sheet.png 2 quadros de 24x24: balança nivelada e pendendo (índole baixa)

Uso: PYTHONPATH=tools python3 tools/build_hud.py
"""
import colorsys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
HUD = ROOT / 'assets/ui/hud'
RAW = HUD / 'drafts'

GROW = 13  # px a mais no miolo da moldura do rosto (19x18 -> 32x31)
SCALE_COLORS = 14
SHORT_CUT = 24  # colunas a menos na moldura da índole (144 -> 120)


def load(p: Path) -> np.ndarray:
    return np.array(Image.open(p).convert('RGBA'))


def save(a: np.ndarray, name: str, scale: int = 6) -> None:
    im = Image.fromarray(a)
    im.save(HUD / name)
    im.resize((im.width * scale, im.height * scale), Image.NEAREST).save(RAW / f'check_{name}')
    colors = len({tuple(p) for p in a.reshape(-1, 4) if p[3]})
    print(f'{name}: {im.width}x{im.height}, {colors} cores')


def main_island(a: np.ndarray) -> np.ndarray:
    """Fica só o maior pedaço ligado (tira pixels soltos)."""
    lab, n = ndimage.label(a[..., 3] > 0, structure=np.ones((3, 3)))
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    out = a.copy()
    out[lab != 1 + int(np.argmax(sizes))] = 0
    return out


def frame(grow_w: int, grow_h: int) -> tuple[np.ndarray, np.ndarray]:
    """Moldura do rosto (portrait_frame_raw/21) esticada; devolve a imagem e a máscara do miolo."""
    f = load(RAW / 'portrait_frame_raw/21.png')
    # 9-slice: repete a coluna e a linha do meio, que são retas
    f = np.concatenate([f[:, :20], np.repeat(f[:, 19:20], grow_w, axis=1), f[:, 20:]], axis=1)
    f = np.concatenate([f[:20], np.repeat(f[19:20], grow_h, axis=0), f[20:]], axis=0)
    # miolo: pixels escuros ligados ao centro
    dark = (f[..., 3] > 0) & (f[..., :3].astype(int).sum(axis=2) < 70)
    lab, _ = ndimage.label(dark)
    h, w = dark.shape
    return f, lab == lab[h // 2, w // 2]


def portrait() -> np.ndarray:
    f, slot = frame(GROW, GROW)
    h, w = slot.shape
    ys, xs = np.nonzero(slot)
    face = load(RAW / 'face_raw/33.png')
    fy, fx = np.nonzero(face[..., 3])
    # rosto centrado na largura, ombros encostados no fundo do miolo
    ox = xs.min() + (xs.max() - xs.min() + 1 - (fx.max() - fx.min() + 1)) // 2 - fx.min()
    oy = ys.max() - fy.max()
    for y, x in zip(fy, fx):
        ty, tx = y + oy, x + ox
        if 0 <= ty < h and 0 <= tx < w and slot[ty, tx]:
            f[ty, tx] = face[y, x]
    return f


def scale_frames() -> np.ndarray:
    """Nivelada (scale_raw/38) e pendendo (scale_tilt_raw: a 38 editada no PixelLab em 32x32, voltando a 24x24)."""
    level = Image.open(RAW / 'scale_raw/38.png').convert('RGBA')
    tilt = Image.open(RAW / 'scale_tilt_raw.png').convert('RGBA').crop((4, 4, 28, 28))
    both = Image.new('RGBA', (48, 24))
    both.paste(level, (0, 0))
    both.paste(tilt, (24, 0))
    # as duas na mesma paleta curta
    q = both.convert('RGB').quantize(SCALE_COLORS, method=Image.Quantize.MEDIANCUT).convert('RGB')
    a = np.dstack([np.array(q), np.array(both)[..., 3]])
    a[..., 3] = np.where(a[..., 3] > 127, 255, 0)
    a[a[..., 3] == 0] = 0
    return a


# bala do pente 5x10: O contorno, L claro, M meio, D escuro, . vazio
BULLET = [
    '.OOO.',
    'OLMDO',
    'OLMDO',
    'OLMDO',
    'OOOOO',
    'OLMDO',
    'OLMDO',
    'OLMDO',
    'OLMDO',
    'OOOOO',
]
BULLET_RAMPS = {
    'lethal': ((26, 14, 18), (240, 120, 104), (204, 52, 48), (124, 26, 32)),
    'nonLethal': ((14, 18, 32), (128, 180, 244), (52, 104, 212), (28, 52, 124)),
    'spent': ((52, 58, 74), (30, 33, 44), (30, 33, 44), (30, 33, 44)),
    'gray': ((40, 44, 56), (150, 154, 164), (110, 114, 126), (72, 76, 88)),
}


def bullets() -> np.ndarray:
    """4 quadros: letal, não letal, espaço vazio no pente, cinza (pente vazio piscando)."""
    out = np.zeros((10, 20, 4), np.uint8)
    for k, (o, l, m, d) in enumerate(BULLET_RAMPS.values()):
        for y, row in enumerate(BULLET):
            for x, ch in enumerate(row):
                if ch != '.':
                    out[y, k * 5 + x] = (*{'O': o, 'L': l, 'M': m, 'D': d}[ch], 255)
    return out


# cinzas da arma do Kael (player_base_gun_east.png)
SLOT_BG = (38, 46, 62, 255)
GUN_GRAYS = [(3, 3, 4), (50, 51, 56), (122, 129, 141), (187, 192, 197), (242, 245, 247)]


def gray_pistol() -> np.ndarray:
    """Pistola D (pistol_raw/40) pintada nos cinzas da arma do Kael; o cabo marrom vira o cinza escuro."""
    a = load(RAW / 'pistol_raw/40.png')
    for y, x in zip(*np.nonzero(a[..., 3])):
        r, g, b = (int(v) for v in a[y, x, :3])
        lum = 0.3 * r + 0.59 * g + 0.11 * b
        if r > b + 15:  # cabo
            i = 2 if lum >= 60 else 1
        else:
            i = 0 if lum < 20 else 1 if lum < 38 else 2 if lum < 60 else 3 if lum < 75 else 4
        a[y, x, :3] = GUN_GRAYS[i]
    return a


def slot_with(icon: np.ndarray) -> np.ndarray:
    """Espaço de arma: a moldura do rosto esticada até o miolo caber o ícone, com o ícone no meio."""
    ys, xs = np.nonzero(icon[..., 3])
    icon = icon[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    ih, iw = icon.shape[:2]
    # miolo original 19x18; 1 px de folga em volta do ícone
    f, slot = frame(iw + 2 - 19, ih + 2 - 18)
    sy, sx = np.nonzero(slot)
    oy = sy.min() + (sy.max() - sy.min() + 1 - ih) // 2
    ox = sx.min() + (sx.max() - sx.min() + 1 - iw) // 2
    f[slot] = SLOT_BG  # fundo mais claro que o contorno, para a pistola escura não sumir
    m = icon[..., 3] > 0
    f[oy:oy + ih, ox:ox + iw][m] = icon[m]
    return f


def clips() -> np.ndarray:
    """Pente B (mag_raw/13) em 2 quadros: vermelho (letal) e azul (não letal). A bala de latão no topo fica."""
    a = load(RAW / 'mag_raw/13.png')
    ys, xs = np.nonzero(a[..., 3])
    a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    out = []
    for hue in (0.0, 0.6):
        t = a.copy()
        for y, x in zip(*np.nonzero(t[..., 3])):
            h, l, s = colorsys.rgb_to_hls(*(t[y, x, :3] / 255))
            if s < 0.25 and l > 0.25:  # metal cinza
                t[y, x, :3] = [round(c * 255) for c in colorsys.hls_to_rgb(hue, l * 0.85, 0.65)]
        out.append(t)
    return np.concatenate(out, axis=1)


def main() -> None:
    save(portrait(), 'hud_portrait.png')
    bar = main_island(load(RAW / 'bar_frame_raw_3.png'))
    save(bar, 'hud_bar_frame.png', 4)
    # índole: mesma moldura, sem colunas retas do meio, para caber a balança ao lado
    save(np.concatenate([bar[:, :72], bar[:, 72 + SHORT_CUT:]], axis=1), 'hud_bar_frame_short.png', 4)
    save(scale_frames(), 'hud_scale_sheet.png', 8)
    save(bullets(), 'hud_bullet_sheet.png', 10)
    save(slot_with(load(RAW / 'fist_raw/02.png')), 'hud_slot_fist.png')
    save(slot_with(gray_pistol()), 'hud_slot_pistol.png')
    save(clips(), 'hud_clip_sheet.png', 8)


if __name__ == '__main__':
    main()
