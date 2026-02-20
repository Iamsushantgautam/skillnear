import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';
import {
    Search, CheckCircle, XCircle, Trash2,
    Briefcase, Clock, Star, MapPin, Tag,
    ChevronDown, ChevronUp, Eye, EyeOff, AlertCircle
} from 'lucide-react';

const AdminServices = () => {
    const { user } = useAuthStore();
    const [servicesList, setServicesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchServices = async () => {
        setLoading(true);
        setError(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/api/admin/services', config); // no filter = all
            setServicesList(data);
        } catch (err) {
            console.error('Failed to fetch services', err);
            setError(err.response?.data?.message || err.message || 'Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (user) fetchServices(); }, [user]);

    const handleApprove = async (id) => {
        setActionLoading(id + '_approve');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put(`/api/admin/services/${id}/approve`, {}, config);
            setServicesList(prev => prev.map(s => s._id === id ? { ...s, isApproved: true, isActive: true } : s));
        } catch (err) {
            alert('Failed to approve');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject this gig? It will be hidden from the marketplace.')) return;
        setActionLoading(id + '_reject');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put(`/api/admin/services/${id}/reject`, {}, config);
            setServicesList(prev => prev.map(s => s._id === id ? { ...s, isApproved: false, isActive: false } : s));
        } catch (err) {
            alert('Failed to reject');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Permanently delete this gig?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/api/admin/services/${id}`, config);
            setServicesList(prev => prev.filter(s => s._id !== id));
        } catch (err) {
            alert('Failed to delete');
        }
    };

    // Derived lists
    const pending = servicesList.filter(s => !s.isApproved);
    const approved = servicesList.filter(s => s.isApproved);

    const getList = () => {
        let list = activeTab === 'pending' ? pending : activeTab === 'approved' ? approved : servicesList;
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter(s =>
                s.title?.toLowerCase().includes(q) ||
                s.category?.toLowerCase().includes(q) ||
                s.provider?.name?.toLowerCase().includes(q)
            );
        }
        return list;
    };

    const displayList = getList();

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '4px' }}>Service / Gig Management</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Review and approve provider listings before they appear on the marketplace.
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                    { label: 'Total Gigs', value: servicesList.length, color: '#4f46e5', bg: '#ede9fe', icon: <Briefcase size={20} /> },
                    { label: 'Pending Review', value: pending.length, color: '#d97706', bg: '#fef3c7', icon: <Clock size={20} />, alert: pending.length > 0 },
                    { label: 'Live on Marketplace', value: approved.length, color: '#059669', bg: '#d1fae5', icon: <CheckCircle size={20} /> },
                ].map((s, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', cursor: 'pointer', outline: s.alert ? `2px solid ${s.color}` : 'none' }}
                        onClick={() => setActiveTab(i === 0 ? 'all' : i === 1 ? 'pending' : 'approved')}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                            {s.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.7rem', fontWeight: '800', color: s.color, lineHeight: 1 }}>{loading ? '—' : s.value}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
                                {s.label}
                                {s.alert && <span style={{ marginLeft: 6, backgroundColor: s.color, color: '#fff', borderRadius: 9999, padding: '1px 7px', fontSize: '0.68rem' }}>!</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tab + Search */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {[
                            { key: 'pending', label: `Pending (${pending.length})`, urgent: pending.length > 0 },
                            { key: 'approved', label: `Approved (${approved.length})` },
                            { key: 'all', label: `All (${servicesList.length})` },
                        ].map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                                padding: '7px 14px', borderRadius: 8, fontSize: '0.85rem',
                                fontWeight: activeTab === tab.key ? '600' : '500',
                                backgroundColor: activeTab === tab.key ? (tab.urgent ? '#fef3c7' : '#ede9fe') : 'transparent',
                                color: activeTab === tab.key ? (tab.urgent ? '#92400e' : 'var(--primary)') : 'var(--text-muted)',
                                border: activeTab === tab.key ? `1.5px solid ${tab.urgent ? '#f59e0b' : 'var(--primary)'}` : '1.5px solid transparent',
                            }}>{tab.label}</button>
                        ))}
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="text" placeholder="Search title, category, provider…" className="input-field"
                            style={{ paddingLeft: 32, width: 260, fontSize: '0.85rem' }}
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div style={{ padding: 20 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                            <div style={spinnerStyle}></div>
                            <p style={{ marginTop: 16 }}>Loading services…</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: 60 }}>
                            <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '16px 24px', borderRadius: 10, display: 'inline-block', marginBottom: 16 }}>
                                <strong>Error:</strong> {error}
                            </div>
                            <br />
                            <button className="btn-primary" onClick={fetchServices} style={{ marginTop: 12 }}>Retry</button>
                        </div>
                    ) : displayList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                            <Briefcase size={44} style={{ opacity: 0.25, marginBottom: 12 }} />
                            <p>{activeTab === 'pending' ? '🎉 No services pending! All caught up.' : 'No services found.'}</p>
                        </div>
                    ) : activeTab === 'pending' ? (
                        /* Card view for pending */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {displayList.map(s => (
                                <ServiceCard
                                    key={s._id}
                                    s={s}
                                    expanded={expandedId === s._id}
                                    onToggle={() => setExpandedId(expandedId === s._id ? null : s._id)}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onDelete={handleDelete}
                                    actionLoading={actionLoading}
                                />
                            ))}
                        </div>
                    ) : (
                        /* Table view for approved/all */
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Provider</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayList.map(s => (
                                        <tr key={s._id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <img
                                                        src={s.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.title)}&background=ede9fe&color=4f46e5&size=40`}
                                                        alt={s.title}
                                                        style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border-color)' }}
                                                    />
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.title}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.priceType}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <img
                                                        src={s.provider?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.provider?.name || 'P')}&background=d1fae5&color=059669`}
                                                        style={{ width: 28, height: 28, borderRadius: '50%' }} alt="" />
                                                    <div>
                                                        <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{s.provider?.name || '—'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.provider?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 600 }}>
                                                    {s.category}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 700, color: '#1f2937' }}>₹{s.price}</td>
                                            <td>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 600,
                                                    backgroundColor: s.isApproved ? '#d1fae5' : '#fef3c7',
                                                    color: s.isApproved ? '#065f46' : '#92400e',
                                                }}>
                                                    {s.isApproved ? '✓ Live' : '⏳ Pending'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'inline-flex', gap: 8 }}>
                                                    {!s.isApproved ? (
                                                        <button onClick={() => handleApprove(s._id)} title="Approve"
                                                            style={{ color: '#059669', padding: '5px', borderRadius: 6 }}>
                                                            <CheckCircle size={17} />
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleReject(s._id)} title="Revoke Approval"
                                                            style={{ color: '#d97706', padding: '5px', borderRadius: 6 }}>
                                                            <EyeOff size={17} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDelete(s._id)} title="Delete"
                                                        style={{ color: 'var(--danger)', padding: '5px', borderRadius: 6 }}>
                                                        <Trash2 size={17} />
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
        </div>
    );
};

/* ── Pending Service Card ── */
const ServiceCard = ({ s, expanded, onToggle, onApprove, onReject, onDelete, actionLoading }) => {
    const isApproving = actionLoading === s._id + '_approve';
    const isRejecting = actionLoading === s._id + '_reject';

    return (
        <div style={{ border: '1.5px solid #fde68a', borderRadius: 12, backgroundColor: '#fffbeb', overflow: 'hidden' }}>
            {/* Card Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                <img
                    src={s.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.title)}&background=ede9fe&color=4f46e5&size=60`}
                    alt={s.title}
                    style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover', border: '2px solid #fcd34d', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1f2937' }}>{s.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.82rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                            by <strong style={{ color: '#374151', marginLeft: 3 }}>{s.provider?.name || '—'}</strong>
                        </span>
                        <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 600 }}>
                            <Tag size={11} style={{ display: 'inline', marginRight: 3 }} />{s.category}
                        </span>
                        <span style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 600 }}>
                            ₹{s.price} / {s.priceType}
                        </span>
                        {s.location?.city && (
                            <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <MapPin size={12} /> {s.location.city}
                                {s.location.isRemote && ' · Remote'}
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <button onClick={() => onApprove(s._id)} disabled={isApproving || isRejecting}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 16px', borderRadius: 8, backgroundColor: '#059669', color: '#fff', fontWeight: 600, fontSize: '0.85rem', opacity: isApproving || isRejecting ? 0.7 : 1 }}>
                        <CheckCircle size={15} /> {isApproving ? 'Approving…' : 'Approve'}
                    </button>
                    <button onClick={() => onReject(s._id)} disabled={isApproving || isRejecting}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 8, backgroundColor: '#fff', color: '#dc2626', border: '1.5px solid #fca5a5', fontWeight: 600, fontSize: '0.85rem', opacity: isApproving || isRejecting ? 0.7 : 1 }}>
                        <XCircle size={15} /> {isRejecting ? 'Rejecting…' : 'Reject'}
                    </button>
                    <button onClick={() => onDelete(s._id)} title="Delete permanently"
                        style={{ padding: '8px', borderRadius: 8, backgroundColor: '#fff', border: '1.5px solid #fca5a5', color: '#dc2626' }}>
                        <Trash2 size={16} />
                    </button>
                    <button onClick={onToggle}
                        style={{ padding: '8px', borderRadius: 8, backgroundColor: expanded ? '#f3f4f6' : 'transparent', color: 'var(--text-muted)' }}>
                        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </div>
            </div>

            {/* Expanded Description */}
            {expanded && (
                <div style={{ borderTop: '1px dashed #fcd34d', padding: '16px 20px', backgroundColor: '#fff' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                        Service Description
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.7, marginBottom: 16 }}>{s.description}</p>

                    {/* Images */}
                    {s.images && s.images.length > 0 && (
                        <div>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                Images ({s.images.length})
                            </h4>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {s.images.map((img, i) => (
                                    <img key={i} src={img} alt={`img-${i}`}
                                        style={{ width: 120, height: 90, borderRadius: 8, objectFit: 'cover', border: '1px solid #e5e7eb' }} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#f3f4f6', padding: '3px 10px', borderRadius: 9999, color: '#374151' }}>
                            Sub-category: {s.subCategory || '—'}
                        </span>
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#f3f4f6', padding: '3px 10px', borderRadius: 9999, color: '#374151' }}>
                            Submitted: {new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#f3f4f6', padding: '3px 10px', borderRadius: 9999, color: '#374151' }}>
                            Provider: {s.provider?.email}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

const spinnerStyle = {
    width: 32, height: 32, borderRadius: '50%',
    border: '3px solid #e5e7eb', borderTopColor: 'var(--primary)',
    animation: 'spin 0.8s linear infinite', margin: '0 auto',
};

export default AdminServices;
