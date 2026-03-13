// Natural language intelligence query engine
import { QueryFilters } from '@/types';
import { MILITARY_HOTSPOTS, MAJOR_CITIES } from '@/utils/geo';

interface ParsedQuery {
  filters: QueryFilters;
  description: string;
  matchedLayers: string[];
}

const REGION_MAP: Record<string, { lat: number; lng: number; radius: number }> = {};
MILITARY_HOTSPOTS.forEach(h => {
  REGION_MAP[h.name.toLowerCase()] = { lat: h.lat, lng: h.lng, radius: 500 };
});
MAJOR_CITIES.forEach(c => {
  REGION_MAP[c.name.toLowerCase()] = { lat: c.lat, lng: c.lng, radius: 200 };
});
// Additional region aliases
REGION_MAP['taiwan'] = { lat: 24.5, lng: 119.5, radius: 500 };
REGION_MAP['ukraine'] = { lat: 48.5, lng: 37.0, radius: 800 };
REGION_MAP['yemen'] = { lat: 15.5, lng: 48.0, radius: 600 };
REGION_MAP['iran'] = { lat: 32.0, lng: 53.0, radius: 800 };
REGION_MAP['north korea'] = { lat: 40.0, lng: 127.0, radius: 400 };
REGION_MAP['middle east'] = { lat: 29.0, lng: 47.0, radius: 2000 };
REGION_MAP['europe'] = { lat: 50.0, lng: 10.0, radius: 3000 };
REGION_MAP['africa'] = { lat: 5.0, lng: 20.0, radius: 4000 };
REGION_MAP['pacific'] = { lat: 10.0, lng: 170.0, radius: 5000 };
REGION_MAP['atlantic'] = { lat: 30.0, lng: -40.0, radius: 5000 };
REGION_MAP['arctic'] = { lat: 80.0, lng: 0.0, radius: 2000 };
REGION_MAP['mediterranean'] = { lat: 36.0, lng: 18.0, radius: 1500 };

export function parseQuery(query: string): ParsedQuery {
  const q = query.toLowerCase().trim();
  const filters: QueryFilters = {};
  const matchedLayers: string[] = [];

  // Entity type detection
  if (/aircraft|plane|flight|jet|aviation/.test(q)) {
    filters.entityTypes = [...(filters.entityTypes || []), 'aircraft'];
    matchedLayers.push('aircraft');
  }
  if (/military/.test(q)) {
    filters.keywords = [...(filters.keywords || []), 'military'];
  }
  if (/private|billionaire|vip|corporate/.test(q)) {
    filters.keywords = [...(filters.keywords || []), 'private'];
  }
  if (/ship|vessel|maritime|naval|tanker|cargo/.test(q)) {
    filters.entityTypes = [...(filters.entityTypes || []), 'vessel'];
    matchedLayers.push('maritime');
  }
  if (/dark ship|ais off|ais disabled|turned off ais/.test(q)) {
    filters.keywords = [...(filters.keywords || []), 'dark_ship'];
    matchedLayers.push('maritime');
  }
  if (/satellite|orbit|space/.test(q)) {
    filters.entityTypes = [...(filters.entityTypes || []), 'satellite'];
    matchedLayers.push('satellites');
  }
  if (/earthquake|wildfire|fire|protest|conflict|explosion|storm/.test(q)) {
    filters.entityTypes = [...(filters.entityTypes || []), 'event'];
    matchedLayers.push('events');
  }
  if (/cyber|attack|hack|botnet|ransomware|apt/.test(q)) {
    filters.entityTypes = [...(filters.entityTypes || []), 'cyber'];
    matchedLayers.push('cyber');
  }
  if (/nuclear|power plant|infrastructure|pipeline|base/.test(q)) {
    filters.entityTypes = [...(filters.entityTypes || []), 'infrastructure'];
    matchedLayers.push('infrastructure');
  }

  // Region detection
  for (const [regionName, regionData] of Object.entries(REGION_MAP)) {
    if (q.includes(regionName)) {
      filters.region = { center: { lat: regionData.lat, lng: regionData.lng }, radius_km: regionData.radius };
      break;
    }
  }

  // Time range detection
  if (/last\s+(\d+)\s+hours?/.test(q)) {
    const match = q.match(/last\s+(\d+)\s+hours?/);
    if (match) {
      const hours = parseInt(match[1]);
      filters.timeRange = { start: Date.now() - hours * 3600000, end: Date.now() };
    }
  } else if (/last\s+(\d+)\s+days?/.test(q)) {
    const match = q.match(/last\s+(\d+)\s+days?/);
    if (match) {
      const days = parseInt(match[1]);
      filters.timeRange = { start: Date.now() - days * 86400000, end: Date.now() };
    }
  } else if (/today/.test(q)) {
    filters.timeRange = { start: Date.now() - 86400000, end: Date.now() };
  }

  // Severity detection
  if (/critical|severe|emergency/.test(q)) {
    filters.severity = [5];
  } else if (/high\s+risk|high\s+severity/.test(q)) {
    filters.severity = [4, 5];
  }

  // If no specific layers matched, enable relevant ones
  if (matchedLayers.length === 0) {
    matchedLayers.push('aircraft', 'maritime', 'events');
  }

  return {
    filters,
    description: generateQueryDescription(filters),
    matchedLayers,
  };
}

function generateQueryDescription(filters: QueryFilters): string {
  const parts: string[] = [];
  if (filters.entityTypes?.length) parts.push(`Showing ${filters.entityTypes.join(', ')}`);
  if (filters.keywords?.length) parts.push(`filtered by: ${filters.keywords.join(', ')}`);
  if (filters.region) parts.push(`near ${filters.region.center.lat.toFixed(1)}, ${filters.region.center.lng.toFixed(1)}`);
  if (filters.timeRange) {
    const hours = Math.round((filters.timeRange.end - filters.timeRange.start) / 3600000);
    parts.push(`in the last ${hours} hours`);
  }
  return parts.join(' ') || 'Showing all intelligence data';
}

// Example queries for the UI
export const EXAMPLE_QUERIES = [
  'Show all military aircraft near Taiwan in the last 24 hours',
  'Show ships that turned off AIS near Yemen',
  'Show satellite passes over Ukraine today',
  'Show cyber attacks targeting Europe',
  'Show all critical events in the last 6 hours',
  'Show dark ships in the Persian Gulf',
  'Show military bases near the Mediterranean',
  'Show private jets near Moscow in the last 12 hours',
  'Show earthquakes in the Pacific today',
  'Show nuclear facilities worldwide',
];
