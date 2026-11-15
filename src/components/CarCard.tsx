import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import type { Car } from '../types';
import { VehicleImage } from './VehicleImage';

interface CarCardProps {
  car: Car;
  onViewDetails: (carId: string) => void;
  onBook: (carId: string) => void;
}

export function CarCard({ car, onViewDetails, onBook }: CarCardProps) {
  const { t, formatPrice, translateCategory, translateTransmission, translateFuel } = usePreferences();

  return (
    <article className="group flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-yellow-400 dark:hover:border-yellow-400">
      <button
        type="button"
        onClick={() => onViewDetails(car.id)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#ECECEB] dark:bg-neutral-800 text-start focus-visible:outline-2 focus-visible:outline-yellow-500 cursor-pointer"
        aria-label={`${t.card.viewDetails} — ${car.name}`}
      >
        <VehicleImage
          src={car.image}
          alt={`${car.name} — Casablanca`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </button>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="font-semibold text-yellow-800 dark:text-yellow-400">{translateCategory(car.category)}</span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            {car.available ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">{t.card.available}</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-neutral-500 dark:text-neutral-400 font-medium">{t.card.unavailable}</span>
              </>
            )}
          </span>
        </div>

        <h3 className="mt-2 font-display text-lg font-semibold text-neutral-950 dark:text-white tracking-tight">
          {car.name}
        </h3>

        <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            {car.seats} {t.card.seats}
          </span>
          <span aria-hidden="true">·</span>
          <span>{translateTransmission(car.transmission)}</span>
          <span aria-hidden="true">·</span>
          <span>{translateFuel(car.fuel)}</span>
        </p>

        <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-baseline justify-between gap-3">
          <div>
            <span className="font-mono text-xl font-bold text-neutral-950 dark:text-white tabular-nums">
              {formatPrice(car.pricePerDay)}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 ms-1">{t.card.perDay}</span>
          </div>
          <span className="text-xs text-neutral-400 tabular-nums">{car.year}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onViewDetails(car.id)}
            className="inline-flex items-center justify-center px-3 py-2.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.card.viewDetails}
          </button>
          <button
            type="button"
            disabled={!car.available}
            onClick={() => onBook(car.id)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{t.card.book}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </article>
  );
}
