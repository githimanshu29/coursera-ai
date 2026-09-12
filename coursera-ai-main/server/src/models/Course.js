import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    cid: {
      type: String,
      required: true,
      unique: true,
    },
    name: { type: String },
    description: { type: String, default: "" },
    category: { type: String, default: "" },
    level: { type: String, required: true },
    noOfChapters: { type: Number, required: true },
    includeVideo: { type: Boolean, default: false },
    bannerImagePrompt: { type: String, default: "" },

    // Step 1 — AI generated layout (chapters + topics structure)


    courseJson: { type: Object, default: {} },
    
    
    //courseJson is object containing chapters(array, which contains chapters as object). i,e each chapter of chapter[] is object as element.

    // Step 2 — AI generated full content



    courseContent: { type: Object, default: {} },

    status: {
      type: String,
      enum: ["SETUP_REQUIRED", "BUILDING", "READY"],
      default: "SETUP_REQUIRED",
    },

    generationMode: {
  type: String,
  enum: ["all_at_once", "step_by_step"],
  default: "all_at_once",
},

chaptersBuilt: {
  type: Number,
  default: 0,
},

currentChapterIndex: {
  type: Number,
  default: 0,
},


    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;




/*
 Without ref + populate:          With ref + populate:
─────────────────────            ────────────────────
course = {                       course = {
  cid: "f47ac10b",                 cid: "f47ac10b",
  createdBy: "64f1a2b3"  →→→      createdBy: {
}                                    name: "Himanshu",
                                     email: "himanshu@gmail.com"
                                   }
                                 }
*/