import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctIndex: { type: Number, required: true },
  explanation: { type: String, required: true },
});

const quizSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true },
    chapterIndex: { type: Number, required: true }, // -1 = final quiz
    chapterName: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [questionSchema],

    attempted: { type: Boolean, default: false },
    skipped: { type: Boolean, default: false },
    score: { type: Number, default: 0 }, // 0-100
    passed: { type: Boolean, default: false },
    userAnswers: { type: [Number], default: [] },
  },
  { timestamps: true },
);

quizSchema.index({ courseId: 1, userId: 1, chapterIndex: 1 });

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
