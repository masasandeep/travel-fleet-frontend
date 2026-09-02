'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp, AdminTab } from '@/context/AppContext';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  Compass,
  PlusCircle,
  Bell,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  ArrowLeft,
  Lock,
  User,
  KeyRound,
  Menu,
  X,
  LayoutDashboard,
  Inbox,
  Radio,
  Navigation,
  Car,
  Users,
  CreditCard,
  BarChart3,
  Map as MapIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

// Admin Views
import { DashboardView } from '@/components/admin/DashboardView';
import { UnassignedQueueView } from '@/components/admin/UnassignedQueueView';
import { LiveFleetMapView } from '@/components/admin/LiveFleetMapView';
import { AdminRoutesView } from '@/components/admin/AdminRoutesView';
import { TripsView } from '@/components/admin/TripsView';
import { FleetView } from '@/components/admin/FleetView';
import { DriversView } from '@/components/admin/DriversView';
import { MultiVehicleEventsView } from '@/components/admin/MultiVehicleEventsView';
import { BookingsView } from '@/components/admin/BookingsView';
import { FinanceView } from '@/components/admin/FinanceView';
import { AnalyticsView } from '@/components/admin/AnalyticsView';
import { BulkImportView } from '@/components/admin/BulkImportView';
import { RecurringTripsView } from '@/components/admin/RecurringTripsView';
import { AlertsView } from '@/components/admin/AlertsView';
import { TenantSettingsView } from '@/components/admin/TenantSettingsView';
import { ThemeToggle } from '@/components/common/ThemeToggle';

// Modals
import { QuickTripModal } from '@/components/modals/QuickTripModal';
import { AssignTripModal } from '@/components/modals/AssignTripModal';
import { StartTripModal } from '@/components/modals/StartTripModal';
import { CompleteTripModal } from '@/components/modals/CompleteTripModal';
import { DuplicateTripModal } from '@/components/modals/DuplicateTripModal';
import { TripDetailsDrawer } from '@/components/modals/TripDetailsDrawer';
import { AddVehicleModal } from '@/components/modals/AddVehicleModal';
import { MaintenanceModal } from '@/components/modals/MaintenanceModal';
import { AddDriverModal } from '@/components/modals/AddDriverModal';
import { DriverAdvanceModal } from '@/components/modals/DriverAdvanceModal';
import { RecordEmiModal } from '@/components/modals/RecordEmiModal';
import { CreateLoanModal } from '@/components/modals/CreateLoanModal';

export default function AdminERPPage() {
  const router = useRouter();
  const { adminTab, setAdminTab, openQuickTrip, openEditProfile, currentUser, adminLogout, refreshKey } = useApp();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [unassignedCount, setUnassignedCount] = useState<number>(0);

  useEffect(() => {
    api.getUnassignedQueue()
      .then((res) => {
        setUnassignedCount(res.total_unassigned || 0);
      })
      .catch(() => setUnassignedCount(0));
  }, [refreshKey]);

  const isAdmin = currentUser?.role === 'ADMIN';

  const handleAdminLogout = () => {
    adminLogout();
    toast.success('Successfully logged out of Admin Control Center');
    router.push('/login?tab=admin');
  };

  // Mobile Quick Navigation Tabs (Most frequent workflows)
  const quickMobileTabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'unassigned-queue', label: 'Assign Queue', icon: Inbox },
    { id: 'live-fleet', label: 'Live GPS', icon: Radio },
    { id: 'trips', label: 'Trips', icon: Navigation },
    { id: 'vehicles', label: 'Fleet', icon: Car },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'finance', label: 'Finance', icon: CreditCard },
    { id: 'analytics', label: 'ROI', icon: BarChart3 },
    { id: 'routes-pricing', label: 'Fares', icon: MapIcon },
  ];

  // If the user does not possess admin privileges, render access restriction
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
        {/* Minimal Nav Header */}
        <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center p-0.5 overflow-hidden shrink-0 shadow-sm">
              <img src="/logo.png" alt="LA Travels Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
              LA <span className="text-blue-600 dark:text-blue-400 font-black">Travels</span> ERP
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </div>
        </header>

        {/* Access Restricted Body */}
        <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 max-w-lg w-full space-y-5 shadow-xl text-center transition-colors">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto shadow-inner">
              <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Administrator Access Required
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                The Fleet ERP Control Center is restricted to verified fleet owners, dispatchers, and system administrators.
              </p>
            </div>

            {/* Currently Logged In Status */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Active Session Profile
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {currentUser?.role || 'GUEST / PASSENGER'}
                </span>
              </div>

              {currentUser ? (
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-slate-900 dark:text-white truncate text-xs sm:text-sm">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email || currentUser.phone}</div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-600 dark:text-slate-400 pt-1 text-[11px]">
                  No active session found. Please log in with an administrator account to proceed.
                </div>
              )}

              <p className="text-[11px] text-amber-700 dark:text-amber-400 pt-1 border-t border-slate-200 dark:border-slate-800/80">
                ⚠️ Normal passenger accounts are restricted from accessing fleet telematics, vehicle maintenance, loans, and dispatch queues.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href="/login?tab=admin&redirect=/admin"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Sign In as Fleet Administrator</span>
              </Link>

              <Link
                href="/"
                className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Passenger Booking Portal</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Admin ERP Layout (Rendered for verified ADMIN accounts)
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white transition-colors">
      {/* Admin Top Header - Fully Responsive */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
        <div className="px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Mobile Hamburger Toggle + Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger Button (Mobile Only) */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-sm">
              <img src="/logo.png" alt="LA Travels Logo" className="w-full h-full object-contain" />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex flex-col justify-center leading-none">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white whitespace-nowrap block">
                  LA <span className="text-blue-600 dark:text-blue-400 font-black">Travels</span>
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5 hidden sm:block">
                  Better journeys begin here
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] uppercase font-extrabold px-1.5 sm:px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60">
                ADMIN
              </span>
            </div>
          </div>

          {/* Center Search & Switch to Customer Portal (Desktop Only) */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all"
            >
              <span>Customer Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            </Link>

            <Link
              href="/driver"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all"
            >
              <span>Driver Cockpit</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            </Link>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <ThemeToggle />

            {/* Alert Bell */}
            <button
              onClick={() => setAdminTab('alerts')}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl relative transition-colors"
              title="System Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            {/* Quick Trip Button (Adaptive label) */}
            <button
              onClick={openQuickTrip}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
              title="Create Quick Trip"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">+ Quick Trip</span>
              <span className="sm:hidden text-[11px]">Trip</span>
            </button>

            {/* Admin Profile & Logout Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={openEditProfile}
                title="Click to view & edit admin profile"
                className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group text-left"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-slate-700 shrink-0 shadow-xs">
                  {currentUser?.name?.charAt(0) || 'A'}
                </div>

                <div className="hidden xl:block text-[11px] leading-tight text-left">
                  <div className="font-bold text-slate-900 dark:text-white truncate max-w-[100px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {currentUser?.name || 'Administrator'}
                  </div>
                  <div className="text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase">Fleet Owner ⚙</div>
                </div>
              </button>

              {/* Admin Logout Button */}
              <button
                type="button"
                onClick={handleAdminLogout}
                title="Log Out of Admin Control Center"
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Quick Tab Scroller (Visible on mobile screens) */}
        <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/80 px-2.5 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {quickMobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = adminTab === tab.id;
            const isUnassigned = tab.id === 'unassigned-queue';

            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-white' : 'text-slate-400')} />
                <span>{tab.label}</span>
                {isUnassigned && unassignedCount > 0 && (
                  <span className={cn(
                    'px-1.5 py-0.2 rounded-full text-[9px] font-black',
                    isActive ? 'bg-white text-blue-600' : 'bg-amber-500 text-slate-950'
                  )}>
                    {unassignedCount}
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shrink-0 whitespace-nowrap"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>All Tabs...</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Sidebar (Desktop inline + Mobile slide-out drawer) */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area: Responsive Padding for Phone, Tablet & Desktop */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full transition-colors">
          {adminTab === 'dashboard' && <DashboardView />}
          {adminTab === 'unassigned-queue' && <UnassignedQueueView />}
          {adminTab === 'live-fleet' && <LiveFleetMapView />}
          {adminTab === 'routes-pricing' && <AdminRoutesView />}
          {adminTab === 'trips' && <TripsView />}
          {adminTab === 'vehicles' && <FleetView />}
          {adminTab === 'drivers' && <DriversView />}
          {adminTab === 'multi-vehicle' && <MultiVehicleEventsView />}
          {adminTab === 'bookings' && <BookingsView />}
          {adminTab === 'finance' && <FinanceView />}
          {adminTab === 'analytics' && <AnalyticsView />}
          {adminTab === 'bulk-import' && <BulkImportView />}
          {adminTab === 'recurring' && <RecurringTripsView />}
          {adminTab === 'alerts' && <AlertsView />}
          {adminTab === 'tenant-settings' && <TenantSettingsView />}
        </main>
      </div>

      {/* Admin Modals */}
      <QuickTripModal />
      <AssignTripModal />
      <StartTripModal />
      <CompleteTripModal />
      <DuplicateTripModal />
      <TripDetailsDrawer />
      <AddVehicleModal />
      <MaintenanceModal />
      <AddDriverModal />
      <DriverAdvanceModal />
      <RecordEmiModal />
      <CreateLoanModal />
    </div>
  );
}
