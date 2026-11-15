import { useState } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import type { AdminStats, CarCategory } from '../types';

interface AdminChartsProps {
  stats: AdminStats;
}

export function AdminCharts({ stats }: AdminChartsProps) {
  const { t, formatPrice, translateCategory } = usePreferences();
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const maxRevenue = Math.max(5000, ...stats.monthlyStats.map((m) => m.revenue));
  const totalCategoryBookings = Math.max(
    1,
    stats.categoryStats.reduce((sum, c) => sum + c.bookings, 0),
  );

  const barColors = ['#FACC15', '#52525B', '#CA8A04', '#A1A1AA'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Monthly Revenue & Bookings Bar Chart */}
      <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-display text-base font-bold text-neutral-950 dark:text-white">
              {t.adminPage.chartsRevTitle}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.adminPage.chartsRevSub}</p>
          </div>
          <span className="font-mono text-xs font-bold text-yellow-800 dark:text-neutral-950 bg-yellow-100 dark:bg-yellow-400 px-2.5 py-1 rounded tabular-nums">
            {formatPrice(stats.estimatedRevenue)}
          </span>
        </div>

        <div className="h-56 flex items-end justify-between gap-3 pt-6 border-b border-neutral-200 dark:border-neutral-800">
          {stats.monthlyStats.map((item) => {
            const heightPercent = Math.max(6, Math.round((item.revenue / maxRevenue) * 100));
            const isHovered = hoveredMonth === item.month;
            return (
              <div
                key={item.month}
                className="relative flex-1 flex flex-col items-center h-full justify-end group"
                onMouseEnter={() => setHoveredMonth(item.month)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {isHovered && (
                  <div className="absolute -top-2 z-10 px-2.5 py-1.5 rounded-lg bg-neutral-950 dark:bg-neutral-800 text-white text-[11px] whitespace-nowrap shadow-md pointer-events-none">
                    <div className="font-semibold tabular-nums text-yellow-400">{formatPrice(item.revenue)}</div>
                    <div className="text-neutral-300 tabular-nums">{item.bookings}</div>
                  </div>
                )}

                <div className="w-full max-w-[44px] flex flex-col items-center justify-end h-[180px]">
                  <span className="mb-1.5 font-mono text-[11px] text-neutral-500 dark:text-neutral-400 tabular-nums">
                    {item.bookings > 0 ? item.bookings : '0'}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-colors duration-150 ${
                      item.revenue > 0
                        ? isHovered
                          ? 'bg-yellow-300'
                          : 'bg-yellow-400'
                        : 'bg-neutral-200 dark:bg-neutral-800'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-3">
          {stats.monthlyStats.map((item) => (
            <div
              key={item.month}
              className="flex-1 text-center text-xs font-medium text-neutral-600 dark:text-neutral-400"
            >
              {item.month}
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 flex flex-col justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-neutral-950 dark:text-white">
            {t.adminPage.chartsCatTitle}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{t.adminPage.chartsCatSub}</p>

          <div className="mt-6 space-y-4">
            {stats.categoryStats.map((cat, idx) => {
              const pct = Math.round((cat.bookings / totalCategoryBookings) * 100);
              return (
                <div key={cat.category}>
                  <div className="flex items-baseline justify-between text-xs mb-1.5">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {translateCategory(cat.category as CarCategory)}
                    </span>
                    <span className="font-mono text-neutral-600 dark:text-neutral-400 tabular-nums">
                      {cat.bookings} ({pct}%) · {formatPrice(cat.revenue)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(4, pct)}%`,
                        backgroundColor: barColors[idx % barColors.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>{t.adminPage.chartsAvailRate}</span>
          <span className="font-mono font-semibold text-neutral-900 dark:text-white tabular-nums">
            {stats.availableCars} / {stats.totalCars} {t.adminPage.vehiclesCount}
          </span>
        </div>
      </div>
    </div>
  );
}
