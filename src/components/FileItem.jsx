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
    FolderOpen
} from 'lucide-react';
import './FileItem.css';

const FileItem = ({ item, isTrash = false, onPreview }) => {
    const {
        deleteItem,
        restoreItem,
        permanentDelete,
        renameItem,
        downloadFile,
        navigateToFolder,
        moveItem
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
                    <span className="file-item-name">{item.name}</span>
                    <span className="file-item-meta">
                        {formatDate(item.createdAt)} • {formatSize(item.size)}
                    </span>
                </div>
            </div>

            <div className="file-item-actions">
                <button
                    className="action-menu-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                >
                    <MoreVertical size={18} />
                </button>

                {showMenu && (
                    <>
                        <div className="menu-backdrop" onClick={() => setShowMenu(false)} />
                        <div className="action-menu">
                            {isTrash ? (
                                <>
                                    <button onClick={handleRestore} className="menu-item restore">
                                        <RotateCcw size={16} />
                                        <span>Restore</span>
                                    </button>
                                    <button onClick={handleDelete} className="menu-item delete">
                                        <XCircle size={16} />
                                        <span>Delete Forever</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    {!isFolder && (
                                        <button onClick={handleDownload} className="menu-item">
                                            <Download size={16} />
                                            <span>Download</span>
                                        </button>
                                    )}
                                    <button onClick={handleRename} className="menu-item">
                                        <Edit2 size={16} />
                                        <span>Rename</span>
                                    </button>
                                    <button onClick={handleDelete} className="menu-item delete">
                                        <Trash2 size={16} />
                                        <span>Move to Trash</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FileItem;
