import React from 'react';
import { 
    Briefcase, 
    ChevronRight, 
    CheckCircle, 
    BadgeCheck, 
    ArrowUpRight, 
    MessageSquare, 
    Star, 
    DollarSign, 
    Wallet,
    TrendingUp,
    Award,
    Calendar as CalendarIcon,
    PackageOpen
} from 'lucide-react';
import '../../../styles/desktop-dashboard-styles/DesktopOverviewTab.css';

const DesktopOverviewTab = ({
    user,
    role,
    profileAvatar,
    profileName,
    getAvatar,
    setActiveTab,
    providerTitle,
    providerAbout,
    myBookings,
    myGigs,
    stats,
    isStatsLoading
}) => {
    if (isStatsLoading && (!stats?.chartData || stats.chartData.length === 0)) {
        return (
            <div className="overview-container skeleton-container">
                <section className="bio-card">
                    <div className="header-banner"><div className="header-pattern"></div></div>
                    <div className="profile-content">
                        <div className="avatar-container">
                            <div className="avatar-wrapper">
                                <div className="skeleton skeleton-circle" style={{ width: '120px', height: '120px' }}></div>
                            </div>
                        </div>
                        <div className="info-section">
                            <div className="skeleton skeleton-title" style={{ width: '200px' }}></div>
                            <div className="skeleton skeleton-text" style={{ width: '150px' }}></div>
                            <div className="skeleton skeleton-text" style={{ width: '80%', height: '40px', marginTop: '12px' }}></div>
                        </div>
                    </div>
                </section>

                <section className="quick-status-card">
                    <div className="skeleton skeleton-title" style={{ width: '150px' }}></div>
                    <div className="skeleton skeleton-text" style={{ height: '100px', marginTop: '20px' }}></div>
                </section>

                <div className="quick-links-grid">
                    <div className="action-card skeleton"><div className="skeleton-text" style={{ height: '120px' }}></div></div>
                    <div className="action-card skeleton"><div className="skeleton-text" style={{ height: '120px' }}></div></div>
                </div>

                <section className="snapshot-section" style={{ background: '#1e293b' }}>
                    <div className="skeleton" style={{ width: '100%', height: '300px', borderRadius: '32px' }}></div>
                </section>
            </div>
        );
    }

    return (
        <div id="account-settings-section" className="animate-fade-in overview-container">
            {/* Main Bio & Avatar Card */}
            <section className="bio-card">
                {/* Header Banner */}
                <div className="header-banner">
                    <div className="header-pattern"></div>
                </div>
                
                <div className="profile-content">
                    {/* Avatar Section */}
                    <div className="avatar-container">
                        <div className="avatar-wrapper">
                            <img
                                src={getAvatar({ avatar: profileAvatar, name: profileName })}
                                alt={user?.name}
                                className="avatar-img"
                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName || 'U')}&background=ede9fe&color=4f46e5&size=120`; }}
                            />
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="info-section">
                        <div className="name-row">
                            <div>
                                <div className="name-badge-group">
                                    <h3 className="profile-name">{user?.name}</h3>
                                    <span className={`role-badge ${role === 'provider' ? 'role-provider' : 'role-customer'}`}>
                                        {role === 'provider' ? 'TOP RATED PRO' : 'VERIFIED CUSTOMER'}
                                    </span>
                                </div>
                                <p className="provider-title">
                                    {providerTitle || (role === 'provider' ? 'Professional Service Provider' : 'SkillNear Member')}
                                </p>
                            </div>
                            <button onClick={() => setActiveTab('profile')} className="edit-profile-btn">
                                Edit Profile
                            </button>
                        </div>
                        
                        <p className="profile-about">
                            {providerAbout || (role === 'provider' ? 'Expert skills dedicated to delivering high-quality results. Open to custom projects and long-term collaborations.' : 'Valued member of the SkillNear community. Dedicated to supporting local experts and quality services.')}
                        </p>

                        {/* Stats Bar */}
                        {/* Stats Bar */}
                        <div className="stats-bar">
                            {(role === 'provider' ? [
                                { label: 'Response Rate', value: '98%', icon: TrendingUp, color: '#003d9b', bg: '#eff6ff' },
                                { label: 'Experience', value: `${user?.providerDetails?.experienceYears || 0} Yrs`, icon: Award, color: '#059669', bg: '#ecfdf5' },
                                { label: 'Rating', value: '4.9', icon: Star, color: '#d97706', bg: '#fffbeb', isRating: true }
                            ] : [
                                { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).getFullYear() : 2024, icon: CalendarIcon, color: '#003d9b', bg: '#eff6ff' },
                                { label: 'Total Bookings', value: (myBookings || []).length, icon: PackageOpen, color: '#7c3aed', bg: '#f5f3ff' },
                                { label: 'Account Status', value: 'Active', icon: CheckCircle, color: '#059669', bg: '#ecfdf5', isStatus: true }
                            ]).map((stat, i) => (
                                <div key={i} className="stat-card-new">
                                    <div className="stat-icon-mini" style={{ backgroundColor: stat.bg, color: stat.color }}>
                                        <stat.icon size={16} fill={stat.isRating ? stat.color : 'none'} />
                                    </div>
                                    <div className="stat-details">
                                        <span className="stat-label-new">{stat.label}</span>
                                        <div className="stat-value-row">
                                            <span className="stat-value-new">{stat.value}</span>
                                            {stat.isStatus && <div className="status-dot-mini"></div>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Right Side Column for Row 1 */}
            {role === 'customer' && (
                <section 
                    onClick={() => setActiveTab('become_provider')}
                    className="become-provider-card"
                >
                    <div className="card-bg-icon">
                        <Briefcase size={160} />
                    </div>
                    <h3 className="card-title-large">Level Up & Join<br/>as a Seller</h3>
                    <p className="card-desc">
                        Unlock professional features, reach local customers, and start earning by offering your services today.
                    </p>
                    <div className="card-action-btn">
                        Start Selling Now <ChevronRight size={18} />
                    </div>
                </section>
            )}

            {role === 'provider' && (
                <section className="quick-status-card">
                    <div className="card-header">
                        <div className="icon-bg-blue"><CheckCircle size={18} /></div>
                        <h4 className="header-title">Quick Status</h4>
                    </div>
                    
                    <div className="status-container">
                        <div className="status-item">
                            <span className="status-label">Identity</span>
                            <span className="verified-badge">
                                <BadgeCheck size={14} /> Verified
                            </span>
                        </div>
                        <div className="gigs-status-box">
                            <div className="gigs-header">
                                <span className="status-label">Active Gigs</span>
                                <div className="gig-badge">{(myGigs || []).length}</div>
                            </div>
                            {(myGigs || []).length > 0 ? (
                                <div className="gigs-list">
                                    {(myGigs || []).slice(0, 2).map((gig, idx) => (
                                        <div key={idx} className="gig-item">
                                            <div className={`gig-dot ${gig.isApproved ? 'gig-dot-active' : 'gig-dot-pending'}`}></div>
                                            <span className="gig-name">{gig.title}</span>
                                        </div>
                                    ))}
                                    {(myGigs || []).length > 2 && <span className="more-gigs">+ {(myGigs || []).length - 2} more gigs</span>}
                                </div>
                            ) : (
                                <div className="empty-gigs">
                                    <p className="empty-text">No gigs posted yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Quick Links / Actions */}
            {role === 'provider' && (
                <div className="quick-links-grid">
                    <div 
                        onClick={() => setActiveTab('mygigs')} 
                        className="action-card"
                    >
                        <div className="action-header">
                            <div className="icon-box bg-blue-soft">
                                <Briefcase size={28} />
                            </div>
                            <div className="arrow-box">
                                <ArrowUpRight size={20} />
                            </div>
                        </div>
                        <div className="action-info">
                            <h4>Manage Gigs</h4>
                            <p>Create new listings, edit active services, and manage your portfolio.</p>
                        </div>
                    </div>

                    <div 
                        onClick={() => setActiveTab('chat')} 
                        className="action-card"
                    >
                        <div className="action-header">
                            <div className="icon-box bg-purple-soft">
                                <MessageSquare size={28} />
                            </div>
                            <div className="arrow-box">
                                <ArrowUpRight size={20} />
                                <div className="notification-dot"></div>
                            </div>
                        </div>
                        <div className="action-info">
                            <h4>Client Messages</h4>
                            <p>Respond to inquiries, negotiate pricing, and finalize bookings directly.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Quick Links */}
            {role === 'customer' && (
                <div className="quick-links-grid">
                    <div 
                        onClick={() => setActiveTab('bookings')} 
                        className="action-card"
                    >
                        <div className="action-header">
                            <div className="icon-box bg-green-soft">
                                <Briefcase size={28} />
                            </div>
                            <div className="arrow-box">
                                <ArrowUpRight size={20} />
                            </div>
                        </div>
                        <div className="action-info">
                            <h4>My Bookings</h4>
                            <p>Track your active service requests and past completed jobs.</p>
                        </div>
                    </div>

                    <div 
                        onClick={() => setActiveTab('chat')} 
                        className="action-card"
                    >
                        <div className="action-header">
                            <div className="icon-box bg-purple-soft">
                                <MessageSquare size={28} />
                            </div>
                            <div className="arrow-box">
                                <ArrowUpRight size={20} />
                                <div className="notification-dot"></div>
                            </div>
                        </div>
                        <div className="action-info">
                            <h4>Provider Chats</h4>
                            <p>Message professionals to discuss details before or after booking.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Earnings Snapshot Widget */}
            {role === 'provider' && (
                <section className="snapshot-section">
                    <div className="gradient-overlay-right"></div>
                    
                    <div className="snapshot-info">
                        <div className="snapshot-header">
                            <div className="snapshot-icon-bg bg-blue-transparent"><DollarSign size={20} /></div>
                            <h3 className="snapshot-title">Earnings Snapshot</h3>
                        </div>
                        <p className="snapshot-text">
                            Your professional performance has increased by <span style={{ color: '#38bdf8', fontWeight: 800 }}>12.4%</span> this month. Keep up the excellent work!
                        </p>
                        <div className="snapshot-stats-row">
                            <div className="snapshot-stat-card">
                                <p className="snapshot-stat-label">Total Earned</p>
                                <p className="snapshot-stat-value">₹{(stats?.lifetimeEarnings || 0).toLocaleString()}</p>
                            </div>
                            <div className="snapshot-stat-card snapshot-stat-card-active">
                                <p className="snapshot-stat-label snapshot-stat-label-active">Pending Orders</p>
                                <p className="snapshot-stat-value">{stats?.pendingOrders || 0}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="chart-container">
                        {stats?.chartData?.length > 0 ? stats.chartData.map((d, i) => {
                            const maxEarnings = Math.max(...stats.chartData.map(x => x.earnings)) || 1;
                            const percentage = (d.earnings / maxEarnings) * 100;
                            const isCurrentMonth = i === stats.chartData.length - 1;
                            return (
                                <div key={i} className="chart-col">
                                    <div className="chart-value" style={{ color: d.earnings > 0 ? '#38bdf8' : '#64748b', opacity: d.earnings > 0 ? 1 : 0.5 }}>
                                        ₹{d.earnings >= 1000 ? (d.earnings/1000).toFixed(1) + 'k' : d.earnings}
                                    </div>
                                    <div className="chart-bar" style={{ backgroundColor: d.earnings > 0 ? (isCurrentMonth ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)') : 'rgba(255,255,255,0.05)', height: `${Math.max(4, percentage)}%`, border: d.earnings === 0 ? '1px dashed rgba(255,255,255,0.1)' : 'none', borderBottom: 'none' }}></div>
                                    <div className="chart-label" style={{ fontWeight: isCurrentMonth ? 800 : 600, color: isCurrentMonth ? 'white' : '#94a3b8' }}>
                                        {d.name}
                                    </div>
                                </div>
                            );
                        }) : [40, 60, 30, 90, 50, 75].map((h, i) => (
                            <div key={i} className="chart-col">
                                <div className="chart-bar" style={{ backgroundColor: i === 5 ? '#38bdf8' : 'rgba(255,255,255,0.05)', height: `${h}%`, border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none' }}></div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Customer Insights Widget */}
            {role === 'customer' && (
                <section className="snapshot-section">
                    <div className="gradient-overlay-left"></div>
                    
                    <div className="snapshot-info">
                        <div className="snapshot-header">
                            <div className="snapshot-icon-bg bg-green-transparent"><Wallet size={20} /></div>
                            <h3 className="snapshot-title">Spending & Activity</h3>
                        </div>
                        <p className="snapshot-text">
                            Track your SkillNear investments. You have <span style={{ color: '#10b981', fontWeight: 800 }}>{(myBookings || []).filter(b => b.status === 'completed').length}</span> completed projects!
                        </p>
                        <div className="snapshot-stats-row">
                            <div className="snapshot-stat-card">
                                <p className="snapshot-stat-label">Total Invested</p>
                                <p className="snapshot-stat-value">₹{(myBookings || []).filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.totalPrice || b.price || 0), 0).toLocaleString()}</p>
                            </div>
                            <div className="snapshot-stat-card snapshot-stat-card-success">
                                <p className="snapshot-stat-label snapshot-stat-label-success">Active Services</p>
                                <p className="snapshot-stat-value">{(myBookings || []).filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status)).length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="collaborations-container">
                        <div className="collaborations-header">
                            <h4 className="header-title" style={{ color: 'white' }}>Recent Collaborations</h4>
                            <button onClick={() => setActiveTab('bookings')} className="view-all-btn">View All</button>
                        </div>
                        {(myBookings || []).slice(0, 3).map((b, i) => (
                            <div key={i} className="collaboration-item">
                                <img src={b?.service?.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop'} alt="" className="collab-img" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop'; }} />
                                <div className="collab-info">
                                    <h5 className="collab-title">{b?.service?.title || 'Service Booking'}</h5>
                                    <p className="collab-date">{b?.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div className="collab-meta">
                                    <p className="collab-price">₹{b?.totalPrice || b?.price || 0}</p>
                                    <span className="collab-status" style={{ color: b?.status === 'completed' ? '#10b981' : (b?.status === 'cancelled' || b?.status === 'rejected' ? '#ef4444' : '#38bdf8') }}>{b?.status || 'pending'}</span>
                                </div>
                            </div>
                        ))}
                        {(myBookings || []).length === 0 && (
                            <div className="empty-collabs">
                                <p style={{ margin: 0, fontWeight: 600 }}>No bookings yet.</p>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};

export default DesktopOverviewTab;
