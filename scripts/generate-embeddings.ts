import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface KnowledgeEntry {
  id: string;
  topic: string;
  content: string;
}

interface EmbeddedEntry extends KnowledgeEntry {
  embedding: number[];
}

async function generateEmbeddings() {
  const kbPath = path.join(process.cwd(), "data", "knowledge-base.json");
  const entries: KnowledgeEntry[] = JSON.parse(fs.readFileSync(kbPath, "utf-8"));

  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const embedded: EmbeddedEntry[] = [];

  for (const entry of entries) {
    console.log(`Embedding: ${entry.topic}...`);
    const result = await model.embedContent(entry.content);
    embedded.push({
      ...entry,
      embedding: result.embedding.values,
    });
  }

  const outputPath = path.join(process.cwd(), "data", "embeddings.json");
  fs.writeFileSync(outputPath, JSON.stringify(embedded, null, 2));
  console.log(`Done! Saved ${embedded.length} embeddings to ${outputPath}`);
}

generateEmbeddings();