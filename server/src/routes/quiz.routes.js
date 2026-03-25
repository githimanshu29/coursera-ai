import express from "express";
import { protect } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import { generateQuiz } from "../controllers/quiz/generateQuiz.js";
import { submitQuiz } from "../controllers/quiz/submitQuiz.js";
import { skipQuiz } from "../controllers/quiz/skipQuiz.js";
import { getCourseQuizStatus } from "../controllers/quiz/getQuizStatus.js";

const router = express.Router();

router.get(
  "/generate/:courseId/:chapterIndex",
  protect,
  aiLimiter,
  generateQuiz,
);
router.post("/submit", protect, submitQuiz);
router.post("/skip", protect, skipQuiz);
router.get("/status/:courseId", protect, getCourseQuizStatus);

export default router;
