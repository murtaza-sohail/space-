import React, { useState } from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import FileItem from './FileItem';
import FilePreview from './FilePreview';
import { Grid, List, FolderOpen, FileX } from 'lucide-react';
import './FileList.css';

const FileList = () => {
    const {
        currentItems,
        currentView,
        uploadFile,
        downloadFile,
        previewFile,
        setPreviewFile
    } = useFileSystem();
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const [isDragOver, setIsDragOver] = useState(false);

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
        const uploadedItems = await Promise.all(files.map(file => uploadFile(file)));

        // Auto-open the first uploaded file
        if (uploadedItems.length > 0) {
            setPreviewFile(uploadedItems[0]);
        }
    };

    return (
        <div className="file-list-container">
            <div className="file-list-header">
                <h2 className="file-list-title">
                    {currentView === 'trash' ? 'Trash' : 'Files'}
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
                </div>
            </div>

            <div
                className={`file-list ${viewMode} ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isEmpty ? (
                    <div className="empty-state">
                        {currentView === 'trash' ? (
                            <>
                                <FileX size={64} className="empty-icon" />
                                <h3>Trash is empty</h3>
                                <p>Items you delete will appear here</p>
                            </>
                        ) : (
                            <>
                                <FolderOpen size={64} className="empty-icon" />
                                <h3>This folder is empty</h3>
                                <p>Drag and drop files here or use the upload button</p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        {currentItems.folders.map(folder => (
                            <FileItem
                                key={folder.id}
                                item={folder}
                                isTrash={currentView === 'trash'}
                            />
                        ))}
                        {currentItems.files.map(file => (
                            <FileItem
                                key={file.id}
                                item={file}
                                isTrash={currentView === 'trash'}
                                onPreview={setPreviewFile}
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
        </div>
    );
};

export default FileList;
