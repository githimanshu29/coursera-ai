import Redis from "ioredis";
import logger from "./logger.js";

const isProduction = process.env.NODE_ENV === "production";

const redis = isProduction
  ? new Redis(process.env.UPSTASH_REDIS_URL, {
      tls: {},
      connectTimeout: 10000,
      maxRetriesPerRequest: 3,
    })
  : new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT) || 6379,
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
