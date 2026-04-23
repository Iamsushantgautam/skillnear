import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';
import {
    Search, Edit, Trash2, CheckCircle, XCircle,
    Users as UsersIcon, Clock, UserCheck,
    Mail, Phone, MapPin, ChevronDown, ChevronUp, X,
    Eye, ShieldAlert, ShieldCheck, MoreHorizontal, Ban
} from 'lucide-react';

const Users = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: adminUser } = useAuthStore();

    const [editingUser, setEditingUser] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [editFormData, setEditFormData] = useState({ name: '', email: '', role: 'customer', phone: '', password: '' });
    const [expandedCard, setExpandedCard] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [fetchError, setFetchError] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setFetchError(null);
            const { data } = await api.get('/api/users');
            setUsersList(data);
        } catch (error) {
            console.error("Error fetching users", error);
            setFetchError(error.response?.data?.message || error.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (adminUser) fetchUsers();
    }, [adminUser]);

    const handleApproveProvider = async (userId) => {
        setActionLoading(userId + '_approve');
        try {
            await api.put(`/api/users/${userId}/provider-status`, { isApproved: true });
            fetchUsers();
        } catch (error) {
            alert('Failed to approve provider');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectProvider = async (userId) => {
        if (!window.confirm("Reject this provider application?")) return;
        setActionLoading(userId + '_reject');
        try {
            await api.put(`/api/users/${userId}/provider-status`, { isApproved: false });
            fetchUsers();
        } catch (error) {
            alert('Failed to reject provider');
        } finally {
            setActionLoading(null);
        }
    };

    const toggleBan = async (userId) => {
        try {
            setActionLoading(userId + '_ban');
            await api.put(`/api/admin/users/${userId}/ban`);
            fetchUsers();
        } catch (error) {
            alert('Failed to toggle user ban');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Delete this user permanently?")) return;
        try {
            await api.delete(`/api/users/${userId}`);
            setUsersList(usersList.filter(u => u._id !== userId));
        } catch (error) {
            alert("Failed to delete user.");
        }
    };

    const startEdit = (u) => {
        setEditingUser(u._id);
        setEditFormData({ name: u.name, email: u.email, role: u.role, phone: u.phone || '', password: '' });
    };

    const handleUpdateUser = async () => {
        try {
            await api.put(`/api/users/${editingUser}`, editFormData);
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            alert("Failed to update user.");
        }
    };

    const handleCreateUser = async () => {
        try {
            if (!editFormData.password) return alert("Password is required for new users");
            await api.post('/api/admin/users', editFormData);
            setIsCreating(false);
            setEditFormData({ name: '', email: '', role: 'customer', phone: '', password: '' });
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create user.");
        }
    };

    const goToUserDetails = (userId) => {
        navigate(`/users/${userId}`);
    };

    // Derived lists
    const admins = usersList.filter(u => u.role === 'admin');
    const customers = usersList.filter(u => u.role === 'customer');
    const pendingProviders = usersList.filter(u =>
        u.role === 'provider' && (!u.providerDetails || !u.providerDetails.isApproved)
    );
    const approvedProviders = usersList.filter(u =>
        u.role === 'provider' && u.providerDetails?.isApproved
    );

    const getFilteredList = () => {
        let list = [];
        if (activeTab === 'all') list = usersList;
        else if (activeTab === 'admins') list = admins;
        else if (activeTab === 'customers') list = customers;
        else if (activeTab === 'pending') list = pendingProviders;
        else if (activeTab === 'providers') list = approvedProviders;

        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter(u =>
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                u._id.toLowerCase().includes(q)
            );
        }
        return list;
    };

    const filteredList = getFilteredList();

    const stats = [
        { label: 'All Users', value: usersList.length, icon: <UsersIcon size={20} />, color: '#6366f1', bg: '#eef2ff' },
        { label: 'Admins', value: admins.length, icon: <ShieldCheck size={20} />, color: '#ef4444', bg: '#fee2e2' },
        { label: 'Customers', value: customers.length, icon: <UsersIcon size={20} />, color: '#0ea5e9', bg: '#f0f9ff' },
        { label: 'Applications', value: pendingProviders.length, icon: <Clock size={20} />, color: '#f59e0b', bg: '#fffbeb', alert: pendingProviders.length > 0 },
    ];

    return (
        <div style={{ paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>Platform Users</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>Audit accounts, approve applications, and manage platform safety.</p>
                </div>
                <button 
                    onClick={() => {
                        setIsCreating(true);
                        setEditFormData({ name: '', email: '', role: 'customer', phone: '', password: '' });
                    }}
                    className="btn-primary" 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <UserCheck size={18} /> Add New User
                </button>
            </div>

            {/* Premium Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="card"
                        style={{
                            padding: '24px', display: 'flex', gap: '20px', alignItems: 'center',
                            cursor: 'pointer', border: stat.alert ? `1.5px solid ${stat.color}` : '1.5px solid transparent',
                            boxShadow: stat.alert ? `0 10px 25px -5px ${stat.color}20` : 'none',
                            transition: 'all 0.3s ease'
                        }}
                        onClick={() => {
                            if (i === 0) setActiveTab('all');
                            else if (i === 1) setActiveTab('admins');
                            else if (i === 2) setActiveTab('customers');
                            else if (i === 3) setActiveTab('pending');
                        }}
                    >
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1e293b' }}>{loading ? '...' : stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Navbar/Filters */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '8px', padding: '4px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                        {[
                            { key: 'all', label: 'All Users', count: usersList.length },
                            { key: 'admins', label: 'Admins', count: admins.length },
                            { key: 'customers', label: 'Customers', count: customers.length },
                            { key: 'providers', label: 'Verified', count: approvedProviders.length },
                            { key: 'pending', label: 'Applications', count: pendingProviders.length }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700',
                                    backgroundColor: activeTab === tab.key ? 'white' : 'transparent',
                                    color: activeTab === tab.key ? 'var(--primary)' : '#64748b',
                                    boxShadow: activeTab === tab.key ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                    border: 'none', cursor: 'pointer', transition: '0.2s',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                {tab.label}
                                <span style={{ 
                                    fontSize: '0.7rem', padding: '2px 6px', borderRadius: '6px',
                                    backgroundColor: activeTab === tab.key ? '#f1f5f9' : '#f8fafc',
                                    color: activeTab === tab.key ? 'var(--primary)' : '#94a3b8'
                                }}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search by name, email or ID..."
                            className="input-field"
                            style={{ paddingLeft: '44px', width: '320px', borderRadius: '12px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ minHeight: '400px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="spinner"></div></div>
                    ) : filteredList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>
                            <UsersIcon size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                            <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>No users found matching your criteria.</p>
                        </div>
                    ) : activeTab === 'pending' ? (
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {filteredList.map(u => (
                                <PendingCard
                                    key={u._id}
                                    u={u}
                                    expanded={expandedCard === u._id}
                                    onToggle={() => setExpandedCard(expandedCard === u._id ? null : u._id)}
                                    onApprove={handleApproveProvider}
                                    onReject={handleRejectProvider}
                                    onViewDetails={goToUserDetails}
                                    actionLoading={actionLoading}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="table-container" style={{ padding: '0 12px 12px' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left' }}>
                                        <th style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>User Identity</th>
                                        <th style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Account Type</th>
                                        <th style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Contact Info</th>
                                        <th style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Safety Status</th>
                                        <th style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Management</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.map(u => (
                                        <tr key={u._id} style={{ transition: '0.2s', cursor: 'pointer' }} className="user-row">
                                            <td style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px 0 0 12px' }} onClick={() => goToUserDetails(u._id)}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <img 
                                                        src={u.avatar || "/default-admin.png"}
                                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random&size=40`; }}
                                                        style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover' }}
                                                    />
                                                    <div>
                                                        <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#1e293b' }}>{u.name}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>#{u._id.slice(-8).toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 16px', backgroundColor: '#f8fafc' }}>
                                                <span style={{ 
                                                    padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase',
                                                    backgroundColor: u.role === 'admin' ? '#fee2e2' : u.role === 'provider' ? '#e0e7ff' : '#f1f5f9',
                                                    color: u.role === 'admin' ? '#991b1b' : u.role === 'provider' ? '#3730a3' : '#64748b'
                                                }}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', backgroundColor: '#f8fafc' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>{u.email}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{u.phone || 'No phone recorded'}</div>
                                            </td>
                                            <td style={{ padding: '12px 16px', backgroundColor: '#f8fafc' }}>
                                                {u.isBanned ? (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.75rem', fontWeight: '700' }}>
                                                        <Ban size={14} /> Restricted
                                                    </span>
                                                ) : (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.75rem', fontWeight: '700' }}>
                                                        <CheckCircle size={14} /> Active
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '0 12px 12px 0', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                    <button onClick={(e) => { e.stopPropagation(); goToUserDetails(u._id); }} className="action-btn" title="View Audit"><Eye size={18} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); toggleBan(u._id); }} className="action-btn" style={{ color: u.isBanned ? '#10b981' : '#f59e0b' }} title={u.isBanned ? "Unban User" : "Ban User"}>
                                                        {u.isBanned ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); startEdit(u); }} className="action-btn"><Edit size={18} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteUser(u._id); }} className="action-btn delete"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit / Create Modal */}
            {(editingUser || isCreating) && (
                <div style={styles.modalOverlay}>
                    <div className="card" style={styles.modal}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{isCreating ? 'Create Account' : 'Quick Edit'}</h2>
                            <button onClick={() => { setEditingUser(null); setIsCreating(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="input-group">
                                <label style={styles.label}>Name</label>
                                <input type="text" className="input-field" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label style={styles.label}>Email</label>
                                <input type="email" className="input-field" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label style={styles.label}>Phone</label>
                                <input type="text" className="input-field" value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label style={styles.label}>Platform Role</label>
                                <select className="input-field" value={editFormData.role} onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}>
                                    <option value="customer">Customer</option>
                                    <option value="provider">Provider</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label style={styles.label}>{isCreating ? 'Initial Password' : 'New Password (leave blank to keep current)'}</label>
                                <input type="password" className="input-field" value={editFormData.password} placeholder="••••••••" onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button className="btn-primary" style={{ flex: 1 }} onClick={isCreating ? handleCreateUser : handleUpdateUser}>
                                    {isCreating ? 'Create User' : 'Update Profile'}
                                </button>
                                <button className="btn-outline" onClick={() => { setEditingUser(null); setIsCreating(false); }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PendingCard = ({ u, expanded, onToggle, onApprove, onReject, onViewDetails, actionLoading }) => {
    const pd = u.providerDetails || {};
    const isApproving = actionLoading === u._id + '_approve';
    const isRejecting = actionLoading === u._id + '_reject';

    return (
        <div style={{
            border: '1.5px solid #fde68a', borderRadius: '16px', backgroundColor: '#fffbeb', overflow: 'hidden', transition: '0.3s'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img
                        src={u.avatar || "/default-admin.png"}
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=fde68a&color=78350f`; }}
                        style={{ width: '56px', height: '56px', borderRadius: '16px', objectFit: 'cover', border: '2.5px solid #fcd34d' }}
                    />
                    <div>
                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#78350f' }}>{u.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#92400e', display: 'flex', gap: '12px', marginTop: '2px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {u.email}</span>
                            {u.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {u.phone}</span>}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => onViewDetails(u._id)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #fcd34d', backgroundColor: 'transparent', color: '#92400e', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>Review Audit</button>
                    <button onClick={() => onApprove(u._id)} disabled={isApproving} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', backgroundColor: '#059669', color: '#fff', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>{isApproving ? '...' : 'Verify'}</button>
                    <button onClick={() => onReject(u._id)} disabled={isRejecting} style={{ padding: '10px 24px', borderRadius: '10px', border: '1.5px solid #fca5a5', backgroundColor: 'white', color: '#dc2626', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>Reject</button>
                    <button onClick={onToggle} style={{ color: '#92400e', background: 'none', border: 'none', cursor: 'pointer' }}>{expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}</button>
                </div>
            </div>

            {expanded && (
                <div style={{ borderTop: '1px dashed #fcd34d', padding: '24px', backgroundColor: 'white' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        <InfoBox label="Title" value={pd.title} />
                        <InfoBox label="Exp" value={`${pd.experienceYears} Years`} />
                        <InfoBox label="Shop" value={pd.shopName} />
                        <InfoBox label="Base" value={pd.location} />
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoBox = ({ label, value }) => (
    <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: '700' }}>{value || '—'}</div>
    </div>
);

const styles = {
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        backdropFilter: 'blur(8px)',
    },
    modal: {
        width: '420px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    },
    label: {
        display: 'block', fontSize: '0.75rem', fontWeight: '800',
        color: '#64748b', marginBottom: '8px', textTransform: 'uppercase',
    },
};

export default Users;
