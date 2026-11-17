"""Cut the highlight clips listed in src/melhores/edl.json.

Usage: python scripts/cut_clips.py [clip_id ...]

Each clip is trimmed from public/melhores/<src>, rotated if needed, re-timed
(speed > 1 = fast, < 1 = slow motion), framed to 1080x1920 and written as
H.264 30fps (no audio) to public/melhores/clips/<id>.mp4, with a duration of
exactly `beats` beats at the EDL tempo, so every cut lands on the music.

Slow motion uses the real extra frames of 50-60fps sources; for lower frame
rates, motion-compensated interpolation (minterpolate) synthesizes them.
"""
import json
import subprocess
import sys
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / "public" / "melhores"
OUT = MEDIA / "clips"
W, H, FPS = 1080, 1920, 30


def src_fps(path: Path) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=avg_frame_rate", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout.strip().rstrip(",")
    return float(Fraction(r))


def build(clip, beat):
    out_dur = clip["beats"] * beat
    speed = clip.get("speed", 1)
    span = out_dur * speed
    src = MEDIA / clip["src"]
    fps_in = src_fps(src)

    chain = []
    if clip.get("rotate") == 90:
        chain.append("transpose=1")
    elif clip.get("rotate") == -90:
        chain.append("transpose=2")

    if clip.get("fit") == "contain":
        frame = (
            f"split[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},gblur=sigma=40,eq=brightness=-0.12[bg];"
            f"[b]scale={W}:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2"
        )
    else:
        frame = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}"
    chain.append(frame)

    # Effective output frame rate if we only stretch time: fps_in * speed.
    if speed < 1 and fps_in * speed < FPS - 1:
        target = max(60, round(FPS / speed))
        chain.append(f"minterpolate=fps={target}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1")
    chain.append(f"setpts=(PTS-STARTPTS)/{speed}")
    chain.append(f"fps={FPS}")
    chain.append("format=yuv420p")

    out = OUT / f"{clip['id']}.mp4"
    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-ss", f"{clip['in']:.3f}", "-t", f"{span + 0.4:.3f}", "-i", str(src),
        "-filter_complex", ",".join(chain),
        "-t", f"{out_dur:.4f}", "-an",
        "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-r", str(FPS),
        str(out),
    ]
    subprocess.run(cmd, check=True)
    return out, out_dur, fps_in


def main():
    edl = json.loads((ROOT / "src" / "melhores" / "edl.json").read_text())
    beat = 60 / edl["bpm"]
    only = set(sys.argv[1:])
    OUT.mkdir(parents=True, exist_ok=True)
    for clip in edl["clips"]:
        if "src" not in clip or (only and clip["id"] not in only):
            continue
        out, dur, fps_in = build(clip, beat)
        print(f"{clip['id']} {clip['src']} {fps_in:.1f}fps x{clip.get('speed', 1)} -> {dur:.2f}s  {clip.get('note', '')}", flush=True)


if __name__ == "__main__":
    main()
