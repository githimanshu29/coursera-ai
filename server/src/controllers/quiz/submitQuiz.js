import Quiz from "../../models/Quiz.js";
import asyncHandler from "../../middleware/asyncHandler.js";
import logger from "../../lib/logger.js";

export const submitQuiz = asyncHandler(async (req, res) => {
  const { quizId, answers } = req.body;
  // answers = [2, 0, 1, 3, 2] — user's chosen index per question

  const quiz = await Quiz.findById(quizId);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });

  if (quiz.attempted) {
    return res.status(400).json({ message: "Quiz already attempted" });
  }

  // calculate score
  let correct = 0;
  const results = quiz.questions.map((q, i) => {
    const isCorrect = answers[i] === q.correctIndex;
    if (isCorrect) correct++;
    return {
      question: q.question,
      options: q.options,
      userAnswer: answers[i],
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      isCorrect,
    };
  });

  const score = Math.round((correct / quiz.questions.length) * 100);
  const passed = score >= 80;

  // update quiz document
  quiz.attempted = true;
  quiz.score = score;
  quiz.passed = passed;
  quiz.userAnswers = answers;
  await quiz.save();

  logger.info(
    `Quiz submitted — quizId:${quizId} score:${score} passed:${passed}`,
  );

  res.json({
    success: true,
    score,
    passed,
    correct,
    total: quiz.questions.length,
    results, // full details with explanations
  });
});
