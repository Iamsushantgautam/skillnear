import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Mail, ShieldCheck, Lock, ArrowLeft, Send, Sparkles, KeyRound, CheckCircle2, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';

import '../styles/ForgotPassword.css';

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
        <div className="fp-split-layout">
            <div className="fp-sidebar">
                <div className="fp-sidebar-content">
                    <div className="fp-sidebar-tag">
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
                <KeyRound className="fp-sidebar-img" size={400} />
            </div>

            {/* Form Content Side */}
            <div className="fp-form-side">
                <div className="fp-form-box">
                    <Link to="/login" className="fp-back-btn">
                        <ArrowLeft size={18} />
                        <span>Return to Sign In</span>
                    </Link>

                    <div className="fp-card-header">
                        <div className="fp-step-indicator">
                            <div className={`indicator-dot ${step === 1 ? 'active' : 'inactive'}`}></div>
                            <div className={`indicator-dot ${step === 2 ? 'active' : 'inactive'}`}></div>
                        </div>
                        <h2 className="fp-card-title">
                            {step === 1 ? 'Lost your way?' : 'Verify Identity'}
                        </h2>
                        <p className="fp-card-subtitle">
                            {step === 1
                                ? "Enter your registered email or username to receive a secure 6-digit access code."
                                : <span>Security code dispatched to: <br /><strong>{maskEmail(displayEmail)}</strong></span>
                            }
                        </p>
                    </div>

                    {error && (
                        <div className="fp-error animate-fade-in">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp}>
                            <div className="fp-input-field">
                                <label className="fp-label">Identifier</label>
                                <div className="fp-input-wrap">
                                    <Mail className="fp-input-icon" size={22} />
                                    <input
                                        type="text"
                                        className="fp-main-input"
                                        placeholder="Email or username"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button type="submit" className="fp-submit-btn" disabled={loading}>
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
                            <div className="fp-input-field">
                                <label className="fp-label">Access Code</label>
                                <div className="fp-input-wrap">
                                    <Smartphone className="fp-input-icon" size={22} />
                                    <input
                                        type="text"
                                        className="fp-main-input otp-input"
                                        placeholder="000000"
                                        maxLength="6"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="fp-input-field">
                                <label className="fp-label">New Password</label>
                                <div className="fp-input-wrap">
                                    <Lock className="fp-input-icon" size={22} />
                                    <input
                                        type="password"
                                        className="fp-main-input"
                                        placeholder="New secure password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="fp-input-field">
                                <label className="fp-label">Confirm Password</label>
                                <div className="fp-input-wrap">
                                    <Lock className="fp-input-icon" size={22} />
                                    <input
                                        type="password"
                                        className="fp-main-input"
                                        placeholder="Repeat new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="fp-submit-btn" disabled={loading}>
                                {loading ? <RefreshCw className="spin" size={22} /> : 'Reset & Gain Access'}
                            </button>

                            <div className="resend-section">
                                <p className="resend-text">Didn't receive the code?</p>
                                <button
                                    type="button"
                                    className="resend-action"
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
