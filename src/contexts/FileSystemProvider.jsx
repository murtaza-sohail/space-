import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FileSystemContext } from './FileSystemContext';
import { initStorage, getStorageData, saveStorageData, calculateUsedStorage } from '../services/storageService';
import { v4 as uuidv4 } from 'uuid';

export const FileSystemProvider = ({ children, apiKey }) => {
    const [fileSystem, setFileSystem] = useState(() => {
        initStorage(apiKey);
        const data = getStorageData();
        return data ? { files: data.files || [], folders: data.folders || [] } : { files: [], folders: [] };
    });

    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [currentView, setCurrentView] = useState('files');
    const [searchQuery, setSearchQuery] = useState('');
    const [previewFile, setPreviewFile] = useState(null);

    useEffect(() => {
        const currentData = getStorageData();
        if (currentData) {
            saveStorageData({ ...currentData, files: fileSystem.files, folders: fileSystem.folders });
        }
    }, [fileSystem]);

    const createFolder = useCallback((name) => {
        const newFolder = {
            id: uuidv4(),
            parentId: currentFolderId,
            name,
            type: 'folder',
            createdAt: Date.now(),
            isTrashed: false,
        };
        setFileSystem(prev => ({ ...prev, folders: [...prev.folders, newFolder] }));
    }, [currentFolderId]);

    const uploadFile = useCallback(async (file) => {
        let type = 'doc';
        if (file.type.startsWith('image')) type = 'image';
        else if (file.type.startsWith('video')) type = 'video';
        else if (file.type.startsWith('audio')) type = 'audio';

        // Convert file to base64 data URL for storage
        const fileDataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });

        const newFile = {
            id: uuidv4(),
            parentId: currentFolderId,
            name: file.name,
            type,
            size: file.size,
            mimeType: file.type,
            createdAt: Date.now(),
            isTrashed: false,
            lastModified: file.lastModified,
            fileDataUrl, // Store as base64 data URL for persistence
        };

        setFileSystem(prev => ({ ...prev, files: [...prev.files, newFile] }));
        return newFile;
    }, [currentFolderId]);

    const deleteItem = useCallback((id, type) => {
        if (type === 'folder') {
            setFileSystem(prev => ({
                ...prev,
                folders: prev.folders.map(f => f.id === id ? { ...f, isTrashed: true } : f)
            }));
        } else {
            setFileSystem(prev => ({
                ...prev,
                files: prev.files.map(f => f.id === id ? { ...f, isTrashed: true } : f)
            }));
        }
    }, []);

    const restoreItem = useCallback((id, type) => {
        if (type === 'folder') {
            setFileSystem(prev => ({
                ...prev,
                folders: prev.folders.map(f => f.id === id ? { ...f, isTrashed: false } : f)
            }));
        } else {
            setFileSystem(prev => ({
                ...prev,
                files: prev.files.map(f => f.id === id ? { ...f, isTrashed: false } : f)
            }));
        }
    }, []);

    const permanentDelete = useCallback((id, type) => {
        if (type === 'folder') {
            setFileSystem(prev => ({
                ...prev,
                folders: prev.folders.filter(f => f.id !== id)
            }));
        } else {
            setFileSystem(prev => ({
                ...prev,
                files: prev.files.filter(f => f.id !== id)
            }));
        }
    }, []);

    const renameItem = useCallback((id, type, newName) => {
        if (type === 'folder') {
            setFileSystem(prev => ({
                ...prev,
                folders: prev.folders.map(f => f.id === id ? { ...f, name: newName } : f)
            }));
        } else {
            setFileSystem(prev => ({
                ...prev,
                files: prev.files.map(f => f.id === id ? { ...f, name: newName } : f)
            }));
        }
    }, []);

    const moveItem = useCallback((itemId, itemType, targetFolderId) => {
        if (itemType === 'folder' && itemId === targetFolderId) return;

        if (itemType === 'folder') {
            setFileSystem(prev => ({
                ...prev,
                folders: prev.folders.map(f => f.id === itemId ? { ...f, parentId: targetFolderId } : f)
            }));
        } else {
            setFileSystem(prev => ({
                ...prev,
                files: prev.files.map(f => f.id === itemId ? { ...f, parentId: targetFolderId } : f)
            }));
        }
    }, []);

    const navigateToFolder = useCallback((folderId) => {
        setCurrentView('files');
        setCurrentFolderId(folderId);
    }, []);

    const navigateUp = useCallback(() => {
        if (currentFolderId) {
            const currentFolder = fileSystem.folders.find(f => f.id === currentFolderId);
            setCurrentFolderId(currentFolder ? currentFolder.parentId : null);
        }
    }, [currentFolderId, fileSystem.folders]);

    const downloadFile = useCallback((file) => {
        const downloadUrl = file.fileDataUrl || URL.createObjectURL(new Blob([`Simulated content for ${file.name}`], { type: file.mimeType || 'application/octet-stream' }));

        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        if (!file.fileDataUrl) {
            URL.revokeObjectURL(downloadUrl);
        }
    }, []);

    const currentItems = useMemo(() => {
        if (currentView === 'trash') {
            return {
                folders: fileSystem.folders.filter(f => f.isTrashed),
                files: fileSystem.files.filter(f => f.isTrashed)
            };
        }

        let folders = fileSystem.folders.filter(f => f.parentId === currentFolderId && !f.isTrashed);
        let files = fileSystem.files.filter(f => f.parentId === currentFolderId && !f.isTrashed);

        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            folders = fileSystem.folders.filter(f => !f.isTrashed && f.name.toLowerCase().includes(lowerQ));
            files = fileSystem.files.filter(f => !f.isTrashed && f.name.toLowerCase().includes(lowerQ));
        }

        return { folders, files };
    }, [fileSystem, currentFolderId, searchQuery, currentView]);

    const usedStorage = calculateUsedStorage(fileSystem.files);

    const value = {
        fileSystem,
        currentFolderId,
        currentView,
        setCurrentView,
        currentItems,
        usedStorage,
        searchQuery,
        setSearchQuery,
        previewFile,
        setPreviewFile,
        createFolder,
        uploadFile,
        deleteItem,
        restoreItem,
        permanentDelete,
        renameItem,
        moveItem,
        navigateToFolder,
        navigateUp,
        downloadFile
    };

    return (
        <FileSystemContext.Provider value={value}>
            {children}
        </FileSystemContext.Provider>
    );
};
