import React from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import { Search, ChevronRight, Home, Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onToggleSidebar }) => {

    const { currentFolderId, fileSystem, searchQuery, setSearchQuery, navigateToFolder } = useFileSystem();

    // Build breadcrumb path
    const buildPath = () => {
        if (!currentFolderId) return [{ id: null, name: 'My Cloud' }];

        const path = [];
        let folderId = currentFolderId;

        while (folderId) {
            const folder = fileSystem.folders.find(f => f.id === folderId);
            if (folder) {
                path.unshift({ id: folder.id, name: folder.name });
                folderId = folder.parentId;
            } else {
                break;
            }
        }

        path.unshift({ id: null, name: 'My Cloud' });
        return path;
    };

    const breadcrumbs = buildPath();

    return (
        <nav className="navbar">
            <button className="mobile-menu-toggle" onClick={onToggleSidebar}>
                <Menu size={24} />
            </button>
            <div className="breadcrumb">

                {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.id || 'root'}>
                        {index > 0 && <ChevronRight size={16} className="breadcrumb-separator" />}
                        <button
                            className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                            onClick={() => navigateToFolder(crumb.id)}
                        >
                            {index === 0 && <Home size={16} />}
                            <span>{crumb.name}</span>
                        </button>
                    </React.Fragment>
                ))}
            </div>

            <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search files and folders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>
        </nav>
    );
};

export default Navbar;
