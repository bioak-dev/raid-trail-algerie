(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Intro cinématique ── */
  function initIntro() {
    const curtain = document.getElementById('introCurtain');
    const enterBtn = document.getElementById('introEnter');
    const hero = document.getElementById('hero');
    if (!curtain) return;

    function dismissIntro() {
      curtain.classList.add('is-hidden');
      curtain.setAttribute('aria-hidden', 'true');
      hero?.classList.add('is-loaded');
      document.body.style.overflow = '';
      try { sessionStorage.setItem('raidalg-intro-seen', '1'); } catch (_) { /* ignore */ }
    }

    if (prefersReducedMotion || sessionStorage.getItem('raidalg-intro-seen') === '1') {
      curtain.classList.add('is-hidden');
      curtain.setAttribute('aria-hidden', 'true');
      hero?.classList.add('is-loaded');
      return;
    }

    document.body.style.overflow = 'hidden';
    enterBtn?.addEventListener('click', dismissIntro);
    setTimeout(dismissIntro, 5200);
  }

  /* ── Scroll reveal ── */
  function initScrollReveal() {
    const els = [...document.querySelectorAll('.reveal')].filter(el => !el.closest('.hero-content'));
    if (!els.length) return;

    if (prefersReducedMotion) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => observer.observe(el));
  }

  /* ── Hero parallax ── */
  function initHeroParallax() {
    const heroBg = document.getElementById('heroBg');
    const hero = document.getElementById('hero');
    if (!heroBg || !hero || prefersReducedMotion) return;

    window.addEventListener('scroll', () => {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const offset = rect.top * 0.28;
      heroBg.style.transform = `translate3d(0, ${offset}px, 0)`;
    }, { passive: true });
  }

  /* ── Immersion scrollytelling ── */
  function initDreamScroll() {
    const section = document.getElementById('reve');
    if (!section) return;

    const steps = section.querySelectorAll('.dream-step');
    const bgs = section.querySelectorAll('.dream-bg');
    const progressBar = document.getElementById('dreamProgressBar');
    if (!steps.length || !bgs.length) return;

    let activeIndex = 0;

    function setDreamStep(index) {
      if (index === activeIndex && !prefersReducedMotion) return;
      activeIndex = index;
      steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
      bgs.forEach((bg, i) => bg.classList.toggle('is-active', i === index));
      if (progressBar) {
        progressBar.style.height = `${((index + 1) / steps.length) * 100}%`;
      }
    }

    if (prefersReducedMotion) {
      setDreamStep(0);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.dataset.dream);
          if (!Number.isNaN(idx)) setDreamStep(idx);
        }
      });
    }, { threshold: 0.45, rootMargin: '-20% 0px -30% 0px' });

    steps.forEach(step => observer.observe(step));
    setDreamStep(0);
  }

  function initExperience() {
    initIntro();
    initScrollReveal();
    initHeroParallax();
    initDreamScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExperience);
  } else {
    initExperience();
  }

  /* ── Navigation scroll effect ── */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  /* ── Interactive journey map ── */
  const trips = window.RAID_TRIPS || [];
  let activeTripId = trips[0]?.id || null;
  let routeStages = [];

  const MOTO_ICON_SRC = 'images/moto-tenere-icon.png';
  const MOTO_ICON_W = 56;
  const MOTO_ICON_H = 35;

  const MOTO_SPEED = 10; /* points par seconde le long du tracé */
  const STAGE_ZOOM = 9;
  const FOLLOW_MARGIN = 0.28; /* marge écran avant recentrage */
  const MOTO_ICON_HEADING_OFFSET = 90; /* icône Ténéré profil gauche : 0° CSS = ouest */

  let map, motoMarker, traveledLine, backgroundLine, pathPoints = [], stagePathIndex = [];
  let segmentLines = [];
  let cityLabelMarkers = [];
  let mapReady = false;
  let pathProgress = 0;
  let animating = false;
  let rafId = null;
  let lastFrameTime = 0;
  let currentStage = 0;
  let stageMarkers = [];
  let userPaused = false;
  let motoRotationDeg = null;
  let isResetting = false;
  let stageFlying = false;
  let lastFollowTime = 0;

  function getTrip(id) {
    return trips.find(t => t.id === id) || trips[0];
  }

  function updateMapHeader(trip) {
    const title = document.getElementById('journeyMapTitle');
    const subtitle = document.getElementById('journeyMapSubtitle');
    if (title) title.textContent = trip?.mapTitle || trip?.title || 'Le parcours';
    if (subtitle) subtitle.textContent = trip?.mapSubtitle || trip?.route || '';
  }

  function buildTripTabs() {
    const el = document.getElementById('journeyTripTabs');
    if (!el || !trips.length) return;

    el.innerHTML = trips.map(trip => `
      <button
        type="button"
        class="journey-trip-tab${activeTripId === trip.id ? ' is-active' : ''}"
        data-trip-id="${trip.id}"
        role="tab"
        aria-selected="${activeTripId === trip.id ? 'true' : 'false'}"
      >${trip.title}</button>
    `).join('');

    el.querySelectorAll('.journey-trip-tab').forEach(btn => {
      btn.addEventListener('click', () => loadTripRoute(btn.dataset.tripId, { restart: true }));
    });
  }

  function clearMapRouteLayers() {
    stopAnimation(true);
    segmentLines.forEach(line => map?.removeLayer(line));
    segmentLines = [];
    stageMarkers.forEach(marker => map?.removeLayer(marker));
    stageMarkers = [];
    cityLabelMarkers.forEach(marker => map?.removeLayer(marker));
    cityLabelMarkers = [];
    if (backgroundLine) {
      map.removeLayer(backgroundLine);
      backgroundLine = null;
    }
    if (traveledLine) {
      map.removeLayer(traveledLine);
      traveledLine = null;
    }
    if (motoMarker) {
      map.removeLayer(motoMarker);
      motoMarker = null;
    }
  }

  function buildRouteLayers() {
    const path = buildDensePath(routeStages, 80);
    pathPoints = path.points;
    stagePathIndex = path.stagePathIndex;
    pathProgress = 0;
    currentStage = 0;
    motoRotationDeg = null;
    isResetting = false;

    backgroundLine = L.polyline(pathPoints, {
      color: '#E8D5B7',
      weight: 8,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
      pane: 'routePane'
    }).addTo(map);

    traveledLine = L.polyline([], {
      color: '#B85C38',
      weight: 6,
      opacity: 1,
      lineCap: 'round',
      lineJoin: 'round',
      pane: 'routePane'
    }).addTo(map);

    for (let i = 0; i < routeStages.length - 1; i++) {
      const start = pathIndexForStage(i);
      const end = pathIndexForStage(i + 1);
      const segPoints = pathPoints.slice(start, end + 1);
      const targetStage = i + 1;
      const segment = L.polyline(segPoints, {
        color: 'transparent',
        weight: 16,
        opacity: 0,
        className: 'route-segment',
        pane: 'routePane'
      }).addTo(map);
      segment.on('click', () => selectStage(targetStage, true));
      segmentLines.push(segment);
    }

    stageMarkers = routeStages.map((s, i) => {
      const marker = L.marker([s.lat, s.lng], {
        icon: createStageIcon(i + 1, i === 0),
        zIndexOffset: 1000
      }).addTo(map);
      marker.on('click', () => selectStage(i, true));
      return marker;
    });

    cityLabelMarkers = routeStages.map((s) => {
      return L.marker([s.lat, s.lng], {
        icon: createCityLabel(s.name),
        pane: 'labelPane',
        interactive: false,
        zIndexOffset: 2000
      }).addTo(map);
    });

    const startRotation = getMotoRotationDeg(pathPoints[0][0], pathPoints[0][1], pathPoints[1][0], pathPoints[1][1]);
    motoMarker = L.marker(pathPoints[0], {
      icon: createMotoIcon(startRotation),
      pane: 'motoPane',
      zIndexOffset: 1000,
      interactive: false
    }).addTo(map);

    map.fitBounds(L.latLngBounds(pathPoints), { padding: [48, 48], animate: false });
    map.invalidateSize();
    buildTimeline();
    updatePreview(0, false);
    updateTraveledLine(0);

    const progressBar = document.getElementById('journeyProgressBar');
    if (progressBar) progressBar.style.width = '0%';
  }

  function loadTripRoute(tripId, options = {}) {
    const trip = getTrip(tripId);
    if (!trip?.routeStages?.length || !map) return;

    activeTripId = trip.id;
    routeStages = trip.routeStages;

    updateMapHeader(trip);
    buildTripTabs();
    clearMapRouteLayers();
    buildRouteLayers();

    if (options.restart && !prefersReducedMotion) {
      userPaused = false;
      const parcoursSection = document.getElementById('parcours');
      if (parcoursSection?.getBoundingClientRect().top < window.innerHeight) {
        setTimeout(() => startAnimation(true), 400);
      }
    }
  }

  function buildDensePath(stages, stepsPerLeg) {
    const points = [[stages[0].lat, stages[0].lng]];
    const stagePathIndex = [0];

    for (let i = 0; i < stages.length - 1; i++) {
      for (let j = 1; j <= stepsPerLeg; j++) {
        const t = j / stepsPerLeg;
        points.push([
          stages[i].lat + (stages[i + 1].lat - stages[i].lat) * t,
          stages[i].lng + (stages[i + 1].lng - stages[i].lng) * t
        ]);
      }
      stagePathIndex.push(points.length - 1);
    }
    return { points, stagePathIndex };
  }

  function getBearing(lat1, lng1, lat2, lng2) {
    const toRad = Math.PI / 180;
    const dLon = (lng2 - lng1) * toRad;
    const y = Math.sin(dLon) * Math.cos(lat2 * toRad);
    const x = Math.cos(lat1 * toRad) * Math.sin(lat2 * toRad) -
      Math.sin(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.cos(dLon);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }

  function getScreenBearing(lat1, lng1, lat2, lng2) {
    if (!map) return getBearing(lat1, lng1, lat2, lng2);
    const a = map.latLngToContainerPoint([lat1, lng1]);
    const b = map.latLngToContainerPoint([lat2, lng2]);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return 0;
    return Math.atan2(dx, -dy) * 180 / Math.PI;
  }

  function getMotoRotationDeg(lat1, lng1, lat2, lng2) {
    return getScreenBearing(lat1, lng1, lat2, lng2) + MOTO_ICON_HEADING_OFFSET;
  }

  function createMotoIcon(rotationDeg) {
    return L.divIcon({
      className: 'moto-marker-wrap',
      html: `<div class="moto-marker-inner" style="transform:rotate(${rotationDeg}deg)"><img class="moto-marker-img" src="${MOTO_ICON_SRC}" width="${MOTO_ICON_W}" height="${MOTO_ICON_H}" alt="" draggable="false"></div>`,
      iconSize: [MOTO_ICON_W, MOTO_ICON_H],
      iconAnchor: [MOTO_ICON_W / 2, MOTO_ICON_H / 2]
    });
  }

  function setMotoRotation(rotationDeg, immediate) {
    const el = motoMarker?.getElement()?.querySelector('.moto-marker-inner');
    if (!el) return;
    const target = rotationDeg;
    if (motoRotationDeg === null || immediate) {
      motoRotationDeg = target;
    } else {
      let diff = target - motoRotationDeg;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      motoRotationDeg += diff * 0.35;
    }
    el.style.transform = `rotate(${motoRotationDeg}deg)`;
  }

  function refreshMotoRotationFromPath() {
    if (!motoMarker || pathPoints.length < 2) return;
    const idx = Math.min(Math.floor(pathProgress), pathPoints.length - 2);
    const a = pathPoints[idx];
    const b = pathPoints[idx + 1];
    setMotoRotation(getMotoRotationDeg(a[0], a[1], b[0], b[1]), true);
  }

  function getInterpolatedPosition(progress) {
    const max = pathPoints.length - 1;
    const p = Math.max(0, Math.min(progress, max));
    const idx = Math.floor(p);
    const frac = p - idx;
    const a = pathPoints[idx];
    const b = pathPoints[Math.min(idx + 1, max)];
    return {
      lat: a[0] + (b[0] - a[0]) * frac,
      lng: a[1] + (b[1] - a[1]) * frac,
      rotation: getMotoRotationDeg(a[0], a[1], b[0], b[1]),
      idx
    };
  }

  function updateTraveledLine(progress) {
    if (!traveledLine || !pathPoints.length) return;
    const pos = getInterpolatedPosition(progress);
    const idx = Math.floor(progress);
    const pts = pathPoints.slice(0, idx + 1);
    if (progress > 0) pts.push([pos.lat, pos.lng]);
    traveledLine.setLatLngs(pts);
  }

  function createCityLabel(name) {
    return L.divIcon({
      className: 'city-label-wrap',
      html: `<span class="city-label">${name}</span>`,
      iconSize: [120, 28],
      iconAnchor: [60, 42]
    });
  }

  function createStageIcon(num, active) {
    return L.divIcon({
      className: 'stage-marker-wrap',
      html: `<div class="stage-marker${active ? ' active' : ''}">${num}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  }

  function stageForPathIndex(idx) {
    for (let i = stagePathIndex.length - 1; i >= 0; i--) {
      if (idx >= stagePathIndex[i]) return i;
    }
    return 0;
  }

  function pathIndexForStage(stage) {
    return stagePathIndex[stage] ?? 0;
  }

  function updatePreview(stage, animate) {
    const s = routeStages[stage];
    const img = document.getElementById('previewImg');
    const title = document.getElementById('previewTitle');
    const desc = document.getElementById('previewDesc');
    const tag = document.getElementById('previewTag');
    const step = document.getElementById('previewStep');

    if (!s || !img) return;

    step.textContent = `Étape ${stage + 1} / ${routeStages.length}`;
    tag.textContent = s.tag;
    title.textContent = s.name;
    desc.textContent = s.desc;

    if (animate && !img.src.includes(s.image.split('/').pop())) {
      img.classList.add('is-changing');
      setTimeout(() => {
        img.src = s.image;
        img.alt = s.imageAlt;
        img.classList.remove('is-changing');
      }, 200);
    } else {
      img.src = s.image;
      img.alt = s.imageAlt;
    }

    document.querySelectorAll('.journey-timeline-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === stage);
      btn.setAttribute('aria-selected', i === stage ? 'true' : 'false');
    });

    stageMarkers.forEach((m, i) => {
      m.setIcon(createStageIcon(i + 1, i === stage));
    });
  }

  function focusStage(stage, lat, lng) {
    if (!map || !routeStages[stage]) return;
    map.stop();
    stageFlying = true;
    lastFollowTime = performance.now();
    const s = routeStages[stage];
    map.flyTo([lat ?? s.lat, lng ?? s.lng], STAGE_ZOOM, { duration: 1, easeLinearity: 0.25 });
    map.once('moveend', () => { stageFlying = false; });
  }

  function followMoto(lat, lng) {
    if (!map || !animating || isResetting || stageFlying) return;

    const now = performance.now();
    if (now - lastFollowTime < 160) return;

    const pt = map.latLngToContainerPoint([lat, lng]);
    const size = map.getSize();
    const padX = size.x * FOLLOW_MARGIN;
    const padY = size.y * FOLLOW_MARGIN;

    if (pt.x < padX || pt.x > size.x - padX || pt.y < padY || pt.y > size.y - padY) {
      lastFollowTime = now;
      map.panTo([lat, lng], { animate: true, duration: 0.5, noMoveStart: true });
    }
  }

  function resetJourneyLoop() {
    isResetting = true;
    pathProgress = 0;
    currentStage = -1;
    motoRotationDeg = null;
    if (traveledLine) traveledLine.setLatLngs([]);
    moveMotoAlongPath(0, true);
    setTimeout(() => { isResetting = false; }, 400);
  }

  function animationFrame(timestamp) {
    if (!animating) return;

    if (!lastFrameTime) lastFrameTime = timestamp;
    const dt = Math.min((timestamp - lastFrameTime) / 1000, 0.05);
    lastFrameTime = timestamp;

    if (isResetting) {
      rafId = requestAnimationFrame(animationFrame);
      return;
    }

    pathProgress += MOTO_SPEED * dt;

    if (pathProgress >= pathPoints.length - 1) {
      pathProgress = pathPoints.length - 1;
      moveMotoAlongPath(pathProgress, true);
      animating = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      lastFrameTime = 0;
      const playBtn = document.getElementById('journeyPlay');
      const pauseBtn = document.getElementById('journeyPause');
      if (playBtn) playBtn.hidden = false;
      if (pauseBtn) pauseBtn.hidden = true;
      setTimeout(() => {
        if (!userPaused && !prefersReducedMotion) {
          resetJourneyLoop();
          focusStage(0, pathPoints[0][0], pathPoints[0][1]);
          setTimeout(() => { if (!userPaused && !prefersReducedMotion) startAnimation(); }, 500);
        }
      }, 1500);
      return;
    }

    moveMotoAlongPath(pathProgress, true);
    rafId = requestAnimationFrame(animationFrame);
  }

  function moveMotoAlongPath(progress, updateStage) {
    if (!motoMarker || !pathPoints.length) return;
    pathProgress = Math.max(0, Math.min(progress, pathPoints.length - 1));
    const pos = getInterpolatedPosition(pathProgress);

    motoMarker.setLatLng([pos.lat, pos.lng]);
    setMotoRotation(pos.rotation);
    updateTraveledLine(pathProgress);

    const progressBar = document.getElementById('journeyProgressBar');
    if (progressBar) {
      progressBar.style.width = `${(pathProgress / (pathPoints.length - 1)) * 100}%`;
    }

    if (updateStage) {
      const stage = stageForPathIndex(pos.idx);
      if (stage !== currentStage) {
        currentStage = stage;
        updatePreview(stage, true);
        if (map && animating) focusStage(stage, pos.lat, pos.lng);
      }
    }

    if (map && animating) followMoto(pos.lat, pos.lng);
  }

  function moveMotoToStage(stage) {
    pathProgress = pathIndexForStage(stage);
    motoRotationDeg = null;
    moveMotoAlongPath(pathProgress, false);
  }

  function selectStage(stage, fly) {
    stopAnimation(false);
    currentStage = stage;
    moveMotoToStage(stage);
    updatePreview(stage, true);
    updateTraveledLine(pathProgress);

    if (map && fly) {
      const pos = getInterpolatedPosition(pathProgress);
      focusStage(stage, pos.lat, pos.lng);
    }

    setTimeout(() => { if (!userPaused) startAnimation(true); }, fly ? 1500 : 500);
  }

  function stopAnimation(fromUser) {
    animating = false;
    if (fromUser === true) userPaused = true;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    lastFrameTime = 0;
    const playBtn = document.getElementById('journeyPlay');
    const pauseBtn = document.getElementById('journeyPause');
    if (playBtn) playBtn.hidden = false;
    if (pauseBtn) pauseBtn.hidden = true;
  }

  function startAnimation(fromUser) {
    if (animating || !mapReady) return;
    if (prefersReducedMotion && fromUser !== true) return;
    userPaused = false;
    animating = true;
    lastFrameTime = 0;
    const playBtn = document.getElementById('journeyPlay');
    const pauseBtn = document.getElementById('journeyPause');
    if (playBtn) playBtn.hidden = true;
    if (pauseBtn) pauseBtn.hidden = false;

    focusStage(currentStage, ...pathPoints[pathIndexForStage(currentStage)]);
    rafId = requestAnimationFrame(animationFrame);
  }

  function buildTimeline() {
    const timeline = document.getElementById('journeyTimeline');
    if (!timeline) return;
    timeline.innerHTML = '';
    routeStages.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `journey-timeline-btn${i === 0 ? ' active' : ''}`;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      btn.textContent = s.name;
      btn.addEventListener('click', () => selectStage(i, true));
      timeline.appendChild(btn);
    });
  }

  function initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || typeof L === 'undefined' || !trips.length) return;

    const initialTrip = getTrip(new URLSearchParams(window.location.search).get('trip') || trips[0].id);
    activeTripId = initialTrip.id;
    routeStages = initialTrip.routeStages || [];

    updateMapHeader(initialTrip);
    buildTripTabs();

    const view = initialTrip.mapDefaultView || { lat: 36.3, lng: 4.5, zoom: 7 };
    map = L.map('map', { scrollWheelZoom: false }).setView([view.lat, view.lng], view.zoom);

    map.createPane('routePane');
    map.createPane('motoPane');
    map.createPane('labelPane');
    map.getPane('routePane').style.zIndex = 450;
    map.getPane('motoPane').style.zIndex = 650;
    map.getPane('labelPane').style.zIndex = 700;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    buildRouteLayers();

    const parcoursSection = document.getElementById('parcours');

    map.whenReady(() => {
      map.invalidateSize();
      const pos = getInterpolatedPosition(pathProgress);
      setMotoRotation(pos.rotation);
      mapReady = true;
      if (!prefersReducedMotion && !userPaused && parcoursSection?.getBoundingClientRect().top < window.innerHeight) {
        startAnimation();
      }
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (prefersReducedMotion) return;
        if (entry.isIntersecting && !userPaused && mapReady) startAnimation();
        else if (!entry.isIntersecting) stopAnimation(false);
      });
    }, { threshold: 0.25 });
    if (parcoursSection) observer.observe(parcoursSection);

    document.getElementById('journeyPlay')?.addEventListener('click', () => {
      userPaused = false;
      startAnimation(true);
    });
    document.getElementById('journeyPause')?.addEventListener('click', () => stopAnimation(true));
    document.getElementById('prevStage')?.addEventListener('click', () => {
      selectStage((currentStage - 1 + routeStages.length) % routeStages.length, true);
    });
    document.getElementById('nextStage')?.addEventListener('click', () => {
      selectStage((currentStage + 1) % routeStages.length, true);
    });

    mapEl.addEventListener('mouseenter', () => map.scrollWheelZoom.enable());
    mapEl.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());

    map.on('zoomend moveend', refreshMotoRotationFromPath);

    window.RaidMap = {
      loadTrip: loadTripRoute,
      getActiveTripId: () => activeTripId
    };

    if (window.__pendingMapTrip) {
      loadTripRoute(window.__pendingMapTrip, { restart: false });
      delete window.__pendingMapTrip;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── Gallery lightbox ── */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const galleryItems = document.querySelectorAll('.gallery-item img');
  let currentIndex = 0;
  let lastFocusedBeforeLightbox = null;

  function getLightboxFocusables() {
    return [lightboxClose, document.getElementById('lightboxPrev'), document.getElementById('lightboxNext')].filter(Boolean);
  }

  galleryItems.forEach((img, i) => {
    img.addEventListener('click', () => openLightbox(i));
  });

  function openLightbox(index) {
    currentIndex = index;
    lastFocusedBeforeLightbox = document.activeElement;
    lightboxImg.src = galleryItems[index].src;
    lightboxImg.alt = galleryItems[index].alt;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose?.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedBeforeLightbox && typeof lastFocusedBeforeLightbox.focus === 'function') {
      lastFocusedBeforeLightbox.focus();
    }
  }

  function navigateLightbox(dir) {
    currentIndex = (currentIndex + dir + galleryItems.length) % galleryItems.length;
    lightboxImg.src = galleryItems[currentIndex].src;
    lightboxImg.alt = galleryItems[currentIndex].alt;
  }

  lightboxClose?.addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev')?.addEventListener('click', () => navigateLightbox(-1));
  document.getElementById('lightboxNext')?.addEventListener('click', () => navigateLightbox(1));

  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
    if (e.key === 'Tab') {
      const focusables = getLightboxFocusables();
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ── Contact form ── */
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName')?.value.trim();
    const email = document.getElementById('contactEmail')?.value.trim();
    const tripId = document.getElementById('contactTrip')?.value;
    const formula = document.getElementById('contactFormula')?.value;
    const date = document.getElementById('contactDate')?.value;
    const message = document.getElementById('contactMessage')?.value.trim();
    const trip = window.RAID_TRIPS?.find(t => t.id === tripId);

    if (!name || !email || !formula || !tripId) {
      contactForm.reportValidity();
      return;
    }

    const body = [
      `Raid : ${trip?.title || tripId}`,
      `Nom : ${name}`,
      `E-mail : ${email}`,
      `Formule : ${formula}`,
      date ? `Date souhaitée : ${date}` : '',
      message ? `\nMessage :\n${message}` : ''
    ].filter(Boolean).join('\n');

    const subjectLabel = trip?.bookingSubject || trip?.title || 'Raid Trail Algérie';
    const subject = encodeURIComponent(`Réservation ${subjectLabel} — ${formula}`);
    window.location.href = `mailto:contact@raidtrail-algerie.com?subject=${subject}&body=${encodeURIComponent(body)}`;
  });
})();
