/* eslint-disable no-unused-vars */
/**
 * Catalog data — single source of truth for all roadtrips.
 * Shape must stay consistent across trips for catalog, pricing & booking.
 */
const RAID_TRIPS = [
  {
    id: 'nord-kabylie',
    title: 'Raid Nord & Kabylie',
    subtitle: 'De la Méditerranée aux sommets du Djurdjura',
    duration: '7 Jours / 6 Nuits',
    route: 'Skikda ➔ Constantine ➔ Djurdjura ➔ Oran',
    difficulty: 'Tous niveaux (60 % asphalte, 40 % pistes)',
    basePrice: '1 990 €',
    basePriceNum: 1990,
    passengerSupplement: '+500 €',
    passengerSupplementNum: 500,
    duoPrice: '2 490 €',
    description: '1 200 km entre côte est et baie d\'Oran — gorges, cols du Djurdjura et littoral méditerranéen. Un raid trail ouvert à tous les niveaux, encadré par des guides locaux.',
    highlights: [
      'Gorges de Kherrata',
      'Massif du Djurdjura',
      'Constantine & ses ponts',
      'Assistance 4×4 incluse'
    ],
    status: 'Ouvert aux réservations — Printemps / Été',
    statusType: 'open',
    region: 'nord',
    regionLabel: 'Nord / Côte / Montagne',
    image: 'images/gallery-11.jpg',
    imageAlt: 'Moto trail traversant un gué de montagne en Kabylie',
    featured: true,
    minCc: 450,
    minMotos: 4,
    motoType: 'Trail ou adventure',
    bookingSubject: 'Raid Nord & Kabylie',
    mapSection: '#parcours',
    mapTitle: 'Nord & Kabylie',
    mapSubtitle: 'Skikda, gorges de Constantine, Djurdjura — 1 200 km jusqu\'à Oran.',
    mapDefaultView: { lat: 36.3, lng: 4.5, zoom: 7 },
    routeStages: [
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
    ],
    dates: [
      { date: '12 avril 2026', places: '4 / 12', status: 'limited', statusLabel: 'Presque complet' },
      { date: '3 mai 2026', places: '8 / 12', status: 'open', statusLabel: 'Ouvert' },
      { date: '14 juin 2026', places: '10 / 12', status: 'open', statusLabel: 'Ouvert' },
      { date: '5 septembre 2026', places: '12 / 12', status: 'full', statusLabel: 'Complet' }
    ],
    formulas: [
      { id: 'solo', label: 'Solo — 1 990 €', priceLabel: '1 990 €', role: 'pilote' },
      { id: 'duo', label: 'Duo — 2 490 €', priceLabel: '2 490 €', role: 'couple', detail: '1 990 € pilote + 500 € passager · 1 245 € / pers.' }
    ]
  },
  {
    id: 'sahara-adventure',
    title: 'Raid Portes du Sahara',
    subtitle: "L'immensité des Oasis et Canyons en Maxi-Trail",
    duration: '7 Jours / 6 Nuits',
    route: 'Oran/Alger ➔ Biskra ➔ Ghardaïa ➔ El Oued',
    difficulty: 'Intermédiaire (70 % asphalte, 30 % pistes roulantes)',
    basePrice: '2 490 €',
    basePriceNum: 2490,
    passengerSupplement: '+790 €',
    passengerSupplementNum: 790,
    duoPrice: '3 280 €',
    description: "Vivez le mythe du désert algérien au guidon de votre propre machine. Un tracé spectaculaire conçu pour les Maxi-Trails, alternant grandes lignes droites désertiques, canyons du Ghoufi et l'architecture millénaire des oasis.",
    highlights: [
      'Canyons de Ghoufi',
      'Ghardaïa & la vallée du Mzab',
      "Coucher de soleil sur les dunes d'El Oued",
      'Assistance 4×4 totale'
    ],
    status: 'Ouvert aux réservations — Automne / Hiver',
    statusType: 'open',
    region: 'sud',
    regionLabel: 'Sud / Désert',
    image: 'images/gallery-03.jpg',
    imageAlt: 'Dunes dorées au lever du soleil en Algérie',
    featured: false,
    minCc: 450,
    minMotos: 4,
    motoType: 'Maxi-trail ou adventure',
    bookingSubject: 'Raid Portes du Sahara',
    mapSection: '#parcours',
    mapTitle: 'Portes du Sahara',
    mapSubtitle: 'Alger, canyons du Ghoufi, Ghardaïa et les dunes d\'El Oued — l\'Algérie profonde en maxi-trail.',
    mapDefaultView: { lat: 33.8, lng: 4.8, zoom: 6 },
    routeStages: [
      {
        lat: 36.753, lng: 3.058,
        name: 'Alger',
        tag: 'Jour 1 · Départ',
        desc: 'Départ depuis la capitale — dernières traces urbaines avant l\'immensité du Sud algérien.',
        image: 'images/gallery-12.jpg',
        imageAlt: 'Port et horizon méditerranéen'
      },
      {
        lat: 34.851, lng: 5.724,
        name: 'Biskra',
        tag: 'Jour 2 · Porte du désert',
        desc: 'Première oasis — palmiers, chaleur sèche et pistes qui s\'ouvrent vers le Sahara.',
        image: 'images/gallery-03.jpg',
        imageAlt: 'Dunes dorées au lever du soleil'
      },
      {
        lat: 35.427, lng: 5.967,
        name: 'Ghoufi',
        tag: 'Jour 3 · Canyons',
        desc: 'Les canyons de Ghoufi — falaises vertigineuses creusées par le temps, un décor de cinéma.',
        image: 'images/gallery-10.jpg',
        imageAlt: 'Ruines antiques en lumière dorée'
      },
      {
        lat: 32.483, lng: 3.673,
        name: 'Ghardaïa',
        tag: 'Jours 4–5 · Mzab',
        desc: 'Architecture millénaire de la vallée du Mzab — kasbahs ocre et ruelles vivantes.',
        image: 'images/gallery-06.jpg',
        imageAlt: 'Kasbah ancienne sur les hauteurs'
      },
      {
        lat: 33.368, lng: 6.867,
        name: 'El Oued',
        tag: 'Jour 7 · Arrivée',
        desc: 'La ville aux mille coupoles — coucher de soleil sur les dunes, fin de l\'aventure.',
        image: 'images/gallery-08.jpg',
        imageAlt: 'Bivouac sous un ciel étoilé'
      }
    ],
    dates: [
      { date: '18 octobre 2026', places: '6 / 10', status: 'open', statusLabel: 'Ouvert' },
      { date: '8 novembre 2026', places: '4 / 10', status: 'limited', statusLabel: 'Presque complet' },
      { date: '6 décembre 2026', places: '9 / 10', status: 'open', statusLabel: 'Ouvert' },
      { date: '17 janvier 2027', places: '10 / 10', status: 'full', statusLabel: 'Complet' }
    ],
    formulas: [
      { id: 'solo', label: 'Solo — 2 490 €', priceLabel: '2 490 €', role: 'pilote' },
      { id: 'duo', label: 'Duo — 3 280 €', priceLabel: '3 280 €', role: 'couple', detail: '2 490 € pilote + 790 € passager · 1 640 € / pers.' }
    ]
  }
];

const RAID_REGION_FILTERS = [
  { id: 'all', label: 'Tous les raids' },
  { id: 'nord', label: 'Nord / Côte / Montagne' },
  { id: 'sud', label: 'Sud / Désert' }
];

if (typeof window !== 'undefined') {
  window.RAID_TRIPS = RAID_TRIPS;
  window.RAID_REGION_FILTERS = RAID_REGION_FILTERS;
}
