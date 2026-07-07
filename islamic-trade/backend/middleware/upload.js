const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let uploadPath = 'uploads/';
        
        // Determine upload path based on file type
        if (file.mimetype.startsWith('image/')) {
            uploadPath += 'images/';
        } else if (file.mimetype === 'application/pdf') {
            uploadPath += 'documents/';
        } else {
            uploadPath += 'others/';
        }
        
        cb(null, uploadPath);
    },
    filename: function(req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const imageTypes = /jpeg|jpg|png|gif|webp|svg/;
    const documentTypes = /pdf|doc|docx/;
    
    const extname = path.extname(file.originalname).toLowerCase();
    
    if (file.mimetype.startsWith('image/') && imageTypes.test(extname)) {
        cb(null, true);
    } else if (documentTypes.test(extname)) {
        cb(null, true);
    } else {
        cb(new Error('File type not allowed'), false);
    }
};

// Create multer instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

module.exports = upload;