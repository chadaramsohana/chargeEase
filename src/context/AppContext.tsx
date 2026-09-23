import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  UserProfile,
  EVProfile,
  ChargingStation,
  ChargingSession,
  StationFilterState,
  UserLocation,
  HourlyPrediction,
  RecommendationWindow,
} from '../types';
import { INITIAL_DEFAULT_VEHICLE, DEFAULT_EV_MODELS } from '../data/evModels';
import { INITIAL_STATIONS, INITIAL_CHARGING_SESSIONS, POPULAR_LOCATIONS } from '../data/mockStations';
import {
  scoreAndRankStations,
  predict24HourSuitability,
  getRecommendedChargingWindow,
  calculateRequiredEnergyKwh,
  ensureStationsForUserLocation,
} from '../services/mlEngine';

export interface AuthInput {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  vehicleModel?: string;
  vehicleNumber?: string;
  initialSoc?: number;
  enableGps?: boolean;
}

interface ActiveChargingState {
  isCharging: boolean;
  stationId: string;
  stationName: string;
  startSoc: number;
  currentSoc: number;
  targetSoc: number;
  powerKw: number;
  energyDeliveredKwh: number;
  costSoFar: number;
  elapsedSeconds: number;
}

interface AppContextType {
  // Auth & Profile
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (input: AuthInput | string, name?: string) => void;
  signup: (input: AuthInput | string, name?: string) => void;
  logout: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  switchDemoUser: (type: 'sohana' | 'aarav' | 'priya') => void;

  // EV Profile
  vehicle: EVProfile;
  updateVehicle: (updates: Partial<EVProfile>) => void;
  updateChargingPreferences: (prefs: Partial<EVProfile['chargingPreferences']>) => void;
  switchEVModel: (modelName: string) => void;

  // Stations & Location
  stations: ChargingStation[];
  userLocation: UserLocation;
  setUserLocation: (loc: UserLocation) => void;
  requestGpsLocation: () => Promise<boolean>;
  startRealTimeGps: () => boolean;
  stopRealTimeGps: () => void;
  toggleRealTimeGps: () => void;
  isRealTimeGpsTracking: boolean;
  setPresetCity: (cityName: string) => void;
  selectedStation: ChargingStation | null;
  setSelectedStation: (station: ChargingStation | null) => void;

  // ML Predictions
  hourlyPredictions: HourlyPrediction[];
  recommendedWindow: RecommendationWindow | null;
  inspectingStation: ChargingStation | null;
  setInspectingStation: (station: ChargingStation | null) => void;

  // Filters
  filterState: StationFilterState;
  setFilterState: React.Dispatch<React.SetStateAction<StationFilterState>>;
  resetFilters: () => void;

  // Charging History
  chargingSessions: ChargingSession[];
  logChargingSession: (session: Omit<ChargingSession, 'id'>) => void;

  // Real-time Active Charging Simulation
  activeCharging: ActiveChargingState | null;
  startChargingSession: (station: ChargingStation) => void;
  stopChargingSession: () => void;

  // Navigation / Modals
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isPredictionModalOpen: boolean;
  setIsPredictionModalOpen: (open: boolean) => void;
  isCostModalOpen: boolean;
  setIsCostModalOpen: (open: boolean) => void;
  isHistoryModalOpen: boolean;
  setIsHistoryModalOpen: (open: boolean) => void;
  isCopilotModalOpen: boolean;
  setIsCopilotModalOpen: (open: boolean) => void;
  showRouteOnMap: boolean;
  setShowRouteOnMap: (show: boolean) => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-sohana',
  name: 'Sohana Chadaram',
  email: 'chadaramsohana15@gmail.com',
  phone: '+91 98480 54321',
  city: 'Visakhapatnam - RK Beach & Central Vizag',
  state: 'Andhra Pradesh',
  vehicleModel: 'Tata Nexon EV Long Range',
  vehicleNumber: 'AP 39 EV 2026',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  currency: '₹',
  joinedDate: 'September 2026',
  totalSavingsAchieved: 882.34,
  totalEnergyChargedKwh: 99.4,
  totalSessionsCount: 4,
  gpsTrackingEnabled: true,
};

const DEFAULT_FILTERS: StationFilterState = {
  searchQuery: '',
  sortBy: 'recommended',
  availableNowOnly: false,
  lowWaitOnly: false,
  selectedPlugs: [],
  minPowerKw: 0,
  maxDistanceKm: 40,
  maxPricePerKwh: 25,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state - checked from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('chargeease_auth') === 'true';
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('chargeease_user');
    return saved ? JSON.parse(saved) : (localStorage.getItem('chargeease_auth') === 'true' ? DEFAULT_USER : null);
  });

  // EV Profile state
  const [vehicle, setVehicle] = useState<EVProfile>(() => {
    const saved = localStorage.getItem('chargeease_vehicle');
    return saved ? JSON.parse(saved) : INITIAL_DEFAULT_VEHICLE;
  });

  // Location state - default Visakhapatnam, Andhra Pradesh
  const [userLocation, setUserLocation] = useState<UserLocation>(() => {
    const saved = localStorage.getItem('chargeease_location');
    return saved
      ? JSON.parse(saved)
      : {
          lat: 17.7125,
          lng: 83.3240,
          addressName: 'RK Beach Promenade, Visakhapatnam, Andhra Pradesh',
          isGps: false,
        };
  });

  // Real-Time GPS Tracking state
  const [isRealTimeGpsTracking, setIsRealTimeGpsTracking] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);

  // Selected & Inspecting Station
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [inspectingStation, setInspectingStation] = useState<ChargingStation | null>(null);

  // Filters state
  const [filterState, setFilterState] = useState<StationFilterState>(DEFAULT_FILTERS);

  // Charging History
  const [chargingSessions, setChargingSessions] = useState<ChargingSession[]>(() => {
    const saved = localStorage.getItem('chargeease_sessions');
    return saved ? JSON.parse(saved) : INITIAL_CHARGING_SESSIONS;
  });

  // Live active charging simulation
  const [activeCharging, setActiveCharging] = useState<ActiveChargingState | null>(null);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPredictionModalOpen, setIsPredictionModalOpen] = useState(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isCopilotModalOpen, setIsCopilotModalOpen] = useState(false);
  const [showRouteOnMap, setShowRouteOnMap] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('chargeease_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('chargeease_vehicle', JSON.stringify(vehicle));
  }, [vehicle]);

  useEffect(() => {
    localStorage.setItem('chargeease_sessions', JSON.stringify(chargingSessions));
  }, [chargingSessions]);

  useEffect(() => {
    localStorage.setItem('chargeease_location', JSON.stringify(userLocation));
  }, [userLocation]);

  // Real-Time GPS Tracking functions
  const startRealTimeGps = (): boolean => {
    if (!('geolocation' in navigator)) {
      console.warn('Geolocation not supported on this device');
      return false;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setIsRealTimeGpsTracking(true);

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy, speed, heading } = pos.coords;
          setUserLocation({
            lat: latitude,
            lng: longitude,
            addressName: `Live GPS Fix (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            isGps: true,
            accuracyMeters: Math.round(accuracy),
            speedKmh: speed ? Math.round(speed * 3.6) : 0,
            heading: heading || 0,
            lastUpdated: new Date().toLocaleTimeString(),
          });
        },
        (err) => {
          console.warn('Real-Time GPS watcher error:', err.message);
          setIsRealTimeGpsTracking(false);
        },
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 12000 }
      );
      return true;
    } catch (e) {
      console.error('Failed to start watchPosition:', e);
      setIsRealTimeGpsTracking(false);
      return false;
    }
  };

  const stopRealTimeGps = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsRealTimeGpsTracking(false);
  };

  const toggleRealTimeGps = () => {
    if (isRealTimeGpsTracking) {
      stopRealTimeGps();
    } else {
      startRealTimeGps();
    }
  };

  // Clean up GPS watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Request single GPS fix
  const requestGpsLocation = async (): Promise<boolean> => {
    if (!('geolocation' in navigator)) return false;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({
            lat,
            lng,
            addressName: `Live GPS Fix (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            isGps: true,
            accuracyMeters: Math.round(pos.coords.accuracy),
            lastUpdated: new Date().toLocaleTimeString(),
          });
          resolve(true);
        },
        (err) => {
          console.warn('GPS location request error/denied:', err.message);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  };

  const setPresetCity = (cityName: string) => {
    const loc = POPULAR_LOCATIONS.find((l) => l.name === cityName);
    if (loc) {
      setUserLocation({
        lat: loc.lat,
        lng: loc.lng,
        addressName: `${loc.name}, Andhra Pradesh`,
        isGps: false,
      });
    }
  };

  // Vehicle updates
  const updateVehicle = (updates: Partial<EVProfile>) => {
    setVehicle((prev) => ({ ...prev, ...updates }));
  };

  const updateChargingPreferences = (prefs: Partial<EVProfile['chargingPreferences']>) => {
    setVehicle((prev) => ({
      ...prev,
      chargingPreferences: { ...prev.chargingPreferences, ...prefs },
    }));
  };

  const switchEVModel = (modelName: string) => {
    const preset = DEFAULT_EV_MODELS.find((m) => `${m.make} ${m.model}` === modelName);
    if (preset) {
      setVehicle((prev) => ({
        ...prev,
        ...preset,
        currentSoc: Math.min(prev.currentSoc, 100),
      }));
    }
  };

  // Auth methods
  const login = (input: AuthInput | string, nameParam?: string) => {
    let newUser: UserProfile;

    if (typeof input === 'object') {
      newUser = {
        id: 'usr-' + Date.now(),
        name: input.name || 'EV Driver',
        email: input.email || 'driver@chargeease.in',
        phone: input.phone || '+91 98480 54321',
        city: input.city || 'Visakhapatnam - RK Beach & Central Vizag',
        state: input.state || 'Andhra Pradesh',
        vehicleModel: input.vehicleModel || 'Tata Nexon EV Long Range',
        vehicleNumber: input.vehicleNumber || 'AP 39 EV 2026',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        currency: '₹',
        joinedDate: 'September 2026',
        totalSavingsAchieved: 882.34,
        totalEnergyChargedKwh: 99.4,
        totalSessionsCount: 4,
        gpsTrackingEnabled: input.enableGps ?? true,
      };

      if (input.vehicleModel) {
        switchEVModel(input.vehicleModel);
      }
      if (input.initialSoc !== undefined) {
        setVehicle((v) => ({ ...v, currentSoc: input.initialSoc! }));
      }
      if (input.city) {
        setPresetCity(input.city);
      }
      if (input.enableGps) {
        startRealTimeGps();
      }
    } else {
      newUser = {
        id: 'usr-' + Date.now(),
        name: nameParam || input.split('@')[0],
        email: input,
        phone: '+91 98480 54321',
        city: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        currency: '₹',
        joinedDate: 'September 2026',
        totalSavingsAchieved: 340.0,
        totalEnergyChargedKwh: 45.0,
        totalSessionsCount: 2,
        gpsTrackingEnabled: true,
      };
    }

    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('chargeease_auth', 'true');
    localStorage.setItem('chargeease_user', JSON.stringify(newUser));
    setIsAuthModalOpen(false);
  };

  const signup = (input: AuthInput | string, nameParam?: string) => {
    login(input, nameParam);
  };

  const logout = () => {
    stopRealTimeGps();
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('chargeease_auth');
    localStorage.removeItem('chargeease_user');
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const switchDemoUser = (type: 'sohana' | 'aarav' | 'priya') => {
    if (type === 'sohana') {
      login({
        name: 'Sohana Chadaram',
        email: 'chadaramsohana15@gmail.com',
        phone: '+91 98480 54321',
        city: 'Visakhapatnam - RK Beach & Central Vizag',
        state: 'Andhra Pradesh',
        vehicleModel: 'Tata Nexon EV Long Range',
        vehicleNumber: 'AP 39 EV 2026',
        initialSoc: 28,
        enableGps: true,
      });
    } else if (type === 'aarav') {
      login({
        name: 'Aarav Sharma',
        email: 'aarav.vizag@gmail.com',
        phone: '+91 99887 76655',
        city: 'Visakhapatnam - Madhurawada IT SEZ',
        state: 'Andhra Pradesh',
        vehicleModel: 'Hyundai Ioniq 5',
        vehicleNumber: 'AP 39 EV 8899',
        initialSoc: 34,
        enableGps: true,
      });
    } else {
      login({
        name: 'Priya Patel',
        email: 'priya.ap@gmail.com',
        phone: '+91 94401 23456',
        city: 'Andhra Pradesh - Vijayawada Benz Circle',
        state: 'Andhra Pradesh',
        vehicleModel: 'MG ZS EV',
        vehicleNumber: 'AP 16 EV 4455',
        initialSoc: 42,
        enableGps: true,
      });
    }
  };

  // Base stations with proximity generation for real-time GPS
  const rawStations = useMemo(() => {
    return ensureStationsForUserLocation(INITIAL_STATIONS, userLocation.lat, userLocation.lng);
  }, [userLocation.lat, userLocation.lng]);

  // Ranked stations using ML scoring
  const rankedStations = useMemo(() => {
    return scoreAndRankStations(
      rawStations,
      vehicle,
      userLocation.lat,
      userLocation.lng
    );
  }, [rawStations, userLocation, vehicle]);

  // Set default selected station
  useEffect(() => {
    if (!selectedStation && rankedStations.length > 0) {
      setSelectedStation(rankedStations[0]);
    }
  }, [rankedStations, selectedStation]);

  // 24-hour ML predictions for the selected/first station
  const activeStation = selectedStation || rankedStations[0];
  const hourlyPredictions = useMemo(() => {
    if (!activeStation) return [];
    return predict24HourSuitability(activeStation, vehicle);
  }, [activeStation, vehicle]);

  // AI Recommended window for active station
  const recommendedWindow = useMemo(() => {
    if (!activeStation || hourlyPredictions.length === 0) return null;
    return getRecommendedChargingWindow(hourlyPredictions, activeStation, vehicle);
  }, [activeStation, hourlyPredictions, vehicle]);

  // Reset filters
  const resetFilters = () => {
    setFilterState(DEFAULT_FILTERS);
  };

  // Log charging session
  const logChargingSession = (sessionData: Omit<ChargingSession, 'id'>) => {
    const newSession: ChargingSession = {
      ...sessionData,
      id: 'sess-' + Date.now(),
    };
    setChargingSessions((prev) => [newSession, ...prev]);

    // Update user stats
    if (user) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              totalEnergyChargedKwh: Number((prev.totalEnergyChargedKwh + newSession.energyDeliveredKwh).toFixed(1)),
              totalSavingsAchieved: Number((prev.totalSavingsAchieved + newSession.estimatedSavings).toFixed(2)),
              totalSessionsCount: prev.totalSessionsCount + 1,
            }
          : null
      );
    }
  };

  // Real-time active charging simulator
  const startChargingSession = (station: ChargingStation) => {
    const fastPort = station.ports.find((p) => p.powerKw >= 50) || station.ports[0];
    const power = fastPort ? fastPort.powerKw : 50;

    setActiveCharging({
      isCharging: true,
      stationId: station.id,
      stationName: station.name,
      startSoc: vehicle.currentSoc,
      currentSoc: vehicle.currentSoc,
      targetSoc: vehicle.targetSoc || 85,
      powerKw: power,
      energyDeliveredKwh: 0,
      costSoFar: 0,
      elapsedSeconds: 0,
    });
  };

  const stopChargingSession = () => {
    if (!activeCharging) return;

    // Log completed session
    const isRecommended =
      recommendedWindow &&
      new Date().getHours() >= recommendedWindow.startHour &&
      new Date().getHours() <= recommendedWindow.endHour;

    const basePrice = selectedStation?.basePricePerKwh || 11.5;
    const peakPrice = selectedStation?.peakPricePerKwh || 16.5;
    const estSavings = Number(
      Math.max(0, activeCharging.energyDeliveredKwh * (peakPrice - basePrice)).toFixed(2)
    );

    logChargingSession({
      stationId: activeCharging.stationId,
      stationName: activeCharging.stationName,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      startSoc: activeCharging.startSoc,
      endSoc: activeCharging.currentSoc,
      energyDeliveredKwh: Number(activeCharging.energyDeliveredKwh.toFixed(1)),
      totalCost: Number(activeCharging.costSoFar.toFixed(2)),
      durationMinutes: Math.max(1, Math.round(activeCharging.elapsedSeconds / 60)),
      chargerType: 'CCS2',
      chargingPowerKw: activeCharging.powerKw,
      wasRecommendedTime: Boolean(isRecommended),
      estimatedSavings: estSavings,
      co2SavedKg: Number((activeCharging.energyDeliveredKwh * 0.78).toFixed(1)),
    });

    // Update vehicle battery SOC to current charged level
    updateVehicle({ currentSoc: activeCharging.currentSoc });
    setActiveCharging(null);
  };

  // Active charging progression tick
  useEffect(() => {
    if (!activeCharging || !activeCharging.isCharging) return;

    const interval = setInterval(() => {
      setActiveCharging((prev) => {
        if (!prev) return null;
        if (prev.currentSoc >= prev.targetSoc) {
          return prev;
        }

        const addedSoc = 0.5; // Simulate ~0.5% SOC per second
        const newSoc = Math.min(prev.targetSoc, Number((prev.currentSoc + addedSoc).toFixed(1)));
        const addedKwh = (vehicle.batteryCapacityKwh * addedSoc) / 100;
        const newEnergy = Number((prev.energyDeliveredKwh + addedKwh).toFixed(2));
        const pricePerKwh = selectedStation?.basePricePerKwh || 11.5;
        const newCost = Number((newEnergy * pricePerKwh).toFixed(2));

        return {
          ...prev,
          currentSoc: newSoc,
          energyDeliveredKwh: newEnergy,
          costSoFar: newCost,
          elapsedSeconds: prev.elapsedSeconds + 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCharging, vehicle.batteryCapacityKwh, selectedStation]);

  const value: AppContextType = {
    user,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUserProfile,
    switchDemoUser,
    vehicle,
    updateVehicle,
    updateChargingPreferences,
    switchEVModel,
    stations: rankedStations,
    userLocation,
    setUserLocation,
    requestGpsLocation,
    startRealTimeGps,
    stopRealTimeGps,
    toggleRealTimeGps,
    isRealTimeGpsTracking,
    setPresetCity,
    selectedStation,
    setSelectedStation,
    hourlyPredictions,
    recommendedWindow,
    inspectingStation,
    setInspectingStation,
    filterState,
    setFilterState,
    resetFilters,
    chargingSessions,
    logChargingSession,
    activeCharging,
    startChargingSession,
    stopChargingSession,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isPredictionModalOpen,
    setIsPredictionModalOpen,
    isCostModalOpen,
    setIsCostModalOpen,
    isHistoryModalOpen,
    setIsHistoryModalOpen,
    isCopilotModalOpen,
    setIsCopilotModalOpen,
    showRouteOnMap,
    setShowRouteOnMap,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
