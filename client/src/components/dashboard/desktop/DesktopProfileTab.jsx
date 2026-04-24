import React from 'react';
import { 
    User, 
    Briefcase, 
    MapPin, 
    Camera, 
    Lock, 
    BadgeCheck, 
    Check, 
    CheckCircle, 
    FileText, 
    History, 
    Phone, 
    ZoomIn, 
    Loader 
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../../../styles/desktop-dashboard-styles/DesktopProfileTab.css';

const DesktopProfileTab = ({
    user,
    profileAvatar,
    profileNameState,
    getAvatar,
    uploadingAvatar,
    handleAvatarUpload,
    providerTitle,
    setProviderTitle,
    providerAbout,
    setProviderAbout,
    profileUsername,
    setProfileUsername,
    profilePhone,
    setProfilePhone,
    setProfileNameState,
    handleSaveProfile,
    savingProfile,
    navigate
}) => {
    return (
        <div className="animate-fade-in profile-tab-container">
            {/* Header Section */}
            <div className="profile-header-section">
                <nav className="profile-breadcrumb">
                    Account / Account Settings
                </nav>
                <div className="profile-header-content">
                    <div>
                        <h2 className="profile-title">Profile Settings</h2>
                        <p className="profile-subtitle">Manage your professional identity and presence.</p>
                    </div>
                    <div className="header-actions">
                        <button
                            onClick={() => navigate(`/u/${profileUsername}`)}
                            className="btn-preview"
                        >
                            <ZoomIn size={16} />
                            Preview Mode
                        </button>
                        <button
                            onClick={handleSaveProfile}
                            disabled={savingProfile}
                            className="btn-save-profile"
                        >
                            {savingProfile ? <Loader size={16} className="animate-spin" /> : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Dashboard Layout: Bento Style */}
            <div className="profile-bento-grid">
                {/* Profile Image & Quick Info */}
                <div className="profile-sidebar">
                    {/* Modern User Card */}
                    <div className="profile-card">
                        {/* Header Banner */}
                        <div className="profile-card-banner">
                            <div className="banner-pattern"></div>
                        </div>
                        
                        <div className="profile-card-content">
                            <div className="profile-avatar-wrapper">
                                <div className="avatar-ring">
                                    <img
                                        src={getAvatar({ avatar: profileAvatar, name: profileNameState })}
                                        alt={profileNameState}
                                        className="profile-avatar-img"
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileNameState || 'U')}&background=ede9fe&color=4f46e5&size=120`; }}
                                    />
                                </div>
                                <div className="verified-check-badge">
                                    <Check size={14} strokeWidth={4} />
                                </div>
                            </div>
                            
                            <div className="profile-name-group">
                                <h3 className="profile-display-name">{profileNameState}</h3>
                                <span className={`role-tag ${user?.role === 'provider' ? 'role-tag-provider' : 'role-tag-user'}`}>
                                    {user?.role === 'provider' ? 'PRO' : 'USER'}
                                </span>
                            </div>
                            <p className="join-date">Joined {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                            
                            <label htmlFor="avatar-upload-bento" className="update-photo-label">
                                {uploadingAvatar ? <Loader size={18} className="animate-spin" /> : <Camera size={18} color="#64748b" />}
                                {uploadingAvatar ? 'Uploading...' : 'Update Profile Photo'}
                                <input id="avatar-upload-bento" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                            </label>
                        </div>
                    </div>

                    {/* Account Status Card */}
                    <div className="status-card">
                        <div className="status-card-header">
                            <div className="icon-bg-green"><BadgeCheck size={18} /></div>
                            <h4 className="status-card-title">Account Status</h4>
                        </div>
                        <div className="status-items-list">
                            <div className="status-row-item">
                                <div className="status-label-group">
                                    <div className="status-icon-box bg-indigo"><Lock size={16} /></div>
                                    <span className="status-value-text">Identity</span>
                                </div>
                                <div className="verified-label">VERIFIED</div>
                            </div>
                            <div className="status-row-item">
                                <div className="status-label-group">
                                    <div className="status-icon-box bg-green-soft"><div className="status-dot-pulse"></div></div>
                                    <span className="status-value-text">Status</span>
                                </div>
                                <div className="available-label">Available</div>
                            </div>
                        </div>
                    </div>

                    {/* Security Alert Card */}
                    <div className="security-alert-card">
                        <div className="security-bg-icon"><Lock size={100} /></div>
                        <div className="security-content">
                            <div className="security-header">
                                <div className="icon-bg-red"><Lock size={16} /></div>
                                <h4 className="security-title">Security Tip</h4>
                            </div>
                            <p className="security-text">
                                Protect your account by regularly updating your password and never sharing your OTP.
                            </p>
                            <button 
                                onClick={() => toast.info('Password reset link sent to your email')}
                                className="btn-update-password"
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>

                {/* Form Area */}
                <div className="profile-main-content">
                    {/* Personal Info Section */}
                    <section className="info-form-section">
                        <div className="section-header">
                            <div className="section-icon-box"><User size={20} /></div>
                            <h3 className="section-title">Personal Information</h3>
                        </div>
                        <p className="section-desc">Update your basic profile information and contact details.</p>

                        <div className="form-grid">
                            <div className="form-field-group">
                                <label className="field-label">Full Name</label>
                                <div className="input-wrapper">
                                    <div className="input-icon"><User size={18} /></div>
                                    <input
                                        className="profile-input"
                                        type="text"
                                        value={profileNameState}
                                        onChange={e => setProfileNameState(e.target.value)}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <span className="field-hint">Displayed on your public profile</span>
                            </div>
                            <div className="form-field-group">
                                <label className="field-label">Username</label>
                                <div className="input-wrapper">
                                    <div className="input-icon-at">@</div>
                                    <input
                                        className="profile-input"
                                        type="text"
                                        value={profileUsername}
                                        onChange={e => setProfileUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                        placeholder="Choose a unique handle"
                                    />
                                </div>
                                <span className="field-hint">Used for your unique profile URL</span>
                            </div>
                            <div className="form-field-group">
                                <label className="field-label">Email Address</label>
                                <div className="input-wrapper">
                                    <div className="input-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 4 10 8 10-8"/></svg>
                                    </div>
                                    <input
                                        className="profile-input profile-input-readonly"
                                        type="email"
                                        value={user?.email}
                                        readOnly
                                    />
                                    <div className="verified-badge-inline">
                                        <CheckCircle size={14} /> Verified
                                    </div>
                                </div>
                                <span className="field-hint">Contact support to change email</span>
                            </div>
                            <div className="form-field-group">
                                <label className="field-label">Phone Number</label>
                                <div className="input-wrapper">
                                    <div className="input-icon"><Phone size={18} /></div>
                                    <input
                                        className="profile-input"
                                        type="tel"
                                        value={profilePhone}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 10) setProfilePhone(val);
                                        }}
                                        placeholder="Enter 10-digit number"
                                    />
                                </div>
                                <span className="field-hint">Used for booking updates</span>
                            </div>
                        </div>
                    </section>

                    <section className="info-form-section">
                        <div className="section-header">
                            <div className="section-icon-box section-icon-box-yellow"><Briefcase size={20} /></div>
                            <h3 className="section-title">Professional Details</h3>
                        </div>
                        <p className="section-desc">Tell customers what you do and highlight your expertise.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="form-field-group">
                                <label className="field-label">Public Title / Headline</label>
                                <div className="input-wrapper">
                                    <div className="input-icon"><Briefcase size={18} /></div>
                                    <input
                                        className="profile-input"
                                        type="text"
                                        value={providerTitle}
                                        maxLength={25}
                                        onChange={e => setProviderTitle(e.target.value)}
                                        placeholder="e.g. Expert Home Stylist or Senior Electrician"
                                    />
                                </div>
                                <div className="input-char-count">
                                    <span className="field-hint">Appears below your name</span>
                                    <span className="char-limit">{providerTitle?.length || 0} / 25</span>
                                </div>
                            </div>
                            <div className="form-field-group">
                                <label className="field-label">About Me / Bio</label>
                                <div className="input-wrapper" style={{ display: 'block' }}>
                                    <div className="input-icon" style={{ top: '16px' }}><FileText size={18} /></div>
                                    <textarea
                                        className="profile-textarea"
                                        rows="3"
                                        value={providerAbout}
                                        maxLength={50}
                                        onChange={e => setProviderAbout(e.target.value)}
                                        placeholder="Describe your skills in 50 characters or less..."
                                    ></textarea>
                                </div>
                                <div className="input-char-count">
                                    <span className="field-hint">A short introduction to your services</span>
                                    <span className="char-limit">{providerAbout?.length || 0} / 50</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Activity Log Card */}
                    <section className="activity-log-card">
                        <div className="activity-log-info">
                            <div className="activity-icon-box">
                                <History size={24} color="#737685" />
                            </div>
                            <div>
                                <h4 className="activity-log-title">Activity Log</h4>
                                <p className="activity-log-desc">Review your recent login and profile activity.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => toast.info('Activity log feature coming soon')}
                            className="btn-view-logs"
                        >
                            View Logs
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default DesktopProfileTab;
