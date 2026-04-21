import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';
import {
    Search, CreditCard, DollarSign, Wallet, ShieldCheck,
    Loader, Filter, AlertCircle, Trash2, Edit, Save, X, ArrowUpRight
} from 'lucide-react';

const Transactions = () => {
    const { user } = useAuthStore();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState(null);
    const [editForm, setEditForm] = useState({
        totalPrice: '',
        paymentStatus: '',
        paymentMethod: ''
    });

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // Using the bookings/all endpoint as it contains payment info
            const { data } = await api.get('/api/bookings/all', config);
            setTransactions(data);
        } catch (err) {
            console.error('Failed to fetch transactions', err);
            setError(err.response?.data?.message || err.message || 'Failed to load transaction data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (user) fetchTransactions(); }, [user]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transaction record?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/api/bookings/${id}`, config);
            setTransactions(transactions.filter(t => t._id !== id));
            alert('Transaction deleted successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete transaction');
        }
    };

    const handleEditClick = (tx) => {
        setEditingTx(tx);
        setEditForm({
            totalPrice: tx.totalPrice || '',
            paymentStatus: tx.paymentStatus || 'pending',
            paymentMethod: tx.paymentMethod || 'cash_on_delivery'
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.put(`/api/bookings/${editingTx._id}`, editForm, config);
            setTransactions(transactions.map(t => t._id === data._id ? { ...t, ...data } : t));
            setIsEditModalOpen(false);
            alert('Payment updated successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update payment');
        }
    };

    const getList = () => {
        let list = [...transactions];
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter(t =>
                t.user?.name?.toLowerCase().includes(q) ||
                t.provider?.name?.toLowerCase().includes(q) ||
                t.paymentMethod?.toLowerCase().includes(q) ||
                t._id?.toLowerCase().includes(q)
            );
        }
        return list;
    };

    const displayList = getList();
    const totalVolume = transactions.reduce((acc, current) => acc + (current.totalPrice || 0), 0);
    const paidVolume = transactions.filter(t => t.paymentStatus === 'paid').reduce((acc, current) => acc + (current.totalPrice || 0), 0);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <Loader className="spin" size={32} color="var(--primary)" />
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '4px' }}>Financial Transactions</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Track and manage all user payments and provider earnings.
                    </p>
                </div>
                <div style={{ padding: '10px 20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', gap: '24px' }}>
                    <div>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Total Volume</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary)' }}>₹{totalVolume.toLocaleString()}</span>
                    </div>
                    <div style={{ borderLeft: '1px solid #f1f5f9' }}></div>
                    <div>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Paid Amount</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#059669' }}>₹{paidVolume.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search by ID, User, or Payment Method..."
                        className="input-field"
                        style={{ paddingLeft: '44px', width: '100%' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Transaction List */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                        <tr style={{ textAlign: 'left' }}>
                            <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: '#64748b' }}>TRANSACTION ID</th>
                            <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: '#64748b' }}>USER / PROVIDER</th>
                            <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: '#64748b' }}>DATE</th>
                            <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: '#64748b' }}>AMOUNT</th>
                            <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: '#64748b' }}>METHOD</th>
                            <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: '#64748b' }}>STATUS</th>
                            <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: '#64748b' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayList.map(tx => (
                            <tr key={tx._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ArrowUpRight size={14} color="#94a3b8" />
                                        <code style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>#{tx._id.slice(-8).toUpperCase()}</code>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{tx.user?.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>To: {tx.provider?.name}</div>
                                </td>
                                <td style={{ padding: '16px 20px', fontSize: '0.9rem' }}>
                                    {new Date(tx.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ fontWeight: '900', color: '#1e293b' }}>₹{tx.totalPrice?.toLocaleString()}</div>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', textTransform: 'capitalize' }}>
                                        <Wallet size={14} />
                                        {tx.paymentMethod?.replace(/_/g, ' ')}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase',
                                        backgroundColor: tx.paymentStatus === 'paid' ? '#d1fae5' : tx.paymentStatus === 'failed' ? '#fee2e2' : '#fef3c7',
                                        color: tx.paymentStatus === 'paid' ? '#065f46' : tx.paymentStatus === 'failed' ? '#991b1b' : '#92400e'
                                    }}>
                                        {tx.paymentStatus || 'pending'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleEditClick(tx)} style={{ padding: '6px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                            <Edit size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(tx._id)} style={{ padding: '6px', backgroundColor: '#fff1f2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#e11d48' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2000, padding: '20px'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', padding: 0 }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontWeight: 800 }}>Update Payment</h3>
                            <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleUpdate} style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px' }}>Amount (₹)</label>
                                <input 
                                    type="number" 
                                    className="input-field" 
                                    value={editForm.totalPrice} 
                                    onChange={(e) => setEditForm({ ...editForm, totalPrice: e.target.value })} 
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px' }}>Payment Status</label>
                                <select 
                                    className="input-field" 
                                    style={{ appearance: 'auto' }}
                                    value={editForm.paymentStatus} 
                                    onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px' }}>Method</label>
                                <select 
                                    className="input-field" 
                                    style={{ appearance: 'auto' }}
                                    value={editForm.paymentMethod} 
                                    onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                                >
                                    <option value="cash_on_delivery">Cash on Delivery</option>
                                    <option value="wallet">Wallet</option>
                                    <option value="online">Online Payment</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <Save size={18} /> Update Transaction
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;
