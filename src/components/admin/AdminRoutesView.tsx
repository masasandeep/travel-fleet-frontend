'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { Route, VehicleType } from '@/types';
import { formatINR } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Map,
  PlusCircle,
  Car,
  MapPin,
  Clock,
  Navigation,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  Milestone,
  Compass,
  Calculator,
  RefreshCw,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';

interface StopDistanceData {
  stop_name: string;
  distance_km: number;
  stop_index: number;
}

export const AdminRoutesView: React.FC = () => {
  const { refreshKey, triggerRefresh } = useApp();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [distanceKm, setDistanceKm] = useState(120);
  const [durationHours, setDurationHours] = useState(2.0);
  const [tollCost, setTollCost] = useState(250);
  const [intermediateStops, setIntermediateStops] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Map Estimation State
  const [isEstimatingMap, setIsEstimatingMap] = useState(false);
  const [estimatedStopsList, setEstimatedStopsList] = useState<StopDistanceData[]>([]);

  // Vehicle Pricing Matrix (Base & Per-KM Rate)
  const [enableSedan, setEnableSedan] = useState(true);
  const [sedanBase, setSedanBase] = useState(3000);
  const [sedanPerKm, setSedanPerKm] = useState(14);

  const [enableInnova, setEnableInnova] = useState(true);
  const [innovaBase, setInnovaBase] = useState(4500);
  const [innovaPerKm, setInnovaPerKm] = useState(20);

  const [enableSuv, setEnableSuv] = useState(false);
  const [suvBase, setSuvBase] = useState(4000);
  const [suvPerKm, setSuvPerKm] = useState(17);

  const [enableLuxury, setEnableLuxury] = useState(false);
  const [luxuryBase, setLuxuryBase] = useState(12000);
  const [luxuryPerKm, setLuxuryPerKm] = useState(45);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getRoutes()
      .then(setRoutes)
      .catch(() => setRoutes([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  // Compute intermediate stop distances from source on input change
  const parsedStops = useMemo(() => {
    return intermediateStops
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [intermediateStops]);

  // Function to query map and calculate driving distances from Source (Origin)
  const handleQueryMapDistances = async () => {
    if (!origin.trim() || !destination.trim()) {
      return toast.error('Please enter Origin (Source) and Destination City first');
    }

    setIsEstimatingMap(true);
    try {
      const res = await api.estimateRouteDistances({
        origin: origin.trim(),
        destination: destination.trim(),
        intermediate_stops: intermediateStops.trim(),
      });

      if (res && res.total_distance_km > 0) {
        setDistanceKm(Math.round(res.total_distance_km));
        setDurationHours(res.estimated_duration_hours);
        setEstimatedStopsList(res.intermediate_stops || []);
        toast.success(
          `Map query successful! Estimated total distance: ${Math.round(res.total_distance_km)} km with ${res.intermediate_stops?.length || 0} stops calculated from Source (${origin}).`,
          { icon: '🗺' }
        );
      }
    } catch (err: any) {
      toast.info('Map query fallback: using calibrated highway interpolation from Source.');
      // Local fallback calculation
      const stops = parsedStops;
      const fallbackList: StopDistanceData[] = stops.map((st, idx) => ({
        stop_name: st,
        distance_km: Math.round(distanceKm * ((idx + 1) / (stops.length + 1))),
        stop_index: idx + 1,
      }));
      setEstimatedStopsList(fallbackList);
    } finally {
      setIsEstimatingMap(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingRoute(null);
    setOrigin('');
    setDestination('');
    setDistanceKm(120);
    setDurationHours(2.0);
    setTollCost(250);
    setIntermediateStops('');
    setIsActive(true);
    setEstimatedStopsList([]);

    setEnableSedan(true);
    setSedanBase(3000);
    setSedanPerKm(14);

    setEnableInnova(true);
    setInnovaBase(4500);
    setInnovaPerKm(20);

    setEnableSuv(false);
    setSuvBase(4000);
    setSuvPerKm(17);

    setEnableLuxury(false);
    setLuxuryBase(12000);
    setLuxuryPerKm(45);

    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: Route) => {
    setEditingRoute(r);
    setOrigin(r.origin_name);
    setDestination(r.destination_name);
    setDistanceKm(r.distance_km);
    setDurationHours(r.estimated_duration_hours);
    setTollCost(r.toll_cost_estimate);
    const stopsStr = r.intermediate_stops || (r.stops_list ? r.stops_list.join(', ') : '');
    setIntermediateStops(stopsStr);
    setIsActive(r.is_active);

    const rules = r.pricing_rules || [];
    const sedanRule = rules.find((rule) => rule.vehicle_type === 'SEDAN');
    if (sedanRule) {
      setEnableSedan(true);
      setSedanBase(sedanRule.base_price);
      setSedanPerKm(sedanRule.per_km_rate || 14);
    } else {
      setEnableSedan(false);
      setSedanBase(3000);
      setSedanPerKm(14);
    }

    const innovaRule = rules.find((rule) => rule.vehicle_type === 'INNOVA');
    if (innovaRule) {
      setEnableInnova(true);
      setInnovaBase(innovaRule.base_price);
      setInnovaPerKm(innovaRule.per_km_rate || 20);
    } else {
      setEnableInnova(false);
      setInnovaBase(4500);
      setInnovaPerKm(20);
    }

    const suvRule = rules.find((rule) => rule.vehicle_type === 'SUV');
    if (suvRule) {
      setEnableSuv(true);
      setSuvBase(suvRule.base_price);
      setSuvPerKm(suvRule.per_km_rate || 17);
    } else {
      setEnableSuv(false);
      setSuvBase(4000);
      setSuvPerKm(17);
    }

    const luxuryRule = rules.find((rule) => rule.vehicle_type === 'LUXURY');
    if (luxuryRule) {
      setEnableLuxury(true);
      setLuxuryBase(luxuryRule.base_price);
      setLuxuryPerKm(luxuryRule.per_km_rate || 45);
    } else {
      setEnableLuxury(false);
      setLuxuryBase(12000);
      setLuxuryPerKm(45);
    }

    // Pre-calculate stops
    const stops = stopsStr.split(',').map((s) => s.trim()).filter(Boolean);
    const initialStops: StopDistanceData[] = stops.map((st, idx) => ({
      stop_name: st,
      distance_km: Math.round(r.distance_km * ((idx + 1) / (stops.length + 1))),
      stop_index: idx + 1,
    }));
    setEstimatedStopsList(initialStops);

    setIsModalOpen(true);
  };

  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return toast.error('Origin and Destination are required');

    const vehiclePricing = [];
    if (enableSedan) vehiclePricing.push({ vehicle_type: 'SEDAN' as VehicleType, base_price: Number(sedanBase), per_km_rate: Number(sedanPerKm) });
    if (enableInnova) vehiclePricing.push({ vehicle_type: 'INNOVA' as VehicleType, base_price: Number(innovaBase), per_km_rate: Number(innovaPerKm) });
    if (enableSuv) vehiclePricing.push({ vehicle_type: 'SUV' as VehicleType, base_price: Number(suvBase), per_km_rate: Number(suvPerKm) });
    if (enableLuxury) vehiclePricing.push({ vehicle_type: 'LUXURY' as VehicleType, base_price: Number(luxuryBase), per_km_rate: Number(luxuryPerKm) });

    if (vehiclePricing.length === 0) return toast.error('Please select at least 1 vehicle tier for this route');

    setSubmitting(true);
    try {
      const payload = {
        origin_name: origin.trim(),
        destination_name: destination.trim(),
        distance_km: Number(distanceKm),
        estimated_duration_hours: Number(durationHours),
        toll_cost_estimate: Number(tollCost),
        intermediate_stops: intermediateStops.trim(),
        is_active: isActive,
        vehicle_pricing: vehiclePricing,
      };

      if (editingRoute) {
        await api.updateRoute(editingRoute.id, payload);
        toast.success(`Route ${origin} → ${destination} with dynamic per-km intermediate pricing updated!`);
      } else {
        await api.createRoute(payload);
        toast.success(`Route ${origin} → ${destination} settled with dynamic per-km intermediate pricing!`);
      }

      setIsModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save route');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoute = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete route ${name}?`)) return;
    try {
      await api.deleteRoute(id);
      toast.success('Route deleted');
      triggerRefresh();
    } catch (e) {
      toast.error('Failed to delete route');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Routes & Vehicle Pricing Management
            </h1>
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
              {routes.length} Corridors Settled
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Configure Source → Destination corridors, intermediate locations with map distance estimation, and set per-kilometer rates.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Settle New Route</span>
        </button>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-xs bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            Loading corridors...
          </div>
        ) : routes.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-xs bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            No routes configured yet. Click <strong>+ Settle New Route</strong> to create one.
          </div>
        ) : (
          routes.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm dark:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${r.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700/60' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-500 dark:border-slate-800'}`}>
                    {r.is_active ? 'Active & Published' : 'Inactive / Draft'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(r)}
                      title="Edit Route & Pricing"
                      className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoute(r.id, `${r.origin_name} → ${r.destination_name}`)}
                      title="Delete Route"
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Origin -> Destination */}
                <div className="space-y-1 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Source: <strong>{r.origin_name}</strong></span>
                  </div>
                  <div className="pl-5 text-slate-400 text-[10px]">to destination</div>
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>Destination: <strong>{r.destination_name}</strong></span>
                  </div>
                </div>

                {/* Distance & Duration */}
                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <div>Total: <strong className="text-slate-900 dark:text-slate-200">{r.distance_km} km</strong></div>
                  <div>Time: <strong className="text-slate-900 dark:text-slate-200">{r.estimated_duration_hours} hrs</strong></div>
                  <div>Toll: <strong className="text-amber-600 dark:text-amber-400">{formatINR(r.toll_cost_estimate)}</strong></div>
                </div>

                {/* Intermediate Stops with distance from source */}
                {r.stops_list && r.stops_list.length > 0 && (
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-900">
                    <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 tracking-wider flex items-center gap-1">
                      <Milestone className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>Intermediate Stops ({r.stops_list.length}) — Distance from Source:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {r.stops_list.map((stop, sIdx) => {
                        const totalStops = r.stops_list ? r.stops_list.length : 1;
                        const approxKm = Math.round(r.distance_km * ((sIdx + 1) / (totalStops + 1)));
                        return (
                          <span
                            key={stop}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                          >
                            {stop} <span className="font-mono text-[9px] opacity-75">({approxKm}km)</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Vehicle Fares & Per-KM Rates */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-900 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Settled Vehicle Pricing (Flat & ₹/KM):
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {r.pricing_rules && r.pricing_rules.length > 0 ? (
                      r.pricing_rules.map((rule) => (
                        <div
                          key={rule.id}
                          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-xs flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">{rule.vehicle_type}</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatINR(rule.base_price)}</span>
                          </div>
                          {rule.per_km_rate > 0 && (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                              ₹{rule.per_km_rate}/km
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No specific vehicle tiers</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span>Auto-synced to Customer UI</span>
                <button
                  onClick={() => handleOpenEdit(r)}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 text-[10px] transition-colors"
                >
                  Edit Corridor & Pricing →
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Settle / Edit Route Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoute ? "Edit Route & Distance-Based Pricing" : "Settle Route & Distance-Based Pricing"}
        subtitle={editingRoute ? `Update corridor parameters and per-kilometer rates for ${editingRoute.origin_name} → ${editingRoute.destination_name}` : "Define source to destination, intermediate places with map distance estimation, and set per-kilometer rates"}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveRoute} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Source / Origin City *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-emerald-500" />
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Bangalore"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Destination City / Hub *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-rose-500" />
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Mysore"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Intermediate Places Input & Query Map Trigger */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Milestone className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>Intermediate Locations (Comma Separated)</span>
              </label>

              <button
                type="button"
                onClick={handleQueryMapDistances}
                disabled={isEstimatingMap || !origin || !destination}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-all disabled:opacity-50 self-start sm:self-auto shadow-xs"
                title="Query map to calculate driving distances from Source"
              >
                {isEstimatingMap ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                )}
                <span>{isEstimatingMap ? 'Querying Map...' : '🗺 Query Map for Distances from Source'}</span>
              </button>
            </div>

            <textarea
              rows={2}
              value={intermediateStops}
              onChange={(e) => setIntermediateStops(e.target.value)}
              placeholder="e.g. Bidadi, Ramanagara, Channapatna, Maddur, Mandya, Srirangapatna"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
            />

            {/* Live Intermediate Stops Distance from Source & Estimated Price Table */}
            {parsedStops.length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Distance from Source ({origin || 'Source'}) & Per-KM Stop Pricing:</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Auto-calculated</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {parsedStops.map((stop, idx) => {
                    const matchedEst = estimatedStopsList.find((s) => s.stop_name.toLowerCase() === stop.toLowerCase());
                    const stopKm = matchedEst
                      ? matchedEst.distance_km
                      : Math.round(distanceKm * ((idx + 1) / (parsedStops.length + 1)));

                    const sedanPrice = Math.max(800, Math.round(stopKm * (sedanPerKm || 14)));
                    const innovaPrice = Math.max(1400, Math.round(stopKm * (innovaPerKm || 20)));

                    return (
                      <div
                        key={stop}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white truncate">{stop}</span>
                          <span className="font-mono text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                            {stopKm} km from Source
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-0.5">
                          <span>Sedan: <strong className="text-emerald-600 dark:text-emerald-400">₹{sedanPrice}</strong></span>
                          <span>Innova: <strong className="text-emerald-600 dark:text-emerald-400">₹{innovaPrice}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Total Distance (KM) *</label>
              <input
                type="number"
                required
                min="1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Duration (Hours) *</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Estimated Toll (₹)</label>
              <input
                type="number"
                min="0"
                value={tollCost}
                onChange={(e) => setTollCost(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
          </div>

          {/* Vehicle Selection & Kilometer Pricing Matrix */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Vehicle Classes & Kilometer Price Setup</span>
              </h4>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                Per-KM rate calculates intermediate stop fares
              </span>
            </div>

            {/* Sedan */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
              <div className="flex items-center gap-2 w-36 shrink-0">
                <input
                  type="checkbox"
                  checked={enableSedan}
                  onChange={(e) => setEnableSedan(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
                <span className="font-bold text-slate-900 dark:text-white">Sedan</span>
              </div>
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Corridor Flat:</span>
                <input
                  type="number"
                  value={sedanBase}
                  onChange={(e) => setSedanBase(Number(e.target.value))}
                  className="w-24 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white font-bold"
                  placeholder="3000"
                />
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Kilometer Price (₹/km) *:</span>
                <input
                  type="number"
                  required={enableSedan}
                  value={sedanPerKm}
                  onChange={(e) => setSedanPerKm(Number(e.target.value))}
                  className="w-20 bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700 rounded-lg px-2 py-1 text-xs text-blue-900 dark:text-blue-300 font-extrabold"
                  placeholder="14"
                />
              </div>
            </div>

            {/* Innova */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
              <div className="flex items-center gap-2 w-36 shrink-0">
                <input
                  type="checkbox"
                  checked={enableInnova}
                  onChange={(e) => setEnableInnova(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
                <span className="font-bold text-slate-900 dark:text-white">Toyota Innova</span>
              </div>
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Corridor Flat:</span>
                <input
                  type="number"
                  value={innovaBase}
                  onChange={(e) => setInnovaBase(Number(e.target.value))}
                  className="w-24 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white font-bold"
                  placeholder="4500"
                />
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Kilometer Price (₹/km) *:</span>
                <input
                  type="number"
                  required={enableInnova}
                  value={innovaPerKm}
                  onChange={(e) => setInnovaPerKm(Number(e.target.value))}
                  className="w-20 bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700 rounded-lg px-2 py-1 text-xs text-blue-900 dark:text-blue-300 font-extrabold"
                  placeholder="20"
                />
              </div>
            </div>

            {/* SUV */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
              <div className="flex items-center gap-2 w-36 shrink-0">
                <input
                  type="checkbox"
                  checked={enableSuv}
                  onChange={(e) => setEnableSuv(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
                <span className="font-bold text-slate-900 dark:text-white">Premium SUV</span>
              </div>
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Corridor Flat:</span>
                <input
                  type="number"
                  value={suvBase}
                  onChange={(e) => setSuvBase(Number(e.target.value))}
                  className="w-24 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white font-bold"
                  placeholder="4000"
                />
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Kilometer Price (₹/km) *:</span>
                <input
                  type="number"
                  required={enableSuv}
                  value={suvPerKm}
                  onChange={(e) => setSuvPerKm(Number(e.target.value))}
                  className="w-20 bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700 rounded-lg px-2 py-1 text-xs text-blue-900 dark:text-blue-300 font-extrabold"
                  placeholder="17"
                />
              </div>
            </div>

            {/* Luxury */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
              <div className="flex items-center gap-2 w-36 shrink-0">
                <input
                  type="checkbox"
                  checked={enableLuxury}
                  onChange={(e) => setEnableLuxury(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
                <span className="font-bold text-slate-900 dark:text-white">Luxury Mercedes</span>
              </div>
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Corridor Flat:</span>
                <input
                  type="number"
                  value={luxuryBase}
                  onChange={(e) => setLuxuryBase(Number(e.target.value))}
                  className="w-24 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white font-bold"
                  placeholder="12000"
                />
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Kilometer Price (₹/km) *:</span>
                <input
                  type="number"
                  required={enableLuxury}
                  value={luxuryPerKm}
                  onChange={(e) => setLuxuryPerKm(Number(e.target.value))}
                  className="w-20 bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700 rounded-lg px-2 py-1 text-xs text-blue-900 dark:text-blue-300 font-extrabold"
                  placeholder="45"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Saving Route & Fares...' : editingRoute ? 'Update Route & Pricing' : 'Save & Publish Route'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
