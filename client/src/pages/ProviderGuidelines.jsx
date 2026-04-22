import React from 'react';
import { ShieldCheck, Target, Clock, MessageSquare, Star, AlertTriangle, CheckCircle, ArrowRight, UserCheck, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProviderGuidelines = () => {
    const PC = '#003d9b'; // Primary Color

    const sections = [
        {
            title: "Professionalism & Conduct",
            icon: <UserCheck size={28} color={PC} />,
            points: [
                "Always maintain a polite and professional tone in chats and in-person.",
                "Arrive on time for scheduled appointments. If running late, notify the client immediately.",
                "Dress appropriately for the service you are providing.",
                "Maintain high standards of hygiene and cleanliness at the workspace."
            ]
        },
        {
            title: "Service Quality",
            icon: <Target size={28} color={PC} />,
            points: [
                "Describe your services accurately in your Gig listings.",
                "Only offer services you are qualified and skilled to perform.",
                "Deliver what was promised in the service description.",
                "Ensure customer satisfaction by completing the job to a high standard."
            ]
        },
        {
            title: "Communication & Response",
            icon: <MessageSquare size={28} color={PC} />,
            points: [
                "Respond to customer inquiries within 2-4 hours to improve your visibility.",
                "Be clear about pricing, timelines, and any additional costs upfront.",
                "Use the SkillNear chat for all official communications to ensure safety.",
                "Provide regular updates on the progress of long-term projects."
            ]
        },
        {
            title: "Platform Integrity",
            icon: <Scale size={28} color={PC} />,
            points: [
                "Do not ask customers to pay outside the platform if booked through SkillNear.",
                "Never share sensitive personal information (like bank passwords) with clients.",
                "Avoid creating duplicate accounts or listings.",
                "Do not manipulate ratings or reviews through fake feedback."
            ]
        }
    ];

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            {/* Header Section */}
            <div style={{ 
                background: `linear-gradient(135deg, ${PC} 0%, #001f4d 100%)`, 
                padding: '100px 20px', 
                color: '#fff', 
                textAlign: 'center' 
            }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ 
                        backgroundColor: 'rgba(255,255,255,0.1)', 
                        padding: '6px 16px', 
                        borderRadius: '100px', 
                        fontSize: '0.85rem', 
                        fontWeight: '700', 
                        textTransform: 'uppercase', 
                        letterSpacing: '1px',
                        marginBottom: '20px',
                        display: 'inline-block'
                    }}>
                        For Professionals
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '24px', lineHeight: '1.1' }}>
                        Provider <span style={{ color: '#60a5fa' }}>Guidelines</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, lineHeight: '1.6', maxWidth: '700px', margin: '0 auto' }}>
                        Maintaining a safe, professional, and high-quality marketplace is our top priority. These guidelines help you succeed as a SkillNear Provider.
                    </p>
                </div>
            </div>

            {/* Warning Banner */}
            <div style={{ backgroundColor: '#fff7ed', borderBottom: '1px solid #ffedd5', padding: '20px' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#9a3412', fontSize: '0.95rem' }}>
                    <AlertTriangle size={24} />
                    <span><strong>Important:</strong> Failure to follow these guidelines may result in temporary or permanent account suspension.</span>
                </div>
            </div>

            {/* Guidelines Grid */}
            <div style={{ padding: '80px 20px' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                        {sections.map((section, idx) => (
                            <div key={idx} style={{ 
                                padding: '32px', 
                                borderRadius: '24px', 
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                transition: 'transform 0.3s ease'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                        {section.icon}
                                    </div>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1e293b' }}>{section.title}</h3>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {section.points.map((point, i) => (
                                        <li key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px', color: '#475569', lineHeight: '1.5' }}>
                                            <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Account Status Levels */}
            <div style={{ backgroundColor: '#f1f5f9', padding: '100px 20px' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b' }}>Performance Standards</h2>
                        <p style={{ color: '#64748b' }}>We monitor these metrics to ensure the best experience for everyone.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
                        <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', textAlign: 'center' }}>
                            <Star size={40} color="#fbbf24" style={{ marginBottom: '16px' }} />
                            <h4 style={{ fontWeight: '800', fontSize: '1.2rem', marginBottom: '8px' }}>4.5+ Rating</h4>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Maintain a high rating to stay in the 'Featured' section.</p>
                        </div>
                        <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', textAlign: 'center' }}>
                            <Clock size={40} color="#3b82f6" style={{ marginBottom: '16px' }} />
                            <h4 style={{ fontWeight: '800', fontSize: '1.2rem', marginBottom: '8px' }}>Response Time</h4>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Aim for under 4 hours to convert more leads into bookings.</p>
                        </div>
                        <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', textAlign: 'center' }}>
                            <ShieldCheck size={40} color="#10b981" style={{ marginBottom: '16px' }} />
                            <h4 style={{ fontWeight: '800', fontSize: '1.2rem', marginBottom: '8px' }}>Zero-Tolerance</h4>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Safety violations or harassment result in immediate bans.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div style={{ padding: '100px 20px', textAlign: 'center' }}>
                <div className="container" style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b', marginBottom: '24px' }}>Ready to grow with us?</h2>
                    <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '40px' }}>Join a community of top-tier local professionals and take your business to the next level.</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        <Link to="/register" className="btn-primary" style={{ borderRadius: '100px', padding: '16px 40px', textDecoration: 'none' }}>Get Started Today</Link>
                        <Link to="/contact" style={{ color: PC, fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Have Questions? <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderGuidelines;
