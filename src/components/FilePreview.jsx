import React, { useState, useEffect } from 'react';
import { X, Download, Maximize2 } from 'lucide-react';
import './FilePreview.css';

const FilePreview = ({ file, isOpen, onClose, onDownload }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleDownload = () => {
        if (onDownload) {
            onDownload(file);
        }
        onClose();
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    if (!isOpen || !file) return null;

    // Use the fileDataUrl directly (base64 data URL)
    const previewUrl = file.fileDataUrl;

    const renderPreview = () => {
        switch (file.type) {
            case 'image':
                return (
                    <div className="preview-content image-preview">
                        {previewUrl ? (
                            <img src={previewUrl} alt={file.name} />
                        ) : (
                            <div className="preview-placeholder">
                                <p>Image: {file.name}</p>
                            </div>
                        )}
                    </div>
                );

            case 'video':
                return (
                    <div className="preview-content video-preview">
                        {previewUrl ? (
                            <video controls autoPlay>
                                <source src={previewUrl} type={file.mimeType} />
                                Your browser does not support video playback.
                            </video>
                        ) : (
                            <div className="preview-placeholder">
                                <p>Video: {file.name}</p>
                                <p className="preview-note">Upload a real video file to preview</p>
                            </div>
                        )}
                    </div>
                );

            case 'audio':
                return (
                    <div className="preview-content audio-preview">
                        {previewUrl ? (
                            <div className="audio-player">
                                <div className="audio-info">
                                    <h3>{file.name}</h3>
                                    <p>Audio File</p>
                                </div>
                                <audio controls autoPlay>
                                    <source src={previewUrl} type={file.mimeType} />
                                    Your browser does not support audio playback.
                                </audio>
                            </div>
                        ) : (
                            <div className="preview-placeholder">
                                <p>Audio: {file.name}</p>
                                <p className="preview-note">Upload a real audio file to preview</p>
                            </div>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="preview-content document-preview">
                        <div className="document-info">
                            <h3>{file.name}</h3>
                            <p className="file-type">{file.mimeType || 'Document'}</p>
                            <p className="file-size">
                                {file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Unknown size'}
                            </p>
                            <p className="preview-note">
                                This file type cannot be previewed in the browser.
                                Click download to save it to your device.
                            </p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="file-preview-backdrop" onClick={onClose}>
            <div
                className={`file-preview-modal ${isFullscreen ? 'fullscreen' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="preview-header">
                    <div className="preview-title">
                        <h2>{file.name}</h2>
                        <span className="file-meta">
                            {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}
                        </span>
                    </div>
                    <div className="preview-actions">
                        {(file.type === 'image' || file.type === 'video') && (
                            <button
                                className="preview-btn"
                                onClick={toggleFullscreen}
                                title="Toggle fullscreen"
                            >
                                <Maximize2 size={20} />
                            </button>
                        )}
                        <button
                            className="preview-btn"
                            onClick={handleDownload}
                            title="Download"
                        >
                            <Download size={20} />
                        </button>
                        <button
                            className="preview-btn close"
                            onClick={onClose}
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {renderPreview()}
            </div>
        </div>
    );
};

export default FilePreview;
