import { GoogleGenAI } from "@google/genai";

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateWithGroq = async (prompt) => {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 8192,
  });
  return response.choices[0]?.message?.content || "";
};

const extractGeminiText = (result) => {
  if (result?.text) return result.text;
  const parts = result?.candidates?.[0]?.content?.parts || [];
  return parts
    .map((p) => p.text || "")
    .join("")
    .trim();
};

export const generateWithModel = async ({
  prompt,
  provider = "groq",
  model,
}) => {
  if (provider === "gemini") {
    const resp = await gemini.models.generateContent({
      model: model || "gemini-2.5-flash-lite",
      contents: prompt,
    });
    return extractGeminiText(resp) || "";
  }

  const response = await groq.chat.completions.create({
    model: model || "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 8192,
  });
  return response.choices[0]?.message?.content || "";
};

export default groq;
