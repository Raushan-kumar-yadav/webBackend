// config/multer.config.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'frontend', 'public');

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Created upload directory: ${uploadDir}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use the absolute path
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const suffix = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${suffix}-${sanitizedName}`);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP and SVG images are allowed.'), false);
  }
};

// File filter for videos
const videoFilter = (req, file, cb) => {
  const allowedMimes = [
    'video/mp4', 
    'video/mpeg', 
    'video/quicktime', 
    'video/x-msvideo', // .avi
    'video/webm',
    'video/x-ms-wmv'   // .wmv
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, MPEG, MOV, AVI, WebM and WMV videos are allowed.'), false);
  }
};

// Multer configuration for images (5MB limit)
export const uploadedImage = multer({ 
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Multer configuration for videos (50MB limit)
export const uploadedVideo = multer({ 
  storage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

export async function SaveImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
        error: "No file was uploaded"
      });
    }
    
    // Validate file was actually uploaded
    if (req.file.size === 0) {
      // Delete the empty file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Empty file uploaded',
        error: 'Please select a valid image file'
      });
    }

    // Verify file actually exists on disk
    const fullPath = path.join(uploadDir, req.file.filename);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ File not found at path: ${fullPath}`);
      return res.status(500).json({
        success: false,
        message: 'File upload failed',
        error: 'File was not saved to disk'
      });
    }

    // Create relative path for frontend access
    const relativePath = `frontend/public/${req.file.filename}`;
    
    const uploadData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: fullPath,           // Absolute path for server operations
      relativePath: relativePath, // Relative path for frontend access
      uploadDate: new Date()
    };

    console.log(`✅ Image uploaded successfully:`);
    console.log(`   - Filename: ${req.file.filename}`);
    console.log(`   - Path: ${fullPath}`);
    console.log(`   - Size: ${(req.file.size / 1024).toFixed(2)} KB`);
    
    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully!',
      data: uploadData
    });
  }
  catch (error) {
    console.error('❌ Upload error:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log('🧹 Cleaned up failed upload file');
    }
    
    return res.status(500).json({
      success: false,
      message: "Something went wrong during upload",
      error: error.message || 'Unknown error occurred'
    });
  }
}

export async function SaveVideo(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Video is required",
        error: "No file was uploaded"
      });
    }
    
    // Validate file was actually uploaded
    if (req.file.size === 0) {
      // Delete the empty file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Empty file uploaded',
        error: 'Please select a valid video file'
      });
    }

    // Verify file actually exists on disk
    const fullPath = path.join(uploadDir, req.file.filename);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ File not found at path: ${fullPath}`);
      return res.status(500).json({
        success: false,
        message: 'File upload failed',
        error: 'File was not saved to disk'
      });
    }

    // Create relative path for frontend access
    const relativePath = `frontend/public/${req.file.filename}`;
    
    // Additional video-specific validation
    const videoExtensions = ['.mp4', '.mpeg', '.mov', '.avi', '.webm', '.wmv'];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    if (!videoExtensions.includes(fileExtension)) {
      // Clean up the uploaded file
      fs.unlinkSync(fullPath);
      return res.status(400).json({
        success: false,
        message: 'Invalid video format',
        error: 'Please upload a valid video file (MP4, MPEG, MOV, AVI, WebM, WMV)'
      });
    }
    
    const uploadData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: fullPath,           // Absolute path for server operations
      relativePath: relativePath, // Relative path for frontend access
      uploadDate: new Date(),
      duration: null,           // Could be populated later with video analysis
      resolution: null          // Could be populated later with video analysis
    };

    console.log(`✅ Video uploaded successfully:`);
    console.log(`   - Filename: ${req.file.filename}`);
    console.log(`   - Path: ${fullPath}`);
    console.log(`   - Size: ${(req.file.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   - Type: ${req.file.mimetype}`);
    
    return res.status(200).json({
      success: true,
      message: 'Video uploaded successfully!',
      data: uploadData
    });
  }
  catch (error) {
    console.error('❌ Video upload error:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log('🧹 Cleaned up failed upload file');
    }
    
    return res.status(500).json({
      success: false,
      message: "Something went wrong during video upload",
      error: error.message || 'Unknown error occurred'
    });
  }
}

// Enhanced error handler for both images and videos
export function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const isVideo = req.route && req.route.path.includes('video');
      const maxSize = isVideo ? '50MB' : '5MB';
      return res.status(400).json({
        success: false,
        message: 'File too large',
        error: `Maximum file size is ${maxSize}`
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Upload error',
      error: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: 'Upload failed',
      error: err.message
    });
  }
  next();
}