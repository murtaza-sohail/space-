import React, { useState } from 'react';
import { X, Link, Copy, Check, Users, Shield } from 'lucide-react';
import './ShareModal.css';

export const ShareModal = ({ isOpen, onClose, item }) => {
    const [copied, setCopied] = useState(false);
    const [access, setAccess] = useState('restricted');

    if (!isOpen || !item) return null;

    const shareUrl = `${window.location.origin}/share/${item.id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal share-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Share "{item.name}"</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="share-section">
                        <div className="share-input-container">
                            <Users size={20} className="share-input-icon" />
                            <input
                                type="text"
                                placeholder="Add people, groups, and calendar events"
                                className="share-input"
                            />
                        </div>
                    </div>

                    <div className="share-access-section">
                        <div className="access-header">
                            <Shield size={20} />
                            <h3>General access</h3>
                        </div>
                        <div className="access-options">
                            <select
                                value={access}
                                onChange={(e) => setAccess(e.target.value)}
                                className="access-select"
                            >
                                <option value="restricted">Restricted</option>
                                <option value="anyone">Anyone with the link</option>
                            </select>
                            <p className="access-hint">
                                {access === 'restricted'
                                    ? 'Only people with access can open with the link'
                                    : 'Anyone on the internet with the link can view'}
                            </p>
                        </div>
                    </div>

                    <div className="share-link-section">
                        <div className="link-info">
                            <Link size={20} />
                            <div className="link-text-container">
                                <h4>Copy link</h4>
                                <p className="link-url">{shareUrl}</p>
                            </div>
                        </div>
                        <button className="copy-link-btn" onClick={handleCopy}>
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            <span>{copied ? 'Copied!' : 'Copy link'}</span>
                        </button>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-primary" onClick={onClose}>Done</button>
                </div>
            </div>
        </div>
    );
};
