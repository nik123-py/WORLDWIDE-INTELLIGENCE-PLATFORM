// Maritime vessel tracking — REAL-TIME free AIS data
// Uses Digitraffic Marine API (Finnish Transport Infrastructure Agency) — completely free, no registration
// Endpoint: https://meri.digitraffic.fi/api/vessel-location/v1/locations
// Also provides vessel metadata: https://meri.digitraffic.fi/api/vessel-location/v1/vessels

import { Vessel, GeoPosition } from '@/types';
import { SHIPPING_LANES, MILITARY_HOTSPOTS } from '@/utils/geo';
import { proxyFetch } from '@/utils/proxyFetch';

// ─── Digitraffic Marine API (Free, no key, real AIS data) ───
const DIGITRAFFIC_LOCATIONS = 'https://meri.digitraffic.fi/api/vessel-location/v1/locations';

interface DigitrafficVessel {
  mmsi: number;
  type: number;
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    mmsi: number;
    sog: number; // speed over ground (knots * 10)
    cog: number; // course over ground (degrees * 10)
    heading: number;
    navStat: number;
    name?: string;
    destination?: string;
    callSign?: string;
    shipType?: number;
    country?: string;
    timestampExternal: number;
  };
}

function classifyShipType(typeCode: number): Vessel['type'] {
  // AIS ship type codes: https://coast.noaa.gov/data/marinecadastre/ais/VesselTypeCodes2018.pdf
  if (typeCode >= 70 && typeCode <= 79) return 'cargo';
  if (typeCode >= 80 && typeCode <= 89) return 'tanker';
  if (typeCode >= 60 && typeCode <= 69) return 'passenger';
  if (typeCode >= 30 && typeCode <= 39) return 'fishing';
  if (typeCode >= 35 && typeCode <= 50) return 'military';
  return 'unknown';
}

async function fetchDigitrafficAIS(): Promise<Vessel[]> {
  try {
    const res = await proxyFetch(DIGITRAFFIC_LOCATIONS);
    if (!res.ok) return [];

    const data = await res.json();
    const features = data?.features || [];

    return features.slice(0, 300).map((f: DigitrafficVessel, i: number): Vessel => {
      const props = f.properties;
      const coords = f.geometry?.coordinates || [0, 0];

      return {
        mmsi: String(props.mmsi),
        name: props.name || `VESSEL-${props.mmsi}`,
        type: classifyShipType(props.shipType || f.type || 0),
        flag: props.country || 'FI',
        position: { lat: coords[1], lng: coords[0] },
        speed: (props.sog || 0) / 10,
        heading: (props.cog || 0) / 10,
        destination: props.destination || 'Unknown',
        ais_active: true,
        dark_ship: false,
        last_update: (props.timestampExternal || Date.now()) / 1000,
        trail: [],
      };
    });
  } catch (err) {
    console.warn('Digitraffic API error:', err);
    return [];
  }
}

export async function fetchMaritimeData(): Promise<Vessel[]> {
  // Fetch real AIS data from Digitraffic (free)
  const realAIS = await fetchDigitrafficAIS();

  return realAIS;
}
