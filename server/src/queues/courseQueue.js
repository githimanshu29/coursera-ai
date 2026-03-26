import Bull from "bull";
import logger from "../lib/logger.js";

const isProduction = process.env.NODE_ENV === "production";

const courseQueue = new Bull("course-generation", {
  redis: isProduction
    ? process.env.UPSTASH_REDIS_URL
    : {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});

//event listeners,yaha job ek object hai jo API se recieve hota hai
courseQueue.on("completed", (job) => {
  logger.info(`Job ${job.id} completed — courseId: ${job.data.courseId}`);
});

courseQueue.on("failed", (job, err) => {
  logger.error(
    `Job ${job.id} failed — courseId: ${job.data.courseId} — ${err.message}`,
  );
});

courseQueue.on("stalled", (job) => {
  logger.warn(`Job ${job.id} stalled — courseId: ${job.data.courseId}`);
});

export default courseQueue;
