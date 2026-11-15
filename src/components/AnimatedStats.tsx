import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { Award, CarFront, Headphones, Users } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  locale: string;
  start: boolean;
  durationMs?: number;
}

function AnimatedCounter({ target, suffix = '', locale, start, durationMs = 1200 }: AnimatedCounterProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setValue(target);
      return;
    }

    let rafId = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const progress = Math.min(1, elapsed / durationMs);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [start, target, durationMs]);

  return (
    <span className="tabular-nums">
      {value.toLocaleString(locale)}
      {suffix}
    </span>
  );
}

export function AnimatedStats() {
  const { t } = usePreferences();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.25 });

  const stats = [
    {
      id: 'cars',
      icon: CarFront,
      value: 50,
      suffix: '+',
      label: t.statsSection.carsLabel,
      sub: t.statsSection.carsSub,
    },
    {
      id: 'clients',
      icon: Users,
      value: 1000,
      suffix: '+',
      label: t.statsSection.clientsLabel,
      sub: t.statsSection.clientsSub,
    },
    {
      id: 'exp',
      icon: Award,
      value: 5,
      suffix: '',
      label: t.statsSection.expLabel,
      sub: t.statsSection.expSub,
    },
    {
      id: 'support',
      icon: Headphones,
      staticDisplay: t.statsSection.supportValue,
      label: t.statsSection.supportLabel,
      sub: t.statsSection.supportSub,
    },
  ];

  return (
    <section
      ref={containerRef}
      className="bg-[#FEFCE8] dark:bg-neutral-900 border-y border-yellow-200 dark:border-neutral-800 py-14 lg:py-16 transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-wider">
            {t.statsSection.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight">
            {t.statsSection.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 18 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                transition={{ duration: 0.4, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white dark:bg-neutral-950 border-2 border-yellow-200 dark:border-neutral-800 hover:border-yellow-400 dark:hover:border-yellow-400 rounded-xl p-6 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-lg bg-yellow-400 text-neutral-950 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="h-1.5 w-8 rounded-full bg-yellow-400/70" aria-hidden="true" />
                </div>

                <div className="mt-5 font-display text-3xl sm:text-4xl font-bold text-neutral-950 dark:text-yellow-400 tracking-tight tabular-nums">
                  {stat.staticDisplay ? (
                    <span>{stat.staticDisplay}</span>
                  ) : (
                    <AnimatedCounter
                      target={stat.value ?? 0}
                      suffix={stat.suffix}
                      locale={t.locale}
                      start={inView}
                    />
                  )}
                </div>

                <div className="mt-1 text-base font-bold text-neutral-900 dark:text-white">{stat.label}</div>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">{stat.sub}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
