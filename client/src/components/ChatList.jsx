import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, MessageSquare } from 'lucide-react';
import io from 'socket.io-client';
import api, { API_URL } from '../utils/api';
import useAuthStore from '../store/useAuthStore';

const ChatList = ({ limit, onSelect }) => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRooms = async () => {
        if (!user) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/api/messages/rooms', config);
            setRooms(limit ? data.slice(0, limit) : data);
        } catch (err) {
            console.error("Failed to fetch rooms", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
        
        // Listen for real-time updates to refresh the list matching DashboardMobile
        if (user?._id) {
            const socket = io(API_URL);
            socket.emit('setup', user._id);
            socket.on('receiveMessage', () => {
                fetchRooms();
            });
            return () => socket.disconnect();
        }
    }, [user, limit]);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}><Loader className="spin" style={{ color: 'var(--primary)' }} /></div>;

    if (rooms.length === 0) return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
            <p>No messages yet.</p>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rooms.map((room) => (
                <div
                    key={room.roomId}
                    onClick={() => onSelect ? onSelect(room) : navigate(`/chat?roomId=${room.roomId}`)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: '#fff'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                    <img
                        src={room.otherUser?.avatar && room.otherUser.avatar.startsWith('http') ? room.otherUser.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`}
                        alt={room.otherUser?.name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`; }}
                    />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{room.otherUser?.name}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {room.updatedAt ? new Date(room.updatedAt).toLocaleDateString() : ''}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '2px 0' }}>
                            {room.lastMessage}
                        </p>
                        <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>
                            {room.type}: {room.title}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChatList;
