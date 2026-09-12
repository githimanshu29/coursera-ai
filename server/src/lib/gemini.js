import { GoogleGenAI } from "@google/genai";

// Default AI instance using the server's environment variable (for Pro users)
const serverAi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Returns a GoogleGenAI client based on user's plan:
 * - Pro users (maxCredits > 20): use server's GEMINI_API_KEY
 * - Free tier users: must provide their own key via 'x-gemini-key' header (BYOK)
 *
 * @param {object} req - Express request object
 * @param {object} user - Mongoose user document (must have maxCredits field)
 * @returns {{ client: GoogleGenAI, error: string|null }}
 */
export const getAIClient = (req, user) => {
  const isPro = user && user.maxCredits > 20;

  if (isPro) {
    // Pro plan: use server key, no BYOK required
    return { client: serverAi, error: null };
  }

  // Free tier: require user's own key
  const customKey = req.headers["x-gemini-key"];
  if (!customKey || customKey.trim().length === 0) {
    return {
      client: null,
      error:
        "Free tier users must provide their own Gemini API key. Please add your API key in the course creation dialog.",
    };
  }

  return { client: new GoogleGenAI({ apiKey: customKey.trim() }), error: null };
};

export default serverAi;
