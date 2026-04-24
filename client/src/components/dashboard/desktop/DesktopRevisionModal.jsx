import React from 'react';
import { RotateCw } from 'lucide-react';
import '../../../styles/desktop-dashboard-styles/DesktopRevisionModal.css';

const DesktopRevisionModal = ({ isOpen, onClose, onSubmit, note, setNote, submitting }) => {
    if (!isOpen) return null;

    return (
        <div className="desktop-modal-overlay">
            <div className="desktop-modal-container animate-scale-in">
                <div className="revision-modal-content">
                    <div className="revision-icon-container">
                        <RotateCw size={32} className={submitting ? 'spin' : ''} />
                    </div>
                    <h3 className="revision-title">Request Revision</h3>
                    <p className="revision-subtitle">Tell the professional what needs to be changed.</p>
                </div>
                
                <div className="revision-form-group">
                    <label className="revision-label">Revision Instructions</label>
                    <textarea 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Please describe the changes you'd like to see..."
                        className="revision-textarea"
                        disabled={submitting}
                    />
                </div>

                <div className="modal-footer-actions">
                    <button 
                        onClick={onClose}
                        className="modal-cancel-btn"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onSubmit}
                        disabled={!note.trim() || submitting}
                        className={`modal-submit-btn ${note.trim() && !submitting ? 'active' : 'disabled'}`}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        {submitting ? (
                            <>
                                <RotateCw size={20} className="spin" />
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
};

export default DesktopRevisionModal;
