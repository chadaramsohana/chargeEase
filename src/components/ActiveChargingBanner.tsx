import React from 'react';
import { useApp } from '../context/AppContext';
import { Zap, Square, Sparkles, BatteryCharging, CheckCircle2 } from 'lucide-react';

export const ActiveChargingBanner: React.FC = () => {
  const { activeCharging, stopChargingSession, vehicle } = useApp();

  if (!activeCharging) return null;

  const isCompleted = activeCharging.currentSoc >= activeCharging.targetSoc;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-2xl mx-auto animate-bounce-subtle">
      <div className="bg-slate-900/95 backdrop-blur-xl p-4 rounded-3xl border-2 border-emerald-500/80 shadow-2xl shadow-emerald-950/60 ring-1 ring-emerald-400/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Status & Animation */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-2xl bg-emerald-400 opacity-40"></span>
              <div className="relative w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  {isCompleted ? 'Target SOC Reached' : 'Live Charging in Progress'}
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.2 rounded-full font-mono">
                  {activeCharging.powerKw} kW DC
                </span>
              </div>
              <h4 className="text-sm font-bold text-white truncate max-w-xs">
                {activeCharging.stationName}
              </h4>
            </div>
          </div>

          {/* Center: Live Stats */}
          <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 shrink-0">
            {/* SOC Progress */}
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-medium">Battery SOC</div>
              <div className="text-base font-black text-emerald-400 font-mono">
                {activeCharging.currentSoc}%
                <span className="text-xs text-slate-500 font-normal"> / {activeCharging.targetSoc}%</span>
              </div>
            </div>

            {/* Energy */}
            <div className="border-x border-slate-800 px-3">
              <div className="text-[10px] text-slate-400 uppercase font-medium">Energy</div>
              <div className="text-base font-black text-white font-mono">
                {activeCharging.energyDeliveredKwh}{' '}
                <span className="text-[10px] font-normal text-slate-400">kWh</span>
              </div>
            </div>

            {/* Cost */}
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-medium">Cost</div>
              <div className="text-base font-black text-purple-300 font-mono">
                ₹{activeCharging.costSoFar}
              </div>
            </div>
          </div>

          {/* Right: Stop Button */}
          <button
            onClick={stopChargingSession}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all shrink-0 ${
              isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Square className="w-3.5 h-3.5 fill-current" />}
            <span>{isCompleted ? 'Finish & Log' : 'Stop Session'}</span>
          </button>
        </div>

        {/* Real-time Progress Bar */}
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 h-full transition-all duration-300"
            style={{
              width: `${Math.min(
                100,
                Math.max(0, ((activeCharging.currentSoc - activeCharging.startSoc) / Math.max(1, activeCharging.targetSoc - activeCharging.startSoc)) * 100)
              )}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
