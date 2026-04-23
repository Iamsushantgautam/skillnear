import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Briefcase, Calendar, MessageSquare, Loader, CheckCircle, Share2, Shield, Award, Clock } from 'lucide-react';
import api from '../utils/api';

const PublicProfile = () => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get(`/api/users/public/${username}`);
                setProfile(data);
            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <Loader className="animate-spin" size={40} style={{ color: '#003d9b' }} />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
                <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: '#fff', padding: '40px', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: '80px', height: '80px', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <Shield size={40} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#191b23', marginBottom: '12px' }}>Profile Not Found</h2>
                    <p style={{ color: '#64748b', marginBottom: '32px', lineHeight: 1.6 }}>The professional profile you are looking for does not exist or has been removed.</p>
                    <Link to="/services" style={{ display: 'inline-block', backgroundColor: '#003d9b', color: '#fff', padding: '12px 32px', borderRadius: '9999px', fontWeight: 700, textDecoration: 'none', transition: 'all 0.3s' }}>Browse Services</Link>
                </div>
            </div>
        );
    }

    const { user, services } = profile;

    return (
        <div style={{ backgroundColor: '#faf8ff', minHeight: '100vh', paddingBottom: '100px', marginTop: '-4.4rem' }}>
            {/* Premium Hero Header */}
            <div style={{ position: 'relative', height: '240px', background: 'linear-gradient(135deg, #003d9b 0%, #0052cc 100%)', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
            </div>

            <div className="container" style={{ maxWidth: '1100px', margin: '-100px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
                <div style={{ backgroundColor: '#fff', borderRadius: '32px', padding: '40px', boxShadow: '0 20px 50px rgba(0, 61, 155, 0.08)', display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start' }}>

                    {/* Avatar Column */}
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '180px', height: '180px', borderRadius: '40px', padding: '8px', backgroundColor: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                            <img
                                src={user.avatar && user.avatar.startsWith('http') ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ede9fe&color=4f46e5&size=200`}
                                alt={user.name}
                                style={{ width: '100%', height: '100%', borderRadius: '32px', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ede9fe&color=4f46e5&size=200`; }}
                            />
                        </div>
                        {user.providerDetails?.isApproved && (
                            <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', backgroundColor: '#003d9b', color: '#fff', padding: '8px', borderRadius: '16px', border: '4px solid #fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={16} fill="white" color="#003d9b" />
                            </div>
                        )}
                    </div>

                    {/* Info Column */}
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#191b23', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>{user.name}</h1>
                                <p style={{ fontSize: '1.125rem', color: '#64748b', fontWeight: 600, margin: 0 }}>@{user.username}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button style={{ width: '44px', height: '44px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <Share2 size={20} />
                                </button>
                                <Link to={`/chat?provider=${user._id}`} style={{ backgroundColor: '#003d9b', color: '#fff', padding: '0 24px', borderRadius: '14px', height: '44px', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0, 61, 155, 0.2)' }}>
                                    <MessageSquare size={18} /> Contact
                                </Link>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', margin: '24px 0', padding: '20px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#003d9b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Briefcase size={18} />
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Specialty</span>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{user.providerDetails?.title || 'Professional'}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Star size={18} fill="#f59e0b" />
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Rating</span>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>4.9 <span style={{ fontWeight: 500, color: '#64748b' }}>(24 reviews)</span></span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f8fafc', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Member Since</span>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{new Date(user.createdAt).getFullYear()}</span>
                                </div>
                            </div>
                        </div>

                        <p style={{ fontSize: '1.05rem', color: '#434654', lineHeight: 1.7, margin: 0 }}>
                            {user.providerDetails?.about || "This provider hasn't shared a bio yet. They prefer to let their work speak for itself!"}
                        </p>
                    </div>
                </div>

                {/* Section Header */}
                <div style={{ marginTop: '60px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#191b23', margin: 0, letterSpacing: '-0.02em' }}>Available Services</h2>
                        <p style={{ color: '#64748b', marginTop: '4px', fontWeight: 500 }}>Direct services offered by {user.name.split(' ')[0]}</p>
                    </div>
                    <span style={{ backgroundColor: '#fff', padding: '6px 16px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 700, color: '#003d9b', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                        {services.length} Listings
                    </span>
                </div>

                {services.length === 0 ? (
                    <div style={{ backgroundColor: '#fff', borderRadius: '32px', padding: '80px 40px', textAlign: 'center', border: '2px dashed #e2e8f0' }}>
                        <div style={{ width: '64px', height: '64px', backgroundColor: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Award size={32} color="#cbd5e1" />
                        </div>
                        <p style={{ color: '#64748b', fontSize: '1.125rem', fontWeight: 500 }}>This user hasn't listed any public services yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                        {services.map(gig => (
                            <Link to={`/services/${gig._id}`} key={gig._id} style={{ textDecoration: 'none', color: 'inherit', group: 'true' }}>
                                <div style={{
                                    backgroundColor: '#fff',
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                    transition: 'all 0.3s ease',
                                    border: '1px solid #f1f5f9',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)'; }}
                                >
                                    <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                                        <img
                                            src={gig.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=f3f4f6&color=4f46e5&size=400`}
                                            alt={gig.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=f3f4f6&color=4f46e5&size=400`; }}
                                        />
                                        <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '12px', fontWeight: 800, color: '#003d9b', fontSize: '0.9rem' }}>
                                            ₹{gig.price}
                                        </div>
                                    </div>
                                    <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                            <div style={{ backgroundColor: '#f0f9ff', color: '#0ea5e9', fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>{gig.category || 'Service'}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Star size={12} fill="#f59e0b" color="#f59e0b" />
                                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{gig.rating || '4.9'}</span>
                                            </div>
                                        </div>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#191b23', margin: '0 0 16px 0', lineHeight: 1.4, height: '3.1rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {gig.title}
                                        </h3>
                                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '16px', borderTop: '1px solid #f8fafc' }}>
                                            <Clock size={14} color="#94a3b8" />
                                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Usually responds in 1 hour</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicProfile;
