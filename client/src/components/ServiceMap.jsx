import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import api from '../utils/api';

// Fix for default marker icons not showing in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom user icon
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const LocationMarker = ({ userLoc }) => {
  const map = useMap();
  useEffect(() => {
    if (userLoc) {
      map.setView(userLoc, 13);
    }
  }, [userLoc, map]);

  return userLoc === null ? null : (
    <Marker position={userLoc} icon={userIcon}>
      <Popup>You are here</Popup>
    </Marker>
  );
};

const ServiceMap = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [nearbyServices, setNearbyServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    
                    try {
                        // Fetch nearby services
                        const { data } = await api.get(`/api/services/nearby?lat=${latitude}&lng=${longitude}&distance=100`);
                        setNearbyServices(data);
                    } catch (error) {
                        console.error('Error fetching nearby services:', error);
                    } finally {
                        setLoading(false);
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    // Default to India center if denied
                    setUserLocation([20.5937, 78.9629]);
                    setLoading(false);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
            setUserLocation([20.5937, 78.9629]);
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <div style={{ height: '500px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <MapPin size={40} className="animate-pulse" style={{ color: 'var(--primary)' }} />
                <p style={{ marginLeft: '12px', color: 'var(--text-muted)' }}>Locating nearby services...</p>
            </div>
        );
    }

    return (
        <div style={{ height: '600px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <MapContainer center={userLocation || [20.5937, 78.9629]} zoom={userLocation ? 13 : 5} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <LocationMarker userLoc={userLocation} />

                {nearbyServices.map((service) => {
                    const lat = service.geoCoordinates?.coordinates?.[1];
                    const lng = service.geoCoordinates?.coordinates?.[0];
                    
                    // Only render if coordinates exist and are not exactly [0,0] (unless it's actually 0,0)
                    if (lat !== undefined && lng !== undefined && !(lat === 0 && lng === 0)) {
                        return (
                            <Marker key={service._id} position={[lat, lng]}>
                                <Popup>
                                    <div style={{ maxWidth: '200px' }}>
                                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>{service.title}</h3>
                                        <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', display: 'inline-block', marginBottom: '8px' }}>
                                            {service.category}
                                        </span>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: 'bold' }}>₹{service.price}</p>
                                        <Link to={`/services/${service._id}`} className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '6px 12px', fontSize: '0.8rem', textDecoration: 'none' }}>
                                            View Details
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    }
                    return null;
                })}
            </MapContainer>
        </div>
    );
};

export default ServiceMap;
