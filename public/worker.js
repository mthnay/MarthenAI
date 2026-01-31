
import { pipeline } from '@xenova/transformers';

class MyTranslationPipeline {
    static task = 'text2text-generation';
    static model = 'Xenova/LaMini-Flan-T5-248M';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { text } = event.data;

    try {
        const generator = await MyTranslationPipeline.getInstance((data) => {
            // You can send loading progress back if you want
            // self.postMessage({ status: 'loading', data });
            console.log("Loading model...", data);
        });

        // Generate response
        const output = await generator(text, {
            max_new_tokens: 100,
            temperature: 0.7,
            repetition_penalty: 1.2,
        });

        // Send the result back to the main thread
        self.postMessage({
            status: 'complete',
            output: output[0].generated_text,
        });

    } catch (error) {
        self.postMessage({ status: 'error', error: error.message });
    }
});
