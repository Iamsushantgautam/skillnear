import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search, MapPin, Shield, Star, Clock, ChevronRight, Zap, Target, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CategoryBanners from '../components/CategoryBanners';
import allCategoryLineup from '../assets/catg/allCategoryLineup.png';

const Home = () => {
    const [servicesByCategory, setServicesByCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data } = await api.get('/api/services');
                const grouped = data.reduce((acc, curr) => {
                    const cat = curr.category;
                    if (!acc[cat]) acc[cat] = [];
                    if (acc[cat].length < 6) acc[cat].push(curr);
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
        if (searchQuery.trim()) navigate(`/services?keyword=${searchQuery}`);
        else navigate('/services');
    };

    return (
        <div style={{ backgroundColor: '#fff', overflowX: 'hidden' }}>
            <style>{`
                @media (max-width: 768px) {
                    .hero-wrapper-mobile { padding: 20px 0 40px !important; }
                    .hero-grid-mobile { grid-template-columns: 1fr !important; gap: 24px !important; }
                    .hero-title-mobile { font-size: 2.2rem !important; margin-bottom: 24px !important; letter-spacing: -1px !important; }
                    .hero-cat-grid-mobile { grid-template-columns: repeat(3, 1fr) !important; gap: 12px !important; }
                    .ad-banner-mobile { flex-direction: column !important; height: auto !important; }
                    .ad-banner-left { padding: 32px 24px !important; }
                    .ad-banner-right { min-height: 250px !important; }
                }
            `}</style>

            {/* HERO SECTION - Urban Company Style */}
            <section className="hero-wrapper-mobile" style={styles.heroWrapper}>
                <div className="container hero-grid-mobile" style={styles.heroContainer}>
                    {/* Hero Left - Search & Icons */}
                    <div style={styles.heroLeft}>
                        <h1 className="hero-title-mobile" style={styles.heroTitle}>Home services at your doorstep</h1>

                        <div style={styles.searchBoxCard}>
                            <p style={{ fontWeight: '600', marginBottom: '16px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>What are you looking for?</p>
                            <form onSubmit={handleSearch} style={styles.heroSearch}>
                                <Search size={20} color="#94a3b8" />
                                <input
                                    type="text"
                                    placeholder="Search for 'AC Repair', 'Salon'..."
                                    style={styles.heroSearchInput}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </form>

                            <div className="hero-cat-grid-mobile" style={styles.heroCatGrid}>
                                {mainCategories.map((cat, i) => (
                                    <Link key={i} to={cat.link ? cat.link : `/services?category=${cat.name}`} style={styles.heroCatItem}>
                                        <div style={{ ...styles.heroCatIcon, backgroundColor: cat.bg, overflow: 'hidden' }}>
                                            <img
                                                src={cat.icon}
                                                alt={cat.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <span style={styles.heroCatLabel}>{cat.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>


                    </div>

                    {/* Hero Right - Collage */}
                    <div style={styles.heroRight} className="hide-on-mobile">
                        <div style={styles.collageGrid}>
                            <div style={{ ...styles.collageImg, gridArea: 'a', backgroundImage: 'url("/images/categories/technical.png")' }}></div>
                            <div style={{ ...styles.collageImg, gridArea: 'b', backgroundImage: 'url("/images/categories/salon.png")' }}></div>
                            <div style={{ ...styles.collageImg, gridArea: 'c', backgroundImage: 'url("/images/categories/ac_repair.png")' }}></div>
                            <div style={{ ...styles.collageImg, gridArea: 'd', backgroundImage: 'url("/images/categories/cleaning.png")' }}></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CATEGORY BANNERS SECTION */}
            <CategoryBanners />

            {/* DYNAMIC CATEGORY SECTIONS */}
            {loading ? (
                <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div className="dot-typing" style={{ margin: '0 4px' }}></div>
                    <div className="dot-typing" style={{ margin: '0 4px' }}></div>
                    <div className="dot-typing" style={{ margin: '0 4px' }}></div>
                </div>
            ) : (
                Object.keys(servicesByCategory).slice(0, 4).map((category, idx) => (
                    <section key={idx} style={{ padding: '40px 0', borderTop: '1px solid #f1f5f9' }}>
                        <div className="container">
                            <div className="flex-between" style={{ marginBottom: '24px' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{category}</h2>
                                    <p style={{ color: 'var(--text-muted)' }}>Top rated providers in your area</p>
                                </div>
                                <Link to={`/services?category=${category}`} style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    View All <ChevronRight size={18} />
                                </Link>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px', scrollbarWidth: 'none' }}>
                                {servicesByCategory[category].map(service => (
                                    <Link key={service._id} to={`/services/${service._id}`} style={styles.serviceCard}>
                                        <div style={styles.serviceImgWrapper}>
                                            <img
                                                src={service.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.title)}&background=random`}
                                                alt={service.title}
                                                style={styles.serviceImg}
                                            />
                                            <div style={styles.ratingBadge}>
                                                <Star size={12} fill="#fff" /> {service.rating?.toFixed(1) || '4.8'}
                                            </div>
                                        </div>
                                        <div style={{ padding: '12px' }}>
                                            <h4 style={{ fontWeight: '700', marginBottom: '4px', fontSize: '0.95rem' }}>{service.title}</h4>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Starts at ₹{service.price}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Zap size={14} color="#059669" fill="#059669" />
                                                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700' }}>QUICK BOOK</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                ))
            )}

            {/* AD BANNER */}
            <section className="container" style={{ margin: '60px auto' }}>
                <div className="ad-banner-mobile" style={styles.adBanner}>
                    <div className="ad-banner-left" style={{ flex: 1, padding: '48px', zIndex: 1 }}>
                        <span style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: '#fff', padding: '6px 14px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>All Services</span>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', marginTop: '16px', marginBottom: '16px', lineHeight: 1.2 }}>Expert Professionals at Your Door</h2>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '32px' }}>From repairs to cleaning — trusted experts for every home need.</p>
                        <Link to="/services" style={{ display: 'inline-block', backgroundColor: '#fff', color: '#111', padding: '12px 32px', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', textDecoration: 'none' }}>Explore All Services</Link>
                    </div>
                    <div className="ad-banner-right" style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <img
                            src={allCategoryLineup}
                            alt="All service professionals"
                            style={{ width: '100%', height: '120%', objectFit: 'cover', objectPosition: 'center top' }}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const mainCategories = [
    { name: 'Salon', icon: '/images/categories/salon.png', bg: '#fee2e2' },
    { name: 'Carpenters', icon: '/images/categories/carpenters.png', bg: '#fef3c7' },
    { name: 'Plumbers', icon: '/images/categories/plumbers.png', bg: '#dcfce7' },
    { name: 'Electricians', icon: '/images/categories/electricians.png', bg: '#e0f2fe' },
    { name: 'Cleaning', icon: '/images/categories/cleaning.png', bg: '#f3e8ff' },
    { name: 'AC Repair', icon: '/images/categories/ac_repair.png', bg: '#dff6f9' },
    { name: 'Painters', icon: '/images/categories/painters.png', bg: '#ffedd5' },
    { name: 'Local Shops', icon: '/images/categories/shops.png', bg: '#ecfdf5', link: '/shops' },
    { name: 'Tutors', icon: '/images/categories/tutors.png', bg: '#f1f5f9' },
];


const styles = {
    heroWrapper: {
        padding: '60px 0',
        backgroundColor: '#fff',
    },
    heroContainer: {
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '40px',
        alignItems: 'center',
    },
    heroLeft: {
        maxWidth: '540px',
    },
    heroTitle: {
        fontSize: '3.5rem',
        fontWeight: '900',
        lineHeight: '1.1',
        marginBottom: '40px',
        letterSpacing: '-2px',
        color: '#111827',
    },
    searchBoxCard: {
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
        border: '1px solid #f1f5f9',
    },
    heroSearch: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0',
    },
    heroSearchInput: {
        border: 'none',
        background: 'transparent',
        outline: 'none',
        fontSize: '1rem',
        width: '100%',
        fontWeight: '500',
    },
    heroCatGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
    },
    heroCatItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        color: 'inherit',
    },
    heroCatIcon: {
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        transition: 'transform 0.2s',
    },
    heroCatLabel: {
        fontSize: '0.75rem',
        fontWeight: '600',
        color: '#4b5563',
    },
    dot: {
        width: '6px',
        height: '6px',
        backgroundColor: 'var(--primary)',
        borderRadius: '50%',
    },
    heroRight: {
        height: '500px',
    },
    collageGrid: {
        display: 'grid',
        height: '100%',
        gridTemplateAreas: `
            "a a b"
            "a a d"
            "c c d"
        `,
        gap: '12px',
    },
    collageImg: {
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    },
    serviceCard: {
        minWidth: '220px',
        maxWidth: '220px',
        borderRadius: '16px',
        border: '1px solid #f1f5f9',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        backgroundColor: '#fff',
        transition: 'box-shadow 0.3s',
    },
    serviceImgWrapper: {
        position: 'relative',
        height: '150px',
    },
    serviceImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    ratingBadge: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '0.7rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    adBanner: {
        height: '400px',
        backgroundColor: '#000',
        borderRadius: '32px',
        overflow: 'hidden',
        display: 'flex',
    }
};

export default Home;
