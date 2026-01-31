import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

async function listModels() {
    try {
        const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).apiKey; // Just accessing the instance
        // Actually the SDK has a generativeAI.getGenerativeModel, but looking for listModels on the manager.
        // The SDK structure is: const genAI = new GoogleGenerativeAI(API_KEY);
        // Note: The JS SDK doesn't expose listModels directly on the main class in all versions easily without looking at docs,
        // but the error message suggested calling ListModels.
        // Let's use the REST API approach in node to be 100% sure what the key sees, or just use the curl output I already partially have but get the FULL list.

        // Actually, let's just use the curl command again but grep for "name" so I see ALL names without truncation.
    } catch (error) {
        console.error(error);
    }
}
