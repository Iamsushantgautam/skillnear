import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Calendar,
    MessageSquareWarning,
    LogOut,
    Bell,
    CreditCard,
    Images
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';

const AdminLayout = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [pendingCount, setPendingCount] = useState(0);
    const [pendingServices, setPendingServices] = useState(0);

    useEffect(() => {
        const fetchCounts = async () => {
            if (!user) return;
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await api.get('/api/admin/analytics', config);
                setPendingCount(data.users.pendingProviders || 0);
                setPendingServices(data.services.pendingServices || 0);
            } catch (e) { /* silent */ }
        };
        fetchCounts();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'User Management', path: '/users', icon: <Users size={20} />, badge: pendingCount },
        { name: 'Services & Gigs', path: '/services', icon: <Briefcase size={20} />, badge: pendingServices },
        { name: 'Media Vault', path: '/gallery', icon: <Images size={20} /> },
        { name: 'Bookings & Projects', path: '/activity', icon: <Calendar size={20} /> },
        { name: 'Payments & Ledger', path: '/transactions', icon: <CreditCard size={20} /> },
        { name: 'Reports', path: '/reports', icon: <MessageSquareWarning size={20} /> },
    ];

    return (
        <div style={styles.layout}>
            {/* Sidebar */}
            <aside style={styles.sidebar}>
                <div style={{ ...styles.sidebarHeader, display: 'flex', alignItems: 'center', gap: '12px', padding: '24px' }}>
                    <img src="/logo.png" alt="SkillNear" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#1e293b', lineHeight: 1 }}>SkillNear</h1>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800', letterSpacing: '0.5px' }}>ADMIN PANEL</span>
                    </div>
                </div>

                <nav style={styles.nav}>
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.path === '/'}
                            style={({ isActive }) => ({
                                ...styles.navLink,
                                backgroundColor: isActive ? 'var(--bg-color)' : 'transparent',
                                color: isActive ? 'var(--primary)' : 'var(--text-main)',
                                borderRight: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                                fontWeight: isActive ? '600' : '500'
                            })}
                        >
                            {link.icon}
                            <span style={{ flex: 1 }}>{link.name}</span>
                            {link.badge > 0 && (
                                <span style={{
                                    backgroundColor: '#f59e0b', color: '#fff',
                                    fontSize: '0.7rem', fontWeight: '700',
                                    borderRadius: '9999px', padding: '1px 7px',
                                    minWidth: '20px', textAlign: 'center',
                                }}>
                                    {link.badge}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div style={styles.sidebarFooter}>
                    <button style={styles.logoutBtn} onClick={handleLogout}>
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div style={styles.mainWrapper}>
                {/* Topbar */}
                <header style={styles.topbar}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '500' }}>Welcome back, Admin</h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => navigate(pendingServices > pendingCount ? '/services' : '/users')} style={{ position: 'relative', color: 'var(--text-muted)' }}>
                            <Bell size={20} />
                            {(pendingCount + pendingServices) > 0 && (
                                <span style={styles.notificationBadge}>{pendingCount + pendingServices}</span>
                            )}
                        </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: '12px', padding: '6px 12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#1e293b', lineHeight: '1.2' }}>{user?.name || 'Super Admin'}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '600' }}>{user?.email || 'admin@skillnear.com'}</div>
                                </div>
                                <img 
                                    src={user?.avatar || "/default-admin.png"} 
                                    alt="Admin" 
                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=6366f1&color=fff`; }}
                                    style={{ borderRadius: '10px', width: '38px', height: '38px', objectFit: 'cover', flexShrink: 0, border: '1.5px solid #e2e8f0' }} 
                                />
                            </div>
                    </div>
                </header>

                {/* Page Content */}
                <main style={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const styles = {
    layout: {
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
    },
    sidebar: {
        width: '260px',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 10,
    },
    sidebarHeader: {
        padding: '24px',
        borderBottom: '1px solid var(--border-color)',
    },
    nav: {
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    navLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 24px',
        transition: 'var(--transition)',
        textDecoration: 'none',
    },
    sidebarFooter: {
        padding: '24px',
        borderTop: '1px solid var(--border-color)',
    },
    logoutBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: 'var(--danger)',
        fontWeight: '500',
        width: '100%',
        padding: '8px 0',
    },
    mainWrapper: {
        flex: 1,
        marginLeft: '260px', /* Offset for fixed sidebar */
        display: 'flex',
        flexDirection: 'column',
    },
    topbar: {
        height: '70px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 5,
    },
    notificationBadge: {
        position: 'absolute',
        top: '-5px',
        right: '-5px',
        backgroundColor: 'var(--danger)',
        color: 'white',
        fontSize: '0.6rem',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: '32px',
        flex: 1,
    }
};

export default AdminLayout;
