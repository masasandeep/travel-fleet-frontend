'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Navigation, Gauge, Clock, ShieldCheck, Maximize2, RotateCcw, Car } from 'lucide-react';

interface LiveRouteMapProps {
  pickupLocation: string;
  dropLocation: string;
  intermediateStop?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleRegistration?: string;
  vehicleModel?: string;
  tripStatus?: string; // 'WAITING_ASSIGNMENT' | 'ASSIGNED' | 'STARTED' | 'COMPLETED'
  className?: string;
}

// Coordinate dictionary for Indian cities & corridor waypoints
const CITY_COORDS: Record<string, [number, number]> = {
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  mysore: [12.2958, 76.6394],
  mysuru: [12.2958, 76.6394],
  mandya: [12.5218, 76.8951],
  ramanagara: [12.7209, 77.2799],
  channapatna: [12.6518, 77.2023],
  bidadi: [12.7981, 77.3828],
  srirangapatna: [12.4224, 76.6937],
  chennai: [13.0827, 80.2707],
  mahabalipuram: [12.6269, 80.1927],
  kanchipuram: [12.8342, 79.7036],
  vellore: [12.9165, 79.1325],
  hosur: [12.7409, 77.8253],
  krishnagiri: [12.5186, 78.2137],
  hyderabad: [17.3850, 78.4867],
  mumbai: [19.0760, 72.8777],
  pune: [18.5204, 73.8567],
  delhi: [28.6139, 77.2090],
  newdelhi: [28.6139, 77.2090],
  agra: [27.1767, 78.0081],
  jaipur: [26.9124, 75.7873],
  coimbatore: [11.0168, 76.9558],
  kochi: [9.9312, 76.2673],
  goa: [15.2993, 74.1240],
};

function getCoordsForPlace(placeName: string, fallbackOffset = 0): [number, number] {
  if (!placeName) return [12.9716, 77.5946];
  const clean = placeName.toLowerCase().replace(/[^a-z]/g, '');

  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return [coords[0], coords[1]];
    }
  }

  // Fallback: slight offset from Bangalore hub
  return [12.9716 + fallbackOffset * 0.15, 77.5946 + fallbackOffset * 0.15];
}

export const LiveRouteMap: React.FC<LiveRouteMapProps> = ({
  pickupLocation,
  dropLocation,
  intermediateStop,
  driverName,
  driverPhone,
  vehicleRegistration,
  vehicleModel,
  tripStatus = 'WAITING_ASSIGNMENT',
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const carMarkerRef = useRef<any>(null);

  const [currentSpeed, setCurrentSpeed] = useState(58);
  const [progressPct, setProgressPct] = useState(35);
  const [etaMinutes, setEtaMinutes] = useState(42);

  const isAssigned = Boolean(driverName && vehicleRegistration && tripStatus !== 'WAITING_ASSIGNMENT' && tripStatus !== 'REJECTED');
  const isStarted = tripStatus === 'STARTED';
  const isCompleted = tripStatus === 'COMPLETED';

  useEffect(() => {
    let isMounted = true;

    // Dynamically import Leaflet on client side
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const pCoords = getCoordsForPlace(pickupLocation, 0);
      const dCoords = getCoordsForPlace(dropLocation, 1);
      const iCoords = intermediateStop ? getCoordsForPlace(intermediateStop, 0.5) : null;

      // Compute route coordinates
      const routePoints: [number, number][] = [pCoords];
      if (iCoords) {
        routePoints.push(iCoords);
      }
      routePoints.push(dCoords);

      // Initialize map centered between points
      const centerLat = (pCoords[0] + dCoords[0]) / 2;
      const centerLng = (pCoords[1] + dCoords[1]) / 2;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 9,
        zoomControl: false,
        attributionControl: false,
      });

      // Free OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom Origin Icon (Green Pin)
      const pickupIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color: #10b981; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11px; box-shadow: 0 4px 12px rgba(16,185,129,0.5); border: 2px solid white;">A</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      // Custom Drop Icon (Red Pin)
      const dropIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color: #ef4444; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11px; box-shadow: 0 4px 12px rgba(239,68,68,0.5); border: 2px solid white;">B</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      // Add Markers
      L.marker(pCoords, { icon: pickupIcon })
        .addTo(map)
        .bindPopup(`<b>Pickup:</b> ${pickupLocation}`);

      L.marker(dCoords, { icon: dropIcon })
        .addTo(map)
        .bindPopup(`<b>Destination:</b> ${dropLocation}`);

      if (iCoords && intermediateStop) {
        const intermediateIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `<div style="background-color: #f59e0b; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 10px; box-shadow: 0 4px 10px rgba(245,158,11,0.5); border: 2px solid white;">📍</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        L.marker(iCoords, { icon: intermediateIcon })
          .addTo(map)
          .bindPopup(`<b>Intermediate Stop:</b> ${intermediateStop}`);
      }

      // Draw Highway Polyline
      const polyline = L.polyline(routePoints, {
        color: '#2563eb', // Royal Blue
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Fit bounds with padding
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

      // Only add live car marker if driver and vehicle are ACTUALLY assigned
      if (isAssigned) {
        const carIcon = L.divIcon({
          className: 'custom-car-marker',
          html: `
            <div style="position: relative; width: 36px; height: 36px;">
              <div style="position: absolute; inset: 0; background-color: #2563eb; opacity: 0.3; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: relative; width: 36px; height: 36px; background-color: #1e3a8a; border: 2.5px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 14px rgba(37,99,235,0.6);">
                🚗
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        // Compute initial car position
        const tProgress = isCompleted ? 1.0 : isStarted ? 0.45 : 0.05;
        const lat = pCoords[0] + (dCoords[0] - pCoords[0]) * tProgress;
        const lng = pCoords[1] + (dCoords[1] - pCoords[1]) * tProgress;

        const carMarker = L.marker([lat, lng], { icon: carIcon }).addTo(map);
        carMarker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 11px;">
            <b>${vehicleModel || 'Fleet Vehicle'}</b><br>
            Driver Partner: ${driverName}<br>
            Plate: <b>${vehicleRegistration}</b><br>
            Status: <span style="color: #2563eb; font-weight: bold;">${tripStatus}</span>
          </div>
        `);

        carMarkerRef.current = carMarker;
      }

      mapInstanceRef.current = map;

      // Simulated smooth telematics updates if trip is started
      let speedTimer: any = null;
      if (isStarted) {
        speedTimer = setInterval(() => {
          if (!isMounted) return;
          setCurrentSpeed((prev) => {
            const delta = Math.floor(Math.random() * 7) - 3;
            return Math.max(48, Math.min(76, prev + delta));
          });
          setProgressPct((prev) => (prev < 90 ? prev + 1 : prev));
          setEtaMinutes((prev) => (prev > 5 ? prev - 1 : 5));
        }, 4000);
      }

      return () => {
        if (speedTimer) clearInterval(speedTimer);
      };
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [pickupLocation, dropLocation, intermediateStop, tripStatus, vehicleRegistration, driverName, isCompleted, isStarted, isAssigned, vehicleModel]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && carMarkerRef.current) {
      const pos = carMarkerRef.current.getLatLng();
      mapInstanceRef.current.setView(pos, 11, { animate: true });
    }
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-900 ${className}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-80 sm:h-96 z-0" />

      {/* Floating Top Telematics HUD (Google Maps Style) */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
        <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 shadow-xl pointer-events-auto flex items-center gap-3 text-xs text-white">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isStarted ? 'bg-emerald-500 animate-ping' : isAssigned ? 'bg-blue-500' : 'bg-amber-500 animate-pulse'}`} />
            <span className={`font-black uppercase tracking-wide text-[10px] ${isStarted ? 'text-emerald-400' : isAssigned ? 'text-blue-400' : 'text-amber-400'}`}>
              {isCompleted ? 'ARRIVED' : isStarted ? 'LIVE TELEMATICS' : isAssigned ? 'DRIVER PARTNER ALLOCATED' : 'DISPATCH PENDING'}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {isStarted ? (
            <>
              <div className="flex items-center gap-1.5 font-bold">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentSpeed} km/h</span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>ETA: ~{etaMinutes} mins</span>
              </div>
            </>
          ) : isAssigned ? (
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Driver Partner Ready</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Assigning Driver Partner</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isAssigned && (
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={handleRecenter}
              title="Recenter Map on Vehicle"
              className="p-2 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-slate-200 hover:text-white shadow-lg active:scale-95 transition-all text-xs flex items-center gap-1 font-semibold"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Locate Car</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Driver Partner Banner HUD */}
      <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-auto bg-slate-950/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white">
        {isAssigned && driverName ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-md text-base shrink-0">
              {driverName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="font-bold truncate">{driverName}</div>
              <div className="text-[11px] text-slate-400 truncate">
                {vehicleModel || 'Executive Fleet'} • <strong className="font-mono text-blue-400">{vehicleRegistration}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-200">Driver Partner Assignment in Progress</div>
              <div className="text-[11px] text-slate-400 truncate">
                Dispatch team is allocating a verified driver partner for {vehicleModel || 'your vehicle class'}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px] pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
          <div className="text-slate-400">
            Route: <strong className="text-white">{pickupLocation} → {dropLocation}</strong>
          </div>

          <div className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/60 font-bold text-[10px]">
            {isAssigned ? 'Driver Partner Confirmed' : 'Route Scheduled'}
          </div>
        </div>
      </div>
    </div>
  );
};
