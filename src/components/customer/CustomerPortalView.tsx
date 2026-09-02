'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { VehicleType, PriceEstimateResult, Booking } from '@/types';
import { formatINR, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Car,
  MapPin,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  Shield,
  Phone,
  User,
  ArrowRight,
  Luggage,
} from 'lucide-react';

interface VehicleOption {
  type: VehicleType;
  name: string;
  category: string;
  image: string;
  passengers: number;
  luggage: string;
  basePrice: number;
  features: string[];
}

const VEHICLE_CATALOG: VehicleOption[] = [
  {
    type: 'SEDAN',
    name: 'Honda City / Dzire',
    category: 'Comfort Executive Sedan',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=60',
    passengers: 4,
    luggage: '2 Large Bags',
    basePrice: 3000,
    features: ['Air Conditioning', 'Professional Driver Partner', 'Fastag Enabled', 'Bluetooth Audio'],
  },
  {
    type: 'INNOVA',
    name: 'Toyota Innova Crysta',
    category: 'Flagship 7-Seater MPV',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=60',
    passengers: 7,
    luggage: '4 Large Bags',
    basePrice: 4500,
    features: ['Captain Seats', 'Rear AC Vents', 'Outstation Highway King', 'Generous Boot Space'],
  },
  {
    type: 'SUV',
    name: 'Kia Carens Luxury',
    category: 'Premium 6-Seater Family SUV',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=60',
    passengers: 6,
    luggage: '3 Bags',
    basePrice: 4000,
    features: ['Dual Sunroof', 'Ambient Lighting', 'Smooth Highway Ride', 'Spacious Seating'],
  },
  {
    type: 'LUXURY',
    name: 'Mercedes-Benz E-Class',
    category: 'VIP Delegation Limousine',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=60',
    passengers: 4,
    luggage: '3 Luxury Bags',
    basePrice: 12000,
    features: ['Executive Recline', 'Burmester Audio', 'VIP Driver Partner in Uniform', 'Bottled Mineral Water'],
  },
];

export const CustomerPortalView: React.FC = () => {
  const [pickup, setPickup] = useState('Bangalore City (Indiranagar / MG Road)');
  const [drop, setDrop] = useState('Kempegowda International Airport (BLR)');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:00 AM');
  const [passengers, setPassengers] = useState(2);

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption>(VEHICLE_CATALOG[0]);
  const [quote, setQuote] = useState<PriceEstimateResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Booking Form Modal / Panel
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleGetQuotes = async () => {
    if (!pickup || !drop) return toast.error('Please enter pickup and drop locations');
    setCalculating(true);
    try {
      const q = await api.calculateQuote({
        pickup_location: pickup,
        drop_location: drop,
        vehicle_type: selectedVehicle.type,
        travel_time: time,
      });
      setQuote(q);
      toast.success('Instant transparent quote computed!');
    } catch (e) {
      toast.error('Failed to get quote');
    } finally {
      setCalculating(false);
    }
  };

  const handleSelectVehicle = async (veh: VehicleOption) => {
    setSelectedVehicle(veh);
    setCalculating(true);
    try {
      const q = await api.calculateQuote({
        pickup_location: pickup,
        drop_location: drop,
        vehicle_type: veh.type,
        travel_time: time,
      });
      setQuote(q);
    } catch (e) {
      // fallback
    } finally {
      setCalculating(false);
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) return toast.error('Name and Phone are required');

    setSubmitting(true);
    try {
      const finalPrice = quote?.total_estimated_price || selectedVehicle.basePrice;
      const bkg = await api.createBooking({
        guest_name: guestName,
        guest_phone: guestPhone,
        guest_email: guestEmail || undefined,
        pickup_location: pickup,
        drop_location: drop,
        pickup_date: date,
        pickup_time: time,
        passenger_count: Number(passengers),
        vehicle_type: selectedVehicle.type,
        estimated_price: Number(finalPrice),
        notes,
      });

      setBookingConfirmed(bkg);
      setIsBookingOpen(false);
      toast.success(`Booking Confirmed! Reference Code: ${bkg.booking_code}`);
    } catch (err: any) {
      toast.error('Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-900/40 p-8 sm:p-10 shadow-2xl overflow-hidden text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700/60 text-xs font-bold text-indigo-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Premium Fleet & Airport Transfers</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Reserve Your Luxury Ride in Minutes
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Transparent flat pricing, verified professional driver partners, on-time guarantee, and 24/7 dedicated flight tracking.
        </p>

        {/* Route Selector Bar */}
        <div className="bg-slate-950/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-2xl text-left grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pickup Location</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Drop Destination</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-rose-400" />
              <input
                type="text"
                value={drop}
                onChange={(e) => setDrop(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGetQuotes}
              disabled={calculating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              {calculating ? 'Calculating...' : 'Search Fleet & Rates'}
            </button>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Receipt Alert */}
      {bookingConfirmed && (
        <div className="bg-emerald-950/80 p-6 rounded-2xl border border-emerald-700/80 shadow-2xl space-y-3 animate-in zoom-in-95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Your Booking is Confirmed!</h3>
              <p className="text-xs text-emerald-300">
                Booking Reference ID: <strong className="font-mono text-white text-sm">{bookingConfirmed.booking_code}</strong>
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-emerald-900 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
            <div>
              <span className="text-slate-400">Route:</span>
              <div className="font-semibold text-white">{bookingConfirmed.pickup_location} → {bookingConfirmed.drop_location}</div>
            </div>
            <div>
              <span className="text-slate-400">Date & Time:</span>
              <div className="font-semibold text-white">{formatDate(bookingConfirmed.pickup_date)} at {bookingConfirmed.pickup_time}</div>
            </div>
            <div>
              <span className="text-slate-400">Vehicle Category:</span>
              <div className="font-semibold text-indigo-300">{bookingConfirmed.vehicle_type}</div>
            </div>
            <div>
              <span className="text-slate-400">Fare:</span>
              <div className="font-extrabold text-emerald-400">{formatINR(bookingConfirmed.estimated_price)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Fleet Catalog Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">Available Vehicles for this Route</h2>
            <p className="text-xs text-slate-400">Select your preferred vehicle type</p>
          </div>
          {quote && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700">
              Live Fare: {formatINR(quote.total_estimated_price)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VEHICLE_CATALOG.map((veh) => {
            const isSelected = selectedVehicle.type === veh.type;
            const fare = isSelected && quote ? quote.total_estimated_price : veh.basePrice;

            return (
              <div
                key={veh.type}
                onClick={() => handleSelectVehicle(veh)}
                className={`bg-slate-950 rounded-2xl border ${
                  isSelected
                    ? 'border-emerald-500 shadow-2xl shadow-emerald-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                } overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between`}
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img src={veh.image} alt={veh.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-slate-950/90 px-3 py-1 rounded-lg text-xs font-bold text-white border border-slate-700">
                      {veh.category}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-extrabold text-white">{veh.name}</h3>
                      <div className="text-lg font-black text-emerald-400">{formatINR(fare)}</div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-300 py-1 border-y border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-400" />
                        <span>Up to {veh.passengers} Seats</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Luggage className="w-4 h-4 text-amber-400" />
                        <span>{veh.luggage}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {veh.features.map((f, i) => (
                        <div key={i} className="text-[11px] text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVehicle(veh);
                      setIsBookingOpen(true);
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700'
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

      {/* Booking Form Panel / Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white">Passenger Details & Confirmation</h3>
                <p className="text-xs text-slate-400">
                  Vehicle: <strong className="text-indigo-400">{selectedVehicle.name}</strong> • Fare:{' '}
                  <strong className="text-emerald-400">
                    {formatINR(quote?.total_estimated_price || selectedVehicle.basePrice)}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setIsBookingOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Passenger Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Mobile Phone *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 98888 55555"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="passenger@gmail.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Flight Number / Instructions</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Flight 6E-204 landing at 08:30 AM"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20"
                >
                  {submitting ? 'Confirming...' : 'Confirm & Reserve Ride'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
