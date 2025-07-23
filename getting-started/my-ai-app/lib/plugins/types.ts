import { CoreMessage } from 'ai';

export interface ProcessedMessages {
  messages: CoreMessage[];
}

export interface LLMResponse {
  assistantMessage: CoreMessage;
  debug?: Record<string, unknown>;
}

export interface SystemMessage {
  systemMessage: string;
}

// Core API contracts
export interface MessageProcessor {
  processMessages(messages: CoreMessage[]): ProcessedMessages;
}

export interface LLMProcessor {
  processChat(
    messages: CoreMessage[], 
    systemMessage?: string
  ): Promise<LLMResponse>;
}

export interface SystemProcessor {
  processSystem(): SystemMessage;
}