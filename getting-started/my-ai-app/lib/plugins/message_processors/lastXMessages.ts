import type { MessageProcessor, ProcessedMessages } from '../types';

export const MessagesService: MessageProcessor = {
  processMessages(messages): ProcessedMessages {
    const limit = parseInt(process.env.MESSAGE_LIMIT || '20');
    
    return {
      messages: messages.slice(-limit),
    };
  }
};