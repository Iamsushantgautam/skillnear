import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Mail, ShieldCheck, Lock, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { data } = await api.post('/api/auth/forgot-password', { email });
            setMessage(data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (otp.length !== 6) {
            return setError('OTP must be 6 digits');
        }

        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/api/auth/reset-password', {
                email,
                otp,
                newPassword
            });
            toast.success(data.message);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container flex-center" style={{ minHeight: '80vh', padding: '20px' }}>
            <div className="card animate-fade-in" style={{ maxWidth: '450px', width: '100%', position: 'relative', overflow: 'hidden' }}>

                {/* Progress Bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', backgroundColor: '#f1f5f9' }}>
                    <div style={{
                        width: step === 1 ? '50%' : '100%',
                        height: '100%',
                        backgroundColor: 'var(--primary)',
                        transition: 'width 0.4s ease'
                    }}></div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                        <ArrowLeft size={16} /> Back to Login
                    </Link>

                    <h2 className="text-h2" style={{ marginBottom: '8px' }}>
                        {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                    </h2>
                    <p className="text-body" style={{ fontSize: '0.95rem' }}>
                        {step === 1
                            ? "No worries, it happens. Enter your email and we'll send you a 6-digit OTP."
                            : `We've sent a 6-digit verification code to ${email}`}
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#fef2f2',
                        color: '#b91c1c',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem'
                    }}>
                        <ShieldCheck size={18} /> {error}
                    </div>
                )}

                {message && step === 2 && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#f0fdf4',
                        color: '#15803d',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '0.9rem'
                    }}>
                        {message}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email Address</label>
                            <div style={styles.inputWrapper}>
                                <Mail size={18} style={styles.icon} />
                                <input
                                    type="email"
                                    className="input-field"
                                    placeholder="Enter your email"
                                    style={{ paddingLeft: '42px' }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ height: '48px', gap: '10px' }} disabled={loading}>
                            {loading ? 'Sending...' : 'Send OTP'} <Send size={18} />
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Verification Code (OTP)</label>
                            <div style={styles.inputWrapper}>
                                <ShieldCheck size={18} style={styles.icon} />
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter 6-digit code"
                                    style={{ paddingLeft: '42px', letterSpacing: '4px', fontWeight: 'bold' }}
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>New Password</label>
                            <div style={styles.inputWrapper}>
                                <Lock size={18} style={styles.icon} />
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="Create new password"
                                    style={{ paddingLeft: '42px' }}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Confirm New Password</label>
                            <div style={styles.inputWrapper}>
                                <Lock size={18} style={styles.icon} />
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="Repeat new password"
                                    style={{ paddingLeft: '42px' }}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ height: '48px' }} disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>

                        <button
                            type="button"
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.9rem', cursor: 'pointer' }}
                            onClick={() => setStep(1)}
                        >
                            Use a different email address
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

const styles = {
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: '500',
        color: 'var(--text-main)'
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    icon: {
        position: 'absolute',
        left: '14px',
        color: 'var(--text-muted)'
    }
};

export default ForgotPassword;
