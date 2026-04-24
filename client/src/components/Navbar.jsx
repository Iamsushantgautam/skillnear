import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, MapPin, ChevronDown, X, LocateFixed, Info, Mail, Shield, FileText, LogOut, Zap, Award, Bell, Trash } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useNotificationStore from '../store/useNotificationStore';
import { State, City } from 'country-state-city';
import api, { API_URL } from '../utils/api';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';

const Navbar = () => {
    const { user, logout, userLocation, setLocation, updateUserInfo } = useAuthStore();
    const { notifications, unreadCount, fetchNotifications, addNotification, markAllAsRead } = useNotificationStore();
    const navigate = useNavigate();
    // Location Modal State
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    const [selectedStateCode, setSelectedStateCode] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedPincode, setSelectedPincode] = useState(userLocation?.pincode || '');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);
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

    const indianStates = State.getStatesOfCountry('IN');
    const citiesOfState = selectedStateCode ? City.getCitiesOfState('IN', selectedStateCode) : [];

    const getAvatar = (userData) => {
        if (userData?.avatar && userData.avatar.startsWith('http')) return userData.avatar;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || 'U')}&background=ede9fe&color=4f46e5&size=80`;
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSaveLocation = async () => {
        const stateObj = indianStates.find(s => s.isoCode === selectedStateCode);
        const locData = {
            state: stateObj ? stateObj.name : (userLocation?.state || ''),
            city: selectedCity || 'All of India',
            pincode: selectedPincode || ''
        };

        setLocation(locData);

        if (user) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data: updateRes } = await api.put('/api/users/location', locData, config);
                updateUserInfo({ ...user, locationHistory: updateRes.locationHistory });
            } catch (error) {
                console.error("Error saving location to DB", error);
            }
        }

        setShowLocationModal(false);
    };

    const handleAutoDetect = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsDetecting(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                const data = await res.json();

                if (data.address) {
                    const city = data.address.city || data.address.town || data.address.village || '';
                    const state = data.address.state || '';
                    const pincode = data.address.postcode || '';

                    setSelectedCity(city);
                    setSelectedPincode(pincode);

                    const stateMatch = indianStates.find(s => s.name.toLowerCase() === state.toLowerCase());
                    if (stateMatch) {
                        setSelectedStateCode(stateMatch.isoCode);
                    }

                    toast.success(`Detected: ${city}, ${pincode}`);

                    if (user) {
                        const config = { headers: { Authorization: `Bearer ${user.token}` } };
                        const { data: updateRes } = await api.put('/api/users/location', { lat: latitude, lng: longitude, city, state, pincode }, config);
                        updateUserInfo({ ...user, locationHistory: updateRes.locationHistory });
                    }

                    setLocation({ city, state, pincode });
                    setShowLocationModal(false);
                }
            } catch (error) {
                console.error("Auto detect error", error);
                toast.error("Could not automatically detect location details");
            } finally {
                setIsDetecting(false);
            }
        }, (err) => {
            console.error(err);
            toast.error("Location access denied or unavailable");
            setIsDetecting(false);
        });
    };

    return (
        <nav style={styles.nav}>
            <div className="container" style={styles.container}>
                <div className="nav-left">
                    {/* Logo */}
                    <Link to="/" style={styles.logo} className="skillnear-logo">
                        SkillNear
                    </Link>

                    {/* Location Selector */}
                    <div 
                        style={{
                            ...styles.locationSelector,
                            position: 'relative'
                        }} 
                        onClick={() => setShowLocationModal(true)}
                    >
                        {(!userLocation?.city || userLocation.city === 'All of India') && (
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
                <div className="nav-search hide-on-mobile">
                    <Search size={18} color="#6b7280" />
                    <input
                        type="text"
                        placeholder="Search for services..."
                        style={styles.searchInput}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>

                {/* Right Nav Links */}
                <div className="nav-right">
                    <div className="nav-links-desktop hide-on-mobile hide-on-tablet">
                        <Link to="/shops" style={styles.link}>Local Shops</Link>
                        <Link to="/services" style={styles.link}>Services</Link>

                        <div style={styles.divider}></div>
                    </div>

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            {/* Notification Bell */}
                            <div style={{ position: 'relative' }} ref={notificationRef}>
                                <button 
                                    onClick={() => {
                                        setShowNotifications(!showNotifications);
                                        if (!showNotifications && unreadCount > 0) markAllAsRead(user.token);
                                    }}
                                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                                >
                                    <Bell size={22} />
                                    {unreadCount > 0 && (
                                        <span style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: '800', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="animate-fade-in" style={{ position: 'absolute', top: '40px', right: '-10px', width: '320px', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid #f1f5f9', zIndex: 100, overflow: 'hidden' }}>
                                        <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h4 style={{ margin: 0, fontWeight: '800' }}>Notifications</h4>
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{notifications.length} total</span>
                                        </div>
                                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            {notifications.length === 0 ? (
                                                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                                                    <Bell size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>No notifications yet</p>
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div 
                                                        key={notif._id} 
                                                        onClick={() => {
                                                            if (notif.link) navigate(notif.link);
                                                            setShowNotifications(false);
                                                        }}
                                                        style={{ padding: '16px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', transition: 'background 0.2s', backgroundColor: notif.isRead ? '#fff' : '#f0f9ff' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.isRead ? '#fff' : '#f0f9ff'}
                                                    >
                                                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1e293b', marginBottom: '4px' }}>{notif.title}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4' }}>{notif.message}</div>
                                                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px' }}>{new Date(notif.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {notifications.length > 0 && (
                                            <button 
                                                onClick={() => markAllAsRead(user.token)}
                                                style={{ width: '100%', padding: '12px', background: '#f8fafc', border: 'none', color: '#003d9b', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <Link to="/dashboard" className="user-profile-link hide-on-mobile">
                                <img src={getAvatar(user)} alt="Profile" className="nav-avatar" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ede9fe&color=4f46e5&size=80`; }} />
                                <span className="nav-username hide-on-mobile">{user.name}</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="nav-auth-container">
                            <div className="auth-btns hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <Link to="/login" style={styles.link}>Login</Link>
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
            {isDrawerOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 2001 }}>
                    <div onClick={() => setIsDrawerOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
                    <div className="animate-slide-in-left no-scrollbar" style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '280px', background: 'white', padding: '64px 24px 100px', overflowY: 'auto' }}>
                        <button onClick={() => setIsDrawerOpen(false)} style={{ position: 'absolute', top: 24, right: 20, background: 'none', border: 'none' }}><X size={24} color="#64748b" /></button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
                            {user ? (
                                <>
                                    <img
                                        src={getAvatar(user)}
                                        style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                                        alt=""
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ede9fe&color=4f46e5&size=80`; }}
                                    />
                                    <div>
                                        <h4 style={{ margin: 0, fontWeight: 800 }}>{user.name}</h4>
                                        <p style={{ margin: 0, fontSize: 10, color: '#94a3b8' }}>SkillNear Member</p>
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={24} color="#003d9b" />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontWeight: 800 }}>Welcome to SkillNear</h4>
                                        <p style={{ margin: 0, fontSize: 10, color: '#94a3b8' }}>Connect with local experts</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { label: 'Home', link: '/', icon: LocateFixed },
                                { label: 'Local Shops', link: '/shops', icon: MapPin },
                                { label: 'Browse Services', link: '/services', icon: Search },
                                { label: 'How it Works', link: '/how-it-works', icon: Zap },
                                { label: 'Success Stories', link: '/success-stories', icon: Award },
                                { divider: true },
                                { label: 'About Us', link: '/about', icon: Info },
                                { label: 'Connect With Us', link: '/contact', icon: Mail },
                                { divider: true },
                                { label: 'Privacy Policy', link: '/privacy', icon: Shield },
                                { label: 'Terms & Conditions', link: '/terms', icon: FileText },
                                { divider: true },
                                ...(user ? [
                                    { label: 'My Dashboard', link: '/dashboard', icon: User },
                                    { divider: true },
                                    { label: 'Logout', action: handleLogout, icon: LogOut, color: '#ef4444' }
                                ] : [
                                    { label: 'Login', link: '/login', icon: User },
                                    { label: 'Sign Up', link: '/register', icon: User }
                                ])
                            ].map((item, idx) => (
                                item.divider ? <div key={idx} style={{ height: '1px', background: '#f1f5f9', margin: '8px 0' }} /> : (
                                    <button key={item.label} onClick={() => { item.action ? item.action() : navigate(item.link); setIsDrawerOpen(false); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', borderRadius: 12, width: '100%', textAlign: 'left', fontWeight: 600, color: item.color || '#64748b' }}>
                                        <item.icon size={20} /> {item.label}
                                    </button>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .nav-left {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    flex: 1;
                    min-width: 0;
                }
                .nav-right {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .nav-search {
                    display: flex;
                    align-items: center;
                    background-color: #f3f4f6;
                    border-radius: var(--radius-md);
                    padding: 8px 16px;
                    flex: 0 1 350px;
                    margin: 0 20px;
                }
                .nav-links-desktop {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .location-label {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    line-height: 1;
                }
                .location-value {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                    color: var(--text-main);
                    font-weight: 600;
                    min-width: 0;
                }
                .loc-text {
                    font-size: 0.95rem;
                }
                .truncate {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .nav-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid #fff;
                    box-shadow: 0 0 0 1px var(--border-color);
                }
                .user-profile-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 500;
                    color: var(--text-main);
                    min-width: 0;
                }
                .nav-username {
                    max-width: 100px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .btn-login-small {
                    padding: 5px 12px;
                    font-size: 0.75rem;
                    background-color: var(--primary);
                    color: white;
                    border-radius: var(--radius-sm);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .nav-auth-container {
                    display: flex;
                    align-items: center;
                }

                @media (max-width: 1024px) {
                    .nav-left { gap: 12px; }
                    .nav-search { margin: 0 10px; flex: 1; }
                    .nav-links-desktop { gap: 10px; }
                }

                @media (max-width: 768px) {
                    .nav-left { gap: 10px; }
                    .loc-text { font-size: 0.85rem; }
                    .location-label span { font-size: 0.7rem; }
                    .nav-username { display: none; }
                }

                @media (max-width: 480px) {
                    .skillnear-logo { font-size: 1.25rem !important; }
                    .nav-left { gap: 8px; }
                    .location-label { display: none; }
                    .nav-search { display: none; }
                }

                @keyframes pulse-border {
                    0% { box-shadow: 0 0 0 0px rgba(79, 70, 229, 0.4); border-color: rgba(79, 70, 229, 0.5); }
                    70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); border-color: rgba(79, 70, 229, 0.1); }
                    100% { box-shadow: 0 0 0 0px rgba(79, 70, 229, 0); border-color: rgba(79, 70, 229, 0.5); }
                }

                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }

                .animate-bounce-subtle {
                    animation: bounce-subtle 2s ease-in-out infinite;
                }

                .pulse-highlight {
                    animation: pulse-border 2s infinite;
                    border-radius: 12px;
                    padding: 6px 12px;
                    background: rgba(79, 70, 229, 0.08);
                    border: 1.5px solid rgba(79, 70, 229, 0.3);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .location-pulse-hint {
                    position: absolute;
                    top: 55px;
                    left: 0;
                    background: #1e293b;
                    color: white;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 800;
                    white-space: nowrap;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                }

                .location-pulse-hint::after {
                    content: '';
                    position: absolute;
                    top: -6px;
                    left: 20px;
                    border-left: 6px solid transparent;
                    border-right: 6px solid transparent;
                    border-bottom: 6px solid #1e293b;
                }
            `}</style>

            {/* Location Selection Modal */}
            {showLocationModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent} className="animate-fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 className="text-h3">Select Your Location (India)</h3>
                            <button onClick={() => setShowLocationModal(false)} style={{ color: 'var(--text-muted)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', border: '1.5px dashed var(--primary)' }}>
                            <button
                                onClick={handleAutoDetect}
                                disabled={isDetecting}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', background: 'none', border: 'none' }}
                            >
                                <LocateFixed size={20} className={isDetecting ? "animate-spin" : ""} />
                                {isDetecting ? 'Detecting...' : 'Use My Current Location'}
                            </button>
                            <p style={{ fontSize: '0.75rem', marginTop: '6px', color: '#64748b' }}>Pinpoint your exact area automatically</p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>OR SELECT MANUALLY</span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={styles.label}>Select State</label>
                            <select
                                className="input-field"
                                value={selectedStateCode}
                                onChange={(e) => {
                                    setSelectedStateCode(e.target.value);
                                    setSelectedCity('');
                                }}
                            >
                                <option value="">Select a State</option>
                                {indianStates.map(state => (
                                    <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={styles.label}>Select City</label>
                            <select
                                className="input-field"
                                value={selectedCity}
                                onChange={(e) => {
                                    setSelectedCity(e.target.value);
                                    setSelectedPincode('');
                                }}
                            >
                                <option value="">{selectedStateCode ? 'Select City' : 'State First'}</option>
                                {citiesOfState.map(city => (
                                    <option key={city.name} value={city.name}>{city.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={styles.label}>Pincode / Zip Code</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. 226001"
                                value={selectedPincode}
                                onChange={(e) => setSelectedPincode(e.target.value)}
                            />
                        </div>

                        {user?.locationHistory?.length > 0 && (
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ ...styles.label, fontSize: '0.75rem', color: '#64748b' }}>RECENT LOCATIONS</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '120px', overflowY: 'auto', padding: '4px' }} className="no-scrollbar">
                                    {[...user.locationHistory].reverse().slice(0, 5).map((loc, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                const parts = loc.address.split(',').map(p => p.trim());
                                                const city = parts[0] || '';
                                                const stateWithPin = parts[1] || '';
                                                const state = stateWithPin.split(' ')[0] || '';
                                                const pin = stateWithPin.split(' ')[1] || '';
                                                
                                                setLocation({ city, state, pincode: pin });
                                                setShowLocationModal(false);
                                            }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '10px', fontSize: '12px', color: '#1e293b', fontWeight: '600', textAlign: 'left', cursor: 'pointer' }}
                                        >
                                            <MapPin size={14} color="#64748b" />
                                            <span style={{ flex: 1 }} className="truncate">{loc.address}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            className="btn-primary"
                            style={{ width: '100%' }}
                            onClick={handleSaveLocation}
                        >
                            Save Location
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

const styles = {
    nav: {
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '12px 0',
    },
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: 'var(--primary)',
        letterSpacing: '-0.5px',
        flexShrink: 0,
    },
    locationSelector: {
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        cursor: 'pointer',
    },
    searchInput: {
        border: 'none',
        backgroundColor: 'transparent',
        outline: 'none',
        width: '100%',
        marginLeft: '8px',
        fontSize: '0.95rem',
    },
    link: {
        fontWeight: '500',
        color: 'var(--text-main)',
        transition: 'color 0.2s',
        whiteSpace: 'nowrap',
    },
    divider: {
        height: '24px',
        width: '1px',
        backgroundColor: 'var(--border-color)',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: '32px',
        borderRadius: 'var(--radius-lg)',
        width: '90%',
        maxWidth: '400px',
        boxShadow: 'var(--shadow-lg)'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '500',
        color: 'var(--text-main)'
    }
};

export default Navbar;
