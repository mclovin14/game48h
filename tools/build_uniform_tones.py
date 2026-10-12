"""Tons de farda dos policiais: gera assets/enemies/police/uniform_tones.json e a prévia das 9 combinações.

Cada tom é a rampa `uniform` do palette_master.json (6 azuis) com outro matiz e outra saturação,
mantendo a luminosidade de cada cor (a sombra e o brilho da farda ficam onde estavam).
O jogo troca as cores no Boot, por canvas (src/game/actors/uniformTones.ts), sem sheet nova.

Uso: PYTHONPATH=tools python3 tools/build_uniform_tones.py
"""
import colorsys
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

POLICE = Path("assets/enemies/police")
VARIANTS = ["a", "b", "c"]

# [PROPOSTA] nome: (matiz em graus ou None = o do master, fator de saturação, fator de luminosidade)
TONES = {
    "navy": None,  # azul-marinho: a rampa do master, sem troca
    "slate": (218, 0.38, 1.18),  # cinza-azulado
    "teal": (192, 0.95, 1.08),  # azul-petróleo
}
LABELS = {"navy": "azul-marinho", "slate": "cinza-azulado", "teal": "azul-petroleo"}


def tone_ramp(ramp: list[list[int]], spec) -> list[list[int]]:
    if spec is None:
        return ramp
    hue, sat_f, light_f = spec
    out = []
    for r, g, b in ramp:
        _, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        rr, gg, bb = colorsys.hls_to_rgb(hue / 360, min(l * light_f, 1), min(s * sat_f, 1))
        out.append([round(rr * 255), round(gg * 255), round(bb * 255)])
    return out


def recolor(img: np.ndarray, src: list[list[int]], dst: list[list[int]]) -> np.ndarray:
    out = img.copy()
    for a, b in zip(src, dst):
        m = (img[..., :3] == a).all(-1) & (img[..., 3] > 0)
        out[m, :3] = b
    return out


def frame(v: str, anim: str, i: int) -> np.ndarray:
    sheet = np.array(Image.open(POLICE / f"police_{v}" / f"police_{v}_{anim}_east_sheet.png").convert("RGBA"))
    n = sheet.shape[1] // 128
    i = i % n
    return sheet[:, i * 128 : (i + 1) * 128]


def main() -> None:
    master = json.loads((POLICE / "palette_master.json").read_text())["uniform"]
    tones = {name: tone_ramp(master, spec) for name, spec in TONES.items()}
    doc = {
        "_doc": "Rampas da farda (6 cores, da mais escura à mais clara), na ordem de `uniform` do palette_master.json. "
        "navy é a do master. Gerado por tools/build_uniform_tones.py.",
        **tones,
    }
    (POLICE / "uniform_tones.json").write_text(json.dumps(doc, indent=2) + "\n")
    for name, ramp in tones.items():
        print(name, ramp)

    # prévia: linhas = tons, colunas = cabeça (idle e aim), fundo claro e escuro, ampliado 3x
    z, cell = 3, 128
    shots = [("idle_gun", 0), ("aim_gun", -1)]
    bgs = [(214, 170, 150), (40, 36, 60)]
    cols = len(VARIANTS) * len(shots)
    W, H = cols * cell, len(tones) * len(bgs) * cell
    canvas = Image.new("RGB", (W, H + 0), (0, 0, 0))
    for ti, (name, ramp) in enumerate(tones.items()):
        for bi, bg in enumerate(bgs):
            y = (ti * len(bgs) + bi) * cell
            for vi, v in enumerate(VARIANTS):
                for si, (anim, idx) in enumerate(shots):
                    f = recolor(frame(v, anim, idx), master, ramp)
                    tile = Image.new("RGBA", (cell, cell), bg + (255,))
                    tile.alpha_composite(Image.fromarray(f))
                    canvas.paste(tile.convert("RGB"), ((vi * len(shots) + si) * cell, y))
    big = canvas.resize((W * z, H * z), Image.NEAREST)
    d = ImageDraw.Draw(big)
    for ti, name in enumerate(tones):
        d.text((8, ti * len(bgs) * cell * z + 6), f"{name} ({LABELS[name]})", fill=(255, 255, 255))
    out = POLICE / "drafts" / "uniform_tones_preview.png"
    big.save(out)
    print("prévia:", out)


if __name__ == "__main__":
    main()
