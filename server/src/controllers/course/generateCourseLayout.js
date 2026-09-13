import Course from "../../models/Course.js";
import User from "../../models/User.js";
import { getAIClient } from "../../lib/gemini.js";




const PROMPT = `Generate Learning Course depends on following details. In which Make sure to add Course Name, Description, Course Banner Image Prompt for Course Banner in 3d format, Chapter Name, Topic under each chapters, Duration for each chapters etc.

Remember it is not neccessary that all the chapters have same number of topics, any chapter can have different number of topics according to chapter's need.

strict order: Generate layout such as the following error never appear-> "Error parsing AI response as JSON: course layout error SyntaxError: Unexpected token 'H', \"Here's the\"... is not valid JSON"

STRICT INSTRUCTION: You MUST return a JSON object with a "chapters" array. Each chapter must have a "chapterName", "about", "duration", and an array of "topics".
Example Schema:
{
  "name": "Course Name",
  "description": "Description",
  "chapters": [
    {
      "chapterName": "Chapter 1",
      "about": "What this chapter is about",
      "duration": "1 hour",
      "topics": ["Topic 1", "Topic 2"]
    }
  ]
}

Return strictly JSON output only. No markdown formatting (`\`json`), just the raw JSON string.`;

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

    // Fetch user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Pro users get server key; free tier must provide BYOK via x-gemini-key header
    const { client: ai, model: aiModel, error: aiError } = getAIClient(req, user);
    if (aiError) {
      return res.status(403).json({ success: false, message: aiError });
    }

    // Call Gemini
    const contents = [
      {
        role: "user",
        parts: [
          {
            text:
              PROMPT +
              "\n\nSTRICT REQUIREMENT: You MUST generate EXACTLY " + noOfChapters + " chapters. Do not generate more or less than " + noOfChapters + " chapters.\n\n" +
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
      model: aiModel,
      config: {
        
        responseMimeType: "text/plain",
      },
      contents,
    });

    const rawResp = response.candidates[0]?.content.parts[0]?.text;

    // Clean markdown fences if present
    const cleanJson = rawResp
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsedResp;
    try {
      parsedResp = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("JSON parse error(from generateCourseLayout):", parseError.message);
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON",
        error: parseError.message,
      });
    }

    let courseDetails = parsedResp.course || parsedResp.courseDetails || parsedResp;
      
      // If the AI returned an array directly, wrap it in an object with a 'chapters' key
      if (Array.isArray(courseDetails)) {
        courseDetails = { chapters: courseDetails };
      }
      
      // If chapters is somehow missing but topics exists, wrap it
      if (!courseDetails.chapters && courseDetails.topics) {
        courseDetails.chapters = courseDetails.topics;
      }
      
      // If it's completely missing, provide an empty array so frontend doesn't crash
      if (!courseDetails.chapters) {
        courseDetails.chapters = [];
      }

    // Save to DB
    const course = await Course.create({
      cid,
      name: courseDetails.name || name,
      description: courseDetails.description || description,
      category: courseDetails.category || category,
      level: courseDetails.level || level,
      noOfChapters: courseDetails.noOfChapters || courseDetails.chapters?.length || courseDetails.numberOfChapters || Number(noOfChapters),
      includeVideo: courseDetails.includeVideo || false,
      bannerImagePrompt: courseDetails.bannerImagePrompt || "",
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
      message: `Failed to generate course layout: ${error.message || "Unknown error"}`, /* dynamic error */
      error: error.message,
    });
  }
};
