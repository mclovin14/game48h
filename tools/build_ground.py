"""Monta o bloco repetível do chão da quadra 1 (calçada, meio-fio e asfalto) a partir da faixa do PixelLab.

A faixa da IA tem placas de ~31,5 px e faixas do asfalto a cada ~41 px, então não repete sozinha.
O bloco final tem 128 px: 4 placas de 32 px recortadas entre as juntas, o meio-fio do mesmo jeito,
o asfalto copiado direto e a faixa tracejada redesenhada com período de 64 px.

Uso: PYTHONPATH=tools python3 tools/build_ground.py
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LEVEL = ROOT / "assets/levels/level_1"
RAW = LEVEL / "drafts/ground_raw.png"
OUT = LEVEL / "ground.png"

TILE_W = 128
CELL = 32
# faixas de linhas da faixa da IA: (início, fim exclusivo, colunas onde começa cada junta)
BANDS = [
    (0, 30, [33, 65, 96, 127, 159]),  # placas de cima
    (30, 61, [32, 64, 96, 126, 159]),  # placas de baixo
    (61, 72, [62, 94, 126, 159, 192]),  # meio-fio
]
ASPHALT = (72, 112)
ASPHALT_X = 40
# linhas uniformes do asfalto que saem para o chão caber nos 104 px da tela
DROP_ROWS = range(76, 84)
LANE_ROWS = (99, 104)
DASH = (17, 31)  # um traço da faixa na IA
DASH_AT = [8, 72]  # onde o traço entra no bloco (período de 64 px)


def fit(cell: np.ndarray, w: int) -> np.ndarray:
    """Acerta a largura repetindo ou tirando colunas do meio (longe das juntas)."""
    while cell.shape[1] < w:
        m = cell.shape[1] // 2
        cell = np.concatenate([cell[:, : m + 1], cell[:, m:]], axis=1)
    while cell.shape[1] > w:
        m = cell.shape[1] // 2
        cell = np.delete(cell, m, axis=1)
    return cell


def main() -> None:
    src = np.array(Image.open(RAW).convert("RGB"))
    rows = []
    for y0, y1, joints in BANDS:
        cells = [fit(src[y0:y1, a:b], CELL) for a, b in zip(joints, joints[1:])]
        rows.append(np.concatenate(cells, axis=1))
    asphalt = src[ASPHALT[0] : ASPHALT[1], ASPHALT_X : ASPHALT_X + TILE_W].copy()
    # faixa tracejada: asfalto liso (tirado de um vão entre traços) e o traço em período de 64
    l0, l1 = LANE_ROWS[0] - ASPHALT[0], LANE_ROWS[1] - ASPHALT[0]
    gap = src[LANE_ROWS[0] : LANE_ROWS[1], 36:56]
    for x in range(0, TILE_W, gap.shape[1]):
        asphalt[l0:l1, x : x + gap.shape[1]] = gap[:, : TILE_W - x]
    dash = src[LANE_ROWS[0] : LANE_ROWS[1], DASH[0] : DASH[1]]
    for x in DASH_AT:
        asphalt[l0:l1, x : x + dash.shape[1]] = dash
    keep = [y for y in range(ASPHALT[1] - ASPHALT[0]) if y + ASPHALT[0] not in DROP_ROWS]
    rows.append(asphalt[keep])
    tile = np.concatenate(rows, axis=0)
    Image.fromarray(tile).save(OUT)
    print(OUT.relative_to(ROOT), tile.shape[1], "x", tile.shape[0], "cores:", len(np.unique(tile.reshape(-1, 3), axis=0)))


if __name__ == "__main__":
    main()
