import multer from 'multer';
import { imageStorage, documentStorage } from '../config/cloudinary.js';

const fileFilter = (req, file, cb) => {
  const allowed = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  if (allowed.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, gif, webp, svg) are allowed'), false);
  }
};

const upload = multer({
  storage: imageStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const quoteFileFilter = (req, file, cb) => {
  const allowed = /\.(pdf|docx|zip|jpg|jpeg|png|gif|webp|svg)$/i;
  if (allowed.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, Docx, ZIP, and image files are allowed'), false);
  }
};

export const quoteUpload = multer({
  storage: documentStorage,
  fileFilter: quoteFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
});

export default upload;
