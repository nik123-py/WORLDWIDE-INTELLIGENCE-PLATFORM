// Internet Outage Monitoring — Cloudflare Radar + IODA
// Sources:
// 1. Cloudflare Radar Outage Center (CROC) — requires API token
// 2. IODA (Internet Outage Detection & Analysis) — free, no key
//
// Since Cloudflare requires a token, we use IODA as primary free source
// and supplement with curated recent outage data from public reports
import { InternetOutage } from '@/types';
import { proxyFetch } from '@/utils/proxyFetch';

// Country centers for mapping outages to positions
const COUNTRY_CENTERS: Record<string, { lat: number; lng: number; name: string }> = {
  'AF': { lat: 33.9, lng: 67.7, name: 'Afghanistan' },
  'BD': { lat: 23.7, lng: 90.4, name: 'Bangladesh' },
  'BY': { lat: 53.9, lng: 27.6, name: 'Belarus' },
  'CD': { lat: -4.0, lng: 21.8, name: 'DR Congo' },
  'CF': { lat: 6.6, lng: 20.9, name: 'Central African Republic' },
  'CN': { lat: 35.9, lng: 104.2, name: 'China' },
  'CU': { lat: 21.5, lng: -79.0, name: 'Cuba' },
  'EG': { lat: 26.8, lng: 30.8, name: 'Egypt' },
  'ET': { lat: 9.1, lng: 40.5, name: 'Ethiopia' },
  'IQ': { lat: 33.2, lng: 43.7, name: 'Iraq' },
  'IR': { lat: 32.4, lng: 53.7, name: 'Iran' },
  'KP': { lat: 40.3, lng: 127.5, name: 'North Korea' },
  'KZ': { lat: 48.0, lng: 68.0, name: 'Kazakhstan' },
  'LY': { lat: 26.3, lng: 17.2, name: 'Libya' },
  'MM': { lat: 21.9, lng: 96.0, name: 'Myanmar' },
  'NG': { lat: 9.1, lng: 8.7, name: 'Nigeria' },
  'PK': { lat: 30.4, lng: 69.3, name: 'Pakistan' },
  'PS': { lat: 31.9, lng: 35.2, name: 'Palestine' },
  'RU': { lat: 55.8, lng: 37.6, name: 'Russia' },
  'SD': { lat: 12.9, lng: 30.2, name: 'Sudan' },
  'SN': { lat: 14.5, lng: -14.5, name: 'Senegal' },
  'SO': { lat: 5.2, lng: 46.2, name: 'Somalia' },
  'SY': { lat: 35.0, lng: 38.5, name: 'Syria' },
  'TD': { lat: 15.5, lng: 18.7, name: 'Chad' },
  'TJ': { lat: 38.9, lng: 71.3, name: 'Tajikistan' },
  'TM': { lat: 39.0, lng: 59.6, name: 'Turkmenistan' },
  'UA': { lat: 48.4, lng: 31.2, name: 'Ukraine' },
  'UZ': { lat: 41.3, lng: 64.6, name: 'Uzbekistan' },
  'VE': { lat: 6.4, lng: -66.6, name: 'Venezuela' },
  'YE': { lat: 15.6, lng: 48.5, name: 'Yemen' },
  'ZW': { lat: -19.0, lng: 29.2, name: 'Zimbabwe' },
};

// IODA API — Georgia Tech's Internet Outage Detection & Analysis
// Free, no key needed, tracks BGP/active probing/darknet signals
const IODA_API = 'https://api.ioda.inetintel.cc.gatech.edu/v2';

async function fetchIODAOutages(): Promise<InternetOutage[]> {
  try {
    // Fetch recent alerts (last 24h)
    const now = Math.floor(Date.now() / 1000);
    const dayAgo = now - 86400;
    const url = `${IODA_API}/alerts/country?from=${dayAgo}&until=${now}&limit=50`;
    const res = await proxyFetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    
    if (!data?.data) return [];
    
    return data.data
      .filter((alert: any) => alert.entity?.code && COUNTRY_CENTERS[alert.entity.code])
      .map((alert: any, i: number): InternetOutage => {
        const cc = alert.entity.code;
        const country = COUNTRY_CENTERS[cc];
        return {
          id: `ioda-${cc}-${i}`,
          country: country?.name || alert.entity.name || cc,
          countryCode: cc,
          position: country ? { lat: country.lat, lng: country.lng } : { lat: 0, lng: 0 },
          startDate: new Date(alert.time * 1000).toISOString(),
          endDate: alert.until ? new Date(alert.until * 1000).toISOString() : undefined,
          scope: alert.level === 'country' ? 'national' : 'regional',
          cause: alert.datasource || 'BGP/Active Probing anomaly',
          active: !alert.until || alert.until > now,
        };
      });
  } catch {
    return [];
  }
}

let cachedOutages: InternetOutage[] = [];
let lastFetch = 0;

export async function fetchInternetOutages(): Promise<InternetOutage[]> {
  if (cachedOutages.length > 0 && Date.now() - lastFetch < 300000) return cachedOutages; // 5min cache
  
  const outages = await fetchIODAOutages();
  
  if (outages.length > 0) {
    cachedOutages = outages;
    lastFetch = Date.now();
  }
  return cachedOutages;
}
