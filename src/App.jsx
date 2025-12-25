import React, { useState } from 'react';
import { FileSystemProvider } from './contexts/FileSystemProvider';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import FileList from './components/FileList';
import { UploadModal } from './components/Modals';
import './index.css';

const API_KEY = 'hYlidQUoqfO8FGa2764Z4MqCRMrLvZlv5UQCrQy0sOY2y5xlV9DL8jr6di4XkL'; // Replace with actual API key if needed

function App() {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const VIDEO_URL = "https://upsite.com.au/wp-content/uploads/pexels-rostislav-uzunov-5680034-1080p.mp4";

    return (
        <FileSystemProvider apiKey={API_KEY}>
            <div className="app-container">
                <video autoPlay loop muted playsInline className="video-background">
                    <source src={VIDEO_URL} type="video/mp4" />
                </video>
                <div className="app-overlay"></div>
                <div className="scanlines"></div>

                <Sidebar setIsUploadOpen={setIsUploadOpen} />
                <main className="main-content">
                    <Navbar />
                    <FileList />
                </main>
            </div>
            <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
        </FileSystemProvider>
    );
}

export default App;
