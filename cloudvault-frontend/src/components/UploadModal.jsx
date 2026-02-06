import { useState, useEffect } from 'react';
import { X, UploadCloud } from 'lucide-react';
import api from '../services/api';
import axios from 'axios';

const UploadModal = ({ isOpen, onClose, onUploadSuccess, parentId, initialFile }) => {
    const [file, setFile] = useState(initialFile || null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (initialFile) {
            setFile(initialFile);
        }
    }, [initialFile, isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        try {
            // 1. Get Presigned URL
            const { data } = await api.post('/files/upload-url', {
                filename: file.name,
                fileType: file.type,
                size: file.size,
                parentId: parentId || null
            });

            // If Mock Mode, skip calling S3
            if (data.mock) {
                console.log('Mock Mode: Skipping S3 upload');
                // Simulate delay
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                // 2. Upload to S3 using the presigned URL
                // Important: Do not use the 'api' instance here as it has authorization headers which S3 might reject if not signed
                await axios.put(data.uploadUrl, file, {
                    headers: {
                        'Content-Type': file.type
                    }
                });
            }

            // 3. Success
            setUploading(false);
            setFile(null);
            onUploadSuccess();
            onClose();

        } catch (error) {
            console.error('Upload failed', error);
            setUploading(false);
            alert(`Upload failed: ${error.message}`);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem' }}>Upload File</h3>
                    <button onClick={onClose} className="close-btn"><X size={20} /></button>
                </div>

                <div className="upload-area">
                    <input type="file" onChange={handleFileChange} style={{ display: 'none' }} id="fileInput" />
                    <label htmlFor="fileInput">
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', color: '#3b82f6' }}>
                            <UploadCloud size={48} />
                        </div>
                        <span style={{ color: '#4b5563', fontWeight: 500 }}>{file ? file.name : "Click to select file"}</span>
                    </label>
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="btn btn-primary"
                    style={{ width: '100%', opacity: !file || uploading ? 0.6 : 1, cursor: !file || uploading ? 'not-allowed' : 'pointer' }}
                >
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
            </div>
        </div>
    );
};

export default UploadModal;
