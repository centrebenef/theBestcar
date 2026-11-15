export const AGENCY_INFO = {
  name: 'BEST CAR',
  slogan: 'Votre route, votre liberté !',
  address: '45 Avenue 2 Mars, Casablanca, Maroc',
  addressShort: '45 Avenue 2 Mars, Casablanca',
  city: 'Casablanca, Maroc',
  email: 'contact@bestcar.ma',
  phoneDisplay: '+212 6 00 00 00 00',
  phoneNote: 'Numéro de démonstration à remplacer',
  whatsappNumber: '212600000000',
  hours: 'Lundi – Dimanche · 08h00 à 22h00 (Livraison 24/7 sur réservation)',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=45+Avenue+2+Mars+Casablanca+Maroc',
} as const;

export const CASABLANCA_LOCATIONS = [
  '45 Avenue 2 Mars, Casablanca (Agence principale)',
  'Aéroport Mohammed V (CMN) — Terminal 1 & 2',
  'Gare Casa-Voyageurs',
  'Quartier Maarif & Twin Center',
  'Anfa & Corniche Ain Diab',
  'Casablanca Finance City (CFC)',
  'Livraison à domicile / Hôtel (Casablanca)',
] as const;

export const HERO_IMAGE = '/src/assets/images/hero_casablanca_luxury_1794752111217.jpg';
export const ABOUT_IMAGE = '/src/assets/images/about_fleet_showroom_1794752112431.jpg';

export const STUDIO_CAR_PRESETS = [
  { label: 'Dacia Sandero (Citadine)', url: '/src/assets/images/car_dacia_sandero_1794752112160.jpg' },
  { label: 'Renault Clio 5 (Citadine)', url: '/src/assets/images/car_renault_clio_5_1794752113243.jpg' },
  { label: 'Peugeot 208 (Citadine)', url: '/src/assets/images/car_peugeot_208_1794752112563.jpg' },
  { label: 'Volkswagen Passat (Berline)', url: '/src/assets/images/car_vw_passat_1794752114250.jpg' },
  { label: 'Mercedes Classe C (Berline)', url: '/src/assets/images/car_mercedes_classe_c_1794752113717.jpg' },
  { label: 'BMW Série 3 (Berline)', url: '/src/assets/images/car_bmw_serie_3_1794752114408.jpg' },
  { label: 'Dacia Duster (SUV)', url: '/src/assets/images/car_dacia_duster_1794752114419.jpg' },
  { label: 'Hyundai Tucson (SUV)', url: '/src/assets/images/car_hyundai_tucson_1794752115415.jpg' },
  { label: 'Range Rover Evoque (SUV)', url: '/src/assets/images/car_range_rover_evoque_1794752115065.jpg' },
  { label: 'Mercedes Classe E (Luxe)', url: '/src/assets/images/car_mercedes_classe_e_1794752116071.jpg' },
  { label: 'BMW Série 5 (Luxe)', url: '/src/assets/images/car_bmw_serie_5_1794752116114.jpg' },
  { label: 'Audi A6 (Luxe)', url: '/src/assets/images/car_audi_a6_1794752116400.jpg' },
] as const;

export const RENTAL_CONDITIONS = [
  'Âge minimum du conducteur : 21 ans (25 ans pour la catégorie Luxe).',
  'Permis de conduire valide depuis au moins 2 ans (carte nationale ou passeport requis).',
  'Kilométrage illimité inclus pour toute location de 3 jours et plus au Maroc.',
  'Assurance responsabilité civile et tous risques avec franchise incluse.',
  'Caution remboursable par empreinte bancaire ou espèces à la remise des clés.',
  'Carburant : restitution au même niveau qu’à la prise en charge.',
] as const;
