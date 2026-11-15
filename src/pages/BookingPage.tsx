import { useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react';
import { VehicleImage } from '../components/VehicleImage';
import { buildWhatsAppUrl } from '../components/WhatsAppButton';
import { usePreferences } from '../context/PreferencesContext';
import { CASABLANCA_LOCATIONS } from '../data/constants';
import { api } from '../services/api';
import type { Booking, Car, SearchPrefill } from '../types';

interface BookingPageProps {
  cars: Car[];
  selectedCarId: string;
  searchPrefill: SearchPrefill;
  onNavigate: (path: string) => void;
}

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
];

export function BookingPage({ cars, selectedCarId, searchPrefill, onNavigate }: BookingPageProps) {
  const { t, formatPrice, translateCategory, translateTransmission, translateFuel } = usePreferences();

  const availableCars = useMemo(() => cars.filter((c) => c.available), [cars]);
  const defaultCar =
    availableCars.find((c) => c.id === selectedCarId)?.id || availableCars[0]?.id || cars[0]?.id || '';

  const initPickupIdx = Math.max(
    0,
    CASABLANCA_LOCATIONS.findIndex((loc) => loc === searchPrefill.pickupLocation),
  );
  const initReturnIdx = Math.max(
    0,
    CASABLANCA_LOCATIONS.findIndex((loc) => loc === searchPrefill.returnLocation),
  );

  const [carId, setCarId] = useState(defaultCar);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupIdx, setPickupIdx] = useState(initPickupIdx);
  const [returnIdx, setReturnIdx] = useState(initReturnIdx);
  const [startDate, setStartDate] = useState(searchPrefill.startDate);
  const [startTime, setStartTime] = useState(searchPrefill.startTime);
  const [endDate, setEndDate] = useState(searchPrefill.endDate);
  const [endTime, setEndTime] = useState(searchPrefill.endTime);
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const selectedCar = useMemo(() => cars.find((c) => c.id === carId), [cars, carId]);

  const rentalDays = useMemo(() => {
    const start = new Date(`${startDate}T00:00:00Z`).getTime();
    const end = new Date(`${endDate}T00:00:00Z`).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) return 1;
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  }, [startDate, endDate]);

  const estimatedTotal = (selectedCar?.pricePerDay || 0) * rentalDays;
  const pickupLocationLabel = t.locations[pickupIdx] || t.locations[0];
  const returnLocationLabel = t.locations[returnIdx] || t.locations[0];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!carId) {
      setError(t.bookingPage.errNoCar);
      return;
    }
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setError(t.bookingPage.errMissingInfo);
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError(t.bookingPage.errDates);
      return;
    }

    setSubmitting(true);
    try {
      const booking = await api.createBooking({
        carId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        pickupLocation: CASABLANCA_LOCATIONS[pickupIdx] || CASABLANCA_LOCATIONS[0],
        returnLocation: CASABLANCA_LOCATIONS[returnIdx] || CASABLANCA_LOCATIONS[0],
        startDate,
        startTime,
        endDate,
        endTime,
        message: message.trim(),
      });
      setConfirmedBooking(booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la réservation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedBooking) {
    const whatsappText = [
      `BEST CAR Casablanca — ${confirmedBooking.reference}`,
      `- ${t.bookingPage.vehicle}: ${confirmedBooking.carName}`,
      `- ${confirmedBooking.customerName} (${confirmedBooking.customerPhone})`,
      `- ${confirmedBooking.startDate} ${confirmedBooking.startTime} -> ${confirmedBooking.endDate} ${confirmedBooking.endTime}`,
      `- ${pickupLocationLabel} -> ${returnLocationLabel}`,
      `- ${confirmedBooking.days} ${confirmedBooking.days > 1 ? t.bookingPage.days : t.bookingPage.day} · ${formatPrice(confirmedBooking.totalPrice)}`,
    ].join('\n');

    return (
      <div className="bg-white dark:bg-neutral-950 py-14 lg:py-20 transition-colors duration-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-10 shadow-sm">
            <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-8 h-8 shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">{t.bookingPage.savedEyebrow}</p>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white">
                  {t.bookingPage.savedTitle}
                </h1>
              </div>
            </div>

            <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {t.bookingPage.savedThanks}{' '}
              <span className="font-semibold text-neutral-900 dark:text-white">{confirmedBooking.customerName}</span>.{' '}
              {t.bookingPage.savedRefDesc}{' '}
              <span className="font-mono font-semibold text-yellow-700 dark:text-yellow-400">
                {confirmedBooking.reference}
              </span>
              .
            </p>

            <div className="mt-6 bg-[#FEFCE8] dark:bg-neutral-950 border border-yellow-200 dark:border-neutral-800 rounded-xl p-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500 dark:text-neutral-400">{t.bookingPage.vehicle}</span>
                <span className="font-semibold text-neutral-950 dark:text-white">{confirmedBooking.carName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500 dark:text-neutral-400">{t.bookingPage.departure}</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-200 tabular-nums">
                  {confirmedBooking.startDate} {t.bookingPage.at} {confirmedBooking.startTime}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500 dark:text-neutral-400">{t.bookingPage.returnLabel}</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-200 tabular-nums">
                  {confirmedBooking.endDate} {t.bookingPage.at} {confirmedBooking.endTime}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500 dark:text-neutral-400">{t.bookingPage.pickupLoc}</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-200 text-end">{pickupLocationLabel}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500 dark:text-neutral-400">{t.bookingPage.returnLoc}</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-200 text-end">{returnLocationLabel}</span>
              </div>
              <div className="pt-3 border-t border-yellow-200 dark:border-neutral-800 flex justify-between items-baseline">
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {t.bookingPage.totalEstimated} ({confirmedBooking.days}{' '}
                  {confirmedBooking.days > 1 ? t.bookingPage.days : t.bookingPage.day})
                </span>
                <span className="font-mono text-xl font-bold text-neutral-950 dark:text-yellow-400 tabular-nums">
                  {formatPrice(confirmedBooking.totalPrice)}
                </span>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={buildWhatsAppUrl(whatsappText)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#16A34A] rounded-lg hover:bg-[#15803D] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.bookingPage.sendWaBtn}</span>
              </a>

              <button
                type="button"
                onClick={() => onNavigate('/voitures')}
                className="px-5 py-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                {t.detailPage.backCatalog}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-950 transition-colors duration-200">
      <section className="bg-[#FEFCE8] dark:bg-neutral-900 text-neutral-950 dark:text-white py-12 border-b border-yellow-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-wider">
            {t.bookingPage.eyebrow}
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">{t.bookingPage.title}</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 max-w-2xl">{t.bookingPage.subtitle}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 space-y-6"
          >
            <div>
              <h2 className="font-display text-xl font-bold text-neutral-950 dark:text-white">
                {t.bookingPage.step1}
              </h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="bk-name"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    {t.bookingPage.fullName}
                  </label>
                  <input
                    id="bk-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={t.bookingPage.fullNamePh}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bk-email"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    {t.bookingPage.email}
                  </label>
                  <input
                    id="bk-email"
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder={t.bookingPage.emailPh}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bk-phone"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    {t.bookingPage.phone}
                  </label>
                  <input
                    id="bk-phone"
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+212 6 00 00 00 00"
                    dir="ltr"
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500 tabular-nums"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <h2 className="font-display text-xl font-bold text-neutral-950 dark:text-white">
                {t.bookingPage.step2}
              </h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="bk-car"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    {t.bookingPage.selectedCar}
                  </label>
                  <select
                    id="bk-car"
                    value={carId}
                    onChange={(e) => setCarId(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                  >
                    {cars.map((c) => (
                      <option key={c.id} value={c.id} disabled={!c.available}>
                        {c.name} ({translateCategory(c.category)}) — {formatPrice(c.pricePerDay)}
                        {t.card.perDay} {!c.available ? `— ${t.card.unavailable}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="bk-start-date"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    {t.bookingPage.startDate}
                  </label>
                  <input
                    id="bk-start-date"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500 tabular-nums"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bk-start-time"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    {t.bookingPage.startTime}
                  </label>
                  <select
                    id="bk-start-time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500 tabular-nums"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="bk-end-date"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    {t.bookingPage.endDate}
                  </label>
                  <input
                    id="bk-end-date"
                    type="date"
                    required
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500 tabular-nums"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bk-end-time"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    {t.bookingPage.endTime}
                  </label>
                  <select
                    id="bk-end-time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500 tabular-nums"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="bk-pickup"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    {t.bookingPage.pickupLoc}
                  </label>
                  <select
                    id="bk-pickup"
                    value={pickupIdx}
                    onChange={(e) => setPickupIdx(Number(e.target.value))}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                  >
                    {t.locations.map((loc, idx) => (
                      <option key={loc} value={idx}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="bk-return"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    {t.bookingPage.returnLoc}
                  </label>
                  <select
                    id="bk-return"
                    value={returnIdx}
                    onChange={(e) => setReturnIdx(Number(e.target.value))}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                  >
                    {t.locations.map((loc, idx) => (
                      <option key={loc} value={idx}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="bk-message"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    {t.bookingPage.messageLabel}
                  </label>
                  <textarea
                    id="bk-message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.bookingPage.messagePh}
                    className="w-full p-3.5 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting || !selectedCar?.available}
                className="px-6 py-3.5 text-sm font-bold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {submitting ? t.bookingPage.submitting : t.bookingPage.confirmBtn}
              </button>

              {selectedCar && (
                <a
                  href={buildWhatsAppUrl(
                    `BEST CAR Casablanca — ${selectedCar.name} (${startDate} -> ${endDate}, ${rentalDays} ${
                      rentalDays > 1 ? t.bookingPage.days : t.bookingPage.day
                    } · ${formatPrice(estimatedTotal)})`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#16A34A]" />
                  <span>{t.bookingPage.waAskBtn}</span>
                </a>
              )}
            </div>
          </form>

          {/* Sticky Calculation Summary */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-[#FEFCE8] dark:bg-neutral-900 border border-yellow-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-neutral-950 dark:text-white">
                {t.bookingPage.summaryTitle}
              </h2>

              {selectedCar ? (
                <>
                  <div className="mt-4 flex items-center gap-4 pb-5 border-b border-yellow-200 dark:border-neutral-800">
                    <div className="w-24 aspect-[4/3] rounded-lg overflow-hidden bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0">
                      <VehicleImage
                        src={selectedCar.image}
                        alt={selectedCar.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-yellow-800 dark:text-yellow-400">
                        {translateCategory(selectedCar.category)}
                      </div>
                      <div className="font-display text-lg font-bold text-neutral-950 dark:text-white">
                        {selectedCar.name}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                        {translateTransmission(selectedCar.transmission)} · {translateFuel(selectedCar.fuel)} ·{' '}
                        {selectedCar.seats} {t.card.seats}
                      </div>
                    </div>
                  </div>

                  <dl className="mt-5 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">{t.bookingPage.dailyPrice}</dt>
                      <dd className="font-mono font-semibold text-neutral-950 dark:text-white tabular-nums">
                        {formatPrice(selectedCar.pricePerDay)} {t.card.perDay}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">{t.bookingPage.duration}</dt>
                      <dd className="font-mono font-semibold text-neutral-950 dark:text-white tabular-nums">
                        {rentalDays} {rentalDays > 1 ? t.bookingPage.days : t.bookingPage.day}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">{t.bookingPage.insurance}</dt>
                      <dd className="font-medium text-emerald-700 dark:text-emerald-400">{t.bookingPage.included}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">{t.bookingPage.deposit}</dt>
                      <dd className="font-mono text-neutral-700 dark:text-neutral-300 tabular-nums">
                        {formatPrice(selectedCar.deposit)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6 pt-5 border-t border-yellow-200 dark:border-neutral-800 flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-neutral-950 dark:text-white">
                      {t.bookingPage.totalEstimated}
                    </span>
                    <span className="font-mono text-2xl font-bold text-neutral-950 bg-yellow-400 px-2.5 py-1 rounded-lg tabular-nums">
                      {formatPrice(estimatedTotal)}
                    </span>
                  </div>

                  <div className="mt-5 flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    <ShieldCheck className="w-4 h-4 text-yellow-700 dark:text-yellow-400 shrink-0 mt-0.5" />
                    <span>{t.bookingPage.paymentNote}</span>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">{t.bookingPage.selectPrompt}</p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
