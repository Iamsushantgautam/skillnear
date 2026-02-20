import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, ArrowLeft, Paperclip, Loader, Check, CheckCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import api, { API_URL } from '../utils/api';
import useAuthStore from '../store/useAuthStore';

const Chat = () => {
    const { user } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();

    const [message, setMessage] = useState('');
    const [showChatArea, setShowChatArea] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [partnerTyping, setPartnerTyping] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [showOptions, setShowOptions] = useState(false);
    const messagesEndRef = useRef(null);
    const optionsRef = useRef(null);

    // Get providerId from URL if navigated from ServiceDetails
    const queryParams = new URLSearchParams(location.search);
    const initialProviderId = queryParams.get('provider');
    const initialRoomId = queryParams.get('roomId');

    // Handle Resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Close options when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Setup Socket
    useEffect(() => {
        if (!user) return;
        const newSocket = io(API_URL);
        setSocket(newSocket);

        newSocket.emit('setup', user._id);

        newSocket.on('onlineUsers', (users) => {
            setOnlineUsers(users);
        });

        newSocket.on('receiveMessage', async (data) => {
            setMessages((prev) => {
                if (activeRoom && activeRoom.roomId === data.roomId) {
                    if (prev.find(m => m._id === data._id)) return prev;
                    return [...prev, data];
                }
                return prev;
            });

            // Update room list
            setRooms((prev) => {
                const exists = prev.find(r => r.roomId === data.roomId);
                if (exists) {
                    return prev.map(r =>
                        r.roomId === data.roomId
                            ? { ...r, lastMessage: data.message, updatedAt: new Date() }
                            : r
                    ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                } else {
                    // It's a new room for this user, we should ideally fetch room info or just reload rooms
                    // For now, let's trigger a room refresh
                    const fetchUpdatedRooms = async () => {
                        try {
                            const config = { headers: { Authorization: `Bearer ${user.token}` } };
                            const { data: updatedRooms } = await api.get('/api/messages/rooms', config);
                            setRooms(updatedRooms);
                        } catch (e) { }
                    };
                    fetchUpdatedRooms();
                    return prev;
                }
            });
        });

        newSocket.on('typing', (roomId) => {
            if (activeRoom?.roomId === roomId) setPartnerTyping(true);
        });
        newSocket.on('stopTyping', (roomId) => {
            if (activeRoom?.roomId === roomId) setPartnerTyping(false);
        });

        return () => newSocket.disconnect();
    }, [user, activeRoom?.roomId]);

    // Fetch Rooms & Handle initial room
    useEffect(() => {
        const initChat = async () => {
            if (!user) {
                navigate('/login?redirect=/chat');
                return;
            }
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await api.get('/api/messages/rooms', config);
                let fetchedRooms = data;
                setRooms(fetchedRooms);

                // If explicit provider chat requested
                if (initialProviderId && initialProviderId !== user._id) {
                    // direct_id1_id2 (sorted IDs for consistency)
                    const ids = [user._id, initialProviderId].sort();
                    const directRoomId = `direct_${ids[0]}_${ids[1]}`;

                    const existing = fetchedRooms.find(r => r.roomId === directRoomId);
                    if (existing) {
                        setActiveRoom(existing);
                        if (isMobile) setShowChatArea(true);
                    } else {
                        // Create virtual room for new direct chat
                        try {
                            const { data: providerUser } = await api.get(`/api/users/${initialProviderId}`);
                            const virtualRoom = {
                                roomId: directRoomId,
                                title: 'General Inquiry',
                                type: 'Direct',
                                otherUser: providerUser,
                                lastMessage: 'Start a new conversation',
                                updatedAt: new Date()
                            };
                            setRooms(prev => [virtualRoom, ...prev]);
                            setActiveRoom(virtualRoom);
                            if (isMobile) setShowChatArea(true);
                        } catch (err) {
                            console.error("Failed to load provider info", err);
                        }
                    }
                } else if (initialRoomId) {
                    const existing = fetchedRooms.find(r => r.roomId === initialRoomId);
                    if (existing) {
                        setActiveRoom(existing);
                        if (isMobile) setShowChatArea(true);
                    }
                } else if (fetchedRooms.length > 0 && !isMobile && !activeRoom) {
                    setActiveRoom(fetchedRooms[0]);
                }
            } catch (error) {
                console.error("Error fetching rooms", error);
            } finally {
                setLoadingRooms(false);
            }
        };
        initChat();
    }, [user, initialProviderId]);

    // Handle joining room 
    useEffect(() => {
        if (!activeRoom || !socket) return;
        socket.emit('joinRoom', activeRoom.roomId);
        setPartnerTyping(false);
    }, [activeRoom?.roomId, socket]);

    // Fetch Messages when room changes
    useEffect(() => {
        const fetchMessagesForRoom = async () => {
            if (!activeRoom || !user || activeRoom.lastMessage === 'Start a new conversation') {
                setMessages([]);
                return;
            }
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await api.get(`/api/messages/${activeRoom.roomId}`, config);
                setMessages(data);
            } catch (error) {
                console.error("Error fetching messages", error);
            }
        };
        fetchMessagesForRoom();
    }, [activeRoom?.roomId, user]);

    const handleSendMessage = () => {
        if (!message.trim() || !activeRoom || !user || !socket) return;

        const newMsgData = {
            senderId: user._id,
            receiverId: activeRoom.otherUser._id,
            roomId: activeRoom.roomId,
            message: message
        };

        socket.emit('sendMessage', newMsgData);
        socket.emit('stopTyping', activeRoom.roomId);

        // Optimistic update for UI if using sockets effectively or wait for receiveMessage
        // We'll wait for receiveMessage to ensure it's in DB

        setMessage('');
        setIsTyping(false);
    };

    const handleTyping = (e) => {
        setMessage(e.target.value);
        if (!socket || !activeRoom) return;

        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing', activeRoom.roomId);
        }

        let lastTypingTime = (new Date()).getTime();
        setTimeout(() => {
            const timeNow = (new Date()).getTime();
            const timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= 3000 && isTyping) {
                socket.emit('stopTyping', activeRoom.roomId);
                setIsTyping(false);
            }
        }, 3000);
    };

    const handleDeleteChat = async () => {
        if (!activeRoom || !window.confirm('Are you sure you want to delete this chat history?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/api/messages/${activeRoom.roomId}`, config);
            setMessages([]);
            // Update rooms list to show "No messages yet" or remove virtual room
            setRooms(prev => prev.map(r => r.roomId === activeRoom.roomId ? { ...r, lastMessage: 'Chat history deleted', updatedAt: new Date() } : r));
            setShowOptions(false);
            alert('Chat history deleted');
        } catch (error) {
            alert('Failed to delete chat');
        }
    };

    return (
        <div className="container" style={{ padding: isMobile ? '0' : '20px', height: isMobile ? 'calc(100vh - 70px)' : 'calc(100vh - 120px)' }}>
            <div className={`card ${isMobile ? 'no-border-radius' : ''}`} style={{ display: 'flex', height: '100%', padding: 0, overflow: 'hidden', border: isMobile ? 'none' : '1px solid var(--border-color)', boxShadow: isMobile ? 'none' : '0 10px 25px -5px rgba(0,0,0,0.1)' }}>

                {/* Sidebar Contacts */}
                <div style={{ ...styles.contactsSidebar, display: isMobile && showChatArea ? 'none' : 'flex' }}>
                    <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: '#fff' }}>
                        <h2 className="text-h2" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Messages</h2>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, backgroundColor: '#fff' }}>
                        {loadingRooms ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}><Loader size={24} className="spin" style={{ color: 'var(--primary)' }} /></div>
                        ) : rooms.map((room) => (
                            <div
                                key={room.roomId}
                                style={{ ...styles.contactItem, backgroundColor: activeRoom?.roomId === room.roomId ? '#f1f5f9' : 'transparent', borderLeft: activeRoom?.roomId === room.roomId ? '4px solid var(--primary)' : '4px solid transparent' }}
                                onClick={() => { setActiveRoom(room); if (isMobile) setShowChatArea(true); }}
                            >
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={room.otherUser?.avatar && room.otherUser.avatar.startsWith('http') ? room.otherUser.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`}
                                        alt={room.otherUser?.name}
                                        style={{ borderRadius: '50%', width: '48px', height: '48px', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`; }}
                                    />
                                    {onlineUsers.includes(room.otherUser?._id) && (
                                        <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid white' }}></div>
                                    )}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div className="flex-between">
                                        <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1e293b' }}>{room.otherUser?.name || 'User'}</span>
                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{room.updatedAt ? new Date(room.updatedAt).toLocaleDateString() : ''}</span>
                                    </div>
                                    <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#64748b', fontSize: '0.82rem', marginTop: 2 }}>
                                        {room.lastMessage}
                                    </p>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{room.type}: {room.title}</span>
                                </div>
                            </div>
                        ))}
                        {!loadingRooms && rooms.length === 0 && (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                                <div style={{ fontSize: '2rem', marginBottom: 10 }}>💬</div>
                                <p style={{ fontSize: '0.9rem' }}>No active chats yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div style={{ ...styles.chatArea, display: isMobile && !showChatArea ? 'none' : 'flex' }}>
                    {activeRoom ? (
                        <>
                            {/* Chat Header */}
                            <div style={styles.chatHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {isMobile && (
                                        <ArrowLeft size={24} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setShowChatArea(false)} />
                                    )}
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={activeRoom.otherUser?.avatar && activeRoom.otherUser.avatar.startsWith('http') ? activeRoom.otherUser.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(activeRoom.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`}
                                            alt="Avatar"
                                            style={{ borderRadius: '50%', width: '44px', height: '44px', objectFit: 'cover' }}
                                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeRoom.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`; }}
                                        />
                                        {onlineUsers.includes(activeRoom.otherUser?._id) && (
                                            <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid white' }}></div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>{activeRoom.otherUser?.name}</h3>
                                        <p className="text-small" style={{ color: onlineUsers.includes(activeRoom.otherUser?._id) ? '#22c55e' : '#64748b', fontWeight: 600 }}>
                                            {onlineUsers.includes(activeRoom.otherUser?._id) ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', color: '#94a3b8', position: 'relative' }} ref={optionsRef}>
                                    <Phone size={20} className="hover-primary" style={{ cursor: 'pointer' }} />
                                    <Video size={20} className="hover-primary" style={{ cursor: 'pointer' }} />
                                    <MoreVertical size={20} className="hover-primary" style={{ cursor: 'pointer' }} onClick={() => setShowOptions(!showOptions)} />
                                    {showOptions && (
                                        <div style={{ position: 'absolute', top: '100%', right: 0, backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '8px', zIndex: 100, minWidth: '150px' }}>
                                            <button
                                                onClick={handleDeleteChat}
                                                style={{ width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', color: '#ef4444', fontSize: '0.9rem', cursor: 'pointer', borderRadius: '4px' }}
                                                onMouseOver={(e) => e.target.style.backgroundColor = '#fef2f2'}
                                                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                            >
                                                Delete Chat
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div style={styles.messagesContainer}>
                                {messages.length === 0 ? (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                                        <div style={{ fontSize: '3rem', marginBottom: 12 }}>👋</div>
                                        <p>Say hello to start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = msg.senderId === user?._id;
                                        const showDate = idx === 0 || new Date(messages[idx - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

                                        return (
                                            <React.Fragment key={msg._id || idx}>
                                                {showDate && (
                                                    <div style={{ textAlign: 'center', margin: '20px 0', position: 'relative' }}>
                                                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#e2e8f0', zIndex: 0 }}></div>
                                                        <span style={{ position: 'relative', zIndex: 1, backgroundColor: '#f8fafc', padding: '0 12px', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                                                            {new Date(msg.createdAt).toDateString() === new Date().toDateString() ? 'Today' : new Date(msg.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div style={{ ...styles.messageRow, alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                                                    <div style={{ ...styles.bubble, backgroundColor: isMe ? 'var(--primary)' : '#fff', color: isMe ? '#white' : '#1e293b', boxShadow: isMe ? '0 4px 15px -3px rgba(79, 70, 229, 0.4)' : '0 1px 2px rgba(0,0,0,0.05)', borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px', color: isMe ? '#fff' : '#1e293b' }}>
                                                        {msg.message}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {isMe && (
                                                            msg.read ? <CheckCheck size={12} color="var(--primary)" /> : <Check size={12} color="#94a3b8" />
                                                        )}
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })
                                )}
                                {partnerTyping && (
                                    <div style={{ alignSelf: 'flex-start', marginLeft: 4 }}>
                                        <div style={{ ...styles.bubble, backgroundColor: '#e2e8f0', color: '#64748b', padding: '10px 16px', borderRadius: '18px 18px 18px 2px' }}>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <div className="dot-typing" style={{ width: 6, height: 6 }}></div>
                                                <div className="dot-typing" style={{ width: 6, height: 6, animationDelay: '0.2s' }}></div>
                                                <div className="dot-typing" style={{ width: 6, height: 6, animationDelay: '0.4s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div style={styles.inputArea}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
                                    <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Paperclip size={22} /></button>
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <input
                                            type="text"
                                            placeholder="Type message here..."
                                            style={styles.messageInput}
                                            value={message}
                                            onChange={handleTyping}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!message.trim()}
                                        style={{ backgroundColor: message.trim() ? 'var(--primary)' : '#e2e8f0', color: '#white', border: 'none', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: message.trim() ? 'pointer' : 'default', transition: 'all 0.3s', color: 'white' }}>
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
                            <div style={{ width: 120, height: 120, backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                                <MessageSquare size={50} style={{ color: 'var(--primary)', opacity: 0.3 }} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>Your Personal Messenger</h2>
                            <p style={{ color: '#64748b', textAlign: 'center', maxWidth: '300px', lineHeight: 1.6 }}>Select a contact from the sidebar to start a secure, real-time conversation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Simplified SVG icon since I used some Lucide icons not in original
const MessageSquare = ({ size, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const styles = {
    contactsSidebar: {
        width: '100%',
        maxWidth: '380px',
        borderRight: '1px solid var(--border-color)',
        flexDirection: 'column',
        backgroundColor: '#fff',
        flexShrink: 0
    },
    contactItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '20px',
        cursor: 'pointer',
        borderBottom: '1px solid #f1f5f9',
        transition: 'all 0.2s',
    },
    chatArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
    },
    chatHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 28px',
        backgroundColor: '#fff',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 10,
    },
    messagesContainer: {
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    messageRow: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '75%',
    },
    bubble: {
        padding: '12px 18px',
        fontSize: '0.94rem',
        lineHeight: '1.5',
    },
    inputArea: {
        padding: '20px 28px',
        backgroundColor: '#fff',
        borderTop: '1px solid var(--border-color)',
    },
    messageInput: {
        width: '100%',
        border: 'none',
        outline: 'none',
        backgroundColor: '#f1f5f9',
        padding: '14px 24px',
        borderRadius: '24px',
        fontSize: '1rem',
        transition: 'all 0.3s',
    }
};

export default Chat;
