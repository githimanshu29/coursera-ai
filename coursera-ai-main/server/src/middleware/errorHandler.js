import logger from "../lib/logger.js";

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  logger.error({
    message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?._id || "unauthenticated",
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;