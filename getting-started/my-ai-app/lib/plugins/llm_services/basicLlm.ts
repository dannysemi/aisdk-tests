import { CoreMessage, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { LLMProcessor, LLMResponse } from '../types';

export const ChatService: LLMProcessor = {
  async processChat(messages: CoreMessage[], systemMessage): Promise<LLMResponse> {
  // Configure LLM clients
    const responseLLM = createOpenAI({
      baseURL: process.env.OPENAI_BASE_URL,
      apiKey: process.env.OPENAI_API_KEY,
    });
    const model_name = process.env.MODEL_NAME as string;
    // Generate final response
    const response = await generateText({
      model: responseLLM(model_name),
      messages: messages,
      system: systemMessage,
      maxSteps: 1
    });

    return {
      assistantMessage: {
        role: 'assistant',
        content: response.text
      },
      debug: {
        rawResponse: response,
      }
    };
  }
}