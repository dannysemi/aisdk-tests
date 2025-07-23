import { CoreMessage, generateText, experimental_createMCPClient } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { LLMProcessor, LLMResponse } from '../types';


export const ChatService: LLMProcessor = {
  async processChat(
    messages: CoreMessage[],
    systemMessage: string
  ): Promise<LLMResponse> {
    // Configure LLM clients
    const toolsLLM = createOpenAI({
      baseURL: process.env.TOOLS_BASE_URL,
      apiKey: process.env.TOOLS_API_KEY,
    });

    const responseLLM = createOpenAI({
      baseURL: process.env.OPENAI_BASE_URL,
      apiKey: process.env.OPENAI_API_KEY
    });

    // Process tools if needed
    const transport = new StreamableHTTPClientTransport(new URL(process.env.MCP_URL as string));
    const customClient = await experimental_createMCPClient({ transport });
    const tools = await customClient.tools();

    const tools_systemMessage = process.env.TOOL_MESSAGE;

    const { response: toolResponse } = await generateText({
      model: toolsLLM(process.env.TOOLS_MODEL_NAME as string),
      system: tools_systemMessage,
      tools,
      toolChoice: 'auto',
      maxSteps: 5,
      messages: messages,
    });

    // Extract tool responses
    const toolResults = toolResponse.messages?.filter(m => m.role === 'tool') || [];

    // Generate final response
    const finalResponse = await generateText({
      model: responseLLM(process.env.MODEL_NAME as string),
      messages: [...messages, ...toolResults],
      system: systemMessage,
      maxSteps: 1
    });

    return {
      assistantMessage: {
        role: 'assistant',
        content: finalResponse.text
      },
      debug: {
        rawResponse: finalResponse,
        toolDefinitions: tools,
        toolProcessingMessages: toolResponse.messages || [],
      }
    };
  }
};
