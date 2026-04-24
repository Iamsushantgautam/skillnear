import { Wallet, DollarSign, X, XCircle, RotateCw } from 'lucide-react';
import { PC, PL } from './MobileDashboardShared';
import '../../../styles/mobile-dashboard-styles/MobileDashboardModals.css';

/* ─── Payment Modal ─── */
export function MobilePaymentModal({ isOpen, onClose, onSelect }) {
    if (!isOpen) return null;
    return (
        <div className="mobile-modal-overlay">
            <div className="mobile-modal-content animate-slide-up no-scrollbar">
                <div className="modal-handle"></div>
                <h3 className="modal-title">Service Completed?</h3>
                <p className="modal-desc">How did the customer pay for this service?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <button onClick={() => onSelect('Cash')} className="modal-option-btn">
                        <div className="modal-option-icon" style={{ background: '#ecfdf5', color: '#059669' }}><Wallet size={24} /></div>
                        <div style={{ flex: 1 }}>
                            <div className="modal-option-title">Cash Payment</div>
                            <div className="modal-option-desc">Paid directly on-site</div>
                        </div>
                    </button>
                    <button onClick={() => onSelect('Online')} className="modal-option-btn">
                        <div className="modal-option-icon" style={{ background: '#eff6ff', color: '#0052cc' }}><Wallet size={24} /></div>
                        <div style={{ flex: 1 }}>
                            <div className="modal-option-title">Online Payment</div>
                            <div className="modal-option-desc">Paid via SkillNear or UPI</div>
                        </div>
                    </button>
                    <button onClick={onClose} style={{ marginTop: 8, padding: 16, background: 'transparent', border: 'none', color: '#94a3b8', fontWeight: 800, fontSize: 14 }}>Dismiss</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Withdrawal Modal ─── */
export function MobileWithdrawalModal({ isOpen, onClose, onSubmit, amount, setAmount, availableBalance, method, setMethod, details, setDetails }) {
    if (!isOpen) return null;
    const isError = Number(amount) > availableBalance;
    return (
        <div className="mobile-modal-overlay">
            <div className="mobile-modal-content animate-slide-up no-scrollbar">
                <div className="modal-handle"></div>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: PL, color: PC, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><DollarSign size={32} /></div>
                <h3 className="modal-title">Request Withdrawal</h3>
                <p className="modal-desc">Enter the amount you'd like to withdraw. <br /><span style={{ color: PC, fontWeight: 700 }}>Available: ₹{availableBalance.toLocaleString()}</span></p>
                
                <div className="modal-amount-input-wrapper">
                    <span className="modal-currency-symbol">₹</span>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                        className={`modal-amount-input ${isError ? 'error' : ''}`} />
                    {isError && (
                        <p style={{ fontSize: 12, color: '#ef4444', fontWeight: 800, marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <XCircle size={14} /> Amount exceeds available balance
                        </p>
                    )}
                </div>

                <div style={{ marginBottom: 24 }}>
                    <label className="modal-input-label">Withdrawal Method</label>
                    <select value={method} onChange={(e) => setMethod(e.target.value)} className="modal-select">
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI (Google Pay, PhonePe, etc.)</option>
                        <option value="Wallet">Digital Wallet</option>
                    </select>
                </div>

                <div style={{ marginBottom: 32 }}>
                    <label className="modal-input-label">{method === 'UPI' ? 'UPI ID' : 'Bank Account Details'}</label>
                    <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder={method === 'UPI' ? 'e.g. name@upi' : 'Account Number, Bank Name, IFSC Code...'} className="modal-textarea" />
                </div>

                <div className="modal-action-footer">
                    <button onClick={onClose} className="modal-btn modal-btn-cancel">Cancel</button>
                    <button onClick={onSubmit} disabled={!amount || isNaN(amount) || Number(amount) <= 0 || isError || !details.trim()} className="modal-btn modal-btn-confirm" style={{ opacity: (!amount || isNaN(amount) || Number(amount) <= 0 || isError || !details.trim()) ? 0.6 : 1 }}>Confirm Withdrawal</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Revision History Modal ─── */
export function MobileRevisionHistoryModal({ isOpen, onClose, revisions }) {
    if (!isOpen) return null;
    return (
        <div className="mobile-modal-overlay">
            <div className="mobile-modal-content animate-slide-up no-scrollbar" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
                <div className="modal-handle"></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 className="modal-title" style={{ textAlign: 'left', margin: 0 }}>Revision History</h3>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {revisions && revisions.length > 0 ? (
                        revisions.map((rev, i) => (
                            <div key={i} className="revision-item">
                                <div className="revision-header">
                                    <span className="revision-number">Revision #{revisions.length - i}</span>
                                    <span className="revision-date">{new Date(rev.date).toLocaleDateString()}</span>
                                </div>
                                <p className="revision-note">{rev.note}</p>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', color: '#64748b' }}>No revisions found.</p>
                    )}
                </div>
                <button onClick={onClose} className="modal-btn modal-btn-confirm" style={{ width: '100%', marginTop: 24 }}>Close History</button>
            </div>
        </div>
    );
}

/* ─── Revision Request Modal ─── */
export function MobileRevisionModal({ isOpen, onClose, onSubmit, note, setNote, submitting }) {
    if (!isOpen) return null;
    return (
        <div className="mobile-modal-overlay">
            <div className="mobile-modal-content animate-slide-up no-scrollbar">
                <div className="modal-handle"></div>
                <h3 className="modal-title">Request Revision</h3>
                <p className="modal-desc">Please describe what changes you would like the professional to make.</p>
                <textarea 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)} 
                    placeholder="Describe your revision requirements..." 
                    className="modal-textarea" 
                    style={{ minHeight: 120, marginBottom: 24 }} 
                    disabled={submitting}
                />
                <div className="modal-action-footer">
                    <button onClick={onClose} className="modal-btn modal-btn-cancel" disabled={submitting}>Cancel</button>
                    <button 
                        onClick={onSubmit} 
                        disabled={!note.trim() || submitting} 
                        className="modal-btn modal-btn-confirm" 
                        style={{ opacity: (note.trim() && !submitting) ? 1 : 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                        {submitting ? (
                            <>
                                <RotateCw size={18} className="spin" />
                                Sending...
                            </>
                        ) : (
                            'Submit Request'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

