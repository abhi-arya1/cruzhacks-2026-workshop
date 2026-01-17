# Buidling RAG and Search Agents

Search is a fundamental problem in AI. AI models will get smarter and smarter, but to personalize responses, build better context, and improve the quality of your responses, you need to build a search agent. This project demonstrates how to build a search agent using [ChromaDB](https://www.trychroma.com), the OpenAI SDK, [Vercel AI Gateway](https://vercel.com/ai-gateway), and Chunking for effective retrieval. 

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
bun run index.ts
```
