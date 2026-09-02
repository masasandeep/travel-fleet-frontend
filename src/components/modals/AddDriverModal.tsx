'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { PaymentModel } from '@/types';
import { toast } from 'sonner';
import {
  User,
  Phone,
  ShieldCheck,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const AddDriverModal: React.FC = () => {
  const { isAddDriverOpen, closeAddDriver, triggerRefresh } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Default expiry: 3 years from today (standard commercial license duration)
  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() + 3);
  const [licenseExpiry, setLicenseExpiry] = useState<string>(defaultDate.toISOString().slice(0, 10));

  // Date Picker State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(new Date(defaultDate));
  const calendarRef = useRef<HTMLDivElement>(null);

  const [paymentModel, setPaymentModel] = useState<PaymentModel>('PER_TRIP');
  const [baseSalary, setBaseSalary] = useState<number>(20000);
  const [tripPercentage, setTripPercentage] = useState<number>(15);
  const [perTripRate, setPerTripRate] = useState<number>(700);
  const [dailyAllowanceRate, setDailyAllowanceRate] = useState<number>(400);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Close calendar popup on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isCalendarOpen]);

  // Quick preset helper
  const setExpiryPresetYears = (years: number) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + years);
    const dateStr = d.toISOString().slice(0, 10);
    setLicenseExpiry(dateStr);
    setViewDate(new Date(d));
    setIsCalendarOpen(false);
  };

  // Calendar navigation
  const nextMonth = () => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + 1);
    setViewDate(d);
  };

  const prevMonth = () => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() - 1);
    setViewDate(d);
  };

  const selectDay = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Format YYYY-MM-DD
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    setLicenseExpiry(`${y}-${m}-${dayStr}`);
    setIsCalendarOpen(false);
  };

  // Compute days in month
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Validate expiry
  const expiryDateObj = licenseExpiry ? new Date(licenseExpiry) : null;
  const isExpired = expiryDateObj ? expiryDateObj.getTime() < Date.now() : false;
  const daysUntilExpiry = expiryDateObj
    ? Math.ceil((expiryDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !licenseNumber || !licenseExpiry) {
      return toast.error('Name, phone, license number, and expiry date are required');
    }

    setLoading(true);
    try {
      await api.createDriver({
        name,
        phone,
        email: email || undefined,
        address,
        license_number: licenseNumber.toUpperCase().trim(),
        license_expiry: licenseExpiry,
        payment_model: paymentModel,
        base_salary: Number(baseSalary),
        trip_percentage: Number(tripPercentage),
        per_trip_rate: Number(perTripRate),
        daily_allowance_rate: Number(dailyAllowanceRate),
        notes,
      });

      toast.success(`Driver ${name} registered successfully!`);
      triggerRefresh();
      closeAddDriver();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to register driver');
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Modal
      isOpen={isAddDriverOpen}
      onClose={closeAddDriver}
      title="Register New Driver"
      subtitle="Onboard driver partner, license credentials, and driver compensation model"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Driver Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Driver Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Phone Number *</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98888 11111"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* License Details & Interactive Date Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Driving License Number *
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="KA-01-2018-0045892"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold uppercase text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Interactive Date Picker for License Expiry */}
          <div className="relative" ref={calendarRef}>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
              <span>License Expiry Date *</span>
              {licenseExpiry && (
                <span className={`text-[10px] font-bold ${
                  isExpired
                    ? 'text-rose-600 dark:text-rose-400'
                    : daysUntilExpiry < 60
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {isExpired ? '⚠️ Expired' : `✅ Valid (${Math.round(daysUntilExpiry / 365)} yrs)`}
                </span>
              )}
            </label>

            <div className="relative flex items-center">
              <input
                type="text"
                required
                readOnly
                value={licenseExpiry}
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                placeholder="YYYY-MM-DD"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-3 pr-10 py-2 text-xs font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="absolute right-2.5 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                title="Open Calendar Picker"
              >
                <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Presets:</span>
              <button
                type="button"
                onClick={() => setExpiryPresetYears(1)}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              >
                +1 Yr
              </button>
              <button
                type="button"
                onClick={() => setExpiryPresetYears(3)}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
              >
                +3 Yrs (Standard)
              </button>
              <button
                type="button"
                onClick={() => setExpiryPresetYears(5)}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              >
                +5 Yrs (Heavy)
              </button>
              <button
                type="button"
                onClick={() => setExpiryPresetYears(10)}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              >
                +10 Yrs
              </button>
            </div>

            {/* Interactive Calendar Popover */}
            {isCalendarOpen && (
              <div className="absolute z-50 right-0 mt-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-64 text-slate-900 dark:text-white animate-in fade-in zoom-in-95">
                {/* Header Navigation */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {monthNames[month]} {year}
                  </div>

                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 gap-1 pt-2 text-[10px] font-bold text-slate-400 text-center">
                  <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1 pt-1 text-xs">
                  {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const thisDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const isSelected = licenseExpiry === thisDateStr;

                    return (
                      <button
                        key={`day-${dayNum}`}
                        type="button"
                        onClick={() => selectDay(dayNum)}
                        className={`h-7 w-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compensation Model (Rule 18) */}
        <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-800 dark:text-slate-300">
              Driver Compensation Model (Rule 18)
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Select Payment Structure</label>
            <select
              value={paymentModel}
              onChange={(e) => setPaymentModel(e.target.value as PaymentModel)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="PER_TRIP">Per Trip Fixed Rate (e.g. ₹700/trip)</option>
              <option value="PERCENTAGE">Percentage of Trip Revenue (e.g. 15%)</option>
              <option value="FIXED_SALARY">Fixed Monthly Salary (e.g. ₹25,000/mo)</option>
              <option value="DAILY_ALLOWANCE">Daily Batta / Allowance Only</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {paymentModel === 'PER_TRIP' && (
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Per Trip Rate (₹)</label>
                <input
                  type="number"
                  value={perTripRate}
                  onChange={(e) => setPerTripRate(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            {paymentModel === 'PERCENTAGE' && (
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Trip Revenue Percentage (%)</label>
                <input
                  type="number"
                  value={tripPercentage}
                  onChange={(e) => setTripPercentage(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            {paymentModel === 'FIXED_SALARY' && (
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Monthly Base Salary (₹)</label>
                <input
                  type="number"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Daily Allowance / Food (₹)</label>
              <input
                type="number"
                value={dailyAllowanceRate}
                onChange={(e) => setDailyAllowanceRate(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={closeAddDriver}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register Driver'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
