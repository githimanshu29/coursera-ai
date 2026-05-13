import Course from "../../models/Course.js";
// import ai from "../../lib/groq.js";

import { generateWithModel } from "../../lib/groq.js";
import { jsonrepair } from "jsonrepair";
import logger from "../../lib/logger.js";
const PROMPT = `Generate Learning Course depends on following details. In which Make sure to add Course Name, Description, Course Banner Image Prompt (Create a modern, flat-style 2D digital illustration representing user Topic. Include UI/UX elements such as mock-up screens, text blocks, icons, buttons, and creative workspace tools. Add symbolic elements related to user Course, like sticky notes, design components, and visual aids. Use a vibrant color palette [blues, purples, oranges] with a clean, professional look. The illustration should feel creative, tech-savvy, and educational, ideal for visualizing concepts in user Course) for Course Banner in 3d format. Chapter Name, Topic under each chapters, Duration for each chapters etc. in .JSON format only.

Remember it is not neccessary that all the chapters have same number of topics, any  chapter can have different number of topics according to chapter's need.


strict order: Generate layout such as the following error never appear-> "Error parsing AI response as JSON: course layout error SyntaxError: Unexpected token 'H', "Here's the"... is not valid JSON
    at JSON.parse (<anonymous>)
    at POST (app\api\generate-course-layout\route.jsx:91:28)
  89 |
  90 |             //console.log("Himanshu course  layout-Rawjson", RawJson);
> 91 |             JSONResp = JSON.parse(RawJson);
     |                            ^
  92 |             //console.log("Himanshu course layout-JsonREsp", JSONResp);
  93 |         } catch (parseError) {
  94 |             console.error("Error parsing AI response as JSON: course layout error", parseError);"

Schema:

{
  "course": {
    "name": "string",
    "description": "string",
    "category": "string",
    "level": "string",
    "includeVideo": "boolean",
    "noOfChapters": "number",
    "bannerImagePrompt": "string",
    "chapters": [
      {
        "chapterName": "string",
        "duration": "string",
        "topics": [
          "string"
        ]
      }
    ]
  }
}, User Input:
`;

export const generateCourseLayout = async (req, res) => {
  try {
    const {
      cid,
      name,
      description,
      category,
      level,
      noOfChapters,
      includeVideo,
      modelProvider,
      modelName,
      previewCourse,
      previewPassword,
    } = req.body;

    if (previewCourse) {
      const expected = (process.env.PREVIEW_COURSE_PASSWORD || "").trim();
      const provided = (previewPassword || "").toString().trim();
      if (!expected || provided !== expected) {
        return res.status(403).json({
          success: false,
          message: "Invalid preview course password",
        });
      }
    }

    const userInput = JSON.stringify({
      name,
      description,
      category,
      level,
      noOfChapters,
      includeVideo,
    });

    // ── Call selected model ──
    const rawResp = await generateWithModel({
      prompt: PROMPT + userInput,
      provider: modelProvider || "groq",
      model: modelName,
    });

    // ── Clean + repair + parse ──
    const cleaned = rawResp.replace(/```json\s*|\s*```/g, "").trim();

    let parsedResp;
    try {
      const repaired = jsonrepair(cleaned);
      parsedResp = JSON.parse(repaired);
    } catch (parseError) {
      logger.error(
        `generateCourseLayout JSON parse error: ${parseError.message}`,
      );
      logger.error(`Raw response: ${rawResp.slice(0, 300)}`);
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON",
        error: parseError.message,
      });
    }

    const courseDetails = parsedResp.course;

    // ── Save to DB ──
    const course = await Course.create({
      cid,
      name: courseDetails.name,
      description: courseDetails.description,
      category: courseDetails.category,
      level: courseDetails.level,
      noOfChapters: courseDetails.noOfChapters,
      includeVideo: courseDetails.includeVideo || false,
      bannerImagePrompt: courseDetails.bannerImagePrompt,
      courseJson: courseDetails,
      previewCourse: !!previewCourse,
      createdBy: req.user._id,
    });

    logger.info(`Course layout generated — cid:${cid}`);

    res.status(201).json({
      success: true,
      message: "Course layout generated successfully",
      course,
    });
  } catch (error) {
    logger.error(`generateCourseLayout error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to generate course layout",
      error: error.message,
    });
  }
};

/*
 const cleanJson = rawResp
  .replace(/```json/g, "")   // removes ```json
  .replace(/```/g, "")       // removes closing ```
  .trim();                   // removes whitespace/newlines
```

Before cleaning:
```
```json
{"course": {"name": "SQL Fundamentals"}}
```
```

After cleaning:
```
{"course": {"name": "SQL Fundamentals"}}
 
 */
