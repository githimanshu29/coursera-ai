import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../lib/redis.js";
import logger from "../lib/logger.js";

const createLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
    }), //connects rate kimiter to redis store

    //custom handlwwer to log when rate limit is hit
    handler: (req, res, next, options) => {
      logger.warn({
        message: `Rate limit hit: ${req.originalUrl}`,
        ip: req.ip,
        userId: req.user?._id || "unauthenticated",
      });
      res
        .status(429)
        .json({ success: false, message: options.message.message });
    },
  });

//  global: all routes
export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 1000,
  message: "Too many requests, please try again after 15 minutes",
});

// auth routes: prevent brute force
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many login attempts, please try again after 15 minutes",
});

//  AI routes: prevent quota abuse
export const aiLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, //
  message: "AI generation limit reached, please try again after 1 hour",
});
