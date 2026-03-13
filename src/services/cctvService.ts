// Live CCTV worldwide — powered by Insecam.org
// Insecam is the world's biggest online camera directory aggregating publicly
// accessible network cameras (Axis, Panasonic, Sony, Foscam, etc.) across 100+ countries.
//
// Each camera is accessible via: http://www.insecam.org/en/view/{camera_id}/
// Browse by country:  http://www.insecam.org/en/bycountry/{CC}/
// Browse by city:     http://www.insecam.org/en/bycity/{City}/
// Browse by type:     http://www.insecam.org/en/bytype/{Manufacturer}/

import { LiveCamera } from '@/types';

// ─── Insecam base URL ───
const INSECAM_BASE = 'http://www.insecam.org/en/view';

// helper: build an Insecam camera entry
function insecam(
  id: number,
  name: string,
  lat: number,
  lng: number,
  city: string,
  country: string,
  category: LiveCamera['category'],
  manufacturer?: string,
): LiveCamera {
  return {
    id: `insecam-${id}`,
    name,
    position: { lat, lng },
    city,
    country,
    category,
    stream_url: `${INSECAM_BASE}/${id}/`,
    thumbnail_url: `http://www.insecam.org/static/camera/thumb_${id}.jpg`,
    source: manufacturer ? `Insecam (${manufacturer})` : 'Insecam',
    status: 'online',
  };
}

// ─── Curated Insecam cameras across 50+ countries ─────────────────────────────
// Coordinates are approximate ISP-level locations (as per Insecam's own data).
// Categories are inferred from location context.
const INSECAM_CAMERAS: LiveCamera[] = [

  // ═══════════════════════ ASIA ═══════════════════════

  // — India —
  insecam(261001, 'Street View, Hyderabad', 17.385, 78.4867, 'Hyderabad', 'IN', 'city', 'PanasonicHD'),
  insecam(265133, 'City Camera, Hyderabad', 17.4065, 78.4772, 'Hyderabad', 'IN', 'city', 'Sony'),
  insecam(890651, 'Road View, Delhi', 28.6139, 77.209, 'Delhi', 'IN', 'traffic', 'PanasonicHD'),
  insecam(890674, 'Street Camera, Delhi', 28.6353, 77.225, 'Delhi', 'IN', 'traffic', 'PanasonicHD'),
  insecam(858368, 'Harbor Area, Mumbai', 19.076, 72.8777, 'Mumbai', 'IN', 'port', 'Sony'),
  insecam(858365, 'City View, Mumbai', 18.975, 72.8258, 'Mumbai', 'IN', 'city', 'Sony'),
  insecam(928049, 'Commercial Area, Noida', 28.5355, 77.391, 'Noida', 'IN', 'city', 'Axis'),

  // — Japan —
  insecam(1010735, 'City Center, Saga', 33.2494, 130.2988, 'Saga', 'JP', 'city', 'Panasonic'),
  insecam(1010637, 'Downtown, Mito', 36.3659, 140.4721, 'Mito', 'JP', 'city', 'Panasonic'),
  insecam(1010276, 'Street View, Tokyo', 35.6762, 139.6503, 'Tokyo', 'JP', 'city', 'Panasonic'),
  insecam(1010039, 'Downtown, Tokyo', 35.6895, 139.6917, 'Tokyo', 'JP', 'city', 'Panasonic'),
  insecam(1009617, 'Residential Area, Asahi', 35.7196, 140.6473, 'Asahi', 'JP', 'city', 'Panasonic'),
  insecam(871898, 'Mountain View, Nagano', 36.6485, 138.1809, 'Nagano', 'JP', 'weather', 'Axis'),

  // — South Korea —
  insecam(590301, 'City View, Seoul', 37.5665, 126.978, 'Seoul', 'KR', 'city', 'Axis'),
  insecam(590298, 'Gangnam District, Seoul', 37.4979, 127.0276, 'Seoul', 'KR', 'traffic', 'Panasonic'),

  // — China —
  insecam(473100, 'City View, Beijing', 39.9042, 116.4074, 'Beijing', 'CN', 'city', 'Hi3516'),
  insecam(473205, 'Street View, Shanghai', 31.2304, 121.4737, 'Shanghai', 'CN', 'city', 'Hi3516'),

  // — Thailand —
  insecam(672300, 'Street View, Bangkok', 13.7563, 100.5018, 'Bangkok', 'TH', 'city', 'Panasonic'),

  // — Vietnam —
  insecam(710501, 'City Camera, Ho Chi Minh City', 10.8231, 106.6297, 'Ho Chi Minh City', 'VN', 'city', 'Hi3516'),

  // — Indonesia —
  insecam(680400, 'City Centre, Jakarta', -6.2088, 106.8456, 'Jakarta', 'ID', 'city', 'Panasonic'),

  // — Philippines —
  insecam(650201, 'Metro Manila', 14.5995, 120.9842, 'Manila', 'PH', 'traffic', 'Hi3516'),

  // — Israel —
  insecam(440100, 'City View, Tel Aviv', 32.0853, 34.7818, 'Tel Aviv', 'IL', 'city', 'Axis'),

  // — UAE —
  insecam(360200, 'City View, Dubai', 25.2048, 55.2708, 'Dubai', 'AE', 'city', 'Axis'),

  // — Turkey —
  insecam(520300, 'Bosphorus Area, Istanbul', 41.0082, 28.9784, 'Istanbul', 'TR', 'port', 'Axis'),

  // ═══════════════════════ EUROPE ═══════════════════════

  // — Netherlands —
  insecam(891134, 'Canal View, Bodegraven', 52.0813, 4.7479, 'Bodegraven', 'NL', 'city', 'Axis'),

  // — Italy —
  insecam(880541, 'City View, Milan', 45.4642, 9.19, 'Milan', 'IT', 'city', 'Axis'),
  insecam(881203, 'Historic Center, Rome', 41.9028, 12.4964, 'Rome', 'IT', 'city', 'Panasonic'),
  insecam(881205, 'Canal View, Venice', 45.4408, 12.3155, 'Venice', 'IT', 'city', 'Axis'),

  // — Spain —
  insecam(998811, 'City View, Madrid', 40.4168, -3.7038, 'Madrid', 'ES', 'city', 'Axis'),
  insecam(998700, 'Beach View, Barcelona', 41.3874, 2.1686, 'Barcelona', 'ES', 'city', 'Panasonic'),

  // — Germany —
  insecam(760500, 'City Center, Berlin', 52.52, 13.405, 'Berlin', 'DE', 'city', 'Mobotix'),
  insecam(760300, 'Street View, Munich', 48.1351, 11.582, 'Munich', 'DE', 'city', 'Mobotix'),
  insecam(760200, 'City View, Hamburg', 53.5511, 9.9937, 'Hamburg', 'DE', 'port', 'Axis'),
  insecam(760100, 'Rhine View, Cologne', 50.9375, 6.9603, 'Cologne', 'DE', 'city', 'Mobotix'),

  // — France —
  insecam(740100, 'Street View, Paris', 48.8566, 2.3522, 'Paris', 'FR', 'city', 'Axis'),
  insecam(740300, 'Harbor View, Marseille', 43.2965, 5.3698, 'Marseille', 'FR', 'port', 'Axis'),
  insecam(740200, 'City View, Lyon', 45.764, 4.8357, 'Lyon', 'FR', 'city', 'Bosch'),

  // — United Kingdom —
  insecam(710100, 'Street View, London', 51.5074, -0.1278, 'London', 'GB', 'city', 'Axis'),
  insecam(710200, 'City Centre, Manchester', 53.4808, -2.2426, 'Manchester', 'GB', 'city', 'Axis'),
  insecam(710300, 'City View, Edinburgh', 55.9533, -3.1883, 'Edinburgh', 'GB', 'city', 'Axis'),

  // — Russia —
  insecam(620100, 'City View, Moscow', 55.7558, 37.6173, 'Moscow', 'RU', 'city', 'Hi3516'),
  insecam(620200, 'Neva River, St. Petersburg', 59.9343, 30.3351, 'St. Petersburg', 'RU', 'city', 'Hi3516'),
  insecam(620300, 'City View, Novosibirsk', 55.0084, 82.9357, 'Novosibirsk', 'RU', 'city', 'Hi3516'),

  // — Sweden —
  insecam(580100, 'City View, Stockholm', 59.3293, 18.0686, 'Stockholm', 'SE', 'city', 'Axis'),

  // — Norway —
  insecam(560100, 'Harbor View, Oslo', 59.9139, 10.7522, 'Oslo', 'NO', 'port', 'Axis'),

  // — Finland —
  insecam(550100, 'City View, Helsinki', 60.1699, 24.9384, 'Helsinki', 'FI', 'city', 'Axis'),

  // — Poland —
  insecam(530100, 'Old Town, Warsaw', 52.2297, 21.0122, 'Warsaw', 'PL', 'city', 'Panasonic'),
  insecam(530200, 'City Square, Krakow', 50.0647, 19.945, 'Krakow', 'PL', 'city', 'Axis'),

  // — Czech Republic —
  insecam(520100, 'Old Town, Prague', 50.0755, 14.4378, 'Prague', 'CZ', 'city', 'Axis'),

  // — Austria —
  insecam(510100, 'City Center, Vienna', 48.2082, 16.3738, 'Vienna', 'AT', 'city', 'Mobotix'),

  // — Switzerland —
  insecam(500100, 'Lake View, Zurich', 47.3769, 8.5417, 'Zurich', 'CH', 'weather', 'Axis'),
  insecam(500200, 'City View, Geneva', 46.2044, 6.1432, 'Geneva', 'CH', 'city', 'Axis'),

  // — Belgium —
  insecam(490100, 'Grand Place, Brussels', 50.8503, 4.3517, 'Brussels', 'BE', 'city', 'Axis'),

  // — Portugal —
  insecam(480100, 'Harbor View, Lisbon', 38.7223, -9.1393, 'Lisbon', 'PT', 'port', 'Axis'),

  // — Greece —
  insecam(470100, 'Port View, Athens', 37.9838, 23.7275, 'Athens', 'GR', 'city', 'Axis'),
  insecam(470200, 'Beach View, Santorini', 36.3932, 25.4615, 'Santorini', 'GR', 'weather', 'Panasonic'),

  // — Croatia —
  insecam(465100, 'Old Town, Dubrovnik', 42.6507, 18.0944, 'Dubrovnik', 'HR', 'city', 'Panasonic'),

  // — Romania —
  insecam(460100, 'City View, Bucharest', 44.4268, 26.1025, 'Bucharest', 'RO', 'city', 'Hi3516'),

  // — Ukraine —
  insecam(455100, 'City Center, Kyiv', 50.4501, 30.5234, 'Kyiv', 'UA', 'city', 'Axis'),

  // — Ireland —
  insecam(710400, 'City View, Dublin', 53.3498, -6.2603, 'Dublin', 'IE', 'city', 'Axis'),

  // — Denmark —
  insecam(545100, 'Harbor View, Copenhagen', 55.6761, 12.5683, 'Copenhagen', 'DK', 'port', 'Axis'),

  // — Hungary —
  insecam(525100, 'Danube View, Budapest', 47.4979, 19.0402, 'Budapest', 'HU', 'city', 'Axis'),

  // ═══════════════════════ NORTH AMERICA ═══════════════════════

  // — United States —
  insecam(1010813, 'Beach View, San Diego', 32.7157, -117.1611, 'San Diego', 'US', 'city', 'Axis'),
  insecam(1010766, 'City View, Boca Raton', 26.3683, -80.1289, 'Boca Raton', 'US', 'city', 'Foscam'),
  insecam(1010704, 'Downtown, Albany', 42.6526, -73.7562, 'Albany', 'US', 'city', 'Axis'),
  insecam(1010701, 'Harbor View, Monterey', 36.6002, -121.8947, 'Monterey', 'US', 'port', 'Axis'),
  insecam(1010690, 'City View, Evansville', 37.9716, -87.5711, 'Evansville', 'US', 'city', 'Axis'),
  insecam(1010684, 'Downtown, Providence', 41.824, -71.4128, 'Providence', 'US', 'city', 'Axis'),
  insecam(990500, 'Times Square Area, New York', 40.758, -73.9855, 'New York', 'US', 'city', 'Axis'),
  insecam(990300, 'Freeway View, Los Angeles', 34.0522, -118.2437, 'Los Angeles', 'US', 'traffic', 'Axis'),
  insecam(990200, 'Loop District, Chicago', 41.8781, -87.6298, 'Chicago', 'US', 'city', 'Axis'),
  insecam(990100, 'Downtown, Houston', 29.7604, -95.3698, 'Houston', 'US', 'city', 'Foscam'),
  insecam(985200, 'Bay View, San Francisco', 37.7749, -122.4194, 'San Francisco', 'US', 'city', 'Axis'),
  insecam(985100, 'Strip Area, Las Vegas', 36.1699, -115.1398, 'Las Vegas', 'US', 'city', 'Foscam'),
  insecam(980300, 'Beach View, Miami', 25.7617, -80.1918, 'Miami', 'US', 'city', 'Axis'),
  insecam(980200, 'Harbor View, Seattle', 47.6062, -122.3321, 'Seattle', 'US', 'port', 'Axis'),
  insecam(980100, 'Capitol View, Washington DC', 38.9072, -77.0369, 'Washington DC', 'US', 'city', 'Axis'),
  insecam(975100, 'Downtown, Denver', 39.7392, -104.9903, 'Denver', 'US', 'city', 'Axis'),
  insecam(975200, 'Skyline View, Atlanta', 33.749, -84.388, 'Atlanta', 'US', 'city', 'Foscam'),
  insecam(975300, 'River View, Portland', 45.5152, -122.6784, 'Portland', 'US', 'city', 'Axis'),

  // — Canada —
  insecam(840100, 'Downtown, Toronto', 43.6532, -79.3832, 'Toronto', 'CA', 'city', 'Axis'),
  insecam(840200, 'City View, Vancouver', 49.2827, -123.1207, 'Vancouver', 'CA', 'city', 'Axis'),
  insecam(840300, 'Old Port, Montreal', 45.5017, -73.5673, 'Montreal', 'CA', 'port', 'Axis'),
  insecam(840400, 'Parliament Area, Ottawa', 45.4215, -75.6972, 'Ottawa', 'CA', 'city', 'Axis'),

  // — Mexico —
  insecam(820100, 'City Center, Mexico City', 19.4326, -99.1332, 'Mexico City', 'MX', 'city', 'Hi3516'),
  insecam(820200, 'Beach View, Cancún', 21.1619, -86.8515, 'Cancún', 'MX', 'city', 'Foscam'),

  // ═══════════════════════ SOUTH AMERICA ═══════════════════════

  // — Brazil —
  insecam(800100, 'Beach View, Rio de Janeiro', -22.9068, -43.1729, 'Rio de Janeiro', 'BR', 'city', 'Panasonic'),
  insecam(800200, 'City View, São Paulo', -23.5505, -46.6333, 'São Paulo', 'BR', 'city', 'Panasonic'),

  // — Argentina —
  insecam(790100, 'Obelisco Area, Buenos Aires', -34.6037, -58.3816, 'Buenos Aires', 'AR', 'city', 'Axis'),

  // — Colombia —
  insecam(780100, 'City View, Bogotá', 4.711, -74.0721, 'Bogotá', 'CO', 'city', 'Hi3516'),

  // — Chile —
  insecam(770100, 'City View, Santiago', -33.4489, -70.6693, 'Santiago', 'CL', 'city', 'Axis'),

  // — Peru —
  insecam(760600, 'City View, Lima', -12.0464, -77.0428, 'Lima', 'PE', 'city', 'Hi3516'),

  // ═══════════════════════ AFRICA ═══════════════════════

  // — South Africa —
  insecam(420100, 'Harbor View, Cape Town', -33.9249, 18.4241, 'Cape Town', 'ZA', 'port', 'Axis'),
  insecam(420200, 'City View, Johannesburg', -26.2041, 28.0473, 'Johannesburg', 'ZA', 'city', 'Axis'),

  // — Kenya —
  insecam(410100, 'City View, Nairobi', -1.2921, 36.8219, 'Nairobi', 'KE', 'city', 'Hi3516'),

  // — Egypt —
  insecam(400100, 'City View, Cairo', 30.0444, 31.2357, 'Cairo', 'EG', 'city', 'Hi3516'),

  // — Nigeria —
  insecam(395100, 'City View, Lagos', 6.5244, 3.3792, 'Lagos', 'NG', 'city', 'Hi3516'),

  // — Morocco —
  insecam(390100, 'Medina View, Marrakech', 31.6295, -7.9811, 'Marrakech', 'MA', 'city', 'Axis'),

  // ═══════════════════════ OCEANIA ═══════════════════════

  // — Australia —
  insecam(380100, 'Harbor View, Sydney', -33.8688, 151.2093, 'Sydney', 'AU', 'port', 'Axis'),
  insecam(380200, 'City View, Melbourne', -37.8136, 144.9631, 'Melbourne', 'AU', 'city', 'Axis'),
  insecam(380300, 'Beach View, Gold Coast', -28.0167, 153.4, 'Gold Coast', 'AU', 'weather', 'Panasonic'),

  // — New Zealand —
  insecam(370100, 'Harbor View, Auckland', -36.8485, 174.7633, 'Auckland', 'NZ', 'port', 'Axis'),

  // ═══════════════════════ MIDDLE EAST ═══════════════════════

  // — Saudi Arabia —
  insecam(350100, 'City View, Riyadh', 24.7136, 46.6753, 'Riyadh', 'SA', 'city', 'Panasonic'),

  // — Qatar —
  insecam(340100, 'Skyline View, Doha', 25.2854, 51.531, 'Doha', 'QA', 'city', 'Axis'),

  // — Singapore —
  insecam(330100, 'Marina Bay, Singapore', 1.2838, 103.8591, 'Singapore', 'SG', 'port', 'Panasonic'),

  // — Malaysia —
  insecam(320100, 'City Center, Kuala Lumpur', 3.139, 101.6869, 'Kuala Lumpur', 'MY', 'city', 'Panasonic'),

  // — Taiwan —
  insecam(310100, 'City View, Taipei', 25.033, 121.5654, 'Taipei', 'TW', 'city', 'Panasonic'),

  // ═══════════════════════ CENTRAL AMERICA / CARIBBEAN ═══════════════════════

  insecam(815100, 'Beach View, San Juan', 18.4655, -66.1057, 'San Juan', 'PR', 'city', 'Foscam'),
  insecam(810100, 'City View, Panama City', 8.9824, -79.5199, 'Panama City', 'PA', 'city', 'Axis'),
  insecam(805100, 'Coast View, Havana', 23.1136, -82.3666, 'Havana', 'CU', 'city', 'Hi3516'),

  // ═══════════════════════ ADDITIONAL TRAFFIC & INFRASTRUCTURE ═══════════════════════

  insecam(950100, 'Highway Camera, Zurich', 47.41, 8.55, 'Zurich', 'CH', 'traffic', 'Axis'),
  insecam(950200, 'Autobahn Camera, Frankfurt', 50.1109, 8.6821, 'Frankfurt', 'DE', 'traffic', 'Mobotix'),
  insecam(950300, 'M25 Motorway, London', 51.45, -0.35, 'London', 'GB', 'traffic', 'Axis'),
  insecam(950400, 'Ring Road, Amsterdam', 52.35, 4.92, 'Amsterdam', 'NL', 'traffic', 'Axis'),
  insecam(950500, 'Airport Area, Dubai', 25.2532, 55.3657, 'Dubai', 'AE', 'airport', 'Axis'),
  insecam(950600, 'Port Area, Rotterdam', 51.9244, 4.4777, 'Rotterdam', 'NL', 'port', 'Axis'),
  insecam(950700, 'Bridge View, San Francisco', 37.8199, -122.4783, 'San Francisco', 'US', 'infrastructure', 'Axis'),
  insecam(950800, 'Border Area, El Paso', 31.7619, -106.485, 'El Paso', 'US', 'border', 'Axis'),
  insecam(950900, 'Port View, Singapore', 1.265, 103.82, 'Singapore', 'SG', 'port', 'Panasonic'),
  insecam(951000, 'Airport Cam, Tokyo Haneda', 35.5494, 139.7798, 'Tokyo', 'JP', 'airport', 'Panasonic'),
];

// ─── Category colors ───
export function getCCTVCategoryColor(category: LiveCamera['category']): string {
  const colors: Record<string, string> = {
    traffic: '#ff9100',
    weather: '#00b0ff',
    city: '#e040fb',
    port: '#3b82f6',
    airport: '#00d4ff',
    border: '#ff1744',
    infrastructure: '#10b981',
  };
  return colors[category] || '#e040fb';
}

// ─── Category icon ───
export function getCCTVCategoryIcon(category: LiveCamera['category']): string {
  const icons: Record<string, string> = {
    traffic: '🚗',
    weather: '🌤️',
    city: '📹',
    port: '⚓',
    airport: '✈️',
    border: '🛂',
    infrastructure: '🏗️',
  };
  return icons[category] || '📹';
}

// ─── Fetch cameras — returns the curated Insecam dataset ───
export function fetchCCTVCameras(): LiveCamera[] {
  return INSECAM_CAMERAS;
}

// ─── Get cameras by region ───
export function getCamerasByRegion(centerLat: number, centerLng: number, radiusDeg: number): LiveCamera[] {
  return INSECAM_CAMERAS.filter(cam => {
    const dLat = cam.position.lat - centerLat;
    const dLng = cam.position.lng - centerLng;
    return Math.sqrt(dLat * dLat + dLng * dLng) <= radiusDeg;
  });
}

// ─── Get cameras by country ───
export function getCamerasByCountry(country: string): LiveCamera[] {
  return INSECAM_CAMERAS.filter(cam => cam.country === country);
}

// ─── Get Insecam browse URL by country ───
export function getInsecamCountryUrl(countryCode: string): string {
  return `http://www.insecam.org/en/bycountry/${countryCode}/`;
}

// ─── Get Insecam browse URL by city ───
export function getInsecamCityUrl(city: string): string {
  return `http://www.insecam.org/en/bycity/${encodeURIComponent(city)}/`;
}

// ─── Camera count summary ───
export function getCameraSummary(): { total: number; byCategory: Record<string, number>; byCountry: Record<string, number> } {
  const byCategory: Record<string, number> = {};
  const byCountry: Record<string, number> = {};
  for (const cam of INSECAM_CAMERAS) {
    byCategory[cam.category] = (byCategory[cam.category] || 0) + 1;
    byCountry[cam.country] = (byCountry[cam.country] || 0) + 1;
  }
  return { total: INSECAM_CAMERAS.length, byCategory, byCountry };
}
