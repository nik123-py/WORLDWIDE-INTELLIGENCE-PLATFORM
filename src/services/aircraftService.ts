// Aircraft data service — OpenSky Network API
import { Aircraft, GeoPosition } from '@/types';
import { proxyFetch } from '@/utils/proxyFetch';

const OPENSKY_API = 'https://opensky-network.org/api/states/all';

// Known billionaire / notable aircraft registrations
const TRACKED_AIRCRAFT: Record<string, string> = {
  'N1KE': 'Nike Corporate',
  'N517QS': 'NetJets Fleet',
  'N2546': 'Jeff Bezos',
  'VP-BLK': 'Roman Abramovich',
  'N421AL': 'Unknown VIP',
  'N515PJ': 'Unknown VIP',
};

function categorizeAircraft(callsign: string, category_num: number): Aircraft['category'] {
  const cs = (callsign || '').trim().toUpperCase();
  if (/^RCH|^DUKE|^EVAC|^REACH|^RFF/.test(cs)) return 'military';
  if (/^AFR|^BAW|^DAL|^UAL|^AAL|^SWA|^RYR|^EZY/.test(cs)) return 'commercial';
  if (/^FDX|^UPS|^GTI|^CLX/.test(cs)) return 'cargo';
  if (category_num >= 1 && category_num <= 3) return 'commercial';
  if (cs.length <= 4 || cs.startsWith('N') || cs.startsWith('VP')) return 'private';
  return 'unknown';
}

export async function fetchAircraftData(): Promise<Aircraft[]> {
  try {
    const response = await proxyFetch(OPENSKY_API);

    if (!response.ok) {
      console.warn('OpenSky API unavailable, returning empty array');
      return [];
    }

    const data = await response.json();
    if (!data.states) return [];

    // Process all states (we let React and Globe.gl handle the volume natively now)
    const states = data.states;

    return states
      .filter((s: unknown[]) => s[5] !== null && s[6] !== null)
      .map((s: unknown[]): Aircraft => {
        const callsign = ((s[1] as string) || '').trim();
        return {
          icao24: s[0] as string,
          callsign,
          origin_country: s[2] as string,
          position: {
            lat: s[6] as number,
            lng: s[5] as number,
            alt: (s[7] as number) || 0,
          },
          velocity: (s[9] as number) || 0,
          heading: (s[10] as number) || 0,
          vertical_rate: (s[11] as number) || 0,
          on_ground: s[8] as boolean,
          squawk: (s[14] as string) || null,
          category: categorizeAircraft(callsign, (s[16] as number) || 0),
          last_update: (s[3] as number) || Date.now() / 1000,
          tracked: callsign in TRACKED_AIRCRAFT,
        };
      });
  } catch {
    console.warn('Failed to fetch aircraft data, returning empty array');
    return [];
  }
}
