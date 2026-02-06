import { useState, useEffect } from 'react';
import api from '../services/api';
import FileCard from '../components/FileCard';
import UploadModal from '../components/UploadModal';
import CreateFolderModal from '../components/CreateFolderModal';
import { Plus, FolderPlus, ArrowLeft, Home } from 'lucide-react';

const Dashboard = () => {
    const [files, setFiles] = useState([]);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [droppedFile, setDroppedFile] = useState(null);

    // Folder State
    const [currentFolder, setCurrentFolder] = useState(null); // null = root
    const [folderPath, setFolderPath] = useState([]); // Array of folder objects for breadcrumbs

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            setDroppedFile(files[0]);
            setIsUploadOpen(true);
        }
    };

    const fetchFiles = async (folderId = null) => {
        setLoading(true);
        try {
            const params = folderId ? { parentId: folderId } : {};
            const { data } = await api.get('/files', { params });
            setFiles(data);
        } catch (error) {
            console.error('Failed to fetch files', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles(currentFolder?._id);
    }, [currentFolder]);

    const handleFileDeleted = (id) => {
        setFiles(files.filter(f => f._id !== id));
    };

    const handleOpenFolder = (folder) => {
        setFolderPath([...folderPath, folder]);
        setCurrentFolder(folder);
    };

    const handleBreadcrumbClick = (index) => {
        if (index === -1) { // Root
            setFolderPath([]);
            setCurrentFolder(null);
        } else {
            const newPath = folderPath.slice(0, index + 1);
            setFolderPath(newPath);
            setCurrentFolder(newPath[newPath.length - 1]);
        }
    };

    const handleNavigateUp = () => {
        if (folderPath.length === 0) return;
        const newPath = folderPath.slice(0, -1);
        setFolderPath(newPath);
        setCurrentFolder(newPath.length > 0 ? newPath[newPath.length - 1] : null);
    };

    return (
        <div
            className="dashboard-container"
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver} // Ensure drag enter also triggers
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ position: 'relative', minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }} // flex column to fill
        >
            {isDragging && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(66, 133, 244, 0.1)',
                        border: '2px dashed var(--primary-color)',
                        borderRadius: '16px',
                        zIndex: 100,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        pointerEvents: 'none'
                    }}
                >
                    <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-lg)',
                        color: 'var(--primary-color)',
                        fontWeight: '500',
                        fontSize: '18px'
                    }}>
                        Drop files to upload to {currentFolder ? currentFolder.filename : 'My Drive'}
                    </div>
                </div>
            )}

            <div className="dashboard-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        {currentFolder && (
                            <button onClick={handleNavigateUp} className="btn-outline" style={{ padding: '4px 8px', borderRadius: '50%' }}>
                                <ArrowLeft size={16} />
                            </button>
                        )}
                        <h1 className="section-title">{currentFolder ? currentFolder.filename : 'My Drive'}</h1>
                    </div>

                    {/* Breadcrumbs */}
                    <div className="text-secondary text-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                            onClick={() => handleBreadcrumbClick(-1)}
                            style={{ fontWeight: folderPath.length === 0 ? 'bold' : 'normal', display: 'flex', alignItems: 'center', gap: '4px' }}
                            className={folderPath.length > 0 ? "link-primary" : ""}
                        >
                            <Home size={14} /> My Drive
                        </button>
                        {folderPath.map((folder, index) => (
                            <span key={folder._id} style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ margin: '0 4px' }}>/</span>
                                <button
                                    onClick={() => handleBreadcrumbClick(index)}
                                    className={index === folderPath.length - 1 ? "" : "link-primary"}
                                    style={{ fontWeight: index === folderPath.length - 1 ? 'bold' : 'normal' }}
                                >
                                    {folder.filename}
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setIsCreateFolderOpen(true)}
                        className="btn btn-outline"
                    >
                        <FolderPlus size={20} /> New Folder
                    </button>
                    <button
                        onClick={() => setIsUploadOpen(true)}
                        className="btn btn-primary"
                    >
                        <Plus size={20} /> File Upload
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center mt-4">Loading...</div>
            ) : files.length === 0 ? (
                <div className="glass-panel text-center" style={{ padding: '60px' }}>
                    <p className="text-secondary" style={{ fontSize: '18px' }}>This folder is empty</p>
                    <p className="text-secondary text-sm">Create a folder or upload files</p>
                </div>
            ) : (
                <div className="file-grid">
                    {files.map(file => (
                        <FileCard
                            key={file._id}
                            file={file}
                            onDelete={handleFileDeleted}
                            onOpen={handleOpenFolder}
                        />
                    ))}
                </div>
            )}

            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => {
                    setIsUploadOpen(false);
                    setDroppedFile(null);
                }}
                onUploadSuccess={() => fetchFiles(currentFolder?._id)}
                parentId={currentFolder?._id}
                initialFile={droppedFile}
            />

            <CreateFolderModal
                isOpen={isCreateFolderOpen}
                onClose={() => setIsCreateFolderOpen(false)}
                onSuccess={() => fetchFiles(currentFolder?._id)}
                parentId={currentFolder?._id}
            />
        </div>
    );
};

export default Dashboard;
