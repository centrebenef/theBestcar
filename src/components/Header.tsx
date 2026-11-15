import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Globe, Menu, Moon, Sun, X } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { LANGUAGE_OPTIONS } from '../i18n/translations';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function BrandMark() {
  return (
    <motion.svg
      whileHover={{ rotate: -4, scale: 1.06 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      width="30"
      height="30"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="32" height="32" rx="8" fill="#FACC15" />
      <path
        d="M6.5 18.5L9.5 12.2C10.1 11 11.3 10.2 12.6 10.2H19.4C20.7 10.2 21.9 11 22.5 12.2L25.5 18.5"
        stroke="#111827"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 18.5H26.5V22C26.5 22.6 26 23 25.5 23H23.5M8.5 23H6.5C6 23 5.5 22.6 5.5 22V18.5"
        stroke="#111827"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10.5" cy="22.5" r="2.2" fill="#FFFFFF" stroke="#111827" strokeWidth="1.2" />
      <circle cx="21.5" cy="22.5" r="2.2" fill="#FFFFFF" stroke="#111827" strokeWidth="1.2" />
    </motion.svg>
  );
}

export function Header({ currentPath, onNavigate }: HeaderProps) {
  const { theme, toggleTheme, lang, setLang, t } = usePreferences();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { label: t.nav.home, path: '/' },
    { label: t.nav.cars, path: '/voitures' },
    { label: t.nav.services, path: '/services' },
    { label: t.nav.about, path: '/a-propos' },
    { label: t.nav.contact, path: '/contact' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  const handleLinkClick = (path: string) => {
    setMobileOpen(false);
    onNavigate(path);
  };

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-40 transition-all duration-200 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b-2 border-yellow-400 ${
        scrolled ? 'shadow-md dark:shadow-black/40' : 'shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark only */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('/');
          }}
          className="inline-flex items-center gap-2.5 font-display text-lg sm:text-xl font-bold tracking-tight text-neutral-950 dark:text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-yellow-500 rounded"
        >
          <BrandMark />
          <span>
            BEST <span className="bg-yellow-400 text-neutral-950 px-1.5 py-0.5 rounded">CAR</span>
          </span>
        </a>

        {/* Zone 2: Animated Navigation Rail (5 concise single-line links) */}
        <nav
          className="hidden lg:flex items-center gap-1 bg-[#FEFCE8] dark:bg-neutral-900 border border-yellow-200 dark:border-neutral-800 rounded-xl p-1"
          aria-label={t.nav.mainNavLabel}
          onMouseLeave={() => setHoveredPath(null)}
        >
          {navItems.map((item) => {
            const active = isActive(item.path);
            const hovered = hoveredPath === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                onMouseEnter={() => setHoveredPath(item.path)}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.path);
                }}
                className={`relative px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'text-neutral-950'
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="bestcar-nav-active"
                    transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                    className="absolute inset-0 bg-yellow-400 rounded-lg shadow-xs"
                    aria-hidden="true"
                  />
                )}
                {!active && hovered && (
                  <motion.span
                    layoutId="bestcar-nav-hover"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    className="absolute inset-0 bg-yellow-200/70 dark:bg-neutral-800 rounded-lg"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Compact Language + Dark Mode controls + Primary CTA + Mobile drawer button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Multilingual Switcher (FR / AR / EN) */}
          <div
            className="inline-flex items-center bg-[#FEFCE8] dark:bg-neutral-900 border border-yellow-200 dark:border-neutral-800 rounded-lg p-0.5 shrink-0"
            role="group"
            aria-label="Language"
          >
            <Globe className="w-3.5 h-3.5 text-yellow-700 dark:text-yellow-400 mx-1.5 hidden sm:block shrink-0" />
            {LANGUAGE_OPTIONS.map((opt) => {
              const selected = lang === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setLang(opt.code)}
                  title={opt.label}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    selected
                      ? 'bg-yellow-400 text-neutral-950 shadow-2xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                  }`}
                >
                  {opt.short}
                </button>
              );
            })}
          </div>

          {/* Dark Mode Toggle */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            title={theme === 'dark' ? t.theme.toLight : t.theme.toDark}
            aria-label={theme === 'dark' ? t.theme.toLight : t.theme.toDark}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#FEFCE8] dark:bg-neutral-900 border border-yellow-200 dark:border-neutral-800 text-neutral-800 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            onClick={() => handleLinkClick('/reserver')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 border border-yellow-500/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            <span>{t.nav.bookNow}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </motion.button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-neutral-900 dark:text-yellow-400 bg-yellow-100 dark:bg-neutral-900 border border-yellow-300/60 dark:border-neutral-800 hover:bg-yellow-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Animated Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden border-t border-yellow-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-4 space-y-1.5 shadow-lg"
          >
            {navItems.map((item, idx) => {
              const active = isActive(item.path);
              return (
                <motion.a
                  key={item.path}
                  href={item.path}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.18 }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(item.path);
                  }}
                  className={`block px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-yellow-400 text-neutral-950'
                      : 'text-neutral-800 dark:text-neutral-200 hover:bg-yellow-50 dark:hover:bg-neutral-900'
                  }`}
                >
                  {item.label}
                </motion.a>
              );
            })}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleLinkClick('/reserver')}
                className="w-full py-2.5 px-4 text-sm font-bold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors cursor-pointer"
              >
                {t.nav.bookNow}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
