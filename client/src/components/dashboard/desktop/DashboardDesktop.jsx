import React, { useState } from 'react';
import { User, Briefcase, Calendar as CalendarIcon, MapPin, Edit, Trash2, X, Plus, Loader, Star, CheckCircle, BarChart, MessageSquare, Send, ChevronRight, Wallet, CreditCard, ArrowDownLeft, ArrowUpRight, Heart, FileText, Paperclip, Mic, Check, CheckCheck, Image as ImageIcon, Search, Phone, Video, Lock, PlusCircle, ZoomIn, RotateCw, Camera, Award, History, BadgeCheck, Clock, PlayCircle, DollarSign, PackageOpen, RotateCcw, XCircle } from 'lucide-react';
import ChatList from '../../ChatList';
import { City } from 'country-state-city';
import api from '../../../utils/api';
import toast from 'react-hot-toast';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
};

/* ─── payment modal ─── */
function PaymentModal({ isOpen, onClose, onSelect }) {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
            <div className="animate-scale-in" style={{ backgroundColor: 'white', width: '100%', maxWidth: '450px', borderRadius: 24, padding: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>Service Completed?</h3>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={16} />
                    </button>
                </div>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 32, fontWeight: 500 }}>Select the payment method used by the customer to finalize this order.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button
                        onClick={() => onSelect('Cash')}
                        style={{ padding: 16, borderRadius: 16, border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', cursor: 'pointer' }}
                        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Wallet size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b' }}>Cash Payment</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>Paid directly on-site</div>
                        </div>
                    </button>

                    <button
                        onClick={() => onSelect('Online')}
                        style={{ padding: 16, borderRadius: 16, border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', cursor: 'pointer' }}
                        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eff6ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <CreditCard size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b' }}>Online Payment</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>Paid via UPI or Net Banking</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}


const DashboardDesktop = ({
    setActiveTab,
    activeTab,
    role,
    user,
    profileAvatar,
    profileName,
    getAvatar,
    uploadingAvatar,
    handleAvatarUpload,
    providerTitle,
    setProviderTitle,
    providerAbout,
    setProviderAbout,
    myBookings,
    myGigs,
    stats,
    providerStatus,
    handleApplyProvider,
    isSubmitting,
    bookingsLoading,
    updateBookingStatus,
    bookingForRevision,
    setBookingForRevision,
    revisionNote,
    setRevisionNote,
    showRevisions,
    setShowRevisions,
    bookingWithRevisions,
    setBookingWithRevisions,
    editingGigId,
    gigStep,
    setGigStep,
    gigBusinessType,
    setGigBusinessType,
    gigTitle,
    setGigTitle,
    gigCategory,
    setGigCategory,
    gigCustomCategory,
    setGigCustomCategory,
    gigExperience,
    setGigExperience,
    gigJobsCompleted,
    setGigJobsCompleted,
    shopAge,
    setShopAge,
    gigDesc,
    setGigDesc,
    gigServicesIncluded,
    setGigServicesIncluded,
    usePlans,
    setUsePlans,
    gigPrice,
    setGigPrice,
    gigPriceType,
    setGigPriceType,
    gigPlans,
    setGigPlans,
    shopOpeningTime,
    setShopOpeningTime,
    shopClosingTime,
    setShopClosingTime,
    shopIsHomeDelivery,
    setShopIsHomeDelivery,
    shopIsHomeService,
    setShopIsHomeService,
    shopHomeServiceFee,
    setShopHomeServiceFee,
    gigLat,
    gigLng,
    setGigLat,
    setGigLng,
    shopGoogleMapsLink,
    setShopGoogleMapsLink,
    gigStateCode,
    setGigStateCode,
    gigState,
    setGigState,
    gigCity,
    setGigCity,
    gigAddress,
    setGigAddress,
    gigZipCode,
    setGigZipCode,
    gigCoveragePincodes,
    setGigCoveragePincodes,
    gigImages,
    setGigImages,
    handleGigImageUpload,
    handleCreateGig,
    creatingGig,
    uploadingGigImages,
    gigsLoading,
    handleEditClick,
    handleDeleteGig,
    bookingRequests,
    navigate,
    isMobile,
    dashActiveRoom,
    setDashActiveRoom,
    dashMessages,
    setDashMessages,
    fetchDashMessages,
    userLocation,
    dashMessageInput,
    handleSendMessageDash,
    handleTypeDash,
    messagesEndRef,
    partnerTyping,
    isRecording,
    recordingTime,
    uploadingFile,
    handleFileUploadDash,
    startRecordingDash,
    stopRecordingDash,
    fileInputRef,
    profileUsername,
    setProfileUsername,
    profilePhone,
    setProfilePhone,
    profileNameState,
    setProfileNameState,
    indianStates,
    MapPicker,
    styles,
    allUsers,
    usersLoading,
    adminServices,
    servicesLoading,
    handleUpdateUserRole,
    handleToggleUserBan,
    gigTargetGender,
    setGigTargetGender,
    favorites,
    favoritesLoading,
    fetchFavorites,
    handleSaveProfile,
    savingProfile
}) => {
    const [bookingForPayment, setBookingForPayment] = useState(null);
    const [activeService, setActiveService] = useState(null);
    const [bookingFilter, setBookingFilter] = useState('all');
    const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
    
    // Reviews state
    const [myReviews, setMyReviews] = useState([]);
    const [myReviewsLoading, setMyReviewsLoading] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');

    const fetchMyReviews = async () => {
        setMyReviewsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const endpoint = role === 'provider' ? '/api/reviews/provider' : '/api/reviews/me';
            const { data } = await api.get(endpoint, config);
            setMyReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setMyReviewsLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/api/reviews/${reviewId}`, config);
            toast.success('Review deleted');
            fetchMyReviews();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting review');
        }
    };

    const handleEditReview = (review) => {
        setEditingReviewId(review._id);
        setEditRating(review.rating);
        setEditComment(review.comment);
    };

    const handleUpdateReview = async (reviewId) => {
        if (!editComment.trim()) {
            toast.error('Comment cannot be empty');
            return;
        }
        if (editRating < 1 || editRating > 5) {
            toast.error('Please select a rating');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put(`/api/reviews/${reviewId}`, { rating: editRating, comment: editComment }, config);
            toast.success('Review updated');
            setEditingReviewId(null);
            fetchMyReviews();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating review');
        }
    };

    React.useEffect(() => {
        if (activeTab === 'reviews') {
            fetchMyReviews();
        }
    }, [activeTab]);

    const handleDeliverClick = (bookingId) => {
        setBookingForPayment(bookingId);
    };

    const confirmDelivery = (paymentMode) => {
        updateBookingStatus(bookingForPayment, 'delivered', '', paymentMode);
        setBookingForPayment(null);
    };
    React.useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const serviceId = queryParams.get('service');
        if (serviceId) {
            api.get(`/api/services/${serviceId}`).then(({ data }) => setActiveService(data)).catch(() => { });
        }
    }, []);
    // Note: profileNameState and setProfileNameState are used because profileName is already used in props
    // Actually, I'll just use the props directly. But if I need to update them, I need the setters.

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'overview' && (
                <div id="account-settings-section" className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', maxWidth: '1200px', margin: '0 auto', paddingBottom: '32px' }}>
                    {/* Main Bio & Avatar Card */}
                    <section style={{ gridColumn: 'span 8', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid rgba(195, 198, 214, 0.4)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {/* Header Banner */}
                        <div style={{ height: '100px', width: '100%', background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)', position: 'relative' }}>
                            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        </div>
                        
                        <div style={{ padding: '0 32px 32px 32px', display: 'flex', gap: '24px', position: 'relative', flex: 1 }}>
                            {/* Avatar Section */}
                            <div style={{ position: 'relative', marginTop: '-40px' }}>
                                <div style={{ padding: '6px', background: 'white', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                                    <img
                                        src={getAvatar({ avatar: profileAvatar, name: profileName })}
                                        alt={user?.name}
                                        style={{ width: '120px', height: '120px', borderRadius: '18px', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName || 'U')}&background=ede9fe&color=4f46e5&size=120`; }}
                                    />
                                </div>
                            </div>

                            {/* Content Section */}
                            <div style={{ paddingTop: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', margin: 0, letterSpacing: '-0.025em' }}>{user?.name}</h3>
                                            <span style={{ backgroundColor: role === 'provider' ? '#fef08a' : '#dcfce7', color: role === 'provider' ? '#854d0e' : '#166534', fontSize: '10px', padding: '4px 10px', borderRadius: '8px', fontWeight: 900, letterSpacing: '0.05em' }}>
                                                {role === 'provider' ? 'TOP RATED PRO' : 'VERIFIED CUSTOMER'}
                                            </span>
                                        </div>
                                        <p style={{ color: '#003d9b', fontWeight: 700, fontSize: '1rem', marginBottom: '12px' }}>
                                            {providerTitle || (role === 'provider' ? 'Professional Service Provider' : 'SkillNear Member')}
                                        </p>
                                    </div>
                                    <button onClick={() => setActiveTab('profile')} style={{ padding: '8px 16px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#1e293b'; }} onMouseOut={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}>
                                        Edit Profile
                                    </button>
                                </div>
                                
                                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px', maxWidth: '90%' }}>
                                    {providerAbout || (role === 'provider' ? 'Expert skills dedicated to delivering high-quality results. Open to custom projects and long-term collaborations.' : 'Valued member of the SkillNear community. Dedicated to supporting local experts and quality services.')}
                                </p>

                                {/* Stats Bar */}
                                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                                    {role === 'provider' ? (
                                        <>
                                            <div style={{ flex: 1, backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Response Rate</span>
                                                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b' }}>98%</span>
                                            </div>
                                            <div style={{ flex: 1, backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experience</span>
                                                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b' }}>{user?.providerDetails?.experienceYears || 0} Yrs</span>
                                            </div>
                                            <div style={{ flex: 1, backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#b45309' }}>4.9</span>
                                                    <Star size={16} color="#d97706" fill="#d97706" />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ flex: 1, backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member Since</span>
                                                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b' }}>{user?.createdAt ? new Date(user.createdAt).getFullYear() : 2024}</span>
                                            </div>
                                            <div style={{ flex: 1, backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Bookings</span>
                                                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b' }}>{myBookings.length}</span>
                                            </div>
                                            <div style={{ flex: 1, backgroundColor: '#ecfdf5', border: '1px solid #dcfce7', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Status</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                                                    <span style={{ fontSize: '1rem', fontWeight: 900, color: '#166534' }}>Active</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Right Side Column for Row 1 */}
                    {role === 'customer' && (
                        <section 
                            onClick={() => setActiveTab('become_provider')}
                            style={{ gridColumn: 'span 4', background: 'linear-gradient(135deg, #003d9b 0%, #3b82f6 100%)', borderRadius: '24px', padding: '32px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 20px 40px -10px rgba(0, 61, 155, 0.3)', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 61, 155, 0.4)'; }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0, 61, 155, 0.3)'; }}
                        >
                            <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1, transform: 'rotate(15deg)' }}>
                                <Briefcase size={160} />
                            </div>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '12px', position: 'relative', lineHeight: 1.2 }}>Level Up & Join<br/>as a Seller</h3>
                            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: '32px', position: 'relative' }}>
                                Unlock professional features, reach local customers, and start earning by offering your services today.
                            </p>
                            <div style={{ backgroundColor: 'white', color: '#003d9b', border: 'none', padding: '14px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: 'fit-content', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                Start Selling Now <ChevronRight size={18} />
                            </div>
                        </section>
                    )}

                    {role === 'provider' && (
                        <section style={{ gridColumn: 'span 4', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid rgba(195, 198, 214, 0.4)', padding: '32px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                                <div style={{ padding: '8px', background: '#f0f7ff', borderRadius: '10px', color: '#003d9b' }}><CheckCircle size={18} /></div>
                                <h4 style={{ fontSize: '1.125rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>Quick Status</h4>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>Identity</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#10b981', fontWeight: 800, background: '#ecfdf5', padding: '4px 10px', borderRadius: '6px' }}>
                                        <BadgeCheck size={14} /> Verified
                                    </span>
                                </div>
                                <div style={{ backgroundColor: '#f8fafc', padding: '20px 16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid #f1f5f9', flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>Active Gigs</span>
                                        <div style={{ backgroundColor: '#003d9b', color: 'white', padding: '4px 12px', borderRadius: '99px', fontSize: '0.9rem', fontWeight: 900 }}>{myGigs.length}</div>
                                    </div>
                                    {myGigs.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                                            {myGigs.slice(0, 2).map((gig, idx) => (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', padding: '10px', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: gig.isApproved ? '#10b981' : '#f59e0b' }}></div>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{gig.title}</span>
                                                </div>
                                            ))}
                                            {myGigs.length > 2 && <span style={{ fontSize: '0.75rem', color: '#003d9b', fontWeight: 800, textAlign: 'center', marginTop: '4px' }}>+ {myGigs.length - 2} more gigs</span>}
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: 'white', borderRadius: '10px', padding: '20px' }}>
                                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', margin: 0, fontWeight: 500 }}>No gigs posted yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Quick Links / Actions */}
                    {role === 'provider' && (
                        <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                            <div 
                                onClick={() => setActiveTab('mygigs')} 
                                style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid rgba(195, 198, 214, 0.4)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
                                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#003d9b'; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = 'rgba(195, 198, 214, 0.4)'; }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ padding: '16px', backgroundColor: '#f0f7ff', borderRadius: '16px', color: '#003d9b' }}>
                                        <Briefcase size={28} />
                                    </div>
                                    <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '50%', color: '#94a3b8' }}>
                                        <ArrowUpRight size={20} />
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>Manage Gigs</h4>
                                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, fontWeight: 500 }}>Create new listings, edit active services, and manage your portfolio.</p>
                                </div>
                            </div>

                            <div 
                                onClick={() => setActiveTab('chat')} 
                                style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid rgba(195, 198, 214, 0.4)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
                                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#003d9b'; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = 'rgba(195, 198, 214, 0.4)'; }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ padding: '16px', backgroundColor: '#fdf4ff', borderRadius: '16px', color: '#c026d3' }}>
                                        <MessageSquare size={28} />
                                    </div>
                                    <div style={{ position: 'relative', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '50%', color: '#94a3b8' }}>
                                        <ArrowUpRight size={20} />
                                        <div style={{ position: 'absolute', top: '0', right: '0', width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>Client Messages</h4>
                                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, fontWeight: 500 }}>Respond to inquiries, negotiate pricing, and finalize bookings directly.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Customer Quick Links */}
                    {role === 'customer' && (
                        <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                            <div 
                                onClick={() => setActiveTab('bookings')} 
                                style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid rgba(195, 198, 214, 0.4)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
                                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#003d9b'; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = 'rgba(195, 198, 214, 0.4)'; }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '16px', color: '#16a34a' }}>
                                        <Briefcase size={28} />
                                    </div>
                                    <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '50%', color: '#94a3b8' }}>
                                        <ArrowUpRight size={20} />
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>My Bookings</h4>
                                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, fontWeight: 500 }}>Track your active service requests and past completed jobs.</p>
                                </div>
                            </div>

                            <div 
                                onClick={() => setActiveTab('chat')} 
                                style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid rgba(195, 198, 214, 0.4)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
                                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#003d9b'; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = 'rgba(195, 198, 214, 0.4)'; }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ padding: '16px', backgroundColor: '#fdf4ff', borderRadius: '16px', color: '#c026d3' }}>
                                        <MessageSquare size={28} />
                                    </div>
                                    <div style={{ position: 'relative', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '50%', color: '#94a3b8' }}>
                                        <ArrowUpRight size={20} />
                                        <div style={{ position: 'absolute', top: '0', right: '0', width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>Provider Chats</h4>
                                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, fontWeight: 500 }}>Message professionals to discuss details before or after booking.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Earnings Snapshot Widget */}
                    {role === 'provider' && (
                        <section style={{ gridColumn: 'span 12', backgroundColor: '#0f172a', borderRadius: '32px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.4)' }}>
                            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '60%', background: 'linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.1) 100%)', pointerEvents: 'none' }}></div>
                            
                            <div style={{ maxWidth: '40%', position: 'relative', zIndex: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '8px', borderRadius: '10px' }}><DollarSign size={20} /></div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: 0 }}>Earnings Snapshot</h3>
                                </div>
                                <p style={{ fontSize: '0.95rem', color: '#94a3b8', marginBottom: '32px', lineHeight: 1.6, fontWeight: 500 }}>
                                    Your professional performance has increased by <span style={{ color: '#38bdf8', fontWeight: 800 }}>12.4%</span> this month. Keep up the excellent work!
                                </p>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px 24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Total Earned</p>
                                        <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', margin: 0 }}>₹{stats.totalEarnings.toLocaleString()}</p>
                                    </div>
                                    <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '20px 24px', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Pending Orders</p>
                                        <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', margin: 0 }}>{stats.pendingOrders}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ width: '55%', height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0', gap: '16px', position: 'relative', zIndex: 10 }}>
                                {stats.chartData.length > 0 ? stats.chartData.map((d, i) => {
                                    const maxEarnings = Math.max(...stats.chartData.map(x => x.earnings)) || 1;
                                    const percentage = (d.earnings / maxEarnings) * 100;
                                    const isCurrentMonth = i === stats.chartData.length - 1;
                                    return (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: '8px' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: d.earnings > 0 ? '#38bdf8' : '#64748b', opacity: d.earnings > 0 ? 1 : 0.5 }}>
                                                ₹{d.earnings >= 1000 ? (d.earnings/1000).toFixed(1) + 'k' : d.earnings}
                                            </div>
                                            <div style={{ width: '100%', backgroundColor: d.earnings > 0 ? (isCurrentMonth ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)') : 'rgba(255,255,255,0.05)', borderRadius: '8px 8px 0 0', height: `${Math.max(4, percentage)}%`, transition: 'all 0.5s ease-out', border: d.earnings === 0 ? '1px dashed rgba(255,255,255,0.1)' : 'none', borderBottom: 'none' }}></div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: isCurrentMonth ? 800 : 600, color: isCurrentMonth ? 'white' : '#94a3b8', marginTop: '4px' }}>
                                                {d.name}
                                            </div>
                                        </div>
                                    );
                                }) : [40, 60, 30, 90, 50, 75].map((h, i) => (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: '8px' }}>
                                        <div style={{ width: '100%', backgroundColor: i === 5 ? '#38bdf8' : 'rgba(255,255,255,0.05)', borderRadius: '8px 8px 0 0', height: `${h}%`, border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none' }}></div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Customer Insights Widget */}
                    {role === 'customer' && (
                        <section style={{ gridColumn: 'span 12', backgroundColor: '#0f172a', borderRadius: '32px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.4)' }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '60%', background: 'linear-gradient(-90deg, transparent 0%, rgba(16, 185, 129, 0.1) 100%)', pointerEvents: 'none' }}></div>
                            
                            <div style={{ maxWidth: '40%', position: 'relative', zIndex: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '8px', borderRadius: '10px' }}><Wallet size={20} /></div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: 0 }}>Spending & Activity</h3>
                                </div>
                                <p style={{ fontSize: '0.95rem', color: '#94a3b8', marginBottom: '32px', lineHeight: 1.6, fontWeight: 500 }}>
                                    Track your SkillNear investments. You have <span style={{ color: '#10b981', fontWeight: 800 }}>{myBookings.filter(b => b.status === 'completed').length}</span> completed projects!
                                </p>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px 24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Total Invested</p>
                                        <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', margin: 0 }}>₹{myBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.totalPrice || b.price || 0), 0).toLocaleString()}</p>
                                    </div>
                                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '20px 24px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Active Services</p>
                                        <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', margin: 0 }}>{myBookings.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status)).length}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ width: '55%', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Recent Collaborations</h4>
                                    <button onClick={() => setActiveTab('bookings')} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>View All</button>
                                </div>
                                {myBookings.slice(0, 3).map((b, i) => (
                                    <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <img src={b.service?.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop'} alt="" style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop'; }} />
                                        <div style={{ flex: 1 }}>
                                            <h5 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 700 }}>{b.service?.title || 'Service Booking'}</h5>
                                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.8rem' }}>{new Date(b.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ color: 'white', margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 800 }}>₹{b.totalPrice || b.price || 0}</p>
                                            <span style={{ fontSize: '0.7rem', color: b.status === 'completed' ? '#10b981' : (b.status === 'cancelled' || b.status === 'rejected' ? '#ef4444' : '#38bdf8'), fontWeight: 800, textTransform: 'uppercase', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{b.status}</span>
                                        </div>
                                    </div>
                                ))}
                                {myBookings.length === 0 && (
                                    <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                        <p style={{ margin: 0, fontWeight: 600 }}>No bookings yet.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>
            )}

            {activeTab === 'become_provider' && (
                <div className="animate-fade-in" style={{ paddingTop: '20px' }}>
                    {providerStatus === 'pending' ? (
                        <div style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '16px', borderRadius: '8px' }}>
                            Your application is currently pending admin approval. We will notify you once approved.
                        </div>
                    ) : providerStatus === 'approved' ? (
                        <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '16px', borderRadius: '8px' }}>
                            Congratulations! You are an approved provider. Go to "Manage Services" to add items.
                        </div>
                    ) : (
                        <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                                <div style={{ width: '80px', height: '80px', backgroundColor: '#ede9fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                                    <Briefcase size={40} />
                                </div>
                                <h2 className="text-h2" style={{ marginBottom: '12px' }}>Join the Network</h2>
                                <p className="text-body" style={{ marginBottom: '32px', color: 'var(--text-muted)' }}>
                                    Start offering your skills to thousands of local customers. Auto-approval enabled!
                                </p>

                                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                                    <button className="btn-primary" onClick={handleApplyProvider} disabled={isSubmitting} style={{ height: '52px', padding: '0 40px', fontSize: '1.1rem' }}>
                                        {isSubmitting ? <span className="flex-center" style={{ gap: 10 }}><Loader size={20} className="spin" /> Activating...</span> : 'Activate Professional Account'}
                                    </button>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '16px' }}> ⚡ Instant activation. Start listing your gigs immediately. </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'bookings' && (
                <div className="animate-fade-in" style={{ padding: '0px', maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Header & Filter */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', marginBottom: '48px', marginTop: '-40px' }}>
                        <div>
                            <p style={{ color: '#64748b', fontWeight: '500', maxWidth: '450px' }}>Manage your active collaborations and professional service records from one central hub.</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#e7e7f2', padding: '6px', borderRadius: '100px', gap: '4px' }}>
                            <button onClick={() => setBookingFilter('all')} style={{ padding: '8px 20px', borderRadius: '100px', background: bookingFilter === 'all' ? '#ffffff' : 'transparent', color: bookingFilter === 'all' ? '#003d9b' : '#64748b', fontWeight: bookingFilter === 'all' ? '700' : '600', border: 'none', boxShadow: bookingFilter === 'all' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' }}>All</button>
                            <button onClick={() => setBookingFilter('pending')} style={{ padding: '8px 20px', borderRadius: '100px', background: bookingFilter === 'pending' ? '#ffffff' : 'transparent', color: bookingFilter === 'pending' ? '#003d9b' : '#64748b', fontWeight: bookingFilter === 'pending' ? '700' : '600', border: 'none', boxShadow: bookingFilter === 'pending' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' }}>Pending</button>
                            <button onClick={() => setBookingFilter('confirmed')} style={{ padding: '8px 20px', borderRadius: '100px', background: bookingFilter === 'confirmed' ? '#ffffff' : 'transparent', color: bookingFilter === 'confirmed' ? '#003d9b' : '#64748b', fontWeight: bookingFilter === 'confirmed' ? '700' : '600', border: 'none', boxShadow: bookingFilter === 'confirmed' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' }}>Confirmed</button>
                            <button onClick={() => setBookingFilter('in_progress')} style={{ padding: '8px 20px', borderRadius: '100px', background: bookingFilter === 'in_progress' ? '#ffffff' : 'transparent', color: bookingFilter === 'in_progress' ? '#003d9b' : '#64748b', fontWeight: bookingFilter === 'in_progress' ? '700' : '600', border: 'none', boxShadow: bookingFilter === 'in_progress' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' }}>In Progress</button>
                            <button onClick={() => setBookingFilter('completed')} style={{ padding: '8px 20px', borderRadius: '100px', background: bookingFilter === 'completed' ? '#ffffff' : 'transparent', color: bookingFilter === 'completed' ? '#003d9b' : '#64748b', fontWeight: bookingFilter === 'completed' ? '700' : '600', border: 'none', boxShadow: bookingFilter === 'completed' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' }}>Completed</button>
                            <button onClick={() => setBookingFilter('cancelled')} style={{ padding: '8px 20px', borderRadius: '100px', background: bookingFilter === 'cancelled' ? '#ffffff' : 'transparent', color: bookingFilter === 'cancelled' ? '#003d9b' : '#64748b', fontWeight: bookingFilter === 'cancelled' ? '700' : '600', border: 'none', boxShadow: bookingFilter === 'cancelled' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' }}>Cancelled</button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px' }}>
                        {/* Bookings List Column (col-span-8) */}
                        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {bookingsLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid rgba(195,198,214,0.2)' }}>
                                        <div style={{ display: 'flex', gap: '24px' }}>
                                            <div className="skeleton" style={{ width: '100px', height: '100px', borderRadius: '16px' }}></div>
                                            <div style={{ flex: 1 }}>
                                                <div className="skeleton" style={{ width: '30%', height: '12px', marginBottom: '8px' }}></div>
                                                <div className="skeleton" style={{ width: '60%', height: '24px', marginBottom: '8px' }}></div>
                                                <div className="skeleton" style={{ width: '40%', height: '16px' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (() => {
                                const filteredBookings = myBookings.filter(b => {
                                    if (bookingFilter === 'all') return true;
                                    if (bookingFilter === 'pending') return b.status === 'pending';
                                    if (bookingFilter === 'confirmed') return b.status === 'confirmed';
                                    if (bookingFilter === 'in_progress') return ['in_progress', 'revision_requested', 'delivered'].includes(b.status);
                                    if (bookingFilter === 'completed') return b.status === 'completed';
                                    if (bookingFilter === 'cancelled') return ['cancelled', 'rejected'].includes(b.status);
                                    return true;
                                }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                                return filteredBookings.length === 0 ? (
                                    <p style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#ffffff', borderRadius: '24px', border: '1px solid rgba(195, 198, 214, 0.2)' }}>No {bookingFilter} bookings found.</p>
                                ) : (
                                    filteredBookings.map(b => {
                                        // Status Logic
                                        let statusColor = '#dc2626'; let statusBg = '#fee2e2';
                                        if (b.status === 'pending') { statusColor = '#b45309'; statusBg = '#fef3c7'; }
                                        if (b.status === 'confirmed') { statusColor = '#1d4ed8'; statusBg = '#dbeafe'; }
                                        if (['in_progress', 'revision_requested', 'delivered'].includes(b.status)) { statusColor = '#7c3aed'; statusBg = '#f5f3ff'; }
                                        if (b.status === 'completed') { statusColor = '#047857'; statusBg = '#d1fae5'; }
                                        if (['cancelled', 'rejected'].includes(b.status)) { statusColor = '#dc2626'; statusBg = '#fee2e2'; }
                                        if (b.status === 'completed') { statusColor = '#047857'; statusBg = '#d1fae5'; }

                                        const isCompleted = b.status === 'completed';
                                        const isCancelled = ['cancelled', 'rejected'].includes(b.status);

                                        return (
                                            <div key={b._id} style={{
                                                background: isCancelled ? '#f8fafc' : (isCompleted ? '#faf8ff' : '#ffffff'),
                                                padding: '24px',
                                                borderRadius: '24px',
                                                border: isCancelled ? '2px dashed #e2e8f0' : '1px solid rgba(195, 198, 214, 0.2)',
                                                boxShadow: (isCompleted || isCancelled) ? 'none' : '0 10px 30px rgba(0,61,155,0.03)',
                                                transition: 'all 0.3s',
                                                opacity: isCancelled ? 0.7 : 1,
                                                filter: isCancelled ? 'grayscale(100%)' : 'none'
                                            }}
                                                onMouseEnter={(e) => {
                                                    if (!isCancelled && !isCompleted) e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,61,155,0.08)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isCancelled && !isCompleted) e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,61,155,0.03)';
                                                }}>
                                                <div style={{ display: 'flex', gap: '24px' }}>
                                                    {/* Image */}
                                                    <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', flexShrink: 0 }}>
                                                        <img
                                                            src={b.service?.images?.[0]?.url || b.service?.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop'}
                                                            alt={b.service?.title}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop'; }}
                                                        />
                                                    </div>

                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                                    <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', background: statusBg, color: statusColor, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                                                        {b.status.replace('_', ' ')}
                                                                    </span>
                                                                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>ID: #{b._id.slice(-6).toUpperCase()}</span>
                                                                </div>
                                                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#191b23', lineHeight: '1.2' }}>{b.service?.title}</h3>
                                                                <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <User size={14} /> Provider: <span style={{ fontWeight: '600', color: '#434654' }}>{b.provider?.name}</span>
                                                                </p>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <p style={{ fontSize: '1.5rem', fontWeight: '900', color: isCompleted ? '#94a3b8' : '#003d9b' }}>₹{b.totalPrice}</p>
                                                                <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>
                                                                    {isCompleted ? 'Paid' : 'Escrow Secured'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', paddingTop: '12px', marginTop: '12px', borderTop: '1px solid #f8fafc' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                                                                <CalendarIcon size={16} color="#94a3b8" /> {new Date(b.date).toLocaleDateString()}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                                                                <CalendarIcon size={16} color="#94a3b8" /> {b.timeSlot}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                                                                <MapPin size={16} color="#94a3b8" /> {b.address?.city || 'Remote Delivery'}
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', marginTop: 'auto' }}>
                                                            {b.status === 'delivered' ? (
                                                                <>
                                                                    <button onClick={() => updateBookingStatus(b._id, 'completed')} style={{ flex: 1, background: '#003d9b', color: 'white', padding: '10px 0', borderRadius: '12px', fontWeight: '700', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>Accept & Mark Complete</button>
                                                                    <button 
                                                                        onClick={() => { setBookingForRevision(b); setRevisionNote(''); }} 
                                                                        style={{ padding: '10px 24px', border: '1px solid #c3c6d6', color: '#475569', borderRadius: '12px', fontWeight: '700', fontSize: '0.875rem', background: 'transparent', cursor: 'pointer' }}
                                                                    >Request Revision</button>
                                                                </>
                                                            ) : isCompleted ? (
                                                                <>
                                                                    <button onClick={() => navigate(`/invoice/${b._id}`)} style={{ flex: 1, background: '#e1e2ec', color: '#434654', padding: '10px 0', borderRadius: '12px', fontWeight: '700', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>View Invoice</button>
                                                                    <button onClick={() => navigate(`/services/${b.service?._id || b.service}`)} style={{ padding: '10px 24px', border: '1px solid #c3c6d6', color: '#475569', borderRadius: '12px', fontWeight: '700', fontSize: '0.875rem', background: 'transparent', cursor: 'pointer' }}>Rate Professional</button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button onClick={() => setSelectedBookingDetails(b)} style={{ flex: 1, background: '#003d9b', color: 'white', padding: '10px 0', borderRadius: '12px', fontWeight: '700', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>View Details & Tracking</button>
                                                                    <button 
                                                                        onClick={() => { setDashActiveRoom({ roomId: b._id, otherUser: role === 'provider' ? b.user : b.provider, title: b.service?.title }); setActiveTab('chat'); }} 
                                                                        style={{ flex: 1, padding: '12px 24px', border: '1px solid #003d9b', color: '#003d9b', borderRadius: '14px', fontWeight: '800', fontSize: '0.875rem', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                                                                        onMouseOver={(e) => { e.currentTarget.style.background = '#f0f7ff'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                                        onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                                    >
                                                                        <MessageSquare size={18} /> Message
                                                                    </button>
                                                                    {b.revisions?.length > 0 && (
                                                                        <button 
                                                                            onClick={() => { setBookingWithRevisions(b); setShowRevisions(true); }}
                                                                            style={{ padding: '12px 24px', border: '1px solid #003d9b', color: '#003d9b', borderRadius: '14px', fontWeight: '800', fontSize: '0.875rem', background: '#f0f7ff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                                                                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                                                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                                        >
                                                                            <History size={18} /> Revisions ({b.revisions.length})
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                );
                            })()}
                        </div>

                        {/* Sidebar Widgets (col-span-4) */}
                        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {/* Analytics Quick Look */}
                            <div style={{ background: '#003d9b', padding: '32px', borderRadius: '32px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,61,155,0.25)' }}>
                                <div style={{ position: 'relative', zIndex: 10 }}>
                                    <h4 style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, marginBottom: '24px' }}>Activity Summary</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div>
                                            <p style={{ fontSize: '2.25rem', fontWeight: '900', lineHeight: 1 }}>₹{myBookings.filter(b => b.status !== 'cancelled' && b.status !== 'rejected').reduce((sum, b) => sum + (b.totalPrice || 0), 0)}</p>
                                            <p style={{ fontSize: '0.75rem', fontWeight: '600', opacity: 0.8, marginTop: '4px' }}>Total Bookings Value</p>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '16px', backdropFilter: 'blur(4px)' }}>
                                                <p style={{ fontSize: '1.25rem', fontWeight: '700' }}>{myBookings.filter(b => b.status !== 'cancelled' && b.status !== 'rejected').length}</p>
                                                <p style={{ fontSize: '0.625rem', fontWeight: '700', opacity: 0.7, textTransform: 'uppercase', marginTop: '2px' }}>Bookings</p>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '16px', backdropFilter: 'blur(4px)' }}>
                                                <p style={{ fontSize: '1.25rem', fontWeight: '700' }}>98%</p>
                                                <p style={{ fontSize: '0.625rem', fontWeight: '700', opacity: 0.7, textTransform: 'uppercase', marginTop: '2px' }}>Rating</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Decorative elements */}
                                <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '160px', height: '160px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
                                <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '160px', height: '160px', background: 'rgba(96,165,250,0.2)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
                            </div>

                            {/* Help Widget */}
                            <div style={{ background: 'rgba(231,231,242,0.5)', padding: '32px', borderRadius: '32px', border: '1px solid rgba(195,198,214,0.1)', textAlign: 'center' }}>
                                <div style={{ width: '64px', height: '64px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <MessageSquare size={28} color="#003d9b" />
                                </div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#191b23', marginBottom: '8px' }}>Need Help?</h4>
                                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '32px', lineHeight: 1.6 }}>Having trouble with a booking or a provider? Our 24/7 support team is here to assist you.</p>
                                <button style={{ width: '100%', background: 'white', border: '1px solid rgba(0,61,155,0.2)', color: '#003d9b', padding: '16px', borderRadius: '100px', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.3s' }}>
                                    Contact Support
                                </button>
                                <a href="#" style={{ display: 'inline-block', marginTop: '24px', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}>Read FAQs</a>
                            </div>

                            {/* Location Guide */}
                            <div style={{ background: '#ffffff', borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(195,198,214,0.1)' }}>
                                <div style={{ height: '160px', background: '#e2e8f0', position: 'relative' }}>
                                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDumgvZRnAdjKdSpoi1hW5XIMySFxWlGa75ikgHZd-2xzcEXyd3bL7xtwmn5kmk8q3Bn6LLaGhr2hDW7jCvc1GbRZBvGR1T2pMITl2bV-p8inCVbnpxSoBA1c3xfXryNthNFH67Onyaij8YeBXML_2ct_0CEKlCVFVbPNAREVDJ0zEGhFyBrvtb1DSwtBYiRfRah64QrCoLAS_0lNSb2yNoRt1ykJbuXLr47Y6h-nbVo88MLBW1I_V003ysDMCGaFG87BI55AC_r8W2" alt="Map" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }}></div>
                                </div>
                                <div style={{ padding: '24px' }}>
                                    <h5 style={{ fontWeight: '700', fontSize: '0.875rem', marginBottom: '4px' }}>Service Coverage</h5>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>You are viewing bookings relative to your current location area.</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'services' && (
                <div className="animate-fade-in" style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
                    {/* Header Section */}
                    <div style={{ marginBottom: '40px' }}>
                        <nav style={{ fontSize: '10px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                            Business / {editingGigId ? 'Update Listing' : 'New Listing'}
                        </nav>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#191b23', letterSpacing: '-0.025em', margin: 0 }}>
                            {editingGigId ? 'Refine Your Service' : 'Share Your Talent'}
                        </h2>
                        <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1.125rem' }}>Create a high-impact listing to attract more customers.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '48px', alignItems: 'start' }}>
                        {/* Vertical Stepper Sidebar */}
                        <aside style={{ backgroundColor: '#fff', borderRadius: '32px', padding: '32px', border: '1px solid rgba(195,198,214,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', position: 'sticky', top: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {[
                                    { step: 1, title: 'Identity', desc: 'Basics & Description', icon: <Briefcase size={20} /> },
                                    { step: 2, title: 'Structure', desc: 'Pricing & Packages', icon: <Wallet size={20} /> },
                                    { step: 3, title: 'Visibility', desc: 'Location & Media', icon: <MapPin size={20} /> }
                                ].map(s => (
                                    <div 
                                        key={s.step} 
                                        onClick={() => gigStep > s.step && setGigStep(s.step)}
                                        style={{ 
                                            display: 'flex', gap: '20px', alignItems: 'center', 
                                            cursor: gigStep > s.step ? 'pointer' : 'default', 
                                            opacity: gigStep === s.step ? 1 : gigStep > s.step ? 0.8 : 0.4, 
                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            padding: '12px',
                                            borderRadius: '16px',
                                            backgroundColor: gigStep === s.step ? 'rgba(0, 61, 155, 0.03)' : 'transparent'
                                        }}
                                    >
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '14px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            backgroundColor: gigStep === s.step ? 'var(--primary)' : gigStep > s.step ? '#d1fae5' : '#f3f4f6',
                                            color: gigStep === s.step ? '#fff' : gigStep > s.step ? '#059669' : '#94a3b8',
                                            boxShadow: gigStep === s.step ? '0 8px 16px rgba(0, 61, 155, 0.2)' : 'none',
                                            transition: 'all 0.3s'
                                        }}>
                                            {gigStep > s.step ? <Check size={20} /> : s.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: gigStep === s.step ? 'var(--primary)' : '#191b23' }}>{s.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>{s.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '40px', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <Award size={18} color="var(--primary)" />
                                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#191b23' }}>Pro Tip</span>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
                                    Add high-quality photos of your previous work to increase booking rates by up to 40%.
                                </p>
                            </div>
                        </aside>

                        {/* Main Form Area */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="card" style={{ padding: '48px', borderRadius: '32px', border: '1px solid rgba(195,198,214,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', backgroundColor: '#fff' }}>
                                {gigStep === 1 && (
                                    <div className="animate-fade-in">
                                        <div style={{ marginBottom: '32px' }}>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', color: '#191b23', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Listing Type</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                <div
                                                    onClick={() => setGigBusinessType('service')}
                                                    style={{
                                                        padding: '32px 24px', borderRadius: '24px', border: '2px solid',
                                                        borderColor: gigBusinessType === 'service' ? 'var(--primary)' : 'rgba(226, 232, 240, 0.8)',
                                                        cursor: 'pointer', backgroundColor: gigBusinessType === 'service' ? 'rgba(0, 61, 155, 0.02)' : 'transparent', 
                                                        textAlign: 'center', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        boxShadow: gigBusinessType === 'service' ? '0 12px 24px rgba(0, 61, 155, 0.08)' : 'none'
                                                    }}>
                                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: gigBusinessType === 'service' ? 'var(--primary)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: gigBusinessType === 'service' ? '#fff' : '#64748b' }}>
                                                        <Briefcase size={28} />
                                                    </div>
                                                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: gigBusinessType === 'service' ? 'var(--primary)' : '#191b23' }}>Service Provider</div>
                                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px', lineHeight: 1.4 }}>Individual professional or home services</p>
                                                </div>
                                                <div
                                                    onClick={() => setGigBusinessType('shop')}
                                                    style={{
                                                        padding: '32px 24px', borderRadius: '24px', border: '2px solid',
                                                        borderColor: gigBusinessType === 'shop' ? 'var(--primary)' : 'rgba(226, 232, 240, 0.8)',
                                                        cursor: 'pointer', backgroundColor: gigBusinessType === 'shop' ? 'rgba(0, 61, 155, 0.02)' : 'transparent', 
                                                        textAlign: 'center', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        boxShadow: gigBusinessType === 'shop' ? '0 12px 24px rgba(0, 61, 155, 0.08)' : 'none'
                                                    }}>
                                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: gigBusinessType === 'shop' ? 'var(--primary)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: gigBusinessType === 'shop' ? '#fff' : '#64748b' }}>
                                                        <MapPin size={28} />
                                                    </div>
                                                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: gigBusinessType === 'shop' ? 'var(--primary)' : '#191b23' }}>Physical Shop</div>
                                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px', lineHeight: 1.4 }}>Local store or vendor outlet space</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                            <div style={styles.formGroup}>
                                                <label style={{ ...styles.label, fontWeight: '800' }}>{gigBusinessType === 'service' ? 'Gig Title' : 'Shop Name'}</label>
                                                <input type="text" className="input-field" style={{ height: '56px', borderRadius: '16px', padding: '0 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} placeholder={gigBusinessType === 'service' ? "e.g. I will fix your technical plumbing issues" : "e.g. Sharma Grocery Store"} value={gigTitle} onChange={e => setGigTitle(e.target.value)} />
                                            </div>

                                            <div style={styles.formGroup}>
                                                <label style={{ ...styles.label, fontWeight: '800' }}>Service Category</label>
                                                <select className="input-field" style={{ height: '56px', borderRadius: '16px', padding: '0 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', appearance: 'none' }} value={gigCategory} onChange={e => setGigCategory(e.target.value)}>
                                                    <option value="" disabled>-- Select Category --</option>
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
                                                    <option value="Other">Other (Add Custom)</option>
                                                </select>
                                            </div>
                                        </div>

                                        {gigCategory === 'Salon' && (
                                            <div className="animate-fade-in shadow-sm" style={{ ...styles.formGroup, background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
                                                <label style={{ ...styles.label, marginBottom: '16px', display: 'block', fontWeight: '800' }}>Target Audience</label>
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    {['male', 'female', 'unisex'].map(gender => (
                                                        <div
                                                            key={gender}
                                                            onClick={() => setGigTargetGender(gender)}
                                                            style={{
                                                                flex: 1, padding: '16px', borderRadius: '16px', cursor: 'pointer', textAlign: 'center',
                                                                border: `2px solid ${gigTargetGender === gender ? 'var(--primary)' : 'rgba(226, 232, 240, 0.8)'}`,
                                                                backgroundColor: gigTargetGender === gender ? 'rgba(0, 61, 155, 0.05)' : '#fff',
                                                                fontWeight: '800', fontSize: '0.9rem', color: gigTargetGender === gender ? 'var(--primary)' : '#64748b',
                                                                textTransform: 'capitalize', transition: 'all 0.2s',
                                                                boxShadow: gigTargetGender === gender ? '0 4px 12px rgba(0, 61, 155, 0.1)' : 'none'
                                                            }}
                                                        >
                                                            {gender}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {gigCategory === 'Other' && (
                                            <div style={styles.formGroup} className="animate-fade-in">
                                                <label style={{ ...styles.label, fontWeight: '800' }}>Custom Category Name</label>
                                                <input type="text" className="input-field" style={{ height: '56px', borderRadius: '16px', padding: '0 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} placeholder="e.g. Pet Grooming" value={gigCustomCategory} onChange={e => setGigCustomCategory(e.target.value)} />
                                            </div>
                                        )}

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                            {gigBusinessType === 'service' ? (
                                                <>
                                                    <div style={styles.formGroup}>
                                                        <label style={{ ...styles.label, fontWeight: '800' }}>Years of Experience</label>
                                                        <input type="number" className="input-field" style={{ height: '56px', borderRadius: '16px', padding: '0 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} placeholder="e.g. 5" value={gigExperience} onChange={e => setGigExperience(e.target.value)} />
                                                    </div>
                                                    <div style={styles.formGroup}>
                                                        <label style={{ ...styles.label, fontWeight: '800' }}>Total Jobs Completed</label>
                                                        <input type="number" className="input-field" style={{ height: '56px', borderRadius: '16px', padding: '0 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} placeholder="e.g. 150" value={gigJobsCompleted} onChange={e => setGigJobsCompleted(e.target.value)} />
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                                                    <label style={{ ...styles.label, fontWeight: '800' }}>Establishment Age (Years)</label>
                                                    <input type="number" className="input-field" style={{ height: '56px', borderRadius: '16px', padding: '0 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} placeholder="e.g. 10" value={shopAge} onChange={e => setShopAge(e.target.value)} />
                                                </div>
                                            )}
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={{ ...styles.label, fontWeight: '800' }}>Detailed Description</label>
                                            <textarea className="input-field" style={{ borderRadius: '20px', padding: '20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} rows="6" placeholder="Tell your customers what makes your service unique..." value={gigDesc} onChange={e => setGigDesc(e.target.value)}></textarea>
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={{ ...styles.label, fontWeight: '800' }}>Key Features / Inclusions</label>
                                            <input type="text" className="input-field" style={{ height: '56px', borderRadius: '16px', padding: '0 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} placeholder="e.g. Parts replacement, Professional cleanup, 6-month warranty" value={gigServicesIncluded} onChange={e => setGigServicesIncluded(e.target.value)} />
                                            <p className="text-small" style={{ marginTop: '8px', color: '#64748b' }}>Enter items separated by commas to display them as bullet points.</p>
                                        </div>
                                    </div>
                                )}

                                {gigStep === 2 && (
                                    <div className="animate-fade-in">
                                        <div className="flex-between" style={{ marginBottom: '32px' }}>
                                            <div>
                                                <h4 style={{ fontWeight: '800', fontSize: '1.25rem', color: '#191b23' }}>Pricing Strategy</h4>
                                                <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>Choose how you want to bill your clients.</p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f1f5f9', padding: '10px 20px', borderRadius: '14px' }}>
                                                <span className="text-small" style={{ color: '#1e293b', fontWeight: '800' }}>3-Tier Pricing</span>
                                                <input type="checkbox" checked={usePlans} onChange={e => setUsePlans(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                                            </div>
                                        </div>

                                        {!usePlans ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', backgroundColor: '#f8fafc', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                                                <div style={styles.formGroup}>
                                                    <label style={{ ...styles.label, fontWeight: '800' }}>Standard Price (₹)</label>
                                                    <div style={{ position: 'relative' }}>
                                                        <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: '#64748b' }}>₹</span>
                                                        <input type="number" className="input-field" style={{ height: '56px', borderRadius: '16px', padding: '0 20px 0 40px', backgroundColor: '#fff', border: '1px solid #e2e8f0' }} placeholder="0.00" value={gigPrice} onChange={e => setGigPrice(e.target.value)} />
                                                    </div>
                                                </div>
                                                <div style={styles.formGroup}>
                                                    <label style={{ ...styles.label, fontWeight: '800' }}>Billing Model</label>
                                                    <select className="input-field" style={{ height: '56px', borderRadius: '16px', padding: '0 20px', backgroundColor: '#fff', border: '1px solid #e2e8f0' }} value={gigPriceType} onChange={e => setGigPriceType(e.target.value)}>
                                                        <option value="fixed">Fixed Price</option>
                                                        <option value="hourly">Hourly Rate</option>
                                                        <option value="starting_at">Starting At</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                                {gigPlans.map((plan, idx) => (
                                                    <div key={idx} style={{
                                                        border: '2px solid', borderRadius: '24px', padding: '24px',
                                                        backgroundColor: idx === 1 ? 'rgba(0, 61, 155, 0.02)' : '#fff', 
                                                        borderColor: idx === 1 ? 'var(--primary)' : '#e2e8f0',
                                                        transition: 'transform 0.3s',
                                                        boxShadow: idx === 1 ? '0 12px 30px rgba(0, 61, 155, 0.1)' : 'none'
                                                    }}>
                                                        <div style={{ fontWeight: '900', fontSize: '0.85rem', color: idx === 1 ? 'var(--primary)' : '#64748b', marginBottom: '20px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                            {idx === 0 ? 'Basic' : idx === 1 ? 'Standard' : 'Premium'}
                                                        </div>
                                                        <div style={styles.formGroup}>
                                                            <div style={{ position: 'relative' }}>
                                                                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: '#64748b', fontSize: '0.9rem' }}>₹</span>
                                                                <input type="number" className="input-field" style={{ height: '48px', borderRadius: '12px', padding: '0 16px 0 32px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} placeholder="Price" value={plan.price} onChange={e => {
                                                                    const np = [...gigPlans]; np[idx].price = e.target.value; setGigPlans(np);
                                                                }} />
                                                            </div>
                                                        </div>
                                                        <div style={styles.formGroup}>
                                                            <textarea className="input-field" style={{ borderRadius: '14px', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.85rem' }} rows="3" placeholder="Plan description..." value={plan.description} onChange={e => {
                                                                const np = [...gigPlans]; np[idx].description = e.target.value; setGigPlans(np);
                                                            }} />
                                                        </div>
                                                        <div style={styles.formGroup}>
                                                            <input type="text" className="input-field" style={{ height: '48px', borderRadius: '12px', padding: '0 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.85rem' }} placeholder="Features (comma sep)" value={plan.features} onChange={e => {
                                                                const np = [...gigPlans]; np[idx].features = e.target.value; setGigPlans(np);
                                                            }} />
                                                        </div>
                                                        <div style={{ ...styles.formGroup, marginBottom: 0 }}>
                                                            <select className="input-field" style={{ height: '48px', borderRadius: '12px', padding: '0 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.85rem' }} value={plan.deliveryTime} onChange={e => {
                                                                const np = [...gigPlans]; np[idx].deliveryTime = e.target.value; setGigPlans(np);
                                                            }}>
                                                                <option>1 Day Delivery</option>
                                                                <option>2 Days Delivery</option>
                                                                <option>5 Days Delivery</option>
                                                                <option>10 Days Delivery</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {gigBusinessType === 'shop' && (
                                            <div style={{ marginTop: '40px', padding: '32px', backgroundColor: '#f0f9ff', borderRadius: '28px', border: '1px solid #bae6fd' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                                    <BadgeCheck size={24} color="#0369a1" />
                                                    <h4 style={{ fontWeight: '800', color: '#0369a1', margin: 0 }}>Operational Details</h4>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                    <div style={styles.formGroup}>
                                                        <label style={{ ...styles.label, color: '#0369a1', fontWeight: '800' }}>Opening Hours</label>
                                                        <input type="time" className="input-field" style={{ height: '56px', borderRadius: '16px', backgroundColor: '#fff', border: '1px solid #bae6fd' }} value={shopOpeningTime} onChange={e => setShopOpeningTime(e.target.value)} />
                                                    </div>
                                                    <div style={styles.formGroup}>
                                                        <label style={{ ...styles.label, color: '#0369a1', fontWeight: '800' }}>Closing Hours</label>
                                                        <input type="time" className="input-field" style={{ height: '56px', borderRadius: '16px', backgroundColor: '#fff', border: '1px solid #bae6fd' }} value={shopClosingTime} onChange={e => setShopClosingTime(e.target.value)} />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', backgroundColor: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
                                                        <input type="checkbox" checked={shopIsHomeDelivery} onChange={e => setShopIsHomeDelivery(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#0369a1' }} />
                                                        <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.9rem' }}>Enable Home Delivery Service</span>
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', backgroundColor: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
                                                        <input type="checkbox" checked={shopIsHomeService} onChange={e => setShopIsHomeService(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#0369a1' }} />
                                                        <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.9rem' }}>Enable On-Site Home Visits</span>
                                                    </label>
                                                    {shopIsHomeService && (
                                                        <div className="animate-fade-in" style={{ padding: '0 16px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                                <span style={{ color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>Minimum Visiting Fee:</span>
                                                                <div style={{ position: 'relative' }}>
                                                                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: '#64748b' }}>₹</span>
                                                                    <input type="number" className="input-field" style={{ padding: '0 12px 0 28px', height: '44px', fontSize: '0.9rem', width: '140px', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #bae6fd' }} placeholder="e.g. 150" value={shopHomeServiceFee} onChange={e => setShopHomeServiceFee(e.target.value)} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {gigStep === 3 && (
                                    <div className="animate-fade-in">
                                        <div style={{ marginBottom: '32px' }}>
                                            <h4 style={{ fontWeight: '800', fontSize: '1.25rem', color: '#191b23' }}>Visuals & Reach</h4>
                                            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>Help customers find and trust your business.</p>
                                        </div>

                                        {gigBusinessType === 'shop' && (
                                            <>
                                                <div style={styles.formGroup}>
                                                    <label style={{ ...styles.label, fontWeight: '800' }}>Drop a Pin on Your Location</label>
                                                    <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                        <MapPicker lat={gigLat} lng={gigLng} onChange={({ lat, lng }) => { setGigLat(lat); setGigLng(lng); }} />
                                                    </div>
                                                </div>

                                                <div style={{ ...styles.formGroup, background: 'rgba(0, 61, 155, 0.03)', padding: '24px', borderRadius: '24px', border: '1px dashed var(--primary)' }}>
                                                    <label style={{ ...styles.label, fontWeight: '800', color: 'var(--primary)' }}>Google Maps Integration</label>
                                                    <input
                                                        type="url"
                                                        className="input-field"
                                                        style={{ height: '56px', borderRadius: '16px', padding: '0 20px', backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                                                        placeholder="Paste shop link (e.g. https://maps.app.goo.gl/...)"
                                                        value={shopGoogleMapsLink}
                                                        onChange={e => setShopGoogleMapsLink(e.target.value)}
                                                    />
                                                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                        <RotateCw size={16} color="var(--primary)" style={{ marginTop: '2px' }} />
                                                        <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                                                            Syncing your Google Maps link helps us verify your business and show it to local customers more effectively.
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                            <div style={styles.formGroup}>
                                                <label style={{ ...styles.label, fontWeight: '800' }}>State</label>
                                                <select
                                                    className="input-field"
                                                    style={{ height: '56px', borderRadius: '16px', padding: '0 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                                                    value={gigStateCode}
                                                    onChange={e => {
                                                        const stateCode = e.target.value;
                                                        const stateObj = indianStates.find(s => s.isoCode === stateCode);
                                                        setGigStateCode(stateCode);
                                                        setGigState(stateObj ? stateObj.name : '');
                                                        setGigCity('');
                                                    }}
                                                >
                                                    <option value="">Select State</option>
                                                    {indianStates.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                                                </select>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={{ ...styles.label, fontWeight: '800' }}>City</label>
                                                <select className="input-field" style={{ height: '56px', borderRadius: '16px', padding: '0 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} value={gigCity} onChange={e => setGigCity(e.target.value)} disabled={!gigStateCode}>
                                                    <option value="">Select City</option>
                                                    {gigStateCode && City.getCitiesOfState('IN', gigStateCode).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                            <div style={styles.formGroup}>
                                                <label style={{ ...styles.label, fontWeight: '800' }}>Street Address</label>
                                                <input type="text" className="input-field" style={{ height: '56px', borderRadius: '16px', padding: '0 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} placeholder="e.g. 123 Main St, Near Central Park" value={gigAddress} onChange={e => setGigAddress(e.target.value)} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={{ ...styles.label, fontWeight: '800' }}>Pincode</label>
                                                <input type="text" className="input-field" style={{ height: '56px', borderRadius: '16px', padding: '0 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} placeholder="e.g. 226001" value={gigZipCode} onChange={e => setGigZipCode(e.target.value)} />
                                            </div>
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={{ ...styles.label, fontWeight: '800' }}>Service Radius (Pincodes)</label>
                                            <input type="text" className="input-field" style={{ height: '56px', borderRadius: '16px', padding: '0 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} placeholder="e.g. 110001, 110002" value={gigCoveragePincodes} onChange={e => setGigCoveragePincodes(e.target.value)} />
                                            <p className="text-small" style={{ marginTop: '8px', color: '#64748b' }}>Comma separated pincodes where you provide service.</p>
                                        </div>

                                        <div style={{ marginTop: '32px' }}>
                                            <label style={{ ...styles.label, fontWeight: '800', marginBottom: '16px', display: 'block' }}>Gig Portfolio (Max 5)</label>
                                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                                {gigImages.map((url, i) => (
                                                    <div key={i} style={{ position: 'relative', width: '120px', height: '100px', borderRadius: '20px', overflow: 'hidden', border: '2px solid #f1f5f9' }}>
                                                        <img
                                                            src={url}
                                                            alt={`gig-${i}`}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/120x100?text=Service'; }}
                                                        />
                                                        <button onClick={() => setGigImages(prev => prev.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: '8px', right: '8px', width: '24px', height: '24px', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {gigImages.length < 5 && (
                                                    <label style={{ width: '120px', height: '100px', border: '2px dashed #cbd5e1', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.3s', backgroundColor: '#f8fafc' }}>
                                                        <Plus size={28} />
                                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', marginTop: '4px' }}>Upload</span>
                                                        <input type="file" multiple accept="image/*" onChange={handleGigImageUpload} style={{ display: 'none' }} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <button
                                        onClick={() => setGigStep(prev => Math.max(1, prev - 1))}
                                        className="btn-outline"
                                        disabled={gigStep === 1}
                                        style={{ 
                                            padding: '14px 28px', borderRadius: '16px', fontWeight: '700', 
                                            visibility: gigStep === 1 ? 'hidden' : 'visible',
                                            border: '1.5px solid #e2e8f0', color: '#1e293b'
                                        }}
                                    >Back</button>

                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        {gigStep < 3 ? (
                                            <button onClick={() => setGigStep(prev => prev + 1)} className="btn-primary" style={{ padding: '14px 40px', borderRadius: '16px', fontWeight: '800', boxShadow: '0 8px 20px rgba(0, 61, 155, 0.2)' }}>
                                                Continue <ChevronRight size={18} style={{ marginLeft: '4px' }} />
                                            </button>
                                        ) : (
                                            <button onClick={handleCreateGig} disabled={creatingGig || uploadingGigImages} className="btn-primary" style={{ padding: '14px 48px', borderRadius: '16px', fontWeight: '800', backgroundColor: '#059669', boxShadow: '0 8px 20px rgba(5, 150, 105, 0.2)' }}>
                                                {creatingGig ? <Loader size={20} className="animate-spin" /> : (editingGigId ? 'Update Listing' : 'Publish Listing')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Help Section */}
                            <div style={{ backgroundColor: 'rgba(0, 61, 155, 0.02)', padding: '24px 32px', borderRadius: '24px', border: '1px solid rgba(0, 61, 155, 0.1)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                    <Video size={20} color="var(--primary)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#191b23' }}>Need help with your listing?</h5>
                                    <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Watch our quick 2-minute guide on creating a winning gig profile.</p>
                                </div>
                                <button style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>Watch Tutorial</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MY GIGS TAB ── */}
            {activeTab === 'mygigs' && (
                <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Status legend */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                        {[['🟡 Pending', '#fef3c7', '#92400e'], ['🟢 Live', '#d1fae5', '#065f46'], ['🔴 Rejected', '#fee2e2', '#991b1b']].map(([l, bg, c]) => (
                            <span key={l} style={{ backgroundColor: bg, color: c, padding: '3px 12px', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 600 }}>{l}</span>
                        ))}
                    </div>

                    {gigsLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading your gigs…</div>
                    ) : myGigs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 40px', border: '2px dashed var(--border-color)', borderRadius: 12 }}>
                            <Briefcase size={40} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.4 }} />
                            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                                {providerStatus === 'pending'
                                    ? 'Your provider account is pending approval. You can start submitting gigs — they will go live once you are approved.'
                                    : 'You haven\'t created any gigs yet.'}
                            </p>
                            <button className="btn-primary" onClick={() => setActiveTab('services')}>Create First Gig</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {myGigs.map(gig => {
                                const isLive = gig.isApproved && gig.isActive;
                                const isPending = !gig.isApproved;
                                const isRejected = !gig.isApproved && !gig.isActive && gig.updatedAt !== gig.createdAt;

                                let statusLabel = isPending ? '⏳ Pending Review' : isLive ? '✅ Live' : '❌ Rejected';
                                let statusBg = isPending ? '#fef3c7' : isLive ? '#d1fae5' : '#fee2e2';
                                let statusColor = isPending ? '#92400e' : isLive ? '#065f46' : '#991b1b';

                                return (
                                    <div key={gig._id} style={{
                                        border: `1.5px solid ${isPending ? '#fde68a' : isLive ? '#6ee7b7' : '#fca5a5'}`,
                                        borderRadius: 12, backgroundColor: '#fff',
                                        padding: '16px 20px',
                                        display: 'flex', gap: 16, alignItems: 'flex-start',
                                    }}>
                                        {/* Thumbnail */}
                                        <img
                                            src={gig.images?.[0] || (user?.avatar && user.avatar.startsWith('http') ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || gig.title)}&background=ede9fe&color=4f46e5&size=60`)}
                                            alt={gig.title}
                                            style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-color)' }}
                                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || gig.title)}&background=ede9fe&color=4f46e5&size=60`; }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{gig.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                                        {gig.category} · ₹{gig.price} / {gig.priceType}
                                                        {gig.location?.city && ` · ${gig.location.city}`}
                                                    </div>
                                                </div>
                                                <span style={{ backgroundColor: statusBg, color: statusColor, padding: '3px 12px', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                    {statusLabel}
                                                </span>
                                            </div>
                                            {gig.description && (
                                                <p style={{
                                                    fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5,
                                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                                }}>
                                                    {gig.description}
                                                </p>
                                            )}
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                                Submitted: {new Date(gig.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: 8, alignSelf: 'center' }}>
                                            <button
                                                onClick={() => handleEditClick(gig)}
                                                style={{ padding: 8, borderRadius: '50%', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', backgroundColor: '#fff' }}
                                                title="Edit Gig"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGig(gig._id)}
                                                style={{ padding: 8, borderRadius: '50%', border: '1px solid #fee2e2', color: '#ef4444', cursor: 'pointer', backgroundColor: '#fff' }}
                                                title="Delete Gig"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── BOOKING REQUESTS TAB (PROVIDER) ── */}
            {activeTab === 'requests' && (
                <div className="animate-fade-in" style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
                    {/* Quick Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                        {[
                            { label: 'Pending', value: bookingRequests.filter(r => r.status === 'pending').length, color: '#f59e0b', bg: '#fef3c7', icon: Clock },
                            { label: 'Active', value: bookingRequests.filter(r => ['confirmed', 'in_progress'].includes(r.status)).length, color: '#003d9b', bg: '#e0e7ff', icon: PlayCircle },
                            { label: 'Completed', value: bookingRequests.filter(r => r.status === 'completed').length, color: '#059669', bg: '#d1fae5', icon: CheckCircle },
                            { label: 'Total Value', value: `₹${bookingRequests.filter(r => r.status !== 'cancelled').reduce((acc, curr) => acc + (curr.totalPrice || 0), 0)}`, color: '#191b23', bg: '#f1f5f9', icon: DollarSign }
                        ].map((stat, i) => (
                            <div key={i} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{stat.label}</p>
                                    <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#191b23', margin: 0 }}>{stat.value}</h4>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filter Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', background: '#f1f5f9', padding: '6px', borderRadius: '100px', gap: '4px' }}>
                            {['all', 'pending', 'confirmed', 'in_progress', 'delivered', 'completed', 'cancelled'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setBookingFilter(f)}
                                    style={{
                                        padding: '8px 20px',
                                        borderRadius: '100px',
                                        fontSize: '13px',
                                        fontWeight: bookingFilter === f ? '700' : '600',
                                        border: 'none',
                                        backgroundColor: bookingFilter === f ? '#fff' : 'transparent',
                                        color: bookingFilter === f ? '#003d9b' : '#64748b',
                                        boxShadow: bookingFilter === f ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {bookingsLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '24px' }}></div>)}
                        </div>
                    ) : bookingRequests.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 40px', backgroundColor: '#fff', borderRadius: '32px', border: '1px dashed #e2e8f0' }}>
                            <div style={{ width: '80px', height: '80px', backgroundColor: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#94a3b8' }}>
                                <PackageOpen size={40} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#191b23', marginBottom: '8px' }}>No Orders Found</h3>
                            <p style={{ color: '#64748b', maxWidth: '300px', margin: '0 auto' }}>You don't have any orders matching the selected filter.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {bookingRequests
                                .filter(b => bookingFilter === 'all' || b.status === bookingFilter)
                                .map(req => {
                                    const statusConfig = {
                                        pending: { color: '#f59e0b', bg: '#fef3c7', text: 'New Request' },
                                        confirmed: { color: '#003d9b', bg: '#e0e7ff', text: 'Confirmed' },
                                        in_progress: { color: '#003d9b', bg: '#e0e7ff', text: 'In Progress' },
                                        delivered: { color: '#059669', bg: '#d1fae5', text: 'Delivered' },
                                        completed: { color: '#059669', bg: '#d1fae5', text: 'Completed' },
                                        cancelled: { color: '#ef4444', bg: '#fee2e2', text: 'Cancelled' },
                                        revision_requested: { color: '#f59e0b', bg: '#fef3c7', text: 'Revision' }
                                    };
                                    const config = statusConfig[req.status] || statusConfig.pending;

                                    return (
                                        <div key={req._id} className="group" style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9', transition: 'all 0.3s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                            <div style={{ display: 'flex', gap: '32px' }}>
                                                {/* Service Preview */}
                                                <div style={{ position: 'relative', width: '180px', height: '140px', borderRadius: '20px', overflow: 'hidden', flexShrink: 0 }}>
                                                    <img
                                                        src={req.service?.images?.[0]?.url || req.service?.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=500&auto=format&fit=crop'}
                                                        alt={req.service?.title}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                    <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                                                        <span style={{ backgroundColor: config.bg, color: config.color, padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(255,255,255,0.2)' }}>
                                                            {config.text}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Details Section */}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                                        <div>
                                                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#191b23', marginBottom: '8px', letterSpacing: '-0.02em' }}>{req.service?.title}</h3>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.875rem' }}>
                                                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <User size={14} />
                                                                    </div>
                                                                    <span style={{ fontWeight: 600, color: '#191b23' }}>{req.user?.name}</span>
                                                                </div>
                                                                <div style={{ width: '1px', height: '12px', backgroundColor: '#e2e8f0' }}></div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.875rem' }}>
                                                                    <CalendarIcon size={14} />
                                                                    <span>{new Date(req.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {req.timeSlot}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#003d9b' }}>₹{req.totalPrice}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>Order Value</div>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '20px', padding: '20px', backgroundColor: '#fafafa', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                                            <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', color: '#059669' }}>
                                                                <Phone size={18} />
                                                            </div>
                                                            <div>
                                                                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Customer Contact</p>
                                                                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#434654', margin: 0 }}>{req.customerName || req.user?.name}</p>
                                                                <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b', margin: 0 }}>
                                                                    {['completed', 'cancelled'].includes(req.status) ? 'Hidden (Order Closed)' : (req.customerPhone || req.user?.phone || 'Phone not provided')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                                            <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', color: '#003d9b' }}>
                                                                <MapPin size={18} />
                                                            </div>
                                                            <div>
                                                                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Delivery Address</p>
                                                                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#434654', margin: 0 }}>{req.address?.street || 'Not specified'}, {req.address?.city} {req.address?.zipCode}</p>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                                                            {req.address?.lat && req.address?.lng && (
                                                                <button
                                                                    onClick={() => window.open(`https://www.google.com/maps?q=${req.address.lat},${req.address.lng}`, '_blank')}
                                                                    style={{ backgroundColor: '#fff', color: '#003d9b', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                                                                >
                                                                    <MapPin size={16} /> Maps
                                                                </button>
                                                            )}
                                                            {req.service?.businessType === 'shop' && (
                                                                <button
                                                                    onClick={() => {
                                                                        const lat = req.service.geoCoordinates?.coordinates?.[1];
                                                                        const lng = req.service.geoCoordinates?.coordinates?.[0];
                                                                        if (lat && lng) window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                                                                    }}
                                                                    style={{ backgroundColor: '#003d9b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                                                                >
                                                                    Directions
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                                        {req.status === 'pending' && (
                                                            <>
                                                                <button onClick={() => updateBookingStatus(req._id, 'confirmed')} style={{ flex: 2, background: 'linear-gradient(to right, #003d9b, #0052cc)', color: 'white', padding: '14px 0', borderRadius: '14px', fontWeight: '800', fontSize: '0.95rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 16px -4px rgba(0,61,155,0.3)', transition: 'all 0.3s' }}>
                                                                    Accept Request
                                                                </button>
                                                                <button onClick={() => updateBookingStatus(req._id, 'cancelled')} style={{ flex: 1, backgroundColor: '#fff', color: '#ef4444', border: '1px solid #fee2e2', padding: '14px 0', borderRadius: '14px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                                                                    Decline
                                                                </button>
                                                            </>
                                                        )}
                                                        {req.status === 'confirmed' && (
                                                            <>
                                                                <button onClick={() => updateBookingStatus(req._id, 'in_progress')} style={{ flex: 2, background: '#003d9b', color: 'white', padding: '14px 0', borderRadius: '14px', fontWeight: '800', fontSize: '0.95rem', border: 'none', cursor: 'pointer' }}>
                                                                    Start Service
                                                                </button>
                                                                <button 
                                                                    onClick={() => {
                                                                        const link = req.address?.googleMapLink || (req.address?.lat && req.address?.lng ? `https://www.google.com/maps?q=${req.address.lat},${req.address.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${req.address?.street || ''} ${req.address?.city || ''} ${req.address?.zipCode || ''}`.trim() || 'Customer Location')}`);
                                                                        window.open(link, '_blank');
                                                                    }}
                                                                    style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b', padding: '14px 0', borderRadius: '14px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                                >
                                                                    <MapPin size={18} /> Location
                                                                </button>
                                                            </>
                                                        )}
                                                        {['in_progress', 'revision_requested'].includes(req.status) && (
                                                            <button onClick={() => handleDeliverClick(req._id)} style={{ flex: 1, background: '#059669', color: 'white', padding: '14px 0', borderRadius: '14px', fontWeight: '800', fontSize: '0.95rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 16px -4px rgba(5,150,105,0.3)' }}>
                                                                Mark as Delivered
                                                            </button>
                                                        )}
                                                        {['confirmed', 'in_progress', 'revision_requested', 'delivered'].includes(req.status) && (
                                                            <>
                                                                <button 
                                                                    onClick={() => { setDashActiveRoom({ roomId: req._id, otherUser: req.user, title: req.service?.title }); setActiveTab('chat'); }} 
                                                                    style={{ padding: '0 24px', height: '48px', border: '1px solid #003d9b', color: '#003d9b', borderRadius: '14px', fontWeight: '800', fontSize: '0.95rem', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}
                                                                    onMouseOver={(e) => { e.currentTarget.style.background = '#f0f7ff'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                                    onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                                >
                                                                    <MessageSquare size={20} /> Message
                                                                </button>
                                                                {req.revisions?.length > 0 && (
                                                                    <button 
                                                                        onClick={() => { setBookingWithRevisions(req); setShowRevisions(true); }}
                                                                        style={{ padding: '0 24px', height: '48px', border: '1px solid #003d9b', color: '#003d9b', borderRadius: '14px', fontWeight: '800', fontSize: '0.95rem', background: '#f0f7ff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}
                                                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                                    >
                                                                        <History size={20} /> Revisions ({req.revisions.length})
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                        {req.status === 'completed' && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7', color: '#166534', fontWeight: 700, fontSize: '0.9rem' }}>
                                                                <CheckCircle size={20} /> Order completed and funds released.
                                                            </div>
                                                        )}
                                                        {req.status === 'cancelled' && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2', color: '#991b1b', fontWeight: 700, fontSize: '0.9rem' }}>
                                                                <XCircle size={20} /> This order was cancelled.
                                                            </div>
                                                        )}
                                                    </div>

                                                    {req.status === 'revision_requested' && req.revisions?.length > 0 && (
                                                        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '12px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', marginBottom: '8px' }}>
                                                                <RotateCcw size={16} />
                                                                <strong style={{ fontSize: '0.9rem' }}>Revision Requested:</strong>
                                                            </div>
                                                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e', lineHeight: 1.5 }}>{req.revisions[req.revisions.length - 1].note}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            )}

            <OrderDetailsModal 
                isOpen={!!selectedBookingDetails} 
                onClose={() => setSelectedBookingDetails(null)} 
                booking={selectedBookingDetails} 
            />

            <PaymentModal
                isOpen={!!bookingForPayment}
                onClose={() => setBookingForPayment(null)}
                onSelect={confirmDelivery}
            />

            <RevisionHistoryModal 
                isOpen={showRevisions} 
                onClose={() => setShowRevisions(false)} 
                revisions={bookingWithRevisions?.revisions || []} 
            />

            <RevisionModal 
                isOpen={!!bookingForRevision} 
                onClose={() => setBookingForRevision(null)} 
                onSubmit={async () => {
                    if (!bookingForRevision || !revisionNote.trim()) return;
                    try {
                        await updateBookingStatus(bookingForRevision._id, 'revision_requested', revisionNote);
                        setBookingForRevision(null);
                        setRevisionNote('');
                        toast.success('Revision request sent!');
                    } catch (err) {
                        console.error(err);
                        toast.error('Failed to send revision request');
                    }
                }}
                note={revisionNote}
                setNote={setRevisionNote}
            />


            {activeTab === 'profile' && (
                <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
                    {/* Header Section */}
                    <div style={{ marginBottom: '40px' }}>
                        <nav style={{ fontSize: '10px', fontWeight: '700', color: '#003d9b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                            Account / Account Settings
                        </nav>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#191b23', letterSpacing: '-0.025em', margin: 0, fontFamily: 'Manrope, sans-serif' }}>Profile Settings</h2>
                                <p style={{ color: '#434654', marginTop: '4px', fontSize: '1.125rem' }}>Manage your professional identity and presence.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                            <button
                                onClick={() => navigate(`/u/${profileUsername}`)}
                                style={{ padding: '10px 24px', borderRadius: '9999px', border: '1px solid #c3c6d6', color: '#003d9b', fontWeight: 600, fontSize: '0.875rem', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <ZoomIn size={16} />
                                Preview Mode
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={savingProfile}
                                style={{ padding: '10px 32px', borderRadius: '9999px', background: 'linear-gradient(to right, #003d9b, #0052cc)', color: 'white', fontWeight: 700, fontSize: '0.875rem', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: savingProfile ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {savingProfile ? <Loader size={16} className="animate-spin" /> : 'Save Changes'}
                            </button>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Layout: Bento Style */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px' }}>
                        {/* Profile Image & Quick Info */}
                        {/* Profile Image & Quick Info */}
                        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Modern User Card */}
                            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid rgba(195, 198, 214, 0.4)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden' }}>
                                {/* Header Banner */}
                                <div style={{ width: '100%', height: '120px', background: 'linear-gradient(135deg, #003d9b 0%, #3b82f6 100%)', position: 'relative' }}>
                                    <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                                </div>
                                
                                <div style={{ position: 'relative', padding: '0 32px 32px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-64px' }}>
                                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                                        <div style={{ padding: '6px', background: 'white', borderRadius: '50%', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)' }}>
                                            <img
                                                src={getAvatar({ avatar: profileAvatar, name: profileNameState })}
                                                alt={profileNameState}
                                                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }}
                                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileNameState || 'U')}&background=ede9fe&color=4f46e5&size=120`; }}
                                            />
                                        </div>
                                        <div style={{ position: 'absolute', bottom: '8px', right: '4px', backgroundColor: '#10b981', color: 'white', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 10 }}>
                                            <Check size={14} strokeWidth={4} />
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.025em' }}>{profileNameState}</h3>
                                        <span style={{ backgroundColor: user?.role === 'provider' ? '#fef08a' : '#e0e7ff', color: user?.role === 'provider' ? '#854d0e' : '#3730a3', fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '8px', letterSpacing: '0.05em' }}>{user?.role === 'provider' ? 'PRO' : 'USER'}</span>
                                    </div>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, marginBottom: '24px' }}>Joined {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                    
                                    <label htmlFor="avatar-upload-bento" style={{ width: '100%', padding: '12px 0', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', color: '#334155', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                                        {uploadingAvatar ? <Loader size={18} className="animate-spin" /> : <Camera size={18} color="#64748b" />}
                                        {uploadingAvatar ? 'Uploading...' : 'Update Profile Photo'}
                                        <input id="avatar-upload-bento" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                                    </label>
                                </div>
                            </div>

                            {/* Account Status Card */}
                            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '24px', border: '1px solid rgba(195, 198, 214, 0.4)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <div style={{ padding: '8px', background: '#ecfdf5', borderRadius: '10px', color: '#10b981' }}><BadgeCheck size={18} /></div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Account Status</h4>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}><Lock size={16} /></div>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Identity</span>
                                        </div>
                                        <div style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '8px', fontWeight: 800, fontSize: '0.75rem' }}>VERIFIED</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a', animation: 'pulse 2s infinite' }}></div></div>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Status</span>
                                        </div>
                                        <div style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.85rem' }}>Available</div>
                                    </div>
                                </div>
                            </div>

                            {/* Security Alert Card */}
                            <div style={{ background: 'linear-gradient(to right, #fff1f2, #ffe4e6)', padding: '24px', borderRadius: '24px', border: '1px solid #fecdd3', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1, color: '#e11d48' }}><Lock size={100} /></div>
                                <div style={{ position: 'relative', zIndex: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                        <div style={{ backgroundColor: '#e11d48', padding: '6px', borderRadius: '8px', color: 'white' }}><Lock size={16} /></div>
                                        <h4 style={{ fontWeight: 800, color: '#be123c', fontSize: '1rem', margin: 0 }}>Security Tip</h4>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#9f1239', lineHeight: 1.5, fontWeight: 500, marginBottom: '16px' }}>
                                        Protect your account by regularly updating your password and never sharing your OTP.
                                    </p>
                                    <button 
                                        onClick={() => toast.info('Password reset link sent to your email')}
                                        style={{ padding: '8px 16px', backgroundColor: 'rgba(225, 29, 72, 0.1)', color: '#be123c', fontWeight: 800, fontSize: '0.8rem', borderRadius: '10px', border: '1px solid rgba(225, 29, 72, 0.2)', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(225, 29, 72, 0.15)'}
                                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(225, 29, 72, 0.1)'}
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Form Area */}
                        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {/* Personal Info Section */}
                            <section style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', border: '1px solid rgba(195, 198, 214, 0.4)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <div style={{ padding: '10px', background: '#f0f7ff', borderRadius: '12px', color: '#003d9b' }}><User size={20} /></div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Personal Information</h3>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '32px', fontWeight: 500 }}>Update your basic profile information and contact details.</p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px 24px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Full Name</label>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <div style={{ position: 'absolute', left: '16px', color: '#94a3b8' }}><User size={18} /></div>
                                            <input
                                                style={{ width: '100%', backgroundColor: '#f8fafc', border: '2px solid #f1f5f9', borderRadius: '12px', padding: '14px 16px 14px 44px', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                                                type="text"
                                                value={profileNameState}
                                                onChange={e => setProfileNameState(e.target.value)}
                                                onFocus={e => { e.target.style.borderColor = '#003d9b'; e.target.style.backgroundColor = '#fff'; }}
                                                onBlur={e => { e.target.style.borderColor = '#f1f5f9'; e.target.style.backgroundColor = '#f8fafc'; }}
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Displayed on your public profile</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Username</label>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <div style={{ position: 'absolute', left: '16px', color: '#94a3b8', fontWeight: 800 }}>@</div>
                                            <input
                                                style={{ width: '100%', backgroundColor: '#f8fafc', border: '2px solid #f1f5f9', borderRadius: '12px', padding: '14px 16px 14px 44px', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                                                type="text"
                                                value={profileUsername}
                                                onChange={e => setProfileUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                                onFocus={e => { e.target.style.borderColor = '#003d9b'; e.target.style.backgroundColor = '#fff'; }}
                                                onBlur={e => { e.target.style.borderColor = '#f1f5f9'; e.target.style.backgroundColor = '#f8fafc'; }}
                                                placeholder="Choose a unique handle"
                                            />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Used for your unique profile URL</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Email Address</label>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <div style={{ position: 'absolute', left: '16px', color: '#94a3b8' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 4 10 8 10-8"/></svg>
                                            </div>
                                            <input
                                                style={{ width: '100%', backgroundColor: '#f1f5f9', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '14px 85px 14px 44px', fontSize: '0.95rem', fontWeight: 600, color: '#64748b', outline: 'none', cursor: 'not-allowed', boxSizing: 'border-box' }}
                                                type="email"
                                                value={user?.email}
                                                readOnly
                                            />
                                            <div style={{ position: 'absolute', right: '16px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800 }}>
                                                <CheckCircle size={14} /> Verified
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Contact support to change email</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Phone Number</label>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <div style={{ position: 'absolute', left: '16px', color: '#94a3b8' }}><Phone size={18} /></div>
                                            <input
                                                style={{ width: '100%', backgroundColor: '#f8fafc', border: '2px solid #f1f5f9', borderRadius: '12px', padding: '14px 16px 14px 44px', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                                                type="tel"
                                                value={profilePhone}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 10) setProfilePhone(val);
                                                }}
                                                onFocus={e => { e.target.style.borderColor = '#003d9b'; e.target.style.backgroundColor = '#fff'; }}
                                                onBlur={e => { e.target.style.borderColor = '#f1f5f9'; e.target.style.backgroundColor = '#f8fafc'; }}
                                                placeholder="Enter 10-digit number"
                                            />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Used for booking updates</span>
                                    </div>
                                </div>
                            </section>

                            <section style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', border: '1px solid rgba(195, 198, 214, 0.4)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <div style={{ padding: '10px', background: '#fef08a', borderRadius: '12px', color: '#ca8a04' }}><Award size={20} /></div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Professional Details</h3>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '32px', fontWeight: 500 }}>Tell customers what you do and highlight your expertise.</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Public Title / Headline</label>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <div style={{ position: 'absolute', left: '16px', color: '#94a3b8' }}><Briefcase size={18} /></div>
                                            <input
                                                style={{ width: '100%', backgroundColor: '#f8fafc', border: '2px solid #f1f5f9', borderRadius: '12px', padding: '14px 16px 14px 44px', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                                                type="text"
                                                value={providerTitle}
                                                maxLength={25}
                                                onChange={e => setProviderTitle(e.target.value)}
                                                onFocus={e => { e.target.style.borderColor = '#ca8a04'; e.target.style.backgroundColor = '#fff'; }}
                                                onBlur={e => { e.target.style.borderColor = '#f1f5f9'; e.target.style.backgroundColor = '#f8fafc'; }}
                                                placeholder="e.g. Expert Home Stylist or Senior Electrician"
                                            />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Appears below your name</span>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{providerTitle?.length || 0} / 25</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>About Me / Bio</label>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '16px', top: '16px', color: '#94a3b8' }}><FileText size={18} /></div>
                                            <textarea
                                                style={{ width: '100%', backgroundColor: '#f8fafc', border: '2px solid #f1f5f9', borderRadius: '12px', padding: '16px 16px 16px 44px', fontSize: '0.95rem', fontWeight: 500, color: '#1e293b', outline: 'none', resize: 'none', lineHeight: 1.6, transition: 'all 0.2s', boxSizing: 'border-box' }}
                                                rows="3"
                                                value={providerAbout}
                                                maxLength={50}
                                                onChange={e => setProviderAbout(e.target.value)}
                                                onFocus={e => { e.target.style.borderColor = '#ca8a04'; e.target.style.backgroundColor = '#fff'; }}
                                                onBlur={e => { e.target.style.borderColor = '#f1f5f9'; e.target.style.backgroundColor = '#f8fafc'; }}
                                                placeholder="Describe your skills in 50 characters or less..."
                                            ></textarea>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>A short introduction to your services</span>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{providerAbout?.length || 0} / 50</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Activity Log Card */}
                            <section style={{ backgroundColor: '#f3f3fd', padding: '32px', borderRadius: '24px', border: '2px dashed rgba(195, 198, 214, 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e1e2ec', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <History size={24} color="#737685" />
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: 700, color: '#191b23', margin: 0 }}>Activity Log</h4>
                                        <p style={{ fontSize: '0.875rem', color: '#434654', marginTop: '2px' }}>Review your recent login and profile activity.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => toast.info('Activity log feature coming soon')}
                                    style={{ padding: '10px 24px', backgroundColor: '#ffffff', color: '#191b23', fontWeight: 700, fontSize: '0.875rem', borderRadius: '9999px', border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer' }}
                                >
                                    View Logs
                                </button>
                            </section>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'chat' && (
                <div className="animate-fade-in" style={{
                    display: 'flex',
                    height: 'calc(100vh - 100px)',
                    overflow: 'hidden',
                    borderRadius: '24px',
                    border: '1px solid #e1e2ec',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: '#faf8ff'
                }}>
                    {/* 2. Conversation List Pane */}
                    <div style={{
                        width: '360px',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#ffffff',
                        borderRight: '1px solid #f1f5f9'
                    }}>
                        <div style={{ padding: '32px 32px 16px' }}>
                            <h2 style={{ fontSize: '1.875rem', fontWeight: 900, color: '#191b23', marginBottom: '24px', letterSpacing: '-0.025em', fontFamily: 'Manrope, sans-serif' }}>Messages</h2>
                            <div style={{ position: 'relative', marginBottom: '24px' }}>
                                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                    <Search size={20} color="#737685" />
                                </div>
                                <input
                                    style={{ width: '100%', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '12px', padding: '12px 16px 12px 48px', fontSize: '14px', outline: 'none', color: '#1e293b' }}
                                    placeholder="Search messages..." type="text"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', padding: '4px', backgroundColor: '#ededf8', borderRadius: '9999px' }}>
                                <button style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: 700, borderRadius: '9999px', backgroundColor: '#ffffff', color: '#003d9b', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>All</button>
                                <button style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: 700, borderRadius: '9999px', color: '#434654' }}>Unread</button>
                                <button style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: 700, borderRadius: '9999px', color: '#434654' }}>Archived</button>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 32px' }}>
                            <ChatList
                                onSelect={(room) => setDashActiveRoom(room)}
                                activeRoomId={dashActiveRoom?.roomId}
                            />
                        </div>
                    </div>

                    {/* 3. Primary Chat Area */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        {dashActiveRoom ? (
                            <>
                                {/* Chat Header */}
                                <div style={{ height: '72px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(195, 198, 214, 0.1)', zIndex: 40 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <img
                                                alt={dashActiveRoom.otherUser?.name || 'User'}
                                                style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #fff', objectFit: 'cover', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                                src={getAvatar(dashActiveRoom.otherUser)}
                                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dashActiveRoom.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`; }}
                                            />
                                            <span style={{ position: 'absolute', bottom: '0', right: '0', width: '12px', height: '12px', backgroundColor: '#22c55e', border: '2px solid #fff', borderRadius: '50%' }}></span>
                                        </div>
                                        <div>
                                            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#191b23', fontFamily: 'Manrope, sans-serif', margin: 0 }}>{dashActiveRoom.otherUser?.name || 'User'}</h2>
                                            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', letterSpacing: '0.025em' }}>
                                                <span className="animate-pulse" style={{ width: '6px', height: '6px', backgroundColor: '#22c55e', borderRadius: '50%' }}></span>
                                                ACTIVE NOW
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button 
                                            onClick={() => {
                                                toast.promise(fetchDashMessages(), {
                                                    loading: 'Refreshing...',
                                                    success: 'Chat updated',
                                                    error: 'Refresh failed'
                                                });
                                            }}
                                            style={{ padding: '10px', color: '#434654', borderRadius: '12px', border: '1px solid #f1f5f9', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                        >
                                            <RotateCw size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!dashActiveRoom?.roomId) return;
                                                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                                                console.log(`[DEBUG] Attempting to delete room: ${dashActiveRoom.roomId}`);
                                                api.delete(`/api/messages/${dashActiveRoom.roomId}`, config)
                                                    .then(() => {
                                                        console.log(`[DEBUG] Room deleted successfully: ${dashActiveRoom.roomId}`);
                                                        setDashMessages([]);
                                                        setDashActiveRoom(null);
                                                        toast.success('Chat history deleted');
                                                    })
                                                    .catch(err => {
                                                        console.error('Delete chat error:', err);
                                                        const msg = err.response?.data?.message || err.message || 'Failed to delete chat';
                                                        toast.error(msg);
                                                    });
                                            }}
                                            style={{ padding: '12px', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            title="Delete Chat"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Service Context Card */}
                                {activeService && (
                                    <div style={{ padding: '12px 40px', backgroundColor: '#faf8ff', borderBottom: '1px solid #ededf8', display: 'flex', gap: '16px', alignItems: 'center', position: 'relative', zIndex: 30 }}>
                                        <img
                                            src={activeService.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeService.title)}&background=f8fafc&color=4f46e5`}
                                            style={{ width: '64px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #e1e2ec' }}
                                            alt=""
                                        />
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '10px', fontWeight: 900, color: '#003d9b', textTransform: 'uppercase', letterSpacing: '0.025em', backgroundColor: 'rgba(0,61,155,0.05)', padding: '2px 8px', borderRadius: '4px' }}>Inquiry Context</span>
                                            </div>
                                            <h4 style={{ fontSize: '14px', fontWeight: 800, marginTop: '4px', color: '#191b23', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeService.title}</h4>
                                        </div>
                                        <button
                                            onClick={() => setActiveService(null)}
                                            style={{ width: '32px', height: '32px', backgroundColor: '#ededf8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#737685' }}
                                        >✕</button>
                                    </div>
                                )}

                                {/* Chat History */}
                                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', scrollBehavior: 'smooth', backgroundColor: '#fdfdff' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#737685', backgroundColor: '#ededf8', padding: '4px 12px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>

                                    {dashMessages.length === 0 ? (
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#737685', fontSize: '14px' }}>
                                            No messages yet. Say hi!
                                        </div>
                                    ) : (
                                        dashMessages.map((msg, idx) => {
                                            const isMe = msg.senderId === user?._id;
                                            return isMe ? (
                                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginLeft: 'auto', maxWidth: '70%' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                        <span style={{ fontSize: '10px', color: 'rgba(115,118,133,0.5)', fontWeight: 500 }}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#003d9b', fontFamily: 'Manrope, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>You</span>
                                                    </div>
                                                    <div style={{ backgroundColor: '#4f46e5', color: '#ffffff', padding: '12px 16px', borderRadius: '18px 18px 2px 18px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)', fontSize: '14px', lineHeight: 1.5, position: 'relative' }}>
                                                        {(!msg.messageType || msg.messageType === 'text') && msg.message}
                                                        {msg.messageType === 'image' && (
                                                            <div style={{ marginTop: '8px', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}>
                                                                <img src={msg.fileUrl} alt="Shared" style={{ maxWidth: '320px', objectFit: 'cover' }} onClick={() => window.open(msg.fileUrl, '_blank')} />
                                                            </div>
                                                        )}
                                                        {msg.messageType === 'file' && (
                                                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'underline', fontWeight: 600, marginTop: '8px', color: '#fff' }}>
                                                                <FileText size={16} /> View Document
                                                            </a>
                                                        )}
                                                        {msg.messageType === 'voice' && (
                                                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                                                                <audio controls src={msg.fileUrl} style={{ height: '32px', width: '100%' }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span style={{ fontSize: '10px', color: 'rgba(115,118,133,0.6)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        {msg.isRead ? 'Read' : 'Delivered'}
                                                        {msg.isRead ? <CheckCheck size={12} /> : <Check size={12} />}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', maxWidth: '70%' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#191b23', fontFamily: 'Manrope, sans-serif' }}>{dashActiveRoom.otherUser?.name || 'User'}</span>
                                                        <span style={{ fontSize: '10px', color: 'rgba(115,118,133,0.5)', fontWeight: 500 }}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', padding: '12px 16px', borderRadius: '18px 18px 18px 2px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', fontSize: '14px', color: '#1e293b', lineHeight: 1.5 }}>
                                                        {(!msg.messageType || msg.messageType === 'text') && msg.message}
                                                        {msg.messageType === 'image' && (
                                                            <div style={{ marginTop: '8px', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}>
                                                                <img src={msg.fileUrl} alt="Shared" style={{ maxWidth: '320px', objectFit: 'cover' }} onClick={() => window.open(msg.fileUrl, '_blank')} />
                                                            </div>
                                                        )}
                                                        {msg.messageType === 'file' && (
                                                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#003d9b', textDecoration: 'underline', fontWeight: 600, marginTop: '8px' }}>
                                                                <FileText size={16} /> View Document
                                                            </a>
                                                        )}
                                                        {msg.messageType === 'voice' && (
                                                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                                                                <audio controls src={msg.fileUrl} style={{ height: '32px', width: '100%' }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}

                                    {partnerTyping && (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', maxWidth: '70%' }}>
                                            <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.4)', padding: '12px 16px', borderRadius: '16px 16px 16px 0', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#737685' }}>
                                                <div style={{ display: 'flex', gap: '2px' }}>
                                                    <span className="dot-typing" style={{ width: '6px', height: '6px', backgroundColor: '#737685', borderRadius: '50%' }}></span>
                                                    <span className="dot-typing" style={{ width: '6px', height: '6px', backgroundColor: '#737685', borderRadius: '50%', animationDelay: '0.1s' }}></span>
                                                    <span className="dot-typing" style={{ width: '6px', height: '6px', backgroundColor: '#737685', borderRadius: '50%', animationDelay: '0.2s' }}></span>
                                                </div>
                                                Typing...
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Chat Input */}
                                <div style={{ padding: '20px 24px 24px', backgroundColor: '#fff', borderTop: '1px solid #f1f5f9' }}>
                                    {isRecording ? (
                                        <div style={{ backgroundColor: '#fff1f2', borderRadius: '20px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #fecaca' }}>
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', color: '#e11d48' }}>
                                                <div className="animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e11d48' }}></div>
                                                <span style={{ fontWeight: 700, fontSize: '14px' }}>Recording: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                                            </div>
                                            <button onClick={stopRecordingDash} style={{ backgroundColor: '#e11d48', color: '#fff', padding: '8px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '13px' }}>
                                                Stop & Send
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ backgroundColor: '#f8fafc', borderRadius: '20px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #f1f5f9', transition: 'all 0.2s' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <button onClick={() => fileInputRef.current?.click()} style={{ padding: '12px', color: '#737685', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Attach Image">
                                                    <PlusCircle size={20} />
                                                </button>
                                                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUploadDash} />
                                                <button onClick={startRecordingDash} style={{ padding: '12px', color: '#737685', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Voice Message">
                                                    <Mic size={20} />
                                                </button>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <input
                                                    style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '14px', padding: '12px 0', color: '#191b23', fontWeight: 500 }}
                                                    placeholder={`Message ${dashActiveRoom.otherUser?.name || '...'}`}
                                                    type="text"
                                                    value={dashMessageInput}
                                                    onChange={e => handleTypeDash(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleSendMessageDash()}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <button onClick={() => fileInputRef.current?.click()} style={{ padding: '12px', color: '#737685', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Attach File">
                                                    <Paperclip size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleSendMessageDash()}
                                                    disabled={!dashMessageInput.trim() || uploadingFile}
                                                    style={{ backgroundColor: '#4f46e5', color: '#ffffff', height: '40px', padding: '0 20px', borderRadius: '14px', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)', opacity: (!dashMessageInput.trim() || uploadingFile) ? 0.5 : 1, cursor: (!dashMessageInput.trim() || uploadingFile) ? 'not-allowed' : 'pointer', border: 'none' }}
                                                >
                                                    {uploadingFile ? <Loader size={18} className="animate-spin" /> : (
                                                        <>
                                                            Send
                                                            <Send size={18} />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                                        <p style={{ fontSize: '10px', color: 'rgba(115,118,133,0.4)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Lock size={12} />
                                            Messages are secured with end-to-end encryption
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#737685' }}>
                                <MessageSquare size={60} opacity={0.2} style={{ marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#191b23', marginBottom: '8px', fontFamily: 'Manrope, sans-serif' }}>Your Messages</h3>
                                <p style={{ fontSize: '14px' }}>Select a conversation from the list to start chatting.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}


            {activeTab === 'payments' && (
                <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', marginBottom: '32px' }}>
                        {/* Balance Overview */}
                        <div style={{ gridColumn: 'span 4', backgroundColor: role === 'provider' ? '#003d9b' : '#0f172a', borderRadius: '24px', padding: '32px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1 }}>
                                <Wallet size={120} />
                            </div>
                            <p style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: '8px' }}>{role === 'provider' ? 'Total Earnings' : 'Total Invested'}</p>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0 }}>₹{role === 'provider' ? (stats.totalEarnings?.toLocaleString() || '0') : myBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.totalPrice || b.price || 0), 0).toLocaleString()}</h2>
                            
                            {role === 'provider' ? (
                                <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '16px', flex: 1 }}>
                                        <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', opacity: 0.7 }}>Available</span>
                                        <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>₹{((stats.totalEarnings || 0) - (stats.withdrawnAmount || 0)).toLocaleString()}</span>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '16px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <button className="btn-primary" style={{ background: 'white', color: '#003d9b', padding: '8px 16px', borderRadius: '12px', fontSize: '10px', fontWeight: '900', border: 'none' }}>WITHDRAW</button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '16px', flex: 1 }}>
                                        <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', opacity: 0.7 }}>Completed Projects</span>
                                        <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>{myBookings.filter(b => b.status === 'completed').length}</span>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '16px', flex: 1 }}>
                                        <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', opacity: 0.7 }}>Active Services</span>
                                        <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>{myBookings.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status)).length}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Stats Cards */}
                        <div style={{ gridColumn: 'span 8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ArrowDownLeft size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#737685', fontWeight: '600' }}>{role === 'provider' ? 'Last 30 Days' : 'Recent Spending (30d)'}</p>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>₹{role === 'provider' ? Math.round((stats.totalEarnings || 0) * 0.35).toLocaleString() : Math.round(myBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.totalPrice || b.price || 0), 0) * 0.35).toLocaleString()}</h4>
                                </div>
                            </div>
                            <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#737685', fontWeight: '600' }}>{role === 'provider' ? 'Active Orders Value' : 'Pending Obligations'}</p>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>₹{role === 'provider' ? bookingRequests.filter(b => b.status === 'confirmed' || b.status === 'in_progress').reduce((acc, b) => acc + (b.totalPrice || 0), 0).toLocaleString() : myBookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').reduce((acc, b) => acc + (b.totalPrice || 0), 0).toLocaleString()}</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Payment Transactions</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={{ padding: '6px 16px', borderRadius: '100px', border: '1px solid #f1f5f9', background: '#f8fafc', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Export CSV</button>
                                <button style={{ padding: '6px 16px', borderRadius: '100px', border: '1px solid #f1f5f9', background: '#f8fafc', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Filters</button>
                            </div>
                        </div>

                        <div className="no-scrollbar" style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                                        <th style={{ padding: '16px 8px', fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Transaction / ID</th>
                                        <th style={{ padding: '16px 8px', fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Date</th>
                                        <th style={{ padding: '16px 8px', fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>User / Service</th>
                                        <th style={{ padding: '16px 8px', fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Amount</th>
                                        <th style={{ padding: '16px 8px', fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(role === 'provider' ? bookingRequests : myBookings).filter(b => b?.paymentStatus === 'paid' || b?.status === 'completed').length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                                    <CreditCard size={40} style={{ opacity: 0.1 }} />
                                                    <p>No successful transactions yet.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        (role === 'provider' ? bookingRequests : myBookings).filter(b => b?.paymentStatus === 'paid' || b?.status === 'completed').map((tx, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f8fafc', transition: 'all 0.2s ease' }} className="hover-bg-light">
                                                <td style={{ padding: '20px 8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: tx.paymentStatus === 'paid' ? '#ecfdf5' : '#fff7ed', color: tx.paymentStatus === 'paid' ? '#10b981' : '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            {tx.paymentStatus === 'paid' ? <CheckCircle size={20} /> : <ArrowDownLeft size={20} />}
                                                        </div>
                                                        <div style={{ overflow: 'hidden' }}>
                                                            <span style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{role === 'provider' ? (tx.paymentStatus === 'paid' ? 'Payment Completed' : 'Incoming Transfer') : (tx.paymentStatus === 'paid' ? 'Payment Completed' : 'Outgoing Payment')}</span>
                                                            <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '0.5px' }}>ID: {tx._id?.toString()?.toUpperCase() || 'TXN'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 8px' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                                                        {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 8px' }}>
                                                    <div>
                                                        <span style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{role === 'provider' ? tx.user?.name : tx.provider?.name || 'Professional'}</span>
                                                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{tx.service?.title?.split(' ')?.slice(0, 3)?.join(' ') || 'Service Details'}...</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 8px' }}>
                                                    <div style={{ fontSize: '15px', fontWeight: '900', color: role === 'provider' ? '#059669' : '#1e293b' }}>{role === 'provider' ? '+' : '-'}₹{tx.totalPrice?.toLocaleString() || tx.price?.toLocaleString()}</div>
                                                </td>
                                                <td style={{ padding: '20px 8px' }}>
                                                    <span style={{
                                                        backgroundColor: tx.paymentStatus === 'paid' ? '#d1fae5' : '#fef3c7',
                                                        color: tx.paymentStatus === 'paid' ? '#065f46' : '#92400e',
                                                        fontSize: '10px', fontWeight: '900', padding: '6px 12px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.5px'
                                                    }}>
                                                        {tx.paymentStatus || 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {['bids'].includes(activeTab) && (
                <div className="animate-fade-in flex-center" style={{ height: '300px' }}>
                    <p className="text-body">Content for {activeTab.replace('_', ' ')} will appear here.</p>
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="animate-fade-in" style={{ width: '100%', padding: '0 10px' }}>
                    <div style={{ marginBottom: '24px' }}></div>

                    {myReviewsLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Loader className="animate-spin" /></div>
                    ) : myReviews.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px', background: '#fff', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            <Star size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>No reviews found</h3>
                            <p style={{ color: '#64748b', margin: '8px 0 0' }}>{role === 'provider' ? 'You have not received any reviews yet.' : 'You have not written any reviews yet.'}</p>
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', 
                            gap: '32px', 
                            width: '100%' 
                        }}>
                            {myReviews.map(review => (
                                <div key={review._id} style={{ background: '#fff', borderRadius: '28px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', border: '1px solid #f1f5f9' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = 'var(--primary)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                                                {role === 'provider' ? (
                                                    <img src={review.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'U')}&background=ede9fe&color=4f46e5`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'U')}&background=ede9fe&color=4f46e5`; }} />
                                                ) : (
                                                    <img src={review.provider?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.provider?.name || 'P')}&background=f3e8ff&color=9333ea`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.provider?.name || 'P')}&background=f3e8ff&color=9333ea`; }} />
                                                )}
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#1e293b' }}>{role === 'provider' ? review.user?.name : review.provider?.name || 'Professional'}</h4>
                                                {review.service && (
                                                    <div 
                                                        onClick={() => navigate(`/services/${review.service._id}`)}
                                                        style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0, 61, 155, 0.05)', padding: '4px 8px', borderRadius: '6px', width: 'fit-content' }}
                                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(0, 61, 155, 0.1)'}
                                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(0, 61, 155, 0.05)'}
                                                    >
                                                        <Briefcase size={12} />
                                                        {review.service?.title}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fffbeb', padding: '6px 10px', borderRadius: '10px' }}>
                                            <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#d97706' }}>{review.rating}</span>
                                            <Star size={16} fill="#d97706" color="#d97706" />
                                        </div>
                                    </div>
                                    
                                    {editingReviewId === review._id ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star 
                                                        key={star}
                                                        size={24} 
                                                        fill={star <= editRating ? "#d97706" : "none"} 
                                                        color={star <= editRating ? "#d97706" : "#cbd5e1"} 
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => setEditRating(star)}
                                                    />
                                                ))}
                                            </div>
                                            <textarea 
                                                value={editComment}
                                                onChange={(e) => setEditComment(e.target.value)}
                                                style={{ width: '100%', height: '100px', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '12px', fontSize: '0.95rem', resize: 'none', outline: 'none', transition: 'border-color 0.2s' }}
                                                placeholder="Write your review here..."
                                                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                            />
                                            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                                                <button 
                                                    onClick={() => handleUpdateReview(review._id)}
                                                    style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                                                >
                                                    Save Changes
                                                </button>
                                                <button 
                                                    onClick={() => setEditingReviewId(null)}
                                                    style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#f1f5f9', color: '#64748b', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.6, flex: 1, margin: '0 0 20px', padding: '16px', background: '#f8fafc', borderRadius: '16px', position: 'relative', fontStyle: 'italic' }}>
                                                <MessageSquare size={16} color="#cbd5e1" style={{ position: 'absolute', top: '16px', left: '16px', opacity: 0.5 }} />
                                                <span style={{ paddingLeft: '28px', display: 'block' }}>"{review.comment}"</span>
                                            </p>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <CalendarIcon size={14} />
                                                    {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </span>
                                                {role === 'customer' && (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => handleEditReview(review)} style={{ padding: '8px 14px', borderRadius: '10px', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#dbeafe'} onMouseOut={e => e.currentTarget.style.background = '#eff6ff'}>
                                                            <Edit size={14} /> Edit
                                                        </button>
                                                        <button onClick={() => handleDeleteReview(review._id)} style={{ padding: '8px 14px', borderRadius: '10px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fee2e2'} onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}>
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'favorites' && (
                <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {favoritesLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Loader className="animate-spin" /></div>
                    ) : (!favorites || favorites.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '100px', background: '#fff', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            <Heart size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>No favorites yet</h3>
                            <p style={{ color: '#64748b' }}>Start exploring and save services you like!</p>
                            <button className="btn-primary" style={{ marginTop: '24px', borderRadius: '100px' }} onClick={() => navigate('/services')}>Browse Services</button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                            {favorites.map(srv => (
                                <div
                                    key={srv._id}
                                    className="card service-card-premium"
                                    onClick={() => navigate(`/services/${srv._id}`)}
                                    style={{
                                        padding: 0,
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        height: '100%',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: '1px solid #edf2f7',
                                        backgroundColor: '#fff',
                                        borderRadius: '16px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                                        <img
                                            src={srv.images?.[0]?.url || srv.images?.[0] || (srv.provider?.avatar && srv.provider.avatar.startsWith('http') ? srv.provider.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(srv.provider?.name || srv.title || 'S')}&background=f3f4f6&color=4f46e5&size=300`)}
                                            alt={srv.title}
                                            style={{
                                                width: '100%',
                                                height: '200px',
                                                objectFit: 'cover',
                                                backgroundColor: '#f8fafc',
                                                display: 'block'
                                            }}
                                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(srv.provider?.name || srv.title || 'S')}&background=f3f4f6&color=4f46e5&size=300`; }}
                                        />
                                        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                                            <span style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                                {srv.category}
                                            </span>
                                        </div>
                                        <button
                                            style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                backgroundColor: '#ef4444',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: 'none',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                cursor: 'pointer',
                                                zIndex: 10
                                            }}
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (user?.token) {
                                                    await api.post(`/api/users/favorites/${srv._id}`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
                                                    fetchFavorites();
                                                }
                                            }}
                                        >
                                            <Heart size={16} fill="#fff" color="#fff" />
                                        </button>
                                    </div>
                                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '4px 0 8px 0', color: '#1e293b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4', minHeight: '2.8rem' }}>
                                            {srv.title}
                                        </h3>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                                            <Star size={14} color="#f59e0b" fill="#f59e0b" />
                                            <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.85rem' }}>{srv.rating || '4.8'}</span>
                                            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>({srv.numReviews || '0'})</span>
                                            <span style={{ margin: '0 4px', color: '#cbd5e0' }}>•</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.8rem' }}>
                                                <MapPin size={12} />
                                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                                                    {srv.location?.city || 'Remote'}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: 'auto' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <img
                                                    src={srv.provider?.avatar && srv.provider.avatar.startsWith('http') ? srv.provider.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(srv.provider?.name || 'P')}&background=ede9fe&color=4f46e5&size=30`}
                                                    alt="Avatar"
                                                    style={{ borderRadius: '50%', width: '28px', height: '28px', objectFit: 'cover', border: '1.5px solid #fff', boxShadow: '0 0 0 1px #e2e8f0' }}
                                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(srv.provider?.name || 'P')}&background=ede9fe&color=4f46e5&size=30`; }}
                                                />
                                                <span style={{ fontWeight: '500', color: '#1e293b', fontSize: '0.85rem' }}>{srv.provider ? srv.provider.name : 'Professional'}</span>
                                            </div>

                                            {srv.businessType === 'shop' ? (
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
                                                        e.stopPropagation();
                                                        const lat = srv.geoCoordinates?.coordinates?.[1];
                                                        const lng = srv.geoCoordinates?.coordinates?.[0];
                                                        const link = srv.shopDetails?.googleMapsLink || (lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null);
                                                        if (link) window.open(link, '_blank');
                                                    }}
                                                >
                                                    <MapPin size={14} /> Direction
                                                </button>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Starting at</span>
                                                    <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.1rem' }}>
                                                        ₹{srv.price}<span style={{ fontSize: '0.8rem', fontWeight: '400' }}>{srv.priceType === 'hourly' ? '/hr' : ''}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Payment Mode Selection Modal */}
            {bookingForPayment && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', width: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Payment Received?</h3>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Please select the payment method used for this service completion.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                onClick={() => confirmDelivery('Cash')}
                                style={{ padding: '16px', borderRadius: '16px', border: '2px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0052cc'; e.currentTarget.style.background = '#f0f7ff'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}
                            >
                                <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Wallet size={20} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: 800, fontSize: '15px' }}>Cash Payment</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Paid directly to professional</div>
                                </div>
                            </button>

                            <button
                                onClick={() => confirmDelivery('Online')}
                                style={{ padding: '16px', borderRadius: '16px', border: '2px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0052cc'; e.currentTarget.style.background = '#f0f7ff'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}
                            >
                                <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#eff6ff', color: '#0052cc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CreditCard size={20} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: 800, fontSize: '15px' }}>Online Payment</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Paid via app or bank transfer</div>
                                </div>
                            </button>

                            <button
                                onClick={() => setBookingForPayment(null)}
                                style={{ marginTop: '12px', padding: '12px', background: 'transparent', border: 'none', color: '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─── revision history modal ─── */
function RevisionHistoryModal({ isOpen, onClose, revisions }) {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px' }}>
            <div className="animate-in fade-in zoom-in duration-300 no-scrollbar" style={{ backgroundColor: 'white', width: '100%', maxWidth: '550px', borderRadius: '28px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '85vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>Revision History</h3>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>Timeline of all requested changes</p>
                    </div>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <X size={20} color="#64748b" />
                    </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {revisions && revisions.length > 0 ? (
                        [...revisions].reverse().map((rev, i) => (
                            <div key={i} style={{ padding: '20px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #f1f5f9', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '900', color: '#003d9b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revision #{revisions.length - i}</span>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>{new Date(rev.date).toLocaleDateString()}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', fontWeight: '500', lineHeight: 1.6 }}>{rev.note}</p>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>No revisions found for this booking.</p>
                        </div>
                    )}
                </div>

                <button 
                    onClick={onClose}
                    style={{ width: '100%', marginTop: '32px', padding: '16px 0', borderRadius: '16px', background: '#003d9b', color: 'white', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 15px -3px rgba(0, 61, 155, 0.3)' }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    Close History
                </button>
            </div>
        </div>
    );
}

function RevisionModal({ isOpen, onClose, onSubmit, note, setNote }) {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px' }}>
            <div className="animate-in fade-in zoom-in duration-300" style={{ backgroundColor: 'white', width: '100%', maxWidth: '550px', borderRadius: '28px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '64px', height: '64px', backgroundColor: '#f0f7ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#003d9b' }}>
                        <RotateCw size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', margin: '0 0 8px 0' }}>Request Revision</h3>
                    <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>Tell the professional what needs to be changed.</p>
                </div>
                
                <div style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#1e293b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revision Instructions</label>
                    <textarea 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Please describe the changes you'd like to see..."
                        style={{ width: '100%', height: '160px', padding: '20px', borderRadius: '18px', border: '2px solid #f1f5f9', backgroundColor: '#f8fafc', fontSize: '1rem', color: '#1e293b', outline: 'none', resize: 'none', transition: 'all 0.2s' }}
                        onFocus={(e) => e.target.style.borderColor = '#003d9b'}
                        onBlur={(e) => e.target.style.borderColor = '#f1f5f9'}
                    />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                        onClick={onClose}
                        style={{ flex: 1, padding: '16px 0', borderRadius: '16px', background: '#f1f5f9', color: '#64748b', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}
                    >Cancel</button>
                    <button 
                        onClick={onSubmit}
                        disabled={!note.trim()}
                        style={{ flex: 2, padding: '16px 0', borderRadius: '16px', background: note.trim() ? '#003d9b' : '#94a3b8', color: 'white', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: note.trim() ? '0 10px 15px -3px rgba(0, 61, 155, 0.3)' : 'none' }}
                    >Submit Request</button>
                </div>
            </div>
        </div>
    );
}

/* ─── order details modal ─── */
function OrderDetailsModal({ isOpen, onClose, booking }) {
    if (!isOpen || !booking) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px' }}>
            <div className="animate-in fade-in zoom-in duration-300 no-scrollbar" style={{ backgroundColor: 'white', width: '100%', maxWidth: '600px', borderRadius: '28px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>Order Details</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <X size={24} />
                    </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Total Price</span>
                            <span style={{ fontSize: '20px', color: '#003d9b', fontWeight: 900 }}>₹{booking.price || booking.totalPrice || '0'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                                <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: 800 }}>{booking.paymentMethod || 'Wallet'}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Service Type</span>
                            <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 800 }}>{booking.service?.businessType ? booking.service.businessType.toString().toUpperCase() : 'SERVICE'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Date</span>
                            <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 800 }}>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Customer Name</span>
                            <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 800 }}>{booking.customerName || booking.user?.name || 'Unknown'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Customer Phone</span>
                            <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 800 }}>{['completed', 'cancelled'].includes(booking.status) ? 'Hidden' : (booking.customerPhone || booking.user?.phone || 'Not provided')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Location</span>
                            <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 800, textAlign: 'right', maxWidth: '60%' }}>{typeof booking.address === 'object' ? (`${booking.address?.street || ''}, ${booking.address?.city || ''}`.trim() || 'Standard') : (booking.address || 'Standard Location')}</span>
                        </div>
                        
                        {(booking.address?.googleMapLink || (booking.address?.lat && booking.address?.lng)) && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
                                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Interactive Map</span>
                                <button 
                                    onClick={() => {
                                        const link = booking.address.googleMapLink || `https://www.google.com/maps?q=${booking.address.lat},${booking.address.lng}`;
                                        window.open(link, '_blank');
                                    }}
                                    style={{ background: '#f0f9ff', color: '#0ea5e9', border: 'none', padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = '#e0f2fe'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    Get Directions 📍
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardDesktop;
