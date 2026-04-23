import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import { protect } from '../middleware/authMiddleware.js';

dotenv.config();

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'skillnear',
        resource_type: 'auto', // Important for audio and other files
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf', 'doc', 'docx', 'mp3', 'wav', 'm4a'],
    },
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/', protect, upload.single('file'), (req, res) => {
    if (req.file) {
        res.json({
            url: req.file.path,
            format: req.file.format,
            resource_type: req.file.resource_type
        });
    } else {
        res.status(400).json({ message: 'Upload failed' });
    }
});

export default router;
