import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Download, Printer, ArrowLeft, CheckCircle, MapPin, Calendar, Clock, CreditCard, User, Scissors, Wrench, ShieldCheck, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

const Invoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const { data } = await api.get(`/api/bookings/${id}`);
                setBooking(data);
            } catch (err) {
                console.error("Error fetching invoice details", err);
                toast.error("Failed to load invoice");
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
                <div className="animate-spin" style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTop: '4px solid #4f46e5', borderRadius: '50%' }}></div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', gap: 16 }}>
                <ShieldCheck size={64} color="#94a3b8" />
                <h2 style={{ color: '#1e293b', fontWeight: 800 }}>Invoice not found</h2>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Back to Dashboard</button>
            </div>
        );
    }

    const PC = '#4f46e5';
    const total = booking.price || booking.totalPrice || 0;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
            <style>{`
                @media print {
                    nav, footer, header, .navbar, .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; margin: 0 !important; }
                    .invoice-card { 
                        box-shadow: none !important; 
                        border: none !important; 
                        padding: 0 !important; 
                        margin: 0 !important; 
                        width: 100% !important; 
                        max-width: 100% !important;
                        border-radius: 0 !important;
                        position: relative !important;
                    }
                    .header-branding { padding: 20px 30px !important; }
                    .invoice-body { padding: 20px 30px !important; position: relative; z-index: 1; }
                    .info-grid { margin-bottom: 15px !important; gap: 15px !important; }
                    .service-summary { margin-bottom: 15px !important; padding: 12px !important; }
                    .total-box { margin-top: 5px !important; padding-top: 10px !important; border-top: 1px solid #eee !important; }
                    h1 { font-size: 20px !important; margin: 0 !important; }
                    h2, h3 { font-size: 16px !important; margin-bottom: 5px !important; }
                    p, div { font-size: 12px !important; line-height: 1.4 !important; }
                    .no-print-mobile { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    @page { margin: 1cm; size: auto; }
                    body { zoom: 0.95; }
                    .print-watermark {
                        display: block !important;
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(-45deg);
                        font-size: 80px;
                        font-weight: 950;
                        color: rgba(0, 0, 0, 0.035);
                        white-space: nowrap;
                        pointer-events: none;
                        z-index: 0;
                        text-transform: uppercase;
                        letter-spacing: 10px;
                    }
                }
                .print-watermark { display: none; }
                .invoice-card {
                    max-width: 900px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 24px;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05);
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                    position: relative;
                }
                @media (max-width: 768px) {
                    .invoice-card { border-radius: 0; margin: -20px; width: calc(100% + 40px); border: none; }
                    .header-branding { padding: 32px 20px !important; }
                    .invoice-body { padding: 32px 20px !important; }
                    .info-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
                    .service-summary { padding: 20px !important; flex-direction: column; align-items: flex-start !important; }
                    .service-img { width: 100% !important; height: 180px !important; margin-bottom: 16px; }
                    .total-box { width: 100% !important; }
                }
            `}</style>

            <div className="no-print" style={{ maxWidth: 900, margin: '0 auto 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
                >
                    <ArrowLeft size={18} /> Back
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={handlePrint}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', padding: '10px 16px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
                    >
                        <Printer size={18} /> <span className="no-print-mobile">Print</span>
                    </button>

                </div>
            </div>

            <div className="invoice-card">
                {/* Print Watermark */}
                <div className="print-watermark">SkillNear Official</div>

                {/* Header Branding */}
                <div className="header-branding" style={{ background: `linear-gradient(135deg, ${PC} 0%, #312e81 100%)`, padding: '48px', color: 'white', position: 'relative' }}>
                    <div style={{ position: 'absolute', right: 48, top: '50%', transform: 'translateY(-50%)', opacity: 0.1 }} className="no-print-mobile">
                        <ShieldCheck size={120} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: '-0.03em' }}>SkillNear</h1>
                            <p style={{ opacity: 0.8, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4, fontWeight: 700 }}>Service Receipt</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8 }}>ID</div>
                            <div style={{ fontSize: 16, fontWeight: 900 }}>#{booking._id.slice(-8).toUpperCase()}</div>
                        </div>
                    </div>
                </div>

                <div className="invoice-body" style={{ padding: '48px' }}>
                    {/* Top Info Grid */}
                    <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 48 }}>
                        <div>
                            <h4 style={{ color: '#94a3b8', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Customer</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PC }}>
                                    <User size={18} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 14 }}>{booking.user?.name}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>{booking.user?.email || 'customer@skillnear.com'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: '#64748b', fontSize: 12, marginTop: 12 }}>
                                <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                                <span>{typeof booking.address === 'object' ? `${booking.address?.street}, ${booking.address?.city}` : (booking.address || 'Standard Location')}</span>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ color: '#94a3b8', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Professional</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                                    <Wrench size={18} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 14 }}>{booking.provider?.name}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>SkillNear Partner</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>Date</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{new Date(booking.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>Payment</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}>
                                        <CheckCircle size={14} /> {booking.paymentMode || booking.paymentMethod || 'Online'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service Summary */}
                    <div className="service-summary" style={{ border: '1px solid #f1f5f9', borderRadius: 20, padding: '24px', marginBottom: 48, background: '#f8fafc', display: 'flex', alignItems: 'center', gap: 20 }}>
                        <img
                            className="service-img"
                            src={booking.service?.images?.[0]?.url || booking.service?.images?.[0] || 'https://via.placeholder.com/100'}
                            style={{ width: 100, height: 75, borderRadius: 12, objectFit: 'cover', border: '1px solid #e2e8f0' }}
                            alt=""
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 16 }}>{booking.service?.title}</div>
                            <div style={{ color: '#64748b', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {booking.slot?.split('|')[0] || 'Scheduled'}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {booking.slot?.split('|')[1] || 'Completed'}</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 18, fontWeight: 900, color: '#1e293b' }}>₹{total}</div>
                            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Standard Fare</div>
                        </div>
                    </div>

                    {/* Totals */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div className="total-box" style={{ width: 300, borderTop: '2px solid #f1f5f9', paddingTop: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Total Paid</span>
                                <span style={{ fontSize: 28, fontWeight: 900, color: PC }}>₹{total}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div style={{ marginTop: 60, paddingTop: 32, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                        <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
                            This is a computer generated receipt. For any assistance, reach out to us at <span style={{ color: PC, fontWeight: 700 }}>support@skillnear.com</span>
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 20, opacity: 0.3 }}>
                            <ShieldCheck size={18} />
                            <CreditCard size={18} />
                            <Receipt size={18} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="no-print" style={{ textAlign: 'center', marginTop: 32, color: '#94a3b8', fontSize: 11, fontWeight: 500 }}>
                © 2024 SkillNear Technologies. Helping you find local experts.
            </div>
        </div>
    );
};

export default Invoice;
