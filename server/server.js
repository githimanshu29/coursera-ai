import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';        
import connectDB from './src/config/db.js';
import cookieParser from "cookie-parser";
import authRoutes from './src/routes/auth.route.js';
import courseRoutes from './src/routes/course.routes.js';
import enrollmentRoutes from './src/routes/enrollment.routes.js';

import errorHandler from './src/middleware/errorHandler.js';
import requestLogger from './src/middleware/requestLogger.js';
import logger from './src/lib/logger.js';
import {globalLimiter} from './src/middleware/rateLimiter.js'

dotenv.config();
const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(globalLimiter);
app.use(requestLogger);


connectDB();
const PORT=process.env.PORT||5005;


app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);


app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});