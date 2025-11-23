/**
 * HuggingFace Virtual Try-On Integration
 * Uses the IDM-VTON model via Gradio Client
 */

import { Client } from "@gradio/client";

// Initialize Gradio client
let client;

async function getClient() {
  if (!client) {
    client = await Client.connect("yisol/IDM-VTON");
  }
  return client;
}

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
 * Call IDM-VTON model for virtual try-on
 */
export async function generateTryOn(imageBuffer, clothingData, shirtBuffer, pantsBuffer) {
  try {
    console.log('Connecting to IDM-VTON model...');
    const app = await getClient();

    // Convert buffers to Blobs
    const modelBlob = new Blob([imageBuffer], { type: "image/png" });

    // IDM-VTON requires a single garment image
    // If both shirt and pants are provided, prioritize shirt
    let garmentBlob = null;
    if (shirtBuffer) {
      garmentBlob = new Blob([shirtBuffer], { type: "image/png" });
    } else if (pantsBuffer) {
      garmentBlob = new Blob([pantsBuffer], { type: "image/png" });
    }

    if (!garmentBlob) {
      throw new Error("At least one garment (shirt or pants) is required.");
    }

    console.log('Sending request to IDM-VTON...');

    // IDM-VTON API expects:
    // - dict (ImageEditor format with background, layers, composite)
    // - garm_img (garment image Blob)
    // - garment_des (description - string)
    // - is_checked (boolean)
    // - is_checked_crop (boolean)
    // - denoise_steps (number)
    // - seed (number)

    const result = await app.predict("/tryon", [
      {
        background: modelBlob,
        layers: [],
        composite: null
      },
      garmentBlob,              // garment image
      "A garment",              // garment description
      true,                     // is_checked
      true,                     // is_checked_crop
      30,                       // denoise_steps
      42,                       // seed
    ]);

    console.log('IDM-VTON response received');

    // IDM-VTON returns two images: [output, masked_output]
    const generatedImageResult = result.data[0];
    let generatedImageBase64;

    if (generatedImageResult instanceof Blob) {
      const arrayBuffer = await generatedImageResult.arrayBuffer();
      generatedImageBase64 = bufferToBase64(Buffer.from(arrayBuffer));
    } else if (generatedImageResult?.url) {
      const response = await fetch(generatedImageResult.url);
      const arrayBuffer = await response.arrayBuffer();
      generatedImageBase64 = bufferToBase64(Buffer.from(arrayBuffer));
    } else if (typeof generatedImageResult === 'string' && generatedImageResult.startsWith('/')) {
      // It might be a file path returned by the API
      const response = await fetch(`https://yisol-idm-vton.hf.space/file=${generatedImageResult}`);
      const arrayBuffer = await response.arrayBuffer();
      generatedImageBase64 = bufferToBase64(Buffer.from(arrayBuffer));
    } else if (typeof generatedImageResult === 'object' && generatedImageResult.path) {
      // Handle file path object
      const response = await fetch(`https://yisol-idm-vton.hf.space/file=${generatedImageResult.path}`);
      const arrayBuffer = await response.arrayBuffer();
      generatedImageBase64 = bufferToBase64(Buffer.from(arrayBuffer));
    } else {
      console.error("Unexpected result format:", result);
      throw new Error("Failed to parse generated image from model response");
    }

    const dataURL = base64ToDataURL(generatedImageBase64, 'image/png');

    return {
      success: true,
      generatedImage: dataURL,
    };
  } catch (error) {
    console.error('IDM-VTON API Error:', error);
    throw error;
  }
}

/**
 * Retry logic for API calls
 */
export async function generateTryOnWithRetry(imageBuffer, clothingData, shirtBuffer, pantsBuffer, maxRetries = 1) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await generateTryOn(imageBuffer, clothingData, shirtBuffer, pantsBuffer);
    } catch (error) {
      lastError = error;

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
