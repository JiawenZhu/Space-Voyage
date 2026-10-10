"""Look up coordinates and place IDs for each city and its must-see places (Places API, Text Search).

  python3 scripts/places.py

Reads VITE_GOOGLE_MAPS_API_KEY from travel-city/.env.local. Writes src/places.json with
{city: {center: [lat, lng], places: [{id, name, lat, lng}]}}. Ratings, photos and hours are
not stored — the site fetches them live, per Google's caching rules. Google allows coordinates
to be cached for 30 days, so re-run this before a deployment that will stay up longer.
"""
import json, re, sys, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KEY = re.search(r"VITE_GOOGLE_MAPS_API_KEY=(\S+)", (ROOT / ".env.local").read_text()).group(1)
CITIES = {m[0]: (m[1], m[2]) for m in re.findall(r"id: '([\w-]+)', country: '[\w-]+'(?:, nation: '([^']+)')?, name: '([^']+)'", (ROOT / "src/cities.js").read_text())}
NAMES = json.loads((ROOT / "scripts/place-names.json").read_text())
REGION_NATION = {"china": "China", "usa": "USA"}


def search(query):
    req = urllib.request.Request(
        "https://places.googleapis.com/v1/places:searchText",
        data=json.dumps({"textQuery": query, "pageSize": 1}).encode(),
        headers={"Content-Type": "application/json", "X-Goog-Api-Key": KEY, "Referer": "http://localhost:3001/",
                 "X-Goog-FieldMask": "places.id,places.displayName,places.location"})
    with urllib.request.urlopen(req, timeout=30) as r:
        found = json.loads(r.read()).get("places", [])
    return found[0] if found else None


def main():
    raw = (ROOT / "src/cities.js").read_text()
    out, calls, missing = {}, 0, []
    for city, places in NAMES.items():
        m = re.search(r"id: '%s', country: '([\w-]+)'(?:, nation: '([^']+)')?, name: '([^']+)'" % re.escape(city), raw)
        nation = m.group(2) or REGION_NATION[m.group(1)]
        name = m.group(3).replace("’", "'")
        centre = search(f"{name}, {nation}"); calls += 1
        entry = {"center": [round(centre["location"]["latitude"], 5), round(centre["location"]["longitude"], 5)], "places": []}
        for p in places:
            hit = search(f"{p}, {name}, {nation}"); calls += 1
            if not hit:
                missing.append(f"{city}: {p}"); continue
            entry["places"].append({"id": hit["id"], "name": hit["displayName"]["text"],
                                    "lat": round(hit["location"]["latitude"], 6), "lng": round(hit["location"]["longitude"], 6)})
        out[city] = entry
        print(f"{city}: {len(entry['places'])}/{len(places)}", flush=True)
        time.sleep(0.1)
    (ROOT / "src/places.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(f"{calls} Text Search calls; missing: {missing or 'none'}")


if __name__ == "__main__":
    main()
