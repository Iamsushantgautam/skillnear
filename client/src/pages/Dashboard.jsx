import React, { useState, useEffect } from 'react';
import { User, Briefcase, Calendar as CalendarIcon, Settings, MessageSquare, BarChart, MapPin, Edit, Trash2, X, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import ChatList from '../components/ChatList';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, updateUserInfo, userLocation } = useAuthStore();
    const navigate = useNavigate();
    const [role, setRole] = useState(user?.role || 'customer');
    const [activeTab, setActiveTab] = useState(user?.role === 'provider' ? 'mygigs' : 'profile');

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

    // Gig Registration States
    const [gigTitle, setGigTitle] = useState('');
    const [gigCategory, setGigCategory] = useState('Home Repairs');
    const [gigDesc, setGigDesc] = useState('');
    const [gigPrice, setGigPrice] = useState('');
    const [gigPriceType, setGigPriceType] = useState('fixed');
    const [gigCity, setGigCity] = useState(userLocation?.city && userLocation.city !== 'All of India' ? userLocation.city : '');
    const [gigImages, setGigImages] = useState([]);   // up to 5 thumbnail URLs
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

    const updateBookingStatus = async (bookingId, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put(`/api/bookings/${bookingId}/status`, { status }, config);
            fetchMyBookings();
            fetchProviderRequests();
            alert(`Booking status updated to ${status}`);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
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
        if (remaining <= 0) { alert('Maximum 5 images allowed'); return; }
        const toUpload = files.slice(0, remaining);
        setUploadingGigImages(true);
        try {
            const urls = await Promise.all(toUpload.map(uploadSingleFile));
            setGigImages(prev => [...prev, ...urls]);
        } catch (err) {
            console.error('Image upload failed', err);
            alert('One or more images failed to upload');
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
            alert('Avatar upload failed');
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
            const { data } = await api.put('/api/users/profile', { name: profileName, phone: profilePhone, avatar: profileAvatar }, config);
            // Update local store globally
            const updated = { ...user, name: data.name, phone: data.phone, avatar: data.avatar };
            updateUserInfo(updated);
            alert('Profile updated successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save profile');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleApplyProvider = async () => {
        // Validation could be added here based on type
        if (!providerTitle || !providerExp || !providerAbout || !providerType) {
            alert("Please fill all required base fields and select a provider type");
            return;
        }

        try {
            setIsSubmitting(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            const payload = {
                title: providerTitle,
                experienceYears: providerExp,
                about: providerAbout,
                providerType,
            };

            if (providerType === 'Shop') {
                payload.shopName = shopName;
                payload.ownerName = ownerName;
                payload.location = location;
                payload.images = shopImages;
            } else if (providerType === 'Services') {
                payload.serviceName = serviceName;
                payload.serviceProviderName = serviceProviderName;
                payload.liveLocation = liveLocation;
                payload.shopDetails = shopDetails;
                payload.shopAddress = shopAddress;
            }

            const { data } = await api.post('/api/auth/become-provider', payload, config);

            // Update local storage and store
            const updatedUser = { ...user, role: data.role, providerDetails: data.providerDetails };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            window.location.reload(); // Quick refresh to update store properly
        } catch (error) {
            console.error("Error applying", error);
            alert(error.response?.data?.message || "Failed to submit application");
            setIsSubmitting(false);
        }
    };

    const handleCreateGig = async () => {
        if (!gigTitle || !gigDesc || !gigPrice) {
            alert("Please fill all required gig fields");
            return;
        }

        try {
            setCreatingGig(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };
            await api.post('/api/services', {
                title: gigTitle,
                category: gigCategory,
                description: gigDesc,
                price: Number(gigPrice),
                priceType: gigPriceType,
                images: gigImages,   // send uploaded thumbnail URLs
                location: { city: gigCity || 'Remote', isRemote: !gigCity }
            }, config);

            alert("Gig submitted! It is now pending admin approval.");
            setGigTitle('');
            setGigDesc('');
            setGigPrice('');
            setGigCity('');
            setGigImages([]);
            setCreatingGig(false);
            fetchMyGigs();
        } catch (error) {
            console.error("Error creating gig", error);
            alert("Failed to create gig");
            setCreatingGig(false);
        }
    };

    const handleDeleteGig = async (id) => {
        if (!window.confirm("Are you sure you want to delete this gig? This action cannot be undone.")) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/api/services/${id}`, config);
            alert("Gig deleted successfully");
            fetchMyGigs();
        } catch (error) {
            alert("Failed to delete gig");
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

            alert("Gig updated successfully!");
            setShowEditModal(false);
            fetchMyGigs();
        } catch (error) {
            alert("Failed to update gig");
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
                <CalendarIcon size={18} /> Booking Requests
                {bookingRequests.filter(r => r.status === 'pending').length > 0 && (
                    <span style={{ marginLeft: '6px', backgroundColor: '#dc2626', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                        {bookingRequests.filter(r => r.status === 'pending').length}
                    </span>
                )}
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
                        <img src={getAvatar(user)} alt="Avatar" style={{ borderRadius: '50%', marginBottom: '16px', width: '80px', height: '80px', objectFit: 'cover' }} />
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
                                <>
                                    <p className="text-body" style={{ marginBottom: '24px' }}>
                                        Join our network of professionals and start earning by offering your skills.
                                    </p>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Professional Title / Specialty</label>
                                        <input type="text" className="input-field" placeholder="e.g. Master Plumber, SEO Expert" value={providerTitle} onChange={e => setProviderTitle(e.target.value)} />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Years of Experience</label>
                                        <input type="number" className="input-field" placeholder="e.g. 5" value={providerExp} onChange={e => setProviderExp(e.target.value)} />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>About You</label>
                                        <textarea className="input-field" rows="4" placeholder="Describe your expertise and services..." value={providerAbout} onChange={e => setProviderAbout(e.target.value)}></textarea>
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Provider Type</label>
                                        <select className="input-field" value={providerType} onChange={e => setProviderType(e.target.value)}>
                                            <option value="Shop">Shop</option>
                                            <option value="Services">Services (No Shop required)</option>
                                        </select>
                                    </div>

                                    {providerType === 'Shop' && (
                                        <>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Shop Name</label>
                                                <input type="text" className="input-field" value={shopName} onChange={e => setShopName(e.target.value)} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Owner Name</label>
                                                <input type="text" className="input-field" value={ownerName} onChange={e => setOwnerName(e.target.value)} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Location / Physical Address</label>
                                                <input type="text" className="input-field" value={location} onChange={e => setLocation(e.target.value)} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Upload Shop Images
                                                    {uploadingGigImages && <span style={{ fontSize: '0.8rem', color: 'var(--primary)', marginLeft: 6 }}>(Uploading...)</span>}
                                                </label>
                                                <input type="file" className="input-field" multiple accept="image/*"
                                                    onChange={async (e) => {
                                                        const files = Array.from(e.target.files);
                                                        setUploadingGigImages(true);
                                                        try {
                                                            const urls = await Promise.all(files.map(uploadSingleFile));
                                                            setShopImages(prev => [...prev, ...urls]);
                                                        } catch { alert('Upload failed'); }
                                                        finally { setUploadingGigImages(false); e.target.value = ''; }
                                                    }}
                                                    disabled={uploadingGigImages} />
                                                {shopImages.length > 0 && <p className="text-small" style={{ marginTop: '4px', color: 'var(--success)' }}>{shopImages.length} image(s) uploaded</p>}
                                            </div>
                                        </>
                                    )}

                                    {providerType === 'Services' && (
                                        <>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Service Name</label>
                                                <input type="text" className="input-field" value={serviceName} onChange={e => setServiceName(e.target.value)} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Service Provider Name</label>
                                                <input type="text" className="input-field" value={serviceProviderName} onChange={e => setServiceProviderName(e.target.value)} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Live Location / Coverage Area</label>
                                                <input type="text" className="input-field" value={liveLocation} onChange={e => setLiveLocation(e.target.value)} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Shop Details (if applicable)</label>
                                                <textarea className="input-field" rows="3" value={shopDetails} onChange={e => setShopDetails(e.target.value)}></textarea>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Shop Address</label>
                                                <textarea className="input-field" rows="2" value={shopAddress} onChange={e => setShopAddress(e.target.value)}></textarea>
                                            </div>
                                        </>
                                    )}

                                    <button className="btn-primary" onClick={handleApplyProvider} disabled={isSubmitting}>
                                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                    </button>
                                </>
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
                                                color: b.status === 'pending' ? '#f59e0b' : b.status === 'confirmed' ? '#2563eb' : b.status === 'completed' ? '#059669' : '#dc2626',
                                                backgroundColor: b.status === 'pending' ? '#fef3c7' : b.status === 'confirmed' ? '#dbeafe' : b.status === 'completed' ? '#d1fae5' : '#fee2e2',
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase'
                                            }}>{b.status}</span>
                                        </div>
                                        <div className="text-body" style={{ marginBottom: '4px' }}><CalendarIcon size={14} style={{ display: 'inline', marginRight: '8px' }} /> {new Date(b.date).toLocaleDateString()} | {b.timeSlot}</div>
                                        <div className="text-body" style={{ marginBottom: '12px' }}><MapPin size={14} style={{ display: 'inline', marginRight: '8px' }} /> {b.address?.street}, {b.address?.city}</div>
                                        <div className="flex-between" style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                                            <span className="text-small" style={{ color: 'var(--text-muted)' }}>Provider: {b.provider?.name}</span>
                                            <span style={{ fontWeight: 'bold' }}>₹{b.totalPrice}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div className="animate-fade-in">
                            <h2 className="text-h2" style={{ marginBottom: '16px' }}>Manage Services & Gigs</h2>
                            <p className="text-body" style={{ marginBottom: '24px' }}>
                                Register a new service gig. Once approved by the admin, it will be visible to customers.
                            </p>
                            <div className="card" style={{ backgroundColor: '#f9fafb', borderColor: 'var(--border-color)', boxShadow: 'none' }}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Gig Title</label>
                                    <input type="text" className="input-field" placeholder="e.g. I will fix your plumbing issues" value={gigTitle} onChange={e => setGigTitle(e.target.value)} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Category</label>
                                    <select className="input-field" value={gigCategory} onChange={e => setGigCategory(e.target.value)}>
                                        <option value="Carpenters">Carpenters</option>
                                        <option value="Plumbers">Plumbers</option>
                                        <option value="Electricians">Electricians</option>
                                        <option value="Salon">Salon</option>
                                        <option value="Painters">Painters</option>
                                        <option value="Cleaning">Cleaning</option>
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Location / City</label>
                                    <input type="text" className="input-field" placeholder="e.g. New York, NY" value={gigCity} onChange={e => setGigCity(e.target.value)} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Description</label>
                                    <textarea className="input-field" rows="4" placeholder="Detail the specific service you offer..." value={gigDesc} onChange={e => setGigDesc(e.target.value)}></textarea>
                                </div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ ...styles.formGroup, flex: 1 }}>
                                        <label style={styles.label}>Price ($)</label>
                                        <input type="number" className="input-field" placeholder="e.g. 50" value={gigPrice} onChange={e => setGigPrice(e.target.value)} />
                                    </div>
                                    <div style={{ ...styles.formGroup, flex: 1 }}>
                                        <label style={styles.label}>Price Type</label>
                                        <select className="input-field" value={gigPriceType} onChange={e => setGigPriceType(e.target.value)}>
                                            <option value="fixed">Fixed Rate</option>
                                            <option value="hourly">Hourly</option>
                                            <option value="starting_at">Starting At</option>
                                        </select>
                                    </div>
                                </div>
                                {/* Gig Thumbnail Images — up to 5 */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Gig Thumbnails
                                        <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 8 }}>
                                            ({gigImages.length}/5) — First image = main thumbnail
                                        </span>
                                    </label>

                                    {/* Thumbnail previews */}
                                    {gigImages.length > 0 && (
                                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                                            {gigImages.map((url, i) => (
                                                <div key={i} style={{ position: 'relative' }}>
                                                    <img src={url} alt={`thumb-${i}`}
                                                        style={{
                                                            width: 90, height: 70, objectFit: 'cover', borderRadius: 8,
                                                            border: i === 0 ? '2px solid var(--primary)' : '2px solid var(--border-color)'
                                                        }} />
                                                    {i === 0 && (
                                                        <span style={{
                                                            position: 'absolute', top: 4, left: 4, backgroundColor: 'var(--primary)', color: '#fff',
                                                            fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: 4
                                                        }}>MAIN</span>
                                                    )}
                                                    <button onClick={() => setGigImages(prev => prev.filter((_, idx) => idx !== i))}
                                                        style={{
                                                            position: 'absolute', top: 4, right: 4, width: 18, height: 18, background: '#dc2626', border: 'none',
                                                            borderRadius: '50%', color: '#fff', fontSize: '0.65rem', cursor: 'pointer', lineHeight: 1,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}>✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {gigImages.length < 5 && (
                                        <label style={{
                                            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                                            border: '2px dashed var(--border-color)', borderRadius: 10, padding: '12px 20px',
                                            backgroundColor: '#f9fafb', color: 'var(--text-muted)', fontSize: '0.85rem'
                                        }}>
                                            <span style={{ fontSize: '1.4rem' }}>📷</span>
                                            {uploadingGigImages ? 'Uploading…' : `Add images (${5 - gigImages.length} remaining)`}
                                            <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                                                onChange={handleGigImageUpload} disabled={uploadingGigImages} />
                                        </label>
                                    )}
                                </div>

                                <button className="btn-primary" style={{ marginTop: '8px' }} onClick={handleCreateGig} disabled={creatingGig || uploadingGigImages}>
                                    {creatingGig ? 'Publishing Gig...' : uploadingGigImages ? 'Uploading images...' : 'Publish New Gig'}
                                </button>
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
                                                    src={gig.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=ede9fe&color=4f46e5&size=60`}
                                                    alt={gig.title}
                                                    style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-color)' }}
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
                                                        color: req.status === 'pending' ? '#f59e0b' : req.status === 'confirmed' ? '#2563eb' : req.status === 'completed' ? '#059669' : '#dc2626',
                                                        backgroundColor: req.status === 'pending' ? '#fef3c7' : req.status === 'confirmed' ? '#dbeafe' : req.status === 'completed' ? '#d1fae5' : '#fee2e2',
                                                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700'
                                                    }}>{req.status.toUpperCase()}</span>
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
                                                    <>
                                                        <button onClick={() => updateBookingStatus(req._id, 'completed')} className="btn-primary" style={{ flex: 1, padding: '10px' }}>Mark Completed</button>
                                                        <button onClick={() => navigate(`/chat?provider=${req.user?._id}`)} className="btn-outline" style={{ flex: 1, padding: '10px' }}>Chat with Customer</button>
                                                    </>
                                                )}
                                                {req.status === 'completed' && (
                                                    <p style={{ color: '#059669', fontWeight: '600', fontSize: '0.9rem' }}>✓ Service has been successfully delivered</p>
                                                )}
                                                {req.status === 'cancelled' && (
                                                    <p style={{ color: '#dc2626', fontWeight: '600', fontSize: '0.9rem' }}>This booking was cancelled</p>
                                                )}
                                            </div>
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
