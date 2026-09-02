'use client';

import React, { useEffect, useState } from 'react';
import { useApp, AdminTab } from '@/context/AppContext';
import { api } from '@/lib/api';
import {
  LayoutDashboard,
  Inbox,
  Navigation,
  Radio,
  Car,
  Users,
  CalendarCheck,
  CreditCard,
  BarChart3,
  FileSpreadsheet,
  Repeat,
  AlertTriangle,
  Building2,
  PhoneCall,
  Map as MapIcon,
  LogOut,
  X,
  Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const { adminTab, setAdminTab, refreshKey, adminLogout } = useApp();
  const [unassignedCount, setUnassignedCount] = useState<number>(0);

  useEffect(() => {
    api.getUnassignedQueue()
      .then((res) => {
        setUnassignedCount(res.total_unassigned || 0);
      })
      .catch(() => setUnassignedCount(0));
  }, [refreshKey]);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'unassigned-queue',
      label: 'Trips to be Assigned',
      icon: Inbox,
      badge: unassignedCount > 0 ? `${unassignedCount}` : undefined,
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-700/60',
    },
    {
      id: 'live-fleet',
      label: 'Live Fleet GPS Map',
      icon: Radio,
      badge: 'Live',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700/60',
    },
    {
      id: 'routes-pricing',
      label: 'Routes & Fare Setup',
      icon: MapIcon,
      badge: 'Fares',
      badgeColor: 'bg-teal-950 text-teal-300 border-teal-700/60',
    },
    { id: 'trips', label: 'Trip Management', icon: Navigation, badge: 'Core' },
    { id: 'vehicles', label: 'Fleet & Maintenance', icon: Car },
    { id: 'drivers', label: 'Drivers & Advances', icon: Users },
    { id: 'multi-vehicle', label: 'Multi-Car Events', icon: Building2, badge: 'Case 4' },
    { id: 'bookings', label: 'Customer Bookings', icon: CalendarCheck },
    { id: 'finance', label: 'Loans & EMI Finance', icon: CreditCard },
    { id: 'analytics', label: 'Profitability & ROI', icon: BarChart3 },
    { id: 'bulk-import', label: 'Bulk CSV Import', icon: FileSpreadsheet },
    { id: 'recurring', label: 'Recurring Trips', icon: Repeat },
    { id: 'alerts', label: 'Alert Center', icon: AlertTriangle },
    {
      id: 'tenant-settings',
      label: 'Helplines & Organization',
      icon: PhoneCall,
      badge: 'SaaS',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    },
  ];

  const handleNavClick = (tabId: AdminTab) => {
    setAdminTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navContent = (
    <>
      <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 px-3 mb-2">
        Fleet ERP Command
      </div>

      <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = adminTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-600/15 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-950 dark:group-hover:text-white'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded border', item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700')}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Admin Logout */}
      <div className="space-y-2 mt-4 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="font-semibold text-slate-800 dark:text-slate-300">Operations Rule:</div>
          <p className="mt-0.5 text-slate-500 dark:text-slate-400">Validate driver license & schedule before assignment.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            adminLogout();
            window.location.href = '/login?tab=admin';
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/70 text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Admin Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Fixed Sidebar */}
      <aside className="hidden md:flex sticky top-16 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex-col shrink-0 p-4 transition-colors z-20">
        {navContent}
      </aside>

      {/* 2. Mobile Slide-Out Drawer & Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 shadow-2xl z-10 overflow-y-auto animate-in slide-in-from-left duration-200">
            {/* Mobile Drawer Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-sm">
                  <img src="/logo.png" alt="LA Travels Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col justify-center leading-none">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    LA <span className="text-blue-600 dark:text-blue-400 font-black">Travels</span> ERP
                  </span>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5">Better journeys begin here</div>
                </div>
              </div>

              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
