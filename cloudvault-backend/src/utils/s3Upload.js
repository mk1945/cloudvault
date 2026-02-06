const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client } = require('../config/s3');

const isMockMode = !process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'your_access_key';

const generateUploadURL = async (key, contentType) => {
    if (isMockMode) {
        console.log('Mock Mode: Generating fake upload URL');
        return `https://mock-s3.local/${key}`;
    }

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes
    return url;
};

const generateDownloadURL = async (key, expiresIn = 900) => { // Default 15 mins
    if (isMockMode) {
        return `https://mock-s3.local/download/${key}?expires=${Date.now() + expiresIn * 1000}`;
    }

    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
};

module.exports = { generateUploadURL, generateDownloadURL, isMockMode };
