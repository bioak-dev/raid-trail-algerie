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
    image: 'images/hero.jpg',
    imageAlt: 'Moto trail sur une piste en Algérie, montagnes et ciel ouvert',
    featured: true,
    minCc: 450,
    minMotos: 4,
    motoType: 'Trail ou adventure',
    bookingSubject: 'Raid Nord & Kabylie',
    mapSection: '#parcours',
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
    mapSection: '#roadtrips',
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
