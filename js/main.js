(function () {
  'use strict';

  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  const routePoints = [
    { lat: 35.697, lng: -0.633, name: 'Oran', desc: 'Étape 1 — Oran, la Radieuse' },
    { lat: 36.165, lng: 1.334, name: 'Chlef', desc: 'Étape 2 — Échappée littorale' },
    { lat: 36.417, lng: 4.167, name: 'Tikjda', desc: 'Étape 3 — Parc du Djurdjura' },
    { lat: 36.755, lng: 5.084, name: 'Béjaïa', desc: 'Étape 4 — Descente vers la mer' },
    { lat: 36.876, lng: 6.909, name: 'Skikda', desc: 'Étape 5 — Constantine & embarquement' }
  ];

  function initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || typeof L === 'undefined') return;

    const map = L.map('map', { scrollWheelZoom: false }).setView([36.2, 3.5], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 14
    }).addTo(map);

    const goldIcon = L.divIcon({
      className: 'map-marker',
      html: '<div style="width:14px;height:14px;background:#C9A962;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const latlngs = routePoints.map(p => [p.lat, p.lng]);

    L.polyline(latlngs, {
      color: '#C9A962',
      weight: 3,
      opacity: 0.85,
      dashArray: '10 14'
    }).addTo(map);

    const markers = routePoints.map((p, i) => {
      const marker = L.marker([p.lat, p.lng], { icon: goldIcon }).addTo(map);
      marker.bindPopup(`<b>${p.name}</b><br>${p.desc}`);
      marker.on('click', () => highlightStep(i));
      return marker;
    });

    map.fitBounds(L.latLngBounds(latlngs), { padding: [48, 48] });

    document.querySelectorAll('.step-card[data-step]').forEach(card => {
      card.addEventListener('click', () => {
        const i = parseInt(card.dataset.step, 10);
        highlightStep(i);
        map.setView([routePoints[i].lat, routePoints[i].lng], 9, { animate: true });
        markers[i].openPopup();
      });
      card.style.cursor = 'pointer';
    });

    mapEl.addEventListener('mouseenter', () => map.scrollWheelZoom.enable());
    mapEl.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());
  }

  function highlightStep(index) {
    document.querySelectorAll('.step-card').forEach((card, i) => {
      card.style.background = i === index ? 'rgba(201, 169, 98, 0.06)' : '';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }
})();
