import React from 'react';
import { Briefcase, ChevronRight, Loader } from 'lucide-react';
import { PC, PL, Shell } from './MobileDashboardShared';
import '../../../styles/mobile-dashboard-styles/MobileProfileScreen.css';

export default function MobileBecomeProviderScreen({ handleApplyProvider, isSubmitting, setActiveTab }) {
    return (
        <Shell title="Become a Professional" onBack={() => setActiveTab('overview')}>
            <main className="onboarding-container">
                <div className="onboarding-icon-wrapper" style={{ background: PL }}>
                    <Briefcase size={40} color={PC} />
                </div>
                <h2 className="onboarding-title">Start Your Journey</h2>
                <p className="onboarding-desc">
                    Join our network of experts and start growing your business. Reach more customers and manage your bookings all in one place.
                </p>
                <div className="onboarding-features">
                    {[
                        { title: 'Zero Setup Cost', desc: 'Start selling without any upfront fees.' },
                        { title: 'Local Reach', desc: 'Connect with customers in your immediate area.' },
                        { title: 'Easy Management', desc: 'Handle everything from your mobile dashboard.' }
                    ].map((f, i) => (
                        <div key={i} className="onboarding-feature-item">
                            <div className="onboarding-check">✓</div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>{f.title}</h4>
                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={handleApplyProvider} disabled={isSubmitting} className="onboarding-submit-btn">
                    {isSubmitting ? <Loader className="animate-spin" /> : 'Apply Now & Start Selling'}
                    <ChevronRight size={20} />
                </button>
            </main>
        </Shell>
    );
}
