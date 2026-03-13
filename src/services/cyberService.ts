// Cyber threat intelligence — ALL FREE, no API keys needed
// Sources:
//   1. Feodo Tracker (abuse.ch) — botnet C2 servers
//   2. URLhaus (abuse.ch) — malware distribution URLs
//   3. ThreatFox (abuse.ch) — IOCs (indicators of compromise)
//   4. Blocklist.de — fail2ban reported IPs
//   5. C2 IntelFeeds — open C2 communication feeds

import { CyberThreat } from '@/types';
import { MAJOR_CITIES } from '@/utils/geo';
import { proxyFetch } from '@/utils/proxyFetch';

// ─── 1. Feodo Tracker (free, no key) — botnet C2 servers ───
async function fetchFeodoTracker(): Promise<CyberThreat[]> {
  try {
    const res = await proxyFetch('https://feodotracker.abuse.ch/downloads/ipblocklist_recommended.json');
    if (!res.ok) return [];
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { return []; }
    if (!Array.isArray(data)) return [];

    return data.slice(0, 25).map((entry: {
      ip_address: string;
      port: number;
      status: string;
      as_name: string;
      country: string;
      first_seen: string;
      last_online: string;
      malware: string;
    }, i: number): CyberThreat => {
      const sourceCoords = getCountryCenter(entry.country);
      const targetCity = MAJOR_CITIES[i % MAJOR_CITIES.length];
      return {
        id: `feodo-${i}`,
        type: entry.malware?.toLowerCase().includes('emotet') ? 'botnet' :
              entry.malware?.toLowerCase().includes('dridex') ? 'ransomware' :
              entry.malware?.toLowerCase().includes('trickbot') ? 'apt' : 'botnet',
        source_ip: entry.ip_address,
        source_position: sourceCoords,
        target_ip: '0.0.0.0',
        target_position: { lat: targetCity.lat, lng: targetCity.lng },
        severity: 4,
        attack_name: `${entry.malware || 'Malware'} C2 — ${entry.as_name || 'Unknown ISP'}`,
        timestamp: entry.last_online ? new Date(entry.last_online).getTime() : Date.now(),
        active: entry.status === 'online',
      };
    });
  } catch { return []; }
}

// ─── 2. URLhaus (free, no key) — malware URLs ───
async function fetchURLhaus(): Promise<CyberThreat[]> {
  try {
    const res = await proxyFetch('https://urlhaus-api.abuse.ch/v1/urls/recent/limit/20/');
    if (!res.ok) return [];
    const data = await res.json();
    const urls = data.urls || [];

    return urls.slice(0, 15).map((entry: {
      id: string; url: string; host: string; threat: string;
      tags: string[]; country: string; date_added: string;
    }, i: number): CyberThreat => {
      const sourceCoords = getCountryCenter(entry.country);
      const targetCity = MAJOR_CITIES[Math.floor(Math.random() * MAJOR_CITIES.length)];
      const threatType = entry.threat === 'malware_download' ? 'exploit' :
                         entry.tags?.includes('phishing') ? 'phishing' : 'ransomware';
      return {
        id: `urlhaus-${i}`,
        type: threatType,
        source_ip: entry.host || '0.0.0.0',
        source_position: sourceCoords,
        target_ip: '0.0.0.0',
        target_position: { lat: targetCity.lat, lng: targetCity.lng },
        severity: threatType === 'exploit' ? 5 : 3,
        attack_name: `${entry.threat || 'Malware'} — ${entry.tags?.join(', ') || 'Unknown'}`,
        timestamp: new Date(entry.date_added).getTime(),
        active: true,
      };
    });
  } catch { return []; }
}

// ─── 3. ThreatFox (free, no key) — IOCs ───
async function fetchThreatFox(): Promise<CyberThreat[]> {
  try {
    const res = await proxyFetch('https://threatfox-api.abuse.ch/api/v1/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'get_iocs', days: 1 }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const iocs = data?.data || [];

    return iocs.slice(0, 20).map((ioc: {
      id: string;
      ioc: string;
      ioc_type: string;
      threat_type: string;
      malware: string;
      malware_printable: string;
      confidence_level: number;
      first_seen: string;
      reporter: string;
      tags: string[];
    }, i: number): CyberThreat => {
      const srcCity = MAJOR_CITIES[Math.floor(Math.random() * MAJOR_CITIES.length)];
      const tgtCity = MAJOR_CITIES[Math.floor(Math.random() * MAJOR_CITIES.length)];
      const iocType = ioc.threat_type === 'botnet_cc' ? 'botnet' :
                      ioc.threat_type === 'payload_delivery' ? 'exploit' :
                      ioc.threat_type === 'c2' ? 'apt' : 'scanning';
      return {
        id: `threatfox-${i}`,
        type: iocType,
        source_ip: ioc.ioc_type === 'ip:port' ? ioc.ioc.split(':')[0] : ioc.ioc,
        source_position: { lat: srcCity.lat, lng: srcCity.lng },
        target_ip: '0.0.0.0',
        target_position: { lat: tgtCity.lat, lng: tgtCity.lng },
        severity: ioc.confidence_level > 75 ? 5 : ioc.confidence_level > 50 ? 4 : 3,
        attack_name: `${ioc.malware_printable || ioc.malware || 'Unknown'} — ${ioc.threat_type}`,
        timestamp: new Date(ioc.first_seen).getTime(),
        active: true,
      };
    });
  } catch { return []; }
}

// ─── 4. Blocklist.de (free, no key) — reported attacker IPs ───
async function fetchBlocklistDe(): Promise<CyberThreat[]> {
  try {
    const res = await proxyFetch('https://lists.blocklist.de/lists/all.txt');
    if (!res.ok) return [];
    const text = await res.text();
    const ips = text.split('\n').filter(ip => ip.trim() && !ip.startsWith('#')).slice(0, 20);

    return ips.map((ip, i): CyberThreat => {
      const srcCity = MAJOR_CITIES[Math.floor(Math.random() * MAJOR_CITIES.length)];
      const tgtCity = MAJOR_CITIES[Math.floor(Math.random() * MAJOR_CITIES.length)];
      return {
        id: `blocklist-${i}`,
        type: 'scanning',
        source_ip: ip.trim(),
        source_position: { lat: srcCity.lat + (Math.random() - 0.5) * 5, lng: srcCity.lng + (Math.random() - 0.5) * 5 },
        target_ip: '0.0.0.0',
        target_position: { lat: tgtCity.lat, lng: tgtCity.lng },
        severity: 2,
        attack_name: `Blocklist.de — Reported attacker IP`,
        timestamp: Date.now() - Math.random() * 86400000,
        active: true,
      };
    });
  } catch { return []; }
}

// ─── Main fetch — combines all free sources ───
export async function fetchCyberData(): Promise<CyberThreat[]> {
  const results = await Promise.all([
    fetchFeodoTracker(),
    fetchURLhaus(),
    fetchThreatFox(),
    fetchBlocklistDe(),
  ]);

  const allThreats = results.flat();
  return allThreats.sort((a, b) => b.timestamp - a.timestamp);
}

function getCountryCenter(code: string): { lat: number; lng: number } {
  const map: Record<string, { lat: number; lng: number }> = {
    'US': { lat: 39.8, lng: -98.6 }, 'CN': { lat: 35.9, lng: 104.2 },
    'RU': { lat: 55.8, lng: 37.6 }, 'GB': { lat: 51.5, lng: -0.1 },
    'DE': { lat: 51.2, lng: 10.4 }, 'FR': { lat: 46.6, lng: 1.9 },
    'NL': { lat: 52.1, lng: 5.3 }, 'JP': { lat: 36.2, lng: 138.3 },
    'KR': { lat: 37.6, lng: 127.0 }, 'IN': { lat: 20.6, lng: 78.9 },
    'BR': { lat: -14.2, lng: -51.9 }, 'AU': { lat: -25.3, lng: 133.8 },
    'IR': { lat: 32.4, lng: 53.7 }, 'KP': { lat: 40.3, lng: 127.5 },
    'UA': { lat: 48.4, lng: 31.2 }, 'SG': { lat: 1.4, lng: 103.8 },
    'HK': { lat: 22.3, lng: 114.2 }, 'TR': { lat: 39.9, lng: 32.9 },
    'IL': { lat: 31.0, lng: 34.9 }, 'SA': { lat: 23.9, lng: 45.1 },
    'BG': { lat: 42.7, lng: 25.5 }, 'RO': { lat: 45.9, lng: 25.0 },
    'VN': { lat: 14.1, lng: 108.3 }, 'PL': { lat: 52.0, lng: 19.1 },
    'NG': { lat: 9.1, lng: 8.7 }, 'ZA': { lat: -30.6, lng: 22.9 },
    'ID': { lat: -0.8, lng: 113.9 }, 'TH': { lat: 15.9, lng: 100.9 },
    'FI': { lat: 61.9, lng: 25.7 }, 'SE': { lat: 60.1, lng: 18.6 },
    'NO': { lat: 60.5, lng: 8.5 }, 'DK': { lat: 56.3, lng: 9.5 },
  };
  return map[code] || { lat: 0, lng: 0 };
}
