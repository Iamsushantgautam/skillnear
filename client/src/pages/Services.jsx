import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search, MapPin, Star, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Services = () => {
    const { userLocation } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState(userLocation?.city && userLocation.city !== 'All of India' ? userLocation.city : '');

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
                const { data } = await api.get(`/api/services?category=${category}&keyword=${searchTerm}&location=${location}`);
                setServicesList(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching services", error);
                setLoading(false);
            }
        };
        fetchServices();
    }, [category, searchTerm, location]);

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
                            <option value="Plumbers">Plumbers</option>
                            <option value="Electricians">Electricians</option>
                            <option value="Web Developers">Web Developers</option>
                        </select>
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

                <h2 className="text-h2" style={{ marginBottom: '24px', fontSize: '1.5rem' }}>
                    {category ? `${category} Services` : 'All Services'}
                </h2>

                <div style={styles.grid}>
                    {loading ? (
                        <p>Loading services...</p>
                    ) : servicesList.length === 0 ? (
                        <p>No services found matching your criteria.</p>
                    ) : (
                        servicesList.map((srv) => (
                            <Link to={`/services/${srv._id}`} key={srv._id} className="card" style={styles.serviceCard}>
                                <img src={srv.images && srv.images.length > 0 ? srv.images[0] : 'https://via.placeholder.com/300x200'} alt={srv.title} style={styles.cardImage} />
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
                                            <img src={(srv.provider && srv.provider.avatar) ? srv.provider.avatar : "https://via.placeholder.com/30"} alt="Avatar" style={{ borderRadius: '50%', width: '24px', height: '24px' }} />
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
