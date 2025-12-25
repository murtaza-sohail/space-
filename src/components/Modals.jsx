import React, { useState, useRef } from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import { X, Upload, File, CheckCircle } from 'lucide-react';
import './Modals.css';

export const UploadModal = ({ isOpen, onClose }) => {
    const { uploadFile, setPreviewFile } = useFileSystem();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        // Upload all files and wait for completion
        const uploadedItems = await Promise.all(selectedFiles.map(file => uploadFile(file)));

        setUploadedFiles(selectedFiles);

        // Auto-open the first uploaded file
        if (uploadedItems.length > 0) {
            setPreviewFile(uploadedItems[0]);
        }

        setTimeout(() => {
            setSelectedFiles([]);
            setUploadedFiles([]);
            onClose();
        }, 1500);
    };

    const formatSize = (bytes) => {
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Upload Files</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <div
                        className="upload-dropzone"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload size={48} className="upload-icon" />
                        <p className="upload-text">Drag and drop files here</p>
                        <p className="upload-subtext">or click to browse</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {selectedFiles.length > 0 && (
                        <div className="file-preview-list">
                            <h3>Selected Files ({selectedFiles.length})</h3>
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="file-preview-item">
                                    <File size={20} />
                                    <div className="file-preview-info">
                                        <span className="file-preview-name">{file.name}</span>
                                        <span className="file-preview-size">{formatSize(file.size)}</span>
                                    </div>
                                    {uploadedFiles.includes(file) ? (
                                        <CheckCircle size={20} className="upload-success" />
                                    ) : (
                                        <button
                                            className="remove-file-btn"
                                            onClick={() => removeFile(index)}
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleUpload}
                        disabled={selectedFiles.length === 0 || uploadedFiles.length > 0}
                    >
                        Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const CreateFolderModal = ({ isOpen, onClose }) => {
    const { createFolder } = useFileSystem();
    const [folderName, setFolderName] = useState('');

    const handleCreate = () => {
        if (folderName.trim()) {
            createFolder(folderName.trim());
            setFolderName('');
            onClose();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleCreate();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create Folder</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <input
                        type="text"
                        className="folder-input"
                        placeholder="Folder name"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        autoFocus
                    />
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleCreate}
                        disabled={!folderName.trim()}
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};
