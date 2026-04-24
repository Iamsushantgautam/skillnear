import React from 'react';
import { Heart, Star, MapPin, Loader } from 'lucide-react';
import api from '../../../utils/api';
import { PC, Shell } from './MobileDashboardShared';
import '../../../styles/mobile-dashboard-styles/MobileListScreens.css';

export default function MobileFavoritesScreen({ favorites, favoritesLoading, fetchFavorites, setActiveTab, navigate, user }) {
    return (
        <Shell title="My Favorites" onBack={() => setActiveTab('overview')}>
            <div className="animate-fade-in" style={{ paddingBottom: 100 }}>
                {favoritesLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Loader className="animate-spin" /></div>
                ) : (!favorites || favorites.length === 0) ? (
                    <div className="empty-state-card">
                        <div className="empty-state-icon-wrapper" style={{ background: '#fff5f5' }}><Heart size={40} color="#fecaca" /></div>
                        <h3 className="empty-state-title">No favorites yet</h3>
                        <p className="empty-state-desc">Save the services you love and they will appear here!</p>
                        <button onClick={() => navigate('/services')} style={{ background: PC, color: 'white', border: 'none', borderRadius: 100, padding: '14px 28px', fontWeight: 800, fontSize: '0.9rem', marginTop: 24, boxShadow: '0 10px 20px rgba(0,61,155,0.2)' }}>Browse Services</button>
                    </div>
                ) : (
                    <div className="list-container">
                        {favorites.map(srv => (
                            <div key={srv._id} onClick={() => navigate(`/services/${srv._id}`)}
                                style={{ background: 'white', borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                                <div style={{ position: 'relative', width: '100%', height: 180 }}>
                                    <img
                                        src={srv.images && srv.images.length > 0 ? srv.images[0] : (srv.provider?.avatar && srv.provider.avatar.startsWith('http') ? srv.provider.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(srv.provider?.name || srv.title || 'S')}&background=f3f4f6&color=4f46e5&size=300`)}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        alt=""
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(srv.provider?.name || srv.title || 'S')}&background=f3f4f6&color=4f46e5&size=300`; }}
                                    />
                                    <div style={{ position: 'absolute', top: 12, left: 12 }}>
                                        <span style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800', color: PC, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{srv.category}</span>
                                    </div>
                                    <button onClick={async (e) => {
                                        e.stopPropagation();
                                        if (user?.token) {
                                            await api.post(`/api/users/favorites/${srv._id}`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
                                            fetchFavorites();
                                        }
                                    }} style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', backgroundColor: '#ef4444', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)' }}>
                                        <Heart size={16} fill="#fff" color="#fff" />
                                    </button>
                                </div>
                                <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>{srv.title || 'Untitled Service'}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                                        <Star size={14} fill="#fbbf24" color="#fbbf24" />
                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{srv.rating || '4.8'}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>({srv.numReviews || '0'})</span>
                                        <span style={{ margin: '0 4px', color: '#e2e8f0' }}>•</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: '0.8rem' }}>
                                            <MapPin size={12} /><span>{srv.location?.city || 'Remote'}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 16, marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <img src={srv.provider?.avatar && srv.provider.avatar.startsWith('http') ? srv.provider.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(srv.provider?.name || 'P')}&background=ede9fe&color=4f46e5&size=30`} style={{ borderRadius: '50%', width: 28, height: 28, objectFit: 'cover' }} alt="" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=P&background=ede9fe&color=4f46e5&size=30`; }} />
                                            <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>{srv.provider?.name || 'Professional'}</span>
                                        </div>
                                        {srv.businessType === 'shop' ? (
                                            <button style={{ backgroundColor: PC, color: '#fff', padding: '8px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '700', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const lat = srv.geoCoordinates?.coordinates?.[1];
                                                    const lng = srv.geoCoordinates?.coordinates?.[0];
                                                    const link = srv.shopDetails?.googleMapsLink || (lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null);
                                                    if (link) window.open(link, '_blank');
                                                }}>
                                                <MapPin size={14} /> Direction
                                            </button>
                                        ) : (
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Starting at</p>
                                                <span style={{ fontWeight: 900, color: PC, fontSize: '1.2rem' }}>₹{srv.price || 0}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Shell>
    );
}
