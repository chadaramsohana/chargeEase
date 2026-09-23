import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Clock,
  Zap,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Calendar,
  X,
  BatteryCharging,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { calculateRequiredEnergyKwh } from '../services/mlEngine';

export const MLPredictionModal: React.FC = () => {
  const {
    isPredictionModalOpen,
    setIsPredictionModalOpen,
    inspectingStation,
    selectedStation,
    vehicle,
    hourlyPredictions,
    recommendedWindow,
    startChargingSession,
  } = useApp();

  const currentHour = new Date().getHours();
  const [selectedHour, setSelectedHour] = useState<number>(currentHour);

  if (!isPredictionModalOpen) return null;

  const station = inspectingStation || selectedStation;
  if (!station || !recommendedWindow) return null;

  const requiredEnergy = calculateRequiredEnergyKwh(
    vehicle.batteryCapacityKwh,
    vehicle.currentSoc,
    vehicle.targetSoc
  );

  const activeSlot = hourlyPredictions[selectedHour] || hourlyPredictions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Modal Top Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-950/40">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  ML Charging Suitability & Window Forecast
                </h2>
                <span className="bg-purple-500/20 text-purple-300 text-xs px-2.5 py-0.5 rounded-full border border-purple-500/30 font-semibold">
                  AI Model v3.2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Analyzing historical station occupancy, dynamic tariff curves, grid strain, and your EV battery SOC.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPredictionModalOpen(false)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Target Vehicle & Station Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Target Station:</span>
              <span className="font-bold text-slate-100">{station.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <BatteryCharging className="w-4 h-4" />
                <span>
                  {vehicle.currentSoc}% → {vehicle.targetSoc}% ({requiredEnergy} kWh needed)
                </span>
              </div>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300 font-medium">
                {vehicle.make} {vehicle.model} ({vehicle.batteryCapacityKwh} kWh)
              </span>
            </div>
          </div>

          {/* Module 5: AI Recommended Charging Time Window Showcase */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950/90 via-slate-900 to-indigo-950 border-2 border-purple-500/50 p-5 shadow-xl shadow-purple-950/40">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-500 text-white font-extrabold text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full">
                    ⭐ AI RECOMMENDED WINDOW
                  </span>
                  <span className="text-purple-300 text-xs font-semibold">
                    {recommendedWindow.badge}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  {recommendedWindow.windowLabel}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Best window for charging. Station queue is near zero, dynamic tariff drops to{' '}
                  <span className="text-emerald-400 font-bold font-mono">
                    ₹{recommendedWindow.avgPricePerKwh}/kWh
                  </span>
                  , and grid carbon intensity is lowest.
                </p>
              </div>

              {/* Cost & Savings Highlights Card */}
              <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-purple-500/30 shrink-0 shadow-inner">
                {/* Expected Cost */}
                <div className="text-center px-3 border-r border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 font-medium">
                    Expected Cost
                  </span>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                    ₹{recommendedWindow.expectedCost}
                  </div>
                  <span className="text-[10px] text-slate-500">at recommended time</span>
                </div>

                {/* Peak Cost Comparison */}
                <div className="text-center px-3 border-r border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 font-medium">Peak Cost</span>
                  <div className="text-lg font-bold text-rose-400 font-mono line-through mt-0.5 opacity-80">
                    ₹{recommendedWindow.peakCostComparison}
                  </div>
                  <span className="text-[10px] text-slate-500">at 6:00 PM rush</span>
                </div>

                {/* Potential Savings */}
                <div className="text-center px-3">
                  <span className="text-[10px] uppercase text-purple-300 font-bold flex items-center gap-1 justify-center">
                    <TrendingDown className="w-3 h-3 text-purple-400" /> You Save
                  </span>
                  <div className="text-2xl font-black text-purple-300 font-mono mt-0.5">
                    ₹{recommendedWindow.potentialSavings}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400">
                    {recommendedWindow.savingsPercentage}% Cheaper!
                  </span>
                </div>
              </div>
            </div>

            {/* AI Reasoning Points */}
            <div className="mt-4 pt-4 border-t border-purple-500/20 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs text-slate-300">
              {recommendedWindow.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Module 4: 24-Hour Suitability ML Prediction Interactive Graph */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>24-Hour ML Charging Suitability Curve</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Select any hour below to inspect dynamic tariff, queue probability, and estimated cost.
                </p>
              </div>

              {/* Legend */}
              <div className="hidden sm:flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Optimal (80+)
                </span>
                <span className="flex items-center gap-1 text-sky-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Good (65-79)
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate (45-64)
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Peak Avoid (&lt;45)
                </span>
              </div>
            </div>

            {/* 24-Hour Visual Bar Histogram */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 overflow-x-auto">
              <div className="min-w-[680px]">
                <div className="grid grid-cols-24 gap-1 h-36 items-end pb-2 border-b border-slate-800">
                  {hourlyPredictions.map((pred) => {
                    const isSelected = selectedHour === pred.hour;
                    const isCurrent = currentHour === pred.hour;
                    const heightPct = Math.max(15, pred.suitabilityScore);

                    let barColor = 'bg-rose-500';
                    if (pred.status === 'optimal') barColor = 'bg-emerald-500';
                    else if (pred.status === 'good') barColor = 'bg-sky-500';
                    else if (pred.status === 'moderate') barColor = 'bg-amber-500';

                    return (
                      <div
                        key={pred.hour}
                        onClick={() => setSelectedHour(pred.hour)}
                        className="group relative flex flex-col items-center justify-end h-full cursor-pointer"
                        title={`${pred.timeLabel}: Score ${pred.suitabilityScore}/100, ₹${pred.pricePerKwh}/kWh`}
                      >
                        {/* Current Time Dot */}
                        {isCurrent && (
                          <div className="absolute -top-3 w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
                        )}

                        {/* Bar */}
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-t-md transition-all duration-200 ${barColor} ${
                            isSelected
                              ? 'ring-2 ring-white opacity-100 scale-105'
                              : 'opacity-70 group-hover:opacity-100 group-hover:scale-105'
                          }`}
                        ></div>
                      </div>
                    );
                  })}
                </div>

                {/* Hour Labels */}
                <div className="grid grid-cols-24 gap-1 pt-2 text-[10px] text-slate-500 font-mono text-center">
                  {hourlyPredictions.map((pred) => (
                    <div
                      key={pred.hour}
                      onClick={() => setSelectedHour(pred.hour)}
                      className={`cursor-pointer transition-colors ${
                        selectedHour === pred.hour
                          ? 'text-white font-bold'
                          : 'hover:text-slate-300'
                      }`}
                    >
                      {pred.hour % 3 === 0 ? `${pred.hour}h` : '·'}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Inspected Hour Detail Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-medium">
                  Inspected Time
                </span>
                <div className="text-base font-black text-white mt-0.5">
                  {activeSlot.timeLabel}
                  {currentHour === activeSlot.hour && (
                    <span className="ml-2 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-normal">
                      Now
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-1">{activeSlot.reason}</div>
              </div>

              {/* Suitability Score */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] uppercase text-slate-400 font-medium">
                  Suitability Score
                </span>
                <div
                  className={`text-xl font-extrabold font-mono mt-0.5 ${
                    activeSlot.status === 'optimal'
                      ? 'text-emerald-400'
                      : activeSlot.status === 'good'
                      ? 'text-sky-400'
                      : activeSlot.status === 'moderate'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {activeSlot.suitabilityScore}/100
                </div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">
                  {activeSlot.status.replace('_', ' ')}
                </span>
              </div>

              {/* Price & Congestion */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] uppercase text-slate-400 font-medium">
                  Tariff & Congestion
                </span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  ₹{activeSlot.pricePerKwh}
                  <span className="text-xs text-slate-400 font-sans">/kWh</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {activeSlot.stationOccupancyPct}% busy • ~{activeSlot.predictedQueueMinutes}m wait
                </span>
              </div>

              {/* Total Charge Cost */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] uppercase text-slate-400 font-medium">
                  Estimated Cost
                </span>
                <div className="text-xl font-black font-mono text-white mt-0.5">
                  ₹{activeSlot.costEstimateForCharge}
                </div>
                <span className="text-[10px] text-slate-400">
                  for {requiredEnergy} kWh charge
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span>AI calculates recommendations dynamically without requiring IoT telemetry.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPredictionModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                setIsPredictionModalOpen(false);
                startChargingSession(station);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Charge at {station.name.split('-')[0]}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
