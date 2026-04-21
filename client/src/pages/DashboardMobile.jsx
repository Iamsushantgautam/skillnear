import React, { useState, useEffect, useRef } from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import {
    Briefcase, MessageSquare, Wallet, User,
    Star, PlusCircle, ArrowLeft, Loader, CheckCircle,
    ChevronRight, Edit3, Send, Search, ShoppingBag, MapPin, ChevronLeft, Plus as PlusIcon,
    ShoppingCart, Video
} from 'lucide-react';
import io from 'socket.io-client';
import api, { API_URL } from '../utils/api';
import DashboardMobileNav from '../components/DashboardMobileNav';
import useAuthStore from '../store/useAuthStore';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
};

const PC = '#003d9b';
const PL = 'rgba(0,61,155,0.08)';

/* ─── shared shell ─── */
function Shell({ title, onBack, children, headerRight }) {
    return (
        <div style={{ minHeight: '100dvh', background: '#faf8ff', fontFamily: 'Inter, sans-serif', paddingBottom: 100 }}>
            <div style={{ background: PC, padding: '52px 20px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                {onBack && (
                    <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                        <ArrowLeft size={18} color="white" />
                    </button>
                )}
                <h1 style={{ color: 'white', fontWeight: 900, fontSize: '1.25rem', flex: 1 }}>{title}</h1>
                {headerRight}
            </div>
            <div style={{ padding: '20px 16px' }}>{children}</div>
        </div>
    );
}

/* ─── status badge ─── */
function Badge({ status }) {
    const map = {
        pending: { label: 'Pending', bg: '#fef3c7', color: '#92400e' },
        confirmed: { label: 'Confirmed', bg: '#d1fae5', color: '#065f46' },
        in_progress: { label: 'In Progress', bg: '#dbeafe', color: '#1e40af' },
        delivered: { label: 'Delivered', bg: '#e0e7ff', color: '#3730a3' },
        completed: { label: 'Completed', bg: '#d1fae5', color: '#065f46' },
        cancelled: { label: 'Cancelled', bg: '#fee2e2', color: '#991b1b' },
        live: { label: 'Live', bg: '#d1fae5', color: '#065f46' },
        rejected: { label: 'Rejected', bg: '#fee2e2', color: '#991b1b' },
        review: { label: 'Review', bg: '#fef3c7', color: '#92400e' },
    };
    const { label, bg, color } = map[status] || { label: status, bg: '#f3f4f6', color: '#374151' };
    return (
        <span style={{ 
            background: bg, 
            color: color, 
            padding: '4px 10px', 
            borderRadius: 6, 
            fontSize: 10, 
            fontWeight: 800, 
            textTransform: 'uppercase', 
            height: 'fit-content' 
        }}>{label}</span>
    );
}

/* ─── Inbox screen (WhatsApp style list) ─── */
function InboxScreen({ user, setActiveTab, onSelectRoom, onMenuClick }) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

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
            socket.on('receiveMessage', () => {
                fetchRooms();
            });
            return () => socket.disconnect();
        }
    }, [user?._id]);

    const [search, setSearch] = useState('');

    const filteredRooms = rooms.filter(r => 
        r.otherUser?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.lastMessage?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Shell title="Messages" onBack={() => setActiveTab('overview')} onMenuClick={onMenuClick}>
            <div style={{ padding: '0 16px 12px' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 16px 100px' }}>
                    {filteredRooms.map(room => {
                        const isSystem = room.lastMessage?.startsWith('STATUS UPDATE') || room.lastMessage?.startsWith('BOOKING:');
                        return (
                            <div key={room.roomId} onClick={() => onSelectRoom(room)}
                                style={{ 
                                    background: 'white', 
                                    padding: '16px', 
                                    display: 'flex', 
                                    gap: 14, 
                                    alignItems: 'center', 
                                    cursor: 'pointer', 
                                    borderRadius: 24,
                                    border: room.unreadCount > 0 ? `1.5px solid ${PL}` : '1.5px solid #f1f5f9',
                                    boxShadow: room.unreadCount > 0 ? `0 8px 20px ${PL}33` : '0 4px 15px rgba(0,0,0,0.03)',
                                    transition: 'transform 0.2s'
                                }}>
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={room.otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`}
                                        alt=""
                                        style={{ width: 56, height: 56, borderRadius: '20px', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`; }}
                                    />
                                    {room.unreadCount > 0 && (
                                        <div style={{ position: 'absolute', top: -4, right: -4, background: PC, color: 'white', fontSize: 10, fontWeight: 900, minWidth: 20, height: 20, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3.5px solid white', boxSizing: 'content-box' }}>
                                            {room.unreadCount}
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <p style={{ fontWeight: 900, fontSize: '1rem', color: '#1e293b', margin: 0 }}>{room.otherUser?.name || 'User'}</p>
                                        <p style={{ fontSize: 10, color: room.unreadCount > 0 ? PC : '#94a3b8', fontWeight: 800, margin: 0 }}>{room.updatedAt ? new Date(room.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                                    </div>
                                    <p style={{ 
                                        fontSize: 13, 
                                        color: isSystem ? PC : '#64748b', 
                                        fontWeight: room.unreadCount > 0 || isSystem ? 700 : 500,
                                        whiteSpace: 'nowrap', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis', 
                                        margin: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4
                                    }}>
                                        {isSystem && <div style={{ width: 6, height: 6, borderRadius: '50%', background: PC }}></div>}
                                        {room.lastMessage}
                                    </p>
                                </div>
                                <ChevronRight size={18} color="#cbd5e1" />
                            </div>
                        );
                    })}
                </div>
            )}
        </Shell>
    );
}

/* ─── Integrated Chat Room (WhatsApp style) ─── */
function ChatRoom({ user, room, onBack }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const scrollRef = useRef(null);
    const [activeService, setActiveService] = useState(null);

    // Fetch active service if serviceId in URL
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const serviceId = queryParams.get('service');
        if (serviceId) {
            api.get(`/api/services/${serviceId}`).then(({ data }) => setActiveService(data)).catch(() => {});
        }
    }, []);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await api.get(`/api/messages/${room.roomId}`, config);
                setMessages(data);
                await api.put(`/api/messages/${room.roomId}/read`, {}, config);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchMessages();

        const newSocket = io(API_URL);
        newSocket.emit('setup', user._id);
        newSocket.emit('joinRoom', room.roomId);
        newSocket.on('receiveMessage', (msg) => {
            if (msg.roomId === room.roomId) {
                setMessages(prev => {
                    if (prev.find(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
            }
        });
        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, [room.roomId, user]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || !socket) return;
        const msg = {
            senderId: user._id,
            receiverId: room.otherUser._id,
            roomId: room.roomId,
            message: input
        };
        socket.emit('sendMessage', msg);
        setInput('');
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#f0f2f5', zIndex: 1100, display: 'flex', flexDirection: 'column' }}>
            {/* ── Header ── */}
            <div style={{
                background: `linear-gradient(135deg, ${PC} 0%, #0052cc 100%)`,
                padding: '52px 16px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 4px 20px rgba(0,61,155,0.25)'
            }}>
                <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ArrowLeft size={20} />
                </button>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                        src={room.otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`}
                        style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)' }}
                        alt=""
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`; }}
                    />
                    <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: '1.5px solid white' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ color: 'white', margin: 0, fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.01em' }}>{room.otherUser?.name}</h4>
                    <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 500 }}>● Online</span>
                </div>
                <button style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Video size={18} />
                </button>
            </div>

            {/* ── Service Context Card ── */}
            {activeService && (
                <div style={{
                    padding: '10px 16px',
                    background: '#fff',
                    borderBottom: '1px solid #e8ecf0',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                    <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, background: PC, flexShrink: 0 }} />
                    <img
                        src={activeService.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeService.title)}&background=f8fafc&color=4f46e5`}
                        style={{ width: 44, height: 36, borderRadius: 8, objectFit: 'cover' }}
                        alt=""
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: PC, textTransform: 'uppercase', letterSpacing: 0.8 }}>Inquiring About</span>
                        <h5 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeService.title}</h5>
                    </div>
                    <button
                        onClick={() => setActiveService(null)}
                        style={{ background: '#f1f5f9', border: 'none', color: '#94a3b8', width: 24, height: 24, borderRadius: '50%', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >✕</button>
                </div>
            )}

            {/* ── Messages ── */}
            <div className="no-scrollbar" style={{
                flex: 1,
                padding: '16px 12px',
                overflowY: 'auto',
                background: '#e5ddd5',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                display: 'flex',
                flexDirection: 'column',
                gap: 3
            }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, height: '100%' }}>
                        <Loader className="animate-spin" color={PC} size={28} />
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, opacity: 0.6 }}>
                        <div style={{ fontSize: '2.5rem' }}>👋</div>
                        <p style={{ fontSize: '0.85rem', color: '#555', fontWeight: 600 }}>Say hello to start chatting!</p>
                    </div>
                ) : (
                    messages.map((m, i) => {
                        const isMe = m.senderId === user._id;
                        const showDate = i === 0 || new Date(m.createdAt).toDateString() !== new Date(messages[i-1]?.createdAt).toDateString();
                        return (
                            <div key={m._id || i}>
                                {showDate && (
                                    <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                                        <span style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)', fontSize: 11, color: '#666', padding: '3px 12px', borderRadius: 20, fontWeight: 600 }}>
                                            {new Date(m.createdAt).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 2 }}>
                                    <div style={{
                                        background: isMe ? '#d9fdd3' : '#ffffff',
                                        padding: '7px 12px 5px',
                                        borderRadius: isMe ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
                                        maxWidth: '80%',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                                        position: 'relative',
                                        minWidth: 60
                                    }}>
                                        <p style={{ margin: 0, fontSize: '0.92rem', color: '#111', lineHeight: 1.45, wordBreak: 'break-word' }}>{m.message}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 3 }}>
                                            <span style={{ fontSize: 10, color: '#8aa', fontWeight: 500 }}>
                                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isMe && <span style={{ fontSize: 11, color: '#53bdeb' }}>✓✓</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={scrollRef} />
            </div>

            {/* ── Input Area ── */}
            <div style={{
                padding: '10px 12px',
                paddingBottom: 28,
                background: '#f0f2f5',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
            }}>
                <div style={{ flex: 1, background: 'white', borderRadius: 28, display: 'flex', alignItems: 'center', padding: '4px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Message..."
                        style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem', padding: '8px 0', background: 'transparent', color: '#1e293b' }}
                    />
                </div>
                <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    style={{
                        background: input.trim() ? `linear-gradient(135deg, ${PC} 0%, #0052cc 100%)` : '#cbd5e1',
                        border: 'none',
                        width: 46,
                        height: 46,
                        borderRadius: '50%',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: input.trim() ? '0 4px 12px rgba(0,61,155,0.3)' : 'none',
                        transition: 'all 0.2s',
                        transform: input.trim() ? 'scale(1)' : 'scale(0.95)'
                    }}
                >
                    <Send size={19} />
                </button>
            </div>
        </div>
    );
}

/* ─── My Gigs screen ─── */
function GigsScreen({ myGigs, gigsLoading, setActiveTab, navigate, handleEditClick, onMenuClick }) {
    return (
        <Shell title="My Gigs" onBack={() => setActiveTab('overview')} onMenuClick={onMenuClick}
            headerRight={
                <button onClick={() => setActiveTab('services')}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 14px', borderRadius: 9999, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    + New Gig
                </button>
            }>
            {gigsLoading ? (
                <div style={{ textAlign: 'center', padding: 48 }}><Loader size={28} color={PC} className="animate-spin" /></div>
            ) : myGigs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed #e2e8f0', borderRadius: 20 }}>
                    <Briefcase size={40} color="#cbd5e1" style={{ marginBottom: 12 }} />
                    <p style={{ color: '#94a3b8' }}>No gigs yet</p>
                    <button onClick={() => setActiveTab('services')} style={{ background: PC, color: 'white', border: 'none', borderRadius: 9999, padding: '10px 24px', fontWeight: 700 }}>Create First Gig</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {myGigs.map(gig => {
                        const isLive = gig.isApproved && gig.isActive;
                        const stat = !gig.isApproved ? 'review' : isLive ? 'live' : 'rejected';
                        return (
                            <div key={gig._id}
                                style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', gap: 12, alignItems: 'center' }}>
                                <div onClick={() => navigate(`/services/${gig._id}`)} style={{ flex: 1, display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', minWidth: 0 }}>
                                    <img
                                        src={gig.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=f3f3fd&color=003d9b`}
                                        style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }}
                                        alt=""
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=f3f3fd&color=003d9b`; }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{gig.title}</p>
                                        <p style={{ fontSize: 12, color: '#64748b', marginTop: 2, margin: 0 }}>₹{gig.price} · {gig.category}</p>
                                        <div style={{ marginTop: 6 }}><Badge status={stat} /></div>
                                    </div>
                                </div>
                                <button onClick={() => handleEditClick?.(gig)} style={{ background: PL, border: 'none', borderRadius: 12, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Edit3 size={16} color={PC} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </Shell>
    );
}

/* ─── Requests Screen ─── */
function RequestsScreen({ bookingRequests, bookingsLoading, updateBookingStatus, setActiveTab, navigate, onSelectRoom, onSelectBooking, onMenuClick }) {
    return (
        <Shell title="Booking Requests" onBack={() => setActiveTab('overview')} onMenuClick={onMenuClick}>
            {bookingsLoading ? (
                <div style={{ textAlign: 'center', padding: 48 }}><Loader size={28} color={PC} className="animate-spin" /></div>
            ) : bookingRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}><p style={{ color: '#94a3b8' }}>No requests yet</p></div>
            ) : bookingRequests.map(req => (
                <div key={req._id} onClick={() => onSelectBooking(req)} style={{ background: 'white', borderRadius: 24, padding: 20, marginBottom: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{req.service?.title}</h4>
                            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>₹{req.price || req.totalPrice || '0'} · {req.user?.name || req.user?.username || 'User'}</p>
                        </div>
                        <Badge status={req.status} />
                    </div>
                    {req.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(req._id, 'confirmed'); }} style={{ flex: 1, background: PC, color: 'white', border: 'none', borderRadius: 12, padding: '10px 0', fontWeight: 700 }}>Accept</button>
                            <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(req._id, 'cancelled'); }} style={{ flex: 1, background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 12, padding: '10px 0', fontWeight: 700 }}>Decline</button>
                        </div>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onSelectRoom({ roomId: req._id, otherUser: req.user }); }} style={{ width: '100%', background: '#f3f3fd', color: PC, border: 'none', borderRadius: 12, padding: '10px 0', fontWeight: 700, marginTop: 8 }}>Message Customer</button>
                </div>
            ))}
        </Shell>
    );
}

/* ─── Orders Screen ─── */
function OrdersScreen({ myBookings, bookingsLoading, setActiveTab, navigate, onSelectRoom, onSelectBooking, onMenuClick }) {
    return (
        <Shell title="My Orders" onBack={() => setActiveTab('overview')} onMenuClick={onMenuClick}>
            {bookingsLoading ? (
                <div style={{ textAlign: 'center', padding: 48 }}><Loader size={28} color={PC} className="animate-spin" /></div>
            ) : myBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}><p style={{ color: '#94a3b8' }}>No orders yet</p></div>
            ) : myBookings.map(b => (
                <div key={b._id} onClick={() => onSelectBooking(b)} style={{ background: 'white', borderRadius: 24, padding: 20, marginBottom: 16, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{b.service?.title}</h4>
                            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>₹{b.price || b.totalPrice || '0'} · {new Date(b.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Badge status={b.status} />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onSelectRoom({ roomId: b._id, otherUser: b.provider }); }} style={{ marginTop: 10, width: '100%', background: '#f3f3fd', color: PC, border: 'none', borderRadius: 12, padding: '10px 0', fontWeight: 700 }}>Message Provider</button>
                </div>
            ))}
        </Shell>
    );
}

/* ─── Booking Details Screen ─── */
function BookingDetailsScreen({ booking, userLocation, onBack, onMessage, role, updateBookingStatus }) {
    if (!booking) return null;

    const otherUser = role === 'provider' ? booking.user : booking.provider;
    const isPending = booking.status === 'pending';

    const distance = calculateDistance(
        userLocation?.latitude, 
        userLocation?.longitude, 
        booking.address?.lat, 
        booking.address?.lng
    );

    const detailRow = (label, value) => (
        <div style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 800, textAlign: 'right' }}>{value}</span>
        </div>
    );

    return (
        <Shell title={role === 'provider' ? "Booking Details" : "Order Details"} onBack={onBack}>
            <div style={{ padding: '0 20px 20px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: 28, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.04)', marginBottom: 24, border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID: #{booking._id?.slice(-8).toUpperCase()}</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: PC }}>{role === 'provider' ? 'For' : 'With'}: {otherUser?.name || otherUser?.username || 'User'}</span>
                        </div>
                        <div style={{ 
                            backgroundColor: booking.status === 'pending' ? '#fff7ed' : ['confirmed', 'in_progress', 'delivered', 'completed'].includes(booking.status) ? '#f0fdf4' : '#fef2f2', 
                            color: booking.status === 'pending' ? '#f97316' : ['confirmed', 'in_progress', 'delivered', 'completed'].includes(booking.status) ? '#22c55e' : '#ef4444', 
                            padding: '4px 12px', borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: 'uppercase'
                        }}>
                             {booking.status.replace('_', ' ')}
                        </div>
                    </div>

                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e293b', marginBottom: 8, lineHeight: 1.2 }}>{booking.service?.title || 'Service Details'}</h2>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500, marginBottom: 24 }}>Real-time update of your scheduled service</p>

                    <div style={{ background: '#f8fafc', borderRadius: 20, padding: 20, marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Total Price</span>
                            <span style={{ fontSize: 20, color: PC, fontWeight: 900 }}>₹{booking.price || booking.totalPrice || '0'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div>
                                <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 800 }}>{booking.paymentMethod || 'Wallet'}</span>
                            </div>
                            {distance && (
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: 12 }}>
                                    <MapPin size={12} color="#3b82f6" />
                                    <span style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 800 }}>{distance} km away</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {detailRow('Plan Selected', booking.selectedPlan || 'Default')}
                        {detailRow('Date', booking.createdAt ? new Date(booking.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A')}
                        {detailRow('Service Type', booking.service?.businessType?.toString().toUpperCase() || 'SERVICE')}
                        {detailRow('Location', typeof booking.address === 'object' ? (`${booking.address?.street || ''}, ${booking.address?.city || ''}`.trim() || 'Standard') : (booking.address || 'Standard Location'))}
                        
                        {booking.address?.googleMapLink && detailRow('Maps URL', <a href={booking.address.googleMapLink} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 800 }}>Visit Link 🔗</a>)}

                        {(booking.address?.googleMapLink || (booking.address?.lat && booking.address?.lng)) && (
                            <div style={{ padding: '16px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Interactive Map</span>
                                    <button 
                                        onClick={() => {
                                            const link = booking.address.googleMapLink || `https://www.google.com/maps?q=${booking.address.lat},${booking.address.lng}`;
                                            window.open(link, '_blank');
                                        }}
                                        style={{ background: '#f0f9ff', color: '#0ea5e9', border: 'none', padding: '8px 16px', borderRadius: 12, fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                                    >
                                        Get Directions 📍
                                    </button>
                                </div>
                                <div onClick={() => {
                                     const link = booking.address.googleMapLink || `https://www.google.com/maps?q=${booking.address.lat},${booking.address.lng}`;
                                     window.open(link, '_blank');
                                }} style={{ width: '100%', height: 120, borderRadius: 16, background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                                    <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: `repeating-linear-gradient(45deg, ${PC}, ${PC} 10px, transparent 10px, transparent 20px)` }}></div>
                                    <div style={{ textAlign: 'center', zIndex: 1 }}>
                                        <MapPin size={24} color={PC} />
                                        <div style={{ fontSize: 10, fontWeight: 800, color: PC, marginTop: 4 }}>TAP TO VIEW ON MAP</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: 28, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.04)', marginBottom: 24, border: '1px solid #f1f5f9' }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>
                        {role === 'provider' ? 'Customer Info' : 'Professional Info'}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <img 
                            src={otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || otherUser?.username || 'U')}`} 
                            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} 
                            alt=""
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=U&background=ede9fe&color=4f46e5`; }}
                        />
                        <div style={{ flex: 1 }}>
                            <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{otherUser?.name || otherUser?.username || 'User'}</h5>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{otherUser?.email || otherUser?.emailAddress || 'Contact via Message'}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onMessage(); }} style={{ padding: '10px 16px', borderRadius: 12, background: PL, color: PC, border: 'none', fontWeight: 800, fontSize: 12 }}>Message</button>
                    </div>
                </div>

                {role === 'provider' && booking.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                        <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking._id, 'confirmed'); }} style={{ flex: 1, padding: '16px', borderRadius: 16, background: PC, color: 'white', border: 'none', fontWeight: 900, boxShadow: '0 10px 20px rgba(0, 61, 155, 0.2)' }}>Accept Order</button>
                        <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking._id, 'cancelled'); }} style={{ flex: 1, padding: '16px', borderRadius: 16, background: '#fee2e2', color: '#ef4444', border: 'none', fontWeight: 900 }}>Decline</button>
                    </div>
                )}
            </div>
        </Shell>
    );
}

/* ─── Profile Screen ─── */
function ProfileScreen({ user, profileAvatar, getAvatar, profileName, setProfileName, profilePhone, setProfilePhone, profileUsername, setProfileUsername, providerTitle, providerAbout, providerTitleSetter, providerAboutSetter, handleSaveProfile, savingProfile, uploadingAvatar, handleAvatarUpload, role, setActiveTab, onMenuClick }) {
    const sectionStyle = {
        background: 'white',
        borderRadius: 24,
        padding: 24,
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        border: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        marginBottom: 20
    };

    const labelStyle = {
        fontSize: 12,
        fontWeight: 800,
        color: '#64748b',
        marginBottom: 8,
        display: 'block',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 16px',
        borderRadius: 16,
        border: '2px solid #f1f5f9',
        backgroundColor: '#f8fafc',
        fontSize: '0.95rem',
        color: '#1e293b',
        fontWeight: 500,
        transition: 'all 0.2s'
    };

    return (
        <Shell title="Edit Profile" onBack={() => setActiveTab('overview')} onMenuClick={onMenuClick}
            headerRight={
                <button onClick={handleSaveProfile} disabled={savingProfile}
                    style={{ background: 'white', color: PC, border: 'none', padding: '8px 20px', borderRadius: 9999, fontWeight: 800, fontSize: 13, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                    {savingProfile ? '...' : 'Save'}
                </button>
            }>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0 32px' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: -6, border: `2px dashed ${PC}`, borderRadius: '50%', opacity: 0.3 }}></div>
                    <img
                        src={profileAvatar || getAvatar?.(user)}
                        style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', border: `3px solid white`, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                        alt=""
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName || 'U')}&background=ede9fe&color=4f46e5&size=110`; }}
                    />
                    <label htmlFor="mob-avatar-upload" style={{ position: 'absolute', bottom: 4, right: 4, background: PC, borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '3px solid white', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
                        {uploadingAvatar ? <Loader size={14} color="white" className="animate-spin" /> : <Edit3 size={16} color="white" />}
                    </label>
                    <input id="mob-avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                </div>
                <h4 style={{ margin: '16px 0 0', fontWeight: 900, fontSize: '1.2rem', color: '#1e293b' }}>{profileName || 'Your Name'}</h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{user?.email}</p>
            </div>

            <div style={sectionStyle}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>Personal Information</h3>
                <div>
                    <label style={labelStyle}>Full Name</label>
                    <input value={profileName} onChange={e => setProfileName(e.target.value)} style={inputStyle} placeholder="John Doe" />
                </div>
                <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input value={profilePhone} onChange={e => setProfilePhone(e.target.value)} style={inputStyle} placeholder="+91 00000 00000" />
                </div>
            </div>

            <div style={sectionStyle}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>Professional Info</h3>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label style={labelStyle}>Professional Title</label>
                        <span style={{ fontSize: 10, color: (providerTitle?.length || 0) >= 25 ? '#ef4444' : '#94a3b8', fontWeight: 700 }}>{providerTitle?.length || 0}/25</span>
                    </div>
                    <input 
                        value={providerTitle} 
                        onChange={e => providerTitleSetter(e.target.value)} 
                        maxLength={25}
                        style={inputStyle} 
                        placeholder="e.g. Master Electrician" 
                    />
                </div>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label style={labelStyle}>About Me / Bio</label>
                        <span style={{ fontSize: 10, color: (providerAbout?.length || 0) >= 50 ? '#ef4444' : '#94a3b8', fontWeight: 700 }}>{providerAbout?.length || 0}/50</span>
                    </div>
                    <textarea 
                        value={providerAbout} 
                        onChange={e => providerAboutSetter(e.target.value)} 
                        maxLength={50}
                        rows={3} 
                        style={{ ...inputStyle, resize: 'none' }} 
                        placeholder="Short bio (max 50 characters)" 
                    />
                </div>
            </div>

            <div style={{ padding: '0 8px 40px' }}>
                <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    style={{ background: `linear-gradient(to right, ${PC}, #1e40af)`, color: 'white', border: 'none', borderRadius: 20, padding: '18px 0', fontWeight: 800, width: '100%', fontSize: '1rem', boxShadow: `0 10px 20px ${PL}` }}
                >
                    {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
            </div>
        </Shell>
    );
}

function AdminScreen({ allUsers, usersLoading, handleUpdateUserRole, handleToggleUserBan, setActiveTab }) {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredUsers = allUsers?.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Shell title="Admin Panel" onBack={() => setActiveTab('overview')}>
            <main style={{ padding: '24px 16px 120px' }}>
                <div style={{ position: 'relative', marginBottom: 24 }}>
                    <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search users by name or email..." 
                        style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: 16, border: '2px solid #f1f5f9', background: 'white', fontSize: '0.9rem' }} 
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {usersLoading ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading users...</div>
                    ) : filteredUsers?.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No users found.</div>
                    ) : filteredUsers?.map(u => (
                        <div key={u._id} style={{ background: 'white', padding: 20, borderRadius: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: u.isBanned ? '2px solid #fee2e2' : '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                                <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}`} style={{ width: 48, height: 48, borderRadius: '50%' }} />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{u.name}</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{u.email}</p>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                        <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 99, background: u.role === 'provider' ? PL : '#f1f5f9', color: u.role === 'provider' ? PC : '#64748b' }}>{u.role}</span>
                                        {u.isBanned && <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 99, background: '#fee2e2', color: '#ef4444' }}>Banned</span>}
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: 8 }}>
                                <select 
                                    value={u.role} 
                                    onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                                    style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid #f1f5f9', fontSize: '0.8rem', background: '#f8fafc', fontWeight: 700 }}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="provider">Provider</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <button 
                                    onClick={() => handleToggleUserBan(u._id)}
                                    style={{ 
                                        flex: 1, padding: '10px', borderRadius: 12, border: 'none', 
                                        background: u.isBanned ? '#10b981' : '#ef4444', 
                                        color: 'white', fontSize: '0.8rem', fontWeight: 800 
                                    }}
                                >
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

function BecomeProviderScreen({ handleApplyProvider, isSubmitting, setActiveTab }) {
    return (
        <Shell title="Become a Professional" onBack={() => setActiveTab('overview')}>
            <main style={{ padding: '40px 20px 120px', textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '24px', background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <Briefcase size={40} color={PC} />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', marginBottom: 12 }}>Start Your Journey</h2>
                <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.6, marginBottom: 40, fontWeight: 500 }}>
                    Join our network of experts and start growing your business. Reach more customers and manage your bookings all in one place.
                </p>

                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 48 }}>
                    {[
                        { title: 'Zero Setup Cost', desc: 'Start selling without any upfront fees.' },
                        { title: 'Local Reach', desc: 'Connect with customers in your immediate area.' },
                        { title: 'Easy Management', desc: 'Handle everything from your mobile dashboard.' }
                    ].map((f, i) => (
                        <div key={i} style={{ display: 'flex', gap: 16 }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12 }}>✓</div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>{f.title}</h4>
                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={handleApplyProvider} 
                    disabled={isSubmitting}
                    style={{ 
                        width: '100%', padding: '20px', borderRadius: 20, border: 'none', 
                        background: PC, color: 'white', fontSize: '1.1rem', fontWeight: 800,
                        boxShadow: '0 10px 20px rgba(0, 61, 155, 0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
                    }}
                >
                    {isSubmitting ? <Loader className="animate-spin" /> : 'Apply Now & Start Selling'}
                    <ChevronRight size={20} />
                </button>
            </main>
        </Shell>
    );
}

function ServicesScreen(props) {
    const {
        gigStep, setGigStep, gigTitle, setGigTitle, gigCategory, setGigCategory,
        gigDesc, setGigDesc, gigServicesIncluded, setGigServicesIncluded, gigPrice, setGigPrice, gigPriceType, setGigPriceType,
        gigBusinessType, setGigBusinessType, gigCustomCategory, setGigCustomCategory,
        gigExperience, setGigExperience, gigJobsCompleted, setGigJobsCompleted,
        shopAge, setShopAge, usePlans, setUsePlans, gigPlans, setGigPlans,
        shopOpeningTime, setShopOpeningTime, shopClosingTime, setShopClosingTime,
        shopIsHomeDelivery, setShopIsHomeDelivery, shopIsHomeService, setShopIsHomeService,
        shopHomeServiceFee, setShopHomeServiceFee, gigLat, gigLng, setGigLat, setGigLng,
        shopGoogleMapsLink, setShopGoogleMapsLink, gigStateCode, setGigStateCode,
        gigState, setGigState, gigCity, setGigCity, gigAddress, setGigAddress,
        gigZipCode, setGigZipCode, gigCoveragePincodes, setGigCoveragePincodes,
        gigImages, setGigImages, handleGigImageUpload, handleCreateGig,
        creatingGig, uploadingGigImages, indianStates, MapPicker, editingGigId,
        setActiveTab, gigTargetGender, setGigTargetGender
    } = props;

    const inputStyle = {
        width: '100%', padding: '14px 16px', borderRadius: 16, border: '2px solid #f1f5f9',
        backgroundColor: '#fff', fontSize: '0.95rem', color: '#1e293b', fontWeight: 500,
        marginBottom: 16, outline: 'none'
    };

    const labelStyle = {
        fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 8,
        display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px'
    };

    return (
        <Shell title={editingGigId ? "Edit Gig" : "Create Gig"} onBack={() => setActiveTab('overview')}>
            <main style={{ padding: '24px 16px 120px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: gigStep === s ? PC : (gigStep > s ? '#10b981' : '#e2e8f0'),
                            color: 'white', fontWeight: 900, fontSize: 12
                        }}>{gigStep > s ? '✓' : s}</div>
                    ))}
                </div>

                {gigStep === 1 && (
                    <div className="animate-fade-in">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                            <button onClick={() => setGigBusinessType('service')} style={{ padding: 16, borderRadius: 16, border: `2px solid ${gigBusinessType === 'service' ? PC : '#f1f5f9'}`, background: gigBusinessType === 'service' ? PL : 'white' }}>
                                <Briefcase size={24} color={PC} style={{ marginBottom: 8 }} />
                                <div style={{ fontSize: 12, fontWeight: 800 }}>Service</div>
                            </button>
                            <button onClick={() => setGigBusinessType('shop')} style={{ padding: 16, borderRadius: 16, border: `2px solid ${gigBusinessType === 'shop' ? PC : '#f1f5f9'}`, background: gigBusinessType === 'shop' ? PL : 'white' }}>
                                <MapPin size={24} color={PC} style={{ marginBottom: 8 }} />
                                <div style={{ fontSize: 12, fontWeight: 800 }}>Shop</div>
                            </button>
                        </div>

                        <label style={labelStyle}>{gigBusinessType === 'service' ? 'Gig Title' : 'Shop Name'}</label>
                        <input value={gigTitle} onChange={e => setGigTitle(e.target.value)} style={inputStyle} placeholder={gigBusinessType === 'service' ? "e.g. Master Plumber" : "e.g. Sharma Grocery Store"} />

                        <label style={labelStyle}>Category</label>
                        <select value={gigCategory} onChange={e => setGigCategory(e.target.value)} style={inputStyle}>
                            <option value="">Select Category</option>
                            {['Plumbers', 'Electricians', 'Painters', 'Carpenters', 'Cleaning', 'AC Repair', 'Tutors', 'Salon', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        {gigCategory === 'Other' && (
                            <input value={gigCustomCategory} onChange={e => setGigCustomCategory(e.target.value)} style={inputStyle} placeholder="Your category" />
                        )}

                        {gigCategory === 'Salon' && (
                            <div className="animate-fade-in" style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', marginBottom: 16 }}>
                                <label style={{ ...labelStyle, marginBottom: 10 }}>Service For</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {['male', 'female', 'unisex'].map(gender => (
                                        <button
                                            key={gender}
                                            onClick={() => setGigTargetGender(gender)}
                                            style={{
                                                flex: 1, padding: '10px 0', borderRadius: 12, border: `2px solid ${gigTargetGender === gender ? PC : '#e2e8f0'}`,
                                                background: gigTargetGender === gender ? PL : '#fff',
                                                color: gigTargetGender === gender ? PC : '#64748b',
                                                fontWeight: 800, fontSize: 12, textTransform: 'capitalize'
                                            }}
                                        >
                                            {gender}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {gigBusinessType === 'service' ? (
                                <>
                                    <div>
                                        <label style={labelStyle}>Experience (Yrs)</label>
                                        <input type="number" value={gigExperience} onChange={e => setGigExperience(e.target.value)} style={inputStyle} placeholder="5" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Jobs Done</label>
                                        <input type="number" value={gigJobsCompleted} onChange={e => setGigJobsCompleted(e.target.value)} style={inputStyle} placeholder="100" />
                                    </div>
                                </>
                            ) : (
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>Shop Age (Years)</label>
                                    <input type="number" value={shopAge} onChange={e => setShopAge(e.target.value)} style={inputStyle} placeholder="10" />
                                </div>
                            )}
                        </div>

                        <label style={labelStyle}>Description</label>
                        <textarea value={gigDesc} onChange={e => setGigDesc(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'none' }} placeholder="Describe your service..." />

                        <label style={labelStyle}>Services Included</label>
                        <input value={gigServicesIncluded} onChange={e => setGigServicesIncluded(e.target.value)} style={inputStyle} placeholder="e.g. Warranty, Parts, Cleaning" />
                    </div>
                )}

                {gigStep === 2 && (
                    <div className="animate-fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <label style={{ ...labelStyle, margin: 0 }}>Use 3 Tier Plans?</label>
                            <input type="checkbox" checked={usePlans} onChange={e => setUsePlans(e.target.checked)} style={{ width: 20, height: 20 }} />
                        </div>

                        {!usePlans ? (
                            <div style={{ display: 'flex', gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Price (₹)</label>
                                    <input type="number" value={gigPrice} onChange={e => setGigPrice(e.target.value)} style={inputStyle} placeholder="0.00" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Billing Type</label>
                                    <select value={gigPriceType} onChange={e => setGigPriceType(e.target.value)} style={inputStyle}>
                                        <option value="fixed">Fixed</option>
                                        <option value="hourly">Hourly</option>
                                        <option value="starting_at">Starting At</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {gigPlans.map((p, i) => (
                                    <div key={i} style={{ background: 'white', padding: 16, borderRadius: 16, border: '1px solid #f1f5f9' }}>
                                        <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 12, color: PC }}>{p.name.toUpperCase()}</div>
                                        <input type="number" value={p.price} onChange={e => { const n = [...gigPlans]; n[i].price = e.target.value; setGigPlans(n); }} style={inputStyle} placeholder="Price (₹)" />
                                        <textarea value={p.description} onChange={e => { const n = [...gigPlans]; n[i].description = e.target.value; setGigPlans(n); }} style={{ ...inputStyle, marginBottom: 16 }} placeholder="What's included?" rows={2} />
                                        <input value={p.features} onChange={e => { const n = [...gigPlans]; n[i].features = e.target.value; setGigPlans(n); }} style={inputStyle} placeholder="Features (comma separated)" />
                                        <select value={p.deliveryTime} onChange={e => { const n = [...gigPlans]; n[i].deliveryTime = e.target.value; setGigPlans(n); }} style={{ ...inputStyle, marginBottom: 0 }}>
                                            <option>1 Day Delivery</option>
                                            <option>2 Days Delivery</option>
                                            <option>5 Days Delivery</option>
                                            <option>10 Days Delivery</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}

                        {gigBusinessType === 'shop' && (
                            <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 16 }}>
                                <label style={labelStyle}>Shop Details</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                    <div>
                                        <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>Open</label>
                                        <input type="time" value={shopOpeningTime} onChange={e => setShopOpeningTime(e.target.value)} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>Close</label>
                                        <input type="time" value={shopClosingTime} onChange={e => setShopClosingTime(e.target.value)} style={inputStyle} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                                        <input type="checkbox" checked={shopIsHomeDelivery} onChange={e => setShopIsHomeDelivery(e.target.checked)} /> Home Delivery?
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                                        <input type="checkbox" checked={shopIsHomeService} onChange={e => setShopIsHomeService(e.target.checked)} /> Visit Client?
                                    </label>
                                    {shopIsHomeService && (
                                        <input type="number" value={shopHomeServiceFee} onChange={e => setShopHomeServiceFee(e.target.value)} style={{ ...inputStyle, marginTop: 8 }} placeholder="Visit Fee (₹)" />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {gigStep === 3 && (
                    <div className="animate-fade-in">
                        <label style={labelStyle}>Gallery (Max 5)</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                            {gigImages.map((img, i) => (
                                <div key={i} style={{ position: 'relative' }}>
                                    <img src={img} style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover' }} />
                                    <button onClick={() => setGigImages(gigImages.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white', borderRadius: '50%', width: 20, height: 20, border: 'none', fontSize: 12 }}>×</button>
                                </div>
                            ))}
                            {gigImages.length < 5 && (
                                <label style={{ width: 80, height: 80, borderRadius: 12, border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <PlusIcon size={24} color="#94a3b8" />
                                    <input type="file" multiple accept="image/*" onChange={handleGigImageUpload} style={{ display: 'none' }} />
                                </label>
                            )}
                        </div>

                        <label style={labelStyle}>Location & Map</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <select value={gigState} onChange={e => {
                                const s = indianStates?.find(st => st.name === e.target.value);
                                setGigState(e.target.value);
                                if (s) setGigStateCode(s.isoCode);
                            }} style={inputStyle}>
                                <option value="">Select State</option>
                                {indianStates?.map(s => <option key={s.isoCode} value={s.name}>{s.name}</option>)}
                            </select>
                            <input value={gigCity} onChange={e => setGigCity(e.target.value)} style={inputStyle} placeholder="City/Town" />
                        </div>
                        <input value={gigZipCode} onChange={e => setGigZipCode(e.target.value)} style={inputStyle} placeholder="Pin Code / Zip" />
                        <input value={gigAddress} onChange={e => setGigAddress(e.target.value)} style={inputStyle} placeholder="Full Street Address" />
                        
                        <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>Pin Location on Map</label>
                            <div style={{ height: 200, borderRadius: 16, overflow: 'hidden', border: '2px solid #f1f5f9' }}>
                                <MapPicker 
                                    lat={gigLat} 
                                    lng={gigLng} 
                                    onChange={(lat, lng) => { setGigLat(lat); setGigLng(lng); }} 
                                />
                            </div>
                        </div>

                        <label style={labelStyle}>Coverage Pincodes (Comma separated)</label>
                        <input value={gigCoveragePincodes} onChange={e => setGigCoveragePincodes(e.target.value)} style={inputStyle} placeholder="e.g. 110001, 110002" />
                        
                        <label style={labelStyle}>Google Maps Link (Optional)</label>
                        <input value={shopGoogleMapsLink} onChange={e => setShopGoogleMapsLink(e.target.value)} style={inputStyle} placeholder="https://goo.gl/maps/..." />
                    </div>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                    {gigStep > 1 && (
                        <button onClick={() => setGigStep(gigStep - 1)} style={{ flex: 1, padding: '16px', borderRadius: 16, border: '2px solid #f1f5f9', background: 'white', fontWeight: 800 }}>Back</button>
                    )}
                    {gigStep < 3 ? (
                        <button onClick={() => setGigStep(gigStep + 1)} style={{ flex: 1, padding: '16px', borderRadius: 16, border: 'none', background: PC, color: 'white', fontWeight: 800 }}>Next Step</button>
                    ) : (
                        <button onClick={handleCreateGig} disabled={creatingGig || uploadingGigImages} style={{ flex: 1, padding: '16px', borderRadius: 16, border: 'none', background: '#10b981', color: 'white', fontWeight: 800 }}>
                            {creatingGig ? 'Publishing...' : 'Complete & Publish'}
                        </button>
                    )}
                </div>
            </main>
        </Shell>
    );
}
function OverviewScreen({ user, role, stats, myGigs, profileAvatar, getAvatar, setActiveTab, navigate, providerTitle, providerAbout, onMenuClick }) {
    return (
        <>
            <section style={{ background: `linear-gradient(135deg, ${PC} 0%, #1e40af 100%)`, padding: '64px 24px 100px', borderRadius: '0 0 32px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, paddingRight: 16 }}>
                        <h2 style={{ color: 'white', margin: 0, fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.5px' }}>Hello, {user?.name?.split(' ')[0]}</h2>
                        {providerTitle && (
                            <p style={{ color: 'rgba(255,255,255,0.9)', margin: '4px 0 0', fontSize: '1rem', fontWeight: 700 }}>{providerTitle}</p>
                        )}
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, fontWeight: 500 }}>{providerAbout}</p>
                    </div>
                    <img
                        src={profileAvatar || getAvatar?.(user)}
                        alt="Profile"
                        style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.2)', objectFit: 'cover', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ede9fe&color=4f46e5&size=80`; }}
                    />
                </div>
            </section>

            <main style={{ marginTop: -50, padding: '0 16px 120px', display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Primary Stats Card */}
                <div style={{ background: 'white', borderRadius: 28, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: PL, opacity: 0.5 }}></div>

                    <p style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {role === 'provider' ? 'Total Earnings' : 'Wallet Balance'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '8px 0' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: PC }}>₹</span>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>
                            {role === 'provider' ? (stats?.totalEarnings?.toLocaleString() || 0) : (user?.wallet?.toLocaleString() || '0')}
                        </h2>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                        {[
                            { label: role === 'provider' ? 'Active Gigs' : 'Ongoing', value: role === 'provider' ? (myGigs?.length || 0) : (stats?.activeBookings || 0), color: '#4f46e5' },
                            { label: role === 'provider' ? 'Total Orders' : 'Completed', value: role === 'provider' ? (stats?.totalOrders || 0) : (stats?.completedBookings || 0), color: '#10b981' },
                            { label: 'Rating', value: role === 'provider' ? (stats?.rating || '4.9') : '5.0', color: '#f59e0b', icon: Star }
                        ].map((s, i) => (
                            <div key={i} style={{ flex: 1, background: '#f8fafc', padding: '12px 8px', borderRadius: 16, textAlign: 'center' }}>
                                <p style={{ fontSize: 10, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>{s.label}</p>
                                <p style={{ fontWeight: 900, fontSize: '1.1rem', color: '#1e293b', margin: 0 }}>{s.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {role === 'customer' && (
                    <div 
                        onClick={() => setActiveTab('become_provider')}
                        style={{ 
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', 
                            borderRadius: 28, 
                            padding: '24px', 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 16,
                            boxShadow: '0 15px 30px rgba(79, 70, 229, 0.2)',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ 
                            position: 'absolute', right: -10, bottom: -10, opacity: 0.1, transform: 'rotate(-15deg)' 
                        }}>
                            <Briefcase size={80} color="white" />
                        </div>
                        <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Briefcase size={24} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Become a Seller</h4>
                            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.9, fontWeight: 500 }}>Start earning money by sharing your skills today!</p>
                        </div>
                        <ChevronRight size={20} color="white" />
                    </div>
                )}

                {/* Quick Actions */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px 4px', color: '#1e293b' }}>Quick Actions</h3>
                    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {(role === 'provider' ? [
                            { icon: PlusCircle, label: 'Add New Gig', action: () => setActiveTab('services') },
                            { icon: ShoppingBag, label: 'My Gigs', tab: 'mygigs' },
                            { icon: ShoppingCart, label: 'Purchased Orders', tab: 'bookings' },
                            { icon: User, label: 'Profile Settings', tab: 'profile' },
                        ] : [
                            { icon: Search, label: 'Find Services', action: () => navigate('/services') },
                            { icon: Briefcase, label: 'My Bookings', tab: 'bookings' },
                            { icon: MessageSquare, label: 'Messages', tab: 'chat' },
                            { icon: User, label: 'Account', tab: 'profile' },
                        ]).map(({ icon: Icon, label, tab, action }, idx) => (
                            <button key={label} onClick={action || (() => setActiveTab(tab))}
                                style={{ background: 'white', borderRadius: 24, padding: '24px 20px', border: '1px solid #f1f5f9', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 16, background: idx % 2 === 0 ? '#eff6ff' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={24} color={idx % 2 === 0 ? '#3b82f6' : '#22c55e'} />
                                </div>
                                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>{label}</h4>
                            </button>
                        ))}
                    </section>
                </div>

                {/* Status Update / Tip Section */}
                <div style={{ background: `linear-gradient(to right, #4f46e5, #7c3aed)`, borderRadius: 24, padding: 20, color: 'white', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Star size={20} fill="white" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Pro Tip!</h4>
                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', opacity: 0.9 }}>
                            {role === 'provider' ? 'Complete your profile to get 2x more visibility.' : 'Verified experts are 3x more likely to deliver quality.'}
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}

export default function DashboardMobile(props) {
    const {
        user, role, stats, myGigs, gigsLoading, bookingRequests, bookingsLoading,
        profileAvatar, getAvatar, activeTab, setActiveTab,
        navigate: navProp,
        myBookings, updateBookingStatus,
        profileName, setProfileName, profilePhone, setProfilePhone,
        profileUsername, setProfileUsername,
        providerTitle, providerAbout,
        providerTitleSetter, providerAboutSetter,
        handleSaveProfile, savingProfile, handleAvatarUpload, uploadingAvatar,
        handleEditClick
    } = props;

    const { userLocation } = useAuthStore();
    const navHook = useNav();
    const navigate = navProp || navHook;
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Auto-open chat if provider/service ID in URL
    useEffect(() => {
        const provId = new URLSearchParams(window.location.search).get('provider');
        const servId = new URLSearchParams(window.location.search).get('service');
        
        if (provId && activeTab === 'chat' && !selectedRoom) {
            const fetchAndOpen = async () => {
                try {
                    const { data: provUser } = await api.get(`/api/users/${provId}`);
                    const ids = [user._id, provId].sort();
                    const rId = `direct_${ids[0]}_${ids[1]}`;
                    setSelectedRoom({
                        roomId: rId,
                        otherUser: provUser,
                        title: 'Inquiry',
                        type: 'Direct'
                    });
                } catch (err) { console.error(err); }
            };
            fetchAndOpen();
        }
    }, [activeTab]);

    const renderScreen = () => {
        if (selectedRoom) return <ChatRoom user={user} room={selectedRoom} onBack={() => setSelectedRoom(null)} />;
        if (selectedBooking) return <BookingDetailsScreen booking={selectedBooking} userLocation={userLocation} onBack={() => setSelectedBooking(null)} onMessage={() => { setSelectedRoom({ roomId: selectedBooking._id, otherUser: role === 'provider' ? selectedBooking.user : selectedBooking.provider }); setSelectedBooking(null); }} role={role} updateBookingStatus={updateBookingStatus} />;

        switch (activeTab) {
            case 'mygigs': return <GigsScreen myGigs={myGigs} gigsLoading={gigsLoading} setActiveTab={setActiveTab} navigate={navigate} handleEditClick={handleEditClick} />;
            case 'services': return <ServicesScreen {...props} setActiveTab={setActiveTab} />;
            case 'become_provider': return <BecomeProviderScreen handleApplyProvider={props.handleApplyProvider} isSubmitting={props.isSubmitting} setActiveTab={setActiveTab} />;
            case 'admin': return <AdminScreen allUsers={props.allUsers} usersLoading={props.usersLoading} handleUpdateUserRole={props.handleUpdateUserRole} handleToggleUserBan={props.handleToggleUserBan} setActiveTab={setActiveTab} />;
            case 'requests': return <RequestsScreen bookingRequests={bookingRequests} bookingsLoading={bookingsLoading} updateBookingStatus={updateBookingStatus} setActiveTab={setActiveTab} navigate={navigate} onSelectRoom={setSelectedRoom} onSelectBooking={setSelectedBooking} />;
            case 'bookings': return <OrdersScreen myBookings={myBookings} bookingsLoading={bookingsLoading} setActiveTab={setActiveTab} navigate={navigate} onSelectRoom={setSelectedRoom} onSelectBooking={setSelectedBooking} />;
            case 'chat': return <InboxScreen user={user} setActiveTab={setActiveTab} navigate={navigate} onSelectRoom={setSelectedRoom} />;
            case 'profile': return <ProfileScreen user={user} profileAvatar={profileAvatar} getAvatar={getAvatar} profileName={profileName} setProfileName={setProfileName} profilePhone={profilePhone} setProfilePhone={setProfilePhone} profileUsername={profileUsername} setProfileUsername={setProfileUsername} providerTitle={providerTitle} providerAbout={providerAbout} providerTitleSetter={providerTitleSetter} providerAboutSetter={providerAboutSetter} handleSaveProfile={handleSaveProfile} savingProfile={savingProfile} uploadingAvatar={uploadingAvatar} handleAvatarUpload={handleAvatarUpload} role={role} setActiveTab={setActiveTab} />;
            default: return <OverviewScreen user={user} role={role} stats={stats} myGigs={myGigs} providerTitle={providerTitle} providerAbout={providerAbout} profileAvatar={profileAvatar} getAvatar={getAvatar} setActiveTab={setActiveTab} navigate={navigate} />;
        }
    };

    return (
        <div style={{ minHeight: '100dvh', backgroundColor: '#faf8ff', fontFamily: 'Inter, sans-serif' }}>
            {renderScreen()}
            <DashboardMobileNav
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                role={role}
                navigate={navigate}
            />
        </div>
    );
};
