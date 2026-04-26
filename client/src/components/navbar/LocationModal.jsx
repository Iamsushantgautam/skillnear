import React, { useState, useEffect } from 'react';
import { X, LocateFixed, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { City, State } from 'country-state-city';
import api from '../../utils/api';

const LocationModal = ({
    show,
    onClose,
    user,
    userLocation,
    setLocation,
    updateUserInfo
}) => {
    const indianStates = State.getStatesOfCountry('IN');
    const [selectedStateCode, setSelectedStateCode] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedPincode, setSelectedPincode] = useState(userLocation?.pincode || '');
    const [isDetecting, setIsDetecting] = useState(false);
    const [pincodeError, setPincodeError] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const lastValidated = React.useRef('');

    useEffect(() => {
        if (userLocation) {
            setSelectedPincode(userLocation.pincode || '');
            setSelectedCity(userLocation.city || '');
            
            if (userLocation.state) {
                const stateMatch = indianStates.find(s => s.name.toLowerCase() === userLocation.state.toLowerCase());
                if (stateMatch) {
                    setSelectedStateCode(stateMatch.isoCode);
                }
            }
        }
    }, [userLocation, indianStates]);

    // SMART PINCODE VALIDATION - Optimized
    useEffect(() => {
        const validatePincode = async () => {
            // Only validate if it's 6 digits AND different from the last one we checked
            if (selectedPincode.length === 6 && selectedPincode !== lastValidated.current) {
                setIsValidating(true);
                setPincodeError('');
                try {
                    const res = await fetch(`https://api.postalpincode.in/pincode/${selectedPincode}`);
                    const data = await res.json();
                    
                    lastValidated.current = selectedPincode; // Mark as validated

                    if (data[0].Status === "Success") {
                        const info = data[0].PostOffice[0];
                        const detectedState = info.State;
                        const detectedDistrict = info.District;
                        
                        const selectedStateName = indianStates.find(s => s.isoCode === selectedStateCode)?.name;

                        let errorMsg = '';
                        if (selectedStateCode && detectedState.toLowerCase() !== selectedStateName?.toLowerCase()) {
                            errorMsg = `This pincode belongs to ${detectedState}, not ${selectedStateName}.`;
                        } else if (selectedCity && !detectedDistrict.toLowerCase().includes(selectedCity.toLowerCase()) && !selectedCity.toLowerCase().includes(detectedDistrict.toLowerCase())) {
                            errorMsg = `This pincode is registered in ${detectedDistrict}. Please double check.`;
                        }
                        
                        setPincodeError(errorMsg);
                    } else {
                        setPincodeError("Invalid pincode or not found in records.");
                    }
                } catch (error) {
                    console.error("Pincode validation error", error);
                } finally {
                    setIsValidating(false);
                }
            } else if (selectedPincode.length !== 6) {
                setPincodeError('');
                lastValidated.current = ''; // Reset if user starts typing again
            }
        };

        const timer = setTimeout(validatePincode, 600);
        return () => clearTimeout(timer);
    }, [selectedPincode, selectedStateCode, selectedCity, indianStates]);

    if (!show) return null;

    const citiesOfState = selectedStateCode ?
        City.getCitiesOfState('IN', selectedStateCode) : [];

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

        onClose();
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
                    // onClose(); // Removed immediate close so user can see it set in manual section
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
        <div className="location-modal-overlay">
            <div className="location-modal-content animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Select Your Location (India)</h3>
                    <button onClick={onClose} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div className="auto-detect-box">
                    <button
                        onClick={handleAutoDetect}
                        disabled={isDetecting}
                        className="auto-detect-btn"
                    >
                        <LocateFixed size={20} className={isDetecting ? "animate-spin" : ""} />
                        {isDetecting ? 'Detecting...' : 'Use My Current Location'}
                    </button>
                    <p style={{ fontSize: '0.75rem', marginTop: '6px', color: '#64748b' }}>Pinpoint your exact area automatically</p>
                </div>

                <div className="divider-container">
                    <div className="divider-line"></div>
                    <span className="divider-text">OR SELECT MANUALLY</span>
                    <div className="divider-line"></div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label className="navbar-label">Select State</label>
                    <select
                        className="input-field"
                        value={selectedStateCode}
                        onChange={(e) => {
                            setSelectedStateCode(e.target.value);
                            setSelectedCity('');
                        }}
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    >
                        <option value="">Select a State</option>
                        {indianStates.map(state => (
                            <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label className="navbar-label">Select City</label>
                    <select
                        className="input-field"
                        value={selectedCity}
                        onChange={(e) => {
                            setSelectedCity(e.target.value);
                            setSelectedPincode('');
                        }}
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    >
                        <option value="">{selectedStateCode ? 'Select City' : 'State First'}</option>
                        {citiesOfState.map(city => (
                            <option key={city.name} value={city.name}>{city.name}</option>
                        ))}
                    </select>
                </div>

                {selectedCity && (
                    <div style={{ marginBottom: '24px' }} className="animate-fade-in">
                        <label className="navbar-label">Pincode / Zip Code</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. 226001"
                                value={selectedPincode}
                                onChange={(e) => setSelectedPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '12px', 
                                    border: `1px solid ${pincodeError ? '#ef4444' : '#e2e8f0'}`,
                                    outline: 'none'
                                }}
                            />
                            {isValidating && (
                                <div style={{ position: 'absolute', right: '12px', top: '12px' }}>
                                    <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
                                </div>
                            )}
                        </div>
                        {pincodeError && (
                            <p style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '6px', fontWeight: '600' }}>
                                ⚠️ {pincodeError}
                            </p>
                        )}
                    </div>
                )}



                <button
                    className="btn-primary"
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: '700' }}
                    onClick={handleSaveLocation}
                >
                    Save Location
                </button>
            </div>
        </div>
    );
};



export default LocationModal;
