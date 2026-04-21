import React from 'react';
import { User, Briefcase, Calendar as CalendarIcon, MapPin, Edit, Trash2, X, Plus, Loader, Star, CheckCircle, BarChart, MessageSquare, Send, ChevronRight, Wallet, CreditCard, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import ChatList from '../../ChatList';
import { City } from 'country-state-city';
import api from '../../../utils/api';

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

const DashboardDesktop = ({
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
    userLocation,
    dashMessageInput,
    setDashMessageInput,
    handleSendMessageDash,
    messagesEndRef,
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
    setGigTargetGender
}) => {
    const [activeService, setActiveService] = React.useState(null);

    React.useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const serviceId = queryParams.get('service');
        if (serviceId) {
            api.get(`/api/services/${serviceId}`).then(({ data }) => setActiveService(data)).catch(() => {});
        }
    }, []);
    // Note: profileNameState and setProfileNameState are used because profileName is already used in props
    // Actually, I'll just use the props directly. But if I need to update them, I need the setters.

    return (
        <div>
            {activeTab === 'overview' && (
                <div id="account-settings-section" className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', maxWidth: '1200px' }}>
                    {/* Bio & Avatar Card */}
                    <section style={{ gridColumn: 'span 8', backgroundColor: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', gap: '32px', alignItems: 'flex-start', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '128px', height: '128px', backgroundColor: 'rgba(0, 61, 155, 0.05)', borderRadius: '0 0 0 100%' }}></div>

                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'relative', width: '128px', height: '128px' }}>
                                <img
                                    src={getAvatar({ avatar: profileAvatar, name: profileName })}
                                    alt={user?.name}
                                    style={{ width: '128px', height: '128px', borderRadius: '24px', objectFit: 'cover', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName || 'U')}&background=ede9fe&color=4f46e5&size=120`; }}
                                />
                                {uploadingAvatar && (
                                    <div style={{ position: 'absolute', inset: 0, borderRadius: '24px', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: '700' }}>…</div>
                                )}
                            </div>
                            <label htmlFor="avatar-upload-direct" style={{ position: 'absolute', bottom: '-8px', right: '-8px', backgroundColor: '#fff', padding: '8px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Edit size={16} />
                            </label>
                            <input id="avatar-upload-direct" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{user?.name}</h3>
                                {role === 'provider' ? (
                                    <span style={{ backgroundColor: 'rgba(0, 61, 155, 0.1)', color: 'var(--primary)', fontSize: '10px', padding: '2px 8px', borderRadius: '100px', fontWeight: '800', textTransform: 'uppercase' }}>Top Rated</span>
                                ) : (
                                    <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', fontSize: '10px', padding: '2px 8px', borderRadius: '100px', fontWeight: '800', textTransform: 'uppercase' }}>Verified Customer</span>
                                )}
                            </div>
                            <p style={{ color: '#434654', fontWeight: '500', fontSize: '1.125rem', marginBottom: '16px' }}>{providerTitle || (role === 'provider' ? 'Professional Service Provider' : 'SkillNear Member')}</p>
                            <p style={{ color: '#737685', fontSize: '0.875rem', lineHeight: '1.6', maxWidth: '500px' }}>
                                {providerAbout || (role === 'provider' ? 'Expert skills dedicated to delivering high-quality results. Open to custom projects and long-term collaborations.' : 'Valued member of the SkillNear community. Dedicated to supporting local experts and quality services.')}
                            </p>

                            <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
                                {role === 'provider' ? (
                                    <>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '12px', color: '#737685', fontWeight: '500' }}>Response Rate</span>
                                            <span style={{ fontSize: '1.125rem', fontWeight: '700' }}>98%</span>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '12px', color: '#737685', fontWeight: '500' }}>Experience</span>
                                            <span style={{ fontSize: '1.125rem', fontWeight: '700' }}>{user?.providerDetails?.experienceYears || 0} Years</span>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '12px', color: '#737685', fontWeight: '500' }}>Rating</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ fontSize: '1.125rem', fontWeight: '700' }}>4.9</span>
                                                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '12px', color: '#737685', fontWeight: '500' }}>Member Since</span>
                                            <span style={{ fontSize: '1.125rem', fontWeight: '700' }}>{user?.createdAt ? new Date(user.createdAt).getFullYear() : 2024}</span>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '12px', color: '#737685', fontWeight: '500' }}>Total Bookings</span>
                                            <span style={{ fontSize: '1.125rem', fontWeight: '700' }}>{myBookings.length}</span>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '12px', color: '#737685', fontWeight: '500' }}>Account Status</span>
                                            <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#22c55e' }}>Active</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>
 
                    {role === 'customer' && (
                        <section style={{ 
                            gridColumn: 'span 4', 
                            background: 'linear-gradient(135deg, #003d9b 0%, #0052cc 100%)', 
                            borderRadius: '24px', 
                            padding: '32px', 
                            color: 'white',
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center',
                            boxShadow: '0 20px 40px rgba(0, 61, 155, 0.2)',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer'
                        }} onClick={() => setActiveTab('become_provider')}>
                             <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
                                <Briefcase size={120} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px', position: 'relative' }}>Join as a Seller</h3>
                            <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: '1.6', marginBottom: '24px', position: 'relative' }}>
                                Unlock professional features, reach local customers, and start earning by offering your services today.
                            </p>
                            <div 
                                style={{ 
                                    backgroundColor: 'white', 
                                    color: '#003d9b', 
                                    border: 'none', 
                                    padding: '14px 24px', 
                                    borderRadius: '100px', 
                                    fontWeight: '800', 
                                    fontSize: '0.9rem', 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    width: 'fit-content',
                                    position: 'relative'
                                }}
                            >
                                Start Selling Now <ChevronRight size={18} />
                            </div>
                        </section>
                    )}

                    {/* Quick Stats Card */}
                    {role === 'provider' && (
                        <section style={{ gridColumn: 'span 4', backgroundColor: '#e7e7f2', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <h4 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '24px' }}>Account Status</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '600' }}>Verification</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#22c55e', fontWeight: '700' }}>
                                            <CheckCircle size={14} /> Verified
                                        </span>
                                    </div>
                                    <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '600' }}>Active Gigs</span>
                                            <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary)' }}>{myGigs.length}</span>
                                        </div>
                                        {myGigs.length > 0 ? (
                                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {myGigs.slice(0, 2).map((gig, idx) => (
                                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: gig.isApproved ? '#22c55e' : '#f59e0b' }}></div>
                                                        <span style={{ fontSize: '12px', color: '#434654', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{gig.title}</span>
                                                    </div>
                                                ))}
                                                {myGigs.length > 2 && <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '700' }}>+ {myGigs.length - 2} more gigs</span>}
                                            </div>
                                        ) : (
                                            <p style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>No gigs posted yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button style={{ width: '100%', marginTop: 'auto', padding: '12px', borderRadius: '100px', backgroundColor: '#191b23', color: '#fff', fontSize: '14px', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                Upgrade Plan <BarChart size={16} />
                            </button>
                        </section>
                    )}

                     {/* Quick Links / Actions */}
                    {role === 'provider' && (
                        <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                            <div onClick={() => setActiveTab('mygigs')} className="group" style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.3s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                                    <div style={{ padding: '12px', backgroundColor: '#f3f3fd', borderRadius: '16px', color: 'var(--primary)' }}>
                                        <Briefcase size={24} />
                                    </div>
                                    <Plus size={20} color="#737685" />
                                </div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>My Gigs</h4>
                                <p style={{ fontSize: '12px', color: '#737685' }}>Manage your active listings and draft new proposals.</p>
                            </div>

                            <div onClick={() => setActiveTab('chat')} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                                    <div style={{ padding: '12px', backgroundColor: '#f3f3fd', borderRadius: '16px', color: 'var(--tertiary-container)' }}>
                                        <MessageSquare size={24} />
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <Plus size={20} color="#737685" />
                                        <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
                                    </div>
                                </div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>Messages</h4>
                                <p style={{ fontSize: '12px', color: '#737685' }}>Check ongoing client conversations and feedback.</p>
                            </div>
                        </div>
                    )}

                    {/* Earnings Snapshot */}
                    {role === 'provider' && (
                        <section style={{ gridColumn: 'span 12', backgroundColor: '#f3f3fd', borderRadius: '32px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
                            <div style={{ maxWidth: '400px' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px' }}>Earnings Snapshot</h3>
                                <p style={{ fontSize: '14px', color: '#737685', marginBottom: '24px' }}>Your professional performance has increased by <span style={{ color: 'var(--primary)', fontWeight: '700' }}>12.4%</span> this month. Keep it up!</p>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ backgroundColor: '#fff', padding: '12px 20px', borderRadius: '16px' }}>
                                        <p style={{ fontSize: '10px', fontWeight: '700', color: '#737685', textTransform: 'uppercase', marginBottom: '4px' }}>Total Earned</p>
                                        <p style={{ fontSize: '1.25rem', fontWeight: '900' }}>₹{stats.totalEarnings.toLocaleString()}</p>
                                    </div>
                                    <div style={{ backgroundColor: '#fff', padding: '12px 20px', borderRadius: '16px' }}>
                                        <p style={{ fontSize: '10px', fontWeight: '700', color: '#737685', textTransform: 'uppercase', marginBottom: '4px' }}>Pending</p>
                                        <p style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary)' }}>₹{Math.floor(stats.totalEarnings * 0.2).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ width: '50%', height: '160px', background: 'rgba(255,255,255,0.5)', borderRadius: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '24px', gap: '8px', border: '1px solid #fff', backdropFilter: 'blur(4px)' }}>
                                {stats.chartData.length > 0 ? stats.chartData.map((d, i) => (
                                    <div key={i} style={{ flex: 1, backgroundColor: 'rgba(0, 61, 155, 0.1)', borderRadius: '8px 8px 0 0', height: `${Math.max(20, (d.earnings / (Math.max(...stats.chartData.map(x => x.earnings)) || 1)) * 100)}%`, transition: 'all 0.3s' }}></div>
                                )) : [40, 60, 30, 90, 50, 75].map((h, i) => (
                                    <div key={i} style={{ flex: 1, backgroundColor: i === 5 ? 'var(--primary)' : 'rgba(0, 61, 155, 0.1)', borderRadius: '8px 8px 0 0', height: `${h}%` }}></div>
                                ))}
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
                <div className="animate-fade-in">

                    {bookingsLoading ? (
                        <p>Loading bookings...</p>
                    ) : myBookings.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>You haven't booked any services yet.</p>
                    ) : (
                        myBookings.map(b => (
                            <div key={b._id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px' }}>
                                <div className="flex-between" style={{ marginBottom: '12px' }}>
                                    <span style={{ fontWeight: '600' }}>{b.service?.title}</span>
                                    <span style={{
                                        color: ['pending', 'in_progress', 'revision_requested'].includes(b.status) ? '#f59e0b' : ['confirmed', 'delivered'].includes(b.status) ? '#2563eb' : b.status === 'completed' ? '#059669' : '#dc2626',
                                        backgroundColor: ['pending', 'in_progress', 'revision_requested'].includes(b.status) ? '#fef3c7' : ['confirmed', 'delivered'].includes(b.status) ? '#dbeafe' : b.status === 'completed' ? '#d1fae5' : '#fee2e2',
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase'
                                    }}>{b.status.replace('_', ' ')}</span>
                                </div>
                                <div className="text-body" style={{ marginBottom: '4px' }}><CalendarIcon size={14} style={{ display: 'inline', marginRight: '8px' }} /> {new Date(b.date).toLocaleDateString()} | {b.timeSlot}</div>
                                <div className="text-body" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span><MapPin size={14} style={{ display: 'inline', marginRight: '8px' }} /> {b.address?.street}, {b.address?.city}</span>
                                        {calculateDistance(userLocation?.latitude, userLocation?.longitude, b.address?.lat, b.address?.lng) && (
                                            <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: '700' }}>
                                                {calculateDistance(userLocation?.latitude, userLocation?.longitude, b.address?.lat, b.address?.lng)} km away
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {b.address?.googleMapLink && (
                                            <a href={b.address.googleMapLink} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', fontSize: '0.7rem', fontWeight: 'bold', textDecoration: 'none' }}>Link 🔗</a>
                                        )}
                                        {(b.address?.googleMapLink || (b.address?.lat && b.address?.lng)) && (
                                            <button 
                                                onClick={() => window.open(b.address.googleMapLink || `https://www.google.com/maps?q=${b.address.lat},${b.address.lng}`, '_blank')}
                                                style={{ background: '#f0f9ff', color: '#0ea5e9', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
                                            >View Map 📍</button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-between" style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                                    <span className="text-small" style={{ color: 'var(--text-muted)' }}>Provider: {b.provider?.name}</span>
                                    <span style={{ fontWeight: 'bold' }}>₹{b.totalPrice}</span>
                                </div>
                                {b.status === 'delivered' && (
                                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => updateBookingStatus(b._id, 'completed')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', flex: 1 }}>Accept & Mark Complete</button>
                                            <button onClick={() => setBookingForRevision(b._id)} className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', flex: 1, borderColor: '#f59e0b', color: '#f59e0b' }}>Request Revision</button>
                                        </div>

                                        {bookingForRevision === b._id && (
                                            <div className="animate-fade-in" style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: '#92400e' }}>Revision Details:</label>
                                                <textarea
                                                    className="input-field"
                                                    placeholder="What needs to be changed?"
                                                    value={revisionNote}
                                                    onChange={(e) => setRevisionNote(e.target.value)}
                                                    style={{ fontSize: '0.85rem', marginBottom: '8px' }}
                                                />
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => updateBookingStatus(b._id, 'revision_requested')} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#f59e0b' }}>Submit Revision Request</button>
                                                    <button onClick={() => setBookingForRevision(null)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Cancel</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {b.revisions && b.revisions.length > 0 && (
                                    <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#fffbeb', borderRadius: '8px', fontSize: '0.85rem' }}>
                                        <strong>Revision Note:</strong> {b.revisions[b.revisions.length - 1].note}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'services' && (
                <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div className="flex-between" style={{ marginBottom: '24px' }}>
                        <div>
                            <h2 className="text-h2">
                                {editingGigId ? 'Update Your Gig' : 'Publish Your Expertise'}
                            </h2>
                            <p className="text-body" style={{ color: 'var(--text-muted)' }}>
                                Step {gigStep} of 3: {gigStep === 1 ? 'General Details' : gigStep === 2 ? 'Pricing & Plans' : 'Location & Media'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[1, 2, 3].map(s => (
                                <div key={s} style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: gigStep === s ? 'var(--primary)' : gigStep > s ? '#d1fae5' : '#f3f4f6',
                                    color: gigStep === s ? '#fff' : gigStep > s ? '#059669' : 'var(--text-muted)',
                                    fontWeight: '700', fontSize: '0.85rem', transition: 'all 0.3s ease'
                                }}>
                                    {gigStep > s ? '✓' : s}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ padding: '32px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                        {gigStep === 1 && (
                            <div className="animate-fade-in">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                                    <div
                                        onClick={() => setGigBusinessType('service')}
                                        style={{
                                            padding: '24px', borderRadius: '12px', border: `2px solid ${gigBusinessType === 'service' ? 'var(--primary)' : 'var(--border-color)'}`,
                                            cursor: 'pointer', backgroundColor: gigBusinessType === 'service' ? '#f5f3ff' : 'transparent', textAlign: 'center', transition: 'all 0.3s'
                                        }}>
                                        <Briefcase size={32} color={gigBusinessType === 'service' ? 'var(--primary)' : '#94a3b8'} style={{ marginBottom: '12px' }} />
                                        <div style={{ fontWeight: '700', color: gigBusinessType === 'service' ? 'var(--primary)' : 'var(--text-main)' }}>Offering a Service</div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Gigs, consulting, or local home services</p>
                                    </div>
                                    <div
                                        onClick={() => setGigBusinessType('shop')}
                                        style={{
                                            padding: '24px', borderRadius: '12px', border: `2px solid ${gigBusinessType === 'shop' ? 'var(--primary)' : 'var(--border-color)'}`,
                                            cursor: 'pointer', backgroundColor: gigBusinessType === 'shop' ? '#f5f3ff' : 'transparent', textAlign: 'center', transition: 'all 0.3s'
                                        }}>
                                        <MapPin size={32} color={gigBusinessType === 'shop' ? 'var(--primary)' : '#94a3b8'} style={{ marginBottom: '12px' }} />
                                        <div style={{ fontWeight: '700', color: gigBusinessType === 'shop' ? 'var(--primary)' : 'var(--text-main)' }}>Registering a Shop</div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Physical outlets, local vendor spaces</p>
                                    </div>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>{gigBusinessType === 'service' ? 'Gig Title' : 'Shop Name'}</label>
                                    <input type="text" className="input-field" placeholder={gigBusinessType === 'service' ? "e.g. I will fix your technical plumbing issues" : "e.g. Sharma Grocery Store"} value={gigTitle} onChange={e => setGigTitle(e.target.value)} />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Category</label>
                                    <select className="input-field" value={gigCategory} onChange={e => setGigCategory(e.target.value)}>
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

                                {gigCategory === 'Salon' && (
                                    <div className="animate-fade-in shadow-sm" style={{ ...styles.formGroup, background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                                        <label style={{ ...styles.label, marginBottom: '12px', display: 'block' }}>Who is this service for?</label>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            {['male', 'female', 'unisex'].map(gender => (
                                                <div 
                                                    key={gender}
                                                    onClick={() => setGigTargetGender(gender)}
                                                    style={{
                                                        flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                                                        border: `2px solid ${gigTargetGender === gender ? 'var(--primary)' : '#e2e8f0'}`,
                                                        backgroundColor: gigTargetGender === gender ? '#f5f3ff' : '#fff',
                                                        fontWeight: '700', fontSize: '0.9rem', color: gigTargetGender === gender ? 'var(--primary)' : '#64748b',
                                                        textTransform: 'capitalize', transition: 'all 0.2s'
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
                                        <label style={styles.label}>Custom Category Name</label>
                                        <input type="text" className="input-field" placeholder="e.g. Pet Grooming" value={gigCustomCategory} onChange={e => setGigCustomCategory(e.target.value)} />
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    {gigBusinessType === 'service' ? (
                                        <>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Years of Experience</label>
                                                <input type="number" className="input-field" placeholder="e.g. 5" value={gigExperience} onChange={e => setGigExperience(e.target.value)} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Total Jobs Done</label>
                                                <input type="number" className="input-field" placeholder="e.g. 150" value={gigJobsCompleted} onChange={e => setGigJobsCompleted(e.target.value)} />
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                                            <label style={styles.label}>How old is your Shop? (Years)</label>
                                            <input type="number" className="input-field" placeholder="e.g. 10" value={shopAge} onChange={e => setShopAge(e.target.value)} />
                                        </div>
                                    )}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Detailed Description</label>
                                    <textarea className="input-field" rows="6" placeholder="Describe what you offer in detail..." value={gigDesc} onChange={e => setGigDesc(e.target.value)}></textarea>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Services Included (Listed as features)</label>
                                    <input type="text" className="input-field" placeholder="e.g. Parts replacement, Professional cleanup, 6-month warranty" value={gigServicesIncluded} onChange={e => setGigServicesIncluded(e.target.value)} />
                                    <p className="text-small" style={{ marginTop: '6px', color: 'var(--text-muted)' }}>Enter items separated by commas.</p>
                                </div>
                            </div>
                        )}

                        {gigStep === 2 && (
                            <div className="animate-fade-in">
                                <div className="flex-between" style={{ marginBottom: '20px' }}>
                                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>Pricing & Packages {gigBusinessType === 'shop' && <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.9rem' }}>(Optional for Shops)</span>}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="text-small" style={{ color: 'var(--text-muted)' }}>Use 3 Tier Plans?</span>
                                        <input type="checkbox" checked={usePlans} onChange={e => setUsePlans(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                                    </div>
                                </div>

                                {!usePlans ? (
                                    <div style={{ display: 'flex', gap: '16px', backgroundColor: '#f9fafb', padding: '24px', borderRadius: '12px' }}>
                                        <div style={{ ...styles.formGroup, flex: 1 }}>
                                            <label style={styles.label}>Standard Price (₹) {gigBusinessType === 'shop' && '(Optional)'}</label>
                                            <input type="number" className="input-field" placeholder="0.00" value={gigPrice} onChange={e => setGigPrice(e.target.value)} />
                                        </div>
                                        <div style={{ ...styles.formGroup, flex: 1 }}>
                                            <label style={styles.label}>Billing Type</label>
                                            <select className="input-field" value={gigPriceType} onChange={e => setGigPriceType(e.target.value)}>
                                                <option value="fixed">Fixed Price</option>
                                                <option value="hourly">Hourly Rate</option>
                                                <option value="starting_at">Starting At</option>
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                        {gigPlans.map((plan, idx) => (
                                            <div key={idx} style={{
                                                border: '1.5px solid var(--border-color)', borderRadius: '12px', padding: '16px',
                                                backgroundColor: idx === 1 ? '#f5f3ff' : '#fff', borderColor: idx === 1 ? 'var(--primary)' : 'var(--border-color)'
                                            }}>
                                                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: idx === 1 ? 'var(--primary)' : 'var(--text-main)', marginBottom: '12px', textAlign: 'center' }}>
                                                    {idx === 0 ? 'BASIC' : idx === 1 ? 'STANDARD' : 'PREMIUM'}
                                                </div>
                                                <div style={styles.formGroup}>
                                                    <input type="number" className="input-field" placeholder={`Price (₹) ${gigBusinessType === 'shop' ? '(Optional)' : ''}`} value={plan.price} onChange={e => {
                                                        const np = [...gigPlans]; np[idx].price = e.target.value; setGigPlans(np);
                                                    }} />
                                                </div>
                                                <div style={styles.formGroup}>
                                                    <textarea className="input-field" rows="3" placeholder={`Description ${gigBusinessType === 'shop' ? '(Optional)' : ''}...`} value={plan.description} onChange={e => {
                                                        const np = [...gigPlans]; np[idx].description = e.target.value; setGigPlans(np);
                                                    }} style={{ fontSize: '0.8rem' }} />
                                                </div>
                                                <div style={styles.formGroup}>
                                                    <input type="text" className="input-field" placeholder="Features (comma separated)" value={plan.features} onChange={e => {
                                                        const np = [...gigPlans]; np[idx].features = e.target.value; setGigPlans(np);
                                                    }} style={{ fontSize: '0.8rem' }} />
                                                </div>
                                                <div style={styles.formGroup}>
                                                    <select className="input-field" value={plan.deliveryTime} onChange={e => {
                                                        const np = [...gigPlans]; np[idx].deliveryTime = e.target.value; setGigPlans(np);
                                                    }} style={{ fontSize: '0.8rem' }}>
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
                                    <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#f0f9ff', borderRadius: '12px' }}>
                                        <div style={{ fontWeight: '700', marginBottom: '16px', color: '#0369a1' }}>Shop Specific Details</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Opening Time</label>
                                                <input type="time" className="input-field" value={shopOpeningTime} onChange={e => setShopOpeningTime(e.target.value)} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Closing Time</label>
                                                <input type="time" className="input-field" value={shopClosingTime} onChange={e => setShopClosingTime(e.target.value)} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                                <input type="checkbox" checked={shopIsHomeDelivery} onChange={e => setShopIsHomeDelivery(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                                                <span className="text-small" style={{ fontWeight: 500 }}>Provide Home Delivery?</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                                <input type="checkbox" checked={shopIsHomeService} onChange={e => setShopIsHomeService(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                                                <span className="text-small" style={{ fontWeight: 500 }}>Provide Home Services? (Technician visits client)</span>
                                            </label>
                                            {shopIsHomeService && (
                                                <div className="animate-fade-in" style={{ paddingLeft: '26px', marginTop: '-4px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <span className="text-small" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Visiting/Service Fee (₹):</span>
                                                        <input type="number" className="input-field" style={{ padding: '4px 8px', fontSize: '0.85rem', width: '120px' }} placeholder="e.g. 150" value={shopHomeServiceFee} onChange={e => setShopHomeServiceFee(e.target.value)} />
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
                                <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '20px' }}>Location & Search Visibility</div>

                                {gigBusinessType === 'shop' && (
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Business Location on Map</label>
                                        <MapPicker lat={gigLat} lng={gigLng} onChange={({ lat, lng }) => { setGigLat(lat); setGigLng(lng); }} />
                                    </div>
                                )}

                                {gigBusinessType === 'shop' && (
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Google Maps Shop Link (Optional but Recommended)</label>
                                        <input
                                            type="url"
                                            className="input-field"
                                            placeholder="https://maps.app.goo.gl/..."
                                            value={shopGoogleMapsLink}
                                            onChange={e => setShopGoogleMapsLink(e.target.value)}
                                        />
                                        <div style={{ marginTop: '8px', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                            <p style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>How to get your shop link:</p>
                                            <ol style={{ fontSize: '0.75rem', paddingLeft: '16px', margin: 0, color: '#64748b' }}>
                                                <li>Open Google Maps and find your shop.</li>
                                                <li>Click the 'Share' button.</li>
                                                <li>Choose 'Copy Link' and paste it here.</li>
                                            </ol>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>State</label>
                                        <select
                                            className="input-field"
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
                                        <label style={styles.label}>City</label>
                                        <select className="input-field" value={gigCity} onChange={e => setGigCity(e.target.value)} disabled={!gigStateCode}>
                                            <option value="">Select City</option>
                                            {gigStateCode && City.getCitiesOfState('IN', gigStateCode).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Physical Address / Street</label>
                                        <input type="text" className="input-field" placeholder="Full address" value={gigAddress} onChange={e => setGigAddress(e.target.value)} />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Pincode</label>
                                        <input type="text" className="input-field" placeholder="e.g. 226001" value={gigZipCode} onChange={e => setGigZipCode(e.target.value)} />
                                    </div>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Service Coverage Areas (Pincodes)</label>
                                    <input type="text" className="input-field" placeholder="e.g. 110001, 110002, 110045" value={gigCoveragePincodes} onChange={e => setGigCoveragePincodes(e.target.value)} />
                                    <p className="text-small" style={{ marginTop: '6px', color: 'var(--text-muted)' }}>Enter multiple pincodes separated by commas. Leave empty for city-wide coverage.</p>
                                </div>

                                <div style={{ marginTop: '24px' }}>
                                    <label style={styles.label}>Gig Gallery (Add up to 5 photos)</label>
                                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: '12px' }}>
                                        {gigImages.map((url, i) => (
                                            <div key={i} style={{ position: 'relative' }}>
                                                <img 
                                                    src={url} 
                                                    alt={`gig-${i}`} 
                                                    style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #e2e8f0' }} 
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/100x80?text=Service'; }}
                                                />
                                                <button onClick={() => setGigImages(prev => prev.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: -5, right: -5, width: 22, height: 22, background: '#ef4444', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>×</button>
                                            </div>
                                        ))}
                                        {gigImages.length < 5 && (
                                            <label style={{ width: 100, height: 80, border: '2px dashed #cbd5e1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}>
                                                <Plus size={24} />
                                                <input type="file" multiple accept="image/*" onChange={handleGigImageUpload} style={{ display: 'none' }} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: 'auto', paddingTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                            <button
                                onClick={() => setGigStep(prev => Math.max(1, prev - 1))}
                                className="btn-outline"
                                disabled={gigStep === 1}
                                style={{ visibility: gigStep === 1 ? 'hidden' : 'visible' }}
                            >Back</button>

                            {gigStep < 3 ? (
                                <button onClick={() => setGigStep(prev => prev + 1)} className="btn-primary" style={{ padding: '12px 32px' }}>Next Step</button>
                            ) : (
                                <button onClick={handleCreateGig} disabled={creatingGig || uploadingGigImages} className="btn-primary" style={{ padding: '12px 48px', backgroundColor: '#059669' }}>
                                    {creatingGig ? 'Saving...' : (editingGigId ? 'Save Changes' : 'Complete & Publish Gig')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── MY GIGS TAB ── */}
            {activeTab === 'mygigs' && (
                <div className="animate-fade-in">
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
                <div className="animate-fade-in">

                    {bookingsLoading ? (
                        <p>Loading requests...</p>
                    ) : bookingRequests.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No requests found.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {bookingRequests.map(req => (
                                <div key={req._id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', backgroundColor: '#fff' }}>
                                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                                        <div>
                                            <span style={{
                                                color: ['pending', 'in_progress', 'revision_requested'].includes(req.status) ? '#f59e0b' : ['confirmed', 'delivered'].includes(req.status) ? '#2563eb' : req.status === 'completed' ? '#059669' : '#dc2626',
                                                backgroundColor: ['pending', 'in_progress', 'revision_requested'].includes(req.status) ? '#fef3c7' : ['confirmed', 'delivered'].includes(req.status) ? '#dbeafe' : req.status === 'completed' ? '#d1fae5' : '#fee2e2',
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700'
                                            }}>{req.status.replace('_', ' ').toUpperCase()}</span>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '8px' }}>{req.service?.title}</h3>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--primary)' }}>₹{req.totalPrice}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.paymentMethod}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} /></div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer</div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{req.user?.name}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CalendarIcon size={16} /></div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scheduled For</div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{new Date(req.date).toLocaleDateString()} | {req.timeSlot}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                Address 
                                                {calculateDistance(userLocation?.latitude, userLocation?.longitude, req.address?.lat, req.address?.lng) && (
                                                    <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', borderRadius: '100px', fontSize: '9px', fontWeight: '800' }}>
                                                        {calculateDistance(userLocation?.latitude, userLocation?.longitude, req.address?.lat, req.address?.lng)} KM AWAY
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.85rem' }}>{req.address?.street}, {req.address?.city}</div>
                                            {req.address?.googleMapLink && (
                                                <a href={req.address.googleMapLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', color: '#0ea5e9', textDecoration: 'none', marginTop: '4px', display: 'block' }}>Open Link 🔗</a>
                                            )}
                                        </div>
                                        {(req.address?.googleMapLink || (req.address?.lat && req.address?.lng)) && (
                                            <button 
                                                onClick={() => window.open(req.address.googleMapLink || `https://www.google.com/maps?q=${req.address.lat},${req.address.lng}`, '_blank')}
                                                style={{ background: '#f0f9ff', color: '#0ea5e9', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                                            >View Map 📍</button>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        {req.status === 'pending' && (
                                            <>
                                                <button onClick={() => updateBookingStatus(req._id, 'confirmed')} className="btn-primary" style={{ flex: 1, padding: '10px' }}>Accept Booking</button>
                                                <button onClick={() => updateBookingStatus(req._id, 'cancelled')} className="btn-outline" style={{ flex: 1, padding: '10px', borderColor: '#ef4444', color: '#ef4444' }}>Decline</button>
                                            </>
                                        )}
                                        {req.status === 'confirmed' && (
                                            <button onClick={() => updateBookingStatus(req._id, 'in_progress')} className="btn-primary" style={{ flex: 1, padding: '10px' }}>Mark In Progress</button>
                                        )}
                                        {['in_progress', 'revision_requested'].includes(req.status) && (
                                            <button onClick={() => updateBookingStatus(req._id, 'delivered')} className="btn-primary" style={{ flex: 1, padding: '10px', backgroundColor: '#059669' }}>Deliver Service</button>
                                        )}
                                        {['confirmed', 'in_progress', 'revision_requested', 'delivered'].includes(req.status) && (
                                            <button onClick={() => navigate(`/chat?roomId=${req._id}`)} className="btn-outline" style={{ flex: 1, padding: '10px' }}>Chat with Customer</button>
                                        )}
                                        {req.status === 'completed' && (
                                            <p style={{ color: '#059669', fontWeight: '600', fontSize: '0.9rem' }}>✓ Service completed & accepted</p>
                                        )}
                                        {req.status === 'cancelled' && (
                                            <p style={{ color: '#dc2626', fontWeight: '600', fontSize: '0.9rem' }}>This booking was cancelled</p>
                                        )}
                                    </div>

                                    {req.status === 'revision_requested' && req.revisions?.length > 0 && (
                                        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '4px' }}>
                                            <strong style={{ color: '#92400e', fontSize: '0.9rem' }}>Customer requested revision:</strong>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>{req.revisions[req.revisions.length - 1].note}</p>
                                        </div>
                                    )}
                                    {req.status === 'delivered' && (
                                        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '4px', fontSize: '0.85rem', color: '#1e40af' }}>
                                            Waiting for customer to accept or request a revision.
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="animate-fade-in" style={{ maxWidth: '1000px' }}>
                    <section style={{ backgroundColor: '#fff', borderRadius: '32px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }}>
                            <div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Full Name</label>
                                    <input type="text" className="input-field" value={profileNameState} onChange={e => setProfileNameState(e.target.value)} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Username</label>
                                    <input type="text" className="input-field" placeholder="Choose a unique username" value={profileUsername} onChange={e => setProfileUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))} />
                                    {profileUsername && (
                                        <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            Public URL: <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{window.location.host}/u/{profileUsername}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Email Address</label>
                                    <input type="email" className="input-field" defaultValue={user?.email || ''} readOnly style={{ opacity: 0.6, backgroundColor: '#f8fafc' }} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Phone Number</label>
                                    <input type="text" className="input-field" placeholder="Add phone number" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} />
                                </div>
                                {/* Security Tip Panel */}
                                <div style={{ padding: '24px', backgroundColor: '#f0f9ff', borderRadius: '20px', border: '1px solid #e0f2fe' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <CheckCircle size={20} color="#0284c7" />
                                        <div>
                                            <p style={{ fontSize: '13px', fontWeight: '700', color: '#0369a1', marginBottom: '4px' }}>Security Tip</p>
                                            <p style={{ fontSize: '12px', color: '#0c4a6e', lineHeight: '1.5' }}>Ensure your phone number is verified to receive SMS alerts for new bookings and messages.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '32px', borderTop: '1px solid #f1f5f9', paddingTop: '40px' }}>
                                <div style={styles.formGroup}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label style={styles.label}>{role === 'provider' ? 'Professional Title' : 'Public Title / Headline'}</label>
                                        <span style={{ fontSize: '11px', color: (providerTitle?.length || 0) >= 25 ? '#ef4444' : '#94a3b8', fontWeight: '700' }}>{providerTitle?.length || 0}/25</span>
                                    </div>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={providerTitle}
                                        maxLength={25}
                                        onChange={(e) => setProviderTitle(e.target.value)}
                                        placeholder="e.g. Expert Home Stylist or Senior Electrician"
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label style={styles.label}>{role === 'provider' ? 'About / Professional Bio' : 'About Me / Bio'}</label>
                                        <span style={{ fontSize: '11px', color: (providerAbout?.length || 0) >= 50 ? '#ef4444' : '#94a3b8', fontWeight: '700' }}>{providerAbout?.length || 0}/50</span>
                                    </div>
                                    <textarea
                                        className="input-field"
                                        value={providerAbout}
                                        maxLength={50}
                                        onChange={(e) => setProviderAbout(e.target.value)}
                                        placeholder="Describe your skills in 50 characters or less..."
                                        rows={3}
                                        style={{ resize: 'none', height: 'auto', minHeight: '100px', paddingTop: '16px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'chat' && (
                <div className="animate-fade-in" style={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: '24px', 
                    height: isMobile ? 'auto' : 'calc(100vh - 250px)', 
                    minHeight: isMobile ? 'none' : '600px' 
                }}>
                    {/* Left Side: Room List */}
                    <div style={{ 
                        width: isMobile ? '100%' : '350px', 
                        display: (isMobile && dashActiveRoom) ? 'none' : 'flex',
                        flexDirection: 'column', 
                        gap: '16px', 
                        borderRight: isMobile ? 'none' : '1px solid #f1f5f9', 
                        paddingRight: isMobile ? '0' : '24px', 
                        overflowY: 'auto' 
                    }}>
                        <h2 className="text-h2" style={{ marginBottom: '8px', fontSize: '1.5rem' }}>Messages</h2>
                        <ChatList
                            onSelect={(room) => setDashActiveRoom(room)}
                        />
                    </div>

                    {/* Right Side: Chat Area */}
                    <div style={{ 
                        flex: 1, 
                        display: (isMobile && !dashActiveRoom) ? 'none' : 'flex',
                        backgroundColor: '#fff', 
                        borderRadius: '24px', 
                        flexDirection: 'column', 
                        overflow: 'hidden', 
                        border: '1px solid #f1f5f9', 
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                        minHeight: isMobile ? '500px' : 'none'
                    }}>
                        {dashActiveRoom ? (
                            <>
                                {/* Window Header */}
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#fff' }}>
                                    {isMobile && (
                                        <button 
                                            onClick={() => setDashActiveRoom(null)}
                                            style={{ background: 'none', border: 'none', marginRight: '8px', cursor: 'pointer', color: '#64748b' }}
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                    <img
                                        src={getAvatar(dashActiveRoom.otherUser)}
                                        alt="Avatar"
                                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dashActiveRoom.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`; }}
                                    />
                                    <div>
                                        <h4 style={{ fontSize: '14px', fontWeight: '800' }}>{dashActiveRoom.otherUser?.name || 'User'}</h4>
                                        <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: '700' }}>Active Conversation</span>
                                    </div>
                                </div>

                                {/* Service Context Card */}
                                {activeService && (
                                    <div style={{ 
                                        padding: '12px 24px', 
                                        backgroundColor: '#fff', 
                                        borderBottom: '1px solid #f1f5f9', 
                                        display: 'flex', 
                                        gap: 16, 
                                        alignItems: 'center',
                                        position: 'relative'
                                    }}>
                                        <img 
                                            src={activeService.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeService.title)}&background=f8fafc&color=4f46e5`} 
                                            style={{ width: 60, height: 45, borderRadius: 10, objectFit: 'cover', border: '1px solid #f1f5f9' }} 
                                            alt=""
                                        />
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: '10px', fontWeight: 900, color: '#003d9b', textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: 'rgba(0,61,155,0.05)', padding: '2px 8px', borderRadius: 4 }}>Inquiry Context</span>
                                            </div>
                                            <h4 style={{ fontSize: '14px', fontWeight: 800, margin: '4px 0 0', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeService.title}</h4>
                                        </div>
                                        <button 
                                            onClick={() => setActiveService(null)}
                                            style={{ background: '#f8fafc', border: 'none', color: '#94a3b8', cursor: 'pointer', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', transition: 'all 0.2s' }}
                                        >✕</button>
                                    </div>
                                )}

                                {/* Messages Container */}
                                <div className="no-scrollbar" style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f8fafc' }}>
                                    {dashMessages.length === 0 ? (
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
                                            No messages yet. Say hi!
                                        </div>
                                    ) : (
                                        dashMessages.map((msg, idx) => {
                                            const isMe = msg.senderId === user?._id;
                                            return (
                                                <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                                    <div style={{
                                                        padding: '10px 14px',
                                                        borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                                                        backgroundColor: isMe ? '#003d9b' : '#fff',
                                                        color: isMe ? '#fff' : '#1e293b',
                                                        fontSize: '13px',
                                                        lineHeight: '1.4',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                                    }}>
                                                        {msg.message}
                                                    </div>
                                                    <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div style={{ padding: '16px', backgroundColor: '#fff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Write a message..."
                                        value={dashMessageInput}
                                        onChange={e => setDashMessageInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSendMessageDash()}
                                        style={{ borderRadius: '100px', padding: '10px 20px', fontSize: '13px', flex: 1 }}
                                    />
                                    <button
                                        onClick={handleSendMessageDash}
                                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: '#003d9b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: '40px', textAlign: 'center' }}>
                                <MessageSquare size={40} style={{ opacity: 0.15, marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '8px' }}>Your Messages</h3>
                                <p style={{ fontSize: '13px' }}>Select a conversation from the list to start chatting.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}


            {activeTab === 'payments' && (
                <div className="animate-fade-in" style={{ maxWidth: '1200px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', marginBottom: '32px' }}>
                        {/* Balance Overview */}
                        <div style={{ gridColumn: 'span 4', backgroundColor: '#003d9b', borderRadius: '24px', padding: '32px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1 }}>
                                <Wallet size={120} />
                            </div>
                            <p style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: '8px' }}>Total Earnings</p>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0 }}>₹{stats.totalEarnings?.toLocaleString() || '0'}</h2>
                            <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '16px', flex: 1 }}>
                                    <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', opacity: 0.7 }}>Available</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>₹{(stats.totalEarnings - (stats.withdrawnAmount || 0)).toLocaleString()}</span>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '16px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <button className="btn-primary" style={{ background: 'white', color: '#003d9b', padding: '8px 16px', borderRadius: '12px', fontSize: '10px', fontWeight: '900', border: 'none' }}>WITHDRAW</button>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div style={{ gridColumn: 'span 8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ArrowDownLeft size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#737685', fontWeight: '600' }}>Last 30 Days</p>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>₹{Math.round((stats.totalEarnings || 0) * 0.35).toLocaleString()}</h4>
                                </div>
                            </div>
                            <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#737685', fontWeight: '600' }}>Active Orders Value</p>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>₹{bookingRequests.filter(b => b.status === 'confirmed' || b.status === 'in_progress').reduce((acc, b) => acc + (b.totalPrice || 0), 0).toLocaleString()}</h4>
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
                                    {(bookingRequests || []).filter(b => b?.paymentStatus === 'paid' || b?.status === 'completed').length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                                    <CreditCard size={40} style={{ opacity: 0.1 }} />
                                                    <p>No successful transactions yet.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        (bookingRequests || []).filter(b => b?.paymentStatus === 'paid' || b?.status === 'completed').map((tx, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f8fafc', transition: 'all 0.2s ease' }} className="hover-bg-light">
                                                <td style={{ padding: '20px 8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: tx.paymentStatus === 'paid' ? '#ecfdf5' : '#fff7ed', color: tx.paymentStatus === 'paid' ? '#10b981' : '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            {tx.paymentStatus === 'paid' ? <CheckCircle size={20} /> : <ArrowDownLeft size={20} />}
                                                        </div>
                                                        <div style={{ overflow: 'hidden' }}>
                                                            <span style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.paymentStatus === 'paid' ? 'Payment Completed' : 'Incoming Transfer'}</span>
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
                                                        <span style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{tx.user?.name || 'Community Member'}</span>
                                                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{tx.service?.title?.split(' ')?.slice(0, 3)?.join(' ') || 'Service Details'}...</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 8px' }}>
                                                    <div style={{ fontSize: '15px', fontWeight: '900', color: '#059669' }}>+₹{tx.totalPrice?.toLocaleString()}</div>
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

        </div>
    );
};

export default DashboardDesktop;
