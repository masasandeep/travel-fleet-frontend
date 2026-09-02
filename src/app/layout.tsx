import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { AppProvider } from '@/context/AppContext';
import { EditProfileModal } from '@/components/modals/EditProfileModal';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LA Travels — Better journeys begin here',
  description: 'LA Travels Fleet Operating Platform with Trip Dispatch, Dynamic Pricing, Driver Partner Operations & Travel Management',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/logo.png?v=2026" type="image/png" />
        <link rel="shortcut icon" href="/logo.png?v=2026" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png?v=2026" />
      </head>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased transition-colors`}>
        <AppProvider>
          {children}
          <EditProfileModal />
          <Toaster richColors position="top-right" theme="dark" />
        </AppProvider>
      </body>
    </html>
  );
}
