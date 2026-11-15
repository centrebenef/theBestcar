import type {
  AdminStats,
  Booking,
  BookingStatus,
  Car,
  ClientSummary,
  ContactMessage,
} from '../types';

let memoryToken: string | null = null;

export function setMemoryAuthToken(token: string | null): void {
  memoryToken = token;
  if (token) {
    sessionStorage.setItem('bestcar_admin_token', token);
  } else {
    sessionStorage.removeItem('bestcar_admin_token');
  }
}

export function getMemoryAuthToken(): string | null {
  if (memoryToken) return memoryToken;
  const stored = sessionStorage.getItem('bestcar_admin_token');
  if (stored) {
    memoryToken = stored;
  }
  return memoryToken;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getMemoryAuthToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = typeof payload?.error === 'string' ? payload.error : `Erreur serveur (${res.status})`;
    throw new Error(message);
  }
  return payload as T;
}

export const api = {
  // Public cars
  getCars: () => request<Car[]>('/api/cars'),
  getCarById: (id: string) => request<Car>(`/api/cars/${encodeURIComponent(id)}`),

  // Public booking & contact
  createBooking: (data: {
    carId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    pickupLocation: string;
    returnLocation: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    message: string;
  }) =>
    request<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  sendContactMessage: (data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }) =>
    request<ContactMessage>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Admin authentication
  login: async (email: string, password: string) => {
    const res = await request<{
      authenticated: boolean;
      user: { email: string; role: string };
      token: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      setMemoryAuthToken(res.token);
    }
    return res;
  },

  logout: async () => {
    setMemoryAuthToken(null);
    return request<{ authenticated: boolean }>('/api/auth/logout', { method: 'POST' });
  },

  checkAuth: () =>
    request<{ authenticated: boolean; user: { email: string; role: string } | null }>('/api/auth/me'),

  // Protected Admin operations
  getAdminStats: () => request<AdminStats>('/api/admin/stats'),
  createCar: (data: Partial<Car>) =>
    request<Car>('/api/cars', { method: 'POST', body: JSON.stringify(data) }),
  updateCar: (id: string, data: Partial<Car>) =>
    request<Car>(`/api/cars/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCar: (id: string) =>
    request<{ deleted: boolean; id: string }>(`/api/cars/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  getBookings: () => request<Booking[]>('/api/bookings'),
  updateBookingStatus: (id: string, status: BookingStatus) =>
    request<Booking>(`/api/bookings/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteBooking: (id: string) =>
    request<{ deleted: boolean; id: string }>(`/api/bookings/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  getClients: () => request<ClientSummary[]>('/api/clients'),
  getMessages: () => request<ContactMessage[]>('/api/messages'),
};
