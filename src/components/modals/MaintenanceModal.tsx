'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Wrench, Calendar, Gauge, DollarSign } from 'lucide-react';

export const MaintenanceModal: React.FC = () => {
  const { isMaintenanceOpen, closeMaintenance, selectedVehicleForMaintenance, triggerRefresh } = useApp();

  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState<number>(0);
  const [serviceType, setServiceType] = useState('Periodic Service (Oil & Filters)');
  const [parts, setParts] = useState('');
  const [labour, setLabour] = useState('');
  const [cost, setCost] = useState<number>(4500);
  const [nextServiceOdometer, setNextServiceOdometer] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedVehicleForMaintenance) {
      const currentOdo = selectedVehicleForMaintenance.current_odometer || 0;
      setOdometer(currentOdo);
      setNextServiceOdometer(currentOdo + 10000);
    }
  }, [selectedVehicleForMaintenance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleForMaintenance) return;

    setLoading(true);
    try {
      await api.addMaintenance(selectedVehicleForMaintenance.id, {
        service_date: serviceDate,
        odometer: Number(odometer),
        service_type: serviceType,
        parts,
        labour,
        cost: Number(cost),
        next_service_odometer: nextServiceOdometer ? Number(nextServiceOdometer) : undefined,
        notes,
      });

      toast.success(`Maintenance record logged for ${selectedVehicleForMaintenance.registration_number}!`);
      triggerRefresh();
      closeMaintenance();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to log maintenance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isMaintenanceOpen}
      onClose={closeMaintenance}
      title="Log Vehicle Maintenance & Service"
      subtitle={`Record service for ${selectedVehicleForMaintenance?.model || ''} (${selectedVehicleForMaintenance?.registration_number || ''})`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Service Date *</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="date"
                required
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Service Odometer (km) *</label>
            <div className="relative">
              <Gauge className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="number"
                required
                min="0"
                value={odometer}
                onChange={(e) => setOdometer(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Service Type *</label>
          <input
            type="text"
            required
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            placeholder="e.g. 30,000 km Service, Brake Pad replacement"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Parts Replaced</label>
            <input
              type="text"
              value={parts}
              onChange={(e) => setParts(e.target.value)}
              placeholder="e.g. Engine Oil, Oil Filter, Air Filter"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Total Cost (₹) *</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-3 text-rose-400" />
              <input
                type="number"
                required
                min="1"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Next Target Service Odometer (km)</label>
          <input
            type="number"
            value={nextServiceOdometer}
            onChange={(e) => setNextServiceOdometer(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Workshop Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Done at Authorized Toyota Service Center"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={closeMaintenance}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20"
          >
            <Wrench className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Log Maintenance & Expense'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
