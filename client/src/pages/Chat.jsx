import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, ArrowLeft, Paperclip } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import api, { API_URL } from '../utils/api';
import useAuthStore from '../store/useAuthStore';

const Chat = () => {
    const { user } = useAuthStore();
    const location = useLocation();

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
    const messagesEndRef = useRef(null);

    // Get providerId from URL if navigated from ServiceDetails
    const queryParams = new URLSearchParams(location.search);
    const initialProviderId = queryParams.get('provider');

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

    // Setup Socket
    useEffect(() => {
        if (!user) return;
        const newSocket = io(API_URL);
        setSocket(newSocket);

        newSocket.emit('setup', user._id);

        newSocket.on('onlineUsers', (users) => {
            setOnlineUsers(users);
        });

        newSocket.on('receiveMessage', (data) => {
            setMessages((prev) => {
                // Ensure room match or just add if its open
                if (activeRoom && activeRoom.roomId === data.roomId) {
                    return [...prev, data];
                }
                return prev;
            });
            // Update room list latest msg
            setRooms((prev) => prev.map(r => r.roomId === data.roomId ? { ...r, lastMessage: data.message, updatedAt: new Date() } : r));
        });

        newSocket.on('typing', () => setPartnerTyping(true));
        newSocket.on('stopTyping', () => setPartnerTyping(false));

        return () => newSocket.disconnect();
    }, [user, activeRoom]);

    // Fetch Rooms (Conversations)
    useEffect(() => {
        const fetchRooms = async () => {
            if (!user) return;
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await api.get('/api/messages/rooms', config);
                setRooms(data);

                // Assuming some initial loading if applicable
                if (data.length > 0 && !isMobile && !activeRoom) {
                    setActiveRoom(data[0]);
                }
            } catch (error) {
                console.error("Error fetching rooms", error);
            }
        };
        fetchRooms();
    }, [user, isMobile]);

    // Handle joining room when active room changes
    useEffect(() => {
        if (!activeRoom || !socket) return;
        socket.emit('joinRoom', activeRoom.roomId);
    }, [activeRoom, socket]);

    // Fetch Messages when room changes
    useEffect(() => {
        const fetchMessagesForRoom = async () => {
            if (!activeRoom || !user) return;
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await api.get(`/api/messages/${activeRoom.roomId}`, config);
                setMessages(data);
            } catch (error) {
                console.error("Error fetching messages", error);
            }
        };
        fetchMessagesForRoom();
    }, [activeRoom, user]);

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



    return (
        <div className="container" style={{ padding: isMobile ? '0' : '20px', height: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 160px)' }}>
            <div className={`card ${isMobile ? 'no-border-radius' : ''}`} style={{ display: 'flex', height: '100%', padding: 0, overflow: 'hidden', border: isMobile ? 'none' : undefined }}>

                {/* Sidebar Contacts */}
                <div style={{ ...styles.contactsSidebar, display: isMobile && showChatArea ? 'none' : 'flex' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                        <h2 className="text-h2" style={{ fontSize: '1.25rem' }}>Messages</h2>
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {rooms.map((room) => (
                            <div
                                key={room.roomId}
                                style={{ ...styles.contactItem, backgroundColor: activeRoom?.roomId === room.roomId ? '#f8fafc' : 'transparent' }}
                                onClick={() => { setActiveRoom(room); if (isMobile) setShowChatArea(true); }}
                            >
                                <img src={room.otherUser?.avatar || 'https://via.placeholder.com/40'} alt={room.otherUser?.name || 'User'} style={{ borderRadius: '50%', width: '48px', height: '48px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div className="flex-between">
                                        <span style={{ fontWeight: '600', fontSize: '0.95rem', color: '#1e293b' }}>{room.otherUser?.name || 'Unknown User'}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{room.type}</span>
                                    </div>
                                    <p className="text-small" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#64748b', marginTop: '2px' }}>
                                        {room.lastMessage}
                                    </p>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold' }}>{room.title}</span>
                                </div>
                            </div>
                        ))}
                        {rooms.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No active chats. Book a service or contact a seller to start!</div>
                        )}
                    </div>

                    {/* Chat Area */}
                    <div style={{ ...styles.chatArea, display: isMobile && !showChatArea ? 'none' : 'flex' }}>
                        {/* Chat Header */}
                        <div style={styles.chatHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {isMobile && (
                                    <ArrowLeft size={24} style={{ cursor: 'pointer', marginRight: '4px', color: '#64748b' }} onClick={() => setShowChatArea(false)} />
                                )}
                                {activeRoom ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <img src={activeRoom.otherUser?.avatar || 'https://via.placeholder.com/40'} alt="Avatar" style={{ borderRadius: '50%', width: '40px', height: '40px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                                            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', backgroundColor: onlineUsers.includes(activeRoom.otherUser?._id) ? '#22c55e' : '#cbd5e1', border: '2px solid white' }}></div>
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#0f172a' }}>{activeRoom.otherUser?.name || 'Unknown User'}</h3>
                                            <p className="text-small" style={{ color: '#64748b' }}>{onlineUsers.includes(activeRoom.otherUser?._id) ? 'Online' : 'Offline'} • {activeRoom.title}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#64748b' }}>Select a room...</h3>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)' }}>
                                <Phone size={20} style={{ cursor: 'pointer' }} />
                                <Video size={20} style={{ cursor: 'pointer' }} />
                                <MoreVertical size={20} style={{ cursor: 'pointer' }} />
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={styles.messagesContainer}>
                            {!activeRoom ? (
                                <div className="flex-center" style={{ height: '100%' }}>
                                    <p className="text-muted" style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>Select a chat room to view messages.</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex-center" style={{ height: '100%' }}>
                                    <p className="text-muted">No messages yet. Say hi!</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.senderId === user?._id;
                                    return (
                                        <div key={msg._id || Math.random()} style={{ ...styles.messageRow, alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                                            <div className="animate-fade-in" style={{ ...styles.bubble, backgroundColor: isMe ? 'var(--primary)' : '#e2e8f0', color: isMe ? 'white' : '#1e293b' }}>
                                                {msg.message}
                                            </div>
                                            <div className="text-small" style={{ fontSize: '0.7rem', marginTop: '6px', textAlign: isMe ? 'right' : 'left', color: '#94a3b8' }}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {isMe && (msg.read ? '• Read' : '')}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            {partnerTyping && (
                                <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ ...styles.bubble, backgroundColor: '#e2e8f0', color: '#64748b', fontSize: '0.85rem', padding: '8px 16px', display: 'flex', gap: '4px' }}>
                                        <span className="dot-typing"></span>
                                        <span className="dot-typing"></span>
                                        <span className="dot-typing"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={styles.inputArea}>
                            <Paperclip size={20} style={{ color: '#94a3b8', cursor: 'pointer' }} />
                            <input
                                type="text"
                                placeholder="Type a message..."
                                style={styles.messageInput}
                                value={message}
                                onChange={handleTyping}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                disabled={!activeRoom}
                            />
                            <button className="btn-primary" style={{ padding: '12px', borderRadius: '50%', opacity: activeRoom && message.trim() ? 1 : 0.5 }} onClick={handleSendMessage} disabled={!activeRoom || !message.trim()}>
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    contactsSidebar: {
        width: '100%',
        maxWidth: '350px',
        borderRight: '1px solid var(--border-color)',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        flexShrink: 0
    },
    contactItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        cursor: 'pointer',
        borderBottom: '1px solid var(--border-color)',
        transition: 'background-color 0.2s',
    },
    chatArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-color)',
    },
    chatHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
    },
    messagesContainer: {
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    messageRow: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '70%',
    },
    bubble: {
        padding: '12px 16px',
        borderRadius: '16px',
        fontSize: '0.95rem',
        lineHeight: '1.4',
    },
    inputArea: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 24px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border-color)',
    },
    messageInput: {
        flex: 1,
        border: 'none',
        outline: 'none',
        backgroundColor: '#f3f4f6',
        padding: '14px 20px',
        borderRadius: '100px',
        fontSize: '1rem',
    }
};

export default Chat;
