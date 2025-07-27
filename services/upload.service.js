const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configure multer to store file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const uploadToS3 = async (fileBuffer, filename, mimetype) => {
    const upload = new Upload({
        client: s3,
        params: {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `public/${uuidv4()}-${filename}`,
            Body: fileBuffer,
            ContentType: mimetype,
            // ACL: 'public-read',
        },
    });

    const result = await upload.done();
    return result.Location; // Public URL
};

const uploadFileHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { buffer, originalname, mimetype } = req.file;
    const location = await uploadToS3(buffer, originalname, mimetype);

    res.json({
      success: true,
      url: location,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
};

module.exports = { upload, uploadFileHandler };