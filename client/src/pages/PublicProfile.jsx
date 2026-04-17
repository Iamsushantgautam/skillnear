import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Briefcase, Calendar, MessageSquare, Loader, CheckCircle } from 'lucide-react';
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
            <div className="container flex-center" style={{ minHeight: '60vh' }}>
                <Loader className="spin" size={32} style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container flex-center" style={{ minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 className="text-h2">User Not Found</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>The profile you're looking for doesn't exist or has been moved.</p>
                    <Link to="/services" className="btn-primary">Browse Services</Link>
                </div>
            </div>
        );
    }

    const { user, services } = profile;

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            {/* Profile Header */}
            <div className="card animate-fade-in" style={{ padding: '48px', marginBottom: '40px', display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
                <img 
                    src={user.avatar && user.avatar.startsWith('http') ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ede9fe&color=4f46e5&size=200`} 
                    alt={user.name} 
                    style={{ width: '160px', height: '160px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary)' }}
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ede9fe&color=4f46e5&size=200`; }}
                />
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h1 className="text-h1" style={{ fontSize: '2.5rem', marginBottom: 0 }}>{user.name}</h1>
                        {user.providerDetails?.isApproved && <CheckCircle size={24} color="var(--primary)" fill="#ede9fe" />}
                    </div>
                    <p className="text-body" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '16px' }}>@{user.username}</p>
                    
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Briefcase size={18} color="var(--primary)" />
                            <span style={{ fontWeight: 600 }}>{user.providerDetails?.title || 'Professional'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Star size={18} color="#f59e0b" fill="#f59e0b" />
                            <span>4.9 (24 reviews)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={18} color="var(--text-muted)" />
                            <span>Joined {new Date(user.createdAt).getFullYear()}</span>
                        </div>
                    </div>

                    <p className="text-body" style={{ lineHeight: '1.6', maxWidth: '800px' }}>
                        {user.providerDetails?.about || "This provider hasn't shared a bio yet. They prefer to let their work speak for itself!"}
                    </p>
                </div>
                <div style={{ minWidth: '200px' }}>
                    <Link to={`/chat?provider=${user._id}`} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px' }}>
                        <MessageSquare size={18} /> Contact Provider
                    </Link>
                </div>
            </div>

            {/* Services/Gigs List */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h2 className="text-h2" style={{ marginBottom: '8px' }}>Services & Gigs</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Direct services offered by {user.name.split(' ')[0]}</p>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{services.length} active listings</div>
            </div>

            {services.length === 0 ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderStyle: 'dashed' }}>
                    <p style={{ color: 'var(--text-muted)' }}>This user hasn't listed any public services yet.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {services.map(gig => (
                        <Link to={`/services/${gig._id}`} key={gig._id} className="card gig-card-minimal rotate-hover animate-fade-in" style={{ textDecoration: 'none', color: 'inherit', padding: '16px' }}>
                            <div style={{ height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                                <img 
                                    src={gig.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=f3f4f6&color=4f46e5&size=400`} 
                                    alt={gig.title} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=f3f4f6&color=4f46e5&size=400`; }}
                                />
                            </div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '8px', height: '2.6rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {gig.title}
                            </h3>
                            <div className="flex-between" style={{ marginTop: '12px' }}>
                                <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.25rem' }}>₹{gig.price}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Star size={15} color="#f59e0b" fill="#f59e0b" />
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{gig.rating || 'N/A'}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PublicProfile;
