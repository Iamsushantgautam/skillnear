import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, ChevronRight, Loader, Trash2 } from 'lucide-react';
import io from 'socket.io-client';
import api, { API_URL } from '../../../utils/api';
import toast from 'react-hot-toast';
import { PC, Shell } from './MobileDashboardShared';
import '../../../styles/mobile-dashboard-styles/MobileMessaging.css';

export default function InboxScreen({ user, setActiveTab, onSelectRoom }) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchRooms = async () => {
        try {
            if (!user?.token) return;
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await api.get('/api/messages/rooms', config);
            setRooms(res.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
        if (user?._id) {
            const socket = io(API_URL);
            socket.emit('setup', user._id);
            socket.on('receiveMessage', () => fetchRooms());
            socket.on('roomDeleted', () => fetchRooms());
            return () => socket.disconnect();
        }
    }, [user?._id]);

    const filteredRooms = rooms.filter(r =>
        r.otherUser?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.lastMessage?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDeleteRoom = async (e, roomId) => {
        e.stopPropagation();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/api/messages/${roomId}`, config);
            toast.success('Chat deleted');
            fetchRooms();
        } catch (err) {
            toast.error('Failed to delete chat');
        }
    };

    return (
        <Shell title="Messages" onBack={() => setActiveTab('overview')}>
            <div style={{ padding: '0 16px 12px' }}>
                <div className="inbox-header">
                    <h2 className="inbox-title">Recent <span className="inbox-title-accent">chats.</span></h2>
                </div>
                <div style={{ position: 'relative', background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', padding: '12px 14px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                    <Search size={18} color="#94a3b8" />
                    <input
                        placeholder="Search conversations..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ border: 'none', background: 'none', marginLeft: 10, flex: 1, fontSize: '0.9rem', outline: 'none', color: '#1e293b', fontWeight: 500 }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 48 }}><Loader size={28} color={PC} className="animate-spin" /></div>
            ) : filteredRooms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                    <div style={{ background: '#f8fafc', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <MessageSquare size={32} color="#cbd5e1" />
                    </div>
                    <p style={{ color: '#1e293b', fontWeight: 900, fontSize: '1.1rem', margin: 0 }}>No conversations</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>Try searching for someone else</p>
                </div>
            ) : (
                <div className="inbox-list" style={{ padding: '0 16px 100px' }}>
                    {filteredRooms.map(room => {
                        const isSystem = room.lastMessage?.startsWith('STATUS UPDATE') || room.lastMessage?.startsWith('BOOKING:');
                        return (
                            <div key={room.roomId} onClick={() => onSelectRoom(room)} className="conversation-card">
                                <div className="conversation-avatar-wrapper">
                                    <img
                                        src={room.otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`}
                                        alt=""
                                        className="conversation-avatar"
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`; }}
                                    />
                                    {room.unreadCount > 0 && (
                                        <div style={{ position: 'absolute', top: -4, right: -4, background: PC, color: 'white', fontSize: 10, fontWeight: 900, minWidth: 20, height: 20, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3.5px solid white', boxSizing: 'content-box' }}>
                                            {room.unreadCount}
                                        </div>
                                    )}
                                </div>
                                <div className="conversation-info">
                                    <div className="conversation-top-row">
                                        <p className="conversation-name">{room.otherUser?.name || 'User'}</p>
                                        <p className="conversation-time">{room.updatedAt ? new Date(room.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                                    </div>
                                    <p className="conversation-last-msg" style={{ color: isSystem ? PC : '#64748b', fontWeight: room.unreadCount > 0 || isSystem ? 700 : 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {isSystem && <div style={{ width: 6, height: 6, borderRadius: '50%', background: PC }}></div>}
                                        {room.lastMessage}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                                    <button onClick={(e) => handleDeleteRoom(e, room.roomId)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: 4 }}>
                                        <Trash2 size={16} />
                                    </button>
                                    <ChevronRight size={18} color="#cbd5e1" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Shell>
    );
}
