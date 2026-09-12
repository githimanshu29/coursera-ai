import Course from "../../models/Course.js";
import ai from "../../lib/gemini.js";

const PROMPT = `enerate Learning Course depends on following details. In which Make sure to add Course Name, Description, Course Banner Image Prompt (Create a modern, flat-style 2D digital illustration representing user Topic. Include UI/UX elements such as mock-up screens, text blocks, icons, buttons, and creative workspace tools. Add symbolic elements related to user Course, like sticky notes, design components, and visual aids. Use a vibrant color palette [blues, purples, oranges] with a clean, professional look. The illustration should feel creative, tech-savvy, and educational, ideal for visualizing concepts in user Course) for Course Banner in 3d format. Chapter Name, Topic under each chapters, Duration for each chapters etc. in .JSON format only.


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
    } = req.body;

    // ── Call Gemini ──
    const contents = [
      {
        role: "user",
        parts: [
          {
            text:
              PROMPT +
              JSON.stringify({
                name,
                description,
                category,
                level,
                noOfChapters,
                includeVideo,
              }),
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        tools: [{ googleSearch: {} }],
        responseMimeType: "text/plain",
      },
      contents,
    });

    const rawResp = response.candidates[0]?.content.parts[0]?.text; // .text is actuall text string from AI, which is in JSON format as per our prompt. but sometimes it may come with markdown fences (```json ... ```), so we need to clean it before parsing.

    // ── Clean markdown fences if present ──
    const cleanJson = rawResp
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsedResp;
    try {
      parsedResp = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("JSON parse error(from generateCourseLayout):", parseError.message);
      console.error("Raw AI response:", rawResp);
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON (from -> generateCourseLayout)",
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
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Course layout generated successfully",
      course,
    });
  } catch (error) {
    console.error("generateCourseLayout error:", error.message);
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
