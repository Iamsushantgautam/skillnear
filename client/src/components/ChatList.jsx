import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, MessageSquare, Trash2 } from 'lucide-react';
import io from 'socket.io-client';
import api, { API_URL } from '../utils/api';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const ChatList = ({ limit, onSelect, activeRoomId }) => {
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
            socket.on('roomDeleted', () => {
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
            {rooms.map((room) => {
                const isActive = activeRoomId === room.roomId;
                return (
                    <div
                        key={room.roomId}
                        onClick={() => onSelect ? onSelect(room) : navigate(`/chat?roomId=${room.roomId}`)}
                        style={{
                            position: 'relative',
                            backgroundColor: isActive ? '#ffffff' : 'transparent',
                            padding: '16px',
                            borderRadius: '12px',
                            boxShadow: isActive ? '0 1px 2px 0 rgba(0,0,0,0.05)' : 'none',
                            border: isActive ? '1px solid rgba(0,61,155,0.05)' : '1px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            boxSizing: 'border-box'
                        }}
                        onMouseOver={(e) => {
                            if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(225, 226, 236, 0.5)';
                        }}
                        onMouseOut={(e) => {
                            if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <img
                                    src={room.otherUser?.avatar && room.otherUser.avatar.startsWith('http') ? room.otherUser.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`}
                                    alt={room.otherUser?.name}
                                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`; }}
                                />
                                {isActive && <span style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', backgroundColor: '#22c55e', border: '2px solid #ffffff', borderRadius: '50%' }}></span>}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                    <h3 style={{ fontWeight: 'bold', fontSize: '14px', color: '#191b23', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Manrope, sans-serif' }}>{room.otherUser?.name}</h3>
                                    <span style={{ fontSize: '10px', color: '#737685', fontWeight: 500 }}>
                                        {room.updatedAt ? new Date(room.updatedAt).toLocaleDateString() : ''}
                                    </span>
                                </div>
                                <p style={{ fontSize: '12px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.5, color: isActive ? '#003d9b' : '#434654', fontWeight: isActive ? 600 : 400 }}>
                                    {room.lastMessage}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                    <div style={{ fontSize: '9px', color: 'rgba(0,61,155,0.7)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '8px' }}>
                                        {room.type}: {room.title}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            api.delete(`/api/messages/${room.roomId}`)
                                                .then(() => {
                                                    toast.success('Chat deleted');
                                                    fetchRooms();
                                                })
                                                .catch(err => {
                                                    toast.error('Failed to delete chat');
                                                });
                                        }}
                                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px', transition: 'color 0.2s' }}
                                        onMouseOver={(e) => e.currentTarget.style.color = '#dc2626'}
                                        onMouseOut={(e) => e.currentTarget.style.color = '#f87171'}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ChatList;
