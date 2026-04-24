import React from 'react';
import { ArrowUpRight, XCircle } from 'lucide-react';
import '../../../styles/desktop-dashboard-styles/DesktopWithdrawalModal.css';

const DesktopWithdrawalModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    amount, 
    setAmount, 
    availableBalance, 
    method, 
    setMethod, 
    details, 
    setDetails 
}) => {
    if (!isOpen) return null;

    const isOverBalance = Number(amount) > availableBalance;
    const canSubmit = amount && Number(amount) > 0 && !isOverBalance && details.trim();

    return (
        <div className="desktop-modal-overlay">
            <div className="desktop-modal-container animate-scale-in">
                <div className="withdrawal-modal-content">
                    <div className="withdrawal-icon-container">
                        <ArrowUpRight size={32} />
                    </div>
                    <h3 className="withdrawal-title">Withdraw Funds</h3>
                    <p className="withdrawal-subtitle">Request a payout to your registered bank account.</p>
                </div>
                
                <div className="balance-card">
                    <span className="balance-label">Available Balance</span>
                    <div className="balance-value">₹{availableBalance?.toLocaleString()}</div>
                </div>

                <div className="withdrawal-form-group">
                    <label className="withdrawal-label">Amount to Withdraw</label>
                    <div className="withdrawal-input-wrapper">
                        <span className="currency-prefix">₹</span>
                        <input 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className={`withdrawal-input ${isOverBalance ? 'error' : ''}`}
                        />
                    </div>
                    {isOverBalance ? (
                        <p className="withdrawal-error-msg">
                            <XCircle size={14} /> Amount exceeds available balance
                        </p>
                    ) : (
                        <p className="withdrawal-hint-msg">Withdrawals are processed within 2-3 business days.</p>
                    )}
                </div>

                <div className="withdrawal-form-group">
                    <label className="withdrawal-label">Withdrawal Method</label>
                    <div className="select-wrapper">
                        <select 
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="withdrawal-select"
                        >
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="UPI">UPI (Google Pay, PhonePe, etc.)</option>
                            <option value="Wallet">Digital Wallet</option>
                        </select>
                    </div>
                </div>

                <div className="withdrawal-form-group">
                    <label className="withdrawal-label">
                        {method === 'UPI' ? 'UPI ID' : 'Bank Account Details'}
                    </label>
                    <textarea 
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder={method === 'UPI' ? "e.g. name@upi" : "Account Number, Bank Name, IFSC Code..."}
                        className="withdrawal-textarea"
                    />
                </div>

                <div className="modal-footer-actions">
                    <button 
                        onClick={onClose}
                        className="modal-cancel-btn"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onSubmit}
                        disabled={!canSubmit}
                        className={`modal-submit-btn ${canSubmit ? 'active' : 'disabled'}`}
                    >
                        Confirm Request
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DesktopWithdrawalModal;
