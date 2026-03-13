// ============================================================
// PALANTIR GLOBAL INTELLIGENCE PLATFORM — TYPE DEFINITIONS
// ============================================================

export interface GeoPosition {
  lat: number;
  lng: number;
  alt?: number; // meters
}

// --- Aircraft ---
export interface Aircraft {
  icao24: string;
  callsign: string;
  origin_country: string;
  position: GeoPosition;
  velocity: number; // m/s
  heading: number; // degrees
  vertical_rate: number;
  on_ground: boolean;
  squawk: string | null;
  category: 'commercial' | 'private' | 'military' | 'cargo' | 'unknown';
  last_update: number;
  tracked: boolean;
}

// --- Maritime Vessel ---
export interface Vessel {
  mmsi: string;
  name: string;
  type: 'cargo' | 'tanker' | 'military' | 'fishing' | 'passenger' | 'unknown';
  flag: string;
  position: GeoPosition;
  speed: number; // knots
  heading: number;
  destination: string;
  ais_active: boolean;
  dark_ship: boolean;
  last_update: number;
  trail: GeoPosition[];
}

// --- Satellite ---
export interface Satellite {
  norad_id: number;
  name: string;
  type: 'communication' | 'weather' | 'military' | 'navigation' | 'science' | 'unknown';
  country: string;
  position: GeoPosition;
  velocity: number;
  orbit_type: 'LEO' | 'MEO' | 'GEO' | 'HEO';
  tle_line1: string;
  tle_line2: string;
  launch_date?: string;
}

// --- Global Event ---
export interface GlobalEvent {
  id: string;
  type: 'earthquake' | 'wildfire' | 'conflict' | 'protest' | 'explosion' | 'storm' | 'flood' | 'cyber_attack';
  title: string;
  description: string;
  position: GeoPosition;
  severity: 1 | 2 | 3 | 4 | 5; // 1=low, 5=critical
  timestamp: number;
  source: string;
  source_url?: string;
  metadata?: Record<string, unknown>;
}

// --- Cyber Threat ---
export interface CyberThreat {
  id: string;
  type: 'ddos' | 'ransomware' | 'phishing' | 'botnet' | 'scanning' | 'exploit' | 'apt';
  source_ip: string;
  source_position: GeoPosition;
  target_ip: string;
  target_position: GeoPosition;
  severity: 1 | 2 | 3 | 4 | 5;
  attack_name: string;
  timestamp: number;
  active: boolean;
}

// --- Infrastructure ---
export interface Infrastructure {
  id: string;
  name: string;
  type: 'power_plant' | 'nuclear' | 'airport' | 'port' | 'military_base' | 'submarine_cable' | 'pipeline' | 'dam';
  position: GeoPosition;
  country: string;
  status: 'active' | 'inactive' | 'under_construction' | 'decommissioned';
  capacity?: string;
  metadata?: Record<string, unknown>;
}

// --- Submarine Cable ---
export interface SubmarineCable {
  id: string;
  name: string;
  landing_points: GeoPosition[];
  length_km: number;
  capacity: string;
  status: 'active' | 'planned' | 'decommissioned';
  owners: string[];
}

// --- Alert ---
export interface Alert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  timestamp: number;
  source: string;
  category: string;
  position?: GeoPosition;
  entityType?: string;
  entityId?: string;
  acknowledged: boolean;
}

// --- Intelligence Query ---
export interface IntelQuery {
  id: string;
  text: string;
  timestamp: number;
  filters: QueryFilters;
  results_count: number;
}

export interface QueryFilters {
  entityTypes?: string[];
  region?: { center: GeoPosition; radius_km: number };
  timeRange?: { start: number; end: number };
  keywords?: string[];
  severity?: number[];
}

// --- Entity for graph ---
export interface GraphEntity {
  id: string;
  label: string;
  type: 'person' | 'company' | 'aircraft' | 'vessel' | 'organization' | 'location' | 'financial';
  properties: Record<string, string>;
}

export interface GraphRelation {
  source: string;
  target: string;
  type: string;
  weight: number;
}

// --- Layer config ---
export interface LayerConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  visible: boolean;
  count: number;
  category: 'tracking' | 'events' | 'intelligence' | 'infrastructure';
}

// --- War Prediction ---
export interface WarPrediction {
  region: string;
  risk_score: number; // 0-100
  signals: string[];
  trend: 'escalating' | 'stable' | 'de-escalating';
  last_updated: number;
}

// --- Financial Flow ---
export interface FinancialFlow {
  id: string;
  source_country: string;
  target_country: string;
  source_position: GeoPosition;
  target_position: GeoPosition;
  amount_usd: number;
  type: 'trade' | 'sanction' | 'investment' | 'offshore' | 'aid';
  flagged: boolean;
}

// --- Live Camera / CCTV ---
export interface LiveCamera {
  id: string;
  name: string;
  position: GeoPosition;
  city: string;
  country: string;
  category: 'traffic' | 'weather' | 'city' | 'port' | 'airport' | 'border' | 'infrastructure';
  stream_url: string;
  thumbnail_url?: string;
  source: string;
  status: 'online' | 'offline' | 'unknown';
  resolution?: string;
}

// --- Internet Outage ---
export interface InternetOutage {
  id: string;
  country: string;
  countryCode: string;
  position: GeoPosition;
  startDate: string;
  endDate?: string;
  scope: 'national' | 'regional' | 'network';
  cause: string;
  asn?: number;
  asnName?: string;
  active: boolean;
}

// --- Military Base ---
export interface MilitaryBase {
  id: string;
  name: string;
  country: string;
  position: GeoPosition;
  type: 'naval' | 'air_force' | 'army' | 'nuclear' | 'joint' | 'intelligence';
  branch: string;
  personnel?: number;
  status: 'active' | 'reserve' | 'closed';
}

// --- Drone / UAV ---
export interface DroneUAV {
  id: string;
  callsign: string;
  type: string; // e.g. MQ-9, RQ-4
  country: string;
  position: GeoPosition;
  altitude: number;
  speed: number;
  heading: number;
  military: boolean;
  last_update: number;
}
