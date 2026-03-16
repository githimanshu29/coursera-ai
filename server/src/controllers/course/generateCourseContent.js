import Course from "../../models/Course.js";
import ai from "../../lib/gemini.js";
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
- HTML content must be properly escaped inside strings

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
    const promises = chapters.map(async (chapter) => {
      // ── Call Gemini for this chapter ──
      const contents = [
        {
          role: "user",
          parts: [{ text: PROMPT + JSON.stringify(chapter) }],
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

      const rawResp =
        response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleanedResp = rawResp.replace(/```json\s*|\s*```/g, "").trim();

      let JSONResp;
      try {
        // jsonrepair fixes broken/incomplete JSON from AI
        const repairedJSON = jsonrepair(cleanedResp);
        const tempObject = JSON.parse(repairedJSON);

        // remap inconsistent AI keys to our schema
        JSONResp = {
          chapterName: tempObject.chapterName,
          content: (tempObject.content || tempObject.topics || []).map(
            (item) => ({
              topic: item.topic || item.title,
              htmlContent: item.htmlContent || item.content || item.text,
            })
          ),
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

      return {
        youtubeVideo,
        courseData: JSONResp,
      };
    });

    // wait for all chapters to finish simultaneously
    const courseContent = await Promise.all(promises);

    // ── Save to DB ──
    course.courseContent = courseContent;
    course.status = "READY";
    course.markModified("courseContent");
    await course.save();

    res.status(200).json({
      success: true,
      message: "Course content generated successfully",
      courseContent,
    });
  } catch (error) {
    console.error("generateCourseContent error(from generateCourseContent):", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate course content",
      error: error.message,
    });
  }
};