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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">

      {/* Chat container */}
      <div className="relative z-10 w-full max-w-2xl h-[80vh] flex flex-col rounded-3xl shadow-2xl bg-gray-900/60 backdrop-blur-lg border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-800 bg-gray-900/70">
          <div className="flex items-center gap-3">
            <span className="inline-block w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">🤖</span>
            <span className="text-xl font-bold text-purple-200 tracking-wide">AI Chat</span>
          </div>
          <span className="text-xs text-gray-400 font-mono">v1.0</span>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 flex flex-col-reverse">
          <div ref={messagesEndRef} />
          {messages.slice().reverse().map((message, index) => {
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
              <div key={`${message.role}-${index}`} className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-700 to-blue-700 flex items-center justify-center text-white font-bold shadow">🤖</span>
                )}
                <div className={`max-w-[70%] px-5 py-4 rounded-2xl shadow transition
                  ${isUser
                    ? 'bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-br-sm'
                    : 'bg-gradient-to-br from-gray-800 to-gray-900 text-purple-100 rounded-bl-sm border border-purple-900'
                }`}>
                  <span className="block mb-1 font-semibold text-xs uppercase tracking-wider opacity-60">
                    {isUser ? 'You' : 'AI'}
                  </span>
                  {reasoning && (
                    <div className="mb-2 pb-2 border-b border-dashed border-purple-400/40">
                      <details className="text-xs text-purple-200 bg-purple-900/60 rounded p-2 shadow-inner">
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
                {isUser && (
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-purple-700 flex items-center justify-center text-white font-bold shadow">🧑</span>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div className="flex items-center gap-2 text-purple-400 italic text-sm p-3 rounded-lg bg-purple-900/80 animate-pulse shadow w-fit">
              <span className="w-4 h-4 rounded-full bg-purple-700 animate-bounce" />
              AI is typing...
            </div>
          )}
        </div>

        {/* Input bar */}
        <form
          className="relative flex items-center gap-2 px-6 py-4 border-t border-gray-800 bg-gray-900/80"
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSendMessage();
          }}
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message…"
            className="flex-grow bg-gray-800 text-gray-100 border border-gray-700 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 shadow"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-gradient-to-br from-purple-700 to-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow hover:scale-105 transition disabled:opacity-50"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
