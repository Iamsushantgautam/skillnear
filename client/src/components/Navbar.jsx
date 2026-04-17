import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, LogOut, MapPin, ChevronDown, X } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { State, City } from 'country-state-city';

const Navbar = () => {
    const { user, logout, userLocation, setLocation } = useAuthStore();
    const navigate = useNavigate();

    // Location Modal State
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [selectedStateCode, setSelectedStateCode] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

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

    const handleSaveLocation = () => {
        const stateObj = indianStates.find(s => s.isoCode === selectedStateCode);
        setLocation({
            state: stateObj ? stateObj.name : '',
            city: selectedCity || 'All of India'
        });
        setShowLocationModal(false);
    };

    return (
        <nav style={styles.nav}>
            <div className="container" style={styles.container}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Logo */}
                    <Link to="/" style={styles.logo}>
                        SkillNear
                    </Link>

                    {/* Location Selector */}
                    <div style={styles.locationSelector} onClick={() => setShowLocationModal(true)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="text-small" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--text-main)', fontWeight: '600' }}>
                            <MapPin size={16} color="var(--primary)" />
                            <span style={{ fontSize: '0.95rem' }}>{userLocation?.city || 'All of India'}</span>
                            <ChevronDown size={14} color="var(--text-muted)" />
                        </div>
                    </div>
                </div>

                {/* Search Bar (Hidden on very small screens) */}
                <div style={styles.searchContainer} className="hide-on-mobile">
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
                <div style={styles.navLinks} className="hide-on-mobile">
                    <Link to="/shops" style={styles.link}>Local Shops</Link>
                    <Link to="/services" style={styles.link}>Services</Link>

                    <div style={styles.divider}></div>

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', ...styles.link }}>
                                <img src={getAvatar(user)} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ede9fe&color=4f46e5&size=80`; }} />
                                <span className="hide-on-mobile">{user.name}</span>
                            </Link>
                            <button onClick={handleLogout} style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <LogOut size={18} />
                                <span className="hide-on-mobile">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" style={styles.link}>Login</Link>
                            <Link to="/register" className="btn-primary">Sign Up</Link>
                        </>
                    )}

                    {/* Mobile Menu Icon */}
                </div>

                <button style={styles.mobileMenuBtn} className="show-on-mobile">
                    {user ? (
                        <Link to="/dashboard">
                            <img src={getAvatar(user)} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ede9fe&color=4f46e5&size=80`; }} />
                        </Link>
                    ) : (
                        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '500' }}>Login</Link>
                    )}
                </button>
            </div>

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

                        <div style={{ marginBottom: '16px' }}>
                            <label style={styles.label}>Select State</label>
                            <select
                                className="input-field"
                                value={selectedStateCode}
                                onChange={(e) => {
                                    setSelectedStateCode(e.target.value);
                                    setSelectedCity(''); // Reset city when state changes
                                }}
                            >
                                <option value="">Select a State</option>
                                {indianStates.map(state => (
                                    <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedStateCode && (
                            <div style={{ marginBottom: '24px' }}>
                                <label style={styles.label}>Select City</label>
                                <select
                                    className="input-field"
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                >
                                    <option value="">All Cities in State</option>
                                    {citiesOfState.map(city => (
                                        <option key={city.name} value={city.name}>{city.name}</option>
                                    ))}
                                </select>
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
    },
    locationSelector: {
        display: 'flex',
        flexDirection: 'column',
    },
    searchContainer: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 'var(--radius-md)',
        padding: '8px 16px',
        flex: '0 1 400px',
    },
    searchInput: {
        border: 'none',
        backgroundColor: 'transparent',
        outline: 'none',
        width: '100%',
        marginLeft: '8px',
        fontSize: '0.95rem',
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    link: {
        fontWeight: '500',
        color: 'var(--text-main)',
        transition: 'color 0.2s',
    },
    divider: {
        height: '24px',
        width: '1px',
        backgroundColor: 'var(--border-color)',
    },
    mobileMenuBtn: {
        display: 'none', // Handled by CSS class .show-on-mobile
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
