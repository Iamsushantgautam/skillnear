import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';
import {
    Search, Filter, Edit, Trash2, CheckCircle, XCircle,
    Users as UsersIcon, UserCheck, Clock, ShoppingBag,
    Mail, Phone, MapPin, Star, ChevronDown, ChevronUp, X
} from 'lucide-react';

const Users = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');

    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', email: '', role: '', phone: '' });
    const [expandedCard, setExpandedCard] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [fetchError, setFetchError] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setFetchError(null);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/api/users', config);
            setUsersList(data);
        } catch (error) {
            console.error("Error fetching users", error);
            setFetchError(error.response?.data?.message || error.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchUsers();
    }, [user]);

    const handleApproveProvider = async (userId) => {
        setActionLoading(userId + '_approve');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put(`/api/users/${userId}/provider-status`, { isApproved: true }, config);
            setUsersList(usersList.map(u =>
                u._id === userId ? { ...u, providerDetails: { ...u.providerDetails, isApproved: true } } : u
            ));
        } catch (error) {
            console.error(error);
            alert('Failed to approve provider');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectProvider = async (userId) => {
        if (!window.confirm("Reject this provider application? The user will be reverted to customer.")) return;
        setActionLoading(userId + '_reject');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put(`/api/users/${userId}/provider-status`, { isApproved: false }, config);
            setUsersList(usersList.map(u =>
                u._id === userId ? { ...u, role: 'customer', providerDetails: null } : u
            ));
        } catch (error) {
            console.error(error);
            alert('Failed to reject provider');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Delete this user? All their data will be removed.")) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/api/users/${userId}`, config);
            setUsersList(usersList.filter(u => u._id !== userId));
        } catch (error) {
            console.error("Error deleting user", error);
            alert("Failed to delete user.");
        }
    };

    const startEdit = (u) => {
        setEditingUser(u._id);
        setEditFormData({ name: u.name, email: u.email, role: u.role, phone: u.phone || '' });
    };

    const handleUpdateUser = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put(`/api/users/${editingUser}`, editFormData, config);
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            console.error("Error updating user", error);
            alert("Failed to update user.");
        }
    };

    // Derived lists
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
        else if (activeTab === 'customers') list = customers;
        else if (activeTab === 'pending') list = pendingProviders;
        else if (activeTab === 'providers') list = approvedProviders;

        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter(u =>
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q)
            );
        }
        return list;
    };

    const filteredList = getFilteredList();

    const stats = [
        { label: 'Total Users', value: usersList.length, icon: <UsersIcon size={22} />, color: '#4f46e5', bg: '#ede9fe' },
        { label: 'Customers', value: customers.length, icon: <UsersIcon size={22} />, color: '#0284c7', bg: '#e0f2fe' },
        { label: 'Pending Approvals', value: pendingProviders.length, icon: <Clock size={22} />, color: '#d97706', bg: '#fef3c7', alert: pendingProviders.length > 0 },
        { label: 'Active Providers', value: approvedProviders.length, icon: <UserCheck size={22} />, color: '#059669', bg: '#d1fae5' },
    ];

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                    User Management
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Manage customers, review provider applications and control access.
                </p>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="card"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
                            cursor: 'pointer',
                            outline: stat.alert ? `2px solid ${stat.color}` : 'none',
                            transition: 'all 0.2s'
                        }}
                        onClick={() => {
                            if (i === 0) setActiveTab('all');
                            else if (i === 1) setActiveTab('customers');
                            else if (i === 2) setActiveTab('pending');
                            else if (i === 3) setActiveTab('providers');
                        }}
                    >
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '12px',
                            backgroundColor: stat.bg, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: stat.color, flexShrink: 0
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: stat.color, lineHeight: 1 }}>
                                {loading ? '—' : stat.value}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>
                                {stat.label}
                                {stat.alert && <span style={{ marginLeft: '6px', backgroundColor: stat.color, color: '#fff', borderRadius: '9999px', padding: '1px 8px', fontSize: '0.7rem' }}>!</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs + Search */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[
                            { key: 'pending', label: `Pending (${pendingProviders.length})`, urgent: pendingProviders.length > 0 },
                            { key: 'customers', label: `Customers (${customers.length})` },
                            { key: 'providers', label: `Providers (${approvedProviders.length})` },
                            { key: 'all', label: `All (${usersList.length})` },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    fontWeight: activeTab === tab.key ? '600' : '500',
                                    backgroundColor: activeTab === tab.key
                                        ? (tab.urgent ? '#fef3c7' : '#ede9fe')
                                        : 'transparent',
                                    color: activeTab === tab.key
                                        ? (tab.urgent ? '#92400e' : 'var(--primary)')
                                        : 'var(--text-muted)',
                                    border: activeTab === tab.key
                                        ? `1.5px solid ${tab.urgent ? '#f59e0b' : 'var(--primary)'}`
                                        : '1.5px solid transparent',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search by name or email…"
                            className="input-field"
                            style={{ paddingLeft: '36px', width: '260px', fontSize: '0.875rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ padding: '24px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                            <div style={styles.spinner}></div>
                            <p style={{ marginTop: '16px' }}>Loading users…</p>
                        </div>
                    ) : fetchError ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '16px 24px', borderRadius: 10, marginBottom: 16, display: 'inline-block' }}>
                                <strong>Error loading users:</strong> {fetchError}
                            </div>
                            <br />
                            <button className="btn-primary" onClick={fetchUsers} style={{ marginTop: 12 }}>Retry</button>
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                            <UsersIcon size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                                {activeTab === 'pending' ? 'No pending applications 🎉' : 'No users found'}
                            </p>
                        </div>
                    ) : activeTab === 'pending' ? (
                        /* ── PENDING APPROVALS: Card View ── */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {filteredList.map(u => (
                                <PendingCard
                                    key={u._id}
                                    u={u}
                                    expanded={expandedCard === u._id}
                                    onToggle={() => setExpandedCard(expandedCard === u._id ? null : u._id)}
                                    onApprove={handleApproveProvider}
                                    onReject={handleRejectProvider}
                                    actionLoading={actionLoading}
                                />
                            ))}
                        </div>
                    ) : (
                        /* ── CUSTOMERS / PROVIDERS / ALL: Table View ── */
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Phone</th>
                                        <th>Joined</th>
                                        {activeTab !== 'customers' && <th>Provider Status</th>}
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.map(u => (
                                        <tr key={u._id} style={{ transition: 'background 0.15s' }}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <img
                                                        src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=ede9fe&color=4f46e5`}
                                                        alt={u.name}
                                                        style={{ borderRadius: '50%', width: '40px', height: '40px', objectFit: 'cover', border: '2px solid var(--border-color)' }}
                                                    />
                                                    <div>
                                                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{u.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600',
                                                    backgroundColor: u.role === 'admin' ? '#ede9fe' : u.role === 'provider' ? '#d1fae5' : '#e0f2fe',
                                                    color: u.role === 'admin' ? '#4f46e5' : u.role === 'provider' ? '#059669' : '#0284c7',
                                                    textTransform: 'capitalize'
                                                }}>{u.role}</span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                {u.phone || '—'}
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            {activeTab !== 'customers' && (
                                                <td>
                                                    {u.role === 'provider' ? (
                                                        <span className={`badge ${u.providerDetails?.isApproved ? 'badge-success' : 'badge-warning'}`}>
                                                            {u.providerDetails?.isApproved ? '✓ Approved' : '⏳ Pending'}
                                                        </span>
                                                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                                </td>
                                            )}
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                                                    <button
                                                        onClick={() => startEdit(u)}
                                                        title="Edit"
                                                        style={{ color: 'var(--primary)', padding: '6px', borderRadius: '6px', transition: 'background 0.2s' }}
                                                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#ede9fe'}
                                                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u._id)}
                                                        title="Delete"
                                                        style={{ color: 'var(--danger)', padding: '6px', borderRadius: '6px', transition: 'background 0.2s' }}
                                                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
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

            {/* Edit Modal */}
            {editingUser && (
                <div style={styles.modalOverlay}>
                    <div className="card" style={styles.modal}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Edit User</h2>
                            <button onClick={() => setEditingUser(null)} style={{ color: 'var(--text-muted)', padding: '4px' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={styles.label}>Full Name</label>
                                <input type="text" className="input-field" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} />
                            </div>
                            <div>
                                <label style={styles.label}>Email Address</label>
                                <input type="email" className="input-field" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} />
                            </div>
                            <div>
                                <label style={styles.label}>Phone</label>
                                <input type="text" className="input-field" value={editFormData.phone} placeholder="—" onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} />
                            </div>
                            <div>
                                <label style={styles.label}>Role</label>
                                <select className="input-field" value={editFormData.role} onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}>
                                    <option value="admin">Admin</option>
                                    <option value="customer">Customer</option>
                                    <option value="provider">Provider</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                                <button className="btn-outline" onClick={() => setEditingUser(null)}>Cancel</button>
                                <button className="btn-primary" onClick={handleUpdateUser}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Pending Application Card ──
const PendingCard = ({ u, expanded, onToggle, onApprove, onReject, actionLoading }) => {
    const pd = u.providerDetails || {};
    const isApproving = actionLoading === u._id + '_approve';
    const isRejecting = actionLoading === u._id + '_reject';

    return (
        <div style={{
            border: '1.5px solid #fde68a',
            borderRadius: '12px',
            backgroundColor: '#fffbeb',
            overflow: 'hidden',
            transition: 'box-shadow 0.2s',
        }}>
            {/* Card Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img
                        src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=fde68a&color=78350f`}
                        alt={u.name}
                        style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f59e0b' }}
                    />
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '1rem', color: '#1f2937' }}>{u.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Mail size={13} /> {u.email}
                            </span>
                            {u.phone && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Phone size={13} /> {u.phone}
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '600' }}>
                                ⏳ Pending Approval
                            </span>
                            {pd.providerType && (
                                <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '600' }}>
                                    {pd.providerType}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        onClick={() => onApprove(u._id)}
                        disabled={isApproving || isRejecting}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '9px 18px', borderRadius: '8px',
                            backgroundColor: '#059669', color: '#fff',
                            fontWeight: '600', fontSize: '0.875rem',
                            opacity: isApproving || isRejecting ? 0.7 : 1,
                            transition: 'all 0.2s',
                        }}
                    >
                        <CheckCircle size={16} />
                        {isApproving ? 'Approving…' : 'Approve'}
                    </button>
                    <button
                        onClick={() => onReject(u._id)}
                        disabled={isApproving || isRejecting}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '9px 18px', borderRadius: '8px',
                            backgroundColor: '#fff', color: '#dc2626',
                            border: '1.5px solid #fca5a5',
                            fontWeight: '600', fontSize: '0.875rem',
                            opacity: isApproving || isRejecting ? 0.7 : 1,
                            transition: 'all 0.2s',
                        }}
                    >
                        <XCircle size={16} />
                        {isRejecting ? 'Rejecting…' : 'Reject'}
                    </button>
                    <button
                        onClick={onToggle}
                        style={{ color: 'var(--text-muted)', padding: '8px', borderRadius: '8px', backgroundColor: expanded ? '#f3f4f6' : 'transparent', transition: 'all 0.2s' }}
                        title={expanded ? 'Collapse' : 'View full application'}
                    >
                        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div style={{ borderTop: '1px dashed #fcd34d', padding: '20px 24px', backgroundColor: '#fff' }}>
                    <h4 style={{ fontWeight: '600', fontSize: '0.875rem', color: '#374151', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Provider Application Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                        {pd.title && <InfoRow label="Professional Title" value={pd.title} />}
                        {pd.experienceYears && <InfoRow label="Years of Experience" value={`${pd.experienceYears} years`} />}
                        {pd.providerType && <InfoRow label="Provider Type" value={pd.providerType} />}
                        {pd.shopName && <InfoRow label="Shop Name" value={pd.shopName} />}
                        {pd.ownerName && <InfoRow label="Owner Name" value={pd.ownerName} />}
                        {pd.location && <InfoRow label="Location / Address" value={pd.location} icon={<MapPin size={14} />} />}
                        {pd.serviceName && <InfoRow label="Service Name" value={pd.serviceName} />}
                        {pd.serviceProviderName && <InfoRow label="Service Provider Name" value={pd.serviceProviderName} />}
                        {pd.liveLocation && <InfoRow label="Coverage Area" value={pd.liveLocation} icon={<MapPin size={14} />} />}
                        {pd.shopAddress && <InfoRow label="Shop Address" value={pd.shopAddress} />}
                    </div>
                    {pd.about && (
                        <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>About</div>
                            <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: '1.6' }}>{pd.about}</p>
                        </div>
                    )}
                    {pd.shopDetails && (
                        <div style={{ marginTop: '12px', padding: '14px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shop Details</div>
                            <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: '1.6' }}>{pd.shopDetails}</p>
                        </div>
                    )}
                    {pd.images && pd.images.length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Shop Images ({pd.images.length})
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {pd.images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img}
                                        alt={`Shop ${i + 1}`}
                                        style={{ width: '120px', height: '90px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e5e7eb' }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const InfoRow = ({ label, value, icon }) => (
    <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: '600', color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '0.875rem', color: '#1f2937', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {icon} {value}
        </div>
    </div>
);

const styles = {
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        backdropFilter: 'blur(4px)',
    },
    modal: {
        width: '440px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    },
    label: {
        display: 'block', fontSize: '0.8rem', fontWeight: '600',
        color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em',
    },
    spinner: {
        width: '36px', height: '36px', borderRadius: '50%',
        border: '3px solid #e5e7eb', borderTopColor: 'var(--primary)',
        animation: 'spin 0.8s linear infinite', margin: '0 auto',
    },
};

// keyframes for spinner
const styleEl = document.createElement('style');
styleEl.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleEl);

export default Users;
