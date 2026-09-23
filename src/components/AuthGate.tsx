import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEFAULT_EV_MODELS } from '../data/evModels';
import {
  Zap,
  ShieldCheck,
  MapPin,
  Car,
  Battery,
  Phone,
  Mail,
  User,
  Navigation,
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export const AuthGate: React.FC = () => {
  const { login, switchDemoUser } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('Sohana Chadaram');
  const [email, setEmail] = useState('chadaramsohana15@gmail.com');
  const [phone, setPhone] = useState('+91 98480 54321');
  const [city, setCity] = useState('Visakhapatnam - RK Beach & Central Vizag');
  const [vehicleModel, setVehicleModel] = useState('Tata Nexon EV Long Range');
  const [vehicleNumber, setVehicleNumber] = useState('AP 39 EV 2026');
  const [currentSoc, setCurrentSoc] = useState(28);
  const [enableGps, setEnableGps] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      name: name.trim() || 'EV Driver',
      email: email.trim() || 'driver@chargeease.in',
      phone: phone.trim() || '+91 98480 54321',
      city,
      state: 'Andhra Pradesh',
      vehicleModel,
      vehicleNumber,
      initialSoc: currentSoc,
      enableGps,
    });
  };

  const handleDemoSelect = (type: 'sohana' | 'aarav' | 'priya') => {
    switchDemoUser(type);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Dynamic Background Light effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4 relative z-10">
        {/* Top Branding Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border-b border-slate-800 text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 shadow-xl shadow-emerald-500/25 ring-2 ring-white/20 mb-3">
            <Zap className="w-8 h-8 text-slate-950 fill-current" />
          </div>

          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Charge<span className="text-emerald-400">Ease</span>
            </h1>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-emerald-500/30">
              Andhra Pradesh EV
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
            AI-Powered EV Charging Assistant & Real-Time GPS Station Finder for Visakhapatnam & AP
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 bg-slate-950/70 px-2.5 py-1 rounded-full border border-slate-800">
              <MapPin className="w-3 h-3 text-emerald-400" /> Visakhapatnam & AP Hubs
            </span>
            <span className="flex items-center gap-1 bg-slate-950/70 px-2.5 py-1 rounded-full border border-slate-800">
              <Navigation className="w-3 h-3 text-blue-400" /> Real-Time Live GPS
            </span>
            <span className="flex items-center gap-1 bg-slate-950/70 px-2.5 py-1 rounded-full border border-slate-800">
              <Sparkles className="w-3 h-3 text-purple-400" /> ML Dynamic Tariff Predictor
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-5">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                mode === 'register'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Driver Registration & Profile Setup
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                mode === 'login'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Existing Driver Sign In
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Driver Details Row: Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-400" /> Driver Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sohana Chadaram"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98480 54321"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="chadaramsohana15@gmail.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* City / Hub Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Primary Location (Andhra Pradesh)
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Visakhapatnam - RK Beach & Central Vizag">
                Visakhapatnam - RK Beach & Central Vizag (Default)
              </option>
              <option value="Visakhapatnam - Siripuram & Maddilapalem">
                Visakhapatnam - Siripuram & Maddilapalem
              </option>
              <option value="Visakhapatnam - Madhurawada IT SEZ">
                Visakhapatnam - Madhurawada IT SEZ & Tech Park
              </option>
              <option value="Visakhapatnam - Gajuwaka & Steel Plant">
                Visakhapatnam - Gajuwaka & Steel Plant
              </option>
              <option value="Visakhapatnam - Rushikonda & GITAM Corridor">
                Visakhapatnam - Rushikonda Beach & GITAM
              </option>
              <option value="Visakhapatnam - MVP Colony Sector 2">
                Visakhapatnam - MVP Colony Sector 2
              </option>
              <option value="Andhra Pradesh - Vijayawada Benz Circle">
                Andhra Pradesh - Vijayawada Benz Circle
              </option>
              <option value="Andhra Pradesh - Tirupati Alipiri Hub">
                Andhra Pradesh - Tirupati Alipiri Hub
              </option>
            </select>
          </div>

          {/* EV Vehicle Selection & Plate Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-emerald-400" /> EV Model
              </label>
              <select
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {DEFAULT_EV_MODELS.map((m) => {
                  const name = `${m.make} ${m.model}`;
                  return (
                    <option key={name} value={name}>
                      {name} ({m.batteryCapacityKwh} kWh)
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Vehicle Plate (Optional)
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. AP 39 EV 2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Battery State of Charge (SOC) */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Battery className="w-4 h-4 text-amber-400" /> Initial Battery SOC
              </span>
              <span className="font-mono text-sm font-black text-amber-400">
                {currentSoc}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="95"
              value={currentSoc}
              onChange={(e) => setCurrentSoc(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Low (10%)</span>
              <span>Daily Commute (28%)</span>
              <span>Full (90%)</span>
            </div>
          </div>

          {/* Real-Time GPS Auto-Engage Option */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-emerald-500/30 cursor-pointer">
            <input
              type="checkbox"
              checked={enableGps}
              onChange={(e) => setEnableGps(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 accent-emerald-500 bg-slate-800 border-slate-700 mt-0.5"
            />
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                <span>Enable Real-Time GPS Tracking on Entry</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Uses your device's browser GPS to pinpoint your location in real time, calculate exact driving distance to Visakhapatnam stations, and dynamically update routes.
              </p>
            </div>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Enter ChargeEase & Explore Stations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Fast Driver Persona Switcher */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Or 1-Click Fast Test Profile:
            </span>
            <span className="text-[10px] text-slate-500">Instant Demo Login</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSelect('sohana')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group"
            >
              <div className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                Sohana Chadaram
              </div>
              <div className="text-[10px] text-slate-400">Vizag RK Beach</div>
              <div className="text-[9px] text-slate-500 font-mono">Nexon EV • 28% SOC</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('aarav')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 text-left transition-all group"
            >
              <div className="text-xs font-bold text-purple-400 group-hover:text-purple-300">
                Aarav Sharma
              </div>
              <div className="text-[10px] text-slate-400">Vizag IT SEZ</div>
              <div className="text-[9px] text-slate-500 font-mono">Ioniq 5 • 34% SOC</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('priya')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-left transition-all group"
            >
              <div className="text-xs font-bold text-blue-400 group-hover:text-blue-300">
                Priya Patel
              </div>
              <div className="text-[10px] text-slate-400">Vijayawada Benz Circle</div>
              <div className="text-[9px] text-slate-500 font-mono">MG ZS EV • 42% SOC</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
