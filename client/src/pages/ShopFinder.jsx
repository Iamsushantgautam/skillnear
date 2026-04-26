import React, { useState, useEffect } from 'react';
import { MapPin, Store, Search, ExternalLink, Navigation } from 'lucide-react';
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
    const [locationContext, setLocationContext] = useState('');

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

    const filteredShops = React.useMemo(() => {
        if (loading) return [];
        
        const query = searchQuery.toLowerCase().trim();
        const extractedPincode = query.match(/\b\d{6}\b/)?.[0];
        const textQuery = query.replace(/\b\d{6}\b/, '').trim();

        // 1. Initial filter by search query (text + pincode if typed)
        const searchPool = shops.filter(shop => {
            if (!query) return true;
            return (
                shop.title?.toLowerCase().includes(textQuery) ||
                shop.category?.toLowerCase().includes(textQuery) ||
                (extractedPincode && (shop.location?.zipCode === extractedPincode || shop.coveragePincodes?.includes(extractedPincode)))
            );
        });

        // 2. Cascading Hierarchy Logic
        // Priority 1: User's typed or detected Pincode
        const targetPincode = extractedPincode || userLocation?.pincode;
        if (targetPincode) {
            const byPincode = searchPool.filter(s => 
                s.location?.zipCode === targetPincode || 
                s.coveragePincodes?.includes(targetPincode)
            );
            if (byPincode.length > 0) {
                setLocationContext(`Showing results for Pincode ${targetPincode}`);
                return byPincode;
            }
        }

        // Priority 2: User's City
        if (userLocation?.city && userLocation.city !== 'All of India') {
            const byCity = searchPool.filter(s => 
                s.location?.city?.toLowerCase() === userLocation.city.toLowerCase()
            );
            if (byCity.length > 0) {
                setLocationContext(`Showing results in ${userLocation.city}`);
                return byCity;
            }
        }

        // Priority 3: User's State
        if (userLocation?.state) {
            const byState = searchPool.filter(s => 
                s.location?.state?.toLowerCase() === userLocation.state.toLowerCase()
            );
            if (byState.length > 0) {
                setLocationContext(`Showing results from ${userLocation.state}`);
                return byState;
            }
        }

        // Priority 4: All India
        setLocationContext('Showing shops from All over India');
        return searchPool;
    }, [shops, searchQuery, userLocation, loading]);

    const isLocationSelected = selectedCity !== 'All of India' || selectedPincode !== '';

    return (
        <div className="shop-finder-container">
            <div className="shop-finder-header">
                <div className="container">
                    <h1 className="shop-finder-title">
                        Shop Finder Near Me
                    </h1>
                    <p className="shop-finder-subtitle">
                        Discover verified local shops, boutiques, and service centers {searchQuery ? `matching "${searchQuery}"` : (userLocation?.city ? `in ${userLocation.city}` : 'near you')}
                    </p>

                    <div className="shop-finder-search-wrapper">
                        <form className="global-unified-search" onSubmit={(e) => e.preventDefault()}>
                            <div className="search-icon-wrapper">
                                <Search size={22} color="var(--primary)" />
                            </div>
                            <input
                                type="text"
                                className="global-search-input"
                                placeholder="Search by name, category or pincode (e.g. 'Electronics' or '226001')..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="search-action-area">
                                <button 
                                    className="near-me-btn"
                                    onClick={async () => {
                                        if (navigator.geolocation) {
                                            navigator.geolocation.getCurrentPosition(async (position) => {
                                                try {
                                                    const { latitude, longitude } = position.coords;
                                                    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                                                    const data = await res.json();
                                                    if (data.postcode) setSearchQuery(data.postcode);
                                                } catch (err) { console.error(err); }
                                            });
                                        }
                                    }}
                                    type="button"
                                    title="Find shops near me"
                                >
                                    <Navigation size={18} />
                                    <span>Near Me</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="container shop-finder-results-container" style={{ padding: '60px 20px' }}>
                <div className="shop-finder-results-header" style={{ marginBottom: '32px' }}>
                    <div>
                        <h2 className="text-h2" style={{ marginBottom: '8px' }}>
                            {!isLocationSelected ? 'Nearby Shops' : `Local Shops in ${selectedCity !== 'All of India' ? selectedCity : (selectedPincode || 'your area')}`}
                        </h2>
                        {locationContext && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className={`location-context-badge ${locationContext.includes('All over India') ? 'india-pulse' : ''}`} style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 14px',
                                    backgroundColor: locationContext.includes('All over India') ? '#fff7ed' : '#f0f9ff',
                                    color: locationContext.includes('All over India') ? '#ea580c' : '#0284c7',
                                    borderRadius: '100px',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    border: locationContext.includes('All over India') ? '1px solid #ffedd5' : '1px solid #e0f2fe'
                                }}>
                                    <MapPin size={14} />
                                    {locationContext}
                                </span>
                            </div>
                        )}
                    </div>
                    {!loading && isLocationSelected && (
                        <span style={{ color: 'var(--text-muted)', fontWeight: '500', alignSelf: 'flex-end' }}>
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
                            We couldn't find any shops matching your criteria {searchQuery ? `for "${searchQuery}"` : ''} in {userLocation?.city || 'this area'}.
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
