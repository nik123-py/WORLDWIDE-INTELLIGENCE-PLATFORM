// Aircraft data service — adsb.lol open aggregator API
// Free, no API key, no rate limits, community-sourced ADS-B data
// Falls back to OpenSky if adsb.lol is unavailable
import { Aircraft } from '@/types';
import { proxyFetch } from '@/utils/proxyFetch';

// adsb.lol API — geographic centers covering all major flight corridors worldwide
const ADSB_REGIONS = [
  { lat: 40, lon: -74, dist: 500, name: 'N.America East' },
  { lat: 34, lon: -118, dist: 500, name: 'N.America West' },
  { lat: 51, lon: 0, dist: 500, name: 'Europe West' },
  { lat: 55, lon: 25, dist: 500, name: 'Europe East' },
  { lat: 25, lon: 55, dist: 500, name: 'Middle East' },
  { lat: 20, lon: 78, dist: 500, name: 'India' },
  { lat: 35, lon: 140, dist: 500, name: 'East Asia' },
  { lat: -33, lon: 151, dist: 500, name: 'Oceania' },
  { lat: -23, lon: -43, dist: 500, name: 'S.America' },
  { lat: 6, lon: 3, dist: 500, name: 'Africa' },
];

// Known billionaire / notable aircraft registrations
const TRACKED_AIRCRAFT: Record<string, string> = {
  'N1KE': 'Nike Corporate',
  'N517QS': 'NetJets Fleet',
  'N2546': 'Jeff Bezos',
  'VP-BLK': 'Roman Abramovich',
  'N421AL': 'Unknown VIP',
  'N515PJ': 'Unknown VIP',
};

function categorizeFromAdsb(flight: string, category: string, dbFlags?: number): Aircraft['category'] {
  const cs = (flight || '').trim().toUpperCase();
  if (/^RCH|^DUKE|^EVAC|^REACH|^RFF|^CASA|^NAVY|^AIR/.test(cs)) return 'military';
  if (dbFlags && (dbFlags & 1)) return 'military'; // adsb.lol military flag
  if (category === 'A1' || category === 'A2' || category === 'A3') return 'commercial';
  if (/^AFR|^BAW|^DAL|^UAL|^AAL|^SWA|^RYR|^EZY|^THY|^QTR|^ETD|^SIA|^CPA|^ANA|^JAL/.test(cs)) return 'commercial';
  if (/^FDX|^UPS|^GTI|^CLX|^ABW/.test(cs)) return 'cargo';
  if (cs.length <= 4 || cs.startsWith('N') || cs.startsWith('VP')) return 'private';
  return 'unknown';
}

// Cache
let cachedAircraft: Aircraft[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 60 seconds

export async function fetchAircraftData(): Promise<Aircraft[]> {
  // Return cached data if fresh
  if (cachedAircraft.length > 0 && Date.now() - lastFetchTime < CACHE_DURATION) {
    return cachedAircraft;
  }

  const seen = new Set<string>();
  const allAircraft: Aircraft[] = [];

  // Fetch all regions + military endpoint in parallel (adsb.lol has no rate limits)
  const regionUrls = ADSB_REGIONS.map(
    r => `https://api.adsb.lol/v2/lat/${r.lat}/lon/${r.lon}/dist/${r.dist}`
  );
  // Also fetch global military aircraft
  regionUrls.push('https://api.adsb.lol/v2/mil');

  const responses = await Promise.allSettled(
    regionUrls.map(url => proxyFetch(url))
  );

  for (const res of responses) {
    if (res.status !== 'fulfilled' || !res.value.ok) continue;
    try {
      const data = await res.value.json();
      const aircraft = data.ac || [];
      for (const ac of aircraft) {
        if (!ac.lat || !ac.lon) continue;
        const hex = ac.hex;
        if (seen.has(hex)) continue;
        seen.add(hex);

        const callsign = (ac.flight || '').trim();
        allAircraft.push({
          icao24: hex,
          callsign,
          origin_country: ac.r || 'Unknown', // Registration
          position: {
            lat: ac.lat,
            lng: ac.lon,
            alt: ac.alt_baro || ac.alt_geom || 0,
          },
          velocity: (ac.gs || 0) * 0.514444, // knots to m/s
          heading: ac.track || 0,
          vertical_rate: (ac.baro_rate || 0) * 0.00508, // ft/min to m/s
          on_ground: ac.alt_baro === 'ground',
          squawk: ac.squawk || null,
          category: categorizeFromAdsb(callsign, ac.category || '', ac.dbFlags),
          last_update: ac.seen ? (Date.now() / 1000 - ac.seen) : Date.now() / 1000,
          tracked: callsign in TRACKED_AIRCRAFT,
        });
      }
    } catch {
      // Skip failed region
    }
  }

  if (allAircraft.length > 0) {
    cachedAircraft = allAircraft;
    lastFetchTime = Date.now();
  }
  return cachedAircraft;
}
