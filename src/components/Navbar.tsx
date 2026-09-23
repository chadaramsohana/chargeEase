import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Zap,
  Battery,
  Sparkles,
  Calculator,
  History,
  User,
  MapPin,
  Bot,
  Layers,
  ChevronDown,
  Navigation,
  Radio,
  LogOut,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    user,
    isAuthenticated,
    vehicle,
    userLocation,
    recommendedWindow,
    isRealTimeGpsTracking,
    toggleRealTimeGps,
    logout,
    setIsAuthModalOpen,
    setIsProfileModalOpen,
    setIsCostModalOpen,
    setIsHistoryModalOpen,
    setIsPredictionModalOpen,
    setIsCopilotModalOpen,
  } = useApp();

  // Battery status color
  let batteryColor = 'text-emerald-400';
  let batteryBg = 'bg-emerald-500/20 border-emerald-500/30';
  if (vehicle.currentSoc <= 20) {
    batteryColor = 'text-rose-400';
    batteryBg = 'bg-rose-500/20 border-rose-500/30 animate-pulse';
  } else if (vehicle.currentSoc <= 40) {
    batteryColor = 'text-amber-400';
    batteryBg = 'bg-amber-500/20 border-amber-500/30';
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo & Location */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-white/20 shrink-0">
              <Zap className="w-5 h-5 text-slate-950 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">
                  Charge<span className="text-emerald-400">Ease</span>
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider border border-emerald-500/30">
                  AP • VIZAG
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block truncate max-w-[200px]">
                {userLocation.addressName.split(',')[0]}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Real-Time GPS Tracking Button & Vehicle SOC */}
        <div className="flex items-center gap-2">
          {/* Live Real-Time GPS Toggle Button */}
          <button
            onClick={toggleRealTimeGps}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all ${
              isRealTimeGpsTracking
                ? 'bg-blue-500/20 border-blue-400/60 text-blue-300 ring-1 ring-blue-400/40 shadow-lg shadow-blue-900/30'
                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Live GPS Tracking"
          >
            <span className="relative flex h-2.5 w-2.5">
              {isRealTimeGpsTracking && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isRealTimeGpsTracking ? 'bg-blue-400' : 'bg-slate-600'
                }`}
              ></span>
            </span>
            <span className="text-[11px] sm:text-xs">
              {isRealTimeGpsTracking ? 'Live GPS Active' : 'Start GPS'}
            </span>
          </button>

          {/* Vehicle SOC Pill */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl border ${batteryBg} transition-all hover:scale-102`}
            title="Configure EV Profile & Battery"
          >
            <Battery className={`w-4 h-4 ${batteryColor}`} />
            <div className="text-left text-xs">
              <span className="font-bold text-white mr-1.5">{vehicle.model.split(' ')[0]}</span>
              <span className={`font-mono font-extrabold ${batteryColor}`}>
                {vehicle.currentSoc}% SOC
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* AI Recommended Window Pill */}
          {recommendedWindow && (
            <button
              onClick={() => setIsPredictionModalOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/40 text-purple-300 text-xs font-semibold shadow-sm transition-all"
              title="View 24-Hour ML Predictions"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Optimal: {recommendedWindow.windowLabel}</span>
              <span className="bg-purple-500 text-white font-mono text-[10px] px-1.5 py-0.2 rounded-full">
                Save {recommendedWindow.savingsPercentage}%
              </span>
            </button>
          )}
        </div>

        {/* Right Navigation & Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cost Estimator Button */}
          <button
            onClick={() => setIsCostModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-medium transition-colors"
            title="Cost Estimator"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Cost</span>
          </button>

          {/* ML 24h Prediction Button */}
          <button
            onClick={() => setIsPredictionModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-medium transition-colors"
            title="24-Hour ML Prediction"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">ML Forecast</span>
          </button>

          {/* History / Analytics Button */}
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs transition-colors"
            title="Charging History & Analytics"
          >
            <History className="w-4 h-4 text-sky-400" />
          </button>

          {/* AI Copilot Button */}
          <button
            onClick={() => setIsCopilotModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all"
            title="AI Range & Battery Advisor"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* User Account / Profile */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 p-1 pl-1 pr-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="User Profile & Settings"
          >
            {isAuthenticated && user ? (
              <>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover border border-emerald-500/50"
                />
                <span className="text-xs font-bold text-slate-200 hidden sm:inline max-w-[80px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
