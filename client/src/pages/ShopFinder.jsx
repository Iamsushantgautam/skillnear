import React, { useState, useEffect } from 'react';
import { MapPin, Store, Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';

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

    const filteredShops = shops.filter(shop => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
            shop.title?.toLowerCase().includes(query) ||
            shop.category?.toLowerCase().includes(query) ||
            shop.provider?.name?.toLowerCase().includes(query) ||   // Owner name
            shop.location?.address?.toLowerCase().includes(query) || // Area name
            shop.location?.zipCode?.includes(query) ||            // Pincode in search
            shop.location?.city?.toLowerCase().includes(query);   // City in search
        
        const cityTerm = userCity.toLowerCase();
        
        // City matching from nav
        const matchesCity = userCity === '' || 
                          (shop.location?.city?.toLowerCase().includes(cityTerm)) || 
                          (shop.location?.address?.toLowerCase().includes(cityTerm));

        // Pincode matching from nav
        const matchesPincode = selectedPincode === '' || 
                             (shop.location?.zipCode === selectedPincode) ||
                             (shop.location?.pincode === selectedPincode) || // Defensive
                             (shop.coveragePincodes?.includes(selectedPincode));

        return matchesSearch && (selectedPincode ? (matchesPincode || matchesCity) : matchesCity);
    });

    return (
        <div style={{ backgroundColor: '#f9fafb', minHeight: 'calc(100vh - 70px)' }}>
            <div style={styles.header}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h1 className="text-h1" style={{ color: '#fff', marginBottom: '16px', fontSize: '2.5rem' }}>
                        Shop Finder Near Me
                    </h1>
                    <p className="text-body" style={{ color: '#e0e7ff', marginBottom: '32px', fontSize: '1.1rem' }}>
                        Discover verified local shops, boutiques, and service centers in {selectedPincode ? `area ${selectedPincode}` : (userCity || 'your area')}
                    </p>
                    
                    <div className="card" style={styles.searchBar}>
                        <Search size={22} color="var(--primary)" />
                        <input
                            type="text"
                            placeholder="Search by shop name or specialty..."
                            style={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div style={{ height: '24px', width: '1px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 8px' }}></div>
                        <select 
                            style={{ ...styles.searchInput, flex: '0 0 auto', width: '150px', cursor: 'pointer' }}
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                        >
                            <option value="All of India" style={{ color: '#333' }}>All Cities</option>
                            {[
                                "Ahmedabad", "Bangalore", "Chandigarh", "Chennai", "Coimbatore", 
                                "Delhi", "Gurgaon", "Hyderabad", "Indore", "Jaipur", 
                                "Kanpur", "Kochi", "Kolkata", "Lucknow", "Mumbai", 
                                "Nagpur", "Noida", "Patna", "Pune", "Surat", "Thane", "Varanasi"
                            ].sort().map(city => (
                                <option key={city} value={city} style={{ color: '#333' }}>{city}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="container" style={{ padding: '60px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 className="text-h2">
                        {userCity ? `Local Shops in ${userCity}` : 'All Shops (Pan-India)'}
                    </h2>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>
                        {filteredShops.length} {filteredShops.length === 1 ? 'shop' : 'shops'} found
                    </span>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Store size={48} style={{ color: 'var(--border-color)', margin: '0 auto 16px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                        <p style={{ color: 'var(--text-muted)' }}>Loading nearby shops...</p>
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
                    <div style={styles.grid}>
                        {filteredShops.map((shop) => (
                            <Link to={`/services/${shop._id}`} key={shop._id} className="card" style={{ ...styles.shopCard, textDecoration: 'none', color: 'inherit' }}>
                                <div style={styles.imageWrapper}>
                                    <img 
                                        src={shop.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.title || 'Shop')}&background=ede9fe&color=4f46e5`}
                                        alt={shop.title}
                                        style={styles.shopImage}
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.title || 'Shop')}&background=ede9fe&color=4f46e5`; }}
                                    />
                                    <div style={styles.badge}>SHOP</div>
                                </div>
                                
                                <div style={styles.cardContent}>
                                    <h3 className="text-h3" style={{ fontSize: '1.25rem', marginBottom: '4px' }}>
                                        {shop.title}
                                    </h3>
                                    <p style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem', marginBottom: '16px' }}>
                                        {shop.category}
                                    </p>
                                    
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px', color: 'var(--text-muted)' }}>
                                        <MapPin size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <span style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                                            {shop.location?.address || 'Address not listed'}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--text-muted)' }}>
                                        <Store size={18} />
                                        <span style={{ fontSize: '0.9rem' }}>Owner: {shop.provider?.name}</span>
                                    </div>
                                    
                                    <div style={{ marginTop: 'auto' }}>
                                        <div className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', width: '100%', padding: '10px' }}>
                                            View Shop Details
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

const styles = {
    header: {
        backgroundColor: 'var(--primary)',
        backgroundImage: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        padding: '80px 20px',
        color: '#fff',
    },
    searchBar: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 24px',
        borderRadius: '100px',
        maxWidth: '600px',
        margin: '0 auto',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
    },
    searchInput: {
        border: 'none',
        outline: 'none',
        fontSize: '1.1rem',
        background: 'transparent',
        flex: 1,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px',
    },
    shopCard: {
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    imageWrapper: {
        position: 'relative',
        width: '100%',
        height: '200px',
        backgroundColor: '#e2e8f0',
    },
    shopImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    badge: {
        position: 'absolute',
        top: '16px',
        right: '16px',
        backgroundColor: '#10b981',
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        padding: '4px 8px',
        borderRadius: '4px',
        letterSpacing: '1px',
    },
    cardContent: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    }
};

export default ShopFinder;
