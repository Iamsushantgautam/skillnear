import React from 'react';
import { Briefcase, ShoppingBag, Heart, ShoppingCart, Star, User, Search, MessageSquare, PlusCircle, ChevronRight, History } from 'lucide-react';
import { PC, PL } from './MobileDashboardShared';
import '../../../styles/mobile-dashboard-styles/MobileOverviewScreen.css';

export default function MobileOverviewScreen({ user, role, stats, myGigs, myBookings, profileAvatar, getAvatar, setActiveTab, navigate, providerTitle, providerAbout, onMenuClick, onShowRevisions }) {
    const pendingRevisions = (myBookings || []).filter(b => b.status === 'revision_requested');

    return (
        <>
            <section className="overview-header">
                <div className="overview-header-content">
                    <div className="overview-header-text">
                        <h2 className="overview-welcome-title">Hello, {user?.name?.split(' ')[0]}</h2>
                        {providerTitle && <p className="overview-provider-title">{providerTitle}</p>}
                        <p className="overview-provider-about">{providerAbout}</p>
                    </div>
                    <img src={profileAvatar || getAvatar?.(user)} alt="Profile" className="overview-profile-avatar" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ede9fe&color=4f46e5&size=80`; }} />
                </div>
            </section>

            <main className="overview-main">
                {/* Primary Stats Card */}
                <div className="overview-stats-card">
                    <div className="overview-stats-bg-circle"></div>
                    <p className="overview-stats-label">
                        {role === 'provider' ? 'Lifetime Earnings' : 'Total Invested'}
                    </p>
                    <div className="overview-stats-amount-row">
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <span className="overview-stats-currency">₹</span>
                            <h2 className="overview-stats-value">
                                {role === 'provider' ? (stats?.lifetimeEarnings?.toLocaleString() || 0) : (myBookings?.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.totalPrice || b.price || 0), 0).toLocaleString() || '0')}
                            </h2>
                        </div>
                        {role === 'provider' && (
                            <div style={{ textAlign: 'right' }}>
                                <p className="overview-available-label">Available</p>
                                <p className="overview-available-value">₹{((stats.totalEarnings || 0) - (stats.withdrawnAmount || 0) - (stats.pendingWithdrawnAmount || 0)).toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                    <div className="overview-stats-grid">
                        {[
                            { label: role === 'provider' ? 'Active Gigs' : 'Ongoing', value: role === 'provider' ? (myGigs?.length || 0) : (myBookings?.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status)).length || 0) },
                            { label: role === 'provider' ? 'Total Orders' : 'Completed', value: role === 'provider' ? (stats?.totalOrders || 0) : (myBookings?.filter(b => b.status === 'completed').length || 0) },
                            { label: 'Revisions', value: pendingRevisions.length }
                        ].map((s, i) => (
                            <div key={i} className="overview-stat-item">
                                <p className="overview-stat-item-label">{s.label}</p>
                                <p className="overview-stat-item-value">{s.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {role === 'customer' && (
                    <div onClick={() => setActiveTab('become_provider')} className="overview-become-provider-banner">
                        <div className="overview-banner-bg-icon"><Briefcase size={80} color="white" /></div>
                        <div className="overview-banner-icon-wrapper"><Briefcase size={24} color="white" /></div>
                        <div style={{ flex: 1 }}>
                            <h4 className="overview-banner-title">Become a Seller</h4>
                            <p className="overview-banner-desc">Start earning money by sharing your skills today!</p>
                        </div>
                        <ChevronRight size={20} color="white" />
                    </div>
                )}

                {/* Account Details Card */}
                <div style={{ background: 'white', borderRadius: 28, padding: 24, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 20px', color: '#1e293b' }}>Account Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 10, color: '#64748b', fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase' }}>Member Since</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>{user?.createdAt ? new Date(user.createdAt).getFullYear() : 2026}</p>
                        </div>
                        <div style={{ textAlign: 'center', borderLeft: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9' }}>
                            <p style={{ fontSize: 10, color: '#64748b', fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase' }}>Total Bookings</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>{myBookings?.length || 0}</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 10, color: '#64748b', fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase' }}>Account Status</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#22c55e', margin: 0 }}>Active</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h3 className="overview-section-title">Quick Actions</h3>
                    <section className="overview-quick-actions-grid">
                        {(role === 'provider' ? [
                            { icon: PlusCircle, label: 'Add New Gig', action: () => setActiveTab('services') },
                            { icon: ShoppingBag, label: 'My Gigs', tab: 'mygigs' },
                            { icon: Heart, label: 'Favorites', tab: 'favorites' },
                            { icon: ShoppingCart, label: 'Purchased Orders', tab: 'bookings' },
                            { icon: Star, label: 'My Reviews', tab: 'reviews' },
                            { icon: User, label: 'Profile Settings', tab: 'profile' },
                        ] : [
                            { icon: Search, label: 'Find Services', action: () => navigate('/services') },
                            { icon: Briefcase, label: 'My Bookings', tab: 'bookings' },
                            { icon: Heart, label: 'Favorites', tab: 'favorites' },
                            { icon: Star, label: 'My Reviews', tab: 'reviews' },
                            { icon: MessageSquare, label: 'Messages', tab: 'chat' },
                            { icon: User, label: 'Account', tab: 'profile' },
                        ]).map(({ icon: Icon, label, tab, action }, idx) => (
                            <button key={label} onClick={action || (() => setActiveTab(tab))} className="overview-action-btn">
                                <div className="overview-action-icon-wrapper" style={{ background: idx % 2 === 0 ? '#eff6ff' : '#f0fdf4' }}>
                                    <Icon size={24} color={idx % 2 === 0 ? '#3b82f6' : '#22c55e'} />
                                </div>
                                <h4 className="overview-action-label">{label}</h4>
                            </button>
                        ))}
                    </section>
                </div>

                {/* Recent Activity */}
                <div>
                    <div className="overview-recent-activity-header">
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Recent Activity</h3>
                        <button onClick={() => setActiveTab(role === 'provider' ? 'requests' : 'bookings')} className="overview-view-all-btn">View All</button>
                    </div>
                    <div className="overview-activity-list">
                        {myBookings?.length > 0 ? myBookings.slice(0, 3).map(b => (
                            <div key={b._id} onClick={() => setActiveTab(role === 'provider' ? 'requests' : 'bookings')} className="overview-activity-item">
                                <img src={b.service?.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.service?.title || 'S')}&background=eff6ff&color=3b82f6`} alt="" className="overview-activity-img" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=S&background=eff6ff&color=3b82f6`; }} />
                                <div className="overview-activity-info">
                                    <h4 className="overview-activity-title">{b.service?.title || 'Service Booking'}</h4>
                                    <p className="overview-activity-meta">{new Date(b.createdAt).toLocaleDateString()} • ₹{b.totalPrice || b.price}</p>
                                </div>
                                <div className="overview-activity-status" style={{ background: b.status === 'completed' ? '#f0fdf4' : (b.status === 'cancelled' || b.status === 'rejected' ? '#fef2f2' : '#eff6ff'), color: b.status === 'completed' ? '#16a34a' : (b.status === 'cancelled' || b.status === 'rejected' ? '#ef4444' : '#3b82f6') }}>
                                    {b.status}
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: 24, textAlign: 'center', background: 'white', borderRadius: 20, border: '1px solid #f1f5f9' }}>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>No recent activity to show.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pro Tip */}
                <div className="overview-pro-tip">
                    <div className="overview-pro-tip-icon-wrapper">
                        <Star size={20} fill="white" />
                    </div>
                    <div>
                        <h4 className="overview-pro-tip-title">Pro Tip!</h4>
                        <p className="overview-pro-tip-text">
                            {role === 'provider' ? 'Complete your profile to get 2x more visibility.' : 'Verified experts are 3x more likely to deliver quality.'}
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
