import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import '../../styles/HomeCategories.css';

// --- CONFIGURATION: Control the order of Home Page Sections here ---
const SECTION_DISPLAY_ORDER = [
    'Tutors',
    'Salon',
    'Cleaning',
    'Electricians',
    'Plumbers',
    'Carpenters',
    'AC Repair',
    'Painters'
];

const HomeCategories = ({
    loading,
    userLocation,
    servicesByCategory,
    mainCategories,
    user,
    toggleFavorite
}) => {
    const navigate = useNavigate();
    const scrollRefs = useRef({});

    const scroll = (category, direction) => {
        const container = scrollRefs.current[category];
        if (container) {
            const scrollAmount = direction === 'left' ? -320 : 320;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="container dynamic-sections-loading">
                {[1, 2].map(i => (
                    <div key={i} className="loading-section">
                        <div className="flex-between" style={{ marginBottom: '24px' }}>
                            <div>
                                <div className="skeleton" style={{ width: '200px', height: '32px', marginBottom: '8px' }}></div>
                                <div className="skeleton" style={{ width: '300px', height: '16px' }}></div>
                            </div>
                            <div className="skeleton" style={{ width: '100px', height: '40px', borderRadius: '100px' }}></div>
                        </div>
                        <div className="skeleton-container">
                            {[1, 2, 3, 4].map(j => (
                                <div key={j} className="service-card-main" style={{ height: '360px' }}>
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
        );
    }

    if (!userLocation?.city || userLocation?.city === 'All of India') {
        return (
            <div className="container location-required-container">
                <div className="location-card">
                    <div className="location-icon-wrapper">
                        <MapPin size={40} color="var(--primary)" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1e293b', marginBottom: '16px' }}>Select Your Location</h2>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '32px', lineHeight: '1.6' }}>
                        Please select your city to discover skilled professionals and local services available in your neighborhood.
                    </p>
                    <button
                        onClick={() => document.querySelector('.navbar-location-selector')?.click()}
                        className="btn-primary"
                        style={{ padding: '14px 32px', borderRadius: '12px', fontWeight: '800', fontSize: '1rem' }}
                    >
                        Set Location Now
                    </button>
                </div>
            </div>
        );
    }

    if (Object.keys(servicesByCategory).length === 0) {
        return (
            <div className="container no-services-container">
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
        );
    }

    return (
        <>
            {Object.keys(servicesByCategory)
                .sort((a, b) => {
                    const indexA = SECTION_DISPLAY_ORDER.indexOf(a);
                    const indexB = SECTION_DISPLAY_ORDER.indexOf(b);
                    if (indexA === -1 && indexB === -1) return 0;
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;
                    return indexA - indexB;
                })
                .slice(0, 10).map((category, idx) => (
                    <section key={idx} className="category-section">
                        <div className="container">
                            <div className="section-header">
                                <div className="section-info">
                                    <h2>{category}</h2>
                                    <p>Handpicked experts for your {category.toLowerCase()} needs</p>
                                </div>
                                <div className="section-actions">
                                    <div className="scroll-controls">
                                        <button onClick={() => scroll(category, 'left')} className="scroll-btn"><ChevronLeft size={20} /></button>
                                        <button onClick={() => scroll(category, 'right')} className="scroll-btn"><ChevronRight size={20} /></button>
                                    </div>
                                    <Link to={`/services?category=${category}`} className="view-all-link">
                                        View All <ChevronRight size={18} />
                                    </Link>
                                </div>
                            </div>

                            <div
                                className="services-scroll-wrapper"
                                ref={el => scrollRefs.current[category] = el}
                            >
                                {servicesByCategory[category].map(service => (
                                    <Link key={service._id} to={`/services/${service._id}`} className="service-card-main">
                                        <div className="service-image-container">
                                            <img
                                                src={service.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.title)}&background=random`}
                                                alt={service.title}
                                                className="service-main-img"
                                            />
                                            <div className="card-rating-badge">
                                                <Star size={12} fill="#FFB800" color="#FFB800" />
                                                <span>{service.rating?.toFixed(1) || '4.8'}</span>
                                            </div>
                                            <button
                                                className="card-heart-button"
                                                style={{
                                                    backgroundColor: user?.favorites?.includes(service._id) ? '#ef4444' : 'rgba(0,0,0,0.3)',
                                                    border: user?.favorites?.includes(service._id) ? 'none' : '1px solid rgba(255,255,255,0.5)'
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (!user) return navigate('/login');
                                                    toggleFavorite(service._id);
                                                }}
                                            >
                                                <Heart size={16} fill={user?.favorites?.includes(service._id) ? "#fff" : "none"} color="#fff" />
                                            </button>
                                        </div>

                                        <div className="service-content-body">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <span
                                                    className="category-tag"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        navigate(`/services?category=${service.category}`);
                                                    }}
                                                >
                                                    {service.category}
                                                </span>
                                            </div>
                                            <h4 className="service-title-text">{service.title}</h4>

                                            <div className="rating-summary">
                                                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                                                <span className="rating-value">{service.rating?.toFixed(1) || '4.8'}</span>
                                                <span className="rating-count">({service.numReviews || '0'})</span>
                                            </div>

                                            <div className="card-footer-info">
                                                <div className="provider-snippet">
                                                    <div className="provider-avatar-small">
                                                        <img src={service.provider?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider?.name || 'P')}&background=6366f1&color=fff`} alt="Provider" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                    </div>
                                                    <span className="provider-name-small">{service.provider?.name || 'Professional'}</span>
                                                </div>
                                                {service.businessType === 'shop' ? (
                                                    <button
                                                        className="direction-btn"
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
                                                    <div className="price-container">
                                                        <span className="starting-at-text">Starting at</span>
                                                        <span className="price-value-text">₹{service.price || (service.plans?.[0]?.price) || '0'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                ))}
        </>
    );
};

export default HomeCategories;
