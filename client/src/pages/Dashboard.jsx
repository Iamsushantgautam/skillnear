import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { User, Briefcase, Calendar as CalendarIcon, Settings, MessageSquare, BarChart, MapPin, Edit, Trash2, X, Plus, Inbox, Loader, Star, CheckCircle, Home, Send } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import api, { API_URL } from '../utils/api';
import ChatList from '../components/ChatList';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../components/MapPicker';
import { State, City } from 'country-state-city';
import DashboardMobile from './DashboardMobile';

const Dashboard = () => {
    const { user, updateUserInfo, userLocation } = useAuthStore();
    const navigate = useNavigate();
    const [role, setRole] = useState(user?.role || 'customer');
    const [activeTab, setActiveTab] = useState(user?.role === 'provider' ? 'mygigs' : 'profile');
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
    const [providerType, setProviderType] = useState('Services');
    const [providerTitle, setProviderTitle] = useState('');
    const [providerExp, setProviderExp] = useState('');
    const [providerAbout, setProviderAbout] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [providerStatus, setProviderStatus] = useState(user?.providerDetails?.isApproved ? 'approved' : user?.role === 'provider' ? 'pending' : 'none');

    // Detailed form states
    const [shopName, setShopName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [location, setLocation] = useState('');
    const [serviceName, setServiceName] = useState('');
    const [serviceProviderName, setServiceProviderName] = useState('');
    const [liveLocation, setLiveLocation] = useState('');
    const [shopDetails, setShopDetails] = useState('');
    const [shopAddress, setShopAddress] = useState('');

    // Uploaded URLs
    const [shopImages, setShopImages] = useState([]);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Expanded Gig Registration States (3-Page Flow)
    const [gigStep, setGigStep] = useState(1);
    const [gigBusinessType, setGigBusinessType] = useState('service'); // service or shop
    const [gigTitle, setGigTitle] = useState('');
    const [gigCategory, setGigCategory] = useState('');
    const [gigDesc, setGigDesc] = useState('');
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
    const [uploadingGigImages, setUploadingGigImages] = useState(false);
    const [creatingGig, setCreatingGig] = useState(false);

    // Edit Gig State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingGig, setEditingGig] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        category: '',
        description: '',
        price: '',
        priceType: 'fixed',
        city: ''
    });

    const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileName, setProfileName] = useState(user?.name || '');
    const [profilePhone, setProfilePhone] = useState(user?.phone || '');
    const [profileUsername, setProfileUsername] = useState(user?.username || '');
    const [showProfileEditor, setShowProfileEditor] = useState(false);

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
            setProviderTitle(user.providerDetails?.title || '');
            setProviderAbout(user.providerDetails?.about || '');
            fetchMyBookings();

            // Setup Dashboard Socket for Real-time chat
            const socket = io(API_URL);
            socket.emit('setup', user._id);
            setDashSocket(socket);

            socket.on('receiveMessage', (data) => {
                // Check if this message is for the currently viewed room
                const activeRoom = activeRoomRef.current;
                if (activeRoom && activeRoom.roomId === data.roomId) {
                    setDashMessages(prev => {
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
    }, [user?._id]);

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

    const handleSendMessageDash = () => {
        if (!dashMessageInput.trim() || !dashActiveRoom || !user || !dashSocket) return;
        const msg = {
            senderId: user._id,
            receiverId: dashActiveRoom.otherUser._id,
            roomId: dashActiveRoom.roomId,
            message: dashMessageInput
        };
        dashSocket.emit('sendMessage', msg);
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
                setProviderTitle(data.providerDetails?.title || '');
                setProviderAbout(data.providerDetails?.about || '');
                setProfileName(data.name || '');
                setProfilePhone(data.phone || '');
                setProfileUsername(data.username || '');
                setProfileAvatar(data.avatar || '');
            } catch (err) {
                // Silently fail — localStorage values will be used as fallback
            }
        };
        refreshUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

            if (user.role === 'provider') {
                profileData.providerDetails = {
                    title: providerTitle,
                    about: providerAbout
                };
            }

            const { data } = await api.put('/api/users/profile', profileData, config);

            // Sync local states directly from response first (prevent effect override)
            if (data.providerDetails) {
                setProviderTitle(data.providerDetails.title || providerTitle);
                setProviderAbout(data.providerDetails.about || providerAbout);
            }

            // Then persist to global store
            const updated = {
                ...user,
                name: data.name,
                phone: data.phone,
                avatar: data.avatar,
                username: data.username || cleanUsername,
                providerDetails: data.providerDetails || user.providerDetails
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
                toast.success("Gig updated successfully!");
            } else {
                await api.post('/api/services', payload, config);
                toast.success("Gig published successfully!");
            }

            // Reset form
            setGigStep(1);
            setGigTitle('');
            setGigCategory('');
            setGigDesc('');
            setGigPrice('');
            setGigCity('');
            setGigState('');
            setGigAddress('');
            setGigZipCode('');
            setGigImages([]);
            setGigExperience('');
            setGigJobsCompleted('');
            setGigCustomCategory('');
            setShopAge('');
            setShopIsHomeService(false);
            setShopHomeServiceFee('');
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

        setGigExperience(gig.experience || '');
        setGigJobsCompleted(gig.jobsCompleted || '');
        setGigCoveragePincodes(gig.coveragePincodes || []);

        if (gig.geoCoordinates?.coordinates) {
            setGigLng(gig.geoCoordinates.coordinates[0]);
            setGigLat(gig.geoCoordinates.coordinates[1]);
        }

        if (gig.shopDetails) {
            setShopOpeningTime(gig.shopDetails.openingTime || '09:00 AM');
            setShopClosingTime(gig.shopDetails.closingTime || '09:00 PM');
            setShopIsHomeDelivery(gig.shopDetails.isHomeDelivery || false);
            setShopIsHomeService(gig.shopDetails.isHomeService || false);
            setShopHomeServiceFee(gig.shopDetails.homeServiceFee || '');
            setShopAge(gig.shopDetails.shopAge || '');
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
            <button style={getTabStyle('services')} onClick={() => setActiveTab('services')}>
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
            <button style={getTabStyle('bookings')} onClick={() => setActiveTab('bookings')}>
                <CalendarIcon size={22} strokeWidth={1.5} /> My Orders (Purchased)
            </button>
            <button style={getTabStyle('chat')} onClick={() => setActiveTab('chat')}>
                <MessageSquare size={22} strokeWidth={1.5} /> Messages
            </button>
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
                            <button
                                onClick={() => setActiveTab('services')}
                                style={{
                                    width: '100%', background: 'linear-gradient(135deg, #003d9b 0%, #0052cc 100%)',
                                    color: '#fff', borderRadius: '14px', padding: '16px',
                                    fontWeight: '700', fontSize: '0.95rem', boxShadow: '0 10px 20px rgba(0, 61, 155, 0.2)',
                                    border: 'none', cursor: 'pointer', marginBottom: '32px', transition: 'all 0.3s'
                                }}
                            >
                                Post a Gig
                            </button>

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

                        <div>
                            {activeTab === 'overview' && role === 'provider' && (
                                <div id="account-settings-section" className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', maxWidth: '1200px' }}>
                                    {/* Bio & Avatar Card */}
                                    <section style={{ gridColumn: 'span 8', backgroundColor: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', gap: '32px', alignItems: 'flex-start', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: 0, right: 0, width: '128px', height: '128px', backgroundColor: 'rgba(0, 61, 155, 0.05)', borderRadius: '0 0 0 100%' }}></div>

                                        <div style={{ position: 'relative' }}>
                                            <div style={{ position: 'relative', width: '128px', height: '128px' }}>
                                                <img
                                                    src={getAvatar({ avatar: profileAvatar, name: profileName })}
                                                    alt={user?.name}
                                                    style={{ width: '128px', height: '128px', borderRadius: '24px', objectFit: 'cover', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName || 'U')}&background=ede9fe&color=4f46e5&size=120`; }}
                                                />
                                                {uploadingAvatar && (
                                                    <div style={{ position: 'absolute', inset: 0, borderRadius: '24px', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: '700' }}>…</div>
                                                )}
                                            </div>
                                            <label htmlFor="avatar-upload-direct" style={{ position: 'absolute', bottom: '-8px', right: '-8px', backgroundColor: '#fff', padding: '8px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Edit size={16} />
                                            </label>
                                            <input id="avatar-upload-direct" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{user?.name}</h3>
                                                <span style={{ backgroundColor: 'rgba(0, 61, 155, 0.1)', color: 'var(--primary)', fontSize: '10px', padding: '2px 8px', borderRadius: '100px', fontWeight: '800', textTransform: 'uppercase' }}>Top Rated</span>
                                                <button
                                                    onClick={() => setShowProfileEditor(true)}
                                                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                                                    title="Edit Profile"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                            </div>
                                            <p style={{ color: '#434654', fontWeight: '500', fontSize: '1.125rem', marginBottom: '16px' }}>{providerTitle || 'Professional Service Provider'}</p>
                                            <p style={{ color: '#737685', fontSize: '0.875rem', lineHeight: '1.6', maxWidth: '500px' }}>
                                                {providerAbout || 'Expert skills dedicated to delivering high-quality results. Open to custom projects and long-term collaborations.'}
                                            </p>

                                            <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
                                                <div>
                                                    <span style={{ display: 'block', fontSize: '12px', color: '#737685', fontWeight: '500' }}>Response Rate</span>
                                                    <span style={{ fontSize: '1.125rem', fontWeight: '700' }}>98%</span>
                                                </div>
                                                <div>
                                                    <span style={{ display: 'block', fontSize: '12px', color: '#737685', fontWeight: '500' }}>Experience</span>
                                                    <span style={{ fontSize: '1.125rem', fontWeight: '700' }}>{user?.providerDetails?.experienceYears || 0} Years</span>
                                                </div>
                                                <div>
                                                    <span style={{ display: 'block', fontSize: '12px', color: '#737685', fontWeight: '500' }}>Rating</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{ fontSize: '1.125rem', fontWeight: '700' }}>4.9</span>
                                                        <Star size={14} color="#f59e0b" fill="#f59e0b" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Quick Stats Card */}
                                    <section style={{ gridColumn: 'span 4', backgroundColor: '#e7e7f2', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div>
                                            <h4 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '24px' }}>Account Status</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Verification</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#22c55e', fontWeight: '700' }}>
                                                        <CheckCircle size={14} /> Verified
                                                    </span>
                                                </div>
                                                <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '14px', fontWeight: '600' }}>Active Gigs</span>
                                                        <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary)' }}>{myGigs.length}</span>
                                                    </div>
                                                    {myGigs.length > 0 ? (
                                                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            {myGigs.slice(0, 2).map((gig, idx) => (
                                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: gig.isApproved ? '#22c55e' : '#f59e0b' }}></div>
                                                                    <span style={{ fontSize: '12px', color: '#434654', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{gig.title}</span>
                                                                </div>
                                                            ))}
                                                            {myGigs.length > 2 && <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '700' }}>+ {myGigs.length - 2} more gigs</span>}
                                                        </div>
                                                    ) : (
                                                        <p style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>No gigs posted yet.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button style={{ width: '100%', marginTop: 'auto', padding: '12px', borderRadius: '100px', backgroundColor: '#191b23', color: '#fff', fontSize: '14px', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            Upgrade Plan <BarChart size={16} />
                                        </button>
                                    </section>

                                    {/* Quick Links / Actions */}
                                    <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                                        <div onClick={() => setActiveTab('mygigs')} className="group" style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.3s' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                                                <div style={{ padding: '12px', backgroundColor: '#f3f3fd', borderRadius: '16px', color: 'var(--primary)' }}>
                                                    <Briefcase size={24} />
                                                </div>
                                                <Plus size={20} color="#737685" />
                                            </div>
                                            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>My Gigs</h4>
                                            <p style={{ fontSize: '12px', color: '#737685' }}>Manage your active listings and draft new proposals.</p>
                                        </div>

                                        <div onClick={() => setActiveTab('chat')} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                                                <div style={{ padding: '12px', backgroundColor: '#f3f3fd', borderRadius: '16px', color: 'var(--tertiary-container)' }}>
                                                    <MessageSquare size={24} />
                                                </div>
                                                <div style={{ position: 'relative' }}>
                                                    <Plus size={20} color="#737685" />
                                                    <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
                                                </div>
                                            </div>
                                            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>Messages</h4>
                                            <p style={{ fontSize: '12px', color: '#737685' }}>Check ongoing client conversations and feedback.</p>
                                        </div>
                                    </div>

                                    {/* Earnings Snapshot */}
                                    <section style={{ gridColumn: 'span 12', backgroundColor: '#f3f3fd', borderRadius: '32px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
                                        <div style={{ maxWidth: '400px' }}>
                                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px' }}>Earnings Snapshot</h3>
                                            <p style={{ fontSize: '14px', color: '#737685', marginBottom: '24px' }}>Your professional performance has increased by <span style={{ color: 'var(--primary)', fontWeight: '700' }}>12.4%</span> this month. Keep it up!</p>
                                            <div style={{ display: 'flex', gap: '16px' }}>
                                                <div style={{ backgroundColor: '#fff', padding: '12px 20px', borderRadius: '16px' }}>
                                                    <p style={{ fontSize: '10px', fontWeight: '700', color: '#737685', textTransform: 'uppercase', marginBottom: '4px' }}>Total Earned</p>
                                                    <p style={{ fontSize: '1.25rem', fontWeight: '900' }}>₹{stats.totalEarnings.toLocaleString()}</p>
                                                </div>
                                                <div style={{ backgroundColor: '#fff', padding: '12px 20px', borderRadius: '16px' }}>
                                                    <p style={{ fontSize: '10px', fontWeight: '700', color: '#737685', textTransform: 'uppercase', marginBottom: '4px' }}>Pending</p>
                                                    <p style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary)' }}>₹{Math.floor(stats.totalEarnings * 0.2).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ width: '50%', height: '160px', background: 'rgba(255,255,255,0.5)', borderRadius: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '24px', gap: '8px', border: '1px solid #fff', backdropFilter: 'blur(4px)' }}>
                                            {stats.chartData.length > 0 ? stats.chartData.map((d, i) => (
                                                <div key={i} style={{ flex: 1, backgroundColor: 'rgba(0, 61, 155, 0.1)', borderRadius: '8px 8px 0 0', height: `${Math.max(20, (d.earnings / (Math.max(...stats.chartData.map(x => x.earnings)) || 1)) * 100)}%`, transition: 'all 0.3s' }}></div>
                                            )) : [40, 60, 30, 90, 50, 75].map((h, i) => (
                                                <div key={i} style={{ flex: 1, backgroundColor: i === 5 ? 'var(--primary)' : 'rgba(0, 61, 155, 0.1)', borderRadius: '8px 8px 0 0', height: `${h}%` }}></div>
                                            ))}
                                        </div>
                                    </section>

                                </div>
                            )}

                            {activeTab === 'become_provider' && (
                                <div className="animate-fade-in" style={{ paddingTop: '20px' }}>
                                    {providerStatus === 'pending' ? (
                                        <div style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '16px', borderRadius: '8px' }}>
                                            Your application is currently pending admin approval. We will notify you once approved.
                                        </div>
                                    ) : providerStatus === 'approved' ? (
                                        <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '16px', borderRadius: '8px' }}>
                                            Congratulations! You are an approved provider. Go to "Manage Services" to add items.
                                        </div>
                                    ) : (
                                        <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                                            <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                                                <div style={{ width: '80px', height: '80px', backgroundColor: '#ede9fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                                                    <Briefcase size={40} />
                                                </div>
                                                <h2 className="text-h2" style={{ marginBottom: '12px' }}>Join the Network</h2>
                                                <p className="text-body" style={{ marginBottom: '32px', color: 'var(--text-muted)' }}>
                                                    Start offering your skills to thousands of local customers. Auto-approval enabled!
                                                </p>

                                                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                                                    <button className="btn-primary" onClick={handleApplyProvider} disabled={isSubmitting} style={{ height: '52px', padding: '0 40px', fontSize: '1.1rem' }}>
                                                        {isSubmitting ? <span className="flex-center" style={{ gap: 10 }}><Loader size={20} className="spin" /> Activating...</span> : 'Activate Professional Account'}
                                                    </button>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '16px' }}> ⚡ Instant activation. Start listing your gigs immediately. </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'bookings' && (
                                <div className="animate-fade-in">

                                    {bookingsLoading ? (
                                        <p>Loading bookings...</p>
                                    ) : myBookings.length === 0 ? (
                                        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>You haven't booked any services yet.</p>
                                    ) : (
                                        myBookings.map(b => (
                                            <div key={b._id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px' }}>
                                                <div className="flex-between" style={{ marginBottom: '12px' }}>
                                                    <span style={{ fontWeight: '600' }}>{b.service?.title}</span>
                                                    <span style={{
                                                        color: ['pending', 'in_progress', 'revision_requested'].includes(b.status) ? '#f59e0b' : ['confirmed', 'delivered'].includes(b.status) ? '#2563eb' : b.status === 'completed' ? '#059669' : '#dc2626',
                                                        backgroundColor: ['pending', 'in_progress', 'revision_requested'].includes(b.status) ? '#fef3c7' : ['confirmed', 'delivered'].includes(b.status) ? '#dbeafe' : b.status === 'completed' ? '#d1fae5' : '#fee2e2',
                                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase'
                                                    }}>{b.status.replace('_', ' ')}</span>
                                                </div>
                                                <div className="text-body" style={{ marginBottom: '4px' }}><CalendarIcon size={14} style={{ display: 'inline', marginRight: '8px' }} /> {new Date(b.date).toLocaleDateString()} | {b.timeSlot}</div>
                                                <div className="text-body" style={{ marginBottom: '12px' }}><MapPin size={14} style={{ display: 'inline', marginRight: '8px' }} /> {b.address?.street}, {b.address?.city}</div>
                                                <div className="flex-between" style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                                                    <span className="text-small" style={{ color: 'var(--text-muted)' }}>Provider: {b.provider?.name}</span>
                                                    <span style={{ fontWeight: 'bold' }}>₹{b.totalPrice}</span>
                                                </div>
                                                {b.status === 'delivered' && (
                                                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button onClick={() => updateBookingStatus(b._id, 'completed')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', flex: 1 }}>Accept & Mark Complete</button>
                                                            <button onClick={() => setBookingForRevision(b._id)} className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', flex: 1, borderColor: '#f59e0b', color: '#f59e0b' }}>Request Revision</button>
                                                        </div>

                                                        {bookingForRevision === b._id && (
                                                            <div className="animate-fade-in" style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                                                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: '#92400e' }}>Revision Details:</label>
                                                                <textarea
                                                                    className="input-field"
                                                                    placeholder="What needs to be changed?"
                                                                    value={revisionNote}
                                                                    onChange={(e) => setRevisionNote(e.target.value)}
                                                                    style={{ fontSize: '0.85rem', marginBottom: '8px' }}
                                                                />
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    <button onClick={() => updateBookingStatus(b._id, 'revision_requested')} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#f59e0b' }}>Submit Revision Request</button>
                                                                    <button onClick={() => setBookingForRevision(null)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Cancel</button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {b.revisions && b.revisions.length > 0 && (
                                                    <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#fffbeb', borderRadius: '8px', fontSize: '0.85rem' }}>
                                                        <strong>Revision Note:</strong> {b.revisions[b.revisions.length - 1].note}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'services' && (
                                <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
                                    <div className="flex-between" style={{ marginBottom: '24px' }}>
                                        <div>
                                            <h2 className="text-h2">
                                                {editingGigId ? 'Update Your Gig' : 'Publish Your Expertise'}
                                            </h2>
                                            <p className="text-body" style={{ color: 'var(--text-muted)' }}>
                                                Step {gigStep} of 3: {gigStep === 1 ? 'General Details' : gigStep === 2 ? 'Pricing & Plans' : 'Location & Media'}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {[1, 2, 3].map(s => (
                                                <div key={s} style={{
                                                    width: '32px', height: '32px', borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    backgroundColor: gigStep === s ? 'var(--primary)' : gigStep > s ? '#d1fae5' : '#f3f4f6',
                                                    color: gigStep === s ? '#fff' : gigStep > s ? '#059669' : 'var(--text-muted)',
                                                    fontWeight: '700', fontSize: '0.85rem', transition: 'all 0.3s ease'
                                                }}>
                                                    {gigStep > s ? '✓' : s}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="card" style={{ padding: '32px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                                        {gigStep === 1 && (
                                            <div className="animate-fade-in">
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                                                    <div
                                                        onClick={() => setGigBusinessType('service')}
                                                        style={{
                                                            padding: '24px', borderRadius: '12px', border: `2px solid ${gigBusinessType === 'service' ? 'var(--primary)' : 'var(--border-color)'}`,
                                                            cursor: 'pointer', backgroundColor: gigBusinessType === 'service' ? '#f5f3ff' : 'transparent', textAlign: 'center', transition: 'all 0.3s'
                                                        }}>
                                                        <Briefcase size={32} color={gigBusinessType === 'service' ? 'var(--primary)' : '#94a3b8'} style={{ marginBottom: '12px' }} />
                                                        <div style={{ fontWeight: '700', color: gigBusinessType === 'service' ? 'var(--primary)' : 'var(--text-main)' }}>Offering a Service</div>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Gigs, consulting, or local home services</p>
                                                    </div>
                                                    <div
                                                        onClick={() => setGigBusinessType('shop')}
                                                        style={{
                                                            padding: '24px', borderRadius: '12px', border: `2px solid ${gigBusinessType === 'shop' ? 'var(--primary)' : 'var(--border-color)'}`,
                                                            cursor: 'pointer', backgroundColor: gigBusinessType === 'shop' ? '#f5f3ff' : 'transparent', textAlign: 'center', transition: 'all 0.3s'
                                                        }}>
                                                        <MapPin size={32} color={gigBusinessType === 'shop' ? 'var(--primary)' : '#94a3b8'} style={{ marginBottom: '12px' }} />
                                                        <div style={{ fontWeight: '700', color: gigBusinessType === 'shop' ? 'var(--primary)' : 'var(--text-main)' }}>Registering a Shop</div>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Physical outlets, local vendor spaces</p>
                                                    </div>
                                                </div>

                                                <div style={styles.formGroup}>
                                                    <label style={styles.label}>{gigBusinessType === 'service' ? 'Gig Title' : 'Shop Name'}</label>
                                                    <input type="text" className="input-field" placeholder={gigBusinessType === 'service' ? "e.g. I will fix your technical plumbing issues" : "e.g. Sharma Grocery Store"} value={gigTitle} onChange={e => setGigTitle(e.target.value)} />
                                                </div>

                                                <div style={styles.formGroup}>
                                                    <label style={styles.label}>Category</label>
                                                    <select className="input-field" value={gigCategory} onChange={e => setGigCategory(e.target.value)}>
                                                        <option value="" disabled>-- Select Category --</option>
                                                        <option value="Salon">Salon</option>
                                                        <option value="Carpenters">Carpenters</option>
                                                        <option value="Plumbers">Plumbers</option>
                                                        <option value="Electricians">Electricians</option>
                                                        <option value="Cleaning">Cleaning</option>
                                                        <option value="AC Repair">AC Repair</option>
                                                        <option value="Painters">Painters</option>
                                                        <option value="Tutors">Tutors</option>
                                                        <option value="Groceries">Groceries</option>
                                                        <option value="Electronics">Electronics</option>
                                                        <option value="Other">Other (Add Custom)</option>
                                                    </select>
                                                </div>

                                                {gigCategory === 'Other' && (
                                                    <div style={styles.formGroup} className="animate-fade-in">
                                                        <label style={styles.label}>Custom Category Name</label>
                                                        <input type="text" className="input-field" placeholder="e.g. Pet Grooming" value={gigCustomCategory} onChange={e => setGigCustomCategory(e.target.value)} />
                                                    </div>
                                                )}

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                    {gigBusinessType === 'service' ? (
                                                        <>
                                                            <div style={styles.formGroup}>
                                                                <label style={styles.label}>Years of Experience</label>
                                                                <input type="number" className="input-field" placeholder="e.g. 5" value={gigExperience} onChange={e => setGigExperience(e.target.value)} />
                                                            </div>
                                                            <div style={styles.formGroup}>
                                                                <label style={styles.label}>Total Jobs Done</label>
                                                                <input type="number" className="input-field" placeholder="e.g. 150" value={gigJobsCompleted} onChange={e => setGigJobsCompleted(e.target.value)} />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                                                            <label style={styles.label}>How old is your Shop? (Years)</label>
                                                            <input type="number" className="input-field" placeholder="e.g. 10" value={shopAge} onChange={e => setShopAge(e.target.value)} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={styles.formGroup}>
                                                    <label style={styles.label}>Detailed Description</label>
                                                    <textarea className="input-field" rows="6" placeholder="Describe what you offer in detail..." value={gigDesc} onChange={e => setGigDesc(e.target.value)}></textarea>
                                                </div>
                                            </div>
                                        )}

                                        {gigStep === 2 && (
                                            <div className="animate-fade-in">
                                                <div className="flex-between" style={{ marginBottom: '20px' }}>
                                                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>Pricing & Packages {gigBusinessType === 'shop' && <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.9rem' }}>(Optional for Shops)</span>}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span className="text-small" style={{ color: 'var(--text-muted)' }}>Use 3 Tier Plans?</span>
                                                        <input type="checkbox" checked={usePlans} onChange={e => setUsePlans(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                                                    </div>
                                                </div>

                                                {!usePlans ? (
                                                    <div style={{ display: 'flex', gap: '16px', backgroundColor: '#f9fafb', padding: '24px', borderRadius: '12px' }}>
                                                        <div style={{ ...styles.formGroup, flex: 1 }}>
                                                            <label style={styles.label}>Standard Price (₹) {gigBusinessType === 'shop' && '(Optional)'}</label>
                                                            <input type="number" className="input-field" placeholder="0.00" value={gigPrice} onChange={e => setGigPrice(e.target.value)} />
                                                        </div>
                                                        <div style={{ ...styles.formGroup, flex: 1 }}>
                                                            <label style={styles.label}>Billing Type</label>
                                                            <select className="input-field" value={gigPriceType} onChange={e => setGigPriceType(e.target.value)}>
                                                                <option value="fixed">Fixed Price</option>
                                                                <option value="hourly">Hourly Rate</option>
                                                                <option value="starting_at">Starting At</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                                        {gigPlans.map((plan, idx) => (
                                                            <div key={idx} style={{
                                                                border: '1.5px solid var(--border-color)', borderRadius: '12px', padding: '16px',
                                                                backgroundColor: idx === 1 ? '#f5f3ff' : '#fff', borderColor: idx === 1 ? 'var(--primary)' : 'var(--border-color)'
                                                            }}>
                                                                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: idx === 1 ? 'var(--primary)' : 'var(--text-main)', marginBottom: '12px', textAlign: 'center' }}>
                                                                    {idx === 0 ? 'BASIC' : idx === 1 ? 'STANDARD' : 'PREMIUM'}
                                                                </div>
                                                                <div style={styles.formGroup}>
                                                                    <input type="number" className="input-field" placeholder={`Price (₹) ${gigBusinessType === 'shop' ? '(Optional)' : ''}`} value={plan.price} onChange={e => {
                                                                        const np = [...gigPlans]; np[idx].price = e.target.value; setGigPlans(np);
                                                                    }} />
                                                                </div>
                                                                <div style={styles.formGroup}>
                                                                    <textarea className="input-field" rows="3" placeholder={`Description ${gigBusinessType === 'shop' ? '(Optional)' : ''}...`} value={plan.description} onChange={e => {
                                                                        const np = [...gigPlans]; np[idx].description = e.target.value; setGigPlans(np);
                                                                    }} style={{ fontSize: '0.8rem' }} />
                                                                </div>
                                                                <div style={styles.formGroup}>
                                                                    <input type="text" className="input-field" placeholder="Features (comma separated)" value={plan.features} onChange={e => {
                                                                        const np = [...gigPlans]; np[idx].features = e.target.value; setGigPlans(np);
                                                                    }} style={{ fontSize: '0.8rem' }} />
                                                                </div>
                                                                <div style={styles.formGroup}>
                                                                    <select className="input-field" value={plan.deliveryTime} onChange={e => {
                                                                        const np = [...gigPlans]; np[idx].deliveryTime = e.target.value; setGigPlans(np);
                                                                    }} style={{ fontSize: '0.8rem' }}>
                                                                        <option>1 Day Delivery</option>
                                                                        <option>2 Days Delivery</option>
                                                                        <option>5 Days Delivery</option>
                                                                        <option>10 Days Delivery</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {gigBusinessType === 'shop' && (
                                                    <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#f0f9ff', borderRadius: '12px' }}>
                                                        <div style={{ fontWeight: '700', marginBottom: '16px', color: '#0369a1' }}>Shop Specific Details</div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                            <div style={styles.formGroup}>
                                                                <label style={styles.label}>Opening Time</label>
                                                                <input type="time" className="input-field" value={shopOpeningTime} onChange={e => setShopOpeningTime(e.target.value)} />
                                                            </div>
                                                            <div style={styles.formGroup}>
                                                                <label style={styles.label}>Closing Time</label>
                                                                <input type="time" className="input-field" value={shopClosingTime} onChange={e => setShopClosingTime(e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                                                <input type="checkbox" checked={shopIsHomeDelivery} onChange={e => setShopIsHomeDelivery(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                                                                <span className="text-small" style={{ fontWeight: 500 }}>Provide Home Delivery?</span>
                                                            </label>
                                                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                                                <input type="checkbox" checked={shopIsHomeService} onChange={e => setShopIsHomeService(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                                                                <span className="text-small" style={{ fontWeight: 500 }}>Provide Home Services? (Technician visits client)</span>
                                                            </label>
                                                            {shopIsHomeService && (
                                                                <div className="animate-fade-in" style={{ paddingLeft: '26px', marginTop: '-4px' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                        <span className="text-small" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Visiting/Service Fee (₹):</span>
                                                                        <input type="number" className="input-field" style={{ padding: '4px 8px', fontSize: '0.85rem', width: '120px' }} placeholder="e.g. 150" value={shopHomeServiceFee} onChange={e => setShopHomeServiceFee(e.target.value)} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {gigStep === 3 && (
                                            <div className="animate-fade-in">
                                                <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '20px' }}>Location & Search Visibility</div>

                                                {gigBusinessType === 'shop' && (
                                                    <div style={styles.formGroup}>
                                                        <label style={styles.label}>Business Location on Map</label>
                                                        <MapPicker lat={gigLat} lng={gigLng} onChange={({ lat, lng }) => { setGigLat(lat); setGigLng(lng); }} />
                                                    </div>
                                                )}

                                                {gigBusinessType === 'shop' && (
                                                    <div style={styles.formGroup}>
                                                        <label style={styles.label}>Google Maps Shop Link (Optional but Recommended)</label>
                                                        <input
                                                            type="url"
                                                            className="input-field"
                                                            placeholder="https://maps.app.goo.gl/..."
                                                            value={shopGoogleMapsLink}
                                                            onChange={e => setShopGoogleMapsLink(e.target.value)}
                                                        />
                                                        <div style={{ marginTop: '8px', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                                            <p style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>How to get your shop link:</p>
                                                            <ol style={{ fontSize: '0.75rem', paddingLeft: '16px', margin: 0, color: '#64748b' }}>
                                                                <li>Open Google Maps and find your shop.</li>
                                                                <li>Click the <strong>'Share'</strong> button.</li>
                                                                <li>Choose <strong>'Copy Link'</strong> and paste it here.</li>
                                                            </ol>
                                                        </div>
                                                    </div>
                                                )}

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                    <div style={styles.formGroup}>
                                                        <label style={styles.label}>State</label>
                                                        <select
                                                            className="input-field"
                                                            value={gigStateCode}
                                                            onChange={e => {
                                                                const stateCode = e.target.value;
                                                                const stateObj = indianStates.find(s => s.isoCode === stateCode);
                                                                setGigStateCode(stateCode);
                                                                setGigState(stateObj ? stateObj.name : '');
                                                                setGigCity('');
                                                            }}
                                                        >
                                                            <option value="">Select State</option>
                                                            {indianStates.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div style={styles.formGroup}>
                                                        <label style={styles.label}>City</label>
                                                        <select className="input-field" value={gigCity} onChange={e => setGigCity(e.target.value)} disabled={!gigStateCode}>
                                                            <option value="">Select City</option>
                                                            {gigStateCode && City.getCitiesOfState('IN', gigStateCode).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                                                    <div style={styles.formGroup}>
                                                        <label style={styles.label}>Physical Address / Street</label>
                                                        <input type="text" className="input-field" placeholder="Full address" value={gigAddress} onChange={e => setGigAddress(e.target.value)} />
                                                    </div>
                                                    <div style={styles.formGroup}>
                                                        <label style={styles.label}>Pincode</label>
                                                        <input type="text" className="input-field" placeholder="e.g. 226001" value={gigZipCode} onChange={e => setGigZipCode(e.target.value)} />
                                                    </div>
                                                </div>

                                                <div style={styles.formGroup}>
                                                    <label style={styles.label}>Service Coverage Areas (Pincodes)</label>
                                                    <input type="text" className="input-field" placeholder="e.g. 110001, 110002, 110045" value={gigCoveragePincodes} onChange={e => setGigCoveragePincodes(e.target.value)} />
                                                    <p className="text-small" style={{ marginTop: '6px', color: 'var(--text-muted)' }}>Enter multiple pincodes separated by commas. Leave empty for city-wide coverage.</p>
                                                </div>

                                                <div style={{ marginTop: '24px' }}>
                                                    <label style={styles.label}>Gig Gallery (Add up to 5 photos)</label>
                                                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: '12px' }}>
                                                        {gigImages.map((url, i) => (
                                                            <div key={i} style={{ position: 'relative' }}>
                                                                <img 
                                                                    src={url} 
                                                                    alt={`gig-${i}`} 
                                                                    style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #e2e8f0' }} 
                                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/100x80?text=Service'; }}
                                                                />
                                                                <button onClick={() => setGigImages(prev => prev.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: -5, right: -5, width: 22, height: 22, background: '#ef4444', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>×</button>
                                                            </div>
                                                        ))}
                                                        {gigImages.length < 5 && (
                                                            <label style={{ width: 100, height: 80, border: '2px dashed #cbd5e1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}>
                                                                <Plus size={24} />
                                                                <input type="file" multiple accept="image/*" onChange={handleGigImageUpload} style={{ display: 'none' }} />
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ marginTop: 'auto', paddingTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                                            <button
                                                onClick={() => setGigStep(prev => Math.max(1, prev - 1))}
                                                className="btn-outline"
                                                disabled={gigStep === 1}
                                                style={{ visibility: gigStep === 1 ? 'hidden' : 'visible' }}
                                            >Back</button>

                                            {gigStep < 3 ? (
                                                <button onClick={() => setGigStep(prev => prev + 1)} className="btn-primary" style={{ padding: '12px 32px' }}>Next Step</button>
                                            ) : (
                                                <button onClick={handleCreateGig} disabled={creatingGig || uploadingGigImages} className="btn-primary" style={{ padding: '12px 48px', backgroundColor: '#059669' }}>
                                                    {creatingGig ? 'Saving...' : (editingGigId ? 'Save Changes' : 'Complete & Publish Gig')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── MY GIGS TAB ── */}
                            {activeTab === 'mygigs' && (
                                <div className="animate-fade-in">
                                    {/* Status legend */}
                                    <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                                        {[['🟡 Pending', '#fef3c7', '#92400e'], ['🟢 Live', '#d1fae5', '#065f46'], ['🔴 Rejected', '#fee2e2', '#991b1b']].map(([l, bg, c]) => (
                                            <span key={l} style={{ backgroundColor: bg, color: c, padding: '3px 12px', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 600 }}>{l}</span>
                                        ))}
                                    </div>

                                    {gigsLoading ? (
                                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading your gigs…</div>
                                    ) : myGigs.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '60px 40px', border: '2px dashed var(--border-color)', borderRadius: 12 }}>
                                            <Briefcase size={40} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.4 }} />
                                            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                                                {providerStatus === 'pending'
                                                    ? 'Your provider account is pending approval. You can start submitting gigs — they will go live once you are approved.'
                                                    : 'You haven\'t created any gigs yet.'}
                                            </p>
                                            <button className="btn-primary" onClick={() => setActiveTab('services')}>Create First Gig</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                            {myGigs.map(gig => {
                                                const isLive = gig.isApproved && gig.isActive;
                                                const isPending = !gig.isApproved;
                                                const isRejected = !gig.isApproved && !gig.isActive && gig.updatedAt !== gig.createdAt;

                                                let statusLabel = isPending ? '⏳ Pending Review' : isLive ? '✅ Live' : '❌ Rejected';
                                                let statusBg = isPending ? '#fef3c7' : isLive ? '#d1fae5' : '#fee2e2';
                                                let statusColor = isPending ? '#92400e' : isLive ? '#065f46' : '#991b1b';

                                                return (
                                                    <div key={gig._id} style={{
                                                        border: `1.5px solid ${isPending ? '#fde68a' : isLive ? '#6ee7b7' : '#fca5a5'}`,
                                                        borderRadius: 12, backgroundColor: '#fff',
                                                        padding: '16px 20px',
                                                        display: 'flex', gap: 16, alignItems: 'flex-start',
                                                    }}>
                                                        {/* Thumbnail */}
                                                        <img
                                                            src={gig.images?.[0] || (user?.avatar && user.avatar.startsWith('http') ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || gig.title)}&background=ede9fe&color=4f46e5&size=60`)}
                                                            alt={gig.title}
                                                            style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-color)' }}
                                                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || gig.title)}&background=ede9fe&color=4f46e5&size=60`; }}
                                                        />
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                                                <div>
                                                                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{gig.title}</div>
                                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                                                        {gig.category} · ₹{gig.price} / {gig.priceType}
                                                                        {gig.location?.city && ` · ${gig.location.city}`}
                                                                    </div>
                                                                </div>
                                                                <span style={{ backgroundColor: statusBg, color: statusColor, padding: '3px 12px', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                                    {statusLabel}
                                                                </span>
                                                            </div>
                                                            {gig.description && (
                                                                <p style={{
                                                                    fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5,
                                                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                                                }}>
                                                                    {gig.description}
                                                                </p>
                                                            )}
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                                                Submitted: {new Date(gig.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div style={{ display: 'flex', gap: 8, alignSelf: 'center' }}>
                                                            <button
                                                                onClick={() => handleEditClick(gig)}
                                                                style={{ padding: 8, borderRadius: '50%', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', backgroundColor: '#fff' }}
                                                                title="Edit Gig"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteGig(gig._id)}
                                                                style={{ padding: 8, borderRadius: '50%', border: '1px solid #fee2e2', color: '#ef4444', cursor: 'pointer', backgroundColor: '#fff' }}
                                                                title="Delete Gig"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── BOOKING REQUESTS TAB (PROVIDER) ── */}
                            {activeTab === 'requests' && (
                                <div className="animate-fade-in">

                                    {bookingsLoading ? (
                                        <p>Loading requests...</p>
                                    ) : bookingRequests.length === 0 ? (
                                        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No requests found.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {bookingRequests.map(req => (
                                                <div key={req._id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', backgroundColor: '#fff' }}>
                                                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                                                        <div>
                                                            <span style={{
                                                                color: ['pending', 'in_progress', 'revision_requested'].includes(req.status) ? '#f59e0b' : ['confirmed', 'delivered'].includes(req.status) ? '#2563eb' : req.status === 'completed' ? '#059669' : '#dc2626',
                                                                backgroundColor: ['pending', 'in_progress', 'revision_requested'].includes(req.status) ? '#fef3c7' : ['confirmed', 'delivered'].includes(req.status) ? '#dbeafe' : req.status === 'completed' ? '#d1fae5' : '#fee2e2',
                                                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700'
                                                            }}>{req.status.replace('_', ' ').toUpperCase()}</span>
                                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '8px' }}>{req.service?.title}</h3>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--primary)' }}>₹{req.totalPrice}</div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.paymentMethod}</div>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} /></div>
                                                            <div>
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer</div>
                                                                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{req.user?.name}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CalendarIcon size={16} /></div>
                                                            <div>
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scheduled For</div>
                                                                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{new Date(req.date).toLocaleDateString()} | {req.timeSlot}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Address</div>
                                                        <div style={{ fontSize: '0.85rem' }}>{req.address?.street}, {req.address?.city}</div>
                                                    </div>

                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        {req.status === 'pending' && (
                                                            <>
                                                                <button onClick={() => updateBookingStatus(req._id, 'confirmed')} className="btn-primary" style={{ flex: 1, padding: '10px' }}>Accept Booking</button>
                                                                <button onClick={() => updateBookingStatus(req._id, 'cancelled')} className="btn-outline" style={{ flex: 1, padding: '10px', borderColor: '#ef4444', color: '#ef4444' }}>Decline</button>
                                                            </>
                                                        )}
                                                        {req.status === 'confirmed' && (
                                                            <button onClick={() => updateBookingStatus(req._id, 'in_progress')} className="btn-primary" style={{ flex: 1, padding: '10px' }}>Mark In Progress</button>
                                                        )}
                                                        {['in_progress', 'revision_requested'].includes(req.status) && (
                                                            <button onClick={() => updateBookingStatus(req._id, 'delivered')} className="btn-primary" style={{ flex: 1, padding: '10px', backgroundColor: '#059669' }}>Deliver Service</button>
                                                        )}
                                                        {['confirmed', 'in_progress', 'revision_requested', 'delivered'].includes(req.status) && (
                                                            <button onClick={() => navigate(`/chat?roomId=${req._id}`)} className="btn-outline" style={{ flex: 1, padding: '10px' }}>Chat with Customer</button>
                                                        )}
                                                        {req.status === 'completed' && (
                                                            <p style={{ color: '#059669', fontWeight: '600', fontSize: '0.9rem' }}>✓ Service completed & accepted</p>
                                                        )}
                                                        {req.status === 'cancelled' && (
                                                            <p style={{ color: '#dc2626', fontWeight: '600', fontSize: '0.9rem' }}>This booking was cancelled</p>
                                                        )}
                                                    </div>

                                                    {req.status === 'revision_requested' && req.revisions?.length > 0 && (
                                                        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '4px' }}>
                                                            <strong style={{ color: '#92400e', fontSize: '0.9rem' }}>Customer requested revision:</strong>
                                                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>{req.revisions[req.revisions.length - 1].note}</p>
                                                        </div>
                                                    )}
                                                    {req.status === 'delivered' && (
                                                        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '4px', fontSize: '0.85rem', color: '#1e40af' }}>
                                                            Waiting for customer to accept or request a revision.
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <div className="animate-fade-in" style={{ maxWidth: '1000px' }}>

                                    <section style={{ backgroundColor: '#fff', borderRadius: '32px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }}>
                                            <div>
                                                <div style={styles.formGroup}>
                                                    <label style={styles.label}>Full Name</label>
                                                    <input type="text" className="input-field" value={profileName} onChange={e => setProfileName(e.target.value)} />
                                                </div>
                                                <div style={styles.formGroup}>
                                                    <label style={styles.label}>Username</label>
                                                    <input type="text" className="input-field" placeholder="Choose a unique username" value={profileUsername} onChange={e => setProfileUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))} />
                                                    {profileUsername && (
                                                        <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                            Public URL: <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{window.location.host}/u/{profileUsername}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <div style={styles.formGroup}>
                                                    <label style={styles.label}>Email Address</label>
                                                    <input type="email" className="input-field" defaultValue={user?.email || ''} readOnly style={{ opacity: 0.6, backgroundColor: '#f8fafc' }} />
                                                </div>
                                                <div style={styles.formGroup}>
                                                    <label style={styles.label}>Phone Number</label>
                                                    <input type="text" className="input-field" placeholder="Add phone number" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} />
                                                </div>
                                                {/* Security Tip Panel */}
                                                <div style={{ padding: '24px', backgroundColor: '#f0f9ff', borderRadius: '20px', border: '1px solid #e0f2fe' }}>
                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        <CheckCircle size={20} color="#0284c7" />
                                                        <div>
                                                            <p style={{ fontSize: '13px', fontWeight: '700', color: '#0369a1', marginBottom: '4px' }}>Security Tip</p>
                                                            <p style={{ fontSize: '12px', color: '#0c4a6e', lineHeight: '1.5' }}>Ensure your phone number is verified to receive SMS alerts for new bookings and messages.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {role === 'provider' && (
                                                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '32px', borderTop: '1px solid #f1f5f9', paddingTop: '40px' }}>
                                                    <div style={styles.formGroup}>
                                                        <label style={styles.label}>Professional Title</label>
                                                        <input
                                                            type="text"
                                                            className="input-field"
                                                            value={providerTitle}
                                                            onChange={(e) => setProviderTitle(e.target.value)}
                                                            placeholder="e.g. Expert Home Stylist or Senior Electrician"
                                                        />
                                                    </div>
                                                    <div style={styles.formGroup}>
                                                        <label style={styles.label}>About / Professional Bio</label>
                                                        <textarea
                                                            className="input-field"
                                                            value={providerAbout}
                                                            onChange={(e) => setProviderAbout(e.target.value)}
                                                            placeholder="Describe your skills, experience, and what makes your service stand out..."
                                                            rows={5}
                                                            style={{ resize: 'none', height: 'auto', minHeight: '150px', paddingTop: '16px' }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'chat' && (
                                <div className="animate-fade-in" style={{ 
                                    display: 'flex', 
                                    flexDirection: isMobile ? 'column' : 'row',
                                    gap: '24px', 
                                    height: isMobile ? 'auto' : 'calc(100vh - 250px)', 
                                    minHeight: isMobile ? 'none' : '600px' 
                                }}>
                                    {/* Left Side: Room List */}
                                    <div style={{ 
                                        width: isMobile ? '100%' : '350px', 
                                        display: (isMobile && dashActiveRoom) ? 'none' : 'flex',
                                        flexDirection: 'column', 
                                        gap: '16px', 
                                        borderRight: isMobile ? 'none' : '1px solid #f1f5f9', 
                                        paddingRight: isMobile ? '0' : '24px', 
                                        overflowY: 'auto' 
                                    }}>
                                        <h2 className="text-h2" style={{ marginBottom: '8px', fontSize: '1.5rem' }}>Messages</h2>
                                        <ChatList
                                            onSelect={(room) => setDashActiveRoom(room)}
                                        />
                                    </div>

                                    {/* Right Side: Chat Area */}
                                    <div style={{ 
                                        flex: 1, 
                                        display: (isMobile && !dashActiveRoom) ? 'none' : 'flex',
                                        backgroundColor: '#fff', 
                                        borderRadius: '24px', 
                                        flexDirection: 'column', 
                                        overflow: 'hidden', 
                                        border: '1px solid #f1f5f9', 
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                        minHeight: isMobile ? '500px' : 'none'
                                    }}>
                                        {dashActiveRoom ? (
                                            <>
                                                {/* Window Header */}
                                                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#fff' }}>
                                                    {isMobile && (
                                                        <button 
                                                            onClick={() => setDashActiveRoom(null)}
                                                            style={{ background: 'none', border: 'none', marginRight: '8px', cursor: 'pointer', color: '#64748b' }}
                                                        >
                                                            <X size={20} />
                                                        </button>
                                                    )}
                                                    <img
                                                        src={getAvatar(dashActiveRoom.otherUser)}
                                                        alt="Avatar"
                                                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dashActiveRoom.otherUser?.name || 'U')}&background=ede9fe&color=4f46e5`; }}
                                                    />
                                                    <div>
                                                        <h4 style={{ fontSize: '14px', fontWeight: '800' }}>{dashActiveRoom.otherUser?.name || 'User'}</h4>
                                                        <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: '700' }}>Active Conversation</span>
                                                    </div>
                                                </div>

                                                {/* Messages Container */}
                                                <div className="no-scrollbar" style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f8fafc' }}>
                                                    {dashMessages.length === 0 ? (
                                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
                                                            No messages yet. Say hi!
                                                        </div>
                                                    ) : (
                                                        dashMessages.map((msg, idx) => {
                                                            const isMe = msg.senderId === user?._id;
                                                            return (
                                                                <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                                                    <div style={{
                                                                        padding: '10px 14px',
                                                                        borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                                                                        backgroundColor: isMe ? '#003d9b' : '#fff',
                                                                        color: isMe ? '#fff' : '#1e293b',
                                                                        fontSize: '13px',
                                                                        lineHeight: '1.4',
                                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                                                    }}>
                                                                        {msg.message}
                                                                    </div>
                                                                    <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                    <div ref={messagesEndRef} />
                                                </div>

                                                {/* Input Area */}
                                                <div style={{ padding: '16px', backgroundColor: '#fff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
                                                    <input
                                                        type="text"
                                                        className="input-field"
                                                        placeholder="Write a message..."
                                                        value={dashMessageInput}
                                                        onChange={e => setDashMessageInput(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleSendMessageDash()}
                                                        style={{ borderRadius: '100px', padding: '10px 20px', fontSize: '13px', flex: 1 }}
                                                    />
                                                    <button
                                                        onClick={handleSendMessageDash}
                                                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: '#003d9b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                                                    >
                                                        <Send size={18} />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: '40px', textAlign: 'center' }}>
                                                <MessageSquare size={40} style={{ opacity: 0.15, marginBottom: '16px' }} />
                                                <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '8px' }}>Your Messages</h3>
                                                <p style={{ fontSize: '13px' }}>Select a conversation from the list to start chatting.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}


                            {['bids'].includes(activeTab) && (
                                <div className="animate-fade-in flex-center" style={{ height: '300px' }}>
                                    <p className="text-body">Content for {activeTab.replace('_', ' ')} will appear here.</p>
                                </div>
                            )}

                        </div>
                    </main>

                    {/* Quick Profile Editor Modal */}
                    {showProfileEditor && (
                        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                            <div className="animate-scale-up" style={{ backgroundColor: '#fff', borderRadius: '32px', width: '100%', maxWidth: '600px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Edit Profile</h3>
                                        <p style={{ fontSize: '14px', color: '#737685' }}>Update your professional identity and contact info.</p>
                                    </div>
                                    <button onClick={() => setShowProfileEditor(false)} style={{ background: '#f8fafc', border: 'none', padding: '12px', borderRadius: '16px', color: '#64748b', cursor: 'pointer' }}>
                                        <X size={24} />
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Full Name</label>
                                            <input type="text" className="input-field" value={profileName} onChange={e => setProfileName(e.target.value)} />
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Username</label>
                                            <input type="text" className="input-field" value={profileUsername} onChange={e => setProfileUsername(e.target.value)} />
                                        </div>
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Phone Number</label>
                                        <input type="text" className="input-field" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Professional Title</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={providerTitle}
                                            onChange={e => setProviderTitle(e.target.value)}
                                            placeholder="e.g. Master Electrician"
                                        />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Professional Bio</label>
                                        <textarea
                                            className="input-field"
                                            value={providerAbout}
                                            onChange={e => setProviderAbout(e.target.value)}
                                            rows={4}
                                            style={{ resize: 'none' }}
                                            placeholder="Tell potential clients about your skills and experience..."
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                                        <button className="btn-outline" onClick={() => setShowProfileEditor(false)} style={{ flex: 1, borderRadius: '100px' }}>Cancel</button>
                                        <button
                                            className="btn-primary"
                                            onClick={async () => {
                                                await handleSaveProfile();
                                                setShowProfileEditor(false);
                                            }}
                                            disabled={savingProfile}
                                            style={{ flex: 2, borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        >
                                            {savingProfile ? <Loader className="animate-spin" size={20} /> : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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
