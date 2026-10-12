"""Recorta os objetos de cena da quadra 1 (rascunhos do PixelLab) e gera uma prévia sobre verde.

A prévia serve para ver se a remoção de fundo apagou alguma parte do objeto.
Uso: PYTHONPATH=tools python3 tools/build_props.py
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LEVEL = ROOT / "assets/levels/level_1"
DRAFTS = LEVEL / "drafts"
PROPS = LEVEL / "props"

# nome final -> rascunho escolhido
CHOSEN = {
    "car": "car_x115_raw.png",  # car_raw.png ampliado 1,15x com margem e redesenhado (inteiro, vidro escuro)
    "hydrant": "hydrant_raw_1.png",
    "trash_bin": "trash_bin_raw.png",
    # versões 1,25x para a faixa da frente (junto ao meio-fio, mais perto da câmera)
    "hydrant_front": "hydrant_front_raw.png",
    "trash_bin_front": "trash_bin_front_raw.png",
    "barricade": "barricade_raw_3.png",
}
ALPHA_MIN = 128  # abaixo disso o pixel some (pixel art não tem meio-transparente)

def main() -> None:
    previews = []
    for name, raw in CHOSEN.items():
        im = np.array(Image.open(DRAFTS / raw).convert("RGBA"))
        im[..., 3] = np.where(im[..., 3] >= ALPHA_MIN, 255, 0)
        im[im[..., 3] == 0] = 0
        ys, xs = np.nonzero(im[..., 3])
        im = im[ys.min() : ys.max() + 1, xs.min() : xs.max() + 1].copy()
        Image.fromarray(im).save(PROPS / f"{name}.png")
        colors = len(np.unique(im[im[..., 3] > 0][:, :3], axis=0))
        print(f"{name}: {im.shape[1]}x{im.shape[0]}, {colors} cores")
        green = Image.new("RGBA", (im.shape[1] + 8, im.shape[0] + 8), (0, 200, 0, 255))
        green.alpha_composite(Image.fromarray(im), (4, 4))
        previews.append(green)
    w = sum(p.width for p in previews) + 8 * len(previews)
    h = max(p.height for p in previews)
    sheet = Image.new("RGBA", (w, h), (40, 40, 40, 255))
    x = 0
    for p in previews:
        sheet.alpha_composite(p, (x, h - p.height))
        x += p.width + 8
    sheet.resize((w * 3, h * 3), Image.NEAREST).save(DRAFTS / "props_on_green.png")


if __name__ == "__main__":
    main()
