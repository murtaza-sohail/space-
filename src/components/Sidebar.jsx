import React from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import { formatBytes, getStoragePercentage } from '../services/storageService';
import { Cloud, Home, Trash2, Upload, FolderPlus } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ setIsUploadOpen }) => {
    const { usedStorage, currentView, setCurrentView, createFolder, navigateToFolder } = useFileSystem();
    const TOTAL_STORAGE = 10000 * 1024 * 1024 * 1024 * 1024;
    const percentage = getStoragePercentage(usedStorage);

    const handleCreateFolder = () => {
        const name = prompt('Enter folder name:');
        if (name && name.trim()) {
            createFolder(name.trim());
        }
    };

    const handleNavToHome = () => {
        navigateToFolder(null);
    };

    return (
        <aside className="sidebar">
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
            </div>

            <div className="storage-info">
                <div className="storage-watermark">SECURED</div>
                <div className="storage-header">
                    <span className="storage-label">Storage</span>
                    <span className="storage-used">{formatBytes(usedStorage)}</span>
                </div>
                <div className="storage-bar">
                    <div className="storage-fill" style={{ width: `${percentage}%` }}></div>
                </div>
                <div className="storage-total">{formatBytes(TOTAL_STORAGE)} Total</div>
            </div>
        </aside>
    );
};

export default Sidebar;
