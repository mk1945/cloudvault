const File = require('../models/File');
const { generateUploadURL, generateDownloadURL } = require('../utils/s3Upload');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

// @desc    Get presigned URL for upload and create file metadata
// @route   POST /api/files/upload-url
// @access  Private
const getUploadUrl = async (req, res) => {
    const { filename, fileType, size, parentId } = req.body;

    // Create a unique S3 key
    const s3Key = `${req.user._id}/${Date.now()}-${filename}`;

    try {
        const url = await generateUploadURL(s3Key, fileType);

        // Save metadata including parent folder
        const file = await File.create({
            filename,
            s3Key,
            owner: req.user._id,
            size,
            mimeType: fileType,
            parent: parentId || null,
        });

        res.status(201).json({
            uploadUrl: url,
            fileId: file._id,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating upload URL' });
    }
};

// @desc    Create a new folder
// @route   POST /api/files/folder
// @access  Private
const createFolder = async (req, res) => {
    const { name, parentId } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Folder name is required' });
    }

    try {
        const folder = await File.create({
            filename: name,
            s3Key: `folder-${uuidv4()}`, // Dummy key for folder
            owner: req.user._id,
            size: 0,
            mimeType: 'application/vnd.google-apps.folder',
            isFolder: true,
            parent: parentId || null,
        });

        res.status(201).json(folder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    List user's files (with folder support)
// @route   GET /api/files
// @access  Private
const getUserFiles = async (req, res) => {
    const { parentId } = req.query;

    try {
        const query = { owner: req.user._id };

        // If parentId is provided, look for children of that folder
        // If 'root' or undefined/null, look for files with no parent
        if (parentId && parentId !== 'root') {
            query.parent = parentId;
        } else {
            query.parent = null;
        }

        const files = await File.find(query).sort({ isFolder: -1, createdAt: -1 }); // Folders first
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate time-bound share link
// @route   GET /api/files/:id/share
// @access  Private
const shareFile = async (req, res) => {
    const { expiresIn } = req.query; // in seconds, default 10 mins (600s)

    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check ownership
        if (file.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        let url;
        let expireTime = parseInt(expiresIn) || 600;

        if (file.isFolder) {
            // Generate Folder Share Token (JWT)
            const token = jwt.sign(
                { folderId: file._id, type: 'folder' },
                process.env.JWT_SECRET,
                { expiresIn: expireTime }
            );

            // Public Link to Frontend
            url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared/${token}`;
        } else {
            // Generate S3 Presigned URL for files
            url = await generateDownloadURL(file.s3Key, expireTime);
        }

        res.json({ url, expiresAt: new Date(Date.now() + expireTime * 1000) });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Shared Folder Content (Public)
// @route   GET /api/files/shared/:token
// @access  Public
const getSharedFolder = async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type !== 'folder') {
            return res.status(400).json({ message: 'Invalid share token type' });
        }

        const folder = await File.findById(decoded.folderId).populate('owner', 'username');

        if (!folder) {
            return res.status(404).json({ message: 'Shared folder not found' });
        }

        // Get children
        const files = await File.find({ parent: decoded.folderId }).sort({ isFolder: -1, createdAt: -1 });

        // Add download URLs to files so they can be accessed publicly
        const filesWithUrls = await Promise.all(files.map(async (file) => {
            if (file.isFolder) return file.toObject();

            // Generate temporary download URL for each file in the folder
            const url = await generateDownloadURL(file.s3Key, 3600); // 1 hour link for viewing
            return { ...file.toObject(), url };
        }));

        res.json({
            folder: {
                _id: folder._id,
                filename: folder.filename,
                owner: folder.owner.username,
                createdAt: folder.createdAt
            },
            files: filesWithUrls
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Share link has expired' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete file or folder
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        if (file.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // If folder, delete content (simple) or prevent if not empty
        // For hackathon: recursive delete
        if (file.isFolder) {
            const children = await File.find({ parent: file._id });
            if (children.length > 0) {
                // Option A: fail
                // return res.status(400).json({ message: 'Folder is not empty' });

                // Option B: Delete children (only 1 level deep implemented here for safety, or just db delete)
                await File.deleteMany({ parent: file._id });
            }
        }

        await file.deleteOne();
        // Ideally we also delete from S3 here

        res.json({ message: 'Item removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUploadUrl,
    createFolder,
    getUserFiles,
    shareFile,
    getSharedFolder,
    deleteFile,
};
