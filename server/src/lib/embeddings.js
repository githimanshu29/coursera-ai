import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import logger from "./logger.js";

let embeddingsInstance = null;

const getEmbeddings = () => {
  if (!embeddingsInstance) {
    embeddingsInstance = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: "text-embedding-004",
    });
    logger.info("GoogleGenerativeAIEmbeddings initialized");
  }
  return embeddingsInstance;
};

export default getEmbeddings;