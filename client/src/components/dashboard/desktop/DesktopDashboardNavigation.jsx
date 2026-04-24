import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Home, 
    BarChart, 
    Inbox, 
    MessageSquare, 
    Star, 
    User, 
    Briefcase, 
    Heart, 
    HelpCircle, 
    Settings, 
    Wallet, 
    Calendar as CalendarIcon, 
    LogOut 
} from 'lucide-react';
import '../../../styles/desktop-dashboard-styles/DesktopDashboardNavigation.css';

const DesktopDashboardNavigation = ({
    user,
    role,
    activeTab,
    setActiveTab,
    bookingRequests,
    providerStatus,
    resetGigForm,
    handleLogout,
    getAvatar
}) => {
    const navigate = useNavigate();

    const renderCustomerTabs = () => (
        <div className="sidebar-nav">
            <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => navigate('/')}>
                <Home size={22} strokeWidth={1.5} /> Home
            </button>
            <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                <BarChart size={22} strokeWidth={1.5} /> Overview
            </button>
            <button className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                <Inbox size={22} strokeWidth={1.5} /> My Bookings
            </button>
            <button className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
                <MessageSquare size={22} strokeWidth={1.5} /> Messages
            </button>
            <button className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
                <Star size={22} strokeWidth={1.5} /> Reviews
            </button>
            <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                <User size={22} strokeWidth={1.5} /> Profile
            </button>
            <button className={`nav-item ${activeTab === 'become_provider' ? 'active' : ''}`} onClick={() => setActiveTab('become_provider')}>
                <Briefcase size={22} strokeWidth={1.5} /> Become a Seller
            </button>
            <button className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>
                <Heart size={22} strokeWidth={1.5} /> Favorites
            </button>
            <button className={`nav-item ${activeTab === 'help' ? 'active' : ''}`} onClick={() => setActiveTab('help')}>
                <HelpCircle size={22} strokeWidth={1.5} /> Help & Support
            </button>
            {user?.role === 'admin' && (
                <button className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
                    <Settings size={22} strokeWidth={1.5} /> Admin Panel
                </button>
            )}
        </div>
    );

    const renderProviderTabs = () => (
        <div className="sidebar-nav">
            {providerStatus === 'pending' && (
                <div className="pending-status-label">
                    Pending Approval
                </div>
            )}
            <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => navigate('/')}>
                <Home size={22} strokeWidth={1.5} /> Home
            </button>
            <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                <BarChart size={22} strokeWidth={1.5} /> Overview
            </button>
            <button className={`nav-item ${activeTab === 'mygigs' ? 'active' : ''}`} onClick={() => setActiveTab('mygigs')}>
                <Briefcase size={22} strokeWidth={1.5} /> My Gigs
            </button>
            <button className={`nav-item ${activeTab === 'services' ? 'active' : ''}`} onClick={() => { resetGigForm(); setActiveTab('services'); }}>
                <Settings size={22} strokeWidth={1.5} /> Add New Gig
            </button>
            <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                <User size={22} strokeWidth={1.5} /> Profile
            </button>
            <button className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
                <Inbox size={22} strokeWidth={1.5} /> Booking Requests
                {bookingRequests.filter(r => r.status === 'pending').length > 0 && (
                    <span className="nav-badge">
                        {bookingRequests.filter(r => r.status === 'pending').length}
                    </span>
                )}
            </button>
            {user?.role === 'provider' && (
                <button className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
                    <Wallet size={22} strokeWidth={1.5} /> Payments
                </button>
            )}
            <button className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                <CalendarIcon size={22} strokeWidth={1.5} /> My Orders (Purchased)
            </button>
            <button className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>
                <Heart size={22} strokeWidth={1.5} /> Favorites
            </button>
            <button className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
                <MessageSquare size={22} strokeWidth={1.5} /> Messages
            </button>
            <button className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
                <Star size={22} strokeWidth={1.5} /> Reviews
            </button>
            <button className={`nav-item ${activeTab === 'help' ? 'active' : ''}`} onClick={() => setActiveTab('help')}>
                <HelpCircle size={22} strokeWidth={1.5} /> Help & Support
            </button>
            {user?.role === 'admin' && (
                <button className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
                    <Settings size={22} strokeWidth={1.5} /> Admin Panel
                </button>
            )}
        </div>
    );

    return (
        <aside className="desktop-sidebar">
            <div className="sidebar-brand">
                <h1 className="brand-name">SkillNear</h1>
                <p className="brand-tagline">Your Trusted Platform for Local Services</p>
            </div>

            <nav className="no-scrollbar sidebar-nav">
                {role === 'customer' ? renderCustomerTabs() : renderProviderTabs()}
            </nav>

            <div className="sidebar-footer">
                <div className="footer-content">
                    <img
                        src={getAvatar(user)}
                        alt={user?.name}
                        className="footer-avatar"
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ede9fe&color=4f46e5`; }}
                    />
                    <div className="footer-user-info">
                        <span className="footer-username">{user?.name || 'User'}</span>
                        <span className="footer-view-profile" onClick={() => setActiveTab('profile')}>View Profile</span>
                    </div>
                    <div className="footer-logout-wrapper">
                        <button 
                            onClick={handleLogout}
                            className="footer-logout-btn"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default DesktopDashboardNavigation;
