import React from 'react';
import { Heart, Loader, Star, MapPin } from 'lucide-react';
import '../../../styles/desktop-dashboard-styles/DesktopFavoritesTab.css';

const DesktopFavoritesTab = ({
    favorites = [],
    favoritesLoading,
    navigate
}) => {
    return (
        <div className="favorites-tab-container animate-fade-in">
            {favoritesLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <Loader className="animate-spin" />
                </div>
            ) : (!favorites || favorites.length === 0) ? (
                <div className="empty-favorites">
                    <Heart size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>No favorites yet</h3>
                    <p style={{ color: '#64748b' }}>Start exploring and save services you like!</p>
                    <button 
                        className="btn-primary browse-services-btn" 
                        onClick={() => navigate('/services')}
                    >
                        Browse Services
                    </button>
                </div>
            ) : (
                <div className="favorites-grid">
                    {favorites.map(srv => (
                        <div
                            key={srv._id}
                            className="card service-card-premium"
                            onClick={() => navigate(`/services/${srv._id}`)}
                            style={{
                                padding: 0,
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                textDecoration: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ position: 'relative', height: '180px' }}>
                                <img
                                    src={srv.images?.[0]?.url || srv.images?.[0]}
                                    alt={srv.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', padding: '6px', borderRadius: '50%', color: '#ef4444' }}>
                                    <Heart size={18} fill="#ef4444" />
                                </div>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', background: 'rgba(0,61,155,0.05)', padding: '4px 8px', borderRadius: '6px' }}>{srv.category}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Star size={14} fill="#d97706" color="#d97706" />
                                        <span style={{ fontSize: '0.875rem', fontWeight: '800', color: '#1e293b' }}>{srv.rating?.toFixed(1) || 'New'}</span>
                                    </div>
                                </div>
                                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px', lineHeight: 1.4 }}>{srv.title}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>
                                    <MapPin size={14} />
                                    <span>{srv.address?.city || 'Standard Delivery'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Price starting at</span>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#1e293b' }}>₹{srv.price}</div>
                                    </div>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                        <Loader size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DesktopFavoritesTab;
