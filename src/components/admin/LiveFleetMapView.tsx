'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { LiveFleetTrackingItem } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LiveRouteMap } from '@/components/customer/LiveRouteMap';
import {
  Navigation,
  MapPin,
  Gauge,
  Clock,
  Car,
  User,
  Phone,
  Radio,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

export const LiveFleetMapView: React.FC = () => {
  const { refreshKey, triggerRefresh } = useApp();
  const [trackingList, setTrackingList] = useState<LiveFleetTrackingItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<LiveFleetTrackingItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getLiveFleetTracking()
      .then((data) => {
        setTrackingList(data);
        if (data.length > 0) setSelectedItem(data[0]);
      })
      .catch(() => setTrackingList([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Live Fleet GPS Tracker</h1>
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold">
              {trackingList.length} Active in Transit
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time telemetry tracking driver movement, speed, route progression, and estimated arrival times.
          </p>
        </div>

        <button
          onClick={triggerRefresh}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh GPS Telemetry</span>
        </button>
      </div>

      {/* Main Grid: Map Canvas + Live Vehicle List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Map Canvas / Telemetry Board */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm dark:shadow-2xl flex flex-col justify-between min-h-[480px] transition-colors">
          {selectedItem ? (
            <div className="space-y-6">
              {/* Top Telemetry Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">{selectedItem.vehicle_plate}</span>
                    <span className="text-xs text-blue-700 dark:text-indigo-300 font-semibold">• {selectedItem.vehicle_model}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Trip Ref: {selectedItem.trip_code}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200">
                    <Gauge className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span>Speed: <strong className="text-slate-900 dark:text-white">{selectedItem.current_speed_kmh} km/h</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-indigo-950/80 border border-blue-200 dark:border-indigo-700/50 text-xs text-blue-800 dark:text-indigo-300">
                    <Clock className="w-4 h-4" />
                    <span>ETA: <strong className="text-slate-900 dark:text-white">{selectedItem.estimated_arrival_minutes} mins</strong></span>
                  </div>
                </div>
              </div>

              {/* Real Interactive Google Maps-style Telematics Map */}
              <div className="w-full">
                <LiveRouteMap
                  pickupLocation={selectedItem.pickup_location}
                  dropLocation={selectedItem.drop_location}
                  driverName={selectedItem.driver_name}
                  driverPhone={selectedItem.driver_phone}
                  vehicleRegistration={selectedItem.vehicle_plate}
                  vehicleModel={selectedItem.vehicle_model}
                  tripStatus="STARTED"
                  className="w-full shadow-2xl"
                />
              </div>

              {/* Driver Partner & Passenger Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-indigo-400 font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Driver Partner</span>
                    <div className="font-bold text-slate-900 dark:text-white">{selectedItem.driver_name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{selectedItem.driver_phone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Passenger / Account</span>
                    <div className="font-bold text-slate-900 dark:text-white">{selectedItem.passenger_name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">GPS Status: Synchronized</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 text-xs my-auto">
              No vehicles currently in transit. Dispatched trips will appear live here once started.
            </div>
          )}
        </div>

        {/* Right Sidebar: Active Vehicle Fleet Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Active Vehicles in Transit ({trackingList.length})
          </h3>

          {trackingList.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              No live trips active right now.
            </div>
          ) : (
            trackingList.map((item) => {
              const isSelected = selectedItem?.trip_id === item.trip_id;
              return (
                <div
                  key={item.trip_id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-slate-900 border-blue-500 shadow-md dark:shadow-indigo-500/10'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
                      <span className="font-extrabold text-slate-900 dark:text-white text-xs">{item.vehicle_plate}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{item.current_speed_kmh} km/h</span>
                  </div>

                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.pickup_location} → {item.drop_location}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span>Driver: <strong className="text-slate-800 dark:text-slate-200">{item.driver_name}</strong></span>
                    <span className="text-blue-700 dark:text-indigo-300 font-semibold">ETA {item.estimated_arrival_minutes}m</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
