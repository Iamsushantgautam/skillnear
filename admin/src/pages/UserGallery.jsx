import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Maximize2, Trash2, RotateCcw, Filter, ExternalLink, Images } from 'lucide-react';

const UserGallery = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [deletedUrls, setDeletedUrls] = useState([]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const { data: resData } = await api.get(`/api/admin/users/${id}/full-details`);
            setData(resData);
        } catch (err) {
            console.error("Error fetching gallery data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchDetails();
    }, [id]);

    const allImages = useMemo(() => {
        if (!data) return [];
        const imgs = [];
        if (data.user?.avatar && !data.user.avatar.includes('placeholder')) {
            imgs.push({ url: data.user.avatar, type: 'profile', source: 'Avatar' });
        }
        if (data.user?.providerDetails?.images) {
            data.user.providerDetails.images.forEach(url => imgs.push({ url, type: 'identity', source: 'ID/Shop' }));
        }
        if (data.gigs) {
            data.gigs.forEach(gig => {
                if (gig.images) gig.images.forEach(url => imgs.push({ url, type: 'gig', source: `Gig: ${gig.title}` }));
            });
        }
        return imgs;
    }, [data]);

    const filtered = allImages.filter(img => {
        const matchesType = filter === 'all' || img.type === filter;
        const isDeleted = deletedUrls.includes(img.url);
        if (filter === 'deleted') return isDeleted;
        return matchesType && !isDeleted;
    });

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner"></div></div>;
    if (!data) return <div>User not found.</div>;

    return (
        <div style={{ padding: '40px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: '600', border: 'none', background: 'none', cursor: 'pointer', marginBottom: '8px' }}>
                            <ArrowLeft size={18} /> Back to Profile
                        </button>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Images size={40} color="var(--primary)" /> {data.user.name}'s Media Vault
                        </h1>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', backgroundColor: '#fff', padding: '8px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        {['all', 'gig', 'identity', 'profile', 'deleted'].map(t => (
                            <button 
                                key={t}
                                onClick={() => setFilter(t)}
                                style={{ 
                                    padding: '10px 20px', 
                                    borderRadius: '10px', 
                                    border: 'none', 
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    backgroundColor: filter === t ? (t === 'deleted' ? '#ef4444' : 'var(--primary)') : 'transparent',
                                    color: filter === t ? 'white' : '#64748b',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {t === 'identity' ? 'ID/Shop' : t} {t === 'deleted' && `(${deletedUrls.length})`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Gallery Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {filtered.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '24px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                            <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            
                            {/* Overlay Info */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div style={{ color: 'white' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.1em' }}>{img.type}</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{img.source}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        onClick={() => window.open(img.url, '_blank')}
                                        style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                                    >
                                        <ExternalLink size={18} />
                                    </button>
                                    {filter === 'deleted' ? (
                                        <button 
                                            onClick={() => setDeletedUrls(prev => prev.filter(u => u !== img.url))}
                                            style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', backgroundColor: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >
                                            <RotateCcw size={18} />
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => setDeletedUrls(prev => [...prev, img.url])}
                                            style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', backgroundColor: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>
                        <Images size={64} style={{ marginBottom: '16px', opacity: 0.2 }} />
                        <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>No images found for this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserGallery;
