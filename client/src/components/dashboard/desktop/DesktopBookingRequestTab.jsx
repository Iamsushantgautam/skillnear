import React from 'react';
import { 
    Clock, 
    PlayCircle, 
    CheckCircle, 
    DollarSign, 
    PackageOpen, 
    User, 
    Calendar as CalendarIcon, 
    Phone, 
    MapPin, 
    MessageSquare, 
    History, 
    RotateCcw, 
    XCircle 
} from 'lucide-react';
import '../../../styles/desktop-dashboard-styles/DesktopBookingRequestTab.css';

const DesktopBookingRequestTab = ({
    bookingRequests,
    bookingsLoading,
    bookingFilter,
    setBookingFilter,
    updateBookingStatus,
    handleDeliverClick,
    setDashActiveRoom,
    setActiveTab,
    setBookingWithRevisions,
    setShowRevisions,
    role
}) => {
    return (
        <div className="booking-requests-container animate-fade-in">
            {/* Quick Stats Grid */}
            <div className="stats-grid">
                {[
                    { label: 'Pending', value: bookingRequests.filter(r => r.status === 'pending').length, color: '#f59e0b', bg: '#fef3c7', icon: Clock },
                    { label: 'Active', value: bookingRequests.filter(r => ['confirmed', 'in_progress'].includes(r.status)).length, color: '#003d9b', bg: '#e0e7ff', icon: PlayCircle },
                    { label: 'Completed', value: bookingRequests.filter(r => r.status === 'completed').length, color: '#059669', bg: '#d1fae5', icon: CheckCircle },
                    { label: 'Total Value', value: `₹${bookingRequests.filter(r => r.status !== 'cancelled').reduce((acc, curr) => acc + (curr.totalPrice || 0), 0)}`, color: '#191b23', bg: '#f1f5f9', icon: DollarSign }
                ].map((stat, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-icon-wrapper" style={{ backgroundColor: stat.bg, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="stat-label">{stat.label}</p>
                            <h4 className="stat-value">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="filter-pills">
                    {['all', 'pending', 'confirmed', 'in_progress', 'delivered', 'completed', 'cancelled'].map(f => (
                        <button
                            key={f}
                            onClick={() => setBookingFilter(f)}
                            className={`filter-pill ${bookingFilter === f ? 'active' : ''}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {bookingsLoading ? (
                <div className="requests-list">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '24px' }}></div>)}
                </div>
            ) : bookingRequests.length === 0 ? (
                <div className="no-orders-card">
                    <div className="no-orders-icon">
                        <PackageOpen size={40} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#191b23', marginBottom: '8px' }}>No Orders Found</h3>
                    <p style={{ color: '#64748b', maxWidth: '300px', margin: '0 auto' }}>You don't have any orders matching the selected filter.</p>
                </div>
            ) : (
                <div className="requests-list">
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
                                <div key={req._id} className="request-card">
                                    <div className="request-flex">
                                        {/* Service Preview */}
                                        <div className="service-preview">
                                            <img
                                                src={req.service?.images?.[0]?.url || req.service?.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=500&auto=format&fit=crop'}
                                                alt={req.service?.title}
                                                className="service-image"
                                            />
                                            <div className="status-badge" style={{ backgroundColor: config.bg, color: config.color }}>
                                                {config.text}
                                            </div>
                                        </div>

                                        {/* Details Section */}
                                        <div className="request-details">
                                            <div className="request-header">
                                                <div>
                                                    <h3 className="service-title">{req.service?.title}</h3>
                                                    <div className="meta-info">
                                                        <div className="meta-item">
                                                            <div className="user-avatar-mini">
                                                                <User size={14} />
                                                            </div>
                                                            <span style={{ fontWeight: 600, color: '#191b23' }}>{req.user?.name}</span>
                                                        </div>
                                                        <div className="meta-divider"></div>
                                                        <div className="meta-item">
                                                            <CalendarIcon size={14} />
                                                            <span>{new Date(req.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {req.timeSlot}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="price-container">
                                                    <div className="total-price">₹{req.totalPrice}</div>
                                                    <div className="price-label">Order Value</div>
                                                </div>
                                            </div>

                                            <div className="info-grid">
                                                <div className="info-block">
                                                    <div className="info-icon" style={{ color: '#059669' }}>
                                                        <Phone size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="info-label">Customer Contact</p>
                                                        <p className="info-text-main">{req.customerName || req.user?.name}</p>
                                                        <p className="info-text-sub">
                                                            {['completed', 'cancelled'].includes(req.status) ? 'Hidden (Order Closed)' : (req.customerPhone || req.user?.phone || 'Phone not provided')}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="info-block">
                                                    <div className="info-icon" style={{ color: '#003d9b' }}>
                                                        <MapPin size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="info-label">Delivery Address</p>
                                                        <p className="info-text-main">{req.address?.street || 'Not specified'}, {req.address?.city} {req.address?.zipCode}</p>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                                                    {(req.address?.googleMapLink || (req.address?.lat && req.address?.lng)) && (
                                                        <button
                                                            onClick={() => {
                                                                let link = (req.address?.lat && req.address?.lng)
                                                                    ? `https://www.google.com/maps/dir/?api=1&destination=${req.address.lat},${req.address.lng}`
                                                                    : req.address?.googleMapLink;
                                                                if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link;
                                                                if (link) window.open(link, '_blank');
                                                            }}
                                                            className="btn-location"
                                                            style={{ flex: 'none', height: '40px', padding: '0 16px' }}
                                                        >
                                                            <MapPin size={16} /> Direction Link 📍
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="actions-row">
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => updateBookingStatus(req._id, 'confirmed')} className="btn-accept">
                                                            Accept Request
                                                        </button>
                                                        <button onClick={() => updateBookingStatus(req._id, 'cancelled')} className="btn-decline">
                                                            Decline
                                                        </button>
                                                    </>
                                                )}
                                                {req.status === 'confirmed' && (
                                                    <>
                                                        <button onClick={() => updateBookingStatus(req._id, 'in_progress')} className="btn-start">
                                                            Start Service
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                let link = (req.address?.lat && req.address?.lng)
                                                                    ? `https://www.google.com/maps/dir/?api=1&destination=${req.address.lat},${req.address.lng}`
                                                                    : (req.address?.googleMapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${req.address?.street || ''} ${req.address?.city || ''} ${req.address?.zipCode || ''}`.trim() || 'Customer Location')}`);
                                                                if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link;
                                                                if (link) window.open(link, '_blank');
                                                            }}
                                                            className="btn-location"
                                                        >
                                                            <MapPin size={18} /> Location
                                                        </button>
                                                    </>
                                                )}
                                                {['in_progress', 'revision_requested'].includes(req.status) && (
                                                    <button onClick={() => handleDeliverClick(req._id)} className="btn-deliver">
                                                        Mark as Delivered
                                                    </button>
                                                )}
                                                {['confirmed', 'in_progress', 'revision_requested', 'delivered'].includes(req.status) && (
                                                    <>
                                                        <button 
                                                            onClick={() => { setDashActiveRoom({ roomId: req._id, otherUser: req.user, title: req.service?.title }); setActiveTab('chat'); }} 
                                                            className="btn-outline-primary"
                                                        >
                                                            <MessageSquare size={20} /> Message
                                                        </button>
                                                        {req.revisions?.length > 0 && (
                                                            <button 
                                                                onClick={() => { setBookingWithRevisions(req); setShowRevisions(true); }}
                                                                className="btn-soft-primary"
                                                            >
                                                                <History size={20} /> Revisions ({req.revisions.length})
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                                {req.status === 'completed' && (
                                                    <div className="status-notice completed">
                                                        <CheckCircle size={20} /> Order completed and funds released.
                                                    </div>
                                                )}
                                                {req.status === 'cancelled' && (
                                                    <div className="status-notice cancelled">
                                                        <XCircle size={20} /> This order was cancelled.
                                                    </div>
                                                )}
                                            </div>

                                            {req.status === 'revision_requested' && req.revisions?.length > 0 && (
                                                <div className="revision-box">
                                                    <div className="revision-header">
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
    );
};

export default DesktopBookingRequestTab;
