// config/multer.config.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { Request, Response, NextFunction } from 'express';

/**
 * Request shape when multer has attached a file.
 */
interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
}

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'frontend', 'public');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Created upload directory: ${uploadDir}`);
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const suffix = Date.now();
    // allow dot and dash, replace other invalid chars
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
    cb(null, `${suffix}-${sanitizedName}`);
  }
});

// File filter for images
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP and SVG images are allowed.'));
  }
};

// File filter for videos
const videoFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
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
    cb(new Error('Invalid file type. Only MP4, MPEG, MOV, AVI, WebM and WMV videos are allowed.'));
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

export async function SaveImage(req: MulterRequest, res: Response): Promise<Response | void> {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required',
        error: 'No file was uploaded'
      });
    }

    // Validate file size
    if (file.size === 0) {
      try {
        if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      } catch (e) {
        console.error('Failed to delete empty file:', e);
      }
      return res.status(400).json({
        success: false,
        message: 'Empty file uploaded',
        error: 'Please select a valid image file'
      });
    }

    // Verify file exists on disk
    const fullPath = path.join(uploadDir, file.filename);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ File not found at path: ${fullPath}`);
      return res.status(500).json({
        success: false,
        message: 'File upload failed',
        error: 'File was not saved to disk'
      });
    }

    // Relative path for frontend (use forward slashes)
    const relativePath = path.posix.join('frontend', 'public', file.filename);

    const uploadData = {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: fullPath,            // Absolute path for server operations
      relativePath,              // Relative path for frontend access
      uploadDate: new Date()
    };

    console.log('✅ Image uploaded successfully:');
    console.log(`   - Filename: ${file.filename}`);
    console.log(`   - Path: ${fullPath}`);
    console.log(`   - Size: ${(file.size / 1024).toFixed(2)} KB`);

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully!',
      data: uploadData
    });
  } catch (error) {
    console.error('❌ Upload error:', error);

    // Clean up file if it exists
    try {
      const maybePath = req.file?.path;
      if (maybePath && fs.existsSync(maybePath)) {
        fs.unlinkSync(maybePath);
        console.log('🧹 Cleaned up failed upload file');
      }
    } catch (e) {
      console.error('Failed cleanup after error:', e);
    }

    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong during upload',
      error: message
    });
  }
}

export async function SaveVideo(req: MulterRequest, res: Response): Promise<Response | void> {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Video is required',
        error: 'No file was uploaded'
      });
    }

    // Validate file size
    if (file.size === 0) {
      try {
        if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      } catch (e) {
        console.error('Failed to delete empty file:', e);
      }
      return res.status(400).json({
        success: false,
        message: 'Empty file uploaded',
        error: 'Please select a valid video file'
      });
    }

    // Verify file exists on disk
    const fullPath = path.join(uploadDir, file.filename);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ File not found at path: ${fullPath}`);
      return res.status(500).json({
        success: false,
        message: 'File upload failed',
        error: 'File was not saved to disk'
      });
    }

    // Validate extension against allowed list (extra check)
    const videoExtensions = ['.mp4', '.mpeg', '.mov', '.avi', '.webm', '.wmv'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (!videoExtensions.includes(fileExtension)) {
      try {
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      } catch (e) {
        console.error('Failed to delete invalid-format video file:', e);
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid video format',
        error: 'Please upload a valid video file (MP4, MPEG, MOV, AVI, WebM, WMV)'
      });
    }

    const relativePath = path.posix.join('frontend', 'public', file.filename);

    const uploadData = {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: fullPath,
      relativePath,
      uploadDate: new Date(),
      duration: null as null | number,    // placeholder for later analysis
      resolution: null as null | string   // placeholder for later analysis
    };

    console.log('✅ Video uploaded successfully:');
    console.log(`   - Filename: ${file.filename}`);
    console.log(`   - Path: ${fullPath}`);
    console.log(`   - Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   - Type: ${file.mimetype}`);

    return res.status(200).json({
      success: true,
      message: 'Video uploaded successfully!',
      data: uploadData
    });
  } catch (error) {
    console.error('❌ Video upload error:', error);

    try {
      const maybePath = req.file?.path;
      if (maybePath && fs.existsSync(maybePath)) {
        fs.unlinkSync(maybePath);
        console.log('🧹 Cleaned up failed upload file');
      }
    } catch (e) {
      console.error('Failed cleanup after video upload error:', e);
    }

    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong during video upload',
      error: message
    });
  }
}

// Enhanced error handler for both images and videos
export function handleMulterError(err: any, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      // route may be undefined; be defensive
      const routePath = (req as any).route?.path as string | undefined;
      const isVideo = routePath?.includes('video') ?? false;
      const maxSize = isVideo ? '50MB' : '5MB';
      res.status(400).json({
        success: false,
        message: 'File too large',
        error: `Maximum file size is ${maxSize}`
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: 'Upload error',
      error: err.message
    });
    return;
  } else if (err) {
    res.status(400).json({
      success: false,
      message: 'Upload failed',
      error: err instanceof Error ? err.message : String(err)
    });
    return;
  }

  next();
}
