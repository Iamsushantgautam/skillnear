import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
    const [loading, setLoading] = useState(false);
    const formRef = React.useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(formRef.current);
        
        try {
            await fetch("https://formsubmit.co/witcet@zohomail.in", {
                method: "POST",
                body: formData,
                mode: 'no-cors'
            });
            toast.success("Message sent! We'll get back to you soon.");
            formRef.current.reset();
        } catch (error) {
            toast.error("Failed to send message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const faqs = [
        { q: "How do I book a service?", a: "Simply search for a service, select a provider, and click 'Book Now' to start the process." },
        { q: "Is it free to join as a professional?", a: "Yes! Joining SkillNear is free. We only take a small commission on successful bookings." },
        { q: "How can I track my order?", a: "You can track all your active orders in the 'My Orders' section of your dashboard." }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fafbff' }}>
            <style>{`
                .contact-input {
                    display: block !important;
                    width: 100% !important;
                    min-height: 52px !important;
                    padding: 14px 18px !important;
                    border-radius: 16px !important;
                    border: 2px solid #f1f5f9 !important;
                    background-color: #f8fafc !important;
                    font-size: 0.95rem !important;
                    box-sizing: border-box !important;
                    outline: none !important;
                    appearance: none !important;
                    -webkit-appearance: none !important;
                    transition: all 0.2s !important;
                    margin-top: 8px !important;
                }
                .contact-input:focus {
                    border-color: #003d9b !important;
                    background-color: #ffffff !important;
                    box-shadow: 0 0 0 4px rgba(0,61,155,0.05) !important;
                }
            `}</style>
            {/* Simple Hero */}
            <div style={{ background: '#003d9b', padding: '100px 24px', textAlign: 'center', color: 'white' }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontWeight: 900, marginBottom: 16 }}>Let's Connect</h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, lineHeight: 1.6 }}>We're here to support your journey with SkillNear. Reach out anytime!</p>
                </div>
            </div>

            <main className="container" style={{ maxWidth: 1200, margin: '-60px auto 100px', padding: '0 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
                    
                    {/* Contact Form Section */}
                    <section style={{ background: 'white', padding: '40px 32px', borderRadius: 32, boxShadow: '0 20px 50px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
                        <div style={{ marginBottom: 32 }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', marginBottom: 8 }}>Send a Message</h2>
                            <p style={{ color: '#64748b', fontWeight: 500 }}>Response time: Under 2 hours</p>
                        </div>
                        
                        <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={styles.label}>First Name</label>
                                    <input required name="first_name" className="contact-input" placeholder="Jane" />
                                </div>
                                <div>
                                    <label style={styles.label}>Last Name</label>
                                    <input required name="last_name" className="contact-input" placeholder="Doe" />
                                </div>
                            </div>
                            <div>
                                <label style={styles.label}>Email Address</label>
                                <input required name="email" type="email" className="contact-input" placeholder="jane@example.com" />
                            </div>
                            <div>
                                <label style={styles.label}>Subject</label>
                                <select name="subject" className="contact-input">
                                    <option>General Inquiry</option>
                                    <option>Technical Support</option>
                                    <option>Billing Question</option>
                                    <option>Become a Partner</option>
                                </select>
                            </div>
                            <div>
                                <label style={styles.label}>Describe your requirement</label>
                                <textarea required name="message" rows={4} className="contact-input" style={{ resize: 'none', height: 'auto' }} placeholder="Type your message here..." />
                            </div>
                            <button disabled={loading} style={styles.submitBtn}>
                                {loading ? 'Sending...' : <><Send size={18} /> Send Message</>}
                            </button>
                        </form>
                    </section>

                    {/* Info & FAQ Section */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        
                        {/* Quick Contact Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={styles.miniCard}>
                                <div style={styles.iconCircle}><Mail size={20} color="#003d9b" /></div>
                                <h4 style={styles.miniTitle}>Email</h4>
                                <p style={styles.miniText}>hello@skillnear.com</p>
                            </div>
                            <div style={styles.miniCard}>
                                <div style={styles.iconCircle}><Phone size={20} color="#003d9b" /></div>
                                <h4 style={styles.miniTitle}>Call Support</h4>
                                <p style={styles.miniText}>1800-SKILL-NEAR</p>
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div style={{ background: '#f8fafc', padding: 32, borderRadius: 32, border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 24, color: '#1e293b' }}>Common Questions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {faqs.map((f, i) => (
                                    <div key={i} style={{ borderBottom: i !== faqs.length-1 ? '1px solid #e2e8f0' : 'none', paddingBottom: 16 }}>
                                        <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b', marginBottom: 6 }}>{f.q}</p>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>{f.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Social Links */}
                        <div style={{ background: '#003d9b', padding: 24, borderRadius: 24, color: 'white', textAlign: 'center' }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Join our Community</h4>
                            <p style={{ margin: '4px 0 16px', fontSize: '0.85rem', opacity: 0.8 }}>Get daily tips and updates</p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                                {['Twitter', 'Instagram', 'LinkedIn'].map(s => (
                                    <button key={s} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{s}</button>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

const styles = {
    label: { display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { display: 'block', width: '100%', minHeight: '52px', padding: '14px 18px', borderRadius: 16, border: '2px solid #f1f5f9', backgroundColor: '#f8fafc', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' },
    submitBtn: { background: '#003d9b', color: 'white', border: 'none', padding: '18px', borderRadius: 16, fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
    miniCard: { background: 'white', padding: 24, borderRadius: 24, border: '1px solid #f1f5f9', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' },
    iconCircle: { width: 44, height: 44, borderRadius: '50%', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' },
    miniTitle: { margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' },
    miniText: { margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }
};

export default Contact;
