import Quiz from "../../models/Quiz.js";
import asyncHandler from "../../middleware/asyncHandler.js";

// get all quiz statuses for a course — used to show badges
export const getCourseQuizStatus = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  const quizzes = await Quiz.find({ courseId, userId }).select(
    "chapterIndex chapterName attempted skipped score passed",
  );

  res.json({ success: true, quizzes });
});
