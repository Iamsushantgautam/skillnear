import React from 'react';
import { Loader, Edit3 } from 'lucide-react';
import { PC, PL, Shell } from './MobileDashboardShared';
import '../../../styles/mobile-dashboard-styles/MobileProfileScreen.css';

export default function MobileProfileScreen({ user, profileAvatar, getAvatar, profileName, setProfileName, profilePhone, setProfilePhone, profileUsername, setProfileUsername, providerTitle, providerAbout, providerTitleSetter, providerAboutSetter, handleSaveProfile, savingProfile, uploadingAvatar, handleAvatarUpload, role, setActiveTab }) {
    return (
        <Shell title="Edit Profile" onBack={() => setActiveTab('overview')}
            headerRight={
                <button onClick={handleSaveProfile} disabled={savingProfile}
                    style={{ background: 'white', color: PC, border: 'none', padding: '8px 20px', borderRadius: 9999, fontWeight: 800, fontSize: 13, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                    {savingProfile ? '...' : 'Save'}
                </button>
            }>

            <div className="profile-header-card">
                <div className="profile-avatar-container">
                    <div className="profile-avatar-ring"></div>
                    <img src={profileAvatar || getAvatar?.(user)} className="profile-avatar-img" alt="" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName || 'U')}&background=ede9fe&color=4f46e5&size=110`; }} />
                    <label htmlFor="mob-avatar-upload" className="profile-avatar-edit-btn">
                        {uploadingAvatar ? <Loader size={14} color="white" className="animate-spin" /> : <Edit3 size={16} color="white" />}
                    </label>
                    <input id="mob-avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                </div>
                <h4 style={{ margin: '16px 0 0', fontWeight: 900, fontSize: '1.2rem', color: '#1e293b' }}>{profileName || 'Your Name'}</h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{user?.email}</p>
            </div>

            <div className="profile-info-section">
                <h3 className="profile-section-title">Personal Information</h3>
                <div>
                    <label className="profile-label">Full Name</label>
                    <input value={profileName} onChange={e => setProfileName(e.target.value)} className="profile-input" placeholder="John Doe" />
                </div>
                <div>
                    <label className="profile-label">Username</label>
                    <input value={profileUsername} onChange={e => setProfileUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))} className="profile-input" placeholder="Choose a unique username" />
                    {profileUsername && (<p style={{ fontSize: 10, color: PC, fontWeight: 700, marginTop: 6, opacity: 0.8 }}>URL: {window.location.host}/u/{profileUsername}</p>)}
                </div>
                <div>
                    <label className="profile-label">Phone Number</label>
                    <input value={profilePhone} onChange={e => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) setProfilePhone(val); }} className="profile-input" placeholder="10 digit number" />
                </div>
            </div>

            <div className="profile-info-section">
                <h3 className="profile-section-title">Professional Info</h3>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label className="profile-label">Professional Title</label>
                        <span style={{ fontSize: 10, color: (providerTitle?.length || 0) >= 25 ? '#ef4444' : '#94a3b8', fontWeight: 700 }}>{providerTitle?.length || 0}/25</span>
                    </div>
                    <input value={providerTitle} onChange={e => providerTitleSetter(e.target.value)} maxLength={25} className="profile-input" placeholder="e.g. Master Electrician" />
                </div>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label className="profile-label">About Me / Bio</label>
                        <span style={{ fontSize: 10, color: (providerAbout?.length || 0) >= 50 ? '#ef4444' : '#94a3b8', fontWeight: 700 }}>{providerAbout?.length || 0}/50</span>
                    </div>
                    <textarea value={providerAbout} onChange={e => providerAboutSetter(e.target.value)} maxLength={50} rows={3} className="profile-input" style={{ resize: 'none' }} placeholder="Short bio (max 50 characters)" />
                </div>
            </div>

            <div className="profile-save-footer">
                <button onClick={handleSaveProfile} disabled={savingProfile} className="profile-save-btn">
                    {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
            </div>
        </Shell>
    );
}
