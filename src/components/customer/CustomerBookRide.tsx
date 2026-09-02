'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { VehicleType, Booking, AdminRoute } from '@/types';
import { formatINR, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Car,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Luggage,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Compass,
  Milestone,
  ArrowRightCircle,
  UserCheck,
  Lock,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { DatePicker } from '@/components/common/DatePicker';

interface VehicleCardOption {
  type: VehicleType;
  name: string;
  category: string;
  passengers: number;
  luggage: string;
  basePrice: number;
  perKm: number;
  features: string[];
  image: string;
}

const DEFAULT_VEHICLES: VehicleCardOption[] = [
  {
    type: 'SEDAN',
    name: 'Executive Sedan (Honda City / Ciaz)',
    category: 'Sedan Class',
    passengers: 4,
    luggage: '2 Large + 2 Small Bags',
    basePrice: 3000,
    perKm: 14,
    features: ['Air Conditioned', 'FASTag Enabled', 'Bottled Water', 'Professional Driver Partner'],
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
  },
  {
    type: 'INNOVA',
    name: 'Toyota Innova Crysta VIP',
    category: 'Premium MUV',
    passengers: 7,
    luggage: '4 Large + 3 Small Bags',
    basePrice: 4500,
    perKm: 19,
    features: ['Captain Recliner Seats', 'Rear AC Vents', 'Highway Suspension', 'Executive Driver Partner'],
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
  },
  {
    type: 'SUV',
    name: 'Premium Full-Size SUV (Fortuner)',
    category: 'High Stature SUV',
    passengers: 6,
    luggage: '3 Large Bags',
    basePrice: 6500,
    perKm: 24,
    features: ['4x4 Capability', 'Leather Upholstery', 'Panoramic Sunroof', 'VIP Security Cleared'],
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=800',
  },
  {
    type: 'LUXURY',
    name: 'Mercedes-Benz E-Class Executive',
    category: 'Ultra Luxury Livery',
    passengers: 3,
    luggage: '2 Large Suitcases',
    basePrice: 12000,
    perKm: 55,
    features: ['Burmester Surround Audio', 'Driver Partner in Black Tie', 'Executive Armrest', 'Rear Vanity'],
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800',
  },
];

export const CustomerBookRide: React.FC = () => {
  const router = useRouter();
  const { currentUser, setTrackedBookingCode, addNotification } = useApp();
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const searchCardRef = useRef<HTMLDivElement>(null);

  // Quick In-View Category Filter
  const [vehicleCategoryFilter, setVehicleCategoryFilter] = useState<'ALL' | 'SEDAN' | 'INNOVA' | 'SUV' | 'LUXURY'>('ALL');

  // Search parameters
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Mode: Single Trip or Multi-Car
  const [bookingMode, setBookingMode] = useState<'TRIP' | 'MULTI_CAR'>('TRIP');
  const [innovaCount, setInnovaCount] = useState<number>(1);
  const [sedanCount, setSedanCount] = useState<number>(0);

  // Search states & Results
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [availableVehicles, setAvailableVehicles] = useState<VehicleCardOption[]>([]);

  // Selected vehicle for booking modal
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleCardOption | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Passenger input states
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Confirmed booking state
  const [bookingConfirmed, setBookingConfirmed] = useState<Booking | null>(null);

  // Admin routes loaded for quick selection and route directory
  const [adminRoutes, setAdminRoutes] = useState<AdminRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');

  useEffect(() => {
    api.getRoutes()
      .then((routes) => {
        setAdminRoutes(routes);
        if (routes.length > 0) {
          setSelectedRouteId(routes[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Sync traveler inputs when currentUser updates
  useEffect(() => {
    if (currentUser) {
      setGuestName(currentUser.name || '');
      setGuestPhone(currentUser.phone || '');
      setGuestEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleRouteDropdownChange = (routeId: string) => {
    setSelectedRouteId(routeId);
    const matched = adminRoutes.find((r) => r.id === routeId);
    if (matched) {
      setPickup(matched.origin_name);
      setDrop(matched.destination_name);
    }
  };

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!pickup.trim() || !drop.trim()) {
      toast.error('Please enter both pickup and destination locations');
      return;
    }

    setSearching(true);
    setHasSearched(true);
    setSelectedVehicle(null);
    setQuote(null);
    setBookingConfirmed(null);

    try {
      const res = await api.searchRoute(pickup.trim(), drop.trim());
      setSearchResult(res);

      if (res.found && res.data) {
        const routeData = res.data;
        const pricingRules = routeData.pricing_rules || [];

        let dynamicVehicles: VehicleCardOption[] = [];

        if (pricingRules.length > 0) {
          dynamicVehicles = pricingRules.map((p: any) => {
            const template = DEFAULT_VEHICLES.find((v) => v.type === p.vehicle_type) || DEFAULT_VEHICLES[0];
            return {
              ...template,
              type: p.vehicle_type,
              basePrice: p.base_price,
              perKm: p.per_km_rate || template.perKm,
            };
          });
        } else {
          dynamicVehicles = DEFAULT_VEHICLES.map((v) => {
            const distance = routeData.distance_km || 150;
            const computedPrice = Math.max(v.basePrice, distance * v.perKm + (routeData.toll_cost_estimate || 0));
            return {
              ...v,
              basePrice: Math.round(computedPrice),
            };
          });
        }

        setAvailableVehicles(dynamicVehicles);

        setTimeout(() => {
          resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);

        if (routeData.is_intermediate) {
          toast.success(
            `Matched Corridor (${routeData.origin_name} → ${routeData.destination_name}) via stop: ${routeData.matched_stop}!`,
            { icon: '📍' }
          );
        } else {
          toast.success(`Direct corridor found: ${routeData.origin_name} to ${routeData.destination_name}!`);
        }
      } else {
        setAvailableVehicles([]);
        toast.info(res.message || 'No active routes found for this search.');
      }
    } catch (err: any) {
      console.warn('Search route API error, checking fallback quote:', err);
      try {
        const quoteRes = await api.getQuote({ origin: pickup.trim(), destination: drop.trim(), vehicle_type: 'SEDAN' });
        if (quoteRes && quoteRes.total_estimated_price > 0) {
          const dynamicVehicles = DEFAULT_VEHICLES.map((v) => ({
            ...v,
            basePrice: Math.round(v.type === 'SEDAN' ? quoteRes.total_estimated_price : quoteRes.total_estimated_price * 1.35),
          }));
          setAvailableVehicles(dynamicVehicles);
          setSearchResult({
            found: true,
            data: {
              origin_name: pickup,
              destination_name: drop,
              distance_km: quoteRes.estimated_distance_km || 140,
              match_description: `Custom Highway Corridor: ${pickup} ➔ ${drop}`,
            },
          });
          setTimeout(() => {
            resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
          toast.success(`Corridor quote calculated: ${pickup} to ${drop}!`);
          return;
        }
      } catch (fallbackErr) {}

      setSearchResult(null);
      setAvailableVehicles([]);
      toast.info(`No active corridor found between "${pickup}" and "${drop}". Please select one of our popular settled routes below.`);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectVehicle = async (veh: VehicleCardOption) => {
    if (!currentUser) {
      toast.error('Authentication required: Please log in to reserve your ride.', {
        duration: 4000,
        icon: '🔒',
      });
      router.push('/login?redirect=/');
      return;
    }

    setSelectedVehicle(veh);
    if (!pickup.trim() || !drop.trim()) return;

    try {
      const q = await api.getQuote({
        origin: pickup.trim(),
        destination: drop.trim(),
        vehicle_type: veh.type,
      });
      setQuote(q);
    } catch (e) {
      setQuote({
        total_estimated_price: veh.basePrice,
        base_price: veh.basePrice,
        toll_estimate: 250,
      });
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Authentication required: Please log in to complete your booking.');
      router.push('/login?redirect=/');
      return;
    }

    if (!selectedVehicle) return;

    setBookingSubmitting(true);
    try {
      const payload: any = {
        pickup_location: pickup,
        drop_location: drop,
        pickup_date: date,
        pickup_time: '09:00 AM',
        vehicle_type: selectedVehicle.type,
        passenger_count: 1,
        estimated_price: selectedVehicle.basePrice || (quote?.total_estimated_price || 2500),
        guest_name: guestName.trim() || currentUser?.name || 'Masa Sandeep Kumar',
        guest_phone: guestPhone.trim() || currentUser?.phone || '+91 98888 77777',
        guest_email: guestEmail.trim() || currentUser?.email || 'sandeep.kumar@gmail.com',
        notes: specialInstructions || undefined,
        special_instructions: specialInstructions || undefined,
      };

      if (bookingMode === 'MULTI_CAR') {
        payload.is_multi_car = true;
        payload.innova_count = innovaCount;
        payload.sedan_count = sedanCount;
      }

      const confirmed = await api.createBooking(payload);
      const userEmail = currentUser?.email || confirmed.guest_email || 'registered.customer@latravels.com';

      // Dispatch in-app notification
      addNotification({
        title: `Booking Confirmed: ${confirmed.booking_code}`,
        message: `Ride from ${pickup} to ${drop} on ${formatDate(date)} confirmed. Details sent to registered mail.`,
        type: 'BOOKING',
        bookingCode: confirmed.booking_code,
      });

      setBookingConfirmed(confirmed);
      setIsBookingOpen(false);
      toast.success(
        `Booking ${confirmed.booking_code} Confirmed! Full itinerary & tax invoice dispatched to ${userEmail}.`,
        { duration: 8000 }
      );

      // Clear guest inputs
      setGuestName('');
      setGuestPhone('');
      setGuestEmail('');
      setSpecialInstructions('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to submit booking');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleSelectRouteFromDirectory = (r: AdminRoute) => {
    setPickup(r.origin_name);
    setDrop(r.destination_name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      handleSearchSubmit();
    }, 150);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-4 sm:py-6 px-4">
      {/* Hero Section - Perfectly Harmonized for Light and Dark Modes */}
      <div ref={searchCardRef} className="relative rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-2xl text-center space-y-6 transition-colors">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-xs font-bold text-blue-700 dark:text-blue-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>India&apos;s Trusted Driver Partner Fleet & Highway Travel</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Executive Intercity Travel
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Search corridors and intermediate locations to view available vehicles and transparent settled pricing.
        </p>

        {/* Clean Options: Single Trip vs Multi-Car Booking */}
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-extrabold shadow-inner">
          <button
            onClick={() => setBookingMode('TRIP')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all ${
              bookingMode === 'TRIP'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Trip (Single Ride)</span>
          </button>
          <button
            onClick={() => setBookingMode('MULTI_CAR')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all ${
              bookingMode === 'MULTI_CAR'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Multi-Car Booking (Convoy / Events)</span>
          </button>
        </div>

        {/* Quick Corridor Selector (Direct from Admin Routes) */}
        {adminRoutes.length > 0 && (
          <div className="max-w-xl mx-auto bg-slate-50 dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-semibold pl-1 shrink-0 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Select Settled Route:</span>
            </span>
            <select
              value={selectedRouteId}
              onChange={(e) => handleRouteDropdownChange(e.target.value)}
              className="flex-1 min-w-0 w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold focus:outline-none focus:border-blue-500 truncate shadow-sm"
            >
              {adminRoutes.map((r) => (
                <option key={r.id} value={r.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {r.origin_name} → {r.destination_name} ({r.distance_km} km)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Main Search Bar: Perfectly Aligned 3-Column Cockpit */}
        <div className="bg-slate-50 dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl text-left space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* Column 1: Pickup */}
            <div className="space-y-1.5">
              <div className="h-5 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pickup / Origin
                </label>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                  Doorstep Pickup
                </span>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-400" />
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="e.g. Bangalore"
                  className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>

            {/* Column 2: Drop */}
            <div className="space-y-1.5">
              <div className="h-5 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Drop Destination / Waypoint
                </label>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Intermediate Search
                </span>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 dark:text-amber-400" />
                <input
                  type="text"
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                  placeholder="e.g. Mysore, Mandya..."
                  className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>

            {/* Column 3: Travel Date */}
            <div className="space-y-1.5">
              <div className="h-5 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Travel Date
                </label>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                  Stable Calendar
                </span>
              </div>
              <DatePicker
                value={date}
                onChange={setDate}
                minDate={new Date().toISOString().split('T')[0]}
                hideLabel
                triggerClassName="h-12 border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Full-width corridor & waypoint chips bar */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-[11px]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Popular Origins:</span>
              {['Bangalore', 'Chennai', 'Mysore'].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setPickup(city)}
                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-all shadow-xs"
                >
                  {city}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Waypoints:</span>
              {['Mandya', 'Ramanagara', 'Mahabalipuram'].map((stop) => (
                <button
                  key={stop}
                  type="button"
                  onClick={() => setDrop(stop)}
                  className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 hover:border-amber-400 text-amber-800 dark:text-amber-300 hover:text-amber-900 font-semibold transition-all shadow-xs"
                >
                  📍 {stop}
                </button>
              ))}
            </div>
          </div>

          {/* Multi-Car Convoy Allocation (When in Multi-Car Mode) */}
          {bookingMode === 'MULTI_CAR' && (
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-900/50 space-y-3">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Multi-Car Convoy Quantities</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Toyota Innova Crysta (7-Seater)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={innovaCount}
                      onChange={(e) => setInnovaCount(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">@ ₹4,500/car</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Executive Sedan (Honda City)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={sedanCount}
                      onChange={(e) => setSedanCount(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">@ ₹3,000/car</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Total Fleet: <strong>{innovaCount + sedanCount} Vehicles</strong></span>
                <span>Convoy Fare: <strong className="text-blue-600 dark:text-blue-400">{formatINR(innovaCount * 4500 + sedanCount * 3000)}</strong></span>
              </div>
            </div>
          )}

          {/* Search Button */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleSearchSubmit}
              disabled={searching}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{searching ? 'Searching Routes & Vehicles...' : 'Search Fleet & Rates'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Receipt Banner */}
      {bookingConfirmed && (
        <div className="bg-blue-50 dark:bg-blue-950/40 p-6 sm:p-8 rounded-3xl border border-blue-200 dark:border-blue-800/80 shadow-xl space-y-4 animate-in zoom-in-95 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Your Booking is Confirmed!</h3>
                <p className="text-xs text-slate-600 dark:text-blue-300 mt-0.5">
                  Reference Code: <strong className="font-mono text-blue-700 dark:text-white text-base tracking-wide">{bookingConfirmed.booking_code}</strong>
                </p>
              </div>
            </div>

            <Link
              href={`/track?code=${bookingConfirmed.booking_code}`}
              onClick={() => setTrackedBookingCode(bookingConfirmed.booking_code)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all text-center"
            >
              Track Live Dispatch ({bookingConfirmed.booking_code}) →
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-950/80 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600 dark:text-slate-300 shadow-sm">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Route:</span>
              <div className="font-bold text-slate-900 dark:text-white truncate">{bookingConfirmed.pickup_location} → {bookingConfirmed.drop_location}</div>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Travel Date:</span>
              <div className="font-bold text-slate-900 dark:text-white">{formatDate(bookingConfirmed.pickup_date)}</div>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Vehicle Category:</span>
              <div className="font-bold text-blue-600 dark:text-blue-400">{bookingConfirmed.vehicle_type}</div>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Total Confirmed Fare:</span>
              <div className="font-black text-blue-600 dark:text-blue-400 text-sm">{formatINR(bookingConfirmed.estimated_price)}</div>
            </div>
          </div>

          {/* Registered Email Dispatched Confirmation Notice */}
          <div className="p-3.5 rounded-2xl bg-blue-100/70 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/80 text-xs text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-base">📧</span>
              <span>
                Booking confirmation, driver partner dispatch alerts, and GST invoice sent to registered email:{' '}
                <strong className="font-mono underline text-blue-950 dark:text-white">
                  {currentUser?.email || bookingConfirmed.guest_email || 'registered.customer@latravels.com'}
                </strong>
              </span>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-600 text-white shrink-0 shadow-sm self-start sm:self-auto">
              ● Confirmed • Dispatch in Progress
            </span>
          </div>
        </div>
      )}

      {/* Available Vehicles Section - ONLY DISPLAYED AFTER SEARCH IS HIT */}
      {hasSearched ? (
        availableVehicles.length > 0 ? (
          <div ref={resultsSectionRef} className="space-y-5 animate-in fade-in duration-300">
            {/* IN-VIEW QUICK CONTROL BAR - User can switch categories & features directly without scrolling up */}
            <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">Active Route: {pickup} → {drop}</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Date: <strong className="text-slate-800 dark:text-slate-200">{formatDate(date)}</strong> • {availableVehicles.length} vehicles verified for this corridor
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => searchCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <span>✎ Modify Route / Date</span>
                  </button>
                </div>
              </div>

              {/* In-View Category & Feature Switcher Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mr-1 flex items-center gap-1 shrink-0">
                  <Filter className="w-3 h-3" /> Class:
                </span>
                <button
                  type="button"
                  onClick={() => setVehicleCategoryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                    vehicleCategoryFilter === 'ALL'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  All Fleet ({availableVehicles.length})
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleCategoryFilter('SEDAN')}
                  className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                    vehicleCategoryFilter === 'SEDAN'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Executive Sedans
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleCategoryFilter('INNOVA')}
                  className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                    vehicleCategoryFilter === 'INNOVA'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Toyota Innova MUVs
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleCategoryFilter('SUV')}
                  className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                    vehicleCategoryFilter === 'SUV'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Premium SUVs
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleCategoryFilter('LUXURY')}
                  className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                    vehicleCategoryFilter === 'LUXURY'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  VIP Luxury (Mercedes)
                </button>
              </div>

              {/* Login Banner Reminder if User is not logged in */}
              {!currentUser && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                    <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Viewing as guest. <strong>Log in required</strong> before reserving to receive confirmation email & invoice.</span>
                  </div>
                  <Link
                    href="/login?redirect=/"
                    className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm self-start sm:self-auto shrink-0 transition-colors"
                  >
                    Log In Now
                  </Link>
                </div>
              )}
            </div>

            {/* Grid of Vehicles filtered by in-view category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableVehicles
                .filter((veh) => {
                  if (vehicleCategoryFilter === 'ALL') return true;
                  return veh.type === vehicleCategoryFilter;
                })
                .map((veh) => {
                  const isSelected = selectedVehicle?.type === veh.type;

                  return (
                    <div
                      key={veh.type}
                      onClick={() => handleSelectVehicle(veh)}
                      className={`bg-white dark:bg-slate-950 rounded-3xl border ${
                      isSelected
                        ? 'border-blue-600 shadow-2xl shadow-blue-600/15 ring-2 ring-blue-600'
                        : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm'
                    } overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between`}
                  >
                    <div>
                      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                        <img src={veh.image} alt={veh.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-950/90 px-3 py-1 rounded-lg text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm">
                          {veh.category}
                        </div>
                      </div>

                      <div className="p-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{veh.name}</h3>
                          <div className="text-xl font-black text-blue-600 dark:text-blue-400">{formatINR(veh.basePrice)}</div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 py-1.5 border-y border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Up to {veh.passengers} Seats</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Luggage className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                            <span>{veh.luggage}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          {veh.features.map((f, i) => (
                            <div key={i} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                              <span className="truncate">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVehicle(veh);
                          setIsBookingOpen(true);
                        }}
                        className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span>Instant Reserve Ride</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* NONE ARE PRESENT EMPTY STATE */
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-rose-200 dark:border-rose-900/50 p-8 sm:p-12 text-center space-y-4 shadow-xl animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">No Vehicles Available for this Route</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                We currently do not operate direct fleet between <strong className="text-rose-600 dark:text-rose-400">{pickup}</strong> and <strong className="text-rose-600 dark:text-rose-400">{drop}</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg mx-auto text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <p className="font-semibold text-slate-900 dark:text-slate-200">
                💡 Tip: Choose from our officially settled highway corridors and intermediate stops below:
              </p>
              <div className="flex flex-wrap gap-2 justify-center pt-1">
                {adminRoutes.slice(0, 4).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRouteFromDirectory(r)}
                    className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 hover:border-blue-400 text-xs font-semibold transition-all"
                  >
                    {r.origin_name} → {r.destination_name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      ) : (
        /* PRE-SEARCH STATE */
        <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-4 shadow-sm transition-colors">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Corridor Network & Driver Partner Standards</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Enter your pickup, drop, and travel date above to view verified available fleet vehicles with guaranteed fixed rates.
            </p>
          </div>
        </div>
      )}

      {/* Corridor & Route Directory */}
      <div id="coverage-routes" className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Popular Highway Corridors</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Settled routes with fixed distance rates and verified intermediate boarding points.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            {adminRoutes.length} Active Corridors
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminRoutes.map((r) => {
            const hasStops = r.stops_list && r.stops_list.length > 0;
            return (
              <div
                key={r.id}
                className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{r.distance_km} km</span>
                    <span className="text-slate-500 dark:text-slate-400">~{r.estimated_duration_hours} hrs</span>
                  </div>

                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {r.origin_name} → {r.destination_name}
                  </div>

                  {hasStops && r.stops_list && r.stops_list.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1">
                        <Milestone className="w-3 h-3 text-amber-500" />
                        <span>Intermediate Stops ({r.stops_list.length})</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {r.stops_list.slice(0, 3).map((st, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-[10px]"
                          >
                            {st}
                          </span>
                        ))}
                        {r.stops_list.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{r.stops_list.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {r.pricing_rules && r.pricing_rules.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 pt-2">
                      {r.pricing_rules.slice(0, 2).map((rule) => (
                        <div key={rule.id} className="text-[11px] bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg flex justify-between text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent">
                          <span>{rule.vehicle_type}:</span>
                          <span className="text-blue-600 dark:text-blue-400 font-bold">{formatINR(rule.base_price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleSelectRouteFromDirectory(r)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Select & Search Available Vehicles</span>
                  <ArrowRightCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Checkout Modal */}
      {isBookingOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl text-slate-900 dark:text-white transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="pr-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">Passenger Details & Confirmation</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {bookingMode === 'MULTI_CAR' ? (
                    <>Convoy: <strong className="text-blue-600 dark:text-blue-400">{innovaCount} Innovas + {sedanCount} Sedans</strong></>
                  ) : (
                    <>Vehicle: <strong className="text-blue-600 dark:text-blue-400">{selectedVehicle.name}</strong></>
                  )} • Total Fare:{' '}
                  <strong className="text-blue-600 dark:text-blue-400">
                    {formatINR(bookingMode === 'MULTI_CAR' ? innovaCount * 4500 + sedanCount * 3000 : quote?.total_estimated_price || selectedVehicle.basePrice)}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setIsBookingOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-bold p-1 shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Clean Selectable Passenger Choice (Never directly filled) */}
            {currentUser && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Who is traveling?</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGuestName(currentUser.name);
                      setGuestPhone(currentUser.phone);
                      setGuestEmail(currentUser.email);
                      toast.success('Autofilled saved account details');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      guestName === currentUser.name && guestPhone === currentUser.phone
                        ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-600 ring-1 ring-blue-600/30 text-blue-950 dark:text-white'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="truncate">Myself (Autofill)</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {currentUser.name} ({currentUser.phone})
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGuestName('');
                      setGuestPhone('');
                      setGuestEmail('');
                      toast.info('Cleared inputs for guest passenger');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      guestName !== currentUser.name
                        ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-600 ring-1 ring-blue-600/30 text-blue-950 dark:text-white'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="truncate">Guest / Someone Else</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      Enter different traveler info
                    </div>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleConfirmBooking} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Passenger Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Anand Mahindra"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number (SMS Updates) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 98888 12345"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address (Receipt)
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="guest@domain.com"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Driver Partner Instructions / Flight Number
                </label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Please bring an umbrella, arriving on IndiGo 6E-241"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>

              {/* Price Breakdown */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Base Rate & Fuel:</span>
                  <span className="text-slate-900 dark:text-white font-medium">{formatINR(quote?.base_price || selectedVehicle.basePrice)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>FASTag & Highway Tolls:</span>
                  <span className="text-slate-900 dark:text-white font-medium">{formatINR(quote?.toll_estimate || 250)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Professional Driver Partner & Hospitality:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Included</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800 font-black text-slate-900 dark:text-white text-sm">
                  <span>Total Payable:</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {formatINR(bookingMode === 'MULTI_CAR' ? innovaCount * 4500 + sedanCount * 3000 : quote?.total_estimated_price || selectedVehicle.basePrice)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 active:scale-95 transition-all"
                >
                  {bookingSubmitting ? 'Confirming...' : 'Confirm & Dispatch Ride'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
