"""Generate a city arrival clip with Seedance 2.0 Mini (Atlas Cloud).

  python3 scripts/seedance.py <city>

Reads MARKETING_VIDEO_API_KEY from the environment or ~/Developer/3D game/.env (never printed).
Writes public/cities/<city>/arrival.mp4 (older takes kept as arrival_takeN.mp4) and appends
every prediction, including failures, to scripts/usage.jsonl for the cost report.
"""
import base64, json, os, sys, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = "https://api.atlascloud.ai/api/v1/model"
MODEL = "bytedance/seedance-2.0-mini/image-to-video"
UA = "Mozilla/5.0 travel-city/1.0"
ENV_FILE = Path.home() / "Developer" / "3D game" / ".env"

SHOTS = {
    "shanghai": {
        "image": "scripts/frames/shanghai.jpg",
        "prompt": "Cinematic aerial drone shot gliding slowly forward over the Huangpu River toward the Lujiazui skyline at golden hour. Smooth, steady forward push with a gentle descent; boats drift on the river, warm sunlight glints on the glass towers, soft haze over the city. Realistic travel documentary footage, natural colours, stable camera, no morphing buildings, no text, no logos, no people close up.",
    },
}


def api_key():
    key = os.environ.get("MARKETING_VIDEO_API_KEY")
    if not key and ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            if line.startswith("MARKETING_VIDEO_API_KEY="):
                key = line.split("=", 1)[1].strip().strip('"').strip("'")
    if not key:
        sys.exit("MARKETING_VIDEO_API_KEY not found")
    return key


KEY = api_key()


def call(method, url, body=None):
    req = urllib.request.Request(url, method=method, data=json.dumps(body).encode() if body else None,
                                 headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json", "User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read())


def log(rec):
    with open(ROOT / "scripts" / "usage.jsonl", "a") as f:
        f.write(json.dumps(rec) + "\n")


def run(city):
    shot = SHOTS[city]
    image = "data:image/jpeg;base64," + base64.b64encode((ROOT / shot["image"]).read_bytes()).decode()
    body = {"model": MODEL, "prompt": shot["prompt"], "image": image, "duration": 5, "seed": -1,
            "resolution": "1080p-SR", "ratio": "16:9", "generate_audio": False, "bitrate_mode": "high", "watermark": False}
    t0 = time.time()
    res = call("POST", f"{API}/generateVideo", body)
    pid = res.get("data", {}).get("id")
    if not pid:
        log({"provider": "atlas", "model": MODEL, "shot": city, "status": "rejected", "resp": res})
        sys.exit(f"submit failed: {res}")
    print(f"[{city}] submitted {pid}", flush=True)
    while True:
        time.sleep(5)
        d = call("GET", f"{API}/prediction/{pid}")["data"]
        if d["status"] in ("completed", "succeeded"):
            break
        if d["status"] in ("failed", "timeout"):
            log({"provider": "atlas", "model": MODEL, "shot": city, "id": pid, "status": d["status"], "usd": d.get("price"), "error": d.get("error")})
            sys.exit(f"{city}: {d['status']}: {d.get('error')}")
    for _ in range(6):
        if d.get("price") is not None:
            break
        time.sleep(5)
        d = call("GET", f"{API}/prediction/{pid}")["data"]
    out = ROOT / "public" / "cities" / city / "arrival.mp4"
    if out.exists():
        n = len(list(out.parent.glob("arrival_take*.mp4"))) + 1
        out.rename(out.with_name(f"arrival_take{n}.mp4"))
    with urllib.request.urlopen(urllib.request.Request(d["outputs"][0], headers={"User-Agent": UA}), timeout=300) as r:
        out.write_bytes(r.read())
    rec = {"provider": "atlas", "model": MODEL, "shot": city, "id": pid, "status": "ok", "usd": d.get("price"),
           "total_tokens": d.get("total_tokens"), "duration": 5, "resolution": "1080p-SR", "secs": round(time.time() - t0)}
    log(rec)
    print(f"[{city}] done in {rec['secs']}s price={rec['usd']} -> {out.relative_to(ROOT)}", flush=True)


if __name__ == "__main__":
    for c in sys.argv[1:]:
        run(c)
