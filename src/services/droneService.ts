// Military Aviation / Drone Detection — adsb.lol open ADS-B data
// Shows ALL military aircraft tracked via ADS-B transponders globally
// Source: adsb.lol /v2/mil endpoint — real-time, free, no API key
// Includes: fighters, transports, tankers, helicopters, trainers, UAVs
import { DroneUAV } from '@/types';
import { proxyFetch } from '@/utils/proxyFetch';

// Known aircraft type descriptions for display
const TYPE_NAMES: Record<string, string> = {
  'H60': 'UH-60 Black Hawk', 'C17': 'C-17 Globemaster', 'C30J': 'C-130J Hercules',
  'C130': 'C-130 Hercules', 'K35R': 'KC-135 Stratotanker', 'V22': 'V-22 Osprey',
  'F16': 'F-16 Fighting Falcon', 'F15': 'F-15 Eagle', 'F18': 'F/A-18 Hornet',
  'F35': 'F-35 Lightning II', 'F22': 'F-22 Raptor', 'B52': 'B-52 Stratofortress',
  'B1': 'B-1B Lancer', 'B2': 'B-2 Spirit', 'E3': 'E-3 Sentry AWACS',
  'E6': 'E-6B Mercury', 'E2': 'E-2 Hawkeye', 'P8': 'P-8A Poseidon',
  'C5M': 'C-5M Super Galaxy', 'R135': 'RC-135 Rivet Joint', 'H47': 'CH-47 Chinook',
  'EC45': 'EC145 Helicopter', 'A332': 'A330 MRTT', 'B762': 'KC-46 Pegasus',
  'TEX2': 'T-6 Texan II', 'T38': 'T-38 Talon', 'CN35': 'CN-235',
  'GLEX': 'Global Express', 'GLF5': 'Gulfstream V', 'AS65': 'AS365 Dauphin',
  'MQ9': 'MQ-9 Reaper UAV', 'RQ4': 'RQ-4 Global Hawk UAV', 'MQ1': 'MQ-1 Predator UAV',
};

let cachedDrones: DroneUAV[] = [];
let lastFetch = 0;

export async function fetchDroneData(): Promise<DroneUAV[]> {
  if (cachedDrones.length > 0 && Date.now() - lastFetch < 60000) return cachedDrones; // 60s cache

  try {
    // Fetch ALL military aircraft from adsb.lol — real ADS-B transponder data
    const res = await proxyFetch('https://api.adsb.lol/v2/mil');
    if (!res.ok) return cachedDrones;

    const data = await res.json();
    if (!data?.ac) return cachedDrones;

    const drones: DroneUAV[] = [];

    for (const ac of data.ac) {
      if (!ac.lat || !ac.lon) continue;

      const flight = (ac.flight || '').trim();
      const acType = (ac.t || '').toUpperCase();
      const typeName = TYPE_NAMES[acType] || acType || 'Military Aircraft';

      drones.push({
        id: ac.hex || `mil-${drones.length}`,
        callsign: flight || ac.hex || 'CLASSIFIED',
        type: typeName,
        country: ac.r || 'Unknown',
        position: {
          lat: ac.lat,
          lng: ac.lon,
          alt: ac.alt_baro === 'ground' ? 0 : (ac.alt_baro || ac.alt_geom || 0),
        },
        altitude: ac.alt_baro === 'ground' ? 0 : (ac.alt_baro || ac.alt_geom || 0),
        speed: (ac.gs || 0) * 0.514444, // knots to m/s
        heading: ac.track || 0,
        military: true,
        last_update: ac.seen ? (Date.now() / 1000 - ac.seen) : Date.now() / 1000,
      });
    }

    if (drones.length > 0) {
      cachedDrones = drones;
      lastFetch = Date.now();
    }
    return cachedDrones;
  } catch {
    return cachedDrones;
  }
}
