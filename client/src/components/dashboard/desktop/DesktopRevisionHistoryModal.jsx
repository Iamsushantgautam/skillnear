import React from 'react';
import { X } from 'lucide-react';
import '../../../styles/desktop-dashboard-styles/DesktopRevisionHistoryModal.css';

const DesktopRevisionHistoryModal = ({ isOpen, onClose, revisions }) => {
    if (!isOpen) return null;

    return (
        <div className="desktop-modal-overlay">
            <div className="desktop-modal-container animate-scale-in no-scrollbar">
                <div className="desktop-modal-header-with-subtitle">
                    <div className="header-info">
                        <h3 className="desktop-modal-title">Revision History</h3>
                        <p className="desktop-modal-subtitle">Timeline of all requested changes</p>
                    </div>
                    <button onClick={onClose} className="desktop-modal-close">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="revision-timeline">
                    {revisions && revisions.length > 0 ? (
                        [...revisions].reverse().map((rev, i) => (
                            <div key={i} className="revision-item">
                                <div className="revision-header">
                                    <span className="revision-badge">Revision #{revisions.length - i}</span>
                                    <span className="revision-date">{new Date(rev.date).toLocaleDateString()}</span>
                                </div>
                                <p className="revision-note">{rev.note}</p>
                            </div>
                        ))
                    ) : (
                        <div className="no-revisions">
                            <p>No revisions found for this booking.</p>
                        </div>
                    )}
                </div>

                <button 
                    onClick={onClose}
                    className="modal-action-button"
                >
                    Close History
                </button>
            </div>
        </div>
    );
};

export default DesktopRevisionHistoryModal;
