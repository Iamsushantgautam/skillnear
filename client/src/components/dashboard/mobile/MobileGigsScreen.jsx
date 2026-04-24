import React, { useState } from 'react';
import { Briefcase, Loader, Search, Edit3 } from 'lucide-react';
import { PC, PL, Shell, Badge } from './MobileDashboardShared';
import '../../../styles/mobile-dashboard-styles/MobileGigsScreen.css';

export default function MobileGigsScreen({
    filteredGigs, gigSearchQuery, setGigSearchQuery, gigTypeFilter, setGigTypeFilter,
    gigsLoading, setActiveTab, navigate, handleEditClick, providerStatus
}) {
    return (
        <Shell title="My Gigs" onBack={() => setActiveTab('overview')}
            headerRight={
                <button onClick={() => setActiveTab('services')} className="gigs-header-new-btn">
                    + New Gig
                </button>
            }>

            <div className="gigs-controls">
                <div className="gigs-search-wrapper">
                    <Search size={16} className="gigs-search-icon" />
                    <input
                        type="text"
                        placeholder="Search gigs..."
                        value={gigSearchQuery}
                        onChange={(e) => setGigSearchQuery(e.target.value)}
                        className="gigs-search-input"
                    />
                </div>
                <div className="gigs-filters-container no-scrollbar">
                    {[
                        { id: 'all', label: 'All Gigs' },
                        { id: 'service', label: 'Services' },
                        { id: 'shop', label: 'Shops' }
                    ].map(f => (
                        <button key={f.id} onClick={() => setGigTypeFilter(f.id)}
                            className={`gigs-filter-tab ${gigTypeFilter === f.id ? 'active' : 'inactive'}`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {gigsLoading ? (
                <div style={{ textAlign: 'center', padding: 48 }}><Loader size={28} color={PC} className="animate-spin" /></div>
            ) : filteredGigs.length === 0 ? (
                <div className="gigs-empty-state">
                    <Briefcase size={40} className="gigs-empty-icon" />
                    <p className="gigs-empty-msg">
                        {gigSearchQuery || gigTypeFilter !== 'all'
                            ? 'No matching gigs found.'
                            : (providerStatus === 'pending' ? 'Your account is pending review. You can still create gigs!' : 'No gigs yet')}
                    </p>
                    {gigSearchQuery || gigTypeFilter !== 'all' ? (
                        <button onClick={() => { setGigSearchQuery(''); setGigTypeFilter('all'); }} className="gigs-empty-action-btn gigs-empty-clear-btn">Clear Filters</button>
                    ) : (
                        <button onClick={() => setActiveTab('services')} className="gigs-empty-action-btn gigs-empty-create-btn">Create First Gig</button>
                    )}
                </div>
            ) : (
                <div className="gigs-list-container">
                    {filteredGigs.map(gig => {
                        const isLive = gig.isApproved && gig.isActive;
                        const stat = !gig.isApproved ? 'review' : isLive ? 'live' : 'rejected';
                        return (
                            <div key={gig._id} className="gig-item-card">
                                <div onClick={() => navigate(`/services/${gig._id}`)} className="gig-item-info-section">
                                    <img
                                        src={gig.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=f3f3fd&color=003d9b`}
                                        className="gig-item-thumb"
                                        alt=""
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=f3f3fd&color=003d9b`; }}
                                    />
                                    <div className="gig-item-details">
                                        <p className="gig-item-title">{gig.title}</p>
                                        <p className="gig-item-meta">₹{gig.price} · {gig.category}</p>
                                        <div className="gig-item-badge-wrapper"><Badge status={stat} /></div>
                                    </div>
                                </div>
                                <button onClick={() => handleEditClick?.(gig)} className="gig-item-edit-btn">
                                    <Edit3 size={16} color={PC} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </Shell>
    );
}
