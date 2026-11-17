"""Original nostalgic lo-fi track for the highlights edit, laid out on the EDL's sections.

Usage: python scripts/music_highlights.py
Reads src/melhores/edl.json (bpm + sections) and writes public/trilhas/melhores-momentos.wav.

Fmaj7 - Em7 - Dm7 - Cmaj7, electric-piano chords with tape wobble, swung lo-fi
drums, bass, a bell melody over the photos, a drumless "saudade" breakdown and
a final ringing chord.
"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter

ROOT = Path(__file__).resolve().parent.parent
SR = 44100
rng = np.random.default_rng(90)
NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}


def hz(name):
    return 440.0 * 2 ** ((NOTE[name[:-1]] + 12 * (int(name[-1]) + 1) - 69) / 12)


def lp(x, cutoff):
    if not np.isscalar(cutoff):  # time-varying cutoff (used by the riser)
        a = 1 - np.exp(-2 * np.pi * np.asarray(cutoff) / SR)
        y = np.empty_like(x)
        acc = 0.0
        for i in range(len(x)):
            acc += a[i] * (x[i] - acc)
            y[i] = acc
        return y
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    return lfilter([a], [1, a - 1], x)


def hp(x, cutoff, order=2):
    b, a = butter(order, cutoff / (SR / 2), btype="high")
    return lfilter(b, a, x)


def place(buf, sig, t):
    s = int(t * SR)
    if s >= len(buf) or s < 0:
        return
    e = min(len(buf), s + len(sig))
    buf[s:e] += sig[: e - s]


def rhodes(note, dur, vel=0.5, wobble=True):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(note)
    wob = 1 + (0.0025 * np.sin(2 * np.pi * 0.6 * t + rng.random() * 6) if wobble else 0)
    ph = 2 * np.pi * np.cumsum(f * wob) / SR
    index = 1.6 * np.exp(-t * 3.5) + 0.25
    sig = np.sin(ph + index * np.sin(ph)) + 0.25 * np.sin(2 * ph) * np.exp(-t * 2)
    env = np.clip(t / 0.006, 0, 1) * np.exp(-t * 0.9) * np.clip((dur - t) / 0.25, 0, 1)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.2 * t)
    return sig * env * trem * vel


def chord(notes, dur, vel=0.18):
    return sum(rhodes(x, dur, vel) for x in notes)


def pad(notes, dur, cutoff=900):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for note in notes:
        for d in (-0.004, 0.0, 0.005):
            ph = np.cumsum(np.full(n, hz(note) * (1 + d))) / SR
            sig += 2 * (ph % 1.0) - 1
    sig = lp(lp(sig / (len(notes) * 3), cutoff), cutoff * 1.4)
    return sig * np.clip(t / 1.2, 0, 1) * np.clip((dur - t) / 1.0, 0, 1)


def bell(note, dur=1.6, vel=0.3):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(note)
    mod = np.sin(2 * np.pi * f * 3.0 * t) * 1.2 * np.exp(-t * 4)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 2.4) * vel


def kick():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 42 + 80 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5) * 0.9


def snare():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    noise = lp(hp(rng.standard_normal(n), 1200), 6000) * np.exp(-t * 16)
    body = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 24)
    return (noise * 0.4 + body * 0.35) * 0.8


def hat(open_=False):
    n = int((0.22 if open_ else 0.05) * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7500) * np.exp(-t * (12 if open_ else 60)) * 0.16


def bass(note, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(note)
    sig = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) * np.exp(-t * 4)
    return sig * np.clip(t / 0.01, 0, 1) * np.clip((dur - t) / 0.06, 0, 1) * 0.5


def vinyl(n):
    c = np.zeros(n)
    pops = rng.random(n) < 0.0004
    c[pops] = rng.standard_normal(pops.sum())
    return lp(c, 3500) * 0.12 + lp(rng.standard_normal(n), 5000) * 0.005


def comb(x, delay_s, g):
    d = int(delay_s * SR)
    a = np.zeros(d + 1)
    a[0], a[-1] = 1, -g
    return lfilter([1], a, x)


def reverb(x):
    wet = sum(comb(x, dt, g) for dt, g in [(0.0297, 0.82), (0.0371, 0.81), (0.0411, 0.8), (0.0437, 0.79), (0.0533, 0.78)]) / 5
    return lp(wet, 4500)


PROG = [
    (["F3", "A3", "C4", "E4"], "F1"),
    (["E3", "G3", "B3", "D4"], "E1"),
    (["D3", "F3", "A3", "C4"], "D1"),
    (["C3", "E3", "G3", "B3"], "C2"),
]
MELODY = [  # (beat, note) per bar, bell over the photos
    [(0, "C6"), (1.5, "A5"), (2.5, "G5")],
    [(0, "B5"), (1, "G5"), (2, "E5"), (3, "D5")],
    [(0, "F5"), (1.5, "A5"), (2.5, "C6")],
    [(0, "B5"), (2, "G5")],
]
SAD_MELODY = [
    [(0, "E5"), (2, "C5")],
    [(0, "D5"), (2, "B4")],
    [(0, "C5"), (1, "A4"), (2, "F4")],
    [(0, "G4"), (2, "E4")],
]


def main():
    edl = json.loads((ROOT / "src" / "melhores" / "edl.json").read_text())
    bpm = edl["bpm"]
    beat = 60 / bpm
    bar = 4 * beat
    sec = {s["name"]: (s["fromBar"], s["fromBar"] + s["bars"]) for s in edl["sections"]}
    total_bars = max(e for _, e in sec.values())
    seconds = total_bars * bar + 2.5
    n = int(seconds * SR)
    keys, drums, low, lead, pads = (np.zeros(n) for _ in range(5))

    def in_sec(b, name):
        a, e = sec[name]
        return a <= b < e

    for b in range(total_bars):
        t0 = b * bar
        notes, root = PROG[b % 4]
        final = in_sec(b, "final")
        if final:
            if b == sec["final"][0]:
                place(keys, chord(["F3", "A3", "C4", "E4", "G4"], bar * 2 + 2.5, 0.2), t0)
                place(pads, pad(["C4", "E4", "G4"], bar * 2 + 2.5, 800), t0)
                place(lead, bell("C6", 3.5, 0.25), t0 + beat * 2)
            continue
        sad = in_sec(b, "saudade")
        intro = in_sec(b, "abertura")
        # chords: on 1 and the "and" of 3 (lo-fi push)
        place(keys, chord(notes, beat * 2.4, 0.16 if not sad else 0.2), t0)
        place(keys, chord(notes, beat * 1.6, 0.11), t0 + beat * 2.5)
        if sad or intro:
            place(pads, pad(notes, bar + 0.6, 700 if intro else 1000), t0)
        if not (sad or intro):
            swing = beat * 0.08
            for k in range(4):
                if k in (0,) or (k == 2 and b % 2):
                    place(drums, kick(), t0 + k * beat)
                if k == 2 and not b % 2:
                    place(drums, kick() * 0.8, t0 + 2.5 * beat)
                if k in (1, 3):
                    place(drums, snare(), t0 + k * beat + 0.012)
            for k in range(8):
                place(drums, hat(open_=in_sec(b, "noite") and k == 7), t0 + k * beat / 2 + (swing if k % 2 else 0))
            place(low, bass(root, beat * 1.8), t0)
            place(low, bass(root[:-1] + str(int(root[-1]) + 1), beat * 0.8), t0 + beat * 2.5)
            place(low, bass(root, beat * 0.9), t0 + beat * 3)
        if in_sec(b, "noite"):
            for k in range(8):
                note = notes[k % 4]
                place(lead, bell(note[:-1] + str(int(note[-1]) + 2), 0.5, 0.08), t0 + k * beat / 2)
        if in_sec(b, "fotos"):
            for pos, note in MELODY[b % 4]:
                place(lead, bell(note, 1.6, 0.28), t0 + pos * beat)
        if sad:
            for pos, note in SAD_MELODY[b % 4]:
                place(lead, rhodes(note, 2.2, 0.22), t0 + pos * beat)
        if b == sec["abertura"][1] - 1:  # riser into the beat
            m = int(bar * SR)
            tt = np.arange(m) / SR
            place(pads, lp(rng.standard_normal(m), 300 + 5000 * (tt / bar) ** 2) * (tt / bar) ** 2 * 0.25, t0)

    dry = keys * 0.9 + drums * 0.75 + low * 0.8 + lead * 0.8 + pads * 0.35
    wet = reverb(keys * 0.7 + lead + pads * 0.5)
    mix = dry + wet * 0.55 + vinyl(n)
    # lo-fi tone: gentle high cut and low cut
    mix = hp(lp(mix, 9000), 45)
    t = np.arange(n) / SR
    mix *= np.clip(t / 0.4, 0, 1) * np.clip((seconds - t) / 2.0, 0, 1)
    mix = np.tanh(mix * 1.2)
    mix /= np.abs(mix).max()
    right = np.concatenate([np.zeros(int(0.012 * SR)), mix[: n - int(0.012 * SR)]]) * 0.9 + mix * 0.1
    (ROOT / "public" / "trilhas").mkdir(exist_ok=True)
    sf.write(ROOT / "public" / "trilhas" / "melhores-momentos.wav", (np.stack([mix, right], 1) * 0.88).astype(np.float32), SR)
    print(f"music.wav {seconds:.1f}s ({total_bars} bars @ {bpm} BPM)")


if __name__ == "__main__":
    main()
