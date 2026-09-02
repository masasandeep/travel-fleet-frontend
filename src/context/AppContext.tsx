'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Role, Trip, Vehicle, Driver, Booking, Tenant } from '@/types';
import { api, setDemoRole, setTenantSlug } from '@/lib/api';
import { toast } from 'sonner';

export type AdminTab =
  | 'dashboard'
  | 'unassigned-queue'
  | 'live-fleet'
  | 'routes-pricing'
  | 'trips'
  | 'vehicles'
  | 'drivers'
  | 'bookings'
  | 'multi-vehicle'
  | 'finance'
  | 'analytics'
  | 'bulk-import'
  | 'recurring'
  | 'alerts'
  | 'tenant-settings';

export type CustomerTab =
  | 'book'
  | 'track'
  | 'history'
  | 'fleet'
  | 'corporate';

export interface UserProfile {
  id?: string;
  name: string;
  phone: string;
  email: string;
  role?: Role;
  company_name?: string;
  gst_number?: string;
  address?: string;
  emergency_contact?: string;
  license_number?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'BOOKING' | 'DISPATCH' | 'SYSTEM' | 'REJECT';
  read: boolean;
  bookingCode?: string;
}

interface AppContextType {
  portal: Role;
  setPortal: (portal: Role) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  customerTab: CustomerTab;
  setCustomerTab: (tab: CustomerTab) => void;
  refreshKey: number;
  triggerRefresh: () => void;

  // SaaS Multi-Tenant Organization & Helpline
  tenant: Tenant;
  tenantsList: Tenant[];
  switchTenant: (slug: string) => Promise<void>;
  updateTenantSettings: (data: Partial<Tenant>) => Promise<void>;

  // Logged-in user profile for optional selectable autofill
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  updateUserProfile: (data: Partial<UserProfile> & { current_password?: string; new_password?: string }) => Promise<void>;
  isAdmin: boolean;
  loginAsCustomer: (user: UserProfile) => void;
  loginAsAdmin: (user: UserProfile) => void;
  adminLogout: () => void;
  currentDriver: Driver | null;
  setCurrentDriver: (driver: Driver | null) => void;
  loginAsDriver: (driver: Driver, user?: UserProfile) => void;
  driverLogout: () => void;
  logout: () => void;

  // Profile Modal
  isEditProfileOpen: boolean;
  openEditProfile: () => void;
  closeEditProfile: () => void;

  // In-app notifications
  notifications: AppNotification[];
  unreadNotificationCount: number;
  addNotification: (notif: { title: string; message: string; type?: 'BOOKING' | 'DISPATCH' | 'SYSTEM' | 'REJECT'; bookingCode?: string }) => void;
  markNotificationsAsRead: () => void;

  // Tracked booking for customer track view
  trackedBookingCode: string;
  setTrackedBookingCode: (code: string) => void;

  // Modals
  isQuickTripOpen: boolean;
  openQuickTrip: () => void;
  closeQuickTrip: () => void;

  isAssignTripOpen: boolean;
  selectedTripForAssign: Trip | null;
  openAssignTrip: (trip: Trip) => void;
  closeAssignTrip: () => void;

  isStartTripOpen: boolean;
  selectedTripForStart: Trip | null;
  openStartTrip: (trip: Trip) => void;
  closeStartTrip: () => void;

  isCompleteTripOpen: boolean;
  selectedTripForComplete: Trip | null;
  openCompleteTrip: (trip: Trip) => void;
  closeCompleteTrip: () => void;

  isDuplicateTripOpen: boolean;
  selectedTripForDuplicate: Trip | null;
  openDuplicateTrip: (trip: Trip) => void;
  closeDuplicateTrip: () => void;

  isTripDrawerOpen: boolean;
  selectedTripForDrawer: Trip | null;
  openTripDrawer: (trip: Trip) => void;
  closeTripDrawer: () => void;

  isAddVehicleOpen: boolean;
  openAddVehicle: () => void;
  closeAddVehicle: () => void;

  isMaintenanceOpen: boolean;
  selectedVehicleForMaintenance: Vehicle | null;
  openMaintenance: (vehicle: Vehicle) => void;
  closeMaintenance: () => void;

  isAddDriverOpen: boolean;
  openAddDriver: () => void;
  closeAddDriver: () => void;

  isDriverAdvanceOpen: boolean;
  selectedDriverForAdvance: Driver | null;
  openDriverAdvance: (driver: Driver) => void;
  closeDriverAdvance: () => void;

  isRecordEmiOpen: boolean;
  selectedLoanIdForEmi: string | null;
  openRecordEmi: (loanId: string) => void;
  closeRecordEmi: () => void;

  isCreateLoanOpen: boolean;
  openCreateLoan: () => void;
  closeCreateLoan: () => void;

  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portal, setPortalState] = useState<Role>('CUSTOMER');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [customerTab, setCustomerTab] = useState<CustomerTab>('book');
  const [trackedBookingCode, setTrackedBookingCode] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  // SaaS Tenant State & Organization Branding
  const [tenant, setTenant] = useState<Tenant>({
    id: 'default-tenant',
    slug: 'la-travels',
    company_name: 'LA Travels',
    tagline: 'Better journeys begin here',
    logo_url: '/logo.png',
    primary_phone: '+91 98888 00001',
    secondary_phone: '+91 97777 00002',
    whatsapp_number: '+91 98888 00001',
    support_email: 'support@latravels.com',
    address: '100 Feet Road, Indiranagar, Bangalore, Karnataka 560038',
    gst_number: '29AAAAA0000A1Z5',
    currency: 'INR',
    currency_symbol: '₹',
    plan: 'PRO',
    is_active: true,
  });

  const [tenantsList, setTenantsList] = useState<Tenant[]>([]);

  // Load tenant metadata on mount & when refreshKey changes
  useEffect(() => {
    let savedSlug = 'la-travels';
    try {
      savedSlug = localStorage.getItem('fleetflow_tenant_slug') || 'la-travels';
    } catch (e) {}

    setTenantSlug(savedSlug);

    api.getCurrentTenant(savedSlug)
      .then((t) => {
        if (t) setTenant(t);
      })
      .catch(() => {});

    api.getAllTenants()
      .then((list) => {
        if (list && list.length > 0) setTenantsList(list);
      })
      .catch(() => {});
  }, [refreshKey]);

  const switchTenant = async (slug: string) => {
    try {
      setTenantSlug(slug);
      const t = await api.getCurrentTenant(slug);
      if (t) {
        setTenant(t);
        toast.success(`Switched organization to "${t.company_name}"`, { icon: '🏢' });
        triggerRefresh();
      }
    } catch (err) {
      toast.error('Failed to switch organization');
    }
  };

  const updateTenantSettings = async (data: Partial<Tenant>) => {
    try {
      const updated = await api.updateTenant(tenant.slug || 'la-travels', data);
      setTenant(updated);
      toast.success('Organization branding & helplines updated successfully!');
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update organization settings');
      throw err;
    }
  };

  // Default logged in user profile (passenger role by default)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    name: 'Masa Sandeep Kumar',
    phone: '+91 98888 55555',
    email: 'sandeep.kumar@gmail.com',
    role: 'CUSTOMER',
  });

  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);

  const isAdmin = currentUser?.role === 'ADMIN';

  // Restore saved session if present
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('fleetflow_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object') {
          setCurrentUser(parsed);
          if (parsed.role === 'ADMIN') {
            setPortalState('ADMIN');
            setDemoRole('ADMIN');
          } else if (parsed.role === 'DRIVER') {
            setPortalState('DRIVER');
            setDemoRole('DRIVER');
          }
        }
      }

      const savedDriver = localStorage.getItem('fleetflow_driver');
      if (savedDriver) {
        const parsedDriver = JSON.parse(savedDriver);
        if (parsedDriver && typeof parsedDriver === 'object') {
          setCurrentDriver(parsedDriver);
        }
      }
    } catch (e) {}
  }, []);

  const loginAsCustomer = (user: UserProfile) => {
    const userWithRole: UserProfile = { ...user, role: 'CUSTOMER' };
    setCurrentUser(userWithRole);
    setPortal('CUSTOMER');
    try {
      localStorage.setItem('fleetflow_user', JSON.stringify(userWithRole));
    } catch (e) {}
  };

  const loginAsAdmin = (user: UserProfile) => {
    const userWithRole: UserProfile = { ...user, role: 'ADMIN' };
    setCurrentUser(userWithRole);
    setPortal('ADMIN');
    try {
      localStorage.setItem('fleetflow_user', JSON.stringify(userWithRole));
    } catch (e) {}
  };

  const adminLogout = () => {
    logout();
    setPortal('CUSTOMER');
  };

  const loginAsDriver = (driver: Driver, userProfile?: UserProfile) => {
    setCurrentDriver(driver);
    const userWithRole: UserProfile = {
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      email: driver.email || 'driver@fleet.com',
      role: 'DRIVER',
      ...(userProfile || {}),
    };
    setCurrentUser(userWithRole);
    setPortal('DRIVER');
    try {
      localStorage.setItem('fleetflow_driver', JSON.stringify(driver));
      localStorage.setItem('fleetflow_user', JSON.stringify(userWithRole));
    } catch (e) {}
  };

  const driverLogout = () => {
    setCurrentDriver(null);
    logout();
    setPortal('CUSTOMER');
    try {
      localStorage.removeItem('fleetflow_driver');
    } catch (e) {}
  };

  // Profile Update & Modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const updateUserProfile = async (data: Partial<UserProfile> & { current_password?: string; new_password?: string }) => {
    try {
      await api.updateProfile({
        id: currentUser?.id,
        email: data.email || currentUser?.email,
        name: data.name || currentUser?.name,
        phone: data.phone || currentUser?.phone,
        current_password: data.current_password,
        new_password: data.new_password,
        company_name: data.company_name,
        gst_number: data.gst_number,
        address: data.address,
        emergency_contact: data.emergency_contact,
        license_number: data.license_number,
      });

      const updatedUser: UserProfile = {
        ...(currentUser || { role: 'CUSTOMER' }),
        ...data,
        name: data.name || currentUser?.name || '',
        email: data.email || currentUser?.email || '',
        phone: data.phone || currentUser?.phone || '',
      };

      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('fleetflow_user', JSON.stringify(updatedUser));
      } catch (e) {}

      if (currentDriver) {
        const updatedDriver: Driver = {
          ...currentDriver,
          name: data.name || currentDriver.name,
          phone: data.phone || currentDriver.phone,
          email: data.email || currentDriver.email,
          address: data.address || currentDriver.address,
          emergency_contact: data.emergency_contact || currentDriver.emergency_contact,
          license_number: data.license_number || currentDriver.license_number,
        };
        setCurrentDriver(updatedDriver);
        try {
          localStorage.setItem('fleetflow_driver', JSON.stringify(updatedDriver));
        } catch (e) {}
      }

      toast.success('Profile updated successfully!');
      triggerRefresh();
      setIsEditProfileOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      toast.error(msg);
      throw err;
    }
  };

  // In-app Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Welcome to LA Travels',
      message: 'Logged in as registered customer. Better journeys begin here.',
      timestamp: 'Just now',
      type: 'SYSTEM',
      read: false,
    },
  ]);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const addNotification = (notif: { title: string; message: string; type?: 'BOOKING' | 'DISPATCH' | 'SYSTEM' | 'REJECT'; bookingCode?: string }) => {
    const newNotif: AppNotification = {
      id: 'notif-' + Date.now(),
      title: notif.title,
      message: notif.message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: notif.type || 'SYSTEM',
      read: false,
      bookingCode: notif.bookingCode,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentDriver(null);
    try {
      localStorage.removeItem('fleetflow_user');
      localStorage.removeItem('fleetflow_driver');
      localStorage.removeItem('fleetflow_token');
    } catch (e) {}
  };

  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fleetflow_theme') as 'dark' | 'light' | null;
      if (saved === 'light' || saved === 'dark') {
        setThemeState(saved);
        document.documentElement.classList.toggle('dark', saved === 'dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  }, []);

  const setTheme = (t: 'dark' | 'light') => {
    setThemeState(t);
    try {
      localStorage.setItem('fleetflow_theme', t);
      document.documentElement.classList.toggle('dark', t === 'dark');
    } catch (e) {}
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const setPortal = (p: Role) => {
    setPortalState(p);
    setDemoRole(p);
  };

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Modals
  const [isQuickTripOpen, setIsQuickTripOpen] = useState(false);

  const [isAssignTripOpen, setIsAssignTripOpen] = useState(false);
  const [selectedTripForAssign, setSelectedTripForAssign] = useState<Trip | null>(null);

  const [isStartTripOpen, setIsStartTripOpen] = useState(false);
  const [selectedTripForStart, setSelectedTripForStart] = useState<Trip | null>(null);

  const [isCompleteTripOpen, setIsCompleteTripOpen] = useState(false);
  const [selectedTripForComplete, setSelectedTripForComplete] = useState<Trip | null>(null);

  const [isDuplicateTripOpen, setIsDuplicateTripOpen] = useState(false);
  const [selectedTripForDuplicate, setSelectedTripForDuplicate] = useState<Trip | null>(null);

  const [isTripDrawerOpen, setIsTripDrawerOpen] = useState(false);
  const [selectedTripForDrawer, setSelectedTripForDrawer] = useState<Trip | null>(null);

  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [selectedVehicleForMaintenance, setSelectedVehicleForMaintenance] = useState<Vehicle | null>(null);

  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isDriverAdvanceOpen, setIsDriverAdvanceOpen] = useState(false);
  const [selectedDriverForAdvance, setSelectedDriverForAdvance] = useState<Driver | null>(null);

  const [isRecordEmiOpen, setIsRecordEmiOpen] = useState(false);
  const [selectedLoanIdForEmi, setSelectedLoanIdForEmi] = useState<string | null>(null);

  const [isCreateLoanOpen, setIsCreateLoanOpen] = useState(false);

  return (
    <AppContext.Provider
      value={{
        portal,
        setPortal,
        adminTab,
        setAdminTab,
        customerTab,
        setCustomerTab,

        // SaaS Tenant & Branding
        tenant,
        tenantsList,
        switchTenant,
        updateTenantSettings,

        currentUser,
        setCurrentUser,
        updateUserProfile,
        isAdmin,
        loginAsCustomer,
        loginAsAdmin,
        adminLogout,
        currentDriver,
        setCurrentDriver,
        loginAsDriver,
        driverLogout,
        logout,

        // Profile Modal
        isEditProfileOpen,
        openEditProfile: () => setIsEditProfileOpen(true),
        closeEditProfile: () => setIsEditProfileOpen(false),

        notifications,
        unreadNotificationCount,
        addNotification,
        markNotificationsAsRead,
        trackedBookingCode,
        setTrackedBookingCode,
        refreshKey,
        triggerRefresh,

        isQuickTripOpen,
        openQuickTrip: () => setIsQuickTripOpen(true),
        closeQuickTrip: () => setIsQuickTripOpen(false),

        isAssignTripOpen,
        selectedTripForAssign,
        openAssignTrip: (trip) => {
          setSelectedTripForAssign(trip);
          setIsAssignTripOpen(true);
        },
        closeAssignTrip: () => {
          setSelectedTripForAssign(null);
          setIsAssignTripOpen(false);
        },

        isStartTripOpen,
        selectedTripForStart,
        openStartTrip: (trip) => {
          setSelectedTripForStart(trip);
          setIsStartTripOpen(true);
        },
        closeStartTrip: () => {
          setSelectedTripForStart(null);
          setIsStartTripOpen(false);
        },

        isCompleteTripOpen,
        selectedTripForComplete,
        openCompleteTrip: (trip) => {
          setSelectedTripForComplete(trip);
          setIsCompleteTripOpen(true);
        },
        closeCompleteTrip: () => {
          setSelectedTripForComplete(null);
          setIsCompleteTripOpen(false);
        },

        isDuplicateTripOpen,
        selectedTripForDuplicate,
        openDuplicateTrip: (trip) => {
          setSelectedTripForDuplicate(trip);
          setIsDuplicateTripOpen(true);
        },
        closeDuplicateTrip: () => {
          setSelectedTripForDuplicate(null);
          setIsDuplicateTripOpen(false);
        },

        isTripDrawerOpen,
        selectedTripForDrawer,
        openTripDrawer: (trip) => {
          setSelectedTripForDrawer(trip);
          setIsTripDrawerOpen(true);
        },
        closeTripDrawer: () => {
          setSelectedTripForDrawer(null);
          setIsTripDrawerOpen(false);
        },

        isAddVehicleOpen,
        openAddVehicle: () => setIsAddVehicleOpen(true),
        closeAddVehicle: () => setIsAddVehicleOpen(false),

        isMaintenanceOpen,
        selectedVehicleForMaintenance,
        openMaintenance: (v) => {
          setSelectedVehicleForMaintenance(v);
          setIsMaintenanceOpen(true);
        },
        closeMaintenance: () => {
          setSelectedVehicleForMaintenance(null);
          setIsMaintenanceOpen(false);
        },

        isAddDriverOpen,
        openAddDriver: () => setIsAddDriverOpen(true),
        closeAddDriver: () => setIsAddDriverOpen(false),

        isDriverAdvanceOpen,
        selectedDriverForAdvance,
        openDriverAdvance: (d) => {
          setSelectedDriverForAdvance(d);
          setIsDriverAdvanceOpen(true);
        },
        closeDriverAdvance: () => {
          setSelectedDriverForAdvance(null);
          setIsDriverAdvanceOpen(false);
        },

        isRecordEmiOpen,
        selectedLoanIdForEmi,
        openRecordEmi: (loanId) => {
          setSelectedLoanIdForEmi(loanId);
          setIsRecordEmiOpen(true);
        },
        closeRecordEmi: () => {
          setSelectedLoanIdForEmi(null);
          setIsRecordEmiOpen(false);
        },

        isCreateLoanOpen,
        openCreateLoan: () => setIsCreateLoanOpen(true),
        closeCreateLoan: () => setIsCreateLoanOpen(false),

        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
