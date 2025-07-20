import { CoreMessage, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({
  baseURL: "http://semi:8500/v1"
});

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  //console.log("Received messages:", messages);

  const { response } = await generateText({
    model: openai('deepseek/deepseek-r1-0528-qwen3-8b'),
    system: 'You are a helpful assistant.',
    messages,
  });

  //console.log("Generated response:", response);

  return Response.json({ messages: response.messages });
}