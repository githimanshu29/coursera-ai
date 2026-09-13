import Course from "../../models/Course.js";
import { invalidateCache } from "../../middleware/cache.js";
import User from "../../models/User.js";
import { getAIClient } from "../../lib/gemini.js";
import axios from "axios";
import { jsonrepair } from "jsonrepair";

const PROMPT = `You are an expert and professional course creator and tutor.

Generate course chapter content in VALID JSON format.
Create as much content as you can, very vast content, it should like a complete course content.

strict order 1-> for each and every topic, even for small heading generate as much content as you can, generate examples related to even small heading, try visualize the heading and topic, do not just give the general information behave like professional tutor and coach

strict order 2-> For definitions or introductory headings don't just generate some lines, you have to generate a vast content for each and every definition or introductory heading, you have to generate examples

strict order 3-> Generate all the chapters provided to you with their topics and try to complete the entire course in given chapters, if chapters are less then generate more topics as you can inside a chapter and make it a complete course content. Take course from beginning to advance

Rules:
- Use double quotes for all keys and string values
- No markdown (no \`\`\`)
- No explanations or extra text
- DO NOT HTML-escape the content. Use actual HTML tags (e.g. <h3>, <p>, <strong>).
  - You MUST escape double quotes inside the HTML using backslashes (e.g. class=\"my-class\").

Schema:
{
  "chapterName": "string",
  "content": [
    {
      "topic": "string",
      "htmlContent": "string (HTML content for the topic)"
    }
  ]
}

User Input:
`;


const getYoutubeVideos = async (topic) => {
  try {
    const resp = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: topic,
          type: "video",
          maxResults: 4,
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    return resp.data.items.map((item) => ({
      videoId: item?.id?.videoId,
      title: item?.snippet?.title,
    }));
  } catch (error) {
    console.error("YouTube fetch error for topic (from generateCourseContent): ", topic, error.message);
    return [];
  }
};

// ── Main controller ─────────────────────────────────────────────────────────
export const generateCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;

    // find course
    const course = await Course.findOne({ cid: courseId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found (from generateCourseContent)",
      });
    }

    const chapters = course.courseJson?.chapters || [];

    // ── Process all chapters simultaneously with Promise.all ──
    const user = await User.findById(req.user._id);
    const { client: ai, model: aiModel, error: aiError } = getAIClient(req, user);
    if (aiError) {
      return res.status(403).json({ success: false, message: aiError });
    }
    const courseContent = [];
    for (const chapter of chapters) { 
      // ── Call Gemini for this chapter ──
      const contents = [
        {
          role: "user",
          parts: [{ text: PROMPT + JSON.stringify(chapter) }],
        },
      ];

      const response = await ai.models.generateContent({
        model: aiModel,
        config: {
          
          responseMimeType: "text/plain",
        },
        contents,
      });

      const rawResp =
        response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleanedResp = rawResp.replace(/```json\s*|\s*```/g, "").trim();

      let JSONResp;
      try {
        // jsonrepair fixes broken/incomplete JSON from AI
        const repairedJSON = jsonrepair(cleanedResp);
        let tempObject = JSON.parse(repairedJSON);
          
          // If AI returned an array, extract the first item assuming it's the chapter
          if (Array.isArray(tempObject)) {
            tempObject = tempObject[0] || {};
          }

        // Helper to find content array recursively
        const findContentArray = (obj) => {
          if (Array.isArray(obj)) return obj;
          if (typeof obj === 'object' && obj !== null) {
            if (Array.isArray(obj.content)) return obj.content;
            if (Array.isArray(obj.topics)) return obj.topics;
            if (Array.isArray(obj.Content)) return obj.Content;
            if (Array.isArray(obj.Topics)) return obj.Topics;
            
            for (const key in obj) {
              const val = obj[key];
              if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
                return val; // First array of objects is likely the content
              }
              if (typeof val === 'object' && val !== null) {
                const found = findContentArray(val);
                if (found.length > 0) return found;
              }
            }
          }
          return [];
        };

        const rawContentArray = findContentArray(tempObject);

        // remap inconsistent AI keys to our schema
        JSONResp = {
          chapterName: tempObject.chapterName || tempObject.ChapterName || chapter.chapterName,
          content: rawContentArray.map((item) => {
            // Extract best guess for topic title
            let t = item.topic || item.title || item.Topic || item.Title;
            if (!t) {
              const strValues = Object.values(item).filter(v => typeof v === 'string' && v.length < 100);
              t = strValues.length > 0 ? strValues[0] : "Untitled Topic";
            }
            
            // Extract best guess for HTML content
            let h = item.htmlContent || item.content || item.text || item.HtmlContent || item.Content;
            if (!h) {
              const longStrings = Object.values(item).filter(v => typeof v === 'string' && v.length >= 100);
              h = longStrings.length > 0 ? longStrings[0] : (Object.values(item)[1] || "");
            }

            return {
              topic: t,
              htmlContent: h,
            };
          }),
        };

        console.log("✅ Parsed chapter:", chapter.chapterName);
      } catch (parseError) {
        console.error("❌ Parse error for chapter(generateCourseContent):", chapter.chapterName);
        console.error("Error:", parseError.message);

        // return empty content for this chapter — don't fail entire course
        JSONResp = {
          chapterName: chapter.chapterName,
          content: [],
        };
      }

      // ── Fetch YouTube videos for this chapter ──
      const youtubeVideo = await getYoutubeVideos(chapter.chapterName);

      courseContent.push({
        youtubeVideo,
        courseData: JSONResp,
      });

      // Add a small delay between requests to avoid burst rate limits (503 / 429)
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // ── Save to DB ──
    course.courseContent = courseContent;
    course.chaptersBuilt = chapters.length;
    course.status = "READY";
    course.markModified("courseContent");
    await course.save();

    // Invalidate stale cache
    await invalidateCache([`/api/courses/${courseId}`, /api/courses/user-courses]);

    res.status(200).json({
      success: true,
      message: "Course content generated successfully",
      courseContent,
    });
  } catch (error) {
    console.error("generateCourseContent error(from generateCourseContent):", error.message);
    res.status(500).json({
      success: false,
      message: `Failed to generate course content: ${error.message || "Unknown error"}`, /* dynamic error */
      error: error.message,
    });
  }
};