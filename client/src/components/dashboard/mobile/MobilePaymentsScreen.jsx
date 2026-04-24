import React, { useState } from 'react';
import { Wallet, TrendingUp, CheckCircle, Clock, XCircle, DollarSign, Loader, History } from 'lucide-react';
import { PC, Shell } from './MobileDashboardShared';
import '../../../styles/mobile-dashboard-styles/MobilePaymentsScreen.css';

export default function MobilePaymentsScreen({ stats, bookingRequests, setActiveTab, onWithdrawClick, withdrawals, withdrawalsLoading }) {
    const transactions = (bookingRequests || []).filter(b => b?.paymentStatus === 'paid' || b?.status === 'completed');
    const [view, setView] = useState('transactions');
    const availableBalance = ((stats?.totalEarnings || 0) - (stats?.withdrawnAmount || 0) - (stats?.pendingWithdrawnAmount || 0));

    return (
        <Shell title="Wallet & Payments" onBack={() => setActiveTab('overview')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 100 }}>
                <div className="earnings-card">
                    <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1 }}><Wallet size={120} color="white" /></div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <span className="earnings-label">Available for Withdrawal</span>
                        <h2 className="earnings-amount">₹{availableBalance.toLocaleString()}</h2>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 14px', borderRadius: 16, flex: 1 }}>
                                <span style={{ display: 'block', fontSize: 9, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>Pending</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>₹{(stats?.pendingWithdrawnAmount || 0).toLocaleString()}</span>
                            </div>
                            <button onClick={onWithdrawClick} className="withdraw-btn">Withdraw</button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    <div className="transaction-card" style={{ padding: 20 }}>
                        <div className="transaction-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}><TrendingUp size={24} /></div>
                        <div>
                            <p style={{ fontSize: 10, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.5px' }}>Gross Earnings (Paid + Pending)</p>
                            <h4 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>₹{stats?.grossEarnings?.toLocaleString() || '0'}</h4>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="transaction-card" style={{ padding: 16, flexDirection: 'column', alignItems: 'flex-start' }}>
                            <p style={{ fontSize: 9, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Total Withdrawn</p>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>₹{stats?.withdrawnAmount?.toLocaleString() || '0'}</h4>
                        </div>
                        <div className="transaction-card" style={{ padding: 16, flexDirection: 'column', alignItems: 'flex-start' }}>
                            <p style={{ fontSize: 9, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Pending Payout</p>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f59e0b', margin: 0 }}>₹{stats?.pendingWithdrawnAmount?.toLocaleString() || '0'}</h4>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', background: '#f1f5f9', padding: 4, borderRadius: 14, marginTop: 8 }}>
                    <button onClick={() => setView('transactions')} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: view === 'transactions' ? 'white' : 'transparent', color: view === 'transactions' ? PC : '#64748b', fontWeight: 800, fontSize: 13, boxShadow: view === 'transactions' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>Transactions</button>
                    <button onClick={() => setView('withdrawals')} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: view === 'withdrawals' ? 'white' : 'transparent', color: view === 'withdrawals' ? PC : '#64748b', fontWeight: 800, fontSize: 13, boxShadow: view === 'withdrawals' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>Withdrawals</button>
                </div>

                <div className="transaction-list">
                    {view === 'transactions' ? (
                        transactions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: 28, border: '1px dashed #e2e8f0' }}>
                                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><History size={24} color="#cbd5e1" /></div>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>No successful transactions yet.</p>
                            </div>
                        ) : (
                            transactions.map((tx, idx) => (
                                <div key={idx} className="transaction-card">
                                    <div className="transaction-icon-wrapper transaction-icon-credit"><CheckCircle size={20} /></div>
                                    <div className="transaction-info">
                                        <h4 className="transaction-name">{tx.service?.title || 'Service Payment'}</h4>
                                        <p className="transaction-date">{new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {tx.paymentMode || 'Online'} · {tx.user?.name || 'Customer'}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p className="transaction-amount transaction-amount-credit">+₹{tx.totalPrice?.toLocaleString()}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: 9, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>{tx.paymentStatus}</p>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        withdrawalsLoading ? (
                            <div style={{ textAlign: 'center', padding: 40 }}><Loader className="animate-spin" /></div>
                        ) : (withdrawals || []).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: 28, border: '1px dashed #e2e8f0' }}>
                                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><DollarSign size={24} color="#cbd5e1" /></div>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>No withdrawal history yet.</p>
                            </div>
                        ) : (
                            (withdrawals || []).map((w, idx) => (
                                <div key={idx} className="transaction-card">
                                    <div className={`transaction-icon-wrapper ${w.status === 'successful' ? 'transaction-icon-credit' : (w.status === 'pending' ? 'transaction-icon-pending' : 'transaction-icon-debit')}`} 
                                         style={{ background: w.status === 'successful' ? '#f0fdf4' : (w.status === 'pending' ? '#fffbeb' : '#fef2f2'), color: w.status === 'successful' ? '#10b981' : (w.status === 'pending' ? '#f59e0b' : '#ef4444') }}>
                                        {w.status === 'successful' ? <CheckCircle size={20} /> : (w.status === 'pending' ? <Clock size={20} /> : <XCircle size={20} />)}
                                    </div>
                                    <div className="transaction-info">
                                        <h4 className="transaction-name">Payout Request</h4>
                                        <p className="transaction-date">{w.createdAt ? new Date(w.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p className="transaction-amount" style={{ color: '#1e293b' }}>-₹{w.amount?.toLocaleString()}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: 9, fontWeight: 900, color: w.status === 'successful' ? '#10b981' : (w.status === 'pending' ? '#f59e0b' : '#ef4444'), textTransform: 'uppercase' }}>{w.status}</p>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>
        </Shell>
    );
}
