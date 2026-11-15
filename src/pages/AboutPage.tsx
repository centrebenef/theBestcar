import { ArrowRight, Check, ExternalLink, MapPin } from 'lucide-react';
import { VehicleImage } from '../components/VehicleImage';
import { usePreferences } from '../context/PreferencesContext';
import { ABOUT_IMAGE, AGENCY_INFO } from '../data/constants';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const { t } = usePreferences();

  return (
    <div className="bg-white dark:bg-neutral-950 transition-colors duration-200">
      <section className="bg-[#FEFCE8] dark:bg-neutral-900 text-neutral-950 dark:text-white py-14 lg:py-16 border-b border-yellow-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-wider">
            {t.aboutPage.eyebrow}
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">{t.aboutPage.title}</h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 max-w-2xl">
            {t.slogan} {t.aboutPage.subtitle}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="aspect-[16/10] w-full rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
              <VehicleImage
                src={ABOUT_IMAGE}
                alt="Showroom et flotte BEST CAR — 45 Avenue 2 Mars, Casablanca"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight [text-wrap:balance]">
              {t.aboutPage.partnerTitle}
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">{t.aboutPage.p1}</p>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">{t.aboutPage.p2}</p>

            <div className="p-4 rounded-xl bg-[#FEFCE8] dark:bg-neutral-900 border border-yellow-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-neutral-900 dark:text-white">
                <MapPin className="w-4 h-4 text-yellow-700 dark:text-yellow-400 shrink-0" />
                <span>{t.address}</span>
              </div>
              <a
                href={AGENCY_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-800 dark:text-yellow-400 hover:underline"
              >
                <span>{t.contactPage.openInMaps}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/voitures')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors cursor-pointer"
              >
                <span>{t.aboutPage.discoverBtn}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/contact')}
                className="px-5 py-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                {t.aboutPage.contactBtn}
              </button>
            </div>
          </div>
        </div>

        {/* 5 Pillars */}
        <div className="mt-16 pt-14 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="font-display text-2xl font-bold text-neutral-950 dark:text-white">
            {t.aboutPage.pillarsTitle}
          </h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.aboutPage.pillars.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl border border-yellow-200 dark:border-neutral-800 bg-[#FEFCE8] dark:bg-neutral-900"
              >
                <div className="w-8 h-8 rounded-lg bg-yellow-400 text-neutral-950 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-neutral-950 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
