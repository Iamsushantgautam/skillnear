import React, { useState, useEffect } from 'react';
import { User, Briefcase, Calendar as CalendarIcon, Settings, MessageSquare, BarChart, MapPin, Edit, Trash2, X, Plus, Inbox, Loader } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import ChatList from '../components/ChatList';
import { useNavigate } from 'react-router-dom';

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
    const [gigCategory, setGigCategory] = useState('Home Repairs');
    const [gigDesc, setGigDesc] = useState('');
    const [gigPrice, setGigPrice] = useState(''); // Default/Basic price
    const [gigPriceType, setGigPriceType] = useState('fixed');
    const [gigState, setGigState] = useState('');
    const [gigCity, setGigCity] = useState('');
    const [gigAddress, setGigAddress] = useState('');
    const [gigZipCode, setGigZipCode] = useState('');
    
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

    const [gigImages, setGigImages] = useState([]);   
    const [uploadingGigImages, setUploadingGigImages] = useState(false);
    const [creatingGig, setCreatingGig] = useState(false);

    const indiaLocations = {
        "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore"],
        "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi"],
        "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
        "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru"],
        "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
        "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
        "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Noida"],
        "West Bengal": ["Kolkata", "Howrah", "Durgapur"],
    };

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

    // Bookings state
    const [myBookings, setMyBookings] = useState([]);
    const [bookingRequests, setBookingRequests] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setRole(user.role);
            if (user.role === 'provider') {
                setProviderStatus(user.providerDetails?.isApproved ? 'approved' : 'pending');
                fetchMyGigs();
                fetchProviderRequests();
            }
            setProfileAvatar(user.avatar || '');
            setProfileName(user.name || '');
            setProfilePhone(user.phone || '');
            setProfileUsername(user.username || '');
            fetchMyBookings();
        }
    }, [user, activeTab]);

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
            const { data } = await api.put('/api/users/profile', { 
                name: profileName, 
                phone: profilePhone, 
                avatar: profileAvatar, 
                username: cleanUsername 
            }, config);
            
            // The server returns the updated user.
            const updated = { 
                ...user, 
                name: data.name, 
                phone: data.phone, 
                avatar: data.avatar, 
                username: data.username || cleanUsername
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
        if (!gigTitle || !gigDesc || (gigBusinessType === 'service' && !gigPrice && !usePlans)) {
            toast.error("Please fill all required fields (Title, Description, and Price/Plans)");
            return;
        }

        try {
            setCreatingGig(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = {
                title: gigTitle,
                category: gigCategory,
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
                plans: usePlans ? gigPlans.map(p => ({ ...p, price: Number(p.price) })) : [],
                shopDetails: gigBusinessType === 'shop' ? {
                    openingTime: shopOpeningTime,
                    closingTime: shopClosingTime,
                    isHomeDelivery: shopIsHomeDelivery
                } : null
            };

            await api.post('/api/services', payload, config);

            toast.success("Gig published successfully!");
            // Reset form
            setGigStep(1);
            setGigTitle('');
            setGigDesc('');
            setGigPrice('');
            setGigCity('');
            setGigState('');
            setGigAddress('');
            setGigImages([]);
            setCreatingGig(false);
            fetchMyGigs();
            setActiveTab('mygigs');
        } catch (error) {
            console.error("Error creating gig", error);
            toast.error("Failed to create gig");
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
        setEditingGig(gig);
        setEditForm({
            title: gig.title,
            category: gig.category,
            description: gig.description,
            price: gig.price,
            priceType: gig.priceType,
            city: gig.location?.city || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateGig = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put(`/api/services/${editingGig._id}`, {
                ...editForm,
                price: Number(editForm.price),
                location: { city: editForm.city || 'Remote', isRemote: !editForm.city }
            }, config);

            toast.success("Gig updated successfully!");
            setShowEditModal(false);
            fetchMyGigs();
        } catch (error) {
            toast.error("Failed to update gig");
        }
    };

    // Customer Tabs
    const renderCustomerTabs = () => (
        <>
            <button style={getTabStyle('profile')} onClick={() => setActiveTab('profile')}>
                <User size={18} /> Profile
            </button>
            <button style={getTabStyle('bookings')} onClick={() => setActiveTab('bookings')}>
                <CalendarIcon size={18} /> My Bookings
            </button>
            <button style={getTabStyle('messages')} onClick={() => setActiveTab('messages')}>
                <MessageSquare size={18} /> Messages
            </button>
            <button style={getTabStyle('become_provider')} onClick={() => setActiveTab('become_provider')}>
                <Settings size={18} /> Become a Provider
            </button>
        </>
    );

    // Provider Tabs
    const renderProviderTabs = () => (
        <>
            <button style={getTabStyle('mygigs')} onClick={() => setActiveTab('mygigs')}>
                <Briefcase size={18} /> My Gigs
            </button>
            <button style={getTabStyle('overview')} onClick={() => setActiveTab('overview')}>
                <BarChart size={18} /> Overview
            </button>
            <button style={getTabStyle('profile')} onClick={() => setActiveTab('profile')}>
                <User size={18} /> Profile
            </button>
            <button style={getTabStyle('services')} onClick={() => setActiveTab('services')}>
                <Settings size={18} /> Add New Gig
            </button>
            <button style={getTabStyle('requests')} onClick={() => setActiveTab('requests')}>
                <Inbox size={18} /> Booking Requests
                {bookingRequests.filter(r => r.status === 'pending').length > 0 && (
                    <span style={{ marginLeft: '6px', backgroundColor: '#dc2626', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                        {bookingRequests.filter(r => r.status === 'pending').length}
                    </span>
                )}
            </button>
            <button style={getTabStyle('bookings')} onClick={() => setActiveTab('bookings')}>
                <CalendarIcon size={18} /> My Orders (Purchased)
            </button>
            <button style={getTabStyle('messages')} onClick={() => setActiveTab('messages')}>
                <MessageSquare size={18} /> Messages
            </button>
        </>
    );

    const getTabStyle = (tabName) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '12px 16px',
        textAlign: 'left',
        backgroundColor: activeTab === tabName ? '#f3f4f6' : 'transparent',
        color: activeTab === tabName ? 'var(--primary)' : 'var(--text-main)',
        borderLeft: activeTab === tabName ? '4px solid var(--primary)' : '4px solid transparent',
        transition: 'var(--transition-normal)',
        fontWeight: activeTab === tabName ? '600' : '400',
    });

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 className="text-h1" style={{ fontSize: '2rem' }}>Dashboard</h1>
            </div>

            <div style={styles.grid}>
                {/* Sidebar */}
                <aside className="card" style={{ padding: '0', overflow: 'hidden', alignSelf: 'start' }}>
                    <div style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
                        <img src={getAvatar(user)} alt="Avatar" style={{ borderRadius: '50%', marginBottom: '16px', width: '80px', height: '80px', objectFit: 'cover' }} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ede9fe&color=4f46e5&size=120`; }} />
                        <h3 className="text-h3" style={{ fontSize: '1.2rem', textTransform: 'capitalize' }}>{user?.name || 'User'}</h3>
                        <p className="text-small" style={{ textTransform: 'capitalize', fontWeight: '600', color: providerStatus === 'approved' ? '#059669' : 'var(--text-muted)' }}>
                            {role === 'provider' ? (providerStatus === 'approved' ? 'Activated' : 'Pending Approval') : role}
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {role === 'customer' ? renderCustomerTabs() : renderProviderTabs()}
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="card" style={{ minHeight: '500px' }}>

                    {activeTab === 'overview' && role === 'provider' && (
                        <div className="animate-fade-in">
                            <h2 className="text-h2" style={{ marginBottom: '24px' }}>Overview & Earnings</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                                <div style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                    <h4 className="text-small">Total Earnings</h4>
                                    <h2 className="text-h2" style={{ color: 'var(--secondary)' }}>$1,250</h2>
                                </div>
                                <div style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                    <h4 className="text-small">Active Gigs</h4>
                                    <h2 className="text-h2" style={{ color: 'var(--primary)' }}>3</h2>
                                </div>
                                <div style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                    <h4 className="text-small">Pending Requests</h4>
                                    <h2 className="text-h2" style={{ color: '#f59e0b' }}>5</h2>
                                </div>
                            </div>

                            <h3 className="text-h3" style={{ marginBottom: '16px' }}>Earnings Chart</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart
                                        data={[
                                            { name: 'Jan', earnings: 400 },
                                            { name: 'Feb', earnings: 300 },
                                            { name: 'Mar', earnings: 600 },
                                            { name: 'Apr', earnings: 800 },
                                            { name: 'May', earnings: 500 },
                                            { name: 'Jun', earnings: 1000 },
                                        ]}
                                        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                                    >
                                        <Line type="monotone" dataKey="earnings" stroke="var(--primary)" strokeWidth={3} />
                                        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="animate-fade-in">
                            <h2 className="text-h2" style={{ marginBottom: '24px' }}>Profile Information</h2>

                            {/* Avatar upload */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={getAvatar({ avatar: profileAvatar, name: profileName })}
                                        alt="avatar"
                                        style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName || 'U')}&background=ede9fe&color=4f46e5&size=120`; }}
                                    />
                                    {uploadingAvatar && (
                                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem' }}>Uploading…</div>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="avatar-upload" style={{ cursor: 'pointer', display: 'inline-block', padding: '8px 16px', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600 }}>
                                        {uploadingAvatar ? 'Uploading…' : 'Change Photo'}
                                    </label>
                                    <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>JPG, PNG up to 5MB</p>
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Name</label>
                                <input type="text" className="input-field" value={profileName} onChange={e => setProfileName(e.target.value)} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Username</label>
                                <input type="text" className="input-field" placeholder="Choose a unique username" value={profileUsername} onChange={e => setProfileUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))} />
                                {profileUsername && (
                                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Public URL: <a href={`/u/${profileUsername}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{window.location.host}/u/{profileUsername}</a>
                                    </div>
                                )}
                                {!profileUsername && (
                                    <p style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Setting a username creates a public profile page for your services.</p>
                                )}
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email Address</label>
                                <input type="email" className="input-field" defaultValue={user?.email || ''} readOnly style={{ opacity: 0.6 }} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Phone Number</label>
                                <input type="text" className="input-field" placeholder="Add phone number" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} />
                            </div>
                            <button className="btn-primary" onClick={handleSaveProfile} disabled={savingProfile || uploadingAvatar}>
                                {savingProfile ? 'Saving…' : 'Save Profile'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'become_provider' && (
                        <div className="animate-fade-in">
                            <h2 className="text-h2" style={{ marginBottom: '16px' }}>Become a Seller</h2>
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
                            <h2 className="text-h2" style={{ marginBottom: '24px' }}>My Bookings</h2>
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
                                    <h2 className="text-h2">Publish Your Expertise</h2>
                                    <p className="text-body" style={{ color: 'var(--text-muted)' }}>Step {gigStep} of 3: {gigStep === 1 ? 'General Details' : gigStep === 2 ? 'Pricing & Plans' : 'Location & Media'}</p>
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

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Category</label>
                                                <select className="input-field" value={gigCategory} onChange={e => setGigCategory(e.target.value)}>
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
                                                </select>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>{gigBusinessType === 'service' ? 'Project Type' : 'Shop Category'}</label>
                                                <select className="input-field">
                                                    <option value="Single Project">Single Project</option>
                                                    <option value="Subscription">Monthly Support</option>
                                                    <option value="Maintenance">Maintenance</option>
                                                </select>
                                            </div>
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                                    <input type="checkbox" checked={shopIsHomeDelivery} onChange={e => setShopIsHomeDelivery(e.target.checked)} />
                                                    <label className="text-small">Provide Home Delivery?</label>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {gigStep === 3 && (
                                    <div className="animate-fade-in">
                                        <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '20px' }}>Location & Search Visibility</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>State</label>
                                                <select className="input-field" value={gigState} onChange={e => { setGigState(e.target.value); setGigCity(''); }}>
                                                    <option value="">Select State</option>
                                                    {Object.keys(indiaLocations).map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>City</label>
                                                <select className="input-field" value={gigCity} onChange={e => setGigCity(e.target.value)} disabled={!gigState}>
                                                    <option value="">Select City</option>
                                                    {gigState && indiaLocations[gigState].map(c => <option key={c} value={c}>{c}</option>)}
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

                                        <div style={{ marginTop: '24px' }}>
                                            <label style={styles.label}>Gig Gallery (Add up to 5 photos)</label>
                                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: '12px' }}>
                                                {gigImages.map((url, i) => (
                                                    <div key={i} style={{ position: 'relative' }}>
                                                        <img src={url} alt={`gig-${i}`} style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #e2e8f0' }} />
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
                                            {creatingGig ? 'Publishing...' : 'Complete & Publish Gig'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── MY GIGS TAB ── */}
                    {activeTab === 'mygigs' && (
                        <div className="animate-fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 className="text-h2">My Gigs</h2>
                                <button className="btn-primary" style={{ fontSize: '0.875rem', padding: '8px 16px' }}
                                    onClick={() => setActiveTab('services')}>
                                    + New Gig
                                </button>
                            </div>

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
                            <h2 className="text-h2" style={{ marginBottom: '16px' }}>Booking Requests</h2>
                            <p className="text-body" style={{ marginBottom: '24px' }}>Manage incoming service requests from customers.</p>

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

                    {activeTab === 'messages' && (
                        <div className="animate-fade-in" style={{ maxWidth: '600px' }}>
                            <h2 className="text-h2" style={{ marginBottom: '16px' }}>Recent Messages</h2>
                            <p className="text-body" style={{ marginBottom: '24px' }}>Continue your recent conversations with providers and customers.</p>
                            <ChatList
                                onSelect={(room) => navigate(`/chat?roomId=${room.roomId}`)}
                            />
                            <div style={{ marginTop: '32px', textAlign: 'center' }}>
                                <button className="btn-outline" onClick={() => navigate('/chat')}>Open Full Chat Portal</button>
                            </div>
                        </div>
                    )}


                    {['bids'].includes(activeTab) && (
                        <div className="animate-fade-in flex-center" style={{ height: '300px' }}>
                            <p className="text-body">Content for {activeTab.replace('_', ' ')} will appear here.</p>
                        </div>
                    )}

                </div>
            </div>

            {/* Edit Gig Modal */}
            {showEditModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
                }}>
                    <div style={{
                        backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 500,
                        maxHeight: '90vh', overflowY: 'auto', padding: 32, position: 'relative'
                    }} className="animate-fade-in">
                        <button onClick={() => setShowEditModal(false)} style={{ position: 'absolute', top: 20, right: 20, color: 'var(--text-muted)' }}>
                            <X size={24} />
                        </button>
                        <h2 className="text-h2" style={{ marginBottom: 24 }}>Edit Gig Details</h2>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Gig Title</label>
                            <input
                                type="text"
                                className="input-field"
                                value={editForm.title}
                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Category</label>
                            <select
                                className="input-field"
                                value={editForm.category}
                                onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                            >
                                <option value="Carpenters">Carpenters</option>
                                <option value="Plumbers">Plumbers</option>
                                <option value="Electricians">Electricians</option>
                                <option value="Salon">Salon</option>
                                <option value="Painters">Painters</option>
                                <option value="Cleaning">Cleaning</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Description</label>
                            <textarea
                                className="input-field"
                                rows="4"
                                value={editForm.description}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                            ></textarea>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Price (₹)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={editForm.price}
                                    onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Price Type</label>
                                <select
                                    className="input-field"
                                    value={editForm.priceType}
                                    onChange={e => setEditForm({ ...editForm, priceType: e.target.value })}
                                >
                                    <option value="fixed">Fixed</option>
                                    <option value="hourly">Hourly</option>
                                </select>
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>City (blank for remote)</label>
                            <input
                                type="text"
                                className="input-field"
                                value={editForm.city}
                                onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                            <button className="btn-primary" style={{ flex: 1 }} onClick={handleUpdateGig}>Save Changes</button>
                            <button className="btn-outline" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
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
