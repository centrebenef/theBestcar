import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Headphones,
  Home,
  Plane,
  Zap,
} from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';

interface ServicesPageProps {
  onNavigate: (path: string) => void;
}

const SERVICE_ICONS = [CalendarClock, Briefcase, Plane, Home, Headphones, CheckCircle2, Zap];

export function ServicesPage({ onNavigate }: ServicesPageProps) {
  const { t } = usePreferences();

  return (
    <div className="bg-white dark:bg-neutral-950 transition-colors duration-200">
      <section className="bg-[#FEFCE8] dark:bg-neutral-900 text-neutral-950 dark:text-white py-14 lg:py-16 border-b border-yellow-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-wider">
            {t.servicesPage.eyebrow}
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">{t.servicesPage.title}</h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 max-w-2xl">
            {t.servicesPage.subtitle}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.servicesPage.items.map((service, idx) => {
            const Icon = SERVICE_ICONS[idx % SERVICE_ICONS.length];
            return (
              <article
                key={service.number}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-yellow-400 dark:hover:border-yellow-400"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-lg bg-yellow-400 text-neutral-950 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-semibold text-neutral-400">{service.number}.</span>
                  </div>

                  <h2 className="mt-5 font-display text-lg font-bold text-neutral-950 dark:text-white">
                    {service.title}
                  </h2>
                  <p className="mt-2.5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => onNavigate('/reserver')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-800 dark:text-yellow-400 hover:text-neutral-950 dark:hover:text-yellow-300 cursor-pointer"
                  >
                    <span>{t.servicesPage.requestBtn}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-14 bg-[#FEFCE8] dark:bg-neutral-900 border-2 border-yellow-400 text-neutral-950 dark:text-white rounded-xl p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-bold">{t.servicesPage.ctaTitle}</h2>
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 max-w-xl">{t.servicesPage.ctaDesc}</p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="px-5 py-3 text-sm font-bold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors whitespace-nowrap cursor-pointer"
            >
              {t.servicesPage.contactAgency}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/voitures')}
              className="px-5 py-3 text-sm font-semibold text-neutral-900 dark:text-white bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:border-yellow-500 transition-colors whitespace-nowrap cursor-pointer"
            >
              {t.servicesPage.viewFleet}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
