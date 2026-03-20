import mongoose from "mongoose";

const chapterChunkSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: true,
    },
    chapterIndex: {
      type: Number,
      required: true,
    },
    chapterName: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// compound index for fast filtering
chapterChunkSchema.index({ courseId: 1, userId: 1, chapterIndex: 1 });

const ChapterChunk = mongoose.model("ChapterChunk", chapterChunkSchema);

export default ChapterChunk;