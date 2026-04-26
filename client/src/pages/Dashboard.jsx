import React, { useState, useEffect, useCallback, useMemo } from 'react';
import io from 'socket.io-client';
import { User, Briefcase, Calendar as CalendarIcon, Settings, MessageSquare, BarChart, Loader, Home, LogOut, Wallet, Inbox, Heart, Star, HelpCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import api, { API_URL } from '../utils/api';
import ChatList from '../components/ChatList';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../components/MapPicker';
import { State, City } from 'country-state-city';
import DashboardMobile from '../components/dashboard/mobile/DashboardMobile';
import DashboardDesktop from '../components/dashboard/desktop/DashboardDesktop';

const Dashboard = () => {
    const { user, updateUserInfo, userLocation, logout } = useAuthStore();
    const navigate = useNavigate();
    const [role, setRole] = useState(user?.role || 'customer');
    const queryParams = new URLSearchParams(window.location.search);
    const initialTab = queryParams.get('tab');

    const [activeTab, setActiveTab] = useState(initialTab || 'overview');
    const [revisionNote, setRevisionNote] = useState('');
    const [bookingForRevision, setBookingForRevision] = useState(null);
    const [showRevisions, setShowRevisions] = useState(false);
    const [bookingWithRevisions, setBookingWithRevisions] = useState(null);

    const getAvatar = (userData) => {
        if (userData?.avatar && userData.avatar.startsWith('http')) return userData.avatar;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || 'U')}&background=ede9fe&color=4f46e5&size=120`;
    };

    // My Gigs state
    const [myGigs, setMyGigs] = useState([]);
    const [gigsLoading, setGigsLoading] = useState(false);

    // Bookings state
    const [myBookings, setMyBookings] = useState([]);
    const [bookingRequests, setBookingRequests] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);

    // Admin States
    const [allUsers, setAllUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [adminServices, setAdminServices] = useState([]);
    const [servicesLoading, setServicesLoading] = useState(false);

    // Favorites state
    const [favorites, setFavorites] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(false);
    const [gigSearchQuery, setGigSearchQuery] = useState('');
    const [gigTypeFilter, setGigTypeFilter] = useState('all'); // all, service, shop

    // Form states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [providerStatus, setProviderStatus] = useState(user?.providerDetails?.isApproved ? 'approved' : user?.role === 'provider' ? 'pending' : 'none');
    const [providerTitle, setProviderTitle] = useState('');
    const [providerAbout, setProviderAbout] = useState('');

    // Expanded Gig Registration States (3-Page Flow)
    const [gigStep, setGigStep] = useState(1);
    const [gigBusinessType, setGigBusinessType] = useState('service'); // service or shop
    const [gigTitle, setGigTitle] = useState('');
    const [gigCategory, setGigCategory] = useState('');
    const [gigDesc, setGigDesc] = useState('');
    const [gigServicesIncluded, setGigServicesIncluded] = useState('');
    const [gigPrice, setGigPrice] = useState(''); // Default/Basic price
    const [gigPriceType, setGigPriceType] = useState('fixed');
    const [gigState, setGigState] = useState('');
    const [gigCity, setGigCity] = useState('');
    const [gigAddress, setGigAddress] = useState('');
    const [gigZipCode, setGigZipCode] = useState('');
    const [gigExperience, setGigExperience] = useState('');
    const [gigJobsCompleted, setGigJobsCompleted] = useState('');
    const [gigCustomCategory, setGigCustomCategory] = useState('');
    const [gigCoveragePincodes, setGigCoveragePincodes] = useState('');
    const [gigLat, setGigLat] = useState(null);
    const [gigLng, setGigLng] = useState(null);
    const [shopGoogleMapsLink, setShopGoogleMapsLink] = useState('');
    const [editingGigId, setEditingGigId] = useState(null);
    const [gigStateCode, setGigStateCode] = useState('');
    const indianStates = State.getStatesOfCountry('IN');

    // Plans state (Fiverr-style 3 plans)
    const [usePlans, setUsePlans] = useState(true);
    const [gigPlans, setGigPlans] = useState([
        { name: 'Basic', price: '', description: '', features: '', deliveryTime: '2 Days' },
        { name: 'Standard', price: '', description: '', features: '', deliveryTime: '5 Days' },
        { name: 'Premium', price: '', description: '', features: '', deliveryTime: '10 Days' }
    ]);

    // Shop specific details
    const [shopOpeningTime, setShopOpeningTime] = useState('09:00 AM');
    const [shopClosingTime, setShopClosingTime] = useState('09:00 PM');
    const [shopIsHomeDelivery, setShopIsHomeDelivery] = useState(false);
    const [shopIsHomeService, setShopIsHomeService] = useState(false);
    const [shopHomeServiceFee, setShopHomeServiceFee] = useState('');
    const [shopAge, setShopAge] = useState('');

    const [gigImages, setGigImages] = useState([]);
    const [gigTargetGender, setGigTargetGender] = useState('unisex');
    const [uploadingGigImages, setUploadingGigImages] = useState(false);
    const [creatingGig, setCreatingGig] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };



    const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileName, setProfileName] = useState(user?.name || '');
    const [profilePhone, setProfilePhone] = useState(user?.phone || '');
    const [profileUsername, setProfileUsername] = useState(user?.username || '');

    // Dashboard Statistics
    const [stats, setStats] = useState({
        activeGigs: 0,
        totalOrders: 0,
        totalEarnings: 0,
        pendingOrders: 0,
        grossEarnings: 0,
        withdrawnAmount: 0,
        pendingWithdrawnAmount: 0,
        chartData: []
    });
    const [isStatsLoading, setIsStatsLoading] = useState(false);
    const [withdrawals, setWithdrawals] = useState([]);
    const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);

    const fetchMyBookings = useCallback(async (silent = false) => {
        if (!user?.token) return;
        if (!silent) setBookingsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // Add timestamp to prevent caching
            const { data } = await api.get(`/api/bookings/mybookings?t=${Date.now()}`, config);
            console.log('API FETCH SUCCESS (Bookings):', data.length, 'items');
            setMyBookings(data);
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        } finally {
            if (!silent) setBookingsLoading(false);
        }
    }, [user?.token]);

    const fetchProviderRequests = useCallback(async (silent = false) => {
        if (!user || user.role !== 'provider' || !user.token) return;
        if (!silent) setBookingsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get(`/api/bookings/provider?t=${Date.now()}`, config);
            console.log('API FETCH SUCCESS (Requests):', data.length, 'items');
            setBookingRequests(data);
        } catch (err) {
            console.error('Failed to fetch provider requests', err);
        } finally {
            if (!silent) setBookingsLoading(false);
        }
    }, [user?.token, user?.role]);

    const fetchMyGigs = useCallback(async (silent = false) => {
        if (!user?.token) return;
        if (!silent) setGigsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/api/services/mine', config);
            setMyGigs(data);
        } catch (err) {
            console.error('Failed to fetch gigs', err);
        } finally {
            if (!silent) setGigsLoading(false);
        }
    }, [user?.token]);

    const fetchStats = useCallback(async (silent = false) => {
        if (!user?.token) return;
        try {
            if (!silent) setIsStatsLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get(`/api/bookings/provider/stats?t=${Date.now()}`, config);
            setStats(data);
        } catch (error) {
            console.error('Error fetching dashboard stats', error);
        } finally {
            if (!silent) setIsStatsLoading(false);
        }
    }, [user?.token]);

    const fetchWithdrawals = useCallback(async (silent = false) => {
        if (!user || user.role !== 'provider' || !user.token) return;
        try {
            if (!silent) setWithdrawalsLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get(`/api/withdrawals/my?t=${Date.now()}`, config);
            setWithdrawals(data);
        } catch (error) {
            console.error('Error fetching withdrawals', error);
        } finally {
            if (!silent) setWithdrawalsLoading(false);
        }
    }, [user?.token, user?.role]);



    const fetchAdminData = useCallback(async (silent = false) => {
        if (user?.role !== 'admin' || !user?.token) return;
        try {
            if (!silent) setUsersLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const usersRes = await api.get(`/api/admin/users?t=${Date.now()}`, config);
            setAllUsers(usersRes.data);

            if (!silent) setServicesLoading(true);
            const servicesRes = await api.get(`/api/admin/services?t=${Date.now()}`, config);
            setAdminServices(servicesRes.data);

            setUsersLoading(false);
            setServicesLoading(false);
        } catch (error) {
            console.error('Error fetching admin data', error);
            setUsersLoading(false);
            setServicesLoading(false);
        }
    }, [user?.token, user?.role]);

    const fetchFavorites = useCallback(async (silent = false) => {
        if (!user?.token) return;
        if (!silent) setFavoritesLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/api/users/favorites', config);
            setFavorites(data);
        } catch (err) {
            console.error('Error fetching favorites', err);
        } finally {
            if (!silent) setFavoritesLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        if (activeTab === 'favorites') {
            fetchFavorites();
        }
        if (activeTab === 'payments' && user?.role === 'provider') {
            fetchWithdrawals();
        }
    }, [activeTab]);

    const handleUpdateUserRole = async (userId, newRole) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put(`/api/admin/users/${userId}/role`, { role: newRole }, config);
            toast.success(`Role updated to ${newRole}`);
            fetchAdminData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role');
        }
    };

    const handleToggleUserBan = async (userId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.put(`/api/admin/users/${userId}/ban`, {}, config);
            toast.success(data.message);
            fetchAdminData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to toggle ban');
        }
    };

    // Dashboard-integrated Chat States
    const [dashActiveRoom, setDashActiveRoom] = useState(null);
    const [dashMessages, setDashMessages] = useState([]);
    const [dashMessageInput, setDashMessageInput] = useState('');
    const [dashSocket, setDashSocket] = useState(null);
    const [partnerTyping, setPartnerTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [uploadingFile, setUploadingFile] = useState(false);
    const mediaRecorderRef = React.useRef(null);
    const audioChunksRef = React.useRef([]);
    const timerRef = React.useRef(null);
    const fileInputRef = React.useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const messagesEndRef = React.useRef(null);
    const activeRoomRef = React.useRef(null);

    // Sync ref with state
    useEffect(() => {
        activeRoomRef.current = dashActiveRoom;
    }, [dashActiveRoom]);

    // Handle Window Resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Setup Dashboard Socket for Real-time chat and updates
    useEffect(() => {
        if (!user?._id) return;

        const socket = io(API_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('Dashboard Socket Connected:', socket.id);
            socket.emit('setup', user._id);
        });

        socket.on('receiveMessage', (data) => {
            const activeRoom = activeRoomRef.current;
            if (activeRoom && activeRoom.roomId === data.roomId) {
                setDashMessages(prev => {
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
                socket.emit('readMessages', { roomId: activeRoom.roomId, userId: user._id });
            }
        });

        socket.on('typing', (data) => {
            if (activeRoomRef.current?.roomId === data.roomId) setPartnerTyping(true);
        });

        socket.on('stopTyping', (data) => {
            if (activeRoomRef.current?.roomId === data.roomId) setPartnerTyping(false);
        });

        socket.on('messagesRead', ({ roomId }) => {
            if (activeRoomRef.current?.roomId === roomId) {
                setDashMessages(prev => prev.map(m => ({ ...m, isRead: true })));
            }
        });

        socket.on('roomDeleted', ({ roomId }) => {
            if (activeRoomRef.current?.roomId === roomId) {
                setDashActiveRoom(null);
                setDashMessages([]);
                toast.success('Conversation removed');
            }
        });

        socket.on('bookingUpdate', (data) => {
            console.log('CRITICAL: Real-time booking update received via socket!', data);
            
            // Wait 500ms for DB consistency before fetching fresh data
            setTimeout(() => {
                console.log('TRIGGERING AUTO-REFRESH NOW...');
                fetchMyBookings(true);
                fetchProviderRequests(true);
                fetchStats(true);
                if (user?.role === 'admin') fetchAdminData(true);
            }, 500);
        });

        setDashSocket(socket);

        return () => {
            socket.disconnect();
        };
    }, [user?._id, user?.token, user?.role, fetchMyBookings, fetchProviderRequests, fetchStats, fetchAdminData]);

    // Update profile local states when user changes
    useEffect(() => {
        if (user) {
            setRole(user.role);
            if (user.role === 'provider') {
                setProviderStatus(user.providerDetails?.isApproved ? 'approved' : 'pending');
            } else {
                setProviderStatus('none');
            }
            setProfileAvatar(user.avatar || '');
            setProfileName(user.name || '');
            setProfilePhone(user.phone || '');
            setProfileUsername(user.username || '');
            setProviderTitle(user.providerDetails?.title || user.title || '');
            setProviderAbout(user.providerDetails?.about || user.about || '');
        }
    }, [user?._id, user?.role, user?.avatar, user?.name, user?.phone, user?.username, user?.providerDetails]);

    // Initial data fetch on mount/user change
    useEffect(() => {
        if (user?.token) {
            fetchMyBookings();
            if (user.role === 'provider') {
                fetchMyGigs();
                fetchProviderRequests();
                fetchStats();
            }
            if (user.role === 'admin') {
                fetchAdminData();
            }
        }
    }, [user?._id, user?.role, user?.token, fetchMyBookings, fetchMyGigs, fetchProviderRequests, fetchStats, fetchAdminData]);

    // Scroll chat to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [dashMessages]);

    // Fetch messages when dashboard room changes
    const fetchDashMessages = React.useCallback(async () => {
        if (!dashActiveRoom || !user) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get(`/api/messages/${dashActiveRoom.roomId}`, config);
            setDashMessages(data);
            // Join socket room
            if (dashSocket) dashSocket.emit('joinRoom', dashActiveRoom.roomId);
            // Mark as read
            await api.put(`/api/messages/${dashActiveRoom.roomId}/read`, {}, config);
        } catch (err) { console.error(err); }
    }, [dashActiveRoom?.roomId, dashSocket, user]);

    useEffect(() => {
        fetchDashMessages();
    }, [fetchDashMessages]);

    // Auto-refresh (polling fallback) every 30 seconds for chat
    useEffect(() => {
        if (!dashActiveRoom || !user) return;
        const interval = setInterval(fetchDashMessages, 30000);
        return () => clearInterval(interval);
    }, [fetchDashMessages, dashActiveRoom, user]);

    // The Dashboard now uses WebSockets for real-time updates (see bookingUpdate listener in setup useEffect).
    // The interval polling has been removed to optimize server performance.

    // Auto-open chat if provider in URL
    useEffect(() => {
        const provId = queryParams.get('provider');
        if (provId && activeTab === 'chat' && !dashActiveRoom) {
            const fetchAndOpen = async () => {
                try {
                    const { data: provUser } = await api.get(`/api/users/${provId}`);
                    const ids = [user._id, provId].sort();
                    const rId = `direct_${ids[0]}_${ids[1]}`;
                    setDashActiveRoom({
                        roomId: rId,
                        otherUser: provUser,
                        title: 'Inquiry',
                        type: 'Direct'
                    });
                } catch (err) { console.error(err); }
            };
            fetchAndOpen();
        }
    }, [activeTab, user?._id]);

    // Auto-open chat if room in URL
    useEffect(() => {
        const roomIdParam = queryParams.get('room');
        if (roomIdParam && activeTab === 'chat' && !dashActiveRoom) {
            const fetchRoomDetails = async () => {
                try {
                    if (roomIdParam.startsWith('direct_')) {
                        const parts = roomIdParam.split('_');
                        const otherId = parts[1] === user._id ? parts[2] : parts[1];
                        const { data: otherUser } = await api.get(`/api/users/${otherId}`);
                        setDashActiveRoom({
                            roomId: roomIdParam,
                            otherUser,
                            title: 'General Chat',
                            type: 'Direct'
                        });
                    } else {
                        // Likely a booking room
                        const { data: booking } = await api.get(`/api/bookings/${roomIdParam}`, {
                            headers: { Authorization: `Bearer ${user.token}` }
                        });
                        const otherUser = booking.user._id === user._id ? booking.provider : booking.user;
                        setDashActiveRoom({
                            roomId: roomIdParam,
                            otherUser,
                            title: `Booking #${roomIdParam.slice(-6).toUpperCase()}`,
                            type: 'Booking'
                        });
                    }
                } catch (err) { console.error("Failed to auto-open room", err); }
            };
            fetchRoomDetails();
        }
    }, [activeTab, user?._id]);

    const typingTimeoutRef = React.useRef(null);
    const handleTypeDash = (val) => {
        setDashMessageInput(val);
        if (!dashSocket || !dashActiveRoom) return;

        dashSocket.emit('typing', { roomId: dashActiveRoom.roomId });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            dashSocket.emit('stopTyping', { roomId: dashActiveRoom.roomId });
        }, 2000);
    };

    const handleSendMessageDash = (type = 'text', url = null) => {
        if ((type === 'text' && !dashMessageInput.trim()) || !dashActiveRoom || !user || !dashSocket) return;

        const tempId = Date.now().toString();
        const msgData = {
            _id: tempId,
            senderId: user._id,
            receiverId: dashActiveRoom.otherUser._id,
            roomId: dashActiveRoom.roomId,
            message: type === 'text' ? dashMessageInput : '',
            messageType: type,
            fileUrl: url,
            createdAt: new Date().toISOString(),
            optimistic: true,
            isRead: false
        };

        // Optimistic update
        setDashMessages(prev => [...prev, msgData]);

        dashSocket.emit('sendMessage', {
            senderId: user._id,
            receiverId: dashActiveRoom.otherUser._id,
            roomId: dashActiveRoom.roomId,
            message: type === 'text' ? dashMessageInput : '',
            messageType: type,
            fileUrl: url,
            tempId: tempId
        });

        if (type === 'text') setDashMessageInput('');
        dashSocket.emit('stopTyping', { roomId: dashActiveRoom.roomId });
    };

    const handleFileUploadDash = async (e) => {
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
            handleSendMessageDash(type, data.url);
        } catch (error) {
            toast.error('File upload failed');
        } finally {
            setUploadingFile(false);
        }
    };

    const startRecordingDash = async () => {
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
                    const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
                    const { data } = await api.post('/api/upload', formData, config);
                    handleSendMessageDash('voice', data.url);
                } catch (err) {
                    toast.error('Voice upload failed');
                } finally {
                    setUploadingFile(false);
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
        } catch (err) {
            toast.error('Microphone access denied');
        }
    };

    const stopRecordingDash = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    // Refresh fresh user data from server on mount to fix stale localStorage
    useEffect(() => {
        if (!user?.token) return;
        const refreshUser = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await api.get('/api/auth/profile', config);
                const fresh = { ...user, ...data, token: user.token };
                updateUserInfo(fresh);
                // Immediately apply to local form states
                if (data.providerDetails) {
                    setProviderTitle(data.providerDetails.title || '');
                    setProviderAbout(data.providerDetails.about || '');
                } else if (data.title || data.about) {
                    // Fallback to top-level if any
                    setProviderTitle(data.title || '');
                    setProviderAbout(data.about || '');
                }
                setProfileName(data.name || '');
                setProfilePhone(data.phone || '');
                setProfileUsername(data.username || '');
                setProfileAvatar(data.avatar || '');

                if (user.role === 'provider' && data.role === 'customer') {
                    toast('Professional status updated. Visit "Become a Seller" to re-apply.', { icon: 'ℹ️', duration: 5000 });
                }

                if (data.role !== role) {
                    setRole(data.role);
                }
            } catch (err) {
                // Silently fail — localStorage values will be used as fallback
            }
        };
        refreshUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Shared Reset logic for both Desktop and Mobile
    useEffect(() => {
        if (activeTab === 'services' && !editingGigId) {
            resetGigForm();
        }
    }, [activeTab]);





    const updateBookingStatus = async (bookingId, status, note = '', paymentMode = '') => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put(`/api/bookings/${bookingId}/status`, {
                status,
                revisionNote: note || revisionNote,
                paymentMode: paymentMode
            }, config);
            fetchMyBookings();
            fetchProviderRequests();
            toast.success(`Booking status updated to ${status.replace('_', ' ')}`);
            setBookingForRevision(null);
            setRevisionNote('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };



    /* ── Upload a single file to Cloudinary via backend ── */
    const uploadSingleFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const config = {
            headers: {
                Authorization: `Bearer ${user.token}`,
                'Content-Type': 'multipart/form-data',
            },
        };
        const { data } = await api.post('/api/upload', formData, config);
        return data.url;
    };

    /* ── Upload up to 5 gig thumbnail images ── */
    const handleGigImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        const remaining = 5 - gigImages.length;
        if (remaining <= 0) { toast.error('Maximum 5 images allowed'); return; }
        const toUpload = files.slice(0, remaining);
        setUploadingGigImages(true);
        try {
            const urls = await Promise.all(toUpload.map(uploadSingleFile));
            setGigImages(prev => [...prev, ...urls]);
        } catch (err) {
            console.error('Image upload failed', err);
            toast.error('One or more images failed to upload');
        } finally {
            setUploadingGigImages(false);
            e.target.value = '';
        }
    };

    const resetGigForm = () => {
        setGigStep(1);
        setGigTitle('');
        setGigCategory('');
        setGigCustomCategory('');
        setGigDesc('');
        setGigServicesIncluded('');
        setGigPrice('');
        setGigCity('');
        setGigState('');
        setGigAddress('');
        setGigZipCode('');
        setGigImages([]);
        setGigExperience('');
        setGigJobsCompleted('');
        setGigTargetGender('unisex');
        setEditingGigId(null);
        setGigPlans([
            { name: 'Basic', price: '', description: '', features: '', deliveryTime: '2 Days' },
            { name: 'Standard', price: '', description: '', features: '', deliveryTime: '5 Days' },
            { name: 'Premium', price: '', description: '', features: '', deliveryTime: '10 Days' }
        ]);
        setUsePlans(true);
        setShopAge('');
        setGigLat('');
        setGigLng('');
        setGigStateCode('');
        setGigCoveragePincodes('');
    };

    /* ── Upload profile avatar ── */
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingAvatar(true);
        try {
            const url = await uploadSingleFile(file);
            setProfileAvatar(url);
        } catch (err) {
            toast.error('Avatar upload failed');
        } finally {
            setUploadingAvatar(false);
            e.target.value = '';
        }
    };

    /* ── Save profile (name, phone, avatar) ── */
    const handleSaveProfile = async () => {
        if (profilePhone && (profilePhone.length !== 10 || !/^\d+$/.test(profilePhone))) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }
        setSavingProfile(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const cleanUsername = profileUsername.trim().toLowerCase().replace(/\s+/g, '_');
            const profileData = {
                name: profileName,
                phone: profilePhone,
                avatar: profileAvatar,
                username: cleanUsername
            };

            profileData.providerDetails = {
                title: providerTitle,
                about: providerAbout
            };

            const { data } = await api.put('/api/users/profile', profileData, config);

            // Sync local states directly from response first (prevent effect override)
            if (data.providerDetails) {
                setProviderTitle(data.providerDetails.title || providerTitle);
                setProviderAbout(data.providerDetails.about || providerAbout);
            }

            // Then persist to global store
            // Use the direct response from server to ensure perfect sync
            const updated = {
                ...user,
                ...data,
                token: user.token // preserve token
            };
            updateUserInfo(updated);
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save profile');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleApplyProvider = async () => {
        try {
            setIsSubmitting(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            const payload = {
                title: 'Professional Provider',
                about: 'Ready to provide high-quality local services.',
                experienceYears: 0,
                providerType: 'Services',
            };

            const { data } = await api.post('/api/auth/become-provider', payload, config);

            // Update local storage and store
            const updatedUser = { ...user, role: data.role, providerDetails: data.providerDetails };
            updateUserInfo(updatedUser);

            toast.success("Congratulations! You are now a professional.");
            setProviderStatus('approved');
            setRole('provider');
            setActiveTab('mygigs');
        } catch (error) {
            console.error("Error applying", error);
            toast.error(error.response?.data?.message || "Failed to submit application");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateGig = async () => {
        // Validation: For services, price is usually needed. For shops, it is optional.
        if (!gigTitle || !gigCategory || !gigDesc || (gigBusinessType === 'service' && !gigPrice && !usePlans)) {
            toast.error("Please fill all required fields (Title, Category, Description, and Price/Plans)");
            return;
        }

        try {
            setCreatingGig(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = {
                title: gigTitle,
                category: gigCategory === 'Other' ? gigCustomCategory : gigCategory,
                description: gigDesc,
                servicesIncluded: gigServicesIncluded ? gigServicesIncluded.split(',').map(s => s.trim()).filter(Boolean) : [],
                businessType: gigBusinessType,
                price: Number(gigPrice),
                priceType: gigPriceType,
                images: gigImages,
                location: {
                    city: gigCity || 'Remote',
                    state: gigState,
                    address: gigAddress,
                    zipCode: gigZipCode,
                    isRemote: !gigCity
                },
                geoCoordinates: {
                    type: 'Point',
                    coordinates: gigLat && gigLng ? [Number(gigLng), Number(gigLat)] : [0, 0]
                },
                plans: usePlans ? gigPlans.map(p => ({ ...p, price: Number(p.price) })) : [],
                experience: gigBusinessType === 'service' ? (Number(gigExperience) || 0) : 0,
                jobsCompleted: gigBusinessType === 'service' ? (Number(gigJobsCompleted) || 0) : 0,
                targetGender: gigTargetGender,
                isActive: true,
                shopDetails: {
                    openingTime: gigBusinessType === 'shop' ? shopOpeningTime : null,
                    closingTime: gigBusinessType === 'shop' ? shopClosingTime : null,
                    isHomeDelivery: shopIsHomeDelivery,
                    isHomeService: shopIsHomeService,
                    homeServiceFee: shopIsHomeService ? (Number(shopHomeServiceFee) || 0) : 0,
                    shopAge: gigBusinessType === 'shop' ? (Number(shopAge) || 0) : 0,
                    googleMapsLink: shopGoogleMapsLink
                },
                coveragePincodes: gigCoveragePincodes ? (Array.isArray(gigCoveragePincodes) ? gigCoveragePincodes : gigCoveragePincodes.split(',').map(s => s.trim()).filter(Boolean)) : []
            };

            if (editingGigId) {
                await api.put(`/api/services/${editingGigId}`, payload, config);
            } else {
                await api.post('/api/services', payload, config);
            }

            const createdOrUpdated = editingGigId ? "Gig updated successfully!" : "Gig published successfully!";
            toast.success(createdOrUpdated);

            // Reset form
            setGigCoveragePincodes('');
            setGigLat(null);
            setGigLng(null);
            setShopGoogleMapsLink('');
            setEditingGigId(null);
            setCreatingGig(false);
            fetchMyGigs();
            setActiveTab('mygigs');
        } catch (error) {
            console.error("Error saving gig", error);
            toast.error(error.response?.data?.message || "Failed to save gig");
            setCreatingGig(false);
        }
    };

    const handleDeleteGig = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/api/services/${id}`, config);
            toast.success("Gig deleted successfully");
            fetchMyGigs();
        } catch (error) {
            toast.error("Failed to delete gig");
        }
    };

    const handleEditClick = (gig) => {
        setEditingGigId(gig._id);

        // Populate all states
        setGigTitle(gig.title || '');
        setGigCategory(gig.category || '');
        setGigDesc(gig.description || '');
        setGigServicesIncluded(gig.servicesIncluded ? gig.servicesIncluded.join(', ') : '');
        setGigPrice(gig.price || '');
        setGigPriceType(gig.priceType || 'fixed');
        setGigBusinessType(gig.businessType || 'service');
        setGigImages(gig.images || []);

        if (gig.location) {
            const stName = gig.location.state || '';
            setGigState(stName);
            setGigCity(gig.location.city || '');
            setGigAddress(gig.location.address || '');
            setGigZipCode(gig.location.zipCode || gig.location.pincode || '');

            // Resolve State Code for dropdown
            const foundState = indianStates.find(s => s.name === stName);
            if (foundState) setGigStateCode(foundState.isoCode);
        }

        setGigExperience(gig.experience ?? '');
        setGigJobsCompleted(gig.jobsCompleted ?? '');
        setGigCoveragePincodes(gig.coveragePincodes || []);
        setGigTargetGender(gig.targetGender || 'unisex');

        if (gig.geoCoordinates?.coordinates) {
            setGigLat(gig.geoCoordinates?.coordinates?.[1] || null);
            setGigLng(gig.geoCoordinates?.coordinates?.[0] || null);
        }

        if (gig.shopDetails) {
            setShopOpeningTime(gig.shopDetails.openingTime || '09:00 AM');
            setShopClosingTime(gig.shopDetails.closingTime || '09:00 PM');
            setShopIsHomeDelivery(gig.shopDetails.isHomeDelivery || false);
            setShopIsHomeService(gig.shopDetails.isHomeService || false);
            setShopHomeServiceFee(gig.shopDetails.homeServiceFee ?? '');
            setShopAge(gig.shopDetails.shopAge ?? '');
            setShopGoogleMapsLink(gig.shopDetails.googleMapsLink || '');
        }

        if (gig.plans?.length > 0) {
            setUsePlans(true);
            setGigPlans(gig.plans);
        } else {
            setUsePlans(false);
        }

        setGigStep(1);
        setActiveTab('services');
    };

    return (
        <>
            <style>{`
                .dashboard-mobile-only { display: block; }
                .dashboard-desktop-only { display: none; }
                @media (min-width: 1025px) {
                    .dashboard-mobile-only { display: none; }
                    .dashboard-desktop-only { display: block; }
                }
            `}</style>

            <div className="dashboard-mobile-only">
                <DashboardMobile
                    user={user}
                    role={role}
                    stats={stats}
                    myGigs={myGigs}
                    withdrawals={withdrawals}
                    withdrawalsLoading={withdrawalsLoading}
                    fetchWithdrawals={fetchWithdrawals}
                    fetchStats={fetchStats}
                    gigsLoading={gigsLoading}
                    bookingRequests={bookingRequests}
                    providerStatus={providerStatus}
                    providerTitle={providerTitle}
                    providerAbout={providerAbout}
                    profileAvatar={profileAvatar}
                    getAvatar={getAvatar}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    gigSearchQuery={gigSearchQuery}
                    setGigSearchQuery={setGigSearchQuery}
                    gigTypeFilter={gigTypeFilter}
                    setGigTypeFilter={setGigTypeFilter}
                    navigate={navigate}
                    myBookings={myBookings}
                    bookingsLoading={bookingsLoading}
                    updateBookingStatus={updateBookingStatus}
                    profileName={profileName}
                    setProfileName={setProfileName}
                    profilePhone={profilePhone}
                    setProfilePhone={setProfilePhone}
                    profileUsername={profileUsername}
                    setProfileUsername={setProfileUsername}
                    providerTitleSetter={setProviderTitle}
                    providerAboutSetter={setProviderAbout}
                    handleSaveProfile={handleSaveProfile}
                    savingProfile={savingProfile}
                    handleAvatarUpload={handleAvatarUpload}
                    uploadingAvatar={uploadingAvatar}
                    handleEditClick={handleEditClick}
                    handleDeleteGig={handleDeleteGig}
                    handleApplyProvider={handleApplyProvider}
                    isSubmitting={isSubmitting}
                    gigStep={gigStep}
                    setGigStep={setGigStep}
                    gigBusinessType={gigBusinessType}
                    setGigBusinessType={setGigBusinessType}
                    gigTitle={gigTitle}
                    setGigTitle={setGigTitle}
                    gigCategory={gigCategory}
                    setGigCategory={setGigCategory}
                    gigCustomCategory={gigCustomCategory}
                    setGigCustomCategory={setGigCustomCategory}
                    gigExperience={gigExperience}
                    setGigExperience={setGigExperience}
                    gigJobsCompleted={gigJobsCompleted}
                    setGigJobsCompleted={setGigJobsCompleted}
                    shopAge={shopAge}
                    setShopAge={setShopAge}
                    gigDesc={gigDesc}
                    setGigDesc={setGigDesc}
                    gigServicesIncluded={gigServicesIncluded}
                    setGigServicesIncluded={setGigServicesIncluded}
                    usePlans={usePlans}
                    setUsePlans={setUsePlans}
                    gigPrice={gigPrice}
                    setGigPrice={setGigPrice}
                    gigPriceType={gigPriceType}
                    setGigPriceType={setGigPriceType}
                    gigPlans={gigPlans}
                    setGigPlans={setGigPlans}
                    shopOpeningTime={shopOpeningTime}
                    setShopOpeningTime={setShopOpeningTime}
                    shopClosingTime={shopClosingTime}
                    setShopClosingTime={setShopClosingTime}
                    shopIsHomeDelivery={shopIsHomeDelivery}
                    setShopIsHomeDelivery={setShopIsHomeDelivery}
                    shopIsHomeService={shopIsHomeService}
                    setShopIsHomeService={setShopIsHomeService}
                    shopHomeServiceFee={shopHomeServiceFee}
                    setShopHomeServiceFee={setShopHomeServiceFee}
                    gigLat={gigLat}
                    gigLng={gigLng}
                    setGigLat={setGigLat}
                    setGigLng={setGigLng}
                    shopGoogleMapsLink={shopGoogleMapsLink}
                    setShopGoogleMapsLink={setShopGoogleMapsLink}
                    gigStateCode={gigStateCode}
                    setGigStateCode={setGigStateCode}
                    gigState={gigState}
                    setGigState={setGigState}
                    gigCity={gigCity}
                    setGigCity={setGigCity}
                    gigAddress={gigAddress}
                    setGigAddress={setGigAddress}
                    gigZipCode={gigZipCode}
                    setGigZipCode={setGigZipCode}
                    gigCoveragePincodes={gigCoveragePincodes}
                    setGigCoveragePincodes={setGigCoveragePincodes}
                    gigImages={gigImages}
                    setGigImages={setGigImages}
                    handleGigImageUpload={handleGigImageUpload}
                    handleCreateGig={handleCreateGig}
                    creatingGig={creatingGig}
                    uploadingGigImages={uploadingGigImages}
                    indianStates={indianStates}
                    MapPicker={MapPicker}
                    editingGigId={editingGigId}
                    allUsers={allUsers}
                    usersLoading={usersLoading}
                    adminServices={adminServices}
                    servicesLoading={servicesLoading}
                    handleUpdateUserRole={handleUpdateUserRole}
                    handleToggleUserBan={handleToggleUserBan}
                    gigTargetGender={gigTargetGender}
                    setGigTargetGender={setGigTargetGender}
                    bookingForRevision={bookingForRevision}
                    setBookingForRevision={setBookingForRevision}
                    revisionNote={revisionNote}
                    setRevisionNote={setRevisionNote}
                    favorites={favorites}
                    favoritesLoading={favoritesLoading}
                    fetchFavorites={fetchFavorites}
                    showRevisions={showRevisions}
                    setShowRevisions={setShowRevisions}
                    bookingWithRevisions={bookingWithRevisions}
                    setBookingWithRevisions={setBookingWithRevisions}
                    isStatsLoading={isStatsLoading}
                />
            </div>

            <div className="dashboard-desktop-only">
                <DashboardDesktop
                    setActiveTab={setActiveTab}
                    activeTab={activeTab}
                    gigSearchQuery={gigSearchQuery}
                    setGigSearchQuery={setGigSearchQuery}
                    gigTypeFilter={gigTypeFilter}
                    setGigTypeFilter={setGigTypeFilter}
                    role={role}
                    user={user}
                    profileAvatar={profileAvatar}
                    profileName={profileName}
                    getAvatar={getAvatar}
                    uploadingAvatar={uploadingAvatar}
                    handleAvatarUpload={handleAvatarUpload}
                    providerTitle={providerTitle}
                    providerAbout={providerAbout}
                    myBookings={myBookings}
                    myGigs={myGigs}
                    stats={stats}
                    withdrawals={withdrawals}
                    withdrawalsLoading={withdrawalsLoading}
                    fetchWithdrawals={fetchWithdrawals}
                    fetchStats={fetchStats}
                    providerStatus={providerStatus}
                    handleApplyProvider={handleApplyProvider}
                    isSubmitting={isSubmitting}
                    bookingsLoading={bookingsLoading}
                    isStatsLoading={isStatsLoading}
                    updateBookingStatus={updateBookingStatus}
                    bookingForRevision={bookingForRevision}
                    setBookingForRevision={setBookingForRevision}
                    revisionNote={revisionNote}
                    setRevisionNote={setRevisionNote}
                    editingGigId={editingGigId}
                    gigStep={gigStep}
                    setGigStep={setGigStep}
                    gigBusinessType={gigBusinessType}
                    setGigBusinessType={setGigBusinessType}
                    gigTitle={gigTitle}
                    setGigTitle={setGigTitle}
                    gigCategory={gigCategory}
                    setGigCategory={setGigCategory}
                    gigCustomCategory={gigCustomCategory}
                    setGigCustomCategory={setGigCustomCategory}
                    gigExperience={gigExperience}
                    setGigExperience={setGigExperience}
                    gigJobsCompleted={gigJobsCompleted}
                    setGigJobsCompleted={setGigJobsCompleted}
                    shopAge={shopAge}
                    setShopAge={setShopAge}
                    gigDesc={gigDesc}
                    setGigDesc={setGigDesc}
                    gigServicesIncluded={gigServicesIncluded}
                    setGigServicesIncluded={setGigServicesIncluded}
                    usePlans={usePlans}
                    setUsePlans={setUsePlans}
                    gigPrice={gigPrice}
                    setGigPrice={setGigPrice}
                    gigPriceType={gigPriceType}
                    setGigPriceType={setGigPriceType}
                    gigPlans={gigPlans}
                    setGigPlans={setGigPlans}
                    shopOpeningTime={shopOpeningTime}
                    setShopOpeningTime={setShopOpeningTime}
                    shopClosingTime={shopClosingTime}
                    setShopClosingTime={setShopClosingTime}
                    shopIsHomeDelivery={shopIsHomeDelivery}
                    setShopIsHomeDelivery={setShopIsHomeDelivery}
                    shopIsHomeService={shopIsHomeService}
                    setShopIsHomeService={setShopIsHomeService}
                    shopHomeServiceFee={shopHomeServiceFee}
                    setShopHomeServiceFee={setShopHomeServiceFee}
                    gigLat={gigLat}
                    gigLng={gigLng}
                    setGigLat={setGigLat}
                    setGigLng={setGigLng}
                    shopGoogleMapsLink={shopGoogleMapsLink}
                    setShopGoogleMapsLink={setShopGoogleMapsLink}
                    gigStateCode={gigStateCode}
                    setGigStateCode={setGigStateCode}
                    gigState={gigState}
                    setGigState={setGigState}
                    gigCity={gigCity}
                    setGigCity={setGigCity}
                    gigAddress={gigAddress}
                    setGigAddress={setGigAddress}
                    gigZipCode={gigZipCode}
                    setGigZipCode={setGigZipCode}
                    gigCoveragePincodes={gigCoveragePincodes}
                    setGigCoveragePincodes={setGigCoveragePincodes}
                    gigImages={gigImages}
                    setGigImages={setGigImages}
                    handleGigImageUpload={handleGigImageUpload}
                    handleCreateGig={handleCreateGig}
                    creatingGig={creatingGig}
                    uploadingGigImages={uploadingGigImages}
                    gigsLoading={gigsLoading}
                    handleEditClick={handleEditClick}
                    handleDeleteGig={handleDeleteGig}
                    bookingRequests={bookingRequests}
                    navigate={navigate}
                    isMobile={isMobile}
                    dashActiveRoom={dashActiveRoom}
                    setDashActiveRoom={setDashActiveRoom}
                    dashMessages={dashMessages}
                    setDashMessages={setDashMessages}
                    fetchDashMessages={fetchDashMessages}
                    userLocation={userLocation}
                    dashMessageInput={dashMessageInput}
                    handleSendMessageDash={handleSendMessageDash}
                    handleTypeDash={handleTypeDash}
                    messagesEndRef={messagesEndRef}
                    partnerTyping={partnerTyping}
                    isRecording={isRecording}
                    recordingTime={recordingTime}
                    uploadingFile={uploadingFile}
                    handleFileUploadDash={handleFileUploadDash}
                    startRecordingDash={startRecordingDash}
                    stopRecordingDash={stopRecordingDash}
                    fileInputRef={fileInputRef}
                    profileUsername={profileUsername}
                    setProfileUsername={setProfileUsername}
                    profilePhone={profilePhone}
                    setProfilePhone={setProfilePhone}
                    profileNameState={profileName}
                    setProfileNameState={setProfileName}
                    setProviderTitle={setProviderTitle}
                    setProviderAbout={setProviderAbout}
                    indianStates={indianStates}
                    MapPicker={MapPicker}
                    styles={styles}
                    showRevisions={showRevisions}
                    setShowRevisions={setShowRevisions}
                    bookingWithRevisions={bookingWithRevisions}
                    setBookingWithRevisions={setBookingWithRevisions}
                    allUsers={allUsers}
                    usersLoading={usersLoading}
                    adminServices={adminServices}
                    servicesLoading={servicesLoading}
                    handleUpdateUserRole={handleUpdateUserRole}
                    handleToggleUserBan={handleToggleUserBan}
                    gigTargetGender={gigTargetGender}
                    setGigTargetGender={setGigTargetGender}
                    favorites={favorites}
                    favoritesLoading={favoritesLoading}
                    fetchFavorites={fetchFavorites}
                    handleSaveProfile={handleSaveProfile}
                    savingProfile={savingProfile}
                    handleLogout={handleLogout}
                    resetGigForm={resetGigForm}
                />
            </div>
        </>
    );
};

const styles = {
    grid: {
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        gap: '32px',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '500',
    }
};

export default Dashboard;
