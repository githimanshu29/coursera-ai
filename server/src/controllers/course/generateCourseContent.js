import Course from "../../models/Course.js";
import { generateWithGroq } from "../../lib/groq.js";
import axios from "axios";
import { jsonrepair } from "jsonrepair";
import logger from "../../lib/logger.js";

const PROMPT = `You are an expert and professional course creator and tutor.

Generate course chapter content in VALID JSON format.
Create as much content as you can, very vast content, it should like a complete course content.

strict order 1-> for each and every topic, even for small heading generate as much content as you can, generate examples related to even small heading, try visualize the heading and topic, do not just give the general information behave like professional tutor and coach

strict order 2-> For definitions or introductory headings don't just generate some lines, you have to generate a vast content for each and every definition or introductory heading, you have to generate examples

strict order 3-> Generate all the chapters provided to you with their topics and try to complete the entire course in given chapters, if chapters are less then generate more topics as you can inside a chapter and make it a complete course content. Take course from beginning to advance.

Each should cover very vast knowledge as this is a learning platform here, so as much knowledge (content and text) you can generate please generate, each chapter's topic should not feel like this is very short just for shake of completing formality, beacause vast knowledge contains everyhing and helpful than less knowledge.

Add real life examples if possible to explain topics.

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
      },
    );
    return resp.data.items.map((item) => ({
      videoId: item?.id?.videoId,
      title: item?.snippet?.title,
    }));
  } catch (error) {
    logger.warn(`YouTube fetch failed for topic "${topic}": ${error.message}`);
    return [];
  }
};

export const generateCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({ cid: courseId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const chapters = course.courseJson?.chapters || [];

    // ── Process all chapters simultaneously ──
    const promises = chapters.map(async (chapter) => {
      // ── Call Groq ──
      const rawResp = await generateWithGroq(PROMPT + JSON.stringify(chapter));

      // ── Clean + repair + parse ──
      const cleaned = rawResp.replace(/```json\s*|\s*```/g, "").trim();

      let JSONResp;
      try {
        const repaired = jsonrepair(cleaned);
        const tempObject = JSON.parse(repaired);

        // normalize inconsistent AI keys to our schema
        JSONResp = {
          chapterName: tempObject.chapterName || chapter.chapterName,
          content: (tempObject.content || tempObject.topics || []).map(
            (item) => ({
              topic: item.topic || item.title || "Untitled Topic",
              htmlContent: item.htmlContent || item.content || item.text || "",
            }),
          ),
        };

        logger.info(` Chapter generated: ${chapter.chapterName}`);
      } catch (parseError) {
        logger.error(
          ` Parse error for chapter "${chapter.chapterName}": ${parseError.message}`,
        );

        // return empty content — don't fail entire course
        JSONResp = {
          chapterName: chapter.chapterName,
          content: [],
        };
      }

      // ── Fetch YouTube videos ──
      const youtubeVideo = await getYoutubeVideos(chapter.chapterName);

      return {
        youtubeVideo,
        courseData: JSONResp,
      };
    });

    const courseContent = await Promise.all(promises);

    // ── Save to DB ──
    course.courseContent = courseContent;
    course.status = "READY";
    course.generationMode = "all_at_once";
    course.chaptersBuilt = chapters.length;
    course.markModified("courseContent");
    await course.save();

    logger.info(`Course content generated — courseId:${courseId}`);

    res.status(200).json({
      success: true,
      message: "Course content generated successfully",
      courseContent,
    });
  } catch (error) {
    logger.error(`generateCourseContent error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to generate course content",
      error: error.message,
    });
  }
};
