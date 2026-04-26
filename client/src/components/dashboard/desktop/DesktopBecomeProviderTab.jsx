import React from 'react';
import { Briefcase, Loader, Zap, CheckCircle, ShieldCheck, Globe, Star, TrendingUp, Users } from 'lucide-react';
import '../../../styles/desktop-dashboard-styles/DesktopBecomeProviderTab.css';

const DesktopBecomeProviderTab = ({ providerStatus, handleApplyProvider, isSubmitting }) => {
    return (
        <div className="become-provider-container animate-fade-in">
            {providerStatus === 'pending' ? (
                <div className="status-banner pending">
                    <div className="banner-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="status-icon-circle pending-bg">
                                <Loader size={20} className="spin" />
                            </div>
                            <div>
                                <h3>Application Pending</h3>
                                <p>Your application is currently pending admin approval. We will notify you once approved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : providerStatus === 'approved' ? (
                <div className="status-banner approved">
                    <div className="banner-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="status-icon-circle approved-bg">
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <h3>Application Approved!</h3>
                                <p>Congratulations! You are an approved provider. Go to "Manage Services" to add items.</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="become-provider-content">
                    <div className="join-network-hero card-premium">
                        <div className="hero-badge">
                            <Zap size={14} fill="currentColor" />
                            <span>PARTNER PROGRAM</span>
                        </div>
                        <h2 className="join-title">Grow Your Business with SkillNear</h2>
                        <p className="join-description">
                            Join thousands of skilled professionals and local shop owners reaching customers in their neighborhood.
                        </p>
                        
                        <div className="action-section">
                            <button 
                                className="apply-now-btn-premium" 
                                onClick={handleApplyProvider} 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="loading-state">
                                        <Loader size={22} className="spin" /> 
                                        Processing...
                                    </span>
                                ) : (
                                    <>
                                        <span>Apply Now & Get Started</span>
                                        <div className="btn-icon-bg">
                                            <TrendingUp size={18} />
                                        </div>
                                    </>
                                )}
                            </button>
                            <div className="trust-badges-row">
                                <div className="trust-badge-item">
                                    <ShieldCheck size={14} />
                                    <span>Verified Status</span>
                                </div>
                                <div className="trust-badge-item">
                                    <Zap size={14} />
                                    <span>Instant Access</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <div className="benefit-icon blue">
                                <TrendingUp size={24} />
                            </div>
                            <h4>Boost Revenue</h4>
                            <p>Reach customers who are actively looking for your services in your local area.</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon purple">
                                <Users size={24} />
                            </div>
                            <h4>Build Reputation</h4>
                            <p>Collect reviews and ratings to build trust and attract more high-quality clients.</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon green">
                                <Star size={24} />
                            </div>
                            <h4>Premium Tools</h4>
                            <p>Get access to dashboard tools to manage bookings, chats, and payments seamlessly.</p>
                        </div>
                    </div>

                    <div className="how-it-works-section card-premium">
                        <h3 className="section-subtitle">How it works</h3>
                        <div className="steps-container">
                            <div className="step-item">
                                <div className="step-number">1</div>
                                <h5>Activate</h5>
                                <p>Click the button above to enable professional features.</p>
                            </div>
                            <div className="step-connector" />
                            <div className="step-item">
                                <div className="step-number">2</div>
                                <h5>Create Gigs</h5>
                                <p>List your services or shop details with photos and pricing.</p>
                            </div>
                            <div className="step-connector" />
                            <div className="step-item">
                                <div className="step-number">3</div>
                                <h5>Earn Money</h5>
                                <p>Receive orders, chat with clients, and get paid directly.</p>
                            </div>
                        </div>
                    </div>

                    <div className="trust-footer">
                        <div className="trust-item">
                            <ShieldCheck size={18} />
                            <span>Secure Platform</span>
                        </div>
                        <div className="trust-item">
                            <Globe size={18} />
                            <span>Local Visibility</span>
                        </div>
                        <div className="trust-item">
                            <Users size={18} />
                            <span>Verified Community</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesktopBecomeProviderTab;
