"""Synthesize original, royalty-free background tracks (and a whoosh SFX).

Usage: python scripts/music.py
Writes public/<video>/music.wav and public/sfx/whoosh.wav.
"""
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import lfilter

ROOT = Path(__file__).resolve().parent.parent
SR = 44100
rng = np.random.default_rng(7)

NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}


def hz(name: str):
    m = re.match(r"([A-G]#?)(-?\d)", name)
    midi = NOTE[m.group(1)] + 12 * (int(m.group(2)) + 1)
    return 440.0 * 2 ** ((midi - 69) / 12)


def lowpass(x, cutoff):
    """One-pole low-pass; cutoff may be scalar or per-sample array."""
    if np.isscalar(cutoff):
        a = 1 - np.exp(-2 * np.pi * cutoff / SR)
        return lfilter([a], [1, a - 1], x)
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=np.float64), x.shape)
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def env(n, a=0.005, d=0.2, s=0.0, r=0.05, hold=None):
    t = np.arange(n) / SR
    hold = hold if hold is not None else n / SR
    e = np.where(t < a, t / max(a, 1e-6), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-6)))
    rel = np.clip(1 - (t - hold) / max(r, 1e-6), 0, 1)
    return e * np.where(t > hold, rel, 1)


def saw(f, n, detune=0.0):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for dt in ([0] if detune == 0 else [-detune, 0, detune]):
        ph = (t * f * (1 + dt)) % 1.0
        out += 2 * ph - 1
    return out / (1 if detune == 0 else 3)


def place(buf, sig, start):
    s = int(start * SR)
    if s >= len(buf):
        return
    e = min(len(buf), s + len(sig))
    buf[s:e] += sig[: e - s]


def kick(n=int(0.4 * SR)):
    t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7) * 1.0 + 0.15 * np.exp(-t * 300) * rng.standard_normal(n)


def snare(n=int(0.25 * SR)):
    t = np.arange(n) / SR
    noise = highpass(rng.standard_normal(n), 900) * np.exp(-t * 18)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)
    return 0.45 * noise + 0.4 * tone


def clap(n=int(0.3 * SR)):
    t = np.arange(n) / SR
    e = sum(np.exp(-np.clip(t - k * 0.009, 0, None) * 60) * (t >= k * 0.009) for k in range(3))
    return highpass(rng.standard_normal(n), 1200) * e * 0.35


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    t = np.arange(n) / SR
    return highpass(rng.standard_normal(n), 7000) * np.exp(-t * (14 if open_ else 70)) * 0.22


def shaker():
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    return highpass(rng.standard_normal(n), 5000) * np.sin(np.pi * t / t[-1]) * 0.07


def pad_chord(notes, dur, cutoff=1800, detune=0.006, attack=0.25):
    n = int(dur * SR)
    sig = sum(saw(hz(x), n, detune) for x in notes) / len(notes)
    sig = lowpass(sig, cutoff)
    return sig * env(n, a=attack, d=10, s=1, r=0.3, hold=dur - 0.3)


def pluck(note, dur=0.3, cutoff=3200):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = saw(hz(note), n, 0.004)
    sig = lowpass(sig, cutoff * np.exp(-t * 6) + 300)
    return sig * env(n, a=0.002, d=0.16, s=0.0)


def bell(note, dur=0.8):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(note)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 1.8 * np.exp(-t * 5)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 4) * 0.5


def bass_note(note, dur, cutoff=420, sub=True):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(note)
    sig = lowpass(saw(f, n), cutoff + 900 * np.exp(-t * 14))
    if sub:
        sig = 0.6 * sig + 0.6 * np.sin(2 * np.pi * f * t)
    return sig * env(n, a=0.004, d=0.4, s=0.6, r=0.04, hold=dur - 0.04)


def delay(x, time, fb=0.35, mix=0.25):
    d = int(time * SR)
    y = x.copy()
    for k in range(1, 5):
        if d * k >= len(x):
            break
        y[d * k:] += x[: len(x) - d * k] * (fb ** k) * mix / fb
    return y


def reverb(x, mix=0.18):
    y = x.copy()
    for t, g in [(0.029, 0.5), (0.037, 0.45), (0.041, 0.4), (0.053, 0.35), (0.067, 0.3), (0.089, 0.25)]:
        y += delay(x, t, fb=g, mix=g) * mix
    return lowpass(y, 9000)


def sidechain(length, bpm, depth=0.55):
    beat = 60 / bpm
    t = np.arange(length) / SR
    ph = (t % beat) / beat
    return 1 - depth * np.exp(-ph * 9)


def riser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    cutoff = 300 + 6000 * (t / dur) ** 2
    return lowpass(noise, cutoff) * (t / dur) ** 1.5 * 0.25


def render(style, seconds):
    bpm, chords, bass_root, arp = style["bpm"], style["chords"], style["bass"], style.get("arp")
    beat = 60 / bpm
    bar = 4 * beat
    n = int(seconds * SR)
    drums = np.zeros(n)
    music = np.zeros(n)
    bass = np.zeros(n)
    lead = np.zeros(n)
    bars = int(np.ceil(seconds / bar))
    end_bar = bars - 1
    for b in range(bars):
        t0 = b * bar
        chord = chords[b % len(chords)]
        root = bass_root[b % len(bass_root)]
        intro = b == 0
        outro = b == end_bar
        # chords
        if style["chord_type"] == "pad":
            place(music, pad_chord(chord, bar + 0.2, cutoff=style.get("cutoff", 1800)) * 0.5, t0)
        else:
            for k, pos in enumerate([0, 1.5, 2.5, 3.5] if not intro else [0]):
                place(music, sum(pluck(x, 0.35, style.get("cutoff", 3200)) for x in chord) / len(chord) * 0.7, t0 + pos * beat)
            place(music, pad_chord(chord, bar + 0.2, cutoff=900, attack=0.4) * 0.22, t0)
        if outro:
            continue
        # drums
        if not intro:
            for k in range(4):
                if style["kick"] == "four" or k in (0, 2):
                    place(drums, kick() * 0.9, t0 + k * beat)
                if style["kick"] == "lofi" and k == 2:
                    place(drums, kick() * 0.6, t0 + (k + 0.75) * beat)
                if k in (1, 3):
                    place(drums, (clap() if style.get("clap") else snare()) * 0.8, t0 + k * beat)
            for k in range(8):
                swing = style.get("swing", 0) * beat if k % 2 else 0
                place(drums, hat(open_=(style["kick"] == "four" and k % 2 == 1)), t0 + k * beat / 2 + swing)
            if style.get("shaker"):
                for k in range(16):
                    place(drums, shaker(), t0 + k * beat / 4)
        else:
            place(music, riser(bar), t0)
        # bass
        if not intro:
            pattern = style["bass_pattern"]
            for pos, octave_up in pattern:
                note = root[:-1] + str(int(root[-1]) + (1 if octave_up else 0))
                place(bass, bass_note(note, beat * 0.45) * 0.55, t0 + pos * beat)
        # arp / lead
        if arp and not intro:
            steps = arp["steps"]
            for k in range(steps):
                note = chord[k % len(chord)]
                note = note[:-1] + str(int(note[-1]) + arp.get("octave", 1))
                gen = bell if arp["sound"] == "bell" else pluck
                place(lead, gen(note, 0.4) * arp.get("gain", 0.25), t0 + k * bar / steps)
    sc = sidechain(n, bpm, style.get("sidechain", 0.45))
    lead = delay(lead, beat * 0.75, fb=0.35, mix=0.4)
    mix = drums * 0.8 + bass * sc + reverb(music * sc, 0.25) * 0.8 + reverb(lead, 0.3) * 0.8
    # fade in/out
    t = np.arange(n) / SR
    mix *= np.clip(t / 0.3, 0, 1) * np.clip((seconds - t) / 2.0, 0, 1)
    mix = np.tanh(mix * 1.2)
    mix /= np.abs(mix).max()
    stereo = np.stack([mix, delay(mix, 0.012, fb=0.1, mix=0.1)], axis=1)
    return (stereo * 0.85).astype(np.float32)


STYLES = {
    # Bright, funky kitchen pop
    "frigideira": {
        "bpm": 116, "chord_type": "pluck", "cutoff": 3600, "kick": "two", "clap": True, "swing": 0.06,
        "shaker": True, "sidechain": 0.3,
        "chords": [["C4", "E4", "G4", "B4"], ["A3", "C4", "E4", "G4"], ["F3", "A3", "C4", "E4"], ["G3", "B3", "D4", "F4"]],
        "bass": ["C2", "A1", "F1", "G1"],
        "bass_pattern": [(0, False), (0.75, False), (1.5, True), (2, False), (2.75, False), (3.5, True)],
        "arp": {"steps": 8, "sound": "bell", "octave": 1, "gain": 0.18},
    },
    # Modern, driving electronic for tech
    "inversor": {
        "bpm": 124, "chord_type": "pad", "cutoff": 1600, "kick": "four", "clap": True, "sidechain": 0.6,
        "chords": [["A3", "C4", "E4", "G4"], ["F3", "A3", "C4", "E4"], ["C4", "E4", "G4", "B4"], ["G3", "B3", "D4", "F#4"]],
        "bass": ["A1", "F1", "C2", "G1"],
        "bass_pattern": [(k * 0.5 + 0.5, False) for k in range(0, 8, 2)] + [(k * 0.5 + 0.25, False) for k in range(1, 8, 4)],
        "arp": {"steps": 16, "sound": "pluck", "octave": 1, "gain": 0.22},
    },
    # Soft, airy lo-fi for skincare
    "skincare": {
        "bpm": 96, "chord_type": "pad", "cutoff": 1300, "kick": "lofi", "clap": False, "swing": 0.12,
        "sidechain": 0.25,
        "chords": [["F3", "A3", "C4", "E4"], ["D3", "F3", "A3", "C4"], ["A#2", "D3", "F3", "A3"], ["C3", "E3", "G3", "B3"]],
        "bass": ["F1", "D1", "A#0", "C1"],
        "bass_pattern": [(0, False), (2.5, False)],
        "arp": {"steps": 8, "sound": "bell", "octave": 2, "gain": 0.14},
    },
}


def whoosh(dur=0.45):
    n = int(dur * SR)
    t = np.arange(n) / SR
    cutoff = 400 + 5000 * np.sin(np.pi * t / dur) ** 2
    sig = lowpass(rng.standard_normal(n), cutoff) * np.sin(np.pi * t / dur) ** 2
    sig /= np.abs(sig).max()
    return np.stack([sig, sig], axis=1).astype(np.float32) * 0.7


def pop(dur=0.12):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 900 * np.exp(-t * 18) + 300
    sig = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30)
    return np.stack([sig, sig], axis=1).astype(np.float32) * 0.6


def main():
    for video, style in STYLES.items():
        gen = (ROOT / "src" / "generated" / f"{video}.ts").read_text()
        total_ms = int(re.search(r'"totalMs": (\d+)', gen).group(1))
        audio = render(style, total_ms / 1000 + 0.5)
        sf.write(ROOT / "public" / video / "music.wav", audio, SR)
        print(video, "music", audio.shape[0] / SR)
    (ROOT / "public" / "sfx").mkdir(exist_ok=True)
    sf.write(ROOT / "public" / "sfx" / "whoosh.wav", whoosh(), SR)
    sf.write(ROOT / "public" / "sfx" / "pop.wav", pop(), SR)


if __name__ == "__main__":
    main()
