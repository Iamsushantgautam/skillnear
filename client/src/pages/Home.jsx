import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Search, MapPin, Shield, Star, Clock, ChevronRight, ChevronLeft, Zap, Target, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CategoryBanners from '../components/CategoryBanners';
import allCategoryLineup from '../assets/catg/allCategoryLineup.png';
import toast from 'react-hot-toast';

import useAuthStore from '../store/useAuthStore';

const mainCategories = [
    { name: 'Tutors', icon: '/images/categories/tutors.png', bg: '#f1f5f9' },
    { name: 'Salon', icon: '/images/categories/salon.png', bg: '#fee2e2' },
    { name: 'Carpenters', icon: '/images/categories/carpenters.png', bg: '#fef3c7' },
    { name: 'Plumbers', icon: '/images/categories/plumbers.png', bg: '#dcfce7' },
    { name: 'Electricians', icon: '/images/categories/electricians.png', bg: '#e0f2fe' },
    { name: 'Cleaning', icon: '/images/categories/cleaning.png', bg: '#f3e8ff' },
    { name: 'AC Repair', icon: '/images/categories/ac_repair.png', bg: '#dff6f9' },
    { name: 'Painters', icon: '/images/categories/painters.png', bg: '#ffedd5' },
    { name: 'Local Shops', icon: '/images/categories/shops.png', bg: '#ecfdf5', link: '/shops' },
];

const Home = () => {
    const { user, userLocation, setLocation, toggleFavorite } = useAuthStore();
    const [servicesByCategory, setServicesByCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const scrollRefs = useRef({});

    // Auto-detect location on mount if not set
    useEffect(() => {
        const detectLocation = async () => {
            // Only auto-detect if location is "All of India" or not set
            if ((!userLocation?.city || userLocation?.city === 'All of India') && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                        const data = await res.json();
                        if (data.address) {
                            const city = data.address.city || data.address.town || data.address.village || '';
                            const state = data.address.state || '';
                            const pincode = data.address.postcode || '';

                            // Update store and localStorage
                            setLocation({ city, state, pincode });

                            // If logged in, update backend
                            if (user?.token) {
                                try {
                                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                                    await api.put('/api/users/location', { lat: latitude, lng: longitude, city, state, pincode }, config);
                                } catch (err) { console.error("Auto-sync to DB failed", err); }
                            }
                            toast.success(`Welcome to ${city}! Showing local services.`);
                        }
                    } catch (err) { console.error("Reverse geocode failed", err); }
                });
            }
        };
        detectLocation();
    }, []);

    useEffect(() => {
        const fetchServices = async () => {
            const city = userLocation?.city;
            
            // If no location is selected, don't fetch (or handle differently)
            if (!city || city === 'All of India') {
                setServicesByCategory({});
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Fetch services filtered by current user city
                const { data } = await api.get(`/api/services?location=${city}`);

                const grouped = data.reduce((acc, curr) => {
                    const cat = curr.category;
                    if (!acc[cat]) acc[cat] = [];
                    if (acc[cat].length < 10) acc[cat].push(curr);
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

    const scroll = (category, direction) => {
        const container = scrollRefs.current[category];
        if (container) {
            const scrollAmount = direction === 'left' ? -320 : 320;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

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
                    .view-all-btn { 
                        padding: 0 !important; 
                        background: transparent !important;
                        border: none !important;
                        font-size: 0.85rem !important; 
                        gap: 4px !important;
                        white-space: nowrap !important;
                    }
                    .view-all-btn svg { width: 16px !important; height: 16px !important; }
                    .section-title-mobile { font-size: 1.4rem !important; }
                    .section-desc-mobile { font-size: 0.8rem !important; }
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
                <div className="container" style={{ padding: '60px 0' }}>
                    {[1, 2].map(i => (
                        <div key={i} style={{ marginBottom: '60px' }}>
                            <div className="flex-between" style={{ marginBottom: '24px' }}>
                                <div>
                                    <div className="skeleton" style={{ width: '200px', height: '32px', marginBottom: '8px' }}></div>
                                    <div className="skeleton" style={{ width: '300px', height: '16px' }}></div>
                                </div>
                                <div className="skeleton" style={{ width: '100px', height: '40px', borderRadius: '100px' }}></div>
                            </div>
                            <div style={{ display: 'flex', gap: '24px', overflow: 'hidden' }}>
                                {[1, 2, 3, 4].map(j => (
                                    <div key={j} style={{ ...styles.serviceCard, height: '360px', minWidth: '280px' }}>
                                        <div className="skeleton" style={{ width: '100%', height: '180px' }}></div>
                                        <div style={{ padding: '16px' }}>
                                            <div className="skeleton" style={{ width: '40%', height: '12px', marginBottom: '12px' }}></div>
                                            <div className="skeleton" style={{ width: '90%', height: '20px', marginBottom: '12px' }}></div>
                                            <div className="skeleton" style={{ width: '70%', height: '20px', marginBottom: '20px' }}></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                                                <div className="skeleton skeleton-circle" style={{ width: '24px', height: '24px' }}></div>
                                                <div className="skeleton" style={{ width: '60px', height: '24px' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (!userLocation?.city || userLocation?.city === 'All of India') ? (
                <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
                    <div style={{ 
                        maxWidth: '500px', 
                        margin: '0 auto', 
                        padding: '40px', 
                        borderRadius: '32px', 
                        backgroundColor: '#f8fafc',
                        border: '2px dashed #e2e8f0'
                    }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            backgroundColor: '#fff', 
                            borderRadius: '24px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            margin: '0 auto 24px',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
                        }}>
                            <MapPin size={40} color="var(--primary)" />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1e293b', marginBottom: '16px' }}>Select Your Location</h2>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '32px', lineHeight: '1.6' }}>
                            Please select your city to discover skilled professionals and local services available in your neighborhood.
                        </p>
                        <button 
                            onClick={() => {
                                // Find the location selector in navbar and click it, or just use the same logic
                                document.querySelector('.navbar-location-selector')?.click();
                            }}
                            className="btn-primary" 
                            style={{ padding: '14px 32px', borderRadius: '12px', fontWeight: '800', fontSize: '1rem' }}
                        >
                            Set Location Now
                        </button>
                    </div>
                </div>
            ) : Object.keys(servicesByCategory).length === 0 ? (
                <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>No Services in {userLocation.city}</h2>
                        <p style={{ color: '#64748b', marginBottom: '24px' }}>We haven't expanded to your specific area yet. Try searching in a nearby city!</p>
                        <button 
                            onClick={() => document.querySelector('.navbar-location-selector')?.click()}
                            style={{ color: 'var(--primary)', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Change Location
                        </button>
                    </div>
                </div>
            ) : (
                Object.keys(servicesByCategory)
                    .sort((a, b) => {
                        const order = mainCategories.map(c => c.name);
                        const indexA = order.indexOf(a);
                        const indexB = order.indexOf(b);
                        if (indexA === -1 && indexB === -1) return 0;
                        if (indexA === -1) return 1;
                        if (indexB === -1) return -1;
                        return indexA - indexB;
                    })
                    .slice(0, 10).map((category, idx) => (
                    <section key={idx} style={{ padding: '10px 0', borderTop: '1px solid #f1f5f9' }}>
                        <div className="container">
                            <div className="flex-between" style={{ marginBottom: '16px' }}>
                                <div>
                                    <h2 className="section-title-mobile" style={{ fontSize: '1.75rem', fontWeight: '900', letterSpacing: '-0.5px', color: '#111827' }}>{category}</h2>
                                    <p className="section-desc-mobile" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Handpicked experts for your {category.toLowerCase()} needs</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }} className="hide-on-mobile">
                                        <button onClick={() => scroll(category, 'left')} style={styles.scrollBtn}><ChevronLeft size={20} /></button>
                                        <button onClick={() => scroll(category, 'right')} style={styles.scrollBtn}><ChevronRight size={20} /></button>
                                    </div>
                                    <Link to={`/services?category=${category}`} className="view-all-btn" style={styles.viewAllBtn}>
                                        View All <ChevronRight size={18} />
                                    </Link>
                                </div>
                            </div>

                            <div
                                className="services-scroll-container"
                                style={styles.scrollContainer}
                                ref={el => scrollRefs.current[category] = el}
                            >
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
                                            <button 
                                                style={{ 
                                                    ...styles.heartBtn, 
                                                    backgroundColor: user?.favorites?.includes(service._id) ? '#ef4444' : 'rgba(0,0,0,0.3)',
                                                    border: user?.favorites?.includes(service._id) ? 'none' : '1px solid rgba(255,255,255,0.5)'
                                                }} 
                                                onClick={(e) => { 
                                                    e.preventDefault(); 
                                                    if(!user) return navigate('/login');
                                                    toggleFavorite(service._id);
                                                }}
                                            >
                                                <Heart size={16} fill={user?.favorites?.includes(service._id) ? "#fff" : "none"} color="#fff" />
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
                                                        <img src={service.provider?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider?.name || 'P')}&background=6366f1&color=fff`} alt="Provider" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                    </div>
                                                    <span style={styles.providerName}>{service.provider?.name || 'Professional'}</span>
                                                </div>
                                                {service.businessType === 'shop' ? (
                                                    <button 
                                                        style={{ 
                                                            backgroundColor: 'var(--primary)', 
                                                            color: '#fff', 
                                                            padding: '8px 16px', 
                                                            borderRadius: '8px', 
                                                            fontSize: '0.8rem', 
                                                            fontWeight: '700',
                                                            border: 'none',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const lat = service.geoCoordinates?.coordinates?.[1];
                                                            const lng = service.geoCoordinates?.coordinates?.[0];
                                                            const link = service.shopDetails?.googleMapsLink || (lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null);
                                                            if (link) window.open(link, '_blank');
                                                        }}
                                                    >
                                                        <MapPin size={14} /> Direction
                                                    </button>
                                                ) : (
                                                    <div style={styles.priceTag}>
                                                        <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Starting at</span>
                                                        <span style={{ fontWeight: '800', color: '#111827', fontSize: '1.1rem' }}>₹{service.price || (service.plans?.[0]?.price) || '0'}</span>
                                                    </div>
                                                )}
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
    },
    scrollBtn: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        color: '#475569',
    }
};

export default Home;
