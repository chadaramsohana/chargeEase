import React, { useMemo } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthGate } from './components/AuthGate';
import { Navbar } from './components/Navbar';
import { InteractiveMap } from './components/InteractiveMap';
import { StationCard } from './components/StationCard';
import { FilterBar } from './components/FilterBar';
import { MLPredictionModal } from './components/MLPredictionModal';
import { CostEstimatorModal } from './components/CostEstimatorModal';
import { EVProfileModal } from './components/EVProfileModal';
import { ChargingHistoryModal } from './components/ChargingHistoryModal';
import { AuthModal } from './components/AuthModal';
import { ActiveChargingBanner } from './components/ActiveChargingBanner';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { filterStations } from './services/mlEngine';
import {
  Sparkles,
  Zap,
  Navigation,
  Clock,
  Battery,
  TrendingDown,
  MapPin,
  Compass,
  Layers,
  ArrowRight,
  ShieldCheck,
  Fuel,
  Info,
  Radio,
  User,
} from 'lucide-react';

const MainDashboard: React.FC = () => {
  const {
    stations,
    selectedStation,
    vehicle,
    filterState,
    recommendedWindow,
    user,
    userLocation,
    isRealTimeGpsTracking,
    toggleRealTimeGps,
    setIsPredictionModalOpen,
    setIsCostModalOpen,
    setIsProfileModalOpen,
    setSelectedStation,
    setShowRouteOnMap,
    startChargingSession,
  } = useApp();

  // Filtered stations list
  const filteredList = useMemo(() => {
    return filterStations(
      stations,
      filterState.searchQuery,
      filterState.availableNowOnly,
      filterState.lowWaitOnly,
      filterState.selectedPlugs,
      filterState.minPowerKw,
      filterState.sortBy
    );
  }, [stations, filterState]);

  // Top AI Recommended Station
  const topRecommendedStation = stations.find((s) => s.isTopPick) || stations[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Navigation */}
      <Navbar />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Welcome Driver Bar & Real-Time GPS Status */}
        <div className="bg-slate-900/80 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 border border-emerald-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Welcome, {user?.name || 'EV Driver'}
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.2 rounded-full font-mono">
                  {user?.vehicleNumber || 'AP 39 EV 2026'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{userLocation.addressName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Real-Time GPS Tracking Status Badge & Toggle */}
            <button
              onClick={toggleRealTimeGps}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isRealTimeGpsTracking
                  ? 'bg-blue-600/20 border-blue-400/50 text-blue-300 shadow-md shadow-blue-900/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Radio
                className={`w-3.5 h-3.5 ${isRealTimeGpsTracking ? 'animate-pulse text-blue-400' : 'text-slate-500'}`}
              />
              <span>
                {isRealTimeGpsTracking
                  ? `Live GPS Tracking Active (±${userLocation.accuracyMeters || 5}m)`
                  : 'Enable Live GPS Tracking'}
              </span>
            </button>

            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Vehicle Specs
            </button>
          </div>
        </div>

        {/* Hero Alert: AI Recommended Charging Time Window & Vehicle SOC Status */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 p-4 sm:p-5 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            {/* Left: AI Charging Window Highlight */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-900/40 shrink-0">
                <Sparkles className="w-6 h-6 animate-spin-slow" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border border-purple-500/30">
                    ANDHRA PRADESH OPTIMAL WINDOW
                  </span>
                  <span className="text-xs text-slate-400">
                    Dynamic Tariff & Grid Congestion ML
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-0.5 flex items-center gap-2">
                  <span>Recommended: {recommendedWindow?.windowLabel || '11:00 PM – 2:00 AM'}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                    Save {recommendedWindow?.savingsPercentage || 45}%
                  </span>
                </h2>
                <p className="text-xs text-slate-400 hidden sm:block mt-0.5">
                  Expected cost: <span className="font-mono text-emerald-400 font-bold">₹{recommendedWindow?.expectedCost || 204}</span> vs peak <span className="line-through text-rose-400 font-mono">₹{recommendedWindow?.peakCostComparison || 410}</span> • Queue: 0 min
                </p>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => setIsPredictionModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all shadow-sm"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Inspect 24h Curve</span>
              </button>

              <button
                onClick={() => setIsCostModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all"
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Estimate Savings</span>
              </button>
            </div>
          </div>
        </section>

        {/* Dual Panel Layout: Station Finder & Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: AI Top Pick, Filters, and Station Cards (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Top AI Station Recommendation Card ⭐ (Module 10) */}
            {topRecommendedStation && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/80 via-slate-900 to-slate-950 border-2 border-purple-500/50 p-4 shadow-xl">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-300 tracking-wider">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>AI BEST MATCH FOR {vehicle.model.toUpperCase()}</span>
                  </div>
                  <span className="bg-purple-500 text-white font-mono font-black text-xs px-2 py-0.5 rounded-full shadow">
                    {topRecommendedStation.aiMatchScore}% Score
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {topRecommendedStation.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {topRecommendedStation.address}
                    </p>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <div className="text-base font-black text-emerald-400">
                      ₹{topRecommendedStation.basePricePerKwh}/kWh
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {topRecommendedStation.waitingTimeMinutes === 0 ? '0 min wait' : `${topRecommendedStation.waitingTimeMinutes}m queue`}
                    </div>
                  </div>
                </div>

                {/* Recommendation summary badge */}
                <div className="my-2.5 p-2 rounded-xl bg-slate-950/80 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold">{topRecommendedStation.distanceKm} km away</span>
                    <span>•</span>
                    <span className="text-slate-400">~{topRecommendedStation.estimatedTravelMinutes} mins</span>
                  </div>
                  <span className="text-emerald-400 font-semibold text-[11px]">
                    {topRecommendedStation.ports.find((p) => p.powerKw >= 60)?.powerKw || 60}kW Fast Charger Ready
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-purple-900/40">
                  <button
                    onClick={() => {
                      setSelectedStation(topRecommendedStation);
                      setShowRouteOnMap(true);
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View Route on Map</span>
                  </button>

                  <button
                    onClick={() => startChargingSession(topRecommendedStation)}
                    className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-lg shadow-emerald-900/30"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Charge Now</span>
                  </button>
                </div>
              </div>
            )}

            {/* Station Search & Filters Bar (Module 11) */}
            <FilterBar />

            {/* Station List Header */}
            <div className="flex items-center justify-between px-1 text-xs text-slate-400">
              <span>
                Showing <strong className="text-slate-200">{filteredList.length}</strong> stations near {userLocation.addressName.split(',')[0]}
              </span>
              <span className="text-[11px]">Ranked by ML suitability</span>
            </div>

            {/* Station Cards Scrollable List */}
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredList.length > 0 ? (
                filteredList.map((station) => (
                  <StationCard
                    key={station.id}
                    station={station}
                    isSelected={selectedStation?.id === station.id}
                  />
                ))
              ) : (
                <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
                  <Fuel className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No charging stations match filters</p>
                  <p className="text-xs text-slate-500">
                    Try clearing plug type or power requirements to see all stations.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Map (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="h-[680px] w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
              <InteractiveMap />
            </div>

            {/* Quick Map Feature Guidance Banner */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Real-time GPS calculates live distance & road travel time across Visakhapatnam & Andhra Pradesh.
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Available
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> Busy
                </span>
                <span className="flex items-center gap-1 text-purple-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span> AI Top Pick
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Active Charging Simulation Sticky Banner */}
      <ActiveChargingBanner />

      {/* Modals & Drawers */}
      <MLPredictionModal />
      <CostEstimatorModal />
      <EVProfileModal />
      <ChargingHistoryModal />
      <AuthModal />
      <AICopilotDrawer />
    </div>
  );
};

const ChargeEaseApp: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <AuthGate />;
  }

  return <MainDashboard />;
};

export default function App() {
  return (
    <AppProvider>
      <ChargeEaseApp />
    </AppProvider>
  );
}
