'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { Driver, Trip, Booking, ExpenseCategory } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatINR, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Play,
  CheckCircle2,
  Receipt,
  MapPin,
  Clock,
  Phone,
  Car,
  AlertCircle,
  ShieldCheck,
  Fuel,
  Filter,
  Calendar,
  DollarSign,
  Award,
  AlertTriangle,
  LogOut,
  ChevronRight,
  Sparkles,
  Inbox,
  Check,
  Power,
  RefreshCw,
  User,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';

// Helper: Parse any time string ("09:30 AM", "14:15", "2:00 PM") into minutes from midnight
function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const numericPart = clean.replace(/[^\d:]/g, '');
  const parts = numericPart.split(':');
  if (parts.length < 2) return 0;
  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export const DriverPortalView: React.FC = () => {
  const { currentDriver, refreshKey, triggerRefresh, openStartTrip, openCompleteTrip, openEditProfile, driverLogout } = useApp();

  const [driver, setDriver] = useState<Driver | null>(currentDriver);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [openBookings, setOpenBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [viewTab, setViewTab] = useState<'ASSIGNED' | 'OPEN_REQUESTS' | 'HISTORY'>('ASSIGNED');

  // Duty Status (toggleable locally)
  const [isOnDuty, setIsOnDuty] = useState(true);

  // Time Range Filter
  const [timePreset, setTimePreset] = useState<'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'CUSTOM'>('ALL');
  const [customStartTime, setCustomStartTime] = useState('08:00');
  const [customEndTime, setCustomEndTime] = useState('18:00');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'TOMORROW' | 'WEEK'>('ALL');

  // Expense Modal
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('FUEL');
  const [expenseAmount, setExpenseAmount] = useState<number>(500);
  const [expenseDesc, setExpenseDesc] = useState<string>('');
  const [expenseLoading, setExpenseLoading] = useState(false);

  // Fetch driver data, assigned trips, and open bookings
  useEffect(() => {
    setLoading(true);

    Promise.all([
      api.getDrivers().catch(() => []),
      api.getTrips().catch(() => []),
      api.getBookings().catch(() => []),
    ])
      .then(([dList, tList, bList]) => {
        // Prioritize session driver, fallback to first available
        if (currentDriver) {
          const fresh = dList.find((d) => d.id === currentDriver.id);
          setDriver(fresh || currentDriver);
        } else if (dList.length > 0) {
          setDriver(dList[0]);
        }

        setTrips(tList);
        // Open requests: pending bookings without confirmed trip
        const pending = bList.filter((b) => (b.booking_status || b.status) === 'PENDING' || (b.booking_status || b.status) === 'CONFIRMED');
        setOpenBookings(pending);
      })
      .finally(() => setLoading(false));
  }, [refreshKey, currentDriver]);

  // Handle duty status toggle
  const toggleDutyStatus = () => {
    const nextStatus = !isOnDuty;
    setIsOnDuty(nextStatus);
    toast.success(nextStatus ? 'Shift started: You are ON DUTY and available for trips' : 'Shift paused: You are OFF DUTY');
  };

  // Expense Submission
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseLoading(true);
    try {
      await api.createExpense({
        trip_id: selectedTripId || undefined,
        category: expenseCategory,
        amount: Number(expenseAmount),
        description: expenseDesc,
      });

      toast.success('Expense reimbursement claim submitted to fleet manager!');
      setIsExpenseOpen(false);
      triggerRefresh();
    } catch (e: any) {
      toast.error('Failed to submit expense claim');
    } finally {
      setExpenseLoading(false);
    }
  };

  // Helper: Filter by time window
  const matchesTimeRange = useCallback((timeStr?: string) => {
    if (!timeStr || timePreset === 'ALL') return true;
    const tripMinutes = parseTimeToMinutes(timeStr);

    if (timePreset === 'MORNING') {
      return tripMinutes >= 360 && tripMinutes < 720; // 06:00 - 12:00
    }
    if (timePreset === 'AFTERNOON') {
      return tripMinutes >= 720 && tripMinutes < 1020; // 12:00 - 17:00
    }
    if (timePreset === 'EVENING') {
      return tripMinutes >= 1020 && tripMinutes < 1260; // 17:00 - 21:00
    }
    if (timePreset === 'NIGHT') {
      return tripMinutes >= 1260 || tripMinutes < 360; // 21:00 - 06:00
    }
    if (timePreset === 'CUSTOM') {
      const startMin = parseTimeToMinutes(customStartTime);
      const endMin = parseTimeToMinutes(customEndTime);
      if (startMin <= endMin) {
        return tripMinutes >= startMin && tripMinutes <= endMin;
      } else {
        // Crosses midnight
        return tripMinutes >= startMin || tripMinutes <= endMin;
      }
    }
    return true;
  }, [timePreset, customStartTime, customEndTime]);

  // Helper: Filter by date
  const matchesDateRange = useCallback((dateStr?: string) => {
    if (!dateStr || dateFilter === 'ALL') return true;
    const itemDate = new Date(dateStr).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    const tomorrowObj = new Date();
    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
    const tomorrow = tomorrowObj.toISOString().slice(0, 10);

    const weekObj = new Date();
    weekObj.setDate(weekObj.getDate() + 7);
    const inOneWeek = weekObj.toISOString().slice(0, 10);

    if (dateFilter === 'TODAY') return itemDate === today;
    if (dateFilter === 'TOMORROW') return itemDate === tomorrow;
    if (dateFilter === 'WEEK') return itemDate >= today && itemDate <= inOneWeek;
    return true;
  }, [dateFilter]);

  // Active in-transit trip for this driver
  const activeTrip = useMemo(() => {
    return trips.find(
      (t) => (t.driver_id === driver?.id || t.driver?.id === driver?.id) && t.status === 'STARTED'
    );
  }, [trips, driver]);

  // Scheduled trips assigned to this driver matching time filter
  const filteredAssignedTrips = useMemo(() => {
    return trips.filter((t) => {
      const isMyTrip =
        t.driver_id === driver?.id ||
        t.driver?.id === driver?.id ||
        t.driver?.name === driver?.name;
      const isScheduled = t.status === 'SCHEDULED' || t.status === 'DRIVER_ASSIGNED';
      if (!isMyTrip || !isScheduled) return false;
      return matchesTimeRange(t.scheduled_time) && matchesDateRange(t.scheduled_date);
    });
  }, [trips, driver, matchesTimeRange, matchesDateRange]);

  // Open trip requests from passengers matching time filter
  const filteredOpenRequests = useMemo(() => {
    return openBookings.filter((b) => {
      return matchesTimeRange(b.pickup_time) && matchesDateRange(b.pickup_date);
    });
  }, [openBookings, matchesTimeRange, matchesDateRange]);

  // Past completed trips for this driver
  const completedTrips = useMemo(() => {
    return trips.filter((t) => {
      const isMyTrip =
        t.driver_id === driver?.id ||
        t.driver?.id === driver?.id ||
        t.driver?.name === driver?.name;
      return isMyTrip && t.status === 'COMPLETED';
    });
  }, [trips, driver]);

  // Driving license status check
  const licenseExpiryDate = driver?.license_expiry ? new Date(driver.license_expiry) : null;
  const isLicenseExpired = licenseExpiryDate ? licenseExpiryDate.getTime() < Date.now() : false;
  const licenseDaysLeft = licenseExpiryDate
    ? Math.ceil((licenseExpiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-16">
      {/* 1. DRIVER PARTNER PROFILE & FLEET IDENTITY CARD */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4 text-slate-900 dark:text-white transition-colors">
        {/* Top Driver Bar */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/30">
              {driver?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white">{driver?.name || 'Ramesh Kumar'}</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {driver?.driver_code || 'DRV-001'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{driver?.phone || '+91 98888 11111'}</p>
            </div>
          </div>

          {/* On Duty / Off Duty Toggle Switch */}
          <button
            type="button"
            onClick={toggleDutyStatus}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
              isOnDuty
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700/60'
                : 'bg-slate-100 text-slate-600 border border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOnDuty ? 'ON DUTY' : 'OFF DUTY'}</span>
          </button>
        </div>

        {/* Driver Operational Credentials Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
          {/* License */}
          <div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Driving License</div>
            <div className="font-bold text-slate-900 dark:text-white truncate mt-0.5">{driver?.license_number || 'KA-01-2015-0045892'}</div>
            <div className={`text-[10px] font-extrabold mt-0.5 ${isLicenseExpired ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isLicenseExpired ? '⚠️ Expired' : `Valid (${Math.round(licenseDaysLeft / 365)} yrs)`}
            </div>
          </div>

          {/* Payout Model */}
          <div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Compensation</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">{driver?.payment_model || 'PER_TRIP'}</div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">
              {driver?.payment_model === 'PER_TRIP'
                ? `₹${driver?.per_trip_rate || 700}/run`
                : driver?.payment_model === 'PERCENTAGE'
                ? `${driver?.trip_percentage || 15}% rev`
                : `₹${driver?.base_salary || 20000}/mo`}
            </div>
          </div>

          {/* Outstanding Advance */}
          <div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Cash Advance</div>
            <div className="font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {formatINR(driver?.outstanding_advance ?? 2000)}
            </div>
            <div className="text-[10px] text-slate-500">Unsettled</div>
          </div>

          {/* Performance Rating */}
          <div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Rating & Runs</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">4.9 ★★★★★</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">{completedTrips.length || 42} runs</div>
          </div>
        </div>

        {/* Assigned Fleet Vehicle & Claim Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Assigned: <strong className="text-slate-900 dark:text-white">KA-03-TC-9999 (Innova Crysta)</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={openEditProfile}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-colors"
              title="Edit Driver Credentials & Password"
            >
              <User className="w-3.5 h-3.5" />
              <span>⚙ Edit Profile</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedTripId(activeTrip?.id || '');
                setIsExpenseOpen(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-colors"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>+ Claim</span>
            </button>

            <button
              type="button"
              onClick={driverLogout}
              className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 text-xs font-bold transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE IN-TRANSIT TRIP (HIGH PRIORITY) */}
      {activeTrip && (
        <div className="bg-blue-50/80 dark:bg-blue-950/60 p-5 rounded-3xl border border-blue-200 dark:border-blue-800/80 space-y-4 shadow-sm dark:shadow-xl animate-in zoom-in-95 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
              Active Run in Transit
            </span>
            <span className="text-xs font-mono font-bold text-blue-900 dark:text-white px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 shadow-sm">
              {activeTrip.trip_code}
            </span>
          </div>

          {/* Route Map Card */}
          <div className="space-y-2.5 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-blue-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Pickup Point</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{activeTrip.pickup_location}</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Drop Destination</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{activeTrip.drop_location}</div>
              </div>
            </div>
          </div>

          {/* Passenger Contact & Call Button */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-blue-200/80 dark:border-slate-800 text-xs shadow-sm">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Passenger</div>
              <div className="font-bold text-slate-900 dark:text-white">
                {activeTrip.guest_name || activeTrip.customer?.name || 'Executive Passenger'}
              </div>
            </div>

            <a
              href={`tel:${activeTrip.guest_phone || activeTrip.customer?.phone || '+919888800001'}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Passenger</span>
            </a>
          </div>

          <button
            onClick={() => openCompleteTrip(activeTrip)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Trip & Settle Odometer</span>
          </button>
        </div>
      )}

      {/* 3. TIME RANGE & SHIFT FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Filter Trips by Shift & Time Range</span>
          </div>

          {timePreset !== 'ALL' && (
            <button
              onClick={() => setTimePreset('ALL')}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Preset Shift Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setTimePreset('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              timePreset === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Shifts (24H)
          </button>

          <button
            type="button"
            onClick={() => setTimePreset('MORNING')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              timePreset === 'MORNING'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            🌅 Morning (06:00 - 12:00)
          </button>

          <button
            type="button"
            onClick={() => setTimePreset('AFTERNOON')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              timePreset === 'AFTERNOON'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            ☀️ Afternoon (12:00 - 17:00)
          </button>

          <button
            type="button"
            onClick={() => setTimePreset('EVENING')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              timePreset === 'EVENING'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            🌆 Evening (17:00 - 21:00)
          </button>

          <button
            type="button"
            onClick={() => setTimePreset('NIGHT')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              timePreset === 'NIGHT'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            🌙 Night (21:00 - 06:00)
          </button>

          <button
            type="button"
            onClick={() => setTimePreset('CUSTOM')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              timePreset === 'CUSTOM'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            ⏱️ Custom Window
          </button>
        </div>

        {/* Custom Start / End Time Pickers */}
        {timePreset === 'CUSTOM' && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Start Time (From)
              </label>
              <input
                type="time"
                value={customStartTime}
                onChange={(e) => setCustomStartTime(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                End Time (To)
              </label>
              <input
                type="time"
                value={customEndTime}
                onChange={(e) => setCustomEndTime(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. VIEW TABS: ASSIGNED TRIPS vs OPEN REQUESTS vs HISTORY */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => setViewTab('ASSIGNED')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            viewTab === 'ASSIGNED'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Assigned Runs ({filteredAssignedTrips.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setViewTab('OPEN_REQUESTS')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            viewTab === 'OPEN_REQUESTS'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Trip Requests ({filteredOpenRequests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setViewTab('HISTORY')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            viewTab === 'HISTORY'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>History ({completedTrips.length})</span>
        </button>
      </div>

      {/* TAB 1: ASSIGNED TRIPS */}
      {viewTab === 'ASSIGNED' && (
        <div className="space-y-3">
          {filteredAssignedTrips.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-900 dark:text-white">No Assigned Trips in Selected Range</div>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                No runs assigned matching shift {timePreset}. Check "Trip Requests" tab to view available bookings.
              </p>
            </div>
          ) : (
            filteredAssignedTrips.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition-all text-slate-900 dark:text-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white">{t.trip_code}</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs">
                      {t.scheduled_time}
                    </span>
                  </div>
                  <StatusBadge status={t.status} />
                </div>

                <div className="space-y-1.5 text-xs bg-slate-50 dark:bg-slate-950/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="font-bold text-slate-900 dark:text-white truncate">{t.pickup_location}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <span className="font-bold text-slate-900 dark:text-white truncate">{t.drop_location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                  <div>Date: <strong className="text-slate-900 dark:text-white">{formatDate(t.scheduled_date)}</strong></div>
                  <div>Passenger: <strong className="text-slate-900 dark:text-white">{t.guest_name || t.customer?.name}</strong></div>
                  <div>Vehicle: <strong className="text-slate-900 dark:text-white">{t.vehicle?.registration_number || 'KA-03-TC-9999'}</strong></div>
                  <div>Estimated Payout: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">₹700</strong></div>
                </div>

                <button
                  type="button"
                  onClick={() => openStartTrip(t)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Run (Log Starting Odometer)</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: OPEN TRIP REQUESTS (AVAILABLE BOOKINGS) */}
      {viewTab === 'OPEN_REQUESTS' && (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
            💡 Showing customer trip requests matching your shift ({timePreset}). Contact dispatch or accept to claim.
          </div>

          {filteredOpenRequests.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-900 dark:text-white">No Open Requests in this Time Slot</div>
              <p className="text-[11px] text-slate-500">Change the time filter above to explore trips from other shifts.</p>
            </div>
          ) : (
            filteredOpenRequests.slice(0, 10).map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm text-slate-900 dark:text-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{b.booking_code}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {b.pickup_time || 'Immediate'}
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    {formatINR(b.final_amount || b.estimated_price)}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{b.pickup_location}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{b.drop_location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  <span>Passenger: <strong className="text-slate-900 dark:text-white">{b.guest_name || b.customer?.name}</strong></span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {b.vehicle_type || 'SEDAN'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED TRIP HISTORY */}
      {viewTab === 'HISTORY' && (
        <div className="space-y-3">
          {completedTrips.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              No completed trips recorded yet.
            </div>
          ) : (
            completedTrips.slice(0, 15).map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-900 dark:text-white"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{t.trip_code}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">● COMPLETED</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                  {t.pickup_location} → {t.drop_location}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <span>{formatDate(t.scheduled_date)} at {t.scheduled_time}</span>
                  <span className="font-bold text-slate-900 dark:text-white">Earnings: ₹700</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* EXPENSE REIMBURSEMENT MODAL */}
      <Modal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        title="Submit Trip Expense Claim"
        subtitle="Submit fuel bills, toll charges, or parking receipts for manager reimbursement"
        maxWidth="sm"
      >
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Expense Type *</label>
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
            >
              <option value="FUEL">Fuel Refill</option>
              <option value="TOLL">Toll Plaza Charge</option>
              <option value="PARKING">Parking Fee</option>
              <option value="FOOD">Food / Daily Batta</option>
              <option value="OTHER">Other / Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Amount (₹) *</label>
            <input
              type="number"
              required
              min="1"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Description / Bill Number</label>
            <input
              type="text"
              required
              value={expenseDesc}
              onChange={(e) => setExpenseDesc(e.target.value)}
              placeholder="e.g. HPCL Petrol pump bill #9921"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-inner"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsExpenseOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={expenseLoading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              {expenseLoading ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
