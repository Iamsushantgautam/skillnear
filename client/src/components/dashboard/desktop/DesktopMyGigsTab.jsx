import React from 'react';
import { 
    Search, 
    Briefcase, 
    Edit, 
    Trash2 
} from 'lucide-react';
import '../../../styles/desktop-dashboard-styles/DesktopMyGigsTab.css';

const DesktopMyGigsTab = ({
    myGigs,
    gigsLoading,
    gigSearchQuery,
    setGigSearchQuery,
    gigTypeFilter,
    setGigTypeFilter,
    filteredGigs,
    handleEditClick,
    handleDeleteGig,
    setActiveTab,
    providerStatus,
    user
}) => {
    return (
        <div className="mygigs-container animate-fade-in">
            {/* Search and Filters */}
            <div className="mygigs-filter-bar">
                <div className="mygigs-search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by title or category..." 
                        className="mygigs-search-input"
                        value={gigSearchQuery}
                        onChange={(e) => setGigSearchQuery(e.target.value)}
                    />
                </div>
                <div className="type-filter-pills">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'service', label: 'Services' },
                        { id: 'shop', label: 'Shops' }
                    ].map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setGigTypeFilter(filter.id)}
                            className={`pill-button ${gigTypeFilter === filter.id ? 'active' : ''}`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Status legend */}
            <div className="status-legend">
                {[
                    { label: '🟡 Pending', bg: '#fef3c7', color: '#92400e' },
                    { label: '🟢 Live', bg: '#d1fae5', color: '#065f46' },
                    { label: '🔴 Rejected', bg: '#fee2e2', color: '#991b1b' }
                ].map((item, idx) => (
                    <span 
                        key={idx} 
                        className="legend-item" 
                        style={{ backgroundColor: item.bg, color: item.color }}
                    >
                        {item.label}
                    </span>
                ))}
            </div>

            {gigsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading your gigs…</div>
            ) : filteredGigs.length === 0 ? (
                <div className="empty-state">
                    <Briefcase size={40} className="empty-state-icon" />
                    <p style={{ color: '#64748b', marginBottom: '16px' }}>
                        {gigSearchQuery || gigTypeFilter !== 'all' 
                            ? 'No gigs found matching your filters.' 
                            : (providerStatus === 'pending'
                                ? 'Your provider account is pending approval. You can start submitting gigs — they will go live once you are approved.'
                                : "You haven't created any gigs yet.")}
                    </p>
                    {(gigSearchQuery || gigTypeFilter !== 'all') ? (
                        <button className="btn-primary" onClick={() => { setGigSearchQuery(''); setGigTypeFilter('all'); }}>Clear Filters</button>
                    ) : (
                        <button className="btn-primary" onClick={() => setActiveTab('services')}>Create First Gig</button>
                    )}
                </div>
            ) : (
                <div className="gigs-list">
                    {filteredGigs.map(gig => {
                        const isLive = gig.isApproved && gig.isActive;
                        const isPending = !gig.isApproved;
                        const isRejected = !gig.isApproved && !gig.isActive && gig.updatedAt !== gig.createdAt;

                        let statusLabel = isPending ? '⏳ Pending Review' : isLive ? '✅ Live' : '❌ Rejected';
                        let statusBg = isPending ? '#fef3c7' : isLive ? '#d1fae5' : '#fee2e2';
                        let statusColor = isPending ? '#92400e' : isLive ? '#065f46' : '#991b1b';

                        return (
                            <div key={gig._id} className="gig-card-mini" style={{ border: `1.5px solid ${isPending ? '#fde68a' : isLive ? '#6ee7b7' : '#fca5a5'}` }}>
                                {/* Thumbnail */}
                                <img
                                    src={gig.images?.[0] || (user?.avatar && user.avatar.startsWith('http') ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || gig.title)}&background=ede9fe&color=4f46e5&size=60`)}
                                    alt={gig.title}
                                    className="gig-thumb-mini"
                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || gig.title)}&background=ede9fe&color=4f46e5&size=60`; }}
                                />
                                <div className="gig-card-content">
                                    <div className="gig-card-header">
                                        <div>
                                            <div className="gig-card-title">{gig.title}</div>
                                            <div className="gig-card-meta">
                                                {gig.category} · ₹{gig.price} / {gig.priceType}
                                                {gig.location?.city && ` · ${gig.location.city}`}
                                            </div>
                                        </div>
                                        <span className="status-badge" style={{ backgroundColor: statusBg, color: statusColor }}>
                                            {statusLabel}
                                        </span>
                                    </div>
                                    {gig.description && (
                                        <p className="gig-card-desc">
                                            {gig.description}
                                        </p>
                                    )}
                                    <div className="gig-card-date">
                                        Submitted: {new Date(gig.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="gig-card-actions">
                                    <button
                                        onClick={() => handleEditClick(gig)}
                                        className="action-btn-circle"
                                        title="Edit Gig"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteGig(gig._id)}
                                        className="action-btn-circle delete"
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
    );
};

export default DesktopMyGigsTab;
