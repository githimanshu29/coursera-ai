import dotenv from "dotenv";
dotenv.config({ path: ".env" });
console.log("API KEY loaded:", process.env.GEMINI_API_KEY ? "YES" : "NO ❌");

import getEmbeddings from "./embeddings.js";
import { splitTopicContent } from "./splitter.js";
import { generateChapterWithRAG } from "./ragChain.js";

const runTest = async () => {
  console.log("\n========== LangChain RAG Test ==========\n");

  // ── Test 1: Embeddings ──────────────────────────────────────
  console.log("TEST 1: Embeddings");
  try {
    const embeddings = getEmbeddings();
    const vector = await embeddings.embedQuery("What is a database?");
    console.log(`✅ Embedding generated — dimensions: ${vector.length}`);
    console.log(
      `   First 5 values: [${vector
        .slice(0, 5)
        .map((v) => v.toFixed(4))
        .join(", ")}]`,
    );
  } catch (err) {
    console.error(`❌ Embeddings failed: ${err.message}`);
  }

  // ── Test 2: Text Splitter ───────────────────────────────────
  console.log("\nTEST 2: Text Splitter");
  try {
    const sampleHtml = `
      <h2>What is SQL?</h2>
      <p>SQL stands for Structured Query Language. It is used to communicate with databases.
      SQL statements are used to perform tasks such as update data on a database, or retrieve 
      data from a database. Common SQL commands include SELECT, INSERT, UPDATE, DELETE, 
      CREATE, and DROP.</p>
      <h3>Why use SQL?</h3>
      <p>SQL is the standard language for relational database systems. All the major RDBMS 
      like MySQL, Oracle, MS SQL Server, IBM DB2, and PostgreSQL use SQL as their standard 
      database language.</p>
    `;
    const docs = await splitTopicContent("What is SQL?", sampleHtml);
    console.log(`✅ Splitter working — created ${docs.length} chunks`);
    docs.forEach((doc, i) => {
      console.log(`   Chunk ${i + 1}: ${doc.pageContent.slice(0, 60)}...`);
    });
  } catch (err) {
    console.error(`❌ Splitter failed: ${err.message}`);
  }

  // ── Test 3: RAG Chain ───────────────────────────────────────
  console.log("\nTEST 3: RAG Chain (Gemini generation)");
  try {
    const result = await generateChapterWithRAG({
      courseName: "SQL Fundamentals",
      courseLevel: "beginner",
      courseOutline:
        "Chapter 1: Intro to SQL | Chapter 2: SELECT queries | Chapter 3: WHERE clause",
      chapterNumber: 2,
      chapterName: "Basic SELECT Queries",
      topics: ["SELECT statement", "Selecting columns", "FROM clause"],
      retrievedChunks: [
        {
          chapterName: "Intro to SQL",
          topic: "What is SQL?",
          content:
            "SQL is a language for querying relational databases. It allows you to retrieve, insert, update and delete data.",
          score: 0.91,
        },
      ],
      userInstruction: "add more examples",
    });

    console.log(`✅ RAG Chain working!`);
    console.log(`   Chapter: ${result.chapterName}`);
    console.log(`   Topics generated: ${result.content?.length}`);
    result.content?.forEach((t, i) => {
      console.log(
        `   Topic ${i + 1}: "${t.topic}" — ${t.htmlContent?.length} chars`,
      );
    });
  } catch (err) {
    console.error(`❌ RAG Chain failed: ${err.message}`);
    console.error(err.stack);
  }

  console.log("\n========================================\n");
};

runTest();
