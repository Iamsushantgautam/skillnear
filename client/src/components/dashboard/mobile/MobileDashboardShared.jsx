// Shared constants and utility components used across all mobile dashboard screens
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import '../../../styles/mobile-dashboard-styles/MobileDashboardShared.css';

export const PC = '#003d9b';
export const PL = 'rgba(0,61,155,0.08)';

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
};

/* ─── Shared Shell layout wrapper ─── */
export function Shell({ title, onBack, children, headerRight }) {
    return (
        <div className="mobile-shell-container">
            <div className="mobile-shell-header">
                <div className="mobile-shell-header-content">
                    {onBack && (
                        <button onClick={onBack} className="mobile-shell-back-btn">
                            <ArrowLeft size={18} color="white" />
                        </button>
                    )}
                    <h1 className="mobile-shell-title">{title}</h1>
                    {headerRight}
                </div>
            </div>
            <div className="mobile-shell-main">{children}</div>
        </div>
    );
}

/* ─── Status Badge ─── */
export function Badge({ status }) {
    const map = {
        pending: { label: 'Awaiting Confirmation', className: 'badge-pending' },
        confirmed: { label: 'Confirmed', className: 'badge-confirmed' },
        in_progress: { label: 'In Progress', className: 'badge-in_progress' },
        delivered: { label: 'Delivered', className: 'badge-delivered' },
        completed: { label: 'Completed', className: 'badge-completed' },
        cancelled: { label: 'Cancelled', className: 'badge-cancelled' },
        live: { label: 'Live', className: 'badge-live' },
        rejected: { label: 'Rejected', className: 'badge-rejected' },
        review: { label: 'Review', className: 'badge-review' },
    };
    const { label, className } = map[status] || { label: status, className: '' };
    return (
        <span className={`mobile-badge ${className}`}>{label}</span>
    );
}
