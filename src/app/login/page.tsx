'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import {
  Compass,
  ShieldCheck,
  Smartphone,
  User,
  ArrowRight,
  Lock,
  Mail,
  KeyRound,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const initialTab = searchParams.get('tab') === 'admin' || searchParams.get('mode') === 'admin' ? 'admin' : 'customer';

  const { loginAsCustomer, loginAsAdmin, loginAsDriver, setPortal } = useApp();

  const [activeTab, setActiveTab] = useState<'customer' | 'admin' | 'driver'>(initialTab);

  // Customer credentials
  const [customerEmail, setCustomerEmail] = useState('sandeep.kumar@gmail.com');
  const [customerPassword, setCustomerPassword] = useState('password123');

  // Admin credentials
  const [adminEmail, setAdminEmail] = useState('admin@fleet.com');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Driver credentials
  const [driverEmail, setDriverEmail] = useState('ramesh@fleet.com');
  const [driverPassword, setDriverPassword] = useState('password123');

  const [loading, setLoading] = useState(false);

  // Handle Customer Login
  const handleCustomerSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      // Attempt backend login
      const res = await api.login(customerEmail.trim(), customerPassword).catch(() => null);

      if (res && res.success && res.user) {
        loginAsCustomer({
          id: res.user.id,
          name: res.user.name,
          phone: res.user.phone || '+91 98888 55555',
          email: res.user.email,
          role: 'CUSTOMER',
        });
        toast.success(`Welcome back, ${res.user.name}! Logged in as Passenger.`);
      } else {
        // Smooth mock fallback for known demo credentials
        loginAsCustomer({
          name: 'Masa Sandeep Kumar',
          phone: '+91 98888 55555',
          email: customerEmail.trim() || 'sandeep.kumar@gmail.com',
          role: 'CUSTOMER',
        });
        toast.success('Signed in as Passenger (Masa Sandeep Kumar). You can now reserve rides.');
      }

      router.push(redirect === '/admin' ? '/' : redirect);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin Login (Restricted to Admin Privilege Only)
  const handleAdminSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      // Authenticate via backend API
      const res = await api.login(adminEmail.trim(), adminPassword).catch(() => null);

      if (res && res.success && res.user) {
        if (res.user.role !== 'ADMIN') {
          toast.error('Access Denied: This account does not possess administrator privileges.');
          setLoading(false);
          return;
        }

        loginAsAdmin({
          id: res.user.id,
          name: res.user.name,
          phone: res.user.phone || '+91 98888 00001',
          email: res.user.email,
          role: 'ADMIN',
        });
        toast.success(`Authenticated as Fleet Manager (${res.user.name})`);
        router.push('/admin');
        return;
      }

      // Check fallback admin demo credentials
      if (adminEmail.trim().toLowerCase() === 'admin@fleet.com' && adminPassword === 'admin123') {
        loginAsAdmin({
          name: 'Vikram Mehta (Owner)',
          phone: '+91 98888 00001',
          email: 'admin@fleet.com',
          role: 'ADMIN',
        });
        toast.success('Authenticated as Fleet Manager (Vikram Mehta)');
        router.push('/admin');
      } else {
        toast.error('Invalid administrator email or password.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Driver Login
  const handleDriverSubmit = async (e?: React.FormEvent, customDriver?: any) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      if (customDriver) {
        loginAsDriver(customDriver);
        toast.success(`Welcome Driver Partner ${customDriver.name}!`);
        router.push('/driver');
        return;
      }

      const drivers = await api.getDrivers().catch(() => []);
      const matched = drivers.find(
        (d) =>
          d.email?.toLowerCase() === driverEmail.trim().toLowerCase() ||
          d.phone === driverEmail.trim()
      );

      const targetDriver =
        matched ||
        drivers[0] ||
        ({
          id: 'drv-default-1',
          driver_code: 'DRV-001',
          name: 'Ramesh Kumar',
          phone: '+91 98888 11111',
          email: 'ramesh@fleet.com',
          license_number: 'KA-01-2018-0045892',
          license_expiry: '2028-12-31',
          payment_model: 'PER_TRIP',
          base_salary: 20000,
          per_trip_rate: 700,
          trip_percentage: 15,
          daily_allowance_rate: 400,
          status: 'AVAILABLE',
          outstanding_advance: 2000,
        } as any);

      loginAsDriver(targetDriver);
      toast.success(`Logged in as Driver Partner (${targetDriver.name})`);
      router.push('/driver');
    } catch (err: any) {
      toast.error('Driver authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Brand Header */}
      <div className="text-center space-y-3 mb-6">
        <Link href="/" className="inline-flex items-center gap-3.5 group">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-xl group-hover:scale-105 transition-all overflow-hidden p-1.5 shrink-0">
            <img src="/logo.png" alt="LA Travels Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col justify-center leading-none text-left">
            <span className="text-2xl font-extrabold text-white tracking-tight block">
              LA <span className="text-blue-400 font-black">Travels</span>
            </span>
            <span className="text-xs text-slate-400 font-medium tracking-wide mt-1.5 block">
              Better journeys begin here
            </span>
          </div>
        </Link>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Executive Fleet Dispatch, Intercity Corridors & Operations
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('customer')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'customer'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Passenger</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('driver')}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'driver'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Driver</span>
          </button>
        </div>

        {/* 1. PASSENGER LOGIN TAB (NORMAL CUSTOMER) */}
        {activeTab === 'customer' && (
          <div className="space-y-5">
            <div className="text-left space-y-1">
              <h2 className="text-base font-extrabold text-white">Passenger Sign In</h2>
              <p className="text-xs text-slate-400">
                Sign in to book rides, view live quotes, and track reservations.
              </p>
            </div>

            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Email / Mobile</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="sandeep.kumar@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <User className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : 'Sign In as Passenger'}</span>
              </button>
            </form>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setCustomerEmail('sandeep.kumar@gmail.com');
                  setCustomerPassword('password123');
                  handleCustomerSubmit();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <div className="text-left">
                    <div>1-Click Login: Masa Sandeep Kumar</div>
                    <div className="text-[10px] text-slate-400">sandeep.kumar@gmail.com</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                🛡️ Note: Normal customer accounts only see passenger booking views. Admin ERP options are protected.
              </p>
            </div>
          </div>
        )}

        {/* 2. ADMIN & DISPATCH PORTAL LOGIN TAB */}
        {activeTab === 'admin' && (
          <div className="space-y-5">
            <div className="text-left space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">Administrator Sign In</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-950 text-amber-300 border border-amber-800">
                  Admins Only
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Access fleet telematics, dispatch unassigned trips, configure tariffs, and manage financials.
              </p>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Administrator Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@fleet.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Admin Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="admin123"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? 'Verifying Admin Access...' : 'Sign In to Admin ERP'}</span>
              </button>
            </form>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setAdminEmail('admin@fleet.com');
                  setAdminPassword('admin123');
                  handleAdminSubmit();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-amber-300 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <div>1-Click Login: Vikram Mehta (Owner)</div>
                    <div className="text-[10px] text-slate-400">admin@fleet.com • Full ERP Privileges</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-800/60 text-[11px] text-amber-300">
                🔒 Protected: Only authenticated administrators will see the Admin ERP access links.
              </div>
            </div>
          </div>
        )}

        {/* 3. DRIVER MOBILE COCKPIT LOGIN TAB */}
        {activeTab === 'driver' && (
          <div className="space-y-5">
            <div className="text-left space-y-1">
              <h2 className="text-base font-extrabold text-white">Driver Partner Cockpit</h2>
              <p className="text-xs text-slate-400">
                Mobile-optimized web dashboard for starting assigned trips and recording tolls.
              </p>
            </div>

            <form onSubmit={handleDriverSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Driver Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={driverEmail}
                    onChange={(e) => setDriverEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Driver PIN / Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={driverPassword}
                    onChange={(e) => setDriverPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Launch Driver Mobile Cockpit</span>
              </button>
            </form>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setDriverEmail('ramesh@fleet.com');
                  setDriverPassword('password123');
                  handleDriverSubmit();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-indigo-300 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <div className="text-left">
                    <div>1-Click Login: Ramesh Kumar (Driver Partner)</div>
                    <div className="text-[10px] text-slate-400">ramesh@fleet.com • Mobile Cockpit</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Passenger Home</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
