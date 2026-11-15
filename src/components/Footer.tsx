import { Lock, Mail, MapPin, Phone } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { AGENCY_INFO } from '../data/constants';
import { BrandMark } from './Header';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { t } = usePreferences();

  const link = (path: string, label: string) => (
    <a
      href={path}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(path);
      }}
      className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-yellow-400 transition-colors"
    >
      {label}
    </a>
  );

  return (
    <footer className="bg-[#FEFCE8] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 border-t-2 border-yellow-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="inline-flex items-center gap-2.5 font-display text-xl font-bold text-neutral-950 dark:text-white tracking-tight">
              <BrandMark />
              <span>
                BEST <span className="bg-yellow-400 text-neutral-950 px-1.5 py-0.5 rounded">CAR</span>
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-yellow-800 dark:text-yellow-400">{t.slogan}</p>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{t.footer.tagline}</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-neutral-950 dark:text-white">{t.footer.navTitle}</h3>
            <ul className="mt-4 space-y-2.5">
              <li>{link('/', t.nav.home)}</li>
              <li>{link('/voitures', t.nav.cars)}</li>
              <li>{link('/reserver', t.footer.bookVehicle)}</li>
              <li>{link('/services', t.nav.services)}</li>
              <li>{link('/a-propos', t.nav.about)}</li>
              <li>{link('/contact', t.nav.contact)}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-neutral-950 dark:text-white">{t.footer.catTitle}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-neutral-600 dark:text-neutral-400">
              <li>{link('/voitures?categorie=Citadines', t.footer.catCity)}</li>
              <li>{link('/voitures?categorie=Berlines', t.footer.catSedan)}</li>
              <li>{link('/voitures?categorie=SUV', t.footer.catSuv)}</li>
              <li>{link('/voitures?categorie=Voitures%20de%20luxe', t.footer.catLuxury)}</li>
              <li>{link('/services', t.footer.catAirport)}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-neutral-950 dark:text-white">{t.footer.contactTitle}</h3>
            <ul className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-yellow-700 dark:text-yellow-400 shrink-0 mt-0.5" />
                <a
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/contact');
                  }}
                  className="hover:text-neutral-950 dark:hover:text-yellow-400 transition-colors"
                >
                  {t.address}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-yellow-700 dark:text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-neutral-900 dark:text-neutral-100 font-medium tabular-nums" dir="ltr">
                    {AGENCY_INFO.phoneDisplay}
                  </span>
                  <span className="block text-xs text-neutral-500 dark:text-neutral-500">{t.phoneNote}</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-yellow-700 dark:text-yellow-400 shrink-0 mt-0.5" />
                <a
                  href={`mailto:${AGENCY_INFO.email}`}
                  className="hover:text-neutral-950 dark:hover:text-yellow-400 transition-colors"
                >
                  {AGENCY_INFO.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-yellow-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600 dark:text-neutral-400">
          <p>
            © {new Date().getFullYear()} {t.footer.rights}
          </p>
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/admin');
            }}
            className="inline-flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200 hover:text-yellow-800 dark:hover:text-yellow-400 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t.footer.adminLink}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
