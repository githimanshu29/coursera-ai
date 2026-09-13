import express from "express";
import { generateCourseLayout } from "../controllers/course/generateCourseLayout.js";
import { generateCourseContent } from "../controllers/course/generateCourseContent.js";
import {
  getCourseById,
  getUserCourses,
  getPreviewCourses,
} from "../controllers/course/getUserCourses.js";
import { deleteCourse } from "../controllers/course/deleteCourse.js";
import { protect } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import { cacheMiddleware } from "../middleware/cache.js";

import { generateChapterRAG } from "../controllers/course/generateChapterRAG.js";

import protectSSE from "../middleware/protectSSE.js";

const router = express.Router();

router.post("/generate-layout", protect, aiLimiter, generateCourseLayout);
router.post(
  "/generate-content/:courseId",
  protect,
  aiLimiter,
  generateCourseContent,
);
router.get("/user-courses", protect, cacheMiddleware(600), getUserCourses);
router.get("/preview", getPreviewCourses);

router.get(
  "/generate-chapter-rag/:courseId",
  protectSSE,
  aiLimiter,
  generateChapterRAG,
);

router.get("/:courseId", cacheMiddleware(600), getCourseById); // public — anyone can view
router.delete("/:courseId", protect, deleteCourse);


router.get("/debug-langchain", async (req, res) => {
  try {
    const Course = require("../models/Course").default;
    const course = await Course.findOne({ name: /langchain/i }).sort({createdAt: -1});
    if (!course) return res.json({ error: "not found" });
    res.json({
      name: course.name,
      status: course.status,
      chaptersArrayLength: course.courseJson?.chapters?.length,
      courseContentType: typeof course.courseContent,
      courseContentIsArray: Array.isArray(course.courseContent),
      courseContentKeys: Object.keys(course.courseContent || {}),
      courseJsonKeys: Object.keys(course.courseJson || {}),
      chaptersBuilt: course.chaptersBuilt
    });
  } catch(e) {
    res.json({ error: e.message });
  }
});

export default router;
