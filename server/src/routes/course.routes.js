import express from "express";
import { generateCourseLayout } from "../controllers/course/generateCourseLayout.js";
import { generateCourseContent } from "../controllers/course/generateCourseContent.js";
import { getCourseById, getUserCourses } from "../controllers/course/getUserCourses.js";
import { deleteCourse } from "../controllers/course/deleteCourse.js";
import { protect } from "../middleware/auth.js";
import  {aiLimiter} from "../middleware/rateLimiter.js";
import {cacheMiddleware} from "../middleware/cache.js";

const router = express.Router();

router.post("/generate-layout", protect, aiLimiter, generateCourseLayout);
router.post("/generate-content/:courseId", protect, aiLimiter, generateCourseContent);
router.get("/user-courses", protect, cacheMiddleware(600), getUserCourses); 
router.get("/:courseId",cacheMiddleware(600), getCourseById);                    // public — anyone can view
router.delete("/:courseId", protect, deleteCourse);

export default router;