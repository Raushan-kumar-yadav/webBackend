// routes/upload.routes.ts
import express from 'express';

import { verifyToken } from '../../middleWare/authMidware.js';
import { uploadedVideo,uploadedImage, SaveImage, SaveVideo,handleMulterError } from '../products/uploads/index.js';


const uploadRouter = express.Router();

// Define the upload route with middleware and handler
// In your route file


uploadRouter.post('/image', verifyToken,
  uploadedImage.single('image'), 
  handleMulterError,  // Handle multer-specific errors
  SaveImage
);

uploadRouter.post('/video', verifyToken,
  uploadedVideo.single('video'), 
  handleMulterError,  // Handle multer-specific errors
  SaveVideo
);


export default uploadRouter;