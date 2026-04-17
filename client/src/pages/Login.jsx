import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const { login, loading, error, user } = useAuthStore();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="container flex-center" style={{ minHeight: '70vh' }}>
            <div className="card animate-fade-in" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '8px' }}>Welcome Back</h2>
                <p className="text-body" style={{ textAlign: 'center', marginBottom: '24px' }}>
                    Login to your SkillNear account
                </p>
                {error && <div style={{ color: 'white', backgroundColor: 'var(--danger)', padding: '10px', borderRadius: '4px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={styles.label}>Email Address or Username</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Enter your email or username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <label style={styles.label}>Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Forgot Password?</Link>
                        </div>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '8px', width: '100%', padding: '12px' }} disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p className="text-body">
                        New to SkillNear?{' '}
                        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '500' }}>
                            Create an account
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
