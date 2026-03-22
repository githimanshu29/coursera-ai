import Course from "../../models/Course.js";
import courseQueue from "../../queues/courseQueue.js";
import logger from "../../lib/logger.js";

const sendEvent = (res, event, data) => {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
};

export const generateChapterRAG = async (req, res) => {
  const { courseId } = req.params;
  const { userInstruction = "" } = req.query;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  try {
    const course = await Course.findOne({ cid: courseId });

    if (!course) {
      sendEvent(res, "error", { message: "Course not found" });
      return res.end();
    }

    // ✅ Fix 1 — check actual chapters built vs total, not status
    const chapterIndex = course.chaptersBuilt || 0;
    const totalChapters = course.courseJson.chapters.length;

    if (chapterIndex >= totalChapters) {
      sendEvent(res, "error", { message: "All chapters already generated" });
      return res.end();
    }

    const currentChapter = course.courseJson.chapters[chapterIndex];

    if (!currentChapter) {
      sendEvent(res, "error", { message: "No more chapters to generate" });
      return res.end();
    }

    course.status = "BUILDING";
    await course.save();

    sendEvent(res, "status", {
      step: "queued",
      message: `Chapter ${chapterIndex + 1}/${totalChapters}: "${currentChapter.chapterName}" queued`,
      chapterIndex,
      totalChapters,
      userInstruction: userInstruction || "none",
    });

    const job = await courseQueue.add("generate-chapter", {
      courseId,
      chapterIndex,
      userInstruction,
      userId: req.user._id.toString(),
    });

    logger.info(
      `Job ${job.id} queued — course:${courseId} chapter:${chapterIndex}`,
    );

    sendEvent(res, "status", {
      step: "processing",
      message: "Worker started — retrieving context from previous chapters...",
      jobId: job.id,
    });

    const pollInterval = setInterval(async () => {
      try {
        const jobState = await job.getState();
        const progress = job.progress();

        const messages = {
          0: "Job picked up — worker processing...",
          10: "Searching previous chapters via semantic search...",
          25: "Context retrieved — generating with Gemini...",
          50: "Content generated — creating embeddings...",
          75: "Vectors stored — fetching YouTube videos...",
          90: "Saving to database...",
          100: "Chapter complete!",
        };
        const message = messages[progress] || `Processing... ${progress}%`;

        sendEvent(res, "progress", { progress, message, jobState });

        if (jobState === "completed") {
          clearInterval(pollInterval);
          const result = await job.finished();

          sendEvent(res, "done", {
            message: `Chapter ${chapterIndex + 1} complete!`,
            chapterIndex,
            chapterName: currentChapter.chapterName,
            isLastChapter: result.isLastChapter,
            nextChapterIndex: result.isLastChapter ? null : chapterIndex + 1,
            topicsGenerated: result.topicsGenerated,
            chunksStored: result.chunksStored,
            videosFound: result.videosFound,
            totalChapters,
          });

          res.end();
        }

        if (jobState === "failed") {
          clearInterval(pollInterval);
          const failedJob = await courseQueue.getJob(job.id);
          const reason = failedJob?.failedReason || "Unknown error";
          logger.error(`Job ${job.id} failed: ${reason}`);
          sendEvent(res, "error", {
            message: `Generation failed: ${reason}`,
            chapterIndex,
          });
          res.end();
        }
      } catch (pollErr) {
        logger.error(`Poll error: ${pollErr.message}`);
      }
    }, 1500);

    req.on("close", () => {
      clearInterval(pollInterval);
      logger.info(`Client disconnected — SSE closed for course:${courseId}`);
    });
  } catch (error) {
    logger.error(`generateChapterRAG error: ${error.message}`);
    sendEvent(res, "error", { message: error.message });
    res.end();
  }
};
