"""Monta o fundo da quadra 1 a partir dos rascunhos do PixelLab (assets/levels/level_1/drafts/).

Saída em assets/levels/level_1/:
  facades/<nome>_dusk.png    entardecer; base da parede na última linha (de drafts/<nome>_dusk_fit.png)
  facades/<nome>_night.png   noite com as luzes apagadas (mesmo recorte)
  facades/<nome>_lights.png  só os pixels acesos da noite (janelas, vitrine, placa)
  skyline_dusk.png, skyline_lights.png         faixa repetível da silhueta distante (desce até a calçada) e só as janelas acesas
  props/lamp_post.png                          poste, pé na última linha

Uso: PYTHONPATH=tools python3 tools/build_background.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LEVEL = ROOT / "assets" / "levels" / "level_1"
DRAFTS = LEVEL / "drafts"

FACADES = ["bakery", "grocery", "optician", "haberdashery", "pharmacy", "shoe_store", "snack_bar", "clothing"]

# calçada desenhada pela IA embaixo da fachada (cortada fora): no máximo esta altura
SIDEWALK_MAX = 70
# linhas seguidas com a mesma largura para contar como parede
STEADY_ROWS = 5

# quanto a silhueta desce abaixo da arte original (até a calçada) e de quantas linhas de baixo ela sai
SKYLINE_EXTEND = 140
SKYLINE_FLOOR_ROWS = 60

# cor das janelas acesas da silhueta (fora da paleta do Kael: é luz)
WINDOW_LIGHT = [(255, 214, 140), (250, 190, 110), (255, 236, 180)]


def load(path: Path) -> np.ndarray:
    return np.array(Image.open(path).convert("RGBA"))


def save(arr: np.ndarray, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(arr).save(path)


def wall_base(alpha: np.ndarray) -> int:
    """Linha da base da parede, logo acima da calçada que a IA desenhou embaixo.

    A calçada da IA é um trapézio em perspectiva: larga embaixo e afinando a cada linha.
    Sobe até ela começar a afinar e depois até a largura parar de mudar (começou a parede).
    Essa calçada é jogada fora: o jogo desenha uma calçada contínua por baixo de todos os prédios.
    """
    rows = np.where(alpha.any(axis=1))[0]
    top, bottom = rows[0], rows[-1]
    spans = {}
    for y in range(bottom, max(top, bottom - SIDEWALK_MAX), -1):
        cols = np.where(alpha[y])[0]
        spans[y] = cols[-1] - cols[0] + 1 if len(cols) else 0
    widest = max(spans.values())
    # pedrinhas soltas embaixo da calçada também são estreitas: só conta depois da linha mais larga
    reached = narrowing = False
    for y in range(bottom, max(top, bottom - SIDEWALK_MAX) + STEADY_ROWS, -1):
        reached = reached or spans[y] >= widest - 1
        if reached and spans[y] < widest - 4:
            narrowing = True
        if narrowing and all(abs(spans[y - i] - spans[y]) <= 1 for i in range(1, STEADY_ROWS)):
            return int(y)
    return int(bottom)


def dilate(mask: np.ndarray, r: int) -> np.ndarray:
    out = mask.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            out |= np.roll(np.roll(mask, dy, axis=0), dx, axis=1)
    return out


def erode(mask: np.ndarray, r: int) -> np.ndarray:
    return ~dilate(~mask, r)


def light_mask(dusk: np.ndarray, night: np.ndarray, opaque: np.ndarray) -> np.ndarray:
    """Pixels acesos à noite: quase tão claros quanto no entardecer (o resto escurece bem mais)."""
    ld = dusk[..., :3].astype(int).sum(axis=2)
    ln = night[..., :3].astype(int).sum(axis=2)
    mask = opaque & ((ln + 1) / (ld + 1) > 0.8) & (ln > 240)
    # fecha buracos (placa acesa sem pedaço apagado no meio): dilata e depois erode 2 px
    mask = erode(dilate(mask, 2), 2) & opaque
    # tira pontos soltos: luz de verdade vem em grupo (janela, vitrine, placa)
    rgba = np.zeros((*mask.shape, 4), np.uint8)
    rgba[mask] = 255
    return drop_specks(rgba, 8)[..., 3] > 0


# prédios cuja parede de tijolo a remoção de fundo do PixelLab apagou: redesenhada por brick_fill
BRICK = {"pharmacy", "shoe_store", "snack_bar"}
BRICK_W, BRICK_H = 8, 4  # tijolo 7x3 mais 1 px de argamassa


def components(mask: np.ndarray) -> list[np.ndarray]:
    """Grupos ligados (4 vizinhos) de um mask, cada um como array de (y, x)."""
    h, w = mask.shape
    seen = np.zeros_like(mask)
    out = []
    for sy, sx in zip(*np.where(mask)):
        if seen[sy, sx]:
            continue
        stack, comp = [(sy, sx)], []
        seen[sy, sx] = True
        while stack:
            y, x = stack.pop()
            comp.append((y, x))
            for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    stack.append((ny, nx))
        out.append(np.array(comp))
    return out


def wall_holes(alpha: np.ndarray, base: int) -> np.ndarray:
    """Transparência dentro da parede: abaixo da cornija e entre as bordas da parede.

    Em cima do telhado (caixa d'água, antena) a transparência é de verdade e fica.
    """
    rows = np.where(alpha[: base + 1].any(axis=1))[0]
    mid = alpha[(rows[0] + base) // 2]
    cols = np.where(mid)[0]
    left, right = cols[0], cols[-1]
    # cornija: primeira linha que vai de uma borda da parede à outra
    roof = rows[0]
    for y in rows:
        c = np.where(alpha[y])[0]
        if c[0] <= left + 3 and c[-1] >= right - 3:
            roof = y
            break
    holes = np.zeros_like(alpha)
    holes[roof : base + 1, left : right + 1] = ~alpha[roof : base + 1, left : right + 1]
    return holes


def brick_palette(img: np.ndarray, near: np.ndarray) -> list[np.ndarray]:
    """Argamassa, tijolo escuro, tijolo e tijolo claro, tirados dos pixels de tijolo que sobraram."""
    px = img[near][:, :3].astype(int)
    r, g, b = px[:, 0], px[:, 1], px[:, 2]
    # tijolo: avermelhado e nem muito escuro nem muito claro
    brick = px[(r > g + 25) & (r > b + 30) & (r > 90)]
    if len(brick) < 50:
        brick = px[(r > g) & (r > 60)]
    lum = brick.sum(axis=1)
    order = brick[np.argsort(lum)]
    pick = lambda q: order[int(q * (len(order) - 1))]
    mortar = (pick(0.08) * 0.75).astype(int)
    return [mortar, pick(0.3), pick(0.55), pick(0.85)]


def brick_fill(img: np.ndarray, holes: np.ndarray, pal: list[np.ndarray], seed: int) -> None:
    """Desenha tijolo em amarração (fiada sim, fiada não, meio tijolo deslocado) nos buracos."""
    rng = np.random.default_rng(seed)
    h, w = holes.shape
    mortar, dark, mid, light = pal
    shades = {}
    for y, x in zip(*np.where(holes)):
        row = y // BRICK_H
        bx = x + (BRICK_W // 2 if row % 2 else 0)
        if y % BRICK_H == BRICK_H - 1 or bx % BRICK_W == BRICK_W - 1:
            color = mortar
        else:
            key = (row, bx // BRICK_W)
            if key not in shades:
                shades[key] = rng.choice(3, p=[0.2, 0.65, 0.15])
            color = (dark, mid, light)[shades[key]]
            # luz de cima: a primeira linha do tijolo médio sai mais clara
            if y % BRICK_H == 0 and shades[key] == 1:
                color = light
        img[y, x, :3] = color
        img[y, x, 3] = 255


def border_fill(img: np.ndarray, comp: np.ndarray, opaque: np.ndarray) -> None:
    """Buraco pequeno (janela, porta, fresta): pinta com a cor escura da borda dele."""
    h, w = opaque.shape
    ring = []
    for y, x in comp:
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < h and 0 <= nx < w and opaque[ny, nx]:
                ring.append(img[ny, nx, :3].astype(int))
    if not ring:
        return
    ring = np.array(ring)
    color = ring[np.argsort(ring.sum(axis=1))[len(ring) // 4]]
    img[comp[:, 0], comp[:, 1], :3] = color
    img[comp[:, 0], comp[:, 1], 3] = 255


def fill_walls(name: str, dusk: np.ndarray, night: np.ndarray, base: int) -> None:
    """Tapa a transparência dentro da parede, no entardecer e na noite (mesmo recorte nas duas)."""
    alpha = dusk[..., 3] > 0
    holes = wall_holes(alpha, base)
    # razão noite/entardecer da fachada, para a noite do tijolo novo bater com o resto
    ratio = [np.median((night[..., c][alpha].astype(int) + 1) / (dusk[..., c][alpha].astype(int) + 1)) for c in range(3)]
    pal = brick_palette(dusk, dilate(holes, 3) & alpha) if name in BRICK else None
    for comp in components(holes):
        if pal is not None and len(comp) > 150:
            sub = np.zeros_like(holes)
            sub[comp[:, 0], comp[:, 1]] = True
            brick_fill(dusk, sub, pal, seed=len(comp))
        else:
            border_fill(dusk, comp, alpha)
        for c in range(3):
            night[comp[:, 0], comp[:, 1], c] = np.clip(dusk[comp[:, 0], comp[:, 1], c] * ratio[c], 0, 255)
        night[comp[:, 0], comp[:, 1], 3] = 255


def build_facade(name: str) -> tuple[int, int]:
    # rascunho na escala do Kael (tools/build_facade_fit.py + PixelLab): a base é a última linha opaca
    dusk = load(DRAFTS / f"{name}_dusk_fit.png")
    night = load(DRAFTS / f"{name}_night_fit.png")
    base = int(np.where((dusk[..., 3] > 0).any(axis=1))[0][-1])
    fill_walls(name, dusk, night, base)
    # pixel que a noite deixou transparente dentro do entardecer: entardecer escurecido
    gone = (dusk[..., 3] > 0) & (night[..., 3] == 0)
    if gone.any():
        keep = (dusk[..., 3] > 0) & (night[..., 3] > 0)
        for c in range(3):
            r = np.median((night[..., c][keep].astype(int) + 1) / (dusk[..., c][keep].astype(int) + 1))
            night[..., c] = np.where(gone, np.clip(dusk[..., c] * r, 0, 255), night[..., c])
        night[..., 3] = np.where(gone, 255, night[..., 3])
    alpha = dusk[..., 3] > 0
    # corta tudo abaixo da base (calçada) nas duas versões
    alpha[base + 1 :] = False
    cols = np.where(alpha.any(axis=0))[0]
    rows = np.where(alpha.any(axis=1))[0]
    # recorte pela caixa inteira: toldo e fio que saem para o lado aparecem completos
    x0, x1, y0 = cols[0], cols[-1] + 1, rows[0]

    def clip(img: np.ndarray) -> np.ndarray:
        img = img.copy()
        # a noite usa o contorno do entardecer: pixel a mais ou a menos na borda vira fantasma ao trocar
        img[..., 3] = np.where(alpha, img[..., 3], 0)
        img[~alpha] = 0
        return img[y0 : base + 1, x0:x1]

    lit = light_mask(dusk, night, alpha)
    # noite sem luz: nos pixels acesos, o entardecer escurecido na mesma proporção do resto da fachada
    ratio = [np.median((night[..., c][alpha].astype(int) + 1) / (dusk[..., c][alpha].astype(int) + 1)) for c in range(3)]
    unlit = night.copy()
    for c in range(3):
        unlit[..., c] = np.where(lit, np.clip(dusk[..., c] * ratio[c], 0, 255), night[..., c])
    lights = np.zeros_like(night)
    lights[lit] = night[lit]

    save(clip(dusk), LEVEL / "facades" / f"{name}_dusk.png")
    save(clip(unlit), LEVEL / "facades" / f"{name}_night.png")
    save(clip(lights), LEVEL / "facades" / f"{name}_lights.png")
    return x1 - x0, base + 1 - y0


def drop_specks(arr: np.ndarray, min_size: int = 6) -> np.ndarray:
    """Apaga pontos soltos (estrelas que a IA pôs no fundo transparente)."""
    alpha = arr[..., 3] > 0
    h, w = alpha.shape
    seen = np.zeros_like(alpha)
    out = arr.copy()
    for sy in range(h):
        for sx in range(w):
            if not alpha[sy, sx] or seen[sy, sx]:
                continue
            stack, comp = [(sy, sx)], []
            seen[sy, sx] = True
            while stack:
                y, x = stack.pop()
                comp.append((y, x))
                for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                    if 0 <= ny < h and 0 <= nx < w and alpha[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((ny, nx))
            if len(comp) < min_size:
                for y, x in comp:
                    out[y, x] = 0
    return out


def build_skyline() -> tuple[int, int]:
    raw = drop_specks(load(DRAFTS / "skyline_raw.png"))
    rows = np.where((raw[..., 3] > 0).any(axis=1))[0]
    raw = raw[rows[0] :]
    # faixa = imagem + espelho: as duas emendas viram espelho e a faixa repete sem corte
    strip = np.concatenate([raw, raw[:, ::-1]], axis=1)
    # os prédios do fundo descem até a calçada: repete os andares de baixo (espelhados em pé,
    # sem emenda) e tapa o que sobrar com a cor da base, para o céu não aparecer embaixo deles
    chunk = strip[-SKYLINE_FLOOR_ROWS:]
    ext = np.concatenate([chunk[::-1], chunk, chunk[::-1]], axis=0)[:SKYLINE_EXTEND]
    opaque = strip[-12:][..., 3] > 0
    base_color = np.median(strip[-12:][opaque][:, :3], axis=0) * 0.8
    gap = ext[..., 3] == 0
    ext[gap, :3] = base_color.astype(np.uint8)
    ext[gap, 3] = 255
    strip = np.concatenate([strip, ext], axis=0)
    save(strip, LEVEL / "skyline_dusk.png")

    # janelas: pixels mais claros que a parede em volta; acende uma parte delas, por blocos
    rgb = strip[..., :3].astype(int)
    lum = rgb.sum(axis=2)
    opaque = strip[..., 3] > 0
    pad = np.pad(lum, 3, mode="edge")
    local = np.zeros_like(lum, dtype=float)
    for dy in range(-3, 4):
        for dx in range(-3, 4):
            local += pad[3 + dy : 3 + dy + lum.shape[0], 3 + dx : 3 + dx + lum.shape[1]]
    local /= 49
    window = opaque & (lum > local + 25)
    rng = np.random.default_rng(7)
    lights = np.zeros_like(strip)
    cell = 6  # janelas próximas acendem juntas, como um apartamento
    h, w = window.shape
    for cy in range(0, h, cell):
        for cx in range(0, w, cell):
            block = window[cy : cy + cell, cx : cx + cell]
            if block.any() and rng.random() < 0.45:
                color = WINDOW_LIGHT[rng.integers(len(WINDOW_LIGHT))]
                ys, xs = np.where(block)
                lights[cy + ys, cx + xs] = (*color, 255)
    save(lights, LEVEL / "skyline_lights.png")
    return strip.shape[1], strip.shape[0]


def build_lamp() -> tuple[int, int]:
    raw = load(DRAFTS / "lamp_post_raw.png")
    a = raw[..., 3] > 0
    rows, cols = np.where(a.any(axis=1))[0], np.where(a.any(axis=0))[0]
    out = raw[rows[0] : rows[-1] + 1, cols[0] : cols[-1] + 1]
    save(out, LEVEL / "props" / "lamp_post.png")
    return out.shape[1], out.shape[0]


if __name__ == "__main__":
    for n in FACADES:
        if (DRAFTS / f"{n}_night_fit.png").exists():
            print(n, build_facade(n))
        else:
            print(n, "sem versão noturna ainda")
    print("skyline", build_skyline())
    print("lamp_post", build_lamp())
