import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search, MapPin, Shield, Star, Clock, ChevronRight, Zap, Target, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CategoryBanners from '../components/CategoryBanners';
import allCategoryLineup from '../assets/catg/allCategoryLineup.png';

import useAuthStore from '../store/useAuthStore';

const Home = () => {
    const { userLocation } = useAuthStore();
    const [servicesByCategory, setServicesByCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                // Fetch services filtered by current user city if available
                const city = userLocation?.city || '';
                const { data } = await api.get(`/api/services?location=${city}`);

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
    }, [userLocation]);

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

                .services-scroll-container::-webkit-scrollbar {
                    display: none;
                }

                .service-card-premium {
                    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .service-card-premium:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important;
                }

                .view-all-btn:hover {
                    background-color: var(--primary) !important;
                    color: #fff !important;
                    border-color: var(--primary) !important;
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
                    <section key={idx} style={{ padding: '60px 0', borderTop: '1px solid #f1f5f9' }}>
                        <div className="container">
                            <div className="flex-between" style={{ marginBottom: '32px' }}>
                                <div>
                                    <h2 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.5px', color: '#111827' }}>{category}</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Handpicked experts for your {category.toLowerCase()} needs</p>
                                </div>
                                <Link to={`/services?category=${category}`} className="view-all-btn" style={styles.viewAllBtn}>
                                    View All <ChevronRight size={18} />
                                </Link>
                            </div>

                            <div className="services-scroll-container" style={styles.scrollContainer}>
                                {servicesByCategory[category].map(service => (
                                    <Link key={service._id} to={`/services/${service._id}`} className="service-card-premium" style={styles.serviceCard}>
                                        <div style={styles.serviceImgWrapper}>
                                            <img
                                                src={service.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.title)}&background=random`}
                                                alt={service.title}
                                                style={styles.serviceImg}
                                            />
                                            <div style={styles.ratingBadge}>
                                                <Star size={12} fill="#FFB800" color="#FFB800" />
                                                <span>{service.rating?.toFixed(1) || '4.8'}</span>
                                            </div>
                                            <button style={styles.heartBtn} onClick={(e) => { e.preventDefault(); /* Save logic */ }}>
                                                <Heart size={16} color="#fff" />
                                            </button>
                                        </div>

                                        <div style={styles.cardContent}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <span style={{ backgroundColor: '#e0f2fe', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase' }}>
                                                    {service.category}
                                                </span>
                                            </div>
                                            <h4 style={styles.cardTitle}>{service.title}</h4>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                                                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                                                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#111827' }}>{service.rating?.toFixed(1) || '4.8'}</span>
                                                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>({service.numReviews || '0'})</span>
                                            </div>

                                            <div style={styles.cardFooter}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={styles.providerAvatar}>
                                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(service.providerName || 'P')}&background=6366f1&color=fff`} alt="Provider" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                                    </div>
                                                    <span style={styles.providerName}>{service.providerName || 'Professional'}</span>
                                                </div>
                                                <div style={styles.priceTag}>
                                                    <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Starting at</span>
                                                    <span style={{ fontWeight: '800', color: '#111827', fontSize: '1.1rem' }}>₹{service.price}</span>
                                                </div>
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
    scrollContainer: {
        display: 'flex',
        gap: '24px',
        overflowX: 'auto',
        paddingBottom: '32px',
        paddingLeft: '4px',
        scrollbarWidth: 'none',
    },
    viewAllBtn: {
        color: 'var(--primary)',
        fontWeight: '800',
        fontSize: '0.95rem',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        textDecoration: 'none',
        padding: '8px 16px',
        borderRadius: '100px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        transition: 'all 0.2s',
    },
    serviceCard: {
        minWidth: '280px',
        maxWidth: '280px',
        borderRadius: '20px',
        border: '1px solid #f1f5f9',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        backgroundColor: '#fff',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    serviceImgWrapper: {
        position: 'relative',
        height: '180px',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
    },
    serviceImg: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        transition: 'transform 0.6s ease',
    },
    ratingBadge: {
        position: 'absolute',
        top: '12px',
        left: '12px',
        backgroundColor: '#fff',
        color: '#111',
        padding: '4px 10px',
        borderRadius: '100px',
        fontSize: '0.8rem',
        fontWeight: '800',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
    },
    heartBtn: {
        position: 'absolute',
        top: '12px',
        right: '12px',
        backgroundColor: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
        border: 'none',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s',
    },
    cardContent: {
        padding: '16px',
    },
    providerInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '10px',
    },
    providerAvatar: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        overflow: 'hidden',
    },
    providerName: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#4b5563',
    },
    cardTitle: {
        fontWeight: '700',
        marginBottom: '16px',
        fontSize: '1.05rem',
        color: '#111827',
        lineHeight: '1.4',
        height: '2.8em',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
    },
    cardFooter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '16px',
        borderTop: '1px solid #f1f5f9',
    },
    priceTag: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
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
