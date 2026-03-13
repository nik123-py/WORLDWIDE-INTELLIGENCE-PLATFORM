// Maritime vessel tracking — REAL-TIME global AIS data
// Primary: Finnish Digitraffic Open AIS API (free, no key, thousands of ships)
// Coverage: Baltic Sea, North Sea, Atlantic approaches — the busiest shipping lanes in the world
import { Vessel } from '@/types';
import { proxyFetch } from '@/utils/proxyFetch';

// Digitraffic Marine AIS API — completely free, no API key, returns GeoJSON
const DIGITRAFFIC_LOCATIONS = 'https://meri.digitraffic.fi/api/ais/v1/locations';

function classifyShipType(navStatus: number, shipType?: number): Vessel['type'] {
  if (shipType) {
    if (shipType >= 70 && shipType <= 79) return 'cargo';
    if (shipType >= 80 && shipType <= 89) return 'tanker';
    if (shipType >= 60 && shipType <= 69) return 'passenger';
    if (shipType >= 30 && shipType <= 39) return 'fishing';
    if (shipType >= 35 && shipType <= 50) return 'military';
  }
  // Fall back to navigation status
  if (navStatus === 7) return 'fishing';
  if (navStatus === 0 || navStatus === 8) return 'cargo'; // under way using engine / sailing
  return 'unknown';
}

function getMIDCountry(mmsi: number): string {
  // Maritime Identification Digits — first 3 digits of MMSI encode the flag state
  const mid = Math.floor(mmsi / 1000000);
  const midMap: Record<number, string> = {
    201: 'AL', 202: 'AD', 203: 'AT', 205: 'BE', 209: 'CY',
    210: 'CY', 211: 'DE', 212: 'CY', 213: 'GE', 214: 'MD',
    215: 'MT', 216: 'ZZ', 218: 'DE', 219: 'DK', 220: 'DK',
    224: 'ES', 225: 'ES', 226: 'FR', 227: 'FR', 228: 'FR',
    229: 'MT', 230: 'FI', 231: 'FO', 232: 'GB', 233: 'GB',
    234: 'GB', 235: 'GB', 236: 'GI', 237: 'GR', 238: 'HR',
    239: 'GR', 240: 'GR', 241: 'GR', 242: 'MA', 243: 'HU',
    244: 'NL', 245: 'NL', 246: 'NL', 247: 'IT', 248: 'MT',
    249: 'MT', 250: 'IE', 251: 'IS', 252: 'LI', 253: 'LU',
    254: 'MC', 255: 'PT', 256: 'MT', 257: 'NO', 258: 'NO',
    259: 'NO', 261: 'PL', 263: 'PT', 264: 'RO', 265: 'SE',
    266: 'SE', 267: 'SK', 268: 'SM', 269: 'CH', 270: 'CZ',
    271: 'TR', 272: 'UA', 273: 'RU', 274: 'MK', 275: 'LV',
    276: 'EE', 277: 'LT', 278: 'SI', 279: 'ME',
    301: 'AI', 303: 'US', 304: 'AG', 305: 'AG', 306: 'CW',
    307: 'AW', 308: 'BS', 309: 'BS', 310: 'BM', 311: 'BS',
    312: 'BZ', 314: 'BB', 316: 'CA', 319: 'KY',
    338: 'US', 366: 'US', 367: 'US', 368: 'US', 369: 'US',
    370: 'PA', 371: 'PA', 372: 'PA', 373: 'PA', 374: 'PA',
    375: 'PR', 376: 'PR', 377: 'PR',
    401: 'AF', 403: 'SA', 405: 'BD', 408: 'BH', 410: 'BT',
    412: 'CN', 413: 'CN', 414: 'CN', 416: 'TW',
    417: 'LK', 419: 'IN', 422: 'IR', 423: 'AZ',
    431: 'JP', 432: 'JP', 440: 'KR', 441: 'KR',
    443: 'PS', 445: 'KP', 447: 'KW', 450: 'LB',
    453: 'MM', 455: 'MV', 457: 'MN', 459: 'NP',
    461: 'OM', 463: 'PK', 466: 'QA', 468: 'SY',
    470: 'AE', 471: 'AE', 472: 'TJ', 473: 'YE',
    477: 'HK', 478: 'BA', 501: 'AQ', 503: 'AU',
    506: 'MM', 508: 'BN', 510: 'FM', 511: 'PW',
    512: 'NZ', 514: 'KH', 515: 'KH', 516: 'CX',
    518: 'CK', 520: 'FJ', 523: 'CC', 525: 'ID',
    529: 'KI', 531: 'LA', 533: 'MY', 536: 'MP',
    538: 'MH', 540: 'NC', 542: 'NU', 544: 'NR',
    546: 'WS', 548: 'SB', 550: 'TL', 553: 'PG',
    555: 'PN', 557: 'PH', 559: 'LK',
    563: 'SG', 564: 'SG', 565: 'SG', 566: 'SG',
    567: 'TH', 570: 'TO', 572: 'TV', 574: 'VN',
    576: 'VU', 577: 'VU', 578: 'WF',
    601: 'ZA', 603: 'AO', 605: 'DZ', 607: 'TF',
    608: 'IO', 609: 'BI', 610: 'BJ', 611: 'BW',
    612: 'CF', 613: 'CM', 615: 'CG', 616: 'KM',
    617: 'CV', 618: 'AQ', 619: 'CI', 620: 'KM',
    621: 'DJ', 622: 'EG', 624: 'ET', 625: 'ER',
    626: 'GA', 627: 'GH', 629: 'GM', 630: 'GW',
    631: 'GQ', 632: 'GN', 633: 'BF', 634: 'KE',
    635: 'AQ', 636: 'LR', 637: 'LR', 638: 'SS',
    642: 'LY', 644: 'LS', 645: 'MU', 647: 'MG',
    649: 'ML', 650: 'MZ', 654: 'MR', 655: 'MW',
    656: 'NE', 657: 'NG', 659: 'NA', 660: 'RE',
    661: 'RW', 662: 'SD', 663: 'SN', 664: 'SC',
    665: 'SH', 666: 'SO', 667: 'SL', 668: 'ST',
    669: 'SZ', 670: 'TD', 671: 'TG', 672: 'TN',
    674: 'TZ', 675: 'UG', 676: 'CD', 677: 'TZ',
    678: 'ZM', 679: 'ZW',
  };
  return midMap[mid] || 'UNK';
}

// Cache for vessel data to avoid hammering the API
let cachedVessels: Vessel[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

export async function fetchMaritimeData(): Promise<Vessel[]> {
  if (typeof window === 'undefined') return [];

  // Return cached data if fresh enough
  if (cachedVessels.length > 0 && Date.now() - lastFetchTime < CACHE_DURATION) {
    return cachedVessels;
  }

  try {
    const res = await proxyFetch(DIGITRAFFIC_LOCATIONS);
    if (!res.ok) {
      console.warn('Digitraffic AIS API returned', res.status);
      return cachedVessels; // Return stale cache on error
    }

    const geojson = await res.json();
    if (!geojson?.features?.length) return cachedVessels;

    // Sample up to 2000 vessels for performance (the full feed has 10,000+)
    const features = geojson.features;
    const step = Math.max(1, Math.floor(features.length / 2000));

    const vessels: Vessel[] = [];
    for (let i = 0; i < features.length && vessels.length < 2000; i += step) {
      const f = features[i];
      const props = f.properties;
      const coords = f.geometry?.coordinates;
      if (!coords || coords.length < 2) continue;

      const mmsi = props.mmsi || f.mmsi;
      if (!mmsi) continue;

      vessels.push({
        mmsi: String(mmsi),
        name: props.name || `VESSEL-${mmsi}`,
        type: classifyShipType(props.navStat ?? -1, props.shipType),
        flag: getMIDCountry(mmsi),
        position: {
          lat: coords[1],
          lng: coords[0],
        },
        speed: props.sog ?? 0,
        heading: props.cog ?? 0,
        destination: props.destination || 'Unknown',
        ais_active: true,
        dark_ship: false,
        last_update: props.timestampExternal
          ? new Date(props.timestampExternal).getTime() / 1000
          : Date.now() / 1000,
        trail: [],
      });
    }

    cachedVessels = vessels;
    lastFetchTime = Date.now();
    return vessels;
  } catch (err) {
    console.warn('Maritime fetch error:', err);
    return cachedVessels;
  }
}
