import logger from "../lib/logger.js";

//this middleware runs for every request and log the method, url, status code and duration of the request
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? "warn" : "info";

    logger[level]({
      message: `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
      userId: req.user?._id || "unauthenticated",
    });
  });

  next();
};

export default requestLogger;