import React, { useState } from 'react';
import { Loader, MapPin } from 'lucide-react';
import { PC, Shell, Badge } from './MobileDashboardShared';
import '../../../styles/mobile-dashboard-styles/MobileBookingScreens.css';

export default function MobileRequestsScreen({
    bookingRequests, bookingsLoading, updateBookingStatus,
    setActiveTab, navigate, onSelectRoom, onSelectBooking,
    onDeliverClick, onShowRevisions
}) {
    const [bookingFilter, setBookingFilter] = useState('all');

    const filteredBookings = (bookingRequests || []).filter(b => {
        if (bookingFilter === 'all') return true;
        if (bookingFilter === 'pending') return b.status === 'pending';
        if (bookingFilter === 'confirmed') return b.status === 'confirmed';
        if (bookingFilter === 'in_progress') return ['in_progress', 'revision_requested', 'delivered'].includes(b.status);
        if (bookingFilter === 'completed') return b.status === 'completed';
        if (bookingFilter === 'cancelled') return ['cancelled', 'rejected'].includes(b.status);
        return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <Shell title="Booking Requests" onBack={() => setActiveTab('overview')}>
            <div style={{ padding: '0 4px' }}>
                <div className="booking-header">
                    <span className="booking-header-label">Portfolio Manager</span>
                    <h2 className="booking-header-title">
                        Incoming <span className="booking-header-accent">requests.</span>
                    </h2>
                </div>

                <div className="booking-tabs no-scrollbar">
                    {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setBookingFilter(filter)}
                            className={`booking-tab-btn ${bookingFilter === filter ? 'active' : 'inactive'}`}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1).replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="booking-list">
                    {bookingsLoading ? (
                        <div style={{ textAlign: 'center', padding: 48 }}>
                            <Loader size={28} color={PC} className="animate-spin" />
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: 24, border: '1px solid #f1f5f9' }}>
                            <p style={{ color: '#94a3b8' }}>No {bookingFilter === 'all' ? '' : bookingFilter} requests found</p>
                        </div>
                    ) : filteredBookings.map(req => {
                        const isCancelled = ['cancelled', 'rejected'].includes(req.status);
                        const isCompleted = req.status === 'completed';
                        return (
                            <div key={req._id} onClick={() => onSelectBooking(req)}
                                className={`booking-card ${isCancelled ? 'booking-card-inactive' : 'booking-card-active'}`}>
                                <div className="booking-card-top">
                                    <img
                                        src={req.service?.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.service?.title || 'S')}&background=f3f3fd&color=003d9b`}
                                        className="booking-card-img"
                                        alt=""
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=S&background=f3f3fd&color=003d9b`; }}
                                    />
                                    <div className="booking-card-info">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <Badge status={req.status} />
                                        </div>
                                        <h3 className="booking-card-title">{req.service?.title}</h3>
                                        <p className="booking-card-user">
                                            {req.customerName || req.user?.name || req.user?.username || 'User'}
                                        </p>
                                    </div>
                                </div>

                                <div className="booking-card-middle">
                                    <span className="booking-card-date">
                                        {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <span className="booking-card-price">₹{req.totalPrice || req.price || 0}</span>
                                    {req.paymentMode && (
                                        <div style={{ fontSize: 9, fontWeight: 800, color: req.paymentMode === 'Online' ? '#003d9b' : '#059669', backgroundColor: req.paymentMode === 'Online' ? '#e0e7ff' : '#d1fae5', padding: '2px 6px', borderRadius: 6, position: 'absolute', right: 0, top: -20 }}>
                                            {req.paymentMode.toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {!isCancelled && !isCompleted && (
                                    <div className="booking-card-actions-wrapper">
                                        <div className="booking-card-primary-actions">
                                            {req.status === 'pending' && (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(req._id, 'confirmed'); }}
                                                        className="booking-btn booking-btn-primary">
                                                        Accept Request
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(req._id, 'cancelled'); }}
                                                        className="booking-btn booking-btn-danger">
                                                        Decline
                                                    </button>
                                                </>
                                            )}
                                            {req.status === 'confirmed' && (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(req._id, 'in_progress'); }}
                                                        className="booking-btn booking-btn-success">
                                                        Start Service
                                                    </button>
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        const lat = req.address?.lat; const lng = req.address?.lng;
                                                        const link = lat && lng
                                                            ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
                                                            : (req.address?.googleMapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.address?.street || req.address?.city || 'Customer Location')}`);
                                                        window.open(link.startsWith('http') ? link : 'https://' + link, '_blank');
                                                    }} className="booking-btn booking-btn-info">
                                                        <MapPin size={16} /> Navigate
                                                    </button>
                                                </>
                                            )}
                                            {['in_progress', 'revision_requested'].includes(req.status) && (
                                                <button onClick={(e) => { e.stopPropagation(); onDeliverClick(req); }}
                                                    className="booking-btn booking-btn-success" style={{ flex: '2' }}>
                                                    Deliver & Request Payment
                                                </button>
                                            )}
                                            {req.status === 'delivered' && (
                                                <div style={{ flex: 1, padding: '12px', borderRadius: 14, background: '#fffbeb', color: '#d97706', fontWeight: 800, fontSize: 12, textAlign: 'center' }}>
                                                    ⏳ Awaiting Approval
                                                </div>
                                            )}
                                        </div>

                                        <div className="booking-card-secondary-actions">
                                            <button onClick={(e) => { e.stopPropagation(); onSelectBooking(req); }}
                                                className="booking-btn booking-btn-light">
                                                Details
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); onSelectRoom({ roomId: req._id, otherUser: req.user }); }}
                                                className="booking-btn booking-btn-muted">
                                                Chat
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {req.revisions?.length > 0 && (
                                    <button onClick={(e) => { e.stopPropagation(); onShowRevisions(req); }}
                                        style={{ marginTop: 12, width: '100%', padding: '10px', borderRadius: 12, background: '#f0f7ff', color: '#003d9b', border: '1px solid #dbeafe', fontWeight: 800, fontSize: 12 }}>
                                        View Revision History ({req.revisions.length})
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </Shell>
    );
}
