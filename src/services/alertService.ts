// Alert generation service
import { Alert } from '@/types';

const ALERT_TEMPLATES: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>[] = [
  { severity: 'critical', title: 'Dark Ship Detected', description: 'Vessel disabled AIS transponder near Strait of Hormuz. Last known position: 26.5°N, 56.2°E', source: 'Maritime OSINT', category: 'Maritime', position: { lat: 26.5, lng: 56.2 } },
  { severity: 'critical', title: 'Military Aircraft Without ADS-B', description: 'Unidentified aircraft detected via radar near Taiwan Strait operating without ADS-B transponder', source: 'ADS-B Exchange', category: 'Aviation', position: { lat: 24.5, lng: 119.5 } },
  { severity: 'high', title: 'APT29 Activity Detected', description: 'Advanced persistent threat group Cozy Bear detected probing government infrastructure in Eastern Europe', source: 'Cyber Intelligence', category: 'Cyber' },
  { severity: 'high', title: 'Unusual Satellite Maneuver', description: 'COSMOS 2558 performing unexpected orbital adjustment near NROL-82 reconnaissance satellite', source: 'Space Track', category: 'Space', position: { lat: 0, lng: 0 } },
  { severity: 'high', title: 'Troop Buildup Detected', description: 'Satellite imagery shows increased military vehicle concentration near border crossing', source: 'Sentinel Hub', category: 'Military', position: { lat: 50.2, lng: 36.4 } },
  { severity: 'medium', title: 'Earthquake M5.4', description: 'Moderate earthquake detected in Pacific Ring of Fire region. Tsunami watch issued.', source: 'USGS', category: 'Natural Disaster', position: { lat: -6.0, lng: 112.0 } },
  { severity: 'medium', title: 'Suspicious Financial Transfer', description: 'Anomalous fund transfer pattern detected through offshore entities linked to sanctioned individuals', source: 'ICIJ Offshore Leaks', category: 'Financial' },
  { severity: 'medium', title: 'New Runway Construction', description: 'Change detection AI identified new runway construction on disputed island in South China Sea', source: 'Satellite Change Detection', category: 'Military', position: { lat: 10.4, lng: 115.8 } },
  { severity: 'high', title: 'Submarine Cable Disruption', description: 'Partial outage detected on SEA-ME-WE 6 cable near Red Sea. Possible sabotage.', source: 'Cloudflare Radar', category: 'Infrastructure', position: { lat: 15.0, lng: 42.0 } },
  { severity: 'medium', title: 'Mass Protest Alert', description: 'Social media analysis indicates large-scale demonstration forming in Paris. Est. 50K+ participants', source: 'Social Media OSINT', category: 'Civil Unrest', position: { lat: 48.86, lng: 2.35 } },
  { severity: 'low', title: 'VIP Aircraft Movement', description: 'Private jet N2546 (linked to corporate executive) departed from unusual location at unusual hour', source: 'ADS-B Exchange', category: 'Aviation' },
  { severity: 'critical', title: 'Missile Launch Detected', description: 'Infrared satellite sensor detected thermal signature consistent with ballistic missile test launch', source: 'Satellite IR', category: 'Military', position: { lat: 39.0, lng: 125.7 } },
  { severity: 'info', title: 'GDELT Event Spike', description: 'GDELT analysis shows 340% increase in conflict-related news coverage for Horn of Africa region', source: 'GDELT', category: 'Intelligence' },
  { severity: 'high', title: 'Illegal Fishing Fleet', description: 'Cluster of 15+ fishing vessels detected operating without AIS in protected marine zone', source: 'Global Fishing Watch', category: 'Maritime', position: { lat: -5.0, lng: -85.0 } },
  { severity: 'critical', title: 'Cyber Attack on Power Grid', description: 'Coordinated attack detected targeting SCADA systems in European power distribution network', source: 'Shodan/GreyNoise', category: 'Cyber' },
  { severity: 'medium', title: 'Border Crossing Anomaly', description: 'Unusual increase in vehicle traffic detected at remote border crossing via satellite imagery', source: 'Sentinel Hub', category: 'Border Security', position: { lat: 36.0, lng: 45.0 } },
  { severity: 'info', title: 'War Risk Index Update', description: 'AI predictive model shows 12% increase in conflict probability for Southeast Asia corridor', source: 'AI Prediction Engine', category: 'Intelligence' },
  { severity: 'high', title: 'Nuclear Facility Alert', description: 'Thermal anomaly detected at Zaporizhzhia NPP. Possible cooling system irregularity.', source: 'Satellite IR', category: 'Nuclear', position: { lat: 47.5, lng: 34.6 } },
];

export function generateAlerts(): Alert[] {
  return ALERT_TEMPLATES.map((template, i) => ({
    ...template,
    id: `alert-${i}-${Date.now()}`,
    timestamp: Date.now() - Math.random() * 86400000 * (i < 5 ? 0.1 : 1),
    acknowledged: false,
  })).sort((a, b) => b.timestamp - a.timestamp);
}

export function getSeverityColor(severity: Alert['severity']): string {
  switch (severity) {
    case 'critical': return '#ff1744';
    case 'high': return '#ff9100';
    case 'medium': return '#ffea00';
    case 'low': return '#00e5ff';
    case 'info': return '#69f0ae';
    default: return '#ffffff';
  }
}

export function getSeverityIcon(severity: Alert['severity']): string {
  switch (severity) {
    case 'critical': return '🔴';
    case 'high': return '🟠';
    case 'medium': return '🟡';
    case 'low': return '🔵';
    case 'info': return '🟢';
    default: return '⚪';
  }
}
