const express = require('express');
const router = express.Router();
const {
    getUploadUrl,
    createFolder,
    getUserFiles,
    shareFile,
    getSharedFolder,
    deleteFile
} = require('../controllers/file.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/').get(protect, getUserFiles).head((req, res) => res.status(200).end());
router.route('/folder').post(protect, createFolder);
router.route('/upload-url').post(protect, getUploadUrl);
// File sharing (Protected to create link)
router.get('/:id/share', protect, shareFile);
router.head('/:id/share', (req, res) => res.status(200).end());

router.route('/:id').delete(protect, deleteFile);

// Access Shared Folder (Public)
router.get('/shared/:token', getSharedFolder);
router.head('/shared/:token', (req, res) => res.status(200).end());

module.exports = router;
