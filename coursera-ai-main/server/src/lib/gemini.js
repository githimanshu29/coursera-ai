import { GoogleGenAI } from "@google/genai";

// Default AI instance using the server's environment variable
const defaultAi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Returns a GoogleGenAI client.
 * If the user provides a custom key via the 'x-gemini-key' header, it instantiates a new client with that key.
 * Otherwise, it returns the default server client.
 */
export const getAIClient = (req) => {
  const customKey = req.headers["x-gemini-key"];
  
  if (customKey && customKey.trim().length > 0) {
    return new GoogleGenAI({ apiKey: customKey.trim() });
  }

  return defaultAi;
};

export default defaultAi;