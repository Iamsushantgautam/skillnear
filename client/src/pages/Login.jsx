import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, ArrowRight, ShieldCheck, KeyRound, AlertCircle, RefreshCw } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import '../styles/AuthPages.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { login, loading, error, user, clearError } = useAuthStore();
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
        const success = await login(email, password);
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
                        <span>Secure Session Management</span>
                    </div>
                    <h1>Unlock Your <br /> Potential Today</h1>
                    <p>
                        Log in to access your personalized dashboard, manage your services, 
                        and connect with the local experts in your area.
                    </p>
                </div>
                {/* Visual Accent */}
                <KeyRound className="auth-sidebar-img" size={400} />
            </div>

            {/* Form Content Side */}
            <div className="auth-form-side">
                <div className="auth-form-box">
                    <div className="auth-card-header">
                        <h2 className="auth-card-title">Welcome Back</h2>
                        <p className="auth-card-subtitle">
                            Enter your credentials to continue your journey.
                        </p>
                    </div>

                    {error && (
                        <div className="auth-error animate-fade-in">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={submitHandler}>
                        <div className="auth-input-field">
                            <label className="auth-label">Identifier</label>
                            <div className="auth-input-wrap">
                                <Mail className="auth-input-icon" size={22} />
                                <input
                                    type="text"
                                    className="auth-main-input"
                                    placeholder="Email or username"
                                    value={email}
                                    onChange={handleInputChange(setEmail)}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="auth-input-field">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <label className="auth-label" style={{ marginBottom: 0 }}>Password</label>
                                <Link to="/forgot-password" title="Recover account access" className="auth-forgot-link" style={{ marginBottom: 0, marginTop: 0 }}>
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="auth-input-wrap">
                                <Lock className="auth-input-icon" size={22} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="auth-main-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={handleInputChange(setPassword)}
                                    required
                                    style={{ paddingRight: '60px' }}
                                />
                                <button
                                    type="button"
                                    className="auth-input-eye"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? <RefreshCw className="spin" size={22} /> : (
                                <>
                                    <span>Sign Into Account</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            New to SkillNear? 
                            <Link to="/register" className="auth-link">Create an Account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
