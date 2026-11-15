import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  CalendarCheck2,
  Car as CarIcon,
  Check,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Moon,
  Plus,
  Search,
  Sun,
  Trash2,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { AdminCharts } from '../components/AdminCharts';
import { BrandMark } from '../components/Header';
import { VehicleImage } from '../components/VehicleImage';
import { usePreferences } from '../context/PreferencesContext';
import { STUDIO_CAR_PRESETS } from '../data/constants';
import { LANGUAGE_OPTIONS } from '../i18n/translations';
import { api } from '../services/api';
import type {
  AdminStats,
  Booking,
  BookingStatus,
  Car,
  CarCategory,
  ClientSummary,
  ContactMessage,
  FuelType,
  TransmissionType,
} from '../types';

interface AdminPageProps {
  onNavigate: (path: string) => void;
  onCarsMutated: () => void;
}

type AdminTab = 'overview' | 'cars' | 'bookings' | 'clients';

const EMPTY_CAR_FORM = {
  name: '',
  brand: '',
  model: '',
  year: 2025,
  category: 'Citadines' as CarCategory,
  pricePerDay: 350,
  seats: 5,
  doors: 5,
  transmission: 'Manuelle' as TransmissionType,
  fuel: 'Diesel' as FuelType,
  airConditioning: true,
  available: true,
  image: STUDIO_CAR_PRESETS[0].url as string,
  description: '',
  deposit: 4000,
};

export function AdminPage({ onNavigate, onCarsMutated }: AdminPageProps) {
  const { theme, toggleTheme, lang, setLang, t, formatPrice, translateCategory, translateTransmission, translateFuel, translateStatus } =
    usePreferences();

  const [authChecking, setAuthChecking] = useState(true);
  const [adminUser, setAdminUser] = useState<{ email: string; role: string } | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@bestcar.ma');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loadingData, setLoadingData] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [actionBanner, setActionBanner] = useState<string>('');

  // Cars modal state
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [carForm, setCarForm] = useState(EMPTY_CAR_FORM);
  const [savingCar, setSavingCar] = useState(false);

  // Bookings filters & inspect modal
  const [bookingFilter, setBookingFilter] = useState<'Toutes' | BookingStatus>('Toutes');
  const [bookingSearch, setBookingSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Clients inspect modal
  const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(null);

  const loadDashboardData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [statsRes, carsRes, bookingsRes, clientsRes, messagesRes] = await Promise.all([
        api.getAdminStats(),
        api.getCars(),
        api.getBookings(),
        api.getClients(),
        api.getMessages(),
      ]);
      setStats(statsRes);
      setCars(carsRes);
      setBookings(bookingsRes);
      setClients(clientsRes);
      setMessages(messagesRes);
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    api
      .checkAuth()
      .then((res) => {
        if (!mounted) return;
        if (res.authenticated && res.user) {
          setAdminUser(res.user);
          loadDashboardData();
        }
      })
      .finally(() => {
        if (mounted) setAuthChecking(false);
      });
    return () => {
      mounted = false;
    };
  }, [loadDashboardData]);

  const notify = (text: string) => {
    setActionBanner(text);
    setTimeout(() => setActionBanner(''), 3500);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await api.login(loginEmail.trim(), loginPassword);
      setAdminUser(res.user);
      setLoginPassword('');
      await loadDashboardData();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Échec de connexion.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setAdminUser(null);
    setStats(null);
  };

  // --- CAR ACTIONS ---
  const openAddCar = () => {
    setEditingCarId(null);
    setCarForm(EMPTY_CAR_FORM);
    setCarModalOpen(true);
  };

  const openEditCar = (car: Car) => {
    setEditingCarId(car.id);
    setCarForm({
      name: car.name,
      brand: car.brand,
      model: car.model,
      year: car.year,
      category: car.category,
      pricePerDay: car.pricePerDay,
      seats: car.seats,
      doors: car.doors,
      transmission: car.transmission,
      fuel: car.fuel,
      airConditioning: car.airConditioning,
      available: car.available,
      image: car.image,
      description: car.description,
      deposit: car.deposit,
    });
    setCarModalOpen(true);
  };

  const handleSaveCar = async (e: FormEvent) => {
    e.preventDefault();
    setSavingCar(true);
    try {
      if (editingCarId) {
        await api.updateCar(editingCarId, carForm);
        notify(`${carForm.name} ✓`);
      } else {
        await api.createCar(carForm);
        notify(`${carForm.name} ✓`);
      }
      setCarModalOpen(false);
      await loadDashboardData();
      onCarsMutated();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    } finally {
      setSavingCar(false);
    }
  };

  const handleToggleAvailability = async (car: Car) => {
    try {
      await api.updateCar(car.id, { available: !car.available });
      notify(`${car.name} — ${!car.available ? t.card.available : t.card.unavailable}`);
      await loadDashboardData();
      onCarsMutated();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    }
  };

  const handleDeleteCar = async (car: Car) => {
    try {
      await api.deleteCar(car.id);
      notify(`${car.name} ✓`);
      await loadDashboardData();
      onCarsMutated();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  };

  // --- BOOKING ACTIONS ---
  const handleStatusChange = async (bookingId: string, status: BookingStatus) => {
    try {
      const updated = await api.updateBookingStatus(bookingId, status);
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(updated);
      }
      notify(`${updated.reference} → ${translateStatus(status)}`);
      await loadDashboardData();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Impossible de modifier le statut.');
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    try {
      await api.deleteBooking(booking.id);
      if (selectedBooking?.id === booking.id) {
        setSelectedBooking(null);
      }
      notify(`${booking.reference} ✓`);
      await loadDashboardData();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  };

  const filteredBookings = useMemo(() => {
    const q = bookingSearch.trim().toLowerCase();
    return bookings.filter((b) => {
      if (bookingFilter !== 'Toutes' && b.status !== bookingFilter) return false;
      if (q) {
        const text = `${b.reference} ${b.customerName} ${b.customerEmail} ${b.carName}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, bookingFilter, bookingSearch]);

  const statusBadge = (status: BookingStatus) => {
    const label = translateStatus(status);
    switch (status) {
      case 'Confirmée':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{label}</span>
          </span>
        );
      case 'En attente':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{label}</span>
          </span>
        );
      case 'Refusée':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 dark:text-red-400">
            <XCircle className="w-3.5 h-3.5" />
            <span>{label}</span>
          </span>
        );
      case 'Terminée':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            <Check className="w-3.5 h-3.5" />
            <span>{label}</span>
          </span>
        );
    }
  };

  const quickControls = (
    <div className="flex items-center gap-2 shrink-0">
      <div className="inline-flex items-center bg-[#FEFCE8] dark:bg-neutral-900 border border-yellow-200 dark:border-neutral-800 rounded-lg p-0.5">
        {LANGUAGE_OPTIONS.map((opt) => (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLang(opt.code)}
            className={`px-2 py-1 text-[11px] font-bold rounded-md cursor-pointer transition-colors ${
              lang === opt.code
                ? 'bg-yellow-400 text-neutral-950'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            }`}
          >
            {opt.short}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? t.theme.toLight : t.theme.toDark}
        className="w-8 h-8 rounded-lg bg-[#FEFCE8] dark:bg-neutral-900 border border-yellow-200 dark:border-neutral-800 text-neutral-800 dark:text-yellow-400 flex items-center justify-center cursor-pointer"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </div>
  );

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#FEFCE8] dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{t.adminPage.checkingSession}</div>
      </div>
    );
  }

  // --- LOGIN SCREEN ---
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FEFCE8] via-white to-[#FEFCE8] dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex flex-col justify-center py-12 px-4 sm:px-6 transition-colors duration-200">
        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center justify-between mb-6 gap-2">
            <div className="inline-flex items-center gap-2.5 font-display text-xl font-bold text-neutral-950 dark:text-white">
              <BrandMark />
              <span>
                BEST <span className="bg-yellow-400 text-neutral-950 px-1.5 py-0.5 rounded">CAR</span>
              </span>
            </div>
            {quickControls}
          </div>

          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-yellow-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{t.adminPage.backToSite}</span>
            </button>
          </div>

          <div className="bg-white dark:bg-neutral-900 border-2 border-yellow-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-2.5 text-neutral-950 dark:text-white">
              <div className="w-9 h-9 rounded-lg bg-yellow-100 dark:bg-yellow-400/15 text-yellow-800 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-500/40 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold">{t.adminPage.loginTitle}</h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.adminPage.loginSub}</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                >
                  {t.adminPage.emailLabel}
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                >
                  {t.adminPage.passwordLabel}
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 px-3.5 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-medium text-red-700 dark:text-red-300">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full h-11 text-sm font-semibold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-500 transition-colors cursor-pointer"
              >
                {loggingIn ? t.adminPage.authenticating : t.adminPage.loginBtn}
              </button>
            </form>

            <div className="mt-6 p-3.5 rounded-lg bg-[#FEFCE8] dark:bg-neutral-950 border border-yellow-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
              <div className="font-semibold text-neutral-800 dark:text-yellow-400">{t.adminPage.demoTitle}</div>
              <div>
                {t.adminPage.demoEmail} <span className="font-mono text-neutral-900 dark:text-white">admin@bestcar.ma</span>
              </div>
              <div>
                {t.adminPage.demoPass} <span className="font-mono text-neutral-900 dark:text-white">BestCar2026!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#FEFCE8]/40 dark:bg-neutral-950 flex flex-col lg:flex-row transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-b lg:border-b-0 lg:border-e border-yellow-200 dark:border-neutral-800 shrink-0 flex flex-col justify-between">
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-yellow-200 dark:border-neutral-800 bg-[#FEFCE8] dark:bg-neutral-950">
            <div className="inline-flex items-center gap-2.5 font-display text-lg font-bold text-neutral-950 dark:text-white">
              <BrandMark />
              <span>
                BEST <span className="bg-yellow-400 text-neutral-950 px-1.5 py-0.5 rounded">CAR</span>
              </span>
            </div>
          </div>

          <nav className="p-4 space-y-1" aria-label={t.adminPage.breadcrumbAdmin}>
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-yellow-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-[#FEFCE8] dark:hover:bg-neutral-800 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>{t.adminPage.navOverview}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cars')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'cars'
                  ? 'bg-yellow-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-[#FEFCE8] dark:hover:bg-neutral-800 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <CarIcon className="w-4 h-4 shrink-0" />
              <span>{t.adminPage.navCars}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-yellow-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-[#FEFCE8] dark:hover:bg-neutral-800 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <span className="inline-flex items-center gap-3">
                <CalendarCheck2 className="w-4 h-4 shrink-0" />
                <span>{t.adminPage.navBookings}</span>
              </span>
              {stats && stats.pendingBookings > 0 && (
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-neutral-950 text-yellow-400 tabular-nums">
                  {stats.pendingBookings}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('clients')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-yellow-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-[#FEFCE8] dark:hover:bg-neutral-800 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>{t.adminPage.navClients}</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-yellow-200 dark:border-neutral-800 bg-[#FEFCE8]/60 dark:bg-neutral-950/60 space-y-2">
          <div className="px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400 truncate">{adminUser.email}</div>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-yellow-100 dark:hover:bg-neutral-800 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>{t.adminPage.viewPublicSite}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.adminPage.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-yellow-200 dark:border-neutral-800 px-6 flex items-center justify-between gap-4">
          <div className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
            <span>{t.adminPage.breadcrumbAdmin}</span>
            <span className="mx-2">/</span>
            <span className="font-semibold text-neutral-950 dark:text-white">
              {activeTab === 'overview' && t.adminPage.titleOverview}
              {activeTab === 'cars' && t.adminPage.titleCars}
              {activeTab === 'bookings' && t.adminPage.titleBookings}
              {activeTab === 'clients' && t.adminPage.titleClients}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {quickControls}
            <button
              type="button"
              onClick={openAddCar}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.adminPage.addCarBtn}</span>
            </button>
          </div>
        </header>

        <main className="p-6 lg:p-8 space-y-6 flex-1">
          {actionBanner && (
            <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-xs sm:text-sm font-medium text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
              <span>{actionBanner}</span>
              <button type="button" onClick={() => setActionBanner('')} className="text-emerald-700 dark:text-emerald-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {loadingData && !stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                  {/* 5 KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
                      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {t.adminPage.kpiTotalCars}
                      </div>
                      <div className="mt-2 font-mono text-2xl font-bold text-neutral-950 dark:text-white tabular-nums">
                        {stats.totalCars}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                        {stats.availableCars} {t.adminPage.kpiAvailable}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
                      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {t.adminPage.kpiBookings}
                      </div>
                      <div className="mt-2 font-mono text-2xl font-bold text-neutral-950 dark:text-white tabular-nums">
                        {stats.totalBookings}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{t.adminPage.kpiAllPeriods}</div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
                      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {t.adminPage.kpiPending}
                      </div>
                      <div className="mt-2 font-mono text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                        {stats.pendingBookings}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{t.adminPage.kpiToValidate}</div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
                      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {t.adminPage.kpiConfirmed}
                      </div>
                      <div className="mt-2 font-mono text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {stats.confirmedBookings}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{t.adminPage.kpiValidated}</div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-400/10 border border-yellow-300 dark:border-yellow-500/40 rounded-xl p-5">
                      <div className="text-xs font-medium text-yellow-900 dark:text-yellow-300">
                        {t.adminPage.kpiRevenue}
                      </div>
                      <div className="mt-2 font-mono text-2xl font-bold text-neutral-950 dark:text-yellow-400 tabular-nums">
                        {formatPrice(stats.estimatedRevenue)}
                      </div>
                      <div className="mt-1 text-xs text-yellow-800 dark:text-yellow-300/80">
                        {t.adminPage.kpiExclRejected}
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <AdminCharts stats={stats} />

                  {/* Recent Pending Bookings + Contact Messages */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                        <h3 className="font-display text-base font-bold text-neutral-950 dark:text-white">
                          {t.adminPage.recentBookings}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setActiveTab('bookings')}
                          className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 hover:underline cursor-pointer"
                        >
                          {t.adminPage.manageAll}
                        </button>
                      </div>
                      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {bookings.slice(0, 5).map((b) => (
                          <div key={b.id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-neutral-950 dark:text-white truncate">
                                {b.customerName} ·{' '}
                                <span className="text-neutral-600 dark:text-neutral-400 font-normal">{b.carName}</span>
                              </div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                                {b.reference} · {b.startDate} &rarr; {b.endDate} ({formatPrice(b.totalPrice)})
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {statusBadge(b.status)}
                              {b.status === 'En attente' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(b.id, 'Confirmée')}
                                  className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-700 cursor-pointer"
                                >
                                  {t.adminPage.confirm}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-yellow-700 dark:text-yellow-400" />
                        <h3 className="font-display text-base font-bold text-neutral-950 dark:text-white">
                          {t.adminPage.receivedMessages} ({messages.length})
                        </h3>
                      </div>
                      <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-80 overflow-y-auto">
                        {messages.length === 0 ? (
                          <p className="p-6 text-xs text-neutral-500 dark:text-neutral-400">{t.adminPage.noMessages}</p>
                        ) : (
                          messages.map((m) => (
                            <div key={m.id} className="p-5 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold text-neutral-950 dark:text-white">{m.name}</span>
                                <span className="text-[11px] text-neutral-400 tabular-nums">
                                  {m.createdAt.slice(0, 10)}
                                </span>
                              </div>
                              <div className="text-xs font-semibold text-yellow-800 dark:text-yellow-400">{m.subject}</div>
                              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">{m.message}</p>
                              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
                                {m.email} {m.phone ? `· ${m.phone}` : ''}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CARS MANAGEMENT TAB */}
              {activeTab === 'cars' && (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg font-bold text-neutral-950 dark:text-white">
                        {t.adminPage.fleetTitle} ({cars.length} {t.adminPage.vehiclesCount})
                      </h2>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.adminPage.fleetSub}</p>
                    </div>
                    <button
                      type="button"
                      onClick={openAddCar}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.adminPage.newVehicle}</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-start border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-[#F6F6F5] dark:bg-neutral-950 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                          <th className="py-3 px-4">{t.adminPage.colVehicle}</th>
                          <th className="py-3 px-4">{t.adminPage.colCategory}</th>
                          <th className="py-3 px-4">{t.adminPage.colSpecs}</th>
                          <th className="py-3 px-4 text-end">{t.adminPage.colPriceDay}</th>
                          <th className="py-3 px-4">{t.adminPage.colAvailability}</th>
                          <th className="py-3 px-4 text-end">{t.adminPage.colActions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
                        {cars.map((car) => (
                          <tr key={car.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-16 aspect-[4/3] rounded overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0">
                                  <VehicleImage src={car.image} alt={car.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <div className="font-semibold text-neutral-950 dark:text-white">{car.name}</div>
                                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {car.model} · {car.year}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                              {translateCategory(car.category)}
                            </td>
                            <td className="py-3 px-4 text-xs text-neutral-600 dark:text-neutral-400">
                              {translateTransmission(car.transmission)} · {translateFuel(car.fuel)} · {car.seats}{' '}
                              {t.card.seats}
                            </td>
                            <td className="py-3 px-4 text-end font-mono font-semibold text-neutral-950 dark:text-white tabular-nums">
                              {formatPrice(car.pricePerDay)}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => handleToggleAvailability(car)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                                  car.available
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                                }`}
                              >
                                {car.available ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{t.card.available}</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>{t.card.unavailable}</span>
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-end">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditCar(car)}
                                  title={t.adminPage.editCarTitle}
                                  className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCar(car)}
                                  className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* BOOKINGS MANAGEMENT TAB */}
              {activeTab === 'bookings' && (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(['Toutes', 'En attente', 'Confirmée', 'Refusée', 'Terminée'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setBookingFilter(status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            bookingFilter === status
                              ? 'bg-yellow-400 text-neutral-950'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          }`}
                        >
                          {status === 'Toutes' ? t.statuses.all : translateStatus(status)}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-neutral-400 absolute start-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        placeholder={t.adminPage.searchPlaceholder}
                        className="w-full h-9 ps-9 pe-3 text-xs bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-start border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-[#F6F6F5] dark:bg-neutral-950 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                          <th className="py-3 px-4">{t.adminPage.colRef}</th>
                          <th className="py-3 px-4">{t.adminPage.colClient}</th>
                          <th className="py-3 px-4">{t.adminPage.colVehicle}</th>
                          <th className="py-3 px-4">{t.adminPage.colPeriod}</th>
                          <th className="py-3 px-4 text-end">{t.adminPage.colAmount}</th>
                          <th className="py-3 px-4">{t.adminPage.colStatus}</th>
                          <th className="py-3 px-4 text-end">{t.adminPage.colActions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
                        {filteredBookings.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-10 text-center text-xs text-neutral-500 dark:text-neutral-400">
                              {t.adminPage.noBookingsFound}
                            </td>
                          </tr>
                        ) : (
                          filteredBookings.map((b) => (
                            <tr key={b.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                              <td className="py-3 px-4 font-mono text-xs font-semibold text-neutral-900 dark:text-yellow-400 tabular-nums">
                                {b.reference}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-neutral-950 dark:text-white">{b.customerName}</div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums" dir="ltr">
                                  {b.customerPhone}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                                {b.carName}
                              </td>
                              <td className="py-3 px-4 text-xs text-neutral-600 dark:text-neutral-400 tabular-nums">
                                <div>
                                  {b.startDate} &rarr; {b.endDate}
                                </div>
                                <div className="text-[11px] text-neutral-400">
                                  {b.days} {b.days > 1 ? t.bookingPage.days : t.bookingPage.day}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-end font-mono font-semibold text-neutral-950 dark:text-white tabular-nums">
                                {formatPrice(b.totalPrice)}
                              </td>
                              <td className="py-3 px-4">
                                <select
                                  aria-label={b.reference}
                                  value={b.status}
                                  onChange={(e) => handleStatusChange(b.id, e.target.value as BookingStatus)}
                                  className="h-8 px-2 text-xs font-semibold rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 dark:text-white focus:outline-none focus:border-yellow-500"
                                >
                                  <option value="En attente">{t.statuses['En attente']}</option>
                                  <option value="Confirmée">{t.statuses['Confirmée']}</option>
                                  <option value="Refusée">{t.statuses['Refusée']}</option>
                                  <option value="Terminée">{t.statuses['Terminée']}</option>
                                </select>
                              </td>
                              <td className="py-3 px-4 text-end">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedBooking(b)}
                                    className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  {b.status === 'En attente' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleStatusChange(b.id, 'Confirmée')}
                                        title={t.adminPage.confirm}
                                        className="p-2 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                                      >
                                        <CheckCircle2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleStatusChange(b.id, 'Refusée')}
                                        title={t.adminPage.reject}
                                        className="p-2 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBooking(b)}
                                    className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CLIENTS MANAGEMENT TAB */}
              {activeTab === 'clients' && (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                    <h2 className="font-display text-lg font-bold text-neutral-950 dark:text-white">
                      {t.adminPage.clientsTitle} ({clients.length})
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.adminPage.clientsSub}</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-start border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-[#F6F6F5] dark:bg-neutral-950 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                          <th className="py-3 px-4">{t.adminPage.colClient}</th>
                          <th className="py-3 px-4">E-mail</th>
                          <th className="py-3 px-4">{t.adminPage.colPhone}</th>
                          <th className="py-3 px-4 text-end">{t.adminPage.navBookings}</th>
                          <th className="py-3 px-4 text-end">{t.adminPage.colTotalVolume}</th>
                          <th className="py-3 px-4 text-end">{t.adminPage.colHistory}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
                        {clients.map((c) => (
                          <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                            <td className="py-3 px-4 font-semibold text-neutral-950 dark:text-white">{c.name}</td>
                            <td className="py-3 px-4 text-xs text-neutral-600 dark:text-neutral-400">{c.email}</td>
                            <td className="py-3 px-4 text-xs text-neutral-600 dark:text-neutral-400 tabular-nums" dir="ltr">
                              {c.phone}
                            </td>
                            <td className="py-3 px-4 text-end font-mono text-xs dark:text-neutral-300 tabular-nums">
                              {c.totalBookings} ({c.confirmedBookings})
                            </td>
                            <td className="py-3 px-4 text-end font-mono font-semibold text-neutral-950 dark:text-white tabular-nums">
                              {formatPrice(c.totalSpent)}
                            </td>
                            <td className="py-3 px-4 text-end">
                              <button
                                type="button"
                                onClick={() => setSelectedClient(c)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{t.adminPage.viewFolder}</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ADD / EDIT CAR MODAL */}
      {carModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="font-display text-xl font-bold text-neutral-950 dark:text-white">
                {editingCarId ? t.adminPage.editCarTitle : t.adminPage.addCarTitle}
              </h2>
              <button
                type="button"
                onClick={() => setCarModalOpen(false)}
                className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCar} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {t.adminPage.colVehicle} *
                  </label>
                  <input
                    type="text"
                    required
                    value={carForm.name}
                    onChange={(e) => setCarForm({ ...carForm, name: e.target.value })}
                    placeholder="Renault Mégane 4"
                    className="w-full h-10 px-3 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {t.adminPage.colCategory} *
                  </label>
                  <select
                    value={carForm.category}
                    onChange={(e) => setCarForm({ ...carForm, category: e.target.value as CarCategory })}
                    className="w-full h-10 px-3 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                  >
                    <option value="Citadines">{t.categories.Citadines}</option>
                    <option value="Berlines">{t.categories.Berlines}</option>
                    <option value="SUV">{t.categories.SUV}</option>
                    <option value="Voitures de luxe">{t.categories['Voitures de luxe']}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {t.adminPage.colPriceDay} ({t.currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={carForm.pricePerDay}
                    onChange={(e) => setCarForm({ ...carForm, pricePerDay: Number(e.target.value) })}
                    className="w-full h-10 px-3 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {t.detailPage.deposit} ({t.currency})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={carForm.deposit}
                    onChange={(e) => setCarForm({ ...carForm, deposit: Number(e.target.value) })}
                    className="w-full h-10 px-3 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {t.detailPage.transmission}
                  </label>
                  <select
                    value={carForm.transmission}
                    onChange={(e) => setCarForm({ ...carForm, transmission: e.target.value as TransmissionType })}
                    className="w-full h-10 px-3 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                  >
                    <option value="Manuelle">{t.transmissions.Manuelle}</option>
                    <option value="Automatique">{t.transmissions.Automatique}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {t.detailPage.fuel}
                  </label>
                  <select
                    value={carForm.fuel}
                    onChange={(e) => setCarForm({ ...carForm, fuel: e.target.value as FuelType })}
                    className="w-full h-10 px-3 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                  >
                    <option value="Diesel">{t.fuels.Diesel}</option>
                    <option value="Essence">{t.fuels.Essence}</option>
                    <option value="Hybride">{t.fuels.Hybride}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {t.detailPage.seats}
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={9}
                    value={carForm.seats}
                    onChange={(e) => setCarForm({ ...carForm, seats: Number(e.target.value) })}
                    className="w-full h-10 px-3 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {t.detailPage.doors}
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={5}
                    value={carForm.doors}
                    onChange={(e) => setCarForm({ ...carForm, doors: Number(e.target.value) })}
                    className="w-full h-10 px-3 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg tabular-nums"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Photo URL / Studio BEST CAR
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={STUDIO_CAR_PRESETS.some((p) => p.url === carForm.image) ? carForm.image : ''}
                      onChange={(e) => {
                        if (e.target.value) setCarForm({ ...carForm, image: e.target.value });
                      }}
                      className="h-10 px-3 text-xs bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg"
                    >
                      <option value="">Studio BEST CAR...</option>
                      {STUDIO_CAR_PRESETS.map((preset) => (
                        <option key={preset.url} value={preset.url}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={carForm.image}
                      onChange={(e) => setCarForm({ ...carForm, image: e.target.value })}
                      placeholder="/src/assets/images/..."
                      className="h-10 px-3 text-xs bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={carForm.description}
                    onChange={(e) => setCarForm({ ...carForm, description: e.target.value })}
                    className="w-full p-3 text-sm bg-white dark:bg-neutral-950 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-6 pt-1">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={carForm.available}
                      onChange={(e) => setCarForm({ ...carForm, available: e.target.checked })}
                      className="w-4 h-4 accent-yellow-500"
                    />
                    <span>{t.card.available}</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={carForm.airConditioning}
                      onChange={(e) => setCarForm({ ...carForm, airConditioning: e.target.checked })}
                      className="w-4 h-4 accent-yellow-500"
                    />
                    <span>{t.detailPage.ac}</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCarModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                >
                  {t.adminPage.cancel}
                </button>
                <button
                  type="submit"
                  disabled={savingCar}
                  className="px-5 py-2.5 text-xs font-semibold text-neutral-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 disabled:bg-neutral-200 disabled:text-neutral-500 cursor-pointer"
                >
                  {savingCar
                    ? t.adminPage.saving
                    : editingCarId
                      ? t.adminPage.saveChanges
                      : t.adminPage.addVehicleSubmit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <div className="font-mono text-xs font-semibold text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded inline-block mb-1">
                  {selectedBooking.reference}
                </div>
                <h2 className="font-display text-lg font-bold text-neutral-950 dark:text-white">
                  {t.adminPage.bookingDetailsTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">{t.adminPage.colClient}</span>
                <span className="font-semibold text-neutral-950 dark:text-white">{selectedBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">E-mail</span>
                <span className="text-neutral-900 dark:text-neutral-200">{selectedBooking.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">{t.adminPage.colPhone}</span>
                <span className="text-neutral-900 dark:text-neutral-200 tabular-nums" dir="ltr">
                  {selectedBooking.customerPhone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">{t.adminPage.colVehicle}</span>
                <span className="font-semibold text-neutral-950 dark:text-white">{selectedBooking.carName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500 dark:text-neutral-400">{t.bookingPage.pickupLoc}</span>
                <span className="text-end text-neutral-900 dark:text-neutral-200">{selectedBooking.pickupLocation}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500 dark:text-neutral-400">{t.bookingPage.returnLoc}</span>
                <span className="text-end text-neutral-900 dark:text-neutral-200">{selectedBooking.returnLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">{t.adminPage.colPeriod}</span>
                <span className="tabular-nums text-neutral-900 dark:text-neutral-200">
                  {selectedBooking.startDate} ({selectedBooking.startTime}) &rarr; {selectedBooking.endDate} (
                  {selectedBooking.endTime})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">
                  {t.adminPage.colAmount} ({selectedBooking.days})
                </span>
                <span className="font-mono font-bold text-neutral-950 bg-yellow-300 px-2 py-0.5 rounded tabular-nums">
                  {formatPrice(selectedBooking.totalPrice)}
                </span>
              </div>
              {selectedBooking.message && (
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 bg-[#F6F6F5] dark:bg-neutral-950 p-3 rounded-lg">
                    {selectedBooking.message}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap justify-between gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedBooking.id, 'Confirmée')}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 cursor-pointer"
                >
                  {t.adminPage.confirm}
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedBooking.id, 'Refusée')}
                  className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer"
                >
                  {t.adminPage.reject}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 cursor-pointer"
              >
                {t.adminPage.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT HISTORY MODAL */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h2 className="font-display text-lg font-bold text-neutral-950 dark:text-white">
                  {selectedClient.name}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {selectedClient.email} · <span dir="ltr">{selectedClient.phone}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-[#F6F6F5] dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">{t.adminPage.navBookings}</div>
                <div className="font-mono text-lg font-bold text-neutral-950 dark:text-white tabular-nums">
                  {selectedClient.totalBookings}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#F6F6F5] dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">{t.statuses['Confirmée']}</div>
                <div className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {selectedClient.confirmedBookings}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#FEFCE8] dark:bg-yellow-400/10 border border-yellow-300 dark:border-yellow-500/40">
                <div className="text-xs text-yellow-900 dark:text-yellow-300">{t.adminPage.colTotalVolume}</div>
                <div className="font-mono text-lg font-bold text-neutral-950 dark:text-yellow-400 tabular-nums">
                  {formatPrice(selectedClient.totalSpent)}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-3">
                {t.adminPage.historyTitle}
              </h3>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                {selectedClient.bookings.map((b) => (
                  <div key={b.id} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="font-semibold text-neutral-950 dark:text-white">
                        {b.carName} <span className="font-mono text-neutral-500">({b.reference})</span>
                      </div>
                      <div className="text-neutral-500 dark:text-neutral-400 mt-0.5 tabular-nums">
                        {b.startDate} &rarr; {b.endDate} · {b.days}{' '}
                        {b.days > 1 ? t.bookingPage.days : t.bookingPage.day}
                      </div>
                    </div>
                    <div className="text-end shrink-0">
                      <div className="font-mono font-bold text-neutral-950 dark:text-white tabular-nums">
                        {formatPrice(b.totalPrice)}
                      </div>
                      <div className="mt-0.5">{statusBadge(b.status)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
