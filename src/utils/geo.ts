// Geospatial utilities

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function bearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function randomPosition(
  latMin = -60, latMax = 70,
  lngMin = -180, lngMax = 180
): { lat: number; lng: number } {
  return {
    lat: latMin + Math.random() * (latMax - latMin),
    lng: lngMin + Math.random() * (lngMax - lngMin),
  };
}

export function jitterPosition(lat: number, lng: number, maxOffsetDeg = 0.5) {
  return {
    lat: lat + (Math.random() - 0.5) * maxOffsetDeg * 2,
    lng: lng + (Math.random() - 0.5) * maxOffsetDeg * 2,
  };
}

export function isInBounds(
  lat: number, lng: number,
  bounds: { north: number; south: number; east: number; west: number }
): boolean {
  return lat >= bounds.south && lat <= bounds.north &&
    lng >= bounds.west && lng <= bounds.east;
}

// Major cities for realistic data generation
export const MAJOR_CITIES: { name: string; lat: number; lng: number; country: string }[] = [
  { name: 'New York', lat: 40.7128, lng: -74.006, country: 'US' },
  { name: 'London', lat: 51.5074, lng: -0.1278, country: 'UK' },
  { name: 'Beijing', lat: 39.9042, lng: 116.4074, country: 'CN' },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173, country: 'RU' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, country: 'JP' },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, country: 'AE' },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, country: 'SG' },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, country: 'AU' },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777, country: 'IN' },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333, country: 'BR' },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357, country: 'EG' },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792, country: 'NG' },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784, country: 'TR' },
  { name: 'Shanghai', lat: 31.2304, lng: 121.4737, country: 'CN' },
  { name: 'Seoul', lat: 37.5665, lng: 126.978, country: 'KR' },
  { name: 'Berlin', lat: 52.52, lng: 13.405, country: 'DE' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, country: 'FR' },
  { name: 'Washington DC', lat: 38.9072, lng: -77.0369, country: 'US' },
  { name: 'Tehran', lat: 35.6892, lng: 51.389, country: 'IR' },
  { name: 'Taipei', lat: 25.033, lng: 121.5654, country: 'TW' },
];

export const MILITARY_HOTSPOTS: { name: string; lat: number; lng: number }[] = [
  { name: 'Taiwan Strait', lat: 24.5, lng: 119.5 },
  { name: 'South China Sea', lat: 14.5, lng: 114.0 },
  { name: 'Ukraine-Russia Border', lat: 50.0, lng: 36.0 },
  { name: 'Korean DMZ', lat: 38.0, lng: 127.0 },
  { name: 'Persian Gulf', lat: 26.0, lng: 52.0 },
  { name: 'Horn of Africa', lat: 11.0, lng: 49.0 },
  { name: 'Baltic Sea', lat: 57.0, lng: 20.0 },
  { name: 'Red Sea', lat: 20.0, lng: 38.0 },
  { name: 'Arctic Ocean', lat: 75.0, lng: 40.0 },
  { name: 'Black Sea', lat: 43.5, lng: 34.0 },
];

// Shipping lanes
export const SHIPPING_LANES: { from: { lat: number; lng: number }; to: { lat: number; lng: number }; name: string }[] = [
  { from: { lat: 31.2, lng: 121.5 }, to: { lat: 1.3, lng: 103.8 }, name: 'Shanghai-Singapore' },
  { from: { lat: 1.3, lng: 103.8 }, to: { lat: 25.0, lng: 55.3 }, name: 'Singapore-Dubai' },
  { from: { lat: 25.0, lng: 55.3 }, to: { lat: 31.2, lng: 32.3 }, name: 'Dubai-Suez' },
  { from: { lat: 51.5, lng: -0.1 }, to: { lat: 40.7, lng: -74.0 }, name: 'London-New York' },
  { from: { lat: 35.4, lng: 139.8 }, to: { lat: 34.1, lng: -118.2 }, name: 'Tokyo-LA' },
  { from: { lat: -33.9, lng: 18.4 }, to: { lat: -23.0, lng: -43.2 }, name: 'Cape Town-Rio' },
];
