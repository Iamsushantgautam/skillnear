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
            <style>{`
                .shop-finder-header {
                    background-color: var(--primary);
                    background-image: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                    padding: 80px 20px;
                    color: #fff;
                    text-align: center;
                }
                .shop-finder-title {
                    color: #fff;
                    margin-bottom: 16px;
                    font-size: 2.5rem;
                    font-weight: 700;
                }
                .shop-finder-subtitle {
                    color: #e0e7ff;
                    margin-bottom: 32px;
                    font-size: 1.1rem;
                }
                .shop-finder-search {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    padding: 8px 16px;
                    border-radius: 100px;
                    max-width: 700px;
                    margin: 0 auto;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                    background: white;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .search-input-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex: 1;
                    padding: 4px 8px;
                }
                .shop-finder-search input {
                    border: none;
                    outline: none;
                    font-size: 1rem;
                    background: transparent;
                    width: 100%;
                    color: var(--text-main);
                }
                .search-divider {
                    height: 24px;
                    width: 1px;
                    background-color: #e2e8f0;
                    margin: 0 16px;
                }
                .search-select-group {
                    display: flex;
                    align-items: center;
                    padding-right: 8px;
                }
                .shop-finder-search select {
                    border: none;
                    outline: none;
                    font-size: 0.95rem;
                    background: transparent;
                    width: 150px;
                    cursor: pointer;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .shop-finder-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 24px;
                    margin-top: 32px;
                }

                @media (max-width: 768px) {
                    .shop-finder-header {
                        padding: 60px 20px;
                    }
                    .shop-finder-title {
                        font-size: 1.75rem;
                    }
                    .shop-finder-subtitle {
                        font-size: 0.95rem;
                        margin-bottom: 24px;
                    }
                    .shop-finder-search {
                        padding: 8px;
                        border-radius: 16px;
                        flex-direction: column;
                        gap: 0;
                        align-items: stretch;
                        max-width: 100%;
                    }
                    .search-input-group {
                        padding: 12px;
                        border-bottom: 1px solid #f1f5f9;
                    }
                    .search-divider {
                        display: none;
                    }
                    .search-select-group {
                        padding: 12px;
                    }
                    .shop-finder-search select {
                        width: 100%;
                        font-size: 1rem;
                    }
                    .shop-finder-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }
                    .shop-finder-results-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                        margin-bottom: 24px;
                    }
                    .shop-finder-results-container {
                        padding: 40px 15px !important;
                    }
                }

                .shop-finder-results-header {
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    margin-bottom: 32px;
                }

                @media (min-width: 769px) and (max-width: 1024px) {
                    .shop-finder-title {
                        font-size: 2.1rem;
                    }
                    .shop-finder-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>

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
                                {[
                                    "Ahmedabad", "Bangalore", "Chandigarh", "Chennai", "Coimbatore",
                                    "Delhi", "Gurgaon", "Hyderabad", "Indore", "Jaipur",
                                    "Kanpur", "Kochi", "Kolkata", "Lucknow", "Mumbai",
                                    "Nagpur", "Noida", "Patna", "Pune", "Surat", "Thane", "Varanasi"
                                ].sort().map(city => (
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
                    <div className="shop-finder-grid">
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

const styles = {
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
