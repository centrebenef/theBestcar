import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ChevronDown, HelpCircle } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';

interface FaqSectionProps {
  onNavigate: (path: string) => void;
}

export function FaqSection({ onNavigate }: FaqSectionProps) {
  const { t } = usePreferences();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="bg-white dark:bg-neutral-950 border-t border-yellow-200 dark:border-neutral-800 py-16 lg:py-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left intro */}
          <div className="lg:col-span-5">
            <p className="inline-flex items-center gap-2 text-xs font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>{t.faqSection.eyebrow}</span>
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight [text-wrap:balance]">
              {t.faqSection.title}
            </h2>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-md">
              {t.faqSection.subtitle}
            </p>

            <div className="mt-6 p-5 rounded-xl bg-white dark:bg-neutral-950 border border-yellow-200 dark:border-neutral-800 space-y-3">
              <div className="text-sm font-semibold text-neutral-950 dark:text-white">{t.faqSection.ctaText}</div>
              <button
                type="button"
                onClick={() => onNavigate('/contact')}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors cursor-pointer"
              >
                <span>{t.faqSection.ctaBtn}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          </div>

          {/* Right accordion */}
          <div className="lg:col-span-7 space-y-3">
            {t.faqSection.items.map((item, idx) => {
              const isOpen = openIndex === idx;
              const panelId = `faq-panel-${idx}`;
              const btnId = `faq-button-${idx}`;
              return (
                <div
                  key={item.q}
                  className={`rounded-xl border transition-colors overflow-hidden ${
                    isOpen
                      ? 'bg-white dark:bg-neutral-950 border-yellow-400 shadow-sm'
                      : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-yellow-300 dark:hover:border-yellow-500/60'
                  }`}
                >
                  <button
                    id={btnId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(idx)}
                    className="w-full px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-4 text-start cursor-pointer"
                  >
                    <span className="font-display text-base font-bold text-neutral-950 dark:text-white">{item.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? 'bg-yellow-400 text-neutral-950'
                          : 'bg-[#FEFCE8] dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={btnId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/80">
                          <div className="pt-3.5">{item.a}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
