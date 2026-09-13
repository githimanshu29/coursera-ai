import { GoogleGenAI } from "@google/genai";
import { Embeddings } from "@langchain/core/embeddings";
import logger from "../logger.js";

class GeminiEmbeddings extends Embeddings {
  constructor() {
    super({});
    this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async embedQuery(text) {
    const result = await this.client.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });
    return result.embeddings[0].values;
  }

  async embedDocuments(texts) {
    // Batch all texts in ONE API call instead of N sequential calls
    try {
      const result = await this.client.models.embedContent({
        model: "gemini-embedding-001",
        contents: texts,
      });
      return result.embeddings.map((e) => e.values);
    } catch {
      // fallback to one-by-one if batch fails
      return Promise.all(texts.map((t) => this.embedQuery(t)));
    }
  }
}

let embeddingsInstance = null;

const getEmbeddings = () => {
  if (!embeddingsInstance) {
    embeddingsInstance = new GeminiEmbeddings();
    logger.info("GeminiEmbeddings initialized");
  }
  return embeddingsInstance;
};

export default getEmbeddings;
