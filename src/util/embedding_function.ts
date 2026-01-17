// Via https://docs.trychroma.com/docs/embeddings/embedding-functions?lang=typescript

import type { EmbeddingFunction } from "chromadb";
import { OpenAI } from "openai";

// See for reference: https://vercel.com/docs/ai-gateway/openai-compat/embeddings
const AI_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh/v1";

export class MyEmbeddingFunction implements EmbeddingFunction {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.AI_GATEWAY_API_KEY,
      baseURL: AI_GATEWAY_BASE_URL,
    });
  }

  public async generate(texts: string[]): Promise<number[][]> {
    const response = await this.openai.embeddings.create({
      model: "openai/text-embedding-3-large",
      input: texts,
    });

    return response.data.map((embedding) => embedding.embedding);
  }
}
