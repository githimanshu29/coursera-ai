import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import mongoose from "mongoose";
import getEmbeddings from "./embeddings.js";
import logger from "../logger.js";

// get vector store instance for a specific course
export const getVectorStore = () => {
  const collection = mongoose.connection.db.collection("chapterchunks");

  return new MongoDBAtlasVectorSearch(getEmbeddings(), {
    collection,
    indexName: "chapter_embedding_index",
    textKey: "content",
    embeddingKey: "embedding",
  });
};

// store chunks from a chapter into vector store
export const storeChapterChunks = async ({
  docs,
  courseId,
  chapterIndex,
  chapterName,
  userId,
  onProgress,
}) => {
  const vectorStore = getVectorStore();

  // attach metadata to each doc
  const docsWithMeta = docs.map((doc, i) => ({
    ...doc,
    metadata: {
      ...doc.metadata,
      courseId,
      chapterIndex,
      chapterName,
      userId,
      chunkIndex: i,
    },
  }));

  // store in batches of 5 — emit progress after each batch
  const batchSize = 5;
  let stored = 0;

  for (let i = 0; i < docsWithMeta.length; i += batchSize) {
    const batch = docsWithMeta.slice(i, i + batchSize);
    await vectorStore.addDocuments(batch);
    stored += batch.length;

    if (onProgress) {
      onProgress({
        stored,
        total: docsWithMeta.length,
        topic: batch[0].metadata.topic,
      });
    }
  }

  logger.info(
    `Stored ${stored} chunks for course:${courseId} chapter:${chapterIndex}`,
  );
  return stored;
};

// retrieve relevant chunks from previous chapters
export const retrieveRelevantChunks = async ({
  courseId,
  userId,
  query,
  currentChapterIndex,
  topK = 5,
}) => {
  // first chapter has no previous context — skip retrieval
  if (currentChapterIndex === 0) return [];

  const vectorStore = getVectorStore();

  try {
    // Atlas Vector Search filter — must use MQL not aggregation syntax
    const filter = {
      courseId: courseId,
      userId: userId.toString(),
      chapterIndex: { $lt: currentChapterIndex },
    };

    const results = await vectorStore.similaritySearchWithScore(
      query,
      topK,
      filter,
    );

    logger.info(
      `Retrieved ${results.length} chunks for query: "${query.slice(0, 50)}"`,
    );

    return results.map(([doc, score]) => ({
      content: doc.pageContent,
      topic: doc.metadata.topic,
      chapterName: doc.metadata.chapterName,
      chapterIndex: doc.metadata.chapterIndex,
      score: parseFloat(score.toFixed(3)),
    }));
  } catch (error) {
    // if retrieval fails — don't block generation, just continue without context
    logger.warn(
      `Vector retrieval failed: ${error.message} — continuing without context`,
    );
    return [];
  }
};
