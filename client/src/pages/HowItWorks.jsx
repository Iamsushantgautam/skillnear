import React from 'react';
import { Search, MessageSquare, Calendar, Star, CheckCircle, ArrowRight, Shield, Zap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
    const PC = '#003d9b'; // Primary Color

    const steps = [
        {
            title: "Find the Perfect Expert",
            desc: "Browse through thousands of verified professionals in your local area. Filter by category, rating, and distance.",
            icon: <Search size={32} color={PC} />,
            color: '#e0f2fe'
        },
        {
            title: "Chat & Finalize",
            desc: "Use our built-in real-time chat to discuss your requirements, get quotes, and share details safely.",
            icon: <MessageSquare size={32} color={PC} />,
            color: '#dcfce7'
        },
        {
            title: "Book & Get it Done",
            desc: "Book your service with a single click. Our professionals come to your location to get the job done right.",
            icon: <Calendar size={32} color={PC} />,
            color: '#fef3c7'
        },
        {
            title: "Rate & Review",
            desc: "Once the job is complete, share your experience. Your feedback helps our community stay reliable.",
            icon: <Star size={32} color={PC} />,
            color: '#fae8ff'
        }
    ];

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            {/* Hero Section */}
            <div style={{ 
                background: `linear-gradient(135deg, ${PC} 0%, #001f4d 100%)`, 
                padding: '100px 20px', 
                color: '#fff', 
                textAlign: 'center' 
            }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <span style={{ 
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
                        Our Process
                    </span>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '24px', lineHeight: '1.1' }}>
                        How SkillNear <span style={{ color: '#60a5fa' }}>Works</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, lineHeight: '1.6', marginBottom: '40px' }}>
                        The simplest and most secure way to find, book, and work with local experts for all your home and professional needs.
                    </p>
                </div>
            </div>

            {/* Steps Section */}
            <div style={{ padding: '100px 20px' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
                        {steps.map((step, idx) => (
                            <div key={idx} style={{ textAlign: 'center' }}>
                                <div style={{ 
                                    width: '80px', 
                                    height: '80px', 
                                    backgroundColor: step.color, 
                                    borderRadius: '24px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    margin: '0 auto 24px',
                                    transform: 'rotate(-5deg)'
                                }}>
                                    <div style={{ transform: 'rotate(5deg)' }}>{step.icon}</div>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>{step.title}</h3>
                                <p style={{ color: '#64748b', lineHeight: '1.6' }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* User vs Provider Section */}
            <div style={{ backgroundColor: '#f8fafc', padding: '100px 20px' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' }}>
                        {/* For Customers */}
                        <div style={{ background: '#fff', padding: '40px', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ backgroundColor: PC, color: '#fff', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}><CheckCircle size={20} /></div>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1e293b' }}>For Customers</h3>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    "Browse verified local pros",
                                    "Compare prices and ratings",
                                    "Secure real-time messaging",
                                    "Safe and transparent bookings",
                                    "Verified customer support"
                                ].map((item, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', fontWeight: '500' }}>
                                        <div style={{ width: '6px', height: '6px', backgroundColor: PC, borderRadius: '50%' }}></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/services" className="btn-primary" style={{ marginTop: '32px', display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '100px', textDecoration: 'none' }}>
                                Find an Expert <ArrowRight size={18} />
                            </Link>
                        </div>

                        {/* For Providers */}
                        <div style={{ background: '#fff', padding: '40px', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)', border: `2px solid ${PC}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ backgroundColor: PC, color: '#fff', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}><Zap size={20} /></div>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1e293b' }}>For Professionals</h3>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    "List your skills as Gigs",
                                    "Set your own prices & hours",
                                    "Get leads from nearby users",
                                    "Grow your online reputation",
                                    "Zero hidden commission fees"
                                ].map((item, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', fontWeight: '500' }}>
                                        <div style={{ width: '6px', height: '6px', backgroundColor: PC, borderRadius: '50%' }}></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/dashboard" className="btn-primary" style={{ marginTop: '32px', display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '100px', textDecoration: 'none' }}>
                                Start Earning <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust Section */}
            <div style={{ padding: '100px 20px', textAlign: 'center' }}>
                <div className="container">
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b', marginBottom: '16px' }}>Why Trust SkillNear?</h2>
                    <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto 60px' }}>We've built the most reliable ecosystem for local commerce.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
                        <div style={{ padding: '24px' }}>
                            <Shield size={40} color={PC} style={{ marginBottom: '16px' }} />
                            <h4 style={{ fontWeight: '800', marginBottom: '8px' }}>Secure Platform</h4>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Encryption and privacy are our top priorities.</p>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <Users size={40} color={PC} style={{ marginBottom: '16px' }} />
                            <h4 style={{ fontWeight: '800', marginBottom: '8px' }}>Verified Pros</h4>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Every professional goes through a vetting process.</p>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <MessageSquare size={40} color={PC} style={{ marginBottom: '16px' }} />
                            <h4 style={{ fontWeight: '800', marginBottom: '8px' }}>24/7 Support</h4>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Our team is here to help you at every step.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;
