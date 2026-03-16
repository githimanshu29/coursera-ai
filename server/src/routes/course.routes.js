import express from "express";
import { generateCourseLayout } from "../controllers/course/generateCourseLayout.js";
import { generateCourseContent } from "../controllers/course/generateCourseContent.js";
import { getCourseById, getUserCourses } from "../controllers/course/getUserCourses.js";
import { deleteCourse } from "../controllers/course/deleteCourse.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/generate-layout", protect, generateCourseLayout);
router.post("/generate-content/:courseId", protect, generateCourseContent);
router.get("/user-courses", protect, getUserCourses);
router.get("/:courseId", getCourseById);                    // public — anyone can view
router.delete("/:courseId", protect, deleteCourse);

export default router;