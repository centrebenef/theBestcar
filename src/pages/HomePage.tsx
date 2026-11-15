import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Calendar,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Clock,
  Headphones,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AnimatedStats } from '../components/AnimatedStats';
import { CarCard } from '../components/CarCard';
import { FaqSection } from '../components/FaqSection';
import { VehicleImage } from '../components/VehicleImage';
import { usePreferences } from '../context/PreferencesContext';
import { CASABLANCA_LOCATIONS } from '../data/constants';
import type { Car, SearchPrefill } from '../types';

interface HomePageProps {
  cars: Car[];
  loading: boolean;
  searchPrefill: SearchPrefill;
  onSearchSubmit: (prefill: SearchPrefill) => void;
  onNavigate: (path: string) => void;
  onBookCar: (carId: string) => void;
}

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
];

const FALLBACK_CAROUSEL_SLIDES: Pick<Car, 'id' | 'name' | 'category' | 'pricePerDay' | 'transmission' | 'image'>[] = [
  {
    id: 'mercedes-classe-e',
    name: 'Mercedes Classe E',
    category: 'Voitures de luxe',
    pricePerDay: 1650,
    transmission: 'Automatique',
    image: '/src/assets/images/car_mercedes_classe_e_1794752116071.jpg',
  },
  {
    id: 'range-rover-evoque',
    name: 'Range Rover Evoque',
    category: 'SUV',
    pricePerDay: 1150,
    transmission: 'Automatique',
    image: '/src/assets/images/car_range_rover_evoque_1794752115065.jpg',
  },
  {
    id: 'bmw-serie-3',
    name: 'BMW Série 3',
    category: 'Berlines',
    pricePerDay: 900,
    transmission: 'Automatique',
    image: '/src/assets/images/car_bmw_serie_3_1794752114408.jpg',
  },
  {
    id: 'renault-clio-5',
    name: 'Renault Clio 5',
    category: 'Citadines',
    pricePerDay: 300,
    transmission: 'Manuelle',
    image: '/src/assets/images/car_renault_clio_5_1794752113243.jpg',
  },
];

export function HomePage({
  cars,
  loading,
  searchPrefill,
  onSearchSubmit,
  onNavigate,
  onBookCar,
}: HomePageProps) {
  const { t, formatPrice, translateCategory, translateTransmission } = usePreferences();

  const initialLocIndex = Math.max(
    0,
    CASABLANCA_LOCATIONS.findIndex((loc) => loc === searchPrefill.pickupLocation),
  );
  const [locationIndex, setLocationIndex] = useState(initialLocIndex);
  const [startDate, setStartDate] = useState(searchPrefill.startDate);
  const [startTime, setStartTime] = useState(searchPrefill.startTime);
  const [endDate, setEndDate] = useState(searchPrefill.endDate);
  const [endTime, setEndTime] = useState(searchPrefill.endTime);
  const [searchError, setSearchError] = useState('');

  // Top 4-car carousel state
  const [slideIndex, setSlideIndex] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);

  const carouselSlides = useMemo(() => {
    if (cars.length === 0) return FALLBACK_CAROUSEL_SLIDES;
    const preferredIds = ['mercedes-classe-e', 'range-rover-evoque', 'bmw-serie-3', 'renault-clio-5'];
    const picked = preferredIds
      .map((id) => cars.find((c) => c.id === id))
      .filter((c): c is Car => Boolean(c));
    if (picked.length === 4) return picked;
    const categories = ['Voitures de luxe', 'SUV', 'Berlines', 'Citadines'] as const;
    const byCat = categories
      .map((cat) => cars.find((c) => c.category === cat))
      .filter((c): c is Car => Boolean(c));
    return byCat.length >= 4 ? byCat.slice(0, 4) : cars.slice(0, 4);
  }, [cars]);

  useEffect(() => {
    if (carouselPaused || carouselSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % carouselSlides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [carouselPaused, carouselSlides.length]);

  const activeSlide = carouselSlides[slideIndex % carouselSlides.length] || FALLBACK_CAROUSEL_SLIDES[0];

  const featuredCars = (() => {
    const categories = ['Citadines', 'Berlines', 'SUV', 'Voitures de luxe'] as const;
    const picked: Car[] = [];
    for (const cat of categories) {
      const match = cars.find((c) => c.category === cat && c.available) || cars.find((c) => c.category === cat);
      if (match) picked.push(match);
    }
    return picked.slice(0, 4);
  })();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (new Date(endDate) < new Date(startDate)) {
      setSearchError(t.home.dateError);
      return;
    }
    setSearchError('');
    const loc = CASABLANCA_LOCATIONS[locationIndex] || CASABLANCA_LOCATIONS[0];
    onSearchSubmit({
      pickupLocation: loc,
      returnLocation: loc,
      startDate,
      startTime,
      endDate,
      endTime,
    });
  };

  const prevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const nextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % carouselSlides.length);
  };

  const commitmentIcons = [CarFront, ShieldCheck, Sparkles, Headphones];

  return (
    <div className="bg-white dark:bg-neutral-950 transition-colors duration-200">
      {/* Top Hero Section: Yellow & White (or Obsidian & Yellow in Dark Mode) with 4-Image Car Carousel */}
      <section className="bg-gradient-to-b from-[#FEFCE8] via-white to-white dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-950 border-b border-yellow-200/80 dark:border-neutral-800 pt-10 pb-20 lg:pt-14 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-wider">
                <span className="w-6 h-0.5 bg-yellow-400 inline-block" aria-hidden="true" />
                <span>
                  {t.addressShort} · {t.slogan}
                </span>
              </p>

              <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold leading-[1.08] tracking-tight text-neutral-950 dark:text-white [text-wrap:balance]">
                {t.home.heroTitlePrefix}{' '}
                <span className="underline decoration-yellow-400 decoration-4 underline-offset-4">BEST CAR</span>
              </h1>

              <p className="mt-5 text-base text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-lg">
                {t.home.heroSubtitle}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => onNavigate('/voitures')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
                >
                  <span>{t.home.discoverBtn}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/reserver')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-neutral-900 dark:text-white bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{t.home.bookBtn}</span>
                </button>
              </div>
            </div>

            {/* Right Column: 4-Image Vehicle Carousel */}
            <div
              className="lg:col-span-7 flex flex-col justify-between gap-3"
              onMouseEnter={() => setCarouselPaused(true)}
              onMouseLeave={() => setCarouselPaused(false)}
            >
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border-2 border-yellow-300 dark:border-yellow-500/60 bg-[#ECECEB] dark:bg-neutral-900 shadow-md">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full"
                  >
                    <VehicleImage
                      src={activeSlide.image}
                      alt={`${activeSlide.name} — BEST CAR Casablanca`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Scrim & Active Car Info */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/45 to-transparent p-5 sm:p-6 flex flex-wrap items-end justify-between gap-4">
                  <div className="text-white">
                    <div className="text-xs font-semibold text-yellow-300">
                      {translateCategory(activeSlide.category)} · {translateTransmission(activeSlide.transmission)}
                    </div>
                    <div className="mt-0.5 font-display text-xl sm:text-2xl font-bold tracking-tight">
                      {activeSlide.name}
                    </div>
                    <div className="mt-1 font-mono text-sm font-semibold text-yellow-400 tabular-nums">
                      {formatPrice(activeSlide.pricePerDay)} {t.card.perDay}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/voitures/${activeSlide.id}`)}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-white/15 backdrop-blur-sm border border-white/25 rounded-lg hover:bg-white/25 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {t.card.viewDetails}
                    </button>
                    <button
                      type="button"
                      onClick={() => onBookCar(activeSlide.id)}
                      className="px-4 py-2 text-xs font-bold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {t.card.book}
                    </button>
                  </div>
                </div>

                {/* Prev / Next Controls */}
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label={t.home.prevCar}
                  className="absolute start-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-neutral-900/90 hover:bg-yellow-400 dark:hover:bg-yellow-400 text-neutral-950 dark:text-white dark:hover:text-neutral-950 shadow-md flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label={t.home.nextCar}
                  className="absolute end-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-neutral-900/90 hover:bg-yellow-400 dark:hover:bg-yellow-400 text-neutral-950 dark:text-white dark:hover:text-neutral-950 shadow-md flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                </button>
              </div>

              {/* 4-Thumbnail Selector Strip */}
              <div className="grid grid-cols-4 gap-2.5" role="tablist" aria-label={t.home.carouselLabel}>
                {carouselSlides.slice(0, 4).map((slide, idx) => {
                  const active = idx === slideIndex % carouselSlides.length;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSlideIndex(idx)}
                      className={`group text-start rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white dark:bg-neutral-900 ${
                        active
                          ? 'border-yellow-400 shadow-sm ring-2 ring-yellow-400/40'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-yellow-300 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="aspect-[16/10] w-full overflow-hidden bg-[#ECECEB] dark:bg-neutral-800">
                        <VehicleImage
                          src={slide.image}
                          alt={slide.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="px-2.5 py-1.5 bg-white dark:bg-neutral-900">
                        <div className="text-[11px] font-bold text-neutral-900 dark:text-white truncate">
                          {slide.name}
                        </div>
                        <div className="font-mono text-[10px] font-semibold text-yellow-700 dark:text-yellow-400 tabular-nums">
                          {slide.pricePerDay.toLocaleString(t.locale)} {t.home.perDayShort}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Width Search & Booking Bar */}
      <section className="relative z-20 -mt-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-white dark:bg-neutral-900 border-2 border-yellow-300 dark:border-yellow-500/60 rounded-xl shadow-lg p-5 sm:p-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-4">
              <label
                htmlFor="home-pickup"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                {t.home.pickupLabel}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-yellow-700 dark:text-yellow-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="home-pickup"
                  value={locationIndex}
                  onChange={(e) => setLocationIndex(Number(e.target.value))}
                  className="w-full h-11 ps-9 pe-3 text-sm text-neutral-900 dark:text-white bg-[#FEFCE8]/60 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:bg-white dark:focus:bg-neutral-950"
                >
                  {t.locations.map((loc, idx) => (
                    <option key={loc} value={idx}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:col-span-2">
              <label
                htmlFor="home-start-date"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                {t.home.startDateLabel}
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-yellow-700 dark:text-yellow-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="home-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full h-11 ps-9 pe-3 text-sm text-neutral-900 dark:text-white bg-[#FEFCE8]/60 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:bg-white dark:focus:bg-neutral-950 tabular-nums"
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <label
                htmlFor="home-start-time"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                {t.home.timeLabel}
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-yellow-700 dark:text-yellow-400 absolute start-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="home-start-time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full h-11 ps-7 pe-2 text-sm text-neutral-900 dark:text-white bg-[#FEFCE8]/60 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:bg-white dark:focus:bg-neutral-950 tabular-nums"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:col-span-2">
              <label
                htmlFor="home-end-date"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                {t.home.endDateLabel}
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-yellow-700 dark:text-yellow-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="home-end-date"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full h-11 ps-9 pe-3 text-sm text-neutral-900 dark:text-white bg-[#FEFCE8]/60 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:bg-white dark:focus:bg-neutral-950 tabular-nums"
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <label
                htmlFor="home-end-time"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                {t.home.timeLabel}
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-yellow-700 dark:text-yellow-400 absolute start-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="home-end-time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full h-11 ps-7 pe-2 text-sm text-neutral-900 dark:text-white bg-[#FEFCE8]/60 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:bg-white dark:focus:bg-neutral-950 tabular-nums"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full h-11 px-5 text-sm font-bold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors whitespace-nowrap cursor-pointer"
              >
                {t.home.searchBtn}
              </button>
            </div>
          </form>

          {searchError && <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400">{searchError}</p>}
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wider">
              {t.home.fleetEyebrow}
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight">
              {t.home.fleetTitle}
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">{t.home.fleetSub}</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/voitures')}
            className="inline-flex items-center gap-2 text-sm font-bold text-neutral-950 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{t.home.viewAllCars(cars.length)}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[370px] rounded-xl bg-neutral-100 dark:bg-neutral-900 animate-pulse border border-neutral-200 dark:border-neutral-800"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                onViewDetails={(id) => onNavigate(`/voitures/${id}`)}
                onBook={onBookCar}
              />
            ))}
          </div>
        )}
      </section>

      {/* Commitments & Proof Section */}
      <section className="bg-[#FEFCE8] dark:bg-neutral-900 border-y border-yellow-200 dark:border-neutral-800 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <p className="text-xs font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-wider">
                {t.home.expEyebrow}
              </p>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight [text-wrap:balance]">
                {t.home.expTitle}
              </h2>
              <p className="mt-4 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{t.home.expDesc}</p>

              <div className="mt-8 grid grid-cols-3 gap-6 pt-6 border-t border-yellow-200 dark:border-neutral-800">
                <div>
                  <div className="font-mono text-2xl font-bold text-neutral-950 dark:text-yellow-400 tabular-nums">
                    12+
                  </div>
                  <div className="mt-1 text-xs text-neutral-700 dark:text-neutral-400">{t.home.statModels}</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-neutral-950 dark:text-yellow-400 tabular-nums">
                    15 min
                  </div>
                  <div className="mt-1 text-xs text-neutral-700 dark:text-neutral-400">{t.home.statKeys}</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-neutral-950 dark:text-yellow-400 tabular-nums">
                    24/7
                  </div>
                  <div className="mt-1 text-xs text-neutral-700 dark:text-neutral-400">{t.home.statSupport}</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {t.home.commitments.map((item, idx) => {
                const Icon = commitmentIcons[idx % commitmentIcons.length];
                return (
                  <div
                    key={item.title}
                    className="bg-white dark:bg-neutral-950 border border-yellow-200 dark:border-neutral-800 rounded-xl p-6"
                  >
                    <div className="w-10 h-10 rounded-lg bg-yellow-400 text-neutral-950 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-neutral-950 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wider">
              {t.home.reviewsEyebrow}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-neutral-950 dark:text-white tracking-tight">
              {t.home.reviewsTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/reserver')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{t.home.planBtn}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.home.testimonials.map((item) => (
            <blockquote
              key={item.author}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 flex flex-col justify-between"
            >
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{item.quote}</p>
              <footer className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <div className="text-sm font-semibold text-neutral-950 dark:text-white">{item.author}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">{item.role}</div>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Animated Statistics Section */}
      <AnimatedStats />

      {/* Frequently Asked Questions (FAQ) */}
      <FaqSection onNavigate={onNavigate} />
    </div>
  );
}
