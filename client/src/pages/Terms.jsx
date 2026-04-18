import React from 'react';

const Terms = () => {
    return (
        <div style={{ backgroundColor: '#fdfbff', minHeight: '100vh', padding: 'clamp(20px, 5vw, 60px) 16px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', padding: 'clamp(24px, 6vw, 60px)', borderRadius: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 900, marginBottom: '10px', color: '#1e293b' }}>Terms & Conditions</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '40px' }}>Last updated: April 19, 2026</p>

                <div style={styles.section}>
                    <h2 style={styles.heading}>1. Acceptance of Terms</h2>
                    <p style={styles.text}>
                        By accessing and using SkillNear, you agree to comply with and be bound by these Terms & Conditions. If you do not agree, please refrain from using our platform.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>2. Service Provider Responsibilities</h2>
                    <p style={styles.text}>
                        Providers must provide accurate information about their skills, experience, and pricing. They are responsible for delivering services as described and maintaining professional conduct with customers.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>3. Customer Responsibilities</h2>
                    <p style={styles.text}>
                        Customers are responsible for providing accurate service locations and clear instructions. Payments must be made through our authorized channels according to the service agreement.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>4. Platform Role</h2>
                    <p style={styles.text}>
                        SkillNear acts as a marketplace that connects customers and providers. While we verify basic information, we are not directly responsible for the quality of service provided by independent professionals.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>5. Cancellation and Refunds</h2>
                    <p style={styles.text}>
                        Cancellations are subject to our specific refund policy depending on the timing and stage of the booking. Please review the booking details before confirming.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>6. Intellectual Property</h2>
                    <p style={styles.text}>
                        All content, logos, and software on SkillNear are the property of SkillNear and are protected by applicable intellectual property laws.
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

export default Terms;
