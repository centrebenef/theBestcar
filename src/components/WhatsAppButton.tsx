import { MessageCircle } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { AGENCY_INFO } from '../data/constants';

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${AGENCY_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function FloatingWhatsAppButton() {
  const { t } = usePreferences();

  return (
    <a
      href={buildWhatsAppUrl(t.whatsapp.defaultMsg)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsapp.aria}
      className="fixed bottom-5 end-5 z-30 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#16A34A] text-white text-xs font-semibold shadow-lg hover:bg-[#15803D] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A]"
    >
      <MessageCircle className="w-4 h-4 shrink-0" />
      <span className="hidden sm:inline whitespace-nowrap">{t.whatsapp.label}</span>
    </a>
  );
}
