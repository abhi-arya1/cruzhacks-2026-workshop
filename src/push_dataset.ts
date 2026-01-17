import { CloudClient } from "chromadb";
import { MDocument } from "@mastra/rag";
import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";

// Keep in mind these functions only work on the server, not a client
// (such as a browser framework)
// You should never use SDKs such as Chroma that require API keys
// on a client, only on the server
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { MyEmbeddingFunction } from "./util/embedding_function";
import { COLLECTION_NAME } from "./constants";

// Initialize the chroma client
const client = new CloudClient({
  apiKey: process.env.CHROMA_API_KEY,
  tenant: process.env.CHROMA_API_TENANT,
  database: "Evals",
});

async function main() {
  // Get or create the collection of documents
  const collection = await client.getOrCreateCollection({
    name: COLLECTION_NAME,
    embeddingFunction: new MyEmbeddingFunction(),
  });

  // Read all markdown files from the dataset directory
  const datasetDir = join(import.meta.dir, "..", "dataset");
  const files = await readdir(datasetDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  console.log(`Found ${mdFiles.length} markdown files`);

  const allChunks: {
    id: string;
    text: string;
    metadata: Record<string, any>;
  }[] = [];

  // Process each file
  for (const file of mdFiles) {
    const filePath = join(datasetDir, file);
    const content = await readFile(filePath, "utf-8");

    // Create MDocument from markdown and chunk it
    // MDocument supports the following (see: https://mastra.ai/reference/rag/document)
    // - fromText, fromMarkdown, fromJSON, fromHTML, based on what you are chunking
    // If you are searching across code files, use code-chunk (https://github.com/supermemoryai/code-chunk) instead
    const doc = MDocument.fromMarkdown(content, { source: file });
    const chunks = await doc.chunk({
      strategy: "markdown",
      maxSize: 1000, // Maximum size of each chunk in characters
      overlap: 200, // Overlap between chunks in characters, to not lose search context
    });

    // Add chunks with unique IDs
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]!;
      allChunks.push({
        id: `${file}-chunk-${i}`,
        text: chunk.text,
        metadata: {
          ...(chunk.metadata ?? {}),
          source: file,
          chunkIndex: i,
        },
      });
    }

    console.log(`Processed ${file}: ${chunks.length} chunks`);
  }

  console.log(`Total chunks: ${allChunks.length}`);

  // Push to Chroma
  // ChromaDB SDK will automatically generate embeddings using
  // our Embedding Function in ./util/embedding_function.ts
  console.log("Pushing to Chroma...");
  await collection.add({
    ids: allChunks.map((c) => c.id),
    documents: allChunks.map((c) => c.text),
    metadatas: allChunks.map((c) => c.metadata),
  });

  console.log(`Done! Pushed all chunks to ${COLLECTION_NAME} collection.`);
}

main().catch(console.error);
