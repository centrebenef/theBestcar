import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CAR_LOCALIZED_DETAILS, TRANSLATIONS, type Language } from '../i18n/translations';
import type { BookingStatus, Car, CarCategory, FuelType, TransmissionType } from '../types';

export type ThemeMode = 'light' | 'dark';

type TranslationDict = (typeof TRANSLATIONS)[Language];

interface PreferencesContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  isRtl: boolean;
  t: TranslationDict;
  formatPrice: (amount: number) => string;
  translateCategory: (cat: CarCategory) => string;
  translateTransmission: (tr: TransmissionType) => string;
  translateFuel: (fuel: FuelType) => string;
  translateStatus: (status: BookingStatus) => string;
  getCarText: (car: Car) => { description: string; features: string[] };
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

const THEME_KEY = 'bestcar-theme';
const LANG_KEY = 'bestcar-lang';

function readInitialTheme(): ThemeMode {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // ignore storage errors
  }
  return 'light';
}

function readInitialLang(): Language {
  try {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === 'fr' || saved === 'ar' || saved === 'en') return saved;
  } catch {
    // ignore storage errors
  }
  return 'fr';
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(readInitialTheme);
  const [lang, setLang] = useState<Language>(readInitialLang);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      window.localStorage.setItem(LANG_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  const value = useMemo<PreferencesContextValue>(() => {
    const t = TRANSLATIONS[lang];
    const isRtl = lang === 'ar';

    return {
      theme,
      setTheme,
      toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
      lang,
      setLang,
      isRtl,
      t,
      formatPrice: (amount: number) => `${amount.toLocaleString(t.locale)} ${t.currency}`,
      translateCategory: (cat: CarCategory) => t.categories[cat] || cat,
      translateTransmission: (tr: TransmissionType) => t.transmissions[tr] || tr,
      translateFuel: (fuel: FuelType) => t.fuels[fuel] || fuel,
      translateStatus: (status: BookingStatus) => t.statuses[status] || status,
      getCarText: (car: Car) => {
        if (lang === 'fr') {
          return { description: car.description, features: car.features || [] };
        }
        const localized = CAR_LOCALIZED_DETAILS[car.id]?.[lang];
        if (localized) return localized;
        return { description: car.description, features: car.features || [] };
      },
    };
  }, [theme, lang]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return ctx;
}
