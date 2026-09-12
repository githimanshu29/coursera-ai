import Redis from "ioredis";
import logger from "./logger.js";
/*
📌 PURPOSE OF THIS FILE
- Creates a Redis connection
- Handles connection errors & retries
- Logs Redis status using logger
- Exports a ready-to-use Redis client
*/


//creating redis instance
const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    if (times > 3) {
      logger.error("Redis connection failed after 3 retries");
      return null;
    }
    return Math.min(times * 200, 2000);
  },
});

redis.on("connect", () => logger.info("Redis connected"));
redis.on("error", (err) => logger.error(`Redis error: ${err.message}`));

export default redis;