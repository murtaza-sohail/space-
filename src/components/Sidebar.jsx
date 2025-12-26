import React from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import { formatBytes, getStoragePercentage } from '../services/storageService';
import { Cloud, Home, Trash2, Upload, FolderPlus, Clock, Star } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ setIsUploadOpen, setIsCreateFolderOpen, setIsLoginOpen, isOpen, onClose }) => {
    const { usedStorage, currentView, setCurrentView, navigateToFolder, user, logout, isSaving } = useFileSystem();


    const TOTAL_STORAGE = 10000 * 1024 * 1024 * 1024 * 1024;
    const percentage = getStoragePercentage(usedStorage);

    const handleCreateFolder = () => {
        setIsCreateFolderOpen(true);
    };

    const handleNavToHome = () => {
        navigateToFolder(null);
    };

    return (
        <>
            {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

                <div className="sidebar-header">
                    <Cloud size={32} className="logo-icon" />
                    <h1>CloudVault</h1>
                </div>

                <div className="sidebar-nav">
                    <button
                        className={`nav-item ${currentView === 'files' ? 'active' : ''}`}
                        onClick={handleNavToHome}
                    >
                        <Home size={20} />
                        <span>My Cloud</span>
                    </button>

                    <button
                        className={`nav-item ${currentView === 'recent' ? 'active' : ''}`}
                        onClick={() => setCurrentView('recent')}
                    >
                        <Clock size={20} />
                        <span>Recent</span>
                    </button>

                    <button
                        className={`nav-item ${currentView === 'starred' ? 'active' : ''}`}
                        onClick={() => setCurrentView('starred')}
                    >
                        <Star size={20} />
                        <span>Starred</span>
                    </button>

                    <button
                        className={`nav-item ${currentView === 'trash' ? 'active' : ''}`}
                        onClick={() => setCurrentView('trash')}
                    >
                        <Trash2 size={20} />
                        <span>Trash</span>
                    </button>
                </div>


                <div className="sidebar-actions">
                    <button className="action-btn primary" onClick={() => setIsUploadOpen(true)}>
                        <Upload size={18} />
                        <span>Upload Files</span>
                    </button>

                    <button className="action-btn secondary" onClick={handleCreateFolder}>
                        <FolderPlus size={18} />
                        <span>Create Folder</span>
                    </button>

                    <div className="sidebar-identity-section">
                        {user ? (
                            <div className="user-profile active">
                                <img src={user.avatar} alt="Avatar" className="user-avatar" />
                                <div className="user-info">
                                    <span className="user-name">{user.name}</span>
                                    <button className="logout-btn" onClick={logout}>Sign Out</button>
                                </div>
                            </div>
                        ) : (
                            <button className="link-account-btn highlight" onClick={() => setIsLoginOpen(true)}>
                                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="google-icon-micro" />
                                <span>Link Google Account</span>
                            </button>
                        )}
                    </div>
                </div>


                <div className="storage-info">
                    <div className="storage-watermark">{user ? 'CLOUD SYNC' : 'LOCAL ONLY'}</div>
                    <div className="storage-header">
                        <span className="storage-label">Storage</span>
                        <span className="storage-used">{formatBytes(usedStorage)}</span>
                    </div>
                    <div className="storage-bar">
                        <div className="storage-fill" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <div className="storage-total">{formatBytes(TOTAL_STORAGE)} Total</div>
                    {user && (
                        <div className={`sync-status active ${isSaving ? 'saving' : ''}`}>
                            <Cloud size={14} className={isSaving ? 'spin-slow' : ''} />
                            <span>{isSaving ? 'Saving to Cloud...' : `Synced to Google Storage: ${user.email}`}</span>
                        </div>
                    )}

                </div>


            </aside>
        </>
    );
};



export default Sidebar;
