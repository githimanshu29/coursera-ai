import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import courseQueue from "../courseQueue.js";
import Course from "../../models/Course.js";
import { generateChapterWithRAG } from "../../lib/langchain/ragChain.js";
import { splitTopicContent } from "../../lib/langchain/splitter.js";
import { storeChapterChunks } from "../../lib/langchain/vectorStore.js";
import { retrieveRelevantChunks } from "../../lib/langchain/vectorStore.js";

import logger from "../../lib/logger.js";
import axios from "axios";

const connectWorkerDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("Worker: MongoDB connected");
  }
};



courseQueue.process("generate-chapter", async (job) => {
  const { courseId, chapterIndex, userInstruction, userId } = job.data;

  await connectWorkerDB();

  logger.info(`Worker processing chapter ${chapterIndex} for course ${courseId}`);

  const course = await Course.findOne({ cid: courseId });
  if (!course) throw new Error(`Course not found: ${courseId}`);

  const currentChapter = course.courseJson.chapters[chapterIndex];
  if (!currentChapter) throw new Error(`Chapter ${chapterIndex} not found`);

  // retrieve relevant chunks from previous chapters 
  job.progress(10);
  const ragQuery = `${currentChapter.chapterName} ${currentChapter.topics.join(" ")} ${userInstruction || ""}`;

  const retrievedChunks = chapterIndex > 0
    ? await retrieveRelevantChunks({
        courseId,
        userId,
        query: ragQuery,
        currentChapterIndex: chapterIndex,
        topK: 5,
      })
    : [];

  logger.info(`Retrieved ${retrievedChunks.length} relevant chunks`);
  job.progress(25);

  //generate chapter with RAG chain
  const courseOutline = course.courseJson.chapters
    .map((ch, i) => `Chapter ${i + 1}: ${ch.chapterName}`)
    .join(" | ");

  const chapterData = await generateChapterWithRAG({
    courseName: course.name,
    courseLevel: course.level,
    courseOutline,
    chapterNumber: chapterIndex + 1,
    chapterName: currentChapter.chapterName,
    topics: currentChapter.topics,
    retrievedChunks,
    userInstruction,
  });

  job.progress(50);

  //  Step 3: chunk + embed + store in vector store.
  const allDocs = [];
  for (const topicData of chapterData.content) {
    const docs = await splitTopicContent(topicData.topic, topicData.htmlContent);
    allDocs.push(...docs);
  }

  await storeChapterChunks({
    docs: allDocs,
    courseId,
    chapterIndex,
    chapterName: currentChapter.chapterName,
    userId,
  });

  job.progress(75);

  //fetch YouTube videos
  let videos = [];
  if (course.includeVideo) {
    try {
      const ytResp = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            part: "snippet",
            q: currentChapter.chapterName,
            type: "video",
            maxResults: 3,
            key: process.env.YOUTUBE_API_KEY,
          },
        }
      );
      videos = ytResp.data.items.map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
      }));
    } catch (err) {
      logger.warn(`YouTube fetch failed for chapter ${chapterIndex}: ${err.message}`);
    }
  }

  job.progress(90);

  //Step 5: save to course ───────────────────────────────────
  if (!course.courseContent) course.courseContent = [];
  course.courseContent[chapterIndex] = {
    courseData: chapterData,
    youtubeVideo: videos,
  };

  const isLastChapter = chapterIndex + 1 >= course.courseJson.chapters.length;
  course.chaptersBuilt = chapterIndex + 1;
  course.currentChapterIndex = isLastChapter ? chapterIndex : chapterIndex + 1;
  course.status = isLastChapter ? "READY" : "BUILDING";
  course.markModified("courseContent");
  await course.save();

  job.progress(100);

  logger.info(`Chapter ${chapterIndex} complete — isLastChapter: ${isLastChapter}`);

  return {
    chapterIndex,
    chapterName: currentChapter.chapterName,
    isLastChapter,
    topicsGenerated: chapterData.content.length,
    chunksStored: allDocs.length,
    videosFound: videos.length,
  };
});

logger.info("Course generation worker started — waiting for jobs");