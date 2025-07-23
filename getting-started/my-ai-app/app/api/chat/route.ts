import { CoreMessage } from 'ai';
import { MessagesService,
  ChatService,
  SystemService,
  type SystemMessage,
  type ProcessedMessages,
  type LLMResponse } from '@/lib/plugins';

export async function POST(req: Request) {
  const { messages: userMessages }: { messages: CoreMessage[] } = await req.json();
  const systemMessage: SystemMessage = SystemService.processSystem();
  const processedMessages: ProcessedMessages = MessagesService.processMessages(userMessages);
  try {
    const result: LLMResponse = await ChatService.processChat(processedMessages.messages, systemMessage.systemMessage);
    
    const response = {
      messages: [result.assistantMessage],
      ...(process.env.NODE_ENV === 'development' ? {
        _debug: {
          ...result.debug,
          processedMessages,
          systemMessage
        }
      } : {})
    };

    return Response.json(response);

  } catch (error) {
    console.error('Error processing chat request:', error);
    return Response.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
