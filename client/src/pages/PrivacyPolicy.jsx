import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: 'clamp(20px, 5vw, 60px) 16px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', padding: 'clamp(24px, 6vw, 60px)', borderRadius: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 900, marginBottom: '10px', color: '#1e293b' }}>Privacy Policy</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '40px' }}>Last updated: April 19, 2026</p>

                <div style={styles.section}>
                    <h2 style={styles.heading}>1. Information We Collect</h2>
                    <p style={styles.text}>
                        We collect information you provide directly to us when you create an account, update your profile, use our messaging features, or book services. This may include your name, email, phone number, location, and payment details.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>2. How We Use Your Information</h2>
                    <p style={styles.text}>
                        We use the information to facilitate bookings, improve our services, communicate with you about your account, and provide customer support. We also use location data to show you the most relevant local service providers.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>3. Sharing of Information</h2>
                    <p style={styles.text}>
                        We share necessary details (like name and service location) between customers and service providers to ensure successful service delivery. We do not sell your personal information to third parties.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>4. Data Security</h2>
                    <p style={styles.text}>
                        We implement strict security measures to protect your data. This includes encryption of sensitive data and secure server protocols. However, no method of transmission over the internet is 100% secure.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>5. Your Rights</h2>
                    <p style={styles.text}>
                        You have the right to access, correct, or delete your personal data at any time through your profile settings. For any specific data requests, you can reach out to our support team.
                    </p>
                </div>

                <div style={{ marginTop: '60px', padding: '30px', background: '#f0f4ff', borderRadius: '20px', border: '1px solid #dbeafe' }}>
                    <h3 style={{ ...styles.heading, marginBottom: '10px' }}>Questions?</h3>
                    <p style={{ ...styles.text, marginBottom: 0 }}>
                        If you have any questions about this Privacy Policy, please contact us at <strong>privacy@skillnear.com</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    section: {
        marginBottom: '40px'
    },
    heading: {
        fontSize: '1.4rem',
        fontWeight: 800,
        color: '#1e293b',
        marginBottom: '16px'
    },
    text: {
        fontSize: '1.05rem',
        lineHeight: 1.7,
        color: '#64748b'
    }
};

export default PrivacyPolicy;
