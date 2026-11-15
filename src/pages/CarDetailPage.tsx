import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  DoorOpen,
  Fuel,
  Settings2,
  ShieldCheck,
  Snowflake,
  Users,
  XCircle,
} from 'lucide-react';
import { VehicleImage } from '../components/VehicleImage';
import { usePreferences } from '../context/PreferencesContext';
import type { Car } from '../types';

interface CarDetailPageProps {
  car: Car | undefined;
  loading: boolean;
  onNavigate: (path: string) => void;
  onBookCar: (carId: string) => void;
}

export function CarDetailPage({ car, loading, onNavigate, onBookCar }: CarDetailPageProps) {
  const { t, formatPrice, translateCategory, translateTransmission, translateFuel, getCarText } = usePreferences();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="h-96 bg-neutral-100 dark:bg-neutral-900 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-neutral-950 dark:text-white">
          {t.detailPage.notFoundTitle}
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{t.detailPage.notFoundDesc}</p>
        <button
          type="button"
          onClick={() => onNavigate('/voitures')}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t.detailPage.backCatalog}</span>
        </button>
      </div>
    );
  }

  const gallery = car.gallery && car.gallery.length > 0 ? car.gallery : [car.image];
  const currentImage = gallery[activePhotoIndex] || car.image;
  const localizedCar = getCarText(car);

  return (
    <div className="bg-white dark:bg-neutral-950 py-10 lg:py-14 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate('/voitures')}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-yellow-400 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t.detailPage.backCars}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Gallery & Details */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <div className="aspect-[16/11] w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#ECECEB] dark:bg-neutral-900">
                <VehicleImage
                  src={currentImage}
                  alt={`${car.name} — ${activePhotoIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {gallery.length > 1 && (
                <div className="mt-3 grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {gallery.map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${
                        activePhotoIndex === idx
                          ? 'border-yellow-400'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-yellow-300'
                      }`}
                    >
                      <VehicleImage src={img} alt={`${car.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="font-display text-xl font-bold text-neutral-950 dark:text-white">
                {t.detailPage.presentation}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {localizedCar.description}
              </p>
            </div>

            {/* Technical Specs */}
            <div>
              <h2 className="font-display text-xl font-bold text-neutral-950 dark:text-white mb-4">
                {t.detailPage.specsTitle}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#FEFCE8] dark:bg-neutral-900">
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <Users className="w-4 h-4 text-yellow-700 dark:text-yellow-400" />
                    <span>{t.detailPage.seats}</span>
                  </div>
                  <div className="mt-1.5 font-semibold text-sm text-neutral-950 dark:text-white tabular-nums">
                    {car.seats} {t.card.seats}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#FEFCE8] dark:bg-neutral-900">
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <DoorOpen className="w-4 h-4 text-yellow-700 dark:text-yellow-400" />
                    <span>{t.detailPage.doors}</span>
                  </div>
                  <div className="mt-1.5 font-semibold text-sm text-neutral-950 dark:text-white tabular-nums">
                    {car.doors} {t.detailPage.doorsUnit}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#FEFCE8] dark:bg-neutral-900">
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <Settings2 className="w-4 h-4 text-yellow-700 dark:text-yellow-400" />
                    <span>{t.detailPage.transmission}</span>
                  </div>
                  <div className="mt-1.5 font-semibold text-sm text-neutral-950 dark:text-white">
                    {translateTransmission(car.transmission)}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#FEFCE8] dark:bg-neutral-900">
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <Fuel className="w-4 h-4 text-yellow-700 dark:text-yellow-400" />
                    <span>{t.detailPage.fuel}</span>
                  </div>
                  <div className="mt-1.5 font-semibold text-sm text-neutral-950 dark:text-white">
                    {translateFuel(car.fuel)}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#FEFCE8] dark:bg-neutral-900">
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <Snowflake className="w-4 h-4 text-yellow-700 dark:text-yellow-400" />
                    <span>{t.detailPage.ac}</span>
                  </div>
                  <div className="mt-1.5 font-semibold text-sm text-neutral-950 dark:text-white">
                    {car.airConditioning ? t.detailPage.acYes : t.detailPage.acNo}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#FEFCE8] dark:bg-neutral-900">
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <ShieldCheck className="w-4 h-4 text-yellow-700 dark:text-yellow-400" />
                    <span>{t.detailPage.deposit}</span>
                  </div>
                  <div className="mt-1.5 font-semibold text-sm text-neutral-950 dark:text-white tabular-nums">
                    {formatPrice(car.deposit)}
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            {localizedCar.features.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-bold text-neutral-950 dark:text-white mb-3">
                  {t.detailPage.featuresTitle}
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {localizedCar.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-2.5 text-sm text-neutral-700 dark:text-neutral-300"
                    >
                      <Check className="w-4 h-4 text-yellow-700 dark:text-yellow-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rental Conditions */}
            <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#FEFCE8] dark:bg-neutral-900">
              <h2 className="font-display text-lg font-bold text-neutral-950 dark:text-white">
                {t.detailPage.conditionsTitle}
              </h2>
              <ul className="mt-3 space-y-2">
                {t.rentalConditions.map((cond) => (
                  <li key={cond} className="flex items-start gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0" aria-hidden="true" />
                    <span>{cond}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Sticky Booking Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {translateCategory(car.category)} · {t.detailPage.modelYear} {car.year}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  {car.available ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        {t.detailPage.availableNow}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-500 dark:text-neutral-400 font-semibold">
                        {t.detailPage.rentedNow}
                      </span>
                    </>
                  )}
                </span>
              </div>

              <h1 className="mt-3 font-display text-3xl font-bold text-neutral-950 dark:text-white tracking-tight">
                {car.name}
              </h1>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{car.model}</p>

              <div className="mt-6 py-5 border-y border-neutral-100 dark:border-neutral-800 flex items-baseline justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{t.detailPage.dailyRate}</span>
                <div>
                  <span className="font-mono text-3xl font-bold text-neutral-950 dark:text-yellow-400 tabular-nums">
                    {formatPrice(car.pricePerDay)}
                  </span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400 ms-1">{t.card.perDay}</span>
                </div>
              </div>

              <ul className="mt-5 space-y-2.5 text-sm text-neutral-700 dark:text-neutral-300">
                <li className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">{t.detailPage.deliveryLabel}</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{t.detailPage.onRequest}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">{t.detailPage.insuranceLabel}</span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">{t.detailPage.included}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">{t.detailPage.supportLabel}</span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">{t.detailPage.included}</span>
                </li>
              </ul>

              <button
                type="button"
                disabled={!car.available}
                onClick={() => onBookCar(car.id)}
                className="mt-7 w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-bold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span>{car.available ? t.detailPage.bookThisCar : t.detailPage.carUnavailable}</span>
                {car.available && <ArrowRight className="w-4 h-4 rtl:rotate-180" />}
              </button>

              {!car.available && (
                <button
                  type="button"
                  onClick={() => onNavigate('/voitures')}
                  className="mt-3 w-full py-2.5 px-4 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  {t.detailPage.chooseAvailable}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
