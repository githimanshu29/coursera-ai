import Quiz from "../../models/Quiz.js";
import asyncHandler from "../../middleware/asyncHandler.js";
import logger from "../../lib/logger.js";

export const retakeQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.body;
  const userId = req.user._id;

  const quiz = await Quiz.findById(quizId);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });

  if (quiz.userId.toString() !== userId.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  // store the courseId and chapterIndex before deleting
  const { courseId, chapterIndex } = quiz;

  // delete the old quiz so generateQuiz will create a fresh one
  await Quiz.findByIdAndDelete(quizId);

  logger.info(
    `Quiz retake — deleted quizId:${quizId} course:${courseId} chapter:${chapterIndex}`,
  );

  res.json({
    success: true,
    courseId,
    chapterIndex,
    message: "Old quiz deleted. Call generate to get a new one.",
  });
});
