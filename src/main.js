import { planets, VOYAGE, LOGO, EARTH_DIAMETER_KM } from './planets.js';

const byId = Object.fromEntries(planets.map((p) => [p.id, p]));
const START = VOYAGE[0];
const AVAILABLE_COUNT = VOYAGE.length;
const VISITED_KEY = 'space-voyage:visited';
const INTRO_TIMEOUT_MS = 8000;

const $ = (selector) => document.querySelector(selector);

const experience = $('.experience');
const [videoA, videoB] = document.querySelectorAll('.scene-video');
const sceneImage = $('.scene-image');
const portalCanvas = $('#portal-canvas');
const ctx = portalCanvas.getContext('2d');
const portal = $('#portal');
const prevBtn = $('#prev-btn');
const nextBtn = $('#next-btn');
const nextName = $('#next-name');
const nextNumber = $('#next-number');
const planetTitle = $('#planet-title');
const factsPanel = $('#facts-panel');
const statsEl = $('#stats');
const factsList = $('#facts');
const planetListNav = $('.planet-list');
const planetList = $('#planet-list');
const progressLabel = $('#progress-label');
const drawerPlanets = $('#drawer-planets');
const drawerPlanetName = $('#drawer-planet-name');
const drawerProgress = $('#drawer-progress');
const systemList = $('#system-list');
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
  planets: $('#dialog-planets'),
  menu: $('#dialog-menu')
};

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(pointer: fine)');
const compactLayout = matchMedia('(max-width: 640px), (max-height: 520px)');

$('#logo-image').src = LOGO;

/* ---------- Visited progress (per browser) ---------- */

function loadVisited() {
  try {
    const stored = JSON.parse(localStorage.getItem(VISITED_KEY));
    return Array.isArray(stored) ? stored.filter((id) => byId[id]?.available) : [];
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

function neighbour(id, step) {
  const i = VOYAGE.indexOf(id);
  return VOYAGE[(i + step + VOYAGE.length) % VOYAGE.length];
}

function planetFromHash() {
  const id = decodeURIComponent(location.hash.slice(1)).toLowerCase();
  return byId[id]?.available ? id : null;
}

let current = planetFromHash() || START;
let desired = current;
let travellingTo = null;
let busy = true; // until the intro finishes

// Every navigation goes through the URL so Back/Forward and shared links behave.
function navigate(id) {
  if (!byId[id]?.available) return;
  if (location.hash === '#' + id) {
    requestTravel(id);
  } else {
    location.hash = id;
  }
}

window.addEventListener('hashchange', () => {
  requestTravel(planetFromHash() || START);
});

function requestTravel(id) {
  desired = id;
  if (busy) {
    if (travellingTo && desired !== travellingTo) {
      setStatus(`Warping to ${byId[travellingTo].name} — then ${byId[desired].name}`, true);
    }
    return;
  }
  if (desired !== current) travel(desired);
}

/* ---------- Status ---------- */

function setStatus(text, visible) {
  statusEl.textContent = text;
  statusEl.classList.toggle('is-visible', visible);
}

/* ---------- Rendering ---------- */

function planetItem(p, step) {
  const active = p.id === current;
  const attrs = p.available
    ? `data-planet="${p.id}"${active ? ' aria-current="true"' : ''}`
    : 'disabled';
  const extra = !p.available
    ? '<span class="soon-tag">Coming soon</span>'
    : visited.has(p.id) && !active
    ? '<span class="visited-mark" title="Visited"></span><span class="visually-hidden">(visited)</span>'
    : '';
  return `<li style="--i:${step}"><button type="button" class="planet-item${active ? ' is-active' : ''}" ${attrs}><span class="planet-num" aria-hidden="true">${p.number}</span><span>${p.name}</span>${extra}</button></li>`;
}

function render() {
  const planet = byId[current];
  const next = byId[neighbour(current, 1)];
  const prev = byId[neighbour(current, -1)];

  experience.dataset.planet = current;
  document.title = `${planet.name} — Space Voyage`;
  planetTitle.textContent = planet.name;

  nextName.textContent = next.name;
  nextNumber.textContent = `[${next.number}]`;
  portal.setAttribute('aria-label', `Travel to ${next.name}`);
  prevBtn.setAttribute('aria-label', `Previous planet: ${prev.name}`);
  prevBtn.title = `Previous: ${prev.name}`;
  nextBtn.setAttribute('aria-label', `Next planet: ${next.name}`);
  nextBtn.title = `Next: ${next.name}`;

  const ratio = planet.diameterKm / EARTH_DIAMETER_KM;
  statsEl.innerHTML = `
    <div class="stat"><span class="stat-label">Gravity</span><span class="stat-value">${planet.stats.gravity}</span></div>
    <div class="stat"><span class="stat-label">Moons</span><span class="stat-value">${planet.stats.moons}</span></div>
    <div class="stat"><span class="stat-label">Day</span><span class="stat-value">${planet.stats.day}</span></div>
    <div class="stat"><span class="stat-label">Size</span><span class="stat-value">${planet.diameterKm.toLocaleString('en')} km</span>
      <span class="size-bar" style="--size:${Math.min(1, ratio).toFixed(2)}" aria-hidden="true"></span>
      <span class="stat-note">${ratio.toFixed(2)}× Earth</span></div>`;
  factsList.innerHTML = planet.facts
    .map(([k, v]) => `<div class="fact"><dt>${k}</dt><dd>${v}</dd></div>`)
    .join('');

  const listMarkup = planets.map(planetItem).join('');
  planetList.innerHTML = listMarkup;
  drawerPlanets.innerHTML = listMarkup;

  systemList.innerHTML = planets
    .map((p) => {
      const size = Math.round(14 + Math.sqrt(p.diameterKm / 139820) * 44);
      const state = !p.available
        ? 'Coming soon'
        : p.id === current
        ? 'You are here'
        : visited.has(p.id)
        ? 'Visited'
        : 'Not yet visited';
      const attrs = p.available ? `data-planet="${p.id}"${p.id === current ? ' aria-current="true"' : ''}` : 'disabled';
      return `<li><button type="button" class="system-planet${p.id === current ? ' is-current' : ''}" ${attrs}>
        <span class="orb" style="--orb-size:${size}px;--orb-a:${p.colors[0]};--orb-b:${p.colors[1]}" aria-hidden="true"></span>
        <span class="system-num">${p.number}</span><span class="system-name">${p.name}</span><span class="system-state">${state}</span>
      </button></li>`;
    })
    .join('');

  const progressText = `${visited.size} of ${AVAILABLE_COUNT} visited`;
  progressLabel.textContent = progressText;
  drawerProgress.textContent = progressText;
  overviewProgressText.textContent = progressText;
  overviewProgressFill.style.width = `${(visited.size / AVAILABLE_COUNT) * 100}%`;
  drawerPlanetName.textContent = planet.name;

  planetListNav.classList.remove('is-switching');
  void planetListNav.offsetWidth;
  planetListNav.classList.add('is-switching');
}

/* ---------- Scene and portal media ---------- */

// Two video elements trade roles: one shows the current planet (holding the final frame of
// its arrival clip), the other holds the next destination for the portal and the warp.
let sceneVideo = videoA;
let spareVideo = videoB;
const portalImage = new Image();
portalImage.decoding = 'async';
let portalMedia = spareVideo;

function showScene(planet) {
  videoA.classList.toggle('is-scene', !!planet.clip && sceneVideo === videoA);
  videoB.classList.toggle('is-scene', !!planet.clip && sceneVideo === videoB);
  sceneImage.classList.toggle('is-scene', !planet.clip);
}

function setVideoSource(video, src) {
  if (video.dataset.src === src) return;
  video.dataset.src = src;
  video.preload = 'auto';
  video.src = src;
  video.load();
}

// Only the next destination is preloaded.
function loadPortalFor(planet) {
  if (planet.clip) {
    setVideoSource(spareVideo, planet.clip);
    portalMedia = spareVideo;
  } else {
    if (portalImage.dataset.src !== planet.image) {
      portalImage.dataset.src = planet.image;
      portalImage.src = planet.image;
    }
    portalMedia = portalImage;
  }
  requestDraw();
}

function isVideo(el) {
  return el instanceof HTMLVideoElement;
}

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
  requestDraw();
}

window.addEventListener('resize', resizeCanvas);

function drawCover(media, zoom = 1) {
  const mw = media.videoWidth || media.naturalWidth;
  const mh = media.videoHeight || media.naturalHeight;
  if (!mw || !mh) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.max(vw / mw, vh / mh) * zoom;
  const w = mw * scale;
  const h = mh * scale;
  try {
    ctx.drawImage(media, (vw - w) / 2, (vh - h) / 2, w, h);
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
  const r = portalRadius * (1 - e) * scale;

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
    ctx.fillStyle = '#030303';
    ctx.fillRect(0, 0, vw, vh);
    drawCover(portalMedia, imageZoom);
    ctx.restore();
  }

  if (tilting || transitionActive || activeAnimations > 0) requestDraw();
}

window.addEventListener('pointermove', (ev) => {
  if (ev.pointerType === 'touch' || busy || reduceMotion.matches) return;
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
      setStatus(`Preparing orbit to ${target.name}…`, true);
      await mediaReady(media, 8000, 3);
    }
    setStatus(`Warping to ${target.name}…`, true);
    experience.classList.remove('content-revealing', 'mask-revealing');

    if (reduceMotion.matches) {
      // No warp: cut straight to the destination.
      if (isVideo(media)) await seekToEnd(media);
    } else {
      experience.classList.add('is-transitioning');
      transitionActive = true;
      requestDraw();
      if (isVideo(media)) {
        media.currentTime = 0;
        media.playbackRate = 1.3;
        const ended = playbackEnded(media);
        await media.play().catch(() => {});
        await animateValue((v) => { expansion = v; }, 1100);
        await ended;
      } else {
        // Stills get a slow push-in instead of approach footage.
        await Promise.all([
          animateValue((v) => { expansion = v; }, 1100),
          animateValue((v) => { imageZoom = 1.35 - 0.35 * v; }, 2200)
        ]);
      }
    }

    // Commit: the warp media becomes the scene underneath the full-screen canvas.
    experience.classList.add('is-committing');
    if (isVideo(media)) {
      [sceneVideo, spareVideo] = [media, sceneVideo];
    } else {
      sceneImage.src = target.image;
      await sceneImage.decode().catch(() => {});
    }
    current = targetId;
    markVisited(current);
    showScene(target);
    render();
    await waitTwoFrames();

    transitionActive = false;
    expansion = 0;
    maskScale = 0;
    imageZoom = 1;
    experience.classList.remove('is-transitioning', 'is-committing');
    setStatus(`Arrived at ${target.name}.`, false);
    loadPortalFor(byId[neighbour(current, 1)]);

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
  render();
  startExperience();
}

async function startExperience() {
  loadPortalFor(byId[neighbour(current, 1)]);
  await revealPortal();
  document.body.classList.add('intro-ready');
  setTimeout(revealContent, reduceMotion.matches ? 0 : 850);
  busy = false;
  if (desired !== current) requestTravel(desired);
}

// The intro is the current planet's arrival clip. The counter reports how much of it has
// actually loaded; playback starts once it can play through. Returning visitors and
// reduced-motion users skip straight to the final frame.
function runIntro() {
  const planet = byId[current];
  showScene(planet);
  render();

  if (!planet.clip) {
    sceneImage.src = planet.image;
    finishIntro();
    return;
  }

  const video = sceneVideo;
  setVideoSource(video, planet.clip);

  const skip = () => {
    if (introFinished) return;
    video.pause();
    seekToEnd(video);
    finishIntro();
  };

  if (isReturningVisitor || reduceMotion.matches) {
    skip();
    return;
  }

  let started = false;
  let shown = 0;
  const updateProgress = () => {
    if (started) return;
    let pct = 0;
    if (isFinite(video.duration) && video.duration > 0 && video.buffered.length) {
      pct = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100;
    }
    shown = Math.max(shown, Math.min(99, Math.round(pct)));
    preloaderValue.textContent = String(shown);
  };
  ['progress', 'loadedmetadata', 'loadeddata'].forEach((t) => video.addEventListener(t, updateProgress));

  const start = () => {
    if (started || introFinished) return;
    started = true;
    preloaderValue.textContent = '100';
    preloaderCount.classList.add('is-leaving');
    document.body.classList.add('intro-started');
    video.playbackRate = Math.max(0.25, (video.duration || 3) / 3);
    video.play().catch(skip);
  };

  video.addEventListener('canplaythrough', start, { once: true });
  video.addEventListener('ended', () => { if (started) finishIntro(); }, { once: true });
  video.addEventListener('error', skip, { once: true });
  skipIntroBtn.addEventListener('click', skip);
  setTimeout(() => { if (!started) skip(); }, INTRO_TIMEOUT_MS);
}

// Browsers may pause muted video in a hidden tab; pick the intro or warp back up on return.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  const playing = !introFinished ? sceneVideo : transitionActive ? portalMedia : null;
  if (isVideo(playing) && playing.paused && !playing.ended && playing.currentTime > 0) {
    playing.play().catch(() => {});
  }
});

/* ---------- Controls ---------- */

portal.addEventListener('click', () => navigate(neighbour(current, 1)));
nextBtn.addEventListener('click', () => navigate(neighbour(current, 1)));
prevBtn.addEventListener('click', () => navigate(neighbour(current, -1)));

[planetList, drawerPlanets, systemList].forEach((list) => {
  list.addEventListener('click', (e) => {
    const item = e.target.closest('[data-planet]');
    if (!item) return;
    const dialog = item.closest('dialog');
    if (dialog) closeDialog(dialog);
    navigate(item.dataset.planet);
  });
});

function anyDialogOpen() {
  return Object.values(dialogs).some((d) => d.open);
}

document.addEventListener('keydown', (e) => {
  if (anyDialogOpen() || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest('input, textarea, select, [contenteditable]')) return;
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
  touchStart = e.touches.length === 1
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

/* ---------- Dialogs (native <dialog>: modal, focus-trapped, Escape to close) ---------- */

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

document.querySelectorAll('[data-open]').forEach((btn) => {
  btn.addEventListener('click', () => openDialog(dialogs[btn.dataset.open]));
});

Object.values(dialogs).forEach((dialog) => {
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeDialog(dialog);
  });
  dialog.addEventListener('click', (e) => {
    // Clicks on the dialog element itself land on the backdrop, outside the card.
    if (e.target === dialog || e.target.closest('[data-close]')) closeDialog(dialog);
  });
});

/* ---------- Custom cursor (precise pointers only, over the portal) ---------- */

let pointerX = 0;
let pointerY = 0;
let orbitX = 0;
let orbitY = 0;
let cursorQueued = false;

function cursorEnabled() {
  return finePointer.matches && !reduceMotion.matches;
}

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
  if (ev.pointerType === 'touch' || !cursorEnabled()) return;
  pointerX = orbitX = ev.clientX;
  pointerY = orbitY = ev.clientY;
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

/* ---------- Layout ---------- */

function syncFactsPanel() {
  factsPanel.open = !compactLayout.matches;
}

compactLayout.addEventListener('change', syncFactsPanel);
syncFactsPanel();

document.fonts?.ready.then(resizeCanvas);
resizeCanvas();
runIntro();
