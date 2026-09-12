import { GoogleGenAI } from "@google/genai";

// Default AI instance using the server's environment variable (for Pro users)
const serverAi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Fallback model when none is specified
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

/**
 * Returns a GoogleGenAI client + model name based on user's plan:
 * - Pro users (maxCredits > 20): use server's GEMINI_API_KEY
 * - Free tier users: must provide their own key via 'x-gemini-key' header (BYOK)
 * 
 * Model is read from the 'x-gemini-model' header (set by the frontend from localStorage).
 * Falls back to DEFAULT_MODEL if not provided.
 *
 * @param {object} req - Express request object
 * @param {object} user - Mongoose user document (must have maxCredits field)
 * @returns {{ client: GoogleGenAI, model: string, error: string|null }}
 */
export const getAIClient = (req, user) => {
  const model = (req.headers["x-gemini-model"] || DEFAULT_MODEL).trim();
  const isPro = user && user.maxCredits > 20;

  if (isPro) {
    // Pro plan: use server key, no BYOK required
    return { client: serverAi, model, error: null };
  }

  // Free tier: require user's own key
  const customKey = req.headers["x-gemini-key"];
  if (!customKey || customKey.trim().length === 0) {
    return {
      client: null,
      model: null,
      error:
        "Free tier users must provide their own Gemini API key. Please add your API key in the Billing page.",
    };
  }

  return { client: new GoogleGenAI({ apiKey: customKey.trim() }), model, error: null };
};

export default serverAi;
