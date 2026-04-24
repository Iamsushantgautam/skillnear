import React from 'react';
import { X, Wallet, CreditCard } from 'lucide-react';
import '../../../styles/desktop-dashboard-styles/DesktopPaymentModal.css';

const DesktopPaymentModal = ({ isOpen, onClose, onSelect, title, description }) => {
    if (!isOpen) return null;

    return (
        <div className="desktop-modal-overlay">
            <div className="desktop-modal-container animate-scale-in">
                <div className="desktop-modal-header">
                    <h3 className="desktop-modal-title">{title || 'Service Completed?'}</h3>
                    <button onClick={onClose} className="desktop-modal-close">
                        <X size={18} />
                    </button>
                </div>
                <p className="desktop-modal-description">
                    {description || 'Select the payment method used by the customer to finalize this order.'}
                </p>

                <div className="desktop-payment-options">
                    <button
                        onClick={() => onSelect('Cash')}
                        className="desktop-payment-option"
                    >
                        <div className="desktop-payment-icon cash">
                            <Wallet size={20} />
                        </div>
                        <div className="desktop-payment-info">
                            <div className="desktop-payment-name">Cash Payment</div>
                            <div className="desktop-payment-detail">Paid directly to professional</div>
                        </div>
                    </button>

                    <button
                        onClick={() => onSelect('Online')}
                        className="desktop-payment-option"
                    >
                        <div className="desktop-payment-icon online">
                            <CreditCard size={20} />
                        </div>
                        <div className="desktop-payment-info">
                            <div className="desktop-payment-name">Online Payment</div>
                            <div className="desktop-payment-detail">Paid via app or bank transfer</div>
                        </div>
                    </button>

                    <button
                        onClick={onClose}
                        className="desktop-payment-cancel"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DesktopPaymentModal;
