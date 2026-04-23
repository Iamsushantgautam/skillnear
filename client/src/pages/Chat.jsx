import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, ArrowLeft, Paperclip, Loader, Check, CheckCheck, Trash2, FileText, Mic } from 'lucide-react';
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
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [uploadingFile, setUploadingFile] = useState(false);
    const messagesEndRef = useRef(null);
    const optionsRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const fileInputRef = useRef(null);

    // Get providerId from URL if navigated from ServiceDetails
    const queryParams = new URLSearchParams(location.search);
    const initialProviderId = queryParams.get('provider');
    const initialRoomId = queryParams.get('roomId');
    const serviceId = queryParams.get('service');

    const [activeService, setActiveService] = useState(null);

    // Fetch active service if serviceId in URL
    useEffect(() => {
        if (serviceId) {
            api.get(`/api/services/${serviceId}`).then(({ data }) => setActiveService(data)).catch(() => {});
        }
    }, [serviceId]);

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

    const socketRef = useRef(null);
    const activeRoomRef = useRef(null);

    // Sync ref
    useEffect(() => {
        activeRoomRef.current = activeRoom;
    }, [activeRoom]);

    // Setup Socket once
    useEffect(() => {
        if (!user) return;
        
        const newSocket = io(API_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });
        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.emit('setup', user._id);

        newSocket.on('onlineUsers', (users) => {
            setOnlineUsers(users);
        });

        const style = document.createElement('style');
        style.innerHTML = `
            .group:hover .delete-btn-hover {
                opacity: 1 !important;
            }
            @media (max-width: 768px) {
                .delete-btn-hover {
                    opacity: 1 !important;
                }
            }
            .hover-primary:hover {
                color: var(--primary) !important;
            }
            .spin {
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        newSocket.on('receiveMessage', async (data) => {
            // Check if this message is for the currently viewed room
            const currentRoom = activeRoomRef.current;
            if (currentRoom && currentRoom.roomId === data.roomId) {
                setMessages((prev) => {
                    // Deduplicate using tempId
                    if (data.tempId) {
                        const exists = prev.findIndex(m => m._id === data.tempId || m.tempId === data.tempId);
                        if (exists !== -1) {
                            const newMsgs = [...prev];
                            newMsgs[exists] = { ...data, optimistic: false };
                            return newMsgs;
                        }
                    }
                    if (prev.find(m => m._id === data._id)) return prev;
                    return [...prev, data];
                });
            }
            fetchRooms(); // Refresh sidebar to show latest message and update unread count
        });

        newSocket.on('typing', (roomId) => {
            if (activeRoomRef.current?.roomId === roomId) setPartnerTyping(true);
        });
        newSocket.on('stopTyping', (roomId) => {
            if (activeRoomRef.current?.roomId === roomId) setPartnerTyping(false);
        });

        newSocket.on('messagesRead', (data) => {
            if (activeRoomRef.current?.roomId === data.roomId) {
                setMessages((prev) => prev.map(m => m.receiverId === data.userId ? { ...m, read: true } : m));
            }
        });

        return () => newSocket.disconnect();
    }, [user?._id]);

    const fetchRooms = async () => {
        if (!user) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/api/messages/rooms', config);
            setRooms(data);
            return data;
        } catch (error) {
            console.error("Error fetching rooms", error);
            return [];
        }
    };

    // Fetch Rooms & Handle initial room
    useEffect(() => {
        const initChat = async () => {
            if (!user) {
                navigate('/login?redirect=/chat');
                return;
            }
            try {
                const fetchedRooms = await fetchRooms();

                // If explicit provider chat requested
                if (initialProviderId && initialProviderId !== user._id) {
                    const ids = [user._id, initialProviderId].sort();
                    const directRoomId = `direct_${ids[0]}_${ids[1]}`;
                    const existing = fetchedRooms.find(r => r.roomId === directRoomId);
                    
                    if (existing) {
                        setActiveRoom(existing);
                        if (isMobile) setShowChatArea(true);
                    } else {
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
                console.error("Error initializing chat", error);
            } finally {
                setLoadingRooms(false);
            }
        };
        initChat();
    }, [user?._id, initialProviderId, initialRoomId]);

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
                
                // Mark messages as read when opening a room
                await api.put(`/api/messages/${activeRoom.roomId}/read`, {}, config);
                if (socket) {
                    socket.emit('readMessages', { roomId: activeRoom.roomId, userId: user._id });
                }
            } catch (error) {
                console.error("Error fetching messages", error);
            }
        };
        fetchMessagesForRoom();
    }, [activeRoom?.roomId, user, socket]);

    const handleSendMessage = (text = '', type = 'text', fileUrl = '') => {
        if (!text.trim() && !fileUrl && type === 'text') return;
        if (!activeRoom || !user || !socket) return;

        const messageText = text || message;
        const tempId = Date.now().toString();
        const newMsgData = {
            _id: tempId,
            senderId: user._id,
            receiverId: activeRoom.otherUser._id,
            roomId: activeRoom.roomId,
            message: messageText,
            messageType: type,
            fileUrl: fileUrl,
            createdAt: new Date().toISOString(),
            optimistic: true,
            tempId: tempId
        };

        // Optimistic update
        setMessages(prev => [...prev, newMsgData]);

        socket.emit('sendMessage', {
            senderId: user._id,
            receiverId: activeRoom.otherUser._id,
            roomId: activeRoom.roomId,
            message: messageText,
            messageType: type,
            fileUrl: fileUrl,
            tempId: tempId
        });
        
        socket.emit('stopTyping', activeRoom.roomId);

        if (type === 'text') setMessage('');
        setIsTyping(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingFile(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const config = { 
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}` 
                } 
            };
            const { data } = await api.post('/api/upload', formData, config);
            
            let type = 'file';
            if (file.type.startsWith('image/')) type = 'image';
            
            handleSendMessage('', type, data.url);
        } catch (error) {
            toast.error('File upload failed');
        } finally {
            setUploadingFile(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const audioFile = new File([audioBlob], 'voice_message.wav', { type: 'audio/wav' });
                
                const formData = new FormData();
                formData.append('file', audioFile);

                setUploadingFile(true);
                try {
                    const config = { 
                        headers: { 
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${user.token}` 
                        } 
                    };
                    const { data } = await api.post('/api/upload', formData, config);
                    handleSendMessage('', 'voice', data.url);
                } catch (err) {
                    toast.error('Failed to send voice message');
                } finally {
                    setUploadingFile(false);
                }
                
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            toast.error('Microphone access denied');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
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

    const handleDeleteChat = async (rId) => {
        const idToDelete = rId || activeRoom?.roomId;
        if (!idToDelete) return;
        
        if (window.confirm('Are you sure you want to delete this chat history?')) {
            try {
                await api.delete(`/api/messages/${idToDelete}`);
                if (activeRoom && activeRoom.roomId === idToDelete) {
                    setMessages([]);
                }
                toast.success('Chat history deleted');
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || 'Failed to delete chat';
                toast.error(`Delete failed: ${errorMsg}`);
            }
        }
    };

    return (
        <div className="container" style={{ padding: isMobile ? '0' : '20px', height: isMobile ? 'calc(100vh - 70px)' : 'calc(100vh - 120px)' }}>
            <div className={`card ${isMobile ? 'no-border-radius' : ''}`} style={{ display: 'flex', height: '100%', padding: 0, overflow: 'hidden', border: isMobile ? 'none' : '1px solid var(--border-color)', boxShadow: isMobile ? 'none' : '0 10px 25px -5px rgba(0,0,0,0.1)' }}>

                {/* Sidebar Contacts */}
                <div style={{ ...styles.sidebar, display: isMobile && showChatArea ? 'none' : 'flex' }}>
                    <div style={{ padding: '24px 16px', borderBottom: '1px solid #f0f2f5', backgroundColor: '#fff' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Messages</h2>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, backgroundColor: '#fff' }}>
                        {loadingRooms ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}><Loader size={24} className="spin" style={{ color: 'var(--primary)' }} /></div>
                        ) : rooms.map((room) => (
                            <div
                                key={room.roomId}
                                style={{ ...styles.contactItem, backgroundColor: activeRoom?.roomId === room.roomId ? '#f1f5f9' : 'transparent', borderLeft: activeRoom?.roomId === room.roomId ? '4px solid var(--primary)' : '4px solid transparent' }}
                                onClick={() => { setActiveRoom(room); if (isMobile) setShowChatArea(true); }}
                                className="group"
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
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{room.updatedAt ? new Date(room.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                            {room.unreadCount > 0 && (
                                                <span style={{ backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>
                                                    {room.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#64748b', fontSize: '0.82rem', marginTop: 2 }}>
                                        {room.lastMessage}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{room.type}: {room.title}</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteChat(room.roomId); }}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s' }}
                                            className="delete-btn-hover"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
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
                            <div style={styles.header}>
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
                                <div style={{ display: 'flex', gap: '20px', color: '#94a3b8', alignItems: 'center' }}>
                                    <Phone size={20} className="hover-primary" style={{ cursor: 'pointer' }} />
                                    <Video size={20} className="hover-primary" style={{ cursor: 'pointer' }} />
                                    <button 
                                        onClick={() => handleDeleteChat()}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        title="Delete Chat"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Service Context Card */}
                            {activeService && (
                                <div style={{ 
                                    padding: '12px 16px', 
                                    backgroundColor: 'rgba(255,255,255,0.95)', 
                                    borderBottom: '1px solid #e2e8f0', 
                                    display: 'flex', 
                                    gap: 16, 
                                    alignItems: 'center', 
                                    zIndex: 9, 
                                    backdropFilter: 'blur(10px)',
                                    animation: 'slideDown 0.3s ease-out'
                                }}>
                                    <style>{`
                                        @keyframes slideDown {
                                            from { transform: translateY(-100%); opacity: 0; }
                                            to { transform: translateY(0); opacity: 1; }
                                        }
                                    `}</style>
                                    <img 
                                        src={activeService.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeService.title)}&background=ede9fe&color=4f46e5`} 
                                        style={{ width: 70, height: 50, borderRadius: 10, objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
                                        alt={activeService.title} 
                                        onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeService.title)}&background=ede9fe&color=4f46e5`}
                                    />
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', backgroundColor: '#f5f3ff', padding: '2px 8px', borderRadius: 4 }}>Inquiry For</span>
                                        </div>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '4px 0 0', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeService.title}</h4>
                                        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {activeService.description}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setActiveService(null)}
                                        style={{ background: '#f1f5f9', border: 'none', color: '#94a3b8', cursor: 'pointer', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, transition: 'all 0.2s' }}
                                        onMouseOver={(e) => { e.target.style.background = '#e2e8f0'; e.target.style.color = '#1e293b'; }}
                                        onMouseOut={(e) => { e.target.style.background = '#f1f5f9'; e.target.style.color = '#94a3b8'; }}
                                    >✕</button>
                                </div>
                            )}

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
                                                    <div style={{ 
                                                        ...styles.bubble, 
                                                        backgroundColor: isMe ? '#dcf8c6' : '#fff', 
                                                        borderRadius: isMe ? '8px 0px 8px 8px' : '0px 8px 8px 8px',
                                                        color: '#1e293b',
                                                        alignSelf: isMe ? 'flex-end' : 'flex-start'
                                                    }}>
                                                        {msg.messageType === 'text' && msg.message}
                                                        
                                                        {msg.messageType === 'image' && (
                                                            <div style={{ borderRadius: 8, overflow: 'hidden' }}>
                                                                <img 
                                                                    src={msg.fileUrl} 
                                                                    alt="Shared" 
                                                                    style={{ maxWidth: '100%', maxHeight: 300, cursor: 'pointer' }} 
                                                                    onClick={() => window.open(msg.fileUrl, '_blank')}
                                                                />
                                                            </div>
                                                        )}

                                                        {msg.messageType === 'file' && (
                                                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                                                                <FileText size={18} />
                                                                <span>View Document</span>
                                                            </a>
                                                        )}

                                                        {msg.messageType === 'voice' && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 200 }}>
                                                                <audio controls src={msg.fileUrl} style={{ height: 32, width: '100%' }} />
                                                            </div>
                                                        )}

                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, justifyContent: 'flex-end' }}>
                                                            <span style={{ fontSize: '0.65rem', color: '#667781' }}>
                                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            {isMe && (
                                                                msg.read ? <CheckCheck size={14} color="#53bdeb" /> : <Check size={14} color="#667781" />
                                                            )}
                                                        </div>
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        style={{ display: 'none' }} 
                                        onChange={handleFileUpload} 
                                        accept="image/*,.pdf,.doc,.docx" 
                                    />
                                    
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingFile}
                                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                        <Paperclip size={22} className={uploadingFile ? 'spin' : ''} />
                                    </button>

                                    {!isRecording ? (
                                        <div style={{ flex: 1, position: 'relative' }}>
                                            <input
                                                type="text"
                                                placeholder={uploadingFile ? "Uploading file..." : "Type message here..."}
                                                style={styles.messageInput}
                                                value={message}
                                                onChange={handleTyping}
                                                disabled={uploadingFile}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 24, padding: '10px 18px', color: '#ef4444', fontWeight: 700 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1s infinite' }}></div>
                                            <style>{`
                                                @keyframes pulse {
                                                    0% { opacity: 1; }
                                                    50% { opacity: 0.3; }
                                                    100% { opacity: 1; }
                                                }
                                            `}</style>
                                            Recording: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                                            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b' }}>Release to send</span>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {!message.trim() && !isRecording && (
                                            <button 
                                                onMouseDown={startRecording}
                                                onMouseUp={stopRecording}
                                                onMouseLeave={isRecording ? stopRecording : undefined}
                                                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                                                title="Hold to record"
                                            >
                                                <Mic size={22} />
                                            </button>
                                        )}

                                        {isRecording && (
                                            <button 
                                                onClick={stopRecording}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                            >
                                                <X size={22} />
                                            </button>
                                        )}

                                        {(message.trim() || isRecording) && (
                                            <button
                                                onClick={isRecording ? stopRecording : handleSendMessage}
                                                style={{ backgroundColor: 'var(--primary)', border: 'none', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s', color: 'white' }}>
                                                {isRecording ? <div style={{ width: 12, height: 12, backgroundColor: 'white' }}></div> : <Send size={20} />}
                                            </button>
                                        )}
                                    </div>
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
    container: {
        height: '100vh',
        display: 'flex',
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    sidebar: {
        width: '380px',
        borderRight: '1px solid #f0f2f5',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
    },
    contactItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '16px',
        cursor: 'pointer',
        borderBottom: '1px solid #f0f2f5',
        transition: 'all 0.2s',
    },
    chatArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#efe7de',
        position: 'relative',
        backgroundImage: 'url("https://w0.peakpx.com/wallpaper/580/678/OHR.jpg")',
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat',
    },
    header: {
        padding: '12px 16px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f2f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    messagesContainer: {
        flex: 1,
        padding: '20px 7%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        scrollBehavior: 'smooth',
    },
    messageRow: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '4px',
    },
    bubble: {
        padding: '8px 12px',
        maxWidth: '85%',
        fontSize: '0.95rem',
        position: 'relative',
        boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
    },
    inputArea: {
        padding: '10px 16px',
        backgroundColor: '#f0f2f5',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10,
    },
    messageInput: {
        flex: 1,
        border: 'none',
        borderRadius: '24px',
        padding: '10px 18px',
        fontSize: '0.95rem',
        outline: 'none',
        backgroundColor: '#fff',
    }
};

export default Chat;
