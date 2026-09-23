import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  X,
  Lock,
  Mail,
  Phone,
  MapPin,
  Car,
  ShieldCheck,
  Zap,
  ArrowRight,
  LogOut,
  Sparkles,
  Radio,
  Edit2,
  Check,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    user,
    isAuthenticated,
    login,
    signup,
    logout,
    switchDemoUser,
    updateUserProfile,
    isRealTimeGpsTracking,
    toggleRealTimeGps,
    userLocation,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Visakhapatnam - RK Beach');
  const [vehicleModel, setVehicleModel] = useState('Tata Nexon EV Long Range');
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editCity, setEditCity] = useState(user?.city || '');
  const [editVehicleNumber, setEditVehicleNumber] = useState(user?.vehicleNumber || '');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (mode === 'signup') {
      signup({
        email,
        name: name || email.split('@')[0],
        phone: phone || '+91 98480 54321',
        city,
        state: 'Andhra Pradesh',
        vehicleModel,
        enableGps: true,
      });
    } else {
      login({
        email,
        name: name || email.split('@')[0],
        phone: phone || '+91 98480 54321',
        city,
        state: 'Andhra Pradesh',
        enableGps: true,
      });
    }
  };

  const handleSaveProfile = () => {
    updateUserProfile({
      name: editName,
      phone: editPhone,
      city: editCity,
      vehicleNumber: editVehicleNumber,
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {isAuthenticated ? 'Driver Profile & Credentials' : mode === 'login' ? 'Driver Sign In' : 'Driver Registration'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAuthenticated
                  ? 'Maintained details, EV specifications & savings record'
                  : 'Sign in to access your Andhra Pradesh charging network'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {isAuthenticated && user ? (
            /* Logged in User Profile View */
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white truncate">{user.name}</h3>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.2 rounded-full border border-emerald-500/30">
                        AP Driver
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    <p className="text-[11px] text-emerald-400 font-mono mt-0.5">
                      {user.phone || '+91 98480 54321'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditName(user.name);
                      setEditPhone(user.phone || '');
                      setEditCity(user.city || '');
                      setEditVehicleNumber(user.vehicleNumber || '');
                      setIsEditing(!isEditing);
                    }}
                    className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Maintained Details in Profile */}
                {!isEditing ? (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-850 text-xs text-slate-300">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase text-slate-500 font-medium">Home City / Hub</span>
                      <div className="font-semibold text-slate-200 truncate">{user.city || 'Visakhapatnam'}</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase text-slate-500 font-medium">Registered EV</span>
                      <div className="font-semibold text-emerald-400 truncate">{user.vehicleModel || 'Tata Nexon EV'}</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase text-slate-500 font-medium">Plate Number</span>
                      <div className="font-mono text-slate-200">{user.vehicleNumber || 'AP 39 EV 2026'}</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase text-slate-500 font-medium">GPS Status</span>
                      <div className="font-bold flex items-center gap-1 text-blue-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                        <span>{isRealTimeGpsTracking ? 'Real-Time Active' : 'Standby'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Edit Mode */
                  <div className="space-y-2 pt-2 border-t border-slate-850">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Full Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Phone</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">City / Location</label>
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Vehicle Number Plate</label>
                      <input
                        type="text"
                        value={editVehicleNumber}
                        onChange={(e) => setEditVehicleNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 mt-2"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Personal Analytics Mini Grid */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase text-purple-300 font-bold flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" /> Total Savings
                  </span>
                  <div className="text-lg font-black text-purple-300 font-mono mt-1">
                    ₹{user.totalSavingsAchieved}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 font-medium flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-400" /> Total Energy
                  </span>
                  <div className="text-lg font-black text-emerald-400 font-mono mt-1">
                    {user.totalEnergyChargedKwh} kWh
                  </div>
                </div>
              </div>

              {/* Quick Persona Switcher */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Switch Andhra Pradesh Driver Profile:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => switchDemoUser('sohana')}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left text-xs transition-all"
                  >
                    <div className="font-bold text-emerald-400 truncate">Sohana</div>
                    <div className="text-[9px] text-slate-500 truncate">Vizag Beach</div>
                  </button>

                  <button
                    onClick={() => switchDemoUser('aarav')}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left text-xs transition-all"
                  >
                    <div className="font-bold text-purple-400 truncate">Aarav</div>
                    <div className="text-[9px] text-slate-500 truncate">Vizag IT SEZ</div>
                  </button>

                  <button
                    onClick={() => switchDemoUser('priya')}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left text-xs transition-all"
                  >
                    <div className="font-bold text-blue-400 truncate">Priya</div>
                    <div className="text-[9px] text-slate-500 truncate">Vijayawada</div>
                  </button>
                </div>
              </div>

              {/* Real-time GPS toggle control */}
              <div className="pt-1">
                <button
                  onClick={toggleRealTimeGps}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all ${
                    isRealTimeGpsTracking
                      ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>
                    {isRealTimeGpsTracking
                      ? 'Stop Real-Time GPS Tracking'
                      : 'Activate Real-Time GPS Tracking'}
                  </span>
                </button>
              </div>

              {/* Logout button */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    logout();
                    setIsAuthModalOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out & Lock App</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login & Signup Form */
            <div className="space-y-4">
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    mode === 'login'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    mode === 'signup'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sohana Chadaram"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="chadaramsohana15@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-1.5 mt-4"
                >
                  <span>{mode === 'login' ? 'Sign In to ChargeEase' : 'Create Driver Profile'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
