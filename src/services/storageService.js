// Storage Service - Handles localStorage operations for 10PB cloud simulation

const STORAGE_KEY = 'cloudvault_storage';
const TOTAL_STORAGE = 10000 * 1024 * 1024 * 1024 * 1024; // 10,000 TB in bytes

export const initStorage = (apiKey) => {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
        const initialData = {
            apiKey,
            files: [],
            folders: [],
            totalStorage: TOTAL_STORAGE,
            createdAt: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    }
};

export const getStorageData = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
};

export const saveStorageData = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('Storage saved successfully:', data);
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
        if (e.name === 'QuotaExceededError') {
            console.warn('LocalStorage quota exceeded. Data may not be fully persisted.');
        }
    }
};


export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const calculateUsedStorage = (files) => {
    return files.reduce((total, file) => {
        return !file.isTrashed ? total + (file.size || 0) : total;
    }, 0);
};

export const getStoragePercentage = (used) => {
    return (used / TOTAL_STORAGE) * 100;
};

const USER_KEY = 'cloudvault_user';

export const getUserData = () => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
};

export const saveUserData = (userData) => {
    if (userData) {
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } else {
        localStorage.removeItem(USER_KEY);
    }
};

