import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
    ArrowLeft, CreditCard, DollarSign, Calendar, Clock, 
    ArrowUpRight, ArrowDownLeft, Filter, Search, Wallet,
    CheckCircle, XCircle, AlertCircle, ExternalLink, RefreshCcw
} from 'lucide-react';

const UserTransactions = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/api/admin/users/${id}/full-details`);
            setData(data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load payment history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="spinner"></div></div>;
    if (error) return <div style={{ padding: '40px', color: 'red' }}>Error: {error}</div>;

    const { user, bookings } = data;

    // Filter logic
    const filteredBookings = bookings.filter(b => {
        const matchesSearch = b._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             b.service?.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || b.paymentStatus === filter;
        return matchesSearch && matchesFilter;
    });

    const totalPaid = bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalPrice, 0);
    const totalPending = bookings.filter(b => b.paymentStatus === 'pending').reduce((sum, b) => sum + b.totalPrice, 0);

    return (
        <div style={{ padding: '30px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <button 
                        onClick={() => navigate(`/users/${id}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', border: 'none', background: 'none', cursor: 'pointer', marginBottom: '12px', fontWeight: '600' }}
                    >
                        <ArrowLeft size={18} /> Back to Profile
                    </button>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CreditCard size={32} color="var(--primary)" /> Payment History
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Transaction audit trail for <strong>{user.name}</strong></p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ padding: '12px 20px', backgroundColor: '#ecfdf5', borderRadius: '12px', border: '1px solid #10b981', textAlign: 'right' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#059669', textTransform: 'uppercase', display: 'block' }}>Total Paid</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#065f46' }}>₹{totalPaid.toLocaleString()}</span>
                    </div>
                    <div style={{ padding: '12px 20px', backgroundColor: '#fff7ed', borderRadius: '12px', border: '1px solid #f97316', textAlign: 'right' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#c2410c', textTransform: 'uppercase', display: 'block' }}>Total Pending</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#9a3412' }}>₹{totalPending.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" 
                        placeholder="Search by Transaction ID or Service..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field"
                        style={{ paddingLeft: '40px', width: '100%' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['all', 'paid', 'pending', 'failed'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{ 
                                padding: '8px 16px', 
                                borderRadius: '10px', 
                                border: 'none', 
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                backgroundColor: filter === f ? 'var(--primary)' : '#f1f5f9',
                                color: filter === f ? 'white' : '#64748b'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <button onClick={fetchDetails} className="btn-outline" style={{ display: 'flex', gap: '8px' }}>
                    <RefreshCcw size={16} /> Sync
                </button>
            </div>

            {/* Transaction Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr style={{ textAlign: 'left' }}>
                            <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Transaction / Service</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Type</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Date</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Amount</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Method</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.length === 0 ? (
                            <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No transactions found matching your criteria.</td></tr>
                        ) : filteredBookings.map(b => {
                            const isIncoming = b.provider?._id === id;
                            return (
                                <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {isIncoming ? <ArrowDownLeft size={20} color="#10b981" /> : <ArrowUpRight size={20} color="#6366f1" />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1e293b' }}>{b.service?.title || 'Unknown Service'}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>#{b._id.toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase',
                                            backgroundColor: isIncoming ? '#dcfce7' : '#e0e7ff',
                                            color: isIncoming ? '#166534' : '#3730a3'
                                        }}>
                                            {isIncoming ? 'Earning' : 'Payment'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={14} color="#94a3b8" /> {new Date(b.createdAt).toLocaleDateString()}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>{new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: '800', color: isIncoming ? '#059669' : '#1e293b', fontSize: '1rem' }}>
                                            {isIncoming ? '+' : '-'} ₹{b.totalPrice.toLocaleString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b', textTransform: 'capitalize' }}>
                                            <Wallet size={14} /> {b.paymentMethod?.replace(/_/g, ' ') || 'cash'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ 
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            padding: '6px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase',
                                            backgroundColor: b.paymentStatus === 'paid' ? '#d1fae5' : b.paymentStatus === 'failed' ? '#fee2e2' : '#fef3c7',
                                            color: b.paymentStatus === 'paid' ? '#065f46' : b.paymentStatus === 'failed' ? '#991b1b' : '#92400e'
                                        }}>
                                            {b.paymentStatus === 'paid' ? <CheckCircle size={12} /> : b.paymentStatus === 'failed' ? <XCircle size={12} /> : <AlertCircle size={12} />}
                                            {b.paymentStatus || 'pending'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <button 
                                            onClick={() => window.open(`/transactions`, '_blank')}
                                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#64748b' }}
                                        >
                                            <ExternalLink size={14} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserTransactions;
