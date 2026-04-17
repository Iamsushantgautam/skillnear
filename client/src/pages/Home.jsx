import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search, MapPin, Shield, Star, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
    const [servicesByCategory, setServicesByCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data } = await api.get('/api/services');

                // Group by category
                const grouped = data.reduce((acc, curr) => {
                    const cat = curr.category;
                    if (!acc[cat]) {
                        acc[cat] = [];
                    }
                    if (acc[cat].length < 4) { // Max 4 per category on homepage
                        acc[cat].push(curr);
                    }
                    return acc;
                }, {});

                setServicesByCategory(grouped);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching services", error);
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/services?keyword=${searchQuery}`);
        } else {
            navigate('/services');
        }
    };

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section style={styles.heroSection}>
                <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
                    <h1 className="text-h1 animate-fade-in" style={{ marginBottom: '16px' }}>
                        Find Expert Professionals for Any Task
                    </h1>
                    <p className="text-body animate-fade-in" style={{ marginBottom: '32px', fontSize: '1.1rem' }}>
                        From home repairs to local shop services. Top-rated experts are just a click away.
                    </p>

                    <form onSubmit={handleSearch} style={styles.searchBar} className="animate-fade-in card">
                        <MapPin size={24} color="var(--primary)" />
                        <input
                            type="text"
                            placeholder="Search for services e.g. Plumber, Electrician, Salon..."
                            style={{ ...styles.heroSearchInput, flex: 1 }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="btn-primary" style={{ padding: '12px 24px', borderRadius: 'var(--radius-sm)' }}>
                            Search
                        </button>
                    </form>
                </div>
            </section>

            {/* Categories Quick Links */}
            <section className="container" style={styles.section}>
                <h2 className="text-h2" style={{ marginBottom: '24px' }}>Popular Services</h2>
                <div style={styles.categoryGrid}>
                    {categories.map((cat, idx) => (
                        <Link to={`/services?category=${cat.name}`} key={idx} className="card" style={{ textAlign: 'center', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
                            <div style={styles.catIconWrapper}>{cat.icon}</div>
                            <h3 className="text-h3" style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{cat.name}</h3>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Services by Category Sections */}
            {loading ? (
                <section style={{ backgroundColor: '#ffffff', padding: '60px 0', textAlign: 'center' }}>
                    <p>Loading services...</p>
                </section>
            ) : Object.keys(servicesByCategory).map((category, index) => (
                <section key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : 'var(--bg-color)', padding: '60px 0' }}>
                    <div className="container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 className="text-h2" style={{ textTransform: 'capitalize' }}>{category} Services</h2>
                            <Link to={`/services?category=${category}`} className="text-body" style={{ color: 'var(--primary)', fontWeight: '500' }}>
                                View All
                            </Link>
                        </div>
                        <div style={styles.featuredGrid}>
                            {servicesByCategory[category].map((service) => (
                                <Link to={`/services/${service._id}`} key={service._id} className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: 0, overflow: 'hidden', cursor: 'pointer' }}>
                                    <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#f3f4f6' }}>
                                        <img src={service.images && service.images.length > 0 ? service.images[0] : (service.provider?.avatar && service.provider.avatar.startsWith('http') ? service.provider.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider?.name || service.title || 'S')}&background=f3f4f6&color=4f46e5&size=300`)} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider?.name || service.title || 'S')}&background=f3f4f6&color=4f46e5&size=300`; }} />
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--bg-color)', padding: '4px 8px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Star size={14} color="#f59e0b" fill="#f59e0b" /> {service.rating?.toFixed(1) || '4.5'}
                                        </div>
                                    </div>
                                    <div style={{ padding: '16px' }}>
                                        <h3 className="text-h3" style={{ fontSize: '1.1rem', marginBottom: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{service.title}</h3>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                            <img src={service.provider?.avatar && service.provider.avatar.startsWith('http') ? service.provider.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider?.name || 'P')}&background=ede9fe&color=4f46e5&size=32`} alt="Provider" style={{ width: '28px', height: '28px', borderRadius: '50%' }} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider?.name || 'P')}&background=ede9fe&color=4f46e5&size=32`; }} />
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>{service.provider?.name || 'Unknown Provider'}</span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                <MapPin size={14} />
                                                <span>{service.location?.city || 'Remote'}</span>
                                            </div>
                                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                                ${service.price} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>{service.priceType === 'hourly' ? '/ hr' : ''}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            ))}

            {/* Trust & Safety */}
            <section className="container" style={styles.section}>
                <div style={styles.trustBanner} className="card">
                    <div style={styles.trustItem}>
                        <Shield size={40} color="var(--secondary)" />
                        <h3 className="text-h3" style={{ fontSize: '1.2rem', margin: '12px 0 8px' }}>Verified Professionals</h3>
                        <p className="text-body" style={{ fontSize: '0.9rem' }}>Every provider undergoes strict identity and background checks.</p>
                    </div>
                    <div style={styles.trustItem}>
                        <Star size={40} color="var(--secondary)" />
                        <h3 className="text-h3" style={{ fontSize: '1.2rem', margin: '12px 0 8px' }}>Quality Guaranteed</h3>
                        <p className="text-body" style={{ fontSize: '0.9rem' }}>High standards are maintained through constant user reviews.</p>
                    </div>
                    <div style={styles.trustItem}>
                        <Clock size={40} color="var(--secondary)" />
                        <h3 className="text-h3" style={{ fontSize: '1.2rem', margin: '12px 0 8px' }}>On-Time Service</h3>
                        <p className="text-body" style={{ fontSize: '0.9rem' }}>Providers are committed to arriving at the scheduled time.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

const categories = [
    { name: 'Carpenters', icon: '🔨' },
    { name: 'Plumbers', icon: '🔧' },
    { name: 'Electricians', icon: '⚡' },
    { name: 'Salon', icon: '💇' },
    { name: 'Tutors', icon: '📚' },
    { name: 'Painters', icon: '🖌️' },
    { name: 'Cleaning', icon: '🧹' },
    { name: 'Pest Control', icon: '🐜' },
];

const styles = {
    heroSection: {
        padding: '80px 0 60px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
    },
    searchBar: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 8px 8px 24px',
        borderRadius: '100px', // Pills design
    },
    heroSearchInput: {
        border: 'none',
        outline: 'none',
        fontSize: '1.1rem',
        background: 'transparent',
    },
    section: {
        padding: '60px 20px',
    },
    categoryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '20px',
    },
    catIconWrapper: {
        fontSize: '2.5rem',
        marginBottom: '12px',
    },
    featuredGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
    },
    trustBanner: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '32px',
        backgroundColor: 'var(--bg-color)',
        borderColor: 'transparent',
    },
    trustItem: {
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    }
};

export default Home;
