import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapPicker = ({ lat, lng, onChange }) => {
  const [position, setPosition] = useState([lat || 20.5937, lng || 78.9629]);

  useEffect(() => {
    if (lat && lng) {
      setPosition([lat, lng]);
    }
  }, [lat, lng]);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onChange({ lat, lng });
      },
    });
    return null;
  };

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #e2e8f0', marginTop: '12px' }}>
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} />
        <MapEvents />
      </MapContainer>
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>
        Click on the map to pin your exact business location.
      </p>
    </div>
  );
};

export default MapPicker;
