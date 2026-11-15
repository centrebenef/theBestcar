import { useCallback, useEffect, useState } from 'react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { FloatingWhatsAppButton } from './components/WhatsAppButton';
import { CASABLANCA_LOCATIONS } from './data/constants';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { BookingPage } from './pages/BookingPage';
import { CarDetailPage } from './pages/CarDetailPage';
import { CarsPage } from './pages/CarsPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { api } from './services/api';
import type { Car, SearchPrefill } from './types';

function getTodayIso(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export default function App() {
  const [route, setRoute] = useState<string>(() => window.location.pathname + window.location.search);
  const [cars, setCars] = useState<Car[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [hasActiveSearch, setHasActiveSearch] = useState(false);

  const [searchPrefill, setSearchPrefill] = useState<SearchPrefill>(() => ({
    pickupLocation: CASABLANCA_LOCATIONS[0],
    returnLocation: CASABLANCA_LOCATIONS[0],
    startDate: getTodayIso(1),
    startTime: '10:00',
    endDate: getTodayIso(4),
    endTime: '10:00',
  }));

  const fetchCars = useCallback(async () => {
    setLoadingCars(true);
    try {
      const list = await api.getCars();
      setCars(list);
    } catch (err) {
      console.error('Failed to fetch cars:', err);
    } finally {
      setLoadingCars(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  useEffect(() => {
    const onPopState = () => {
      setRoute(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((path: string) => {
    if (window.location.pathname + window.location.search !== path) {
      window.history.pushState({}, '', path);
      setRoute(path);
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const handleBookCar = useCallback(
    (carId: string) => {
      setSelectedCarId(carId);
      navigate('/reserver');
    },
    [navigate],
  );

  const handleSearchSubmit = useCallback(
    (prefill: SearchPrefill) => {
      setSearchPrefill(prefill);
      setHasActiveSearch(true);
      navigate('/voitures');
    },
    [navigate],
  );

  const [pathname, searchStr] = route.split('?');
  const queryParams = new URLSearchParams(searchStr || '');
  const initialCategory = queryParams.get('categorie') || undefined;

  if (pathname === '/admin') {
    return <AdminPage onNavigate={navigate} onCarsMutated={fetchCars} />;
  }

  const renderPage = () => {
    if (pathname === '/' || pathname === '') {
      return (
        <HomePage
          cars={cars}
          loading={loadingCars}
          searchPrefill={searchPrefill}
          onSearchSubmit={handleSearchSubmit}
          onNavigate={navigate}
          onBookCar={handleBookCar}
        />
      );
    }

    if (pathname === '/voitures') {
      return (
        <CarsPage
          key={initialCategory || 'all'}
          cars={cars}
          loading={loadingCars}
          initialCategory={initialCategory}
          searchPrefill={searchPrefill}
          hasActiveSearch={hasActiveSearch}
          onNavigate={navigate}
          onBookCar={handleBookCar}
        />
      );
    }

    if (pathname.startsWith('/voitures/')) {
      const carId = decodeURIComponent(pathname.replace('/voitures/', ''));
      const car = cars.find((c) => c.id === carId);
      return (
        <CarDetailPage
          car={car}
          loading={loadingCars}
          onNavigate={navigate}
          onBookCar={handleBookCar}
        />
      );
    }

    if (pathname === '/reserver') {
      return (
        <BookingPage
          cars={cars}
          selectedCarId={selectedCarId}
          searchPrefill={searchPrefill}
          onNavigate={navigate}
        />
      );
    }

    if (pathname === '/services') {
      return <ServicesPage onNavigate={navigate} />;
    }

    if (pathname === '/a-propos') {
      return <AboutPage onNavigate={navigate} />;
    }

    if (pathname === '/contact') {
      return <ContactPage />;
    }

    return (
      <HomePage
        cars={cars}
        loading={loadingCars}
        searchPrefill={searchPrefill}
        onSearchSubmit={handleSearchSubmit}
        onNavigate={navigate}
        onBookCar={handleBookCar}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors duration-200">
      <Header currentPath={pathname} onNavigate={navigate} />
      <main className="flex-1">{renderPage()}</main>
      <Footer onNavigate={navigate} />
      <FloatingWhatsAppButton />
    </div>
  );
}
