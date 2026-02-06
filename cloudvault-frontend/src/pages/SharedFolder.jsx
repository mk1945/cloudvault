import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FileIcon, Folder, Download, AlertCircle, Cloud } from 'lucide-react';
import FileCard from '../components/FileCard';

const SharedFolder = () => {
    const { token } = useParams();
    const [folder, setFolder] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSharedFolder = async () => {
            try {
                // Using axios directly because this is a public route (no auth header needed)
                const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const { data } = await axios.get(`${BASE_URL}/files/shared/${token}`);
                setFolder(data.folder);
                setFiles(data.files);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to load shared folder');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchSharedFolder();
        }
    }, [token]);

    const handleDownload = (file) => {
        if (!file.url) return;
        // Trigger download
        const link = document.createElement('a');
        link.href = file.url;
        link.setAttribute('download', file.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
                <div className="spinner"></div>
                <p className="text-secondary">Loading shared folder...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', textAlign: 'center' }}>
                <div style={{ color: 'var(--danger-color)', marginBottom: '16px' }}>
                    <AlertCircle size={48} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Access Denied</h2>
                <p className="text-secondary" style={{ marginBottom: '24px' }}>{error}</p>
                <Link to="/login" className="btn btn-primary">Go to CloudVault</Link>
            </div>
        );
    }

    return (
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Simple Public Navbar */}
            <nav className="navbar" style={{ borderBottom: '1px solid var(--border-color)', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}>
                <div className="logo" style={{ color: 'var(--primary-color)', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                    <Cloud size={32} strokeWidth={2.5} />
                    <span>CloudVault</span>
                </div>
                <Link to="/login" className="btn btn-outline">Sign In</Link>
            </nav>

            <div className="main-content" style={{ flex: 1, padding: '24px' }}>
                <div className="dashboard-container">
                    <div className="dashboard-header">
                        <div>
                            <div className="text-secondary text-sm" style={{ marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Shared Folder</div>
                            <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Folder size={28} fill="var(--text-secondary)" strokeWidth={0} style={{ opacity: 0.5 }} />
                                {folder?.filename}
                            </h1>
                            <p className="text-secondary text-sm">Shared by {folder?.owner}</p>
                        </div>
                    </div>

                    {files.length === 0 ? (
                        <div className="glass-panel text-center" style={{ padding: '60px' }}>
                            <p className="text-secondary" style={{ fontSize: '18px' }}>This folder is empty</p>
                        </div>
                    ) : (
                        <div className="file-grid">
                            {files.map(file => (
                                <div key={file._id} className="file-card" onClick={() => !file.isFolder && handleDownload(file)} style={{ cursor: file.isFolder ? 'default' : 'pointer' }}>
                                    <div className="file-icon-wrapper">
                                        {file.isFolder ? (
                                            <Folder size={48} fill="var(--text-secondary)" strokeWidth={0} style={{ opacity: 0.7 }} />
                                        ) : (
                                            <FileIcon size={48} strokeWidth={1.5} color="var(--primary-color)" />
                                        )}
                                    </div>
                                    <div className="file-info">
                                        <div style={{ overflow: 'hidden' }}>
                                            <h3 className="file-name" title={file.filename}>{file.filename}</h3>
                                            {!file.isFolder && <p className="text-secondary text-sm">{(file.size / 1024).toFixed(1)} KB</p>}
                                        </div>
                                        <div className="file-actions">
                                            {!file.isFolder && (
                                                <button title="Download">
                                                    <Download size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SharedFolder;
