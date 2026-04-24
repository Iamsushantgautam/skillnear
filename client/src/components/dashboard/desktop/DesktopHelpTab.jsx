import React from 'react';
import { MessageSquare, Mail, Phone } from 'lucide-react';
import '../../../styles/desktop-dashboard-styles/DesktopHelpTab.css';

const DesktopHelpTab = () => {
    const faqs = [
        { 
            q: 'How do I request a withdrawal?', 
            a: 'Go to your Payments tab, ensure you have an available balance, and click "Withdraw".' 
        },
        { 
            q: 'How do I contact a professional?', 
            a: 'Once an order is placed, you can message them directly from the Order Details screen.' 
        },
        { 
            q: 'What is a revision request?', 
            a: 'If a service isn\'t exactly what you wanted, you can request a revision from the professional.' 
        }
    ];

    return (
        <div className="help-tab-container animate-fade-in">
            <div className="help-header-card">
                <div className="help-icon-wrapper">
                    <MessageSquare size={40} color="#003d9b" />
                </div>
                <h2 className="help-title">How can we help you today?</h2>
                <p className="help-subtitle">
                    Get in touch with our support team or browse our FAQs to find answers to your questions.
                </p>
            </div>

            <div className="contact-grid">
                <a href="mailto:support@skillnear.com" className="contact-card">
                    <div className="contact-icon email">
                        <Mail size={32} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div className="contact-info-title">Email Support</div>
                        <div className="contact-info-detail">support@skillnear.com</div>
                    </div>
                </a>

                <a href="tel:+18001234567" className="contact-card">
                    <div className="contact-icon phone">
                        <Phone size={32} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div className="contact-info-title">Call Us</div>
                        <div className="contact-info-detail">+1 (800) 123-4567</div>
                    </div>
                </a>
            </div>

            <div className="faq-section">
                <h3 className="faq-title">Frequently Asked Questions</h3>
                <div className="faq-list">
                    {faqs.map((faq, i) => (
                        <div key={i} className="faq-item">
                            <h4 className="faq-question">{faq.q}</h4>
                            <p className="faq-answer">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DesktopHelpTab;
