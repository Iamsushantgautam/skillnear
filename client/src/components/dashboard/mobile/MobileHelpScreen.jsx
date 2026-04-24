import React from 'react';
import { MessageSquare, Phone, Mail } from 'lucide-react';
import { Shell } from './MobileDashboardShared';
import '../../../styles/mobile-dashboard-styles/MobileSupport.css';

export default function MobileHelpScreen({ setActiveTab }) {
    return (
        <Shell title="Help & Support" onBack={() => setActiveTab('overview')}>
            <div className="animate-fade-in" style={{ padding: '0 20px 100px' }}>
                <div className="support-header-card">
                    <div className="support-icon-wrapper">
                        <MessageSquare size={40} color="#003d9b" />
                    </div>
                    <h2 className="support-title">How can we help?</h2>
                    <p className="support-desc">Get in touch with our support team or browse our FAQs.</p>
                </div>

                <h3 className="support-section-title">Contact Us</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                    <a href="mailto:support@skillnear.com" className="contact-link">
                        <div className="contact-icon" style={{ background: '#eff6ff', color: '#0052cc' }}><Mail size={24} /></div>
                        <div className="contact-info">
                            <div className="contact-label">Email Support</div>
                            <div className="contact-value">support@skillnear.com</div>
                        </div>
                    </a>
                    <a href="tel:+18001234567" className="contact-link">
                        <div className="contact-icon" style={{ background: '#ecfdf5', color: '#059669' }}><Phone size={24} /></div>
                        <div className="contact-info">
                            <div className="contact-label">Call Us</div>
                            <div className="contact-value">+1 (800) 123-4567</div>
                        </div>
                    </a>
                </div>

                <h3 className="support-section-title">FAQs</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                        { q: 'How do I request a withdrawal?', a: 'Go to your Payments tab, ensure you have an available balance, and click "Withdraw".' },
                        { q: 'How do I contact a professional?', a: 'Once an order is placed, you can message them directly from the Order Details screen.' },
                        { q: 'What is a revision request?', a: "If a service isn't exactly what you wanted, you can request a revision from the professional." }
                    ].map((faq, i) => (
                        <div key={i} className="faq-card">
                            <h4 className="faq-question">{faq.q}</h4>
                            <p className="faq-answer">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Shell>
    );
}
