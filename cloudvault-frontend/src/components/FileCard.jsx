import { FileIcon, Trash2, Share2, Folder } from 'lucide-react';
import api from '../services/api';

const FileCard = ({ file, onDelete, onOpen }) => {
    const handleShare = async (e) => {
        e.stopPropagation();
        try {
            // Folder sharing is now supported!
            // if (file.isFolder) {
            //     alert('Folder sharing not implemented yet');
            //     return;
            // }
            // Default 10 mins expiry
            const response = await api.get(`/files/${file._id}/share?expiresIn=600`);
            const { url, expiresAt } = response.data;

            // Simple share for now: Copy to clipboard or alert
            navigator.clipboard.writeText(url);
            alert(`Link copied! Expires at ${new Date(expiresAt).toLocaleTimeString()}`);
        } catch (error) {
            console.error('Share failed', error);
            alert('Failed to generate share link');
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!window.confirm(`Delete ${file.isFolder ? 'folder' : 'file'} "${file.filename}"?`)) return;
        try {
            await api.delete(`/files/${file._id}`);
            onDelete(file._id);
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    return (
        <div
            className="file-card"
            onDoubleClick={() => file.isFolder && onOpen(file)}
            onClick={() => file.isFolder && onOpen(file)}
        >
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
                    <button onClick={handleShare} title="Share">
                        <Share2 size={18} />
                    </button>
                    <button onClick={handleDelete} title="Delete" style={{ color: 'var(--danger-color)' }}>
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileCard;
