import Course from "../../models/Course.js";
import User from "../../models/User.js";
import { getAIClient } from "../../lib/gemini.js";




const PROMPT = `Generate Learning Course depends on following details. In which Make sure to add Course Name, Description, Course Banner Image Prompt (Create a modern, flat-style 2D digital illustration representing user Topic. Include UI/UX elements such as mock-up screens, text blocks, icons, buttons, and creative workspace tools. Add symbolic elements related to user Course, like sticky notes, design components, and visual aids. Use a vibrant color palette [blues, purples, oranges] with a clean, professional look. The illustration should feel creative, tech-savvy, and educational, ideal for visualizing concepts in user Course) for Course Banner in 3d format. Chapter Name, Topic under each chapters, Duration for each chapters etc. in .JSON format only.

Remember it is not neccessary that all the chapters have same number of topics, any  chapter can have different number of topics according to chapter's need.

strict order: Generate layout such as the following error never appear-> "Error parsing AI response as JSON: course layout error SyntaxError: Unexpected token 'H', \"Here's the\"... is not valid JSON"

Return strictly JSON output only.`;

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

    const courseDetails = parsedResp.course;

    // Save to DB
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
      message: `Failed to generate course layout: ${error.message || "Unknown error"}`, /* dynamic error */
      error: error.message,
    });
  }
};
