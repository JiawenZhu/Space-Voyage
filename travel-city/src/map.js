// Google Maps panel: a dark vector map that flies between cities along a great-circle arc
// and pins each city's must-see places. Loaded lazily the first time the panel opens.
import placesData from './places.json';

const KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let mapsReady = null;
let map = null;
let markers = [];
let hopLine = null;
let trailLine = null;
let flight = null;
const trail = [];

export const hasMapsKey = Boolean(KEY);

export function cityPlaces(cityId) {
  return placesData[cityId]?.places ?? [];
}

export function cityCenter(cityId) {
  const c = placesData[cityId]?.center;
  return c ? { lat: c[0], lng: c[1] } : null;
}

export function mapsUrlForPlace(place) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.id}`;
}

export function mapsUrlForCity(city) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${city.name}, ${city.nation}`)}`;
}

// Google's inline bootstrap loader (adds google.maps.importLibrary).
function loadMaps() {
  if (mapsReady) return mapsReady;
  /* eslint-disable */
  ((g) => {var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({ key: KEY, v: 'weekly', language: 'en' });
  /* eslint-enable */
  mapsReady = Promise.all([
    google.maps.importLibrary('maps'),
    google.maps.importLibrary('marker'),
    google.maps.importLibrary('geometry')
  ]);
  return mapsReady;
}

// Camera that frames all of a city's pins inside the map panel (with some padding).
function cityFrame(cityId) {
  const pts = [cityCenter(cityId), ...cityPlaces(cityId)];
  const lats = pts.map((p) => p.lat);
  const lngs = pts.map((p) => p.lng);
  const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  const north = Math.max(...lats);
  const south = Math.min(...lats);
  const east = Math.max(...lngs);
  const west = Math.min(...lngs);
  const div = map?.getDiv();
  const w = (div?.clientWidth || 360) * 0.6;
  const h = (div?.clientHeight || 300) * 0.62;
  const zx = Math.log2((w * 360) / (256 * Math.max(east - west, 0.01)));
  const zy = Math.log2((h * 2 * Math.PI) / (256 * Math.max(mercY(north) - mercY(south), 0.0002)));
  return {
    center: { lat: (north + south) / 2, lng: (east + west) / 2 },
    zoom: Math.max(5, Math.min(14, Math.min(zx, zy)))
  };
}

const cityZoom = (cityId) => cityFrame(cityId).zoom;

function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

export async function initMap(container, initialCity, onPlaceClick) {
  if (!KEY) throw new Error('missing key');
  await loadMaps();
  if (map) return map;
  const { Map } = await google.maps.importLibrary('maps');
  const { ColorScheme } = await google.maps.importLibrary('core');
  map = new Map(container, {
    mapId: 'DEMO_MAP_ID',
    colorScheme: ColorScheme.DARK,
    center: cityCenter(initialCity),
    zoom: 11,
    disableDefaultUI: true,
    zoomControl: true,
    gestureHandling: 'greedy',
    clickableIcons: false
  });
  map.__onPlaceClick = onPlaceClick;
  trailLine = new google.maps.Polyline({ map, geodesic: true, strokeColor: '#ffffff', strokeOpacity: 0.35, strokeWeight: 1.5 });
  hopLine = new google.maps.Polyline({ map, geodesic: true, strokeColor: '#ffd36b', strokeOpacity: 0.95, strokeWeight: 3 });
  return map;
}

export function isMapReady() {
  return Boolean(map);
}

export async function showCity(cityId, { animate = false } = {}) {
  if (!map) return;
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary('marker');
  markers.forEach((m) => { m.map = null; });
  markers = cityPlaces(cityId).map((p, i) => {
    const pin = new PinElement({ background: '#ffffff', borderColor: '#0b0a09', glyphColor: '#0b0a09', glyphText: String(i + 1), scale: 1.05 });
    const marker = new AdvancedMarkerElement({ map, position: { lat: p.lat, lng: p.lng }, title: p.name, content: pin, gmpClickable: true });
    marker.addEventListener('gmp-click', () => map.__onPlaceClick?.(p.id));
    return marker;
  });
  if (!animate) map.moveCamera({ ...cityFrame(cityId), heading: 0, tilt: 0 });
}

export function recordVisit(cityId) {
  const c = cityCenter(cityId);
  if (!c || trail.at(-1)?.id === cityId) return;
  trail.push({ id: cityId, ...c });
  trailLine?.setPath(trail.map(({ lat, lng }) => ({ lat, lng })));
}

// Flies the camera from one city to another: zooms out to a height that fits the hop,
// travels along the great circle while drawing the arc, then settles over the destination.
export function flyBetween(fromId, toId, duration = 2400, reduce = false) {
  if (!map) return Promise.resolve();
  const from = map.getCenter()?.toJSON() ?? cityCenter(fromId);
  const to = cityFrame(toId).center;
  const zFrom = map.getZoom() ?? cityZoom(fromId);
  const zTo = cityZoom(toId);
  if (reduce || !from || !to) {
    hopLine.setPath(from && to ? [from, to] : []);
    map.moveCamera({ center: to, zoom: zTo });
    return Promise.resolve();
  }
  const km = distanceKm(from, to);
  const zTop = Math.max(1.6, Math.min(zTo - 1, 10.5 - Math.log2(Math.max(km, 60) / 40)));
  const a = new google.maps.LatLng(from);
  const b = new google.maps.LatLng(to);
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  if (flight) cancelAnimationFrame(flight.raf);
  return new Promise((resolve) => {
    const start = performance.now();
    flight = {};
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const e = ease(t);
      const here = google.maps.geometry.spherical.interpolate(a, b, e);
      const zoom = t < 0.5
        ? zFrom + (zTop - zFrom) * ease(t * 2)
        : zTop + (zTo - zTop) * ease((t - 0.5) * 2);
      hopLine.setPath([a, here]);
      map.moveCamera({ center: here, zoom });
      if (t < 1) {
        flight.raf = requestAnimationFrame(step);
      } else {
        flight = null;
        resolve();
      }
    };
    flight.raf = requestAnimationFrame(step);
  });
}

// Live details for one place (rating, summary, a photo). Not cached, per Google's terms.
export async function fetchPlaceDetails(id) {
  const { Place } = await google.maps.importLibrary('places');
  const place = new Place({ id });
  await place.fetchFields({ fields: ['rating', 'userRatingCount', 'editorialSummary', 'photos', 'googleMapsURI'] });
  const photo = place.photos?.[0];
  return {
    rating: place.rating,
    count: place.userRatingCount,
    summary: place.editorialSummary,
    url: place.googleMapsURI,
    photo: photo ? photo.getURI({ maxWidth: 480, maxHeight: 280 }) : null,
    photoBy: photo?.authorAttributions?.[0] ?? null
  };
}

export function focusPlace(id) {
  const p = Object.values(placesData).flatMap((c) => c.places).find((x) => x.id === id);
  if (p && map) map.panTo({ lat: p.lat, lng: p.lng });
}
