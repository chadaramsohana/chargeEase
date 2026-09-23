import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { ChargingStation } from '../types';
import {
  Navigation,
  Compass,
  Zap,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  Crosshair,
  Maximize2,
  Radio,
  Eye,
} from 'lucide-react';
import { POPULAR_LOCATIONS } from '../data/mockStations';

export const InteractiveMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  const {
    stations,
    selectedStation,
    setSelectedStation,
    userLocation,
    requestGpsLocation,
    isRealTimeGpsTracking,
    toggleRealTimeGps,
    setPresetCity,
    showRouteOnMap,
    setShowRouteOnMap,
    setInspectingStation,
    setIsPredictionModalOpen,
    startChargingSession,
  } = useApp();

  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [mapStyle, setMapStyle] = useState<'dark' | 'streets'>('dark');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 13,
      zoomControl: false,
    });

    // Add zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Default tile layer: CartoDB Dark Matter
    const tileLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap & CartoDB',
        maxZoom: 19,
        subdomains: 'abcd',
      }
    );
    tileLayer.addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const url =
      mapStyle === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(url, {
      attribution: '&copy; OpenStreetMap & CartoDB',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);
  }, [mapStyle]);

  // Update User Marker & Accuracy Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.remove();
    }

    const isLive = isRealTimeGpsTracking || userLocation.isGps;

    const userIcon = L.divIcon({
      className: 'user-gps-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-9 w-9 rounded-full ${
            isLive ? 'bg-blue-400 opacity-75' : 'bg-emerald-400 opacity-50'
          }"></span>
          <div class="relative w-7 h-7 ${
            isLive ? 'bg-blue-600' : 'bg-emerald-600'
          } rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const marker = L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    const tooltipContent = isLive
      ? `<div class="text-xs font-bold text-blue-400">🔴 Live Real-Time GPS Location</div><div class="text-[10px] text-slate-300">${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}${userLocation.accuracyMeters ? ` (±${userLocation.accuracyMeters}m)` : ''}</div>`
      : `<div class="text-xs font-semibold px-1 py-0.5">${userLocation.addressName}</div>`;

    marker.bindTooltip(tooltipContent, {
      permanent: false,
      direction: 'top',
      offset: [0, -14],
    });

    userMarkerRef.current = marker;

    // Accuracy Circle
    if (userLocation.accuracyMeters && userLocation.accuracyMeters > 0) {
      const circle = L.circle([userLocation.lat, userLocation.lng], {
        radius: Math.min(250, userLocation.accuracyMeters),
        color: '#3b82f6',
        weight: 1,
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
      }).addTo(map);
      accuracyCircleRef.current = circle;
    }

    // If real-time GPS was just activated, pan smoothly
    if (isRealTimeGpsTracking) {
      map.panTo([userLocation.lat, userLocation.lng], { animate: true });
    }
  }, [userLocation, isRealTimeGpsTracking]);

  // Update Station Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    stations.forEach((st) => {
      const isSelected = selectedStation?.id === st.id;
      const isTopPick = st.isTopPick;
      const freePorts = st.ports.reduce((acc, p) => acc + p.availablePorts, 0);

      // Icon colors
      let badgeBg = 'bg-emerald-500 text-white';
      let pinBorder = 'border-emerald-400';
      if (st.status === 'queue' || freePorts === 0) {
        badgeBg = 'bg-amber-500 text-white';
        pinBorder = 'border-amber-400';
      }
      if (isTopPick) {
        badgeBg = 'bg-purple-600 text-white';
        pinBorder = 'border-purple-400 shadow-purple-500/50';
      }

      const customIcon = L.divIcon({
        className: `custom-station-pin ${isSelected ? 'is-selected' : ''}`,
        html: `
          <div class="group relative cursor-pointer transform transition-all duration-300 ${
            isSelected ? 'scale-125 z-50' : 'hover:scale-110'
          }">
            ${
              isTopPick
                ? `<div class="absolute -top-3 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold text-[9px] px-1.5 py-0.2 rounded-full shadow-md flex items-center gap-0.5 border border-white">
                    ⭐ AI PICK
                   </div>`
                : ''
            }
            <div class="w-9 h-9 rounded-2xl ${badgeBg} border-2 ${pinBorder} shadow-xl flex items-center justify-center text-xs font-bold transition-all">
              <span class="flex items-center gap-0.5">
                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M11 20v-6H7l8-12v6h4l-8 12z"/></svg>
              </span>
            </div>
            <div class="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-900/90 text-slate-200 backdrop-blur-xs text-[10px] font-semibold px-2 py-0.5 rounded shadow whitespace-nowrap border border-slate-700/60 mt-0.5">
              ${st.distanceKm !== undefined ? `${st.distanceKm} km` : '₹' + st.basePricePerKwh}
            </div>
          </div>
        `,
        iconSize: [36, 48],
        iconAnchor: [18, 24],
      });

      const marker = L.marker([st.lat, st.lng], { icon: customIcon }).addTo(markersGroup);

      marker.on('click', () => {
        setSelectedStation(st);
        setShowRouteOnMap(true);
      });
    });
  }, [stations, selectedStation]);

  // Update Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (showRouteOnMap && selectedStation) {
      const userPoint: [number, number] = [userLocation.lat, userLocation.lng];
      const stationPoint: [number, number] = [selectedStation.lat, selectedStation.lng];

      // Route line with curved / road-like midpoint
      const midLat = (userPoint[0] + stationPoint[0]) / 2 + 0.002;
      const midLng = (userPoint[1] + stationPoint[1]) / 2 - 0.002;

      const polyline = L.polyline([userPoint, [midLat, midLng], stationPoint], {
        color: '#10b981',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);

      routePolylineRef.current = polyline;

      // Fit map bounds to view both user and selected station
      const bounds = L.latLngBounds([userPoint, stationPoint]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }, [showRouteOnMap, selectedStation, userLocation]);

  const handleLocateMe = async () => {
    setIsGpsLoading(true);
    const success = await requestGpsLocation();
    setIsGpsLoading(false);

    if (success && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 14, { animate: true });
    }
  };

  const handleCenterOnSelected = () => {
    if (selectedStation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([selectedStation.lat, selectedStation.lng], 15, {
        animate: true,
      });
    }
  };

  const handleFitVizagStations = () => {
    if (!mapInstanceRef.current || stations.length === 0) return;
    const points = stations.map((s) => [s.lat, s.lng] as [number, number]);
    points.push([userLocation.lat, userLocation.lng]);
    const bounds = L.latLngBounds(points);
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950">
      {/* Leaflet container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Top Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-2">
        {/* Left: Location & Area Dropdown */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 shadow-xl">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
              Andhra Pradesh / Vizag Hub
            </span>
            <select
              value={userLocation.addressName.split(',')[0]}
              onChange={(e) => setPresetCity(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-2 max-w-[210px] sm:max-w-xs truncate"
            >
              {POPULAR_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name} className="bg-slate-900 text-slate-200">
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: GPS Tracking, Fit View & Theme Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Real-Time GPS Tracking Toggle Button */}
          <button
            onClick={toggleRealTimeGps}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg transition-all border ${
              isRealTimeGpsTracking
                ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400 shadow-blue-900/40 ring-2 ring-blue-400/40'
                : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700/70'
            }`}
            title="Real-Time GPS Tracking"
          >
            <Radio
              className={`w-3.5 h-3.5 ${isRealTimeGpsTracking ? 'animate-pulse text-white' : 'text-blue-400'}`}
            />
            <span>
              {isRealTimeGpsTracking
                ? `Live GPS (±${userLocation.accuracyMeters || 5}m)`
                : 'Real-Time GPS'}
            </span>
          </button>

          {/* Quick Single GPS Fix */}
          <button
            onClick={handleLocateMe}
            disabled={isGpsLoading}
            className="p-2 rounded-xl bg-slate-900/90 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 border border-slate-700/70 shadow-lg transition-all"
            title="Locate My EV Now"
          >
            <Crosshair
              className={`w-4 h-4 ${isGpsLoading ? 'animate-spin text-emerald-400' : 'text-slate-300'}`}
            />
          </button>

          {/* Fit all Vizag Stations */}
          <button
            onClick={handleFitVizagStations}
            className="p-2 rounded-xl bg-slate-900/90 text-slate-300 hover:text-purple-400 hover:bg-slate-800 border border-slate-700/70 shadow-lg transition-all"
            title="Fit All Vizag Stations"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Toggle Map Theme */}
          <button
            onClick={() => setMapStyle((s) => (s === 'dark' ? 'streets' : 'dark'))}
            className="p-2 rounded-xl bg-slate-900/90 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 border border-slate-700/70 shadow-lg transition-all"
            title="Toggle Map Style"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Route Info Badge Overlay */}
      {showRouteOnMap && selectedStation && (
        <div className="absolute top-16 left-4 z-20 pointer-events-auto max-w-sm">
          <div className="bg-slate-900/95 backdrop-blur-md p-2.5 rounded-xl border border-emerald-500/40 shadow-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4 animate-pulse" />
            </div>
            <div className="text-xs">
              <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span>Route Active: {selectedStation.name.split(' - ')[0]}</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
              <div className="text-slate-300 text-[11px] flex items-center gap-2 mt-0.5">
                <span className="font-bold">{selectedStation.distanceKm} km</span>
                <span>•</span>
                <span>~{selectedStation.estimatedTravelMinutes} mins driving</span>
                <span>•</span>
                <span className="text-amber-300">
                  {selectedStation.waitingTimeMinutes === 0
                    ? 'No wait'
                    : `${selectedStation.waitingTimeMinutes}m wait`}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowRouteOnMap(false)}
              className="ml-auto text-slate-400 hover:text-slate-100 text-xs px-1.5 py-0.5 rounded bg-slate-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Quick Selected Station Preview Card at Bottom of Map */}
      {selectedStation && (
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-auto max-w-xl mx-auto">
          <div className="bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/80 shadow-2xl">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedStation.isTopPick
                      ? 'bg-purple-600/30 text-purple-400 border border-purple-500/40'
                      : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-100">{selectedStation.name}</h4>
                    {selectedStation.isTopPick && (
                      <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                        <Sparkles className="w-2.5 h-2.5" /> AI TOP PICK
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{selectedStation.address}</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-400">
                      {selectedStation.distanceKm} km
                    </span>
                  </p>
                </div>
              </div>

              {/* Price Pill */}
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-emerald-400">
                  ₹{selectedStation.basePricePerKwh}/kWh
                </div>
                <div className="text-[10px] text-slate-400">
                  {selectedStation.waitingTimeMinutes === 0
                    ? '0 min queue'
                    : `~${selectedStation.waitingTimeMinutes}m wait`}
                </div>
              </div>
            </div>

            {/* Ports & Action buttons */}
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                {selectedStation.ports.map((port) => (
                  <span
                    key={port.id}
                    className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px] flex items-center gap-1"
                  >
                    <span>{port.type}</span>
                    <span className="text-emerald-400 font-bold">{port.powerKw}kW</span>
                    <span
                      className={`text-[9px] px-1 rounded ${
                        port.availablePorts > 0
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {port.availablePorts}/{port.totalPorts} free
                    </span>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* View 24h ML Prediction */}
                <button
                  onClick={() => {
                    setInspectingStation(selectedStation);
                    setIsPredictionModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ML Forecast</span>
                </button>

                {/* Simulate Charge */}
                <button
                  onClick={() => startChargingSession(selectedStation)}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Charge Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
