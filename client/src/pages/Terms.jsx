import React from 'react';
import '../styles/LegalPages.css';

const sections = [
    {
        title: 'Acceptance of Terms',
        content: 'By accessing and using SkillNear, you agree to comply with and be bound by these Terms & Conditions. If you do not agree, please refrain from using our platform.'
    },
    {
        title: 'Service Provider Responsibilities',
        content: 'Providers must provide accurate information about their skills, experience, and pricing. They are responsible for delivering services as described and maintaining professional conduct with customers.'
    },
    {
        title: 'Customer Responsibilities',
        content: 'Customers are responsible for providing accurate service locations and clear instructions. Payments must be made through our authorized channels according to the service agreement.'
    },
    {
        title: 'Platform Role',
        content: 'SkillNear acts as a marketplace that connects customers and providers. While we verify basic information, we are not directly responsible for the quality of service provided by independent professionals.'
    },
    {
        title: 'Cancellation and Refunds',
        content: 'Cancellations are subject to our specific refund policy depending on the timing and stage of the booking. Please review the booking details before confirming.'
    },
    {
        title: 'Intellectual Property',
        content: 'All content, logos, and software on SkillNear are the property of SkillNear and are protected by applicable intellectual property laws.'
    },
];

const Terms = () => {
    return (
        <div className="legal-container">

            {/* ── Page Header ── */}
            <header className="legal-hero">
                <div className="legal-hero-inner">
                    <span className="legal-badge">SkillNear · Legal Document</span>
                    <h1 className="legal-title">Terms & Conditions</h1>
                    <div className="legal-meta-row">
                        <span className="legal-meta-item">Last updated: April 19, 2026</span>
                        <span className="legal-meta-dot" />
                        <span className="legal-meta-item">{sections.length} sections</span>
                        <span className="legal-meta-dot" />
                        <span className="legal-meta-item">~4 min read</span>
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
                            <p className="contact-title">Questions about our terms?</p>
                            <p className="legal-text">Our legal team is here to assist you.</p>
                        </div>
                        <a href="mailto:legal@skillnear.com" className="contact-email">
                            legal@skillnear.com
                        </a>
                    </footer>
                </main>

            </div>
        </div>
    );
};

export default Terms;
