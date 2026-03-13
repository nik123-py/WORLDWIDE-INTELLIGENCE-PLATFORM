// Infrastructure monitoring service — power plants, nuclear, submarine cables, military bases
import { Infrastructure } from '@/types';

export function fetchInfrastructureData(): Infrastructure[] {
  return [
    // Nuclear Facilities
    { id: 'nuc-1', name: 'Zaporizhzhia NPP', type: 'nuclear', position: { lat: 47.508, lng: 34.585 }, country: 'UA', status: 'active', capacity: '5700 MW' },
    { id: 'nuc-2', name: 'Fukushima Daiichi', type: 'nuclear', position: { lat: 37.421, lng: 141.033 }, country: 'JP', status: 'decommissioned', capacity: '4696 MW' },
    { id: 'nuc-3', name: 'Bruce Nuclear', type: 'nuclear', position: { lat: 44.325, lng: -81.597 }, country: 'CA', status: 'active', capacity: '6234 MW' },
    { id: 'nuc-4', name: 'Hinkley Point C', type: 'nuclear', position: { lat: 51.208, lng: -3.133 }, country: 'GB', status: 'under_construction', capacity: '3260 MW' },
    { id: 'nuc-5', name: 'Tianwan NPP', type: 'nuclear', position: { lat: 34.687, lng: 119.459 }, country: 'CN', status: 'active', capacity: '6680 MW' },
    { id: 'nuc-6', name: 'Barakah NPP', type: 'nuclear', position: { lat: 23.959, lng: 52.265 }, country: 'AE', status: 'active', capacity: '5600 MW' },
    { id: 'nuc-7', name: 'Kudankulam NPP', type: 'nuclear', position: { lat: 8.168, lng: 77.709 }, country: 'IN', status: 'active', capacity: '2000 MW' },

    // Major Airports
    { id: 'apt-1', name: 'Ramstein Air Base', type: 'airport', position: { lat: 49.437, lng: 7.600 }, country: 'DE', status: 'active' },
    { id: 'apt-2', name: 'Diego Garcia', type: 'military_base', position: { lat: -7.316, lng: 72.411 }, country: 'US', status: 'active' },
    { id: 'apt-3', name: 'Al Udeid Air Base', type: 'military_base', position: { lat: 25.117, lng: 51.315 }, country: 'QA', status: 'active' },
    { id: 'apt-4', name: 'Yokota Air Base', type: 'military_base', position: { lat: 35.748, lng: 139.348 }, country: 'JP', status: 'active' },
    { id: 'apt-5', name: 'Incirlik Air Base', type: 'military_base', position: { lat: 37.002, lng: 35.426 }, country: 'TR', status: 'active' },
    { id: 'apt-6', name: 'Thule Air Base', type: 'military_base', position: { lat: 76.531, lng: -68.703 }, country: 'GL', status: 'active' },

    // Major Ports
    { id: 'port-1', name: 'Port of Shanghai', type: 'port', position: { lat: 30.630, lng: 122.065 }, country: 'CN', status: 'active' },
    { id: 'port-2', name: 'Port of Singapore', type: 'port', position: { lat: 1.265, lng: 103.820 }, country: 'SG', status: 'active' },
    { id: 'port-3', name: 'Port of Rotterdam', type: 'port', position: { lat: 51.950, lng: 4.130 }, country: 'NL', status: 'active' },
    { id: 'port-4', name: 'Strait of Hormuz', type: 'port', position: { lat: 26.567, lng: 56.250 }, country: 'OM', status: 'active' },
    { id: 'port-5', name: 'Suez Canal', type: 'port', position: { lat: 30.457, lng: 32.349 }, country: 'EG', status: 'active' },
    { id: 'port-6', name: 'Panama Canal', type: 'port', position: { lat: 9.080, lng: -79.681 }, country: 'PA', status: 'active' },
    { id: 'port-7', name: 'Sevastopol Naval Base', type: 'military_base', position: { lat: 44.616, lng: 33.525 }, country: 'RU', status: 'active' },

    // Power Plants
    { id: 'pp-1', name: 'Three Gorges Dam', type: 'power_plant', position: { lat: 30.823, lng: 111.003 }, country: 'CN', status: 'active', capacity: '22500 MW' },
    { id: 'pp-2', name: 'Itaipu Dam', type: 'power_plant', position: { lat: -25.408, lng: -54.589 }, country: 'BR', status: 'active', capacity: '14000 MW' },
    { id: 'pp-3', name: 'Guri Dam', type: 'power_plant', position: { lat: 7.758, lng: -62.977 }, country: 'VE', status: 'active', capacity: '10235 MW' },

    // Pipelines
    { id: 'pipe-1', name: 'Nord Stream (damaged)', type: 'pipeline', position: { lat: 55.5, lng: 15.5 }, country: 'DE', status: 'inactive' },
    { id: 'pipe-2', name: 'TurkStream', type: 'pipeline', position: { lat: 41.5, lng: 30.0 }, country: 'TR', status: 'active' },
    { id: 'pipe-3', name: 'Trans-Alaska Pipeline', type: 'pipeline', position: { lat: 64.0, lng: -149.0 }, country: 'US', status: 'active' },

    // Dams
    { id: 'dam-1', name: 'Hoover Dam', type: 'dam', position: { lat: 36.016, lng: -114.738 }, country: 'US', status: 'active' },
    { id: 'dam-2', name: 'Aswan High Dam', type: 'dam', position: { lat: 23.970, lng: 32.878 }, country: 'EG', status: 'active' },
  ];
}
