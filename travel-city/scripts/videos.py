"""Download each city's Pexels arrival clip and encode a short web version.

  python3 scripts/videos.py [city ...]

Reads src/videos.json. Raw downloads go to a temp folder; output is
public/cities/<city>/arrival.mp4 — 7 s from 1 s in, 1280x720, H.264, no audio,
faststart. Shanghai keeps its Seedance clip and is not listed.
"""
import json, subprocess, sys, tempfile, urllib.request, concurrent.futures as cf
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VIDEOS = json.loads((ROOT / "src/videos.json").read_text())
RAW = Path(tempfile.gettempdir()) / "travel-city-raw-videos"


def run(city):
    v = VIDEOS[city]
    RAW.mkdir(exist_ok=True)
    raw = RAW / f"{city}-{v['id']}.mp4"
    if not raw.exists():
        req = urllib.request.Request(v["link"], headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=300) as r:
            raw.write_bytes(r.read())
    out = ROOT / "public/cities" / city / "arrival.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "1", "-i", str(raw), "-t", "7",
                    "-vf", "scale=1280:-2,fps=30", "-c:v", "libx264", "-preset", "slow", "-crf", "25",
                    "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart", str(out)], check=True)
    return city, raw.stat().st_size, out.stat().st_size


if __name__ == "__main__":
    todo = sys.argv[1:] or list(VIDEOS)
    with cf.ThreadPoolExecutor(4) as ex:
        for city, raw, out in ex.map(run, todo):
            print(f"{city:15} raw {raw / 1e6:5.1f} MB -> {out / 1e6:4.1f} MB", flush=True)
