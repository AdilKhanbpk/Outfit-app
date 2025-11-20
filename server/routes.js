import { createServer } from "http";
import multer from "multer";
import { generateTryOnWithRetry } from "./utils/huggingface.js";

// Configure multer for in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

export async function registerRoutes(app) {
  /**
   * POST /api/tryon
   * Handle virtual try-on requests
   */
  app.post('/api/tryon', upload.single('image'), async (req, res) => {
    try {
      // Validate image upload
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file uploaded',
        });
      }

      // Validate clothing data
      if (!req.body.clothing) {
        return res.status(400).json({
          success: false,
          error: 'No clothing data provided',
        });
      }

      let clothingData;
      try {
        clothingData = JSON.parse(req.body.clothing);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid clothing data format',
        });
      }

      // Validate at least one clothing item is selected
      const hasClothing = Object.keys(clothingData).length > 0 && 
                          Object.values(clothingData).some(item => item && item.type && item.color);
      
      if (!hasClothing) {
        return res.status(400).json({
          success: false,
          error: 'At least one clothing item must be selected',
        });
      }

      // Validate image size
      if (req.file.size > 8 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: 'Image size must be less than 8MB',
        });
      }

      // Convert original image to base64 for response
      const originalImageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      // Call HuggingFace API with retry logic
      const result = await generateTryOnWithRetry(req.file.buffer, clothingData);

      // Return success response
      return res.json({
        success: true,
        originalImage: originalImageBase64,
        generatedImage: result.generatedImage,
        message: 'Outfit generated successfully',
      });

    } catch (error) {
      console.error('Try-on error:', error);

      // Handle specific error cases
      let statusCode = 500;
      let errorMessage = 'An error occurred while generating your outfit';

      if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
        statusCode = 504;
        errorMessage = 'The AI model took too long to respond. Please try again.';
      } else if (error.message?.includes('Rate limit')) {
        statusCode = 429;
        errorMessage = error.message;
      } else if (error.message?.includes('loading')) {
        statusCode = 503;
        errorMessage = error.message;
      } else if (error.message?.includes('Invalid') || error.message?.includes('key')) {
        statusCode = 500;
        errorMessage = 'API configuration error. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  });

  // Error handling middleware for multer
  app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File size exceeds 8MB limit',
        });
      }
      return res.status(400).json({
        success: false,
        error: `Upload error: ${error.message}`,
      });
    }
    
    if (error.message === 'Only image files are allowed') {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    next(error);
  });

  const httpServer = createServer(app);
  return httpServer;
}
