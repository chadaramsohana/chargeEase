import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEFAULT_EV_MODELS } from '../data/evModels';
import { ChargerType } from '../types';
import {
  Car,
  X,
  Battery,
  Zap,
  Sliders,
  Check,
  ShieldCheck,
  Fuel,
  Compass,
  DollarSign,
  Sparkles,
} from 'lucide-react';

export const EVProfileModal: React.FC = () => {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    vehicle,
    updateVehicle,
    updateChargingPreferences,
    switchEVModel,
  } = useApp();

  const [currentSoc, setCurrentSoc] = useState(vehicle.currentSoc);
  const [targetSoc, setTargetSoc] = useState(vehicle.targetSoc);
  const [priority, setPriority] = useState(vehicle.chargingPreferences.priority);
  const [preferredPlug, setPreferredPlug] = useState<ChargerType | 'any'>(
    vehicle.chargingPreferences.preferredPlug
  );
  const [minChargerSpeedKw, setMinChargerSpeedKw] = useState(
    vehicle.chargingPreferences.minChargerSpeedKw
  );
  const [avoidPeakTariffs, setAvoidPeakTariffs] = useState(
    vehicle.chargingPreferences.avoidPeakTariffs
  );

  if (!isProfileModalOpen) return null;

  const handleSave = () => {
    updateVehicle({
      currentSoc,
      targetSoc,
    });
    updateChargingPreferences({
      priority,
      preferredPlug,
      minChargerSpeedKw,
      avoidPeakTariffs,
    });
    setIsProfileModalOpen(false);
  };

  const currentVehicleFullName = `${vehicle.make} ${vehicle.model}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-lg">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">EV Profile & Charging Preferences</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your vehicle hardware specs, battery state of charge, and AI recommendation rules.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Preset Model Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Vehicle Model
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEFAULT_EV_MODELS.map((model) => {
                const fullName = `${model.make} ${model.model}`;
                const isSelected = fullName === currentVehicleFullName;
                return (
                  <button
                    key={fullName}
                    type="button"
                    onClick={() => switchEVModel(fullName)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-400 text-white ring-1 ring-blue-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{fullName}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {model.batteryCapacityKwh} kWh • {model.maxChargingSpeedKw} kW
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Vehicle Specs Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-400">Total Battery</span>
              <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                {vehicle.batteryCapacityKwh} kWh
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-400">Max DC Speed</span>
              <div className="text-base font-bold font-mono text-purple-400 mt-0.5">
                {vehicle.maxChargingSpeedKw} kW
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-400">Efficiency</span>
              <div className="text-base font-bold font-mono text-sky-400 mt-0.5">
                {vehicle.energyEfficiencyKwhPer100Km} <span className="text-[10px]">kWh/100km</span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-400">Plugs</span>
              <div className="text-xs font-bold font-mono text-slate-200 mt-1 truncate">
                {vehicle.supportedPlugs.join(', ')}
              </div>
            </div>
          </div>

          {/* SOC Sliders */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Battery className="w-4 h-4 text-amber-400" /> Current Battery SOC
                </span>
                <span className="font-mono text-amber-400 font-bold">{currentSoc}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={currentSoc}
                onChange={(e) => setCurrentSoc(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" /> Target Battery SOC
                </span>
                <span className="font-mono text-emerald-400 font-bold">{targetSoc}%</span>
              </div>
              <input
                type="range"
                min={currentSoc + 1}
                max="100"
                value={targetSoc}
                onChange={(e) => setTargetSoc(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[10px] text-slate-400">
                Tip: 80% is recommended for daily battery longevity, 100% for long roadtrips.
              </span>
            </div>
          </div>

          {/* Charging Preferences */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>AI Recommendation Rules & Preferences</span>
            </h4>

            {/* Priority Selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Station Ranking Priority</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { key: 'balanced', label: 'Balanced', desc: 'Price & Time' },
                  { key: 'cheapest', label: 'Lowest Cost', desc: 'Max Savings' },
                  { key: 'fastest', label: 'Fastest Speed', desc: 'Highest kW' },
                  { key: 'nearest', label: 'Nearest', desc: 'Min Distance' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setPriority(item.key as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      priority === item.key
                        ? 'bg-emerald-600/20 border-emerald-400 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>{item.label}</div>
                    <div className="text-[10px] font-normal text-slate-500">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Plug & Min Speed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Preferred Plug Type</label>
                <select
                  value={preferredPlug}
                  onChange={(e) => setPreferredPlug(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-400"
                >
                  <option value="any">Any Compatible Plug</option>
                  <option value="CCS2">CCS2 (DC Fast)</option>
                  <option value="Type 2">Type 2 (AC)</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                  <option value="GB/T">GB/T</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Min Charger Speed</label>
                <select
                  value={minChargerSpeedKw}
                  onChange={(e) => setMinChargerSpeedKw(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-400"
                >
                  <option value="0">Any Speed (including 22kW AC)</option>
                  <option value="50">50 kW+ (DC Fast Charger)</option>
                  <option value="100">100 kW+ (Ultra-Fast)</option>
                  <option value="150">150 kW+ (Supercharger)</option>
                </select>
              </div>
            </div>

            {/* Avoid Peak Tariffs Toggle */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-200">
                  Always prioritize Off-Peak Tariffs
                </div>
                <div className="text-[11px] text-slate-500">
                  Recommends nighttime and low-congestion windows to save up to 45% on electricity.
                </div>
              </div>
              <input
                type="checkbox"
                checked={avoidPeakTariffs}
                onChange={(e) => setAvoidPeakTariffs(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 accent-emerald-500 bg-slate-800 border-slate-700"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
