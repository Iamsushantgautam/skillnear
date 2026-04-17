import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, LogOut, MapPin, ChevronDown, X, LocateFixed } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { State, City } from 'country-state-city';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const Navbar = () => {
    const { user, logout, userLocation, setLocation } = useAuthStore();
    const navigate = useNavigate();

    // Location Modal State
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [selectedStateCode, setSelectedStateCode] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedPincode, setSelectedPincode] = useState(userLocation?.pincode || '');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);

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
                await api.put('/api/users/location', locData, config);
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
                        await api.put('/api/users/location', { lat: latitude, lng: longitude, city, state, pincode }, config);
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
                    <Link to="/" style={styles.logo}>
                        SkillNear
                    </Link>

                    {/* Location Selector */}
                    <div style={styles.locationSelector} onClick={() => setShowLocationModal(true)}>
                        <div className="location-label">
                            <span className="text-small">LOCATION</span>
                        </div>
                        <div className="location-value">
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Link to="/dashboard" className="user-profile-link">
                                <img src={getAvatar(user)} alt="Profile" className="nav-avatar" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ede9fe&color=4f46e5&size=80`; }} />
                                <span className="nav-username hide-on-mobile">{user.name}</span>
                            </Link>
                            <button onClick={handleLogout} className="logout-btn hide-on-mobile">
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="auth-btns hide-on-mobile">
                            <Link to="/login" style={styles.link}>Login</Link>
                            <Link to="/register" className="btn-primary">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>

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
                .logout-btn {
                    color: var(--danger);
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-weight: 500;
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
