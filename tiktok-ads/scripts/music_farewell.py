"""Synthesize an original, nostalgic farewell track (piano + strings + music box).

Usage: python scripts/music_farewell.py [seconds]   (default 48)
Writes public/retrospectiva/music.wav

Progression vi-IV-I-V in C (Am F C G), 68 BPM, ending on F - G - C.
Structure: piano alone -> strings enter -> music-box melody -> final resolve.
"""
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter

ROOT = Path(__file__).resolve().parent.parent
SR = 44100
rng = np.random.default_rng(2026)
NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}


def hz(name):
    pitch, octave = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((NOTE[pitch] + 12 * (octave + 1) - 69) / 12)


def lowpass(x, cutoff):
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    return lfilter([a], [1, a - 1], x)


def place(buf, sig, t):
    s = int(t * SR)
    if s >= len(buf):
        return
    e = min(len(buf), s + len(sig))
    buf[s:e] += sig[: e - s]


def piano(note, dur=3.0, vel=0.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(note)
    sig = np.zeros(n)
    for k, amp in enumerate([1.0, 0.45, 0.25, 0.12, 0.07, 0.04], start=1):
        inharm = 1 + 0.0004 * k * k
        decay = 1.6 + k * 0.9
        sig += amp * np.sin(2 * np.pi * f * k * inharm * t) * np.exp(-t * decay)
    attack = np.clip(t / 0.004, 0, 1)
    hammer = lowpass(rng.standard_normal(n), 2500) * np.exp(-t * 80) * 0.05
    out = (sig * attack + hammer) * vel
    return lowpass(out, 3800) * np.clip((dur - t) / 0.3, 0, 1)


def strings(notes, dur, cutoff=1100):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for note in notes:
        f = hz(note)
        for d in (-0.004, 0.0, 0.0045):
            vib = 1 + 0.002 * np.sin(2 * np.pi * 5.2 * t + rng.random() * 6)
            ph = np.cumsum(f * (1 + d) * vib) / SR
            sig += 2 * (ph % 1.0) - 1
    sig = lowpass(lowpass(sig / (len(notes) * 3), cutoff), cutoff * 1.5)
    env = np.clip(t / 1.4, 0, 1) * np.clip((dur - t) / 1.2, 0, 1)
    return sig * env


def music_box(note, dur=2.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(note)
    sig = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 4.02 * t) * np.exp(-t * 6) + 0.15 * np.sin(2 * np.pi * f * 6.9 * t) * np.exp(-t * 9)
    return sig * np.exp(-t * 2.2) * np.clip(t / 0.002, 0, 1) * 0.35


def comb(x, delay_s, g):
    d = int(delay_s * SR)
    a = np.zeros(d + 1)
    a[0], a[-1] = 1, -g
    return lfilter([1], a, x)


def allpass(x, delay_s, g):
    d = int(delay_s * SR)
    b = np.zeros(d + 1)
    a = np.zeros(d + 1)
    b[0], b[-1] = -g, 1
    a[0], a[-1] = 1, -g
    return lfilter(b, a, x)


def reverb(x, size=1.0):
    wet = sum(comb(x, dt * size, g) for dt, g in [(0.0297, 0.84), (0.0371, 0.83), (0.0411, 0.82), (0.0437, 0.81), (0.0533, 0.8), (0.0617, 0.79)]) / 6
    for dt, g in [(0.005, 0.7), (0.0017, 0.7), (0.0123, 0.6)]:
        wet = allpass(wet, dt, g)
    return lowpass(wet, 5000)


def vinyl(n):
    crackle = np.zeros(n)
    pops = rng.random(n) < 0.00035
    crackle[pops] = rng.standard_normal(pops.sum()) * 0.6
    crackle = lowpass(crackle, 3000)
    hiss = lowpass(rng.standard_normal(n), 6000) * 0.006
    return crackle * 0.15 + hiss


def main():
    seconds = float(sys.argv[1]) if len(sys.argv) > 1 else 48.0
    bpm = 68
    beat = 60 / bpm
    bar = 4 * beat
    n = int(seconds * SR)
    pno = np.zeros(n)
    strg = np.zeros(n)
    box = np.zeros(n)

    prog = [
        (["A2", "A3"], ["C4", "E4", "A4"], ["A3", "C4", "E4"]),
        (["F2", "F3"], ["A3", "C4", "F4"], ["F3", "A3", "C4"]),
        (["C3", "C4"], ["E4", "G4", "C5"], ["C4", "E4", "G4"]),
        (["G2", "G3"], ["B3", "D4", "G4"], ["G3", "B3", "D4"]),
    ]
    # Melody per bar (beat offset, note); repeats with a variation.
    melody = [
        [(0, "E5"), (1, "C5"), (2, "B4"), (3, "C5")],
        [(0, "A4"), (1.5, "C5"), (2.5, "F5"), (3.5, "E5")],
        [(0, "G5"), (1, "E5"), (2, "D5"), (3, "C5")],
        [(0, "D5"), (2, "B4"), (3, "D5")],
    ]
    total_bars = int((seconds - 6) // bar)  # leave room for the final ringing chord
    final_bar = total_bars
    for b in range(total_bars):
        t0 = b * bar
        bass, upper, pad = prog[b % 4]
        if b == total_bars - 2:
            bass, upper, pad = prog[1]  # F
        if b == total_bars - 1:
            bass, upper, pad = prog[3]  # G (dominant) before the resolve
        # piano: bass octave on 1, broken chord across the bar
        place(pno, sum(piano(x, 4.0, 0.33) for x in bass), t0)
        arp = upper + [upper[1]]
        for k, note in enumerate(arp):
            place(pno, piano(note, 3.0, 0.32 if k else 0.36), t0 + (k + 0.5) * beat * 0.95 + k * 0.012)
        if b >= 2:
            place(strg, strings(pad, bar + 1.2), t0)
        if 4 <= b < total_bars - 2:
            for pos, note in melody[b % 4]:
                place(box, music_box(note), t0 + pos * beat)
    # final resolve: C major, ringing out
    tf = final_bar * bar
    place(pno, sum(piano(x, 6.0, 0.4) for x in ["C3", "G3", "C4", "E4", "G4", "C5"]), tf)
    place(strg, strings(["C4", "E4", "G4"], 6.0, 900), tf)
    place(box, music_box("C6", 4.0), tf + 0.3)

    dry = pno * 0.9 + strg * 0.38 + box * 0.55
    wet = reverb(dry, 1.3)
    mix = dry * 0.7 + wet * 0.9 + vinyl(n)
    t = np.arange(n) / SR
    mix *= np.clip(t / 1.5, 0, 1) * np.clip((seconds - t) / 2.5, 0, 1)
    hb, ha = butter(2, 75 / (SR / 2), btype='high')
    mix = lfilter(hb, ha, mix)
    mix = np.tanh(mix * 1.1)
    mix /= np.abs(mix).max()
    left = mix
    right = np.concatenate([np.zeros(int(0.011 * SR)), mix[: n - int(0.011 * SR)]]) * 0.92 + mix * 0.08
    out = ROOT / "public" / "retrospectiva"
    out.mkdir(parents=True, exist_ok=True)
    sf.write(out / "music.wav", (np.stack([left, right], axis=1) * 0.85).astype(np.float32), SR)
    print(f"music.wav {seconds:.1f}s, {total_bars} bars + final chord at {tf:.1f}s")


if __name__ == "__main__":
    main()
