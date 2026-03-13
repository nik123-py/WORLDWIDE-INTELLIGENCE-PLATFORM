// Drone / UAV Detection — adsb.lol open ADS-B data
// Filters for known military drone platforms from the adsb.lol military endpoint
// Known UAV type codes: MQ-9 Reaper, RQ-4 Global Hawk, MQ-1C Gray Eagle,
// TB2 Bayraktar, Heron, Hermes, Wing Loong, CH-4/5
import { DroneUAV } from '@/types';
import { proxyFetch } from '@/utils/proxyFetch';

// Known UAV aircraft type codes in ICAO/FAA designator format
const UAV_TYPE_CODES = [
  'MQ9', 'MQ1', 'RQ4', 'RQ7', 'MQ1C', 'HRON', 'HRMS', 'ANKA',
  'B2', 'TB2', // Bayraktar
  'MALE', 'HALE', 'UAS', 'UAV', 'RPAS',
  'WL2', 'CH4', 'CH5', // Chinese drones
  'P1HH', // Piaggio
  'SCAN', // ScanEagle
];

// Known drone callsign patterns
const DRONE_CALLSIGN_PATTERNS = [
  /^REAP/i, /^PRED/i, /^HAWK/i, /^GRAY/i, /^SCAN/i,
  /^UAV/i, /^UAS/i, /^RPV/i, /^DRONE/i, /^RPAS/i,
  /^TEAL/i, // TealGroup designator
];

let cachedDrones: DroneUAV[] = [];
let lastFetch = 0;

export async function fetchDroneData(): Promise<DroneUAV[]> {
  if (cachedDrones.length > 0 && Date.now() - lastFetch < 60000) return cachedDrones; // 60s cache

  try {
    // Fetch military aircraft from adsb.lol
    const res = await proxyFetch('https://api.adsb.lol/v2/mil');
    if (!res.ok) return cachedDrones;

    const data = await res.json();
    if (!data?.ac) return cachedDrones;

    const drones: DroneUAV[] = [];

    for (const ac of data.ac) {
      if (!ac.lat || !ac.lon) continue;

      const flight = (ac.flight || '').trim();
      const acType = (ac.t || '').toUpperCase();
      const desc = (ac.desc || '').toUpperCase();

      // Check if this is a drone/UAV
      const isUAVType = UAV_TYPE_CODES.some(code => acType.includes(code));
      const isUAVCallsign = DRONE_CALLSIGN_PATTERNS.some(p => p.test(flight));
      const isUAVDesc = desc.includes('UAV') || desc.includes('UNMANNED') || desc.includes('DRONE') || desc.includes('REMOTELY');

      // Also check flight characteristics: very high altitude + slow speed = likely HALE drone
      const isHALE = (ac.alt_baro || 0) > 40000 && (ac.gs || 0) < 250 && (ac.gs || 0) > 50;

      if (isUAVType || isUAVCallsign || isUAVDesc || isHALE) {
        drones.push({
          id: ac.hex || `drone-${drones.length}`,
          callsign: flight || ac.hex || 'UNKNOWN',
          type: acType || 'UAV',
          country: ac.r || 'Unknown',
          position: {
            lat: ac.lat,
            lng: ac.lon,
            alt: ac.alt_baro || ac.alt_geom || 0,
          },
          altitude: ac.alt_baro || ac.alt_geom || 0,
          speed: (ac.gs || 0) * 0.514444, // knots to m/s
          heading: ac.track || 0,
          military: true,
          last_update: ac.seen ? (Date.now() / 1000 - ac.seen) : Date.now() / 1000,
        });
      }
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
