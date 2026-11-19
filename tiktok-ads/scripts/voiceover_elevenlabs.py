"""Generate humanized pt-BR narration with ElevenLabs + exact word timings.

Usage:
  ELEVENLABS_API_KEY=... python scripts/voiceover_elevenlabs.py frigideira=<voice_id> inversor=<voice_id> skincare=<voice_id>

For each video this writes the same outputs as voiceover.py:
  public/<video>/voice.wav     - narration (normalized to -15 LUFS)
  src/generated/<video>.ts     - scene boundaries + Caption[] from ElevenLabs' character alignment

Each scene is one request (with previous/next text for natural prosody across
scenes). The `/with-timestamps` endpoint returns per-character timings, which
are grouped into words, so captions follow the real speech exactly.
"""
import base64
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = "https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128"
MODEL = os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2")
LEAD_IN = 0.45
SCENE_GAP = 0.28
TAIL = 2.2
SR = 44100


def tts(text, voice, prev_text, next_text, settings):
    body = {
        "text": text,
        "model_id": MODEL,
        "voice_settings": settings,
    }
    if prev_text:
        body["previous_text"] = prev_text
    if next_text:
        body["next_text"] = next_text
    req = urllib.request.Request(
        API.format(voice=voice),
        data=json.dumps(body).encode(),
        headers={
            "xi-api-key": os.environ.get("ELEVENLABS_API_KEY", "proxy-injected"),
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read())


def decode_mp3(data: bytes, path: Path):
    path.write_bytes(data)
    out = path.with_suffix(".raw")
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", str(out)],
        check=True,
    )
    import numpy as np

    return np.fromfile(out, dtype=np.float32)


def words_from_alignment(al):
    """Group character timings into (word, start, end)."""
    chars = al["characters"]
    starts = al["character_start_times_seconds"]
    ends = al["character_end_times_seconds"]
    words, cur, s, e = [], "", None, None
    for ch, cs, ce in zip(chars, starts, ends):
        if ch.isspace():
            if cur:
                words.append((cur, s, e))
            cur, s, e = "", None, None
            continue
        if s is None:
            s = cs
        cur += ch
        e = ce
    if cur:
        words.append((cur, s, e))
    return words


def main():
    import numpy as np
    import soundfile as sf

    voices = dict(arg.split("=", 1) for arg in sys.argv[1:])
    config = json.loads((ROOT / "scripts" / "scripts.json").read_text())
    tmp = Path(tempfile.mkdtemp())

    for video, cfg in config.items():
        if video not in voices:
            continue
        settings = cfg.get("eleven_settings", {"stability": 0.4, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True, "speed": 1.05})
        texts = [s.get("eleven", s["text"]) for s in cfg["scenes"]]
        chunks = [np.zeros(int(LEAD_IN * SR), dtype=np.float32)]
        t = LEAD_IN
        captions, scenes = [], []
        for i, scene in enumerate(cfg["scenes"]):
            res = tts(texts[i], voices[video], " ".join(texts[:i])[-500:], texts[i + 1] if i + 1 < len(texts) else "", settings)
            audio = decode_mp3(base64.b64decode(res["audio_base64"]), tmp / f"{video}-{i}.mp3")
            spoken = words_from_alignment(res["alignment"])
            shown = scene["text"].split()
            if len(spoken) != len(shown):
                raise SystemExit(f"{video}/{scene['id']}: {len(spoken)} spoken words vs {len(shown)} caption words")
            # Trim leading/trailing silence using the alignment.
            a = max(0.0, spoken[0][1] - 0.04)
            b = min(len(audio) / SR, spoken[-1][2] + 0.12)
            audio = audio[int(a * SR): int(b * SR)]
            scene_start = t
            for (w, ws, we), label in zip(spoken, shown):
                captions.append({
                    "text": (" " if captions else "") + label,
                    "startMs": round((t + ws - a) * 1000),
                    "endMs": round((t + we - a) * 1000),
                    "timestampMs": round((t + (ws + we) / 2 - a) * 1000),
                    "confidence": None,
                })
            chunks.append(audio)
            t += len(audio) / SR
            chunks.append(np.zeros(int(SCENE_GAP * SR), dtype=np.float32))
            t += SCENE_GAP
            captions[-1]["pageBreakAfter"] = True
            scenes.append({"id": scene["id"], "startMs": round(scene_start * 1000), "endMs": round(t * 1000)})

        chunks.append(np.zeros(int(TAIL * SR), dtype=np.float32))
        t += TAIL
        scenes[-1]["endMs"] = round(t * 1000)
        out_dir = ROOT / "public" / video
        raw = tmp / f"{video}-voice.wav"
        sf.write(raw, np.concatenate(chunks), SR)
        subprocess.run(
            ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(raw), "-af",
             "highpass=f=70,loudnorm=I=-15:TP=-1.5:LRA=9", "-ar", str(SR), str(out_dir / "voice.wav")],
            check=True,
        )
        data = {"totalMs": round(t * 1000), "scenes": scenes, "captions": captions}
        ts = (
            "// Generated by scripts/voiceover_elevenlabs.py - do not edit by hand.\n"
            "import type {Caption} from '@remotion/captions';\n\n"
            f"export const {video}Voice: {{totalMs: number; scenes: {{id: string; startMs: number; endMs: number}}[]; captions: Caption[]}} = "
            + json.dumps(data, ensure_ascii=False, indent=1)
            + ";\n"
        )
        (ROOT / "src" / "generated" / f"{video}.ts").write_text(ts)
        print(f"{video}: {t:.1f}s, {len(captions)} words")


if __name__ == "__main__":
    main()
