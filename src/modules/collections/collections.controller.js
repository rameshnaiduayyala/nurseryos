import * as collectionsService from './collections.service.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `collection-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const uploadPhoto = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, jpeg, png, gif) are allowed!'));
  },
}).single('photo');

export const collectPlants = async (req, res, next) => {
  try {
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await collectionsService.collectPlants(req.body, photoUrl, req.user);
    res.status(201).json({
      success: true,
      message: 'Plants collected, inventory updated, and photo uploaded successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStopStatus = async (req, res, next) => {
  try {
    const result = await collectionsService.updateStopStatus(req.params.id, req.body.status, req.user);
    res.status(200).json({
      success: true,
      message: `Trip stop status updated to ${req.body.status}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
