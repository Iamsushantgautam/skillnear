import React, { useState } from 'react';
import { Star, Loader, Briefcase, MessageSquare, Edit3, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { PC, Shell } from './MobileDashboardShared';
import '../../../styles/mobile-dashboard-styles/MobileListScreens.css';

export default function MobileReviewsScreen({ setActiveTab, user, role, navigate }) {
    const [myReviews, setMyReviews] = useState([]);
    const [myReviewsLoading, setMyReviewsLoading] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');

    const fetchMyReviews = async () => {
        setMyReviewsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const endpoint = role === 'provider' ? '/api/reviews/provider' : '/api/reviews/me';
            const { data } = await api.get(endpoint, config);
            setMyReviews(data);
        } catch (error) { console.error(error); } finally { setMyReviewsLoading(false); }
    };

    React.useEffect(() => { fetchMyReviews(); }, []);

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/api/reviews/${reviewId}`, config);
            toast.success('Review deleted');
            fetchMyReviews();
        } catch (error) { toast.error(error.response?.data?.message || 'Error deleting review'); }
    };

    const handleUpdateReview = async (reviewId) => {
        if (!editComment.trim()) { toast.error('Comment cannot be empty'); return; }
        if (editRating < 1 || editRating > 5) { toast.error('Please select a rating'); return; }
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put(`/api/reviews/${reviewId}`, { rating: editRating, comment: editComment }, config);
            toast.success('Review updated');
            setEditingReviewId(null);
            fetchMyReviews();
        } catch (error) { toast.error(error.response?.data?.message || 'Error updating review'); }
    };

    return (
        <Shell title={role === 'provider' ? 'Customer Reviews' : 'My Reviews'} onBack={() => setActiveTab('overview')}>
            <div className="animate-fade-in" style={{ padding: '0 0 20px 0' }}>
                {myReviewsLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Loader className="animate-spin" /></div>
                ) : myReviews.length === 0 ? (
                    <div className="empty-state-card">
                        <div className="empty-state-icon-wrapper"><Star size={40} color="#cbd5e1" /></div>
                        <h3 className="empty-state-title">No reviews found</h3>
                        <p className="empty-state-desc">{role === 'provider' ? 'You have not received any reviews yet.' : 'You have not written any reviews yet.'}</p>
                    </div>
                ) : (
                    <div className="list-container">
                        {myReviews.map(review => (
                            <div key={review._id} className="review-card">
                                <div className="review-card-header">
                                    <div className="review-user-info">
                                        <img src={review.service?.images?.[0] || (role === 'provider' ? review.user?.avatar : review.provider?.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.service?.title || 'S')}&background=ede9fe&color=4f46e5`} alt="" className="review-service-avatar" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.service?.title || 'S')}&background=ede9fe&color=4f46e5`; }} />
                                        <div>
                                            <h4 className="review-username">{role === 'provider' ? review.user?.name : review.provider?.name || 'Professional'}</h4>
                                            {review.service && (
                                                <div className="review-service-tag">
                                                    <Briefcase size={10} />{review.service?.title?.split(' ')?.slice(0, 4)?.join(' ')}{review.service?.title?.split(' ').length > 4 ? '...' : ''}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="review-rating-badge">
                                        <span className="review-rating-value">{review.rating}</span>
                                        <Star size={12} fill="#d97706" color="#d97706" />
                                    </div>
                                </div>

                                {editingReviewId === review._id ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} size={24} fill={star <= editRating ? "#d97706" : "none"} color={star <= editRating ? "#d97706" : "#cbd5e1"} onClick={() => setEditRating(star)} style={{ cursor: 'pointer' }} />
                                            ))}
                                        </div>
                                        <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} style={{ width: '100%', height: '100px', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '12px', fontSize: '0.95rem', resize: 'none', outline: 'none' }} placeholder="Write your review here..." />
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button onClick={() => handleUpdateReview(review._id)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: PC, color: '#fff', border: 'none', fontWeight: '700' }}>Save</button>
                                            <button onClick={() => setEditingReviewId(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#f1f5f9', color: '#64748b', border: 'none', fontWeight: '700' }}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="review-content-box">
                                            <MessageSquare size={14} color="#cbd5e1" style={{ position: 'absolute', top: '12px', left: '8px', opacity: 0.5 }} />
                                            <p className="review-comment">"{review.comment}"</p>
                                        </div>
                                        <div className="review-footer">
                                            <span className="review-date">
                                                <CalendarIcon size={12} />{new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                            {role === 'customer' && (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => { setEditingReviewId(review._id); setEditRating(review.rating); setEditComment(review.comment); }} style={{ padding: '6px 12px', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Edit3 size={12} /> Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteReview(review._id)} style={{ padding: '6px 12px', borderRadius: '8px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Trash2 size={12} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Shell>
    );
}
