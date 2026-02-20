import React, { useState, useEffect } from 'react';
import { User, Briefcase, Calendar as CalendarIcon, Settings, MessageSquare, BarChart, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';

const Dashboard = () => {
    const { user, login, userLocation } = useAuthStore();
    const [role, setRole] = useState(user?.role || 'customer');
    const [activeTab, setActiveTab] = useState(user?.role === 'provider' ? 'mygigs' : 'profile');

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
    const [creatingGig, setCreatingGig] = useState(false);

    useEffect(() => {
        if (user) {
            setRole(user.role);
            if (user.role === 'provider') {
                setProviderStatus(user.providerDetails?.isApproved ? 'approved' : 'pending');
                fetchMyGigs();
            }
        }
    }, [user]);

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

    const uploadFileHandler = async (e, setUrlState, isMultiple = false) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingImage(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data',
                },
            };

            if (!isMultiple) {
                const formData = new FormData();
                formData.append('image', files[0]);
                const { data } = await api.post('/api/upload', formData, config);
                setUrlState(data.url);
            } else {
                const urls = [];
                for (const file of files) {
                    const formData = new FormData();
                    formData.append('image', file);
                    const { data } = await api.post('/api/upload', formData, config);
                    urls.push(data.url);
                }
                setUrlState((prev) => [...prev, ...urls]);
            }
        } catch (error) {
            console.error('Error uploading file', error);
            alert('File upload failed');
        } finally {
            setUploadingImage(false);
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
                location: { city: gigCity || 'Remote', isRemote: !gigCity }
            }, config);

            alert("Gig submitted! It is now pending admin approval.");
            setGigTitle('');
            setGigDesc('');
            setGigPrice('');
            setGigCity('');
            setCreatingGig(false);
            fetchMyGigs(); // refresh gig list
        } catch (error) {
            console.error("Error creating gig", error);
            alert("Failed to create gig");
            setCreatingGig(false);
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
                        <img src={user?.avatar || "https://via.placeholder.com/80"} alt="Avatar" style={{ borderRadius: '50%', marginBottom: '16px', width: '80px', height: '80px' }} />
                        <h3 className="text-h3" style={{ fontSize: '1.2rem', textTransform: 'capitalize' }}>{user?.name || 'User'}</h3>
                        <p className="text-small" style={{ textTransform: 'capitalize' }}>{role} {providerStatus === 'pending' && '(Pending Approval)'}</p>
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
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Name</label>
                                <input type="text" className="input-field" defaultValue={user?.name || ''} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email Address</label>
                                <input type="email" className="input-field" defaultValue={user?.email || ''} readOnly style={{ opacity: 0.7 }} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Phone Number</label>
                                <input type="text" className="input-field" placeholder="Add phone number" />
                            </div>
                            <button className="btn-primary">Update Profile</button>
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
                                                <label style={styles.label}>Upload Shop Images {uploadingImage && <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>(Uploading...)</span>}</label>
                                                <input type="file" className="input-field" multiple onChange={(e) => uploadFileHandler(e, setShopImages, true)} disabled={uploadingImage} />
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
                            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px' }}>
                                <div className="flex-between" style={{ marginBottom: '12px' }}>
                                    <span style={{ fontWeight: '600' }}>Professional Plumbing Fixing</span>
                                    <span style={{ color: '#f59e0b', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>PENDING</span>
                                </div>
                                <div className="text-body" style={{ marginBottom: '4px' }}><CalendarIcon size={14} style={{ display: 'inline', marginRight: '8px' }} /> Oct 24, 2026 | 09:00 AM</div>
                                <div className="text-body" style={{ marginBottom: '12px' }}><MapPin size={14} style={{ display: 'inline', marginRight: '8px' }} /> 123 Main St, City</div>
                                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)', textAlign: 'right', fontWeight: 'bold' }}>$50.00</div>
                            </div>
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
                                <button className="btn-primary" style={{ marginTop: '8px' }} onClick={handleCreateGig} disabled={creatingGig}>
                                    {creatingGig ? 'Publishing Gig...' : 'Publish New Gig'}
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
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Placeholder for other tabs */}
                    {['requests', 'bids', 'messages'].includes(activeTab) && (
                        <div className="animate-fade-in flex-center" style={{ height: '300px' }}>
                            <p className="text-body">Content for {activeTab.replace('_', ' ')} will appear here.</p>
                        </div>
                    )}

                </div>
            </div>
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
