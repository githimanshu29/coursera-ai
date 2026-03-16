import express from "express";
import { enrollCourse } from "../controllers/enrollment/enrollCourse.js";
import {
  getEnrolledCourses,
  getEnrolledCourseById,
} from "../controllers/enrollment/getEnrolledCourses.js";
import { deleteEnrollment } from "../controllers/enrollment/deleteEnrollment.js";
import { protect } from "../middleware/auth.js";
import { completeTopic } from "../controllers/enrollment/completeTopic.js";

const router = express.Router();

router.post("/enroll", protect, enrollCourse);
router.get("/", protect, getEnrolledCourses);
router.get("/:courseId", protect, getEnrolledCourseById);
router.delete("/:enrollmentId", protect, deleteEnrollment);
router.post("/complete-topic", protect, completeTopic);

export default router;