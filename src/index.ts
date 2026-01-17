import { CloudClient } from "chromadb";

const client = new CloudClient({
  apiKey: process.env.CHROMA_API_KEY,
  tenant: process.env.CHROMA_API_TENANT,
  database: "Evals",
});

// Parse