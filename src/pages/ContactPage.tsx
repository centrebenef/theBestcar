import { useState, type FormEvent } from 'react';
import { CheckCircle2, Clock, ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { buildWhatsAppUrl } from '../components/WhatsAppButton';
import { usePreferences } from '../context/PreferencesContext';
import { AGENCY_INFO } from '../data/constants';
import { api } from '../services/api';

export function ContactPage() {
  const { t } = usePreferences();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const [selectedZoneIndex, setSelectedZoneIndex] = useState(0);
  const selectedZone = t.contactPage.mapZones[selectedZoneIndex] || t.contactPage.mapZones[0];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: t.contactPage.subjects[subjectIndex] || t.contactPage.subjects[0],
        message: message.trim(),
      });
      setSent(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’envoi du message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-950 transition-colors duration-200">
      <section className="bg-[#FEFCE8] dark:bg-neutral-900 text-neutral-950 dark:text-white py-14 border-b border-yellow-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-wider">
            {t.contactPage.eyebrow}
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">{t.contactPage.title}</h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 max-w-2xl">
            {t.contactPage.subtitle}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Contact Details + Map */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FEFCE8] dark:bg-neutral-900 border border-yellow-200 dark:border-neutral-800 rounded-xl p-6 space-y-5">
              <h2 className="font-display text-lg font-bold text-neutral-950 dark:text-white">
                {t.contactPage.detailsTitle}
              </h2>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-yellow-700 dark:text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    {t.contactPage.addressLabel}
                  </div>
                  <div className="text-sm font-bold text-neutral-950 dark:text-white">{t.address}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-yellow-700 dark:text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    {t.contactPage.phoneLabel}
                  </div>
                  <div className="text-sm font-semibold text-neutral-950 dark:text-white tabular-nums" dir="ltr">
                    {AGENCY_INFO.phoneDisplay}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">{t.phoneNote}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-yellow-700 dark:text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    {t.contactPage.emailLabel}
                  </div>
                  <a
                    href={`mailto:${AGENCY_INFO.email}`}
                    className="text-sm font-semibold text-neutral-950 dark:text-white hover:text-yellow-700 dark:hover:text-yellow-400 transition-colors"
                  >
                    {AGENCY_INFO.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-700 dark:text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    {t.contactPage.hoursLabel}
                  </div>
                  <div className="text-sm text-neutral-700 dark:text-neutral-300">{t.hours}</div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={buildWhatsAppUrl(t.whatsapp.defaultMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#16A34A] rounded-lg hover:bg-[#15803D] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.contactPage.whatsappBtn}</span>
                </a>
              </div>
            </div>

            {/* Map centered on 45 Avenue 2 Mars, Casablanca */}
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
              <div className="p-4 border-b border-yellow-200 dark:border-neutral-800 bg-[#FEFCE8] dark:bg-neutral-900">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="text-xs font-bold text-neutral-800 dark:text-yellow-400">
                    {t.contactPage.mapTitle}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {t.contactPage.mapZones.map((zone, idx) => (
                    <button
                      key={zone.label}
                      type="button"
                      onClick={() => setSelectedZoneIndex(idx)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        selectedZoneIndex === idx
                          ? 'bg-yellow-400 text-neutral-950'
                          : 'bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-yellow-400'
                      }`}
                    >
                      {zone.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="aspect-[4/3] w-full bg-neutral-100 dark:bg-neutral-800 relative">
                <iframe
                  title="BEST CAR — 45 Avenue 2 Mars, Casablanca"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedZone.query)}&t=&z=${selectedZone.zoom}&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="px-4 py-3 bg-[#FEFCE8] dark:bg-neutral-950 border-t border-yellow-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  <MapPin className="w-4 h-4 text-yellow-700 dark:text-yellow-400 shrink-0" />
                  <span>BEST CAR · {t.addressShort}</span>
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
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-neutral-950 dark:text-white">
              {t.contactPage.formTitle}
            </h2>
            <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">{t.contactPage.formSubtitle}</p>

            {sent && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-900 dark:text-emerald-200">
                  <p className="font-semibold">{t.contactPage.sentTitle}</p>
                  <p className="mt-0.5 text-emerald-800 dark:text-emerald-300">{t.contactPage.sentDesc}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="ct-name"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    {t.contactPage.nameLabel}
                  </label>
                  <input
                    id="ct-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.contactPage.namePh}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ct-phone"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    {t.contactPage.phoneInputLabel}
                  </label>
                  <input
                    id="ct-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+212 6 00 00 00 00"
                    dir="ltr"
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500 tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="ct-email"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    {t.contactPage.emailInputLabel}
                  </label>
                  <input
                    id="ct-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.contactPage.emailPh}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ct-subject"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                  >
                    {t.contactPage.subjectLabel}
                  </label>
                  <select
                    id="ct-subject"
                    value={subjectIndex}
                    onChange={(e) => setSubjectIndex(Number(e.target.value))}
                    className="w-full h-11 px-3.5 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                  >
                    {t.contactPage.subjects.map((subj, idx) => (
                      <option key={subj} value={idx}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="ct-message"
                  className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                >
                  {t.contactPage.messageLabel}
                </label>
                <textarea
                  id="ct-message"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.contactPage.messagePh}
                  className="w-full p-3.5 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-medium text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3.5 text-sm font-bold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 transition-colors cursor-pointer"
              >
                {submitting ? t.contactPage.sending : t.contactPage.sendBtn}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
