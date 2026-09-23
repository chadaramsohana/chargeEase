import React from 'react';
import { useApp } from '../context/AppContext';
import { ChargerType } from '../types';
import {
  Search,
  SlidersHorizontal,
  Zap,
  Clock,
  CheckCircle2,
  X,
  Compass,
  DollarSign,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';

export const FilterBar: React.FC = () => {
  const { filterState, setFilterState, resetFilters } = useApp();

  const plugOptions: ChargerType[] = ['CCS2', 'Type 2', 'CHAdeMO', 'GB/T'];

  const togglePlug = (plug: ChargerType) => {
    setFilterState((prev) => {
      const exists = prev.selectedPlugs.includes(plug);
      return {
        ...prev,
        selectedPlugs: exists
          ? prev.selectedPlugs.filter((p) => p !== plug)
          : [...prev.selectedPlugs, plug],
      };
    });
  };

  const hasActiveFilters =
    filterState.searchQuery.trim() !== '' ||
    filterState.sortBy !== 'recommended' ||
    filterState.availableNowOnly ||
    filterState.lowWaitOnly ||
    filterState.selectedPlugs.length > 0 ||
    filterState.minPowerKw > 0;

  return (
    <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
      {/* Search Input & Sort Selector Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search stations, networks (Tata Power, Zeon, Statiq), or areas..."
            value={filterState.searchQuery}
            onChange={(e) =>
              setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          {filterState.searchQuery && (
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-500 text-[11px]">Sort:</span>
          <select
            value={filterState.sortBy}
            onChange={(e) =>
              setFilterState((prev) => ({ ...prev, sortBy: e.target.value as any }))
            }
            className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs"
          >
            <option value="recommended" className="bg-slate-900 text-purple-300">
              ⭐ AI Recommended
            </option>
            <option value="nearest" className="bg-slate-900 text-slate-200">
              📍 Nearest Distance
            </option>
            <option value="cheapest" className="bg-slate-900 text-slate-200">
              💰 Cheapest Price
            </option>
            <option value="fastest" className="bg-slate-900 text-slate-200">
              ⚡ Fastest Charger (kW)
            </option>
            <option value="availability" className="bg-slate-900 text-slate-200">
              🟢 Available Ports
            </option>
          </select>
        </div>
      </div>

      {/* Quick Filter Chips: Available Now, Low Wait, Plugs, Min kW */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {/* Available Now */}
          <button
            onClick={() =>
              setFilterState((prev) => ({
                ...prev,
                availableNowOnly: !prev.availableNowOnly,
              }))
            }
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-medium transition-all ${
              filterState.availableNowOnly
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-xs'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Available Now</span>
          </button>

          {/* Low Wait (< 10m) */}
          <button
            onClick={() =>
              setFilterState((prev) => ({
                ...prev,
                lowWaitOnly: !prev.lowWaitOnly,
              }))
            }
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-medium transition-all ${
              filterState.lowWaitOnly
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-xs'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Low Wait (&lt;10m)</span>
          </button>

          {/* Plugs chips */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-1.5">
            {plugOptions.map((plug) => {
              const isSelected = filterState.selectedPlugs.includes(plug);
              return (
                <button
                  key={plug}
                  onClick={() => togglePlug(plug)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-semibold transition-all ${
                    isSelected
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-400/60'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-300 border border-slate-800'
                  }`}
                >
                  {plug}
                </button>
              );
            })}
          </div>

          {/* Min kW Speed Toggle */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-1.5">
            {[0, 50, 100].map((kw) => (
              <button
                key={kw}
                onClick={() => setFilterState((prev) => ({ ...prev, minPowerKw: kw }))}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium transition-all ${
                  filterState.minPowerKw === kw
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-400/60'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-300 border border-slate-800'
                }`}
              >
                {kw === 0 ? 'All kW' : `${kw}kW+`}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters Reset */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
