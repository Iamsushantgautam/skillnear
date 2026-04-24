import React, { useState } from 'react';
import { Search, Loader } from 'lucide-react';
import { PC, Shell } from './MobileDashboardShared';
import '../../../styles/mobile-dashboard-styles/MobileAdmin.css';

export default function MobileAdminScreen({ allUsers, usersLoading, handleUpdateUserRole, handleToggleUserBan, setActiveTab }) {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredUsers = allUsers?.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Shell title="Admin Panel" onBack={() => setActiveTab('overview')}>
            <main style={{ padding: '24px 16px 120px' }}>
                <div className="admin-search-wrapper">
                    <Search size={18} className="admin-search-icon" />
                    <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search users by name or email..." className="admin-search-input" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {usersLoading ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading users...</div>
                    ) : filteredUsers?.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No users found.</div>
                    ) : filteredUsers?.map(u => (
                        <div key={u._id} className={`admin-user-card ${u.isBanned ? 'banned' : ''}`}>
                            <div className="admin-user-header">
                                <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}`} className="admin-user-avatar" alt="" />
                                <div style={{ flex: 1 }}>
                                    <h4 className="admin-user-name">{u.name}</h4>
                                    <p className="admin-user-email">{u.email}</p>
                                    <div className="admin-badge-container">
                                        <span className={`admin-badge admin-badge-role`}>{u.role}</span>
                                        {u.isBanned && <span className="admin-badge admin-badge-banned">Banned</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="admin-actions">
                                <select value={u.role} onChange={(e) => handleUpdateUserRole(u._id, e.target.value)} className="admin-select">
                                    <option value="customer">Customer</option>
                                    <option value="provider">Provider</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <button onClick={() => handleToggleUserBan(u._id)} className={`admin-action-btn ${u.isBanned ? 'admin-action-btn-unban' : 'admin-action-btn-ban'}`}>
                                    {u.isBanned ? 'Unban Account' : 'Ban Account'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </Shell>
    );
}
