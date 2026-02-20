import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, CreditCard } from 'lucide-react';

const BookingFlow = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [address, setAddress] = useState('');
    const [payment, setPayment] = useState('card');

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else handleConfirm();
    };

    const handleConfirm = () => {
        console.log('Booking Confirmed', { id, date, time, address, payment });
        alert('Booking Confirmed!');
        navigate('/dashboard');
    };

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px' }}>
            <div className="card" style={{ padding: '40px' }}>
                <h1 className="text-h2" style={{ marginBottom: '32px', textAlign: 'center' }}>Complete Your Booking</h1>

                {/* Progress Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', position: 'relative' }}>
                    <div style={{ ...styles.stepIndicator, color: step >= 1 ? 'var(--primary)' : 'var(--text-muted)' }}>
                        <Calendar size={24} />
                        <span className="text-small" style={{ marginTop: '8px' }}>Date & Time</span>
                    </div>
                    <div style={{ ...styles.stepIndicator, color: step >= 2 ? 'var(--primary)' : 'var(--text-muted)' }}>
                        <MapPin size={24} />
                        <span className="text-small" style={{ marginTop: '8px' }}>Address</span>
                    </div>
                    <div style={{ ...styles.stepIndicator, color: step >= 3 ? 'var(--primary)' : 'var(--text-muted)' }}>
                        <CreditCard size={24} />
                        <span className="text-small" style={{ marginTop: '8px' }}>Payment</span>
                    </div>
                    {/* Connecting Line */}
                    <div style={{ position: 'absolute', top: '12px', left: '10%', right: '10%', height: '2px', backgroundColor: 'var(--border-color)', zIndex: 0 }}></div>
                </div>

                {/* Step 1: Date & Time */}
                {step === 1 && (
                    <div className="animate-fade-in">
                        <h3 className="text-h3" style={{ marginBottom: '16px' }}>Select Date and Time</h3>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={styles.label}>Date</label>
                            <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={styles.label}>Time Slot</label>
                            <select className="input-field" value={time} onChange={(e) => setTime(e.target.value)}>
                                <option value="">Select a time slot</option>
                                <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                                <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Step 2: Address */}
                {step === 2 && (
                    <div className="animate-fade-in">
                        <h3 className="text-h3" style={{ marginBottom: '16px' }}>Service Location</h3>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={styles.label}>Full Address</label>
                            <textarea
                                className="input-field"
                                rows="4"
                                placeholder="Enter your complete address..."
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                    <div className="animate-fade-in">
                        <h3 className="text-h3" style={{ marginBottom: '16px' }}>Payment Method</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                            <label style={{ ...styles.paymentOption, borderColor: payment === 'card' ? 'var(--primary)' : 'var(--border-color)' }}>
                                <input type="radio" name="payment" value="card" checked={payment === 'card'} onChange={() => setPayment('card')} />
                                <span style={{ marginLeft: '8px', fontWeight: '500' }}>Credit / Debit Card</span>
                            </label>
                            <label style={{ ...styles.paymentOption, borderColor: payment === 'cash' ? 'var(--primary)' : 'var(--border-color)' }}>
                                <input type="radio" name="payment" value="cash" checked={payment === 'cash'} onChange={() => setPayment('cash')} />
                                <span style={{ marginLeft: '8px', fontWeight: '500' }}>Cash on Completion</span>
                            </label>
                        </div>

                        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-sm)' }}>
                            <div className="flex-between" style={{ marginBottom: '8px' }}>
                                <span className="text-body">Service Fee</span>
                                <span>$50.00</span>
                            </div>
                            <div className="flex-between" style={{ marginBottom: '8px' }}>
                                <span className="text-body">Taxes</span>
                                <span>$5.00</span>
                            </div>
                            <div className="flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '8px', fontWeight: 'bold' }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>$55.00</span>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
                    {step > 1 && (
                        <button className="btn-outline" onClick={() => setStep(step - 1)}>
                            Back
                        </button>
                    )}
                    <button
                        className="btn-primary"
                        onClick={handleNext}
                        disabled={(step === 1 && (!date || !time)) || (step === 2 && !address)}
                    >
                        {step === 3 ? 'Confirm Booking' : 'Next Step'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    stepIndicator: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 1,
        backgroundColor: 'var(--card-bg)',
        padding: '0 10px',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '500',
        color: 'var(--text-main)',
    },
    paymentOption: {
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        border: '1px solid',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        transition: 'var(--transition-normal)'
    }
};

export default BookingFlow;
