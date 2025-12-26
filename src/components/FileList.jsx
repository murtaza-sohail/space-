import React, { useState, useRef } from 'react';

import { useFileSystem } from '../hooks/useFileSystem';
import FileItem from './FileItem';
import FilePreview from './FilePreview';
import { ShareModal } from './ShareModal';
import { Grid, List, FolderOpen, FileX, Trash2 } from 'lucide-react';


import './FileList.css';

const FileList = () => {
    const {
        currentItems,
        currentView,
        uploadFile,
        downloadFile,
        previewFile,
        setPreviewFile,
        emptyTrash
    } = useFileSystem();

    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const [isDragOver, setIsDragOver] = useState(false);
    const [shareItemObject, setShareItemObject] = useState(null);
    const fileInputRef = useRef(null);



    const isEmpty = currentItems.folders.length === 0 && currentItems.files.length === 0;

    // Drag and drop for file upload
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileUpload(files);
        }
    };

    const handleFileUpload = async (files) => {
        const uploadedItems = await Promise.all(files.map(file => uploadFile(file)));

        // Auto-open the first uploaded file
        if (uploadedItems.length > 0) {
            setPreviewFile(uploadedItems[0]);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            handleFileUpload(files);
        }
    };


    const handleEmptyTrash = () => {
        if (confirm('Permanently delete all items from Trash? This cannot be undone.')) {
            emptyTrash();
        }
    };

    return (

        <div className="file-list-container">
            <div className="file-list-header">
                <h2 className="file-list-title">
                    {currentView === 'trash' ? 'Trash' :
                        currentView === 'recent' ? 'Recent' :
                            currentView === 'starred' ? 'Starred' : 'Files'}
                </h2>
                <div className="view-controls">
                    <button
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="List view"
                    >
                        <List size={18} />
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid view"
                    >
                        <Grid size={18} />
                    </button>

                    {currentView === 'trash' && !isEmpty && (
                        <button
                            className="empty-trash-btn"
                            onClick={handleEmptyTrash}
                            title="Empty Trash"
                        >
                            <Trash2 size={18} />
                            <span>Empty Trash</span>
                        </button>
                    )}
                </div>

            </div>

            <div
                className={`file-list ${viewMode} ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => isEmpty && currentView !== 'trash' && fileInputRef.current?.click()}
            >

                <input
                    type="file"
                    multiple
                    accept="*/*"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                />


                {isEmpty ? (
                    <div className="empty-state">
                        {currentView === 'trash' ? (
                            <>
                                <FileX size={64} className="empty-icon" />
                                <h3>Trash is empty</h3>
                                <p>Items you delete will appear here</p>
                            </>
                        ) : (
                            <div className="empty-upload-hint" onClick={() => fileInputRef.current?.click()}>
                                <FolderOpen size={64} className="empty-icon" />
                                <h3>This folder is empty</h3>
                                <p>Drag and drop files here or <strong>tap to upload</strong></p>
                            </div>
                        )}

                    </div>
                ) : (
                    <>
                        {currentItems.folders.map(folder => (
                            <FileItem
                                key={folder.id}
                                item={folder}
                                isTrash={currentView === 'trash'}
                                onShare={(sharedItem) => setShareItemObject(sharedItem)}
                            />

                        ))}
                        {currentItems.files.map(file => (
                            <FileItem
                                key={file.id}
                                item={file}
                                isTrash={currentView === 'trash'}
                                onPreview={setPreviewFile}
                                onShare={(sharedItem) => setShareItemObject(sharedItem)}
                            />

                        ))}
                    </>
                )}

                {isDragOver && (
                    <div className="drop-overlay">
                        <div className="drop-message">
                            <FolderOpen size={48} />
                            <span>Drop files to upload</span>
                        </div>
                    </div>
                )}
            </div>

            <FilePreview
                file={previewFile}
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
                onDownload={downloadFile}
            />

            <ShareModal
                isOpen={!!shareItemObject}
                onClose={() => setShareItemObject(null)}
                item={shareItemObject}
            />
        </div>

    );
};

export default FileList;
