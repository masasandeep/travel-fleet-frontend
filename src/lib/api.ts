import axios from 'axios';
import {
  Trip,
  Vehicle,
  Driver,
  Customer,
  Booking,
  Expense,
  VehicleLoan,
  VehicleInvestment,
  RecurringTripTemplate,
  Alert,
  DashboardKPIs,
  MonthlyTrendItem,
  VehicleProfitabilityItem,
  DriverPerformanceItem,
  RouteAnalysisItem,
  PriceEstimateResult,
  ValidationSummary,
  ParsedCsvRow,
  Route,
  CreateRouteInput,
  RouteSearchResult,
  Tenant,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Set active tenant slug header for SaaS multi-tenancy
export const setTenantSlug = (slug: string) => {
  apiClient.defaults.headers.common['X-Tenant-Slug'] = slug;
  try {
    localStorage.setItem('fleetflow_tenant_slug', slug);
  } catch (e) {}
};

// Set active demo role header for easy portal switching
export const setDemoRole = (role: 'ADMIN' | 'DRIVER' | 'CUSTOMER') => {
  apiClient.defaults.headers.common['X-Demo-Role'] = role;
};

// Default to ADMIN
setDemoRole('ADMIN');

export const api = {
  // 1. Analytics
  getKPIs: async (): Promise<DashboardKPIs> => {
    const res = await apiClient.get('/analytics/kpis');
    return res.data.data;
  },
  getMonthlyTrend: async (): Promise<MonthlyTrendItem[]> => {
    const res = await apiClient.get('/analytics/monthly-trend');
    return res.data.data;
  },
  getVehicleProfitability: async (): Promise<VehicleProfitabilityItem[]> => {
    const res = await apiClient.get('/analytics/vehicles');
    return res.data.data;
  },
  getDriverPerformance: async (): Promise<DriverPerformanceItem[]> => {
    const res = await apiClient.get('/analytics/drivers');
    return res.data.data;
  },
  getRouteAnalysis: async (): Promise<RouteAnalysisItem[]> => {
    const res = await apiClient.get('/analytics/routes');
    return res.data.data;
  },

  // 2. Trips
  getTrips: async (params?: Record<string, any>): Promise<Trip[]> => {
    const res = await apiClient.get('/trips', { params });
    return res.data.data;
  },
  getTripById: async (id: string): Promise<Trip> => {
    const res = await apiClient.get(`/trips/${id}`);
    return res.data.data;
  },
  createQuickTrip: async (data: any): Promise<Trip> => {
    const res = await apiClient.post('/trips/quick', data);
    return res.data.data;
  },
  assignTrip: async (id: string, data: { vehicle_id: string; driver_id: string; driver_payment_amount?: number; notes?: string }): Promise<Trip> => {
    const res = await apiClient.post(`/trips/${id}/assign`, data);
    return res.data.data;
  },
  getTimeAwareDrivers: async (date?: string, time?: string): Promise<any[]> => {
    const res = await apiClient.get('/trips/time-aware-drivers', { params: { date, time } });
    return res.data.data;
  },
  getLiveFleetTracking: async (): Promise<any[]> => {
    const res = await apiClient.get('/trips/live-tracking');
    return res.data.data;
  },
  getUnassignedQueue: async (): Promise<any> => {
    const res = await apiClient.get('/trips/unassigned-queue');
    return res.data;
  },
  startTrip: async (id: string, startOdometer: number): Promise<Trip> => {
    const res = await apiClient.post(`/trips/${id}/start`, { start_odometer: startOdometer });
    return res.data.data;
  },
  completeTrip: async (id: string, data: any): Promise<Trip> => {
    const res = await apiClient.post(`/trips/${id}/complete`, data);
    return res.data.data;
  },
  cancelTrip: async (id: string, reason?: string): Promise<Trip> => {
    const res = await apiClient.post(`/trips/${id}/cancel`, { reason });
    return res.data.data;
  },
  duplicateTrip: async (id: string, scheduledDate: string, scheduledTime: string): Promise<Trip> => {
    const res = await apiClient.post(`/trips/${id}/duplicate`, {
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
    });
    return res.data.data;
  },
  addTripExpense: async (id: string, data: any): Promise<Expense> => {
    const res = await apiClient.post(`/trips/${id}/expenses`, data);
    return res.data.data;
  },

  // 3. Vehicles
  getVehicles: async (params?: Record<string, any>): Promise<Vehicle[]> => {
    const res = await apiClient.get('/vehicles', { params });
    return res.data.data;
  },
  getVehicleById: async (id: string): Promise<Vehicle> => {
    const res = await apiClient.get(`/vehicles/${id}`);
    return res.data.data;
  },
  createVehicle: async (data: any): Promise<Vehicle> => {
    const res = await apiClient.post('/vehicles', data);
    return res.data.data;
  },
  updateVehicleStatus: async (id: string, status: string): Promise<void> => {
    await apiClient.patch(`/vehicles/${id}/status`, { status });
  },
  addMaintenance: async (id: string, data: any): Promise<any> => {
    const res = await apiClient.post(`/vehicles/${id}/maintenance`, data);
    return res.data.data;
  },

  // 4. Drivers
  getDrivers: async (params?: Record<string, any>): Promise<Driver[]> => {
    const res = await apiClient.get('/drivers', { params });
    return res.data.data;
  },
  getDriverById: async (id: string): Promise<Driver> => {
    const res = await apiClient.get(`/drivers/${id}`);
    return res.data.data;
  },
  createDriver: async (data: any): Promise<Driver> => {
    const res = await apiClient.post('/drivers', data);
    return res.data.data;
  },
  getMyTrips: async (): Promise<{ driver: Driver; data: Trip[] }> => {
    const res = await apiClient.get('/drivers/my-trips');
    return res.data;
  },

  // 5. Customers
  getCustomers: async (params?: Record<string, any>): Promise<Customer[]> => {
    const res = await apiClient.get('/customers', { params });
    return res.data.data;
  },
  createCustomer: async (data: any): Promise<Customer> => {
    const res = await apiClient.post('/customers', data);
    return res.data.data;
  },

  // 6. Bookings
  getBookings: async (params?: Record<string, any>): Promise<Booking[]> => {
    const res = await apiClient.get('/bookings', { params });
    return res.data.data;
  },
  createBooking: async (data: any): Promise<Booking> => {
    const res = await apiClient.post('/bookings', data);
    return res.data.data;
  },
  createMultiVehicleBooking: async (data: any): Promise<any> => {
    const res = await apiClient.post('/bookings/multi-vehicle', data);
    return res.data;
  },
  trackBookingByCode: async (code: string): Promise<any> => {
    const res = await apiClient.get(`/bookings/track/${encodeURIComponent(code)}`);
    return res.data;
  },
  assignBooking: async (id: string, data: any): Promise<Trip> => {
    const res = await apiClient.post(`/bookings/${id}/assign`, data);
    return res.data.data;
  },
  rejectBooking: async (id: string, reason?: string): Promise<any> => {
    const res = await apiClient.post(`/bookings/${id}/reject`, { reason });
    return res.data.data;
  },

  // 7. Expenses
  getExpenses: async (params?: Record<string, any>): Promise<Expense[]> => {
    const res = await apiClient.get('/expenses', { params });
    return res.data.data;
  },
  createExpense: async (data: any): Promise<Expense> => {
    const res = await apiClient.post('/expenses', data);
    return res.data.data;
  },
  updateExpenseApproval: async (id: string, approvalStatus: string): Promise<void> => {
    await apiClient.patch(`/expenses/${id}/approval`, { approval_status: approvalStatus });
  },

  // 8. Finance (Loans, Investments, Advances)
  getLoans: async (): Promise<VehicleLoan[]> => {
    const res = await apiClient.get('/finance/loans');
    return res.data.data;
  },
  createLoan: async (data: any): Promise<VehicleLoan> => {
    const res = await apiClient.post('/finance/loans', data);
    return res.data.data;
  },
  recordEMIPayment: async (data: any): Promise<any> => {
    const res = await apiClient.post('/finance/loans/payment', data);
    return res.data.data;
  },
  getInvestments: async (): Promise<VehicleInvestment[]> => {
    const res = await apiClient.get('/finance/investments');
    return res.data.data;
  },
  createInvestment: async (data: any): Promise<VehicleInvestment> => {
    const res = await apiClient.post('/finance/investments', data);
    return res.data.data;
  },
  createDriverAdvance: async (data: any): Promise<any> => {
    const res = await apiClient.post('/finance/advances', data);
    return res.data.data;
  },

  // 9. Pricing Quotes
  calculateQuote: async (data: any): Promise<PriceEstimateResult> => {
    const res = await apiClient.post('/pricing/quote', data);
    return res.data.data;
  },
  getQuote: async (data: any): Promise<PriceEstimateResult> => {
    const res = await apiClient.post('/pricing/quote', data);
    return res.data.data;
  },
  getRoutes: async (): Promise<Route[]> => {
    const res = await apiClient.get('/pricing/routes');
    return res.data.data;
  },
  searchRouteVehicles: async (pickup: string, drop: string): Promise<RouteSearchResult> => {
    const res = await apiClient.get('/pricing/search-route', {
      params: { pickup, drop },
    });
    return res.data;
  },
  searchRoute: async (pickup: string, drop: string): Promise<any> => {
    const res = await apiClient.get('/pricing/search-route', {
      params: { pickup, drop },
    });
    return res.data;
  },
  createRoute: async (data: CreateRouteInput): Promise<Route> => {
    const res = await apiClient.post('/pricing/routes', data);
    return res.data.data;
  },
  updateRoute: async (id: string, data: CreateRouteInput): Promise<Route> => {
    const res = await apiClient.put(`/pricing/routes/${id}`, data);
    return res.data.data;
  },
  deleteRoute: async (id: string): Promise<void> => {
    await apiClient.delete(`/pricing/routes/${id}`);
  },
  estimateRouteDistances: async (data: {
    origin: string;
    destination: string;
    intermediate_stops?: string;
  }): Promise<{
    origin: string;
    destination: string;
    total_distance_km: number;
    estimated_duration_hours: number;
    intermediate_stops: Array<{
      stop_name: string;
      distance_km: number;
      stop_index: number;
    }>;
  }> => {
    const res = await apiClient.post('/pricing/estimate-distance', data);
    return res.data.data;
  },
  getPricingRules: async (): Promise<any[]> => {
    const res = await apiClient.get('/pricing/rules');
    return res.data.data;
  },

  // 10. Recurring Trips
  getRecurringTemplates: async (): Promise<RecurringTripTemplate[]> => {
    const res = await apiClient.get('/recurring/templates');
    return res.data.data;
  },
  createRecurringTemplate: async (data: any): Promise<RecurringTripTemplate> => {
    const res = await apiClient.post('/recurring/templates', data);
    return res.data.data;
  },
  triggerRecurringGeneration: async (id: string): Promise<Trip[]> => {
    const res = await apiClient.post(`/recurring/templates/${id}/generate`);
    return res.data.data;
  },

  // 11. Bulk CSV Import
  validateCSV: async (csvContent: string): Promise<ValidationSummary> => {
    const res = await apiClient.post('/bulk-import/validate', { csv_content: csvContent });
    return res.data.data;
  },
  commitBulkImport: async (rows: ParsedCsvRow[]): Promise<Trip[]> => {
    const res = await apiClient.post('/bulk-import/commit', { rows });
    return res.data.data;
  },

  // 12. Alerts
  getAlerts: async (): Promise<Alert[]> => {
    const res = await apiClient.get('/alerts');
    return res.data.data;
  },
  resolveAlert: async (id: string): Promise<void> => {
    await apiClient.post(`/alerts/${id}/resolve`);
  },

  // 13. Authentication & Sessions
  login: async (email: string, password: string): Promise<{ success: boolean; token?: string; user?: any; message?: string }> => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data?.token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      try {
        localStorage.setItem('fleetflow_token', res.data.token);
      } catch (e) {}
    }
    return res.data;
  },
  register: async (data: { name: string; email: string; password: string; phone?: string; role?: string }): Promise<{ success: boolean; token?: string; user?: any; message?: string }> => {
    const res = await apiClient.post('/auth/register', data);
    if (res.data?.token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      try {
        localStorage.setItem('fleetflow_token', res.data.token);
      } catch (e) {}
    }
    return res.data;
  },
  logout: () => {
    delete apiClient.defaults.headers.common['Authorization'];
    try {
      localStorage.removeItem('fleetflow_token');
      localStorage.removeItem('fleetflow_user');
    } catch (e) {}
  },
  getProfile: async (): Promise<any> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  updateProfile: async (data: Record<string, any>): Promise<any> => {
    const res = await apiClient.put('/auth/profile', data);
    return res.data;
  },

  // 12. SaaS Multi-Tenant & Organization Branding
  getCurrentTenant: async (slug?: string): Promise<Tenant> => {
    const res = await apiClient.get('/tenants/current', {
      params: slug ? { tenant: slug } : undefined,
    });
    return res.data.data;
  },
  getAllTenants: async (): Promise<Tenant[]> => {
    const res = await apiClient.get('/tenants');
    return res.data.data;
  },
  updateTenant: async (idOrSlug: string, data: Partial<Tenant>): Promise<Tenant> => {
    const res = await apiClient.put(`/tenants/${idOrSlug}`, data);
    return res.data.data;
  },
  registerTenant: async (data: Partial<Tenant>): Promise<Tenant> => {
    const res = await apiClient.post('/tenants', data);
    return res.data.data;
  },
};
