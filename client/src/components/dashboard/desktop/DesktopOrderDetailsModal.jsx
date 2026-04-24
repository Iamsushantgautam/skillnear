import React from 'react';
import { X, MapPin } from 'lucide-react';
import '../../../styles/desktop-dashboard-styles/DesktopOrderDetailsModal.css';

const DesktopOrderDetailsModal = ({ isOpen, onClose, booking }) => {
    if (!isOpen || !booking) return null;

    const handleGetDirections = () => {
        let link = (booking.address?.lat && booking.address?.lng)
            ? `https://www.google.com/maps/dir/?api=1&destination=${booking.address.lat},${booking.address.lng}`
            : booking.address?.googleMapLink;
        
        if (link) {
            if (!/^https?:\/\//i.test(link)) link = 'https://' + link;
            window.open(link, '_blank');
        }
    };

    return (
        <div className="desktop-modal-overlay">
            <div className="desktop-modal-container animate-scale-in no-scrollbar">
                <div className="order-modal-header">
                    <h3 className="order-modal-title">Order Details</h3>
                    <button onClick={onClose} className="order-modal-close">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="order-details-content">
                    <div className="order-summary-card">
                        <div className="summary-row">
                            <span className="summary-label">Total Price</span>
                            <span className="summary-value">₹{booking.price || booking.totalPrice || '0'}</span>
                        </div>
                        <div className="payment-badge">
                            <div className="status-dot"></div>
                            <span className="payment-method">{booking.paymentMethod || 'Wallet'}</span>
                        </div>
                    </div>

                    <div className="details-list">
                        <div className="detail-item">
                            <span className="detail-label">Service Type</span>
                            <span className="detail-value">{booking.service?.businessType ? booking.service.businessType.toString().toUpperCase() : 'SERVICE'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Date</span>
                            <span className="detail-value">{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Customer Name</span>
                            <span className="detail-value">{booking.customerName || booking.user?.name || 'Unknown'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Customer Phone</span>
                            <span className="detail-value">
                                {['completed', 'cancelled'].includes(booking.status) ? 'Hidden' : (booking.customerPhone || booking.user?.phone || 'Not provided')}
                            </span>
                        </div>
                        <div className="detail-item vertical">
                            <span className="detail-label">Location</span>
                            <span className="detail-value address-text">
                                {typeof booking.address === 'object' ? (`${booking.address?.street || ''}, ${booking.address?.city || ''}`.trim() || 'Standard') : (booking.address || 'Standard Location')}
                            </span>
                        </div>

                        {(booking.address?.googleMapLink || (booking.address?.lat && booking.address?.lng)) && (
                            <div className="directions-action">
                                <span className="detail-label">Interactive Map</span>
                                <button 
                                    onClick={handleGetDirections}
                                    className="directions-btn"
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
};

export default DesktopOrderDetailsModal;
