import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface EmbeddedEntry {
  id: string;
  topic: string;
  content: string;
  embedding: number[];
}

let cachedEmbeddings: EmbeddedEntry[] | null = null;

function loadEmbeddings(): EmbeddedEntry[] {
  if (cachedEmbeddings) return cachedEmbeddings;

  const filePath = path.join(process.cwd(), "data", "embeddings.json");
  const data = fs.readFileSync(filePath, "utf-8");
  cachedEmbeddings = JSON.parse(data);
  return cachedEmbeddings!;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  return dotProduct / (magnitudeA * magnitudeB);
}

export async function retrieveRelevantContext(
  question: string,
  topK: number = 3
): Promise<{ topic: string; content: string }[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const questionResult = await model.embedContent(question);
  const questionEmbedding = questionResult.embedding.values;

  const knowledgeBase = loadEmbeddings();

  const scored = knowledgeBase.map((entry) => ({
    topic: entry.topic,
    content: entry.content,
    score: cosineSimilarity(questionEmbedding, entry.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map(({ topic, content }) => ({ topic, content }));
}