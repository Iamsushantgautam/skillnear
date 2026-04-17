import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, CheckCircle, Clock, MessageSquare } from 'lucide-react';

const ServiceDetails = () => {
    const { id } = useParams();

    const [service, setService] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const { data } = await api.get(`/api/services/${id}`);
                setService(data);
                setMainImage(data.images && data.images.length > 0 ? data.images[0] : (data.provider?.avatar && data.provider.avatar.startsWith('http') ? data.provider.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(data.provider?.name || data.title || 'S')}&background=f3f4f6&color=4f46e5&size=600`));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching service details", error);
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

    if (loading) {
        return <div className="container" style={{ padding: '40px 20px' }}><p>Loading...</p></div>;
    }

    if (!service) {
        return <div className="container" style={{ padding: '40px 20px' }}><p>Service not found</p></div>;
    }

    // Prepare features fallback since we removed it from schema
    const features = ['24/7 Availability', 'Free Estimates', 'Licensed & Insured'];

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            {/* Breadcrumb */}
            <nav style={{ marginBottom: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Link to="/">Home</Link> / <Link to="/services">Services</Link> / <span>{service.title}</span>
            </nav>

            <div style={styles.contentGrid}>
                {/* Left Column: Details & Gallery */}
                <div style={styles.leftCol}>
                    <h1 className="text-h1" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{service.title}</h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Star size={20} color="#f59e0b" fill="#f59e0b" />
                            <span className="text-body" style={{ fontWeight: '600', color: 'var(--text-main)' }}>{service.rating} ({service.numReviews} reviews)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                            <MapPin size={18} />
                            <span>{service.location?.city ? `${service.location.city}, ${service.location.state}` : 'Location unknown'}</span>
                        </div>
                    </div>

                    {/* Gallery */}
                    <div style={styles.gallery}>
                        <div style={styles.mainImageWrapper}>
                            <img src={mainImage} alt={service.title} style={styles.mainImage} className="animate-fade-in" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider?.name || service.title || 'S')}&background=f3f4f6&color=4f46e5&size=600`; }} />
                        </div>
                        {service.images && service.images.length > 0 && (
                            <div style={styles.thumbnailList}>
                                {service.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`Thumbnail ${idx}`}
                                        style={{ ...styles.thumbnail, borderColor: mainImage === img ? 'var(--primary)' : 'transparent' }}
                                        onClick={() => setMainImage(img)}
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider?.name || service.title || 'S')}&background=f3f4f6&color=4f46e5&size=100`; }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details Tabs/Content */}
                    <div style={{ marginTop: '40px' }}>
                        <h2 className="text-h2" style={{ marginBottom: '16px' }}>About This Service</h2>
                        <p className="text-body" style={{ lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '24px' }}>
                            {service.description}
                        </p>

                        <h3 className="text-h3" style={{ marginBottom: '16px' }}>What's Included</h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {features.map((feature, idx) => (
                                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-main)' }}>
                                    <CheckCircle size={20} color="var(--secondary)" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Column: Pricing & Booking Card */}
                <div style={styles.rightCol}>
                    <div className="card" style={{ position: 'sticky', top: '90px' }}>
                        <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
                            <h2 className="text-h2" style={{ fontSize: '2rem', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                ${service.price}
                                <span className="text-body" style={{ fontSize: '1rem', fontWeight: 'normal' }}>
                                    {service.priceType === 'hourly' ? '/ hr' : ''}
                                </span>
                            </h2>
                            <p className="text-body" style={{ marginTop: '8px' }}>Standard Rate</p>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Clock size={18} color="var(--text-muted)" />
                                <span className="text-body">Usually responds in 1 hour</span>
                            </div>
                        </div>

                        <Link to={`/book/${service._id}`} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginBottom: '16px' }}>
                            Proceed to Booking
                        </Link>
                        <p className="text-small" style={{ textAlign: 'center', display: 'block' }}>You won't be charged yet</p>

                        {/* Provider Info inside card */}
                        <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                            <h3 className="text-h3" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>About the Provider</h3>
                            {service.provider ? (
                                <>
                                    <Link to={`/u/${service.provider.username}`} style={{ display: 'flex', gap: '16px', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                                        <img
                                            src={service.provider.avatar && service.provider.avatar.startsWith('http') ? service.provider.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider.name || 'P')}&background=ede9fe&color=4f46e5&size=64`}
                                            alt={service.provider.name}
                                            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider.name || 'P')}&background=ede9fe&color=4f46e5&size=64`; }}
                                        />
                                        <div>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{service.provider.name}</h4>
                                            <p className="text-small">@{service.provider.username || 'provider'}</p>
                                            <p className="text-small">Member since {new Date(service.provider.createdAt || Date.now()).getFullYear()}</p>
                                        </div>
                                    </Link>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', background: 'var(--bg-color)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontWeight: '600' }}>{service.provider.providerDetails?.experienceYears || 0}</div>
                                            <div className="text-small">Years Exp</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontWeight: '600' }}>10+</div>
                                            <div className="text-small">Jobs Done</div>
                                        </div>
                                    </div>
                                    <Link to={`/chat?provider=${service.provider._id}`} className="btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', marginTop: '16px', padding: '12px' }}>
                                        <MessageSquare size={18} />
                                        Chat with Provider
                                    </Link>
                                </>
                            ) : (
                                <p>Provider information unavailable.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    contentGrid: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 380px',
        gap: '40px',
        alignItems: 'start',
    },
    leftCol: {
        paddingBottom: '40px',
    },
    rightCol: {
        // Styling handled primarily by the grid column definition
    },
    gallery: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    mainImageWrapper: {
        width: '100%',
        height: '450px',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
    },
    mainImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    thumbnailList: {
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
    },
    thumbnail: {
        width: '100px',
        height: '70px',
        borderRadius: 'var(--radius-sm)',
        objectFit: 'cover',
        cursor: 'pointer',
        border: '2px solid transparent',
        transition: 'border-color 0.2s',
    }
};

// Add a simple media query for responsive layout
// In a real app this might be in CSS or using a styled-components pattern

export default ServiceDetails;
