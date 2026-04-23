import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, CheckCircle, Clock, MessageSquare, Navigation, Trash2, Edit3, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ServiceDetails = () => {
    const { id } = useParams();

    const [service, setService] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [activePlanIdx, setActivePlanIdx] = useState(0);

    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [isEligible, setIsEligible] = useState(false);
    const [alreadyReviewed, setAlreadyReviewed] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);

    const fetchService = async () => {
        try {
            const { data } = await api.get(`/api/services/${id}`);
            setService(data);
            setMainImage(data.images && data.images.length > 0 ? data.images[0] : (data.provider?.avatar && data.provider.avatar.startsWith('http') ? data.provider.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(data.provider?.name || data.title || 'S')}&background=f3f4f6&color=4f46e5&size=600`));
        } catch (error) {
            console.error("Error fetching service details", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const { data } = await api.get(`/api/reviews/service/${id}`);
            setReviews(data);
        } catch (error) {
            console.error("Error fetching reviews", error);
        }
    };

    const checkReviewEligibility = async () => {
        try {
            const { data } = await api.get(`/api/reviews/check-eligibility/${id}`);
            setIsEligible(data.isEligible);
            setAlreadyReviewed(data.alreadyReviewed);
            if (data.alreadyReviewed) {
                // Find the user's review in the list
                const { data: allReviews } = await api.get(`/api/reviews/service/${id}`);
                const myReview = allReviews.find(r => r._id === data.reviewId);
                if (myReview) {
                    setUserReview(myReview);
                    setReviewForm({ rating: myReview.rating, comment: myReview.comment });
                }
            }
        } catch (error) {
            console.log("Not logged in or error checking eligibility");
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchService();
        fetchReviews();
        checkReviewEligibility();
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            if (isEditing || alreadyReviewed) {
                await api.put(`/api/reviews/${userReview._id}`, reviewForm);
                toast.success("Review updated!");
            } else {
                await api.post('/api/reviews', { ...reviewForm, serviceId: id });
                toast.success("Review posted!");
            }
            setIsEditing(false);
            fetchReviews();
            checkReviewEligibility();
            fetchService(); // To update the rating/numReviews in header
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save review");
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete your review?")) return;
        try {
            await api.delete(`/api/reviews/${reviewId}`);
            toast.success("Review deleted");
            fetchReviews();
            checkReviewEligibility();
            fetchService();
            setReviewForm({ rating: 5, comment: '' });
            setUserReview(null);
            setAlreadyReviewed(false);
        } catch (error) {
            toast.error("Failed to delete review");
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '40px 20px 80px' }}>
                <div className="skeleton" style={{ width: '200px', height: '20px', marginBottom: '24px' }}></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px' }}>
                    <div>
                        <div className="skeleton" style={{ width: '70%', height: '56px', marginBottom: '16px', borderRadius: '8px' }}></div>
                        <div className="skeleton" style={{ width: '40%', height: '32px', marginBottom: '32px', borderRadius: '12px' }}></div>
                        <div className="skeleton" style={{ width: '100%', height: '450px', borderRadius: '24px' }}></div>
                        <div style={{ marginTop: '48px' }}>
                            <div className="skeleton" style={{ width: '200px', height: '32px', marginBottom: '20px' }}></div>
                            <div className="skeleton" style={{ width: '100%', height: '100px' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="skeleton" style={{ width: '100%', height: '500px', borderRadius: '32px' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!service) {
        return <div className="container" style={{ padding: '40px 20px' }}><p>Service not found</p></div>;
    }

    const isShop = service.businessType === 'shop' || !!service.shopDetails?.shopAge || service.title?.toLowerCase().includes('shop');
    const hasPlans = service.plans && service.plans.length > 0;
    const currentPlan = hasPlans ? service.plans[activePlanIdx] : null;

    const features = ['24/7 Availability', 'Free Estimates', 'Licensed & Insured'];

    return (
        <div className="container service-details-container">
            <style>{`
                .service-details-container {
                    padding: 40px 20px 80px;
                }
                .sd-grid {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 40px;
                    align-items: start;
                }
                .sd-main-image {
                    width: 100%;
                    height: 450px;
                    object-fit: contain;

                }
                .sd-sticky-card {
                    position: sticky;
                    top: 100px;
                }

                /* Review System Responsiveness */
                .reviews-container {
                    margin-top: 80px;
                    max-width: 1000px;
                }
                .reviews-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                }
                .rating-badge {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #f8fafc;
                    padding: 10px 20px;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                }
                .review-form-card {
                    background: #fff;
                    padding: 32px;
                    border-radius: 24px;
                    border: 2px solid #f1f5f9;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.02);
                }
                .review-card {
                    background: #fff;
                    padding: 32px;
                    border-radius: 24px;
                    border: 1px solid #f1f5f9;
                    transition: transform 0.2s;
                }
                .review-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                }
                .review-user-info {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }
                .review-meta {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .review-actions {
                    display: flex;
                    gap: 8px;
                    margin-left: 12px;
                    border-left: 1px solid #f1f5f9;
                    padding-left: 12px;
                }

                @media (max-width: 1024px) {
                    .sd-grid {
                        grid-template-columns: 1fr;
                        gap: 32px;
                    }
                    .sd-main-image {
                        height: 260px;
                    }
                    .sd-sticky-card {
                        position: static;
                    }
                }

                @media (max-width: 768px) {
                    .reviews-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 20px;
                    }
                    .review-card {
                        padding: 24px;
                    }
                    .review-card-top {
                        flex-direction: column;
                        gap: 16px;
                    }
                    .review-meta {
                        justify-content: space-between;
                        width: 100%;
                    }
                    .review-actions {
                        margin-left: 0;
                        padding-left: 0;
                        border-left: none;
                    }
                }

                @media (max-width: 640px) {
                    .service-details-container {
                        padding: 20px 16px 100px;
                    }
                    .sd-title {
                        font-size: 2rem !important;
                    }
                    .sd-main-image {
                        height: 200px;
                        border-radius: 16px;
                    }
                    .sd-meta {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 8px !important;
                    }
                    .review-form-card {
                        padding: 20px;
                    }
                    .reviews-container {
                        margin-top: 50px;
                    }
                }
            `}</style>

            {/* Breadcrumb */}
            <nav style={{ marginBottom: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Link to="/">Home</Link> /
                {isShop ? (
                    <> <Link to="/shops">Shops</Link> / {service.shopDetails?.shopName || service.title} </>
                ) : (
                    <> <Link to="/services">Services</Link> / {service.title} </>
                )}
            </nav>

            <div className="sd-grid">
                {/* Left Column: Details & Gallery */}
                <div style={styles.leftCol}>
                    <h1 className="text-h1 sd-title" style={{ fontSize: '2.8rem', marginBottom: '16px', fontWeight: 900 }}>{service.title}</h1>

                    <div className="sd-meta" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fffbeb', padding: '6px 12px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                            <Star size={18} color="#f59e0b" fill="#f59e0b" />
                            <span style={{ fontWeight: '800', color: '#92400e', fontSize: '0.95rem' }}>{service.rating} ({service.numReviews} Reviews)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
                            <MapPin size={18} />
                            <span>{service.location?.address ? `${service.location.address}, ` : ''}{service.location?.city}</span>
                        </div>
                    </div>

                    {/* Gallery */}
                    <div style={styles.gallery}>
                        <img
                            src={mainImage}
                            alt={service.title}
                            className="sd-main-image animate-fade-in"
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider?.name || service.title || 'S')}&background=f3f4f6&color=4f46e5&size=600`; }}
                        />

                        {service.images && service.images.length > 1 && (
                            <div style={styles.thumbnailList}>
                                {service.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`Thumbnail ${idx}`}
                                        style={{ ...styles.thumbnail, border: mainImage === img ? '3px solid var(--primary)' : '3px solid transparent' }}
                                        onClick={() => setMainImage(img)}
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider?.name || service.title || 'S')}&background=f3f4f6&color=4f46e5&size=100`; }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details Content */}
                    <div style={{ marginTop: '48px' }}>
                        <h2 className="text-h2" style={{ marginBottom: '20px', fontSize: '1.8rem', fontWeight: 800 }}>Service Description</h2>
                        <p className="text-body" style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#4b5563', marginBottom: '32px' }}>
                            {service.description}
                        </p>

                        {service.servicesIncluded && service.servicesIncluded.length > 0 && (
                            <div style={{ marginTop: '40px', padding: '32px', background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                <h3 className="text-h3" style={{ marginBottom: '24px', fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>Services Included</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                    {service.servicesIncluded.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', fontWeight: 600 }}>
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <CheckCircle size={14} color="#16a34a" />
                                            </div>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Pricing & Booking Card */}
                <div className="sd-sticky-card">
                    <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)' }}>

                        {hasPlans ? (
                            <div>
                                {/* Plans Tabs */}
                                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${service.plans.length}, 1fr)`, backgroundColor: '#f8fafc' }}>
                                    {service.plans.map((p, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActivePlanIdx(i)}
                                            style={{
                                                padding: '20px 8px',
                                                background: i === activePlanIdx ? '#fff' : 'transparent',
                                                border: 'none',
                                                borderBottom: i === activePlanIdx ? '4px solid var(--primary)' : '1px solid var(--border-color)',
                                                cursor: 'pointer',
                                                fontWeight: '800',
                                                fontSize: '0.9rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: i === activePlanIdx ? 'var(--primary)' : 'var(--text-muted)',
                                                transition: 'all 0.2s',
                                                outline: 'none'
                                            }}
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ padding: '32px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>₹{currentPlan.price}</h2>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: '0.8rem', padding: '6px 12px', background: '#eff6ff', borderRadius: '10px', color: 'var(--primary)', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={14} /> {currentPlan.deliveryTime || 'Standard'}
                                            </span>
                                        </div>
                                    </div>

                                    <h4 style={{ marginBottom: '16px', fontWeight: '800', fontSize: '1.2rem', color: '#1e293b' }}>{currentPlan.name} Package</h4>
                                    <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>{currentPlan.description}</p>

                                    <div style={{ marginBottom: '32px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                                        {currentPlan && typeof currentPlan.features === 'string' && currentPlan.features.split(',').filter(f => f.trim()).map((f, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                <CheckCircle size={18} color="#003d9b" />
                                                <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>{f.trim()}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link to={`/book/${service._id}?plan=${currentPlan.name}`} className="btn-primary" style={{ width: '100%', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: '800', borderRadius: '16px' }}>
                                        Continue (₹{currentPlan.price})
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '32px' }}>
                                {!(service.businessType === 'shop' && (service.shopDetails?.homeServiceFee || 0) === 0) && (
                                    <div style={{ paddingBottom: '24px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
                                        <h2 style={{ fontSize: '2.8rem', fontWeight: 900, display: 'flex', alignItems: 'baseline', gap: '4px', margin: 0 }}>
                                            ₹{service.businessType === 'shop' ? (service.shopDetails?.homeServiceFee || 0) : service.price}
                                            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                                                {service.priceType === 'hourly' && service.businessType !== 'shop' ? '/ hr' : ''}
                                            </span>
                                        </h2>
                                        <p style={{ marginTop: '8px', color: '#64748b', fontWeight: 600 }}>{service.businessType === 'shop' ? 'Service Fee' : 'Total Service Price'}</p>
                                    </div>
                                )}

                                <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a', fontWeight: 700, fontSize: '0.95rem' }}>
                                        <Clock size={18} />
                                        <span>Instant Response Available</span>
                                    </div>

                                    {/* Shop Timing */}
                                    {isShop && service.shopDetails?.openingTime && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontWeight: 700, fontSize: '0.95rem' }}>
                                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Clock size={12} color="#64748b" />
                                            </div>
                                            <span>Hours: {service.shopDetails.openingTime} - {service.shopDetails.closingTime}</span>
                                        </div>
                                    )}

                                    {/* Home Delivery Service */}
                                    {service.shopDetails?.isHomeDelivery && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0369a1', fontWeight: 700, fontSize: '0.95rem' }}>
                                            <CheckCircle size={18} color="#0369a1" />
                                            <span>Home Delivery Available ({service.shopDetails?.homeServiceFee > 0 ? `₹${service.shopDetails.homeServiceFee}` : 'Free'})</span>
                                        </div>
                                    )}

                                    {/* On-Site Home Visits */}
                                    {service.shopDetails?.isHomeService && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0891b2', fontWeight: 700, fontSize: '0.95rem' }}>
                                            <CheckCircle size={18} color="#0891b2" />
                                            <span>On-Site Home Visits ({service.shopDetails?.homeServiceFee > 0 ? `₹${service.shopDetails.homeServiceFee}` : 'Free'})</span>
                                        </div>
                                    )}
                                </div>

                                {isShop ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {(service.shopDetails?.isHomeService && service.shopDetails?.homeServiceFee > 0) && (
                                            <Link to={`/book/${service._id}`} className="btn-primary" style={{ width: '100%', padding: '18px', fontSize: '1.1rem', borderRadius: '16px', fontWeight: 800 }}>
                                                Book Home Service
                                            </Link>
                                        )}
                                        <a
                                            href={service.shopDetails?.googleMapsLink || `https://www.google.com/maps/dir/?api=1&destination=${service.geoCoordinates?.coordinates?.[1]},${service.geoCoordinates?.coordinates?.[0]}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-outline"
                                            style={{ width: '100%', padding: '18px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '16px', fontWeight: 800 }}
                                        >
                                            <Navigation size={20} /> Get Directions
                                        </a>
                                    </div>
                                ) : (
                                    <Link to={`/book/${service._id}`} className="btn-primary" style={{ width: '100%', padding: '18px', fontSize: '1.1rem', borderRadius: '16px', fontWeight: 800 }}>
                                        Proceed to Booking
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Provider Profile Section */}
                        <div style={{ background: '#f8fafc', padding: '32px', borderTop: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>
                                {isShop ? 'Shop Curator' : 'Expert Provider'}
                            </h3>
                            {service.provider ? (
                                <>
                                    <Link to={`/u/${service.provider.username}`} style={{ display: 'flex', gap: '16px', alignItems: 'center', textDecoration: 'none', marginBottom: '24px' }}>
                                        <img
                                            src={service.provider.avatar && service.provider.avatar.startsWith('http') ? service.provider.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider.name || 'P')}&background=ede9fe&color=4f46e5&size=80`}
                                            alt={service.provider.name}
                                            style={{ width: '64px', height: '64px', borderRadius: '20px', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}
                                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider.name || 'P')}&background=ede9fe&color=4f46e5&size=80`; }}
                                        />
                                        <div>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>{service.provider.name}</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}></div>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22c55e' }}>Online Now</span>
                                            </div>
                                            {service.provider?.createdAt && (
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px', fontWeight: 600 }}>
                                                    Member since {new Date(service.provider.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                        <div style={{ background: '#fff', padding: '16px 12px', borderRadius: '16px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                                            <div style={{ fontWeight: '900', fontSize: '1.2rem', color: '#003d9b' }}>{service.experience || '3+'}</div>
                                            <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginTop: 4 }}>Years Exp.</div>
                                        </div>
                                        <div style={{ background: '#fff', padding: '16px 12px', borderRadius: '16px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                                            <div style={{ fontWeight: '900', fontSize: '1.2rem', color: '#003d9b' }}>{service.jobsCompleted || '50+'}</div>
                                            <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginTop: 4 }}>Completed</div>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/dashboard?tab=chat&provider=${service.provider._id}&service=${service._id}`}
                                        className="btn-outline"
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '16px', borderRadius: '16px', fontWeight: '800', backgroundColor: '#fff', color: '#1e293b' }}
                                    >
                                        <MessageSquare size={18} /> Chat with Me
                                    </Link>
                                </>
                            ) : (
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Provider info syncing...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="reviews-container">
                <div className="reviews-header">
                    <h2 className="text-h2" style={{ fontSize: '2rem', fontWeight: 900 }}>Customer Reviews</h2>
                    <div className="rating-badge">
                        <Star size={24} color="#f59e0b" fill="#f59e0b" />
                        <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>{service.rating.toFixed(1)}</span>
                        <span style={{ color: '#94a3b8', fontWeight: 600 }}>({service.numReviews} active reviews)</span>
                    </div>
                </div>

                {/* Eligibility Notice / Add Review Form */}
                {isEligible && !alreadyReviewed && (
                    <div className="review-form-card" style={{ marginBottom: '48px' }}>
                        <h3 style={{ marginBottom: '20px', fontWeight: 800, fontSize: '1.25rem' }}>Write a Review</h3>
                        <form onSubmit={handleReviewSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Rating</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                        >
                                            <Star size={28} color={star <= reviewForm.rating ? "#f59e0b" : "#e2e8f0"} fill={star <= reviewForm.rating ? "#f59e0b" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Your Feedback</label>
                                <textarea
                                    value={reviewForm.comment}
                                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                                    rows={4}
                                    placeholder="Share your experience with this service..."
                                    required
                                />
                            </div>
                            <button className="btn-primary" disabled={submittingReview} style={{ padding: '14px 32px', borderRadius: '14px', fontWeight: 800 }}>
                                {submittingReview ? 'Posting...' : 'Post Review'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Reviews List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {reviews.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                            <Star size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No reviews yet. Be the first to try this service!</p>
                        </div>
                    ) : (
                        reviews.map(review => (
                            <div key={review._id} className="review-card">
                                <div className="review-card-top">
                                    <div className="review-user-info">
                                        <img
                                            src={review.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'U')}&background=ede9fe&color=4f46e5`}
                                            style={{ width: '48px', height: '48px', borderRadius: '16px', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>{review.user?.name}</h4>
                                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} color={i < review.rating ? "#f59e0b" : "#e2e8f0"} fill={i < review.rating ? "#f59e0b" : "none"} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="review-meta">
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                        {alreadyReviewed && userReview?._id === review._id && (
                                            <div className="review-actions">
                                                <button onClick={() => { setIsEditing(true); window.scrollTo({ top: document.querySelector('form')?.offsetTop - 200, behavior: 'smooth' }); }} style={{ background: '#f8fafc', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#6366f1' }} title="Edit Review">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteReview(review._id)} style={{ background: '#f8fafc', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }} title="Delete Review">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isEditing && userReview?._id === review._id ? (
                                    <form onSubmit={handleReviewSubmit} style={{ marginTop: '16px' }}>
                                        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button key={star} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: star })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                                    <Star size={20} color={star <= reviewForm.rating ? "#f59e0b" : "#e2e8f0"} fill={star <= reviewForm.rating ? "#f59e0b" : "none"} />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={reviewForm.comment}
                                            onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid var(--primary)', background: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'none', fontFamily: 'inherit', marginBottom: '12px' }}
                                            rows={3}
                                            required
                                        />
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button className="btn-primary" style={{ padding: '8px 24px', fontSize: '0.9rem' }}>Save Changes</button>
                                            <button type="button" onClick={() => setIsEditing(false)} className="btn-outline" style={{ padding: '8px 24px', fontSize: '0.9rem' }}>Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <p style={{ margin: 0, lineHeight: 1.6, color: '#4b5563', fontSize: '1rem', fontWeight: 500 }}>
                                        {review.comment}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* What to Expect - Positioned at Last */}
            <div style={{ background: '#f8fafc', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0', marginTop: '48px', maxWidth: '800px' }}>
                <h3 className="text-h3" style={{ marginBottom: '24px', fontSize: '1.6rem', fontWeight: 800 }}>What to expect</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                    {features.map((feature, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#1e293b', fontWeight: 600, fontSize: '1.1rem' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <CheckCircle size={18} color="#16a34a" />
                            </div>
                            {feature}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const styles = {
    leftCol: {
        minWidth: 0
    },
    gallery: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    thumbnailList: {
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        padding: '4px 0',
    },
    thumbnail: {
        width: '110px',
        height: '80px',
        borderRadius: '16px',
        objectFit: 'cover',
        cursor: 'pointer',
        transition: 'all 0.2s',
        flexShrink: 0
    }
};

export default ServiceDetails;
