import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Mail, ShieldCheck, Lock, ArrowLeft, Send, Sparkles, KeyRound, CheckCircle2, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';

import '../styles/AuthPages.css';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayEmail, setDisplayEmail] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    const navigate = useNavigate();

    const maskEmail = (email) => {
        if (!email) return '';
        const [local, domain] = email.split('@');
        if (local.length <= 3) return `${local.slice(0, 1)}*******${local.slice(-1)}@${domain}`;
        return `${local.slice(0, 3)}**********${local.slice(-3)}@${domain}`;
    };

    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [resendTimer]);

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/api/auth/forgot-password', { email: identifier });
            setDisplayEmail(data.email);
            setStep(2);
            setResendTimer(60);
            if (!e) toast.success('New code sent to your inbox!');
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Verification failed';
            setError(errMsg);
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return setError('Passwords do not match');
        if (otp.length !== 6) return setError('OTP must be 6 digits');

        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/api/auth/reset-password', {
                email: identifier,
                otp,
                newPassword
            });
            toast.success(data.message);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed');
            toast.error(err.response?.data?.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-split-layout">
            {/* Sidebar Visual Content */}
            <div className="auth-sidebar">
                <div className="auth-sidebar-content">
                    <div className="auth-sidebar-tag">
                        <ShieldCheck size={16} />
                        <span>Advanced Security Protocol</span>
                    </div>
                    <h1>Reclaim Your <br /> Account Access</h1>
                    <p>
                        We use military-grade encryption to ensure your account recovery is safe,
                        seamless, and protected against unauthorized access.
                    </p>
                </div>
                {/* Visual Accent */}
                <KeyRound className="auth-sidebar-img" size={400} />
            </div>

            {/* Form Content Side */}
            <div className="auth-form-side">
                <div className="auth-form-box">
                    <Link to="/login" className="auth-forgot-link" style={{ textAlign: 'left', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowLeft size={18} />
                        <span>Return to Sign In</span>
                    </Link>

                    <div className="auth-card-header">
                        <h2 className="auth-card-title">
                            {step === 1 ? 'Lost your way?' : 'Verify Identity'}
                        </h2>
                        <p className="auth-card-subtitle">
                            {step === 1
                                ? "Enter your registered email or username to receive a secure 6-digit access code."
                                : <span>Security code dispatched to: <br /><strong>{maskEmail(displayEmail)}</strong></span>
                            }
                        </p>
                    </div>

                    {error && (
                        <div className="auth-error animate-fade-in">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp}>
                            <div className="auth-input-field">
                                <label className="auth-label">Identifier</label>
                                <div className="auth-input-wrap">
                                    <Mail className="auth-input-icon" size={22} />
                                    <input
                                        type="text"
                                        className="auth-main-input"
                                        placeholder="Email or username"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? <RefreshCw className="spin" size={22} /> : (
                                    <>
                                        <span>Send Access Code</span>
                                        <Send size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <div className="auth-input-field">
                                <label className="auth-label">Access Code</label>
                                <div className="auth-input-wrap">
                                    <Smartphone className="auth-input-icon" size={22} />
                                    <input
                                        type="text"
                                        className="auth-main-input"
                                        placeholder="000000"
                                        maxLength="6"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        required
                                        autoFocus
                                        style={{ letterSpacing: '0.8em', textAlign: 'center', paddingLeft: '24px', fontFamily: 'monospace', fontSize: '1.5rem' }}
                                    />
                                </div>
                            </div>

                            <div className="auth-input-field">
                                <label className="auth-label">New Password</label>
                                <div className="auth-input-wrap">
                                    <Lock className="auth-input-icon" size={22} />
                                    <input
                                        type="password"
                                        className="auth-main-input"
                                        placeholder="New secure password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-input-field">
                                <label className="auth-label">Confirm Password</label>
                                <div className="auth-input-wrap">
                                    <Lock className="auth-input-icon" size={22} />
                                    <input
                                        type="password"
                                        className="auth-main-input"
                                        placeholder="Repeat new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? <RefreshCw className="spin" size={22} /> : 'Reset & Gain Access'}
                            </button>

                            <div className="auth-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
                                <p className="resend-text" style={{ marginBottom: '12px' }}>Didn't receive the code?</p>
                                <button
                                    type="button"
                                    style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0 auto' }}
                                    onClick={() => handleSendOtp()}
                                    disabled={resendTimer > 0 || loading}
                                >
                                    <RefreshCw size={18} className={loading ? 'spin' : ''} />
                                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Request New Code'}
                                </button>
                            </div>

                            <button
                                type="button"
                                style={{
                                    width: '100%',
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    marginTop: '24px',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                                onClick={() => setStep(1)}
                            >
                                Use different account details
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
