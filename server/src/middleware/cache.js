import redis from "../lib/redis.js";
import logger from "../lib/logger.js";

// ── cache middleware — attach to GET routes ──
export const cacheMiddleware = (ttlSeconds) => async (req, res, next) => {
  const key = `cache:${req.originalUrl}:${req.user?._id}`;

  try {
    const cached = await redis.get(key);
    if (cached) {
      logger.debug(`Cache hit: ${key}`);
      return res.json(JSON.parse(cached));
    }
    logger.debug(`Cache miss: ${key}`);

    // override res.json to intercept and cache the response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode === 200) {
        redis.setex(key, ttlSeconds, JSON.stringify(data)).catch(() => {});
      }
      return originalJson(data);
    };

    next();
  } catch (error) {
    logger.error(`Cache middleware error: ${error.message}`);
    next(); // always proceed even if Redis fails
  }
};

// ── cache invalidation — call after writes ──
export const invalidateCache = async (patterns) => {
  try {
    for (const pattern of patterns) {
      const keys = await redis.keys(`cache:${pattern}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.debug(`Cache invalidated: ${keys.length} keys matching ${pattern}`);
      }
    }
  } catch (error) {
    logger.error(`Cache invalidation error: ${error.message}`);
  }
};