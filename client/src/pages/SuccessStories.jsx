import React from 'react';
import { Quote, Star, ArrowRight, TrendingUp, Award, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImg from '../assets/success_stories_hero.png';
import './SuccessStories.css';

const SuccessStories = () => {
    const PC = '#003d9b'; // Primary Color

    const stories = [
        {
            name: "Rajesh Kumar",
            role: "Professional Plumber",
            story: "Before SkillNear, I was struggling to find consistent work in Lucknow. Within 3 months of joining, my monthly income doubled. The direct chat feature helps me build trust with clients even before I visit them.",
            impact: "200% Income Growth",
            img: "https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            name: "Priya Sharma",
            role: "Mathematics Tutor",
            story: "I wanted to teach from home but didn't know how to reach students. SkillNear connected me with parents in my neighborhood who were looking for home tutors. I now have 12 regular students!",
            impact: "Full-time Home Career",
            img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
        },
        {
            name: "Amit Patel",
            role: "Graphic Designer",
            story: "Being a freelancer is hard when you can't find local clients. SkillNear allowed me to show my portfolio to local business owners who needed logos and branding. It's been a game-changer.",
            impact: "50+ Local Clients",
            img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
        },
        {
            name: "Anjali Devi",
            role: "Beauty Professional",
            story: "I opened my small salon but footfall was low. Using SkillNear's Shop Finder, customers in a 5km radius started finding me easily. My calendar is now booked a week in advance!",
            impact: "Sold-out Calendar",
            img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop"
        }
    ];

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            {/* Hero Section */}
            <div className="ss-hero">
                <img
                    src={heroImg}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                    alt="Success Stories"
                />
                <div className="ss-hero-content">
                    <div className="container">
                        <div style={{ maxWidth: '600px' }}>
                            <h1 className="ss-hero-title">
                                Changing Lives, One <span style={{ color: '#60a5fa' }}>Skill</span> at a Time.
                            </h1>
                            <p className="ss-hero-desc">
                                Discover how thousands of professionals and customers are thriving together on India's most trusted skill platform.
                            </p>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <Link to="/services" className="btn-primary" style={{ borderRadius: '100px', textDecoration: 'none' }}>Start Your Story</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '40px 20px' }}>
                <div className="container">
                    <div className="ss-stats-grid">
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: PC }}>10k+</div>
                            <div style={{ color: '#64748b', fontWeight: '600' }}>Active Professionals</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: PC }}>50k+</div>
                            <div style={{ color: '#64748b', fontWeight: '600' }}>Completed Jobs</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: PC }}>4.8/5</div>
                            <div style={{ color: '#64748b', fontWeight: '600' }}>Average Rating</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: PC }}>₹5Cr+</div>
                            <div style={{ color: '#64748b', fontWeight: '600' }}>Earned by Experts</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stories Grid */}
            <div className="ss-section-padding">
                <div className="container">
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b', textAlign: 'center', marginBottom: '60px' }}>Featured Stories</h2>

                    <div className="ss-stories-grid">
                        {stories.map((story, idx) => (
                            <div key={idx} className="ss-story-card">
                                <img src={story.img} style={{ width: '100px', height: '100px', borderRadius: '24px', objectFit: 'cover' }} alt={story.name} />
                                <div style={{ flex: 1 }}>
                                    <Quote size={32} color={PC} style={{ opacity: 0.2, marginBottom: '8px' }} />
                                    <p style={{ fontSize: '1.05rem', color: '#334155', fontStyle: 'italic', lineHeight: '1.6', marginBottom: '24px' }}>
                                        "{story.story}"
                                    </p>
                                    <div className="ss-story-footer" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <div>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>{story.name}</h4>
                                            <p style={{ fontSize: '0.85rem', color: PC, fontWeight: '700' }}>{story.role}</p>
                                        </div>
                                        <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800' }}>
                                            {story.impact}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div style={{ backgroundColor: '#1e293b', padding: '100px 20px', color: '#fff', textAlign: 'center' }} className="ss-section-padding">
                <div className="container" style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <Heart size={48} color="#ef4444" fill="#ef4444" style={{ marginBottom: '24px' }} />
                    <h2 className="ss-cta-title">Ready to start your own success journey?</h2>
                    <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '40px' }}>Join India's fastest-growing network of local experts and customers. It's free to get started.</p>
                    <div className="ss-cta-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <Link to="/register" className="btn-primary" style={{ borderRadius: '100px', padding: '16px 40px', textDecoration: 'none' }}>Join as Professional</Link>
                        <Link to="/services" style={{ color: '#fff', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Browse Services <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessStories;
