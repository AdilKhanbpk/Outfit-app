/**
 * HuggingFace Virtual Try-On Integration
 * Uses the HuggingFace Inference API for virtual clothing try-on
 */

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL_URL = "https://api-inference.huggingface.co/models/yisol/IDM-VTON";
const TIMEOUT_MS = 60000; // 60 seconds

/**
 * Converts a Buffer to base64 string
 */
function bufferToBase64(buffer) {
  return buffer.toString('base64');
}

/**
 * Converts base64 string to data URL
 */
function base64ToDataURL(base64String, mimeType = 'image/png') {
  return `data:${mimeType};base64,${base64String}`;
}

/**
 * Call HuggingFace Inference API for virtual try-on
 * The IDM-VTON model accepts binary image data directly
 */
export async function generateTryOn(imageBuffer, clothingData) {
  if (!HUGGINGFACE_API_KEY) {
    throw new Error('HUGGINGFACE_API_KEY is not configured');
  }

  try {
    // Build the prompt from clothing selections
    const prompt = buildPromptFromClothing(clothingData);
    
    // For IDM-VTON, we send the image as binary data
    // The model processes the image and generates try-on results
    const response = await fetch(MODEL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/octet-stream',
        'x-use-cache': 'false', // Don't cache results
      },
      body: imageBuffer,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Handle specific error cases
      if (response.status === 503) {
        throw new Error('Model is currently loading. Please try again in a few moments.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a minute.');
      } else if (response.status === 401) {
        throw new Error('Invalid HuggingFace API key');
      }
      
      throw new Error(`HuggingFace API error: ${errorText}`);
    }

    // Get the response as a blob
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Convert to base64 for frontend
    const base64Image = bufferToBase64(buffer);
    const dataURL = base64ToDataURL(base64Image, blob.type);

    return {
      success: true,
      generatedImage: dataURL,
    };
  } catch (error) {
    console.error('HuggingFace API Error:', error);
    
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      throw new Error('Request timed out. The model is taking too long to respond. Please try again.');
    }
    
    throw error;
  }
}

/**
 * Build a descriptive prompt from clothing selections
 * This is currently for reference/logging - the IDM-VTON model uses the image directly
 */
function buildPromptFromClothing(clothingData) {
  const parts = [];
  
  if (clothingData.shirt) {
    parts.push(`${clothingData.shirt.color} ${clothingData.shirt.type.toLowerCase()}`);
  }
  
  if (clothingData.pants) {
    parts.push(`${clothingData.pants.color} ${clothingData.pants.type.toLowerCase()}`);
  }
  
  if (clothingData.coat) {
    parts.push(`${clothingData.coat.color} ${clothingData.coat.type.toLowerCase()}`);
  }
  
  if (clothingData.shoes) {
    parts.push(`${clothingData.shoes.color} ${clothingData.shoes.type.toLowerCase()}`);
  }
  
  if (clothingData.watch) {
    parts.push(`${clothingData.watch.color} ${clothingData.watch.type.toLowerCase()}`);
  }
  
  const prompt = parts.join(', ');
  console.log('Virtual try-on request:', prompt);
  return prompt;
}

/**
 * Retry logic for API calls
 */
export async function generateTryOnWithRetry(imageBuffer, clothingData, maxRetries = 1) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await generateTryOn(imageBuffer, clothingData);
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.message?.includes('Invalid') || error.message?.includes('key')) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
}
