# Building RAG and Search Agents

Search is a fundamental problem in AI. AI models will get smarter and smarter, but to personalize responses, build better context, and improve the quality of your responses, you need to build a search agent. This project demonstrates how to build a search agent using [ChromaDB](https://www.trychroma.com), the OpenAI SDK, [Vercel AI Gateway](https://vercel.com/ai-gateway), and Chunking with [Mastra RAG](https://mastra.ai/docs/rag/overview) for effective retrieval. 

In the workshop, we will walk through setting up an Embedding Function with an Embedding Model, placing documents in our vector database (ChromaDB), and building a search agent with the [Vercel AI SDK](https://ai-sdk.dev/), that can retrieve skills for how to build react applications, from the [dataset](./dataset) directory!

# Replicating the Project

To install dependencies:

```bash
bun install
```

Copy the environment variables from `.env.example` to `.env.local` and fill in the values.
```bash
cp .env.example .env.local
# Fill the variables yourself, using the links in the .env.example file.
```

To run:

```bash
# Push the dataset to ChromaDB Cloud
bun run src/push_dataset.ts

# Run the AI agent with a chat message as the query
bun run src/agent.ts "How do I optimize React re-renders?"
```

# Search Example Queries
Based on the dataset, here are some example queries you can try: 

Basic Concept Queries
- "how to optimize rerenders"
- "caching strategies"
- "lazy loading"
- "bundle size optimization"
Problem-Oriented Queries
- "my react app is slow"
- "reduce javascript bundle size"
- "prevent unnecessary rerenders"
- "hydration flickering issue"
- "dom updates causing jank"
Technique-Specific Queries
- "useMemo vs useCallback"
- "dynamic imports"
- "suspense boundaries"
- "parallel data fetching"
- "event listener performance"
Use Case Queries
- "optimizing svg animations"
- "localStorage best practices"
- "server side caching"
- "deduplicating api requests"
- "batching dom updates"
Advanced/Specific Queries
- "content-visibility css property"
- "passive event listeners"
- "barrel imports problem"
- "LRU cache implementation"
- "derived state anti-pattern"
Natural Language Queries
- "why is my state update slow"
- "best way to handle async dependencies"
- "should I use transitions for loading states"
- "when to preload resources"

Run any of these with `bun run src/agent.ts <QUERY>`

# How It Works

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Markdown Files │────▶│  Mastra RAG      │────▶│  ChromaDB       │
│  (dataset/)     │     │  (Chunking)      │     │  (Vector Store) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Answer         │◀────│  GPT-5.1         │◀────│ Query + Context │
│  (Terminal)     │     │  (Generation)    │     │  (Retrieved)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Step 1: Document Ingestion (`src/push_dataset.ts`)

The ingestion script reads all markdown files from the `dataset/` directory and processes them:

1. **Read Files**: Load all `.md` files containing React performance tips
2. **Chunk with Mastra RAG**: Use `MDocument.fromMarkdown()` to parse and chunk each file
   - Strategy: `markdown` (respects markdown structure like headers, code blocks)
   - Max chunk size: 1000 characters
   - Overlap: 100 characters (for context continuity)
3. **Generate Embeddings**: Use OpenAI's `text-embedding-3-small` model to create vector representations
4. **Store in ChromaDB**: Push chunks with embeddings and metadata to the `react-info` collection

## Step 2: Search Agent (`src/agent.ts`)

When you query the agent:

1. **Embed Query**: Convert your question into a vector using the same embedding model
2. **Vector Search**: Find the 5 most similar chunks in ChromaDB using L2 distance
3. **Build Context**: Combine retrieved chunks into a context string
4. **Generate Answer**: Send context + question to GPT-5.1 for a coherent response
5. **Pretty Print**: Display sources with similarity scores and the generated answer

## Project Structure

```
src/
├── push_dataset.ts   # Ingestion script - chunks and embeds documents
├── agent.ts          # Search agent - queries and generates answers
└── util/
    └── embedding-function.ts  # Embedding function for the text to push to the vector database
└── ui/
    └── pretty-print.ts  # Terminal output formatting utilities
dataset/
└── *.md              # React performance optimization tips (47 files)
```

## Key Concepts

### Chunking
Breaking documents into smaller pieces that fit within embedding model context limits while preserving semantic meaning. Mastra RAG's markdown chunker respects document structure.

### Embeddings
Dense vector representations of text that capture semantic meaning. Similar content has similar vectors, enabling semantic search beyond keyword matching.

### Vector Search
Finding documents by comparing embedding vectors. ChromaDB uses L2 (Euclidean) distance - lower distance means higher similarity.

### RAG (Retrieval-Augmented Generation)
Combining retrieval (finding relevant documents) with generation (LLM response). This grounds the AI's answers in your actual data.

# Other Resources 

Beyond the Markdown files used in this project, if you want to use more complex files, you can use the [Cloudflare ToMarkdown Conversion API](https://developers.cloudflare.com/workers-ai/features/markdown-conversion/) to extend the capabilities of your search, such as to PDFs, Word docs, etc.

Happy Hacking!
