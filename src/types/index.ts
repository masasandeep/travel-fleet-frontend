export type Role = 'ADMIN' | 'DRIVER' | 'CUSTOMER';

export type CustomerType = 'INDIVIDUAL' | 'CORPORATE' | 'GUEST';

export type VehicleType = 'SEDAN' | 'SUV' | 'INNOVA' | 'LUXURY' | 'TEMPO_TRAVELLER' | 'BUS';

export type FuelType = 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC' | 'HYBRID';

export type VehicleStatus = 'AVAILABLE' | 'BOOKED' | 'ON_TRIP' | 'MAINTENANCE' | 'INACTIVE' | 'SOLD';

export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'ON_LEAVE' | 'UNAVAILABLE' | 'INACTIVE';

export type PaymentModel = 'PER_TRIP' | 'PERCENTAGE' | 'FIXED_SALARY' | 'SALARY_ALLOWANCE' | 'DAILY_ALLOWANCE';

export type TripSource = 'CUSTOMER_BOOKING' | 'ADMIN_QUICK_TRIP' | 'RECURRING_TRIP' | 'BULK_IMPORT';

export type TripStatus = 'UNASSIGNED' | 'SCHEDULED' | 'DRIVER_ASSIGNED' | 'DRIVER_ACCEPTED' | 'STARTED' | 'COMPLETED' | 'CANCELLED';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';

export type ExpenseCategory = 'FUEL' | 'TOLL' | 'PARKING' | 'DRIVER_PAYMENT' | 'DRIVER_ALLOWANCE' | 'MAINTENANCE' | 'PERMIT' | 'CLEANING' | 'FOOD' | 'OTHER';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';

export type LoanStatus = 'ACTIVE' | 'CLOSED' | 'DEFAULTED';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertType =
  | 'OVERDUE_EMI'
  | 'UPCOMING_EMI'
  | 'INSURANCE_EXPIRY'
  | 'DRIVER_LICENSE_EXPIRY'
  | 'PERMIT_EXPIRY'
  | 'FITNESS_EXPIRY'
  | 'PUC_EXPIRY'
  | 'SERVICE_DUE'
  | 'LOW_UTILIZATION'
  | 'PENDING_EXPENSE'
  | 'PENDING_BOOKING'
  | 'UNASSIGNED_TRIP';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  customer_id?: string;
  driver_id?: string;
}

export interface Customer {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  email?: string;
  customer_type: CustomerType;
  company_name?: string;
  gst_number?: string;
  address?: string;
  notes?: string;
  created_at: string;
  bookings?: Booking[];
  trips?: Trip[];
}

export interface DriverDocument {
  id: string;
  driver_id: string;
  document_type: string;
  document_number: string;
  issue_date?: string;
  expiry_date?: string;
  status: string;
}

export interface DriverAdvance {
  id: string;
  driver_id: string;
  amount: number;
  date: string;
  reason: string;
  outstanding_amount: number;
  status: string;
}

export interface DriverPayment {
  id: string;
  driver_id: string;
  trip_id?: string;
  amount: number;
  calculation_type: PaymentModel;
  advance_deduction: number;
  net_paid: number;
  payment_date: string;
  status: string;
  notes?: string;
}

export interface Driver {
  id: string;
  user_id?: string;
  driver_code: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  license_number: string;
  license_type: string;
  license_expiry: string;
  joining_date: string;
  experience_years: number;
  status: DriverStatus;
  payment_model: PaymentModel;
  base_salary: number;
  trip_percentage: number;
  per_trip_rate: number;
  daily_allowance_rate: number;
  notes?: string;
  is_license_expired?: boolean;
  outstanding_advance?: number;
  total_trips_completed?: number;
  documents?: DriverDocument[];
  advances?: DriverAdvance[];
  payments?: DriverPayment[];
  trips?: Trip[];
}

export interface VehicleDocument {
  id: string;
  vehicle_id: string;
  document_type: string;
  document_number: string;
  expiry_date?: string;
  status: string;
}

export interface VehicleMaintenance {
  id: string;
  vehicle_id: string;
  service_date: string;
  odometer: number;
  service_type: string;
  parts?: string;
  labour?: string;
  cost: number;
  next_service_date?: string;
  next_service_odometer?: number;
  notes?: string;
}

export interface VehicleInvestment {
  id: string;
  vehicle_id: string;
  purchase_type: 'CASH' | 'LOAN';
  purchase_price: number;
  registration_cost: number;
  insurance_cost: number;
  accessories_cost: number;
  initial_setup_cost: number;
  other_capital_expenses: number;
  total_investment: number;
  down_payment: number;
  notes?: string;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  payment_date: string;
  emi_amount: number;
  principal_component: number;
  interest_component: number;
  outstanding_after_payment: number;
  payment_method: string;
  reference_number?: string;
  status: string;
}

export interface VehicleLoan {
  id: string;
  vehicle_id: string;
  bank_name: string;
  account_number?: string;
  original_loan_amount: number;
  interest_rate: number;
  tenure_months: number;
  monthly_emi: number;
  loan_start_date: string;
  loan_end_date: string;
  principal_paid: number;
  interest_paid: number;
  outstanding_principal: number;
  next_emi_date?: string;
  status: LoanStatus;
  vehicle?: Vehicle;
  payments?: LoanPayment[];
}

export interface Vehicle {
  id: string;
  registration_number: string;
  model: string;
  manufacturer: string;
  vehicle_type: VehicleType;
  seating_capacity: number;
  fuel_type: FuelType;
  purchase_price: number;
  current_odometer: number;
  status: VehicleStatus;
  insurance_expiry?: string;
  permit_expiry?: string;
  fitness_expiry?: string;
  pollution_expiry?: string;
  service_info?: string;
  image_url?: string;
  notes?: string;
  documents?: VehicleDocument[];
  maintenance_records?: VehicleMaintenance[];
  investments?: VehicleInvestment[];
  loans?: VehicleLoan[];
  trips?: Trip[];
}

export interface Expense {
  id: string;
  trip_id?: string;
  vehicle_id?: string;
  driver_id?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  receipt_url?: string;
  approval_status: ApprovalStatus;
  approved_by?: string;
  trip?: { id: string; trip_code: string; pickup_location: string; drop_location: string };
  vehicle?: { id: string; registration_number: string; model: string };
  driver?: { id: string; name: string; driver_code: string };
}

export interface FuelRecord {
  id: string;
  trip_id?: string;
  vehicle_id: string;
  driver_id?: string;
  litres: number;
  amount: number;
  fuel_price_per_litre: number;
  odometer: number;
  date: string;
  mileage_calculated?: number;
  notes?: string;
}

export interface OdometerReading {
  id: string;
  trip_id?: string;
  vehicle_id: string;
  reading_type: string;
  reading_km: number;
  recorded_at: string;
  recorded_by?: string;
  notes?: string;
}

export interface Booking {
  id: string;
  booking_code: string;
  customer_id?: string;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  pickup_location: string;
  drop_location: string;
  pickup_date: string;
  pickup_time: string;
  passenger_count: number;
  vehicle_type: VehicleType;
  vehicle_count?: number;
  is_multi_vehicle?: boolean;
  master_booking_id?: string;
  estimated_distance_km?: number;
  estimated_price: number;
  advance_paid: number;
  booking_status: BookingStatus;
  status?: BookingStatus;
  final_amount?: number;
  payment_status: string;
  notes?: string;
  customer?: Customer;
  trip?: Trip;
}

export interface TripFinancials {
  revenue: number;
  fuel_expense: number;
  toll_expense: number;
  parking_expense: number;
  driver_expense: number;
  other_expenses: number;
  total_expenses: number;
  operating_profit: number;
  net_margin?: number;
  profit_margin_pct: number;
}

export interface Trip {
  id: string;
  trip_code: string;
  booking_id?: string;
  trip_source: TripSource;
  customer_id?: string;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  vehicle_id: string;
  driver_id: string;
  pickup_location: string;
  drop_location: string;
  scheduled_date: string;
  scheduled_time: string;
  start_time?: string;
  end_time?: string;
  passenger_count: number;
  start_odometer?: number;
  end_odometer?: number;
  distance_km?: number;
  trip_price: number;
  driver_payment_amount?: number;
  driver_payment_model?: PaymentModel;
  status: TripStatus;
  cancellation_reason?: string;
  notes?: string;
  created_at: string;
  customer?: Customer;
  vehicle?: Vehicle;
  driver?: Driver;
  booking?: Booking;
  expenses?: Expense[];
  fuel_records?: FuelRecord[];
  odometer_readings?: OdometerReading[];
  driver_payments?: DriverPayment[];
  financials?: TripFinancials;
}

export interface RecurringTripTemplate {
  id: string;
  customer_id?: string;
  guest_name?: string;
  guest_phone?: string;
  pickup_location: string;
  drop_location: string;
  days_of_week: string;
  time: string;
  passenger_count: number;
  vehicle_preference: VehicleType;
  driver_preference: string;
  vehicle_id?: string;
  driver_id?: string;
  price: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  last_generated_date?: string;
  notes?: string;
  customer?: Customer;
}

export interface Alert {
  id: string;
  alert_type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  is_resolved: boolean;
  resolved_at?: string;
  entity_type?: string;
  entity_id?: string;
  created_at: string;
}

export interface DashboardKPIs {
  todays_trips_count: number;
  upcoming_trips_count: number;
  active_trips_count: number;
  completed_trips_count: number;
  total_revenue: number;
  total_expenses: number;
  operating_profit: number;
  profit_margin_pct: number;
  total_outstanding_loans: number;
  total_vehicles: number;
  fleet_utilization_pct: number;
}

export interface MonthlyTrendItem {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  fuel: number;
  driver: number;
  maintenance: number;
}

export interface VehicleProfitabilityItem {
  vehicle_id: string;
  registration_number: string;
  model: string;
  vehicle_type: VehicleType;
  status: VehicleStatus;
  current_odometer: number;
  image_url: string;
  total_trips: number;
  total_distance_km: number;
  total_revenue: number;
  fuel_cost: number;
  toll_cost: number;
  driver_cost: number;
  maintenance_cost: number;
  operating_expenses: number;
  operating_profit: number;
  loan_interest_paid: number;
  profit_after_financing: number;
  total_investment: number;
  loan_outstanding: number;
  roi_pct: number;
  cost_per_km: number;
  revenue_per_km: number;
  profit_per_km: number;
  fuel_efficiency_km_per_l: number;
  monthly_fixed_cost: number;
  break_even_trips_month: number;
  break_even_message: string;
}

export interface DriverPerformanceItem {
  driver_id: string;
  driver_code: string;
  name: string;
  phone: string;
  license_number: string;
  license_expiry: string;
  status: DriverStatus;
  payment_model: PaymentModel;
  trips_completed: number;
  distance_travelled_km: number;
  revenue_generated: number;
  total_earnings: number;
  outstanding_advances: number;
  average_rating: number;
}

export interface PricingRule {
  id: string;
  route_id?: string;
  pickup_city: string;
  drop_city: string;
  vehicle_type: VehicleType;
  base_price: number;
  per_km_rate: number;
  toll_included: boolean;
  night_allowance: number;
  is_active: boolean;
}

export interface Route {
  id: string;
  origin_name: string;
  destination_name: string;
  distance_km: number;
  estimated_duration_hours: number;
  toll_cost_estimate: number;
  intermediate_stops?: string;
  stops_list?: string[];
  is_active: boolean;
  pricing_rules?: PricingRule[];
}

export type AdminRoute = Route;

export interface CreateRouteInput {
  origin_name: string;
  destination_name: string;
  distance_km: number;
  estimated_duration_hours: number;
  toll_cost_estimate?: number;
  intermediate_stops?: string;
  stops_list?: string[];
  is_active?: boolean;
  vehicle_pricing: {
    vehicle_type: VehicleType;
    base_price: number;
    per_km_rate?: number;
  }[];
}

export interface RouteVehicleOption {
  vehicle_type: VehicleType;
  base_price: number;
  per_km_rate: number;
  toll_included: boolean;
}

export interface RouteSearchResult {
  success: boolean;
  found: boolean;
  message?: string;
  data: {
    route_id: string;
    origin_name: string;
    destination_name: string;
    distance_km: number;
    estimated_duration_hours: number;
    toll_cost_estimate: number;
    intermediate_stops?: string;
    stops_list?: string[];
    is_intermediate: boolean;
    matched_stop?: string;
    match_description: string;
    available_vehicles: RouteVehicleOption[];
  } | null;
}

export interface RouteAnalysisItem {
  route_id: string;
  origin: string;
  destination: string;
  distance_km: number;
  toll_estimate: number;
  trip_count: number;
  total_revenue: number;
  total_expense: number;
  profit: number;
  avg_price: number;
  revenue_per_km: number;
  profit_per_km: number;
}

export interface PriceEstimateResult {
  base_price: number;
  per_km_rate: number;
  estimated_distance_km: number;
  toll_cost_estimate: number;
  night_allowance: number;
  total_estimated_price: number;
  breakdown: {
    base_fare: number;
    distance_fare: number;
    toll_estimate: number;
    night_allowance: number;
    taxes: number;
  };
  pricing_type: string;
}

export interface ParsedCsvRow {
  row_number: number;
  customer_name: string;
  phone: string;
  pickup: string;
  drop: string;
  date: string;
  time: string;
  vehicle_registration_or_type: string;
  driver_code_or_name: string;
  price: number;
  notes: string;
  is_valid: boolean;
  errors: string[];
  resolved_vehicle_id?: string;
  resolved_driver_id?: string;
  resolved_customer_id?: string;
}

export interface ValidationSummary {
  total_rows: number;
  valid_rows_count: number;
  invalid_rows_count: number;
  rows: ParsedCsvRow[];
}

export interface TimeAwareDriverOption {
  driver_id: string;
  driver_code: string;
  name: string;
  phone: string;
  status: DriverStatus;
  payment_model: PaymentModel;
  is_license_expired: boolean;
  availability_type: 'AVAILABLE_NOW' | 'UPCOMING_FREE' | 'CONFLICT_BLOCKED' | 'LICENSE_EXPIRED';
  available_at_time?: string;
  current_trip_code?: string;
  current_trip_drop_time?: string;
  reason_message: string;
}

export interface LiveFleetTrackingItem {
  trip_id: string;
  trip_code: string;
  status: TripStatus;
  vehicle_id: string;
  vehicle_plate: string;
  vehicle_model: string;
  vehicle_type: VehicleType;
  driver_id: string;
  driver_name: string;
  driver_phone: string;
  passenger_name: string;
  pickup_location: string;
  drop_location: string;
  current_latitude: number;
  current_longitude: number;
  current_speed_kmh: number;
  current_status_message: string;
  estimated_arrival_minutes: number;
  route_progress_pct: number;
}

export interface MultiVehicleBookingInput {
  customer_id?: string;
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  pickup_location: string;
  drop_location: string;
  pickup_date: string;
  pickup_time: string;
  notes?: string;
  vehicle_requests: {
    vehicle_type: VehicleType;
    quantity: number;
    unit_price: number;
  }[];
}

export interface TrackBookingResult {
  booking: Booking;
  current_stage: 'WAITING_ASSIGNMENT' | 'ASSIGNED' | 'STARTED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  status_message: string;
  driver?: Driver;
  vehicle?: Vehicle;
  trip?: Trip;
}

export interface UnassignedQueueResult {
  pending_bookings: Booking[];
  unassigned_trips: Trip[];
  total_unassigned: number;
}

export interface Tenant {
  id: string;
  slug: string;
  company_name: string;
  tagline?: string;
  logo_url?: string;
  primary_phone: string;
  secondary_phone?: string;
  whatsapp_number?: string;
  support_email?: string;
  address?: string;
  gst_number?: string;
  currency?: string;
  currency_symbol?: string;
  plan?: 'STARTER' | 'PRO' | 'ENTERPRISE';
  is_active?: boolean;
}
