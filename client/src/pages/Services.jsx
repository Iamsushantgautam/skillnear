import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search, MapPin, Star, Filter, Map, List } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import ServiceMap from '../components/ServiceMap';

const Services = () => {
    const { userLocation } = useAuthStore();
    const query = new URLSearchParams(useLocation().search);
    const urlKeyword = query.get('keyword') || '';
    const urlCategory = query.get('category') || '';

    const [searchTerm, setSearchTerm] = useState(urlKeyword);
    const [category, setCategory] = useState(urlCategory);
    const [businessType, setBusinessType] = useState('');
    const [gender, setGender] = useState('');
    const [location, setLocation] = useState(userLocation?.city && userLocation.city !== 'All of India' ? userLocation.city : '');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

    // Sync state with URL changes
    useEffect(() => {
        setSearchTerm(query.get('keyword') || '');
        setCategory(query.get('category') || '');
    }, [useLocation().search]);

    useEffect(() => {
        if (userLocation?.city && userLocation.city !== 'All of India') {
            setLocation(userLocation.city);
        } else {
            setLocation('');
        }
    }, [userLocation]);

    const [servicesList, setServicesList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data } = await api.get(`/api/services?category=${category}&keyword=${searchTerm}&location=${location}&businessType=${businessType}&gender=${gender}`);
                setServicesList(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching services", error);
                setLoading(false);
            }
        };
        fetchServices();
    }, [category, searchTerm, location, businessType, gender]);

    return (
        <div className="container" style={{ padding: '40px 20px', display: 'flex', gap: '32px' }}>

            {/* Sidebar Filter */}
            <aside style={styles.sidebar} className="hide-on-mobile">
                <div className="card" style={{ position: 'sticky', top: '90px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <Filter size={20} />
                        <h3 className="text-h3" style={{ fontSize: '1.2rem' }}>Filters</h3>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.label}>Category</label>
                        <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="">All Categories</option>
                            <option value="Salon">Salon</option>
                            <option value="Carpenters">Carpenters</option>
                            <option value="Plumbers">Plumbers</option>
                            <option value="Electricians">Electricians</option>
                            <option value="Cleaning">Cleaning</option>
                            <option value="AC Repair">AC Repair</option>
                            <option value="Painters">Painters</option>
                            <option value="Tutors">Tutors</option>
                            <option value="Groceries">Groceries</option>
                            <option value="Electronics">Electronics</option>
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.label}>Provider Type</label>
                        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input type="radio" name="bizType" value="" checked={businessType === ''} onChange={() => setBusinessType('')} /> Any Type
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input type="radio" name="bizType" value="service" checked={businessType === 'service'} onChange={() => setBusinessType('service')} /> Services Only
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input type="radio" name="bizType" value="shop" checked={businessType === 'shop'} onChange={() => setBusinessType('shop')} /> Shops Only
                            </label>
                        </div>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.label}>Location (City)</label>
                        <div style={{ ...styles.searchBar, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: '#f9fafb' }}>
                            <MapPin size={16} color="var(--primary)" />
                            <span style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-main)' }}>
                                {userLocation?.city || 'All of India'}
                            </span>
                        </div>
                        <p className="text-small" style={{ marginTop: '4px', color: 'var(--text-muted)' }}>Change location in header (India only)</p>
                    </div>

                    {category === 'Salon' && (
                        <div style={styles.filterGroup}>
                            <label style={styles.label}>Service For</label>
                            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                    <input type="radio" name="gender" value="" checked={gender === ''} onChange={() => setGender('')} /> Any
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                    <input type="radio" name="gender" value="male" checked={gender === 'male'} onChange={() => setGender('male')} /> Men
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                    <input type="radio" name="gender" value="female" checked={gender === 'female'} onChange={() => setGender('female')} /> Women
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                    <input type="radio" name="gender" value="unisex" checked={gender === 'unisex'} onChange={() => setGender('unisex')} /> Unisex
                                </label>
                            </div>
                        </div>
                    )}

                    <div style={styles.filterGroup}>
                        <label style={styles.label}>Price Range</label>
                        <input type="range" min="10" max="1000" style={{ width: '100%' }} />
                        <div className="flex-between text-small" style={{ marginTop: '8px' }}>
                            <span>$10</span>
                            <span>$1000+</span>
                        </div>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.label}>Rating</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" id="star4" /> <label htmlFor="star4">4+ Stars</label>
                        </div>
                    </div>

                    <button className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>Apply Filters</button>
                </div>
            </aside>

            {/* Main Content */}
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={styles.searchBar} className="card">
                        <Search size={20} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Search services..."
                            style={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 className="text-h2" style={{ fontSize: '1.5rem', margin: 0 }}>
                        {category ? `${category} Services` : 'All Services'}
                    </h2>
                    
                    <div style={{ display: 'flex', gap: '8px', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '8px' }}>
                        <button 
                            onClick={() => setViewMode('list')} 
                            style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: viewMode === 'list' ? '#fff' : 'transparent', color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                        >
                            <List size={16} /> List
                        </button>
                        <button 
                            onClick={() => setViewMode('map')} 
                            style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: viewMode === 'map' ? '#fff' : 'transparent', color: viewMode === 'map' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: viewMode === 'map' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                        >
                            <Map size={16} /> Map
                        </button>
                    </div>
                </div>

                {viewMode === 'map' ? (
                    <div className="animate-fade-in">
                        <ServiceMap />
                    </div>
                ) : (
                    <div style={styles.grid} className="animate-fade-in">
                        {loading ? (
                            <p>Loading services...</p>
                        ) : servicesList.length === 0 ? (
                            <p>No services found matching your criteria.</p>
                        ) : (
                            servicesList.map((srv) => (
                            <Link to={`/services/${srv._id}`} key={srv._id} className="card" style={styles.serviceCard}>
                                <img src={srv.images && srv.images.length > 0 ? srv.images[0] : (srv.provider?.avatar && srv.provider.avatar.startsWith('http') ? srv.provider.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(srv.provider?.name || srv.title || 'S')}&background=f3f4f6&color=4f46e5&size=300`)} alt={srv.title} style={styles.cardImage} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(srv.provider?.name || srv.title || 'S')}&background=f3f4f6&color=4f46e5&size=300`; }} />
                                <div style={styles.cardContent}>
                                    <span className="text-small" style={{ color: 'var(--primary)', fontWeight: '600' }}>{srv.category}</span>
                                    <h3 className="text-h3" style={{ fontSize: '1.1rem', margin: '8px 0' }}>{srv.title}</h3>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                                        <Star size={16} color="#f59e0b" fill="#f59e0b" />
                                        <span className="text-small" style={{ fontWeight: '600' }}>{srv.rating}</span>
                                        <span className="text-small">({srv.numReviews})</span>
                                    </div>

                                    <div className="flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <img
                                                src={srv.provider?.avatar && srv.provider.avatar.startsWith('http') ? srv.provider.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(srv.provider?.name || 'P')}&background=ede9fe&color=4f46e5&size=30`}
                                                alt="Avatar"
                                                style={{ borderRadius: '50%', width: '24px', height: '24px', objectFit: 'cover' }}
                                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(srv.provider?.name || 'P')}&background=ede9fe&color=4f46e5&size=30`; }}
                                            />
                                            <span className="text-small">{srv.provider ? srv.provider.name : 'Unknown'}</span>
                                        </div>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                            ${srv.price} <span className="text-small" style={{ fontWeight: '400' }}>{srv.priceType === 'hourly' ? '/hr' : ''}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <MapPin size={14} />
                                        <span>{srv.location?.city ? `${srv.location.city}, ${srv.location.state}` : 'Remote'}</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    sidebar: {
        width: '300px',
        flexShrink: 0,
    },
    filterGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        fontSize: '0.95rem',
    },
    searchBar: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        gap: '12px',
    },
    searchInput: {
        border: 'none',
        outline: 'none',
        width: '100%',
        fontSize: '1rem',
        background: 'transparent',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
    },
    serviceCard: {
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
    },
    cardImage: {
        width: '100%',
        height: '180px',
        objectFit: 'cover',
    },
    cardContent: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    }
};

export default Services;
