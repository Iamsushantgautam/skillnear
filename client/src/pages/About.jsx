import React from 'react';
import { Target, Users, ShieldCheck, Heart } from 'lucide-react';

const About = () => {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
            {/* Hero Section */}
            <header style={{ 
                background: 'linear-gradient(135deg, #003d9b 0%, #1e40af 100%)', 
                padding: '100px 20px', 
                textAlign: 'center', 
                color: 'white' 
            }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '24px' }}>Empowering Local Skill</h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9, lineHeight: 1.6 }}>
                        SkillNear is on a mission to bridge the gap between talented local professionals and people who need their expertise.
                    </p>
                </div>
            </header>

            {/* Our Values */}
            <section style={{ padding: '80px 20px', backgroundColor: '#f8fafc' }}>
                <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b' }}>Why We Exist</h2>
                        <div style={{ width: '60px', height: '4px', background: '#003d9b', margin: '20px auto' }}></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                        <div style={styles.card}>
                            <Target size={40} color="#003d9b" style={{ marginBottom: 20 }} />
                            <h3 style={styles.cardTitle}>Impactful</h3>
                            <p style={styles.cardText}>We aim to create real economic opportunities for skilled individuals in every neighborhood.</p>
                        </div>
                        <div style={styles.card}>
                            <ShieldCheck size={40} color="#003d9b" style={{ marginBottom: 20 }} />
                            <h3 style={styles.cardTitle}>Trustworthy</h3>
                            <p style={styles.cardText}>Safety and reliability are our top priorities. Every pro is verified and rated by the community.</p>
                        </div>
                        <div style={styles.card}>
                            <Users size={40} color="#003d9b" style={{ marginBottom: 20 }} />
                            <h3 style={styles.cardTitle}>Community-First</h3>
                            <p style={styles.cardText}>We believe in the power of local connection. Supporting local shops means growing together.</p>
                        </div>
                        <div style={styles.card}>
                            <Heart size={40} color="#003d9b" style={{ marginBottom: 20 }} />
                            <h3 style={styles.cardTitle}>Dedicated</h3>
                            <p style={styles.cardText}>We are obsessed with customer satisfaction and providing the smoothest booking experience.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section style={{ padding: '80px 20px' }}>
                <div className="container" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '60px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '24px', color: '#1e293b' }}>Our Journey</h2>
                        <p style={{ color: '#64748b', lineHeight: 1.8, marginBottom: '20px', fontSize: '1.1rem' }}>
                            Launched in 2024, SkillNear started with a simple observation: finding a reliable plumber, electrician, or a local tutor was harder than it should be in the digital age.
                        </p>
                        <p style={{ color: '#64748b', lineHeight: 1.8, fontSize: '1.1rem' }}>
                            We set out to build a platform that doesn't just list services, but builds careers. Today, we support thousands of professionals across India, helping them showcase their work and manage their business efficiently.
                        </p>
                    </div>
                    <div style={{ flex: 1, minWidth: '300px', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                        <img 
                            src="https://images.unsplash.com/photo-1522071823991-b9671f9d7f1f?auto=format&fit=crop&q=80&w=1000" 
                            alt="Our Team" 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const styles = {
    card: {
        background: 'white',
        padding: '40px',
        borderRadius: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        border: '1px solid #f1f5f9',
        textAlign: 'center',
        transition: 'all 0.3s'
    },
    cardTitle: {
        fontSize: '1.25rem',
        fontWeight: 700,
        color: '#1e293b',
        marginBottom: '12px'
    },
    cardText: {
        color: '#64748b',
        fontSize: '0.95rem',
        lineHeight: 1.6
    }
};

export default About;
