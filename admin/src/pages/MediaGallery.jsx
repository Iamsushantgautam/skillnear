import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
    Images, Search, Filter, Calendar, ExternalLink, 
    Trash2, Info, RotateCcw, X, CheckCircle 
} from 'lucide-react';

const MediaGallery = () => {
    const [media, setMedia] = useState([]);
    const [deletedItems, setDeletedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFallback, setIsFallback] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/api/admin/media');
            if (data.success) {
                setMedia(data.resources);
                setIsFallback(data.isFallback);
            }
        } catch (error) {
            console.error("Error fetching media gallery", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (item) => {
        setMedia(media.filter(m => m.asset_id !== item.asset_id));
        setDeletedItems([item, ...deletedItems]);
    };

    const handleRestore = (item) => {
        setDeletedItems(deletedItems.filter(m => m.asset_id !== item.asset_id));
        setMedia([item, ...media]);
    };

    const handlePermanentDelete = async (publicId) => {
        if (!window.confirm("Are you sure? This will PERMANENTLY delete the image from Cloudinary.")) return;
        try {
            const { data } = await api.delete(`/api/admin/media?publicId=${publicId}`);
            if (data.success) {
                setDeletedItems(deletedItems.filter(m => m.public_id !== publicId));
                alert("Deleted permanently from cloud.");
            }
        } catch (error) {
            alert("Failed to delete from cloud.");
        }
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    const getFilteredMedia = () => {
        let list = filter === 'trash' ? deletedItems : media;
        
        if (searchTerm.trim()) {
            list = list.filter(item => item.public_id.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (filter !== 'all' && filter !== 'trash') {
            if (filter === 'gig') {
                list = list.filter(item => item.public_id.includes('gig'));
            } else if (filter === 'profile') {
                list = list.filter(item => !item.public_id.includes('gig'));
            } else {
                list = list.filter(item => item.format === filter);
            }
        }

        return list;
    };

    const displayMedia = getFilteredMedia();

    return (
        <div style={{ padding: '30px' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Images size={36} color="var(--primary)" /> Media Vault
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>
                        {isFallback ? (
                            <span style={{ color: '#ef4444', fontWeight: '600' }}>'skillnear' folder not found. Showing root assets.</span>
                        ) : (
                            <>Managing assets in <strong>skillnear/</strong> Cloudinary folder.</>
                        )}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={fetchMedia} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RotateCcw size={16} /> Sync Cloud
                    </button>
                </div>
            </div>

            {/* Controls Bar */}
            <div style={{ 
                backgroundColor: '#fff', 
                padding: '20px', 
                borderRadius: '20px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
                marginBottom: '30px',
                display: 'flex',
                gap: '20px',
                alignItems: 'center'
            }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" 
                        placeholder="Search by filename or ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field"
                        style={{ width: '100%', paddingLeft: '48px' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px', padding: '4px', backgroundColor: '#f1f5f9', borderRadius: '12px' }}>
                    {['all', 'gig', 'profile', 'trash'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{ 
                                padding: '8px 20px', 
                                borderRadius: '10px', 
                                border: 'none', 
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                backgroundColor: filter === f ? (f === 'trash' ? '#ef4444' : 'var(--primary)') : 'transparent',
                                color: filter === f ? 'white' : '#64748b',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            {f === 'trash' ? <Trash2 size={14} /> : null}
                            {f} {f === 'trash' && deletedItems.length > 0 && `(${deletedItems.length})`}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="spinner"></div></div>
            ) : displayMedia.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px', backgroundColor: '#fff', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <Images size={40} color="#94a3b8" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Empty Gallery</h2>
                    <p style={{ color: '#64748b' }}>No assets match your current filters or search query.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                    {displayMedia.map(item => (
                        <div key={item.asset_id} className="card" style={{ padding: '0', overflow: 'hidden', position: 'relative', border: filter === 'trash' ? '2px solid #fee2e2' : '1px solid #e2e8f0' }}>
                            <div style={{ aspectRatio: '1/1', backgroundColor: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
                                <img 
                                    src={item.secure_url} 
                                    alt={item.public_id}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                />
                                
                                {/* Quick Actions Overlay */}
                                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                                    {filter === 'trash' ? (
                                        <>
                                            <button 
                                                onClick={() => handleRestore(item)}
                                                title="Restore Image"
                                                style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <RotateCcw size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handlePermanentDelete(item.public_id)}
                                                title="Delete Permanently"
                                                style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => window.open(item.secure_url, '_blank')}
                                                style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.9)', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                            >
                                                <ExternalLink size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item)}
                                                title="Move to Trash"
                                                style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {filter === 'trash' && (
                                    <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', fontWeight: '800', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                                        In Trash
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '16px' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
                                    {item.public_id.split('/').pop()}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>{item.width}x{item.height} • {item.format.toUpperCase()}</span>
                                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>{(item.bytes / 1024).toFixed(1)} KB</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MediaGallery;
