import { GoogleGenAI } from '@google/genai';
import { EVProfile, ChargingStation } from '../types';

let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (aiInstance) return aiInstance;
  const apiKey =
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY);

  if (apiKey) {
    try {
      aiInstance = new GoogleGenAI({ apiKey });
      return aiInstance;
    } catch (e) {
      console.warn('Gemini client initialization error:', e);
    }
  }
  return null;
}

export async function askGeminiEVAdvisor(
  userQuery: string,
  vehicle: EVProfile,
  recommendedStation: ChargingStation | null,
  recommendedWindow: string
): Promise<string> {
  const ai = getAIClient();

  const promptContext = `
You are ChargeEase AI, an expert EV charging and battery optimization engineer.
The user is driving a ${vehicle.year} ${vehicle.make} ${vehicle.model}.
Current Battery State of Charge (SOC): ${vehicle.currentSoc}%.
Target Battery SOC: ${vehicle.targetSoc}%.
Battery Capacity: ${vehicle.batteryCapacityKwh} kWh.
Max Charging Speed: ${vehicle.maxChargingSpeedKw} kW.
Current Recommended Charging Window: ${recommendedWindow}.
Selected Recommended Station: ${recommendedStation ? `${recommendedStation.name} (${recommendedStation.distanceKm} km, ₹${recommendedStation.basePricePerKwh}/kWh, ${recommendedStation.waitingTimeMinutes} min wait)` : 'None selected'}.

User Query: "${userQuery}"

Provide a concise, highly practical, and expert EV recommendation in 2 to 4 bullet points with clear numbers (range left, charging time, cost, battery longevity advice). Keep tone tech-savvy, professional, and directly actionable.
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptContext,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local heuristic advisor:', err);
    }
  }

  // Smart Heuristic Fallback
  const usableKwhLeft = (vehicle.batteryCapacityKwh * vehicle.currentSoc) / 100;
  const estRangeKm = Math.round((usableKwhLeft / vehicle.energyEfficiencyKwhPer100Km) * 100);
  const neededKwh = (vehicle.batteryCapacityKwh * Math.max(0, vehicle.targetSoc - vehicle.currentSoc)) / 100;

  return `🔋 **Battery Assessment**: With ${vehicle.currentSoc}% SOC (~${usableKwhLeft.toFixed(1)} kWh usable), your estimated highway/city range is **${estRangeKm} km**.
⚡ **Optimal Strategy**: To reach ${vehicle.targetSoc}%, you need **${neededKwh.toFixed(1)} kWh**.
🕒 **Recommended Timing**: Charge during **${recommendedWindow}** to leverage off-peak tariffs, saving up to 45% on electricity costs.
💡 **Longevity Tip**: Unplug at 80%–85% on DC fast chargers because charging speed tapers significantly past 80% to protect cell chemistry.`;
}
