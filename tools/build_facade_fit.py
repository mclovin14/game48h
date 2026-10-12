"""Põe as fachadas da quadra 1 na escala do Kael: porta proporcional e prédio abaixo do topo da tela.

Parte dos rascunhos limpos (drafts/<nome>_dusk_x.png), que estão em escalas diferentes:
  1. tapa os buracos da parede (fill_walls do build_background);
  2. corta na base medida à mão (a detecção automática comia o pé das portas);
  3. junta só as faixas de linhas escolhidas (tira andares repetidos);
  4. amplia por vizinho mais próximo até a porta ficar com ~DOOR px.
Fator perto de 1: sai direto <nome>_dusk_fit.png e <nome>_night_fit.png, com a arte original.
Senão, a saída (drafts/<nome>_fit_nn.png) tem pixel irregular: vai para o PixelLab redesenhar
na mesma resolução (vira <nome>_dusk_fit.png) e depois fazer a noite (<nome>_night_fit.png).

Uso: PYTHONPATH=tools python3 tools/build_facade_fit.py
"""
import numpy as np
from PIL import Image

import build_background as bb

# altura da porta de referência, medida no rascunho da padaria: o usuário aprovou essa escala
# (o Kael passa "tranquilamente"). As outras portas ficam do mesmo tamanho.
DOOR = 93
# fator perto de 1: mantém a arte original, sem ampliar nem redesenhar
KEEP_TOL = 0.08
# altura máxima do prédio acima da base das paredes (a base fica em y=436 na tela)
MAX_H = 430

# nome: (altura da porta no rascunho, base medida, faixas de linhas que ficam [início, fim) ou None = prédio inteiro)
# a última faixa termina na base + 1; só os prédios altos perdem andar, para não passar do topo
SPEC = {
    "bakery": (93, 389, None),
    "pharmacy": (84, 490, [(50, 172), (262, 491)]),
    "grocery": (98, 386, None),
    "shoe_store": (69, 474, [(18, 175), (338, 475)]),
    "optician": (77, 385, None),
    "snack_bar": (63, 487, [(35, 182), (355, 488)]),
    "haberdashery": (90, 374, None),
    "clothing": (78, 487, [(58, 212), (328, 488)]),
}
# linhas de baixo em que a calçada da IA ainda pode aparecer dos lados da parede
FOOT_ROWS = 6


def cut(img: np.ndarray, base: int, bands: list[tuple[int, int]] | None) -> np.ndarray:
    if bands is None:
        return img[: base + 1].copy()
    return np.concatenate([img[a:b] for a, b in bands], axis=0)


def fit(name: str) -> tuple[int, int, float]:
    door, base, bands = SPEC[name]
    dusk = bb.load(bb.DRAFTS / f"{name}_dusk_x.png")
    night = bb.load(bb.DRAFTS / f"{name}_night_x.png")
    bb.fill_walls(name, dusk, night, base)
    dusk, night = cut(dusk, base, bands), cut(night, base, bands)
    # largura da parede logo acima do pé; abaixo disso, o que sai para os lados é calçada
    row = dusk[-FOOT_ROWS - 4, :, 3] > 0
    cols = np.where(row)[0]
    left, right = cols[0], cols[-1]
    for img in (dusk, night):
        img[-FOOT_ROWS:, :left] = 0
        img[-FOOT_ROWS:, right + 1 :] = 0
    alpha = dusk[..., 3] > 0
    xs = np.where(alpha.any(axis=0))[0]
    ys = np.where(alpha.any(axis=1))[0]
    dusk = dusk[ys[0] :, xs[0] : xs[-1] + 1]
    night = night[ys[0] :, xs[0] : xs[-1] + 1]
    f = DOOR / door
    if abs(f - 1) <= KEEP_TOL:
        # arte original: já vai pronta para o build_background (dusk e night do mesmo recorte)
        night[..., 3] = np.where(dusk[..., 3] > 0, np.maximum(night[..., 3], 1), 0)
        Image.fromarray(dusk).save(bb.DRAFTS / f"{name}_dusk_fit.png")
        Image.fromarray(night).save(bb.DRAFTS / f"{name}_night_fit.png")
        return dusk.shape[1], dusk.shape[0], 1.0
    w, h = round(dusk.shape[1] * f), round(dusk.shape[0] * f)
    Image.fromarray(dusk).resize((w, h), Image.NEAREST).save(bb.DRAFTS / f"{name}_fit_nn.png")
    return w, h, f


def main() -> None:
    for name in SPEC:
        w, h, f = fit(name)
        flag = "  PASSA DO TOPO" if h > MAX_H else ""
        kind = "original" if f == 1.0 else "vai para o PixelLab"
        print(f"{name}: x{f:.2f} -> {w}x{h} ({kind}){flag}")


if __name__ == "__main__":
    main()
