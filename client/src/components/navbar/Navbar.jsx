import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, MapPin, ChevronDown, X, LocateFixed, Info, Mail, Shield, FileText, LogOut, Zap, Award, Bell, Trash } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useNotificationStore from '../../store/useNotificationStore';
import api, { API_URL } from '../../utils/api';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';
import logo from '/favicon.png';

// Sub-components
import LocationModal from './LocationModal';
import NotificationMenu from './NotificationMenu';
import UserMenu from './UserMenu';
import MobileDrawer from './MobileDrawer';
import NavbarSearch from './NavbarSearch';

import '../../styles/Navbar.css';

const Navbar = () => {
    const { user, logout, userLocation, setLocation, updateUserInfo } = useAuthStore();
    const { notifications, unreadCount, fetchNotifications, addNotification, markAllAsRead } = useNotificationStore();
    const navigate = useNavigate();
    // Location Modal State
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Socket Setup for Notifications
    useEffect(() => {
        if (user) {
            fetchNotifications(user.token);

            const socket = io(API_URL);
            socket.emit('setup', user._id);

            socket.on('newNotification', (notif) => {
                addNotification(notif);
                toast(notif.title, {
                    icon: '🔔',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
            });

            return () => socket.disconnect();
        }
    }, [user]);

    // Close notifications on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchKeyword.trim()) {
            navigate(`/services?keyword=${encodeURIComponent(searchKeyword)}`);
        }
    };

    const getAvatar = (userData) => {
        if (userData?.avatar && userData.avatar.startsWith('http')) return userData.avatar;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || 'U')}&background=ede9fe&color=4f46e5&size=80`;
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };



    return (
        <nav className="navbar-main">
            <div className="container navbar-container">
                <div className="nav-left">
                    {/* Logo */}
                    <Link to="/" className="navbar-logo skillnear-logo">
                        <img src={logo} alt="SkillNear" className="navbar-logo-img" />
                        SkillNear
                    </Link>

                    {/* Location Selector */}
                    <div
                        className="navbar-location-selector"
                        style={{ position: 'relative' }}
                        onClick={() => setShowLocationModal(true)}
                    >
                        {(!userLocation?.city || userLocation.city === 'All of India') && !['/login', '/register', '/dashboard'].includes(window.location.pathname) && (
                            <div className="location-pulse-hint animate-bounce-subtle">
                                <span style={{ marginRight: '4px' }}>📍</span> Plz select location first
                            </div>
                        )}
                        <div className="location-label">
                            <span className="text-small">LOCATION</span>
                        </div>
                        <div className={`location-value ${(!userLocation?.city || userLocation.city === 'All of India') ? 'pulse-highlight' : ''}`}>
                            <MapPin size={16} color="var(--primary)" />
                            <span className="loc-text truncate">
                                {userLocation?.city && userLocation?.city !== 'All of India'
                                    ? `${userLocation.city}${userLocation.pincode ? `, ${userLocation.pincode}` : ''}`
                                    : (userLocation?.pincode || 'Select Area')}
                            </span>
                            <ChevronDown size={14} color="var(--text-muted)" />
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <NavbarSearch
                    searchKeyword={searchKeyword}
                    setSearchKeyword={setSearchKeyword}
                    handleSearch={handleSearch}
                />

                {/* Right Nav Links */}
                <div className="nav-right">
                    <div className="nav-links-desktop hide-on-mobile hide-on-tablet">
                        <Link to="/shops" className="navbar-link">Local Shops</Link>
                        <Link to="/services" className="navbar-link">Services</Link>
                        <div className="navbar-divider"></div>
                    </div>

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <NotificationMenu
                                show={showNotifications}
                                setShow={setShowNotifications}
                                notifications={notifications}
                                unreadCount={unreadCount}
                                markAllAsRead={markAllAsRead}
                                user={user}
                                navigate={navigate}
                                notificationRef={notificationRef}
                            />
                            <UserMenu user={user} getAvatar={getAvatar} />
                        </div>
                    ) : (
                        <div className="nav-auth-container">
                            <div className="auth-btns hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <Link to="/login" className="navbar-link">Login</Link>
                                <Link to="/register" className="btn-primary">Sign Up</Link>
                            </div>
                            <Link to="/login" className="btn-login-small show-on-mobile">
                                Login
                            </Link>
                        </div>
                    )}

                    {/* Mobile Hamburger Logic */}
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="show-on-mobile"
                        style={{ background: 'none', border: 'none', color: 'var(--text-main)', padding: '4px' }}
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            <MobileDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                user={user}
                getAvatar={getAvatar}
                handleLogout={handleLogout}
                navigate={navigate}
            />

            {/* Location Selection Modal */}
            <LocationModal
                show={showLocationModal}
                onClose={() => setShowLocationModal(false)}
                user={user}
                userLocation={userLocation}
                setLocation={setLocation}
                updateUserInfo={updateUserInfo}
            />
        </nav>
    );
};



export default Navbar;
