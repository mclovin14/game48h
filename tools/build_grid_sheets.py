"""Remonta em grade (8 quadros por linha) as sheets de personagem que ainda estão em tira com mais de 8 quadros.

Tiras mais largas que ~1500 px chegavam reduzidas em algumas hospedagens e o Phaser ficava sem quadros.
Os scripts de animação já salvam em grade (sprite_lib.save_anim); este só converte as sheets antigas.
Uso: PYTHONPATH=tools python3 tools/build_grid_sheets.py
"""
from pathlib import Path

from PIL import Image
from sprite_lib import SHEET_COLS, sheet_frames, sheet_image

ROOTS = ['assets/player', 'assets/enemies', 'assets/characters']


def main() -> None:
    for root in ROOTS:
        for path in sorted(Path(root).rglob('*_sheet.png')):
            if 'drafts' in path.parts:
                continue
            w, h = Image.open(path).size
            if h != 128 or w <= 128 * SHEET_COLS:
                continue
            frames = sheet_frames(path)
            sheet_image([Image.fromarray(f, 'RGBA') for f in frames]).save(path)
            print(f'{path}: {len(frames)} quadros -> grade')


if __name__ == '__main__':
    main()
