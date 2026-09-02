'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { Vehicle } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatINR, formatDate, formatNumber } from '@/lib/utils';
import { toast } from 'sonner';
import { PlusCircle, Car, Wrench, Shield, Gauge, Fuel, CheckCircle, AlertCircle } from 'lucide-react';

export const FleetView: React.FC = () => {
  const { refreshKey, openAddVehicle, openMaintenance, triggerRefresh } = useApp();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    api.getVehicles(statusFilter ? { status: statusFilter } : undefined)
      .then(setVehicles)
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [refreshKey, statusFilter]);

  const handleToggleStatus = async (vehicle: Vehicle, newStatus: string) => {
    try {
      await api.updateVehicleStatus(vehicle.id, newStatus);
      toast.success(`Vehicle ${vehicle.registration_number} status updated to ${newStatus}`);
      triggerRefresh();
    } catch (e: any) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Fleet & Vehicle Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time status tracking, maintenance logs, capital investments, and compliance expiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 shadow-sm"
          >
            <option value="">All Vehicles</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="MAINTENANCE">In Maintenance</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <button
            onClick={openAddVehicle}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-500 text-xs">Loading fleet data...</div>
        ) : (
          vehicles.map((v) => (
            <div
              key={v.id}
              className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-xl hover:border-blue-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Vehicle Image Header */}
                <div className="relative h-40 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <img
                    src={
                      v.image_url ||
                      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=60'
                    }
                    alt={v.model}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={v.status} />
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-900 dark:text-white uppercase border border-slate-200 dark:border-slate-700">
                    {v.vehicle_type}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
                    {v.registration_number}
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{v.model}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {v.manufacturer} • {v.fuel_type} • {v.seating_capacity} Seater
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Gauge className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
                      <span>{formatNumber(v.current_odometer)} km</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Car className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{formatINR(v.purchase_price)}</span>
                    </div>
                  </div>

                  {/* Compliance Expiry Tag */}
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span>Insurance Expiry:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{formatDate(v.insurance_expiry)}</span>
                    </div>
                    {v.service_info && (
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 truncate font-medium">
                        Service: {v.service_info}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  onClick={() => openMaintenance(v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-amber-400 text-xs font-semibold border border-slate-200 dark:border-slate-700/60 transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Log Service</span>
                </button>

                <div className="flex items-center gap-1">
                  {v.status === 'AVAILABLE' ? (
                    <button
                      onClick={() => handleToggleStatus(v, 'MAINTENANCE')}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 transition-colors"
                    >
                      Put in Maint.
                    </button>
                  ) : v.status === 'MAINTENANCE' ? (
                    <button
                      onClick={() => handleToggleStatus(v, 'AVAILABLE')}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 transition-colors"
                    >
                      Make Available
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
