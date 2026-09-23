import React from 'react';
import { ChargingStation } from '../types';
import { useApp } from '../context/AppContext';
import {
  Zap,
  Navigation,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';

interface StationCardProps {
  station: ChargingStation;
  isSelected: boolean;
}

export const StationCard: React.FC<StationCardProps> = ({ station, isSelected }) => {
  const {
    setSelectedStation,
    setShowRouteOnMap,
    setInspectingStation,
    setIsPredictionModalOpen,
    startChargingSession,
    setIsCostModalOpen,
  } = useApp();

  const totalPorts = station.ports.reduce((acc, p) => acc + p.totalPorts, 0);
  const availablePorts = station.ports.reduce((acc, p) => acc + p.availablePorts, 0);
  const maxPowerKw = Math.max(...station.ports.map((p) => p.powerKw), 0);

  const handleSelect = () => {
    setSelectedStation(station);
    setShowRouteOnMap(true);
  };

  const handleOpenMLForecast = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInspectingStation(station);
    setIsPredictionModalOpen(true);
  };

  const handleStartCharge = (e: React.MouseEvent) => {
    e.stopPropagation();
    startChargingSession(station);
  };

  return (
    <div
      onClick={handleSelect}
      className={`group relative rounded-2xl p-4 transition-all duration-300 cursor-pointer border ${
        isSelected
          ? 'bg-slate-900/95 border-emerald-500/80 shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500/50'
          : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top AI Recommendation Ribbon if Top Pick */}
      {station.isTopPick && (
        <div className="mb-3 flex items-center justify-between gap-2 p-2 rounded-xl bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-slate-900 border border-purple-500/40 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400 animate-spin-slow" />
            <span>AI TOP RECOMMENDATION</span>
          </div>
          <span className="text-[11px] font-mono font-extrabold bg-purple-500 text-white px-2 py-0.5 rounded-full shadow">
            {station.aiMatchScore}% Match
          </span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors truncate">
              {station.name}
            </h3>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{station.address}</span>
          </p>
        </div>

        {/* Dynamic Price Display */}
        <div className="text-right shrink-0">
          <div className="text-base font-extrabold text-emerald-400 font-mono">
            ₹{station.basePricePerKwh}
            <span className="text-[10px] text-slate-400 font-sans font-normal">/kWh</span>
          </div>
          <div className="text-[11px] text-emerald-500/90 flex items-center justify-end gap-0.5 mt-0.5">
            <TrendingDown className="w-3 h-3" />
            <span>₹{station.offPeakPricePerKwh} off-peak</span>
          </div>
        </div>
      </div>

      {/* Highlights Bar: Distance, Waiting Time, Speed */}
      <div className="grid grid-cols-3 gap-2 my-3 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
        {/* Distance & Travel Time */}
        <div className="flex flex-col items-center justify-center p-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Distance</span>
          <span className="text-xs font-bold text-slate-200 mt-0.5">
            {station.distanceKm} km
          </span>
          <span className="text-[10px] text-slate-400">~{station.estimatedTravelMinutes}m drive</span>
        </div>

        {/* Waiting Time */}
        <div className="flex flex-col items-center justify-center p-1 border-x border-slate-800">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Queue</span>
          <span
            className={`text-xs font-bold mt-0.5 flex items-center gap-1 ${
              station.waitingTimeMinutes === 0
                ? 'text-emerald-400'
                : station.waitingTimeMinutes <= 10
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            <Clock className="w-3 h-3" />
            {station.waitingTimeMinutes === 0 ? '0 min' : `${station.waitingTimeMinutes} mins`}
          </span>
          <span className="text-[10px] text-slate-400">
            {availablePorts > 0 ? `${availablePorts}/${totalPorts} ports free` : 'All busy'}
          </span>
        </div>

        {/* Max Speed */}
        <div className="flex flex-col items-center justify-center p-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Max Speed</span>
          <span className="text-xs font-bold text-emerald-400 mt-0.5 flex items-center gap-0.5">
            <Zap className="w-3 h-3" />
            {maxPowerKw} kW
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {maxPowerKw >= 100 ? 'Ultra Fast' : maxPowerKw >= 50 ? 'DC Fast' : 'AC Standard'}
          </span>
        </div>
      </div>

      {/* Ports breakdown pills */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {station.ports.map((port) => (
          <div
            key={port.id}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px]"
          >
            <span className="font-semibold text-slate-300">{port.type}</span>
            <span className="font-mono text-emerald-400 font-bold">{port.powerKw}kW</span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                port.availablePorts > 0
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {port.availablePorts}/{port.totalPorts}
            </span>
          </div>
        ))}
      </div>

      {/* AI Recommendation Summary Line */}
      {station.aiRecommendationReason && (
        <div className="text-[11px] text-slate-300 bg-slate-950/40 p-2 rounded-xl border border-slate-800/60 mb-3 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{station.aiRecommendationReason}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/70">
        <button
          onClick={handleOpenMLForecast}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>24h ML Curve</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedStation(station);
              setShowRouteOnMap(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Route</span>
          </button>

          <button
            onClick={handleStartCharge}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Charge</span>
          </button>
        </div>
      </div>
    </div>
  );
};
