const multer = require('multer');
const AppError = require('../utils/appError');

// In-memory storage for Cloudinary streaming upload
const storage = multer.memoryStorage();

// File filter: Strictly HD Image Formats (JPG, JPEG, PNG, WEBP)
const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Invalid document image format. Only HD Images (JPG, JPEG, PNG, WEBP) are allowed.',
        400
      ),
      false
    );
  }
};

// Multer upload config: 2MB limit (2 * 1024 * 1024 bytes)
const uploadKycImage = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB Max File Size
  },
  fileFilter: imageFileFilter
});

module.exports = { uploadKycImage };
