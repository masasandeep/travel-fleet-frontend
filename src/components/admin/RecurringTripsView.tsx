'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { RecurringTripTemplate } from '@/types';
import { formatINR, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Repeat, PlusCircle, Calendar, Play, Clock, CheckCircle2 } from 'lucide-react';

export const RecurringTripsView: React.FC = () => {
  const { refreshKey, triggerRefresh } = useApp();

  const [templates, setTemplates] = useState<RecurringTripTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [guestName, setGuestName] = useState('Infosys Daily Airport Shuttle');
  const [guestPhone, setGuestPhone] = useState('+919888866666');
  const [pickupLocation, setPickupLocation] = useState('Infosys Gate 1, Electronic City');
  const [dropLocation, setDropLocation] = useState('BLR Airport Terminal 2');
  const [daysOfWeek, setDaysOfWeek] = useState('1,2,3,4,5'); // Mon-Fri
  const [time, setTime] = useState('07:30 AM');
  const [price, setPrice] = useState(1600);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]);

  useEffect(() => {
    setLoading(true);
    api.getRecurringTemplates()
      .then(setTemplates)
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleGenerate = async (templateId: string) => {
    try {
      const generatedTrips = await api.triggerRecurringGeneration(templateId);
      toast.success(`Generated ${generatedTrips.length} upcoming scheduled trips for this contract!`);
      triggerRefresh();
    } catch (e: any) {
      toast.error('Failed to generate recurring trips');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRecurringTemplate({
        guest_name: guestName,
        guest_phone: guestPhone,
        pickup_location: pickupLocation,
        drop_location: dropLocation,
        days_of_week: daysOfWeek,
        time,
        price: Number(price),
        start_date: startDate,
        end_date: endDate,
        vehicle_preference: 'SEDAN',
      });

      toast.success('Recurring contract template created and scheduled forward!');
      setIsCreateOpen(false);
      triggerRefresh();
    } catch (e: any) {
      toast.error('Failed to create template');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Recurring Trips & Corporate Contracts</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automate corporate employee shuttles, daily airport runs, and scheduled contract trips.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(!isCreateOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isCreateOpen ? 'Close Form' : '+ New Recurring Contract'}</span>
        </button>
      </div>

      {/* Create Form Drawer */}
      {isCreateOpen && (
        <form onSubmit={handleCreate} className="bg-slate-950 p-5 rounded-2xl border border-indigo-900/50 space-y-4 shadow-2xl">
          <div className="text-xs font-bold uppercase text-indigo-400 flex items-center gap-2">
            <Repeat className="w-4 h-4" />
            <span>New Recurring Contract Template</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Contract / Guest Name</label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Pickup Location</label>
              <input
                type="text"
                required
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Drop Location</label>
              <input
                type="text"
                required
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Days of Week (1=Mon, 5=Fri)</label>
              <input
                type="text"
                value={daysOfWeek}
                onChange={(e) => setDaysOfWeek(e.target.value)}
                placeholder="1,2,3,4,5"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="07:30 AM"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Price Per Trip (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20"
            >
              Save & Auto-Generate Upcoming Trips
            </button>
          </div>
        </form>
      )}

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between hover:border-blue-400 dark:hover:border-slate-700 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {tpl.customer?.name || tpl.guest_name || 'Corporate Shuttle'}
                  </h3>
                  <div className="text-xs text-blue-700 dark:text-indigo-300 font-semibold mt-0.5">
                    {tpl.pickup_location} → {tpl.drop_location}
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                  ACTIVE CONTRACT
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-center">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Frequency</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">Mon - Fri ({tpl.days_of_week})</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Time</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{tpl.time}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Rate / Trip</span>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatINR(tpl.price)}</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Validity: {formatDate(tpl.start_date)} - {formatDate(tpl.end_date)}
              </span>

              <button
                onClick={() => handleGenerate(tpl.id)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 dark:bg-indigo-600/20 dark:hover:bg-indigo-600 text-blue-700 hover:text-white dark:text-indigo-300 dark:hover:text-white border border-blue-200 hover:border-blue-600 dark:border-indigo-500/40 text-xs font-semibold transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Generate Next 14 Days</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
