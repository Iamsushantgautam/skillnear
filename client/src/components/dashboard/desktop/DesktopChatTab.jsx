import React from 'react';
import { 
    Search, 
    RotateCw, 
    Trash2, 
    PlusCircle, 
    Mic, 
    Paperclip, 
    Send, 
    Loader, 
    Lock, 
    MessageSquare, 
    Check, 
    CheckCheck, 
    FileText 
} from 'lucide-react';
import ChatList from '../../ChatList';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import '../../../styles/desktop-dashboard-styles/DesktopChatTab.css';

const DesktopChatTab = ({
    user,
    dashActiveRoom,
    setDashActiveRoom,
    dashMessages,
    setDashMessages,
    getAvatar,
    fetchDashMessages,
    activeService,
    setActiveService,
    partnerTyping,
    messagesEndRef,
    isRecording,
    recordingTime,
    stopRecordingDash,
    startRecordingDash,
    fileInputRef,
    handleFileUploadDash,
    dashMessageInput,
    handleTypeDash,
    handleSendMessageDash,
    uploadingFile
}) => {

    const handleDeleteChat = () => {
        if (!dashActiveRoom?.roomId) return;
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        console.log(`[DEBUG] Attempting to delete room: ${dashActiveRoom.roomId}`);
        api.delete(`/api/messages/${dashActiveRoom.roomId}`, config)
            .then(() => {
                console.log(`[DEBUG] Room deleted successfully: ${dashActiveRoom.roomId}`);
                setDashMessages([]);
                setDashActiveRoom(null);
                toast.success('Chat history deleted');
            })
            .catch(err => {
                console.error('Delete chat error:', err);
                const msg = err.response?.data?.message || err.message || 'Failed to delete chat';
                toast.error(msg);
            });
    };

    return (
        <div className="animate-fade-in chat-tab-container">
            {/* Conversation List Pane */}
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <h2 className="chat-sidebar-title">Messages</h2>
                    <div className="chat-search-wrapper">
                        <div className="chat-search-icon">
                            <Search size={20} color="#737685" />
                        </div>
                        <input
                            className="chat-search-input"
                            placeholder="Search messages..."
                            type="text"
                        />
                    </div>
                    <div className="chat-filter-tabs">
                        <button className="chat-filter-btn active">All</button>
                        <button className="chat-filter-btn">Unread</button>
                        <button className="chat-filter-btn">Archived</button>
                    </div>
                </div>
                <div className="chat-list-wrapper">
                    <ChatList
                        onSelect={(room) => setDashActiveRoom(room)}
                        activeRoomId={dashActiveRoom?.roomId}
                    />
                </div>
            </div>

            {/* Primary Chat Area */}
            <div className="chat-main-area">
                {dashActiveRoom ? (
                    <>
                        {/* Chat Header */}
                        <div className="chat-header">
                            <div className="chat-header-user">
                                <div className="chat-avatar-wrapper">
                                    <img
                                        alt={dashActiveRoom.otherUser?.name || 'User'}
                                        className="chat-avatar-img"
                                        src={getAvatar(dashActiveRoom.otherUser)}
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dashActiveRoom.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`; }}
                                    />
                                    <span className="chat-status-indicator"></span>
                                </div>
                                <div className="chat-header-info">
                                    <h2>{dashActiveRoom.otherUser?.name || 'User'}</h2>
                                    <span className="chat-active-status">
                                        <span className="animate-pulse" style={{ width: '6px', height: '6px', backgroundColor: '#22c55e', borderRadius: '50%' }}></span>
                                        ACTIVE NOW
                                    </span>
                                </div>
                            </div>
                            <div className="chat-header-actions">
                                <button 
                                    className="chat-action-btn"
                                    onClick={() => {
                                        toast.promise(fetchDashMessages(), {
                                            loading: 'Refreshing...',
                                            success: 'Chat updated',
                                            error: 'Refresh failed'
                                        });
                                    }}
                                >
                                    <RotateCw size={18} />
                                </button>
                                <button
                                    className="chat-action-btn-delete"
                                    onClick={handleDeleteChat}
                                    title="Delete Chat"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Service Context Card */}
                        {activeService && (
                            <div className="service-context-card">
                                <img
                                    src={activeService.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeService.title)}&background=f8fafc&color=4f46e5`}
                                    className="service-context-img"
                                    alt=""
                                />
                                <div className="service-context-info">
                                    <div>
                                        <span className="service-context-badge">Inquiry Context</span>
                                    </div>
                                    <h4 className="service-context-title">{activeService.title}</h4>
                                </div>
                                <button
                                    className="btn-close-context"
                                    onClick={() => setActiveService(null)}
                                >✕</button>
                            </div>
                        )}

                        {/* Chat History */}
                        <div className="chat-history">
                            <div className="chat-date-separator">
                                <span className="chat-date-badge">
                                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>

                            {dashMessages.length === 0 ? (
                                <div className="chat-empty-state">
                                    No messages yet. Say hi!
                                </div>
                            ) : (
                                dashMessages.map((msg, idx) => {
                                    const isMe = msg.senderId === user?._id;
                                    return (
                                        <div 
                                            key={idx} 
                                            className={`message-row ${isMe ? 'message-me' : 'message-other'}`}
                                        >
                                            <div className="message-meta">
                                                {!isMe && <span className="message-sender message-sender-other">{dashActiveRoom.otherUser?.name || 'User'}</span>}
                                                <span className="message-time">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMe && <span className="message-sender message-sender-me">You</span>}
                                            </div>
                                            <div className={`message-bubble ${isMe ? 'message-bubble-me' : 'message-bubble-other'}`}>
                                                {(!msg.messageType || msg.messageType === 'text') && msg.message}
                                                {msg.messageType === 'image' && (
                                                    <div className="message-image">
                                                        <img src={msg.fileUrl} alt="Shared" onClick={() => window.open(msg.fileUrl, '_blank')} />
                                                    </div>
                                                )}
                                                {msg.messageType === 'file' && (
                                                    <a 
                                                        href={msg.fileUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className={`message-file-link ${isMe ? 'message-file-link-me' : 'message-file-link-other'}`}
                                                    >
                                                        <FileText size={16} /> View Document
                                                    </a>
                                                )}
                                                {msg.messageType === 'voice' && (
                                                    <div className="message-voice">
                                                        <audio controls src={msg.fileUrl} style={{ height: '32px', width: '100%' }} />
                                                    </div>
                                                )}
                                            </div>
                                            {isMe && (
                                                <span className="message-status">
                                                    {msg.isRead ? 'Read' : 'Delivered'}
                                                    {msg.isRead ? <CheckCheck size={12} /> : <Check size={12} />}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                            )}

                            {partnerTyping && (
                                <div className="message-row message-other">
                                    <div className="typing-indicator">
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            <span className="dot-typing" style={{ width: '6px', height: '6px', backgroundColor: '#737685', borderRadius: '50%' }}></span>
                                            <span className="dot-typing" style={{ width: '6px', height: '6px', backgroundColor: '#737685', borderRadius: '50%', animationDelay: '0.1s' }}></span>
                                            <span className="dot-typing" style={{ width: '6px', height: '6px', backgroundColor: '#737685', borderRadius: '50%', animationDelay: '0.2s' }}></span>
                                        </div>
                                        Typing...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="chat-input-section">
                            {isRecording ? (
                                <div className="recording-status">
                                    <div className="recording-info">
                                        <div className="animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e11d48' }}></div>
                                        <span style={{ fontWeight: 700, fontSize: '14px' }}>Recording: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                                    </div>
                                    <button onClick={stopRecordingDash} className="btn-stop-recording">
                                        Stop & Send
                                    </button>
                                </div>
                            ) : (
                                <div className="chat-input-wrapper">
                                    <div className="chat-input-actions-left">
                                        <button 
                                            className="chat-icon-btn"
                                            onClick={() => fileInputRef.current?.click()} 
                                            title="Attach Image"
                                        >
                                            <PlusCircle size={20} />
                                        </button>
                                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUploadDash} />
                                        <button 
                                            className="chat-icon-btn"
                                            onClick={startRecordingDash} 
                                            title="Voice Message"
                                        >
                                            <Mic size={20} />
                                        </button>
                                    </div>
                                    <div className="chat-input-field">
                                        <input
                                            placeholder={`Message ${dashActiveRoom.otherUser?.name || '...'}`}
                                            type="text"
                                            value={dashMessageInput}
                                            onChange={e => handleTypeDash(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSendMessageDash()}
                                        />
                                    </div>
                                    <div className="chat-input-actions-right">
                                        <button 
                                            className="chat-icon-btn"
                                            onClick={() => fileInputRef.current?.click()} 
                                            title="Attach File"
                                        >
                                            <Paperclip size={20} />
                                        </button>
                                        <button
                                            className="btn-send-message"
                                            onClick={() => handleSendMessageDash()}
                                            disabled={!dashMessageInput.trim() || uploadingFile}
                                        >
                                            {uploadingFile ? <Loader size={18} className="animate-spin" /> : (
                                                <>
                                                    Send
                                                    <Send size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="encryption-notice">
                                <p className="encryption-text">
                                    <Lock size={12} />
                                    Messages are secured with end-to-end encryption
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="chat-placeholder">
                        <MessageSquare size={60} opacity={0.2} style={{ marginBottom: '16px' }} />
                        <h3>Your Messages</h3>
                        <p>Select a conversation from the list to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DesktopChatTab;
