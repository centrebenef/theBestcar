export type CarCategory = 'Citadines' | 'Berlines' | 'SUV' | 'Voitures de luxe';

export type TransmissionType = 'Manuelle' | 'Automatique';

export type FuelType = 'Essence' | 'Diesel' | 'Hybride';

export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: CarCategory;
  pricePerDay: number;
  seats: number;
  doors: number;
  transmission: TransmissionType;
  fuel: FuelType;
  airConditioning: boolean;
  available: boolean;
  image: string;
  gallery: string[];
  description: string;
  features: string[];
  deposit: number;
}

export type BookingStatus = 'En attente' | 'Confirmée' | 'Refusée' | 'Terminée';

export interface Booking {
  id: string;
  reference: string;
  carId: string;
  carName: string;
  carCategory: CarCategory;
  carImage: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupLocation: string;
  returnLocation: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  days: number;
  pricePerDay: number;
  totalPrice: number;
  message: string;
  status: BookingStatus;
  createdAt: string;
}

export interface ClientSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  confirmedBookings: number;
  totalSpent: number;
  lastBookingDate: string;
  bookings: Booking[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface AdminStats {
  totalCars: number;
  availableCars: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  estimatedRevenue: number;
  monthlyStats: {
    month: string;
    bookings: number;
    revenue: number;
  }[];
  categoryStats: {
    category: CarCategory;
    bookings: number;
    revenue: number;
  }[];
}

export interface SearchPrefill {
  pickupLocation: string;
  returnLocation: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}
