import { countries, cities } from './cities.js';
import {
  hasMapsKey, initMap, isMapReady, showCity, flyBetween, recordVisit, fetchPlaceDetails,
  focusPlace, cityPlaces, cityCenter, mapsUrlForPlace, mapsUrlForCity
} from './map.js';
import { interests, MONTHS, rankCities } from './match.js';

const byId = Object.fromEntries(cities.map((c) => [c.id, c]));
const countryById = Object.fromEntries(countries.map((c) => [c.id, c]));
const citiesOf = (countryId) => cities.filter((c) => c.country === countryId);
const START = cities[0].id;
const VISITED_KEY = 'travel-city:visited';
const SLIDE_MS = 7000;
const CLIP_HOLD_MS = 2500;

const $ = (selector) => document.querySelector(selector);

const experience = $('.experience');
const slidesEl = $('#slides');
const [videoA, videoB] = document.querySelectorAll('.scene-video');
const portalCanvas = $('#portal-canvas');
const ctx = portalCanvas.getContext('2d');
const portal = $('#portal');
const prevBtn = $('#prev-btn');
const nextBtn = $('#next-btn');
const nextName = $('#next-name');
const nextNumber = $('#next-number');
const cityTitle = $('#city-title');
const cityKicker = $('#city-kicker');
const portalClose = $('#portal-close');
const cityIntro = $('#city-intro');
const gallery = $('#gallery');
const photoCredit = $('#photo-credit');
const factsPanel = $('#facts-panel');
const statsEl = $('#stats');
const factsList = $('#facts');
const cityListNav = $('.planet-list');
const listHeading = $('#list-heading');
const cityList = $('#city-list');
const progressLabel = $('#progress-label');
const countryNav = $('#country-nav');
const drawerGroups = $('#drawer-groups');
const drawerCityName = $('#drawer-city-name');
const drawerProgress = $('#drawer-progress');
const destinationGroups = $('#destination-groups');
const overviewProgressText = $('#overview-progress-text');
const overviewProgressFill = $('#overview-progress-fill');
const statusEl = $('#status');
const preloader = $('#preloader');
const preloaderCount = $('#preloader-count');
const preloaderValue = $('#preloader-value');
const skipIntroBtn = $('#skip-intro');
const floatingLogo = $('#floating-logo');
const customCursor = $('.custom-cursor');
const cursorOrbit = $('.cursor-orbit');
const cursorLabel = $('.cursor-label');

const dialogs = {
  about: $('#dialog-about'),
  destinations: $('#dialog-destinations'),
  saved: $('#dialog-saved'),
  quiz: $('#dialog-quiz'),
  menu: $('#dialog-menu')
};

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(pointer: fine)');
const compactLayout = matchMedia('(max-width: 640px), (max-height: 780px)');

/* ---------- Visited progress (per browser) ---------- */

function loadVisited() {
  try {
    const stored = JSON.parse(localStorage.getItem(VISITED_KEY));
    return Array.isArray(stored) ? stored.filter((id) => byId[id]) : [];
  } catch {
    return [];
  }
}

const visited = new Set(loadVisited());
const isReturningVisitor = visited.size > 0;

function markVisited(id) {
  visited.add(id);
  try {
    localStorage.setItem(VISITED_KEY, JSON.stringify([...visited]));
  } catch {}
}

/* ---------- Routing ---------- */

function cityNumber(city) {
  return String(citiesOf(city.country).indexOf(city) + 1).padStart(2, '0');
}

// Next/previous stay within the current country and loop.
function neighbour(id, step) {
  const list = citiesOf(byId[id].country);
  const i = list.indexOf(byId[id]);
  return list[(i + step + list.length) % list.length].id;
}

function cityFromHash() {
  const id = decodeURIComponent(location.hash.slice(1)).toLowerCase();
  return byId[id] ? id : null;
}

let current = cityFromHash() || START;
let desired = current;
let travellingTo = null;
let busy = true; // until the intro finishes

function navigate(id) {
  if (!byId[id]) return;
  if (location.hash === '#' + id) requestTravel(id);
  else location.hash = id;
}

window.addEventListener('hashchange', () => requestTravel(cityFromHash() || START));

function requestTravel(id) {
  desired = id;
  if (busy) {
    if (travellingTo && desired !== travellingTo) {
      setStatus(`Travelling to ${byId[travellingTo].name} — then ${byId[desired].name}`, true);
    }
    return;
  }
  if (desired !== current) travel(desired);
}

function setStatus(text, visible) {
  statusEl.textContent = text;
  statusEl.classList.toggle('is-visible', visible);
}

/* ---------- Rendering ---------- */

const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

function cityItem(city, i) {
  const active = city.id === current;
  const mark = visited.has(city.id) && !active
    ? '<span class="visited-mark" title="Visited"></span><span class="visually-hidden">(visited)</span>'
    : '';
  const localTag = city.local && city.local !== city.name
    ? `<span class="item-local"${city.lang ? ` lang="${city.lang}"` : ''}>${esc(city.local)}</span>`
    : '';
  return `<li style="--i:${i}"><button type="button" class="planet-item${active ? ' is-active' : ''}" data-city="${city.id}"${active ? ' aria-current="true"' : ''}><span class="planet-num" aria-hidden="true">${cityNumber(city)}</span><span>${esc(city.name)}</span>${localTag}${mark}</button></li>`;
}

function render() {
  const city = byId[current];
  const country = countryById[city.country];
  const next = byId[neighbour(current, 1)];
  const prev = byId[neighbour(current, -1)];

  experience.dataset.city = current;
  document.title = `${city.name} — Travel City`;
  cityTitle.textContent = city.name;
  const kickerLead = city.local && city.local !== city.name
    ? `<span${city.lang ? ` lang="${city.lang}"` : ''}>${esc(city.local)}</span> · `
    : '';
  cityKicker.innerHTML = `${kickerLead}${esc(city.nation)} · ${esc(city.tagline)}`;
  cityIntro.textContent = city.intro;

  nextName.textContent = next.name;
  nextNumber.textContent = `[${cityNumber(next)}]`;
  portal.setAttribute('aria-label', portalDocked ? `Show the portal (next: ${next.name})` : `Travel to ${next.name}`);
  portal.title = portalDocked ? `Next: ${next.name} — click to open` : '';
  prevBtn.setAttribute('aria-label', `Previous city: ${prev.name}`);
  prevBtn.title = `Previous: ${prev.name}`;
  nextBtn.setAttribute('aria-label', `Next city: ${next.name}`);
  nextBtn.title = `Next: ${next.name}`;

  const s = city.stats;
  statsEl.innerHTML = [['Population', s.population], ['Region', s.region], ['Time', s.time], ['Best time', s.best]]
    .map(([k, v]) => `<div class="stat"><span class="stat-label">${k}</span><span class="stat-value">${esc(v)}</span></div>`)
    .join('');
  factsList.innerHTML = city.facts.map(([k, v]) => `<div class="fact"><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');

  countryNav.innerHTML = countries
    .filter((c) => c.available)
    .map((c) => `<button type="button" data-country="${c.id}" aria-pressed="${c.id === city.country}" title="${[c.name, c.local].filter(Boolean).join(' ')}">${c.short}</button>`)
    .join('');

  const list = citiesOf(city.country);
  listHeading.textContent = `${country.name} · ${list.length} cities`;
  cityList.innerHTML = list.map(cityItem).join('');

  drawerGroups.innerHTML = countries
    .map((c) => c.available
      ? `<h3 class="eyebrow drawer-subhead">${esc(c.name)}${c.local ? ` <span lang="zh">${esc(c.local)}</span>` : ''}</h3><ol class="planet-items drawer-planets">${citiesOf(c.id).map(cityItem).join('')}</ol>`
      : `<h3 class="eyebrow drawer-subhead">${esc(c.name)} <span class="soon-tag">Coming soon</span></h3>`)
    .join('');

  destinationGroups.innerHTML = countries
    .map((c) => {
      if (!c.available) return `<h3 class="group-title">${esc(c.name)}${c.local ? ` <span lang="zh">${esc(c.local)}</span>` : ''} <span class="soon-tag">Coming soon</span></h3>`;
      const cards = citiesOf(c.id).map((ci) => {
        const state = ci.id === current ? 'You are here' : visited.has(ci.id) ? 'Visited' : '';
        const localTag = ci.local && ci.local !== ci.name
          ? ` <span${ci.lang ? ` lang="${ci.lang}"` : ''}>${esc(ci.local)}</span>`
          : '';
        return `<li><button type="button" class="city-card${ci.id === current ? ' is-current' : ''}" data-city="${ci.id}"${ci.id === current ? ' aria-current="true"' : ''}>
          <img src="${ci.photos[0].thumb}" alt="" loading="lazy" decoding="async" />
          <span class="city-card-text"><span class="system-num">${cityNumber(ci)}</span><span class="system-name">${esc(ci.name)}${localTag}</span><span class="system-state">${state || esc(ci.tagline)}</span></span>
        </button></li>`;
      }).join('');
      return `<h3 class="group-title">${esc(c.name)}${c.local ? ` <span lang="zh">${esc(c.local)}</span>` : ''}</h3><ol class="system">${cards}</ol>`;
    })
    .join('');

  const progressText = `${visited.size} of ${cities.length} cities visited`;
  progressLabel.textContent = progressText;
  drawerProgress.textContent = progressText;
  overviewProgressText.textContent = progressText;
  overviewProgressFill.style.width = `${(visited.size / cities.length) * 100}%`;
  drawerCityName.textContent = `${city.name}, ${city.nation}`;

  renderGallery();
  renderSavedState();
  renderPlaces();
  renderLocalNow();
  fitTitle();

  cityListNav.classList.remove('is-switching');
  void cityListNav.offsetWidth;
  cityListNav.classList.add('is-switching');
}

// Long names (San Francisco, Washington, D.C.) shrink to fit the space beside the guide.
function fitTitle() {
  cityTitle.style.fontSize = '';
  const overflow = cityTitle.scrollWidth / cityTitle.clientWidth;
  if (overflow > 1) {
    const size = parseFloat(getComputedStyle(cityTitle).fontSize);
    cityTitle.style.fontSize = `${Math.floor(size / overflow)}px`;
  }
}

/* ---------- Photo slideshow (the scene for every city) ---------- */

let slideIndex = 0;
let slideTimer = null;
let slideCity = null;

function buildSlides(city) {
  slideCity = city.id;
  slideIndex = 0;
  slidesEl.innerHTML = city.photos
    .map((p, i) => `<img class="slide${i === 0 ? ' is-active' : ''}" src="${p.src}" alt="" style="--ox:${[50, 30, 70, 40, 60][i % 5]}%;--oy:${[50, 60, 40, 30, 55][i % 5]}%" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />`)
    .join('');
  const first = slidesEl.querySelector('.slide');
  return first.decode().catch(() => {});
}

function showSlide(i) {
  const slides = slidesEl.querySelectorAll('.slide');
  if (!slides.length) return;
  slideIndex = (i + slides.length) % slides.length;
  slides.forEach((el, n) => {
    el.loading = 'eager';
    if (n === slideIndex) restartClass(el, 'is-active');
    else el.classList.remove('is-active');
  });
  renderGallery();
}

function renderGallery() {
  const city = byId[current];
  if (slideCity !== current) return;
  gallery.innerHTML = city.photos
    .map((p, i) => `<button type="button" class="thumb" data-slide="${i}" aria-label="Photo ${i + 1}: ${esc(p.caption)}" aria-pressed="${i === slideIndex}"><img src="${p.thumb}" alt="" /></button>`)
    .join('');
  const p = city.photos[slideIndex];
  photoCredit.innerHTML = `${esc(p.caption)} · Photo by <a href="${p.authorUrl}?utm_source=travel_city&utm_medium=referral" target="_blank" rel="noopener">${esc(p.author)}</a> on <a href="https://unsplash.com/?utm_source=travel_city&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a>`
    + (city.clipCredit ? ` · Video by <a href="${city.clipCredit.url}" target="_blank" rel="noopener">${esc(city.clipCredit.author)}</a> on Pexels` : '');
}

function startSlideshow() {
  stopSlideshow();
  if (reduceMotion.matches) return; // photos change only when chosen
  slideTimer = setInterval(() => {
    if (!document.hidden && !busy) showSlide(slideIndex + 1);
  }, SLIDE_MS);
}

function stopSlideshow() {
  clearInterval(slideTimer);
  slideTimer = null;
}

gallery.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-slide]');
  if (!btn) return;
  hideClip();
  showSlide(Number(btn.dataset.slide));
  startSlideshow();
});

/* ---------- Arrival clips and portal media ---------- */

// Two video elements trade roles: one holds the arrival clip being shown over the
// slideshow, the other holds the next destination's clip for the portal and the warp.
let sceneVideo = videoA;
let spareVideo = videoB;
const portalImage = new Image();
portalImage.decoding = 'async';
let portalMedia = portalImage;
let clipTimer = null;

function hideClip() {
  clearTimeout(clipTimer);
  videoA.classList.remove('is-scene');
  videoB.classList.remove('is-scene');
}

function setVideoSource(video, src) {
  if (video.dataset.src === src) return;
  video.dataset.src = src;
  video.preload = 'auto';
  video.src = src;
  video.load();
}

// Only the next destination is preloaded.
function loadPortalFor(city) {
  if (city.clip) {
    setVideoSource(spareVideo, city.clip);
    portalMedia = spareVideo;
  } else {
    const src = city.photos[0].src;
    if (portalImage.dataset.src !== src) {
      portalImage.dataset.src = src;
      portalImage.src = src;
    }
    portalMedia = portalImage;
  }
  requestDraw();
}

const isVideo = (el) => el instanceof HTMLVideoElement;

function mediaReady(el, timeout, minVideoState = 2) {
  return new Promise((resolve) => {
    if (isVideo(el) ? el.readyState >= minVideoState : el.complete && el.naturalWidth > 0) {
      resolve(true);
      return;
    }
    const events = isVideo(el) ? [minVideoState >= 3 ? 'canplay' : 'loadeddata', 'error'] : ['load', 'error'];
    const timer = setTimeout(() => finish(false), timeout);
    function finish(ok) {
      clearTimeout(timer);
      events.forEach((t) => el.removeEventListener(t, onEvent));
      resolve(ok);
    }
    function onEvent(e) {
      finish(e.type !== 'error');
    }
    events.forEach((t) => el.addEventListener(t, onEvent));
  });
}

function seekToEnd(video) {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, 3000);
    const seek = () => {
      if (!isFinite(video.duration)) return resolve();
      video.addEventListener('seeked', () => { clearTimeout(timer); resolve(); }, { once: true });
      video.currentTime = Math.max(0, video.duration - 0.05);
    };
    if (video.readyState >= 1) seek();
    else video.addEventListener('loadedmetadata', seek, { once: true });
  });
}

function playbackEnded(video) {
  return new Promise((resolve) => {
    const limit = ((isFinite(video.duration) ? video.duration : 10) / video.playbackRate) * 1000 + 4000;
    const timer = setTimeout(done, limit);
    function done() {
      clearTimeout(timer);
      video.removeEventListener('ended', done);
      video.removeEventListener('error', done);
      resolve();
    }
    video.addEventListener('ended', done);
    video.addEventListener('error', done);
  });
}

[videoA, videoB].forEach((v) => {
  v.addEventListener('loadeddata', () => requestDraw());
  v.addEventListener('seeked', () => requestDraw());
});
portalImage.addEventListener('load', () => requestDraw());

/* ---------- Portal canvas (drawn only while something changes) ---------- */

let expansion = 0;
let maskScale = 0;
let imageZoom = 1;
let transitionActive = false;
let targetX = 0;
let targetY = 0;
let rotX = 0;
let rotY = 0;
let lastTime = performance.now();
let drawQueued = false;
let activeAnimations = 0;
let portalRadius = 90;
let dockMix = 0; // 0 = screen-locked window, 1 = photo fitted to the docked mini portal

function requestDraw() {
  if (drawQueued) return;
  drawQueued = true;
  requestAnimationFrame(draw);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animateValue(setter, duration) {
  if (reduceMotion.matches) {
    setter(1);
    requestDraw();
    return Promise.resolve();
  }
  activeAnimations++;
  return new Promise((resolve) => {
    const start = performance.now();
    function step(now) {
      const progress = Math.min(1, (now - start) / duration);
      setter(easeInOutCubic(progress));
      requestDraw();
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        activeAnimations--;
        resolve();
      }
    }
    requestAnimationFrame(step);
  });
}

function resizeCanvas() {
  const d = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  portalCanvas.width = w * d;
  portalCanvas.height = h * d;
  portalCanvas.style.width = w + 'px';
  portalCanvas.style.height = h + 'px';
  ctx.setTransform(d, 0, 0, d, 0, 0);
  portalRadius = parseFloat(getComputedStyle(portal).borderTopLeftRadius) || 90;
  fitTitle();
  requestDraw();
}

window.addEventListener('resize', resizeCanvas);

// Covers a box with the media. The full-size portal uses the whole viewport as the box
// (a window onto a screen-sized scene); the docked mini portal fits the photo to itself.
function drawCover(media, zoom = 1, box = { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight }) {
  const mw = media.videoWidth || media.naturalWidth;
  const mh = media.videoHeight || media.naturalHeight;
  if (!mw || !mh) return;
  const scale = Math.max(box.w / mw, box.h / mh) * zoom;
  const w = mw * scale;
  const h = mh * scale;
  try {
    ctx.drawImage(media, box.x + (box.w - w) / 2, box.y + (box.h - h) / 2, w, h);
  } catch {}
}

function sampleRoundedRect(w, h, r) {
  const cr = Math.max(0, Math.min(r, w / 2, h / 2));
  const corners = [
    [w / 2 - cr, -h / 2 + cr, -Math.PI / 2, 0],
    [w / 2 - cr, h / 2 - cr, 0, Math.PI / 2],
    [-w / 2 + cr, h / 2 - cr, Math.PI / 2, Math.PI],
    [-w / 2 + cr, -h / 2 + cr, Math.PI, Math.PI * 1.5]
  ];
  const pts = [];
  const steps = 10;
  for (const [cx, cy, a0, a1] of corners) {
    for (let s = 0; s <= steps; s++) {
      const a = a0 + ((a1 - a0) * s) / steps;
      pts.push([cx + Math.cos(a) * cr, cy + Math.sin(a) * cr]);
    }
  }
  return pts;
}

function projectPoint(x, y, rx, ry, cx, cy) {
  const ax = (rx * Math.PI) / 180;
  const ay = (ry * Math.PI) / 180;
  const xx = x * Math.cos(ay);
  const yy = y * Math.cos(ax);
  const z = x * Math.sin(ay) - y * Math.sin(ax);
  const p = 850 / (850 + z);
  return [cx + xx * p, cy + yy * p];
}

function draw(now) {
  drawQueued = false;
  const dt = Math.min(40, Math.max(0, now - lastTime));
  lastTime = now;

  const k = Math.min(1, dt * 0.009);
  rotX += (targetX - rotX) * k;
  rotY += (targetY - rotY) * k;
  const tilting = Math.abs(targetX - rotX) > 0.02 || Math.abs(targetY - rotY) > 0.02;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  ctx.clearRect(0, 0, vw, vh);

  const rect = portal.getBoundingClientRect();
  const rectCx = rect.left + rect.width / 2;
  const rectCy = rect.top + rect.height / 2;
  const e = expansion;
  const cx = rectCx + (vw / 2 - rectCx) * e;
  const cy = rectCy + (vh / 2 - rectCy) * e;
  const scale = e ? 1 : maskScale;
  const w = (rect.width + (vw - rect.width) * e) * scale;
  const h = (rect.height + (vh - rect.height) * e) * scale;
  const r = Math.min(portalRadius, rect.width * 0.28) * (1 - e) * scale;

  if (w > 1 && h > 1) {
    const pts = sampleRoundedRect(w, h, r);
    ctx.save();
    ctx.beginPath();
    pts.forEach(([x, y], i) => {
      const [sx, sy] = projectPoint(x, y, rotX * (1 - e), rotY * (1 - e), cx, cy);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    });
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = '#0b0a09';
    ctx.fillRect(0, 0, vw, vh);
    const mix = dockMix * (1 - e);
    const box = mix
      ? { x: rect.left * mix, y: rect.top * mix, w: vw + (rect.width - vw) * mix, h: vh + (rect.height - vh) * mix }
      : undefined;
    drawCover(portalMedia, imageZoom, box);
    ctx.restore();
  }

  if (tilting || transitionActive || activeAnimations > 0) requestDraw();
}

window.addEventListener('pointermove', (ev) => {
  if (ev.pointerType === 'touch' || busy || portalDocked || reduceMotion.matches) return;
  targetY = (ev.clientX / window.innerWidth - 0.5) * 37.4;
  targetX = (ev.clientY / window.innerHeight - 0.5) * -33;
  requestDraw();
});

document.documentElement.addEventListener('pointerleave', () => {
  targetX = 0;
  targetY = 0;
  requestDraw();
});

/* ---------- Reveals ---------- */

function restartClass(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

async function revealPortal() {
  await mediaReady(portalMedia, 1500);
  restartClass(experience, 'mask-revealing');
  maskScale = 0;
  await animateValue((v) => { maskScale = v; }, 1050);
}

function revealContent() {
  restartClass(experience, 'content-revealing');
}

/* ---------- Travel ---------- */

function waitTwoFrames() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

async function travel(targetId) {
  const target = byId[targetId];
  busy = true;
  travellingTo = targetId;
  experience.classList.add('is-busy');
  targetX = 0;
  targetY = 0;

  try {
    loadPortalFor(target);
    const media = portalMedia;

    if (!(await mediaReady(media, 0, 3))) {
      setStatus(`Preparing the trip to ${target.name}…`, true);
      await mediaReady(media, 8000, 3);
    }
    setStatus(`Travelling to ${target.name}…`, true);
    experience.classList.remove('content-revealing', 'mask-revealing');
    if (mapOpen && isMapReady()) {
      flyBetween(current, targetId, isVideo(media) ? 3400 : 2200, reduceMotion.matches)
        .then(() => showCity(targetId, { animate: true }));
    }

    if (reduceMotion.matches) {
      if (isVideo(media)) await seekToEnd(media);
    } else {
      experience.classList.add('is-transitioning');
      transitionActive = true;
      requestDraw();
      if (isVideo(media)) {
        media.currentTime = 0;
        media.playbackRate = 1.4;
        const ended = playbackEnded(media);
        await media.play().catch(() => {});
        await animateValue((v) => { expansion = v; }, 1100);
        await ended;
      } else {
        // Photos get a slow push-in that settles exactly on the first slide.
        await Promise.all([
          animateValue((v) => { expansion = v; }, 1100),
          animateValue((v) => { imageZoom = 1.3 - 0.3 * v; }, 2000)
        ]);
      }
    }

    // Commit: swap the scene underneath the full-screen canvas.
    experience.classList.add('is-committing');
    stopSlideshow();
    hideClip();
    current = targetId;
    await buildSlides(target);
    if (isVideo(media)) {
      [sceneVideo, spareVideo] = [media, sceneVideo];
      sceneVideo.classList.add('is-scene');
    }
    markVisited(current);
    recordVisit(current);
    render();
    await waitTwoFrames();

    transitionActive = false;
    expansion = 0;
    maskScale = 0;
    imageZoom = 1;
    experience.classList.remove('is-transitioning', 'is-committing');
    setStatus(`Arrived in ${target.name}.`, false);
    loadPortalFor(byId[neighbour(current, 1)]);

    // A clip holds its last frame for a moment, then fades into the photo slideshow.
    if (isVideo(media)) {
      clipTimer = setTimeout(() => { hideClip(); restartClass(slidesEl.querySelector('.slide.is-active'), 'is-active'); startSlideshow(); }, reduceMotion.matches ? 0 : CLIP_HOLD_MS);
    } else {
      startSlideshow();
    }

    setTimeout(revealContent, reduceMotion.matches ? 0 : 100);
    await revealPortal();
  } catch (err) {
    console.error(err);
    transitionActive = false;
    expansion = 0;
    maskScale = 1;
    imageZoom = 1;
    experience.classList.remove('is-transitioning', 'is-committing');
    setStatus('', false);
    requestDraw();
  } finally {
    busy = false;
    travellingTo = null;
    experience.classList.remove('is-busy');
    if (desired !== current) requestTravel(desired);
  }
}

/* ---------- Intro ---------- */

let introFinished = false;

function finishIntro() {
  if (introFinished) return;
  introFinished = true;
  preloaderCount.classList.add('is-leaving');
  preloader.classList.add('is-done');
  floatingLogo.classList.add('is-docked');
  document.body.classList.add('intro-started', 'preload-complete');
  setTimeout(() => preloader.remove(), 800);
  setTimeout(() => floatingLogo.classList.add('is-settled'), reduceMotion.matches ? 0 : 2000);
  markVisited(current);
  recordVisit(current);
  render();
  startExperience();
  openSharedTrip();
}

async function startExperience() {
  startSlideshow();
  await revealPortal();
  document.body.classList.add('intro-ready');
  setTimeout(revealContent, reduceMotion.matches ? 0 : 850);
  busy = false;
  if (desired !== current) requestTravel(desired);
}

// The counter reports how many of the first city's photos (plus the portal preview) have
// really loaded. It finishes once the lead photo and portal are in, giving the rest a short
// grace period. Returning visitors and reduced-motion users go straight in.
function runIntro() {
  const city = byId[current];
  buildSlides(city);
  render();
  loadPortalFor(byId[neighbour(current, 1)]);

  const skip = () => finishIntro();
  skipIntroBtn.addEventListener('click', skip);
  if (isReturningVisitor || reduceMotion.matches) {
    skip();
    return;
  }

  const slides = [...slidesEl.querySelectorAll('.slide')];
  slides.forEach((img) => { img.loading = 'eager'; });
  const items = [...slides, portalMedia];
  const isLoaded = (el) => (isVideo(el) ? el.readyState >= 2 : el.complete && el.naturalWidth > 0);
  const started = performance.now();
  const tick = () => {
    if (introFinished) return;
    const done = items.filter(isLoaded).length;
    preloaderValue.textContent = String(Math.round((done / items.length) * 100));
    const essentials = isLoaded(slides[0]) && isLoaded(portalMedia);
    if (done === items.length || (essentials && performance.now() - started > 2500)) {
      setTimeout(finishIntro, 400);
      return;
    }
    setTimeout(tick, 120);
  };
  tick();
  setTimeout(skip, 8000);
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && transitionActive && isVideo(portalMedia) && portalMedia.paused && !portalMedia.ended) {
    portalMedia.play().catch(() => {});
  }
});

/* ---------- Controls ---------- */

portal.addEventListener('click', () => {
  if (portalDocked) setPortalDocked(false);
  else navigate(neighbour(current, 1));
});
portalClose.addEventListener('click', () => setPortalDocked(true));
$('#focus-exit').addEventListener('click', () => setPortalDocked(false));

/* ---------- Focus mode: the portal tucks into the top-right, the list slides out left,
   the guide slides out right and the city name shrinks into the bottom-left corner ---------- */

const DOCK_KEY = 'travel-city:portal-docked';
let portalDocked = false;
try { portalDocked = localStorage.getItem(DOCK_KEY) === '1'; } catch {}

function setPortalDocked(docked) {
  portalDocked = docked;
  try { localStorage.setItem(DOCK_KEY, docked ? '1' : '0'); } catch {}
  experience.classList.toggle('portal-docked', docked);
  applyFocusInert();
  customCursor.classList.remove('is-visible');
  targetX = 0;
  targetY = 0;
  render();
  // Keep the canvas mask following the portal while CSS moves it, and blend the framing.
  const from = dockMix;
  animateValue((v) => { dockMix = from + ((docked ? 1 : 0) - from) * v; }, 950);
  portal.focus({ preventScroll: true });
}

// Off-screen panels must not be reachable by keyboard or screen reader while focused.
function applyFocusInert() {
  [cityListNav, factsPanel, $('#title-meta')].forEach((el) => { el.inert = portalDocked; });
  const exit = $('#focus-exit');
  exit.tabIndex = portalDocked ? 0 : -1;
  exit.setAttribute('aria-hidden', String(!portalDocked));
}

experience.classList.toggle('portal-docked', portalDocked);
dockMix = portalDocked ? 1 : 0;
applyFocusInert();
nextBtn.addEventListener('click', () => navigate(neighbour(current, 1)));
prevBtn.addEventListener('click', () => navigate(neighbour(current, -1)));

floatingLogo.addEventListener('click', (e) => {
  e.preventDefault();
  navigate(START);
});

countryNav.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-country]');
  if (btn && btn.dataset.country !== byId[current].country) navigate(citiesOf(btn.dataset.country)[0].id);
});

[cityList, drawerGroups, destinationGroups].forEach((list) => {
  list.addEventListener('click', (e) => {
    const item = e.target.closest('[data-city]');
    if (!item) return;
    const dialog = item.closest('dialog');
    if (dialog) closeDialog(dialog);
    navigate(item.dataset.city);
  });
});

function anyDialogOpen() {
  return Object.values(dialogs).some((d) => d.open);
}

document.addEventListener('keydown', (e) => {
  if (anyDialogOpen() || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (e.key === 'Escape' && portalDocked) {
    setPortalDocked(false);
    return;
  }
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    navigate(neighbour(current, 1));
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    navigate(neighbour(current, -1));
  }
});

let touchStart = null;
experience.addEventListener('touchstart', (e) => {
  touchStart = e.touches.length === 1 && !e.target.closest('.gallery')
    ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: performance.now() }
    : null;
}, { passive: true });

experience.addEventListener('touchend', (e) => {
  if (!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  const quick = performance.now() - touchStart.t < 700;
  touchStart = null;
  if (quick && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    navigate(neighbour(current, dx < 0 ? 1 : -1));
  }
}, { passive: true });

/* ---------- Dialogs ---------- */

let dialogOpener = null;

function openDialog(dialog) {
  if (dialog.open) return;
  if (!anyDialogOpen()) dialogOpener = document.activeElement;
  Object.values(dialogs).forEach((d) => {
    if (d.open) {
      d.classList.remove('is-open');
      d.close();
    }
  });
  dialog.showModal();
  requestAnimationFrame(() => requestAnimationFrame(() => dialog.classList.add('is-open')));
}

function closeDialog(dialog) {
  if (!dialog.open) return;
  dialog.classList.remove('is-open');
  const finish = () => {
    if (dialog.classList.contains('is-open')) return;
    dialog.close();
    if (!anyDialogOpen() && dialogOpener?.isConnected) dialogOpener.focus();
  };
  if (reduceMotion.matches) finish();
  else setTimeout(finish, 320);
}

document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-open]');
  if (opener) openDialog(dialogs[opener.dataset.open]);
});

Object.values(dialogs).forEach((dialog) => {
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeDialog(dialog);
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-close]')) closeDialog(dialog);
  });
});

/* ---------- Custom cursor (precise pointers only, over the portal) ---------- */

let pointerX = 0;
let pointerY = 0;
let orbitX = 0;
let orbitY = 0;
let cursorQueued = false;

function cursorFrame() {
  cursorQueued = false;
  orbitX += (pointerX - orbitX) * 0.25;
  orbitY += (pointerY - orbitY) * 0.25;
  cursorOrbit.style.transform = `translate3d(${orbitX}px, ${orbitY}px, 0) translate(-50%, -50%)`;
  cursorLabel.style.transform = `translate3d(${orbitX}px, ${orbitY}px, 0) translateX(-50%)`;
  if (Math.abs(pointerX - orbitX) > 0.3 || Math.abs(pointerY - orbitY) > 0.3) requestCursorFrame();
}

function requestCursorFrame() {
  if (cursorQueued) return;
  cursorQueued = true;
  requestAnimationFrame(cursorFrame);
}

portal.addEventListener('pointerenter', (ev) => {
  if (ev.pointerType === 'touch' || !finePointer.matches || reduceMotion.matches) return;
  pointerX = orbitX = ev.clientX;
  pointerY = orbitY = ev.clientY;
  cursorLabel.textContent = portalDocked ? 'Open' : 'Enter';
  customCursor.classList.add('is-visible');
  requestCursorFrame();
});

portal.addEventListener('pointermove', (ev) => {
  if (!customCursor.classList.contains('is-visible')) return;
  pointerX = ev.clientX;
  pointerY = ev.clientY;
  requestCursorFrame();
});

portal.addEventListener('pointerleave', () => customCursor.classList.remove('is-visible'));

/* ---------- Want to go (saved cities and places, per browser) ---------- */

const SAVED_KEY = 'travel-city:saved';
const saveCityBtn = $('#save-city');
const saveCityLabel = $('#save-city-label');
const savedCount = $('#saved-count');
const savedIntro = $('#saved-intro');
const savedContent = $('#saved-content');
const savedActions = $('#saved-actions');

function loadSaved() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVED_KEY));
    return {
      cities: (s?.cities ?? []).filter((id) => byId[id]),
      places: (s?.places ?? []).filter((p) => p?.id && byId[p.city])
    };
  } catch {
    return { cities: [], places: [] };
  }
}

const saved = loadSaved();
let sharedTrip = null; // a list opened from someone else's share link

function persistSaved() {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(saved)); } catch {}
  renderSavedState();
  renderPlaces();
  if (dialogs.saved.open) renderSavedDialog();
}

const isCitySaved = (id) => saved.cities.includes(id);
const isPlaceSaved = (id) => saved.places.some((p) => p.id === id);

// Re-read before every change so another open tab's edits are never overwritten.
function syncSaved() {
  Object.assign(saved, loadSaved());
}

function toggleCity(id) {
  syncSaved();
  saved.cities = isCitySaved(id) ? saved.cities.filter((c) => c !== id) : [...saved.cities, id];
  persistSaved();
  setStatus(isCitySaved(id) ? `${byId[id].name} saved to Want to go.` : `${byId[id].name} removed from Want to go.`, false);
}

function findPlace(id) {
  for (const c of cities) {
    const p = cityPlaces(c.id).find((x) => x.id === id);
    if (p) return { ...p, city: c.id };
  }
  return null;
}

function togglePlace(id) {
  const p = findPlace(id);
  if (!p) return;
  syncSaved();
  saved.places = isPlaceSaved(id) ? saved.places.filter((x) => x.id !== id) : [...saved.places, { id, name: p.name, city: p.city }];
  persistSaved();
  setStatus(isPlaceSaved(id) ? `${p.name} saved to Want to go.` : `${p.name} removed from Want to go.`, false);
}

function renderSavedState() {
  const on = isCitySaved(current);
  saveCityBtn.setAttribute('aria-pressed', String(on));
  saveCityLabel.textContent = on ? 'Saved' : 'Want to go';
  saveCityBtn.title = on ? `Remove ${byId[current].name} from Want to go` : `Save ${byId[current].name} to Want to go`;
  const total = saved.cities.length + saved.places.length;
  savedCount.textContent = String(total);
  $('#saved-button').classList.toggle('has-saved', total > 0);
}

// Keep every open tab in step with changes made in another one.
window.addEventListener('storage', (e) => {
  if (e.key !== SAVED_KEY) return;
  syncSaved();
  renderSavedState();
  renderPlaces();
  if (dialogs.saved.open && !sharedTrip) renderSavedDialog();
  if (dialogs.quiz.open) renderQuiz();
});

saveCityBtn.addEventListener('click', () => toggleCity(current));

function shareUrl(list) {
  const url = new URL(location.href);
  url.hash = '';
  url.search = '';
  if (list.cities.length) url.searchParams.set('trip', list.cities.join(','));
  if (list.places.length) url.searchParams.set('places', list.places.map((p) => p.id).join(','));
  return url.toString();
}

function csvFor(list) {
  const rows = [['Name', 'Type', 'City', 'Country', 'Latitude', 'Longitude', 'Google Maps']];
  list.cities.forEach((id) => {
    const c = byId[id];
    const ll = cityCenter(id);
    rows.push([c.name, 'City', c.name, c.nation, ll?.lat ?? '', ll?.lng ?? '', mapsUrlForCity(c)]);
  });
  list.places.forEach((p) => {
    const full = findPlace(p.id);
    const c = byId[p.city];
    rows.push([p.name, 'Place', c.name, c.nation, full?.lat ?? '', full?.lng ?? '', mapsUrlForPlace(p)]);
  });
  return rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
}

function renderSavedDialog() {
  const list = sharedTrip ?? saved;
  const shared = Boolean(sharedTrip);
  $('#saved-title').textContent = shared ? 'A shared trip' : 'Want to go';
  const total = list.cities.length + list.places.length;
  savedIntro.textContent = shared
    ? `Someone shared ${total} ${total === 1 ? 'stop' : 'stops'} with you. Add them to your own list, or step through the portal to any of them.`
    : total
    ? 'Your shortlist. Open any stop in Google Maps to save it there, or download the list for Google My Maps.'
    : 'Nothing saved yet. Tap “Want to go” on a city, or the heart next to a must-see place on the map.';

  const cityCards = list.cities.map((id) => {
    const c = byId[id];
    const localSaved = c.local && c.local !== c.name
      ? ` <span${c.lang ? ` lang="${c.lang}"` : ''}>${esc(c.local)}</span>`
      : '';
    return `<li class="saved-item">
      <button type="button" class="saved-go" data-city="${id}"><img src="${c.photos[0].thumb}" alt="" /><span><strong>${esc(c.name)}</strong>${localSaved}<small>${esc(c.nation)}</small></span></button>
      <a class="saved-link" href="${mapsUrlForCity(c)}" target="_blank" rel="noopener" aria-label="Open ${esc(c.name)} in Google Maps">Google Maps ↗</a>
      ${shared ? '' : `<button type="button" class="saved-remove" data-remove-city="${id}" aria-label="Remove ${esc(c.name)}">&times;</button>`}
    </li>`;
  }).join('');
  const placeRows = list.places.map((p) => {
    const c = byId[p.city];
    return `<li class="saved-item saved-item--place">
      <button type="button" class="saved-go" data-city="${p.city}"><span class="saved-pin" aria-hidden="true"></span><span><strong>${esc(p.name)}</strong><small>${esc(c.name)}, ${esc(c.nation)}</small></span></button>
      <a class="saved-link" href="${mapsUrlForPlace(p)}" target="_blank" rel="noopener" aria-label="Open ${esc(p.name)} in Google Maps">Google Maps ↗</a>
      ${shared ? '' : `<button type="button" class="saved-remove" data-remove-place="${p.id}" aria-label="Remove ${esc(p.name)}">&times;</button>`}
    </li>`;
  }).join('');
  savedContent.innerHTML = `${list.cities.length ? `<h3 class="group-title">Cities</h3><ul class="saved-list">${cityCards}</ul>` : ''}
    ${list.places.length ? `<h3 class="group-title">Places</h3><ul class="saved-list">${placeRows}</ul>` : ''}`;

  savedActions.innerHTML = shared
    ? `<button type="button" class="action-btn action-btn--primary" data-action="adopt">Add all to my list</button>`
    : total
    ? `<button type="button" class="action-btn action-btn--primary" data-action="share">Copy share link</button>
       <button type="button" class="action-btn" data-action="csv">Download for Google My Maps</button>
       <p class="saved-hint">Google Maps doesn’t let websites write to your saved lists. Use “Google Maps ↗” on any stop and tap Save there, or import the download at <a href="https://www.google.com/mymaps" target="_blank" rel="noopener">google.com/mymaps</a> to see your whole list in the Google Maps app.</p>`
    : '';
}

dialogs.saved.addEventListener('click', async (e) => {
  const removeCity = e.target.closest('[data-remove-city]');
  const removePlace = e.target.closest('[data-remove-place]');
  const go = e.target.closest('.saved-go');
  const action = e.target.closest('[data-action]')?.dataset.action;
  if (removeCity) toggleCity(removeCity.dataset.removeCity);
  else if (removePlace) togglePlace(removePlace.dataset.removePlace);
  else if (go) {
    closeDialog(dialogs.saved);
    navigate(go.dataset.city);
  } else if (action === 'adopt' && sharedTrip) {
    syncSaved();
    sharedTrip.cities.forEach((id) => { if (!isCitySaved(id)) saved.cities.push(id); });
    sharedTrip.places.forEach((p) => { if (!isPlaceSaved(p.id)) saved.places.push(p); });
    sharedTrip = null;
    persistSaved();
    setStatus('Added to your Want to go list.', false);
  } else if (action === 'share') {
    const url = shareUrl(saved);
    const btn = e.target.closest('[data-action]');
    try {
      await navigator.clipboard.writeText(url);
      btn.textContent = 'Link copied ✓';
    } catch {
      prompt('Copy this link:', url);
    }
  } else if (action === 'csv') {
    const blob = new Blob([csvFor(saved)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'travel-city-want-to-go.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
});

dialogs.saved.addEventListener('close', () => {
  sharedTrip = null;
});

// Opening the saved list always shows your own list unless a shared link was just followed.
$('#saved-button').addEventListener('click', () => renderSavedDialog());
document.querySelectorAll('[data-open="saved"]').forEach((b) => b.addEventListener('click', () => renderSavedDialog()));

function openSharedTrip() {
  const params = new URLSearchParams(location.search);
  if (!params.has('trip') && !params.has('places')) return;
  const tripCities = (params.get('trip') || '').split(',').filter((id) => byId[id]);
  const tripPlaces = (params.get('places') || '').split(',').map(findPlace).filter(Boolean)
    .map(({ id, name, city }) => ({ id, name, city }));
  history.replaceState(null, '', location.pathname + location.hash);
  if (!tripCities.length && !tripPlaces.length) return;
  sharedTrip = { cities: tripCities, places: tripPlaces };
  renderSavedDialog();
  openDialog(dialogs.saved);
}

/* ---------- Where should I go? ---------- */

const quiz = { picks: [], month: null, regions: [] };
const quizInterests = $('#quiz-interests');
const quizMonths = $('#quiz-months');
const quizRegions = $('#quiz-regions');
const quizResults = $('#quiz-results');

function chip(attr, value, label, pressed, extra = '') {
  return `<button type="button" class="chip" ${attr}="${value}" aria-pressed="${pressed}">${label}${extra}</button>`;
}

function renderQuiz() {
  quizInterests.innerHTML = interests
    .map((i) => chip('data-pick', i.id, esc(i.label), quiz.picks.includes(i.id), ` <span lang="zh">${i.local}</span>`))
    .join('');
  quizMonths.innerHTML = chip('data-month', 'any', 'Any time', quiz.month === null)
    + MONTHS.map((m, i) => chip('data-month', i, m, quiz.month === i)).join('');
  quizRegions.innerHTML = countries
    .filter((c) => c.available)
    .map((c) => chip('data-region', c.id, esc(c.name), quiz.regions.includes(c.id), c.local ? ` <span lang="zh">${esc(c.local)}</span>` : ''))
    .join('');

  const empty = !quiz.picks.length && quiz.month === null;
  const ranked = rankCities(cities, quiz).filter((r) => empty || r.score > 0).slice(0, 3);
  quizResults.innerHTML = empty
    ? '<li class="quiz-empty">Choose an interest or a month to see your matches.</li>'
    : ranked.length
    ? ranked.map(({ city, percent, reasons }, i) => `
      <li class="quiz-result">
        <img src="${city.photos[0].thumb}" alt="" />
        <div class="quiz-result-text">
          <p class="quiz-rank">#${i + 1} · ${percent}% match</p>
          <h4>${esc(city.name)}${city.local && city.local !== city.name ? ` <span${city.lang ? ` lang="${city.lang}"` : ''}>${esc(city.local)}</span>` : ''} <small>${esc(city.nation)}</small></h4>
          <p class="quiz-reasons">${reasons.map(esc).join(' · ') || esc(city.tagline)}</p>
        </div>
        <div class="quiz-result-actions">
          <button type="button" class="action-btn action-btn--primary" data-go="${city.id}">Take me there</button>
          <button type="button" class="heart" data-save-city="${city.id}" aria-pressed="${isCitySaved(city.id)}" aria-label="${isCitySaved(city.id) ? 'Remove' : 'Save'} ${esc(city.name)}" title="${isCitySaved(city.id) ? 'Remove from' : 'Save to'} Want to go">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
          </button>
        </div>
      </li>`).join('')
    : '<li class="quiz-empty">No city fits all of that — try another month or region.</li>';
}

dialogs.quiz.addEventListener('click', (e) => {
  const pick = e.target.closest('[data-pick]');
  const month = e.target.closest('[data-month]');
  const region = e.target.closest('[data-region]');
  const go = e.target.closest('[data-go]');
  const save = e.target.closest('[data-save-city]');
  const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  if (pick) quiz.picks = toggle(quiz.picks, pick.dataset.pick);
  else if (month) quiz.month = month.dataset.month === 'any' ? null : Number(month.dataset.month);
  else if (region) quiz.regions = toggle(quiz.regions, region.dataset.region);
  else if (save) toggleCity(save.dataset.saveCity);
  else if (go) {
    closeDialog(dialogs.quiz);
    navigate(go.dataset.go);
    return;
  } else return;
  const focusKey = [...e.target.closest('button').attributes].find((a) => a.name.startsWith('data-'));
  renderQuiz();
  // Keep keyboard focus on the chip that was just toggled.
  if (focusKey) dialogs.quiz.querySelector(`[${focusKey.name}="${CSS.escape(focusKey.value)}"]`)?.focus();
});

document.querySelectorAll('[data-open="quiz"]').forEach((b) => b.addEventListener('click', () => renderQuiz()));

/* ---------- Local time and weather (Open-Meteo, free, no key) ---------- */

const localNow = $('#local-now');
const weatherCache = new Map();
const WEATHER_TTL = 15 * 60 * 1000;

// WMO weather codes → short label and symbol.
function describeWeather(code, isDay) {
  if (code === 0) return [isDay ? '☀︎' : '☾', 'Clear'];
  if (code <= 2) return [isDay ? '⛅︎' : '☁︎', 'Partly cloudy'];
  if (code === 3) return ['☁︎', 'Overcast'];
  if (code <= 48) return ['〰︎', 'Fog'];
  if (code <= 57) return ['☂︎', 'Drizzle'];
  if (code <= 67) return ['☂︎', 'Rain'];
  if (code <= 77) return ['❄︎', 'Snow'];
  if (code <= 82) return ['☂︎', 'Showers'];
  if (code <= 86) return ['❄︎', 'Snow showers'];
  return ['⚡︎', 'Thunderstorm'];
}

async function fetchWeather(cityId) {
  const hit = weatherCache.get(cityId);
  if (hit && Date.now() - hit.at < WEATHER_TTL) return hit.data;
  const c = cityCenter(cityId);
  if (!c) return null;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lng}&current=temperature_2m,weather_code,is_day&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`weather ${res.status}`);
  const data = await res.json();
  weatherCache.set(cityId, { at: Date.now(), data });
  return data;
}

function formatLocalTime(timeZone) {
  try {
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone }).format(new Date());
  } catch {
    return null;
  }
}

async function renderLocalNow() {
  const cityId = current;
  try {
    const w = await fetchWeather(cityId);
    if (cityId !== current || !w) return;
    const time = formatLocalTime(w.timezone);
    const [icon, label] = describeWeather(w.current.weather_code, w.current.is_day);
    const temp = Math.round(w.current.temperature_2m);
    localNow.innerHTML = `<span class="local-time">${time ?? ''}</span> local time <span aria-hidden="true">·</span> <span aria-hidden="true">${icon}</span> ${temp} °C ${label}`;
    localNow.dataset.tz = w.timezone;
  } catch {
    if (cityId === current) localNow.textContent = `Local time ${byId[cityId].stats.time}`;
  }
}

// Tick the clock once a minute while the page is visible.
setInterval(() => {
  const el = localNow.querySelector('.local-time');
  if (!document.hidden && el && localNow.dataset.tz) el.textContent = formatLocalTime(localNow.dataset.tz);
}, 30000);

/* ---------- Map panel ---------- */

const mapSheet = $('#map-sheet');
const mapToggle = $('#map-toggle');
const mapCanvas = $('#map-canvas');
const placeList = $('#place-list');
let mapOpen = false;

function renderPlaces() {
  const city = byId[current];
  $('#map-title').textContent = `${city.name} on the map`;
  $('#map-open-city').href = mapsUrlForCity(city);
  placeList.innerHTML = cityPlaces(current).map((p, i) => `
    <li class="place" data-place-row="${p.id}">
      <div class="place-main">
        <button type="button" class="place-name" data-place="${p.id}" aria-expanded="false" aria-controls="detail-${p.id}"><span class="place-num" aria-hidden="true">${i + 1}</span>${esc(p.name)}</button>
        <button type="button" class="heart" data-save-place="${p.id}" aria-pressed="${isPlaceSaved(p.id)}" aria-label="${isPlaceSaved(p.id) ? 'Remove' : 'Save'} ${esc(p.name)}" title="${isPlaceSaved(p.id) ? 'Remove from' : 'Save to'} Want to go">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
        </button>
        <a class="place-maps" href="${mapsUrlForPlace(p)}" target="_blank" rel="noopener" aria-label="Open ${esc(p.name)} in Google Maps">↗</a>
      </div>
      <div class="place-detail" id="detail-${p.id}" hidden></div>
    </li>`).join('');
}

async function expandPlace(id) {
  const row = placeList.querySelector(`[data-place-row="${CSS.escape(id)}"]`);
  if (!row) return;
  const btn = row.querySelector('.place-name');
  const detail = row.querySelector('.place-detail');
  const open = btn.getAttribute('aria-expanded') !== 'true';
  placeList.querySelectorAll('.place-name[aria-expanded="true"]').forEach((b) => {
    b.setAttribute('aria-expanded', 'false');
    b.closest('.place').querySelector('.place-detail').hidden = true;
  });
  if (!open) return;
  btn.setAttribute('aria-expanded', 'true');
  detail.hidden = false;
  row.scrollIntoView({ block: 'nearest', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  focusPlace(id);
  if (detail.dataset.loaded) return;
  detail.innerHTML = '<p class="place-loading">Loading details…</p>';
  try {
    const d = await fetchPlaceDetails(id);
    detail.dataset.loaded = '1';
    detail.innerHTML = `
      ${d.photo ? `<img src="${d.photo}" alt="" loading="lazy" />` : ''}
      ${d.rating ? `<p class="place-rating"><span aria-hidden="true">★</span> ${d.rating.toFixed(1)} <small>(${(d.count ?? 0).toLocaleString('en')} Google reviews)</small></p>` : ''}
      ${d.summary ? `<p>${esc(d.summary)}</p>` : ''}
      ${d.photoBy ? `<p class="place-credit">Photo: <a href="${d.photoBy.uri}" target="_blank" rel="noopener">${esc(d.photoBy.displayName)}</a> · Google Maps</p>` : ''}`;
  } catch (err) {
    console.error(err);
    detail.innerHTML = '<p class="place-loading">Details are unavailable right now.</p>';
  }
}

placeList.addEventListener('click', (e) => {
  const save = e.target.closest('[data-save-place]');
  const name = e.target.closest('[data-place]');
  if (save) togglePlace(save.dataset.savePlace);
  else if (name) expandPlace(name.dataset.place);
});

async function setMapOpen(open) {
  mapOpen = open;
  experience.classList.toggle('map-open', open);
  mapToggle.setAttribute('aria-pressed', String(open));
  mapSheet.inert = !open;
  if (!open) return;
  if (!hasMapsKey) {
    mapCanvas.innerHTML = '<p class="place-loading">Add a Google Maps API key to show the map.</p>';
    return;
  }
  try {
    const first = !isMapReady();
    await initMap(mapCanvas, current, (id) => {
      expandPlace(id);
      placeList.querySelector(`[data-place="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
    });
    if (first) cities.forEach((c) => visited.has(c.id) && c.id !== current && recordVisit(c.id));
    recordVisit(current);
    await showCity(current);
  } catch (err) {
    console.error(err);
    mapCanvas.innerHTML = '<p class="place-loading">The map couldn’t load. Check your connection or API key.</p>';
  }
}

mapToggle.addEventListener('click', () => setMapOpen(!mapOpen));
$('#map-close').addEventListener('click', () => { setMapOpen(false); mapToggle.focus(); });
$('#drawer-map').addEventListener('click', () => { closeDialog(dialogs.menu); setMapOpen(true); });

/* ---------- Layout ---------- */

function syncFactsPanel() {
  factsPanel.open = !compactLayout.matches;
}

compactLayout.addEventListener('change', syncFactsPanel);
syncFactsPanel();

document.fonts?.ready.then(resizeCanvas);
resizeCanvas();
runIntro();
