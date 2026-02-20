import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import {
    Users, DollarSign, Briefcase, TrendingUp, Clock, CheckCircle,
    ShoppingBag, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';

const Dashboard = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!user) return;
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await api.get('/api/admin/analytics', config);
                setAnalytics(data);
            } catch (err) {
                console.error('Failed to load analytics', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [user]);

    const stats = analytics ? [
        {
            label: 'Total Revenue',
            value: `₹${analytics.revenue.toFixed(0)}`,
            sub: `From ${analytics.bookings.totalBookings} bookings (10% commission)`,
            icon: <DollarSign size={22} />,
            color: '#4f46e5', bg: '#ede9fe',
        },
        {
            label: 'Total Users',
            value: analytics.users.totalUsers,
            sub: `${analytics.users.customers} customers · ${analytics.users.providers} providers`,
            icon: <Users size={22} />,
            color: '#0284c7', bg: '#e0f2fe',
        },
        {
            label: 'Active Gigs',
            value: analytics.services.totalServices,
            sub: `${analytics.services.pendingServices} pending approval`,
            subAlert: analytics.services.pendingServices > 0,
            icon: <Briefcase size={22} />,
            color: '#059669', bg: '#d1fae5',
            onClick: () => navigate('/services'),
        },
        {
            label: 'Pending Approvals',
            value: analytics.users.pendingProviders + analytics.services.pendingServices,
            sub: `${analytics.users.pendingProviders} providers · ${analytics.services.pendingServices} gigs`,
            subAlert: (analytics.users.pendingProviders + analytics.services.pendingServices) > 0,
            icon: <Clock size={22} />,
            color: '#d97706', bg: '#fef3c7',
            onClick: () => navigate('/users'),
        },
    ] : [];

    const recentBookings = analytics?.bookings?.recentBookings || [];

    const statusStyle = (status) => {
        const map = {
            pending: { backgroundColor: '#fef3c7', color: '#92400e' },
            confirmed: { backgroundColor: '#dbeafe', color: '#1e40af' },
            completed: { backgroundColor: '#d1fae5', color: '#065f46' },
            cancelled: { backgroundColor: '#fee2e2', color: '#991b1b' },
        };
        return map[status] || { backgroundColor: '#f3f4f6', color: '#374151' };
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Platform Overview</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Real-time data from your SkillNear database
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="card" style={{ ...styles.statCard, opacity: 0.5 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#e5e7eb' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ height: 14, backgroundColor: '#e5e7eb', borderRadius: 4, marginBottom: 8, width: '60%' }} />
                                <div style={{ height: 28, backgroundColor: '#e5e7eb', borderRadius: 4, width: '40%' }} />
                            </div>
                        </div>
                    ))
                ) : stats.map((stat, i) => (
                    <div
                        key={i}
                        className="card"
                        style={{
                            ...styles.statCard,
                            cursor: stat.onClick ? 'pointer' : 'default',
                            outline: stat.subAlert ? `2px solid ${stat.color}40` : 'none',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                        }}
                        onClick={stat.onClick}
                        onMouseOver={e => { if (stat.onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'; } }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}
                    >
                        <div style={{
                            width: 48, height: 48, borderRadius: 12,
                            backgroundColor: stat.bg, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: stat.color,
                        }}>
                            {stat.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '4px' }}>
                                {stat.label}
                            </p>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: stat.color, lineHeight: 1 }}>
                                {stat.value}
                            </h3>
                            <p style={{ fontSize: '0.75rem', marginTop: '4px', color: stat.subAlert ? stat.color : 'var(--text-muted)', fontWeight: stat.subAlert ? '600' : '400' }}>
                                {stat.subAlert && <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />}
                                {stat.sub}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* User Breakdown */}
            {!loading && analytics && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0284c7' }}>{analytics.users.customers}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Customers</div>
                    </div>
                    <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#059669' }}>{analytics.users.providers}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Active Providers</div>
                    </div>
                    <div className="card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/users')}>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#d97706' }}>{analytics.users.pendingProviders}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Pending Providers
                            {analytics.users.pendingProviders > 0 && <span style={{ marginLeft: 6, backgroundColor: '#f59e0b', color: '#fff', borderRadius: 9999, padding: '1px 6px', fontSize: '0.7rem' }}>Review</span>}
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Bookings */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Recent Bookings</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {analytics ? `${analytics.bookings.totalBookings} total` : ''}
                    </span>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading…</div>
                ) : recentBookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <ShoppingBag size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                        <p>No bookings yet</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Customer</th>
                                    <th>Service</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.map((b) => (
                                    <tr key={b._id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            #{b._id.toString().slice(-6).toUpperCase()}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <img
                                                    src={b.customer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.customer?.name || 'U')}&background=ede9fe&color=4f46e5`}
                                                    alt=""
                                                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{b.customer?.name || '—'}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.9rem' }}>{b.service?.title || '—'}</td>
                                        <td style={{ fontWeight: 600 }}>₹{b.totalPrice || 0}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '3px 10px', borderRadius: 9999, fontSize: '0.75rem',
                                                fontWeight: 600, textTransform: 'capitalize',
                                                ...statusStyle(b.status)
                                            }}>
                                                {b.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '20px',
    },
    statCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
    },
};

export default Dashboard;
