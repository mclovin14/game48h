"""Cortes de som: passos soltos (um por pisada da animação) e trechos de outros sons.

Passos: assets/sounds/source/<arquivo>.wav (mono, 16 bits) -> assets/sounds/<pasta>/step_00.wav ...
        (apaga os cortes antigos da pasta).
Trechos: CLIPS, de um som de assets/sounds/ para outro arquivo.

Uso: PYTHONPATH=tools python3 tools/build_sfx.py
"""

import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SOUNDS = ROOT / 'assets' / 'sounds'

# pasta de saída -> (gravação, intervalo mínimo entre passos em s, duração máxima de um passo em s)
SOURCES = {
    'steps_walk': ('sneaker_footsteps_asphalt.wav', 0.35, 0.32),
    'steps_run': ('running_sneakers_on_asphalt.wav', 0.25, 0.24),
}
# arquivo de saída -> (som de origem em assets/sounds/, início e fim em s)
CLIPS = {
    # clique curto da recarga: gatilho sem bala
    'dry_fire.wav': ('colt_reload.wav', 0.635, 0.70),
}
WIN = 0.005  # janela do envelope (s)
ONSET_DB = -30  # o passo começa quando o envelope passa disto...
QUIET_DB = -42  # ...vindo de um trecho mais baixo que isto
PRE = 0.004  # folga antes do ataque (s)
FADE = 0.03  # fade de saída (s)


def read(path: Path) -> tuple[np.ndarray, int]:
    with wave.open(str(path)) as w:
        assert w.getnchannels() == 1 and w.getsampwidth() == 2, f'{path.name}: esperado mono 16 bits'
        sr = w.getframerate()
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    return a, sr


def write(path: Path, a: np.ndarray, sr: int) -> None:
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())


def onsets(a: np.ndarray, sr: int, min_gap: float) -> list[int]:
    """Início de cada passo (amostra): o envelope sobe de um trecho quieto para acima de ONSET_DB."""
    win = int(sr * WIN)
    n = len(a) // win
    db = 20 * np.log10(np.sqrt((a[: n * win].reshape(n, win) ** 2).mean(1)) + 1e-9)
    found: list[int] = []
    quiet = True  # o começo da gravação conta como silêncio
    for i, v in enumerate(db):
        if v < QUIET_DB:
            quiet = True
        if quiet and v > ONSET_DB and (not found or (i * win - found[-1]) / sr >= min_gap):
            found.append(i * win)
            quiet = False
    return found


def build(folder: str, source: str, min_gap: float, max_len: float) -> None:
    a, sr = read(SOUNDS / 'source' / source)
    starts = onsets(a, sr, min_gap)
    out = SOUNDS / folder
    out.mkdir(exist_ok=True)
    for old in out.glob('step_*.wav'):
        old.unlink()
    fade = int(sr * FADE)
    for i, s in enumerate(starts):
        s0 = max(0, s - int(sr * PRE))
        end = min(len(a), s0 + int(sr * max_len))
        if i + 1 < len(starts):
            end = min(end, starts[i + 1] - int(sr * PRE))
        clip = a[s0:end].copy()
        f = min(fade, len(clip))
        clip[-f:] *= np.linspace(1, 0, f)
        # mesmo pico em todos, para nenhum passo saltar no meio dos outros
        clip *= 0.7 / max(1e-6, np.abs(clip).max())
        write(out / f'step_{i:02d}.wav', clip, sr)
        print(f'{folder}/step_{i:02d}.wav  início {s / sr:5.2f} s  duração {len(clip) / sr * 1000:4.0f} ms')
    print(f'{folder}: {len(starts)} passos')


def cut(name: str, source: str, start: float, end: float) -> None:
    a, sr = read(SOUNDS / source)
    clip = a[int(start * sr) : int(end * sr)].copy()
    f = min(int(sr * FADE), len(clip))
    clip[-f:] *= np.linspace(1, 0, f)
    clip *= 0.7 / max(1e-6, np.abs(clip).max())
    write(SOUNDS / name, clip, sr)
    print(f'{name}: {len(clip) / sr * 1000:.0f} ms de {source}')


if __name__ == '__main__':
    for folder, (source, gap, length) in SOURCES.items():
        build(folder, source, gap, length)
    for name, (source, start, end) in CLIPS.items():
        cut(name, source, start, end)
