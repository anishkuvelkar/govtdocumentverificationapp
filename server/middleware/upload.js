// middleware/upload.js
const multer = require('multer');

// Only allow PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDFs are allowed'), false);
  }
};

const upload = multer({ storage: multer.memoryStorage(), fileFilter });

module.exports = upload;
