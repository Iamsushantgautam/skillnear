import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();
    const { register, loading, error, user } = useAuthStore();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        const success = await register(name, email, password);
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="container flex-center" style={{ minHeight: '70vh', padding: '40px 20px' }}>
            <div className="card animate-fade-in" style={{ maxWidth: '450px', width: '100%' }}>
                <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '8px' }}>Create an Account</h2>
                <p className="text-body" style={{ textAlign: 'center', marginBottom: '24px' }}>
                    Join SkillNear to find or offer services
                </p>
                {error && <div style={{ color: 'white', backgroundColor: 'var(--danger)', padding: '10px', borderRadius: '4px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={styles.label}>Full Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Confirm Password</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '8px', width: '100%', padding: '12px' }} disabled={loading}>
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p className="text-body">
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '500' }}>
                            Sign In
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
