import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader, Send, Paperclip, Mic, Check, CheckCheck, FileText, Image as ImageIcon, X, RotateCw, Trash2 } from 'lucide-react';
import io from 'socket.io-client';
import api, { API_URL } from '../../../utils/api';
import toast from 'react-hot-toast';
import { PC } from './MobileDashboardShared';
import '../../../styles/mobile-dashboard-styles/MobileMessaging.css';

export default function MobileChatRoom({ user, room, onBack }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const scrollRef = useRef(null);
    const [activeService, setActiveService] = useState(null);
    const [partnerTyping, setPartnerTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [uploadingFile, setUploadingFile] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const serviceId = new URLSearchParams(window.location.search).get('service');
        if (serviceId) {
            api.get(`/api/services/${serviceId}`).then(({ data }) => setActiveService(data)).catch(() => { });
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
        window.refreshMobileChat = fetchMessages;
        fetchMessages();

        const newSocket = io(API_URL, { withCredentials: true, transports: ['websocket', 'polling'] });
        newSocket.emit('setup', user._id);
        newSocket.emit('joinRoom', room.roomId);
        newSocket.on('receiveMessage', (msg) => {
            if (msg.roomId === room.roomId) {
                setMessages(prev => {
                    if (msg.tempId) {
                        const exists = prev.findIndex(m => m._id === msg.tempId || m.tempId === msg.tempId);
                        if (exists !== -1) { const newMsgs = [...prev]; newMsgs[exists] = { ...msg, optimistic: false }; return newMsgs; }
                    }
                    if (prev.find(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
                newSocket.emit('readMessages', { roomId: room.roomId, userId: user._id });
            }
        });
        newSocket.on('typing', (data) => { if (data.roomId === room.roomId) setPartnerTyping(true); });
        newSocket.on('stopTyping', (data) => { if (data.roomId === room.roomId) setPartnerTyping(false); });
        newSocket.on('messagesRead', ({ roomId }) => { if (roomId === room.roomId) setMessages(prev => prev.map(m => ({ ...m, isRead: true }))); });
        newSocket.on('roomDeleted', (data) => { if (data.roomId === room.roomId) { toast.success('Conversation removed'); onBack(); } });

        setSocket(newSocket);
        const interval = setInterval(fetchMessages, 1000);
        return () => { newSocket.disconnect(); clearInterval(interval); };
    }, [room.roomId, user]);

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleType = (val) => {
        setInput(val);
        if (!socket) return;
        socket.emit('typing', { roomId: room.roomId });
        const timeout = setTimeout(() => socket.emit('stopTyping', { roomId: room.roomId }), 2000);
        return () => clearTimeout(timeout);
    };

    const handleSend = (type = 'text', url = null) => {
        if ((type === 'text' && !input.trim()) || !socket) return;
        const tempId = Date.now().toString();
        const msgData = { _id: tempId, senderId: user._id, receiverId: room.otherUser._id, roomId: room.roomId, message: type === 'text' ? input : '', messageType: type, fileUrl: url, createdAt: new Date().toISOString(), optimistic: true, isRead: false };
        setMessages(prev => [...prev, msgData]);
        socket.emit('sendMessage', { senderId: user._id, receiverId: room.otherUser._id, roomId: room.roomId, message: type === 'text' ? input : '', messageType: type, fileUrl: url, tempId });
        if (type === 'text') setInput('');
        socket.emit('stopTyping', { roomId: room.roomId });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingFile(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
            const { data } = await api.post('/api/upload', formData, config);
            handleSend(file.type.startsWith('image/') ? 'image' : 'file', data.url);
        } catch (error) { console.error(error); } finally { setUploadingFile(false); }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const audioFile = new File([audioBlob], 'voice_message.wav', { type: 'audio/wav' });
                const formData = new FormData();
                formData.append('file', audioFile);
                setUploadingFile(true);
                try {
                    const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
                    const { data } = await api.post('/api/upload', formData, config);
                    handleSend('voice', data.url);
                } catch (err) { console.error(err); } finally { setUploadingFile(false); }
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
        } catch (err) { console.error(err); }
    };

    const stopRecording = () => {
        setIsRecording(false);
        clearInterval(timerRef.current);
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
        }
    };

    const handleDeleteRoom = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/api/messages/${room.roomId}`, config);
            toast.success('Chat deleted');
            onBack();
        } catch (err) { toast.error('Failed to delete chat'); }
    };

    return (
        <div className="chat-window">
            <div className="chat-room-header">
                <button onClick={onBack} className="chat-back-btn">
                    <ArrowLeft size={24} />
                </button>
                <div className="chat-room-avatar-wrapper">
                    <img src={room.otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`} className="chat-room-avatar" alt="" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=U&background=ede9fe&color=4f46e5`; }} />
                    <div className="chat-room-online-indicator" />
                </div>
                <div className="chat-room-user-info">
                    <h4 className="chat-room-name">{room.otherUser?.name}</h4>
                    <span className="chat-room-status">ACTIVE NOW</span>
                </div>
                <div className="chat-room-actions">
                    <button onClick={() => { if (window.refreshMobileChat) toast.promise(window.refreshMobileChat(), { loading: 'Refreshing...', success: 'Chat updated', error: 'Refresh failed' }); }} className="chat-room-action-btn">
                        <RotateCw size={20} />
                    </button>
                    <button onClick={handleDeleteRoom} className="chat-room-action-btn chat-room-delete-btn">
                        <Trash2 size={22} />
                    </button>
                </div>
            </div>

            {activeService && (
                <div style={{ padding: '10px 16px', background: '#fff', borderBottom: '1px solid #e8ecf0', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, background: PC, flexShrink: 0 }} />
                    <img src={activeService.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeService.title)}&background=f8fafc&color=4f46e5`} style={{ width: 44, height: 36, borderRadius: 8, objectFit: 'cover' }} alt="" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: PC, textTransform: 'uppercase' }}>Inquiring About</span>
                        <h5 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeService.title}</h5>
                    </div>
                    <button onClick={() => setActiveService(null)} style={{ background: '#f1f5f9', border: 'none', color: '#94a3b8', width: 24, height: 24, borderRadius: '50%', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
            )}

            <div className="chat-messages-container no-scrollbar">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}><Loader className="animate-spin" color={PC} size={28} /></div>
                ) : messages.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, opacity: 0.6 }}>
                        <div style={{ fontSize: '2.5rem' }}>👋</div>
                        <p style={{ fontSize: '0.85rem', color: '#555', fontWeight: 600 }}>Say hello to start chatting!</p>
                    </div>
                ) : messages.map((m, i) => {
                    const isMe = m.senderId === user._id;
                    const showDate = i === 0 || new Date(m.createdAt).toDateString() !== new Date(messages[i - 1]?.createdAt).toDateString();
                    return (
                        <div key={m._id || i}>
                            {showDate && (
                                <div className="message-date-separator">
                                    <span className="message-date-badge">
                                        {new Date(m.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                                <div className={`message-bubble ${isMe ? 'me' : 'them'}`}>
                                    {m.messageType === 'image' && <img src={m.fileUrl} style={{ width: '100%', borderRadius: 8, marginBottom: 4, display: 'block' }} alt="Sent" />}
                                    {m.messageType === 'file' && <a href={m.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.05)', padding: 8, borderRadius: 8, textDecoration: 'none', color: isMe ? '#fff' : '#1e293b', marginBottom: 4 }}><FileText size={20} /><span style={{ fontSize: 12, fontWeight: 600 }}>Document</span></a>}
                                    {m.messageType === 'voice' && <audio src={m.fileUrl} controls style={{ width: '100%', height: 32, marginBottom: 4 }} />}
                                    {m.message && <p className="message-text">{m.message}</p>}
                                    <div className="message-meta">
                                        <span className="message-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {isMe && (m.isRead ? <CheckCheck size={12} color="#fff" /> : <Check size={12} color="rgba(255,255,255,0.7)" />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {partnerTyping && (
                    <div style={{ alignSelf: 'flex-start', padding: '6px 12px', background: 'white', borderRadius: '12px', fontSize: '11px', color: '#64748b', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                            <span className="dot-typing" style={{ width: 4, height: 4, borderRadius: '50%' }}></span>
                            <span className="dot-typing" style={{ width: 4, height: 4, borderRadius: '50%', animationDelay: '0.2s' }}></span>
                            <span className="dot-typing" style={{ width: 4, height: 4, borderRadius: '50%', animationDelay: '0.4s' }}></span>
                        </div>
                        typing...
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            <div className="chat-room-input-container">
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                {!isRecording ? (
                    <>
                        <button onClick={() => fileInputRef.current.click()} className="chat-room-attach-btn">
                            <Paperclip size={20} />
                        </button>
                        <div className="chat-room-input-box">
                            <input value={input} onChange={e => handleType(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Type a message..." className="chat-room-text-input" />
                            <button onClick={() => fileInputRef.current.click()} style={{ border: 'none', background: 'transparent', color: '#94a3b8', padding: '4px' }}><ImageIcon size={20} /></button>
                        </div>
                        {input.trim() ? (
                            <button onClick={() => handleSend()} className="chat-room-send-btn">
                                <Send size={20} />
                            </button>
                        ) : (
                            <button onClick={startRecording} className="chat-room-send-btn chat-room-mic-btn">
                                <Mic size={22} />
                            </button>
                        )}
                    </>
                ) : (
                    <div className="recording-box">
                        <div className="recording-indicator" style={{ width: 10, height: 10 }}></div>
                        <span style={{ flex: 1, color: '#991b1b', fontWeight: 700, fontSize: '0.9rem' }}>Recording... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                        <button onClick={() => { setIsRecording(false); clearInterval(timerRef.current); if (mediaRecorderRef.current) mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop()); }} style={{ color: '#64748b', background: 'none', border: 'none' }}><X size={20} /></button>
                        <button onClick={stopRecording} style={{ background: '#ef4444', color: 'white', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send size={18} /></button>
                    </div>
                )}
                {uploadingFile && (
                    <div style={{ position: 'absolute', top: -40, left: 0, right: 0, background: 'rgba(255,255,255,0.9)', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, borderTop: '1px solid #e2e8f0', zIndex: 10 }}>
                        <Loader size={16} className="animate-spin" color={PC} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: PC }}>Uploading media...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
