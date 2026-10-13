"""Ilustrações dos finais (fase 8 do plano jump_crouch_cutscene.md).

Parte das opções escolhidas pelo usuário (PixelLab, 160x90; o jogo amplia 6x para 960x540) e troca as
placas em inglês pelos nomes das lojas da quadra 1, com uma fonte de pixel desenhada aqui.
Depois monta as animações (animate_image do PixelLab, em drafts/raw/) numa sheet horizontal de 160x90 por quadro.
Uso: PYTHONPATH=tools python3 tools/build_endings.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CUTS = ROOT / "assets/cutscenes"

# fonte 4x4 (placa vertical) e 4x7 (letreiro); "#" acende
FONT_4X4 = {
    "O": [".##.", "#..#", "#..#", ".##."],
    "T": ["####", ".##.", ".##.", ".##."],
    "I": [".##.", ".##.", ".##.", ".##."],
    "C": [".###", "#...", "#...", ".###"],
    "A": [".##.", "#..#", "####", "#..#"],
}
FONT_4X7 = {
    "M": ["#..#", "####", "####", "#..#", "#..#", "#..#", "#..#"],
    "O": [".##.", "#..#", "#..#", "#..#", "#..#", "#..#", ".##."],
    "D": ["###.", "#..#", "#..#", "#..#", "#..#", "#..#", "###."],
    "A": [".##.", "#..#", "#..#", "####", "#..#", "#..#", "#..#"],
    "S": [".###", "#...", "#...", ".##.", "...#", "...#", "###."],
}


def text_bitmap(text: str, font: dict, gap: int = 1) -> list[list[bool]]:
    """Linhas da palavra na horizontal."""
    h = len(next(iter(font.values())))
    rows = [[] for _ in range(h)]
    for i, ch in enumerate(text):
        for y in range(h):
            if i:
                rows[y] += [False] * gap
            rows[y] += [c == "#" for c in font[ch][y]]
    return rows


def vertical_sign(img: Image.Image, text: str, x0: int, y0: int, box: tuple, bg, ink, accent_over: int | None = None) -> None:
    """Placa vertical: apaga `box` (x0, y0, x1, y1, inclusive) e escreve as letras de cima para baixo."""
    px = img.load()
    bx0, by0, bx1, by1 = box
    for y in range(by0, by1 + 1):
        for x in range(bx0, bx1 + 1):
            px[x, y] = bg
    y = y0
    for i, ch in enumerate(text):
        glyph = FONT_4X4[ch]
        if accent_over == i:  # acento agudo: um pixel à direita, na linha de cima da letra
            px[x0 + 2, y - 1] = ink
        for gy, line in enumerate(glyph):
            for gx, c in enumerate(line):
                if c == "#":
                    px[x0 + gx, y + gy] = ink
        y += len(glyph) + 1


def slanted_sign(img: Image.Image, text: str, quad: tuple, text_x: int, text_top: tuple, bg, ink, shade) -> None:
    """Letreiro inclinado: apaga o miolo `quad` = (xl, top_l, bot_l, xr, top_r, bot_r) e escreve as letras retas,
    cada coluna subindo junto com a borda (`text_top` = topo do texto na esquerda e na direita). Base da letra na sombra."""
    px = img.load()
    xl, tl, bl, xr, tr, br = quad
    for x in range(xl, xr + 1):
        u = (x - xl) / (xr - xl)
        for y in range(round(tl + (tr - tl) * u), round(bl + (br - bl) * u) + 1):
            px[x, y] = bg
    rows = text_bitmap(text, FONT_4X7)
    tw = len(rows[0])
    for tx in range(tw):
        x = text_x + tx
        u = (x - xl) / (xr - xl)
        y0 = round(text_top[0] + (text_top[1] - text_top[0]) * u)
        for ty, row in enumerate(rows):
            if row[tx]:
                px[x, y0 + ty] = shade if ty == len(rows) - 1 else ink


def happy() -> Image.Image:
    img = Image.open(CUTS / "ending_happy/drafts/kiss_option_3.png").convert("RGB")
    # placa vertical "HOTEL" -> "ÓTICA" (Ótica Visão Clara); cores da própria placa
    vertical_sign(img, "OTICA", x0=117, y0=3, box=(116, 1, 120, 27), bg=(72, 33, 62), ink=(198, 115, 95), accent_over=0)
    # letreiro "CINEMA" -> "MODAS" (Modas Aurora)
    slanted_sign(img, "MODAS", (128, 2, 19, 155, 0, 10), text_x=130, text_top=(10, 3),
                 bg=(76, 32, 39), ink=(252, 220, 121), shade=(204, 115, 43))
    return img


FRAME = (160, 90)
# o último quadro do PixelLab repete o primeiro (loop): fica fora da sheet
LOOP_FRAMES = 8
# feliz: só o casal mexe (cabelo e vestido); placas e poste ficam como na base, sem tremer
HAPPY_MOVE_BOXES = [(46, 8, 112, 70), (56, 70, 106, 90)]  # o cabelo vai mais à esquerda que as pernas
# triste: a opção 1 veio com uma moldura de interface no rodapé (linhas 81-89); vira uma tarja preta
SAD_LETTERBOX_Y = 81
FRAME_MS = {"ending_happy": 160, "ending_sad": 120}  # [TESTE] ms por quadro


def frames(name: str, base: Image.Image, boxes: list | None) -> list[Image.Image]:
    raw = sorted((CUTS / name / "drafts/raw").glob("*.png"))[:LOOP_FRAMES]
    out = []
    for f in raw:
        im = Image.open(f).convert("RGB")
        if boxes:
            fr = base.copy()
            for box in boxes:
                fr.paste(im.crop(box), box[:2])
            im = fr
        if name == "ending_sad":
            im.paste((0, 0, 0), (0, SAD_LETTERBOX_Y, FRAME[0], FRAME[1]))
        out.append(im)
    return out


def save_anim(name: str, fr: list[Image.Image]) -> None:
    sheet = Image.new("RGB", (FRAME[0] * len(fr), FRAME[1]))
    for i, im in enumerate(fr):
        sheet.paste(im, (i * FRAME[0], 0))
    sheet.save(CUTS / name / f"{name}_sheet.png")
    big = [im.resize((FRAME[0] * 3, FRAME[1] * 3), Image.NEAREST) for im in fr]
    big[0].save(CUTS / name / f"{name}.gif", save_all=True, append_images=big[1:], duration=FRAME_MS[name], loop=0)
    print("ok", name, len(fr), "quadros")


def main() -> None:
    out = CUTS / "ending_happy/ending_happy_base.png"
    img = happy()
    img.save(out)
    img.resize((960, 540), Image.NEAREST).save(CUTS / "ending_happy/drafts/ending_happy_preview_6x.png")
    print("ok", out)
    save_anim("ending_happy", frames("ending_happy", img, HAPPY_MOVE_BOXES))
    sad = Image.open(CUTS / "ending_sad/ending_sad_base.png").convert("RGB")
    save_anim("ending_sad", frames("ending_sad", sad, None))


if __name__ == "__main__":
    main()
