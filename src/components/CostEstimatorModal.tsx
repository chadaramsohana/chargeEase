import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calculator,
  X,
  Zap,
  TrendingDown,
  Battery,
  Clock,
  Coins,
  ShieldCheck,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { calculateRequiredEnergyKwh } from '../services/mlEngine';

export const CostEstimatorModal: React.FC = () => {
  const {
    isCostModalOpen,
    setIsCostModalOpen,
    vehicle,
    updateVehicle,
    selectedStation,
    stations,
  } = useApp();

  const [currentSoc, setCurrentSoc] = useState<number>(vehicle.currentSoc);
  const [targetSoc, setTargetSoc] = useState<number>(vehicle.targetSoc);
  const [selectedChargerKw, setSelectedChargerKw] = useState<number>(60);

  if (!isCostModalOpen) return null;

  const station = selectedStation || stations[0];
  const offPeakRate = station?.offPeakPricePerKwh || 8.2;
  const baseRate = station?.basePricePerKwh || 12.5;
  const peakRate = station?.peakPricePerKwh || 18.0;

  // Calculations
  const requiredEnergy = calculateRequiredEnergyKwh(
    vehicle.batteryCapacityKwh,
    currentSoc,
    targetSoc
  );

  const offPeakCost = Number((requiredEnergy * offPeakRate).toFixed(2));
  const baseCost = Number((requiredEnergy * baseRate).toFixed(2));
  const peakCost = Number((requiredEnergy * peakRate).toFixed(2));
  const maxSavings = Number((peakCost - offPeakCost).toFixed(2));
  const savingsPct = peakCost > 0 ? Math.round((maxSavings / peakCost) * 100) : 0;

  // Charging time estimation with taper factor past 80%
  const effectivePowerKw = Math.min(selectedChargerKw, vehicle.maxChargingSpeedKw);
  let estChargingMinutes = 0;
  if (effectivePowerKw > 0) {
    const rawHours = requiredEnergy / effectivePowerKw;
    // Taper factor if target > 80%
    const taperMultiplier = targetSoc > 80 ? 1.25 : 1.05;
    estChargingMinutes = Math.round(rawHours * 60 * taperMultiplier);
  }

  const handleApplyToVehicle = () => {
    updateVehicle({ currentSoc, targetSoc });
    setIsCostModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Smart EV Cost Estimator</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculate required energy, compare peak vs off-peak rates, and estimate savings.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCostModalOpen(false)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Active EV Card */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400">Vehicle: </span>
              <span className="font-bold text-slate-100">
                {vehicle.make} {vehicle.model}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Battery: </span>
              <span className="font-mono font-bold text-emerald-400">
                {vehicle.batteryCapacityKwh} kWh
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Max DC: </span>
              <span className="font-mono font-bold text-purple-400">
                {vehicle.maxChargingSpeedKw} kW
              </span>
            </div>
          </div>

          {/* Interactive SOC Sliders */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
            {/* Current SOC Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Battery className="w-4 h-4 text-amber-400" />
                  <span>Current Battery SOC</span>
                </span>
                <span className="font-mono text-base font-black text-amber-400">
                  {currentSoc}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={currentSoc}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentSoc(val);
                  if (val >= targetSoc) setTargetSoc(Math.min(100, val + 10));
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>5% (Critical)</span>
                <span>50%</span>
                <span>95% (Near full)</span>
              </div>
            </div>

            {/* Target SOC Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Target Battery SOC</span>
                </span>
                <span className="font-mono text-base font-black text-emerald-400">
                  {targetSoc}%
                </span>
              </div>
              <input
                type="range"
                min={currentSoc + 1}
                max="100"
                value={targetSoc}
                onChange={(e) => setTargetSoc(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{currentSoc + 1}%</span>
                <span className="text-emerald-400 font-bold">80% (Recommended daily)</span>
                <span>100% (Trip)</span>
              </div>
            </div>
          </div>

          {/* Required Energy Calculation Output */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Required Energy to Draw
              </span>
              <div className="text-2xl font-black text-white font-mono mt-0.5">
                {requiredEnergy} <span className="text-sm font-sans font-normal text-slate-400">kWh</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Formula: {vehicle.batteryCapacityKwh}kWh × ({targetSoc}% - {currentSoc}%) ÷ 90% efficiency
              </span>
            </div>

            {/* Estimated Duration */}
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Estimated Time
              </span>
              <div className="text-xl font-black text-emerald-400 font-mono mt-0.5 flex items-center justify-end gap-1">
                <Clock className="w-4 h-4" />
                <span>~{estChargingMinutes} mins</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                at {effectivePowerKw} kW DC speed
              </span>
            </div>
          </div>

          {/* 3-Tier Cost Comparison Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Dynamic Cost Comparison ({station?.name || 'Selected Station'})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Off-Peak Recommended */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-950/60 to-slate-950 border-2 border-purple-500/50 relative shadow-lg">
                <div className="absolute -top-2.5 right-3 bg-purple-500 text-white text-[9px] font-extrabold px-2 py-0.2 rounded-full uppercase">
                  ⭐ AI Smart Pick
                </div>
                <span className="text-[10px] uppercase text-purple-300 font-bold">
                  Off-Peak Window
                </span>
                <div className="text-2xl font-black text-purple-300 font-mono mt-1">
                  ₹{offPeakCost}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  ₹{offPeakRate}/kWh (11 PM - 3 AM)
                </div>
              </div>

              {/* Standard Base Rate */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 font-medium">
                  Standard Day Rate
                </span>
                <div className="text-2xl font-bold text-slate-200 font-mono mt-1">
                  ₹{baseCost}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  ₹{baseRate}/kWh (Regular hours)
                </div>
              </div>

              {/* Peak Rush Hour */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-rose-950/80">
                <span className="text-[10px] uppercase text-rose-400 font-medium flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Peak Rush Hour
                </span>
                <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
                  ₹{peakCost}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  ₹{peakRate}/kWh (5 PM - 9 PM)
                </div>
              </div>
            </div>
          </div>

          {/* Potential Savings Banner */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Total Potential Savings</div>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  ₹{maxSavings} ({savingsPct}% Saved)
                </div>
              </div>
            </div>

            <div className="text-xs text-right text-slate-400 max-w-xs">
              By charging during the recommended off-peak window instead of peak rush hour.
            </div>
          </div>

          {/* Charger Speed Selector */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300">
              Select Charging Station Power to estimate duration:
            </span>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[22, 50, 120, 240].map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setSelectedChargerKw(kw)}
                  className={`p-2.5 rounded-xl border font-mono font-bold transition-all ${
                    selectedChargerKw === kw
                      ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div>{kw} kW</div>
                  <div className="text-[10px] font-sans font-normal text-slate-500">
                    {kw === 22 ? 'AC Slow' : kw <= 60 ? 'DC Fast' : 'Ultra-Fast'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setIsCostModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleApplyToVehicle}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition-colors flex items-center gap-1.5"
          >
            <span>Save SOC Settings ({currentSoc}% → {targetSoc}%)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
