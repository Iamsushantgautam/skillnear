import React, { useState, useEffect, useRef } from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import {
    Briefcase, MessageSquare, Wallet, User,
    Star, PlusCircle, ArrowLeft, Loader, CheckCircle, Calendar as CalendarIcon,
    ChevronRight, Edit3, Send, Search, ShoppingBag, MapPin, ChevronLeft, Plus as PlusIcon,
    ShoppingCart, Video, Trash2, Heart, FileText, Paperclip, Mic, Check, CheckCheck, Image as ImageIcon, X, Phone, MoreVertical, CreditCard, RotateCw, History, DollarSign, Clock, XCircle, TrendingUp, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import api, { API_URL } from '../utils/api';
import DashboardMobileNav from '../components/DashboardMobileNav';
import useAuthStore from '../store/useAuthStore';

const PC = '#003d9b';
const PL = 'rgba(0,61,155,0.08)';

/* ─── payment modal ─── */
function PaymentModal({ isOpen, onClose, onSelect }) {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 10000 }}>
            <div className="animate-slide-up no-scrollbar" style={{ backgroundColor: 'white', width: '100%', maxWidth: '500px', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '32px 24px 48px', boxShadow: '0 -10px 40px rgba(0,0,0,0.1)' }}>
                <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 2, margin: '0 auto 24px' }}></div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginBottom: 8, textAlign: 'center' }}>Service Completed?</h3>
                <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', marginBottom: 32, fontWeight: 500 }}>How did the customer pay for this service?</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <button
                        onClick={() => onSelect('Cash')}
                        style={{ padding: 20, borderRadius: 20, border: '2px solid #f1f5f9', background: 'white', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left' }}
                    >
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Wallet size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: 16, color: '#1e293b' }}>Cash Payment</div>
                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Paid directly on-site</div>
                        </div>
                    </button>

                    <button
                        onClick={() => onSelect('Online')}
                        style={{ padding: 20, borderRadius: 20, border: '2px solid #f1f5f9', background: 'white', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left' }}
                    >
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: '#eff6ff', color: '#0052cc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CreditCard size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: 16, color: '#1e293b' }}>Online Payment</div>
                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Paid via SkillNear or UPI</div>
                        </div>
                    </button>

                    <button
                        onClick={onClose}
                        style={{ marginTop: 8, padding: 16, background: 'transparent', border: 'none', color: '#94a3b8', fontWeight: 800, fontSize: 14 }}
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── withdrawal modal ─── */
function WithdrawalModal({ isOpen, onClose, onSubmit, amount, setAmount, availableBalance, method, setMethod, details, setDetails }) {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 10000 }}>
            <div className="animate-slide-up no-scrollbar" style={{ backgroundColor: 'white', width: '100%', maxWidth: '500px', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '32px 24px 48px', boxShadow: '0 -10px 40px rgba(0,0,0,0.1)' }}>
                <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 2, margin: '0 auto 24px' }}></div>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: PL, color: PC, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <DollarSign size={32} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginBottom: 8, textAlign: 'center' }}>Request Withdrawal</h3>
                <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', marginBottom: 32, fontWeight: 500 }}>
                    Enter the amount you'd like to withdraw. <br />
                    <span style={{ color: PC, fontWeight: 700 }}>Available: ₹{availableBalance.toLocaleString()}</span>
                </p>

                <div style={{ marginBottom: 32 }}>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#1e293b', fontSize: '1.25rem' }}>₹</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            style={{ width: '100%', padding: '20px 20px 20px 44px', borderRadius: 20, border: `2px solid ${Number(amount) > availableBalance ? '#ef4444' : '#f1f5f9'}`, background: '#f8fafc', fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', outline: 'none' }}
                        />
                    </div>
                    {Number(amount) > availableBalance && (
                        <p style={{ fontSize: 12, color: '#ef4444', fontWeight: 800, marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <XCircle size={14} /> Amount exceeds available balance
                        </p>
                    )}
                </div>

                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#1e293b', marginBottom: 10, textTransform: 'uppercase' }}>Withdrawal Method</label>
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        style={{ width: '100%', padding: '16px 20px', borderRadius: 16, border: '2px solid #f1f5f9', background: '#f8fafc', fontSize: 15, fontWeight: 700, color: '#1e293b', outline: 'none', appearance: 'none' }}
                    >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI (Google Pay, PhonePe, etc.)</option>
                        <option value="Wallet">Digital Wallet</option>
                    </select>
                </div>

                <div style={{ marginBottom: 32 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#1e293b', marginBottom: 10, textTransform: 'uppercase' }}>
                        {method === 'UPI' ? 'UPI ID' : 'Bank Account Details'}
                    </label>
                    <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder={method === 'UPI' ? "e.g. name@upi" : "Account Number, Bank Name, IFSC Code..."}
                        style={{ width: '100%', padding: '16px 20px', borderRadius: 16, border: '2px solid #f1f5f9', background: '#f8fafc', fontSize: 14, fontWeight: 600, color: '#1e293b', outline: 'none', minHeight: 80, resize: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        onClick={onClose}
                        style={{ flex: 1, padding: 16, borderRadius: 16, background: '#f1f5f9', color: '#64748b', border: 'none', fontWeight: 800, fontSize: 14 }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={!amount || isNaN(amount) || Number(amount) <= 0 || Number(amount) > availableBalance || !details.trim()}
                        style={{ flex: 2, padding: 16, borderRadius: 16, background: PC, color: 'white', border: 'none', fontWeight: 800, fontSize: 14, opacity: (!amount || isNaN(amount) || Number(amount) <= 0 || Number(amount) > availableBalance || !details.trim()) ? 0.6 : 1 }}
                    >
                        Confirm Withdrawal
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── revision history modal ─── */
function RevisionHistoryModal({ isOpen, onClose, revisions }) {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 10000 }}>
            <div className="animate-slide-up no-scrollbar" style={{ backgroundColor: 'white', width: '100%', maxWidth: '500px', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '32px 24px 48px', boxShadow: '0 -10px 40px rgba(0,0,0,0.1)', maxHeight: '85vh', overflowY: 'auto' }}>
                <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 2, margin: '0 auto 24px' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>Revision History</h3>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={16} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {revisions && revisions.length > 0 ? (
                        revisions.map((rev, i) => (
                            <div key={i} style={{ padding: 16, borderRadius: 20, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 900, color: PC, textTransform: 'uppercase' }}>Revision #{revisions.length - i}</span>
                                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>{new Date(rev.date).toLocaleDateString()}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: 13, color: '#1e293b', fontWeight: 500, lineHeight: 1.5 }}>{rev.note}</p>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', color: '#64748b', py: 40 }}>No revisions found.</p>
                    )}
                </div>

                <button
                    onClick={onClose}
                    style={{ width: '100%', marginTop: 24, padding: 16, borderRadius: 16, background: PC, color: 'white', border: 'none', fontWeight: 800, fontSize: 14 }}
                >
                    Close History
                </button>
            </div>
        </div>
    );
}

function RevisionModal({ isOpen, onClose, onSubmit, note, setNote }) {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 10000 }}>
            <div className="animate-slide-up no-scrollbar" style={{ backgroundColor: 'white', width: '100%', maxWidth: '500px', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '32px 24px 48px', boxShadow: '0 -10px 40px rgba(0,0,0,0.1)' }}>
                <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 2, margin: '0 auto 24px' }}></div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginBottom: 8, textAlign: 'center' }}>Request Revision</h3>
                <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', marginBottom: 24, fontWeight: 500 }}>Please describe what changes you would like the professional to make.</p>

                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Describe your revision requirements..."
                    style={{ width: '100%', minHeight: 120, padding: 16, borderRadius: 16, border: '2px solid #f1f5f9', background: '#f8fafc', fontSize: 14, color: '#1e293b', fontWeight: 500, marginBottom: 24, resize: 'none', outline: 'none' }}
                />

                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        onClick={onClose}
                        style={{ flex: 1, padding: 16, borderRadius: 16, background: '#f1f5f9', color: '#64748b', border: 'none', fontWeight: 800, fontSize: 14 }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={!note.trim()}
                        style={{ flex: 2, padding: 16, borderRadius: 16, background: PC, color: 'white', border: 'none', fontWeight: 800, fontSize: 14, opacity: note.trim() ? 1 : 0.6 }}
                    >
                        Submit Request
                    </button>
                </div>
            </div>
        </div>
    );
}

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



/* ─── shared shell ─── */
function Shell({ title, onBack, children, headerRight }) {
    return (
        <div style={{ minHeight: '100dvh', background: '#faf8ff', fontFamily: 'Inter, sans-serif', paddingBottom: 100 }}>
            <div style={{ background: PC, display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '800px', padding: '52px 20px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    {onBack && (
                        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                            <ArrowLeft size={18} color="white" />
                        </button>
                    )}
                    <h1 style={{ color: 'white', fontWeight: 900, fontSize: '1.25rem', flex: 1 }}>{title}</h1>
                    {headerRight}
                </div>
            </div>
            <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '20px 16px' }}>{children}</div>
        </div>
    );
}

/* ─── status badge ─── */
function Badge({ status }) {
    const map = {
        pending: { label: 'Awaiting Confirmation', bg: '#f3f3fd', color: '#434654' },
        confirmed: { label: 'Confirmed', bg: '#dae2ff', color: '#0040a2' },
        in_progress: { label: 'In Progress', bg: '#dae2ff', color: '#344573' },
        delivered: { label: 'Delivered', bg: '#ffdbcf', color: '#812800' },
        completed: { label: 'Completed', bg: '#d1fae5', color: '#065f46' },
        cancelled: { label: 'Cancelled', bg: '#ffdad6', color: '#93000a' },
        live: { label: 'Live', bg: '#d1fae5', color: '#065f46' },
        rejected: { label: 'Rejected', bg: '#ffdad6', color: '#93000a' },
        review: { label: 'Review', bg: '#fef3c7', color: '#92400e' },
    };
    const { label, bg, color } = map[status] || { label: status, bg: '#f3f4f6', color: '#374151' };
    return (
        <span style={{
            background: bg,
            color: color,
            padding: '6px 14px',
            borderRadius: 9999,
            fontSize: 10,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            height: 'fit-content',
            display: 'inline-block'
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
            socket.on('roomDeleted', () => {
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                                    <button
                                        onClick={(e) => handleDeleteRoom(e, room.roomId)}
                                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: 4 }}
                                    >
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

/* ─── Integrated Chat Room (WhatsApp style) ─── */
function ChatRoom({ user, room, onBack }) {
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

    // Fetch active service if serviceId in URL
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const serviceId = queryParams.get('service');
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
        // Expose fetchMessages to the component scope if needed, 
        // but here we just need it for the button below.
        window.refreshMobileChat = fetchMessages;
        fetchMessages();

        const newSocket = io(API_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });
        newSocket.emit('setup', user._id);
        newSocket.emit('joinRoom', room.roomId);
        newSocket.on('receiveMessage', (msg) => {
            if (msg.roomId === room.roomId) {
                setMessages(prev => {
                    if (msg.tempId) {
                        const exists = prev.findIndex(m => m._id === msg.tempId || m.tempId === msg.tempId);
                        if (exists !== -1) {
                            const newMsgs = [...prev];
                            newMsgs[exists] = { ...msg, optimistic: false };
                            return newMsgs;
                        }
                    }
                    if (prev.find(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
                newSocket.emit('readMessages', { roomId: room.roomId, userId: user._id });
            }
        });

        newSocket.on('typing', (data) => { if (data.roomId === room.roomId) setPartnerTyping(true); });
        newSocket.on('stopTyping', (data) => { if (data.roomId === room.roomId) setPartnerTyping(false); });
        newSocket.on('messagesRead', ({ roomId }) => {
            if (roomId === room.roomId) setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
        });

        newSocket.on('roomDeleted', (data) => {
            if (data.roomId === room.roomId) {
                toast.success('Conversation removed');
                onBack();
            }
        });

        setSocket(newSocket);

        // Auto-refresh (polling fallback) every 1 second
        const interval = setInterval(fetchMessages, 1000);

        return () => {
            newSocket.disconnect();
            clearInterval(interval);
        };
    }, [room.roomId, user]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
        const msgData = {
            _id: tempId,
            senderId: user._id,
            receiverId: room.otherUser._id,
            roomId: room.roomId,
            message: type === 'text' ? input : '',
            messageType: type,
            fileUrl: url,
            createdAt: new Date().toISOString(),
            optimistic: true,
            isRead: false
        };

        setMessages(prev => [...prev, msgData]);
        socket.emit('sendMessage', {
            senderId: user._id,
            receiverId: room.otherUser._id,
            roomId: room.roomId,
            message: type === 'text' ? input : '',
            messageType: type,
            fileUrl: url,
            tempId: tempId
        });

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
            let type = 'file';
            if (file.type.startsWith('image/')) type = 'image';
            handleSend(type, data.url);
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

    const handleDeleteRoom = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/api/messages/${room.roomId}`, config);
            toast.success('Chat deleted');
            onBack();
        } catch (err) {
            toast.error('Failed to delete chat');
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#f0f2f5', zIndex: 1100, display: 'flex', flexDirection: 'column' }}>
            {/* ── Header ── */}
            <div style={{
                background: '#ffffff',
                padding: '52px 16px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderBottom: '1px solid #f1f5f9'
            }}>
                <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#475569', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                        src={room.otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`}
                        style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                        alt=""
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`; }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', background: '#22c55e', border: '2px solid white' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <h4 style={{ color: '#0f172a', margin: 0, fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{room.otherUser?.name}</h4>
                    <span style={{ color: '#22c55e', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                        ACTIVE NOW
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button
                        onClick={() => {
                            if (window.refreshMobileChat) {
                                toast.promise(window.refreshMobileChat(), {
                                    loading: 'Refreshing...',
                                    success: 'Chat updated',
                                    error: 'Refresh failed'
                                });
                            }
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <RotateCw size={20} />
                    </button>
                    <button onClick={handleDeleteRoom} style={{ background: 'transparent', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={22} />
                    </button>
                </div>
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
                background: '#faf8ff',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
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
                    <>
                        {messages.map((m, i) => {
                            const isMe = m.senderId === user._id;
                            const showDate = i === 0 || new Date(m.createdAt).toDateString() !== new Date(messages[i - 1]?.createdAt).toDateString();
                            return (
                                <div key={m._id || i}>
                                    {showDate && (
                                        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 24px' }}>
                                            <span style={{ background: '#f1f5f9', fontSize: 10, color: '#64748b', padding: '6px 16px', borderRadius: 20, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {new Date(m.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                                        <div style={{
                                            background: isMe ? '#0052cc' : '#f8f9fc',
                                            color: isMe ? '#ffffff' : '#1e293b',
                                            padding: '12px 16px',
                                            borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                            maxWidth: '85%',
                                            position: 'relative',
                                            minWidth: 80
                                        }}>
                                            {m.messageType === 'image' && (
                                                <img src={m.fileUrl} style={{ width: '100%', borderRadius: 8, marginBottom: 4, display: 'block' }} alt="Sent image" />
                                            )}
                                            {m.messageType === 'file' && (
                                                <a href={m.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.05)', padding: 8, borderRadius: 8, textDecoration: 'none', color: '#1e293b', marginBottom: 4 }}>
                                                    <FileText size={20} />
                                                    <span style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>Document</span>
                                                </a>
                                            )}
                                            {m.messageType === 'voice' && (
                                                <audio src={m.fileUrl} controls style={{ width: '100%', height: 32, marginBottom: 4 }} />
                                            )}
                                            {m.message && (
                                                <p style={{ margin: 0, fontSize: '0.9rem', color: isMe ? '#ffffff' : '#1e293b', lineHeight: 1.5, wordBreak: 'break-word', fontWeight: 500 }}>{m.message}</p>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
                                                <span style={{ fontSize: 9, color: isMe ? 'rgba(255,255,255,0.7)' : '#94a3b8', fontWeight: 500 }}>
                                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMe && (
                                                    m.isRead ? <CheckCheck size={12} color="#ffffff" /> : <Check size={12} color="rgba(255,255,255,0.7)" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {partnerTyping && (
                            <div style={{ alignSelf: 'flex-start', padding: '6px 12px', background: 'white', borderRadius: '12px', fontSize: '11px', color: '#64748b', marginBottom: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ display: 'flex', gap: 2 }}>
                                    <span className="dot-typing" style={{ width: 4, height: 4 }}></span>
                                    <span className="dot-typing" style={{ width: 4, height: 4, animationDelay: '0.2s' }}></span>
                                    <span className="dot-typing" style={{ width: 4, height: 4, animationDelay: '0.4s' }}></span>
                                </div>
                                typing...
                            </div>
                        )}
                    </>
                )}
                <div ref={scrollRef} />
            </div>

            {/* ── Input Area ── */}
            <div style={{
                padding: '12px 16px',
                paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
                background: '#ffffff',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                position: 'relative'
            }}>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />

                {!isRecording ? (
                    <>
                        <button
                            onClick={() => fileInputRef.current.click()}
                            style={{ background: 'white', border: 'none', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                        >
                            <Paperclip size={20} />
                        </button>

                        <div style={{ flex: 1, background: 'white', borderRadius: 24, display: 'flex', alignItems: 'center', padding: '2px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <input
                                value={input}
                                onChange={e => handleType(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', padding: '10px 0', background: 'transparent', color: '#1e293b' }}
                            />
                            <button onClick={() => fileInputRef.current.click()} style={{ border: 'none', background: 'transparent', color: '#94a3b8', padding: '4px' }}>
                                <ImageIcon size={20} />
                            </button>
                        </div>

                        {input.trim() ? (
                            <button
                                onClick={() => handleSend()}
                                style={{ background: PC, border: 'none', width: 46, height: 46, borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,61,155,0.3)' }}
                            >
                                <Send size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={startRecording}
                                style={{ background: 'white', border: 'none', width: 46, height: 46, borderRadius: '50%', color: PC, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                            >
                                <Mic size={22} />
                            </button>
                        )}
                    </>
                ) : (
                    <div style={{ flex: 1, background: '#fee2e2', borderRadius: 24, display: 'flex', alignItems: 'center', padding: '8px 16px', gap: 12, border: '1px solid #fecaca' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }}></div>
                        <span style={{ flex: 1, color: '#991b1b', fontWeight: 700, fontSize: '0.9rem' }}>
                            Recording... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                        </span>
                        <button onClick={() => { setIsRecording(false); clearInterval(timerRef.current); if (mediaRecorderRef.current) mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop()); }} style={{ color: '#64748b', background: 'none', border: 'none' }}>
                            <X size={20} />
                        </button>
                        <button
                            onClick={stopRecording}
                            style={{ background: '#ef4444', color: 'white', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Send size={18} />
                        </button>
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

/* ─── My Gigs screen ─── */
function GigsScreen({
    filteredGigs, gigSearchQuery, setGigSearchQuery, gigTypeFilter, setGigTypeFilter,
    gigsLoading, setActiveTab, navigate, handleEditClick, onMenuClick, providerStatus
}) {
    return (
        <Shell title="My Gigs" onBack={() => setActiveTab('overview')} onMenuClick={onMenuClick}
            headerRight={
                <button onClick={() => setActiveTab('services')}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 14px', borderRadius: 9999, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    + New Gig
                </button>
            }>

            {/* Search and Filters */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ position: 'relative', marginBottom: 12 }}>
                    <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search gigs..."
                        value={gigSearchQuery}
                        onChange={(e) => setGigSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: 16, border: '1px solid #e2e8f0', background: 'white', fontSize: 14, fontWeight: 500, outline: 'none' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
                    {[
                        { id: 'all', label: 'All Gigs' },
                        { id: 'service', label: 'Services' },
                        { id: 'shop', label: 'Shops' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setGigTypeFilter(f.id)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 9999,
                                border: 'none',
                                background: gigTypeFilter === f.id ? PC : 'white',
                                color: gigTypeFilter === f.id ? 'white' : '#64748b',
                                fontSize: 12,
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {gigsLoading ? (
                <div style={{ textAlign: 'center', padding: 48 }}><Loader size={28} color={PC} className="animate-spin" /></div>
            ) : filteredGigs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed #e2e8f0', borderRadius: 20 }}>
                    <Briefcase size={40} color="#cbd5e1" style={{ marginBottom: 12 }} />
                    <p style={{ color: '#94a3b8' }}>
                        {gigSearchQuery || gigTypeFilter !== 'all'
                            ? 'No matching gigs found.'
                            : (providerStatus === 'pending'
                                ? 'Your account is pending review. You can still create gigs!'
                                : 'No gigs yet')}
                    </p>
                    {gigSearchQuery || gigTypeFilter !== 'all' ? (
                        <button onClick={() => { setGigSearchQuery(''); setGigTypeFilter('all'); }} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 9999, padding: '10px 24px', fontWeight: 700 }}>Clear Filters</button>
                    ) : (
                        <button onClick={() => setActiveTab('services')} style={{ background: PC, color: 'white', border: 'none', borderRadius: 9999, padding: '10px 24px', fontWeight: 700 }}>Create First Gig</button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filteredGigs.map(gig => {
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
function RequestsScreen({ bookingRequests, bookingsLoading, updateBookingStatus, setActiveTab, navigate, onSelectRoom, onSelectBooking, onMenuClick, onDeliverClick, onShowRevisions }) {
    const [bookingFilter, setBookingFilter] = useState('all');

    const filteredBookings = (bookingRequests || []).filter(b => {
        if (bookingFilter === 'all') return true;
        if (bookingFilter === 'pending') return b.status === 'pending';
        if (bookingFilter === 'confirmed') return b.status === 'confirmed';
        if (bookingFilter === 'in_progress') return ['in_progress', 'revision_requested', 'delivered'].includes(b.status);
        if (bookingFilter === 'completed') return b.status === 'completed';
        if (bookingFilter === 'cancelled') return ['cancelled', 'rejected'].includes(b.status);
        return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <Shell title="Booking Requests" onBack={() => setActiveTab('overview')} onMenuClick={onMenuClick}>
            <div style={{ padding: '0 4px' }}>
                {/* Editorial Header */}
                <div style={{ marginBottom: 32 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: PC, textTransform: 'uppercase', marginBottom: 8 }}>Portfolio Manager</p>
                    <h2 style={{ fontSize: 32, fontWeight: 800, color: '#191b23', lineHeight: 1.2 }}>Incoming <br /><span style={{ color: '#0052cc' }}>requests.</span></h2>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 32, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
                    {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setBookingFilter(filter)}
                            style={{
                                padding: '10px 24px',
                                borderRadius: 9999,
                                background: bookingFilter === filter ? PC : '#e7e7f2',
                                color: bookingFilter === filter ? 'white' : '#434654',
                                fontWeight: 700,
                                fontSize: 13,
                                border: 'none',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                boxShadow: bookingFilter === filter ? '0 10px 20px rgba(0,61,155,0.2)' : 'none'
                            }}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1).replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Bookings List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {bookingsLoading ? (
                        <div style={{ textAlign: 'center', padding: 48 }}><Loader size={28} color={PC} className="animate-spin" /></div>
                    ) : filteredBookings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: 24, border: '1px solid #f1f5f9' }}>
                            <p style={{ color: '#94a3b8' }}>No {bookingFilter === 'all' ? '' : bookingFilter} requests found</p>
                        </div>
                    ) : filteredBookings.map(req => {
                        const isCancelled = ['cancelled', 'rejected'].includes(req.status);
                        const isCompleted = req.status === 'completed';
                        return (
                            <div key={req._id} onClick={() => onSelectBooking(req)} style={{ background: isCancelled ? '#f8fafc' : (isCompleted ? '#faf8ff' : 'white'), borderRadius: 24, padding: 24, boxShadow: (isCancelled || isCompleted) ? 'none' : '0 10px 30px rgba(0,0,0,0.03)', border: isCancelled ? '2px dashed #e2e8f0' : '1px solid rgba(195, 198, 214, 0.1)', opacity: isCancelled ? 0.7 : 1, filter: isCancelled ? 'grayscale(100%)' : 'none' }}>
                                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                    <img
                                        src={req.service?.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.service?.title || 'S')}&background=f3f3fd&color=003d9b`}
                                        style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'cover', flexShrink: 0, border: '1px solid #f1f5f9' }}
                                        alt=""
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.service?.title || 'S')}&background=f3f3fd&color=003d9b`; }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <Badge status={req.status} />
                                        </div>
                                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#191b23', marginBottom: 4, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.service?.title}</h3>
                                        <p style={{ fontSize: 14, color: '#434654', margin: 0, fontWeight: 600 }}>{req.customerName || req.user?.name || req.user?.username || 'User'}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748b' }}>
                                            <Phone size={16} />
                                            <span style={{ fontSize: 12, fontWeight: 500 }}>
                                                {['completed', 'cancelled'].includes(req.status) ? 'Hidden' : (req.customerPhone || req.user?.phone || 'Phone not provided')}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748b' }}>
                                            <CalendarIcon size={16} />
                                            <span style={{ fontSize: 12, fontWeight: 500 }}>{new Date(req.createdAt).toLocaleDateString()} | {req.slot || 'TBA'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748b' }}>
                                            <MapPin size={16} />
                                            <span style={{ fontSize: 12, fontWeight: 500 }}>
                                                {typeof req.address === 'object'
                                                    ? (`${req.address?.street || ''}, ${req.address?.city || ''}`.trim() || 'Location TBA')
                                                    : (req.address || 'Location TBA')}
                                            </span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 24, fontWeight: 900, color: PC, margin: 0 }}>₹{req.price || req.totalPrice || '0'}</p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onSelectBooking(req); }}
                                        style={{ width: '100%', padding: '12px 0', border: '1px solid rgba(115, 118, 133, 0.2)', borderRadius: 16, color: '#434654', background: '#f8f9fc', fontWeight: 800, fontSize: 12 }}
                                    >View Order Details</button>

                                    {req.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateBookingStatus(req._id, 'cancelled'); }}
                                                style={{ flex: 1, padding: '12px 0', borderRadius: 16, background: '#ffdad6', color: '#93000a', border: 'none', fontWeight: 800, fontSize: 12 }}
                                            >Decline</button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateBookingStatus(req._id, 'confirmed'); }}
                                                style={{ flex: 1, padding: '12px 0', borderRadius: 16, background: '#0052cc', color: 'white', border: 'none', fontWeight: 800, fontSize: 12 }}
                                            >Accept Request</button>
                                        </div>
                                    )}

                                    {req.status === 'confirmed' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateBookingStatus(req._id, 'in_progress'); }}
                                                style={{ width: '100%', padding: '12px 0', borderRadius: 16, background: PC, color: 'white', border: 'none', fontWeight: 800, fontSize: 12 }}
                                            >Mark In Progress</button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const link = req.address?.googleMapLink || (req.address?.lat && req.address?.lng ? `https://www.google.com/maps?q=${req.address.lat},${req.address.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${req.address?.street || ''} ${req.address?.city || ''} ${req.address?.zipCode || ''}`.trim() || 'Customer Location')}`);
                                                    window.open(link, '_blank');
                                                }}
                                                style={{ width: '100%', padding: '12px 0', borderRadius: 16, border: '1px solid #e2e8f0', color: '#1e293b', background: '#f8f9fc', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                            >
                                                <MapPin size={16} /> Show Live Location
                                            </button>
                                        </div>
                                    )}

                                    {['in_progress', 'revision_requested'].includes(req.status) && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDeliverClick(req._id); }}
                                            style={{ width: '100%', padding: '12px 0', borderRadius: 16, background: '#059669', color: 'white', border: 'none', fontWeight: 800, fontSize: 12 }}
                                        >Deliver Service</button>
                                    )}
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onSelectRoom({ roomId: req._id, otherUser: req.user }); }}
                                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 8px', border: `1.5px solid ${PL}`, borderRadius: 16, color: PC, background: 'white', fontWeight: 800, fontSize: 12 }}
                                        >
                                            <MessageSquare size={16} /> Message
                                        </button>
                                        {req.revisions?.length > 0 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onShowRevisions(req); }}
                                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 8px', border: 'none', borderRadius: 16, color: '#003d9b', background: '#f0f7ff', fontWeight: 800, fontSize: 12 }}
                                            >
                                                <History size={16} /> Revisions ({req.revisions.length})
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Decorative Help Card */}
                <div style={{ marginTop: 48, marginBottom: 16, padding: 32, borderRadius: 32, background: '#0052cc', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <h4 style={{ color: 'white', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Need Help?</h4>
                        <p style={{ color: '#c4d2ff', fontSize: 14, lineHeight: 1.5, marginBottom: 24, maxWidth: 200 }}>Our support team is available 24/7 for booking disputes.</p>
                        <button style={{ padding: '8px 24px', background: 'white', color: PC, fontWeight: 800, fontSize: 14, borderRadius: 9999, border: 'none' }}>Contact Support</button>
                    </div>
                    <div style={{ position: 'absolute', bottom: -32, right: -32, width: 128, height: 128, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(32px)' }} />
                    <div style={{ position: 'absolute', top: -16, right: -16, width: 96, height: 96, background: 'rgba(0,0,0,0.2)', borderRadius: '50%', filter: 'blur(24px)' }} />
                </div>
            </div>
        </Shell>
    );
}

/* ─── Orders Screen ─── */
function OrdersScreen({ myBookings, bookingsLoading, setActiveTab, navigate, onSelectRoom, onSelectBooking, onMenuClick, updateBookingStatus, onShowRevisions, onRequestRevision }) {
    const [bookingFilter, setBookingFilter] = useState('all');

    const filteredBookings = (myBookings || []).filter(b => {
        if (bookingFilter === 'all') return true;
        if (bookingFilter === 'pending') return b.status === 'pending';
        if (bookingFilter === 'confirmed') return b.status === 'confirmed';
        if (bookingFilter === 'in_progress') return ['in_progress', 'revision_requested', 'delivered'].includes(b.status);
        if (bookingFilter === 'completed') return b.status === 'completed';
        if (bookingFilter === 'cancelled') return ['cancelled', 'rejected'].includes(b.status);
        return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <Shell title="My Bookings" onBack={() => setActiveTab('overview')} onMenuClick={onMenuClick}>
            <div style={{ padding: '0 4px' }}>
                {/* Editorial Header */}
                <div style={{ marginBottom: 32 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: PC, textTransform: 'uppercase', marginBottom: 8 }}>Portfolio Manager</p>
                    <h2 style={{ fontSize: 32, fontWeight: 800, color: '#191b23', lineHeight: 1.2 }}>Your ongoing <br /><span style={{ color: '#0052cc' }}>collaborations.</span></h2>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 32, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
                    {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setBookingFilter(filter)}
                            style={{
                                padding: '10px 24px',
                                borderRadius: 9999,
                                background: bookingFilter === filter ? PC : '#e7e7f2',
                                color: bookingFilter === filter ? 'white' : '#434654',
                                fontWeight: 700,
                                fontSize: 13,
                                border: 'none',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                boxShadow: bookingFilter === filter ? '0 10px 20px rgba(0,61,155,0.2)' : 'none'
                            }}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1).replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Bookings List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {bookingsLoading ? (
                        <div style={{ textAlign: 'center', padding: 48 }}><Loader size={28} color={PC} className="animate-spin" /></div>
                    ) : filteredBookings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: 24, border: '1px solid #f1f5f9' }}>
                            <p style={{ color: '#94a3b8' }}>No {bookingFilter === 'all' ? '' : bookingFilter} orders found</p>
                        </div>
                    ) : filteredBookings.map(b => {
                        const isCancelled = ['cancelled', 'rejected'].includes(b.status);
                        const isCompleted = b.status === 'completed';
                        return (
                            <div key={b._id} onClick={() => onSelectBooking(b)} style={{ background: isCancelled ? '#f8fafc' : (isCompleted ? '#faf8ff' : 'white'), borderRadius: 24, padding: 24, boxShadow: (isCancelled || isCompleted) ? 'none' : '0 10px 30px rgba(0,0,0,0.03)', border: isCancelled ? '2px dashed #e2e8f0' : '1px solid rgba(195, 198, 214, 0.2)', opacity: isCancelled ? 0.7 : 1, filter: isCancelled ? 'grayscale(100%)' : 'none' }}>
                                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                    <img
                                        src={b.service?.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.service?.title || 'S')}&background=f3f3fd&color=003d9b`}
                                        style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'cover', flexShrink: 0, border: '1px solid #f1f5f9' }}
                                        alt=""
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(b.service?.title || 'S')}&background=f3f3fd&color=003d9b`; }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <Badge status={b.status} />
                                        </div>
                                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#191b23', marginBottom: 4, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.service?.title}</h3>
                                        <p style={{ fontSize: 14, color: '#434654', margin: 0, fontWeight: 500 }}>Provider: {b.provider?.name || 'Sushant'}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748b' }}>
                                            <CalendarIcon size={16} />
                                            <span style={{ fontSize: 12, fontWeight: 500 }}>{new Date(b.createdAt).toLocaleDateString()} | {b.slot || 'TBA'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748b' }}>
                                            <MapPin size={16} />
                                            <span style={{ fontSize: 12, fontWeight: 500 }}>
                                                {typeof b.address === 'object'
                                                    ? (`${b.address?.street || ''}, ${b.address?.city || ''}`.trim() || 'Location TBA')
                                                    : (b.address || 'Location TBA')}
                                            </span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 24, fontWeight: 900, color: PC, margin: 0 }}>₹{b.price || b.totalPrice || '0'}</p>
                                </div>

                                {/* Buttons based on status */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onSelectBooking(b); }}
                                        style={{ width: '100%', height: 44, padding: '12px 0', border: '1px solid rgba(115, 118, 133, 0.2)', borderRadius: 16, color: '#434654', background: '#f8f9fc', fontWeight: 800, fontSize: 12 }}
                                    >View Details</button>

                                    <div style={{ display: 'grid', gridTemplateColumns: (b.status === 'delivered' || b.status === 'completed') ? '1fr 1fr' : '1fr', gap: 12 }}>
                                        {b.status === 'delivered' ? (
                                            <>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onRequestRevision(b); }}
                                                    style={{ padding: '12px 0', height: 44, borderRadius: 16, background: '#e1e2ec', color: '#191b23', border: 'none', fontWeight: 800, fontSize: 12 }}
                                                >Request Revision</button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); updateBookingStatus(b._id, 'completed'); }}
                                                    style={{ padding: '12px 0', height: 44, borderRadius: 16, background: '#0052cc', color: 'white', border: 'none', fontWeight: 800, fontSize: 12 }}
                                                >Accept & Complete</button>
                                            </>
                                        ) : b.status === 'completed' ? (
                                            <>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/invoice/${b._id}`); }}
                                                    style={{ padding: '12px 0', height: 44, borderRadius: 16, background: '#e1e2ec', color: '#191b23', border: 'none', fontWeight: 800, fontSize: 12 }}
                                                >View Receipt</button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/services/${b.service?._id || b.service}`); }}
                                                    style={{ padding: '12px 0', height: 44, borderRadius: 16, background: '#0052cc', color: 'white', border: 'none', fontWeight: 800, fontSize: 12 }}
                                                >Rate Professional</button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onSelectRoom({ roomId: b._id, otherUser: b.provider }); }}
                                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, padding: '12px 0', border: `1.5px solid ${PL}`, borderRadius: 16, color: PC, background: 'white', fontWeight: 800, fontSize: 12 }}
                                            >
                                                <MessageSquare size={16} /> Message Provider
                                            </button>
                                        )}
                                    </div>
                                    {b.revisions?.length > 0 && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onShowRevisions(b); }}
                                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', border: 'none', borderRadius: 16, color: '#003d9b', background: '#f0f7ff', fontWeight: 800, fontSize: 12, marginTop: 4 }}
                                        >
                                            <History size={16} /> View Revision History ({b.revisions.length})
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Decorative Help Card */}
                <div style={{ marginTop: 48, marginBottom: 16, padding: 32, borderRadius: 32, background: '#0052cc', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <h4 style={{ color: 'white', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Need Help?</h4>
                        <p style={{ color: '#c4d2ff', fontSize: 14, lineHeight: 1.5, marginBottom: 24, maxWidth: 200 }}>Our support team is available 24/7 for booking disputes.</p>
                        <button style={{ padding: '8px 24px', background: 'white', color: PC, fontWeight: 800, fontSize: 14, borderRadius: 9999, border: 'none' }}>Contact Support</button>
                    </div>
                    <div style={{ position: 'absolute', bottom: -32, right: -32, width: 128, height: 128, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(32px)' }} />
                    <div style={{ position: 'absolute', top: -16, right: -16, width: 96, height: 96, background: 'rgba(0,0,0,0.2)', borderRadius: '50%', filter: 'blur(24px)' }} />
                </div>
            </div>
        </Shell>
    );
}

/* ─── Booking Details Screen ─── */
function BookingDetailsScreen({ booking, userLocation, onBack, onMessage, role, updateBookingStatus, onDeliverClick, navigate, onShowRevisions }) {
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
                            <span style={{ fontSize: 11, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID: #{booking._id ? booking._id.slice(-8).toUpperCase() : 'N/A'}</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: PC }}>{role === 'provider' ? 'For' : 'With'}: {otherUser?.name || otherUser?.username || 'User'}</span>
                        </div>
                        <div style={{
                            backgroundColor: booking.status === 'pending' ? '#fff7ed' : ['confirmed', 'in_progress', 'delivered', 'completed'].includes(booking.status) ? '#f0fdf4' : '#fef2f2',
                            color: booking.status === 'pending' ? '#f97316' : ['confirmed', 'in_progress', 'delivered', 'completed'].includes(booking.status) ? '#22c55e' : '#ef4444',
                            padding: '4px 12px', borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: 'uppercase'
                        }}>
                            {booking.status?.replace('_', ' ') || 'UNKNOWN'}
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
                        {detailRow('Service Type', booking.service?.businessType ? booking.service.businessType.toString().toUpperCase() : 'SERVICE')}
                        {detailRow('Customer Name', booking.customerName || booking.user?.name || 'Unknown')}
                        {detailRow('Customer Phone', ['completed', 'cancelled'].includes(booking.status) ? 'Hidden' : (booking.customerPhone || booking.user?.phone || 'Not provided'))}
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

                {booking.status === 'completed' && (
                    <div style={{ marginTop: 12 }}>
                        <button
                            onClick={() => navigate(`/invoice/${booking._id}`)}
                            style={{ width: '100%', padding: '16px', borderRadius: 16, background: '#f1f5f9', color: '#1e293b', border: '1px solid #e2e8f0', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                        >
                            <Download size={20} /> View & Download Invoice
                        </button>
                    </div>
                )}

                {role === 'provider' && booking.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                        <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking._id, 'confirmed'); }} style={{ flex: 1, padding: '16px', borderRadius: 16, background: PC, color: 'white', border: 'none', fontWeight: 900, boxShadow: '0 10px 20px rgba(0, 61, 155, 0.2)' }}>Accept Order</button>
                        <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking._id, 'cancelled'); }} style={{ flex: 1, padding: '16px', borderRadius: 16, background: '#fee2e2', color: '#ef4444', border: 'none', fontWeight: 900 }}>Decline</button>
                    </div>
                )}

                {role === 'provider' && booking.status === 'confirmed' && (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking._id, 'in_progress'); }} style={{ width: '100%', padding: '16px', borderRadius: 16, background: PC, color: 'white', border: 'none', fontWeight: 900 }}>Start Service</button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const link = booking.address?.googleMapLink || (booking.address?.lat && booking.address?.lng ? `https://www.google.com/maps?q=${booking.address.lat},${booking.address.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${booking.address?.street || ''} ${booking.address?.city || ''} ${booking.address?.zipCode || ''}`.trim() || 'Customer Location')}`);
                                window.open(link, '_blank');
                            }}
                            style={{ width: '100%', padding: '16px', borderRadius: 16, background: '#f1f5f9', color: '#1e293b', border: '1px solid #e2e8f0', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                        >
                            <MapPin size={20} /> Show Live Location
                        </button>
                    </div>
                )}

                {role === 'provider' && ['in_progress', 'revision_requested'].includes(booking.status) && (
                    <div style={{ marginTop: 12 }}>
                        <button onClick={(e) => { e.stopPropagation(); onDeliverClick(booking._id); }} style={{ width: '100%', padding: '16px', borderRadius: 16, background: '#059669', color: 'white', border: 'none', fontWeight: 900 }}>Deliver & Request Payment</button>
                    </div>
                )}

                {booking.revisions?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); onShowRevisions(booking); }}
                            style={{ width: '100%', padding: '16px', borderRadius: 16, background: '#f0f7ff', color: '#003d9b', border: '1px solid #e2e8f0', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                        >
                            <History size={20} /> View Revision History ({booking.revisions.length})
                        </button>
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
                    <label style={labelStyle}>Username</label>
                    <input value={profileUsername} onChange={e => setProfileUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))} style={inputStyle} placeholder="Choose a unique username" />
                    {profileUsername && (
                        <p style={{ fontSize: 10, color: PC, fontWeight: 700, marginTop: 6, opacity: 0.8 }}>URL: {window.location.host}/u/{profileUsername}</p>
                    )}
                </div>
                <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input
                        value={profilePhone}
                        onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 10) setProfilePhone(val);
                        }}
                        style={inputStyle}
                        placeholder="10 digit number"
                    />
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

/* ─── Payments Screen ─── */
function PaymentsScreen({ stats, bookingRequests, setActiveTab, onWithdrawClick, withdrawals, withdrawalsLoading }) {
    const transactions = (bookingRequests || []).filter(b => b?.paymentStatus === 'paid' || b?.status === 'completed');
    const [view, setView] = useState('transactions'); // 'transactions' or 'withdrawals'

    const availableBalance = ((stats?.totalEarnings || 0) - (stats?.withdrawnAmount || 0) - (stats?.pendingWithdrawnAmount || 0));

    return (
        <Shell title="Wallet & Payments" onBack={() => setActiveTab('overview')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 100 }}>
                {/* Balance Card */}
                <div style={{ background: PC, borderRadius: 28, padding: 24, color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 15px 30px rgba(0,61,155,0.2)' }}>
                    <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1 }}>
                        <Wallet size={120} color="white" />
                    </div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: 8 }}>Available for Withdrawal</p>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>₹{availableBalance.toLocaleString()}</h2>

                        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 14px', borderRadius: 16, flex: 1 }}>
                                <span style={{ display: 'block', fontSize: 9, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>Pending</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>₹{(stats?.pendingWithdrawnAmount || 0).toLocaleString()}</span>
                            </div>
                            <button
                                onClick={onWithdrawClick}
                                style={{ background: 'white', color: PC, border: 'none', borderRadius: 16, padding: '0 24px', fontWeight: 900, fontSize: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            >
                                Withdraw
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    <div style={{ background: 'white', borderRadius: 24, padding: 20, border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 16, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={24} color="#3b82f6" />
                        </div>
                        <div>
                            <p style={{ fontSize: 10, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.5px' }}>Gross Earnings (Paid + Pending)</p>
                            <h4 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>₹{stats?.grossEarnings?.toLocaleString() || '0'}</h4>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div style={{ background: 'white', borderRadius: 20, padding: 16, border: '1px solid #f1f5f9', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                            <p style={{ fontSize: 9, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Total Withdrawn</p>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>₹{stats?.withdrawnAmount?.toLocaleString() || '0'}</h4>
                        </div>
                        <div style={{ background: 'white', borderRadius: 20, padding: 16, border: '1px solid #f1f5f9', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                            <p style={{ fontSize: 9, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Pending Payout</p>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f59e0b', margin: 0 }}>₹{stats?.pendingWithdrawnAmount?.toLocaleString() || '0'}</h4>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', background: '#f1f5f9', padding: 4, borderRadius: 14, marginTop: 8 }}>
                    <button
                        onClick={() => setView('transactions')}
                        style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: view === 'transactions' ? 'white' : 'transparent', color: view === 'transactions' ? PC : '#64748b', fontWeight: 800, fontSize: 13, boxShadow: view === 'transactions' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
                    >
                        Transactions
                    </button>
                    <button
                        onClick={() => setView('withdrawals')}
                        style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: view === 'withdrawals' ? 'white' : 'transparent', color: view === 'withdrawals' ? PC : '#64748b', fontWeight: 800, fontSize: 13, boxShadow: view === 'withdrawals' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
                    >
                        Withdrawals
                    </button>
                </div>

                {/* Content */}
                <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {view === 'transactions' ? (
                            transactions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: 28, border: '1px dashed #e2e8f0' }}>
                                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                        <History size={24} color="#cbd5e1" />
                                    </div>
                                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>No successful transactions yet.</p>
                                </div>
                            ) : (
                                transactions.map((tx, idx) => (
                                    <div key={idx} style={{ background: 'white', borderRadius: 24, padding: 16, display: 'flex', alignItems: 'center', gap: 14, border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <CheckCircle size={20} color="#10b981" />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.service?.title || 'Service Payment'}</h4>
                                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {tx.user?.name || 'Customer'}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#10b981' }}>+₹{tx.totalPrice?.toLocaleString()}</p>
                                            <p style={{ margin: '2px 0 0', fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>{tx.paymentStatus}</p>
                                        </div>
                                    </div>
                                ))
                            )
                        ) : (
                            withdrawalsLoading ? (
                                <div style={{ textAlign: 'center', padding: 40 }}><Loader className="animate-spin" /></div>
                            ) : withdrawals.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: 28, border: '1px dashed #e2e8f0' }}>
                                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                        <DollarSign size={24} color="#cbd5e1" />
                                    </div>
                                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>No withdrawal history yet.</p>
                                </div>
                            ) : (
                                withdrawals.map((w, idx) => (
                                    <div key={idx} style={{ background: 'white', borderRadius: 24, padding: 16, display: 'flex', alignItems: 'center', gap: 14, border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 14, background: w.status === 'successful' ? '#f0fdf4' : (w.status === 'pending' ? '#fffbeb' : '#fef2f2'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {w.status === 'successful' ? <CheckCircle size={20} color="#10b981" /> : (w.status === 'pending' ? <Clock size={20} color="#f59e0b" /> : <XCircle size={20} color="#ef4444" />)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>Payout Request</h4>
                                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{w.createdAt ? new Date(w.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>-₹{w.amount?.toLocaleString()}</p>
                                            <p style={{ margin: '2px 0 0', fontSize: 9, fontWeight: 900, color: w.status === 'successful' ? '#10b981' : (w.status === 'pending' ? '#f59e0b' : '#ef4444'), textTransform: 'uppercase' }}>{w.status}</p>
                                        </div>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>
            </div>
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

                        <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 16 }}>
                            <label style={labelStyle}>{gigBusinessType === 'shop' ? 'Shop Details' : 'Operational Details'}</label>
                            {gigBusinessType === 'shop' && (
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
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                                    <input type="checkbox" checked={shopIsHomeDelivery} onChange={e => setShopIsHomeDelivery(e.target.checked)} /> Home Delivery Service
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                                    <input type="checkbox" checked={shopIsHomeService} onChange={e => setShopIsHomeService(e.target.checked)} /> On-Site Home Visits
                                </label>
                                {shopIsHomeService && (
                                    <input type="number" value={shopHomeServiceFee} onChange={e => setShopHomeServiceFee(e.target.value)} style={{ ...inputStyle, marginTop: 8 }} placeholder="Visit Fee (₹)" />
                                )}
                            </div>
                        </div>
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
function OverviewScreen({ user, role, stats, myGigs, myBookings, profileAvatar, getAvatar, setActiveTab, navigate, providerTitle, providerAbout, onMenuClick, onShowRevisions }) {
    const pendingRevisions = (myBookings || []).filter(b => b.status === 'revision_requested');

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
                        {role === 'provider' ? 'Total Earnings' : 'Total Invested'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '8px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: PC }}>₹</span>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>
                                {role === 'provider' ? (stats?.totalEarnings?.toLocaleString() || 0) : (myBookings?.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.totalPrice || b.price || 0), 0).toLocaleString() || '0')}
                            </h2>
                        </div>
                        {role === 'provider' && (
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: 9, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: 2 }}>Available</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981', margin: 0 }}>₹{((stats.totalEarnings || 0) - (stats.withdrawnAmount || 0) - (stats.pendingWithdrawnAmount || 0)).toLocaleString()}</p>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                        {[
                            { label: role === 'provider' ? 'Active Gigs' : 'Ongoing', value: role === 'provider' ? (myGigs?.length || 0) : (myBookings?.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status)).length || 0), color: '#4f46e5' },
                            { label: role === 'provider' ? 'Total Orders' : 'Completed', value: role === 'provider' ? (stats?.totalOrders || 0) : (myBookings?.filter(b => b.status === 'completed').length || 0), color: '#10b981' },
                            { label: 'Revisions', value: pendingRevisions.length, color: '#f59e0b', icon: History }
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

                {/* Account Details Card */}
                <div style={{ background: 'white', borderRadius: 28, padding: 24, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 20px', color: '#1e293b' }}>Account Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 10, color: '#64748b', fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase' }}>Member Since</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>{user?.createdAt ? new Date(user.createdAt).getFullYear() : 2026}</p>
                        </div>
                        <div style={{ textAlign: 'center', borderLeft: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9' }}>
                            <p style={{ fontSize: 10, color: '#64748b', fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase' }}>Total Bookings</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>{myBookings?.length || 0}</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 10, color: '#64748b', fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase' }}>Account Status</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#22c55e', margin: 0 }}>Active</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px 4px', color: '#1e293b' }}>Quick Actions</h3>
                    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {(role === 'provider' ? [
                            { icon: PlusCircle, label: 'Add New Gig', action: () => setActiveTab('services') },
                            { icon: ShoppingBag, label: 'My Gigs', tab: 'mygigs' },
                            { icon: Heart, label: 'Favorites', tab: 'favorites' },
                            { icon: ShoppingCart, label: 'Purchased Orders', tab: 'bookings' },
                            { icon: Star, label: 'My Reviews', tab: 'reviews' },
                            { icon: User, label: 'Profile Settings', tab: 'profile' },
                        ] : [
                            { icon: Search, label: 'Find Services', action: () => navigate('/services') },
                            { icon: Briefcase, label: 'My Bookings', tab: 'bookings' },
                            { icon: Heart, label: 'Favorites', tab: 'favorites' },
                            { icon: Star, label: 'My Reviews', tab: 'reviews' },
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
                {/* Recent Activity Details */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 4px 16px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Recent Activity</h3>
                        <button onClick={() => setActiveTab(role === 'provider' ? 'requests' : 'bookings')} style={{ background: 'none', border: 'none', color: '#0052cc', fontWeight: 700, fontSize: '0.85rem' }}>View All</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {myBookings?.length > 0 ? myBookings.slice(0, 3).map(b => (
                            <div key={b._id} onClick={() => setActiveTab(role === 'provider' ? 'requests' : 'bookings')} style={{ background: 'white', borderRadius: 20, padding: 16, display: 'flex', alignItems: 'center', gap: 16, border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                <img src={b.service?.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.service?.title || 'S')}&background=eff6ff&color=3b82f6`} alt="" style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(b.service?.title || 'S')}&background=eff6ff&color=3b82f6`; }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4 style={{ margin: '0 0 4px', fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.service?.title || 'Service Booking'}</h4>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{new Date(b.createdAt).toLocaleDateString()} • ₹{b.totalPrice || b.price}</p>
                                </div>
                                <div style={{ padding: '4px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', background: b.status === 'completed' ? '#f0fdf4' : (b.status === 'cancelled' || b.status === 'rejected' ? '#fef2f2' : '#eff6ff'), color: b.status === 'completed' ? '#16a34a' : (b.status === 'cancelled' || b.status === 'rejected' ? '#ef4444' : '#3b82f6') }}>
                                    {b.status}
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: 24, textAlign: 'center', background: 'white', borderRadius: 20, border: '1px solid #f1f5f9' }}>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>No recent activity to show.</p>
                            </div>
                        )}
                    </div>
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

function ReviewsScreen({ setActiveTab, user, role }) {
    const [myReviews, setMyReviews] = React.useState([]);
    const [myReviewsLoading, setMyReviewsLoading] = React.useState(false);
    const [editingReviewId, setEditingReviewId] = React.useState(null);
    const [editRating, setEditRating] = React.useState(0);
    const [editComment, setEditComment] = React.useState('');

    const fetchMyReviews = async () => {
        setMyReviewsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const endpoint = role === 'provider' ? '/api/reviews/provider' : '/api/reviews/me';
            const { data } = await api.get(endpoint, config);
            setMyReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setMyReviewsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchMyReviews();
    }, []);

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/api/reviews/${reviewId}`, config);
            toast.success('Review deleted');
            fetchMyReviews();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting review');
        }
    };

    const handleEditReview = (review) => {
        setEditingReviewId(review._id);
        setEditRating(review.rating);
        setEditComment(review.comment);
    };

    const handleUpdateReview = async (reviewId) => {
        if (!editComment.trim()) {
            toast.error('Comment cannot be empty');
            return;
        }
        if (editRating < 1 || editRating > 5) {
            toast.error('Please select a rating');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put(`/api/reviews/${reviewId}`, { rating: editRating, comment: editComment }, config);
            toast.success('Review updated');
            setEditingReviewId(null);
            fetchMyReviews();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating review');
        }
    };

    return (
        <Shell title={role === 'provider' ? 'Customer Reviews' : 'My Reviews'} onBack={() => setActiveTab('overview')}>
            <div className="animate-fade-in" style={{ padding: '0 0 20px 0' }}>
                {myReviewsLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Loader className="animate-spin" /></div>
                ) : myReviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 24, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', margin: '0 16px' }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Star size={40} color="#cbd5e1" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>No reviews found</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {role === 'provider' ? 'You have not received any reviews yet.' : 'You have not written any reviews yet.'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', padding: '0 16px' }}>
                        {myReviews.map(review => (
                            <div key={review._id} style={{ background: '#fff', borderRadius: '24px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', border: '1px solid #f8fafc' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                                            <img
                                                src={review.service?.images?.[0] || (role === 'provider' ? review.user?.avatar : review.provider?.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.service?.title || 'S')}&background=ede9fe&color=4f46e5`}
                                                alt=""
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.service?.title || 'S')}&background=ede9fe&color=4f46e5`; }}
                                            />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#1e293b' }}>{role === 'provider' ? review.user?.name : review.provider?.name || 'Professional'}</h4>
                                            {review.service && (
                                                <div
                                                    onClick={() => navigate(`/services/${review.service._id}`)}
                                                    style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#003d9b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0, 61, 155, 0.05)', padding: '4px 8px', borderRadius: '6px', width: 'fit-content' }}
                                                >
                                                    <Briefcase size={10} />
                                                    {review.service?.title?.split(' ')?.slice(0, 4)?.join(' ')}{review.service?.title?.split(' ').length > 4 ? '...' : ''}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fffbeb', padding: '4px 8px', borderRadius: '8px' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#d97706' }}>{review.rating}</span>
                                        <Star size={12} fill="#d97706" color="#d97706" />
                                    </div>
                                </div>

                                {editingReviewId === review._id ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star
                                                    key={star}
                                                    size={24}
                                                    fill={star <= editRating ? "#d97706" : "none"}
                                                    color={star <= editRating ? "#d97706" : "#cbd5e1"}
                                                    onClick={() => setEditRating(star)}
                                                />
                                            ))}
                                        </div>
                                        <textarea
                                            value={editComment}
                                            onChange={(e) => setEditComment(e.target.value)}
                                            style={{ width: '100%', height: '100px', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '12px', fontSize: '0.95rem', resize: 'none', outline: 'none' }}
                                            placeholder="Write your review here..."
                                        />
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button
                                                onClick={() => handleUpdateReview(review._id)}
                                                style={{ flex: 1, padding: '12px', borderRadius: '10px', background: PC, color: '#fff', border: 'none', fontWeight: '700' }}
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingReviewId(null)}
                                                style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#f1f5f9', color: '#64748b', border: 'none', fontWeight: '700' }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ flex: 1, margin: '4px 0 16px', padding: '12px 12px 12px 24px', background: '#f8fafc', borderRadius: '12px', position: 'relative' }}>
                                            <MessageSquare size={14} color="#cbd5e1" style={{ position: 'absolute', top: '12px', left: '8px', opacity: 0.5 }} />
                                            <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>"{review.comment}"</p>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <CalendarIcon size={12} />
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                            {role === 'customer' && (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => handleEditReview(review)} style={{ padding: '6px 12px', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Edit3 size={12} /> Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteReview(review._id)} style={{ padding: '6px 12px', borderRadius: '8px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Trash2 size={12} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Shell>
    );
}

function FavoritesScreen({ favorites, favoritesLoading, fetchFavorites, setActiveTab, navigate, user }) {
    return (
        <Shell title="My Favorites" onBack={() => setActiveTab('overview')}>
            <div className="animate-fade-in">
                {favoritesLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Loader className="animate-spin" /></div>
                ) : (!favorites || favorites.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 24, boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Heart size={40} color="#fecaca" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>No favorites yet</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 24 }}>Save the services you love and they will appear here!</p>
                        <button onClick={() => navigate('/services')} style={{ background: PC, color: 'white', border: 'none', borderRadius: 100, padding: '14px 28px', fontWeight: 800, fontSize: '0.9rem', boxShadow: '0 10px 20px rgba(0,61,155,0.2)' }}>Browse Services</button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                        {favorites.map(srv => (
                            <div
                                key={srv._id}
                                onClick={() => navigate(`/services/${srv._id}`)}
                                style={{
                                    background: 'white',
                                    borderRadius: 24,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: '1px solid #f1f5f9',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div style={{ position: 'relative', width: '100%', height: 180 }}>
                                    <img
                                        src={srv.images && srv.images.length > 0 ? srv.images[0] : (srv.provider?.avatar && srv.provider.avatar.startsWith('http') ? srv.provider.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(srv.provider?.name || srv.title || 'S')}&background=f3f4f6&color=4f46e5&size=300`)}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        alt=""
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(srv.provider?.name || srv.title || 'S')}&background=f3f4f6&color=4f46e5&size=300`; }}
                                    />
                                    <div style={{ position: 'absolute', top: 12, left: 12 }}>
                                        <span style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800', color: PC, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                            {srv.category}
                                        </span>
                                    </div>
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (user?.token) {
                                                await api.post(`/api/users/favorites/${srv._id}`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
                                                fetchFavorites();
                                            }
                                        }}
                                        style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', backgroundColor: '#ef4444', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)' }}
                                    >
                                        <Heart size={16} fill="#fff" color="#fff" />
                                    </button>
                                </div>
                                <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>{srv.title || 'Untitled Service'}</h4>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                                        <Star size={14} fill="#fbbf24" color="#fbbf24" />
                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{srv.rating || '4.8'}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>({srv.numReviews || '0'})</span>
                                        <span style={{ margin: '0 4px', color: '#e2e8f0' }}>•</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: '0.8rem' }}>
                                            <MapPin size={12} />
                                            <span>{srv.location?.city || 'Remote'}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 16, marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <img
                                                src={srv.provider?.avatar && srv.provider.avatar.startsWith('http') ? srv.provider.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(srv.provider?.name || 'P')}&background=ede9fe&color=4f46e5&size=30`}
                                                style={{ borderRadius: '50%', width: 28, height: 28, objectFit: 'cover' }}
                                                alt=""
                                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(srv.provider?.name || 'P')}&background=ede9fe&color=4f46e5&size=30`; }}
                                            />
                                            <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>{srv.provider?.name || 'Professional'}</span>
                                        </div>
                                        {srv.businessType === 'shop' ? (
                                            <button
                                                style={{
                                                    backgroundColor: PC,
                                                    color: '#fff',
                                                    padding: '8px 16px',
                                                    borderRadius: '100px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '700',
                                                    border: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const lat = srv.geoCoordinates?.coordinates?.[1];
                                                    const lng = srv.geoCoordinates?.coordinates?.[0];
                                                    const link = srv.shopDetails?.googleMapsLink || (lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null);
                                                    if (link) window.open(link, '_blank');
                                                }}
                                            >
                                                <MapPin size={14} /> Direction
                                            </button>
                                        ) : (
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Starting at</p>
                                                <span style={{ fontWeight: 900, color: PC, fontSize: '1.2rem' }}>₹{srv.price || 0}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Shell>
    );
}

export default function DashboardMobile(props) {
    const {
        user, role, stats, myGigs, gigsLoading, bookingRequests, bookingsLoading,
        providerStatus,
        profileAvatar, getAvatar, activeTab, setActiveTab,
        gigSearchQuery, setGigSearchQuery, gigTypeFilter, setGigTypeFilter,
        navigate: navProp,
        myBookings, updateBookingStatus,
        profileName, setProfileName, profilePhone, setProfilePhone,
        profileUsername, setProfileUsername,
        providerTitle, providerAbout,
        providerTitleSetter, providerAboutSetter,
        handleSaveProfile, savingProfile, handleAvatarUpload, uploadingAvatar,
        handleEditClick,
        favorites, favoritesLoading, fetchFavorites,
        showRevisions, setShowRevisions, bookingWithRevisions, setBookingWithRevisions,
        withdrawals, withdrawalsLoading, fetchWithdrawals, fetchStats
    } = props;


    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [withdrawalMethod, setWithdrawalMethod] = useState('Bank Transfer');
    const [withdrawalDetails, setWithdrawalDetails] = useState('');



    const handleWithdrawRequest = async () => {
        if (!withdrawalAmount || isNaN(withdrawalAmount) || Number(withdrawalAmount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        const available = (stats.totalEarnings || 0) - (stats.withdrawnAmount || 0) - (stats.pendingWithdrawnAmount || 0);
        if (Number(withdrawalAmount) > available) {
            toast.error('Insufficient balance');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.post('/api/withdrawals', {
                amount: Number(withdrawalAmount),
                method: withdrawalMethod,
                details: withdrawalDetails
            }, config);
            toast.success('Withdrawal request submitted');
            setShowWithdrawModal(false);
            setWithdrawalAmount('');
            setWithdrawalDetails('');
            fetchWithdrawals();
            if (fetchStats) fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error submitting request');
        }
    };



    const filteredGigs = (myGigs || []).filter(gig => {
        const title = (gig?.title || '').toLowerCase();
        const category = (gig?.category || '').toLowerCase();
        const query = (gigSearchQuery || '').toLowerCase();
        const matchesSearch = title.includes(query) || category.includes(query);
        const matchesType = gigTypeFilter === 'all' || gig?.businessType === gigTypeFilter;
        return matchesSearch && matchesType;
    });

    const { userLocation } = useAuthStore();
    const navHook = useNav();
    const navigate = navProp || navHook;
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingForPayment, setBookingForPayment] = useState(null);
    const [bookingForRevision, setBookingForRevision] = useState(null);
    const [revisionNote, setRevisionNote] = useState('');

    const handleDeliverClick = (booking) => {
        setBookingForPayment(booking);
    };

    const handleShowRevisions = (booking) => {
        setBookingWithRevisions(booking);
        setShowRevisions(true);
    };

    const handleRequestRevision = (booking) => {
        setBookingForRevision(booking);
        setRevisionNote('');
    };

    const submitRevision = async () => {
        if (!bookingForRevision || !revisionNote.trim()) return;
        try {
            await updateBookingStatus(bookingForRevision._id, 'revision_requested', revisionNote);
            setBookingForRevision(null);
            setRevisionNote('');
        } catch (err) {
            console.error(err);
        }
    };

    const confirmDelivery = async (paymentMode) => {
        if (!bookingForPayment) return;
        try {
            // updateBookingStatus(bookingId, status, note, paymentMode)
            await updateBookingStatus(bookingForPayment._id, 'delivered', '', paymentMode);
            setBookingForPayment(null);
            setSelectedBooking(null);
        } catch (err) {
            console.error(err);
        }
    };

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

        if (selectedBooking) {
            return (
                <BookingDetailsScreen
                    booking={selectedBooking}
                    userLocation={userLocation}
                    onBack={() => setSelectedBooking(null)}
                    onMessage={() => { setSelectedRoom({ roomId: selectedBooking._id, otherUser: role === 'provider' ? selectedBooking.user : selectedBooking.provider }); setSelectedBooking(null); }}
                    role={role}
                    updateBookingStatus={updateBookingStatus}
                    onDeliverClick={handleDeliverClick}
                    navigate={navigate}
                    onShowRevisions={handleShowRevisions}
                />
            );
        }

        if (activeTab === 'requests') {
            return (
                <RequestsScreen
                    bookingRequests={bookingRequests}
                    bookingsLoading={bookingsLoading}
                    updateBookingStatus={updateBookingStatus}
                    setActiveTab={setActiveTab}
                    navigate={navigate}
                    onSelectRoom={setSelectedRoom}
                    onSelectBooking={setSelectedBooking}
                    onDeliverClick={handleDeliverClick}
                    onShowRevisions={handleShowRevisions}
                />
            );
        }


        switch (activeTab) {
            case 'mygigs': return (
                <GigsScreen
                    filteredGigs={filteredGigs}
                    gigSearchQuery={gigSearchQuery}
                    setGigSearchQuery={setGigSearchQuery}
                    gigTypeFilter={gigTypeFilter}
                    setGigTypeFilter={setGigTypeFilter}
                    gigsLoading={gigsLoading}
                    setActiveTab={setActiveTab}
                    navigate={navigate}
                    handleEditClick={handleEditClick}
                    providerStatus={providerStatus}
                />
            );
            case 'services': return <ServicesScreen {...props} setActiveTab={setActiveTab} />;
            case 'become_provider': return <BecomeProviderScreen handleApplyProvider={props.handleApplyProvider} isSubmitting={props.isSubmitting} setActiveTab={setActiveTab} />;
            case 'admin': return <AdminScreen allUsers={props.allUsers} usersLoading={props.usersLoading} handleUpdateUserRole={props.handleUpdateUserRole} handleToggleUserBan={props.handleToggleUserBan} setActiveTab={setActiveTab} />;
            case 'requests': return <RequestsScreen bookingRequests={bookingRequests} bookingsLoading={bookingsLoading} updateBookingStatus={updateBookingStatus} setActiveTab={setActiveTab} navigate={navigate} onSelectRoom={setSelectedRoom} onSelectBooking={setSelectedBooking} onShowRevisions={handleShowRevisions} />;
            case 'bookings': return <OrdersScreen myBookings={myBookings} bookingsLoading={bookingsLoading} updateBookingStatus={updateBookingStatus} setActiveTab={setActiveTab} navigate={navigate} onSelectRoom={setSelectedRoom} onSelectBooking={setSelectedBooking} onShowRevisions={handleShowRevisions} onRequestRevision={handleRequestRevision} />;
            case 'chat': return <InboxScreen user={user} setActiveTab={setActiveTab} navigate={navigate} onSelectRoom={setSelectedRoom} />;
            case 'payments': return (
                <PaymentsScreen
                    stats={stats}
                    bookingRequests={bookingRequests}
                    setActiveTab={setActiveTab}
                    onWithdrawClick={() => setShowWithdrawModal(true)}
                    withdrawals={withdrawals}
                    withdrawalsLoading={withdrawalsLoading}
                />
            );
            case 'profile': return <ProfileScreen user={user} profileAvatar={profileAvatar} getAvatar={getAvatar} profileName={profileName} setProfileName={setProfileName} profilePhone={profilePhone} setProfilePhone={setProfilePhone} profileUsername={profileUsername} setProfileUsername={setProfileUsername} providerTitle={providerTitle} providerAbout={providerAbout} providerTitleSetter={providerTitleSetter} providerAboutSetter={providerAboutSetter} handleSaveProfile={handleSaveProfile} savingProfile={savingProfile} uploadingAvatar={uploadingAvatar} handleAvatarUpload={handleAvatarUpload} role={role} setActiveTab={setActiveTab} />;
            case 'favorites': return <FavoritesScreen favorites={favorites} favoritesLoading={favoritesLoading} fetchFavorites={fetchFavorites} setActiveTab={setActiveTab} navigate={navigate} user={user} />;
            case 'reviews': return <ReviewsScreen user={user} role={role} setActiveTab={setActiveTab} />;
            default: return <OverviewScreen user={user} role={role} stats={stats} myGigs={myGigs} myBookings={myBookings} providerTitle={providerTitle} providerAbout={providerAbout} profileAvatar={profileAvatar} getAvatar={getAvatar} setActiveTab={setActiveTab} navigate={navigate} onShowRevisions={handleShowRevisions} />;
        }
    };

    return (
        <div style={{ minHeight: '100dvh', backgroundColor: '#faf8ff', fontFamily: 'Inter, sans-serif' }}>
            {renderScreen()}
            <RevisionHistoryModal
                isOpen={showRevisions}
                onClose={() => setShowRevisions(false)}
                revisions={bookingWithRevisions?.revisions || []}
            />
            <RevisionModal
                isOpen={!!bookingForRevision}
                onClose={() => setBookingForRevision(null)}
                onSubmit={submitRevision}
                note={revisionNote}
                setNote={setRevisionNote}
            />
            <PaymentModal
                isOpen={!!bookingForPayment}
                onClose={() => setBookingForPayment(null)}
                onSelect={confirmDelivery}
            />
            <WithdrawalModal
                isOpen={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                onSubmit={handleWithdrawRequest}
                amount={withdrawalAmount}
                setAmount={setWithdrawalAmount}
                availableBalance={(stats.totalEarnings || 0) - (stats.withdrawnAmount || 0) - (stats.pendingWithdrawnAmount || 0)}
                method={withdrawalMethod}
                setMethod={setWithdrawalMethod}
                details={withdrawalDetails}
                setDetails={setWithdrawalDetails}
            />
            <DashboardMobileNav
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                role={role}
                navigate={navigate}
            />
        </div>
    );
};
