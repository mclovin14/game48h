"""Adriana: animações da cutscene (held, cry, freed, kneel, hug), todas viradas para East.

Base aprovada: assets/characters/adriana/adriana_base_east.png (opção A com o rosto refeito: nariz pequeno,
olhos verdes). A paleta de todas as animações é a dela.
Keyframes em drafts/keys/ (edit_image_pro_flash sobre a base, seed 1911):
  key_held  presa pelo braço esquerdo (puxado para trás), corpo inclinado para a frente
  key_cry   presa, com o braço direito estendido para a frente e a boca aberta
  key_run   no meio da passada, correndo
  key_kneel ajoelhada, sentada nos calcanhares, cabeça baixa
  key_hug   braços abertos para a frente
Brutos em drafts/raw/<anim>_N.png (animate_image, seed 77; o quadro 0 é a entrada):
  held:  key_held -> key_held (8 quadros, loop)
  cry:   key_held -> key_cry (6)
  freed: key_run -> key_run (8, loop)
  kneel: base -> key_kneel (8)
  hug:   base -> key_hug (6)
Cada quadro: remapeia para a paleta da base, tira ilhas soltas e aterra no chão (y=120).
Nos loops o último quadro da IA repete o primeiro e fica de fora.
No held a IA apaga o rosto (sem o olho verde, mancha escura no queixo): o rosto do quadro 0 (pele, olho,
boca e contorno, sem o cabelo) é colado em cada quadro, no deslocamento em que o topo da cabeça mais bate,
e o que a IA desenha na frente do rosto e embaixo do queixo é apagado.

Uso: PYTHONPATH=tools python3 tools/build_adriana.py
"""
from sprite_lib import load, remap, palette_of, ground, drop_islands, contact, save_anim, report, cm, locate, smooth_path, fill_holes

A = 'assets/characters/adriana'
RAW = f'{A}/drafts/raw'
FLOOR = 120
# nome: (quadros brutos usados, ms por quadro)
ANIMS = {
    'held': (range(0, 8), 110),
    'cry': (range(0, 7), 90),
    'freed': (range(0, 8), 80),
    'kneel': (range(0, 9), 110),
    'hug': (range(0, 7), 90),
}
# cores do cabelo (o resto da caixa do rosto é pele, olho, boca e contorno)
HAIR = [(63, 26, 16), (98, 35, 16), (120, 44, 19), (135, 53, 21), (165, 65, 25), (182, 73, 26), (206, 93, 41)]
FACE_BOX = {'held': (29, 44, 70, 83)}     # y0, y1, x0, x1 no quadro 0
HEAD_TOP = {'held': (24, 34, 62, 86)}     # topo da cabeça, para achar o deslocamento
FRONT_X = 76                              # da coluna 76 para a frente, o vazio do quadro 0 é ar


def frame(path, pal):
    a = remap(load(path), pal)
    drop_islands(a)
    return ground(a, FLOOR)


def fix_face(frames, name):
    """Cola o rosto do quadro 0 nos outros, seguindo o topo da cabeça (no máximo 1 px por quadro)."""
    y0, y1, x0, x1 = FACE_BOX[name]
    ref = frames[0]
    face = ref[y0:y1, x0:x1].copy()
    fm = (face[:, :, 3] > 0) & ~cm(face, HAIR)
    offs = [locate(f, ref, HEAD_TOP[name], rows=10, search=6) for f in frames]
    path = smooth_path(offs, start=(0, 0), end=(0, 0) if len(frames) > 2 else None)
    for f, (dy, dx) in list(zip(frames, path))[1:]:
        reg = f[y0 + dy:y1 + dy, x0 + dx:x1 + dx]
        reg[(reg[:, :, 3] > 0) & ~cm(reg, HAIR)] = 0
        # na frente do rosto e embaixo do queixo (vazio no quadro 0) a mancha da IA some
        front = face[:, :, 3] == 0
        front[:, :FRONT_X - x0] = False
        reg[front] = 0
        reg[fm] = face[fm]
        fill_holes(f, (y0 + dy - 1, y1 + dy + 1, x0 + dx - 1, x1 + dx + 2))
        drop_islands(f)
    print(name, 'rosto (dy, dx):', path)


def build():
    pal = palette_of(load(f'{A}/adriana_base_east.png'))
    rows = []
    for name, (idx, ms) in ANIMS.items():
        frames = [frame(f'{RAW}/{name}_{i}.png', pal) for i in idx]
        if name in FACE_BOX:
            fix_face(frames, name)
        save_anim(frames, f'{A}/{name}_east', f'{name}_east', f'{A}/adriana_{name}_east_sheet.png', f'{A}/adriana_{name}_east.gif', ms)
        report(f'{name}_east', frames, FLOOR, [tuple(c) for c in pal])
        rows.append(frames)
    contact(rows, f'{A}/drafts/anim_check.png', scale=2)
    contact(rows, f'{A}/drafts/anim_faces.png', crop=(40, 10, 100, 60), scale=5)


if __name__ == '__main__':
    build()
