import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, UserPlus, ArrowRight, ShieldCheck, KeyRound, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import '../styles/AuthPages.css';

const Register = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const { register, loading, error, user, clearError } = useAuthStore();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        if (user) {
            navigate(from, { replace: true });
        }
        return () => clearError();
    }, [user, navigate, clearError, from]);

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        if (error) clearError();
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        const success = await register(name, email, username, password, '');
        if (success) {
            navigate(from, { replace: true });
        }
    };

    return (
        <div className="auth-split-layout">
            {/* Sidebar Visual Content */}
            <div className="auth-sidebar">
                <div className="auth-sidebar-content">
                    <div className="auth-sidebar-tag">
                        <ShieldCheck size={16} />
                        <span>Trusted by Experts</span>
                    </div>
                    <h1>Join the <br /> Professional Network</h1>
                    <p>
                        Create your account today and unlock a world of opportunities. 
                        Connect with top-rated service providers or offer your own skills 
                        to your local community.
                    </p>
                </div>
                {/* Visual Accent */}
                <KeyRound className="auth-sidebar-img" size={400} />
            </div>

            {/* Form Content Side */}
            <div className="auth-form-side">
                <div className="auth-form-box" style={{ maxWidth: '520px' }}>
                    <div className="auth-card-header">
                        <h2 className="auth-card-title">Create Account</h2>
                        <p className="auth-card-subtitle">
                            Start your journey with SkillNear.
                        </p>
                    </div>

                    {error && (
                        <div className="auth-error animate-fade-in">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={submitHandler}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                            <div className="auth-input-field" style={{ marginBottom: 0 }}>
                                <label className="auth-label">Full Name</label>
                                <div className="auth-input-wrap">
                                    <User className="auth-input-icon" size={22} />
                                    <input
                                        type="text"
                                        className="auth-main-input"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={handleInputChange(setName)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="auth-input-field" style={{ marginBottom: 0 }}>
                                <label className="auth-label">Username</label>
                                <div className="auth-input-wrap">
                                    <UserPlus className="auth-input-icon" size={22} />
                                    <input
                                        type="text"
                                        className="auth-main-input"
                                        placeholder="johndoe123"
                                        value={username}
                                        onChange={handleInputChange(setUsername)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="auth-input-field">
                            <label className="auth-label">Email Address</label>
                            <div className="auth-input-wrap">
                                <Mail className="auth-input-icon" size={22} />
                                <input
                                    type="email"
                                    className="auth-main-input"
                                    placeholder="johndoe@example.com"
                                    value={email}
                                    onChange={handleInputChange(setEmail)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                            <div className="auth-input-field" style={{ marginBottom: 0 }}>
                                <label className="auth-label">Password</label>
                                <div className="auth-input-wrap">
                                    <Lock className="auth-input-icon" size={22} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="auth-main-input"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={handleInputChange(setPassword)}
                                        required
                                        style={{ paddingRight: '50px' }}
                                    />
                                    <button
                                        type="button"
                                        className="auth-input-eye"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="auth-input-field" style={{ marginBottom: 0 }}>
                                <label className="auth-label">Confirm</label>
                                <div className="auth-input-wrap">
                                    <Lock className="auth-input-icon" size={22} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="auth-main-input"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={handleInputChange(setConfirmPassword)}
                                        required
                                        style={{ paddingRight: '50px' }}
                                    />
                                    <button
                                        type="button"
                                        className="auth-input-eye"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? <RefreshCw className="spin" size={22} /> : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account? 
                            <Link to="/login" className="auth-link">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
