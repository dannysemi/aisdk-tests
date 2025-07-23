import { createOpenAI } from '@ai-sdk/openai';

export function createRunpodProvider(options: { serverlessId: string; apiKey: string }) {
  return createOpenAI({
    baseURL: `https://api.runpod.ai/v2/${options.serverlessId}/openai/v1`,
    apiKey: options.apiKey
  });
}
