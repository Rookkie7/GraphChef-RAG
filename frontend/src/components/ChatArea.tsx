import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import type { Message } from '../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import WelcomeScreen from './WelcomeScreen';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string, useStream: boolean, explain: boolean) => void;
  kbReady: boolean;
}

export default function ChatArea({
  messages,
  isLoading,
  onSendMessage,
  kbReady,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <WelcomeScreen kbReady={kbReady} />
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <ChatInput
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            disabled={!kbReady}
          />
        </div>
      </div>
    </div>
  );
}
