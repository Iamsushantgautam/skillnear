import React from 'react';
import { Briefcase, ChevronRight, Loader, Zap, CheckCircle, ShieldCheck, Globe, Star, TrendingUp, Users } from 'lucide-react';
import { PC, PL, Shell } from './MobileDashboardShared';
import '../../../styles/mobile-dashboard-styles/MobileProfileScreen.css';

export default function MobileBecomeProviderScreen({ handleApplyProvider, isSubmitting, setActiveTab, providerStatus }) {
    return (
        <Shell title="Partner Program" onBack={() => setActiveTab('overview')}>
            <main className="onboarding-container animate-fade-in">
                {providerStatus === 'pending' ? (
                    <div className="mobile-status-banner pending">
                        <div className="status-icon-circle pending-bg">
                            <Loader size={20} className="spin" />
                        </div>
                        <div className="banner-text">
                            <h3>Application Pending</h3>
                            <p>We are reviewing your profile. You'll be notified via SMS/Email once approved.</p>
                        </div>
                    </div>
                ) : providerStatus === 'approved' ? (
                    <div className="mobile-status-banner approved">
                        <div className="status-icon-circle approved-bg">
                            <CheckCircle size={20} />
                        </div>
                        <div className="banner-text">
                            <h3>Application Approved!</h3>
                            <p>You're now a professional! Go to "Manage Gigs" to start listing your services.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="onboarding-hero-card">
                            <div className="hero-badge-mobile">
                                <Zap size={12} fill="currentColor" />
                                <span>GROW YOUR BUSINESS</span>
                            </div>
                            <h2 className="onboarding-title">Become a Partner</h2>
                            <p className="onboarding-desc">
                                Join thousands of experts reaching local customers in their neighborhood.
                            </p>
                            
                            <button 
                                onClick={handleApplyProvider} 
                                disabled={isSubmitting} 
                                className="onboarding-apply-btn-premium"
                            >
                                {isSubmitting ? (
                                    <span className="loading-state">
                                        <Loader size={22} className="spin" /> 
                                        Processing...
                                    </span>
                                ) : (
                                    <>
                                        <span>Apply Now & Get Started</span>
                                        <div className="btn-icon-circle">
                                            <TrendingUp size={18} />
                                        </div>
                                    </>
                                )}
                            </button>
                            
                            <div className="mobile-trust-row">
                                <div className="trust-badge">
                                    <ShieldCheck size={14} />
                                    <span>Verified</span>
                                </div>
                                <div className="trust-badge">
                                    <Zap size={14} />
                                    <span>Instant Access</span>
                                </div>
                            </div>
                        </div>

                        <div className="onboarding-section">
                            <h3 className="section-title-mobile">Why Join Us?</h3>
                            <div className="benefits-stack">
                                {[
                                    { icon: <TrendingUp size={20} />, title: 'Boost Revenue', desc: 'Reach active local customers.', color: '#eff6ff', textColor: '#2563eb' },
                                    { icon: <Users size={20} />, title: 'Build Reputation', desc: 'Collect verified reviews.', color: '#f5f3ff', textColor: '#7c3aed' },
                                    { icon: <Star size={20} />, title: 'Premium Tools', desc: 'Easy booking management.', color: '#f0fdf4', textColor: '#16a34a' }
                                ].map((f, i) => (
                                    <div key={i} className="benefit-item-mobile">
                                        <div className="benefit-icon-mobile" style={{ backgroundColor: f.color, color: f.textColor }}>
                                            {f.icon}
                                        </div>
                                        <div>
                                            <h4>{f.title}</h4>
                                            <p>{f.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="onboarding-section">
                            <h3 className="section-title-mobile">How it works</h3>
                            <div className="steps-vertical">
                                {[
                                    { n: '1', t: 'Activate', d: 'Enable professional features.' },
                                    { n: '2', t: 'Create Gigs', d: 'List your services with pricing.' },
                                    { n: '3', t: 'Earn Money', d: 'Receive orders and get paid.' }
                                ].map((s, i) => (
                                    <div key={i} className="step-item-mobile">
                                        <div className="step-number-mobile">{s.n}</div>
                                        <div className="step-content-mobile">
                                            <h5>{s.t}</h5>
                                            <p>{s.d}</p>
                                        </div>
                                        {i < 2 && <div className="step-line-mobile" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mobile-trust-footer">
                            <div className="trust-footer-item">
                                <ShieldCheck size={16} />
                                <span>Secure</span>
                            </div>
                            <div className="trust-footer-item">
                                <Globe size={16} />
                                <span>Local</span>
                            </div>
                            <div className="trust-footer-item">
                                <Users size={16} />
                                <span>Verified</span>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </Shell>
    );
}
