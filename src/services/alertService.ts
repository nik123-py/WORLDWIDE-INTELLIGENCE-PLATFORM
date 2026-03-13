// Alert generation service - from REAL live data feeds
import { Alert, GlobalEvent, CyberThreat, Vessel, GeoPosition } from '@/types';

function getAlertSeverity(eventSeverity: number): Alert['severity'] {
  if (eventSeverity >= 5) return 'critical';
  if (eventSeverity === 4) return 'high';
  if (eventSeverity === 3) return 'medium';
  if (eventSeverity === 2) return 'low';
  return 'info';
}

export function generateLiveAlerts(
  events: GlobalEvent[],
  cyber: CyberThreat[],
  vessels: Vessel[]
): Alert[] {
  const alerts: Alert[] = [];

  // Generate alerts from high-severity Events (USGS, EONET, UCDP)
  events.filter(e => e.severity >= 4).forEach((e, i) => {
    alerts.push({
      id: `alert-evt-${e.id}-${i}`,
      severity: getAlertSeverity(e.severity),
      title: e.title,
      description: e.description,
      source: e.source,
      category: e.type === 'earthquake' ? 'Natural Disaster' : e.type === 'conflict' ? 'Military' : 'Event',
      position: e.position,
      timestamp: e.timestamp,
      acknowledged: false,
    });
  });

  // Generate alerts from high-severity Cyber Threats
  cyber.filter(c => c.severity >= 4).forEach((c, i) => {
    alerts.push({
      id: `alert-cyb-${c.id}-${i}`,
      severity: getAlertSeverity(c.severity),
      title: 'High-Severity Cyber Threat',
      description: `${c.attack_name} detected originating from ${c.source_ip}`,
      source: 'Cyber Intelligence Feed',
      category: 'Cyber',
      position: c.source_position,
      timestamp: c.timestamp,
      acknowledged: false,
    });
  });

  // Generate alerts from high-interest Vessels (AISStream)
  vessels.filter(v => v.type === 'military' || v.speed > 40).forEach((v, i) => {
    alerts.push({
      id: `alert-vsl-${v.mmsi}-${i}`,
      severity: v.type === 'military' ? 'high' : 'medium',
      title: v.type === 'military' ? 'Military Vessel Activity' : 'High-Speed Vessel Detected',
      description: `Vessel ${v.name} (MMSI: ${v.mmsi}) traveling at ${v.speed} knots.`,
      source: 'AISStream',
      category: 'Maritime',
      position: v.position,
      timestamp: Date.now(),
      acknowledged: false,
    });
  });

  // Sort by newest first and limit to 50 alerts
  return alerts.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
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
