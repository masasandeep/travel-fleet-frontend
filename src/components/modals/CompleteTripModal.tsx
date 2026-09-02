'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatINR } from '@/lib/utils';
import { toast } from 'sonner';
import { CheckCircle2, Gauge, Fuel, Receipt, DollarSign } from 'lucide-react';

export const CompleteTripModal: React.FC = () => {
  const { isCompleteTripOpen, closeCompleteTrip, selectedTripForComplete, triggerRefresh } = useApp();

  const [endOdometer, setEndOdometer] = useState<number>(0);
  const [tollExpense, setTollExpense] = useState<number>(0);
  const [parkingExpense, setParkingExpense] = useState<number>(0);
  const [fuelExpense, setFuelExpense] = useState<number>(0);
  const [fuelLitres, setFuelLitres] = useState<number>(0);
  const [driverPayOverride, setDriverPayOverride] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const startOdo = selectedTripForComplete?.start_odometer || selectedTripForComplete?.vehicle?.current_odometer || 0;
  const distance = Math.max(0, endOdometer - startOdo);
  const calculatedMileage = fuelLitres > 0 && distance > 0 ? (distance / fuelLitres).toFixed(2) : '0.00';

  useEffect(() => {
    if (selectedTripForComplete) {
      setEndOdometer(startOdo + (selectedTripForComplete.distance_km || 150));
      setDriverPayOverride(selectedTripForComplete.driver_payment_amount);
    }
  }, [selectedTripForComplete, startOdo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripForComplete) return;

    if (endOdometer < startOdo) {
      return toast.error(`Ending odometer (${endOdometer} km) cannot be lower than starting odometer (${startOdo} km)`);
    }

    setLoading(true);
    try {
      await api.completeTrip(selectedTripForComplete.id, {
        end_odometer: Number(endOdometer),
        toll_expense: Number(tollExpense),
        parking_expense: Number(parkingExpense),
        fuel_expense: Number(fuelExpense),
        fuel_litres: fuelLitres > 0 ? Number(fuelLitres) : undefined,
        driver_payment_amount: driverPayOverride ? Number(driverPayOverride) : undefined,
        notes,
      });

      toast.success(`Trip ${selectedTripForComplete.trip_code} completed! Total distance: ${distance} km.`);
      triggerRefresh();
      closeCompleteTrip();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to complete trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isCompleteTripOpen}
      onClose={closeCompleteTrip}
      title="Complete Trip Settlement"
      subtitle={`Finalize trip ${selectedTripForComplete?.trip_code || ''}, record final odometer, fuel, and expenses`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Odometer Section */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Odometer Management (Rule 23)</span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-700/50">
              Total Run: {distance} km
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Start Odometer</label>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 px-3 py-2 rounded-xl shadow-inner">
                {startOdo} km
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Ending Odometer *</label>
              <div className="relative">
                <Gauge className="w-4 h-4 absolute left-3.5 top-3 text-emerald-600 dark:text-emerald-400" />
                <input
                  type="number"
                  required
                  min={startOdo}
                  value={endOdometer}
                  onChange={(e) => setEndOdometer(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operating Expenses Section */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Trip Expenses & Fuel Refill</span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Fuel Expense (₹)</label>
              <div className="relative">
                <Fuel className="w-4 h-4 absolute left-3 top-3 text-amber-500" />
                <input
                  type="number"
                  min="0"
                  value={fuelExpense}
                  onChange={(e) => setFuelExpense(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Fuel Litres (L)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={fuelLitres}
                onChange={(e) => setFuelLitres(Number(e.target.value))}
                placeholder="0.0"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
              {fuelLitres > 0 && distance > 0 && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Mileage: {calculatedMileage} km/L</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Toll Charges (₹)</label>
              <div className="relative">
                <Receipt className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  value={tollExpense}
                  onChange={(e) => setTollExpense(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Parking Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={parkingExpense}
                onChange={(e) => setParkingExpense(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Driver Settlement (₹)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-3 text-blue-600 dark:text-blue-400" />
                <input
                  type="number"
                  min="0"
                  value={driverPayOverride || ''}
                  onChange={(e) => setDriverPayOverride(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Closing Remarks</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Completed on time, passenger paid cash"
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-inner"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={closeCompleteTrip}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || endOdometer < startOdo}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Completing...' : 'Complete & Settle Trip'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
