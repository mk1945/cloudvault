const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },
    s3Key: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    mimeType: {
        type: String,
        required: true,
    },
    isFolder: {
        type: Boolean,
        default: false,
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        default: null,
    },
    accessLogs: [{
        accessedBy: String,
        accessedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

const File = mongoose.model('File', fileSchema);
module.exports = File;
