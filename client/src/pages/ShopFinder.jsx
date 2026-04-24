import React, { useState, useEffect } from 'react';
import { MapPin, Store, Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';
import { INDIAN_CITIES } from '../utils/constants';
import './ShopFinder.css';

const ShopFinder = () => {
    const { userLocation } = useAuthStore();
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState(userLocation?.city || 'All of India');
    const [selectedPincode, setSelectedPincode] = useState(userLocation?.pincode || '');

    useEffect(() => {
        if (userLocation) {
            setSelectedCity(userLocation.city || 'All of India');
            setSelectedPincode(userLocation.pincode || '');
        }
    }, [userLocation]);

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const { data } = await api.get('/api/services?businessType=shop');
                setShops(data);
            } catch (error) {
                console.error("Error fetching shops:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchShops();
    }, []);

    const userCity = selectedCity !== 'All of India' ? selectedCity : '';
    const isLocationSelected = userCity !== '' || selectedPincode !== '';

    const filteredShops = shops.filter(shop => {
        // If no location selected, we might want to return everything or nothing based on preference
        // Based on user feedback "why it still shows shops", we will treat "All of India" as a non-filter
        // but only if we want to force hyperlocal. 
        
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            shop.title?.toLowerCase().includes(query) ||
            shop.category?.toLowerCase().includes(query) ||
            shop.provider?.name?.toLowerCase().includes(query) ||
            shop.location?.address?.toLowerCase().includes(query) ||
            shop.location?.zipCode?.includes(query) ||
            shop.location?.city?.toLowerCase().includes(query);

        if (!isLocationSelected) return matchesSearch; // Still show if searching by name? 
        // No, user wants to know why it shows shops when location isn't selected.
        // Let's refine: If location is selected, enforce it. If not, maybe show a hint.

        const cityTerm = userCity.toLowerCase();
        const matchesCity = userCity === '' ||
            (shop.location?.city?.toLowerCase().includes(cityTerm)) ||
            (shop.location?.address?.toLowerCase().includes(cityTerm));

        const matchesPincode = selectedPincode === '' ||
            (shop.location?.zipCode === selectedPincode) ||
            (shop.location?.pincode === selectedPincode) ||
            (shop.coveragePincodes?.includes(selectedPincode));

        return matchesSearch && (selectedPincode ? (matchesPincode || matchesCity) : matchesCity);
    });

    return (
        <div className="shop-finder-container">
            <div className="shop-finder-header">
                <div className="container">
                    <h1 className="shop-finder-title">
                        Shop Finder Near Me
                    </h1>
                    <p className="shop-finder-subtitle">
                        Discover verified local shops, boutiques, and service centers in {selectedPincode ? `area ${selectedPincode}` : (userCity || 'your area')}
                    </p>

                    <div className="shop-finder-search">
                        <div className="search-input-group">
                            <Search size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                            <input
                                type="text"
                                placeholder="Search by shop name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="search-divider"></div>
                        <div className="search-select-group">
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                            >
                                <option value="All of India">All Cities</option>
                                {INDIAN_CITIES.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container shop-finder-results-container" style={{ padding: '60px 20px' }}>
                <div className="shop-finder-results-header">
                    <h2 className="text-h2">
                        {!isLocationSelected ? 'Nearby Shops' : `Local Shops in ${userCity || selectedPincode}`}
                    </h2>
                    {!loading && isLocationSelected && (
                        <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>
                            {filteredShops.length} {filteredShops.length === 1 ? 'shop' : 'shops'} found
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="shop-finder-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="card shop-card-item" style={{ height: '380px' }}>
                                <div className="skeleton" style={{ width: '100%', height: '200px' }}></div>
                                <div style={{ padding: '24px' }}>
                                    <div className="skeleton" style={{ width: '40%', height: '20px', marginBottom: '12px' }}></div>
                                    <div className="skeleton" style={{ width: '80%', height: '16px', marginBottom: '20px' }}></div>
                                    <div className="skeleton" style={{ width: '100%', height: '16px', marginBottom: '12px' }}></div>
                                    <div className="skeleton" style={{ width: '60%', height: '16px', marginBottom: '24px' }}></div>
                                    <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: '12px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !isLocationSelected ? (
                    <div className="card" style={{ textAlign: 'center', padding: '80px 20px', border: '2px dashed var(--primary)', background: 'var(--primary-light)', borderRadius: '24px' }}>
                        <MapPin size={60} style={{ color: 'var(--primary)', margin: '0 auto 20px', opacity: 0.8 }} />
                        <h3 className="text-h3" style={{ marginBottom: '12px', fontSize: '1.5rem' }}>Location Required</h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 24px', lineHeight: '1.6' }}>
                            To provide a true hyperlocal experience, please select your city or pincode in the header or the search box above.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <div className="pulse-highlight" style={{ padding: '10px 20px', fontSize: '0.9rem', fontWeight: '700' }}>
                                📍 Select Location Above
                            </div>
                        </div>
                    </div>
                ) : filteredShops.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed var(--border-color)' }}>
                        <Store size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', opacity: 0.5 }} />
                        <h3 className="text-h3" style={{ marginBottom: '8px' }}>No shops found</h3>
                        <p style={{ color: 'var(--text-muted)' }}>
                            We couldn't find any shops matching your criteria in {userCity || 'this area'}.
                        </p>
                    </div>
                ) : (
                    <div className="shop-finder-grid">
                        {filteredShops.map((shop) => (
                            <Link to={`/services/${shop._id}`} key={shop._id} className="card shop-card-item">
                                <div className="shop-card-image-wrapper">
                                    <img
                                        src={shop.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.title || 'Shop')}&background=ede9fe&color=4f46e5`}
                                        alt={shop.title}
                                        className="shop-card-image"
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.title || 'Shop')}&background=ede9fe&color=4f46e5`; }}
                                    />
                                    <div className="shop-card-badge">SHOP</div>
                                </div>

                                <div className="shop-card-content">
                                    <h3 className="text-h3" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
                                        {shop.title}
                                    </h3>
                                    <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {shop.category}
                                    </p>

                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px', color: 'var(--text-muted)' }}>
                                        <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--secondary)' }} />
                                        <span style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                                            {shop.location?.address || 'Address not listed'}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--text-muted)' }}>
                                        <Store size={16} style={{ color: 'var(--primary)' }} />
                                        <span style={{ fontSize: '0.85rem' }}>By: {shop.provider?.name}</span>
                                    </div>

                                    <div style={{ marginTop: 'auto' }}>
                                        <div className="btn-primary" style={{ width: '100%', borderRadius: '12px', fontSize: '0.9rem' }}>
                                            View Details
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopFinder;
