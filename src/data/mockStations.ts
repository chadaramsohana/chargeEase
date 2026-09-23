import { ChargingStation } from '../types';

export const POPULAR_LOCATIONS = [
  { name: 'Visakhapatnam - RK Beach & Central Vizag', lat: 17.7125, lng: 83.3240, state: 'Andhra Pradesh' },
  { name: 'Visakhapatnam - Siripuram & Maddilapalem', lat: 17.7228, lng: 83.3155, state: 'Andhra Pradesh' },
  { name: 'Visakhapatnam - Madhurawada IT SEZ', lat: 17.8015, lng: 83.3645, state: 'Andhra Pradesh' },
  { name: 'Visakhapatnam - Gajuwaka & Steel Plant', lat: 17.6912, lng: 83.2120, state: 'Andhra Pradesh' },
  { name: 'Visakhapatnam - Rushikonda & GITAM Corridor', lat: 17.7820, lng: 83.3850, state: 'Andhra Pradesh' },
  { name: 'Visakhapatnam - MVP Colony Sector 2', lat: 17.7420, lng: 83.3390, state: 'Andhra Pradesh' },
  { name: 'Andhra Pradesh - Vijayawada Benz Circle', lat: 16.5062, lng: 80.6480, state: 'Andhra Pradesh' },
  { name: 'Andhra Pradesh - Tirupati Alipiri Hub', lat: 13.6288, lng: 79.4192, state: 'Andhra Pradesh' },
];

export const INITIAL_STATIONS: ChargingStation[] = [
  {
    id: 'vizag-1',
    name: 'Tata Power EZ Hub - RK Beach Promenade',
    network: 'Tata Power EZ Charge',
    address: 'Near Submarine Museum, Beach Road, RK Beach',
    city: 'Visakhapatnam',
    lat: 17.7125,
    lng: 83.3240,
    status: 'available',
    waitingTimeMinutes: 0,
    basePricePerKwh: 11.5,
    peakPricePerKwh: 16.8,
    offPeakPricePerKwh: 7.8,
    rating: 4.9,
    reviewsCount: 388,
    ports: [
      { id: 'p-1', type: 'CCS2', powerKw: 60, totalPorts: 4, availablePorts: 3, pricePerKwh: 11.5 },
      { id: 'p-2', type: 'Type 2', powerKw: 22, totalPorts: 2, availablePorts: 2, pricePerKwh: 8.5 },
    ],
    amenities: ['cafe', 'restroom', 'wifi', 'shaded', '24_7'],
    historicalHourlyOccupancy: [
      8, 6, 5, 4, 6, 12, 22, 45, 75, 82, 65, 58, 55, 60, 68, 78, 88, 92, 85, 70, 52, 38, 22, 12
    ],
    historicalHourlyPrice: [
      7.8, 7.8, 7.8, 7.8, 7.8, 9.0, 10.5, 14.0, 16.8, 16.8, 15.0, 13.0, 12.5, 13.0, 14.0, 16.0, 17.2, 17.2, 16.5, 14.0, 11.0, 9.5, 8.5, 7.8
    ],
  },
  {
    id: 'vizag-2',
    name: 'Zeon Ultra-Fast Station - Siripuram Junction',
    network: 'Zeon Charging',
    address: 'Opposite Dutt Island, Siripuram Circle',
    city: 'Visakhapatnam',
    lat: 17.7228,
    lng: 83.3155,
    status: 'available',
    waitingTimeMinutes: 5,
    basePricePerKwh: 13.5,
    peakPricePerKwh: 18.5,
    offPeakPricePerKwh: 8.8,
    rating: 4.9,
    reviewsCount: 412,
    ports: [
      { id: 'p-3', type: 'CCS2', powerKw: 120, totalPorts: 4, availablePorts: 2, pricePerKwh: 13.5 },
      { id: 'p-4', type: 'CCS2', powerKw: 240, totalPorts: 2, availablePorts: 1, pricePerKwh: 15.5 },
      { id: 'p-5', type: 'Type 2', powerKw: 22, totalPorts: 2, availablePorts: 1, pricePerKwh: 9.0 },
    ],
    amenities: ['cafe', 'restroom', 'wifi', 'shopping', '24_7', 'security'],
    historicalHourlyOccupancy: [
      12, 10, 8, 6, 10, 16, 28, 52, 78, 85, 70, 62, 60, 65, 72, 82, 92, 95, 88, 75, 58, 40, 25, 15
    ],
    historicalHourlyPrice: [
      8.8, 8.8, 8.8, 8.8, 8.8, 10.0, 12.0, 15.5, 18.5, 18.5, 16.5, 14.5, 14.0, 14.5, 15.5, 17.5, 18.5, 18.5, 17.5, 15.5, 12.5, 10.5, 9.5, 8.8
    ],
  },
  {
    id: 'vizag-3',
    name: 'Jio-bp pulse SuperHub - Madhurawada IT SEZ',
    network: 'Jio-bp pulse',
    address: 'Near Millennium Tower, Hill No. 3, Madhurawada',
    city: 'Visakhapatnam',
    lat: 17.8015,
    lng: 83.3645,
    status: 'available',
    waitingTimeMinutes: 0,
    basePricePerKwh: 11.0,
    peakPricePerKwh: 15.8,
    offPeakPricePerKwh: 7.5,
    rating: 4.8,
    reviewsCount: 320,
    ports: [
      { id: 'p-6', type: 'CCS2', powerKw: 60, totalPorts: 4, availablePorts: 3, pricePerKwh: 11.0 },
      { id: 'p-7', type: 'CCS2', powerKw: 150, totalPorts: 2, availablePorts: 2, pricePerKwh: 13.0 },
      { id: 'p-8', type: 'Type 2', powerKw: 22, totalPorts: 2, availablePorts: 2, pricePerKwh: 8.0 },
    ],
    amenities: ['cafe', 'wifi', 'shaded', 'security', '24_7'],
    historicalHourlyOccupancy: [
      10, 8, 6, 5, 8, 14, 30, 60, 85, 88, 75, 68, 65, 70, 78, 88, 92, 94, 82, 65, 45, 30, 18, 12
    ],
    historicalHourlyPrice: [
      7.5, 7.5, 7.5, 7.5, 7.5, 9.0, 11.0, 13.5, 15.8, 15.8, 14.5, 13.0, 12.5, 13.0, 14.0, 15.5, 15.8, 15.8, 14.8, 13.5, 11.0, 9.2, 8.2, 7.5
    ],
  },
  {
    id: 'vizag-4',
    name: 'ChargeZone EcoHub - CMR Central Maddilapalem',
    network: 'ChargeZone',
    address: 'Resapuvanipalem, Near Maddilapalem Junction',
    city: 'Visakhapatnam',
    lat: 17.7348,
    lng: 83.3282,
    status: 'available',
    waitingTimeMinutes: 0,
    basePricePerKwh: 12.2,
    peakPricePerKwh: 17.0,
    offPeakPricePerKwh: 8.0,
    rating: 4.7,
    reviewsCount: 265,
    ports: [
      { id: 'p-9', type: 'CCS2', powerKw: 60, totalPorts: 2, availablePorts: 2, pricePerKwh: 12.2 },
      { id: 'p-10', type: 'Type 2', powerKw: 22, totalPorts: 2, availablePorts: 1, pricePerKwh: 8.5 },
    ],
    amenities: ['cafe', 'restroom', 'shopping', 'wifi', 'shaded'],
    historicalHourlyOccupancy: [
      5, 4, 3, 3, 5, 8, 15, 38, 62, 70, 58, 52, 50, 55, 62, 75, 85, 88, 80, 68, 48, 28, 15, 8
    ],
    historicalHourlyPrice: [
      8.0, 8.0, 8.0, 8.0, 8.0, 9.2, 11.0, 14.0, 17.0, 17.0, 15.2, 13.5, 13.0, 13.5, 14.5, 16.2, 17.0, 17.0, 16.0, 14.2, 11.5, 9.8, 8.8, 8.0
    ],
  },
  {
    id: 'vizag-5',
    name: 'Statiq Smart EV Point - Jagadamba Junction',
    network: 'Statiq',
    address: 'Near Jagadamba Theatre & Old Post Office Road',
    city: 'Visakhapatnam',
    lat: 17.7102,
    lng: 83.2985,
    status: 'busy',
    waitingTimeMinutes: 10,
    basePricePerKwh: 11.2,
    peakPricePerKwh: 15.5,
    offPeakPricePerKwh: 7.2,
    rating: 4.6,
    reviewsCount: 210,
    ports: [
      { id: 'p-11', type: 'CCS2', powerKw: 50, totalPorts: 2, availablePorts: 0, pricePerKwh: 11.2 },
      { id: 'p-12', type: 'GB/T', powerKw: 30, totalPorts: 1, availablePorts: 1, pricePerKwh: 9.5 },
      { id: 'p-13', type: 'Type 2', powerKw: 22, totalPorts: 2, availablePorts: 1, pricePerKwh: 8.0 },
    ],
    amenities: ['restroom', 'shopping', 'shaded', '24_7'],
    historicalHourlyOccupancy: [
      14, 10, 8, 6, 10, 20, 35, 65, 88, 92, 80, 72, 70, 75, 82, 90, 95, 96, 90, 78, 60, 42, 28, 18
    ],
    historicalHourlyPrice: [
      7.2, 7.2, 7.2, 7.2, 7.2, 8.5, 10.2, 13.0, 15.5, 15.5, 14.0, 12.2, 11.8, 12.2, 13.2, 14.8, 15.5, 15.5, 14.5, 12.8, 10.2, 8.8, 7.8, 7.2
    ],
  },
  {
    id: 'vizag-6',
    name: 'Relux Mega EV Park - Gajuwaka Steel Plant Gate',
    network: 'Relux Electric',
    address: 'Old Gajuwaka Main Road, Near Steel Plant Gate',
    city: 'Visakhapatnam',
    lat: 17.6912,
    lng: 83.2120,
    status: 'available',
    waitingTimeMinutes: 0,
    basePricePerKwh: 10.8,
    peakPricePerKwh: 15.0,
    offPeakPricePerKwh: 7.0,
    rating: 4.7,
    reviewsCount: 340,
    ports: [
      { id: 'p-14', type: 'CCS2', powerKw: 60, totalPorts: 4, availablePorts: 3, pricePerKwh: 10.8 },
      { id: 'p-15', type: 'CCS2', powerKw: 120, totalPorts: 2, availablePorts: 2, pricePerKwh: 12.5 },
      { id: 'p-16', type: 'Type 2', powerKw: 22, totalPorts: 2, availablePorts: 2, pricePerKwh: 7.5 },
    ],
    amenities: ['restroom', 'wifi', 'shaded', '24_7', 'security'],
    historicalHourlyOccupancy: [
      8, 6, 5, 4, 8, 15, 30, 55, 78, 82, 70, 64, 60, 65, 72, 80, 88, 90, 82, 70, 50, 32, 20, 12
    ],
    historicalHourlyPrice: [
      7.0, 7.0, 7.0, 7.0, 7.0, 8.5, 10.0, 12.5, 15.0, 15.0, 13.5, 12.0, 11.5, 12.0, 13.0, 14.2, 15.0, 15.0, 14.0, 12.5, 10.0, 8.5, 7.8, 7.0
    ],
  },
  {
    id: 'vizag-7',
    name: 'Shell Recharge - Rushikonda Beach & IT Corridor',
    network: 'Shell Recharge',
    address: 'Bheemili Beach Road, Near Rushikonda IT Hills',
    city: 'Visakhapatnam',
    lat: 17.7820,
    lng: 83.3850,
    status: 'available',
    waitingTimeMinutes: 0,
    basePricePerKwh: 12.8,
    peakPricePerKwh: 17.5,
    offPeakPricePerKwh: 8.2,
    rating: 4.8,
    reviewsCount: 295,
    ports: [
      { id: 'p-17', type: 'CCS2', powerKw: 120, totalPorts: 3, availablePorts: 2, pricePerKwh: 12.8 },
      { id: 'p-18', type: 'Type 2', powerKw: 22, totalPorts: 2, availablePorts: 2, pricePerKwh: 8.5 },
    ],
    amenities: ['cafe', 'restroom', 'wifi', 'shopping', '24_7', 'security'],
    historicalHourlyOccupancy: [
      6, 5, 4, 3, 5, 10, 20, 42, 68, 75, 62, 55, 52, 56, 65, 78, 88, 92, 85, 72, 50, 32, 18, 10
    ],
    historicalHourlyPrice: [
      8.2, 8.2, 8.2, 8.2, 8.2, 9.5, 11.5, 14.5, 17.5, 17.5, 15.8, 13.8, 13.2, 13.8, 15.0, 16.5, 17.5, 17.5, 16.5, 14.5, 11.8, 10.0, 8.8, 8.2
    ],
  },
  {
    id: 'vizag-8',
    name: 'Tata Power Fast Hub - MVP Colony Sector 2',
    network: 'Tata Power EZ Charge',
    address: 'Near AS Raja Grounds, Sector 2, MVP Colony',
    city: 'Visakhapatnam',
    lat: 17.7420,
    lng: 83.3390,
    status: 'available',
    waitingTimeMinutes: 0,
    basePricePerKwh: 11.5,
    peakPricePerKwh: 16.5,
    offPeakPricePerKwh: 7.8,
    rating: 4.7,
    reviewsCount: 180,
    ports: [
      { id: 'p-19', type: 'CCS2', powerKw: 60, totalPorts: 3, availablePorts: 2, pricePerKwh: 11.5 },
      { id: 'p-20', type: 'Type 2', powerKw: 22, totalPorts: 2, availablePorts: 2, pricePerKwh: 8.0 },
    ],
    amenities: ['cafe', 'wifi', 'shaded'],
    historicalHourlyOccupancy: [
      6, 5, 4, 4, 6, 12, 25, 48, 72, 78, 65, 58, 55, 60, 68, 78, 86, 88, 80, 68, 48, 30, 18, 10
    ],
    historicalHourlyPrice: [
      7.8, 7.8, 7.8, 7.8, 7.8, 9.0, 11.0, 13.8, 16.5, 16.5, 15.0, 13.2, 12.8, 13.2, 14.2, 15.8, 16.5, 16.5, 15.5, 13.8, 11.2, 9.4, 8.4, 7.8
    ],
  },
  {
    id: 'vizag-9',
    name: 'Highway Supercharge - Anandapuram NH16',
    network: 'Zeon Charging',
    address: 'Anandapuram Toll Plaza Junction, NH16 Highway',
    city: 'Visakhapatnam',
    lat: 17.9150,
    lng: 83.3980,
    status: 'available',
    waitingTimeMinutes: 0,
    basePricePerKwh: 13.0,
    peakPricePerKwh: 17.8,
    offPeakPricePerKwh: 8.5,
    rating: 4.9,
    reviewsCount: 310,
    ports: [
      { id: 'p-21', type: 'CCS2', powerKw: 150, totalPorts: 4, availablePorts: 3, pricePerKwh: 13.0 },
      { id: 'p-22', type: 'CCS2', powerKw: 60, totalPorts: 2, availablePorts: 2, pricePerKwh: 12.0 },
      { id: 'p-23', type: 'Type 2', powerKw: 22, totalPorts: 2, availablePorts: 2, pricePerKwh: 8.5 },
    ],
    amenities: ['cafe', 'restroom', 'wifi', 'shopping', '24_7', 'security', 'shaded'],
    historicalHourlyOccupancy: [
      12, 10, 8, 6, 10, 18, 32, 55, 75, 80, 68, 62, 60, 64, 70, 80, 88, 90, 84, 72, 52, 36, 22, 15
    ],
    historicalHourlyPrice: [
      8.5, 8.5, 8.5, 8.5, 8.5, 9.8, 11.8, 14.8, 17.8, 17.8, 16.0, 14.0, 13.5, 14.0, 15.0, 16.8, 17.8, 17.8, 16.8, 14.8, 12.0, 10.2, 9.0, 8.5
    ],
  },
  {
    id: 'vizag-10',
    name: 'Ather & EV Fast Hub - Dwaraka Nagar RTC Complex',
    network: 'Tata Power EZ Charge',
    address: 'Near Old Bus Stand Road, Dwaraka Nagar',
    city: 'Visakhapatnam',
    lat: 17.7265,
    lng: 83.3080,
    status: 'available',
    waitingTimeMinutes: 0,
    basePricePerKwh: 11.8,
    peakPricePerKwh: 16.8,
    offPeakPricePerKwh: 7.9,
    rating: 4.6,
    reviewsCount: 195,
    ports: [
      { id: 'p-24', type: 'CCS2', powerKw: 60, totalPorts: 2, availablePorts: 2, pricePerKwh: 11.8 },
      { id: 'p-25', type: 'Type 2', powerKw: 22, totalPorts: 2, availablePorts: 1, pricePerKwh: 8.2 },
    ],
    amenities: ['restroom', 'wifi', 'shaded'],
    historicalHourlyOccupancy: [
      8, 6, 5, 4, 7, 14, 28, 52, 76, 82, 70, 60, 58, 62, 70, 80, 88, 90, 82, 70, 48, 30, 18, 10
    ],
    historicalHourlyPrice: [
      7.9, 7.9, 7.9, 7.9, 7.9, 9.2, 11.2, 14.0, 16.8, 16.8, 15.2, 13.5, 13.0, 13.5, 14.5, 16.0, 16.8, 16.8, 15.8, 14.0, 11.5, 9.6, 8.6, 7.9
    ],
  },
  {
    id: 'ap-11',
    name: 'AP State EV Hub - Benz Circle Vijayawada',
    network: 'Tata Power EZ Charge',
    address: 'Near Trendset Mall, Benz Circle, MG Road',
    city: 'Vijayawada',
    lat: 16.5062,
    lng: 80.6480,
    status: 'available',
    waitingTimeMinutes: 0,
    basePricePerKwh: 11.5,
    peakPricePerKwh: 16.5,
    offPeakPricePerKwh: 7.6,
    rating: 4.8,
    reviewsCount: 280,
    ports: [
      { id: 'p-26', type: 'CCS2', powerKw: 120, totalPorts: 4, availablePorts: 3, pricePerKwh: 11.5 },
      { id: 'p-27', type: 'Type 2', powerKw: 22, totalPorts: 2, availablePorts: 2, pricePerKwh: 8.0 },
    ],
    amenities: ['cafe', 'restroom', 'wifi', 'shopping', '24_7'],
    historicalHourlyOccupancy: [
      10, 8, 6, 5, 8, 15, 30, 55, 78, 85, 72, 65, 62, 68, 75, 85, 92, 94, 86, 74, 52, 35, 20, 12
    ],
    historicalHourlyPrice: [
      7.6, 7.6, 7.6, 7.6, 7.6, 8.8, 10.8, 13.8, 16.5, 16.5, 15.0, 13.2, 12.8, 13.2, 14.2, 15.8, 16.5, 16.5, 15.5, 13.8, 11.2, 9.4, 8.4, 7.6
    ],
  },
  {
    id: 'ap-12',
    name: 'Tirupati Alipiri Foothills Superstation',
    network: 'Zeon Charging',
    address: 'Alipiri Bypass Road, Near Garuda Statue',
    city: 'Tirupati',
    lat: 13.6288,
    lng: 79.4192,
    status: 'available',
    waitingTimeMinutes: 0,
    basePricePerKwh: 12.5,
    peakPricePerKwh: 17.5,
    offPeakPricePerKwh: 8.0,
    rating: 4.9,
    reviewsCount: 450,
    ports: [
      { id: 'p-28', type: 'CCS2', powerKw: 150, totalPorts: 4, availablePorts: 3, pricePerKwh: 12.5 },
      { id: 'p-29', type: 'Type 2', powerKw: 22, totalPorts: 2, availablePorts: 2, pricePerKwh: 8.5 },
    ],
    amenities: ['restroom', 'wifi', '24_7', 'shaded', 'security'],
    historicalHourlyOccupancy: [
      12, 10, 8, 6, 12, 20, 38, 62, 82, 88, 76, 70, 68, 72, 80, 88, 94, 96, 90, 80, 60, 42, 25, 16
    ],
    historicalHourlyPrice: [
      8.0, 8.0, 8.0, 8.0, 8.0, 9.2, 11.5, 14.5, 17.5, 17.5, 15.8, 14.0, 13.5, 14.0, 15.2, 16.8, 17.5, 17.5, 16.5, 14.5, 12.0, 10.0, 8.8, 8.0
    ],
  }
];

export const INITIAL_CHARGING_SESSIONS = [
  {
    id: 'sess-vizag-1',
    stationId: 'vizag-1',
    stationName: 'Tata Power EZ Hub - RK Beach Promenade',
    date: '2026-09-22 23:15',
    startSoc: 22,
    endSoc: 85,
    energyDeliveredKwh: 26.2,
    totalCost: 204.36, // off-peak ₹7.8/kWh
    durationMinutes: 32,
    chargerType: 'CCS2' as const,
    chargingPowerKw: 60,
    wasRecommendedTime: true,
    estimatedSavings: 235.80, // saved vs peak ₹16.8/kWh
    co2SavedKg: 19.6,
  },
  {
    id: 'sess-vizag-2',
    stationId: 'vizag-2',
    stationName: 'Zeon Ultra-Fast Station - Siripuram Junction',
    date: '2026-09-20 14:10',
    startSoc: 35,
    endSoc: 80,
    energyDeliveredKwh: 18.5,
    totalCost: 249.75,
    durationMinutes: 18,
    chargerType: 'CCS2' as const,
    chargingPowerKw: 120,
    wasRecommendedTime: false,
    estimatedSavings: 38.0,
    co2SavedKg: 13.8,
  },
  {
    id: 'sess-vizag-3',
    stationId: 'vizag-3',
    stationName: 'Jio-bp pulse SuperHub - Madhurawada IT SEZ',
    date: '2026-09-17 23:45',
    startSoc: 18,
    endSoc: 90,
    energyDeliveredKwh: 29.8,
    totalCost: 223.50,
    durationMinutes: 34,
    chargerType: 'CCS2' as const,
    chargingPowerKw: 60,
    wasRecommendedTime: true,
    estimatedSavings: 247.34,
    co2SavedKg: 22.3,
  },
  {
    id: 'sess-vizag-4',
    stationId: 'vizag-6',
    stationName: 'Relux Mega EV Park - Gajuwaka Steel Plant Gate',
    date: '2026-09-14 00:30',
    startSoc: 25,
    endSoc: 85,
    energyDeliveredKwh: 24.9,
    totalCost: 174.30,
    durationMinutes: 30,
    chargerType: 'CCS2' as const,
    chargingPowerKw: 60,
    wasRecommendedTime: true,
    estimatedSavings: 199.20,
    co2SavedKg: 18.7,
  }
];
