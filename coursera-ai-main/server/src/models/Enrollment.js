import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    cid: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // matches original completedChapters json field
    completedChapters: {
      type: Array,
      default: [],
    },

    completedTopics: {
  type: [String],
  default: [],
},
progress: {
  type: Number,
  default: 0,
},
  },
  { timestamps: true }
);

// one enrollment per user per course
enrollmentSchema.index({ cid: 1, userId: 1 }, { unique: true });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;