import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { noakhaliData, Upazila } from '../data';

// Override default leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const getMarkerColor = (status: Upazila['status']) => {
  switch (status) {
    case 'ON': return '#10b981'; // emerald-500
    case 'OFF': return '#ef4444'; // red-500
    case 'FLUCTUATING': return '#f59e0b'; // amber-500
    case 'MAINTENANCE': return '#6b7280'; // gray-500
    default: return '#6b7280';
  }
};

const createCustomMarker = (status: Upazila['status']) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${getMarkerColor(status)}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
  });
};

export default function MapComponent({ onMarkerClick }: { onMarkerClick: (id: string) => void }) {
  return (
    <MapContainer center={[22.8228, 91.1037] as [number, number]} zoom={10} style={{ height: '400px', width: '100%', borderRadius: '16px' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {noakhaliData.map((area) => (
        <Marker
          key={area.id}
          position={[area.lat, area.lng]}
          icon={createCustomMarker(area.status)}
          eventHandlers={{
            click: () => onMarkerClick(area.id),
          }}
        >
          <Popup>
            <div className="text-sm">
              <strong className="block mb-1">{area.name}</strong>
              <span className="text-xs">অবস্থা: {area.status}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
