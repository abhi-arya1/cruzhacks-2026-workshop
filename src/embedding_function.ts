// Via https://docs.trychroma.com/docs/embeddings/embedding-functions?lang=typescript

import type { EmbeddingFunction } from "chromadb";
import { OpenAI } from "openai";

// See for reference: https://vercel.com/docs/ai-gateway/openai-compat/embeddings
const AI_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh/v1";

class MyEmbeddingFunction implements EmbeddingFunction {
  private api_key: string;
  private openai: OpenAI;

  constructor(api_key: string) {
    this.api_key = api_key;

    this.openai = new OpenAI({
      apiKey: this.api_key,
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
