import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';
import {
    ArrowLeft, Mail, Phone, MapPin, Star, Eye, Map, Briefcase, 
    MessageSquare, ClipboardList, Shield, Calendar, DollarSign, 
    Info, ExternalLink, CheckCircle, XCircle, Edit, Trash2, User as UserIcon,
    Clock, ShoppingBag, Images, RotateCcw, Home, Maximize2, CreditCard
} from 'lucide-react';

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: adminUser } = useAuthStore();
    
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    // Aggregate all images from all sources with metadata
    const allUserImages = useMemo(() => {
        if (!data) return [];
        const images = [];
        
        // From provider profile (ID/Shop photos)
        if (data.user?.providerDetails?.images) {
            data.user.providerDetails.images.forEach(img => {
                images.push({ url: img, type: 'identity', source: 'Profile/Shop' });
            });
        }
        
        // From all gigs/services
        if (data.gigs) {
            data.gigs.forEach(gig => {
                if (gig.images) {
                    gig.images.forEach(img => {
                        images.push({ url: img, type: 'gig', source: `Gig: ${gig.title}`, gigId: gig._id });
                    });
                }
            });
        }
        
        // Add avatar
        if (data.user?.avatar && !data.user.avatar.includes('placeholder')) {
            images.push({ url: data.user.avatar, type: 'profile', source: 'User Avatar' });
        }

        return images;
    }, [data]);

    const [activeFilter, setActiveFilter] = useState('all');
    const [deletedImages, setDeletedImages] = useState([]);

    const handleDeleteImage = (imageUrl) => {
        setDeletedImages(prev => [...prev, imageUrl]);
    };

    const handleUndoDelete = (imageUrl) => {
        setDeletedImages(prev => prev.filter(url => url !== imageUrl));
    };

    const filteredImages = useMemo(() => {
        return allUserImages.filter(img => {
            const matchesFilter = activeFilter === 'all' || img.type === activeFilter;
            const isNotDeleted = !deletedImages.includes(img.url);
            return matchesFilter && isNotDeleted;
        });
    }, [allUserImages, activeFilter, deletedImages]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data: resData } = await api.get(`/api/admin/users/${id}/full-details`);
            setData(resData);
        } catch (err) {
            console.error("Error fetching user details", err);
            setError(err.response?.data?.message || err.message || "Failed to load user details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchDetails();
    }, [id]);

    const handleApproveProvider = async () => {
        setActionLoading('approve');
        try {
            await api.put(`/api/users/${id}/provider-status`, { isApproved: true });
            fetchDetails();
        } catch (error) {
            alert('Failed to approve provider');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectProvider = async () => {
        if (!window.confirm("Reject this provider application?")) return;
        setActionLoading('reject');
        try {
            await api.put(`/api/users/${id}/provider-status`, { isApproved: false });
            fetchDetails();
        } catch (error) {
            alert('Failed to reject provider');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async () => {
        if (!window.confirm("Delete this user permanently?")) return;
        try {
            await api.delete(`/api/users/${id}`);
            navigate('/users');
        } catch (error) {
            alert("Failed to delete user.");
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>Loading full user profile...</p>
        </div>
    );

    if (error) return (
        <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '20px', borderRadius: '12px', display: 'inline-block', maxWidth: '500px' }}>
                <h3 style={{ fontWeight: '700', marginBottom: '8px' }}>Error Loading Details</h3>
                <p>{error}</p>
                <button className="btn-primary" onClick={fetchDetails} style={{ marginTop: '16px' }}>Retry</button>
            </div>
            <div style={{ marginTop: '20px' }}>
                <button className="btn-outline" onClick={() => navigate('/users')}>Back to Users</button>
            </div>
        </div>
    );

    if (!data) return null;

    const { user, gigs, bookings, reviews } = data;

    return (
        <div style={{ paddingBottom: '60px' }}>
            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <button 
                    onClick={() => navigate('/users')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: '600', transition: 'color 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
                    onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                    <ArrowLeft size={20} /> Back to Users
                </button>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        className="btn-primary" 
                        onClick={() => window.open(`/users/${id}/gallery`, '_blank')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Images size={16} /> User Gallery
                    </button>
                    <button 
                        className="btn-outline" 
                        onClick={() => window.open(`/users/${id}/transactions`, '_blank')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                    >
                        <CreditCard size={16} /> Payments
                    </button>
                    <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Edit size={16} /> Edit Profile
                    </button>
                    <button className="btn-danger" onClick={handleDeleteUser} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trash2 size={16} /> Delete Account
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '28px', alignItems: 'flex-start' }}>
                
                {/* Left Column: Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    
                    {/* Bio & Identity Card */}
                    <div className="card" style={{ padding: '32px', display: 'flex', gap: '32px' }}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ede9fe&color=4f46e5&size=128`}
                                alt={user.name}
                                style={{ width: '128px', height: '128px', borderRadius: '24px', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                            />
                            <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', backgroundColor: '#fff', padding: '6px', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                {user.role === 'provider' ? <Shield size={24} color="#059669" fill="#d1fae5" /> : <UserIcon size={24} color="#0284c7" fill="#e0f2fe" />}
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{user.name}</h1>
                                <span style={{
                                    padding: '4px 14px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700',
                                    backgroundColor: user.role === 'admin' ? '#ede9fe' : user.role === 'provider' ? '#d1fae5' : '#e0f2fe',
                                    color: user.role === 'admin' ? '#4f46e5' : user.role === 'provider' ? '#059669' : '#0284c7',
                                    textTransform: 'uppercase', letterSpacing: '0.05em'
                                }}>{user.role}</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={18} /> {user.email}</span>
                                {user.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={18} /> {user.phone}</span>}
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={18} /> Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                            </div>
                            
                            {user.role === 'provider' && user.providerDetails?.about && (
                                <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Professional Bio</h4>
                                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#374151' }}>{user.providerDetails.about}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Locations & Live Map */}
                    <section>
                        <SectionHeader icon={<MapPin size={22} />} title="Location Intelligence & Live Map" />
                        
                        <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '20px' }}>
                            <iframe 
                                title="Live User Location"
                                width="100%" 
                                height="350" 
                                frameBorder="0" 
                                scrolling="no" 
                                marginHeight="0" 
                                marginWidth="0" 
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${user.geoCoordinates?.coordinates[0]-0.01}%2C${user.geoCoordinates?.coordinates[1]-0.01}%2C${user.geoCoordinates?.coordinates[0]+0.01}%2C${user.geoCoordinates?.coordinates[1]+0.01}&layer=mapnik&marker=${user.geoCoordinates?.coordinates[1]}%2C${user.geoCoordinates?.coordinates[0]}`}
                                style={{ border: 'none' }}
                            ></iframe>
                            <div style={{ padding: '12px 20px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <strong>Last GPS Ping:</strong> {user.geoCoordinates?.coordinates[1].toFixed(6)}, {user.geoCoordinates?.coordinates[0].toFixed(6)}
                                </div>
                                <a 
                                    href={`https://www.google.com/maps?q=${user.geoCoordinates?.coordinates[1]},${user.geoCoordinates?.coordinates[0]}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    View on Google Maps <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* Address History / Residence Log */}
                    <section>
                        <SectionHeader icon={<Home size={22} />} title="Residence History & Saved Addresses" />
                        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            {!user.addressHistory || user.addressHistory.length === 0 ? (
                                <div style={{ padding: '24px', backgroundColor: '#f9fafb' }}>
                                    <DetailBlock 
                                        label="Primary Residence" 
                                        value={user.address ? 
                                            `${user.address.street || ''}, ${user.address.city || ''}, ${user.address.state || ''} ${user.address.zipCode || user.address.pincode || ''}`.replace(/^, |, $/g, '')
                                            : 'No address on file'} 
                                    />
                                </div>
                            ) : (
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Label</th>
                                                <th>Address Details</th>
                                                <th>Status</th>
                                                <th>Map View</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {user.addressHistory?.map((addr, idx) => (
                                                <tr key={idx}>
                                                    <td><span style={{ fontWeight: '700', color: 'var(--primary)' }}>{addr?.label || 'Saved'}</span></td>
                                                    <td>{`${addr?.street || ''}, ${addr?.city || ''}, ${addr?.state || ''} ${addr?.pincode || ''}`}</td>
                                                    <td>
                                                        {addr?.isDefault && <span className="badge badge-success">Default</span>}
                                                    </td>
                                                    <td>
                                                        <a 
                                                            href={`https://www.google.com/maps?q=${encodeURIComponent(`${addr?.street || ''} ${addr?.city || ''} ${addr?.state || ''} ${addr?.pincode || ''}`)}`} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '0.8rem' }}
                                                        >
                                                            <Map size={14} /> Open Map
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Location History Array */}
                    <section>
                        <SectionHeader icon={<Clock size={22} />} title="GPS Movement History" />
                        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            {!user.locationHistory || user.locationHistory.length === 0 ? (
                                <EmptyCard message="No historical location data recorded." />
                            ) : (
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Timestamp</th>
                                                <th>Coordinates</th>
                                                <th>Estimated Address</th>
                                                <th>Map</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {user.locationHistory?.map((loc, idx) => (
                                                <tr key={idx}>
                                                    <td>{loc?.timestamp ? new Date(loc.timestamp).toLocaleString() : '—'}</td>
                                                    <td>{loc?.latitude?.toFixed(5) || '0'}, {loc?.longitude?.toFixed(5) || '0'}</td>
                                                    <td>{loc?.address || '—'}</td>
                                                    <td>
                                                        {loc?.latitude && loc?.longitude && (
                                                            <a href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`} target="_blank" rel="noreferrer">
                                                                <Map size={16} color="var(--primary)" />
                                                            </a>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Gigs & Services */}
                    {user.role === 'provider' && (
                        <section>
                            <SectionHeader icon={<Briefcase size={22} />} title={`Active Gigs & Listings (${gigs.length})`} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {gigs.length === 0 ? (
                                    <EmptyCard message="No services listed yet." />
                                ) : gigs.map(gig => (
                                    <div key={gig._id} className="card" style={{ padding: '24px' }}>
                                        <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                                            <img src={gig.images?.[0] || 'https://via.placeholder.com/150'} style={{ width: '120px', height: '120px', borderRadius: '16px', objectFit: 'cover' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>{gig.title}</h3>
                                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{gig.category} • ₹{gig.price || gig.plans?.[0]?.price || 'N/A'}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <span className={`badge ${gig.isApproved ? 'badge-success' : 'badge-warning'}`}>{gig.isApproved ? 'Approved' : 'Pending'}</span>
                                                        <span className={`badge ${gig.isActive ? 'badge-primary' : 'badge-danger'}`}>{gig.isActive ? 'Active' : 'Hidden'}</span>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.5' }}>{gig.description?.substring(0, 150)}{gig.description?.length > 150 ? '...' : ''}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Image Gallery for Gig - Show if more than 1 image (Cover image is also shown) */}
                                        {gig.images && gig.images.length > 1 && (
                                            <div>
                                                <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Project Portfolio ({gig.images.length})</h4>
                                                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                                                    {gig.images.map((img, idx) => (
                                                        <img 
                                                            key={idx} 
                                                            src={img} 
                                                            alt={`Gig ${idx}`} 
                                                            style={{ width: '100px', height: '100px', borderRadius: '10px', objectFit: 'cover', cursor: 'pointer', border: '2px solid #f3f4f6' }}
                                                            onClick={() => window.open(img, '_blank')}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}


                    {/* Bookings & Requests */}
                    <section>
                        <SectionHeader icon={<ClipboardList size={22} />} title={`Transactions & Requests (${bookings.length})`} />
                        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            {bookings.length === 0 ? (
                                <EmptyCard message="No booking history available." />
                            ) : (
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Service</th>
                                                <th>{user.role === 'provider' ? 'Customer' : 'Provider'}</th>
                                                <th>Date</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map(b => (
                                                <tr key={b._id}>
                                                    <td><strong>{b.service?.title || 'Service Deleted'}</strong></td>
                                                    <td>{user.role === 'provider' ? b.user?.name : b.provider?.name}</td>
                                                    <td>{new Date(b.date).toLocaleDateString()}</td>
                                                    <td>
                                                        <div style={{ fontWeight: '700' }}>₹{b.totalPrice}</div>
                                                        {b.paymentMode && (
                                                            <div style={{ 
                                                                fontSize: '9px', fontWeight: '800', 
                                                                color: b.paymentMode === 'Online' ? '#003d9b' : '#059669',
                                                                backgroundColor: b.paymentMode === 'Online' ? '#e0e7ff' : '#d1fae5',
                                                                padding: '1px 6px', borderRadius: '4px', display: 'inline-block'
                                                            }}>
                                                                {b.paymentMode.toUpperCase()}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700',
                                                            backgroundColor:
                                                                b.status === 'pending' ? '#fef3c7' :
                                                                b.status === 'confirmed' ? '#e0e7ff' :
                                                                b.status === 'in_progress' ? '#e0e7ff' :
                                                                b.status === 'delivered' ? '#d1fae5' :
                                                                b.status === 'completed' ? '#d1fae5' :
                                                                b.status === 'cancelled' ? '#fee2e2' :
                                                                b.status === 'revision_requested' ? '#fef3c7' : '#f1f5f9',
                                                            color:
                                                                b.status === 'pending' ? '#92400e' :
                                                                b.status === 'confirmed' ? '#003d9b' :
                                                                b.status === 'in_progress' ? '#003d9b' :
                                                                b.status === 'delivered' ? '#059669' :
                                                                b.status === 'completed' ? '#059669' :
                                                                b.status === 'cancelled' ? '#991b1b' :
                                                                b.status === 'revision_requested' ? '#92400e' : '#475569',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {b.status?.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Sidebar Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '24px' }}>
                    
                    {/* Provider Status Control */}
                    {user.role === 'provider' && !user.providerDetails?.isApproved && (
                        <div className="card" style={{ padding: '24px', backgroundColor: '#fffbeb', border: '1px solid #fcd34d' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#92400e', marginBottom: '16px' }}>
                                <Clock size={20} />
                                <h3 style={{ fontWeight: '700' }}>Pending Approval</h3>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: '#92400e', marginBottom: '20px', lineHeight: '1.5' }}>
                                This user has applied to be a provider. Review their details and gigs before granting access.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button 
                                    className="btn-success" 
                                    onClick={handleApproveProvider}
                                    disabled={actionLoading === 'approve'}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <CheckCircle size={18} /> {actionLoading === 'approve' ? 'Approving...' : 'Approve Application'}
                                </button>
                                <button 
                                    className="btn-outline" 
                                    onClick={handleRejectProvider}
                                    disabled={actionLoading === 'reject'}
                                    style={{ width: '100%', color: '#dc2626', borderColor: '#fca5a5' }}
                                >
                                    <XCircle size={18} /> Reject Application
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Summary Stats */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px' }}>User Summary</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <StatItem label="Gigs Created" value={gigs.length} icon={<Briefcase size={16} />} color="#4f46e5" />
                            <StatItem label="Total Orders" value={bookings.length} icon={<ShoppingBag size={16} />} color="#0284c7" />
                            <StatItem label="Reviews Received" value={reviews.filter(r => r.provider === id).length} icon={<Star size={16} />} color="#f59e0b" />
                            <StatItem label="Total Spent/Earned" value={`₹${bookings.reduce((acc, b) => acc + b.totalPrice, 0)}`} icon={<DollarSign size={16} />} color="#059669" />
                        </div>
                    </div>

                    {/* Recent Reviews Sidebar */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px' }}>Latest Feedback</h3>
                        {reviews.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No reviews recorded yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {reviews.slice(0, 3).map(rev => (
                                    <div key={rev._id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{rev.user?.name}</span>
                                            <div style={{ display: 'flex', color: '#f59e0b' }}>
                                                {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < rev.rating ? "#f59e0b" : "none"} />)}
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: '#4b5563', fontStyle: 'italic' }}>"{rev.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SectionHeader = ({ icon, title }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderLeft: '4px solid var(--primary)', paddingLeft: '12px' }}>
        <span style={{ color: 'var(--primary)' }}>{icon}</span>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{title}</h2>
    </div>
);

const DetailBlock = ({ label, value, icon }) => (
    <div className="card" style={{ padding: '16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
        <div style={{ fontSize: '0.95rem', color: '#111827', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {icon} {value || '—'}
        </div>
    </div>
);

const StatItem = ({ label, value, icon, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span style={{ color }}>{icon}</span> {label}
        </div>
        <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{value}</div>
    </div>
);

const EmptyCard = ({ message }) => (
    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '16px', border: '2px dashed #e5e7eb' }}>
        <Info size={32} color="#9ca3af" style={{ marginBottom: '12px' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{message}</p>
    </div>
);

export default UserDetails;
