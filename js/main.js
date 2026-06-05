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

  /* ── Interactive map ── */
  const routePoints = [
    { lat: 36.876, lng: 6.909, name: 'Skikda', desc: 'Jour 1 — Départ côte est' },
    { lat: 36.365, lng: 6.615, name: 'Constantine', desc: 'Jour 2 — Gorges du Rhumel' },
    { lat: 36.497, lng: 5.283, name: 'Kherrata', desc: 'Jour 3 — Canyon rouge' },
    { lat: 36.417, lng: 4.167, name: 'Djurdjura', desc: 'Jours 4–5 — Hauts sommets' },
    { lat: 35.697, lng: -0.633, name: 'Oran', desc: 'Jour 7 — Arrivée côte ouest' }
  ];

  function initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || typeof L === 'undefined') return;

    const map = L.map('map', {
      scrollWheelZoom: false,
      zoomControl: true
    }).setView([36.3, 4.5], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 14
    }).addTo(map);

    const terraIcon = L.divIcon({
      className: 'map-marker',
      html: '<div style="width:14px;height:14px;background:#B85C38;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const latlngs = routePoints.map(p => [p.lat, p.lng]);

    L.polyline(latlngs, {
      color: '#B85C38',
      weight: 3,
      opacity: 0.8,
      dashArray: '8 12'
    }).addTo(map);

    const markers = routePoints.map((p, i) => {
      const marker = L.marker([p.lat, p.lng], { icon: terraIcon }).addTo(map);
      marker.bindPopup(`<b>${p.name}</b><br>${p.desc}`);
      marker.on('click', () => highlightStop(i));
      return marker;
    });

    map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] });

    document.querySelectorAll('.route-stop').forEach((stop, i) => {
      stop.addEventListener('click', () => {
        highlightStop(i);
        map.setView([routePoints[i].lat, routePoints[i].lng], 10, { animate: true });
        markers[i].openPopup();
      });
    });

    mapEl.addEventListener('mouseenter', () => map.scrollWheelZoom.enable());
    mapEl.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());
  }

  function highlightStop(index) {
    document.querySelectorAll('.route-stop').forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });
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
