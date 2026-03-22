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
  const vectorStore = getVectorStore();

  //filter ek javascript object hai yaha par jo ki MongoDB Atlas ke vector search ke liye use hota hai. Isme hum specify kar rahe hain ki humein sirf wahi chunks chahiye jo ki current course se belong karte hain (courseId), jise current user ne create kiya hai (userId), aur jinka chapter index current chapter se chhota hai (currentChapterIndex). Is tarah se hum ensure karte hain ki humein sirf relevant aur allowed chunks hi milen, jo ki RAG process ke liye zaruri hain.
  const filter = {
    //prefilter comes from MongoDb Atlas vector Search, meaning of prefilter is apply these conditions before searching for relevant chunks based on vector similarity. Isme hum compound condition use kar rahe hain jisme must ka matlab hai ki in sab conditions ko satisfy karna zaruri hai. Pehli condition hai ki courseId match hona chahiye, dusri condition hai ki userId match hona chahiye, aur teesri condition hai ki chapterIndex currentChapterIndex se chhota hona chahiye. Is tarah se hum ensure karte hain ki humein sirf wahi chunks milen jo ki current course ke hain, jise current user ne create kiya hai, aur jo ki current chapter se pehle ke chapters se belong karte hain.
    preFilter: {
      //compound is used to combine multiple objects,ALL conditions must be true (AND logic)

      compound: {
        must: [
          { equals: { path: "courseId", value: courseId } },
          { equals: { path: "userId", value: userId } },
          { range: { path: "chapterIndex", lt: currentChapterIndex } },
        ],
      },
    },
  };

  const results = await vectorStore.similaritySearchWithScore(
    query,
    topK,
    filter,
  );

  logger.info(
    `Retrieved ${results.length} chunks for query: "${query.slice(0, 50)}..."`,
  );

  return results.map(([doc, score]) => ({
    content: doc.pageContent,
    topic: doc.metadata.topic,
    chapterName: doc.metadata.chapterName,
    chapterIndex: doc.metadata.chapterIndex,
    score: parseFloat(score.toFixed(3)),
  }));
};
