import React, { useState } from 'react';
import { Loader, Calendar as CalendarIcon, MapPin, MessageSquare, History } from 'lucide-react';
import { PC, PL, Shell, Badge } from './MobileDashboardShared';

export default function MobileOrdersScreen({ myBookings, bookingsLoading, setActiveTab, navigate, onSelectRoom, onSelectBooking, updateBookingStatus, onShowRevisions, onRequestRevision }) {
    const [bookingFilter, setBookingFilter] = useState('all');

    const filteredBookings = (myBookings || []).filter(b => {
        if (bookingFilter === 'all') return true;
        if (bookingFilter === 'pending') return b.status === 'pending';
        if (bookingFilter === 'confirmed') return b.status === 'confirmed';
        if (bookingFilter === 'in_progress') return ['in_progress', 'revision_requested', 'delivered'].includes(b.status);
        if (bookingFilter === 'completed') return b.status === 'completed';
        if (bookingFilter === 'cancelled') return ['cancelled', 'rejected'].includes(b.status);
        return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <Shell title="My Bookings" onBack={() => setActiveTab('overview')}>
            <div style={{ padding: '0 4px' }}>
                <div style={{ marginBottom: 32 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: PC, textTransform: 'uppercase', marginBottom: 8 }}>Your Orders</p>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 32, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
                    {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(filter => (
                        <button key={filter} onClick={() => setBookingFilter(filter)}
                            style={{ padding: '10px 24px', borderRadius: 9999, background: bookingFilter === filter ? PC : '#e7e7f2', color: bookingFilter === filter ? 'white' : '#434654', fontWeight: 700, fontSize: 13, border: 'none', whiteSpace: 'nowrap', transition: 'all 0.2s', boxShadow: bookingFilter === filter ? '0 10px 20px rgba(0,61,155,0.2)' : 'none' }}>
                            {filter.charAt(0).toUpperCase() + filter.slice(1).replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {bookingsLoading ? (
                        <div style={{ textAlign: 'center', padding: 48 }}><Loader size={28} color={PC} className="animate-spin" /></div>
                    ) : filteredBookings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: 24, border: '1px solid #f1f5f9' }}>
                            <p style={{ color: '#94a3b8' }}>No {bookingFilter === 'all' ? '' : bookingFilter} orders found</p>
                        </div>
                    ) : filteredBookings.map(b => {
                        const isCancelled = ['cancelled', 'rejected'].includes(b.status);
                        const isCompleted = b.status === 'completed';
                        return (
                            <div key={b._id} onClick={() => onSelectBooking(b)}
                                style={{ background: isCancelled ? '#f8fafc' : (isCompleted ? '#faf8ff' : 'white'), borderRadius: 24, padding: 24, boxShadow: (isCancelled || isCompleted) ? 'none' : '0 10px 30px rgba(0,0,0,0.03)', border: isCancelled ? '2px dashed #e2e8f0' : '1px solid rgba(195, 198, 214, 0.2)', opacity: isCancelled ? 0.7 : 1, filter: isCancelled ? 'grayscale(100%)' : 'none' }}>
                                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                    <img src={b.service?.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.service?.title || 'S')}&background=f3f3fd&color=003d9b`} style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'cover', flexShrink: 0, border: '1px solid #f1f5f9' }} alt="" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(b.service?.title || 'S')}&background=f3f3fd&color=003d9b`; }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}><Badge status={b.status} /></div>
                                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#191b23', marginBottom: 4, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.service?.title}</h3>
                                        <p style={{ fontSize: 14, color: '#434654', margin: 0, fontWeight: 500 }}>Provider: {b.provider?.name || 'Sushant'}</p>
                                        {!isCompleted && !isCancelled && b.provider?.phone && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                                <div style={{ background: '#f0fdf4', color: '#15803d', padding: '2px 6px', borderRadius: 6, fontSize: 9, fontWeight: 800 }}>CALL</div>
                                                <p style={{ fontSize: 12, color: '#64748b', margin: 0, fontWeight: 600 }}>{b.provider.phone}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748b' }}><CalendarIcon size={16} /><span style={{ fontSize: 12, fontWeight: 500 }}>{new Date(b.createdAt).toLocaleDateString()} | {b.slot || 'TBA'}</span></div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748b' }}><MapPin size={16} /><span style={{ fontSize: 12, fontWeight: 500 }}>{typeof b.address === 'object' ? (`${b.address?.street || ''}, ${b.address?.city || ''}`.trim() || 'Location TBA') : (b.address || 'Location TBA')}</span></div>
                                    </div>
                                    <p style={{ fontSize: 24, fontWeight: 900, color: PC, margin: 0 }}>₹{b.price || b.totalPrice || '0'}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <button onClick={(e) => { e.stopPropagation(); onSelectBooking(b); }} style={{ width: '100%', height: 44, padding: '12px 0', border: '1px solid rgba(115, 118, 133, 0.2)', borderRadius: 16, color: '#434654', background: '#f8f9fc', fontWeight: 800, fontSize: 12 }}>View Details</button>
                                    <div style={{ display: 'grid', gridTemplateColumns: (b.status === 'delivered' || b.status === 'completed' || b.status === 'confirmed') ? '1fr 1fr' : '1fr', gap: 12 }}>
                                        {b.status === 'delivered' ? (
                                            <>
                                                <button onClick={(e) => { e.stopPropagation(); onRequestRevision(b); }} style={{ padding: '12px 0', height: 44, borderRadius: 16, background: '#e1e2ec', color: '#191b23', border: 'none', fontWeight: 800, fontSize: 12 }}>Request Revision</button>
                                                <button onClick={(e) => { e.stopPropagation(); onCompleteClick(b); }} style={{ padding: '12px 0', height: 44, borderRadius: 16, background: '#0052cc', color: 'white', border: 'none', fontWeight: 800, fontSize: 12 }}>Accept & Complete</button>
                                            </>
                                        ) : b.status === 'confirmed' ? (
                                            <>
                                                <button onClick={(e) => { e.stopPropagation(); onSelectRoom({ roomId: b._id, otherUser: b.provider }); }} style={{ padding: '12px 0', height: 44, borderRadius: 16, background: '#e1e2ec', color: '#191b23', border: 'none', fontWeight: 800, fontSize: 12 }}>Message</button>
                                                <button onClick={(e) => { e.stopPropagation(); onAcceptClick(b); }} style={{ padding: '12px 0', height: 44, borderRadius: 16, background: '#0052cc', color: 'white', border: 'none', fontWeight: 800, fontSize: 12 }}>Confirm & Pay</button>
                                            </>
                                        ) : b.status === 'completed' ? (
                                            <>
                                                <button onClick={(e) => { e.stopPropagation(); navigate(`/invoice/${b._id}`); }} style={{ padding: '12px 0', height: 44, borderRadius: 16, background: '#e1e2ec', color: '#191b23', border: 'none', fontWeight: 800, fontSize: 12 }}>View Receipt</button>
                                                <button onClick={(e) => { e.stopPropagation(); navigate(`/services/${b.service?._id || b.service}`); }} style={{ padding: '12px 0', height: 44, borderRadius: 16, background: '#0052cc', color: 'white', border: 'none', fontWeight: 800, fontSize: 12 }}>Rate Professional</button>
                                            </>
                                        ) : (
                                            <button onClick={(e) => { e.stopPropagation(); onSelectRoom({ roomId: b._id, otherUser: b.provider }); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, padding: '12px 0', border: `1.5px solid ${PL}`, borderRadius: 16, color: PC, background: 'white', fontWeight: 800, fontSize: 12 }}>
                                                <MessageSquare size={16} /> Message Provider
                                            </button>
                                        )}
                                    </div>
                                    {b.revisions?.length > 0 && (
                                        <button onClick={(e) => { e.stopPropagation(); onShowRevisions(b); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', border: 'none', borderRadius: 16, color: '#003d9b', background: '#f0f7ff', fontWeight: 800, fontSize: 12, marginTop: 4 }}>
                                            <History size={16} /> View Revision History ({b.revisions.length})
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ marginTop: 48, marginBottom: 16, padding: 32, borderRadius: 32, background: '#0052cc', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <h4 style={{ color: 'white', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Need Help?</h4>
                        <p style={{ color: '#c4d2ff', fontSize: 14, lineHeight: 1.5, marginBottom: 24, maxWidth: 200 }}>Our support team is available 24/7 for booking disputes.</p>
                        <button onClick={() => setActiveTab('help')} style={{ padding: '8px 24px', background: 'white', color: PC, fontWeight: 800, fontSize: 14, borderRadius: 9999, border: 'none' }}>Contact Support</button>
                    </div>
                </div>
            </div>
        </Shell>
    );
}
