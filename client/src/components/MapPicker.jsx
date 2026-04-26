import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
};

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

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        onChange({ lat: latitude, lng: longitude });
      }, (err) => {
        alert("Please enable location services to use this feature.");
      });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', marginTop: '12px' }}>
      <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
          <ChangeView center={position} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position} />
          <MapEvents />
        </MapContainer>
        
        <button 
          onClick={(e) => { e.preventDefault(); handleLocateMe(); }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            background: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 'bold',
            fontSize: '0.75rem',
            color: 'var(--primary)'
          }}
        >
          <Navigation size={14} fill="var(--primary)" />
          Locate Me
        </button>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>
        Click on the map to pin your location or use <b>Locate Me</b> to drop a pin automatically.
      </p>
    </div>
  );
};

export default MapPicker;
