// Maritime vessel tracking — REAL-TIME global AIS data via AISStream.io WebSocket
import { Vessel } from '@/types';

const AISSTREAM_URL = 'wss://stream.aisstream.io/v0/stream';
const API_KEY = '9ee4e4e665f7b4c56c245dfff6601c767d7edebb';

let ws: WebSocket | null = null;
const vesselCache = new Map<string, Vessel>();

// AISStream messages format mapping
interface AISStreamMessage {
  MessageType: string;
  MetaData: {
    MMSI: number;
    ShipName: string;
    latitude: number;
    longitude: number;
    time_utc: string;
  };
  Message: {
    PositionReport?: {
      Cog: number;
      Sog: number;
      Latitude: number;
      Longitude: number;
      TrueHeading: number;
    };
    ShipStaticData?: {
      Name: string;
      Type: number;
      CallSign: string;
      Destination: string;
    };
  };
}

function classifyShipType(typeCode: number): Vessel['type'] {
  if (typeCode >= 70 && typeCode <= 79) return 'cargo';
  if (typeCode >= 80 && typeCode <= 89) return 'tanker';
  if (typeCode >= 60 && typeCode <= 69) return 'passenger';
  if (typeCode >= 30 && typeCode <= 39) return 'fishing';
  if (typeCode >= 35 && typeCode <= 50) return 'military';
  return 'unknown';
}

function initWebSocket() {
  if (typeof window === 'undefined') return;

  try {
    ws = new WebSocket(AISSTREAM_URL);

    ws.onopen = () => {
      console.log('AISStream WebSocket connected');
      ws?.send(JSON.stringify({
        APIKey: API_KEY, // Fix: MUST be exactly APIKey
        BoundingBoxes: [[[-90, -180], [90, 180]]], // Global
        FilterMessageTypes: ['PositionReport', 'ShipStaticData']
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data: AISStreamMessage = JSON.parse(event.data);
        const mmsi = String(data.MetaData.MMSI);

        // Get existing vessel or create new
        let vessel = vesselCache.get(mmsi) || {
          mmsi,
          name: data.MetaData.ShipName?.trim() || `VESSEL-${mmsi}`,
          type: 'unknown',
          flag: 'UNK', // AISStream doesn't provide flags reliably
          position: { lat: data.MetaData.latitude, lng: data.MetaData.longitude },
          speed: 0,
          heading: 0,
          destination: 'Unknown',
          ais_active: true,
          dark_ship: false,
          last_update: Date.now() / 1000,
          trail: []
        };

        if (data.MessageType === 'PositionReport' && data.Message.PositionReport) {
          vessel.position = { 
            lat: data.Message.PositionReport.Latitude,
            lng: data.Message.PositionReport.Longitude
          };
          vessel.speed = data.Message.PositionReport.Sog;
          vessel.heading = data.Message.PositionReport.Cog;
          vessel.last_update = Date.now() / 1000;
        } else if (data.MessageType === 'ShipStaticData' && data.Message.ShipStaticData) {
          if (data.Message.ShipStaticData.Name) {
            vessel.name = data.Message.ShipStaticData.Name.trim();
          }
          vessel.type = classifyShipType(data.Message.ShipStaticData.Type);
          if (data.Message.ShipStaticData.Destination) {
            vessel.destination = data.Message.ShipStaticData.Destination.trim();
          }
        }

        vesselCache.set(mmsi, vessel);

        // Keep cache size manageable to prevent WebGL crashing (max 5000 ships)
        if (vesselCache.size > 5000) {
          const firstKey = vesselCache.keys().next().value;
          if (firstKey) vesselCache.delete(firstKey);
        }
      } catch (err) {
        // Ignore parse errors dynamically
      }
    };

    ws.onerror = () => {
      console.warn('AISStream WebSocket error');
    };

    ws.onclose = () => {
      console.log('AISStream WebSocket closed, reconnecting in 5s...');
      setTimeout(initWebSocket, 5000);
    };
  } catch (err) {
    console.error('Failed to initialize AISStream WebSocket', err);
  }
}

export async function fetchMaritimeData(): Promise<Vessel[]> {
  if (typeof window === 'undefined') return []; // Server side
  
  // Lazy init WebSocket on first fetch
  if (!ws) {
    initWebSocket();
  }

  // If cache is empty, wait up to 3 seconds for the first WebSocket payloads to stream in
  if (vesselCache.size === 0) {
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 100));
      if (vesselCache.size > 10) break; // Break early as soon as we have a handful of ships
    }
  }

  // Return whatever we have accumulated
  return Array.from(vesselCache.values());
}
