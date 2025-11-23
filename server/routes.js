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
  /**
   * POST /api/tryon
   * Handle virtual try-on requests
   */
  app.post('/api/tryon', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'shirt', maxCount: 1 },
    { name: 'pants', maxCount: 1 }
  ]), async (req, res) => {
    try {
      // Validate image upload
      if (!req.files || !req.files['image'] || !req.files['image'][0]) {
        return res.status(400).json({
          success: false,
          error: 'No model image uploaded',
        });
      }

      const modelImageFile = req.files['image'][0];
      const shirtFile = req.files['shirt'] ? req.files['shirt'][0] : null;
      const pantsFile = req.files['pants'] ? req.files['pants'][0] : null;

      // Validate at least one garment is uploaded
      if (!shirtFile && !pantsFile) {
        return res.status(400).json({
          success: false,
          error: 'Please upload at least one garment (shirt or pants)',
        });
      }

      // Validate clothing data (optional metadata now, but kept for compatibility if needed)
      let clothingData = {};
      if (req.body.clothing) {
        try {
          clothingData = JSON.parse(req.body.clothing);
        } catch (error) {
          // Ignore parse error, not critical anymore
        }
      }

      // Validate image size
      if (modelImageFile.size > 8 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: 'Model image size must be less than 8MB',
        });
      }

      // Convert original image to base64 for response
      const originalImageBase64 = `data:${modelImageFile.mimetype};base64,${modelImageFile.buffer.toString('base64')}`;

      // Call OutfitAnyone API with retry logic
      const result = await generateTryOnWithRetry(
        modelImageFile.buffer,
        clothingData,
        shirtFile ? shirtFile.buffer : null,
        pantsFile ? pantsFile.buffer : null
      );

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
