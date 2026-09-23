export type ChargerType = 'CCS2' | 'Type 2' | 'CHAdeMO' | 'GB/T' | 'NACS';

export type StationStatus = 'available' | 'busy' | 'queue' | 'maintenance';

export interface StationPort {
  id: string;
  type: ChargerType;
  powerKw: number;
  totalPorts: number;
  availablePorts: number;
  pricePerKwh: number;
}

export interface ChargingStation {
  id: string;
  name: string;
  network: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  estimatedTravelMinutes?: number;
  status: StationStatus;
  waitingTimeMinutes: number;
  basePricePerKwh: number;
  peakPricePerKwh: number;
  offPeakPricePerKwh: number;
  rating: number;
  reviewsCount: number;
  ports: StationPort[];
  amenities: ('cafe' | 'restroom' | 'wifi' | 'shopping' | '24_7' | 'shaded' | 'security')[];
  historicalHourlyOccupancy: number[]; // 24 numbers, 0-100%
  historicalHourlyPrice: number[]; // 24 numbers, price per kWh
  isTopPick?: boolean;
  aiMatchScore?: number;
  aiRecommendationReason?: string;
}

export interface EVProfile {
  id: string;
  make: string;
  model: string;
  year: number;
  batteryCapacityKwh: number;
  usableCapacityKwh: number;
  maxChargingSpeedKw: number;
  supportedPlugs: ChargerType[];
  currentSoc: number; // 0 - 100%
  targetSoc: number; // e.g. 80% or 100%
  energyEfficiencyKwhPer100Km: number; // e.g. 14.2
  image: string;
  chargingPreferences: {
    priority: 'balanced' | 'cheapest' | 'fastest' | 'nearest';
    preferredPlug: ChargerType | 'any';
    minChargerSpeedKw: number;
    maxQueueTimeMinutes: number;
    avoidPeakTariffs: boolean;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  vehicleModel?: string;
  vehicleNumber?: string;
  avatar: string;
  currency: string; // '₹', '$', '€'
  joinedDate: string;
  totalSavingsAchieved: number;
  totalEnergyChargedKwh: number;
  totalSessionsCount: number;
  gpsTrackingEnabled?: boolean;
}

export interface HourlyPrediction {
  hour: number; // 0 to 23
  timeLabel: string; // e.g. "11:00 PM"
  suitabilityScore: number; // 0 to 100
  status: 'optimal' | 'good' | 'moderate' | 'peak_avoid';
  pricePerKwh: number;
  stationOccupancyPct: number;
  predictedQueueMinutes: number;
  gridDemandLevel: 'low' | 'moderate' | 'high' | 'critical';
  costEstimateForCharge: number;
  reason: string;
}

export interface RecommendationWindow {
  startHour: number;
  endHour: number;
  windowLabel: string; // e.g. "11:00 PM – 2:00 AM"
  badge: string; // e.g. "Super Off-Peak Saver"
  recommendedStationId?: string;
  suitabilityScore: number;
  avgPricePerKwh: number;
  expectedCost: number;
  peakCostComparison: number;
  potentialSavings: number;
  savingsPercentage: number;
  expectedQueueMinutes: number;
  reasons: string[];
}

export interface ChargingSession {
  id: string;
  stationId: string;
  stationName: string;
  date: string;
  startSoc: number;
  endSoc: number;
  energyDeliveredKwh: number;
  totalCost: number;
  durationMinutes: number;
  chargerType: ChargerType;
  chargingPowerKw: number;
  wasRecommendedTime: boolean;
  estimatedSavings: number;
  co2SavedKg: number;
}

export interface StationFilterState {
  searchQuery: string;
  sortBy: 'recommended' | 'nearest' | 'cheapest' | 'fastest' | 'availability';
  availableNowOnly: boolean;
  lowWaitOnly: boolean; // wait < 15 mins
  selectedPlugs: ChargerType[];
  minPowerKw: number;
  maxDistanceKm: number;
  maxPricePerKwh: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
  addressName: string;
  isGps: boolean;
  accuracyMeters?: number;
  speedKmh?: number;
  heading?: number;
  lastUpdated?: string;
}
