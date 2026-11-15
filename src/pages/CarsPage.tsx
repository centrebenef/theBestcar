import { useMemo, useState } from 'react';
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { CarCard } from '../components/CarCard';
import { usePreferences } from '../context/PreferencesContext';
import { CASABLANCA_LOCATIONS } from '../data/constants';
import type { Car, CarCategory, SearchPrefill } from '../types';

interface CarsPageProps {
  cars: Car[];
  loading: boolean;
  initialCategory?: string;
  searchPrefill: SearchPrefill;
  hasActiveSearch: boolean;
  onNavigate: (path: string) => void;
  onBookCar: (carId: string) => void;
}

const CATEGORIES: ('Toutes' | CarCategory)[] = [
  'Toutes',
  'Citadines',
  'Berlines',
  'SUV',
  'Voitures de luxe',
];

export function CarsPage({
  cars,
  loading,
  initialCategory,
  searchPrefill,
  hasActiveSearch,
  onNavigate,
  onBookCar,
}: CarsPageProps) {
  const { t, formatPrice } = usePreferences();

  const validInitialCat = CATEGORIES.includes(initialCategory as 'Toutes' | CarCategory)
    ? (initialCategory as 'Toutes' | CarCategory)
    : 'Toutes';

  const [selectedCategory, setSelectedCategory] = useState<'Toutes' | CarCategory>(validInitialCat);
  const [searchQuery, setSearchQuery] = useState('');
  const [transmissionFilter, setTransmissionFilter] = useState<'Toutes' | 'Manuelle' | 'Automatique'>('Toutes');
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const highestPrice = useMemo(() => {
    if (cars.length === 0) return 2000;
    return Math.max(2000, ...cars.map((c) => c.pricePerDay));
  }, [cars]);

  const filteredCars = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = cars.filter((car) => {
      if (selectedCategory !== 'Toutes' && car.category !== selectedCategory) return false;
      if (transmissionFilter !== 'Toutes' && car.transmission !== transmissionFilter) return false;
      if (car.pricePerDay > maxPrice) return false;
      if (onlyAvailable && !car.available) return false;
      if (query) {
        const haystack = `${car.name} ${car.brand} ${car.model} ${car.category}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    if (sortOrder === 'asc') {
      return [...list].sort((a, b) => a.pricePerDay - b.pricePerDay);
    }
    if (sortOrder === 'desc') {
      return [...list].sort((a, b) => b.pricePerDay - a.pricePerDay);
    }
    return list;
  }, [cars, selectedCategory, transmissionFilter, maxPrice, onlyAvailable, searchQuery, sortOrder]);

  const resetFilters = () => {
    setSelectedCategory('Toutes');
    setSearchQuery('');
    setTransmissionFilter('Toutes');
    setMaxPrice(highestPrice);
    setSortOrder('default');
    setOnlyAvailable(false);
  };

  const pickupLocIdx = CASABLANCA_LOCATIONS.findIndex((loc) => loc === searchPrefill.pickupLocation);
  const displayPickupLoc = pickupLocIdx >= 0 ? t.locations[pickupLocIdx] : searchPrefill.pickupLocation;

  return (
    <div className="bg-white dark:bg-neutral-950 min-h-[80vh] transition-colors duration-200">
      {/* Page Header */}
      <section className="bg-[#FEFCE8] dark:bg-neutral-900 text-neutral-950 dark:text-white py-12 lg:py-16 border-b border-yellow-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-wider">
            {t.carsPage.eyebrow}
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">{t.carsPage.title}</h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 max-w-2xl">
            {t.carsPage.subtitle(cars.length)}
          </p>

          {hasActiveSearch && (
            <div className="mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-950 border border-yellow-300 dark:border-yellow-500/50 rounded-lg px-4 py-2.5">
              <span className="font-bold text-yellow-800 dark:text-yellow-400">{t.carsPage.activeSearch}</span>
              <span>{displayPickupLoc}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {t.carsPage.fromTo(
                  searchPrefill.startDate,
                  searchPrefill.startTime,
                  searchPrefill.endDate,
                  searchPrefill.endTime,
                )}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Filters Toolbar */}
      <section className="border-b border-neutral-200 dark:border-neutral-800 bg-[#FAFAF8] dark:bg-neutral-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label={t.carsPage.eyebrow}>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              const label =
                cat === 'Toutes'
                  ? t.categories.all
                  : cat === 'Voitures de luxe'
                    ? t.categories.luxeShort
                    : t.categories[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-yellow-400 text-neutral-950 font-bold shadow-xs'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-yellow-400 hover:text-neutral-950 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search, Transmission, Max Price, Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-4">
              <label
                htmlFor="car-search"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                {t.carsPage.searchLabel}
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="car-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.carsPage.searchPlaceholder}
                  className="w-full h-10 ps-9 pe-3 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label
                htmlFor="car-transmission"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                {t.carsPage.transmissionLabel}
              </label>
              <select
                id="car-transmission"
                value={transmissionFilter}
                onChange={(e) => setTransmissionFilter(e.target.value as 'Toutes' | 'Manuelle' | 'Automatique')}
                className="w-full h-10 px-3 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
              >
                <option value="Toutes">{t.transmissions.all}</option>
                <option value="Manuelle">{t.transmissions.Manuelle}</option>
                <option value="Automatique">{t.transmissions.Automatique}</option>
              </select>
            </div>

            <div className="lg:col-span-3">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                <label htmlFor="car-price-range">{t.carsPage.maxBudgetLabel}</label>
                <span className="font-mono text-yellow-800 dark:text-yellow-400 font-bold tabular-nums">
                  {formatPrice(maxPrice)}
                </span>
              </div>
              <input
                id="car-price-range"
                type="range"
                min={250}
                max={highestPrice}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-yellow-500 my-3"
              />
            </div>

            <div className="lg:col-span-2">
              <label
                htmlFor="car-sort"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                {t.carsPage.sortLabel}
              </label>
              <select
                id="car-sort"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'default' | 'asc' | 'desc')}
                className="w-full h-10 px-3 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
              >
                <option value="default">{t.carsPage.sortDefault}</option>
                <option value="asc">{t.carsPage.sortAsc}</option>
                <option value="desc">{t.carsPage.sortDesc}</option>
              </select>
            </div>

            <div className="lg:col-span-1 flex items-center justify-end">
              <button
                type="button"
                onClick={resetFilters}
                title={t.carsPage.reset}
                className="w-full lg:w-auto h-10 px-3 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-yellow-50 dark:hover:bg-neutral-800 hover:border-yellow-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="lg:hidden">{t.carsPage.reset}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="inline-flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
              <span className="tabular-nums font-medium">{t.carsPage.shownCount(filteredCars.length)}</span>
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 accent-yellow-500"
              />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">{t.carsPage.onlyAvailable}</span>
            </label>
          </div>
        </div>
      </section>

      {/* Cars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[380px] rounded-xl bg-neutral-100 dark:bg-neutral-900 animate-pulse border border-neutral-200 dark:border-neutral-800"
              />
            ))}
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#FEFCE8] dark:bg-neutral-900 border border-yellow-200 dark:border-neutral-800 rounded-xl">
            <p className="font-display text-lg font-semibold text-neutral-900 dark:text-white">
              {t.carsPage.emptyTitle}
            </p>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{t.carsPage.emptyDesc}</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.carsPage.showAll}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
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
    </div>
  );
}
