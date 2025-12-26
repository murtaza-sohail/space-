import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FileSystemContext } from './FileSystemContext';
import { initStorage, getStorageData, saveStorageData, calculateUsedStorage, getUserData, saveUserData } from '../services/storageService';
import { v4 as uuidv4 } from 'uuid';

export const FileSystemProvider = ({ children, apiKey }) => {
    const [user, setUser] = useState(() => getUserData());
    const [fileSystem, setFileSystem] = useState({ files: [], folders: [] });

    // Initial load and account switching
    useEffect(() => {
        const data = getStorageData(user?.email);
        if (data) {
            setFileSystem({ files: data.files || [], folders: data.folders || [] });
        } else {
            setFileSystem({ files: [], folders: [] });
        }
        setCurrentFolderId(null);
        setCurrentView('files');
    }, [user]);


    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [currentView, setCurrentView] = useState('files');
    const [searchQuery, setSearchQuery] = useState('');
    const [previewFile, setPreviewFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const save = async () => {
            setIsSaving(true);
            // Simulate a brief cloud delay
            await new Promise(resolve => setTimeout(resolve, 800));
            saveStorageData(fileSystem, user?.email);
            setIsSaving(false);
        };

        save();
    }, [fileSystem, user]);



    useEffect(() => {
        saveUserData(user);
    }, [user]);

    const loginWithGoogle = useCallback((email) => {
        const newUser = {
            email,
            name: email.split('@')[0],
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            linkedAt: Date.now()
        };
        setUser(newUser);
        return newUser;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
    }, []);



    const createFolder = useCallback((name) => {
        const newFolder = {
            id: uuidv4(),
            parentId: currentFolderId,
            name,
            type: 'folder',
            createdAt: Date.now(),
            lastModified: Date.now(),
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

    const emptyTrash = useCallback(() => {
        setFileSystem(prev => ({
            ...prev,
            folders: prev.folders.filter(f => !f.isTrashed),
            files: prev.files.filter(f => !f.isTrashed)
        }));
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

    const shareItem = useCallback((itemId, itemType) => {
        if (itemType === 'folder') {
            setFileSystem(prev => ({
                ...prev,
                folders: prev.folders.map(f => f.id === itemId ? { ...f, isShared: !f.isShared } : f)
            }));
        } else {
            setFileSystem(prev => ({
                ...prev,
                files: prev.files.map(f => f.id === itemId ? { ...f, isShared: !f.isShared } : f)
            }));
        }
    }, []);

    const toggleStar = useCallback((itemId, itemType) => {
        if (itemType === 'folder') {
            setFileSystem(prev => ({
                ...prev,
                folders: prev.folders.map(f => f.id === itemId ? { ...f, isStarred: !f.isStarred } : f)
            }));
        } else {
            setFileSystem(prev => ({
                ...prev,
                files: prev.files.map(f => f.id === itemId ? { ...f, isStarred: !f.isStarred } : f)
            }));
        }
    }, []);

    const navigateToFolder = useCallback((folderId) => {
        setCurrentView('files');
        setCurrentFolderId(folderId);
        // Track folder access for Recent view
        if (folderId) {
            setFileSystem(prev => ({
                ...prev,
                folders: prev.folders.map(f => f.id === folderId ? { ...f, lastModified: Date.now() } : f)
            }));
        }
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

        if (currentView === 'starred') {
            return {
                folders: fileSystem.folders.filter(f => f.isStarred && !f.isTrashed),
                files: fileSystem.files.filter(f => f.isStarred && !f.isTrashed)
            };
        }

        if (currentView === 'recent') {
            const allItems = [
                ...fileSystem.folders.filter(f => !f.isTrashed && f.lastModified),
                ...fileSystem.files.filter(f => !f.isTrashed && f.lastModified)
            ].sort((a, b) => b.lastModified - a.lastModified).slice(0, 20);

            return {
                folders: allItems.filter(i => i.type === 'folder'),
                files: allItems.filter(i => i.type !== 'folder')
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
        isSaving,
        createFolder,

        uploadFile,
        deleteItem,
        restoreItem,
        permanentDelete,
        emptyTrash,
        renameItem,
        moveItem,
        navigateToFolder,
        navigateUp,
        downloadFile,
        shareItem,
        toggleStar,
        user,
        loginWithGoogle,
        logout
    };


    return (
        <FileSystemContext.Provider value={value}>
            {children}
        </FileSystemContext.Provider>
    );
};
