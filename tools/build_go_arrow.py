"""Desenha a seta de "siga em frente" (estilo beat 'em up dos anos 90), pixel a pixel.

Sai em assets/ui/go_arrow.png (23x20, o jogo amplia 3x) e uma prévia ampliada em assets/ui/drafts/.
Cores de efeito de interface (fora da paleta do Kael): amarelo com contorno escuro.
Uso: PYTHONPATH=tools python3 tools/build_go_arrow.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/ui/go_arrow.png"
PREVIEW = ROOT / "assets/ui/drafts/go_arrow_preview.png"

W, H = 23, 20
OUTLINE = (34, 22, 28, 255)
LIGHT = (255, 238, 150, 255)
FILL = (250, 196, 44, 255)
SHADE = (206, 124, 22, 255)

# corpo da seta: haste (linhas 6 a 13) e ponta a 45 graus (degraus de 1 px), da coluna 12 até a 21
SHAFT = (1, 12, 6, 13)  # x0, x1, y0, y1
TIP_X0, TIP_X1, MID = 12, 21, 9.5


def inside(x: int, y: int) -> bool:
    x0, x1, y0, y1 = SHAFT
    if x0 <= x <= x1 and y0 <= y <= y1:
        return True
    if TIP_X0 <= x <= TIP_X1:
        half = (TIP_X1 - x) + 0.5
        return abs(y - MID) <= half
    return False


def main() -> None:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = img.load()
    for y in range(H):
        for x in range(W):
            if not inside(x, y):
                continue
            edge = any(not inside(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            if edge:
                px[x, y] = OUTLINE
            elif not inside(x, y - 2):
                px[x, y] = LIGHT  # borda de cima acesa
            elif not inside(x, y + 2):
                px[x, y] = SHADE  # borda de baixo na sombra
            else:
                px[x, y] = FILL
    img.save(OUT)
    PREVIEW.parent.mkdir(parents=True, exist_ok=True)
    big = Image.new("RGBA", (W * 12, H * 12), (60, 120, 70, 255))
    big.alpha_composite(img.resize((W * 12, H * 12), Image.NEAREST))
    big.save(PREVIEW)
    print("ok", OUT)


if __name__ == "__main__":
    main()
