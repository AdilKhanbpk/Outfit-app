import { generateTryOn } from './server/utils/huggingface.js';
import { Buffer } from 'buffer';

// 1x1 transparent PNG (not used by FLUX.1-dev but required by function signature)
const MINIMAL_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

const clothingData = {
    shirt: { color: 'red', type: 't-shirt' },
    pants: { color: 'blue', type: 'jeans' },
    shoes: { color: 'white', type: 'sneakers' }
};

console.log('Testing generateTryOn with FLUX.1-dev...');

try {
    const result = await generateTryOn(MINIMAL_PNG, clothingData);

    if (result.success && result.generatedImage.startsWith('data:image/')) {
        console.log('SUCCESS: Image generated successfully!');
        console.log('Result length:', result.generatedImage.length);
        // Log first 50 chars of data URL to verify format
        console.log('Data URL start:', result.generatedImage.substring(0, 50));
    } else {
        console.error('FAILURE: Unexpected result format', result);
    }
} catch (error) {
    console.error('FAILURE: API call failed');
    console.error(error);
}
