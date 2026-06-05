(function () {
  'use strict';

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
  const routeStages = [
    {
      lat: 36.876, lng: 6.909,
      name: 'Skikda',
      tag: 'Jour 1 · Départ',
      desc: 'Départ sur la côte est — falaises, pins maritimes et premières pistes en bord de mer.',
      image: 'images/route-skikda.jpg',
      imageAlt: 'Côte de Skikda, pins et falaises sur la Méditerranée'
    },
    {
      lat: 36.365, lng: 6.615,
      name: 'Constantine',
      tag: 'Jour 2 · Gorges',
      desc: 'La cité des ponts suspendus — gorges du Rhumel et routes à flanc de falaise.',
      image: 'images/route-constantine.jpg',
      imageAlt: 'Ponts suspendus et gorges de Constantine'
    },
    {
      lat: 36.497, lng: 5.283,
      name: 'Kherrata',
      tag: 'Jour 3 · Canyon',
      desc: 'Canyon aux parois rouges — passage étroit et paysages grandioses.',
      image: 'images/route-kherrata.jpg',
      imageAlt: 'Gorges de Kherrata, canyon de roche rouge'
    },
    {
      lat: 36.417, lng: 4.167,
      name: 'Djurdjura',
      tag: 'Jours 4–5 · Montagne',
      desc: 'Massif à 2 000 m — cols, forêts de cèdres et vues à perte de vue.',
      image: 'images/route-djurdjura.jpg',
      imageAlt: 'Sommets enneigés du Djurdjura'
    },
    {
      lat: 35.697, lng: -0.633,
      name: 'Oran',
      tag: 'Jour 7 · Arrivée',
      desc: 'Arrivée sur la côte ouest — baie méditerranéenne et dernière étape conviviale.',
      image: 'images/route-oran.jpg',
      imageAlt: 'Front de mer et baie d\'Oran au coucher du soleil'
    }
  ];

  const MOTO_SVG = `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5.5" cy="17.5" r="2.5" fill="#1A3A5C" stroke="#fff" stroke-width="1"/>
    <circle cx="18.5" cy="17.5" r="2.5" fill="#1A3A5C" stroke="#fff" stroke-width="1"/>
    <path d="M8 17h8M5.5 15l2.5-6h4l1.5 3h3l1 3" stroke="#B85C38" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M11 9l1-3h2l1 3" stroke="#B85C38" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;

  let map, motoMarker, pathPoints = [], stagePathIndex = [];
  let pathIndex = 0;
  let animating = false;
  let animTimer = null;
  let currentStage = 0;
  let stageMarkers = [];

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

  function createMotoIcon(bearing) {
    return L.divIcon({
      className: 'moto-marker-wrap',
      html: `<div style="transform:rotate(${bearing - 90}deg);width:36px;height:36px;margin:-18px 0 0 -18px">${MOTO_SVG}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
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

  function moveMotoToPathIndex(idx, updateStage) {
    if (!motoMarker || !pathPoints.length) return;
    pathIndex = Math.max(0, Math.min(idx, pathPoints.length - 1));
    const curr = pathPoints[pathIndex];
    const next = pathPoints[Math.min(pathIndex + 1, pathPoints.length - 1)];
    const bearing = getBearing(curr[0], curr[1], next[0], next[1]);
    motoMarker.setLatLng(curr);
    motoMarker.setIcon(createMotoIcon(bearing));

    const progress = document.getElementById('journeyProgressBar');
    if (progress) progress.style.width = `${(pathIndex / (pathPoints.length - 1)) * 100}%`;

    if (updateStage) {
      const stage = stageForPathIndex(pathIndex);
      if (stage !== currentStage) {
        currentStage = stage;
        updatePreview(stage, true);
      }
    }
  }

  function selectStage(stage, fly) {
    stopAnimation();
    currentStage = stage;
    pathIndex = pathIndexForStage(stage);
    moveMotoToPathIndex(pathIndex, false);
    updatePreview(stage, true);

    if (map && fly) {
      map.flyTo([routeStages[stage].lat, routeStages[stage].lng], 9, { duration: 1.2 });
    }
  }

  function stopAnimation() {
    animating = false;
    if (animTimer) { clearTimeout(animTimer); animTimer = null; }
    const playBtn = document.getElementById('journeyPlay');
    const pauseBtn = document.getElementById('journeyPause');
    if (playBtn) playBtn.hidden = false;
    if (pauseBtn) pauseBtn.hidden = true;
  }

  function startAnimation() {
    stopAnimation();
    animating = true;
    document.getElementById('journeyPlay').hidden = true;
    document.getElementById('journeyPause').hidden = false;

    function step() {
      if (!animating) return;
      if (pathIndex >= pathPoints.length - 1) {
        pathIndex = 0;
        currentStage = 0;
      } else {
        pathIndex++;
      }
      moveMotoToPathIndex(pathIndex, true);

      const stageAtPoint = stageForPathIndex(pathIndex);
      if (stageAtPoint !== currentStage) {
        currentStage = stageAtPoint;
        updatePreview(currentStage, true);
      }

      animTimer = setTimeout(step, 45);
    }
    step();
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
    if (!mapEl || typeof L === 'undefined') return;

    buildTimeline();

    const path = buildDensePath(routeStages, 50);
    pathPoints = path.points;
    stagePathIndex = path.stagePathIndex;

    map = L.map('map', { scrollWheelZoom: false }).setView([36.3, 4.5], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 14
    }).addTo(map);

    /* Tracé de fond */
    L.polyline(pathPoints, {
      color: '#E8D5B7',
      weight: 6,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    /* Segments cliquables par étape */
    for (let i = 0; i < routeStages.length - 1; i++) {
      const start = pathIndexForStage(i);
      const end = pathIndexForStage(i + 1);
      const segPoints = pathPoints.slice(start, end + 1);
      const targetStage = i + 1;
      L.polyline(segPoints, {
        color: '#B85C38',
        weight: 5,
        opacity: 0.85,
        className: 'route-segment',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map).on('click', () => selectStage(targetStage, true));
    }

    /* Marqueurs d'étapes */
    stageMarkers = routeStages.map((s, i) => {
      const marker = L.marker([s.lat, s.lng], {
        icon: createStageIcon(i + 1, i === 0),
        zIndexOffset: 1000
      }).addTo(map);
      marker.on('click', () => selectStage(i, true));
      return marker;
    });

    /* Moto animée */
    motoMarker = L.marker(pathPoints[0], {
      icon: createMotoIcon(270),
      zIndexOffset: 2000
    }).addTo(map);

    map.fitBounds(L.latLngBounds(pathPoints), { padding: [48, 48] });

    document.getElementById('journeyPlay')?.addEventListener('click', startAnimation);
    document.getElementById('journeyPause')?.addEventListener('click', stopAnimation);
    document.getElementById('prevStage')?.addEventListener('click', () => {
      selectStage((currentStage - 1 + routeStages.length) % routeStages.length, true);
    });
    document.getElementById('nextStage')?.addEventListener('click', () => {
      selectStage((currentStage + 1) % routeStages.length, true);
    });

    mapEl.addEventListener('mouseenter', () => map.scrollWheelZoom.enable());
    mapEl.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());

    updatePreview(0, false);
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
  const galleryItems = document.querySelectorAll('.gallery-item img');
  let currentIndex = 0;

  galleryItems.forEach((img, i) => {
    img.addEventListener('click', () => openLightbox(i));
  });

  function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = galleryItems[index].src;
    lightboxImg.alt = galleryItems[index].alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigateLightbox(dir) {
    currentIndex = (currentIndex + dir + galleryItems.length) % galleryItems.length;
    lightboxImg.src = galleryItems[currentIndex].src;
    lightboxImg.alt = galleryItems[currentIndex].alt;
  }

  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => navigateLightbox(-1));
  document.getElementById('lightboxNext').addEventListener('click', () => navigateLightbox(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });
})();
