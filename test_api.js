import { generateTryOn } from './server/utils/huggingface.js';
import { Buffer } from 'buffer';

// 1x1 transparent PNG
const MINIMAL_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

const clothingData = {
    shirt: { color: 'red', type: 't-shirt' },
    pants: { color: 'blue', type: 'jeans' }
};

console.log('Testing generateTryOn with stable-diffusion-v1-5...');

// Mocking the function here to test different payloads if needed, 
// but for now we rely on the imported function which we will modify.
// Actually, I need to modify server/utils/huggingface.js to use the new URL first.
// So I will update that file first.

try {
    const result = await generateTryOn(MINIMAL_PNG, clothingData);
    if (result.success && result.generatedImage.startsWith('data:image/')) {
        console.log('SUCCESS: Image generated successfully!');
        console.log('Result length:', result.generatedImage.length);
    } else {
        console.error('FAILURE: Unexpected result format', result);
    }
} catch (error) {
    console.error('FAILURE: API call failed');
    console.error(error);
}
