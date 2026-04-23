import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, CreditCard, CheckCircle, ArrowLeft, Loader, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';
import MapPicker from '../components/MapPicker';

const BookingFlow = () => {
    const { id } = useParams();         // service ID
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [service, setService] = useState(null);
    const [loadingService, setLoadingService] = useState(true);

    const [step, setStep] = useState(1);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [payment, setPayment] = useState('cash_on_delivery');
    const [submitting, setSubmitting] = useState(false);
    const [bookingDone, setBookingDone] = useState(false);
    const [bookingId, setBookingId] = useState(null);
    const [lat, setLat] = useState(null);
    const [lng, setLng] = useState(null);
    const [googleMapLink, setGoogleMapLink] = useState('');
    const [showMap, setShowMap] = useState(false);
    const [showCustomTime, setShowCustomTime] = useState(false);
    const [activePlanIdx, setActivePlanIdx] = useState(0);

    const queryParams = new URLSearchParams(window.location.search);
    const planName = queryParams.get('plan');

    // Fetch the service so we can show real price / title
    useEffect(() => {
        const fetchService = async () => {
            try {
                const { data } = await api.get(`/api/services/${id}`);
                setService(data);
                
                // If a plan was passed in URL, find its index
                if (planName && data.plans && data.plans.length > 0) {
                    const idx = data.plans.findIndex(p => p.name === planName);
                    if (idx !== -1) setActivePlanIdx(idx);
                }
            } catch (err) {
                console.error('Error fetching service', err);
            } finally {
                setLoadingService(false);
            }
        };
        fetchService();
    }, [id]);

    // Redirect to login if not authenticated, else set initial user details
    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            if (!customerName) setCustomerName(user.name || '');
            if (!customerPhone) setCustomerPhone(user.phone || '');
        }
    }, [user]);

    const tax = service ? +(service.price * 0.05).toFixed(2) : 0;
    const total = service ? +(service.price + tax).toFixed(2) : 0;

    const handleNext = () => {
        if (step === 1 && (!date || !time)) { toast.error('Please select a date and time'); return; }
        if (step === 2) {
            if (!customerName.trim()) { toast.error('Please enter your name'); return; }
            if (!customerPhone.trim()) { toast.error('Please enter your phone number'); return; }
            if (!street.trim()) { toast.error('Please enter your address'); return; }
        }
        if (step < 3) { setStep(step + 1); return; }
        handleConfirm();
    };

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.post('/api/bookings', {
                serviceId: id,
                date,
                timeSlot: time,
                address: { street, city, googleMapLink, lat, lng },
                customerName,
                customerPhone,
                paymentMethod: payment,
            }, config);
            setBookingId(data._id);
            setBookingDone(true);
            toast.success('Booking placed successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Success Screen ─────────────────────────────────────────
    if (bookingDone) {
        return (
            <div className="container" style={{ padding: '60px 20px', maxWidth: 600, textAlign: 'center' }}>
                <div className="card" style={{ padding: '48px 40px' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <CheckCircle size={40} color="#059669" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>Booking Confirmed! 🎉</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
                        Your booking for <strong>{service?.title}</strong> on <strong>{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> at <strong>{time}</strong> has been placed.
                    </p>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
                        Booking ID: <code style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: 6 }}>#{bookingId ? bookingId.slice(-8).toUpperCase() : 'N/A'}</code>
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button 
                            className="btn-primary" 
                            onClick={() => navigate(`/dashboard?tab=chat&provider=${service.provider._id}&service=${service._id}`)}
                        >
                            💬 Chat with Provider
                        </button>
                        <button className="btn-outline" onClick={() => navigate('/dashboard')}>
                            My Bookings
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loadingService) {
        return (
            <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
                <Loader size={32} className="spin" style={{ color: 'var(--primary)' }} />
                <p style={{ marginTop: 12 }}>Loading service…</p>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
                <p>Service not found.</p>
                <Link to="/services" className="btn-primary" style={{ marginTop: 16 }}>Browse Services</Link>
            </div>
        );
    }

    return (
        <div className="container bf-container">
            <style>{`
                .bf-container {
                    padding: 40px 20px 80px;
                    max-width: 1000px;
                }
                .bf-grid {
                    display: grid;
                    grid-template-columns: 1fr 350px;
                    gap: 32px;
                    align-items: start;
                }
                .bf-progress-container {
                    display: flex;
                    align-items: center;
                    margin-bottom: 40px;
                    justify-content: space-between;
                }
                .bf-step-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                    position: relative;
                }
                .bf-time-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 12px;
                }
                .bf-sticky-summary {
                    position: sticky;
                    top: 100px;
                }

                @media (max-width: 1024px) {
                    .bf-grid {
                        grid-template-columns: 1fr 300px;
                        gap: 24px;
                    }
                }

                @media (max-width: 768px) {
                    .bf-container {
                        padding: 20px 16px 100px;
                    }
                    .bf-grid {
                        grid-template-columns: 1fr;
                        display: flex;
                        flex-direction: column-reverse;
                    }
                    .bf-card {
                        padding: 24px !important;
                    }
                    .bf-title {
                        font-size: 1.5rem !important;
                        margin-bottom: 24px !important;
                    }
                    .bf-sticky-summary {
                        position: static;
                    }
                    .bf-time-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }
            `}</style>

            {/* Back link */}
            <Link to={`/services/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem', fontWeight: 600 }}>
                <ArrowLeft size={16} /> Back to {service.title}
            </Link>

            <div className="bf-grid">
                {/* Left — Steps */}
                <div className="card bf-card" style={{ padding: 40 }}>
                    <h1 className="bf-title" style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 32 }}>Complete Your Booking</h1>

                    {/* Progress Steps */}
                    <div className="bf-progress-container">
                        {[{ icon: <Calendar size={18} />, label: 'Date' }, { icon: <MapPin size={18} />, label: 'Address' }, { icon: <CreditCard size={18} />, label: 'Payment' }].map((s, i) => (
                            <React.Fragment key={i}>
                                <div className="bf-step-item">
                                    <div style={{ 
                                        width: 42, 
                                        height: 42, 
                                        borderRadius: '50%', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        backgroundColor: step > i ? 'var(--primary)' : step === i + 1 ? '#ede9fe' : '#f1f5f9', 
                                        color: step > i ? '#fff' : step === i + 1 ? 'var(--primary)' : '#94a3b8', 
                                        fontWeight: 800, 
                                        border: step === i + 1 ? '2px solid var(--primary)' : 'none', 
                                        transition: 'all 0.3s',
                                        zIndex: 2
                                    }}>
                                        {step > i + 1 ? <CheckCircle size={20} /> : s.icon}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: step === i + 1 ? 800 : 700, color: step === i + 1 ? 'var(--primary)' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</span>
                                </div>
                                {i < 2 && <div style={{ flex: 1, height: 2, backgroundColor: step > i + 1 ? 'var(--primary)' : '#e2e8f0', margin: '0 -20px', marginBottom: 24, zIndex: 1 }} />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step 1 */}
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h3 style={{ marginBottom: 24, fontWeight: 800, fontSize: '1.2rem' }}>Select Date & Time Slot</h3>
                            <div style={style.formGroup}>
                                <label style={style.label}>Preferred Date</label>
                                <input type="date" className="input-field" value={date}
                                    min={new Date().toISOString().split('T')[0]}
                                    style={{ padding: '14px' }}
                                    onChange={e => setDate(e.target.value)} />
                            </div>
                            <div style={style.formGroup}>
                                <label style={style.label}>Available Slots</label>
                                <div className="bf-time-grid">
                                    {['09:00 AM – 11:00 AM', '11:00 AM – 01:00 PM', '02:00 PM – 04:00 PM', '04:00 PM – 06:00 PM'].map(slot => (
                                        <button key={slot} onClick={() => { setTime(slot); setShowCustomTime(false); }} style={{ padding: '16px 12px', borderRadius: 12, border: `2px solid ${time === slot ? 'var(--primary)' : '#f1f5f9'}`, backgroundColor: time === slot ? '#f5f3ff' : '#fff', color: time === slot ? 'var(--primary)' : '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s', textAlign: 'center' }}>
                                            {slot}
                                        </button>
                                    ))}
                                    <button 
                                        onClick={() => setShowCustomTime(!showCustomTime)} 
                                        style={{ padding: '16px 12px', borderRadius: 12, border: `2px solid ${showCustomTime ? 'var(--primary)' : '#f1f5f9'}`, backgroundColor: showCustomTime ? '#f5f3ff' : '#fff', color: showCustomTime ? 'var(--primary)' : '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s', textAlign: 'center' }}
                                    >
                                        {showCustomTime ? '✕ Cancel' : '➕ Custom Time'}
                                    </button>
                                </div>

                                {showCustomTime && (
                                    <div className="animate-fade-in" style={{ marginTop: 16 }}>
                                        <label style={{ ...style.label, fontSize: '0.8rem', color: 'var(--primary)' }}>Enter Your Preferred Time</label>
                                        <input 
                                            type="text" 
                                            className="input-field" 
                                            placeholder="e.g. 10:30 PM, or Morning 10 AM" 
                                            style={{ padding: '14px' }}
                                            value={time && !['09:00 AM – 11:00 AM', '11:00 AM – 01:00 PM', '02:00 PM – 04:00 PM', '04:00 PM – 06:00 PM'].includes(time) ? time : ''}
                                            onChange={e => setTime(e.target.value)} 
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h3 style={{ marginBottom: 24, fontWeight: 800, fontSize: '1.2rem' }}>Contact & Location Details</h3>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={style.formGroup}>
                                    <label style={style.label}>Full Name</label>
                                    <input type="text" className="input-field" placeholder="e.g. John Doe" style={{ padding: '14px' }} value={customerName} onChange={e => setCustomerName(e.target.value)} />
                                </div>
                                <div style={style.formGroup}>
                                    <label style={style.label}>Phone Number</label>
                                    <input type="tel" className="input-field" placeholder="e.g. +91 9876543210" style={{ padding: '14px' }} value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                                </div>
                            </div>

                            <div style={style.formGroup}>
                                <label style={style.label}>Street Address</label>
                                <textarea className="input-field" rows="3" placeholder="e.g. 42, MG Road, Near Metro Station" style={{ padding: '14px' }} value={street} onChange={e => setStreet(e.target.value)} />
                            </div>
                            <div style={style.formGroup}>
                                <label style={style.label}>City</label>
                                <input type="text" className="input-field" placeholder="e.g. Mumbai" style={{ padding: '14px' }} value={city} onChange={e => setCity(e.target.value)} />
                            </div>
                            <div style={style.formGroup}>
                                <label style={style.label}>Google Maps Link (Optional)</label>
                                <input type="text" className="input-field" placeholder="Paste link from Google Maps" style={{ padding: '14px' }} value={googleMapLink} onChange={e => setGoogleMapLink(e.target.value)} />
                            </div>
                            <div style={{ marginTop: 10 }}>
                                <button type="button" onClick={() => setShowMap(!showMap)} style={{ background: 'none', border: '1.5px solid var(--primary)', color: 'var(--primary)', padding: '12px 24px', borderRadius: 12, fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                                    {showMap ? '✕ Hide Map' : '📍 Use Interactive Pin'}
                                </button>
                                {showMap && (
                                    <div style={{ marginTop: 20, borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                        <MapPicker lat={lat} lng={lng} onChange={({ lat, lng }) => { setLat(lat); setLng(lng); }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                        <div className="animate-fade-in">
                            <h3 style={{ marginBottom: 24, fontWeight: 800, fontSize: '1.2rem' }}>Choose Payment</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {[{ key: 'cash_on_delivery', label: '💵 Cash on Completion', desc: 'Secure payment after service' }, { key: 'upi', label: '📱 UPI / Instant Pay', desc: 'Secure digital payment gateways' }].map(opt => (
                                    <label key={opt.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px', border: `2px solid ${payment === opt.key ? 'var(--primary)' : '#f1f5f9'}`, borderRadius: 16, cursor: 'pointer', backgroundColor: payment === opt.key ? '#f5f3ff' : '#fff', transition: 'all 0.2s' }}>
                                        <input type="radio" name="payment" value={opt.key} checked={payment === opt.key} onChange={() => setPayment(opt.key)} style={{ marginTop: 4, width: 18, height: 18 }} />
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>{opt.label}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>{opt.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
                        {step > 1 ? (
                            <button className="btn-outline" style={{ padding: '14px 28px', borderRadius: 12, fontWeight: 800 }} onClick={() => setStep(step - 1)}>← Back</button>
                        ) : <div />}
                        <button className="btn-primary" onClick={handleNext} disabled={submitting}
                            style={{ minWidth: 160, padding: '14px 28px', borderRadius: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                            {submitting ? <><Loader size={18} className="spin" /> Processing…</> : step === 3 ? 'Book Now ✓' : 'Continue →'}
                        </button>
                    </div>
                </div>

                {/* Right — Order Summary */}
                <div className="bf-sticky-summary">
                    <div className="card" style={{ padding: 32 }}>
                        <h3 style={{ fontWeight: 900, marginBottom: 20, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Summary</h3>
                        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                            <img src={service.images?.[0] || (service.provider?.avatar && service.provider.avatar.startsWith('http') ? service.provider.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider?.name || service.title)}&background=ede9fe&color=4f46e5`)} alt={service.title} style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover' }} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider?.name || service.title || 'S')}&background=ede9fe&color=4f46e5&size=64`; }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b', marginBottom: 4 }}>{service.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>{service.category}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                            {date ? (
                                <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Calendar size={14} color="var(--primary)" /> {date}
                                </div>
                            ) : null}
                            {time ? (
                                <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Clock size={14} color="var(--primary)" /> {time}
                                </div>
                            ) : null}
                            {city ? (
                                <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <MapPin size={14} color="var(--primary)" /> {city}
                                </div>
                            ) : null}
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Base Price</span>
                                <span style={{ fontWeight: 700, color: '#1e293b' }}>₹{service.plans && service.plans.length > 0 ? service.plans[activePlanIdx].price : service.price}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Platform Fee</span>
                                <span style={{ fontWeight: 700, color: '#1e293b' }}>₹{tax}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.25rem', borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                                <span>Grand Total</span>
                                <span style={{ color: 'var(--primary)' }}>₹{total}</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 20, textAlign: 'center', lineHeight: 1.4, fontWeight: 500 }}>
                            🔒 Secure Transaction: Your payment information is protected.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const style = {
    formGroup: { marginBottom: 28 },
    label: { display: 'block', marginBottom: 10, fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' },
};

export default BookingFlow;
