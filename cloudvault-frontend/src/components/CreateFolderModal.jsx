import { useState } from 'react';
import api from '../services/api';

const CreateFolderModal = ({ isOpen, onClose, onSuccess, parentId }) => {
    const [folderName, setFolderName] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/files/folder', { name: folderName, parentId });
            setFolderName('');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create folder', error);
            alert('Failed to create folder');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '18px' }}>New Folder</h2>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Untitled folder"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFolderModal;
