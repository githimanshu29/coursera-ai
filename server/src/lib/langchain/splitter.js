import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const getSplitter = () =>
  new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
    separators: ["\n\n", "\n", ". ", " ", ""],
  });

// strip HTML tags before splitting jaruri hai

// example input: "<p>This is <b>bold</b> and <i>italic</i>.</p>"  output: "This is bold and italic."
export const stripHtml = (html) =>
  html?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "";

// split a single topic into chunks
export const splitTopicContent = async (topic, htmlContent) => {
  const splitter = getSplitter();
  const plainText = `Topic: ${topic}\n\n${stripHtml(htmlContent)}`;
  const docs = await splitter.createDocuments(
    [plainText],
    [{ topic }] // metadata attached to every chunk
  );
  return docs;// output hai array objects ka array
};

export default getSplitter;