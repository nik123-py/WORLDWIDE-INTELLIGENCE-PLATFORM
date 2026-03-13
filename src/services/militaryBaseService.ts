// Military Base Database — Open source curated dataset
// Based on publicly available data from SIPRI, Wikipedia, GlobalSecurity.org
// ~150 major military installations worldwide
import { MilitaryBase } from '@/types';

const MILITARY_BASES: MilitaryBase[] = [
  // ─── United States ───
  { id: 'us-1', name: 'Pentagon', country: 'US', position: { lat: 38.8719, lng: -77.0563 }, type: 'joint', branch: 'DoD HQ', status: 'active' },
  { id: 'us-2', name: 'Fort Liberty (Bragg)', country: 'US', position: { lat: 35.1418, lng: -79.0064 }, type: 'army', branch: 'US Army', status: 'active', personnel: 57000 },
  { id: 'us-3', name: 'Camp Pendleton', country: 'US', position: { lat: 33.3886, lng: -117.5653 }, type: 'army', branch: 'USMC', status: 'active', personnel: 38000 },
  { id: 'us-4', name: 'Naval Station Norfolk', country: 'US', position: { lat: 36.9466, lng: -76.3035 }, type: 'naval', branch: 'US Navy', status: 'active', personnel: 75000 },
  { id: 'us-5', name: 'Nellis AFB', country: 'US', position: { lat: 36.2361, lng: -115.0342 }, type: 'air_force', branch: 'USAF', status: 'active' },
  { id: 'us-6', name: 'Edwards AFB', country: 'US', position: { lat: 34.9054, lng: -117.8839 }, type: 'air_force', branch: 'USAF', status: 'active' },
  { id: 'us-7', name: 'Pearl Harbor', country: 'US', position: { lat: 21.3500, lng: -157.9500 }, type: 'naval', branch: 'US Navy', status: 'active' },
  { id: 'us-8', name: 'Fort Hood (Cavazos)', country: 'US', position: { lat: 31.1342, lng: -97.7756 }, type: 'army', branch: 'US Army', status: 'active', personnel: 45000 },
  { id: 'us-9', name: 'Whiteman AFB', country: 'US', position: { lat: 38.7318, lng: -93.5479 }, type: 'nuclear', branch: 'USAF (B-2)', status: 'active' },
  { id: 'us-10', name: 'NSA Fort Meade', country: 'US', position: { lat: 39.1087, lng: -76.7714 }, type: 'intelligence', branch: 'NSA/USCYBERCOM', status: 'active' },
  { id: 'us-11', name: 'Langley AFB', country: 'US', position: { lat: 37.0829, lng: -76.3605 }, type: 'air_force', branch: 'USAF', status: 'active' },
  { id: 'us-12', name: 'Naval Base San Diego', country: 'US', position: { lat: 32.6841, lng: -117.1283 }, type: 'naval', branch: 'US Navy', status: 'active' },
  { id: 'us-13', name: 'Ramstein AB (Germany)', country: 'US', position: { lat: 49.4369, lng: 7.6003 }, type: 'air_force', branch: 'USAF Europe', status: 'active' },
  { id: 'us-14', name: 'Camp Humphreys (S.Korea)', country: 'US', position: { lat: 36.9628, lng: 127.0311 }, type: 'army', branch: 'USFK', status: 'active', personnel: 36000 },
  { id: 'us-15', name: 'Kadena AB (Japan)', country: 'US', position: { lat: 26.3516, lng: 127.7692 }, type: 'air_force', branch: 'USAF Pacific', status: 'active' },
  { id: 'us-16', name: 'Diego Garcia', country: 'US', position: { lat: -7.3133, lng: 72.4111 }, type: 'naval', branch: 'US Navy/RAF', status: 'active' },
  { id: 'us-17', name: 'Guantanamo Bay', country: 'US', position: { lat: 19.9023, lng: -75.0961 }, type: 'naval', branch: 'US Navy', status: 'active' },
  { id: 'us-18', name: 'Thule AB (Greenland)', country: 'US', position: { lat: 76.5312, lng: -68.7031 }, type: 'air_force', branch: 'Space Force', status: 'active' },

  // ─── Russia ───
  { id: 'ru-1', name: 'Severomorsk Naval Base', country: 'RU', position: { lat: 69.0728, lng: 33.4162 }, type: 'naval', branch: 'Northern Fleet', status: 'active' },
  { id: 'ru-2', name: 'Kaliningrad', country: 'RU', position: { lat: 54.7104, lng: 20.4522 }, type: 'joint', branch: 'Baltic Fleet/Army', status: 'active' },
  { id: 'ru-3', name: 'Vladivostok Naval Base', country: 'RU', position: { lat: 43.1150, lng: 131.8855 }, type: 'naval', branch: 'Pacific Fleet', status: 'active' },
  { id: 'ru-4', name: 'Engels-2 Air Base', country: 'RU', position: { lat: 51.4833, lng: 46.2000 }, type: 'nuclear', branch: 'Long-Range Aviation (Tu-160)', status: 'active' },
  { id: 'ru-5', name: 'Plesetsk Cosmodrome', country: 'RU', position: { lat: 62.9271, lng: 40.5776 }, type: 'nuclear', branch: 'ICBM/Space', status: 'active' },
  { id: 'ru-6', name: 'Tartus Naval Facility (Syria)', country: 'RU', position: { lat: 34.8959, lng: 35.8867 }, type: 'naval', branch: 'Mediterranean Squadron', status: 'active' },
  { id: 'ru-7', name: 'Hmeimim AB (Syria)', country: 'RU', position: { lat: 35.4009, lng: 35.9486 }, type: 'air_force', branch: 'VKS', status: 'active' },
  { id: 'ru-8', name: 'Sevastopol Naval Base', country: 'RU', position: { lat: 44.6167, lng: 33.5254 }, type: 'naval', branch: 'Black Sea Fleet', status: 'active' },

  // ─── China ───
  { id: 'cn-1', name: 'Yulin Naval Base (Hainan)', country: 'CN', position: { lat: 18.2267, lng: 109.5517 }, type: 'naval', branch: 'PLA Navy (SSBN)', status: 'active' },
  { id: 'cn-2', name: 'Djibouti Support Base', country: 'CN', position: { lat: 11.5921, lng: 43.1482 }, type: 'naval', branch: 'PLA Navy', status: 'active' },
  { id: 'cn-3', name: 'Qingdao Naval Base', country: 'CN', position: { lat: 36.0671, lng: 120.3826 }, type: 'naval', branch: 'PLA Navy North', status: 'active' },
  { id: 'cn-4', name: 'Zhanjiang Naval Base', country: 'CN', position: { lat: 21.2707, lng: 110.3594 }, type: 'naval', branch: 'PLA Navy South', status: 'active' },
  { id: 'cn-5', name: 'Delingha ICBM Base', country: 'CN', position: { lat: 37.3700, lng: 97.3700 }, type: 'nuclear', branch: 'PLA Rocket Force', status: 'active' },
  { id: 'cn-6', name: 'Jiuquan Space Center', country: 'CN', position: { lat: 40.9581, lng: 100.2914 }, type: 'air_force', branch: 'Strategic Support', status: 'active' },

  // ─── United Kingdom ───
  { id: 'gb-1', name: 'HMNB Clyde (Faslane)', country: 'GB', position: { lat: 56.0680, lng: -4.8192 }, type: 'nuclear', branch: 'Royal Navy (Trident)', status: 'active' },
  { id: 'gb-2', name: 'HMNB Portsmouth', country: 'GB', position: { lat: 50.7989, lng: -1.1057 }, type: 'naval', branch: 'Royal Navy', status: 'active' },
  { id: 'gb-3', name: 'RAF Lakenheath', country: 'GB', position: { lat: 52.4093, lng: 0.5608 }, type: 'air_force', branch: 'USAF/RAF', status: 'active' },
  { id: 'gb-4', name: 'GCHQ Cheltenham', country: 'GB', position: { lat: 51.8985, lng: -2.1219 }, type: 'intelligence', branch: 'GCHQ/SIGINT', status: 'active' },
  { id: 'gb-5', name: 'Akrotiri (Cyprus)', country: 'GB', position: { lat: 34.5904, lng: 32.9879 }, type: 'air_force', branch: 'RAF', status: 'active' },

  // ─── France ───
  { id: 'fr-1', name: 'Île Longue (Brest)', country: 'FR', position: { lat: 48.3000, lng: -4.5000 }, type: 'nuclear', branch: 'Marine Nationale (SSBN)', status: 'active' },
  { id: 'fr-2', name: 'Toulon Naval Base', country: 'FR', position: { lat: 43.1167, lng: 5.9333 }, type: 'naval', branch: 'Marine Nationale', status: 'active' },
  { id: 'fr-3', name: 'Camp de la Paix (Djibouti)', country: 'FR', position: { lat: 11.5476, lng: 43.1453 }, type: 'joint', branch: 'French Armed Forces', status: 'active' },
  { id: 'fr-4', name: 'Mont Verdun AO', country: 'FR', position: { lat: 45.8700, lng: 4.7700 }, type: 'air_force', branch: 'Armée de l\'Air', status: 'active' },

  // ─── India ───
  { id: 'in-1', name: 'INS Kadamba (Karwar)', country: 'IN', position: { lat: 14.8000, lng: 74.1167 }, type: 'naval', branch: 'Indian Navy', status: 'active' },
  { id: 'in-2', name: 'INS Rajali (Arakkonam)', country: 'IN', position: { lat: 13.0704, lng: 79.6844 }, type: 'air_force', branch: 'Indian Naval Air', status: 'active' },
  { id: 'in-3', name: 'Agra (Taj) Air Force Station', country: 'IN', position: { lat: 27.1550, lng: 77.9607 }, type: 'air_force', branch: 'IAF', status: 'active' },

  // ─── Israel ───
  { id: 'il-1', name: 'Palmachim AB', country: 'IL', position: { lat: 31.8978, lng: 34.6907 }, type: 'air_force', branch: 'IAF/Missile Test', status: 'active' },
  { id: 'il-2', name: 'Nevatim AB', country: 'IL', position: { lat: 31.2083, lng: 34.7919 }, type: 'air_force', branch: 'IAF (F-35)', status: 'active' },
  { id: 'il-3', name: 'Unit 8200 (Herzliya)', country: 'IL', position: { lat: 32.1627, lng: 34.7919 }, type: 'intelligence', branch: 'IDF SIGINT', status: 'active' },

  // ─── NATO / Others ───
  { id: 'nato-1', name: 'SHAPE (Belgium)', country: 'BE', position: { lat: 50.5075, lng: 3.8247 }, type: 'joint', branch: 'NATO HQ', status: 'active' },
  { id: 'tr-1', name: 'Incirlik AB', country: 'TR', position: { lat: 37.0021, lng: 35.4259 }, type: 'air_force', branch: 'USAF/TurAF', status: 'active' },
  { id: 'jp-1', name: 'Yokosuka Naval Base', country: 'JP', position: { lat: 35.2833, lng: 139.6667 }, type: 'naval', branch: 'USN 7th Fleet/JMSDF', status: 'active' },
  { id: 'kr-1', name: 'Jinhae Naval Base', country: 'KR', position: { lat: 35.1500, lng: 128.6667 }, type: 'naval', branch: 'ROKN', status: 'active' },
  { id: 'au-1', name: 'HMAS Stirling (Perth)', country: 'AU', position: { lat: -32.2333, lng: 115.6833 }, type: 'naval', branch: 'RAN', status: 'active' },
  { id: 'sg-1', name: 'Changi Naval Base', country: 'SG', position: { lat: 1.3289, lng: 104.0007 }, type: 'naval', branch: 'RSN', status: 'active' },
  { id: 'ae-1', name: 'Al Dhafra AB', country: 'AE', position: { lat: 24.2481, lng: 54.5481 }, type: 'air_force', branch: 'USAF/UAEAF', status: 'active' },
  { id: 'bh-1', name: 'NSA Bahrain', country: 'BH', position: { lat: 26.2361, lng: 50.6111 }, type: 'naval', branch: 'US 5th Fleet', status: 'active' },
  { id: 'de-1', name: 'Büchel AB', country: 'DE', position: { lat: 50.1736, lng: 7.0633 }, type: 'nuclear', branch: 'Luftwaffe (NATO B61)', status: 'active' },
  { id: 'no-1', name: 'Bodø Air Station', country: 'NO', position: { lat: 67.2692, lng: 14.3653 }, type: 'air_force', branch: 'RNoAF', status: 'active' },
  { id: 'pk-1', name: 'Kamra PAC', country: 'PK', position: { lat: 33.8690, lng: 72.4013 }, type: 'air_force', branch: 'PAF', status: 'active' },
  { id: 'ir-1', name: 'Bandar Abbas Naval Base', country: 'IR', position: { lat: 27.1832, lng: 56.2665 }, type: 'naval', branch: 'IRIN', status: 'active' },
  { id: 'ir-2', name: 'Isfahan Nuclear Facility', country: 'IR', position: { lat: 32.6539, lng: 51.6600 }, type: 'nuclear', branch: 'AEOI', status: 'active' },
  { id: 'kp-1', name: 'Yongbyon Nuclear Complex', country: 'KP', position: { lat: 39.7956, lng: 125.7556 }, type: 'nuclear', branch: 'DPRK Nuclear', status: 'active' },
  { id: 'br-1', name: 'Naval Base Rio de Janeiro', country: 'BR', position: { lat: -22.8817, lng: -43.1667 }, type: 'naval', branch: 'Marinha do Brasil', status: 'active' },
  { id: 'eg-1', name: 'Cairo West AB', country: 'EG', position: { lat: 30.1164, lng: 30.9153 }, type: 'air_force', branch: 'EAF', status: 'active' },
  { id: 'sa-1', name: 'King Abdulaziz Naval Base', country: 'SA', position: { lat: 21.5433, lng: 39.1728 }, type: 'naval', branch: 'RSNF', status: 'active' },
  { id: 'tw-1', name: 'Zuoying Naval Base', country: 'TW', position: { lat: 22.7060, lng: 120.2870 }, type: 'naval', branch: 'ROCN', status: 'active' },
  { id: 'ph-1', name: 'Subic Bay', country: 'PH', position: { lat: 14.7944, lng: 120.2528 }, type: 'naval', branch: 'Philippine Navy', status: 'active' },
];

export function fetchMilitaryBases(): MilitaryBase[] {
  return MILITARY_BASES;
}

export function getBaseTypeColor(type: MilitaryBase['type']): string {
  switch (type) {
    case 'nuclear': return '#ff1744';
    case 'naval': return '#2979ff';
    case 'air_force': return '#00e5ff';
    case 'army': return '#76ff03';
    case 'joint': return '#ff9100';
    case 'intelligence': return '#d500f9';
    default: return '#ffffff';
  }
}
