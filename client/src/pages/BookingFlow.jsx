import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, CreditCard, CheckCircle, ArrowLeft, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';

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
    const [payment, setPayment] = useState('cash_on_delivery');
    const [submitting, setSubmitting] = useState(false);
    const [bookingDone, setBookingDone] = useState(false);
    const [bookingId, setBookingId] = useState(null);

    // Fetch the service so we can show real price / title
    useEffect(() => {
        const fetchService = async () => {
            try {
                const { data } = await api.get(`/api/services/${id}`);
                setService(data);
            } catch (err) {
                console.error('Error fetching service', err);
            } finally {
                setLoadingService(false);
            }
        };
        fetchService();
    }, [id]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!user) navigate('/login');
    }, [user]);

    const tax = service ? +(service.price * 0.05).toFixed(2) : 0;
    const total = service ? +(service.price + tax).toFixed(2) : 0;

    const handleNext = () => {
        if (step === 1 && (!date || !time)) { toast.error('Please select a date and time'); return; }
        if (step === 2 && !street) { toast.error('Please enter your address'); return; }
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
                address: { street, city },
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
                        Booking ID: <code style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: 6 }}>#{bookingId?.slice(-8).toUpperCase()}</code>
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn-primary" onClick={() => navigate('/chat')}>
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
        <div className="container" style={{ padding: '40px 20px', maxWidth: 840 }}>
            {/* Back link */}
            <Link to={`/services/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
                <ArrowLeft size={16} /> Back to {service.title}
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
                {/* Left — Steps */}
                <div className="card" style={{ padding: 36 }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 28 }}>Complete Your Booking</h1>

                    {/* Progress Steps */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
                        {[{ icon: <Calendar size={18} />, label: 'Date & Time' }, { icon: <MapPin size={18} />, label: 'Address' }, { icon: <CreditCard size={18} />, label: 'Payment' }].map((s, i) => (
                            <React.Fragment key={i}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: step > i ? 'var(--primary)' : step === i + 1 ? '#ede9fe' : '#f1f5f9', color: step > i ? '#fff' : step === i + 1 ? 'var(--primary)' : '#94a3b8', fontWeight: 700, border: step === i + 1 ? '2px solid var(--primary)' : 'none', transition: 'all 0.3s' }}>
                                        {step > i + 1 ? <CheckCircle size={18} /> : s.icon}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: step === i + 1 ? 700 : 400, color: step === i + 1 ? 'var(--primary)' : 'var(--text-muted)' }}>{s.label}</span>
                                </div>
                                {i < 2 && <div style={{ flex: 1, height: 2, backgroundColor: step > i + 1 ? 'var(--primary)' : '#e2e8f0', margin: '0 4px', marginBottom: 20 }} />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step 1 */}
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h3 style={{ marginBottom: 20, fontWeight: 700 }}>Select Date & Time Slot</h3>
                            <div style={s.formGroup}>
                                <label style={s.label}>Preferred Date</label>
                                <input type="date" className="input-field" value={date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => setDate(e.target.value)} />
                            </div>
                            <div style={s.formGroup}>
                                <label style={s.label}>Time Slot</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    {['09:00 AM – 11:00 AM', '11:00 AM – 01:00 PM', '02:00 PM – 04:00 PM', '04:00 PM – 06:00 PM'].map(slot => (
                                        <button key={slot} onClick={() => setTime(slot)} style={{ padding: '12px 10px', borderRadius: 10, border: `2px solid ${time === slot ? 'var(--primary)' : '#e2e8f0'}`, backgroundColor: time === slot ? '#ede9fe' : '#fff', color: time === slot ? 'var(--primary)' : '#374151', fontWeight: time === slot ? 700 : 400, cursor: 'pointer', fontSize: '0.82rem', transition: 'all 0.2s' }}>
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h3 style={{ marginBottom: 20, fontWeight: 700 }}>Service Location</h3>
                            <div style={s.formGroup}>
                                <label style={s.label}>Street Address</label>
                                <textarea className="input-field" rows="3" placeholder="e.g. 42, MG Road, Near Metro Station" value={street} onChange={e => setStreet(e.target.value)} />
                            </div>
                            <div style={s.formGroup}>
                                <label style={s.label}>City</label>
                                <input type="text" className="input-field" placeholder="e.g. Mumbai" value={city} onChange={e => setCity(e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                        <div className="animate-fade-in">
                            <h3 style={{ marginBottom: 20, fontWeight: 700 }}>Payment Method</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[{ key: 'cash_on_delivery', label: '💵 Cash on Completion', desc: 'Pay after the service is done' }, { key: 'upi', label: '📱 UPI / Online Payment', desc: 'Pay via UPI, wallets, or net banking' }].map(opt => (
                                    <label key={opt.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px', border: `2px solid ${payment === opt.key ? 'var(--primary)' : '#e2e8f0'}`, borderRadius: 12, cursor: 'pointer', backgroundColor: payment === opt.key ? '#f5f3ff' : '#fff', transition: 'all 0.2s' }}>
                                        <input type="radio" name="payment" value={opt.key} checked={payment === opt.key} onChange={() => setPayment(opt.key)} style={{ marginTop: 3 }} />
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{opt.label}</div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
                        {step > 1 ? (
                            <button className="btn-outline" onClick={() => setStep(step - 1)}>← Back</button>
                        ) : <div />}
                        <button className="btn-primary" onClick={handleNext} disabled={submitting}
                            style={{ minWidth: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {submitting ? <><Loader size={16} className="spin" /> Processing…</> : step === 3 ? 'Confirm Booking ✓' : 'Next Step →'}
                        </button>
                    </div>
                </div>

                {/* Right — Order Summary */}
                <div style={{ position: 'sticky', top: 90 }}>
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Order Summary</h3>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                            <img src={service.images?.[0] || (service.provider?.avatar && service.provider.avatar.startsWith('http') ? service.provider.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider?.name || service.title)}&background=ede9fe&color=4f46e5`)} alt={service.title} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover' }} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(service.provider?.name || service.title || 'S')}&background=ede9fe&color=4f46e5&size=56`; }} />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{service.title}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{service.category}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>by {service.provider?.name}</div>
                            </div>
                        </div>
                        {date && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 4 }}>📅 {date} • {time || '—'}</div>}
                        {city && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>📍 {city}</div>}
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, marginTop: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Service Fee</span>
                                <span style={{ fontWeight: 600 }}>₹{service.price}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Platform Fee (5%)</span>
                                <span style={{ fontWeight: 600 }}>₹{tax}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--primary)' }}>₹{total}</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>
                            🔒 You won't be charged until the service is confirmed
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const s = {
    formGroup: { marginBottom: 20 },
    label: { display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' },
};

export default BookingFlow;
