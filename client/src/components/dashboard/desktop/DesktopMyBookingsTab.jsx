import React from 'react';
import { 
    Calendar as CalendarIcon, 
    MapPin, 
    User, 
    MessageSquare, 
    History,
    TrendingUp,
    Star
} from 'lucide-react';
import '../../../styles/desktop-dashboard-styles/DesktopMyBookingsTab.css';

const DesktopMyBookingsTab = ({
    myBookings = [],
    bookingsLoading,
    bookingFilter,
    setBookingFilter,
    updateBookingStatus,
    handleCompleteClick,
    handleAcceptClick,
    setBookingForRevision,
    setRevisionNote,
    setSelectedBookingDetails,
    setDashActiveRoom,
    setActiveTab,
    role,
    navigate,
    setBookingWithRevisions,
    setShowRevisions
}) => {
    const filteredBookings = (myBookings || []).filter(b => {
        if (!b || !b.status) return false;
        if (bookingFilter === 'all') return true;
        if (bookingFilter === 'pending') return b.status === 'pending';
        if (bookingFilter === 'confirmed') return b.status === 'confirmed';
        if (bookingFilter === 'in_progress') return ['in_progress', 'revision_requested', 'delivered'].includes(b.status);
        if (bookingFilter === 'completed') return b.status === 'completed';
        if (bookingFilter === 'cancelled') return ['cancelled', 'rejected'].includes(b.status);
        return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const getStatusStyles = (status) => {
        let color = '#dc2626';
        let bg = '#fee2e2';
        if (status === 'pending') { color = '#b45309'; bg = '#fef3c7'; }
        if (status === 'confirmed') { color = '#1d4ed8'; bg = '#dbeafe'; }
        if (['in_progress', 'revision_requested', 'delivered'].includes(status)) { color = '#7c3aed'; bg = '#f5f3ff'; }
        if (status === 'completed') { color = '#047857'; bg = '#d1fae5'; }
        if (['cancelled', 'rejected'].includes(status)) { color = '#dc2626'; bg = '#fee2e2'; }
        return { color, bg };
    };

    const totalValue = (myBookings || [])
        .filter(b => b?.status !== 'cancelled' && b?.status !== 'rejected')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    return (
        <div className="bookings-tab-container animate-fade-in">
            {/* Header & Filter */}
            <div className="bookings-header">
                <div>
                    <p className="bookings-subtitle">
                        Manage your active collaborations and professional service records from one central hub.
                    </p>
                </div>
                <div className="filter-pills">
                    {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setBookingFilter(filter)}
                            className={`filter-pill ${bookingFilter === filter ? 'active' : ''}`}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1).replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bookings-grid">
                {/* Bookings List Column */}
                <div className="bookings-list-col">
                    {bookingsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="booking-card skeleton-container">
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
                    ) : filteredBookings.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#ffffff', borderRadius: '24px', border: '1px solid rgba(195, 198, 214, 0.2)' }}>
                            No {bookingFilter} bookings found.
                        </p>
                    ) : (
                        filteredBookings.map(b => {
                            if (!b || !b._id) return null;
                            const { color: statusColor, bg: statusBg } = getStatusStyles(b.status || '');
                            const isCompleted = b.status === 'completed';
                            const isCancelled = ['cancelled', 'rejected'].includes(b.status || '');

                            return (
                                <div 
                                    key={b._id} 
                                    className={`booking-card ${isCompleted ? 'completed' : ''} ${isCancelled ? 'cancelled' : ''}`}
                                >
                                    <div style={{ display: 'flex', gap: '24px' }}>
                                        {/* Image */}
                                        <div className="booking-image-wrapper">
                                            <img
                                                src={b.service?.images?.[0]?.url || b.service?.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop'}
                                                alt={b.service?.title}
                                                className="booking-image"
                                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop'; }}
                                            />
                                        </div>

                                        <div className="booking-content">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                        <span 
                                                            className="order-status-tag"
                                                            style={{ 
                                                                background: statusBg, 
                                                                color: statusColor,
                                                                fontSize: '10px',
                                                                fontWeight: '800',
                                                                padding: '4px 10px',
                                                                borderRadius: '100px',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.05em'
                                                            }}
                                                        >
                                                            {(() => {
                                                                const s = b.status || 'pending';
                                                                if (s === 'pending') return 'Pending';
                                                                if (s === 'confirmed') return 'Confirmed';
                                                                if (s === 'delivered') return 'Delivered';
                                                                if (['in_progress', 'revision_requested'].includes(s)) return 'In Progress';
                                                                if (s === 'completed') return 'Completed';
                                                                if (['cancelled', 'rejected'].includes(s)) return 'Cancelled';
                                                                return s.replace('_', ' ');
                                                            })()}
                                                        </span>
                                                        <span className="booking-id">ID: #{(b._id || '').slice(-6).toUpperCase()}</span>
                                                    </div>
                                                    <h3 className="booking-title">{b.service?.title}</h3>
                                                    <p className="provider-info">
                                                        <User size={14} /> Provider: <span style={{ fontWeight: '600', color: '#434654' }}>{b.provider?.name}</span>
                                                    </p>
                                                    {!isCompleted && !isCancelled && b.provider?.phone && (
                                                        <p className="provider-phone" style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                            <div style={{ backgroundColor: '#f0fdf4', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>CALL</div>
                                                            {b.provider.phone}
                                                        </p>
                                                    )}
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p className={`booking-price ${isCompleted ? 'price-completed' : ''}`}>₹{b.totalPrice}</p>
                                                    <p className="price-subtext">
                                                        {isCompleted ? 'Paid' : 'Escrow Secured'}
                                                    </p>
                                                    {b.paymentMode && (
                                                        <div style={{ 
                                                            fontSize: '10px', 
                                                            fontWeight: '800', 
                                                            color: b.paymentMode === 'Online' ? '#003d9b' : '#059669',
                                                            backgroundColor: b.paymentMode === 'Online' ? '#e0e7ff' : '#d1fae5',
                                                            padding: '2px 8px',
                                                            borderRadius: '6px',
                                                            marginTop: '4px',
                                                            display: 'inline-block'
                                                        }}>
                                                            {b.paymentMode.toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="booking-meta">
                                                <div className="meta-item">
                                                    <CalendarIcon size={16} color="#94a3b8" /> {b.date ? new Date(b.date).toLocaleDateString() : 'N/A'}
                                                </div>
                                                <div className="meta-item">
                                                    <CalendarIcon size={16} color="#94a3b8" /> {b.timeSlot || 'N/A'}
                                                </div>
                                                <div className="meta-item">
                                                    <MapPin size={16} color="#94a3b8" /> {b.address?.city || 'Remote Delivery'}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="booking-actions">
                                                {b.status === 'delivered' ? (
                                                    <>
                                                        <button 
                                                            onClick={() => handleCompleteClick(b._id)} 
                                                            className="action-btn-primary"
                                                        >Accept & Mark Complete</button>
                                                        <button 
                                                            onClick={() => { setBookingForRevision(b); setRevisionNote(''); }} 
                                                            className="action-btn-outline"
                                                        >Request Revision</button>
                                                    </>
                                                ) : b.status === 'confirmed' ? (
                                                    <>
                                                        <button 
                                                            onClick={() => handleAcceptClick(b._id)} 
                                                            className="action-btn-primary"
                                                        >Confirm & Select Payment</button>
                                                        <button 
                                                            onClick={() => setSelectedBookingDetails(b)} 
                                                            className="action-btn-outline"
                                                        >View Details</button>
                                                    </>
                                                ) : isCompleted ? (
                                                    <>
                                                        <button 
                                                            onClick={() => navigate(`/invoice/${b._id}`)} 
                                                            className="action-btn-ghost"
                                                        >View Invoice</button>
                                                        <button 
                                                            onClick={() => navigate(`/services/${b.service?._id || b.service}`)} 
                                                            className="action-btn-outline"
                                                        >Rate Professional</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button 
                                                            onClick={() => setSelectedBookingDetails(b)} 
                                                            className="action-btn-primary"
                                                        >View Details & Tracking</button>
                                                        <button 
                                                            onClick={() => { 
                                                                setDashActiveRoom({ 
                                                                    roomId: b._id, 
                                                                    otherUser: role === 'provider' ? b.user : b.provider, 
                                                                    title: b.service?.title 
                                                                }); 
                                                                setActiveTab('chat'); 
                                                            }} 
                                                            className="message-btn"
                                                        >
                                                            <MessageSquare size={18} /> Message
                                                        </button>
                                                        {b.revisions?.length > 0 && (
                                                            <button 
                                                                onClick={() => { setBookingWithRevisions(b); setShowRevisions(true); }}
                                                                className="revision-history-btn"
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
                    )}
                </div>

                {/* Sidebar Widgets */}
                <div className="bookings-sidebar-col">
                    <div className="analytics-card">
                        <div className="analytics-pattern"></div>
                        <div style={{ position: 'relative', zIndex: 10 }}>
                            <div className="analytics-header-row">
                                <h4 className="analytics-title">Activity Summary</h4>
                                <TrendingUp size={16} style={{ opacity: 0.6 }} />
                            </div>
                            
                            <div className="analytics-main-value">
                                <span className="currency-symbol">₹</span>
                                <span className="value-text">{totalValue.toLocaleString()}</span>
                                <p className="analytics-subtitle">Lifetime Booking Volume</p>
                            </div>

                            <div className="analytics-stats-grid">
                                <div className="stat-box-modern">
                                    <div className="stat-icon-circle">
                                        <History size={14} />
                                    </div>
                                    <div className="stat-info-modern">
                                        <p className="stat-value-modern">
                                            {(myBookings || []).filter(b => b?.status !== 'cancelled' && b?.status !== 'rejected').length}
                                        </p>
                                        <p className="stat-label-modern">Total Bookings</p>
                                    </div>
                                </div>
                                <div className="stat-box-modern">
                                    <div className="stat-icon-circle" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                                        <Star size={14} fill="currentColor" />
                                    </div>
                                    <div className="stat-info-modern">
                                        <p className="stat-value-modern">98%</p>
                                        <p className="stat-label-modern">Success Rate</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Help Widget */}
                    <div className="help-widget">
                        <div className="help-widget-icon-wrapper">
                            <MessageSquare size={28} color="#003d9b" />
                        </div>
                        <h5 className="help-widget-title">Need Support?</h5>
                        <p className="help-widget-subtitle">Our support team is available 24/7 to help you with any issues.</p>
                        <button 
                            onClick={() => setActiveTab('help')} 
                            className="help-widget-btn"
                        >
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesktopMyBookingsTab;
