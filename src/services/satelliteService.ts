// Satellite tracking service — Celestrak TLE data + satellite.js propagation
import { Satellite } from '@/types';
import { proxyFetch } from '@/utils/proxyFetch';

const CELESTRAK_URLS = {
  stations: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=json',
  active: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json',
  starlink: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=json',
};

interface CelestrakGP {
  OBJECT_NAME: string;
  NORAD_CAT_ID: number;
  EPOCH: string;
  MEAN_MOTION: number;
  ECCENTRICITY: number;
  INCLINATION: number;
  RA_OF_ASC_NODE: number;
  ARG_OF_PERICENTER: number;
  MEAN_ANOMALY: number;
  TLE_LINE1: string;
  TLE_LINE2: string;
  OBJECT_TYPE?: string;
  COUNTRY_CODE?: string;
}

function classifySatellite(name: string): { type: Satellite['type']; country: string } {
  const n = name.toUpperCase();
  if (n.includes('STARLINK') || n.includes('ONEWEB') || n.includes('IRIDIUM') || n.includes('INTELSAT'))
    return { type: 'communication', country: 'US' };
  if (n.includes('NOAA') || n.includes('GOES') || n.includes('METEOSAT') || n.includes('HIMAWARI'))
    return { type: 'weather', country: n.includes('HIMAWARI') ? 'JP' : n.includes('METEOSAT') ? 'EU' : 'US' };
  if (n.includes('GPS') || n.includes('GLONASS') || n.includes('GALILEO') || n.includes('BEIDOU'))
    return { type: 'navigation', country: n.includes('GLONASS') ? 'RU' : n.includes('BEIDOU') ? 'CN' : n.includes('GALILEO') ? 'EU' : 'US' };
  if (n.includes('USA ') || n.includes('COSMOS') || n.includes('NROL') || n.includes('YAOGAN'))
    return { type: 'military', country: n.includes('COSMOS') || n.includes('GLONASS') ? 'RU' : n.includes('YAOGAN') ? 'CN' : 'US' };
  if (n.includes('ISS') || n.includes('TIANGONG') || n.includes('HUBBLE'))
    return { type: 'science', country: n.includes('TIANGONG') ? 'CN' : 'US' };
  return { type: 'unknown', country: 'UNK' };
}

function getOrbitType(meanMotion: number): Satellite['orbit_type'] {
  if (meanMotion > 11) return 'LEO';
  if (meanMotion > 1.5) return 'MEO';
  if (meanMotion > 0.9 && meanMotion < 1.1) return 'GEO';
  return 'HEO';
}

// Simple SGP4-like position estimation without full library for SSR compatibility
function estimatePosition(inclination: number, raAscNode: number, meanAnomaly: number, meanMotion: number): { lat: number; lng: number; alt: number } {
  const now = Date.now();
  const minutesSinceEpoch = (now % (86400000 * 365)) / 60000;
  const orbitsCompleted = (minutesSinceEpoch * meanMotion) / 1440;
  const currentAnomaly = (meanAnomaly + orbitsCompleted * 360) % 360;

  const anomalyRad = (currentAnomaly * Math.PI) / 180;
  const inclinationRad = (inclination * Math.PI) / 180;
  const raRad = (raAscNode * Math.PI) / 180;

  const lat = Math.asin(Math.sin(inclinationRad) * Math.sin(anomalyRad)) * (180 / Math.PI);
  const lng = ((raRad + Math.atan2(
    Math.cos(inclinationRad) * Math.sin(anomalyRad),
    Math.cos(anomalyRad)
  )) * (180 / Math.PI) - (now / 240000) % 360 + 360) % 360 - 180;

  // Altitude from mean motion (approximate)
  const semiMajorAxis = Math.pow(398600.4418 / Math.pow((meanMotion * 2 * Math.PI) / 86400, 2), 1 / 3);
  const alt = Math.max(200, semiMajorAxis - 6371);

  return { lat: Math.max(-90, Math.min(90, lat)), lng, alt };
}

export async function fetchSatelliteData(): Promise<Satellite[]> {
  try {
    const response = await proxyFetch(CELESTRAK_URLS.stations);
    if (!response.ok) throw new Error('Celestrak unavailable');

    const data: CelestrakGP[] = await response.json();

    const satellites: Satellite[] = data.slice(0, 200).map((gp) => {
      const classification = classifySatellite(gp.OBJECT_NAME);
      const pos = estimatePosition(gp.INCLINATION, gp.RA_OF_ASC_NODE, gp.MEAN_ANOMALY, gp.MEAN_MOTION);

      return {
        norad_id: gp.NORAD_CAT_ID,
        name: gp.OBJECT_NAME,
        type: classification.type,
        country: gp.COUNTRY_CODE || classification.country,
        position: { lat: pos.lat, lng: pos.lng, alt: pos.alt * 1000 },
        velocity: (gp.MEAN_MOTION * 2 * Math.PI * (6371 + pos.alt)) / 86400,
        orbit_type: getOrbitType(gp.MEAN_MOTION),
        tle_line1: gp.TLE_LINE1 || '',
        tle_line2: gp.TLE_LINE2 || '',
        launch_date: gp.EPOCH,
      };
    });

    return satellites;
  } catch {
    console.warn('Celestrak unavailable, returning empty array');
    return [];
  }
}

