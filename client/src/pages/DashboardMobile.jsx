import React, { useState, useEffect, useRef } from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import {
    LayoutDashboard, Briefcase, MessageSquare, Wallet, User,
    Star, PlusCircle, ArrowLeft, Loader, CheckCircle,
    ChevronRight, Edit3, Send
} from 'lucide-react';
import io from 'socket.io-client';
import api, { API_URL } from '../utils/api';

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
        pending:    ['⏳ Pending',    '#fef3c7', '#92400e'],
        confirmed:  ['✅ Confirmed',   '#d1fae5', '#065f46'],
        in_progress:['🔧 In Progress', '#dbeafe', '#1e40af'],
        delivered:  ['📦 Delivered',   '#e0e7ff', '#3730a3'],
        completed:  ['🎉 Completed',   '#d1fae5', '#065f46'],
        cancelled:  ['❌ Cancelled',   '#fee2e2', '#991b1b'],
        live:       ['✅ Live',        '#d1fae5', '#065f46'],
        rejected:   ['❌ Rejected',    '#fee2e2', '#991b1b'],
        review:     ['⏳ Pending Review', '#fef3c7', '#92400e'],
    };
    const [label, bg, color] = map[status] || [status, '#f3f4f6', '#374151'];
    return <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999 }}>{label}</span>;
}

/* ─── Inbox screen (WhatsApp style list) ─── */
function InboxScreen({ user, setActiveTab, onSelectRoom }) {
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

    return (
        <Shell title="Messages" onBack={() => setActiveTab('overview')}>
            {loading ? (
                <div style={{ textAlign: 'center', padding: 48 }}><Loader size={28} color={PC} className="animate-spin" /></div>
            ) : rooms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                    <MessageSquare size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
                    <p style={{ color: '#94a3b8' }}>No messages yet</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {rooms.map(room => (
                        <div key={room.roomId} onClick={() => onSelectRoom(room)}
                            style={{ background: 'white', padding: '16px', display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ position: 'relative' }}>
                                <img 
                                    src={room.otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`}
                                    alt="" 
                                    style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }} 
                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`; }}
                                />
                                {room.unreadCount > 0 && (
                                    <div style={{ position: 'absolute', top: -2, right: -2, background: '#22c55e', color: 'white', fontSize: 10, fontWeight: 900, minWidth: 18, height: 18, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', padding: '0 4px' }}>
                                        {room.unreadCount}
                                    </div>
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <p style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b', margin: 0 }}>{room.otherUser?.name}</p>
                                    <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{room.updatedAt ? new Date(room.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                                </div>
                                <p style={{ fontSize: 13, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                                    {room.lastMessage}
                                </p>
                            </div>
                            <ChevronRight size={18} color="#cbd5e1" />
                        </div>
                    ))}
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
        <div style={{ position: 'fixed', inset: 0, background: '#efe7de', zIndex: 1100, display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: PC, padding: '52px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', padding: 0 }}><ArrowLeft size={24} /></button>
                <img 
                    src={room.otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`} 
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} 
                    alt=""
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`; }}
                />
                <div style={{ flex: 1 }}>
                    <h4 style={{ color: 'white', margin: 0, fontSize: '1rem', fontWeight: 800 }}>{room.otherUser?.name}</h4>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>Active conversation</span>
                </div>
            </div>

            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', backgroundImage: 'url("https://w0.peakpx.com/wallpaper/580/678/OHR.jpg")', backgroundSize: 'contain' }}>
                {loading ? <div style={{ padding: 40, textAlign: 'center' }}><Loader className="animate-spin" color="white" /></div> : (
                    messages.map((m, i) => {
                        const isMe = m.senderId === user._id;
                        return (
                            <div key={m._id || i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
                                <div style={{ 
                                    background: isMe ? '#dcf8c6' : 'white', 
                                    padding: '8px 12px', 
                                    borderRadius: isMe ? '12px 0 12px 12px' : '0 12px 12px 12px',
                                    maxWidth: '85%',
                                    boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                                    position: 'relative',
                                    fontSize: '0.9rem'
                                }}>
                                    {m.message}
                                    <div style={{ textAlign: 'right', fontSize: 9, color: '#667781', marginTop: 4 }}>
                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={scrollRef} />
            </div>

            <div style={{ padding: '10px 16px', background: '#f0f2f5', display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 30 }}>
                <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type message..." 
                    style={{ flex: 1, border: 'none', borderRadius: 24, padding: '10px 18px', fontSize: '0.95rem', outline: 'none' }} 
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    style={{ background: input.trim() ? PC : '#cbd5e1', border: 'none', width: 42, height: 42, borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}

/* ─── My Gigs screen ─── */
function GigsScreen({ myGigs, gigsLoading, setActiveTab, navigate, handleEditClick }) {
    return (
        <Shell title="My Gigs" onBack={() => setActiveTab('overview')}
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
function RequestsScreen({ bookingRequests, bookingsLoading, updateBookingStatus, setActiveTab, navigate, onSelectRoom }) {
    return (
        <Shell title="Booking Requests" onBack={() => setActiveTab('overview')}>
            {bookingsLoading ? (
                <div style={{ textAlign: 'center', padding: 48 }}><Loader size={28} color={PC} className="animate-spin" /></div>
            ) : bookingRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}><p style={{ color: '#94a3b8' }}>No requests yet</p></div>
            ) : bookingRequests.map(req => (
                <div key={req._id} style={{ background: 'white', borderRadius: 20, padding: 16, marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <p style={{ fontWeight: 700, margin: 0 }}>{req.service?.title}</p>
                        <Badge status={req.status} />
                    </div>
                    <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>₹{req.price} · {req.customer?.name}</p>
                    {req.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => updateBookingStatus(req._id, 'confirmed')} style={{ flex: 1, background: PC, color: 'white', border: 'none', borderRadius: 12, padding: '10px 0', fontWeight: 700 }}>Accept</button>
                            <button onClick={() => updateBookingStatus(req._id, 'cancelled')} style={{ flex: 1, background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 12, padding: '10px 0', fontWeight: 700 }}>Decline</button>
                        </div>
                    )}
                    <button onClick={() => onSelectRoom({ roomId: req._id, otherUser: req.customer })} style={{ width: '100%', background: '#f3f3fd', color: PC, border: 'none', borderRadius: 12, padding: '10px 0', fontWeight: 700, marginTop: 8 }}>Message Customer</button>
                </div>
            ))}
        </Shell>
    );
}

/* ─── Orders Screen ─── */
function OrdersScreen({ myBookings, bookingsLoading, setActiveTab, navigate, onSelectRoom }) {
    return (
        <Shell title="My Bookings" onBack={() => setActiveTab('overview')}>
            {bookingsLoading ? (
                <div style={{ textAlign: 'center', padding: 48 }}><Loader size={28} color={PC} className="animate-spin" /></div>
            ) : myBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}><p style={{ color: '#94a3b8' }}>No bookings yet</p></div>
            ) : myBookings.map(b => (
                <div key={b._id} style={{ background: 'white', borderRadius: 20, padding: 16, marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <p style={{ fontWeight: 700, margin: 0 }}>{b.service?.title}</p>
                        <Badge status={b.status} />
                    </div>
                    <p style={{ fontSize: 12, color: '#64748b' }}>₹{b.price}</p>
                    <button onClick={() => onSelectRoom({ roomId: b._id, otherUser: b.provider })} style={{ marginTop: 10, width: '100%', background: '#f3f3fd', color: PC, border: 'none', borderRadius: 12, padding: '10px 0', fontWeight: 700 }}>Message Provider</button>
                </div>
            ))}
        </Shell>
    );
}

/* ─── Profile Screen ─── */
function ProfileScreen({ user, profileAvatar, getAvatar, profileName, setProfileName, profilePhone, setProfilePhone, profileUsername, setProfileUsername, providerTitle, providerAbout, providerTitleSetter, providerAboutSetter, handleSaveProfile, savingProfile, uploadingAvatar, handleAvatarUpload, role, setActiveTab }) {
    return (
        <Shell title="Profile" onBack={() => setActiveTab('overview')}
            headerRight={
                <button onClick={handleSaveProfile} disabled={savingProfile} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 14px', borderRadius: 9999, fontWeight: 700 }}>
                    {savingProfile ? '...' : 'Save'}
                </button>
            }>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
                <div style={{ position: 'relative' }}>
                    <img 
                        src={profileAvatar || getAvatar?.(user)} 
                        style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${PC}` }} 
                        alt=""
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName || 'U')}&background=ede9fe&color=4f46e5`; }}
                    />
                    <label htmlFor="mob-avatar-upload" style={{ position: 'absolute', bottom: 0, right: 0, background: PC, borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white' }}>
                        <Edit3 size={12} color="white" />
                    </label>
                    <input id="mob-avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div><label style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Full Name</label><input value={profileName} onChange={e => setProfileName(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', marginTop: 4 }} /></div>
                <div><label style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Phone</label><input value={profilePhone} onChange={e => setProfilePhone(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', marginTop: 4 }} /></div>
                {role === 'provider' && (
                    <>
                        <div><label style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Title</label><input value={providerTitle} onChange={e => providerTitleSetter(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', marginTop: 4 }} /></div>
                        <div><label style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Bio</label><textarea value={providerAbout} onChange={e => providerAboutSetter(e.target.value)} rows={3} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', marginTop: 4 }} /></div>
                    </>
                )}
                <button onClick={handleSaveProfile} disabled={savingProfile} style={{ background: PC, color: 'white', border: 'none', borderRadius: 12, padding: 14, fontWeight: 700, marginTop: 10 }}>{savingProfile ? 'Saving...' : 'Save Changes'}</button>
            </div>
        </Shell>
    );
}

/* ─── Overview Screen ─── */
function OverviewScreen({ user, role, stats, myGigs, profileAvatar, getAvatar, setActiveTab, navigate, providerTitle }) {
    return (
        <>
            <section style={{ background: PC, padding: '52px 24px 128px', position: 'relative' }}>
                <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Hello, {user?.name?.split(' ')[0]}!</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>Welcome back</p>
            </section>
            <main style={{ marginTop: -96, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {role === 'provider' && (
                    <div style={{ background: 'white', borderRadius: 24, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <p style={{ fontSize: 11, fontWeight: 800, color: PC }}>TOTAL EARNINGS</p>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '4px 0' }}>₹{stats?.totalEarnings?.toLocaleString() || 0}</h2>
                        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                            <div style={{ flex: 1, background: '#f8fafc', padding: 12, borderRadius: 12 }}>
                                <p style={{ fontSize: 10, color: '#64748b' }}>Active Gigs</p>
                                <p style={{ fontWeight: 800 }}>{myGigs?.length || 0}</p>
                            </div>
                            <div style={{ flex: 1, background: '#f8fafc', padding: 12, borderRadius: 12 }}>
                                <p style={{ fontSize: 10, color: '#64748b' }}>Orders</p>
                                <p style={{ fontWeight: 800 }}>{stats?.totalOrders || 0}</p>
                            </div>
                        </div>
                    </div>
                )}
                <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {(role === 'provider' ? [
                        { icon: Briefcase, label: 'My Gigs', tab: 'mygigs' },
                        { icon: MessageSquare, label: 'Inbox', tab: 'chat' },
                        { icon: Wallet, label: 'Orders', tab: 'requests' },
                        { icon: User, label: 'Profile', tab: 'profile' },
                    ] : [
                        { icon: Search, label: 'Browse', action: () => navigate('/services') },
                        { icon: Wallet, label: 'Bookings', tab: 'bookings' },
                        { icon: MessageSquare, label: 'Inbox', tab: 'chat' },
                        { icon: User, label: 'Profile', tab: 'profile' },
                    ]).map(({ icon: Icon, label, tab, action }) => (
                        <button key={label} onClick={action || (() => setActiveTab(tab))} style={{ background: 'white', borderRadius: 20, padding: 20, border: 'none', textAlign: 'left', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={20} color={PC} /></div>
                            <h4 style={{ margin: '12px 0 0', fontWeight: 800, fontSize: '0.9rem' }}>{label}</h4>
                        </button>
                    ))}
                </section>
            </main>
        </>
    );
}

const Search = Star; // Fallback

const NAV_TABS = [
    { id: 'overview',  icon: LayoutDashboard, label: 'Home' },
    { id: 'browse',    icon: Star,            label: 'Browse',  customerOnly: true },
    { id: 'mygigs',    icon: Briefcase,       label: 'Gigs',    providerOnly: true },
    { id: 'chat',      icon: MessageSquare,   label: 'Inbox' },
    { id: 'requests',  icon: Wallet,          label: 'Orders',  providerOnly: true },
    { id: 'bookings',  icon: Wallet,          label: 'Orders',  customerOnly: true },
    { id: 'profile',   icon: User,            label: 'Profile' },
];

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

    const navHook = useNav();
    const navigate = navProp || navHook;
    const [selectedRoom, setSelectedRoom] = useState(null);

    const visibleTabs = NAV_TABS.filter(t => {
        if (t.providerOnly && role !== 'provider') return false;
        if (t.customerOnly && role === 'provider') return false;
        return true;
    }).slice(0, 5);

    const renderScreen = () => {
        if (selectedRoom) return <ChatRoom user={user} room={selectedRoom} onBack={() => setSelectedRoom(null)} />;

        switch (activeTab) {
            case 'mygigs': return <GigsScreen myGigs={myGigs} gigsLoading={gigsLoading} setActiveTab={setActiveTab} navigate={navigate} handleEditClick={handleEditClick} />;
            case 'requests': return <RequestsScreen bookingRequests={bookingRequests} bookingsLoading={bookingsLoading} updateBookingStatus={updateBookingStatus} setActiveTab={setActiveTab} navigate={navigate} onSelectRoom={setSelectedRoom} />;
            case 'bookings': return <OrdersScreen myBookings={myBookings} bookingsLoading={bookingsLoading} setActiveTab={setActiveTab} navigate={navigate} onSelectRoom={setSelectedRoom} />;
            case 'chat': return <InboxScreen user={user} setActiveTab={setActiveTab} navigate={navigate} onSelectRoom={setSelectedRoom} />;
            case 'profile': return <ProfileScreen user={user} profileAvatar={profileAvatar} getAvatar={getAvatar} profileName={profileName} setProfileName={setProfileName} profilePhone={profilePhone} setProfilePhone={setProfilePhone} profileUsername={profileUsername} setProfileUsername={setProfileUsername} providerTitle={providerTitle} providerAbout={providerAbout} providerTitleSetter={providerTitleSetter} providerAboutSetter={providerAboutSetter} handleSaveProfile={handleSaveProfile} savingProfile={savingProfile} uploadingAvatar={uploadingAvatar} handleAvatarUpload={handleAvatarUpload} role={role} setActiveTab={setActiveTab} />;
            default: return <OverviewScreen user={user} role={role} stats={stats} myGigs={myGigs} providerTitle={providerTitle} profileAvatar={profileAvatar} getAvatar={getAvatar} setActiveTab={setActiveTab} navigate={navigate} />;
        }
    };

    return (
        <div style={{ minHeight: '100dvh', backgroundColor: '#faf8ff', fontFamily: 'Inter, sans-serif' }}>
            {renderScreen()}
            <nav style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', height: 72, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 1000, boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', borderRadius: '20px 20px 0 0' }}>
                {visibleTabs.map(({ id, icon: Icon, label }) => {
                    const isActive = activeTab === id;
                    return (
                        <button key={id} onClick={() => id === 'browse' ? navigate('/services') : setActiveTab(id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', flex: 1, padding: '8px 0' }}>
                            <Icon size={22} color={isActive ? PC : '#94a3b8'} strokeWidth={isActive ? 2.5 : 1.5} />
                            <span style={{ fontSize: 9, fontWeight: 800, color: isActive ? PC : '#94a3b8', marginTop: 4 }}>{label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
