'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { TrackBookingResult } from '@/types';
import { formatINR, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Search,
  CheckCircle2,
  Clock,
  Car,
  User,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Navigation,
  AlertCircle,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { LiveRouteMap } from '@/components/customer/LiveRouteMap';

export const CustomerTrackRide: React.FC = () => {
  const { trackedBookingCode } = useApp();
  const searchParams = useSearchParams();
  const urlCode = searchParams.get('code') || '';

  const [bookingCode, setBookingCode] = useState(urlCode || trackedBookingCode || '');
  const [trackResult, setTrackResult] = useState<TrackBookingResult | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchTracking = useCallback(async (codeToSearch: string) => {
    let cleanCode = codeToSearch.trim().toUpperCase().replace(/\s+/g, '-');
    if (!cleanCode) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.trackBookingByCode(cleanCode);
      const bkg = res.data || res.booking;
      setTrackResult({
        ...res,
        booking: bkg,
      });
      toast.success(`Retrieved live tracking for ${cleanCode}`);
    } catch (err: any) {
      setTrackResult(null);
      toast.error(`Booking reference "${cleanCode}" not found. Please verify code.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.getBookings({ limit: 5 })
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setRecentBookings(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const target = urlCode || trackedBookingCode;
    if (target && target.trim()) {
      const clean = target.trim().toUpperCase();
      setBookingCode(clean);
      fetchTracking(clean);
    }
  }, [urlCode, trackedBookingCode, fetchTracking]);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bookingCode.trim()) return toast.error('Please enter your Booking Reference Code');
    fetchTracking(bookingCode);
  };

  const booking = trackResult?.booking || (trackResult as any)?.data;
  const trip = booking?.trip;
  const stage = trackResult?.current_stage || 'WAITING_ASSIGNMENT';

  const stages = [
    { key: 'REQUEST_RECEIVED', label: '1. Request Received', desc: 'Booking confirmed in system' },
    { key: 'WAITING_ASSIGNMENT', label: '2. Waiting Dispatch', desc: 'Matching optimal driver partner' },
    { key: 'ASSIGNED', label: '3. Driver Partner Assigned', desc: 'Driver & vehicle confirmed' },
    { key: 'STARTED', label: '4. Driver En Route', desc: 'Trip in progress to destination' },
    { key: 'COMPLETED', label: '5. Trip Completed', desc: 'Safely arrived at destination' },
  ];

  const getStageIndex = (s: string) => {
    switch (s) {
      case 'WAITING_ASSIGNMENT': return 1;
      case 'ASSIGNED': return 2;
      case 'STARTED': return 3;
      case 'COMPLETED': return 4;
      default: return 0;
    }
  };

  const currentIdx = getStageIndex(stage);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8 px-4">
      {/* Search Header Banner - Perfectly Harmonized for Light & Dark Modes */}
      <div className="bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-2xl transition-colors">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-xs font-bold text-blue-700 dark:text-blue-300">
          <Navigation className="w-3.5 h-3.5 text-amber-500" />
          <span>Real-Time Driver Partner & Vehicle Dispatch Tracker</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Track Your Driver Partner & Ride Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Enter your Booking Reference ID (e.g. <strong className="text-blue-600 dark:text-blue-400 font-mono">BKG-2026-001</strong>) to view live driver partner details and transit progression.
        </p>

        {/* Search Input */}
        <form onSubmit={handleTrack} className="max-w-md mx-auto flex items-center gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value)}
              placeholder="e.g. BKG-2026-001"
              className="w-full h-12 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl pl-10 pr-4 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
          >
            {loading ? 'Searching...' : 'Track Ride'}
          </button>
        </form>

        {/* Quick Select Recent Bookings */}
        {recentBookings.length > 0 && (
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Recent Fleet Bookings:</span>
            {recentBookings.slice(0, 4).map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setBookingCode(b.booking_code);
                  fetchTracking(b.booking_code);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold transition-all"
              >
                {b.booking_code} ({b.vehicle_type})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tracking Result View */}
      {searched && trackResult && booking && (
        <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-8 shadow-xl shadow-slate-200/50 dark:shadow-2xl animate-in zoom-in-95 text-slate-900 dark:text-white transition-colors">
          {/* Top Status & Code */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{booking.booking_code}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-[11px] font-bold">
                  {stage.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{trackResult.status_message}</p>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total Confirmed Fare</span>
              <div className="text-xl font-black text-blue-600 dark:text-blue-400">{formatINR(booking.estimated_price)}</div>
            </div>
          </div>

          {/* Rejection Notification if Booking was not assigned / declined */}
          {stage === 'REJECTED' && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <div className="font-bold">Booking Request Declined / Not Assigned</div>
                <p className="mt-0.5 text-rose-700 dark:text-rose-400">{trackResult.status_message}</p>
              </div>
            </div>
          )}

          {/* Interactive Google Maps-style Live Route Tracker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Live Interactive GPS Map (Google Maps View)</span>
              </h3>
              <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                100% Free Telematics • OpenStreetMap
              </span>
            </div>

            <LiveRouteMap
              pickupLocation={booking.pickup_location}
              dropLocation={booking.drop_location}
              driverName={trackResult.driver?.name}
              driverPhone={trackResult.driver?.phone}
              vehicleRegistration={trackResult.vehicle?.registration_number}
              vehicleModel={trackResult.vehicle?.model}
              tripStatus={stage}
            />
          </div>

          {/* 5-Stage Visual Progression Line */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Dispatch Progression
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {stages.map((st, idx) => {
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div
                    key={st.key}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 shadow-md ring-1 ring-blue-500/20'
                        : isPassed
                        ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
                        : 'bg-white dark:bg-slate-950/40 border-slate-100 dark:border-slate-900 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          isPassed
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isPassed ? '✓' : idx + 1}
                      </div>
                      <span className="text-xs font-bold truncate">{st.label.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">{st.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Driver Partner & Vehicle Allocation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Driver Partner Card */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Assigned Driver Partner
              </span>

              {trackResult.driver ? (
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-lg font-black text-white shadow-md shadow-blue-600/30">
                    {trackResult.driver.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{trackResult.driver.name}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[9px] font-bold">
                        {trackResult.driver.driver_code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Phone: <a href={`tel:${trackResult.driver.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">{trackResult.driver.phone}</a>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Dispatcher is reviewing available driver partners in this corridor.</span>
                </div>
              )}
            </div>

            {/* Vehicle Card */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Assigned Fleet Vehicle
              </span>

              {trackResult.vehicle ? (
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {trackResult.vehicle.model} ({trackResult.vehicle.vehicle_type})
                    </div>
                    <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                      Plate: {trackResult.vehicle.registration_number}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Vehicle pre-assignment in progress for {booking.vehicle_type} class.</span>
                </div>
              )}
            </div>
          </div>

          {/* Itinerary & Passenger Details */}
          <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Pickup & Drop</span>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">{booking.pickup_location} → {booking.drop_location}</div>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Scheduled Date</span>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">{formatDate(booking.pickup_date)}</div>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Passenger</span>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                {booking.customer?.name || booking.guest_name || 'Guest'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Search Default Live GPS Telematics Map (Always Visible Google Maps Style) */}
      {!trackResult && !loading && (
        <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl text-slate-900 dark:text-white animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Live Active Fleet Telematics (Google Maps View)</span>
              </h3>
            </div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              100% Free OpenStreetMap GPS
            </span>
          </div>

          <LiveRouteMap
            pickupLocation="Bangalore"
            dropLocation="Mysore"
            intermediateStop="Mandya"
            vehicleModel="Toyota Innova Crysta"
            tripStatus="WAITING_ASSIGNMENT"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Showing highway corridor preview. Enter your Booking ID above to track your specific ride.</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">● Real-time Route GPS Ready</span>
          </div>
        </div>
      )}

      {/* Empty Not Found State */}
      {searched && !trackResult && !loading && (
        <div className="bg-white dark:bg-slate-950 rounded-3xl border border-rose-200 dark:border-rose-900/50 p-8 sm:p-12 text-center space-y-3 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Booking Reference Not Found</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            Please check the booking code from your SMS or booking confirmation receipt and try again.
          </p>
        </div>
      )}
    </div>
  );
};
