import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div className="container">
                <div style={styles.grid}>
                    {/* Brand Col */}
                    <div style={styles.col}>
                        <h3 style={styles.logo}>SkillNear</h3>
                        <p style={styles.text}>
                            Connecting you with local shops and expert service providers. Reliable help is just around the corner.
                        </p>
                    </div>

                    {/* Links Col 1 */}
                    <div style={styles.col}>
                        <h4 style={styles.heading}>For Customers</h4>
                        <Link to="/services" style={styles.link}>Find a Service</Link>
                        <Link to="/how-it-works" style={styles.link}>How it Works</Link>
                    </div>

                    {/* Links Col 2 */}
                    <div style={styles.col}>
                        <h4 style={styles.heading}>For Professionals</h4>
                        <Link to="/register" style={styles.link}>Join as Professional</Link>
                        <Link to="/services" style={styles.link}>Provider Guidelines</Link>
                        <Link to="/success-stories" style={styles.link}>Success Stories</Link>
                    </div>

                    {/* Links Col 3 */}
                    <div style={styles.col}>
                        <h4 style={styles.heading}>Company</h4>
                        <Link to="/about" style={styles.link}>About Us</Link>
                        <Link to="/contact" style={styles.link}>Contact</Link>
                        <Link to="/privacy" style={styles.link}>Privacy Policy</Link>
                    </div>
                </div>

                <div style={styles.bottomBar}>
                    <p>&copy; {new Date().getFullYear()} SkillNear. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '60px',
        marginTop: 'auto',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '40px',
        marginBottom: '40px',
    },
    col: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: 'var(--primary)',
        marginBottom: '8px',
    },
    heading: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: 'var(--text-main)',
        marginBottom: '8px',
    },
    text: {
        color: 'var(--text-muted)',
        lineHeight: '1.6',
    },
    link: {
        color: 'var(--text-muted)',
        transition: 'color 0.2s',
        textDecoration: 'none',
    },
    bottomBar: {
        borderTop: '1px solid var(--border-color)',
        padding: '24px 0',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
    }
};

export default Footer;
