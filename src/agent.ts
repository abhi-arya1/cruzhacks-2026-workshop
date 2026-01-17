// This file demonstrates how to make an agent with search as a tool,
// with AI SDK automatically managing context

import { CloudClient } from "chromadb";
import { openai } from "@ai-sdk/openai";
import { streamText, stepCountIs, tool, type InferToolOutput } from "ai";
import { z } from "zod";

// These are only for demo purposes
import {
  printHeader,
  printQuery,
  printSearching,
  printSources,
  printError,
} from "./ui/pretty-print";
import { MyEmbeddingFunction } from "./util/embedding_function";
import { COLLECTION_NAME } from "./constants";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

// Initialize the chroma client
const client = new CloudClient({
  apiKey: process.env.CHROMA_API_KEY,
  tenant: process.env.CHROMA_API_TENANT,
  database: "Evals",
});

// Define the search tool
const searchTool = tool({
  description:
    "Search the React documentation knowledge base for information about React performance optimization, hooks, components, and best practices.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("The search query to find relevant React documentation"),
  }),
  execute: async ({ query }: { query: string }) => {
    printSearching(query);

    // Suppress ChromaDB's inaccurate embedding function warnings
    // (This is solely for demo purposes)
    const originalWarn = console.warn;
    console.warn = () => {};

    const collection = await client.getCollection({
      name: COLLECTION_NAME,
      embeddingFunction: new MyEmbeddingFunction(),
    });

    const results = await collection.query({
      queryTexts: [query],
      nResults: 5,
    });

    console.warn = originalWarn;

    if (!results.documents?.[0]?.length || results.documents[0].length === 0) {
      return { found: false, message: "No results found." };
    }

    const documents = results.documents[0];
    const ids = results.ids?.[0] || [];
    const distances = results.distances?.[0] || [];

    // Convert L2 distances to similarity scores (0-1 range, higher is better)
    // L2 distance for normalized vectors ranges from 0 (identical) to 2 (opposite)
    // https://en.wikipedia.org/wiki/Cosine_similarity
    const sources = ids.map((id, i) => {
      const distance = distances[i];
      if (!distance) {
        console.warn("No distance found for document ID:", id);
        return { id, similarity: 0 };
      }

      const similarity = 1 - distance / 2;
      return { id, similarity };
    });

    return {
      found: true,
      documents,
      sources,
    };
  },
});

async function runAgent(userQuery: string) {
  printHeader("React Info Search Agent");
  printQuery(userQuery);

  // Let the agent decide whether to search and how to respond
  const result = streamText({
    model: openai("gpt-5.1"),
    tools: { search: searchTool },
    stopWhen: stepCountIs(5), // Make multi-step agents really simply, using stepCountIs for the amount of actions they should take
    system: `You are a helpful assistant that answers questions about writing good and performant web development code.
    You have access to a search tool that can query a React documentation knowledge base.
    Use the search tool for all queries. Keep your response brief, and be practical in what you output.
    If you cannot find relevant information, say so.`,
    prompt: userQuery,
    maxOutputTokens: 1024,
    onChunk: ({ chunk }) => {
      // Render the `search` tool results
      if (chunk.type === "tool-result") {
        if (chunk.toolName !== "search") {
          return;
        }

        const output = chunk.output as InferToolOutput<typeof searchTool>;

        if (output.found && output.sources) {
          printSources(output.sources);
        }
      }
    },
  });

  // Stream the text to terminal
  process.stdout.write(`${colors.green}${colors.bold}Answer:${colors.reset}\n`);
  process.stdout.write(colors.white); // White text for content
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
  process.stdout.write(`${colors.reset}\n\n`); // Reset color
}

const query = process.argv.slice(2).join(" ");

if (!query) {
  printError("Please provide a search query as an argument.");
  console.log("Usage: bun run src/agent.ts <your query>");
  process.exit(1);
}

async function main() {
  await runAgent(query);
}

main().catch(console.error);
