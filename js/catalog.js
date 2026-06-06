(function () {
  'use strict';

  const trips = window.RAID_TRIPS || [];
  const filters = window.RAID_REGION_FILTERS || [];
  let activeFilter = 'all';
  let activePricingTripId = trips[0]?.id || null;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getTrip(id) {
    return trips.find(t => t.id === id) || trips[0];
  }

  function statusClass(status) {
    if (status === 'limited') return 'status-limited';
    if (status === 'full') return 'status-full';
    return 'status-open';
  }

  function cardStatusClass(statusType) {
    if (statusType === 'limited') return 'roadtrip-card-status--limited';
    if (statusType === 'full') return 'roadtrip-card-status--full';
    return 'roadtrip-card-status--open';
  }

  function renderFilters() {
    const el = document.getElementById('roadtripFilters');
    if (!el) return;

    el.innerHTML = filters.map(f => `
      <button
        type="button"
        class="roadtrip-filter${activeFilter === f.id ? ' is-active' : ''}"
        data-filter="${f.id}"
        role="tab"
        aria-selected="${activeFilter === f.id ? 'true' : 'false'}"
      >${escapeHtml(f.label)}</button>
    `).join('');

    el.querySelectorAll('.roadtrip-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.filter;
        renderFilters();
        renderCatalog();
      });
    });
  }

  function renderCatalog() {
    const grid = document.getElementById('roadtripGrid');
    if (!grid) return;

    const visible = activeFilter === 'all'
      ? trips
      : trips.filter(t => t.region === activeFilter);

    grid.innerHTML = visible.map(trip => `
      <article class="roadtrip-card${trip.featured ? ' roadtrip-card--featured' : ''}" data-region="${trip.region}" data-trip-id="${trip.id}">
        <div class="roadtrip-card-media">
          <img src="${escapeHtml(trip.image)}" alt="${escapeHtml(trip.imageAlt)}" loading="lazy" width="600" height="380">
          <span class="roadtrip-card-tag">${escapeHtml(trip.regionLabel)}</span>
        </div>
        <div class="roadtrip-card-body">
          <div class="roadtrip-card-head">
            <h3 class="roadtrip-card-title">${escapeHtml(trip.title)}</h3>
            <p class="roadtrip-card-subtitle">${escapeHtml(trip.subtitle)}</p>
          </div>
          <ul class="roadtrip-card-meta">
            <li><strong>Durée</strong> ${escapeHtml(trip.duration)}</li>
            <li><strong>Route</strong> ${escapeHtml(trip.route)}</li>
            <li><strong>Niveau</strong> ${escapeHtml(trip.difficulty)}</li>
          </ul>
          <p class="roadtrip-card-desc">${escapeHtml(trip.description)}</p>
          <ul class="roadtrip-card-highlights">
            ${trip.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
          </ul>
          <div class="roadtrip-card-pricing">
            <div>
              <span class="roadtrip-card-price">${escapeHtml(trip.basePrice)}</span>
              <span class="roadtrip-card-price-label">pilote · passager ${escapeHtml(trip.passengerSupplement)}</span>
            </div>
            <span class="roadtrip-card-status ${cardStatusClass(trip.statusType)}">${escapeHtml(trip.status)}</span>
          </div>
          <div class="roadtrip-card-actions">
            <a href="#parcours" class="btn btn-outline roadtrip-card-btn-secondary roadtrip-discover-btn" data-trip-id="${trip.id}">Découvrir</a>
            <button type="button" class="btn btn-primary roadtrip-book-btn" data-trip-id="${trip.id}">Réserver</button>
          </div>
        </div>
      </article>
    `).join('');

    grid.querySelectorAll('.roadtrip-book-btn').forEach(btn => {
      btn.addEventListener('click', () => bookTrip(btn.dataset.tripId));
    });

    grid.querySelectorAll('.roadtrip-discover-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        discoverTrip(btn.dataset.tripId);
      });
    });
  }

  function discoverTrip(tripId) {
    syncContactTrip(tripId, false);
    window.RaidMap?.loadTrip(tripId, { restart: true });
    document.getElementById('parcours')?.scrollIntoView({ behavior: 'smooth' });
  }

  function renderPricingTabs() {
    const el = document.getElementById('tripPricingTabs');
    if (!el) return;

    el.innerHTML = trips.map(trip => `
      <button
        type="button"
        class="trip-pricing-tab${activePricingTripId === trip.id ? ' is-active' : ''}"
        data-trip-id="${trip.id}"
        role="tab"
        aria-selected="${activePricingTripId === trip.id ? 'true' : 'false'}"
      >${escapeHtml(trip.title)}</button>
    `).join('');

    el.querySelectorAll('.trip-pricing-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activePricingTripId = btn.dataset.tripId;
        renderPricingTabs();
        renderPricingPanel();
        syncContactTrip(activePricingTripId, false);
        window.RaidMap?.loadTrip(activePricingTripId, { restart: false });
      });
    });
  }

  function renderPricingPanel() {
    const panel = document.getElementById('tripPricingPanel');
    const trip = getTrip(activePricingTripId);
    if (!panel || !trip) return;

    const [solo, duo] = trip.formulas;

    panel.innerHTML = `
      <p class="trip-pricing-route">${escapeHtml(trip.route)} · ${escapeHtml(trip.motoType)} · min. ${trip.minCc} cc · dès ${trip.minMotos} motos</p>
      <div class="pricing-cards pricing-cards--catalog">
        <div class="pricing-card featured">
          <h3>Solo</h3>
          <p class="pricing-meta">${escapeHtml(trip.duration)} · 1 pilote · votre moto</p>
          <div class="pricing-price">${escapeHtml(solo.priceLabel)} <small>${escapeHtml(solo.role)}</small></div>
          <ul class="pricing-includes">
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>${escapeHtml(trip.motoType)} (min. ${trip.minCc} cc)</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>6 nuits · hébergement confort</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>Pension complète</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>Guides locaux + véhicule 4×4</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>Assurance voyage incluse</li>
          </ul>
          <button type="button" class="btn btn-primary btn-full roadtrip-book-btn" data-trip-id="${trip.id}">Je réserve</button>
        </div>
        <div class="pricing-card">
          <h3>Duo</h3>
          <p class="pricing-meta">${escapeHtml(trip.duration)} · 1 pilote + 1 passager · 1 moto</p>
          <div class="pricing-price">${escapeHtml(duo.priceLabel)} <small>${escapeHtml(duo.role)}</small></div>
          ${duo.detail ? `<p class="pricing-detail">${escapeHtml(duo.detail)}</p>` : ''}
          <ul class="pricing-includes">
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>Prestations identiques au solo</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>Passager à bord (${escapeHtml(trip.passengerSupplement)})</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>Chambre double</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>Aide aux formalités d'import</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>Transport maritime sur demande</li>
          </ul>
          <button type="button" class="btn btn-primary btn-full roadtrip-book-btn" data-trip-id="${trip.id}">Je réserve</button>
        </div>
      </div>
      <p class="text-muted-center">Groupes de 2, 4 motos ou plus bienvenus · Acompte 30 % à l'inscription</p>
      <table class="dates-table">
        <thead>
          <tr><th>Départ</th><th>Places</th><th>Statut</th></tr>
        </thead>
        <tbody>
          ${trip.dates.map(d => `
            <tr>
              <td>${escapeHtml(d.date)}</td>
              <td>${escapeHtml(d.places)}</td>
              <td><span class="status ${statusClass(d.status)}">${escapeHtml(d.statusLabel)}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="pricing-cta">
        <p class="pricing-cta-note">Acompte de 30 % à la réservation · Solde 30 jours avant le départ · Raid confirmé dès ${trip.minMotos} motos</p>
        <button type="button" class="btn btn-primary roadtrip-book-btn" data-trip-id="${trip.id}">Je réserve ma place</button>
      </div>
    `;

    panel.querySelectorAll('.roadtrip-book-btn').forEach(btn => {
      btn.addEventListener('click', () => bookTrip(btn.dataset.tripId));
    });
  }

  function populateContactTripSelect() {
    const select = document.getElementById('contactTrip');
    if (!select) return;

    select.innerHTML = trips.map(t => `
      <option value="${t.id}">${escapeHtml(t.title)}</option>
    `).join('');
  }

  function syncContactTrip(tripId, scroll) {
    const trip = getTrip(tripId);
    if (!trip) return;

    activePricingTripId = trip.id;

    const tripSelect = document.getElementById('contactTrip');
    const formulaSelect = document.getElementById('contactFormula');
    const dateSelect = document.getElementById('contactDate');

    if (tripSelect) tripSelect.value = trip.id;

    if (formulaSelect) {
      formulaSelect.innerHTML = [
        '<option value="">Choisir…</option>',
        ...trip.formulas.map(f => `<option value="${escapeHtml(f.label)}">${escapeHtml(f.label)}</option>`),
        '<option value="Je ne sais pas encore">Je ne sais pas encore</option>'
      ].join('');
    }

    if (dateSelect) {
      dateSelect.innerHTML = [
        '<option value="">Choisir…</option>',
        ...trip.dates.map(d => {
          const suffix = d.status === 'full' ? ' (complet)' : '';
          return `<option value="${escapeHtml(d.date + suffix)}">${escapeHtml(d.date + suffix)}</option>`;
        }),
        '<option value="Autre date / groupe privé">Autre date / groupe privé</option>'
      ].join('');
    }

    renderPricingTabs();
    renderPricingPanel();

    if (scroll) {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function bookTrip(tripId) {
    syncContactTrip(tripId, true);
  }

  function readTripFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('trip');
    if (tripId && getTrip(tripId)) {
      activePricingTripId = tripId;
      syncContactTrip(tripId, false);
      if (!window.RaidMap) window.__pendingMapTrip = tripId;
    }
  }

  function initCatalog() {
    if (!trips.length) return;

    renderFilters();
    renderCatalog();
    populateContactTripSelect();
    renderPricingTabs();
    renderPricingPanel();
    readTripFromUrl();

    document.getElementById('contactTrip')?.addEventListener('change', (e) => {
      syncContactTrip(e.target.value, false);
      window.RaidMap?.loadTrip(e.target.value, { restart: false });
    });

    if (window.__pendingMapTrip && window.RaidMap) {
      window.RaidMap.loadTrip(window.__pendingMapTrip, { restart: false });
      delete window.__pendingMapTrip;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCatalog);
  } else {
    initCatalog();
  }

  window.RaidCatalog = { bookTrip, syncContactTrip, getTrip };
})();
