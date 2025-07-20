// getting-started/my-ai-app/app/page.tsx
'use client';

import { CoreMessage } from 'ai';
import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Page() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to parse text content for <think></think> tags
  const parseContent = (content: string): { text: string, reasoning?: string } => {
    // Use [\s\S] to match any character, including newlines, instead of /s flag
    const thinkTagMatch = content.match(/<think>([\s\S]*?)<\/think>/);
    if (thinkTagMatch && thinkTagMatch[1]) {
      return {
        text: content.replace(/<think>[\s\S]*?<\/think>/, '').trim(),
        reasoning: thinkTagMatch[1].trim(),
      };
    }
    return { text: content.trim() };
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: CoreMessage = { role: 'user', content: input };
    setMessages((currentMessages) => [...currentMessages, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let aiMessages: CoreMessage[] = [];

      if (data.messages && Array.isArray(data.messages)) {
        aiMessages = data.messages;
      } else if (data.content) {
        aiMessages = [{ role: 'assistant', content: data.content }];
      } else {
        console.error("Unexpected API response format:", data);
        aiMessages = [{ role: 'assistant', content: 'Sorry, I received an unexpected response.' }];
      }

      setMessages((currentMessages) => [...currentMessages, ...aiMessages]);

    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((currentMessages) => [...currentMessages, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      <h1 className="text-3xl font-extrabold mb-6 text-purple-300 drop-shadow">AI Chat App</h1>

      <div className="mb-4 border border-gray-700 p-4 rounded-xl min-h-[400px] flex flex-col overflow-y-auto bg-gray-800/90 shadow-2xl backdrop-blur">
        {messages.map((message, index) => {
          const contentStr = (() => {
            if (typeof message.content === 'string') {
              return message.content;
            }
            if (Array.isArray(message.content)) {
              return message.content
                .map((part) => (typeof part === 'object' && 'text' in part ? part.text : ''))
                .join(' ')
                .trim();
            }
            return JSON.stringify(message.content, null, 2);
          })();
          const { text, reasoning } = parseContent(contentStr);
          const isUser = message.role === 'user';
          return (
            <div
              key={`${message.role}-${index}`}
              className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`relative max-w-lg px-5 py-4 rounded-2xl shadow-lg transition
                  ${isUser
                    ? 'bg-gradient-to-br from-purple-700 to-purple-900 text-white rounded-tr-sm'
                    : 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-100 rounded-tl-sm border border-gray-600'
                }`}
              >
                <span className="block mb-1 font-semibold text-xs uppercase tracking-wider opacity-70">
                  {isUser ? 'You' : 'AI'}
                </span>
                {reasoning && (
                  <div className="mb-2 pb-2 border-b border-dashed border-purple-400/40">
                    <details className="text-xs text-purple-200 bg-purple-900/80 rounded p-2 shadow-inner">
                      <summary className="font-semibold cursor-pointer">Reasoning</summary>
                      <div className="mt-1">
                        <ReactMarkdown>{reasoning}</ReactMarkdown>
                      </div>
                    </details>
                  </div>
                )}
                <div className="prose prose-sm prose-invert prose-purple break-words">
                  <ReactMarkdown>{text}</ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="self-start text-purple-400 italic text-sm p-3 rounded-lg bg-purple-900 animate-pulse shadow">
            AI is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center mt-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={async (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              await handleSendMessage();
            }
          }}
          placeholder="Ask me anything..."
          className="flex-grow border border-gray-700 bg-gray-900 text-gray-100 p-3 rounded-l-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 shadow"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          className="bg-gradient-to-br from-purple-700 to-purple-900 text-white p-3 rounded-r-2xl hover:scale-105 hover:from-purple-800 hover:to-purple-950 transition disabled:opacity-50 font-bold shadow"
          disabled={isLoading}
        >
          {isLoading ? 'Wait...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
