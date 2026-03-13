// Submarine Cable Monitoring — TeleGeography open dataset
// Source: GitHub-hosted GeoJSON from submarinecablemap.com
// Visualizes global undersea fiber optic cables on the globe
import { proxyFetch } from '@/utils/proxyFetch';

export interface CableFeature {
  id: string;
  name: string;
  color: string;
  coordinates: [number, number][][]; // MultiLineString
  length_km: string;
  owners: string;
  rfs: string; // Ready for service date
}

const CABLE_GEOJSON_URL = 'https://www.submarinecablemap.com/api/v3/cable/cable-geo.json';

let cachedCables: CableFeature[] = [];
let lastFetch = 0;

export async function fetchSubmarineCables(): Promise<CableFeature[]> {
  if (cachedCables.length > 0 && Date.now() - lastFetch < 3600000) return cachedCables; // 1h cache

  try {
    const res = await proxyFetch(CABLE_GEOJSON_URL);
    if (!res.ok) return cachedCables;

    const geojson = await res.json();
    if (!geojson?.features) return cachedCables;

    cachedCables = geojson.features
      .filter((f: any) => f.geometry?.type === 'MultiLineString')
      .map((f: any, i: number): CableFeature => ({
        id: f.properties?.id || `cable-${i}`,
        name: f.properties?.name || 'Unknown Cable',
        color: f.properties?.color || '#00bcd4',
        coordinates: f.geometry.coordinates,
        length_km: f.properties?.length || 'Unknown',
        owners: f.properties?.owners || 'Unknown',
        rfs: f.properties?.rfs || 'Unknown',
      }));

    lastFetch = Date.now();
    return cachedCables;
  } catch {
    return cachedCables;
  }
}
