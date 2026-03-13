import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import {
  Aircraft, Vessel, Satellite, GlobalEvent, CyberThreat,
  Infrastructure, LiveCamera, LayerConfig, FinancialFlow,
  InternetOutage, MilitaryBase, DroneUAV
} from '@/types';
import { CableFeature } from '@/services/submarineCableService';
import { getBaseTypeColor } from '@/services/militaryBaseService';
import { getCCTVCategoryColor } from '@/services/cctvService';
import { getSeverityColor } from '@/services/alertService';
import * as THREE from 'three';

// Define the shape of our point data for the globe
interface GlobePoint {
  lat: number;
  lng: number;
  alt: number;
  color: string;
  radius: number;
  type: string;
  data: Aircraft | Vessel | Satellite | GlobalEvent | Infrastructure | LiveCamera | MilitaryBase | DroneUAV | InternetOutage;
}

// Define the shape of our arc data for the globe
interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  type: string;
  data: CyberThreat | FinancialFlow;
}

interface GlobeViewProps {
  layers: LayerConfig[];
  aircraft: Aircraft[];
  vessels: Vessel[];
  satellites: Satellite[];
  events: GlobalEvent[];
  cyberThreats: CyberThreat[];
  infrastructure: Infrastructure[];
  financialFlows: FinancialFlow[];
  cameras: LiveCamera[];
  submarineCables: CableFeature[];
  militaryBases: MilitaryBase[];
  internetOutages: InternetOutage[];
  drones: DroneUAV[];
  onEntityClick: (entity: any, type: string) => void;
  globeRotation?: { lat: number; lng: number };
  globeZoom?: number;
}

export default function GlobeView({
  layers, aircraft, vessels, satellites, events, cyberThreats,
  infrastructure, financialFlows, cameras, submarineCables,
  militaryBases, internetOutages, drones, onEntityClick,
  globeRotation, globeZoom
}: GlobeViewProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Handle window resize
  useEffect(() => {
    function handleResize() {
      // Instead of window.innerWidth which ignores the panels, 
      // let's get the size of our container visually
      const globeContainer = document.querySelector('.globe-wrapper');
      if (globeContainer) {
        setWindowSize({
          width: globeContainer.clientWidth,
          height: globeContainer.clientHeight
        });
      } else {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle programmatic fly-to (search/alerts)
  useEffect(() => {
    if (globeRef.current && globeRotation) {
      // Calculate altitude roughly based on the 1-8 zoom scale from the canvas implementation
      // Globe.gl altitude is roughly 0.1 (surface) to ~4 (far)
      const alt = globeZoom ? Math.max(0.2, 4 / globeZoom) : 1.5;
      globeRef.current.pointOfView({
        lat: globeRotation.lat,
        lng: globeRotation.lng,
        altitude: alt
      }, 1000); // 1s animation
    }
  }, [globeRotation, globeZoom]);

  // Handle click events
  const handlePointClick = (point: object) => {
    const p = point as GlobePoint;
    if (p.data) {
      onEntityClick(p.data, p.type);
    }
  };

  // Convert layer data to globe.gl point data format
  const pointsData = useMemo(() => {
    const points: GlobePoint[] = [];

    // Aircraft Layer
    if (layers.find(l => l.id === 'aircraft')?.visible) {
      aircraft.forEach(ac => {
        const color = ac.category === 'military' ? '#ff1744' :
                     ac.tracked ? '#ff9100' :
                     ac.category === 'private' ? '#ffd600' : '#00d4ff';
        points.push({
          lat: ac.position.lat, lng: ac.position.lng,
          alt: (ac.position.alt || 10000) / 100000, // Scale altitude for globe
          color, radius: ac.category === 'military' || ac.tracked ? 0.3 : 0.15,
          type: 'aircraft', data: ac
        });
      });
    }

    // Maritime Layer
    if (layers.find(l => l.id === 'maritime')?.visible) {
      vessels.forEach(v => {
        const color = v.dark_ship ? '#ff1744' :
                     v.type === 'military' ? '#ff6d00' :
                     v.type === 'tanker' ? '#ffd600' : '#3b82f6';
        points.push({
          lat: v.position.lat, lng: v.position.lng,
          alt: 0, // Surface
          color, radius: v.dark_ship ? 0.4 : 0.2,
          type: 'vessel', data: v
        });
      });
    }

    // Satellite Layer
    if (layers.find(l => l.id === 'satellites')?.visible) {
      satellites.forEach(sat => {
        const color = sat.type === 'military' ? '#ff1744' :
                     sat.type === 'communication' ? '#8b5cf6' :
                     sat.type === 'navigation' ? '#10b981' : '#a78bfa';
        points.push({
          lat: sat.position.lat, lng: sat.position.lng,
          alt: (sat.position.alt || 400000) / 200000, // Higher orbit
          color, radius: 0.25,
          type: 'satellite', data: sat
        });
      });
    }

    // Events Layer (Points)
    if (layers.find(l => l.id === 'events')?.visible) {
      events.forEach(evt => {
        const colors: Record<string, string> = {
          earthquake: '#ff9100', wildfire: '#ff1744', conflict: '#ef4444',
          protest: '#ffd600', explosion: '#ff1744', storm: '#3b82f6',
          flood: '#00b0ff', cyber_attack: '#f59e0b',
        };
        const color = colors[evt.type] || '#ef4444';
        points.push({
          lat: evt.position.lat, lng: evt.position.lng,
          alt: 0.01, // Slightly above surface
          color, radius: 0.2 + (evt.severity * 0.1),
          type: 'event', data: evt
        });
      });
    }

    // Infrastructure Layer
    if (layers.find(l => l.id === 'infrastructure')?.visible) {
      infrastructure.forEach(inf => {
        const colors: Record<string, string> = {
          nuclear: '#ff1744', military_base: '#ff6d00', airport: '#00d4ff',
          port: '#3b82f6', power_plant: '#10b981', pipeline: '#f59e0b',
          dam: '#8b5cf6', submarine_cable: '#64748b',
        };
        const color = colors[inf.type] || '#10b981';
        points.push({
          lat: inf.position.lat, lng: inf.position.lng,
          alt: 0,
          color, radius: inf.type === 'nuclear' ? 0.5 : 0.3,
          type: 'infrastructure', data: inf
        });
      });
    }

    // CCTV Camera Layer
    if (layers.find(l => l.id === 'cctv')?.visible) {
      cameras.forEach(cam => {
        const color = getCCTVCategoryColor(cam.category);
        points.push({
          lat: cam.position.lat, lng: cam.position.lng,
          alt: 0,
          color, radius: 0.25,
          type: 'camera', data: cam
        });
      });
    }

    // Military Bases Layer
    if (layers.find(l => l.id === 'military')?.visible) {
      militaryBases.forEach(base => {
        points.push({
          lat: base.position.lat, lng: base.position.lng,
          alt: 0.005,
          color: getBaseTypeColor(base.type),
          radius: base.type === 'nuclear' ? 0.5 : 0.35,
          type: 'military_base', data: base as any
        });
      });
    }

    // Internet Outages Layer
    if (layers.find(l => l.id === 'outages')?.visible) {
      internetOutages.forEach(outage => {
        points.push({
          lat: outage.position.lat, lng: outage.position.lng,
          alt: 0.01,
          color: outage.active ? '#ff1744' : '#ff9100',
          radius: outage.scope === 'national' ? 0.6 : 0.4,
          type: 'outage', data: outage as any
        });
      });
    }

    // Drones/UAV Layer
    if (layers.find(l => l.id === 'drones')?.visible) {
      drones.forEach(drone => {
        points.push({
          lat: drone.position.lat, lng: drone.position.lng,
          alt: (drone.altitude || 10000) / 100000,
          color: '#76ff03',
          radius: 0.35,
          type: 'drone', data: drone as any
        });
      });
    }

    return points;
  }, [layers, aircraft, vessels, satellites, events, infrastructure, cameras, militaryBases, internetOutages, drones]);

  // Convert layer data to globe.gl arcs data format
  const arcsData = useMemo(() => {
    const arcs: GlobeArc[] = [];

    // Cyber Layer
    if (layers.find(l => l.id === 'cyber')?.visible) {
      cyberThreats.forEach(ct => {
        const color = ct.severity >= 4 ? '#ff1744' : ct.severity >= 3 ? '#f59e0b' : '#00e5ff';
        arcs.push({
          startLat: ct.source_position.lat, startLng: ct.source_position.lng,
          endLat: ct.target_position.lat, endLng: ct.target_position.lng,
          color,
          type: 'cyber', data: ct
        });
      });
    }

    // Financial flows
    if (layers.find(l => l.id === 'financial')?.visible) {
      financialFlows.forEach(flow => {
        const color = flow.flagged ? '#ff1744' : flow.type === 'sanction' ? '#ff6d00' : '#ec4899';
        arcs.push({
          startLat: flow.source_position.lat, startLng: flow.source_position.lng,
          endLat: flow.target_position.lat, endLng: flow.target_position.lng,
          color,
          type: 'financial', data: flow
        });
      });
    }

    // Submarine cables as arcs
    if (layers.find(l => l.id === 'cables')?.visible) {
      submarineCables.forEach(cable => {
        // Each cable has multiple line segments — convert to arcs
        cable.coordinates.forEach(line => {
          for (let i = 0; i < line.length - 1; i += Math.max(1, Math.floor(line.length / 5))) {
            const next = Math.min(i + Math.max(1, Math.floor(line.length / 5)), line.length - 1);
            arcs.push({
              startLat: line[i][1], startLng: line[i][0],
              endLat: line[next][1], endLng: line[next][0],
              color: cable.color || '#00bcd4',
              type: 'cable', data: cable as any
            });
          }
        });
      });
    }

    return arcs;
  }, [layers, cyberThreats, financialFlows, submarineCables]);

  // Rings data for events and dark ships
  const ringsData = useMemo(() => {
    const rings: any[] = [];
    
    // Event rings (pulsing)
    if (layers.find(l => l.id === 'events')?.visible) {
      events.forEach(evt => {
        if (evt.severity >= 3) {
          const colors: Record<string, string> = {
            earthquake: '#ff9100', wildfire: '#ff1744', conflict: '#ef4444',
            explosion: '#ff1744', cyber_attack: '#f59e0b',
          };
          rings.push({
            lat: evt.position.lat, lng: evt.position.lng,
            color: (t: number) => `rgba(${customHexToRgb(colors[evt.type] || '#ef4444')}, ${1 - t})`,
            maxR: evt.severity * 1.5,
            propagationSpeed: 1.5,
            repeatPeriod: 1500
          });
        }
      });
    }

    // Dark ship rings
    if (layers.find(l => l.id === 'maritime')?.visible) {
      vessels.forEach(v => {
        if (v.dark_ship) {
          rings.push({
            lat: v.position.lat, lng: v.position.lng,
            color: (t: number) => `rgba(255, 23, 68, ${1 - t})`,
            maxR: 2,
            propagationSpeed: 1,
            repeatPeriod: 1000
          });
        }
      });
    }

    // Internet outage rings (pulsing red)
    if (layers.find(l => l.id === 'outages')?.visible) {
      internetOutages.forEach(o => {
        if (o.active) {
          rings.push({
            lat: o.position.lat, lng: o.position.lng,
            color: (t: number) => `rgba(255, 23, 68, ${1 - t})`,
            maxR: o.scope === 'national' ? 5 : 3,
            propagationSpeed: 2,
            repeatPeriod: 1200
          });
        }
      });
    }

    return rings;
  }, [layers, events, vessels, internetOutages]);

  // Helper for ring colors
  function customHexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
      : '255, 0, 0';
  }

  // Prevent rendering on SSR or when width is 0
  if (typeof window === 'undefined' || windowSize.width === 0) return null;

  return (
    <Globe
      ref={globeRef}
      width={windowSize.width}
      height={windowSize.height}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      backgroundColor="#050a18"
      
      // Points
      pointsData={pointsData}
      pointLat="lat"
      pointLng="lng"
      pointAltitude="alt"
      pointRadius="radius"
      pointColor="color"
      pointResolution={16}
      onPointClick={handlePointClick}
      pointLabel={(d: any) => {
        const p = d as GlobePoint;
        if (p.type === 'aircraft') return (p.data as Aircraft).callsign || (p.data as Aircraft).icao24;
        if (p.type === 'vessel') return (p.data as Vessel).name;
        if (p.type === 'event') return (p.data as GlobalEvent).title;
        if (p.type === 'camera') return (p.data as LiveCamera).name;
        if (p.type === 'infrastructure') return (p.data as Infrastructure).name;
        if (p.type === 'satellite') return (p.data as Satellite).name;
        if (p.type === 'military_base') return `⚔️ ${(p.data as MilitaryBase).name} (${(p.data as MilitaryBase).country})`;
        if (p.type === 'outage') return `🔴 ${(p.data as InternetOutage).country} — ${(p.data as InternetOutage).cause}`;
        if (p.type === 'drone') return `🛩️ ${(p.data as DroneUAV).callsign} (${(p.data as DroneUAV).type})`;
        return p.type;
      }}
      
      // Arcs
      arcsData={arcsData}
      arcStartLat="startLat"
      arcStartLng="startLng"
      arcEndLat="endLat"
      arcEndLng="endLng"
      arcColor="color"
      arcDashLength={0.1}
      arcDashGap={0.05}
      arcDashAnimateTime={2000}
      arcAltitudeAutoScale={0.4}
      arcStroke={0.5}
      onArcClick={(d: any) => {
        const a = d as GlobeArc;
        if (a.data) onEntityClick(a.data, a.type);
      }}

      // Rings
      ringsData={ringsData}
      ringColor="color"
      ringMaxRadius="maxR"
      ringPropagationSpeed="propagationSpeed"
      ringRepeatPeriod="repeatPeriod"

      // Config
      animateIn={true}
    />
  );
}
