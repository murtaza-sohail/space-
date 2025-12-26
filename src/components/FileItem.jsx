import React, { useState } from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import {
    Folder,
    File,
    Image,
    Video,
    Music,
    MoreVertical,
    Download,
    Trash2,
    Edit2,
    RotateCcw,
    XCircle,
    FolderOpen,
    Share2,
    Star
} from 'lucide-react';


import './FileItem.css';

const FileItem = ({ item, isTrash = false, onPreview, onShare }) => {
    const {
        deleteItem,
        restoreItem,
        permanentDelete,
        renameItem,
        downloadFile,
        navigateToFolder,
        moveItem,
        shareItem,
        toggleStar
    } = useFileSystem();



    const [showMenu, setShowMenu] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isDropTarget, setIsDropTarget] = useState(false);

    const isFolder = item.type === 'folder';

    const getIcon = () => {
        if (isFolder) return <Folder size={24} className="item-icon folder-icon" />;

        // Show thumbnail for images using data URL
        if (item.type === 'image' && item.fileDataUrl) {
            return <img src={item.fileDataUrl} alt={item.name} className="item-thumbnail" />;
        }

        switch (item.type) {
            case 'image':
                return <Image size={24} className="item-icon image-icon" />;
            case 'video':
                return <Video size={24} className="item-icon video-icon" />;
            case 'audio':
                return <Music size={24} className="item-icon audio-icon" />;
            default:
                return <File size={24} className="item-icon file-icon" />;
        }
    };

    const handleClick = () => {
        if (isFolder && !isTrash) {
            navigateToFolder(item.id);
        } else if (!isFolder && !isTrash && onPreview) {
            // Open file preview for non-folder items
            onPreview(item);
        }
    };

    const handleRename = () => {
        const newName = prompt('Enter new name:', item.name);
        if (newName && newName.trim() && newName !== item.name) {
            renameItem(item.id, item.type, newName.trim());
        }
        setShowMenu(false);
    };

    const handleDelete = () => {
        if (isTrash) {
            if (confirm(`Permanently delete "${item.name}"? This cannot be undone.`)) {
                permanentDelete(item.id, item.type);
            }
        } else {
            deleteItem(item.id, item.type);
        }
        setShowMenu(false);
    };

    const handleRestore = () => {
        restoreItem(item.id, item.type);
        setShowMenu(false);
    };

    const handleDownload = () => {
        if (!isFolder) {
            downloadFile(item);
        }
        setShowMenu(false);
    };

    // Drag and Drop handlers
    const handleDragStart = (e) => {
        if (isTrash) return;
        setIsDragging(true);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('itemId', item.id);
        e.dataTransfer.setData('itemType', item.type);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        if (!isFolder || isTrash) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDropTarget(true);
    };

    const handleDragLeave = () => {
        setIsDropTarget(false);
    };

    const handleDrop = (e) => {
        if (!isFolder || isTrash) return;
        e.preventDefault();
        setIsDropTarget(false);

        const draggedItemId = e.dataTransfer.getData('itemId');
        const draggedItemType = e.dataTransfer.getData('itemType');

        if (draggedItemId && draggedItemId !== item.id) {
            moveItem(draggedItemId, draggedItemType, item.id);
        }
    };

    const handleShare = (e) => {
        e.stopPropagation();
        if (onShare) {
            onShare(item);
        } else {
            shareItem(item.id, item.type);
        }
    };

    const handleToggleStar = (e) => {
        e.stopPropagation();
        toggleStar(item.id, item.type);
    };

    const formatDate = (timestamp) => {


        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatSize = (bytes) => {
        if (!bytes) return '-';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div
            className={`file-item ${isDragging ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''}`}
            draggable={!isTrash}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="file-item-main" onClick={handleClick}>
                {getIcon()}
                <div className="file-item-info">
                    <div className="file-item-name-row">
                        <span className="file-item-name">{item.name}</span>
                        {item.isStarred && <Star size={14} className="starred-indicator" />}
                        {item.isShared && <Share2 size={14} className="shared-indicator" />}
                    </div>

                    <span className="file-item-meta">
                        {formatDate(item.createdAt)} • {formatSize(item.size)}
                    </span>
                </div>

            </div>

            <div className="file-item-actions permanent-actions">
                {isTrash ? (
                    <>
                        <button onClick={handleRestore} className="action-icon-btn restore" title="Restore">
                            <RotateCcw size={18} />
                        </button>
                        <button onClick={handleDelete} className="action-icon-btn delete" title="Delete Permanently">
                            <XCircle size={18} />
                        </button>
                    </>
                ) : (
                    <>
                        {!isFolder && (
                            <button onClick={handleDownload} className="action-icon-btn" title="Download">
                                <Download size={18} />
                            </button>
                        )}
                        <button onClick={handleShare} className={`action-icon-btn ${item.isShared ? 'active' : ''}`} title="Share">
                            <Share2 size={18} />
                        </button>
                        <button onClick={handleToggleStar} className={`action-icon-btn ${item.isStarred ? 'active' : ''}`} title="Star">
                            <Star size={18} fill={item.isStarred ? "currentColor" : "none"} />
                        </button>
                        <button onClick={handleRename} className="action-icon-btn" title="Rename">

                            <Edit2 size={18} />
                        </button>

                        <button onClick={handleDelete} className="action-icon-btn delete" title="Move to Trash">
                            <Trash2 size={18} />
                        </button>
                    </>
                )}
            </div>

        </div>
    );
};

export default FileItem;
