'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Layers, AlertTriangle, Activity, Radio, Shield,
  Plane, Ship, Satellite, Flame, Globe2, Zap, MapPin,
  Play, Pause, SkipBack, SkipForward, Clock, ChevronRight,
  Eye, EyeOff, Target, Crosshair, Wifi, Database,
  TrendingUp, BarChart3, Bell, FileText, Send, X,
  Anchor, Radar, CircleDot, Building2, Cable, Factory,
  Skull, Bug, Bot, ScanLine, Video, Camera,
} from 'lucide-react';

import { Aircraft, Vessel, Satellite as SatelliteType, GlobalEvent, CyberThreat, Infrastructure, Alert, LayerConfig, WarPrediction, FinancialFlow, LiveCamera, InternetOutage, MilitaryBase, DroneUAV } from '@/types';
import { fetchAircraftData } from '@/services/aircraftService';
import { fetchMaritimeData } from '@/services/maritimeService';
import { fetchSatelliteData } from '@/services/satelliteService';
import { fetchEventsData } from '@/services/eventsService';
import { fetchCyberData } from '@/services/cyberService';
import { fetchInfrastructureData } from '@/services/infrastructureService';
import { generateLiveAlerts, getSeverityColor } from '@/services/alertService';
import { fetchWarPredictions, fetchFinancialFlows, getWarRiskColor } from '@/services/intelligenceService';
import { parseQuery, EXAMPLE_QUERIES } from '@/services/queryEngine';
import { fetchCCTVCameras, getCCTVCategoryColor, getCCTVCategoryIcon } from '@/services/cctvService';
import { fetchSubmarineCables, CableFeature } from '@/services/submarineCableService';
import { fetchMilitaryBases } from '@/services/militaryBaseService';
import { fetchInternetOutages } from '@/services/internetOutageService';
import { fetchDroneData } from '@/services/droneService';

// ─── Dynamic Globe Import ───
import dynamic from 'next/dynamic';
const GlobeView = dynamic(() => import('./GlobeView'), { ssr: false });

export default function IntelligencePlatform() {
  // ─── State ───
  const [layers, setLayers] = useState<LayerConfig[]>([
    { id: 'aircraft', name: 'Aircraft', icon: 'plane', color: '#00d4ff', visible: true, count: 0, category: 'tracking' },
    { id: 'maritime', name: 'Maritime', icon: 'ship', color: '#3b82f6', visible: true, count: 0, category: 'tracking' },
    { id: 'satellites', name: 'Satellites', icon: 'satellite', color: '#8b5cf6', visible: false, count: 0, category: 'tracking' },
    { id: 'events', name: 'Global Events', icon: 'flame', color: '#ef4444', visible: true, count: 0, category: 'events' },
    { id: 'cyber', name: 'Cyber Threats', icon: 'zap', color: '#f59e0b', visible: false, count: 0, category: 'intelligence' },
    { id: 'infrastructure', name: 'Infrastructure', icon: 'building', color: '#10b981', visible: false, count: 0, category: 'infrastructure' },
    { id: 'financial', name: 'Financial Flows', icon: 'trending', color: '#ec4899', visible: false, count: 0, category: 'intelligence' },
    { id: 'cctv', name: 'Live CCTV', icon: 'camera', color: '#e040fb', visible: true, count: 0, category: 'infrastructure' },
    { id: 'cables', name: 'Submarine Cables', icon: 'cable', color: '#00bcd4', visible: false, count: 0, category: 'infrastructure' },
    { id: 'military', name: 'Military Bases', icon: 'target', color: '#ff5722', visible: false, count: 0, category: 'intelligence' },
    { id: 'outages', name: 'Internet Outages', icon: 'wifi', color: '#ff1744', visible: false, count: 0, category: 'events' },
    { id: 'drones', name: 'Drones/UAVs', icon: 'radar', color: '#76ff03', visible: false, count: 0, category: 'tracking' },
  ]);

  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [satellites, setSatellites] = useState<SatelliteType[]>([]);
  const [events, setEvents] = useState<GlobalEvent[]>([]);
  const [cyberThreats, setCyberThreats] = useState<CyberThreat[]>([]);
  const [infrastructure, setInfrastructure] = useState<Infrastructure[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [warPredictions, setWarPredictions] = useState<WarPrediction[]>([]);
  const [financialFlows, setFinancialFlows] = useState<FinancialFlow[]>([]);
  const [cameras, setCameras] = useState<LiveCamera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<LiveCamera | null>(null);
  const [submarineCables, setSubmarineCables] = useState<CableFeature[]>([]);
  const [militaryBases, setMilitaryBases] = useState<MilitaryBase[]>([]);
  const [internetOutages, setInternetOutages] = useState<InternetOutage[]>([]);
  const [drones, setDrones] = useState<DroneUAV[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<{ type: string; data: any } | null>(null);
  const [rightTab, setRightTab] = useState<'alerts' | 'intel' | 'entity'>('alerts');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeValue, setTimeValue] = useState(100);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [globeRotation, setGlobeRotation] = useState({ lng: 30, lat: 20 });
  const [globeZoom, setGlobeZoom] = useState(1);
  const [loading, setLoading] = useState(true);

// ─── Globe View Refs ───
  // We no longer need all the custom canvas refs!

  // ─── Clock ───
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ─── Data Loading ───
  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      try {
        const [ac, vsl, sat, evt, cyb, infra, wp, ff, cables, outages, drn] = await Promise.all([
          fetchAircraftData(),
          fetchMaritimeData(),
          fetchSatelliteData(),
          fetchEventsData(),
          fetchCyberData(),
          Promise.resolve(fetchInfrastructureData()),
          fetchWarPredictions(),
          fetchFinancialFlows(),
          fetchSubmarineCables(),
          fetchInternetOutages(),
          fetchDroneData(),
        ]);

        // Sync data from curated datasets
        const bases = fetchMilitaryBases();

        setAircraft(ac);
        setVessels(vsl);
        setSatellites(sat);
        setEvents(evt);
        setCyberThreats(cyb);
        setInfrastructure(infra);
        setAlerts(generateLiveAlerts(evt, cyb, vsl));
        setWarPredictions(wp);
        setFinancialFlows(ff);
        setSubmarineCables(cables);
        setMilitaryBases(bases);
        setInternetOutages(outages);
        setDrones(drn);

        // Load CCTV cameras (synchronous, curated dataset)
        const cams = fetchCCTVCameras();
        setCameras(cams);

        setLayers(prev => prev.map(l => {
          switch (l.id) {
            case 'aircraft': return { ...l, count: ac.length };
            case 'maritime': return { ...l, count: vsl.length };
            case 'satellites': return { ...l, count: sat.length };
            case 'events': return { ...l, count: evt.length };
            case 'cyber': return { ...l, count: cyb.length };
            case 'infrastructure': return { ...l, count: infra.length };
            case 'financial': return { ...l, count: ff.length };
            case 'cctv': return { ...l, count: cams.length };
            case 'cables': return { ...l, count: cables.length };
            case 'military': return { ...l, count: bases.length };
            case 'outages': return { ...l, count: outages.length };
            case 'drones': return { ...l, count: drn.length };
            default: return l;
          }
        }));
      } catch (err) {
        console.error('Data loading error:', err);
      }
      setLoading(false);
    }
    loadAllData();
    const refresh = setInterval(loadAllData, 120000); // refresh every 2 min
    return () => clearInterval(refresh);
  }, []);

  // ─── Toggle Layer ───
  const toggleLayer = useCallback((id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  }, []);

  // ─── Search ───
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    const result = parseQuery(searchQuery);
    // Enable matched layers
    setLayers(prev => prev.map(l => ({
      ...l,
      visible: result.matchedLayers.includes(l.id) ? true : l.visible,
    })));
    // If region is specified, fly to it
    if (result.filters.region) {
      setGlobeRotation({
        lng: result.filters.region.center.lng,
        lat: result.filters.region.center.lat,
      });
      setGlobeZoom(2);
    }
  }, [searchQuery]);

  // ─── Handlers ───
  const handleEntityClick = useCallback((entityData: any, type: string) => {
    if (type === 'camera') {
      setSelectedCamera(entityData as LiveCamera);
      return;
    }
    setSelectedEntity({ type, data: entityData } as any);
    setRightTab('entity');
  }, []);

  // ─── Format numbers ───
  const formatNum = (n: number) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
    return n.toLocaleString();
  };

  const totalEntities = layers.reduce((s, l) => s + (l.visible ? l.count : 0), 0);

  const layerIcons: Record<string, React.ReactNode> = {
    plane: <Plane size={14} />, ship: <Ship size={14} />, satellite: <Satellite size={14} />,
    flame: <Flame size={14} />, zap: <Zap size={14} />, building: <Building2 size={14} />,
    trending: <TrendingUp size={14} />, camera: <Video size={14} />,
  };

  // ─── Render ───
  return (
    <div className="app-container">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <div className="logo-icon">◈</div>
            <div>
              <div className="logo-text">AEGIS</div>
              <div className="logo-subtitle">Intelligence Platform</div>
            </div>
          </div>
        </div>

        <div className="header-center">
          <div className="status-indicator">
            <span className="status-dot" />
            <span>LIVE — ALL SYSTEMS OPERATIONAL</span>
          </div>
          <div className="header-stats">
            <div className="header-stat">
              <Activity size={12} />
              <span className="stat-value">{totalEntities.toLocaleString()}</span>
              <span>entities</span>
            </div>
            <div className="header-stat">
              <Radio size={12} />
              <span className="stat-value">{layers.filter(l => l.visible).length}</span>
              <span>layers</span>
            </div>
            <div className="header-stat">
              <AlertTriangle size={12} />
              <span className="stat-value" style={{ color: '#ff1744' }}>
                {alerts.filter(a => a.severity === 'critical').length}
              </span>
              <span>critical</span>
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="header-time">
            {currentTime.toISOString().replace('T', ' ').substring(0, 19)} UTC
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <div className="main-content">
        {/* ── Left Panel ── */}
        <div className="panel">
          {/* Search */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                className="search-input"
                placeholder="Intelligence query..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button
                className="search-icon"
                onClick={handleSearch}
                style={{ cursor: 'pointer', pointerEvents: 'auto', background: 'none', border: 'none' }}
              >
                <Send size={14} color="var(--accent-cyan)" />
              </button>
            </div>
          </div>

          {/* Layers */}
          <div className="layers-section">
            <div className="section-title">Intelligence Layers</div>
            {layers.map(layer => (
              <div key={layer.id} className="layer-item" onClick={() => toggleLayer(layer.id)}>
                <div className="layer-left">
                  <div className="layer-dot" style={{ background: layer.color }} />
                  <span className="layer-name">{layer.name}</span>
                  <span className="layer-count">{layer.count}</span>
                </div>
                <div className="layer-right">
                  <div className={`toggle-switch ${layer.visible ? 'active' : ''}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Queries */}
          <div className="panel-body">
            <div className="section-title">OSINT Queries</div>
            {EXAMPLE_QUERIES.slice(0, 6).map((q, i) => (
              <div key={i} className="query-suggestion" onClick={() => { setSearchQuery(q); }}>
                <Crosshair size={11} style={{ marginRight: 6, opacity: 0.5, display: 'inline' }} />
                {q}
              </div>
            ))}

            {/* War Risk Intelligence */}
            <div className="section-title" style={{ marginTop: 16 }}>War Risk Analysis</div>
            {warPredictions.slice(0, 4).map((wp, i) => (
              <div key={i} className="war-risk-card">
                <div className="war-risk-header">
                  <span className="war-risk-region">{wp.region}</span>
                  <span className="war-risk-score" style={{ color: getWarRiskColor(wp.risk_score), background: `${getWarRiskColor(wp.risk_score)}15` }}>
                    {wp.risk_score}%
                  </span>
                </div>
                <div className="war-risk-bar">
                  <div className="war-risk-fill" style={{ width: `${wp.risk_score}%`, background: getWarRiskColor(wp.risk_score) }} />
                </div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                  <span className={`trend-badge trend-${wp.trend}`}>
                    {wp.trend === 'escalating' ? '↑' : wp.trend === 'de-escalating' ? '↓' : '→'} {wp.trend}
                  </span>
                </div>
                <div className="war-risk-signals">
                  {wp.signals.slice(0, 3).map((s, j) => (
                    <span key={j} className="signal-tag">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Globe ── */}
        <div className="globe-container grid-bg">
          {loading && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(5, 10, 24, 0.9)', zIndex: 100,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>◈</div>
                <div style={{ color: 'var(--accent-cyan)', fontSize: 14, letterSpacing: 2 }}>
                  LOADING INTELLIGENCE DATA...
                </div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: 12, marginTop: 8 }}>
                  Connecting to OSINT feeds
                </div>
              </div>
            </div>
          )}
          <div className="globe-wrapper">
            <GlobeView
              layers={layers}
              aircraft={aircraft}
              vessels={vessels}
              satellites={satellites}
              events={events}
              cyberThreats={cyberThreats}
              infrastructure={infrastructure}
              financialFlows={financialFlows}
              cameras={cameras}
              submarineCables={submarineCables}
              militaryBases={militaryBases}
              internetOutages={internetOutages}
              drones={drones}
              onEntityClick={handleEntityClick}
              globeRotation={globeRotation}
              globeZoom={globeZoom}
            />
          </div>
          <div className="globe-overlay" />
          <div className="globe-watermark">AEGIS INTELLIGENCE PLATFORM — CLASSIFIED</div>

          {/* Zoom controls */}
          <div style={{
            position: 'absolute', bottom: 20, right: 16, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 20,
          }}>
            <button onClick={() => setGlobeZoom(z => Math.min(8, z + 0.3))}
              style={{ width: 32, height: 32, background: 'var(--bg-glass)', border: '1px solid var(--border-color)',
                borderRadius: 6, color: 'var(--text-primary)', cursor: 'pointer', fontSize: 16, backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            <button onClick={() => setGlobeZoom(z => Math.max(0.5, z - 0.3))}
              style={{ width: 32, height: 32, background: 'var(--bg-glass)', border: '1px solid var(--border-color)',
                borderRadius: 6, color: 'var(--text-primary)', cursor: 'pointer', fontSize: 16, backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <button onClick={() => { setGlobeRotation({ lng: 30, lat: 20 }); setGlobeZoom(1); }}
              style={{ width: 32, height: 32, background: 'var(--bg-glass)', border: '1px solid var(--border-color)',
                borderRadius: 6, color: 'var(--text-primary)', cursor: 'pointer', fontSize: 12, backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe2 size={14} />
            </button>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="panel panel-right">
          <div className="tab-bar">
            <div className={`tab-item ${rightTab === 'alerts' ? 'active' : ''}`} onClick={() => setRightTab('alerts')}>
              <Bell size={12} style={{ marginRight: 4 }} />Alerts
            </div>
            <div className={`tab-item ${rightTab === 'intel' ? 'active' : ''}`} onClick={() => setRightTab('intel')}>
              <Shield size={12} style={{ marginRight: 4 }} />Intel
            </div>
            <div className={`tab-item ${rightTab === 'entity' ? 'active' : ''}`} onClick={() => setRightTab('entity')}>
              <Target size={12} style={{ marginRight: 4 }} />Entity
            </div>
          </div>

          {/* Stats */}
          <div style={{ padding: 'var(--panel-padding)' }}>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-value" style={{ color: 'var(--entity-aircraft)' }}>{aircraft.length}</div>
                <div className="stat-card-label">Aircraft</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-value" style={{ color: 'var(--entity-vessel)' }}>{vessels.length}</div>
                <div className="stat-card-label">Vessels</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-value" style={{ color: 'var(--entity-event)' }}>{events.length}</div>
                <div className="stat-card-label">Events</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-value" style={{ color: 'var(--entity-cyber)' }}>{cyberThreats.length}</div>
                <div className="stat-card-label">Threats</div>
              </div>
            </div>
          </div>

          <div className="panel-body">
            {/* Alerts Tab */}
            {rightTab === 'alerts' && (
              <>
                <div className="section-title">Live Threat Feed</div>
                {alerts.map((alert, i) => (
                  <div key={i} className={`alert-item ${alert.severity}`}
                    onClick={() => {
                      if (alert.position) {
                        setGlobeRotation({ lng: alert.position.lng, lat: alert.position.lat });
                        setGlobeZoom(3);
                      }
                    }}>
                    <div className="alert-severity-icon">{
                      alert.severity === 'critical' ? '🔴' :
                      alert.severity === 'high' ? '🟠' :
                      alert.severity === 'medium' ? '🟡' :
                      alert.severity === 'low' ? '🔵' : '🟢'
                    }</div>
                    <div className="alert-content">
                      <div className="alert-title">{alert.title}</div>
                      <div className="alert-description">{alert.description}</div>
                      <div className="alert-meta">
                        <span className="alert-source">{alert.source}</span>
                        <span className="alert-time">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Intel Tab */}
            {rightTab === 'intel' && (
              <>
                <div className="section-title">War Risk Assessment (GDELT Analysis)</div>
                {warPredictions.map((wp, i) => (
                  <div key={i} className="war-risk-card">
                    <div className="war-risk-header">
                      <span className="war-risk-region">{wp.region}</span>
                      <span className="war-risk-score" style={{ color: getWarRiskColor(wp.risk_score), background: `${getWarRiskColor(wp.risk_score)}15` }}>
                        {wp.risk_score}%
                      </span>
                    </div>
                    <div className="war-risk-bar">
                      <div className="war-risk-fill" style={{ width: `${wp.risk_score}%`, background: getWarRiskColor(wp.risk_score) }} />
                    </div>
                    <span className={`trend-badge trend-${wp.trend}`}>
                      {wp.trend === 'escalating' ? '↑' : wp.trend === 'de-escalating' ? '↓' : '→'} {wp.trend}
                    </span>
                    <div className="war-risk-signals" style={{ marginTop: 6 }}>
                      {wp.signals.map((s, j) => (
                        <span key={j} className="signal-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="section-title" style={{ marginTop: 12 }}>Financial Intelligence (World Bank)</div>
                {financialFlows.slice(0, 8).map((flow, i) => (
                  <div key={i} className="alert-item" style={{ borderLeftColor: flow.flagged ? '#ff1744' : '#ec4899' }}>
                    <div className="alert-content">
                      <div className="alert-title">
                        {flow.source_country} → {flow.target_country}
                        {flow.flagged && <span style={{ color: '#ff1744', marginLeft: 6, fontSize: 10 }}>⚠ FLAGGED</span>}
                      </div>
                      <div className="alert-description">
                        {flow.type === 'sanction' ? 'SANCTIONS IN EFFECT' : formatNum(flow.amount_usd)}
                        {' · '}{flow.type.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Entity Tab */}
            {rightTab === 'entity' && selectedEntity && (
              <div className="entity-card">
                <div className="entity-card-header">
                  <span className="entity-type-badge" style={{
                    background: `rgba(0, 212, 255, 0.15)`, color: 'var(--accent-cyan)'
                  }}>
                    {selectedEntity.type}
                  </span>
                  <button onClick={() => setSelectedEntity(null)} style={{
                    background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', marginLeft: 'auto',
                  }}>
                    <X size={14} />
                  </button>
                </div>

                {selectedEntity.type === 'aircraft' && (() => {
                  const ac = selectedEntity.data as Aircraft;
                  return <>
                    <div className="entity-name">{ac.callsign || ac.icao24}</div>
                    <div className="entity-detail-row"><span className="entity-detail-label">ICAO24</span><span className="entity-detail-value">{ac.icao24}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Country</span><span className="entity-detail-value">{ac.origin_country}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Category</span><span className="entity-detail-value" style={{ color: ac.category === 'military' ? '#ff1744' : 'inherit' }}>{ac.category.toUpperCase()}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Altitude</span><span className="entity-detail-value">{ac.position.alt?.toFixed(0)} m</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Speed</span><span className="entity-detail-value">{ac.velocity.toFixed(0)} m/s</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Heading</span><span className="entity-detail-value">{ac.heading.toFixed(1)}°</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Position</span><span className="entity-detail-value">{ac.position.lat.toFixed(3)}, {ac.position.lng.toFixed(3)}</span></div>
                    {ac.tracked && <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(255, 145, 0, 0.1)', borderRadius: 6, fontSize: 11, color: '#ff9100' }}>⚠ TRACKED — VIP/NOTABLE AIRCRAFT</div>}
                  </>;
                })()}

                {selectedEntity.type === 'vessel' && (() => {
                  const v = selectedEntity.data as Vessel;
                  return <>
                    <div className="entity-name">{v.name}</div>
                    <div className="entity-detail-row"><span className="entity-detail-label">MMSI</span><span className="entity-detail-value">{v.mmsi}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Type</span><span className="entity-detail-value">{v.type.toUpperCase()}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Flag</span><span className="entity-detail-value">{v.flag}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Speed</span><span className="entity-detail-value">{v.speed.toFixed(1)} kn</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Destination</span><span className="entity-detail-value">{v.destination}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">AIS</span><span className="entity-detail-value" style={{ color: v.ais_active ? '#69f0ae' : '#ff1744' }}>{v.ais_active ? 'ACTIVE' : 'DISABLED'}</span></div>
                    {v.dark_ship && <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(255, 23, 68, 0.1)', borderRadius: 6, fontSize: 11, color: '#ff1744' }}>⚠ DARK SHIP — AIS TRANSPONDER DISABLED</div>}
                  </>;
                })()}

                {selectedEntity.type === 'event' && (() => {
                  const evt = selectedEntity.data as GlobalEvent;
                  return <>
                    <div className="entity-name">{evt.title}</div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Type</span><span className="entity-detail-value">{evt.type.toUpperCase()}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Severity</span><span className="entity-detail-value" style={{ color: getSeverityColor(evt.severity >= 4 ? 'critical' : 'medium') }}>{'★'.repeat(evt.severity)}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Source</span><span className="entity-detail-value">{evt.source}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Time</span><span className="entity-detail-value">{new Date(evt.timestamp).toLocaleString()}</span></div>
                    <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{evt.description}</div>
                    {evt.source_url && <a href={evt.source_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: 8, fontSize: 11, color: 'var(--accent-cyan)' }}>View Source →</a>}
                  </>;
                })()}

                {selectedEntity.type === 'cyber' && (() => {
                  const ct = selectedEntity.data as CyberThreat;
                  return <>
                    <div className="entity-name">{ct.attack_name}</div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Type</span><span className="entity-detail-value">{ct.type.toUpperCase()}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Source IP</span><span className="entity-detail-value">{ct.source_ip}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Severity</span><span className="entity-detail-value" style={{ color: getSeverityColor(ct.severity >= 4 ? 'critical' : 'medium') }}>{'★'.repeat(ct.severity)}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Status</span><span className="entity-detail-value" style={{ color: ct.active ? '#ff1744' : '#69f0ae' }}>{ct.active ? 'ACTIVE' : 'INACTIVE'}</span></div>
                  </>;
                })()}

                {selectedEntity.type === 'infrastructure' && (() => {
                  const inf = selectedEntity.data as Infrastructure;
                  return <>
                    <div className="entity-name">{inf.name}</div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Type</span><span className="entity-detail-value">{inf.type.replace(/_/g, ' ').toUpperCase()}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Country</span><span className="entity-detail-value">{inf.country}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Status</span><span className="entity-detail-value">{inf.status.toUpperCase()}</span></div>
                    {inf.capacity && <div className="entity-detail-row"><span className="entity-detail-label">Capacity</span><span className="entity-detail-value">{inf.capacity}</span></div>}
                  </>;
                })()}

                {selectedEntity.type === 'satellite' && (() => {
                  const sat = selectedEntity.data as SatelliteType;
                  return <>
                    <div className="entity-name">{sat.name}</div>
                    <div className="entity-detail-row"><span className="entity-detail-label">NORAD ID</span><span className="entity-detail-value">{sat.norad_id}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Type</span><span className="entity-detail-value" style={{ color: sat.type === 'military' ? '#ff1744' : 'inherit' }}>{sat.type.toUpperCase()}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Orbit</span><span className="entity-detail-value">{sat.orbit_type}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Country</span><span className="entity-detail-value">{sat.country}</span></div>
                    <div className="entity-detail-row"><span className="entity-detail-label">Altitude</span><span className="entity-detail-value">{sat.position.alt ? (sat.position.alt / 1000).toFixed(0) + ' km' : 'N/A'}</span></div>
                  </>;
                })()}
              </div>
            )}

            {rightTab === 'entity' && !selectedEntity && (
              <div className="empty-state">
                <div className="empty-state-icon"><Target /></div>
                <div className="empty-state-text">Click an entity on the map to view details</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="timeline-bar">
        <div className="timeline-controls">
          <button className="timeline-btn" onClick={() => setTimeValue(v => Math.max(0, v - 10))}>
            <SkipBack size={14} />
          </button>
          <button className="timeline-btn" onClick={() => setIsPlaying(!isPlaying)} style={isPlaying ? { background: 'var(--accent-cyan)', color: '#050a18' } : {}}>
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button className="timeline-btn" onClick={() => setTimeValue(v => Math.min(100, v + 10))}>
            <SkipForward size={14} />
          </button>
        </div>

        <div className="timeline-slider-container">
          <div className="timeline-labels">
            <span>-24h</span>
            <span>-18h</span>
            <span>-12h</span>
            <span>-6h</span>
            <span>NOW</span>
          </div>
          <input
            type="range"
            className="timeline-slider"
            min="0"
            max="100"
            value={timeValue}
            onChange={e => setTimeValue(Number(e.target.value))}
          />
        </div>

        <div className="timeline-time-display">
          <Clock size={12} style={{ marginRight: 6 }} />
          {currentTime.toISOString().replace('T', ' ').substring(0, 19)} UTC
        </div>
        <div className="timeline-mode">
          {timeValue >= 95 ? 'LIVE' : 'REPLAY'}
        </div>
      </div>

      {/* ── CCTV Camera Viewer Modal ── */}
      {selectedCamera && (() => {
        const cam = selectedCamera;
        return (
        <div className="cctv-modal-overlay" onClick={() => setSelectedCamera(null)}>
          <div className="cctv-modal" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="cctv-modal-header">
              <div className="cctv-modal-title">
                <Video size={16} style={{ color: '#e040fb', marginRight: 8 }} />
                <span>LIVE SURVEILLANCE — {cam.name}</span>
                <span className="cctv-live-badge">● LIVE</span>
              </div>
              <button className="cctv-close-btn" onClick={() => setSelectedCamera(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="cctv-modal-body">
              {/* Camera Feed */}
              <div className="cctv-feed-container">
                <iframe
                  src={`/api/proxy?url=${encodeURIComponent(cam.stream_url)}`}
                  className="cctv-feed-iframe"
                  title={cam.name}
                  allow="autoplay; fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
                <div className="cctv-feed-overlay">
                  <div className="cctv-feed-info">
                    <span className="cctv-rec-indicator">● REC</span>
                    <span>{cam.city}, {cam.country}</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Camera List Sidebar */}
              <div className="cctv-sidebar">
                <div className="cctv-sidebar-title">All Cameras ({cameras.length})</div>
                <div className="cctv-camera-list">
                  {cameras.map(c => (
                    <div
                      key={c.id}
                      className={`cctv-camera-item ${c.id === cam.id ? 'active' : ''}`}
                      onClick={() => setSelectedCamera(c)}
                    >
                      <div className="cctv-camera-item-icon" style={{ color: getCCTVCategoryColor(c.category) }}>
                        {getCCTVCategoryIcon(c.category)}
                      </div>
                      <div className="cctv-camera-item-info">
                        <div className="cctv-camera-item-name">{c.name}</div>
                        <div className="cctv-camera-item-meta">
                          {c.city} · {c.source} · {c.category}
                        </div>
                      </div>
                      <div className="cctv-camera-item-status" style={{ 
                        background: c.status === 'online' ? '#69f0ae' : '#ff1744' 
                      }} />
                    </div>
                  ))}
                </div>

                {/* Selected camera details */}
                <div className="cctv-detail-panel">
                  <div className="section-title">Camera Details</div>
                  <div className="entity-detail-row"><span className="entity-detail-label">Name</span><span className="entity-detail-value">{cam.name}</span></div>
                  <div className="entity-detail-row"><span className="entity-detail-label">City</span><span className="entity-detail-value">{cam.city}</span></div>
                  <div className="entity-detail-row"><span className="entity-detail-label">Country</span><span className="entity-detail-value">{cam.country}</span></div>
                  <div className="entity-detail-row"><span className="entity-detail-label">Category</span><span className="entity-detail-value" style={{ color: getCCTVCategoryColor(cam.category) }}>{cam.category.toUpperCase()}</span></div>
                  <div className="entity-detail-row"><span className="entity-detail-label">Source</span><span className="entity-detail-value">{cam.source}</span></div>
                  <div className="entity-detail-row"><span className="entity-detail-label">Status</span><span className="entity-detail-value" style={{ color: '#69f0ae' }}>{cam.status.toUpperCase()}</span></div>
                  {cam.resolution && <div className="entity-detail-row"><span className="entity-detail-label">Resolution</span><span className="entity-detail-value">{cam.resolution}</span></div>}
                  <div className="entity-detail-row"><span className="entity-detail-label">Position</span><span className="entity-detail-value">{cam.position.lat.toFixed(4)}, {cam.position.lng.toFixed(4)}</span></div>
                  <a href={cam.stream_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: 10, fontSize: 11, color: 'var(--accent-cyan)', cursor: 'pointer' }}>Open in new tab →</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
