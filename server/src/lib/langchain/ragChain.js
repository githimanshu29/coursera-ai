import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { jsonrepair } from "jsonrepair";
import logger from "../logger.js";

// ── LLM instance ─────────────────────────────────────────────
const getLLM = () =>
  new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.5-flash-lite",
    temperature: 0.7,
    maxOutputTokens: 8192,
  });

// ── Prompt template ───────────────────────────────────────────
const CHAPTER_PROMPT = ChatPromptTemplate.fromTemplate(`
You are an expert course creator building a course called "{courseName}" ({courseLevel} level).

FULL COURSE OUTLINE:
{courseOutline}

RELEVANT CONTEXT FROM PREVIOUS CHAPTERS (retrieved via semantic search):
{retrievedContext}

USER CUSTOMIZATION INSTRUCTION:
{userInstruction}

NOW GENERATE Chapter {chapterNumber}: "{chapterName}"
Topics to cover: {topics}

STRICT RULES:
- Build on the retrieved context above — reference earlier concepts where relevant
- Do NOT repeat content already covered in previous chapters
- Apply the user's customization instruction throughout
- Use HTML tags for formatting (h2, h3, p, ul, li, code, pre)
- Be comprehensive — this should feel like a real course chapter
- No markdown, no backticks, pure HTML content only

Return ONLY valid JSON, no explanation, no markdown fences:
{{
  "chapterName": "string",
  "content": [
    {{
      "topic": "string",
      "htmlContent": "string (rich HTML)"
    }}
  ]
}}
`);

// ── Parse user instruction into style directives ──────────────
export const parseUserInstruction = (instruction) => {
  if (!instruction?.trim()) {
    return "Generate comprehensive, well-structured content with clear explanations.";
  }

  const lower = instruction.toLowerCase();
  const directives = [];

  if (lower.includes("more example") || lower.includes("examples")) {
    directives.push(
      "Include 2-3 practical real-world examples for every concept.",
    );
  }
  if (
    lower.includes("simple") ||
    lower.includes("easier") ||
    lower.includes("basic")
  ) {
    directives.push(
      "Use very simple language. Avoid jargon. Explain every technical term.",
    );
    directives.push("Use real-world analogies to explain complex concepts.");
  }
  if (
    lower.includes("advanced") ||
    lower.includes("deep") ||
    lower.includes("detailed")
  ) {
    directives.push(
      "Go deep into technical details. Include edge cases and nuances.",
    );
    directives.push("Include advanced concepts beyond the basics.");
  }
  if (
    lower.includes("short") ||
    lower.includes("concise") ||
    lower.includes("brief")
  ) {
    directives.push("Keep content concise — key points only, no fluff.");
  }
  if (
    lower.includes("code") ||
    lower.includes("coding") ||
    lower.includes("programming")
  ) {
    directives.push(
      "Include extensive code examples with step-by-step explanations.",
    );
  }
  if (
    lower.includes("visual") ||
    lower.includes("diagram") ||
    lower.includes("table")
  ) {
    directives.push(
      "Use HTML tables and structured lists to visualize concepts.",
    );
  }

  return directives.length > 0
    ? directives.join(" ")
    : `Apply this instruction: "${instruction}"`;
};

// ── Format retrieved context for prompt ───────────────────────
const formatRetrievedContext = (chunks) => {
  if (!chunks?.length) {
    return "No previous chapters yet — this is the first chapter.";
  }

  return chunks
    .map(
      (c) =>
        `[Chapter "${c.chapterName}" | Topic: "${c.topic}" | Relevance: ${c.score}]\n${c.content.slice(0, 300)}...`,
    )
    .join("\n\n");
};

// ── Main RAG chain builder ─────────────────────────────────────
export const buildRagChain = () => {
  const llm = getLLM();
  const outputParser = new StringOutputParser();

  const chain = RunnableSequence.from([
    RunnablePassthrough.assign({
      retrievedContext: (input) =>
        formatRetrievedContext(input.retrievedChunks),
      userInstruction: (input) => parseUserInstruction(input.userInstruction),
    }),
    CHAPTER_PROMPT,
    llm,
    outputParser,
  ]);

  return chain;
};

// ── Run chain + parse output ───────────────────────────────────
export const generateChapterWithRAG = async ({
  courseName,
  courseLevel,
  courseOutline,
  chapterNumber,
  chapterName,
  topics,
  retrievedChunks,
  userInstruction,
}) => {
  const chain = buildRagChain();

  logger.info(
    `RAG chain running for chapter ${chapterNumber}: "${chapterName}"`,
  );

  const rawOutput = await chain.invoke({
    courseName,
    courseLevel,
    courseOutline,
    chapterNumber,
    chapterName,
    topics: topics.join(", "),
    retrievedChunks,
    userInstruction,
  });

  // clean + repair + parse JSON
  const cleaned = rawOutput.replace(/```json\s*|\s*```/g, "").trim();
  const repaired = jsonrepair(cleaned);
  const parsed = JSON.parse(repaired);

  logger.info(
    `Chapter ${chapterNumber} generated: ${parsed.content?.length} topics`,
  );

  return parsed;
};
