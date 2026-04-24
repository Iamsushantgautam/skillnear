import React from 'react';
import { 
    Star, 
    Loader, 
    Briefcase, 
    MessageSquare, 
    Calendar as CalendarIcon, 
    Edit, 
    Trash2 
} from 'lucide-react';
import '../../../styles/desktop-dashboard-styles/DesktopReviewsTab.css';

const DesktopReviewsTab = ({
    myReviews = [],
    myReviewsLoading,
    role,
    navigate,
    editingReviewId,
    setEditingReviewId,
    editRating,
    setEditRating,
    editComment,
    setEditComment,
    handleUpdateReview,
    handleDeleteReview,
    handleEditReview
}) => {
    return (
        <div className="reviews-tab-container animate-fade-in">
            <div style={{ marginBottom: '24px' }}></div>

            {myReviewsLoading ? (
                <div className="loading-container">
                    <Loader className="animate-spin" />
                </div>
            ) : myReviews.length === 0 ? (
                <div className="empty-reviews">
                    <Star size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>No reviews found</h3>
                    <p style={{ color: '#64748b', margin: '8px 0 0' }}>
                        {role === 'provider' ? 'You have not received any reviews yet.' : 'You have not written any reviews yet.'}
                    </p>
                </div>
            ) : (
                <div className="reviews-grid">
                    {myReviews.map(review => (
                        <div key={review._id} className="review-card">
                            <div className="review-header">
                                <div className="reviewer-profile">
                                    <div className="reviewer-avatar-wrapper">
                                        <img 
                                            src={review.service?.images?.[0] || (role === 'provider' ? review.user?.avatar : review.provider?.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.service?.title || 'S')}&background=ede9fe&color=4f46e5`} 
                                            alt="" 
                                            className="reviewer-avatar"
                                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.service?.title || 'S')}&background=ede9fe&color=4f46e5`; }} 
                                        />
                                    </div>
                                    <div>
                                        <h4 className="reviewer-name">
                                            {role === 'provider' ? review.user?.name : review.provider?.name || 'Professional'}
                                        </h4>
                                        {review.service && (
                                            <div 
                                                className="service-link-badge"
                                                onClick={() => navigate(`/services/${review.service._id}`)}
                                            >
                                                <Briefcase size={12} />
                                                {review.service?.title}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="rating-badge">
                                    <span className="rating-value">{review.rating}</span>
                                    <Star size={16} fill="#d97706" color="#d97706" />
                                </div>
                            </div>
                            
                            {editingReviewId === review._id ? (
                                <div className="edit-mode-container">
                                    <div className="star-rating-selector">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star 
                                                key={star}
                                                size={24} 
                                                fill={star <= editRating ? "#d97706" : "none"} 
                                                color={star <= editRating ? "#d97706" : "#cbd5e1"} 
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setEditRating(star)}
                                            />
                                        ))}
                                    </div>
                                    <textarea 
                                        value={editComment}
                                        onChange={(e) => setEditComment(e.target.value)}
                                        className="review-textarea"
                                        placeholder="Write your review here..."
                                    />
                                    <div className="edit-actions">
                                        <button 
                                            onClick={() => handleUpdateReview(review._id)}
                                            className="save-review-btn"
                                        >
                                            Save Changes
                                        </button>
                                        <button 
                                            onClick={() => setEditingReviewId(null)}
                                            className="cancel-review-btn"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="review-text-bubble">
                                        <MessageSquare size={16} className="review-quote-icon" />
                                        <span style={{ paddingLeft: '28px', display: 'block' }}>"{review.comment}"</span>
                                    </p>
                                    
                                    <div className="review-footer">
                                        <span className="review-date">
                                            <CalendarIcon size={14} />
                                            {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                        {role === 'customer' && (
                                            <div className="review-card-actions">
                                                <button 
                                                    onClick={() => handleEditReview(review)} 
                                                    className="edit-btn"
                                                >
                                                    <Edit size={14} /> Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteReview(review._id)} 
                                                    className="delete-btn"
                                                >
                                                    <Trash2 size={14} /> Delete
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
    );
};

export default DesktopReviewsTab;
