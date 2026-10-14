"""Recarga rápida do Kael (plano playtest_fixes_1.md, fase 6).

Encurta os silêncios do colt_reload.wav (2,08 s) sem mudar o tom e gera colt_reload_fast.wav (~1,21 s).
Os estalos ficam inteiros: tirar o pente (0-150 ms), mexer nele (600-800), encaixar (1150-1300), puxar o ferrolho (1820-2080).
Imprime também os tempos dos 11 quadros da reload_gun no mesmo mapa, só de referência: os de humanoid.ts (KAEL.overrides)
foram alisados à mão, com o pente entrando no quadro 6 junto do clique (~690 ms).

Uso: PYTHONPATH=tools python3 tools/build_reload_sfx.py
"""
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets/sounds/colt_reload.wav'
OUT = ROOT / 'assets/sounds/colt_reload_fast.wav'

# mapa do tempo original (ms) para o novo: trechos com som ficam iguais, cada silêncio cai para 150 ms
ANCHORS = [(0, 0), (150, 150), (600, 300), (800, 500), (1150, 650), (1300, 800), (1820, 950), (2080, 1210)]
FADE_MS = 10
FRAMES, FRAME_MS = 11, 190


def remap(t: float) -> float:
    for (a0, b0), (a1, b1) in zip(ANCHORS, ANCHORS[1:]):
        if t <= a1:
            return b0 + (t - a0) * (b1 - b0) / (a1 - a0)
    return ANCHORS[-1][1] + t - ANCHORS[-1][0]


def main() -> None:
    w = wave.open(str(SRC))
    rate = w.getframerate()
    a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)
    ms = lambda t: int(round(t * rate / 1000))
    fade = ms(FADE_MS)
    out = np.zeros(ms(ANCHORS[-1][1]) + fade, dtype=np.float32)
    for (a0, b0), (a1, b1) in zip(ANCHORS, ANCHORS[1:]):
        if a1 - a0 == b1 - b0:
            # trecho com som: copia inteiro
            seg = a[ms(a0):ms(a1)]
            out[ms(b0):ms(b0) + len(seg)] += seg
        else:
            # silêncio: guarda a metade do começo e a do fim, com fade cruzado no meio
            half = (b1 - b0) / 2
            head = a[ms(a0):ms(a0 + half) + fade].copy()
            tail = a[ms(a1 - half) - fade:ms(a1)].copy()
            head[-fade:] *= np.linspace(1, 0, fade)
            tail[:fade] *= np.linspace(0, 1, fade)
            out[ms(b0):ms(b0) + len(head)] += head
            start = ms(b1) - len(tail)
            out[start:start + len(tail)] += tail
    out = np.clip(out[:ms(ANCHORS[-1][1])], -32768, 32767).astype(np.int16)
    o = wave.open(str(OUT), 'wb')
    o.setnchannels(1)
    o.setsampwidth(2)
    o.setframerate(rate)
    o.writeframes(out.tobytes())
    o.close()
    print(f'{OUT.name}: {len(out) / rate * 1000:.0f} ms')
    starts = [remap(i * FRAME_MS) for i in range(FRAMES)] + [ANCHORS[-1][1]]
    print('reload_gun ms:', [round(b - a) for a, b in zip(starts, starts[1:])])


if __name__ == '__main__':
    main()
