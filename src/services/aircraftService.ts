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
      console.warn('OpenSky API unavailable, using simulated data');
      return generateSimulatedAircraft();
    }

    const data = await response.json();
    if (!data.states) return generateSimulatedAircraft();

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
    console.warn('Failed to fetch aircraft data, using simulated data');
    return generateSimulatedAircraft();
  }
}

function generateSimulatedAircraft(): Aircraft[] {
  const aircraft: Aircraft[] = [];
  const routes = [
    { from: { lat: 40.6, lng: -73.8 }, to: { lat: 51.5, lng: -0.5 }, prefix: 'BAW' },
    { from: { lat: 33.9, lng: -118.4 }, to: { lat: 35.6, lng: 139.8 }, prefix: 'JAL' },
    { from: { lat: 25.2, lng: 55.4 }, to: { lat: 51.5, lng: -0.5 }, prefix: 'UAE' },
    { from: { lat: 1.4, lng: 104.0 }, to: { lat: 31.1, lng: 121.8 }, prefix: 'SIA' },
    { from: { lat: 49.0, lng: 2.5 }, to: { lat: 40.6, lng: -73.8 }, prefix: 'AFR' },
    { from: { lat: 55.6, lng: 37.4 }, to: { lat: 39.9, lng: 116.4 }, prefix: 'AFL' },
    { from: { lat: 25.0, lng: 121.5 }, to: { lat: 37.5, lng: 127.0 }, prefix: 'EVA' },
    { from: { lat: 52.3, lng: 4.8 }, to: { lat: 38.9, lng: -77.5 }, prefix: 'KLM' },
  ];

  routes.forEach((route, i) => {
    for (let j = 0; j < 8; j++) {
      const t = Math.random();
      const pos: GeoPosition = {
        lat: route.from.lat + (route.to.lat - route.from.lat) * t + (Math.random() - 0.5) * 2,
        lng: route.from.lng + (route.to.lng - route.from.lng) * t + (Math.random() - 0.5) * 2,
        alt: 8000 + Math.random() * 5000,
      };
      aircraft.push({
        icao24: `sim${i}${j}`,
        callsign: `${route.prefix}${100 + j}`,
        origin_country: 'Simulated',
        position: pos,
        velocity: 200 + Math.random() * 80,
        heading: Math.random() * 360,
        vertical_rate: (Math.random() - 0.5) * 5,
        on_ground: false,
        squawk: null,
        category: j % 5 === 0 ? 'military' : j % 3 === 0 ? 'private' : 'commercial',
        last_update: Date.now() / 1000,
        tracked: j % 7 === 0,
      });
    }
  });

  // Add some military aircraft near hotspots
  const hotspots = [
    { lat: 24.5, lng: 119.5 }, // Taiwan Strait
    { lat: 50.0, lng: 36.0 },  // Ukraine
    { lat: 38.0, lng: 127.0 }, // Korea
  ];
  hotspots.forEach((hs, i) => {
    for (let j = 0; j < 3; j++) {
      aircraft.push({
        icao24: `mil${i}${j}`,
        callsign: `RCH${200 + i * 10 + j}`,
        origin_country: 'United States',
        position: {
          lat: hs.lat + (Math.random() - 0.5) * 3,
          lng: hs.lng + (Math.random() - 0.5) * 3,
          alt: 10000 + Math.random() * 5000,
        },
        velocity: 250 + Math.random() * 100,
        heading: Math.random() * 360,
        vertical_rate: 0,
        on_ground: false,
        squawk: '7700',
        category: 'military',
        last_update: Date.now() / 1000,
        tracked: true,
      });
    }
  });

  return aircraft;
}
