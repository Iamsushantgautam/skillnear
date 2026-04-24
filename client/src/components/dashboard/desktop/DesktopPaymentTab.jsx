import React from 'react';
import { 
    Wallet, 
    BarChart, 
    ArrowDownLeft, 
    Clock, 
    Loader 
} from 'lucide-react';
import '../../../styles/desktop-dashboard-styles/DesktopPaymentTab.css';

const DesktopPaymentTab = ({
    role,
    stats,
    myBookings,
    bookingRequests,
    withdrawals,
    withdrawalsLoading,
    setShowWithdrawModal,
    setWithdrawalAmount
}) => {
    // Calculate values for customer role
    const totalInvested = (myBookings || [])
        .filter(b => b?.status === 'completed')
        .reduce((sum, b) => sum + (b.totalPrice || b.price || 0), 0);
    
    const activeServicesCount = (myBookings || [])
        .filter(b => ['pending', 'confirmed', 'in_progress'].includes(b?.status || ''))
        .length;

    const availableForWithdrawal = (stats?.totalEarnings || 0) - (stats?.withdrawnAmount || 0) - (stats?.pendingWithdrawnAmount || 0);

    const transactions = (role === 'provider' ? (bookingRequests || []) : (myBookings || []))
        .filter(b => b?.paymentStatus === 'paid' || b?.status === 'completed');

    return (
        <div className="payment-container animate-fade-in">
            <div className="payment-stats-grid">
                {/* Balance Overview */}
                <div className={`balance-card ${role === 'provider' ? 'provider' : 'customer'}`}>
                    <div className="balance-icon-bg">
                        <Wallet size={120} />
                    </div>
                    <div className="balance-content">
                        <p className="balance-label">
                            {role === 'provider' ? 'Total Earnings' : 'Total Invested'}
                        </p>
                        <h2 className="balance-amount">
                            ₹{role === 'provider' ? (stats?.totalEarnings?.toLocaleString() || '0') : totalInvested.toLocaleString()}
                        </h2>
                    </div>
                    
                    {role === 'provider' ? (
                        <div className="withdrawal-section">
                            <div className="withdrawal-info">
                                <span>Available for Withdrawal</span>
                                <span>₹{availableForWithdrawal.toLocaleString()}</span>
                            </div>
                            <button 
                                onClick={() => {
                                    setShowWithdrawModal(true);
                                    setWithdrawalAmount('');
                                }}
                                className="btn-withdraw"
                            >
                                WITHDRAW
                            </button>
                        </div>
                    ) : (
                        <div className="customer-stats-row">
                            <div className="customer-stat-box">
                                <span>Completed Projects</span>
                                <span>{myBookings.filter(b => b.status === 'completed').length}</span>
                            </div>
                            <div className="customer-stat-box">
                                <span>Active Services</span>
                                <span>{activeServicesCount}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="mini-stat-card">
                    <div className="stat-icon-container" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                        <BarChart size={24} />
                    </div>
                    <div className="stat-details">
                        <p>{role === 'provider' ? 'Gross Earnings' : 'Total Portfolio'}</p>
                        <h4>₹{role === 'provider' ? (stats?.grossEarnings || 0).toLocaleString() : (stats?.totalEarnings || 0).toLocaleString()}</h4>
                        {role === 'provider' && <p className="stat-subtext">(Paid + Pending)</p>}
                    </div>
                </div>

                <div className="mini-stat-card">
                    <div className="stat-icon-container" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                        <ArrowDownLeft size={24} />
                    </div>
                    <div className="stat-details">
                        <p>{role === 'provider' ? 'Total Withdrawn' : 'Spent'}</p>
                        <h4>₹{role === 'provider' ? (stats?.withdrawnAmount || 0).toLocaleString() : '0'}</h4>
                    </div>
                </div>

                <div className="mini-stat-card">
                    <div className="stat-icon-container" style={{ backgroundColor: '#fff7ed', color: '#f97316' }}>
                        <Clock size={24} />
                    </div>
                    <div className="stat-details">
                        <p>{role === 'provider' ? 'Pending Payout' : 'Owed'}</p>
                        <h4>₹{role === 'provider' ? (stats?.pendingWithdrawnAmount || 0).toLocaleString() : '0'}</h4>
                    </div>
                </div>
            </div>

            <div className={`payment-history-grid ${role === 'provider' ? 'provider' : 'customer'}`}>
                {/* Transaction History */}
                <div className="history-card">
                    <h3>Recent Transactions</h3>
                    <div className="history-table-container no-scrollbar">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Details</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No transactions found</td>
                                    </tr>
                                ) : (
                                    transactions.slice(0, 10).map((tx, idx) => (
                                        <tr key={idx}>
                                            <td>
                                            <div className="tx-title">{tx?.service?.title || 'Service Payment'}</div>
                                                <div className="tx-date">{tx?.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A'}</div>
                                            </td>
                                            <td>
                                                <div className={`tx-amount ${role === 'provider' ? 'positive' : 'negative'}`}>
                                                    {role === 'provider' ? '+' : '-'}₹{tx.totalPrice || tx.price}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge-mini ${tx.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
                                                    {tx.paymentStatus || 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Withdrawal History (Provider Only) */}
                {role === 'provider' && (
                    <div className="history-card">
                        <h3>Withdrawal Requests</h3>
                        <div className="history-table-container no-scrollbar">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {withdrawalsLoading ? (
                                        <tr>
                                            <td colSpan="3" style={{ padding: '40px', textAlign: 'center' }}>
                                                <Loader size={20} className="animate-spin" />
                                            </td>
                                        </tr>
                                    ) : (withdrawals || []).length === 0 ? (
                                        <tr>
                                            <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                                No withdrawal requests
                                            </td>
                                        </tr>
                                    ) : (
                                        (withdrawals || []).map((w, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                                                        {new Date(w.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="tx-amount" style={{ color: '#1e293b' }}>
                                                        ₹{w.amount?.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge-mini withdrawal-${w.status === 'successful' ? 'successful' : (w.status === 'pending' ? 'pending' : 'failed')}`}>
                                                        {w.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DesktopPaymentTab;
