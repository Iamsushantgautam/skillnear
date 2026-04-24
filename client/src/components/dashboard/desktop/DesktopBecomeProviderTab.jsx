import React from 'react';
import { Briefcase, Loader } from 'lucide-react';
import '../../../styles/desktop-dashboard-styles/DesktopBecomeProviderTab.css';

const DesktopBecomeProviderTab = ({ providerStatus, handleApplyProvider, isSubmitting }) => {
    return (
        <div className="become-provider-container animate-fade-in">
            {providerStatus === 'pending' ? (
                <div className="status-banner pending">
                    <div className="banner-content">
                        <h3>Application Pending</h3>
                        <p>Your application is currently pending admin approval. We will notify you once approved.</p>
                    </div>
                </div>
            ) : providerStatus === 'approved' ? (
                <div className="status-banner approved">
                    <div className="banner-content">
                        <h3>Application Approved!</h3>
                        <p>Congratulations! You are an approved provider. Go to "Manage Services" to add items.</p>
                    </div>
                </div>
            ) : (
                <div className="join-network-card">
                    <div className="join-header">
                        <div className="icon-wrapper">
                            <Briefcase size={40} />
                        </div>
                        <h2 className="join-title">Join the Network</h2>
                        <p className="join-description">
                            Start offering your skills to thousands of local customers. Auto-approval enabled!
                        </p>
                    </div>

                    <div className="action-section">
                        <button 
                            className="activate-btn" 
                            onClick={handleApplyProvider} 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="loading-state">
                                    <Loader size={20} className="spin" /> 
                                    Activating...
                                </span>
                            ) : (
                                'Activate Professional Account'
                            )}
                        </button>
                        <p className="activation-hint">
                            ⚡ Instant activation. Start listing your gigs immediately.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesktopBecomeProviderTab;
