import Quiz from "../../models/Quiz.js";
import asyncHandler from "../../middleware/asyncHandler.js";

export const skipQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.body;

  const quiz = await Quiz.findByIdAndUpdate(
    quizId,
    { skipped: true },
    { new: true },
  );

  if (!quiz) return res.status(404).json({ message: "Quiz not found" });

  res.json({ success: true, message: "Quiz skipped" });
});
