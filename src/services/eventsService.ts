// Global events service — ALL FREE APIs, no keys needed
// Sources:
//   1. USGS Earthquake Feed (free)
//   2. NASA EONET — wildfires, storms, volcanoes, floods (free)
//   3. GDELT v2 — conflicts, protests, explosions (free)
//   4. Uppsala UCDP — armed conflict events (free, no key)

import { GlobalEvent } from '@/types';
import { proxyFetch } from '@/utils/proxyFetch';

const USGS_API = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson';
const NASA_EONET_API = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50';
const GDELT_EVENTS_API = 'https://api.gdeltproject.org/api/v2/doc/doc';
const UCDP_API = 'https://ucdpapi.pcr.uu.se/api/gedevents/24.1?pagesize=50&page=0';

export async function fetchEventsData(): Promise<GlobalEvent[]> {
  const allEvents = await Promise.all([
    fetchEarthquakes(),
    fetchNASANaturalEvents(),
    fetchGDELTEvents(),
    fetchUCDPConflicts(),
  ]);

  return allEvents.flat().sort((a, b) => b.timestamp - a.timestamp);
}

// ─── 1. USGS Real-time Earthquakes (free) ───
async function fetchEarthquakes(): Promise<GlobalEvent[]> {
  try {
    const res = await proxyFetch(USGS_API);
    if (!res.ok) return [];
    const data = await res.json();
    const quakes = data.features?.slice(0, 50) || [];

    return quakes.map((q: {
      id: string;
      properties: { title: string; mag: number; time: number; url: string; place: string; tsunami: number; alert: string };
      geometry: { coordinates: number[] };
    }): GlobalEvent => ({
      id: `eq-${q.id}`,
      type: 'earthquake',
      title: q.properties.title,
      description: `Magnitude ${q.properties.mag} earthquake at ${q.properties.place || 'Unknown'}. Tsunami alert: ${q.properties.tsunami ? 'YES' : 'No'}`,
      position: { lat: q.geometry.coordinates[1], lng: q.geometry.coordinates[0], alt: q.geometry.coordinates[2] },
      severity: Math.min(5, Math.max(1, Math.round(q.properties.mag - 3))) as 1|2|3|4|5,
      timestamp: q.properties.time,
      source: 'USGS',
      source_url: q.properties.url,
      metadata: { magnitude: q.properties.mag, depth_km: q.geometry.coordinates[2], tsunami: q.properties.tsunami },
    }));
  } catch {
    console.warn('USGS API unavailable');
    return [];
  }
}

// ─── 2. NASA EONET — wildfires, storms, volcanoes (free, no key) ───
async function fetchNASANaturalEvents(): Promise<GlobalEvent[]> {
  try {
    const res = await proxyFetch(NASA_EONET_API);
    if (!res.ok) return [];
    const data = await res.json();
    const events = data.events || [];

    return events
      .filter((e: { geometries: { coordinates: number[] }[] }) =>
        e.geometries && e.geometries.length > 0 && e.geometries[0].coordinates
      )
      .map((e: {
        id: string; title: string; description: string | null;
        categories: { id: string; title: string }[];
        sources: { id: string; url: string }[];
        geometries: { date: string; type: string; coordinates: number[] }[];
      }): GlobalEvent => {
        const geo = e.geometries[e.geometries.length - 1];
        const catId = e.categories?.[0]?.id || '';
        let eventType: GlobalEvent['type'] = 'wildfire';
        let severity: 1|2|3|4|5 = 3;

        if (catId === 'wildfires' || catId === '8') { eventType = 'wildfire'; severity = 4; }
        else if (catId === 'severeStorms' || catId === '10') { eventType = 'storm'; severity = 4; }
        else if (catId === 'volcanoes' || catId === '12') { eventType = 'explosion'; severity = 5; }
        else if (catId === 'floods' || catId === '9') { eventType = 'flood'; severity = 3; }
        else if (catId === 'earthquakes' || catId === '16') { eventType = 'earthquake'; severity = 4; }

        const coords = geo.type === 'Point' ? geo.coordinates :
          (Array.isArray(geo.coordinates[0]) ? geo.coordinates[0] : geo.coordinates);

        return {
          id: `eonet-${e.id}`,
          type: eventType,
          title: e.title,
          description: e.description || `Active ${e.categories?.[0]?.title || 'natural'} event tracked by NASA EONET`,
          position: { lat: typeof coords[1] === 'number' ? coords[1] : 0, lng: typeof coords[0] === 'number' ? coords[0] : 0 },
          severity,
          timestamp: new Date(geo.date).getTime(),
          source: 'NASA EONET',
          source_url: e.sources?.[0]?.url || 'https://eonet.gsfc.nasa.gov',
        };
      });
  } catch {
    console.warn('NASA EONET API unavailable');
    return [];
  }
}

// ─── 3. GDELT v2 — conflicts, protests, explosions (free, no key) ───
async function fetchGDELTEvents(): Promise<GlobalEvent[]> {
  const queries = [
    { query: 'conflict OR battle OR military attack', type: 'conflict' as const },
    { query: 'protest OR demonstration OR riot', type: 'protest' as const },
    { query: 'explosion OR bombing OR airstrike', type: 'explosion' as const },
  ];

  const allEvents: GlobalEvent[] = [];

  for (const q of queries) {
    try {
      const url = `${GDELT_EVENTS_API}?query=${encodeURIComponent(q.query)}&mode=ArtList&format=json&maxrecords=10&timespan=24h&sort=DateDesc`;
      const res = await proxyFetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const articles = data.articles || [];

      articles.forEach((article: {
        url: string; title: string; seendate: string;
        domain: string; sourcecountry: string; tone: number;
      }, i: number) => {
        const countryCoords = getCountryCoords(article.sourcecountry);
        if (!countryCoords) return;

        const severity = article.tone < -5 ? 5 : article.tone < -2 ? 4 : article.tone < 0 ? 3 : 2;

        allEvents.push({
          id: `gdelt-${q.type}-${i}-${Date.now()}`,
          type: q.type,
          title: article.title?.slice(0, 120) || 'GDELT Event',
          description: `Source: ${article.domain || 'Unknown'}. Tone: ${article.tone?.toFixed(1) || 'N/A'}`,
          position: {
            lat: countryCoords.lat + (Math.random() - 0.5) * 2,
            lng: countryCoords.lng + (Math.random() - 0.5) * 2,
          },
          severity: severity as 1|2|3|4|5,
          timestamp: article.seendate ? new Date(
            article.seendate.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z')
          ).getTime() : Date.now(),
          source: 'GDELT',
          source_url: article.url,
        });
      });
    } catch { /* continue */ }
  }

  return allEvents;
}

// ─── 4. Uppsala UCDP — armed conflict events (free, no key) ───
async function fetchUCDPConflicts(): Promise<GlobalEvent[]> {
  try {
    const res = await proxyFetch(UCDP_API);
    if (!res.ok) return [];
    const data = await res.json();
    const events = data.Result || [];

    return events.slice(0, 30).map((e: {
      id: number;
      relid: string;
      country: string;
      region: string;
      latitude: number;
      longitude: number;
      date_start: string;
      date_end: string;
      deaths_a: number;
      deaths_b: number;
      deaths_civilians: number;
      deaths_unknown: number;
      best: number; // best estimate of total deaths
      source_article: string;
      source_headline: string;
      dyad_name: string;
      type_of_violence: number;
      conflict_name: string;
    }, i: number): GlobalEvent => {
      const totalDeaths = e.best || (e.deaths_a + e.deaths_b + e.deaths_civilians + e.deaths_unknown);
      const severity = totalDeaths > 50 ? 5 : totalDeaths > 10 ? 4 : totalDeaths > 1 ? 3 : 2;

      return {
        id: `ucdp-${e.id || i}`,
        type: 'conflict',
        title: e.source_headline || `Armed conflict: ${e.conflict_name || e.dyad_name || e.country}`,
        description: `${e.dyad_name || 'Armed conflict'} in ${e.country}. Casualties: ${totalDeaths}. Region: ${e.region}`,
        position: { lat: e.latitude, lng: e.longitude },
        severity: severity as 1|2|3|4|5,
        timestamp: new Date(e.date_start || e.date_end).getTime(),
        source: 'Uppsala UCDP',
        source_url: e.source_article || 'https://ucdp.uu.se',
        metadata: {
          deaths_total: totalDeaths,
          deaths_civilians: e.deaths_civilians,
          conflict_name: e.conflict_name,
          violence_type: e.type_of_violence,
        },
      };
    });
  } catch {
    console.warn('UCDP API unavailable');
    return [];
  }
}

function getCountryCoords(country: string): { lat: number; lng: number } | null {
  const map: Record<string, { lat: number; lng: number }> = {
    'United States': { lat: 39.8, lng: -98.6 }, 'United Kingdom': { lat: 51.5, lng: -0.1 },
    'China': { lat: 35.9, lng: 104.2 }, 'Russia': { lat: 55.8, lng: 37.6 },
    'Ukraine': { lat: 48.4, lng: 31.2 }, 'India': { lat: 20.6, lng: 78.9 },
    'France': { lat: 46.6, lng: 1.9 }, 'Germany': { lat: 51.2, lng: 10.4 },
    'Japan': { lat: 36.2, lng: 138.3 }, 'Brazil': { lat: -14.2, lng: -51.9 },
    'Australia': { lat: -25.3, lng: 133.8 }, 'Israel': { lat: 31.0, lng: 34.9 },
    'Iran': { lat: 32.4, lng: 53.7 }, 'Turkey': { lat: 39.9, lng: 32.9 },
    'Pakistan': { lat: 30.4, lng: 69.3 }, 'Nigeria': { lat: 9.1, lng: 8.7 },
    'Egypt': { lat: 26.8, lng: 30.8 }, 'South Korea': { lat: 35.9, lng: 127.8 },
    'North Korea': { lat: 40.3, lng: 127.5 }, 'Taiwan': { lat: 23.7, lng: 121.0 },
    'Syria': { lat: 35.0, lng: 38.5 }, 'Iraq': { lat: 33.2, lng: 43.7 },
    'Yemen': { lat: 15.6, lng: 48.5 }, 'Sudan': { lat: 12.9, lng: 30.2 },
    'Myanmar': { lat: 21.9, lng: 96.0 }, 'Mexico': { lat: 23.6, lng: -102.6 },
    'Colombia': { lat: 4.6, lng: -74.3 }, 'Canada': { lat: 56.1, lng: -106.3 },
    'Italy': { lat: 41.9, lng: 12.6 }, 'Spain': { lat: 40.5, lng: -3.7 },
    'Saudi Arabia': { lat: 23.9, lng: 45.1 }, 'South Africa': { lat: -30.6, lng: 22.9 },
    'Indonesia': { lat: -0.8, lng: 113.9 }, 'Philippines': { lat: 12.9, lng: 121.8 },
    'Poland': { lat: 52.0, lng: 19.1 }, 'Afghanistan': { lat: 33.9, lng: 67.7 },
    'Somalia': { lat: 5.2, lng: 46.2 }, 'Libya': { lat: 26.3, lng: 17.2 },
    'Ethiopia': { lat: 9.1, lng: 40.5 }, 'DR Congo': { lat: -4.0, lng: 21.8 },
    'Mali': { lat: 17.6, lng: -4.0 },
  };
  return map[country] || null;
}
