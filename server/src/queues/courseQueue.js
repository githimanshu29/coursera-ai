import Bull from "bull";
import logger from "../lib/logger.js";

const courseQueue = new Bull("course-generation", {
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
  },
  defaultJobOptions: {
    attempts: 1,
    backoff: {
      type: "exponential",
      delay: 3000, // 3s then 6s
    },
    removeOnComplete: 50, // keep last 50 completed jobs
    removeOnFail: 100, // keep last 100 failed jobs
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
