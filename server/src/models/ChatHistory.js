import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"] },
  content: { type: String },
});

const chatHistorySchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // array of { role, content }
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);

export default ChatHistory;