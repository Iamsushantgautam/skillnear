import React from 'react';
import { X, User, LocateFixed, MapPin, Search, Zap, Award, Info, Mail, Shield, FileText, LogOut } from 'lucide-react';

const MobileDrawer = ({ 
    isOpen, 
    onClose, 
    user, 
    getAvatar, 
    handleLogout, 
    navigate 
}) => {
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2001 }}>
            <div onClick={onClose} className="mobile-drawer-overlay" />
            <div className="animate-slide-in-left no-scrollbar mobile-drawer-content">
                <button onClick={onClose} className="mobile-drawer-close-btn">
                    <X size={24} color="#64748b" />
                </button>

                <div className="mobile-drawer-profile">
                    {user ? (
                        <>
                            <img
                                src={getAvatar(user)}
                                className="mobile-drawer-avatar"
                                alt=""
                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ede9fe&color=4f46e5&size=80`; }}
                            />
                            <div>
                                <h4 style={{ margin: 0, fontWeight: 800 }}>{user.name}</h4>
                                <p style={{ margin: 0, fontSize: 10, color: '#94a3b8' }}>SkillNear Member</p>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="mobile-drawer-guest-avatar">
                                <User size={24} color="#003d9b" />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontWeight: 800 }}>Welcome to SkillNear</h4>
                                <p style={{ margin: 0, fontSize: 10, color: '#94a3b8' }}>Connect with local experts</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mobile-drawer-menu">
                    {[
                        { label: 'Home', link: '/', icon: LocateFixed },
                        { label: 'Local Shops', link: '/shops', icon: MapPin },
                        { label: 'Browse Services', link: '/services', icon: Search },
                        { label: 'How it Works', link: '/how-it-works', icon: Zap },
                        { label: 'Success Stories', link: '/success-stories', icon: Award },
                        { divider: true },
                        { label: 'About Us', link: '/about', icon: Info },
                        { label: 'Connect With Us', link: '/contact', icon: Mail },
                        { divider: true },
                        { label: 'Privacy Policy', link: '/privacy', icon: Shield },
                        { label: 'Terms & Conditions', link: '/terms', icon: FileText },
                        { divider: true },
                        ...(user ? [
                            { label: 'My Dashboard', link: '/dashboard', icon: User },
                            { divider: true },
                            { label: 'Logout', action: handleLogout, icon: LogOut, color: '#ef4444' }
                        ] : [
                            { label: 'Login', link: '/login', icon: User },
                            { label: 'Sign Up', link: '/register', icon: User }
                        ])
                    ].map((item, idx) => (
                        item.divider ? <div key={idx} className="mobile-drawer-divider" /> : (
                            <button key={item.label} onClick={() => { item.action ? item.action() : navigate(item.link); onClose(); }}
                                className="mobile-drawer-item" style={{ color: item.color }}>
                                <item.icon size={20} /> {item.label}
                            </button>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};



export default MobileDrawer;
