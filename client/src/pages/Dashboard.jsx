import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { User, Briefcase, Calendar as CalendarIcon, Settings, MessageSquare, BarChart, Loader, Home, LogOut, Wallet, Inbox, Heart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import api, { API_URL } from '../utils/api';
import ChatList from '../components/ChatList';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../components/MapPicker';
import { State, City } from 'country-state-city';
import DashboardMobile from './DashboardMobile';
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

    const getAvatar = (userData) => {
        if (userData?.avatar && userData.avatar.startsWith('http')) return userData.avatar;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || 'U')}&background=ede9fe&color=4f46e5&size=120`;
    };

    // My Gigs state
    const [myGigs, setMyGigs] = useState([]);
    const [gigsLoading, setGigsLoading] = useState(false);

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
        chartData: []
    });
    const [isStatsLoading, setIsStatsLoading] = useState(false);

    const fetchStats = async () => {
        try {
            setIsStatsLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/api/bookings/provider/stats', config);
            setStats(data);
            setIsStatsLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard stats', error);
            setIsStatsLoading(false);
        }
    };

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

    const fetchAdminData = async () => {
        if (user?.role !== 'admin') return;
        try {
            setUsersLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const usersRes = await api.get('/api/admin/users', config);
            setAllUsers(usersRes.data);
            
            setServicesLoading(true);
            const servicesRes = await api.get('/api/admin/services', config);
            setAdminServices(servicesRes.data);
            
            setUsersLoading(false);
            setServicesLoading(false);
        } catch (error) {
            console.error('Error fetching admin data', error);
            setUsersLoading(false);
            setServicesLoading(false);
        }
    };

    const fetchFavorites = async () => {
        if (!user) return;
        setFavoritesLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/api/users/favorites', config);
            setFavorites(data);
        } catch (err) {
            console.error('Error fetching favorites', err);
        } finally {
            setFavoritesLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'favorites') {
            fetchFavorites();
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

    useEffect(() => {
        if (user) {
            setRole(user.role);
            if (user.role === 'provider') {
                setProviderStatus(user.providerDetails?.isApproved ? 'approved' : 'pending');
                fetchMyGigs();
                fetchProviderRequests();
                fetchStats();
            }
            setProfileAvatar(user.avatar || '');
            setProfileName(user.name || '');
            setProfilePhone(user.phone || '');
            setProfileUsername(user.username || '');
            setProviderTitle(user.providerDetails?.title || user.title || '');
            setProviderAbout(user.providerDetails?.about || user.about || '');
            fetchMyBookings();
            if (user.role === 'admin') {
                fetchAdminData();
            }

            // Setup Dashboard Socket for Real-time chat
            const socket = io(API_URL, {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });
            socket.emit('setup', user._id);
            setDashSocket(socket);

            socket.on('receiveMessage', (data) => {
                // Check if this message is for the currently viewed room
                const activeRoom = activeRoomRef.current;
                if (activeRoom && activeRoom.roomId === data.roomId) {
                    setDashMessages(prev => {
                        // If we have a tempId match, replace the optimistic message
                        if (data.tempId) {
                            const exists = prev.findIndex(m => m._id === data.tempId || m.tempId === data.tempId);
                            if (exists !== -1) {
                                const newMsgs = [...prev];
                                newMsgs[exists] = { ...data, optimistic: false };
                                return newMsgs;
                            }
                        }
                        // Fallback to ID check
                        if (prev.find(m => m._id === data._id)) return prev;
                        return [...prev, data];
                    });
                }
            });

            return () => {
                socket.off('receiveMessage');
                socket.disconnect();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id, user?.providerDetails?.title, user?.providerDetails?.about, user?.avatar, user?.name, user?.phone, user?.username]);

    // Scroll chat to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [dashMessages]);

    // Fetch messages when dashboard room changes
    useEffect(() => {
        const fetchDashMessages = async () => {
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
        };
        fetchDashMessages();
    }, [dashActiveRoom?.roomId, dashSocket]);

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

    const handleSendMessageDash = () => {
        if (!dashMessageInput.trim() || !dashActiveRoom || !user || !dashSocket) return;
        
        const tempId = Date.now().toString();
        const msgData = {
            _id: tempId,
            senderId: user._id,
            receiverId: dashActiveRoom.otherUser._id,
            roomId: dashActiveRoom.roomId,
            message: dashMessageInput,
            createdAt: new Date().toISOString(),
            optimistic: true
        };

        // Optimistic update
        setDashMessages(prev => [...prev, msgData]);

        dashSocket.emit('sendMessage', {
            senderId: user._id,
            receiverId: dashActiveRoom.otherUser._id,
            roomId: dashActiveRoom.roomId,
            message: dashMessageInput,
            tempId: tempId
        });
        
        setDashMessageInput('');
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

    const fetchMyBookings = async () => {
        if (!user) return;
        setBookingsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/api/bookings/mybookings', config);
            setMyBookings(data);
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        } finally {
            setBookingsLoading(false);
        }
    };

    const fetchProviderRequests = async () => {
        if (!user || user.role !== 'provider') return;
        setBookingsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/api/bookings/provider', config);
            setBookingRequests(data);
        } catch (err) {
            console.error('Failed to fetch provider requests', err);
        } finally {
            setBookingsLoading(false);
        }
    };

    const updateBookingStatus = async (bookingId, status, note = '') => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put(`/api/bookings/${bookingId}/status`, { status, revisionNote: note || revisionNote }, config);
            fetchMyBookings();
            fetchProviderRequests();
            toast.success(`Booking status updated to ${status.replace('_', ' ')}`);
            setBookingForRevision(null);
            setRevisionNote('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const fetchMyGigs = async () => {
        setGigsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/api/services/mine', config);
            setMyGigs(data);
        } catch (err) {
            console.error('Failed to fetch gigs', err);
        } finally {
            setGigsLoading(false);
        }
    };

    /* ── Upload a single file to Cloudinary via backend ── */
    const uploadSingleFile = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
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
                shopDetails: gigBusinessType === 'shop' ? {
                    openingTime: shopOpeningTime,
                    closingTime: shopClosingTime,
                    isHomeDelivery: shopIsHomeDelivery,
                    isHomeService: shopIsHomeService,
                    homeServiceFee: shopIsHomeService ? (Number(shopHomeServiceFee) || 0) : 0,
                    shopAge: Number(shopAge) || 0,
                    googleMapsLink: shopGoogleMapsLink
                } : null,
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



    const getTabStyle = (tabName) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        width: '100%',
        padding: '16px 32px',
        textAlign: 'left',
        backgroundColor: activeTab === tabName ? '#f1f5f9' : 'transparent',
        color: activeTab === tabName ? '#007bff' : '#475569',
        borderLeft: activeTab === tabName ? '4px solid #007bff' : '4px solid transparent',
        transition: 'all 0.2s',
        fontWeight: activeTab === tabName ? '700' : '500',
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        cursor: 'pointer',
        fontSize: '0.95rem'
    });

    const renderCustomerTabs = () => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button style={getTabStyle('home')} onClick={() => navigate('/')}>
                <Home size={22} strokeWidth={1.5} /> Home
            </button>
            <button style={getTabStyle('overview')} onClick={() => setActiveTab('overview')}>
                <BarChart size={22} strokeWidth={1.5} /> Overview
            </button>
            <button style={getTabStyle('bookings')} onClick={() => setActiveTab('bookings')}>
                <Inbox size={22} strokeWidth={1.5} /> My Bookings
            </button>
            <button style={getTabStyle('chat')} onClick={() => setActiveTab('chat')}>
                <MessageSquare size={22} strokeWidth={1.5} /> Messages
            </button>
            <button style={getTabStyle('profile')} onClick={() => setActiveTab('profile')}>
                <User size={22} strokeWidth={1.5} /> Profile
            </button>
            <button style={getTabStyle('become_provider')} onClick={() => setActiveTab('become_provider')}>
                <Briefcase size={22} strokeWidth={1.5} /> Become a Seller
            </button>
            <button style={getTabStyle('favorites')} onClick={() => setActiveTab('favorites')}>
                <Heart size={22} strokeWidth={1.5} /> Favorites
            </button>
            {user?.role === 'admin' && (
                <button style={getTabStyle('admin')} onClick={() => setActiveTab('admin')}>
                    <Settings size={22} strokeWidth={1.5} /> Admin Panel
                </button>
            )}
        </div>
    );

    const renderProviderTabs = () => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {providerStatus === 'pending' && (
                <div style={{ padding: '0 32px 16px', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                    Pending Approval
                </div>
            )}
            <button style={getTabStyle('home')} onClick={() => navigate('/')}>
                <Home size={22} strokeWidth={1.5} /> Home
            </button>
            <button style={getTabStyle('overview')} onClick={() => setActiveTab('overview')}>
                <BarChart size={22} strokeWidth={1.5} /> Overview
            </button>
            <button style={getTabStyle('mygigs')} onClick={() => setActiveTab('mygigs')}>
                <Briefcase size={22} strokeWidth={1.5} /> My Gigs
            </button>
            <button style={getTabStyle('services')} onClick={() => { resetGigForm(); setActiveTab('services'); }}>
                <Settings size={22} strokeWidth={1.5} /> Add New Gig
            </button>
            <button style={getTabStyle('profile')} onClick={() => setActiveTab('profile')}>
                <User size={22} strokeWidth={1.5} /> Profile
            </button>
            <button style={getTabStyle('requests')} onClick={() => setActiveTab('requests')}>
                <Inbox size={22} strokeWidth={1.5} /> Booking Requests
                {bookingRequests.filter(r => r.status === 'pending').length > 0 && (
                    <span style={{ marginLeft: 'auto', backgroundColor: '#ef4444', color: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '10px', fontWeight: '800' }}>
                        {bookingRequests.filter(r => r.status === 'pending').length}
                    </span>
                )}
            </button>
            {user?.role === 'provider' && (
                <button style={getTabStyle('payments')} onClick={() => setActiveTab('payments')}>
                    <Wallet size={22} strokeWidth={1.5} /> Payments
                </button>
            )}
            <button style={getTabStyle('bookings')} onClick={() => setActiveTab('bookings')}>
                <CalendarIcon size={22} strokeWidth={1.5} /> My Orders (Purchased)
            </button>
            <button style={getTabStyle('favorites')} onClick={() => setActiveTab('favorites')}>
                <Heart size={22} strokeWidth={1.5} /> Favorites
            </button>
            <button style={getTabStyle('chat')} onClick={() => setActiveTab('chat')}>
                <MessageSquare size={22} strokeWidth={1.5} /> Messages
            </button>
            {user?.role === 'admin' && (
                <button style={getTabStyle('admin')} onClick={() => setActiveTab('admin')}>
                    <Settings size={22} strokeWidth={1.5} /> Admin Panel
                </button>
            )}
        </div>
    );

    return (
        <>
            {/* ── Mobile Layout (< 768px) ── */}
            <style>{`
            .dashboard-mobile-only { display: block; }
            .dashboard-desktop-only { display: none; }
            @media (min-width: 768px) {
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
                    gigsLoading={gigsLoading}
                    bookingRequests={bookingRequests}
                    providerStatus={providerStatus}
                    providerTitle={providerTitle}
                    providerAbout={providerAbout}
                    profileAvatar={profileAvatar}
                    getAvatar={getAvatar}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
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
                />
            </div>

            {/* ── Desktop Layout (≥ 768px) ── */}
            <div className="dashboard-desktop-only">
                <div style={{ backgroundColor: '#faf8ff', minHeight: '100vh', padding: '0', overflowX: 'hidden' }}>
                    {/* Sidebar Navigation */}
                    <aside style={{
                        height: '100vh', width: '280px', position: 'fixed', left: 0, top: 0,
                        borderRight: '1px solid #e2e8f0', background: '#fff',
                        display: 'flex', flexDirection: 'column',
                        padding: '40px 0 32px', zIndex: 1000, boxShadow: '10px 0 50px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ marginBottom: '40px', padding: '0 32px' }}>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#003d9b', marginBottom: '4px', letterSpacing: '-0.02em' }}>SkillNear</h1>
                            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#003d9b', opacity: 0.6, fontWeight: '800' }}>Your Trusted Platform for Local Services</p>
                        </div>

                        <nav className="no-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                            {role === 'customer' ? renderCustomerTabs() : renderProviderTabs()}
                        </nav>

                        <div style={{ marginTop: 'auto', padding: '0 24px' }}>
                            <div style={{ paddingTop: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img
                                    src={getAvatar(user)}
                                    alt={user?.name}
                                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f1f5f9' }}
                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ede9fe&color=4f46e5`; }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{user?.name || 'User'}</span>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500', cursor: 'pointer' }} onClick={() => setActiveTab('profile')}>View Profile</span>
                                </div>
                                <div style={{ marginLeft: 'auto' }}>
                                    <button 
                                        onClick={handleLogout}
                                        style={{ background: '#fef2f2', border: 'none', color: '#ef4444', width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                        title="Logout"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Canvas */}
                    <main style={{ marginLeft: '280px', padding: '48px' }}>
                        <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <nav style={{ fontSize: '10px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                                    Account / {(() => {
                                        const map = {
                                            'overview': 'Personal',
                                            'mygigs': 'My Gigs',
                                            'become_provider': 'Become Provider',
                                            'chat': 'Messages',
                                            'requests': 'Booking Requests',
                                            'bookings': 'Orders',
                                            'profile': 'Account Settings',
                                            'services': 'Manage Services'
                                        };
                                        return map[activeTab] || activeTab.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                    })()}
                                </nav>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.025em' }}>
                                    {(() => {
                                        const map = {
                                            'overview': 'Public Profile',
                                            'mygigs': 'My Gigs',
                                            'become_provider': 'Become a Professional',
                                            'chat': 'Messaging Center',
                                            'requests': 'Incoming Orders',
                                            'bookings': 'My Bookings',
                                            'profile': 'Profile Information',
                                            'services': 'Service Listings'
                                        };
                                        return map[activeTab] || activeTab.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                    })()}
                                </h2>
                            </div>
                            {activeTab === 'mygigs' && (
                                <button className="btn-primary" style={{ borderRadius: '100px', padding: '10px 24px', fontSize: '0.875rem' }}
                                    onClick={() => setActiveTab('services')}>
                                    + New Gig
                                </button>
                            )}
                            {activeTab === 'profile' && (
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <button className="btn-outline" onClick={() => window.open(`/u/${profileUsername}`, '_blank')} style={{ borderRadius: '100px', padding: '10px 24px' }}>Preview Mode</button>
                                    <button className="btn-primary" onClick={handleSaveProfile} disabled={savingProfile} style={{ borderRadius: '100px', padding: '10px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {savingProfile ? <Loader size={16} className="animate-spin" /> : null}
                                        {savingProfile ? 'Saving…' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </header>

                        <DashboardDesktop
                            activeTab={activeTab}
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
                            providerStatus={providerStatus}
                            handleApplyProvider={handleApplyProvider}
                            isSubmitting={isSubmitting}
                            bookingsLoading={bookingsLoading}
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
                            gigTargetGender={gigTargetGender}
                            setGigTargetGender={setGigTargetGender}
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
                            userLocation={userLocation}
                            dashMessageInput={dashMessageInput}
                            setDashMessageInput={setDashMessageInput}
                            handleSendMessageDash={handleSendMessageDash}
                            messagesEndRef={messagesEndRef}
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
                            allUsers={allUsers}
                            usersLoading={usersLoading}
                            adminServices={adminServices}
                            servicesLoading={servicesLoading}
                            handleUpdateUserRole={handleUpdateUserRole}
                            handleToggleUserBan={handleToggleUserBan}
                            favorites={favorites}
                            favoritesLoading={favoritesLoading}
                            fetchFavorites={fetchFavorites}
                        />
                    </main>

                </div>
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
