import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  History,
  X,
  Zap,
  TrendingDown,
  Clock,
  Leaf,
  Calendar,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  BarChart3,
  Award,
} from 'lucide-react';

export const ChargingHistoryModal: React.FC = () => {
  const {
    isHistoryModalOpen,
    setIsHistoryModalOpen,
    chargingSessions,
    logChargingSession,
    stations,
    vehicle,
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'recommended' | 'standard'>('all');

  if (!isHistoryModalOpen) return null;

  // Aggregate stats
  const totalEnergy = chargingSessions.reduce((acc, s) => acc + s.energyDeliveredKwh, 0);
  const totalCost = chargingSessions.reduce((acc, s) => acc + s.totalCost, 0);
  const totalSavings = chargingSessions.reduce((acc, s) => acc + s.estimatedSavings, 0);
  const totalCo2 = chargingSessions.reduce((acc, s) => acc + s.co2SavedKg, 0);
  const recommendedSessionsCount = chargingSessions.filter((s) => s.wasRecommendedTime).length;
  const adherenceRate = chargingSessions.length > 0
    ? Math.round((recommendedSessionsCount / chargingSessions.length) * 100)
    : 0;

  const filteredSessions = chargingSessions.filter((s) => {
    if (filterType === 'recommended') return s.wasRecommendedTime;
    if (filterType === 'standard') return !s.wasRecommendedTime;
    return true;
  });

  const handleSimulateNewSession = () => {
    const st = stations[0];
    const energy = Number((18 + Math.random() * 16).toFixed(1));
    const isOffPeak = Math.random() > 0.3;
    const cost = Number((energy * (isOffPeak ? 8.2 : 16.5)).toFixed(2));
    const savings = isOffPeak ? Number((energy * 8.5).toFixed(2)) : 0;

    logChargingSession({
      stationId: st.id,
      stationName: st.name,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      startSoc: 24,
      endSoc: 85,
      energyDeliveredKwh: energy,
      totalCost: cost,
      durationMinutes: Math.round(energy * 1.2),
      chargerType: 'CCS2',
      chargingPowerKw: 60,
      wasRecommendedTime: isOffPeak,
      estimatedSavings: savings,
      co2SavedKg: Number((energy * 0.78).toFixed(1)),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-lg">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Charging History & Cost Analytics</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Past EV charging sessions, energy consumed, and savings from AI off-peak scheduling.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsHistoryModalOpen(false)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Summary Stat Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Energy */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Energy</span>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-mono text-white mt-1">
                {totalEnergy.toFixed(1)} <span className="text-xs font-normal text-slate-400">kWh</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Across {chargingSessions.length} sessions</div>
            </div>

            {/* Total Cost Spent */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Spent</span>
                <span className="text-xs font-mono font-bold text-slate-400">₹</span>
              </div>
              <div className="text-2xl font-black font-mono text-slate-200 mt-1">
                ₹{totalCost.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Avg ₹{(totalCost / Math.max(1, totalEnergy)).toFixed(2)}/kWh</div>
            </div>

            {/* Smart Savings */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-950 border border-purple-500/40">
              <div className="flex items-center justify-between text-purple-300 text-xs">
                <span>AI Savings</span>
                <TrendingDown className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black font-mono text-purple-300 mt-1">
                ₹{totalSavings.toFixed(1)}
              </div>
              <div className="text-[10px] text-emerald-400 mt-1 font-semibold">
                Saved vs peak rates
              </div>
            </div>

            {/* Clean Carbon Saved */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>CO2 Prevented</span>
                <Leaf className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                {totalCo2.toFixed(1)} <span className="text-xs font-normal text-slate-400">kg</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">{adherenceRate}% AI window adherence</div>
            </div>
          </div>

          {/* Mini Usage Bar Chart */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Recent Charging Sessions Energy & Cost</span>
              </span>
              <button
                onClick={handleSimulateNewSession}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Simulate Completed Session</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {chargingSessions.slice(0, 4).map((s, idx) => {
                const maxKwh = 35;
                const fillPct = Math.min(100, Math.round((s.energyDeliveredKwh / maxKwh) * 100));
                return (
                  <div key={s.id || idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono">{s.date.split(' ')[0]}</span>
                      {s.wasRecommendedTime && (
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-bold">
                          AI Window
                        </span>
                      )}
                    </div>
                    <div className="my-2">
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-white font-mono">{s.energyDeliveredKwh} kWh</span>
                        <span className="text-emerald-400 font-mono">₹{s.totalCost}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${fillPct}%` }}
                          className={`h-full ${s.wasRecommendedTime ? 'bg-purple-500' : 'bg-emerald-500'}`}
                        ></div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{s.stationName}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Sessions Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Session Log ({filteredSessions.length})
              </h3>

              {/* Filter pills */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-lg ${
                    filterType === 'all'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('recommended')}
                  className={`px-2.5 py-1 rounded-lg ${
                    filterType === 'recommended'
                      ? 'bg-purple-600/30 text-purple-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  AI Window (Off-Peak)
                </button>
                <button
                  onClick={() => setFilterType('standard')}
                  className={`px-2.5 py-1 rounded-lg ${
                    filterType === 'standard'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Standard
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">{session.stationName}</span>
                      {session.wasRecommendedTime ? (
                        <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.2 rounded-full border border-purple-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-purple-400" />
                          Recommended Time (Off-Peak)
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.2 rounded-full">
                          Standard Daytime
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <span>{session.date}</span>
                      <span>•</span>
                      <span>{session.chargerType} ({session.chargingPowerKw} kW)</span>
                      <span>•</span>
                      <span className="text-slate-300">
                        {session.startSoc}% → {session.endSoc}%
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div>
                      <div className="font-bold font-mono text-white text-sm">
                        {session.energyDeliveredKwh} kWh
                      </div>
                      <div className="text-[10px] text-slate-500">{session.durationMinutes} mins</div>
                    </div>

                    <div className="min-w-[80px]">
                      <div className="font-bold font-mono text-emerald-400 text-sm">
                        ₹{session.totalCost}
                      </div>
                      {session.estimatedSavings > 0 ? (
                        <div className="text-[10px] text-purple-300 font-semibold">
                          Saved ₹{session.estimatedSavings}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-500">Peak tariff</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={() => setIsHistoryModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
