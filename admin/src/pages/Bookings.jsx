import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';
import {
    Search, Calendar, Clock, MapPin, User,
    CheckCircle, XCircle, Loader, Filter, AlertCircle,
    Trash2, Edit, Save, X
} from 'lucide-react';

const Bookings = () => {
    const { user } = useAuthStore();
    const [bookingsList, setBookingsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [editForm, setEditForm] = useState({
        date: '',
        timeSlot: '',
        totalPrice: '',
        status: '',
        paymentMode: ''
    });

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/api/bookings/all', config);
            setBookingsList(data);
        } catch (err) {
            console.error('Failed to fetch bookings', err);
            setError(err.response?.data?.message || err.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (user) fetchBookings(); }, [user]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/api/bookings/${id}`, config);
            setBookingsList(bookingsList.filter(b => b._id !== id));
            alert('Booking deleted successfully');
        } catch (err) {
            console.error('Failed to delete booking', err);
            alert(err.response?.data?.message || 'Failed to delete booking');
        }
    };

    const handleEditClick = (booking) => {
        setEditingBooking(booking);
        setEditForm({
            date: booking.date ? new Date(booking.date).toISOString().split('T')[0] : '',
            timeSlot: booking.timeSlot || '',
            totalPrice: booking.totalPrice || '',
            status: booking.status || '',
            paymentMode: booking.paymentMode || ''
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.put(`/api/bookings/${editingBooking._id}`, editForm, config);
            setBookingsList(bookingsList.map(b => b._id === data._id ? { ...b, ...data } : b));
            setIsEditModalOpen(false);
            alert('Booking updated successfully');
            fetchBookings(); // Refresh to get populated data
        } catch (err) {
            console.error('Failed to update booking', err);
            alert(err.response?.data?.message || 'Failed to update booking');
        }
    };

    const getList = () => {
        let list = activeTab === 'all' ? bookingsList : bookingsList.filter(b => b.status === activeTab);
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter(b =>
                b.service?.title?.toLowerCase().includes(q) ||
                b.user?.name?.toLowerCase().includes(q) ||
                b.provider?.name?.toLowerCase().includes(q) ||
                b._id?.toLowerCase().includes(q)
            );
        }
        return list;
    };

    const displayList = getList();

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <Loader className="spin" size={32} color="var(--primary)" />
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '4px' }}>System Bookings</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Monitor and manage all service bookings across the platform.
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertCircle size={20} />
                    <span style={{ fontWeight: '600' }}>Error: {error}</span>
                </div>
            )}

            {/* Stats Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Total Bookings', value: bookingsList.length, color: 'var(--primary)', bg: '#ede9fe' },
                    { label: 'Pending', value: bookingsList.filter(b => b.status === 'pending').length, color: '#f59e0b', bg: '#fef3c7' },
                    { label: 'Confirmed', value: bookingsList.filter(b => b.status === 'confirmed').length, color: '#2563eb', bg: '#dbeafe' },
                    { label: 'Completed', value: bookingsList.filter(b => b.status === 'completed').length, color: '#059669', bg: '#d1fae5' }
                ].map((stat, idx) => (
                    <div key={idx} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '8px' }}>{stat.label}</span>
                        <span style={{ fontSize: '1.75rem', fontWeight: '800', color: stat.color }}>{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', overflowX: 'auto' }} className="no-scrollbar">
                        {['all', 'pending', 'confirmed', 'in_progress', 'delivered', 'completed', 'cancelled'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: activeTab === tab ? '#fff' : 'transparent',
                                    color: activeTab === tab ? 'var(--primary)' : '#64748b',
                                    fontWeight: activeTab === tab ? '700' : '500',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    boxShadow: activeTab === tab ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search by ID, customer, or service..."
                            className="input-field"
                            style={{ paddingLeft: '44px', width: '100%' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: '700', color: '#64748b' }}>BOOKING ID</th>
                                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: '700', color: '#64748b' }}>SERVICE</th>
                                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: '700', color: '#64748b' }}>CUSTOMER</th>
                                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: '700', color: '#64748b' }}>PROVIDER</th>
                                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: '700', color: '#64748b' }}>DATE & TIME</th>
                                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: '700', color: '#64748b' }}>PRICE</th>
                                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: '700', color: '#64748b' }}>STATUS</th>
                                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: '700', color: '#64748b' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayList.map((b) => (
                                <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '16px 20px' }}>
                                        <code style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', backgroundColor: '#f5f3ff', padding: '4px 8px', borderRadius: '4px' }}>
                                            #{b._id.slice(-8).toUpperCase()}
                                        </code>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1e293b' }}>{b.service?.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.service?.category}</div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img src={b.user?.avatar || `https://ui-avatars.com/api/?name=${b.user?.name}&background=random`} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="Avatar" />
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{b.user?.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.user?.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{b.provider?.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Provider Account</div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#1e293b' }}>
                                            <Calendar size={14} color="#64748b" />
                                            {new Date(b.date).toLocaleDateString()}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                                            <Clock size={14} color="#64748b" />
                                            {b.timeSlot}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--primary)' }}>₹{b.totalPrice}</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{b.paymentMethod || 'Wallet'}</div>
                                            {b.paymentMode && (
                                                <div style={{ 
                                                    fontSize: '9px', 
                                                    fontWeight: '800', 
                                                    color: b.paymentMode === 'Online' ? '#003d9b' : '#059669',
                                                    backgroundColor: b.paymentMode === 'Online' ? '#e0e7ff' : '#d1fae5',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    display: 'inline-block',
                                                    width: 'fit-content'
                                                }}>
                                                    {b.paymentMode.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            backgroundColor:
                                                b.status === 'pending' ? '#fef3c7' :
                                                b.status === 'confirmed' ? '#e0e7ff' :
                                                b.status === 'in_progress' ? '#e0e7ff' :
                                                b.status === 'delivered' ? '#d1fae5' :
                                                b.status === 'completed' ? '#d1fae5' :
                                                b.status === 'cancelled' ? '#fee2e2' :
                                                b.status === 'revision_requested' ? '#fef3c7' : '#f1f5f9',
                                            color:
                                                b.status === 'pending' ? '#92400e' :
                                                b.status === 'confirmed' ? '#003d9b' :
                                                b.status === 'in_progress' ? '#003d9b' :
                                                b.status === 'delivered' ? '#059669' :
                                                b.status === 'completed' ? '#059669' :
                                                b.status === 'cancelled' ? '#991b1b' :
                                                b.status === 'revision_requested' ? '#92400e' : '#475569',
                                            textTransform: 'uppercase'
                                        }}>
                                            {b.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                onClick={() => handleEditClick(b)}
                                                style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: '#eff6ff', color: '#2563eb', cursor: 'pointer' }}
                                                title="Edit Details"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(b._id)}
                                                style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}
                                                title="Delete Booking"
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
                {displayList.length === 0 && (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>No bookings found</h3>
                        <p style={{ color: '#64748b' }}>Try changing the filters or search term.</p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2000, padding: '20px'
                }}>
                    <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '0', position: 'relative' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Edit Booking Details</h2>
                            <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>Booking Date</label>
                                    <input 
                                        type="date" 
                                        className="input-field" 
                                        value={editForm.date} 
                                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>Time Slot</label>
                                    <input 
                                        type="text" 
                                        className="input-field" 
                                        placeholder="e.g. 09:00 AM - 11:00 AM"
                                        value={editForm.timeSlot} 
                                        onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>Total Price (₹)</label>
                                    <input 
                                        type="number" 
                                        className="input-field" 
                                        value={editForm.totalPrice} 
                                        onChange={(e) => setEditForm({ ...editForm, totalPrice: e.target.value })} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>Booking Status</label>
                                    <select 
                                        className="input-field" 
                                        style={{ appearance: 'auto' }}
                                        value={editForm.status} 
                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} 
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="revision_requested">Revision Requested</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>Payment Mode</label>
                                <select 
                                    className="input-field" 
                                    style={{ appearance: 'auto' }}
                                    value={editForm.paymentMode} 
                                    onChange={(e) => setEditForm({ ...editForm, paymentMode: e.target.value })} 
                                >
                                    <option value="">Not Selected</option>
                                    <option value="Online">Online</option>
                                    <option value="Cash">Cash</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn" style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#475569' }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bookings;
