import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.route.js";
import courseRoutes from "./src/routes/course.routes.js";
import enrollmentRoutes from "./src/routes/enrollment.routes.js";
import quizRoutes from "./src/routes/quiz.routes.js";
import errorHandler from "./src/middleware/errorHandler.js";
import requestLogger from "./src/middleware/requestLogger.js";
import logger from "./src/lib/logger.js";
import redis from "./src/lib/redis.js";
import courseQueue from "./src/queues/courseQueue.js";

const app = express();

app.set("trust proxy", 1);

// ── CORS ──
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [process.env.CLIENT_URL, "http://localhost:5173"].filter(
        Boolean,
      );
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

app.get("/", (req, res) => res.json({ message: "Server is running" }));
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/quiz", quizRoutes);

app.use(errorHandler);

connectDB();

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

import "./src/queues/workers/courseWorker.js";

const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  try {
    await courseQueue.close();
    await mongoose.connection.close();
    redis.disconnect();
    logger.info("Shutdown complete");
  } catch (err) {
    logger.error(`Shutdown error: ${err.message}`);
  }
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
