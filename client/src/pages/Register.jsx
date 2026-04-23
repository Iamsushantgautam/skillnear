import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

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

    useEffect(() => {
        if (user) {
            navigate('/');
        }
        return () => clearError();
    }, [user, navigate, clearError]);

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
            navigate('/');
        }
    };

    return (
        <div className="container flex-center" style={{ minHeight: '100vh', padding: '40px 20px' }}>
            <div className="card animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '64px', height: '64px', background: 'var(--primary)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 10px 20px rgba(0, 61, 155, 0.2)' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                    </div>
                    <h2 className="text-h2" style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>Create Account</h2>
                    <p style={{ color: '#64748b', fontWeight: 500 }}>Join SkillNear to find or offer services</p>
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

                <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={styles.label}>Full Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Skillnear Team"
                                style={{ padding: '12px 14px', borderRadius: '10px' }}
                                value={name}
                                onChange={handleInputChange(setName)}
                                required
                            />
                        </div>
                        <div>
                            <label style={styles.label}>Username</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="skillnear123"
                                style={{ padding: '12px 14px', borderRadius: '10px' }}
                                value={username}
                                onChange={handleInputChange(setUsername)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="skillnear@example.com"
                            style={{ padding: '12px 14px', borderRadius: '10px' }}
                            value={email}
                            onChange={handleInputChange(setEmail)}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={styles.label}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="input-field"
                                    placeholder="••••••••"
                                    style={{ padding: '12px 14px', borderRadius: '10px', paddingRight: '40px' }}
                                    value={password}
                                    onChange={handleInputChange(setPassword)}
                                    required
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', padding: '4px' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label style={styles.label}>Confirm</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="input-field"
                                    placeholder="••••••••"
                                    style={{ padding: '12px 14px', borderRadius: '10px', paddingRight: '40px' }}
                                    value={confirmPassword}
                                    onChange={handleInputChange(setConfirmPassword)}
                                    required
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', padding: '4px' }}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '12px', width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 800, fontSize: '1rem' }} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up Free'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '800' }}>
                            Sign In Instead
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

export default Register;
