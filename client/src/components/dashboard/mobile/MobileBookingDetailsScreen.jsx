import React from 'react';
import { MapPin, Download, History, MessageSquare } from 'lucide-react';
import { PC, PL, Shell, calculateDistance } from './MobileDashboardShared';
import '../../../styles/mobile-dashboard-styles/MobileBookingScreens.css';
import '../../../styles/mobile-dashboard-styles/MobileBookingDetails.css';

export default function MobileBookingDetailsScreen({ booking, userLocation, onBack, onMessage, role, updateBookingStatus, onDeliverClick, navigate, onShowRevisions }) {
    if (!booking) return null;

    const otherUser = role === 'provider' ? booking.user : booking.provider;

    const distance = calculateDistance(
        userLocation?.latitude, userLocation?.longitude,
        booking.address?.lat, booking.address?.lng
    );

    const detailRow = (label, value) => (
        <div className="detail-item-row">
            <span className="detail-item-label">{label}</span>
            <span className="detail-item-value">{value}</span>
        </div>
    );

    const getStatusClass = (status) => {
        if (status === 'pending') return 'pending';
        if (['confirmed', 'in_progress', 'delivered', 'completed'].includes(status)) return 'success';
        return 'danger';
    };

    return (
        <Shell title={role === 'provider' ? 'Booking Details' : 'Order Details'} onBack={onBack}>
            <div style={{ padding: '0 20px 20px' }}>
                <div className="booking-detail-section">
                    <div className="booking-details-header">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span className="order-id-label">Order ID: #{booking._id ? booking._id.slice(-8).toUpperCase() : 'N/A'}</span>
                            <span className="order-user-info">{role === 'provider' ? 'For' : 'With'}: {otherUser?.name || otherUser?.username || 'User'}</span>
                        </div>
                        <div className={`status-badge ${getStatusClass(booking.status)}`}>
                            {booking.status?.replace('_', ' ') || 'UNKNOWN'}
                        </div>
                    </div>

                    <h2 className="booking-title-main">{booking.service?.title || 'Service Details'}</h2>
                    <p className="booking-subtitle">Real-time update of your scheduled service</p>

                    <div className="price-summary-card">
                        <div className="price-row">
                            <span className="price-label">Total Price</span>
                            <span className="price-value">₹{booking.price || booking.totalPrice || '0'}</span>
                        </div>
                        <div className="payment-info-row">
                            <div className="payment-method-badge">
                                <div className="payment-dot"></div>
                                <span className="payment-method-text">{booking.paymentMethod || 'Wallet'}</span>
                            </div>
                            {distance && (
                                <div className="distance-badge">
                                    <MapPin size={12} color="#3b82f6" />
                                    <span>{distance} km away</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {detailRow('Plan Selected', booking.selectedPlan || 'Default')}
                        {detailRow('Date', booking.createdAt ? new Date(booking.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A')}
                        {detailRow('Service Type', booking.service?.businessType ? booking.service.businessType.toString().toUpperCase() : 'SERVICE')}
                        {detailRow('Customer Name', booking.customerName || booking.user?.name || 'Unknown')}
                        {detailRow('Customer Phone', ['completed', 'cancelled'].includes(booking.status) ? 'Hidden' : (booking.customerPhone || booking.user?.phone || 'Not provided'))}
                        {detailRow('Location', typeof booking.address === 'object' ? (`${booking.address?.street || ''}, ${booking.address?.city || ''}`.trim() || 'Standard') : (booking.address || 'Standard Location'))}

                        {booking.address?.googleMapLink && detailRow('Maps URL', <button onClick={() => {
                            let link = booking.address.googleMapLink;
                            if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link;
                            window.open(link, '_blank');
                        }} className="direction-btn">Direction Link 📍</button>)}

                        {(booking.address?.googleMapLink || (booking.address?.lat && booking.address?.lng)) && (
                            <div style={{ padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Interactive Map</span>
                                    <button onClick={() => {
                                        let link = (booking.address?.lat && booking.address?.lng) ? `https://www.google.com/maps/dir/?api=1&destination=${booking.address.lat},${booking.address.lng}` : booking.address?.googleMapLink;
                                        if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link;
                                        if (link) window.open(link, '_blank');
                                    }} className="direction-btn">
                                        Get Directions 📍
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="booking-detail-section">
                    <h4 className="section-label">
                        {role === 'provider' ? 'Customer Info' : 'Professional Info'}
                    </h4>
                    <div className="detail-user-card">
                        <img src={otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || otherUser?.username || 'U')}`} className="detail-avatar" alt="" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=U&background=ede9fe&color=4f46e5`; }} />
                        <div style={{ flex: 1 }}>
                            <h5 className="detail-username">{otherUser?.name || otherUser?.username || 'User'}</h5>
                            <p className="detail-user-role">{otherUser?.email || otherUser?.emailAddress || 'Contact via Message'}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onMessage(); }} className="detail-chat-btn" style={{ border: 'none', background: 'white', color: PC }}>
                            <MessageSquare size={20} />
                        </button>
                    </div>
                </div>

                {booking.status === 'completed' && (
                    <div style={{ marginTop: 12 }}>
                        <button onClick={() => navigate(`/invoice/${booking._id}`)} className="booking-btn booking-btn-muted" style={{ width: '100%', height: 56, gap: 10 }}>
                            <Download size={20} /> View & Download Invoice
                        </button>
                    </div>
                )}

                {role === 'provider' && booking.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                        <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking._id, 'confirmed'); }} className="booking-btn booking-btn-primary" style={{ height: 56 }}>Accept Order</button>
                        <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking._id, 'cancelled'); }} className="booking-btn booking-btn-danger" style={{ height: 56 }}>Decline</button>
                    </div>
                )}

                {role === 'provider' && booking.status === 'confirmed' && (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking._id, 'in_progress'); }} className="booking-btn booking-btn-primary" style={{ height: 56 }}>Start Service</button>
                        <button onClick={(e) => {
                            e.stopPropagation();
                            let link = (booking.address?.lat && booking.address?.lng) ? `https://www.google.com/maps/dir/?api=1&destination=${booking.address.lat},${booking.address.lng}` : (booking.address?.googleMapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${booking.address?.street || ''} ${booking.address?.city || ''} ${booking.address?.zipCode || ''}`.trim() || 'Customer Location')}`);
                            if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link;
                            window.open(link, '_blank');
                        }} className="booking-btn booking-btn-muted" style={{ height: 56, gap: 10 }}>
                            <MapPin size={20} /> Show Live Location
                        </button>
                    </div>
                )}

                {role === 'provider' && ['in_progress', 'revision_requested'].includes(booking.status) && (
                    <div style={{ marginTop: 12 }}>
                        <button onClick={(e) => { e.stopPropagation(); onDeliverClick(booking._id); }} className="booking-btn booking-btn-success" style={{ height: 56 }}>Deliver & Request Payment</button>
                    </div>
                )}

                {booking.revisions?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                        <button onClick={(e) => { e.stopPropagation(); onShowRevisions(booking); }} className="booking-btn booking-btn-muted" style={{ height: 56, gap: 10, background: '#f0f7ff', color: '#003d9b' }}>
                            <History size={20} /> View Revision History ({booking.revisions.length})
                        </button>
                    </div>
                )}
            </div>
        </Shell>
    );
}
