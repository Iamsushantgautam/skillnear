import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

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
        <div className="container flex-center" style={{ minHeight: '80vh', padding: '20px' }}>
            <div className="card animate-fade-in" style={{ maxWidth: '420px', width: '100%', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '64px', height: '64px', background: 'var(--primary)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 10px 20px rgba(0, 61, 155, 0.2)' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                    </div>
                    <h2 className="text-h2" style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>Welcome Back</h2>
                    <p style={{ color: '#64748b', fontWeight: 500 }}>Login to your SkillNear account</p>
                </div>

                {error && (
                    <div className="animate-shake" style={{
                        color: '#991b1b',
                        backgroundColor: '#fef2f2',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        border: '1px solid #fee2e2'
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={styles.label}>Email Address or Username</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="skillnear@example.com"
                            style={{ padding: '14px 16px', borderRadius: '12px' }}
                            value={email}
                            onChange={handleInputChange(setEmail)}
                            required
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={styles.label}>Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>Forgot Password?</Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input-field"
                                placeholder="••••••••"
                                style={{ padding: '14px 16px', borderRadius: '12px', paddingRight: '48px' }}
                                value={password}
                                onChange={handleInputChange(setPassword)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', padding: '4px' }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '12px', width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 800, fontSize: '1rem' }} disabled={loading}>
                        {loading ? 'Logging In...' : 'Log In'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                        New to SkillNear?{' '}
                        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '800' }}>
                            Create an Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    label: {
        display: 'block',
        marginBottom: '6px',
        fontWeight: '500',
        fontSize: '0.9rem',
        color: 'var(--text-main)',
    }
};

export default Login;
