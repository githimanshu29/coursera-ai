import Quiz from "../../models/Quiz.js";
import Course from "../../models/Course.js";
import ai from "../../lib/gemini.js";
import { jsonrepair } from "jsonrepair";
import asyncHandler from "../../middleware/asyncHandler.js";
import logger from "../../lib/logger.js";

export const generateQuiz = asyncHandler(async (req, res) => {
  const { courseId, chapterIndex } = req.params;
  const userId = req.user._id;
  const isFinal = chapterIndex === "-1";

  // check if quiz already exists
  const existing = await Quiz.findOne({
    courseId,
    chapterIndex: parseInt(chapterIndex),
    userId,
  });

  if (existing) {
    // return existing quiz — without correctIndex if not yet attempted
    return res.json({
      success: true,
      quiz: sanitizeQuiz(existing),
      alreadyExists: true,
    });
  }

  const course = await Course.findOne({ cid: courseId });
  if (!course) return res.status(404).json({ message: "Course not found" });

  // get chapter content for context
  let chapterName, contentContext;
  if (isFinal) {
    chapterName = `Final Quiz — ${course.name}`;
    contentContext = course.courseContent
      .map((ch, i) => {
        const name =
          course.courseJson.chapters[i]?.chapterName || `Chapter ${i + 1}`;
        const topics = ch?.courseData?.content?.map((t) => t.topic).join(", ");
        return `Chapter ${i + 1}: ${name} — Topics: ${topics}`;
      })
      .join("\n");
  } else {
    const idx = parseInt(chapterIndex);
    chapterName =
      course.courseJson.chapters[idx]?.chapterName || `Chapter ${idx + 1}`;
    const chapterContent = course.courseContent[idx];
    contentContext =
      chapterContent?.courseData?.content
        ?.map(
          (t) =>
            `Topic: ${t.topic}\n${t.htmlContent?.replace(/<[^>]*>/g, " ").slice(0, 500)}`,
        )
        .join("\n\n") || chapterName;
  }

  // generate questions with Gemini
  const prompt = `You are an expert quiz creator for a course called "${course.name}" (${course.level} level).

Generate exactly 5 multiple choice questions to test understanding of:
${isFinal ? `The entire course covering:\n${contentContext}` : `Chapter: "${chapterName}"\n\nContent:\n${contentContext}`}

Rules:
- Each question must have exactly 4 options (A, B, C, D)
- One correct answer per question
- Include a clear explanation for the correct answer
- Questions should test real understanding, not just memorization
- Difficulty should match ${course.level} level

Return ONLY valid JSON, no markdown:
{
  "questions": [
    {
      "question": "string",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 0,
      "explanation": "string"
    }
  ]
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    config: {
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "text/plain",
    },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const rawResp = response.candidates[0]?.content.parts[0]?.text || "";
  const cleaned = rawResp.replace(/```json\s*|\s*```/g, "").trim();
  const repaired = jsonrepair(cleaned);
  const parsed = JSON.parse(repaired);

  // save quiz to DB
  const quiz = await Quiz.create({
    courseId,
    chapterIndex: parseInt(chapterIndex),
    chapterName,
    userId,
    questions: parsed.questions,
  });

  logger.info(`Quiz generated — course:${courseId} chapter:${chapterIndex}`);

  res.json({
    success: true,
    quiz: sanitizeQuiz(quiz),
  });
});

// remove correctIndex before sending to frontend
const sanitizeQuiz = (quiz) => {
  const obj = quiz.toObject ? quiz.toObject() : quiz;
  return {
    ...obj,
    questions: obj.attempted
      ? obj.questions // if already attempted — reveal answers
      : obj.questions.map(({ correctIndex, ...rest }) => rest),
  };
};
