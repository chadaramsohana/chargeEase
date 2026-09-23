import {
  ChargingStation,
  EVProfile,
  HourlyPrediction,
  RecommendationWindow,
  StationPort,
} from '../types';

/**
 * Calculates distance between two coordinates using Haversine formula in kilometers.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Estimates driving travel time based on distance in km in urban traffic.
 * Average city speed ~22-26 km/h with traffic lights.
 */
export function estimateTravelTimeMinutes(distanceKm: number): number {
  if (distanceKm <= 0.1) return 1;
  const avgSpeedKmh = 24;
  const baseMinutes = (distanceKm / avgSpeedKmh) * 60;
  // add a small buffer for traffic light / parking
  return Math.max(3, Math.round(baseMinutes + 2));
}

/**
 * Calculates required energy in kWh to charge from currentSoc to targetSoc
 * factoring in ~90% charging inverter & battery thermal efficiency.
 */
export function calculateRequiredEnergyKwh(
  batteryCapacityKwh: number,
  currentSoc: number,
  targetSoc: number,
  chargingEfficiency = 0.90
): number {
  const target = Math.max(currentSoc, Math.min(100, targetSoc));
  const deltaPct = Math.max(0, target - currentSoc);
  const netEnergy = (batteryCapacityKwh * deltaPct) / 100;
  // Energy drawn from grid = netEnergy / efficiency
  const gridEnergy = netEnergy / chargingEfficiency;
  return Number(gridEnergy.toFixed(2));
}

/**
 * Formats hour integer (0-23) to 12-hour AM/PM label
 */
export function formatHour(hour: number): string {
  const h = hour % 24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:00 ${ampm}`;
}

/**
 * ML Charging Suitability Prediction for all 24 hours of the day
 * Combines:
 * - Electricity dynamic tariff (normalized lower is better)
 * - Station occupancy / queue probability
 * - Grid demand strain (lower carbon & stress)
 * - Battery SOC urgency (low SOC penalizes waiting too long)
 */
export function predict24HourSuitability(
  station: ChargingStation,
  vehicle: EVProfile
): HourlyPrediction[] {
  const currentHour = new Date().getHours();
  const requiredKwh = calculateRequiredEnergyKwh(
    vehicle.batteryCapacityKwh,
    vehicle.currentSoc,
    vehicle.targetSoc
  );

  const predictions: HourlyPrediction[] = [];

  // Find min and max price across 24h for normalisation
  const prices = station.historicalHourlyPrice;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = Math.max(1, maxPrice - minPrice);

  for (let h = 0; h < 24; h++) {
    const price = prices[h];
    const occupancy = station.historicalHourlyOccupancy[h];

    // 1. Price Factor Score (0 to 100): lower price -> higher score
    const priceScore = 100 - ((price - minPrice) / priceRange) * 100;

    // 2. Availability & Queue Score (0 to 100): lower occupancy -> higher score
    const availScore = 100 - occupancy;

    // 3. Grid Demand Classification
    let gridDemand: 'low' | 'moderate' | 'high' | 'critical' = 'moderate';
    let gridScore = 70;
    if (h >= 0 && h <= 5) {
      gridDemand = 'low';
      gridScore = 95;
    } else if (h >= 6 && h <= 9) {
      gridDemand = 'moderate';
      gridScore = 75;
    } else if (h >= 10 && h <= 16) {
      gridDemand = 'high';
      gridScore = 55;
    } else if (h >= 17 && h <= 21) {
      gridDemand = 'critical';
      gridScore = 30;
    } else {
      gridDemand = 'low';
      gridScore = 90;
    }

    // 4. Battery SOC Urgency Adjustment:
    // If SOC < 15%, user needs charge sooner. Hours far in the future get urgency penalty.
    let urgencyModifier = 0;
    const hoursAway = (h - currentHour + 24) % 24;
    if (vehicle.currentSoc <= 15) {
      // High urgency! Charging right now or in next 2 hours is favored
      if (hoursAway <= 2) urgencyModifier = 15;
      else urgencyModifier = -Math.min(35, (hoursAway - 2) * 4);
    } else if (vehicle.currentSoc <= 30) {
      if (hoursAway > 12) urgencyModifier = -10;
    }

    // Weighted ML Composite Score:
    // 40% Electricity Price, 35% Station Congestion/Wait, 15% Grid Stress, 10% SOC alignment
    const rawScore =
      priceScore * 0.40 +
      availScore * 0.35 +
      gridScore * 0.15 +
      (100 - vehicle.currentSoc) * 0.10 +
      urgencyModifier;

    const finalScore = Math.max(10, Math.min(99, Math.round(rawScore)));

    // Predicted queue in minutes based on occupancy
    let predictedQueue = 0;
    if (occupancy > 85) predictedQueue = Math.round(15 + (occupancy - 85) * 1.5);
    else if (occupancy > 65) predictedQueue = Math.round((occupancy - 65) * 0.5);

    let status: 'optimal' | 'good' | 'moderate' | 'peak_avoid' = 'moderate';
    let reason = 'Moderate tariff and moderate station traffic.';
    if (finalScore >= 82) {
      status = 'optimal';
      reason = 'Super off-peak pricing & zero queue. Peak grid efficiency.';
    } else if (finalScore >= 64) {
      status = 'good';
      reason = 'Low tariff and short waiting likelihood.';
    } else if (finalScore <= 45) {
      status = 'peak_avoid';
      reason = 'High tariff peak surge & heavy station congestion.';
    }

    const costEstimate = Number((requiredKwh * price).toFixed(2));

    predictions.push({
      hour: h,
      timeLabel: formatHour(h),
      suitabilityScore: finalScore,
      status,
      pricePerKwh: price,
      stationOccupancyPct: occupancy,
      predictedQueueMinutes: predictedQueue,
      gridDemandLevel: gridDemand,
      costEstimateForCharge: costEstimate,
      reason,
    });
  }

  return predictions;
}

/**
 * AI Recommended Optimal Charging Window
 * Identifies the best 2-3 hour contiguous block with the lowest cost and highest suitability.
 */
export function getRecommendedChargingWindow(
  predictions: HourlyPrediction[],
  station: ChargingStation,
  vehicle: EVProfile
): RecommendationWindow {
  const requiredKwh = calculateRequiredEnergyKwh(
    vehicle.batteryCapacityKwh,
    vehicle.currentSoc,
    vehicle.targetSoc
  );

  // Peak price reference
  const peakPrice = Math.max(...station.historicalHourlyPrice);
  const peakCost = Number((requiredKwh * peakPrice).toFixed(2));

  // Find best 3-hour window
  let bestWindowStart = 23;
  let highestWindowScore = -1;
  let windowSize = 3;

  for (let i = 0; i < 24; i++) {
    let scoreSum = 0;
    for (let j = 0; j < windowSize; j++) {
      const idx = (i + j) % 24;
      scoreSum += predictions[idx].suitabilityScore;
    }
    const avgScore = scoreSum / windowSize;
    if (avgScore > highestWindowScore) {
      highestWindowScore = avgScore;
      bestWindowStart = i;
    }
  }

  const endHour = (bestWindowStart + windowSize) % 24;
  const startLabel = formatHour(bestWindowStart);
  const endLabel = formatHour(endHour);

  // Calculate window averages
  let windowPriceSum = 0;
  let queueSum = 0;
  for (let j = 0; j < windowSize; j++) {
    const idx = (bestWindowStart + j) % 24;
    windowPriceSum += predictions[idx].pricePerKwh;
    queueSum += predictions[idx].predictedQueueMinutes;
  }
  const avgPrice = Number((windowPriceSum / windowSize).toFixed(2));
  const expectedCost = Number((requiredKwh * avgPrice).toFixed(2));
  const potentialSavings = Math.max(0, Number((peakCost - expectedCost).toFixed(2)));
  const savingsPct = peakCost > 0 ? Math.round((potentialSavings / peakCost) * 100) : 0;
  const avgQueue = Math.round(queueSum / windowSize);

  return {
    startHour: bestWindowStart,
    endHour,
    windowLabel: `${startLabel} – ${endLabel}`,
    badge: avgPrice <= 9.0 ? 'Super Off-Peak Saver' : 'Smart Value Window',
    recommendedStationId: station.id,
    suitabilityScore: Math.round(highestWindowScore),
    avgPricePerKwh: avgPrice,
    expectedCost,
    peakCostComparison: peakCost,
    potentialSavings,
    savingsPercentage: savingsPct,
    expectedQueueMinutes: avgQueue,
    reasons: [
      `Off-peak dynamic tariff drops to ₹${avgPrice}/kWh (save ${savingsPct}% vs peak ₹${peakPrice}/kWh).`,
      `Station queue drops to ${avgQueue} mins with ${100 - predictions[bestWindowStart].stationOccupancyPct}% port availability.`,
      `Optimal grid stability & reduced battery thermal degradation during cooler nighttime temperatures.`,
    ],
  };
}

/**
 * AI Station Recommendation Scoring Algorithm
 * Combines:
 * - Distance (closer is better, exponential decay)
 * - Charging Speed match with vehicle max charging speed
 * - Cost per kWh
 * - Real-time queue and available ports
 * - Plug compatibility
 * - User preference weighting
 */
export function scoreAndRankStations(
  stations: ChargingStation[],
  vehicle: EVProfile,
  userLat?: number,
  userLng?: number
): ChargingStation[] {
  const currentHour = new Date().getHours();
  const pref = vehicle.chargingPreferences;

  const scoredStations = stations.map((st) => {
    // 1. Distance Calculation
    let distanceKm = st.distanceKm;
    if (userLat !== undefined && userLng !== undefined) {
      distanceKm = calculateHaversineDistance(userLat, userLng, st.lat, st.lng);
    } else if (distanceKm === undefined) {
      distanceKm = 3.5; // fallback
    }
    const travelTime = estimateTravelTimeMinutes(distanceKm);

    // 2. Plug Compatibility
    const hasCompatiblePlug = st.ports.some((p) =>
      vehicle.supportedPlugs.includes(p.type)
    );
    const hasPreferredPlug =
      pref.preferredPlug === 'any' ||
      st.ports.some((p) => p.type === pref.preferredPlug);

    // 3. Max Power matching
    const maxStationPower = Math.max(...st.ports.map((p) => p.powerKw), 0);
    const speedRatio = Math.min(1.2, maxStationPower / vehicle.maxChargingSpeedKw);
    const speedScore = Math.min(100, Math.round(speedRatio * 85));

    // 4. Distance Score (0 to 100) - 10km drops to ~30
    const distanceScore = Math.max(0, 100 - distanceKm * 8.5);

    // 5. Cost Score: current hour price
    const currentPrice = st.historicalHourlyPrice[currentHour] || st.basePricePerKwh;
    // Lower price gives higher score (e.g. ₹7 -> 95, ₹20 -> 35)
    const costScore = Math.max(20, Math.min(100, 100 - (currentPrice - 7) * 4.5));

    // 6. Availability & Queue Score
    const totalPorts = st.ports.reduce((sum, p) => sum + p.totalPorts, 0);
    const freePorts = st.ports.reduce((sum, p) => sum + p.availablePorts, 0);
    const availRatio = totalPorts > 0 ? freePorts / totalPorts : 0;
    let queueScore = 100 - st.waitingTimeMinutes * 3;
    if (freePorts === 0) queueScore -= 20;
    queueScore = Math.max(10, Math.min(100, queueScore * 0.7 + availRatio * 30));

    // 7. Weight distribution based on user priority
    let wDist = 0.25;
    let wCost = 0.25;
    let wSpeed = 0.25;
    let wQueue = 0.25;

    if (pref.priority === 'nearest') {
      wDist = 0.45;
      wQueue = 0.25;
      wCost = 0.15;
      wSpeed = 0.15;
    } else if (pref.priority === 'cheapest') {
      wCost = 0.50;
      wDist = 0.20;
      wQueue = 0.15;
      wSpeed = 0.15;
    } else if (pref.priority === 'fastest') {
      wSpeed = 0.45;
      wQueue = 0.25;
      wDist = 0.15;
      wCost = 0.15;
    }

    let finalScore =
      distanceScore * wDist +
      costScore * wCost +
      speedScore * wSpeed +
      queueScore * wQueue;

    // Bonus for high rating
    finalScore += (st.rating - 4.0) * 10;

    // Penalize if plug type not matching preferred
    if (!hasPreferredPlug) finalScore -= 15;
    if (!hasCompatiblePlug) finalScore -= 50;

    const clampedScore = Math.max(20, Math.min(99, Math.round(finalScore)));

    // Generate recommendation reason
    let reason = `${distanceKm} km away • ₹${currentPrice}/kWh • ${st.waitingTimeMinutes} min wait`;
    if (freePorts > 0 && maxStationPower >= 60) {
      reason += ` • ${maxStationPower}kW fast charger ready`;
    }

    return {
      ...st,
      distanceKm,
      estimatedTravelMinutes: travelTime,
      aiMatchScore: clampedScore,
      aiRecommendationReason: reason,
    };
  });

  // Sort descending by AI match score
  scoredStations.sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0));

  // Mark the top one as isTopPick
  if (scoredStations.length > 0) {
    scoredStations[0].isTopPick = true;
  }

  return scoredStations;
}

/**
 * Filter stations based on user filter controls
 */
export function filterStations(
  stations: ChargingStation[],
  searchQuery: string,
  filterAvailableNow: boolean,
  filterLowWait: boolean,
  selectedPlugs: string[],
  minPowerKw: number,
  sortBy: string
): ChargingStation[] {
  return stations
    .filter((st) => {
      // Search query filter (name, network, address, city)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          st.name.toLowerCase().includes(q) ||
          st.network.toLowerCase().includes(q) ||
          st.address.toLowerCase().includes(q) ||
          st.city.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Available now
      if (filterAvailableNow) {
        const freePorts = st.ports.reduce((acc, p) => acc + p.availablePorts, 0);
        if (freePorts <= 0 || st.status === 'queue' || st.status === 'busy') return false;
      }

      // Low wait time (< 10 mins)
      if (filterLowWait && st.waitingTimeMinutes > 10) {
        return false;
      }

      // Selected plug types
      if (selectedPlugs.length > 0) {
        const hasPlug = st.ports.some((p) => selectedPlugs.includes(p.type));
        if (!hasPlug) return false;
      }

      // Minimum power kW
      if (minPowerKw > 0) {
        const maxKw = Math.max(...st.ports.map((p) => p.powerKw), 0);
        if (maxKw < minPowerKw) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'recommended') {
        return (b.aiMatchScore || 0) - (a.aiMatchScore || 0);
      }
      if (sortBy === 'nearest') {
        return (a.distanceKm || 999) - (b.distanceKm || 999);
      }
      if (sortBy === 'cheapest') {
        return a.basePricePerKwh - b.basePricePerKwh;
      }
      if (sortBy === 'fastest') {
        const maxKwA = Math.max(...a.ports.map((p) => p.powerKw), 0);
        const maxKwB = Math.max(...b.ports.map((p) => p.powerKw), 0);
        return maxKwB - maxKwA;
      }
      if (sortBy === 'availability') {
        const freeA = a.ports.reduce((acc, p) => acc + p.availablePorts, 0);
        const freeB = b.ports.reduce((acc, p) => acc + p.availablePorts, 0);
        return freeB - freeA;
      }
      return 0;
    });
}

/**
 * Ensures stations are always present close to the user's live GPS coordinates.
 * If the closest station is > 30km away, generates realistic nearby stations.
 */
export function ensureStationsForUserLocation(
  baseStations: ChargingStation[],
  userLat: number,
  userLng: number
): ChargingStation[] {
  let minDistance = Infinity;
  for (const st of baseStations) {
    const d = calculateHaversineDistance(userLat, userLng, st.lat, st.lng);
    if (d < minDistance) minDistance = d;
  }

  // If user is within 35km of existing Andhra Pradesh / Vizag stations, keep original list
  if (minDistance <= 35) {
    return baseStations;
  }

  // Generate 4 proximity stations around user's exact real-time GPS fix
  const offsets = [
    { name: 'Tata Power EZ Charge - Live Proximity Hub', dLat: 0.012, dLng: 0.015, kw: 60, price: 11.5 },
    { name: 'Zeon Ultra-Fast - Real-Time Station', dLat: -0.018, dLng: 0.012, kw: 150, price: 13.0 },
    { name: 'Jio-bp pulse - GPS Nearby Fast Point', dLat: 0.009, dLng: -0.021, kw: 60, price: 10.8 },
    { name: 'ChargeZone EcoHub - Local Proximity Node', dLat: -0.015, dLng: -0.014, kw: 120, price: 12.0 },
  ];

  const nearbyStations: ChargingStation[] = offsets.map((off, idx) => ({
    id: `live-gps-${idx + 1}`,
    name: off.name,
    network: off.name.split(' - ')[0],
    address: `Near Real-time GPS Location (${(userLat + off.dLat).toFixed(4)}, ${(userLng + off.dLng).toFixed(4)})`,
    city: 'Live GPS Vicinity',
    lat: Number((userLat + off.dLat).toFixed(5)),
    lng: Number((userLng + off.dLng).toFixed(5)),
    status: 'available',
    waitingTimeMinutes: idx === 1 ? 5 : 0,
    basePricePerKwh: off.price,
    peakPricePerKwh: off.price + 5.0,
    offPeakPricePerKwh: Math.max(6.5, off.price - 4.2),
    rating: 4.8,
    reviewsCount: 140 + idx * 45,
    ports: [
      { id: `p-live-${idx}-1`, type: 'CCS2', powerKw: off.kw, totalPorts: 4, availablePorts: 3, pricePerKwh: off.price },
      { id: `p-live-${idx}-2`, type: 'Type 2', powerKw: 22, totalPorts: 2, availablePorts: 2, pricePerKwh: 8.5 },
    ],
    amenities: ['cafe', 'restroom', 'wifi', 'shaded', '24_7'],
    historicalHourlyOccupancy: [8, 6, 5, 4, 6, 12, 22, 45, 75, 82, 65, 58, 55, 60, 68, 78, 88, 92, 85, 70, 52, 38, 22, 12],
    historicalHourlyPrice: [7.8, 7.8, 7.8, 7.8, 7.8, 9.0, 10.5, 14.0, 16.8, 16.8, 15.0, 13.0, 12.5, 13.0, 14.0, 16.0, 17.2, 17.2, 16.5, 14.0, 11.0, 9.5, 8.5, 7.8],
  }));

  return [...nearbyStations, ...baseStations];
}

