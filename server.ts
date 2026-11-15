import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type CarCategory = 'Citadines' | 'Berlines' | 'SUV' | 'Voitures de luxe';
type TransmissionType = 'Manuelle' | 'Automatique';
type FuelType = 'Essence' | 'Diesel' | 'Hybride';
type BookingStatus = 'En attente' | 'Confirmée' | 'Refusée' | 'Terminée';

interface CarRecord {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: CarCategory;
  pricePerDay: number;
  seats: number;
  doors: number;
  transmission: TransmissionType;
  fuel: FuelType;
  airConditioning: boolean;
  available: boolean;
  image: string;
  gallery: string[];
  description: string;
  features: string[];
  deposit: number;
}

interface BookingRecord {
  id: string;
  reference: string;
  carId: string;
  carName: string;
  carCategory: CarCategory;
  carImage: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupLocation: string;
  returnLocation: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  days: number;
  pricePerDay: number;
  totalPrice: number;
  message: string;
  status: BookingStatus;
  createdAt: string;
}

interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface DatabaseSchema {
  cars: CarRecord[];
  bookings: BookingRecord[];
  messages: ContactMessageRecord[];
  bookingCounter: number;
}

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const SESSION_COOKIE_NAME = 'bestcar_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 heures
const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.createHash('sha256').update(`bestcar-${__dirname}`).digest('hex');

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@bestcar.ma').toLowerCase();
const ADMIN_PASSWORD_RAW = process.env.ADMIN_PASSWORD || 'BestCar2026!';
const ADMIN_SALT = 'bestcar-casablanca-admin-salt-v1';
const ADMIN_PASSWORD_HASH = crypto.scryptSync(ADMIN_PASSWORD_RAW, ADMIN_SALT, 64);

function createInitialData(): DatabaseSchema {
  const cars: CarRecord[] = [
    {
      id: 'dacia-sandero',
      name: 'Dacia Sandero',
      brand: 'Dacia',
      model: 'Sandero Stepway',
      year: 2025,
      category: 'Citadines',
      pricePerDay: 260,
      seats: 5,
      doors: 5,
      transmission: 'Manuelle',
      fuel: 'Essence',
      airConditioning: true,
      available: true,
      image: '/src/assets/images/car_dacia_sandero_1794752112160.jpg',
      gallery: [
        '/src/assets/images/car_dacia_sandero_1794752112160.jpg',
        '/src/assets/images/about_fleet_showroom_1794752112431.jpg',
      ],
      description:
        'Pratique, économique et agile dans le trafic casablancais, la Dacia Sandero Stepway offre une garde au sol confortable et un grand coffre pour vos déplacements quotidiens ou escapades côtières.',
      features: ['Climatisation', 'Écran tactile Apple CarPlay / Android Auto', 'Régulateur de vitesse', 'Radar de recul'],
      deposit: 3000,
    },
    {
      id: 'renault-clio-5',
      name: 'Renault Clio 5',
      brand: 'Renault',
      model: 'Clio V Techno',
      year: 2025,
      category: 'Citadines',
      pricePerDay: 300,
      seats: 5,
      doors: 5,
      transmission: 'Manuelle',
      fuel: 'Diesel',
      airConditioning: true,
      available: true,
      image: '/src/assets/images/car_renault_clio_5_1794752113243.jpg',
      gallery: [
        '/src/assets/images/car_renault_clio_5_1794752113243.jpg',
        '/src/assets/images/about_fleet_showroom_1794752112431.jpg',
      ],
      description:
        'Polyvalente et sobre en carburant, la Renault Clio 5 séduit par son habitacle soigné, sa tenue de route précise et son confort sur autoroute entre Casablanca, Rabat et Marrakech.',
      features: ['Climatisation automatique', 'Aide au stationnement', 'Bluetooth & USB-C', 'Feux Full LED Pure Vision'],
      deposit: 3500,
    },
    {
      id: 'peugeot-208',
      name: 'Peugeot 208',
      brand: 'Peugeot',
      model: '208 Allure Pack',
      year: 2025,
      category: 'Citadines',
      pricePerDay: 340,
      seats: 5,
      doors: 5,
      transmission: 'Automatique',
      fuel: 'Essence',
      airConditioning: true,
      available: true,
      image: '/src/assets/images/car_peugeot_208_1794752112563.jpg',
      gallery: [
        '/src/assets/images/car_peugeot_208_1794752112563.jpg',
        '/src/assets/images/about_fleet_showroom_1794752112431.jpg',
      ],
      description:
        'Dotée de la boîte automatique EAT8 et du poste de conduite i-Cockpit, la Peugeot 208 combine style contemporain et facilité de conduite en centre-ville à Casablanca.',
      features: ['Boîte automatique EAT8', 'Caméra de recul 180°', 'Climatisation automatique', 'i-Cockpit 3D'],
      deposit: 4000,
    },
    {
      id: 'volkswagen-passat',
      name: 'Volkswagen Passat',
      brand: 'Volkswagen',
      model: 'Passat Business TDI',
      year: 2024,
      category: 'Berlines',
      pricePerDay: 580,
      seats: 5,
      doors: 4,
      transmission: 'Automatique',
      fuel: 'Diesel',
      airConditioning: true,
      available: true,
      image: '/src/assets/images/car_vw_passat_1794752114250.jpg',
      gallery: [
        '/src/assets/images/car_vw_passat_1794752114250.jpg',
        '/src/assets/images/about_fleet_showroom_1794752112431.jpg',
      ],
      description:
        'Berline statutaire pensée pour les déplacements professionnels et longs trajets. Espace arrière généreux, insonorisation exemplaire et boîte DSG fluide.',
      features: ['Boîte DSG 7 rapports', 'Climatisation tri-zone', 'GPS Europe/Maroc', 'Régulateur adaptatif'],
      deposit: 6000,
    },
    {
      id: 'mercedes-classe-c',
      name: 'Mercedes Classe C',
      brand: 'Mercedes-Benz',
      model: 'C220d AMG Line',
      year: 2025,
      category: 'Berlines',
      pricePerDay: 950,
      seats: 5,
      doors: 4,
      transmission: 'Automatique',
      fuel: 'Diesel',
      airConditioning: true,
      available: true,
      image: '/src/assets/images/car_mercedes_classe_c_1794752113717.jpg',
      gallery: [
        '/src/assets/images/car_mercedes_classe_c_1794752113717.jpg',
        '/src/assets/images/hero_casablanca_luxury_1794752111217.jpg',
      ],
      description:
        'Finition AMG Line, écran central MBUX haute définition et agrément mécanique remarquable. Le choix idéal pour vos rendez-vous d’affaires à Casablanca Finance City ou Anfa.',
      features: ['Pack AMG Line', 'Système MBUX', 'Caméra 360°', 'Sièges cuir chauffants'],
      deposit: 10000,
    },
    {
      id: 'bmw-serie-3',
      name: 'BMW Série 3',
      brand: 'BMW',
      model: '320d M Sport',
      year: 2025,
      category: 'Berlines',
      pricePerDay: 900,
      seats: 5,
      doors: 4,
      transmission: 'Automatique',
      fuel: 'Diesel',
      airConditioning: true,
      available: true,
      image: '/src/assets/images/car_bmw_serie_3_1794752114408.jpg',
      gallery: [
        '/src/assets/images/car_bmw_serie_3_1794752114408.jpg',
        '/src/assets/images/about_fleet_showroom_1794752112431.jpg',
      ],
      description:
        'Dynamique, précise et élégante, la BMW Série 3 M Sport associe comportement routier sportif et confort haut de gamme pour tous vos trajets au Maroc.',
      features: ['Pack M Sport', 'Boîte Steptronic 8', 'BMW Live Cockpit', 'Aide au stationnement'],
      deposit: 10000,
    },
    {
      id: 'dacia-duster',
      name: 'Dacia Duster',
      brand: 'Dacia',
      model: 'Duster Journey',
      year: 2025,
      category: 'SUV',
      pricePerDay: 420,
      seats: 5,
      doors: 5,
      transmission: 'Manuelle',
      fuel: 'Diesel',
      airConditioning: true,
      available: true,
      image: '/src/assets/images/car_dacia_duster_1794752114419.jpg',
      gallery: [
        '/src/assets/images/car_dacia_duster_1794752114419.jpg',
        '/src/assets/images/about_fleet_showroom_1794752112431.jpg',
      ],
      description:
        'Robuste et polyvalent, le nouveau Dacia Duster vous accompagne en toute sérénité en ville comme sur les routes de l’Atlas ou de la côte atlantique.',
      features: ['Climatisation automatique', 'Caméra multivue', 'Grand coffre 478L', 'Barres de toit modulables'],
      deposit: 5000,
    },
    {
      id: 'hyundai-tucson',
      name: 'Hyundai Tucson',
      brand: 'Hyundai',
      model: 'Tucson Executive',
      year: 2025,
      category: 'SUV',
      pricePerDay: 680,
      seats: 5,
      doors: 5,
      transmission: 'Automatique',
      fuel: 'Hybride',
      airConditioning: true,
      available: true,
      image: '/src/assets/images/car_hyundai_tucson_1794752115415.jpg',
      gallery: [
        '/src/assets/images/car_hyundai_tucson_1794752115415.jpg',
        '/src/assets/images/about_fleet_showroom_1794752112431.jpg',
      ],
      description:
        'SUV familial hybride au design affirmé, offrant silence de fonctionnement, habitabilité généreuse et équipements technologiques de pointe.',
      features: ['Motorisation Hybride', 'Toit ouvrant panoramique', 'Aide maintien de voie', 'Chargeur sans fil'],
      deposit: 7500,
    },
    {
      id: 'range-rover-evoque',
      name: 'Range Rover Evoque',
      brand: 'Land Rover',
      model: 'Evoque R-Dynamic',
      year: 2025,
      category: 'SUV',
      pricePerDay: 1150,
      seats: 5,
      doors: 5,
      transmission: 'Automatique',
      fuel: 'Diesel',
      airConditioning: true,
      available: true,
      image: '/src/assets/images/car_range_rover_evoque_1794752115065.jpg',
      gallery: [
        '/src/assets/images/car_range_rover_evoque_1794752115065.jpg',
        '/src/assets/images/about_fleet_showroom_1794752112431.jpg',
      ],
      description:
        'Silhouette raffinée, sellerie cuir Windsor et transmission intégrale intelligente. Le SUV compact britannique par excellence pour vos séjours premium à Casablanca.',
      features: ['Transmission 4x4 AWD', 'Pivi Pro Dual Screen', 'Sonorisation Meridian', 'Caméras ClearSight'],
      deposit: 12000,
    },
    {
      id: 'mercedes-classe-e',
      name: 'Mercedes Classe E',
      brand: 'Mercedes-Benz',
      model: 'E220d Exclusive',
      year: 2025,
      category: 'Voitures de luxe',
      pricePerDay: 1650,
      seats: 5,
      doors: 4,
      transmission: 'Automatique',
      fuel: 'Diesel',
      airConditioning: true,
      available: true,
      image: '/src/assets/images/car_mercedes_classe_e_1794752116071.jpg',
      gallery: [
        '/src/assets/images/car_mercedes_classe_e_1794752116071.jpg',
        '/src/assets/images/hero_casablanca_luxury_1794752111217.jpg',
      ],
      description:
        'Référence absolue des berlines exécutives. Suspension confort, éclairage d’ambiance personnalisable et prestance incomparable pour déplacements VIP et événements.',
      features: ['Suspension AIRMATIC', 'Éclairage d’ambiance 64 couleurs', 'Affichage tête haute', 'Conduite semi-autonome'],
      deposit: 15000,
    },
    {
      id: 'bmw-serie-5',
      name: 'BMW Série 5',
      brand: 'BMW',
      model: '520d Luxury Line',
      year: 2025,
      category: 'Voitures de luxe',
      pricePerDay: 1550,
      seats: 5,
      doors: 4,
      transmission: 'Automatique',
      fuel: 'Diesel',
      airConditioning: true,
      available: true,
      image: '/src/assets/images/car_bmw_serie_5_1794752116114.jpg',
      gallery: [
        '/src/assets/images/car_bmw_serie_5_1794752116114.jpg',
        '/src/assets/images/about_fleet_showroom_1794752112431.jpg',
      ],
      description:
        'Alliant luxe feutré et dynamisme routier, la BMW Série 5 offre un espace royal à l’arrière et une expérience de conduite fluide sur toutes distances.',
      features: ['Sellerie cuir Nappa', 'Harman Kardon Surround', 'Park Assist Plus', 'Climatisation 4 zones'],
      deposit: 15000,
    },
    {
      id: 'audi-a6',
      name: 'Audi A6',
      brand: 'Audi',
      model: 'A6 40 TDI S-Line',
      year: 2025,
      category: 'Voitures de luxe',
      pricePerDay: 1500,
      seats: 5,
      doors: 4,
      transmission: 'Automatique',
      fuel: 'Diesel',
      airConditioning: true,
      available: true,
      image: '/src/assets/images/car_audi_a6_1794752116400.jpg',
      gallery: [
        '/src/assets/images/car_audi_a6_1794752116400.jpg',
        '/src/assets/images/about_fleet_showroom_1794752112431.jpg',
      ],
      description:
        'Design épuré, phares Matrix LED et Virtual Cockpit haute résolution. L’Audi A6 S-Line garantit discrétion, technologie et confort de première classe.',
      features: ['Phares Matrix LED', 'Audi Virtual Cockpit', 'Bang & Olufsen 3D', 'Double vitrage acoustique'],
      deposit: 15000,
    },
  ];

  const bookings: BookingRecord[] = [
    {
      id: 'bk-101',
      reference: 'BC-2026-001',
      carId: 'mercedes-classe-c',
      carName: 'Mercedes Classe C',
      carCategory: 'Berlines',
      carImage: '/src/assets/images/car_mercedes_classe_c_1794752113717.jpg',
      customerName: 'Karim Benjelloun',
      customerEmail: 'k.benjelloun@entreprise.ma',
      customerPhone: '+212 6 61 23 45 67',
      pickupLocation: 'Aéroport Mohammed V (CMN) — Terminal 1 & 2',
      returnLocation: 'Casablanca Centre-Ville (Agence principale)',
      startDate: '2026-08-12',
      startTime: '10:00',
      endDate: '2026-08-17',
      endTime: '10:00',
      days: 5,
      pricePerDay: 950,
      totalPrice: 4750,
      message: 'Vol Royal Air Maroc AT201, livraison souhaitée au Terminal 2.',
      status: 'Confirmée',
      createdAt: '2026-08-05T11:20:00.000Z',
    },
    {
      id: 'bk-102',
      reference: 'BC-2026-002',
      carId: 'renault-clio-5',
      carName: 'Renault Clio 5',
      carCategory: 'Citadines',
      carImage: '/src/assets/images/car_renault_clio_5_1794752113243.jpg',
      customerName: 'Salma El Idrissi',
      customerEmail: 'salma.idrissi@gmail.com',
      customerPhone: '+212 6 70 88 12 34',
      pickupLocation: 'Quartier Maarif & Twin Center',
      returnLocation: 'Quartier Maarif & Twin Center',
      startDate: '2026-09-03',
      startTime: '09:30',
      endDate: '2026-09-10',
      endTime: '18:00',
      days: 7,
      pricePerDay: 300,
      totalPrice: 2100,
      message: 'Besoin d’un siège bébé si disponible.',
      status: 'Terminée',
      createdAt: '2026-09-01T14:15:00.000Z',
    },
    {
      id: 'bk-103',
      reference: 'BC-2026-003',
      carId: 'range-rover-evoque',
      carName: 'Range Rover Evoque',
      carCategory: 'SUV',
      carImage: '/src/assets/images/car_range_rover_evoque_1794752115065.jpg',
      customerName: 'Youssef Tazi',
      customerEmail: 'y.tazi@casafinance.ma',
      customerPhone: '+212 6 63 54 90 11',
      pickupLocation: 'Casablanca Finance City (CFC)',
      returnLocation: 'Aéroport Mohammed V (CMN) — Terminal 1 & 2',
      startDate: '2026-10-14',
      startTime: '08:30',
      endDate: '2026-10-18',
      endTime: '19:00',
      days: 4,
      pricePerDay: 1150,
      totalPrice: 4600,
      message: 'Déplacement direction vers Marrakech.',
      status: 'Confirmée',
      createdAt: '2026-10-10T09:00:00.000Z',
    },
    {
      id: 'bk-104',
      reference: 'BC-2026-004',
      carId: 'mercedes-classe-e',
      carName: 'Mercedes Classe E',
      carCategory: 'Voitures de luxe',
      carImage: '/src/assets/images/car_mercedes_classe_e_1794752116071.jpg',
      customerName: 'Nadia Chraibi',
      customerEmail: 'nadia.chraibi@atelier-anfa.ma',
      customerPhone: '+212 6 61 99 20 18',
      pickupLocation: 'Anfa & Corniche Ain Diab',
      returnLocation: 'Anfa & Corniche Ain Diab',
      startDate: '2026-11-18',
      startTime: '11:00',
      endDate: '2026-11-21',
      endTime: '11:00',
      days: 3,
      pricePerDay: 1650,
      totalPrice: 4950,
      message: 'Accueil d’un partenaire international à Anfa.',
      status: 'En attente',
      createdAt: '2026-11-12T16:40:00.000Z',
    },
    {
      id: 'bk-105',
      reference: 'BC-2026-005',
      carId: 'hyundai-tucson',
      carName: 'Hyundai Tucson',
      carCategory: 'SUV',
      carImage: '/src/assets/images/car_hyundai_tucson_1794752115415.jpg',
      customerName: 'Mehdi Berrada',
      customerEmail: 'mehdi.berrada@outlook.com',
      customerPhone: '+212 6 55 41 72 09',
      pickupLocation: 'Gare Casa-Voyageurs',
      returnLocation: 'Gare Casa-Voyageurs',
      startDate: '2026-11-22',
      startTime: '14:00',
      endDate: '2026-11-26',
      endTime: '14:00',
      days: 4,
      pricePerDay: 680,
      totalPrice: 2720,
      message: 'Arrivée en Al Boraq à 13h50.',
      status: 'En attente',
      createdAt: '2026-11-14T10:05:00.000Z',
    },
  ];

  const messages: ContactMessageRecord[] = [
    {
      id: 'msg-1',
      name: 'Amine Lahlou',
      email: 'a.lahlou@logistique-casa.ma',
      phone: '+212 6 62 11 45 89',
      subject: 'Contrat location longue durée entreprise (3 véhicules)',
      message:
        'Bonjour, notre cabinet souhaite étudier un contrat LLD de 12 mois pour 2 berlines et 1 citadine à Casablanca.',
      createdAt: '2026-11-13T15:20:00.000Z',
    },
  ];

  return {
    cars,
    bookings,
    messages,
    bookingCounter: 5,
  };
}

function readDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initial = createInitialData();
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw) as DatabaseSchema;
}

function writeDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpPath, DB_PATH);
}

function signSessionToken(email: string): string {
  const payload = {
    email,
    role: 'admin',
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySessionToken(token: string | undefined): { email: string; role: string } | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as {
      email?: string;
      role?: string;
      exp?: number;
    };
    if (!decoded.exp || decoded.exp < Date.now() || decoded.role !== 'admin' || !decoded.email) {
      return null;
    }
    return { email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    result[key] = val;
  }
  return result;
}

function extractAuthToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies[SESSION_COOKIE_NAME];
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = extractAuthToken(req);
  const session = verifySessionToken(token);
  if (!session) {
    res.status(401).json({ error: 'Authentification administrateur requise.' });
    return;
  }
  next();
}

function computeRentalDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00Z`).getTime();
  const end = new Date(`${endDate}T00:00:00Z`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 1;
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

function slugifyId(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function startServer() {
  // Initialize DB on boot
  readDb();

  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Serve generated studio vehicle photos reliably in both dev and production
  app.use('/src/assets/images', express.static(path.resolve(__dirname, 'src/assets/images')));

  // --- AUTH ROUTES ---
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      res.status(400).json({ error: 'Veuillez saisir votre e-mail et votre mot de passe.' });
      return;
    }

    const candidateHash = crypto.scryptSync(password, ADMIN_SALT, 64);
    const emailMatches = email === ADMIN_EMAIL;
    const passwordMatches = crypto.timingSafeEqual(candidateHash, ADMIN_PASSWORD_HASH);

    if (!emailMatches || !passwordMatches) {
      res.status(401).json({ error: 'Identifiants administrateur invalides.' });
      return;
    }

    const token = signSessionToken(email);
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: SESSION_TTL_MS,
      path: '/',
    });

    res.json({
      authenticated: true,
      user: { email, role: 'admin' },
      token,
    });
  });

  app.post('/api/auth/logout', (_req: Request, res: Response) => {
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    res.json({ authenticated: false });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const session = verifySessionToken(extractAuthToken(req));
    if (!session) {
      res.json({ authenticated: false, user: null });
      return;
    }
    res.json({ authenticated: true, user: session });
  });

  // --- PUBLIC CAR ROUTES ---
  app.get('/api/cars', (_req: Request, res: Response) => {
    const db = readDb();
    res.json(db.cars);
  });

  app.get('/api/cars/:id', (req: Request, res: Response) => {
    const db = readDb();
    const car = db.cars.find((c) => c.id === req.params.id);
    if (!car) {
      res.status(404).json({ error: 'Véhicule introuvable.' });
      return;
    }
    res.json(car);
  });

  // --- ADMIN CAR MANAGEMENT ROUTES ---
  app.post('/api/cars', requireAdmin, (req: Request, res: Response) => {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    const category = body.category as CarCategory;
    const pricePerDay = Number(body.pricePerDay);

    if (!name || !category || Number.isNaN(pricePerDay) || pricePerDay <= 0) {
      res.status(400).json({ error: 'Nom, catégorie et tarif journalier valide sont obligatoires.' });
      return;
    }

    const db = readDb();
    const baseId = slugifyId(name) || 'vehicule';
    const uniqueId = db.cars.some((c) => c.id === baseId) ? `${baseId}-${Date.now().toString().slice(-4)}` : baseId;
    const image =
      typeof body.image === 'string' && body.image.trim()
        ? body.image.trim()
        : '/src/assets/images/car_dacia_sandero_1794752112160.jpg';

    const newCar: CarRecord = {
      id: uniqueId,
      name,
      brand: String(body.brand || name.split(' ')[0] || 'BEST CAR').trim(),
      model: String(body.model || name).trim(),
      year: Number(body.year) || 2025,
      category,
      pricePerDay: Math.round(pricePerDay),
      seats: Number(body.seats) || 5,
      doors: Number(body.doors) || 5,
      transmission: body.transmission === 'Automatique' ? 'Automatique' : 'Manuelle',
      fuel: body.fuel === 'Essence' || body.fuel === 'Hybride' ? body.fuel : 'Diesel',
      airConditioning: body.airConditioning !== false,
      available: body.available !== false,
      image,
      gallery: [image, '/src/assets/images/about_fleet_showroom_1794752112431.jpg'],
      description:
        String(body.description || '').trim() ||
        `${name} entretenu dans nos ateliers à Casablanca, prêt pour la location courte ou longue durée.`,
      features: Array.isArray(body.features) && body.features.length > 0
        ? body.features.map(String)
        : ['Climatisation', 'Assurance tous risques', 'Assistance 24/7'],
      deposit: Number(body.deposit) || Math.round(pricePerDay * 10),
    };

    db.cars.push(newCar);
    writeDb(db);
    res.status(201).json(newCar);
  });

  app.put('/api/cars/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const idx = db.cars.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Véhicule introuvable.' });
      return;
    }

    const current = db.cars[idx];
    const body = req.body || {};
    const updated: CarRecord = {
      ...current,
      name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : current.name,
      brand: typeof body.brand === 'string' && body.brand.trim() ? body.brand.trim() : current.brand,
      model: typeof body.model === 'string' && body.model.trim() ? body.model.trim() : current.model,
      year: body.year ? Number(body.year) : current.year,
      category: body.category || current.category,
      pricePerDay:
        body.pricePerDay !== undefined && !Number.isNaN(Number(body.pricePerDay)) && Number(body.pricePerDay) > 0
          ? Math.round(Number(body.pricePerDay))
          : current.pricePerDay,
      seats: body.seats ? Number(body.seats) : current.seats,
      doors: body.doors ? Number(body.doors) : current.doors,
      transmission: body.transmission === 'Automatique' || body.transmission === 'Manuelle' ? body.transmission : current.transmission,
      fuel:
        body.fuel === 'Essence' || body.fuel === 'Diesel' || body.fuel === 'Hybride'
          ? body.fuel
          : current.fuel,
      airConditioning: typeof body.airConditioning === 'boolean' ? body.airConditioning : current.airConditioning,
      available: typeof body.available === 'boolean' ? body.available : current.available,
      image: typeof body.image === 'string' && body.image.trim() ? body.image.trim() : current.image,
      description: typeof body.description === 'string' ? body.description.trim() : current.description,
      deposit: body.deposit !== undefined && !Number.isNaN(Number(body.deposit)) ? Number(body.deposit) : current.deposit,
    };

    if (typeof body.image === 'string' && body.image.trim()) {
      updated.gallery = [updated.image, ...current.gallery.filter((g) => g !== updated.image).slice(0, 2)];
    }

    db.cars[idx] = updated;
    writeDb(db);
    res.json(updated);
  });

  app.delete('/api/cars/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const exists = db.cars.some((c) => c.id === req.params.id);
    if (!exists) {
      res.status(404).json({ error: 'Véhicule introuvable.' });
      return;
    }
    db.cars = db.cars.filter((c) => c.id !== req.params.id);
    writeDb(db);
    res.json({ deleted: true, id: req.params.id });
  });

  // --- PUBLIC BOOKING CREATION ---
  app.post('/api/bookings', (req: Request, res: Response) => {
    const body = req.body || {};
    const carId = String(body.carId || '').trim();
    const customerName = String(body.customerName || '').trim();
    const customerEmail = String(body.customerEmail || '').trim();
    const customerPhone = String(body.customerPhone || '').trim();
    const pickupLocation = String(body.pickupLocation || '').trim();
    const returnLocation = String(body.returnLocation || '').trim();
    const startDate = String(body.startDate || '').trim();
    const startTime = String(body.startTime || '10:00').trim();
    const endDate = String(body.endDate || '').trim();
    const endTime = String(body.endTime || '10:00').trim();
    const message = String(body.message || '').trim();

    if (!carId || !customerName || !customerEmail || !customerPhone || !pickupLocation || !returnLocation || !startDate || !endDate) {
      res.status(400).json({ error: 'Veuillez renseigner tous les champs obligatoires.' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      res.status(400).json({ error: 'Adresse e-mail invalide.' });
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      res.status(400).json({ error: 'La date de retour doit être postérieure à la date de départ.' });
      return;
    }

    const db = readDb();
    const car = db.cars.find((c) => c.id === carId);
    if (!car) {
      res.status(404).json({ error: 'Véhicule sélectionné introuvable.' });
      return;
    }
    if (!car.available) {
      res.status(409).json({ error: 'Ce véhicule est actuellement indisponible à la réservation.' });
      return;
    }

    const days = computeRentalDays(startDate, endDate);
    const totalPrice = days * car.pricePerDay;

    db.bookingCounter += 1;
    const reference = `BC-2026-${String(db.bookingCounter).padStart(3, '0')}`;
    const booking: BookingRecord = {
      id: `bk-${Date.now()}`,
      reference,
      carId: car.id,
      carName: car.name,
      carCategory: car.category,
      carImage: car.image,
      customerName,
      customerEmail,
      customerPhone,
      pickupLocation,
      returnLocation,
      startDate,
      startTime,
      endDate,
      endTime,
      days,
      pricePerDay: car.pricePerDay,
      totalPrice,
      message,
      status: 'En attente',
      createdAt: new Date().toISOString(),
    };

    db.bookings.unshift(booking);
    writeDb(db);
    res.status(201).json(booking);
  });

  // --- ADMIN BOOKINGS, CLIENTS & STATS ---
  app.get('/api/bookings', requireAdmin, (_req: Request, res: Response) => {
    const db = readDb();
    res.json(db.bookings);
  });

  app.patch('/api/bookings/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const idx = db.bookings.findIndex((b) => b.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Réservation introuvable.' });
      return;
    }

    const status = req.body?.status as BookingStatus;
    const allowed: BookingStatus[] = ['En attente', 'Confirmée', 'Refusée', 'Terminée'];
    if (!allowed.includes(status)) {
      res.status(400).json({ error: 'Statut de réservation invalide.' });
      return;
    }

    db.bookings[idx] = { ...db.bookings[idx], status };
    writeDb(db);
    res.json(db.bookings[idx]);
  });

  app.delete('/api/bookings/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const exists = db.bookings.some((b) => b.id === req.params.id);
    if (!exists) {
      res.status(404).json({ error: 'Réservation introuvable.' });
      return;
    }
    db.bookings = db.bookings.filter((b) => b.id !== req.params.id);
    writeDb(db);
    res.json({ deleted: true, id: req.params.id });
  });

  app.get('/api/clients', requireAdmin, (_req: Request, res: Response) => {
    const db = readDb();
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        phone: string;
        totalBookings: number;
        confirmedBookings: number;
        totalSpent: number;
        lastBookingDate: string;
        bookings: BookingRecord[];
      }
    >();

    for (const booking of db.bookings) {
      const key = booking.customerEmail.toLowerCase();
      const existing = map.get(key);
      const countsTowardRevenue = booking.status === 'Confirmée' || booking.status === 'Terminée';
      if (!existing) {
        map.set(key, {
          id: slugifyId(key),
          name: booking.customerName,
          email: booking.customerEmail,
          phone: booking.customerPhone,
          totalBookings: 1,
          confirmedBookings: countsTowardRevenue ? 1 : 0,
          totalSpent: countsTowardRevenue ? booking.totalPrice : 0,
          lastBookingDate: booking.createdAt,
          bookings: [booking],
        });
      } else {
        existing.totalBookings += 1;
        if (countsTowardRevenue) {
          existing.confirmedBookings += 1;
          existing.totalSpent += booking.totalPrice;
        }
        if (booking.createdAt > existing.lastBookingDate) {
          existing.lastBookingDate = booking.createdAt;
          existing.name = booking.customerName;
          existing.phone = booking.customerPhone;
        }
        existing.bookings.push(booking);
      }
    }

    res.json(Array.from(map.values()));
  });

  app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
    const db = readDb();
    const totalCars = db.cars.length;
    const availableCars = db.cars.filter((c) => c.available).length;
    const totalBookings = db.bookings.length;
    const pendingBookings = db.bookings.filter((b) => b.status === 'En attente').length;
    const confirmedBookings = db.bookings.filter((b) => b.status === 'Confirmée' || b.status === 'Terminée').length;
    const estimatedRevenue = db.bookings
      .filter((b) => b.status !== 'Refusée')
      .reduce((acc, b) => acc + b.totalPrice, 0);

    const months = [
      { key: '2026-07', label: 'Juil' },
      { key: '2026-08', label: 'Août' },
      { key: '2026-09', label: 'Sept' },
      { key: '2026-10', label: 'Oct' },
      { key: '2026-11', label: 'Nov' },
      { key: '2026-12', label: 'Déc' },
    ];

    const monthlyStats = months.map((m) => {
      const matching = db.bookings.filter(
        (b) => b.status !== 'Refusée' && (b.startDate.startsWith(m.key) || b.createdAt.startsWith(m.key)),
      );
      return {
        month: m.label,
        bookings: matching.length,
        revenue: matching.reduce((sum, b) => sum + b.totalPrice, 0),
      };
    });

    const categories: CarCategory[] = ['Citadines', 'Berlines', 'SUV', 'Voitures de luxe'];
    const categoryStats = categories.map((category) => {
      const matching = db.bookings.filter((b) => b.carCategory === category && b.status !== 'Refusée');
      return {
        category,
        bookings: matching.length,
        revenue: matching.reduce((sum, b) => sum + b.totalPrice, 0),
      };
    });

    res.json({
      totalCars,
      availableCars,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      estimatedRevenue,
      monthlyStats,
      categoryStats,
    });
  });

  // --- CONTACT MESSAGES ---
  app.post('/api/contact', (req: Request, res: Response) => {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim();
    const phone = String(req.body?.phone || '').trim();
    const subject = String(req.body?.subject || 'Demande d’information').trim();
    const message = String(req.body?.message || '').trim();

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Veuillez renseigner votre nom, e-mail et message.' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Adresse e-mail invalide.' });
      return;
    }

    const db = readDb();
    const entry: ContactMessageRecord = {
      id: `msg-${Date.now()}`,
      name,
      email,
      phone,
      subject,
      message,
      createdAt: new Date().toISOString(),
    };
    db.messages.unshift(entry);
    writeDb(db);
    res.status(201).json(entry);
  });

  app.get('/api/messages', requireAdmin, (_req: Request, res: Response) => {
    const db = readDb();
    res.json(db.messages);
  });

  // --- VITE / STATIC FRONTEND SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BEST CAR server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start BEST CAR server:', err);
  process.exit(1);
});
