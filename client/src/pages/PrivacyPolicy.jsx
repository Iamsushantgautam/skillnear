import React from 'react';
import '../styles/LegalPages.css';

const sections = [
    {
        title: 'Information We Collect',
        content: 'We collect information you provide directly to us when you create an account, update your profile, use our messaging features, or book services. This may include your name, email, phone number, location, and payment details.'
    },
    {
        title: 'How We Use Your Information',
        content: 'We use the information to facilitate bookings, improve our services, communicate with you about your account, and provide customer support. We also use location data to show you the most relevant local service providers.'
    },
    {
        title: 'Sharing of Information',
        content: 'We share necessary details (like name and service location) between customers and service providers to ensure successful service delivery. We do not sell your personal information to third parties.'
    },
    {
        title: 'Data Security',
        content: 'We implement strict security measures to protect your data. This includes encryption of sensitive data and secure server protocols. However, no method of transmission over the internet is 100% secure.'
    },
    {
        title: 'Your Rights',
        content: 'You have the right to access, correct, or delete your personal data at any time through your profile settings. For any specific data requests, you can reach out to our support team.'
    },
];

const PrivacyPolicy = () => {
    return (
        <div className="legal-container">

            {/* ── Page Header ── */}
            <header className="legal-hero">
                <div className="legal-hero-inner">
                    <span className="legal-badge">SkillNear · Legal Document</span>
                    <h1 className="legal-title">Privacy Policy</h1>
                    <div className="legal-meta-row">
                        <span className="legal-meta-item">Last updated: April 19, 2026</span>
                        <span className="legal-meta-dot" />
                        <span className="legal-meta-item">{sections.length} sections</span>
                        <span className="legal-meta-dot" />
                        <span className="legal-meta-item">~3 min read</span>
                    </div>
                </div>
            </header>

            {/* ── Two-Column Layout ── */}
            <div className="legal-layout">

                {/* Sidebar Table of Contents */}
                <aside className="legal-toc">
                    <p className="legal-toc-title">Contents</p>
                    <ul className="legal-toc-list">
                        {sections.map((s, i) => (
                            <li key={i} className="legal-toc-item">
                                <span className="legal-toc-number">0{i + 1}</span>
                                {s.title}
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Main Content */}
                <main className="legal-body">
                    {sections.map((section, index) => (
                        <section key={index} className="legal-section">
                            <div className="legal-section-header">
                                <span className="section-number">0{index + 1}</span>
                                <h2 className="legal-heading">{section.title}</h2>
                            </div>
                            <p className="legal-text">{section.content}</p>
                        </section>
                    ))}

                    {/* Contact Footer */}
                    <footer className="legal-footer">
                        <div className="legal-footer-text">
                            <p className="contact-title">Have questions about your data?</p>
                            <p className="legal-text">Our data protection team is ready to help.</p>
                        </div>
                        <a href="mailto:privacy@skillnear.com" className="contact-email">
                            privacy@skillnear.com
                        </a>
                    </footer>
                </main>

            </div>
        </div>
    );
};

export default PrivacyPolicy;
