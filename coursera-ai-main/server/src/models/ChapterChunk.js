import mongoose from "mongoose";

const chapterChunkSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: true,

      //identifies which course this chunk belongs to
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

      //the actual text content of this chunk, auctual chunked from that particular chapter
    },
    embedding: {
      type: [Number],
      required: true,

      //vector embedding of the content for semantic/similarity search
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
chapterChunkSchema.index({ courseId: 1, userId: 1, chapterIndex: 1 });//creates a compound index to find all chunks for a specific course, user, and chapter efficiently, otherwise mongodb would have to scan all documents to find relevant chunks which would be slow as data grows

const ChapterChunk = mongoose.model("ChapterChunk", chapterChunkSchema);

export default ChapterChunk;