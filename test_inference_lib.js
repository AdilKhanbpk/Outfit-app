import { HfInference } from '@huggingface/inference';
import { Buffer } from 'buffer';

const hf = new HfInference(process.env.REACT_APP_HF_TOKEN);

// 1x1 transparent PNG
const MINIMAL_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

console.log('Testing HfInference with black-forest-labs/FLUX.1-dev imageToImage...');

try {
    const result = await hf.imageToImage({
        model: 'black-forest-labs/FLUX.1-dev',
        inputs: MINIMAL_PNG,
        parameters: {
            prompt: 'change the shirt to a red t-shirt',
            strength: 0.75
        }
    });

    console.log('Result type:', result.constructor.name);
    if (result instanceof Blob) {
        console.log('SUCCESS: Image generated successfully!');
        console.log('Result size:', result.size);
    } else {
        console.log('Result:', result);
    }

} catch (error) {
    console.error('FAILURE: API call failed');
    console.error(error);
}
