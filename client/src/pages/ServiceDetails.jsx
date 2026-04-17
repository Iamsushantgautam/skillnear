import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, CheckCircle, Clock, MessageSquare, Navigation, Map } from 'lucide-react';

const ServiceDetails = () => {
    const { id } = useParams();

    const [service, setService] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [activePlanIdx, setActivePlanIdx] = useState(0);

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

    const isShop = service.businessType === 'shop' || !!service.shopDetails?.shopAge || service.title?.toLowerCase().includes('shop');
    const hasPlans = service.plans && service.plans.length > 0;
    const currentPlan = hasPlans ? service.plans[activePlanIdx] : null;

    // Prepare features fallback since we removed it from schema
    const features = ['24/7 Availability', 'Free Estimates', 'Licensed & Insured'];

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            {/* Breadcrumb */}
            <nav style={{ marginBottom: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Link to="/">Home</Link> / 
                { isShop ? (
                    <> <Link to="/shops">Shops</Link> / {service.shopDetails?.shopName || service.title} </>
                ) : (
                    <> <Link to="/services">Services</Link> / {service.title} </>
                )}
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
                            <span>{service.location?.address ? `${service.location.address}, ` : ''}{service.location?.city}, {service.location?.state}</span>
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
                    <div className="card" style={{ position: 'sticky', top: '90px', padding: hasPlans ? '0' : '24px' }}>
                        
                        {hasPlans ? (
                            <div style={{ overflow: 'hidden' }}>
                                {/* Plans Tabs */}
                                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${service.plans.length}, 1fr)`, backgroundColor: '#f8fafc' }}>
                                    {service.plans.map((p, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => setActivePlanIdx(i)}
                                            style={{
                                                padding: '16px 8px',
                                                background: i === activePlanIdx ? '#fff' : 'transparent',
                                                border: 'none',
                                                borderBottom: i === activePlanIdx ? '3px solid var(--primary)' : '1px solid var(--border-color)',
                                                cursor: 'pointer',
                                                fontWeight: '700',
                                                fontSize: '0.9rem',
                                                color: i === activePlanIdx ? 'var(--primary)' : 'var(--text-muted)',
                                                transition: 'all 0.2s',
                                                outline: 'none'
                                            }}
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                                
                                <div style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h2 className="text-h2" style={{ fontSize: '2rem' }}>₹{currentPlan.price}</h2>
                                        <span style={{ fontSize: '0.8rem', padding: '6px 12px', background: '#eff6ff', borderRadius: '6px', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={14} /> {currentPlan.deliveryTime || 'Delivery TBD'}
                                        </span>
                                    </div>

                                    <h4 style={{ marginBottom: '12px', fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main)' }}>{currentPlan.description}</h4>
                                    
                                    <div style={{ marginBottom: '24px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                        {currentPlan && typeof currentPlan.features === 'string' && currentPlan.features.split(',').filter(f => f.trim()).map((f, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                                <CheckCircle size={16} color="var(--secondary)" />
                                                <span>{f.trim()}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link to={`/book/${service._id}?plan=${currentPlan.name}`} className="btn-primary" style={{ width: '100%', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.05rem', fontWeight: '600' }}>
                                        Continue (₹{currentPlan.price})
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
                                    <h2 className="text-h2" style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                        ₹{service.businessType === 'shop' ? (service.shopDetails?.homeServiceFee || 0) : service.price}
                                        <span className="text-body" style={{ fontSize: '1rem', fontWeight: 'normal' }}>
                                            {service.priceType === 'hourly' && service.businessType !== 'shop' ? '/ hr' : (service.businessType === 'shop' ? ' (Home Service Fee)' : '')}
                                        </span>
                                    </h2>
                                    <p className="text-body" style={{ marginTop: '8px' }}>{service.businessType === 'shop' ? 'Visit Charge' : 'Standard Rate'}</p>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                        <Clock size={18} color="var(--text-muted)" />
                                        <span className="text-body">Usually responds in 1 hour</span>
                                    </div>
                                </div>

                                {/* Action Button: Conditional for Shops */}
                                {isShop ? (
                                    <>
                                        {(service.shopDetails?.isHomeService && service.shopDetails?.homeServiceFee > 0) && (
                                            <Link to={`/book/${service._id}`} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                Book Home Service
                                            </Link>
                                        )}
                                        <a 
                                            href={service.shopDetails?.googleMapsLink || `https://www.google.com/maps/dir/?api=1&destination=${service.geoCoordinates?.coordinates?.[1]},${service.geoCoordinates?.coordinates?.[0]}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={(service.shopDetails?.isHomeService && service.shopDetails?.homeServiceFee > 0) ? "btn-outline" : "btn-primary"}
                                            style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                        >
                                            <Navigation size={20} /> Get Directions
                                        </a>
                                    </>
                                ) : (
                                    <Link to={`/book/${service._id}`} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        Proceed to Booking
                                    </Link>
                                )}
                            </>
                        )}

                        <div style={{ padding: '0 24px 24px' }}>
                            <p className="text-small" style={{ textAlign: 'center', display: 'block' }}>
                                {isShop && !(service.shopDetails?.isHomeService && service.shopDetails?.homeServiceFee > 0)
                                    ? 'Navigate to the physical shop location' 
                                    : "Secure booking through SkillNear"}
                            </p>
                        </div>

                        {/* Provider Info inside card */}
                        <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '24px' }}>
                            <h3 className="text-h3" style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '700' }}>
                                { isShop ? 'Shop Owner' : 'About the Provider' }
                            </h3>
                            {service.provider ? (
                                <>
                                    <Link to={`/u/${service.provider.username}`} style={{ display: 'flex', gap: '16px', alignItems: 'center', textDecoration: 'none', color: 'inherit', marginBottom: '20px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <img
                                                src={service.provider.avatar && service.provider.avatar.startsWith('http') ? service.provider.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider.name || 'P')}&background=ede9fe&color=4f46e5&size=80`}
                                                alt={service.provider.name}
                                                style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider.name || 'P')}&background=ede9fe&color=4f46e5&size=80`; }}
                                            />
                                            <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '12px', height: '12px', background: '#22c55e', border: '2px solid #fff', borderRadius: '50%' }}></div>
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)' }}>{service.provider.name}</h4>
                                            <p className="text-small" style={{ color: 'var(--text-muted)' }}>
                                                @{service.provider.username || service.provider.name}
                                            </p>
                                            <p className="text-small" style={{ color: 'var(--primary)', fontWeight: '600' }}>Active Provider</p>
                                        </div>
                                    </Link>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                                            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>
                                                { isShop
                                                    ? (service.shopDetails?.shopAge || service.experience || 0) 
                                                    : (service.experience || 0)}
                                            </div>
                                            <div className="text-small" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{isShop ? 'Shop Age' : 'Exp. Years'}</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                                            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>{service.jobsCompleted || '10+'}</div>
                                            <div className="text-small" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{isShop ? 'Customers' : 'Jobs Done'}</div>
                                        </div>
                                    </div>

                                    <Link to={`/chat?provider=${service.provider._id}`} className="btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', borderRadius: '10px', fontWeight: '600', transition: 'all 0.2s', backgroundColor: '#fff' }}>
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
