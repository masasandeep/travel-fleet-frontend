'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import {
  ShieldCheck,
  Smartphone,
  User,
  Mail,
  KeyRound,
  ArrowLeft,
  Phone,
  CheckCircle2,
  Lock,
  Home,
} from 'lucide-react';
import { toast } from 'sonner';

type RoleTab = 'admin' | 'customer' | 'driver';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const {
    tenant,
    tenantsList,
    switchTenant,
    loginAsCustomer,
    loginAsAdmin,
    loginAsDriver,
  } = useApp();

  const [activeTab, setActiveTab] = useState<RoleTab>('admin');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Sign In inputs (empty by default)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up inputs
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  const [loading, setLoading] = useState(false);

  // Switch Tab Helper
  const handleTabChange = (tab: RoleTab) => {
    setActiveTab(tab);
    setMode('signin');
    setEmail('');
    setPassword('');
  };

  // Sign In Execution
  const executeLogin = async (targetEmail: string, targetPassword: string, roleHint: RoleTab) => {
    if (!targetEmail || !targetPassword) {
      toast.error('Please enter your email and password');
      return;
    }

    setLoading(true);

    try {
      const res = await api.login(targetEmail, targetPassword).catch((err) => {
        const msg = err?.response?.data?.message || 'Invalid email or password';
        throw new Error(msg);
      });

      if (res && res.success && res.user) {
        const user = res.user;

        if (user.role === 'ADMIN' || roleHint === 'admin') {
          loginAsAdmin({
            id: user.id,
            name: user.name,
            phone: user.phone || '+91 98888 00001',
            email: user.email,
            role: 'ADMIN',
          });
          toast.success(`Welcome back, ${user.name}! Authenticated to Fleet ERP.`);
          router.push(redirect === '/' ? '/admin' : redirect);
        } else if (user.role === 'DRIVER' || roleHint === 'driver') {
          const drivers = await api.getDrivers().catch(() => []);
          const matched = drivers.find((d) => d.email?.toLowerCase() === user.email?.toLowerCase()) || {
            id: user.driver_id || 'drv-001',
            driver_code: 'DRV-001',
            name: user.name,
            phone: user.phone || '+91 98888 11111',
            email: user.email,
            license_number: 'KA-01-2018-0045892',
            license_expiry: '2028-12-31',
            status: 'AVAILABLE',
          };

          loginAsDriver(matched as any, {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: 'DRIVER',
          });
          toast.success(`Welcome back, ${user.name}! Launching Driver App.`);
          router.push('/driver');
        } else {
          loginAsCustomer({
            id: user.id,
            name: user.name,
            phone: user.phone || '+91 98888 55555',
            email: user.email,
            role: 'CUSTOMER',
          });
          toast.success(`Welcome back, ${user.name}!`);
          router.push(redirect === '/admin' ? '/' : redirect);
        }
        return;
      }

      throw new Error('Authentication failed');
    } catch (err: any) {
      // Fallback for mock demo testing
      const emailLower = targetEmail.toLowerCase();
      if (emailLower === 'admin@fleet.com' && targetPassword === 'admin123') {
        loginAsAdmin({
          name: 'Vikram Mehta (Owner)',
          phone: '+91 98888 00001',
          email: 'admin@fleet.com',
          role: 'ADMIN',
        });
        toast.success('Signed in as Fleet Administrator (Vikram Mehta)');
        router.push('/admin');
      } else if ((emailLower === 'ramesh@fleet.com' || emailLower === 'ravi@fleet.com') && targetPassword === 'password123') {
        const mockDriver = {
          id: 'drv-001',
          driver_code: 'DRV-001',
          name: emailLower.includes('ravi') ? 'Ravi Shastri' : 'Ramesh Kumar',
          phone: '+91 98888 11111',
          email: targetEmail,
          license_number: 'KA-01-2018-0045892',
          license_expiry: '2028-12-31',
          status: 'AVAILABLE',
        };
        loginAsDriver(mockDriver as any);
        toast.success(`Signed in as Driver Partner (${mockDriver.name})`);
        router.push('/driver');
      } else if (targetPassword.length >= 6) {
        loginAsCustomer({
          name: targetEmail.split('@')[0],
          phone: '+91 98888 55555',
          email: targetEmail,
          role: 'CUSTOMER',
        });
        toast.success(`Signed in as Passenger (${targetEmail})`);
        router.push(redirect === '/admin' ? '/' : redirect);
      } else {
        toast.error(err.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Execution
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);

    try {
      const res = await api.register({
        name: signUpName.trim(),
        email: signUpEmail.trim().toLowerCase(),
        phone: signUpPhone.trim() || '+91 98888 55555',
        password: signUpPassword,
        role: 'CUSTOMER',
      });

      if (res && res.success && res.user) {
        loginAsCustomer({
          id: res.user.id,
          name: res.user.name,
          phone: res.user.phone,
          email: res.user.email,
          role: 'CUSTOMER',
        });
        toast.success(`Account created successfully! Welcome to ${tenant.company_name}.`);
        router.push(redirect === '/admin' ? '/' : redirect);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Top Floating Navigation: Return to Passenger Home */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm group active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-blue-400 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
          <Home className="w-3 h-3 text-slate-500" />
          <span className="font-medium text-slate-300">Ride Booking</span>
        </div>
      </div>

      {/* SaaS Organization & Brand Header */}
      <div className="text-center space-y-3 mb-6">
        <Link href="/" className="inline-flex items-center gap-3.5 group">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-xl group-hover:scale-105 transition-all overflow-hidden p-1.5 shrink-0">
            <img
              src={tenant.logo_url || '/logo.png'}
              alt={tenant.company_name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col justify-center leading-none text-left">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-white tracking-tight block">
                {tenant.company_name}
              </span>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                SaaS
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium tracking-wide mt-1.5 block">
              {tenant.tagline || 'Better journeys begin here'}
            </span>
          </div>
        </Link>
      </div>

      {/* Main SaaS Auth Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
        {/* 1. THREE ROLE TABS: ADMIN, CUSTOMER, DRIVER */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('customer')}
            className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'customer'
                ? 'bg-blue-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('driver')}
            className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'driver'
                ? 'bg-indigo-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Driver</span>
          </button>
        </div>

        {/* 2. TAB DETAILS & CONTENT */}
        {mode === 'signin' ? (
          <div className="space-y-5">
            {/* Tab Header Description */}
            <div className="text-left space-y-1">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                {activeTab === 'admin' && (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Fleet Administrator ERP</span>
                  </>
                )}
                {activeTab === 'customer' && (
                  <>
                    <User className="w-4 h-4 text-blue-400" />
                    <span>Passenger Portal</span>
                  </>
                )}
                {activeTab === 'driver' && (
                  <>
                    <Smartphone className="w-4 h-4 text-indigo-400" />
                    <span>Driver Partner Cockpit</span>
                  </>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {activeTab === 'admin' && 'Access fleet telemetry, trip dispatch, vehicle loans & profit analytics.'}
                {activeTab === 'customer' && 'Book intercity rides, track active chauffeurs & download invoices.'}
                {activeTab === 'driver' && 'View assigned trips, update odometer, upload tolls & log expenses.'}
              </p>
            </div>

            {/* Manual Sign In Form */}
            <form onSubmit={(e) => { e.preventDefault(); executeLogin(email, password, activeTab); }} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  {activeTab === 'admin' ? 'Admin Work Email' : activeTab === 'driver' ? 'Driver Email' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      activeTab === 'admin'
                        ? 'admin@fleet.com'
                        : activeTab === 'driver'
                        ? 'ravi@fleet.com'
                        : 'name@company.com'
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-400">Password</label>
                  <button
                    type="button"
                    onClick={() => toast.info('Please contact your administrator to reset credentials.')}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Single Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                    : activeTab === 'driver'
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>
                  {loading
                    ? 'Authenticating...'
                    : activeTab === 'admin'
                    ? 'Sign In to Admin ERP'
                    : activeTab === 'driver'
                    ? 'Sign In as Driver'
                    : 'Sign In as Customer'}
                </span>
              </button>
            </form>

            {/* Customer Sign-Up Prompt */}
            {activeTab === 'customer' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Don't have an account? <span className="underline">Create Passenger Account</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* SIGN UP FORM (Customer Registration) */
          <div className="space-y-5">
            <div className="text-left space-y-1">
              <h2 className="text-base font-extrabold text-white">Create Passenger Account</h2>
              <p className="text-xs text-slate-400">
                Register to book premium rides, save corporate addresses, and access Fastag invoices.
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="Masa Sandeep Kumar"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Mobile Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    placeholder="+91 98888 55555"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
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
                    minLength={6}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Already have an account? <span className="text-blue-400 underline font-semibold">Sign In</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Prominent Bottom Return Button */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-xs font-bold text-slate-300 hover:text-blue-400 transition-all shadow-lg group active:scale-95"
        >
          <Home className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          <span>Return to Passenger Home & Search Rides</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
